import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import { getApps } from "firebase-admin/app";
import { logger } from "@/lib/logger";
import { SubscriptionPlan, SubscriptionStatus } from "@/lib/types/subscription";
import { initializeAdminSDK } from "@/lib/firebase-admin-auth";

/**
 * Firebase Admin SDK初期化（Firestore用）
 * 共通の初期化関数を使用
 */
function initializeAdminFirestore() {
  if (getApps().length > 0) {
    return getFirestore();
  }

  try {
    // 共通の初期化関数を使用
    initializeAdminSDK();
    return getFirestore();
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    logger.error("Firebase Admin SDK初期化エラー", err);
    throw err;
  }
}

/**
 * Stripe Webhook API
 * 
 * Stripeからの決済イベントを受け取り、サブスクリプション状態を更新します
 * 
 * 処理するイベント:
 * - checkout.session.completed: 決済完了時
 * - customer.subscription.updated: サブスクリプション更新時
 * - customer.subscription.deleted: サブスクリプションキャンセル時
 */
export async function POST(request: NextRequest) {
  let event: Stripe.Event | null = null;

  try {
    // リクエストボディを取得（署名検証のため生データが必要）
    const body = await request.text();
    const signature = request.headers.get("stripe-signature");

    if (!signature) {
      logger.error("Stripe Webhook署名が見つかりません");
      return NextResponse.json(
        { error: "署名が見つかりません" },
        { status: 400 }
      );
    }

    // Stripe Webhookシークレットの確認
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret) {
      logger.error("STRIPE_WEBHOOK_SECRETが設定されていません");
      return NextResponse.json(
        { error: "Webhook設定が完了していません" },
        { status: 500 }
      );
    }

    // Stripeシークレットキーの確認
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeSecretKey) {
      logger.error("STRIPE_SECRET_KEYが設定されていません");
      return NextResponse.json(
        { error: "Stripe設定が完了していません" },
        { status: 500 }
      );
    }

    // Stripeクライアントの初期化
    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: "2025-07-30.basil",
    });

    // 署名の検証
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      logger.error("Stripe Webhook署名検証エラー", error);
      return NextResponse.json(
        { error: `署名検証に失敗しました: ${error.message}` },
        { status: 400 }
      );
    }

    logger.info("Stripe Webhookイベント受信", {
      type: event.type,
      id: event.id,
    });

    // イベントタイプに応じて処理
    switch (event.type) {
      case "checkout.session.completed":
        await handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session, stripe);
        break;

      case "customer.subscription.updated":
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
        break;

      case "customer.subscription.deleted":
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;

      default:
        logger.info("未処理のStripe Webhookイベント", {
          type: event.type,
        });
    }

    return NextResponse.json({ received: true });
  } catch (error: unknown) {
    const err = error instanceof Error ? error : new Error(String(error));
    const logData: { eventType?: string; eventId?: string } = {};
    if (event) {
      logData.eventType = event.type;
      logData.eventId = event.id;
    }
    logger.error("Stripe Webhook処理エラー", err, logData);
    return NextResponse.json(
      { error: "Webhook処理中にエラーが発生しました" },
      { status: 500 }
    );
  }
}

/**
 * 決済完了時の処理
 */
async function handleCheckoutSessionCompleted(
  session: Stripe.Checkout.Session,
  stripe: Stripe
) {
  try {
    const userId = session.metadata?.userId;
    if (!userId) {
      logger.error("CheckoutセッションにuserIdが含まれていません", {
        sessionId: session.id,
      });
      return;
    }

    // サブスクリプションIDを取得
    const subscriptionId = session.subscription as string;
    if (!subscriptionId) {
      logger.error("CheckoutセッションにサブスクリプションIDが含まれていません", {
        sessionId: session.id,
        userId,
      });
      return;
    }

    // Stripeからサブスクリプション情報を取得
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);

    // Firestoreにサブスクリプション情報を保存
    const db = initializeAdminFirestore();
    const subscriptionRef = db.collection("subscriptions").doc(userId);

    const plan = session.metadata?.plan === SubscriptionPlan.PREMIUM
      ? SubscriptionPlan.PREMIUM
      : SubscriptionPlan.FREE;

    // 既存のFirestoreサービスとの互換性を保つため、両方の形式で保存
    const subscriptionData = {
      userId,
      plan, // 新しい形式
      planId: plan, // 既存形式との互換性
      status: mapStripeStatusToSubscriptionStatus(subscription.status),
      stripeSubscriptionId: subscription.id,
      stripeCustomerId: subscription.customer as string,
      currentPeriodStart: new Date(subscription.current_period_start * 1000),
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      startDate: new Date(subscription.current_period_start * 1000), // 既存形式との互換性
      endDate: new Date(subscription.current_period_end * 1000), // 既存形式との互換性
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
      autoRenew: !subscription.cancel_at_period_end, // 既存形式との互換性
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    };

    await subscriptionRef.set(subscriptionData, { merge: true });

    logger.info("サブスクリプション情報を保存しました", {
      userId,
      plan,
      subscriptionId: subscription.id,
      status: subscription.status,
    });
  } catch (error: unknown) {
    const err = error instanceof Error ? error : new Error(String(error));
    logger.error("Checkoutセッション完了処理エラー", err, {
      sessionId: session.id,
    });
    throw err;
  }
}

