import { NextRequest, NextResponse } from "next/server";
import {
  verifyRequestAuth,
  createAuthErrorResponse,
} from "@/lib/firebase-admin-auth";
import { logger } from "@/lib/server-logger";
import { checkRateLimit } from "@/lib/rate-limit";
import {
  verifyApplePurchase,
  persistVerifiedAppleSubscription,
  type ApplePurchasePayload,
} from "@/lib/server-apple-iap";

/**
 * iOS In-App Purchase 検証 API
 *
 * StoreKit 2 で取得したトランザクションをサーバー側で検証し、
 * Admin SDK 経由で subscriptions/{userId} を更新する。
 */
export async function POST(request: NextRequest) {
  let userId: string | undefined;

  try {
    userId = await verifyRequestAuth(request);

    const rl = checkRateLimit(userId, "subscription:verify-apple", {
      maxRequests: 20,
      windowSeconds: 60,
    });
    if (!rl.allowed) {
      return NextResponse.json(
        { error: "リクエストが多すぎます。しばらくしてから再試行してください" },
        { status: 429, headers: { "Retry-After": String(rl.retryAfterSec) } }
      );
    }

    const body = (await request.json()) as ApplePurchasePayload;

    if (!body.transactionId || !body.productId) {
      return NextResponse.json(
        { error: "transactionId と productId は必須です" },
        { status: 400 }
      );
    }

    const verification = await verifyApplePurchase(userId, body);
    await persistVerifiedAppleSubscription(verification);

    return NextResponse.json({
      success: true,
      plan: verification.plan,
      expiresAt: verification.expiresAt?.toISOString() ?? null,
    });
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));

    if (err.message.includes("認証") || err.message.includes("Authorization")) {
      return createAuthErrorResponse(err.message);
    }

    logger.error("Apple IAP 検証エラー", err, { userId });

    const status =
      err.message.includes("未設定") || err.message.includes("設定が不足")
        ? 503
        : 400;

    return NextResponse.json(
      {
        error:
          process.env.NODE_ENV === "production"
            ? "購入の検証に失敗しました。サポートにお問い合わせください。"
            : err.message,
      },
      { status }
    );
  }
}
