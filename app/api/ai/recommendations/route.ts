import { NextRequest, NextResponse } from "next/server";
import {
  verifyRequestAuth,
  createAuthErrorResponse,
} from "@/lib/firebase-admin-auth";
import { logger } from "@/lib/server-logger";
import { checkRateLimit, AI_RATE_LIMIT } from "@/lib/rate-limit";
import {
  aiUsageHeaders,
  consumeAIUsage,
  createAIUsageLimitResponse,
  refundAIUsage,
} from "@/lib/server-ai-usage";
import { generateServerStudyRecommendations } from "@/lib/server-ai-provider";

/**
 * AI Study Recommendations API Route
 *
 * 学習の推奨事項を生成するAPI
 *
 * ⚠️ 注意: このAPIは現在の設定（output: "export"）では動作しません
 */

export async function POST(request: NextRequest) {
  let userId: string | undefined;
  try {
    // Firebase Admin SDKでトークンを検証
    userId = await verifyRequestAuth(request);

    // レート制限チェック
    const rl = checkRateLimit(userId, "ai:recommendations", AI_RATE_LIMIT);
    if (!rl.allowed) {
      return NextResponse.json(
        { error: "リクエスト数が上限に達しました。しばらくしてから再試行してください" },
        {
          status: 429,
          headers: {
            "Retry-After": String(rl.retryAfterSec),
            "X-RateLimit-Limit": String(AI_RATE_LIMIT.maxRequests),
            "X-RateLimit-Remaining": "0",
            "X-RateLimit-Reset": String(Math.floor(rl.resetAt / 1000)),
          },
        }
      );
    }

    const body = await request.json();
    const { userProgress, weakAreas } = body;

    // バリデーション
    if (!userProgress || !weakAreas || !Array.isArray(weakAreas)) {
      return NextResponse.json(
        { error: "userProgressとweakAreasが必要です" },
        { status: 400 }
      );
    }

    // TOCTOU 対策: 枠予約 → AI → 失敗時 refund
    const reservation = await consumeAIUsage(userId);
    if (!reservation.allowed) {
      return createAIUsageLimitResponse(reservation);
    }

    let recommendations: string;
    try {
      recommendations = await generateServerStudyRecommendations(userProgress, weakAreas);
    } catch (aiErr) {
      await refundAIUsage(userId);
      throw aiErr;
    }

    return NextResponse.json({
      success: true,
      recommendations,
      usage: {
        limit: reservation.limit,
        used: reservation.used,
        remaining: reservation.remaining,
        isPremium: reservation.isPremium,
        resetAt: reservation.resetAt.toISOString(),
      },
    }, {
      headers: aiUsageHeaders(reservation),
    });
  } catch (error: unknown) {
    const err = error instanceof Error ? error : new Error(String(error));
    logger.error("AI Recommendations API error", err, { userId });

    // 認証エラーの場合
    if (
      err.message?.includes("認証が必要です") ||
      err.message?.includes("Invalid")
    ) {
      return createAuthErrorResponse();
    }

    return NextResponse.json(
      { error: "推奨事項の生成中にエラーが発生しました" },
      { status: 500 }
    );
  }
}
