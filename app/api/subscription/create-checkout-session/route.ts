import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import {
  verifyRequestAuth,
  createAuthErrorResponse,
} from "@/lib/firebase-admin-auth";
import { logger } from "@/lib/logger";
import { SubscriptionPlan } from "@/lib/types/subscription";

/**
 * Stripe Checkoutセッション作成API
 * 
 * ユーザーがプランを選択した際に、Stripe Checkoutセッションを作成します
 */
export async function POST(request: NextRequest) {
  let userId: string | undefined;
  
  try {
    // Firebase Admin SDKでトークンを検証
    userId = await verifyRequestAuth(request);

    const body = await request.json();
    const { plan, yearly = false } = body;

    // バリデーション
    if (!plan || !Object.values(SubscriptionPlan).includes(plan)) {
      return NextResponse.json(
        { error: "有効なプランを指定してください" },
        { status: 400 }
      );
    }

    // 無料プランの場合はエラー
    if (plan === SubscriptionPlan.FREE) {
      return NextResponse.json(
        { error: "無料プランは購入できません" },
        { status: 400 }
      );
    }

    // Stripeシークレットキーの確認
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeSecretKey) {
      logger.error("STRIPE_SECRET_KEYが設定されていません");
      return NextResponse.json(
        { error: "決済機能の設定が完了していません" },
        { status: 500 }
      );
    }

    // Stripeクライアントの初期化
    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: "2025-07-30.basil",
    });

    // Price IDの取得
    const priceId = yearly
      ? process.env.STRIPE_PRICE_ID_PREMIUM_YEARLY
      : process.env.STRIPE_PRICE_ID_PREMIUM_MONTHLY;

    if (!priceId) {
      logger.error("Price IDが設定されていません", { yearly });
      return NextResponse.json(
        { error: "価格設定が見つかりません" },
        { status: 500 }
      );
    }

    // アプリのベースURLを取得（リクエストのOriginを使用、なければ環境変数、最終的に固定値）
    const origin = request.headers.get("origin") || 
                   process.env.NEXT_PUBLIC_APP_URL || 
                   "https://takken-study.com";
    
    const baseUrl = origin;

    // Checkoutセッションの作成
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      customer_email: undefined, // ユーザーが入力
      metadata: {
        userId: userId,
        plan: plan,
        yearly: yearly.toString(),
      },
      success_url: `${baseUrl}/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/subscription/cancel`,
      locale: "ja",
      billing_address_collection: "required",
    });

    logger.info("Stripe Checkoutセッション作成成功", {
      userId,
      plan,
      yearly,
      sessionId: session.id,
      priceId,
    });

    return NextResponse.json({
      success: true,
      sessionId: session.id,
      url: session.url,
    });
  } catch (error: unknown) {
    const err = error instanceof Error ? error : new Error(String(error));
    logger.error("Stripe Checkoutセッション作成エラー", err, { userId });

    // 認証エラーの場合
    if (
      err.message?.includes("認証が必要です") ||
      err.message?.includes("Invalid")
    ) {
      return createAuthErrorResponse();
    }

    // Stripeエラーの場合
    if (err instanceof Stripe.errors.StripeError) {
      logger.error("Stripe APIエラー", err, {
        userId,
        type: err.type,
        code: err.code,
      });
      return NextResponse.json(
        { error: `決済処理中にエラーが発生しました: ${err.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: "決済セッションの作成中にエラーが発生しました" },
      { status: 500 }
    );
  }
}




