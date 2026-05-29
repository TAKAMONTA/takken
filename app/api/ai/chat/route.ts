import { NextRequest, NextResponse } from "next/server";
import { ChatMessage } from "@/lib/ai-client";
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
import {
  callServerAI,
  sanitizeChatMessages,
  sanitizeClientAIOptions,
} from "@/lib/server-ai-provider";

/**
 * AI Chat API Route
 *
 * ⚠️ 注意: このAPIは現在の設定（output: "export"）では動作しません
 *
 * 使用するには:
 * 1. next.config.mjs から "output: export" を削除
 * 2. Vercel/Node.js サーバーにデプロイ
 * または
 * 3. このロジックをFirebase Functionsに移行
 */

export async function POST(request: NextRequest) {
  let userId: string | undefined;
  try {
    // Firebase Admin SDKでトークンを検証
    userId = await verifyRequestAuth(request);

    // レート制限チェック（20 req/min per user）
    const rl = checkRateLimit(userId, "ai:chat", AI_RATE_LIMIT);
    if (!rl.allowed) {
      return NextResponse.json(
        {
          error: "リクエスト数が上限に達しました。しばらくしてから再試行してください",
        },
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

    // リクエストボディの取得
    const body = await request.json();
    const { messages: rawMessages, options: rawOptions } = body;

    if (!rawMessages || !Array.isArray(rawMessages) || rawMessages.length === 0) {
      return NextResponse.json(
        { error: "メッセージが必要です" },
        { status: 400 }
      );
    }

    // クライアント入力の sanitize（コスト爆発・abuse 防止）
    // - messages: shape 検証 + 内容を maxContentChars に切り詰め + maxMessages に制限
    // - options: temperature のみ許可（model / provider / maxTokens はサーバー固定）
    const validMessages: ChatMessage[] = sanitizeChatMessages(rawMessages);
    const safeOptions = sanitizeClientAIOptions(rawOptions);

    if (validMessages.length === 0) {
      return NextResponse.json(
        { error: "有効なメッセージが含まれていません" },
        { status: 400 }
      );
    }

    const usageDecision = await checkAIUsage(userId);
    if (!usageDecision.allowed) {
      return createAIUsageLimitResponse(usageDecision);
    }

    // AI APIを直接呼び出し（サーバー側でのみ実行）
    // UnifiedAIClientはFirebase Functionsエミュレーターを使おうとするため、直接APIを呼ぶ
    const response = await callServerAI(validMessages, safeOptions);
    const committedUsage = await consumeAIUsage(userId);
    if (!committedUsage.allowed) {
      return createAIUsageLimitResponse(committedUsage);
    }

    return NextResponse.json({
      success: true,
      data: response,
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
    logger.error("AI Chat API error", err, { userId });

    // 認証エラーの場合
    if (
      err.message?.includes("認証が必要です") ||
      err.message?.includes("Invalid")
    ) {
      return createAuthErrorResponse();
    }

    // エラーの種類に応じたレスポンス
    if (err.message?.includes("API key not configured")) {
      return NextResponse.json(
        { error: "AI APIが設定されていません" },
        { status: 503 }
      );
    }

    if (err.message?.includes("rate limit")) {
      return NextResponse.json(
        {
          error:
            "リクエスト数が上限に達しました。しばらくしてから再試行してください",
        },
        { status: 429 }
      );
    }

    return NextResponse.json(
      { error: "AI処理中にエラーが発生しました" },
      { status: 500 }
    );
  }
}

// レート制限は lib/rate-limit.ts (in-memory sliding window) で実装済み。
// 分散環境での厳格な制限が必要な場合は @upstash/ratelimit + Redis への移行を推奨。
