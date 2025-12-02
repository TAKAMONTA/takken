"use client";

import { useMemo, useRef, useState } from "react";
import type { ChatMessage } from "@/lib/ai-client";
import { aiClient } from "@/lib/ai-client";
import { logger } from "@/lib/logger";

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

  async function send() {
    if (!input.trim() || loading) return;

    setLoading(true);
    setError(null);
    const newMessages: ChatMessage[] = [
      ...messages,
      {
        role: "user",
        content: `【状況】\n${contextBlock}\n\n【質問】\n${input.trim()}`,
      },
    ];
    setMessages(newMessages);
    setInput("");

    // 1) まずはサーバーのAPI Routeに投げる（本番想定）
    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [systemMessage, ...newMessages] }),
      });

      if (res.ok) {
        const data = await res.json();
        const content: string = data?.data?.content || data?.content || "";
        if (!content) throw new Error("空の応答です");
        setMessages((prev) => [...prev, { role: "assistant", content }]);
        setTimeout(scrollToBottom, 0);
        setLoading(false);
        return;
      }
      // 401などはフォールバックへ
    } catch (e) {
      const err = e instanceof Error ? e : new Error(String(e));
      logger.warn("API Route failed, falling back to direct client", {
        errorMessage: err.message,
      });
      // フォールバックへ
    }

    // 2) フォールバック：開発環境では直接 aiClient を使用
    try {
      const response = await aiClient.chat([systemMessage, ...newMessages], {
        temperature: 0.3,
        maxTokens: 400,
      });
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: response.content },
      ]);
    } catch (e) {
      const err = e instanceof Error ? e : new Error(String(e));
      logger.error("AI chat failed", err, {
        questionLength: question.length,
        messagesCount: newMessages.length,
      });
      setError(
        err.message.includes("API key")
          ? "AIの設定が未完了です。開発ではAPI RouteかFirebase Functionsの設定が必要です。"
          : "AI応答の取得に失敗しました。しばらくしてから再試行してください。"
      );
    } finally {
      setLoading(false);
      setTimeout(scrollToBottom, 0);
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
          本番ではFunctionsが必要
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
          <div className="text-xs text-red-700 bg-red-50 border border-red-200 rounded-md p-2">
            {error}
          </div>
        )}
      </div>

      <div className="px-4 py-3 border-t border-purple-200 flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="どこで躓いているかを書いてください（例: 二重売買の扱いが混乱）"
          className="flex-1 text-sm p-2 border border-purple-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-400"
        />
        <button
          onClick={send}
          disabled={loading || !input.trim()}
          className="px-3 py-2 text-sm bg-purple-600 text-white rounded-md disabled:opacity-50"
        >
          {loading ? "送信中" : "送信"}
        </button>
      </div>
    </div>
  );
}
