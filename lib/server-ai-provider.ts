import type { AIClientOptions, AIResponse, ChatMessage } from "@/lib/ai-client";

export async function callServerAI(
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

export async function generateServerQuestionExplanation(
  question: string,
  correctAnswer: string,
  userAnswer: string
): Promise<string> {
  const response = await callServerAI(
    [
      {
        role: "system",
        content:
          "あなたは宅地建物取引士試験の講師です。法令知識を正確に、受験生向けに簡潔に解説してください。",
      },
      {
        role: "user",
        content: [
          "次の問題について解説してください。",
          `問題: ${question}`,
          `正解: ${correctAnswer}`,
          `受験者の回答: ${userAnswer}`,
          "なぜ正解または不正解なのか、覚えるべきポイントを含めて説明してください。",
        ].join("\n"),
      },
    ],
    { temperature: 0.4, maxTokens: 900 }
  );

  return response.content;
}

export async function generateServerStudyRecommendations(
  userProgress: unknown,
  weakAreas: string[]
): Promise<string> {
  const response = await callServerAI(
    [
      {
        role: "system",
        content:
          "あなたは宅建試験の学習コーチです。学習データから、次に取るべき行動を具体的に提案してください。",
      },
      {
        role: "user",
        content: [
          "次の学習状況に基づいて、優先すべき学習内容を提案してください。",
          `学習状況: ${JSON.stringify(userProgress)}`,
          `弱点分野: ${weakAreas.join("、")}`,
          "短期の改善アクション、重点分野、復習方法を日本語で簡潔にまとめてください。",
        ].join("\n"),
      },
    ],
    { temperature: 0.5, maxTokens: 900 }
  );

  return response.content;
}

export async function generateServerMotivationalMessage(
  streak: number,
  recentPerformance: number
): Promise<string> {
  const response = await callServerAI(
    [
      {
        role: "system",
        content:
          "あなたは宅建学習者を支えるコーチです。根拠のない断定を避け、短く実行しやすい励ましを返してください。",
      },
      {
        role: "user",
        content: [
          `連続学習日数: ${streak}日`,
          `直近の正答率: ${recentPerformance}%`,
          "今日の学習を続けるためのメッセージと、次にやる小さな行動を提案してください。",
        ].join("\n"),
      },
    ],
    { temperature: 0.7, maxTokens: 500 }
  );

  return response.content;
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
