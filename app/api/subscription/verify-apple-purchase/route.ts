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

function resolveCorsOrigin(request: NextRequest): string {
  const origin = request.headers.get("origin");
  if (!origin || origin === "null") {
    return "*";
  }
  const allowed = new Set<string>([
    "capacitor://localhost",
    "ionic://localhost",
    "http://localhost",
    "http://127.0.0.1",
  ]);

  const appUrl = process.env.NEXT_PUBLIC_APP_URL;
  if (appUrl) {
    try {
      allowed.add(new URL(appUrl).origin);
    } catch {
      // ignore malformed env
    }
  }

  if (allowed.has(origin)) return origin;
  return "*";
}

function withCors(request: NextRequest, init: ResponseInit = {}): ResponseInit {
  const headers = new Headers(init.headers);
  const allowOrigin = resolveCorsOrigin(request);
  headers.set("Access-Control-Allow-Origin", allowOrigin);
  if (allowOrigin !== "*") {
    headers.set("Vary", "Origin");
  }
  headers.set("Access-Control-Allow-Methods", "POST, OPTIONS");
  headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
  return { ...init, headers };
}

function jsonWithCors(
  request: NextRequest,
  body: unknown,
  init: ResponseInit = {}
) {
  return NextResponse.json(body, withCors(request, init));
}

export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, withCors(request, { status: 204 }));
}

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
      return jsonWithCors(
        request,
        { error: "リクエストが多すぎます。しばらくしてから再試行してください" },
        { status: 429, headers: { "Retry-After": String(rl.retryAfterSec) } }
      );
    }

    const body = (await request.json()) as ApplePurchasePayload;

    if (!body.transactionId || !body.productId) {
      return jsonWithCors(
        request,
        { error: "transactionId と productId は必須です" },
        { status: 400 }
      );
    }

    const verification = await verifyApplePurchase(userId, body);
    await persistVerifiedAppleSubscription(verification);

    return jsonWithCors(request, {
      success: true,
      plan: verification.plan,
      expiresAt: verification.expiresAt?.toISOString() ?? null,
    });
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));

    if (err.message.includes("認証") || err.message.includes("Authorization")) {
      return jsonWithCors(
        request,
        { error: err.message || "認証が必要です" },
        { status: 401 }
      );
    }

    logger.error("Apple IAP 検証エラー", err, { userId });

    const status =
      err.message.includes("未設定") || err.message.includes("設定が不足")
        ? 503
        : 400;

    return jsonWithCors(
      request,
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
