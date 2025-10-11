/**
 * AI API Client (Client-side wrapper)
 * 
 * クライアント側から安全にAI機能を利用するためのラッパー関数群
 * 
 * 使用方法:
 * 1. 既存の aiClient.xxx() 呼び出しをこのモジュールの関数に置き換え
 * 2. next.config.mjs から "output: export" を削除してサーバー実行環境にデプロイ
 * 
 * または、Firebase Functionsに移行する場合は別途実装が必要です
 */

import { getAuth } from "firebase/auth";
import { ChatMessage, AIResponse, AIClientOptions } from "./ai-client";

/**
 * Firebaseの認証トークンを取得
 */
async function getAuthToken(): Promise<string | null> {
  const auth = getAuth();
  const user = auth.currentUser;

  if (!user) {
    throw new Error("認証が必要です。ログインしてください。");
  }

  return await user.getIdToken();
}

/**
 * API Routeを呼び出すヘルパー関数
 */
async function callAIAPI<T>(
  endpoint: string,
  body: any
): Promise<T> {
  const token = await getAuthToken();

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || `API error: ${response.statusText}`);
  }

  const data = await response.json();
  return data;
}

/**
 * AIチャット
 * 
 * 既存の aiClient.chat() の代替
 */
export async function chat(
  messages: ChatMessage[],
  options?: AIClientOptions
): Promise<AIResponse> {
  const result = await callAIAPI<{ success: boolean; data: AIResponse }>(
    "/api/ai/chat",
    { messages, options }
  );
  return result.data;
}

/**
 * 学習推奨事項を生成
 * 
 * 既存の aiClient.generateStudyRecommendations() の代替
 */
export async function generateStudyRecommendations(
  userProgress: any,
  weakAreas: string[]
): Promise<string> {
  const result = await callAIAPI<{ success: boolean; recommendations: string }>(
    "/api/ai/recommendations",
    { userProgress, weakAreas }
  );
  return result.recommendations;
}

/**
 * 問題の解説を生成
 * 
 * 既存の aiClient.generateQuestionExplanation() の代替
 */
export async function generateQuestionExplanation(
  question: string,
  correctAnswer: string,
  userAnswer: string
): Promise<string> {
  const result = await callAIAPI<{ success: boolean; explanation: string }>(
    "/api/ai/explanation",
    { question, correctAnswer, userAnswer }
  );
  return result.explanation;
}

/**
 * モチベーション向上メッセージを生成
 * 
 * 既存の aiClient.generateMotivationalMessage() の代替
 */
export async function generateMotivationalMessage(
  streak: number,
  recentPerformance: number
): Promise<string> {
  const result = await callAIAPI<{ success: boolean; message: string }>(
    "/api/ai/motivation",
    { streak, recentPerformance }
  );
  return result.message;
}

/**
 * エラーハンドリング付きのラッパー
 * 
 * 使用例:
 * const result = await withErrorHandling(() => chat(messages));
 */
export async function withErrorHandling<T>(
  fn: () => Promise<T>,
  fallback?: T
): Promise<T | null> {
  try {
    return await fn();
  } catch (error: any) {
    console.error("AI API error:", error);
    
    // ユーザーフレンドリーなエラーメッセージ
    if (error.message?.includes("認証")) {
      console.error("認証エラー: ログインしてください");
    } else if (error.message?.includes("rate limit")) {
      console.error("リクエスト制限: しばらくしてから再試行してください");
    } else {
      console.error("AI機能の利用中にエラーが発生しました");
    }

    return fallback !== undefined ? fallback : null;
  }
}

/**
 * 使用例:
 * 
 * // 従来の方法（直接AI APIを呼ぶ - セキュリティ問題あり）
 * import { aiClient } from '@/lib/ai-client';
 * const response = await aiClient.chat(messages); // ❌
 * 
 * // 新しい方法（API Route経由 - 推奨）
 * import { chat } from '@/lib/ai-api-client';
 * const response = await chat(messages); // ✅
 * 
 * // エラーハンドリング付き
 * import { chat, withErrorHandling } from '@/lib/ai-api-client';
 * const response = await withErrorHandling(() => chat(messages), { content: 'デフォルトメッセージ' });
 */

