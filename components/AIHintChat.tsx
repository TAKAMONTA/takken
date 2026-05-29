"use client";

import { useMemo, useRef, useState } from "react";
import type { ChatMessage } from "@/lib/ai-client";
import { aiClient } from "@/lib/ai-client";
import { withAIFallback } from "@/lib/ai-fallback";
import AIUsageLimitNotice from "@/components/AIUsageLimitNotice";

interface AIHintChatProps {
  question: string;
  options?: string[];
  category?: string;
  year?: string | number;
  difficulty?: string;
  className?: string;
}

export default function AIHintChat({
  question,
  options = [],
  category,
  year,
  difficulty,
  className = "",
}: AIHintChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errorRetryable, setErrorRetryable] = useState(false);
  const [lastSentMessages, setLastSentMessages] = useState<ChatMessage[] | null>(null);
  const [usageLimitMessage, setUsageLimitMessage] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const systemMessage = useMemo<ChatMessage>(
    () => ({
      role: "system",
      content:
        "あなたは宅地建物取引士試験の家庭教師です。受験生が自力で正解に辿り着けるよう、段階的なヒントと着眼点だけを提示してください。原則として答えは直接言わず、条文・用語の確認ポイント、典型的なひっかけ、具体例を用いて1〜3行で簡潔に導くこと。最後は次の一歩（どの選択肢をどう比較するか）を提案してください。",
    }),
    []
  );

  const contextBlock = useMemo(() => {
    const meta: string[] = [];
    if (category) meta.push(`分野: ${category}`);
    if (year) meta.push(`年度: ${year}`);
    if (difficulty) meta.push(`難易度: ${difficulty}`);
    const metaLine = meta.length ? `\n(${meta.join(" / ")})` : "";
    const optionsList =
      options && options.length ? `\n\n選択肢:\n- ${options.join("\n- ")}` : "";
    return `問題:\n${question}${optionsList}${metaLine}`;
  }, [question, options, category, year, difficulty]);

  const scrollToBottom = () => {
    if (!containerRef.current) return;
    containerRef.current.scrollTop = containerRef.current.scrollHeight;
  };

  async function send(retryWith?: ChatMessage[]) {
    if (loading) return;
    const trimmed = input.trim();
    if (!retryWith && !trimmed) return;

    setLoading(true);
    setError(null);
    setErrorRetryable(false);
    setUsageLimitMessage(null);

    const newMessages: ChatMessage[] = retryWith ?? [
      ...messages,
      {
        role: "user",
        content: `【状況】\n${contextBlock}\n\n【質問】\n${trimmed}`,
      },
    ];
    if (!retryWith) {
      setMessages(newMessages);
      setInput("");
    }
    setLastSentMessages(newMessages);

    const result = await withAIFallback(
      () =>
        aiClient.chat([systemMessage, ...newMessages], {
          temperature: 0.3,
          maxTokens: 400,
        }),
      {
        tags: {
          component: "AIHintChat",
          questionCategory: category ?? "unknown",
        },
      },
    );

    if (result.success && result.value) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: result.value!.content },
      ]);
    } else if (result.reason === "rate_limit") {
      setUsageLimitMessage(result.userMessage ?? "");
    } else {
      setError(result.userMessage ?? "AI応答の取得に失敗しました。");
      setErrorRetryable(result.retryable);
    }

    setLoading(false);
    setTimeout(scrollToBottom, 0);
  }

  function retry() {
    if (lastSentMessages) {
      void send(lastSentMessages);
    }
  }

  return (
    <div
      className={`bg-purple-50 border border-purple-200 rounded-lg ${className}`}
    >
      <div className="px-4 py-3 border-b border-purple-200 flex items-center justify-between">
        <h3 className="text-sm font-bold text-purple-800">
          🤖 AIヒントチャット（ベータ）
        </h3>
        <span className="text-[10px] text-purple-600">
          無料枠あり
        </span>
      </div>

      <div
        ref={containerRef}
        className="max-h-64 overflow-auto px-4 py-3 space-y-3"
      >
        {messages.length === 0 && (
          <div className="text-xs text-purple-700">
            困った点を短く書いて送信してください。AIが答えを直接言わずに、着眼点や条文の確認ポイントを提案します。
          </div>
        )}
        {messages.map((m, i) => (
          <div
            key={i}
            className={
              m.role === "assistant"
                ? "text-sm text-gray-800"
                : "text-sm text-gray-700"
            }
          >
            <div
              className={
                m.role === "assistant"
                  ? "bg-white border border-purple-200 rounded-md p-2"
                  : "bg-purple-100 rounded-md p-2"
              }
            >
              {m.content}
            </div>
          </div>
        ))}
        {error && (
          <div className="text-xs text-red-700 bg-red-50 border border-red-200 rounded-md p-2 space-y-2">
            <div>{error}</div>
            {errorRetryable && (
              <button
                onClick={retry}
                disabled={loading}
                className="text-xs px-2 py-1 bg-red-600 text-white rounded-md disabled:opacity-50"
              >
                もう一度試す
              </button>
            )}
          </div>
        )}
        {usageLimitMessage && (
          <AIUsageLimitNotice message={usageLimitMessage} compact />
        )}
      </div>

      <div className="px-4 py-3 border-t border-purple-200 flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="どこで躓いているかを書いてください（例: 二重売買の扱いが混乱）"
          disabled={!!usageLimitMessage}
          className="flex-1 text-sm p-2 border border-purple-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-400"
        />
        <button
          onClick={() => send()}
          disabled={loading || !input.trim() || !!usageLimitMessage}
          className="px-3 py-2 text-sm bg-purple-600 text-white rounded-md disabled:opacity-50"
        >
          {loading ? "送信中" : "送信"}
        </button>
      </div>
    </div>
  );
}
