"use client";

import { useState } from "react";
import { aiClient } from "@/lib/ai-client";
import { logger } from "@/lib/logger";

export default function TestAIPage() {
  const [message, setMessage] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const testAIChat = async () => {
    if (!message.trim()) return;

    setLoading(true);
    setError("");
    setResponse("");

    try {
      const result = await aiClient.chat([
        {
          role: "system",
          content:
            "あなたは宅地建物取引士試験の学習アドバイザーです。簡潔で分かりやすい回答をしてください。",
        },
        {
          role: "user",
          content: message,
        },
      ]);

      setResponse(result.content);
    } catch (err: unknown) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error.message || "エラーが発生しました");
      logger.error("AI Test Error", error);
    } finally {
      setLoading(false);
    }
  };

  const testStudyRecommendations = async () => {
    setLoading(true);
    setError("");
    setResponse("");

    try {
      const result = await aiClient.generateStudyRecommendations(
        {
          totalQuestions: 50,
          correctAnswers: 35,
          categoryProgress: {
            宅建業法: { correct: 15, total: 20 },
            民法等: { correct: 10, total: 15 },
            法令上の制限: { correct: 5, total: 10 },
            "税・その他": { correct: 5, total: 5 },
          },
        },
        ["法令上の制限", "民法等"]
      );

      setResponse(result);
    } catch (err: unknown) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error.message || "エラーが発生しました");
      logger.error("AI Test Error", error);
    } finally {
      setLoading(false);
    }
  };

  const testQuestionExplanation = async () => {
    setLoading(true);
    setError("");
    setResponse("");

    try {
      const result = await aiClient.generateQuestionExplanation(
        "宅地建物取引業者は、媒介契約を締結する際、取引の相手方に対して重要事項説明書を交付しなければならない。",
        "正しい",
        "正しい"
      );

      setResponse(result);
    } catch (err: unknown) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error.message || "エラーが発生しました");
      logger.error("AI Test Error", error);
    } finally {
      setLoading(false);
    }
  };

  const testMotivationalMessage = async () => {
    setLoading(true);
    setError("");
    setResponse("");

    try {
      const result = await aiClient.generateMotivationalMessage(7, 75);

      setResponse(result);
    } catch (err: unknown) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error.message || "エラーが発生しました");
      logger.error("AI Test Error", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          AI機能テストページ
        </h1>

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">AIチャットテスト</h2>
          <div className="space-y-4">
            <textarea
              value={message}
              onChange={e => setMessage(e.target.value)}
              placeholder="宅建試験について質問してください..."
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={3}
            />
            <button
              onClick={testAIChat}
              disabled={loading || !message.trim()}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "処理中..." : "AIチャットテスト"}
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">AI機能テスト</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={testStudyRecommendations}
              disabled={loading}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "処理中..." : "学習推奨テスト"}
            </button>
            <button
              onClick={testQuestionExplanation}
              disabled={loading}
              className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "処理中..." : "問題解説テスト"}
            </button>
            <button
              onClick={testMotivationalMessage}
              disabled={loading}
              className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "処理中..." : "モチベーションテスト"}
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
            <h3 className="text-red-800 font-semibold">エラー</h3>
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {response && (
          <div className="bg-green-50 border border-green-200 rounded-md p-4">
            <h3 className="text-green-800 font-semibold mb-2">AI応答</h3>
            <div className="text-green-700 whitespace-pre-wrap">{response}</div>
          </div>
        )}

        <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-md p-4">
          <h3 className="text-yellow-800 font-semibold mb-2">注意事項</h3>
          <ul className="text-yellow-700 text-sm space-y-1">
            <li>• このテストは開発環境でのみ動作します</li>
            <li>• 本番環境（Firebase Hosting）では動作しません</li>
            <li>
              • AI機能を本番で使用するには Firebase Functions への移行が必要です
            </li>
            <li>• エラーが発生した場合は、環境変数の設定を確認してください</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