/**
 * サブスクリプション更新時の処理
 */
async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  try {
    // カスタマーIDからユーザーIDを取得（metadataに保存されている場合）
    // または、subscriptionsコレクションから検索
    const db = initializeAdminFirestore();
    const subscriptionsSnapshot = await db
      .collection("subscriptions")
      .where("stripeSubscriptionId", "==", subscription.id)
      .limit(1)
      .get();

    if (subscriptionsSnapshot.empty) {
      logger.warn("更新対象のサブスクリプションが見つかりません", {
        subscriptionId: subscription.id,
      });
      return;
    }

    const subscriptionDoc = subscriptionsSnapshot.docs[0];
    const userId = subscriptionDoc.id;

    // サブスクリプション情報を更新（既存形式との互換性も保つ）
    await subscriptionDoc.ref.update({
      status: mapStripeStatusToSubscriptionStatus(subscription.status),
      currentPeriodStart: new Date(subscription.current_period_start * 1000),
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      startDate: new Date(subscription.current_period_start * 1000), // 既存形式との互換性
      endDate: new Date(subscription.current_period_end * 1000), // 既存形式との互換性
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
      autoRenew: !subscription.cancel_at_period_end, // 既存形式との互換性
      updatedAt: FieldValue.serverTimestamp(),
    });

    logger.info("サブスクリプション情報を更新しました", {
      userId,
      subscriptionId: subscription.id,
      status: subscription.status,
    });
  } catch (error: unknown) {
    const err = error instanceof Error ? error : new Error(String(error));
    logger.error("サブスクリプション更新処理エラー", err, {
      subscriptionId: subscription.id,
    });
    throw err;
  }
}

/**
 * サブスクリプションキャンセル時の処理
 */
async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  try {
    const db = initializeAdminFirestore();
    const subscriptionsSnapshot = await db
      .collection("subscriptions")
      .where("stripeSubscriptionId", "==", subscription.id)
      .limit(1)
      .get();

    if (subscriptionsSnapshot.empty) {
      logger.warn("削除対象のサブスクリプションが見つかりません", {
        subscriptionId: subscription.id,
      });
      return;
    }

    const subscriptionDoc = subscriptionsSnapshot.docs[0];
    const userId = subscriptionDoc.id;

    // サブスクリプションステータスをキャンセルに更新
    await subscriptionDoc.ref.update({
      status: SubscriptionStatus.CANCELED,
      updatedAt: FieldValue.serverTimestamp(),
    });

    logger.info("サブスクリプションをキャンセルしました", {
      userId,
      subscriptionId: subscription.id,
    });
  } catch (error: unknown) {
    const err = error instanceof Error ? error : new Error(String(error));
    logger.error("サブスクリプション削除処理エラー", err, {
      subscriptionId: subscription.id,
    });
    throw err;
  }
}

/**
 * StripeのステータスをSubscriptionStatusにマッピング
 */
function mapStripeStatusToSubscriptionStatus(
  stripeStatus: Stripe.Subscription.Status
): SubscriptionStatus {
  switch (stripeStatus) {
    case "active":
      return SubscriptionStatus.ACTIVE;
    case "canceled":
    case "unpaid":
      return SubscriptionStatus.CANCELED;
    case "past_due":
      return SubscriptionStatus.PAST_DUE;
    case "trialing":
      return SubscriptionStatus.TRIALING;
    case "incomplete":
    case "incomplete_expired":
    default:
      return SubscriptionStatus.INACTIVE;
  }
}

// GETリクエストはサポートしない
export async function GET() {
  return NextResponse.json(
    { error: "Method not allowed" },
    { status: 405 }
  );
}
