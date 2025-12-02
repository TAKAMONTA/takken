/**
 * Firestore使用量記録ヘルパー
 *
 * AI APIの使用量をFirestoreに記録する機能
 */

import { getFirestore, FieldValue } from "firebase-admin/firestore";
import { logger } from "./logger";

// Firestore使用量記録の型定義
export interface AIUsageRecord {
  userId: string;
  timestamp: FieldValue;
  provider: string;
  model?: string;
  tokens: number;
  cost?: number;
  endpoint: string;
  success: boolean;
  errorMessage?: string;
  requestId?: string;
}

export interface UserUsageStats {
  totalTokens: number;
  totalCost: number;
  lastUsed: any; // FieldValue or Date
  usageCount: number;
  providers: { [provider: string]: number };
}

/**
 * AI使用量をFirestoreに記録
 * @param usageRecord 使用量レコード
 */
export async function recordAIUsage(usageRecord: AIUsageRecord): Promise<void> {
  try {
    const db = getFirestore();

    // 使用量レコードを保存
    await db.collection("ai_usage").add(usageRecord);

    // ユーザーの使用統計を更新
    await updateUserUsageStats(usageRecord.userId, usageRecord);

    logger.info("AI使用量記録完了", {
      userId: usageRecord.userId,
      provider: usageRecord.provider,
      tokens: usageRecord.tokens,
    });
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    logger.error("AI使用量記録エラー", err, { userId: usageRecord.userId });
    // 使用量記録の失敗はアプリケーションの動作を停止させない
  }
}

/**
 * ユーザーの使用統計を更新
 * @param userId ユーザーID
 * @param usageRecord 使用量レコード
 */
async function updateUserUsageStats(
  userId: string,
  usageRecord: AIUsageRecord
): Promise<void> {
  const db = getFirestore();
  const userStatsRef = db.collection("user_usage_stats").doc(userId);

  const updateData: any = {
    totalTokens: FieldValue.increment(usageRecord.tokens),
    totalCost: FieldValue.increment(usageRecord.cost || 0),
    lastUsed: FieldValue.serverTimestamp(),
    usageCount: FieldValue.increment(1),
    [`providers.${usageRecord.provider}`]: FieldValue.increment(
      usageRecord.tokens
    ),
  };

  await userStatsRef.set(updateData, { merge: true });
}

/**
 * ユーザーの使用統計を取得
 * @param userId ユーザーID
 * @returns ユーザーの使用統計
 */
export async function getUserUsageStats(
  userId: string
): Promise<UserUsageStats | null> {
  try {
    const db = getFirestore();
    const userStatsDoc = await db
      .collection("user_usage_stats")
      .doc(userId)
      .get();

    if (!userStatsDoc.exists) {
      return null;
    }

    return userStatsDoc.data() as UserUsageStats;
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    logger.error("ユーザー使用統計取得エラー", err, { userId });
    return null;
  }
}

/**
 * ユーザーの使用量制限をチェック
 * @param userId ユーザーID
 * @param limitType 制限タイプ ('daily' | 'monthly' | 'total')
 * @param limitValue 制限値
 * @returns 制限内かどうか
 */
export async function checkUsageLimit(
  userId: string,
  limitType: "daily" | "monthly" | "total",
  limitValue: number
): Promise<boolean> {
  try {
    const stats = await getUserUsageStats(userId);
    if (!stats) {
      return true; // 初回使用の場合は制限なし
    }

    switch (limitType) {
      case "daily":
        // 日次制限の実装（簡易版）
        return stats.totalTokens < limitValue;
      case "monthly":
        // 月次制限の実装（簡易版）
        return stats.totalTokens < limitValue;
      case "total":
        return stats.totalTokens < limitValue;
      default:
        return true;
    }
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    logger.error("使用量制限チェックエラー", err, { userId, limitType, limitValue });
    return true; // エラーの場合は制限を緩くする
  }
}

/**
 * 使用量レコードを作成（ヘルパー関数）
 * @param userId ユーザーID
 * @param provider AIプロバイダー
 * @param tokens 使用トークン数
 * @param endpoint APIエンドポイント
 * @param success 成功フラグ
 * @param errorMessage エラーメッセージ（失敗時）
 * @param model モデル名（オプション）
 * @param cost コスト（オプション）
 * @returns AI使用量レコード
 */
export function createUsageRecord(
  userId: string,
  provider: string,
  tokens: number,
  endpoint: string,
  success: boolean,
  errorMessage?: string,
  model?: string,
  cost?: number
): AIUsageRecord {
  return {
    userId,
    timestamp: FieldValue.serverTimestamp(),
    provider,
    model,
    tokens,
    cost,
    endpoint,
    success,
    errorMessage,
    requestId: `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
  };
}
