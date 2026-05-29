/**
 * Stripe Webhook の冪等性保証。
 *
 * 問題:
 *   Stripe は同じイベントを最大10回まで再送する可能性がある（Stripe Webhook docs）。
 *   現状の webhook ハンドラは event.id をチェックしないため、再送毎に
 *   stripe.subscriptions.retrieve や Firestore set が重複する。
 *
 * 解決:
 *   イベントごとに「claim → 処理 → 完了マーク」のライフサイクルを持たせ、
 *   既に claim 済みのイベントは即スキップする。
 *   claim は Firestore transaction で原子的に行い、race condition を防ぐ。
 *   処理が失敗したら claim を release して、Stripe の再送に再処理を委ねる。
 *
 * 抽象化:
 *   IdempotencyStore interface で Firestore 依存を切り出し、ユニットテストでは
 *   in-memory store でロジックを検証できる。
 */

import { FieldValue, type Firestore } from "firebase-admin/firestore";

export type IdempotencyResult = "processed" | "skipped";

export interface IdempotencyMetadata {
  /** Stripe event type（例: checkout.session.completed） */
  type: string;
}

export interface IdempotencyStore {
  /**
   * event ID をアトミックに claim する。
   * @returns true: claim 成功（処理を進めて良い） / false: 既に claim 済み（スキップ）
   */
  claim(eventId: string, metadata: IdempotencyMetadata): Promise<boolean>;

  /** 処理完了を記録（claim 済みのイベントを completed 状態に遷移） */
  markCompleted(eventId: string): Promise<void>;

  /** claim を取り消す（処理失敗時のロールバック。Stripe の再送に処理を任せる） */
  release(eventId: string): Promise<void>;
}

/**
 * webhook ハンドラを冪等性保証でラップする。
 *
 * @returns
 *   - `{ result: "processed", value }` 初回処理、handler の戻り値を含む
 *   - `{ result: "skipped" }` 既に処理済みのため何もしなかった
 *
 * handler が throw した場合は claim を release してから throw を再送出する。
 * 呼び出し側は throw を 5xx として返し、Stripe にリトライさせる。
 */
export async function withStripeIdempotency<T>(
  store: IdempotencyStore,
  eventId: string,
  metadata: IdempotencyMetadata,
  handler: () => Promise<T>,
): Promise<{ result: IdempotencyResult; value?: T }> {
  const claimed = await store.claim(eventId, metadata);
  if (!claimed) {
    return { result: "skipped" };
  }

  try {
    const value = await handler();
    await store.markCompleted(eventId);
    return { result: "processed", value };
  } catch (err) {
    // 処理失敗時は claim を解放して Stripe の再送に再処理を委ねる
    await store.release(eventId).catch(() => {
      // release 自体が失敗しても、元の throw を優先（呼び出し側で 5xx 返却）
    });
    throw err;
  }
}

/**
 * Firestore Admin SDK 用のアダプタ。
 *
 * Firestore transaction を使って claim を原子的に行うため、
 * 並行リクエストが同じ event を二重処理することを防ぐ。
 */
export function createFirestoreIdempotencyStore(
  db: Firestore,
  collectionName = "processedStripeEvents",
): IdempotencyStore {
  return {
    async claim(eventId, metadata) {
      const ref = db.collection(collectionName).doc(eventId);
      return await db.runTransaction(async (tx) => {
        const snap = await tx.get(ref);
        if (snap.exists) return false;
        tx.set(ref, {
          eventId,
          type: metadata.type,
          status: "processing",
          claimedAt: FieldValue.serverTimestamp(),
        });
        return true;
      });
    },

    async markCompleted(eventId) {
      const ref = db.collection(collectionName).doc(eventId);
      await ref.update({
        status: "completed",
        completedAt: FieldValue.serverTimestamp(),
      });
    },

    async release(eventId) {
      const ref = db.collection(collectionName).doc(eventId);
      await ref.delete();
    },
  };
}
