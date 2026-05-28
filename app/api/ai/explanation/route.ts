import { NextRequest, NextResponse } from "next/server";
import {
  verifyRequestAuth,
  createAuthErrorResponse,
} from "@/lib/firebase-admin-auth";
import { logger } from "@/lib/server-logger";
import { checkRateLimit, AI_RATE_LIMIT } from "@/lib/rate-limit";
import {
  aiUsageHeaders,
  checkAIUsage,
  consumeAIUsage,
  createAIUsageLimitResponse,
} from "@/lib/server-ai-usage";
import { generateServerQuestionExplanation } from "@/lib/server-ai-provider";

/**
 * AI Question Explanation API Route
 *
 * 問題の解説を生成するAPI
 *
 * ⚠️ 注意: このAPIは現在の設定（output: "export"）では動作しません
 */

export async function POST(request: NextRequest) {
  let userId: string | undefined;
  try {
    // Firebase Admin SDKでトークンを検証
    userId = await verifyRequestAuth(request);

    // レート制限チェック
    const rl = checkRateLimit(userId, "ai:explanation", AI_RATE_LIMIT);
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
    const { question, correctAnswer, userAnswer } = body;

    // バリデーション
    if (!question || !correctAnswer || !userAnswer) {
      return NextResponse.json(
        { error: "question, correctAnswer, userAnswerが必要です" },
        { status: 400 }
      );
    }

    const usageDecision = await checkAIUsage(userId);
    if (!usageDecision.allowed) {
      return createAIUsageLimitResponse(usageDecision);
    }

    const explanation = await generateServerQuestionExplanation(
      question,
      correctAnswer,
      userAnswer
    );
    const committedUsage = await consumeAIUsage(userId);
    if (!committedUsage.allowed) {
      return createAIUsageLimitResponse(committedUsage);
    }

    return NextResponse.json({
      success: true,
      explanation,
      usage: {
        limit: committedUsage.limit,
        used: committedUsage.used,
        remaining: committedUsage.remaining,
        isPremium: committedUsage.isPremium,
        resetAt: committedUsage.resetAt.toISOString(),
      },
    }, {
      headers: aiUsageHeaders(committedUsage),
    });
  } catch (error: unknown) {
    const err = error instanceof Error ? error : new Error(String(error));
    logger.error("AI Explanation API error", err, { userId });

    // 認証エラーの場合
    if (
      err.message?.includes("認証が必要です") ||
      err.message?.includes("Invalid")
    ) {
      return createAuthErrorResponse();
    }

    return NextResponse.json(
      { error: "解説の生成中にエラーが発生しました" },
      { status: 500 }
    );
  }
}
