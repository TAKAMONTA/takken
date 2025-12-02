import { NextRequest, NextResponse } from "next/server";
import { aiClient, ChatMessage } from "@/lib/ai-client";
import {
  verifyRequestAuth,
  createAuthErrorResponse,
} from "@/lib/firebase-admin-auth";
import { logger } from "@/lib/logger";

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

    // リクエストボディの取得
    const body = await request.json();
    const { messages, options } = body;

    // バリデーション
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: "メッセージが必要です" },
        { status: 400 }
      );
    }

    // メッセージの型チェック
    const validMessages: ChatMessage[] = messages.filter(
      (msg: unknown): msg is ChatMessage =>
        typeof msg === "object" &&
        msg !== null &&
        "role" in msg &&
        "content" in msg &&
        typeof (msg as { role: unknown }).role === "string" &&
        ["system", "user", "assistant"].includes((msg as { role: string }).role) &&
        typeof (msg as { content: unknown }).content === "string"
    );

    if (validMessages.length === 0) {
      return NextResponse.json(
        { error: "有効なメッセージが含まれていません" },
        { status: 400 }
      );
    }

    // AI APIを呼び出し（サーバー側でのみ実行）
    const response = await aiClient.chat(validMessages, options);

    return NextResponse.json({
      success: true,
      data: response,
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

// 注記: レート制限ロジックは使用されていません
// Firebase Functionsに移行時に実装してください
