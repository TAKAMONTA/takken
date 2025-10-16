import { NextRequest, NextResponse } from "next/server";
import { aiClient, ChatMessage } from "@/lib/ai-client";

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
  try {
    // 認証チェック（Firebase Authのトークン検証）
    const authHeader = request.headers.get("authorization");
    
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "認証が必要です" },
        { status: 401 }
      );
    }

    // TODO: Firebase Admin SDKでトークンを検証
    // const token = authHeader.split("Bearer ")[1];
    // const decodedToken = await admin.auth().verifyIdToken(token);
    // const userId = decodedToken.uid;

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
      (msg: any) =>
        msg &&
        typeof msg === "object" &&
        ["system", "user", "assistant"].includes(msg.role) &&
        typeof msg.content === "string"
    );

    if (validMessages.length === 0) {
      return NextResponse.json(
        { error: "有効なメッセージが含まれていません" },
        { status: 400 }
      );
    }

    // AI APIを呼び出し（サーバー側でのみ実行）
    const response = await aiClient.chat(validMessages, options);

    // TODO: 使用量をFirestoreに記録
    // await recordAIUsage(userId, response.usage);

    return NextResponse.json({
      success: true,
      data: response,
    });
  } catch (error: any) {
    console.error("AI Chat API error:", error);

    // エラーの種類に応じたレスポンス
    if (error.message?.includes("API key not configured")) {
      return NextResponse.json(
        { error: "AI APIが設定されていません" },
        { status: 503 }
      );
    }

    if (error.message?.includes("rate limit")) {
      return NextResponse.json(
        { error: "リクエスト数が上限に達しました。しばらくしてから再試行してください" },
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

