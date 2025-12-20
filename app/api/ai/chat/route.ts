import { NextRequest, NextResponse } from "next/server";
import { ChatMessage, AIClientOptions, AIResponse } from "@/lib/ai-client";
import {
  verifyRequestAuth,
  createAuthErrorResponse,
} from "@/lib/firebase-admin-auth";
import { logger } from "@/lib/logger";

/**
 * AI APIを直接呼び出す（サーバー側のみ）
 */
async function callAIDirectly(
  messages: ChatMessage[],
  options: AIClientOptions = {}
): Promise<AIResponse> {
  const provider = options.provider || getPrimaryAIProvider();
  
  if (!provider) {
    throw new Error("AI APIが設定されていません");
  }

  switch (provider) {
    case "OpenAI":
      return await callOpenAI(messages, options);
    case "Anthropic":
      return await callAnthropic(messages, options);
    case "Google AI":
      return await callGoogleAI(messages, options);
    default:
      throw new Error(`サポートされていないプロバイダー: ${provider}`);
  }
}

function getPrimaryAIProvider(): string {
  if (process.env.OPENAI_API_KEY) return "OpenAI";
  if (process.env.ANTHROPIC_API_KEY) return "Anthropic";
  if (process.env.GOOGLE_AI_API_KEY) return "Google AI";
  return "";
}

async function callOpenAI(
  messages: ChatMessage[],
  options: AIClientOptions
): Promise<AIResponse> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OpenAI API key not configured");
  }

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: options.model || "gpt-4o-mini",
      messages,
      temperature: options.temperature || 0.7,
      max_tokens: options.maxTokens || 1000,
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.statusText}`);
  }

  const data = await response.json();

  return {
    content: data.choices[0].message.content,
    provider: "OpenAI",
    usage: {
      tokens: data.usage?.total_tokens || 0,
    },
  };
}

async function callAnthropic(
  messages: ChatMessage[],
  options: AIClientOptions
): Promise<AIResponse> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error("Anthropic API key not configured");
  }

  const systemMessage = messages.find((m) => m.role === "system")?.content || "";
  const userMessages = messages.filter((m) => m.role !== "system");

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": apiKey,
      "Content-Type": "application/json",
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: options.model || "claude-3-5-sonnet-20241022",
      system: systemMessage,
      messages: userMessages,
      max_tokens: options.maxTokens || 1000,
      temperature: options.temperature || 0.7,
    }),
  });

  if (!response.ok) {
    throw new Error(`Anthropic API error: ${response.statusText}`);
  }

  const data = await response.json();

  return {
    content: data.content[0].text,
    provider: "Anthropic",
    usage: {
      tokens: data.usage?.input_tokens + data.usage?.output_tokens || 0,
    },
  };
}

async function callGoogleAI(
  messages: ChatMessage[],
  options: AIClientOptions
): Promise<AIResponse> {
  const apiKey = process.env.GOOGLE_AI_API_KEY;
  if (!apiKey) {
    throw new Error("Google AI API key not configured");
  }

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${options.model || "gemini-pro"}:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: messages.map((m) => ({
          role: m.role === "assistant" ? "model" : "user",
          parts: [{ text: m.content }],
        })),
        generationConfig: {
          temperature: options.temperature || 0.7,
          maxOutputTokens: options.maxTokens || 1000,
        },
      }),
    }
  );

  if (!response.ok) {
    throw new Error(`Google AI API error: ${response.statusText}`);
  }

  const data = await response.json();

  return {
    content: data.candidates[0].content.parts[0].text,
    provider: "Google AI",
    usage: {
      tokens: data.usageMetadata?.totalTokenCount || 0,
    },
  };
}

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

    // AI APIを直接呼び出し（サーバー側でのみ実行）
    // UnifiedAIClientはFirebase Functionsエミュレーターを使おうとするため、直接APIを呼ぶ
    const response = await callAIDirectly(validMessages, options);

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
