// 統合AI Client - 環境に応じて適切なクライアントを選択
// 静的エクスポート環境ではFirebase Functionsを使用
// 通常のNext.js環境では直接API Routesを使用

import {
  firebaseFunctionsAIClient,
  ChatMessage,
  AIClientOptions,
  AIResponse,
} from "./firebase-functions-client";
import { firebaseFunctionsTestAIClient } from "./firebase-functions-test-client";

// 環境に応じたAI Clientの選択
export class UnifiedAIClient {
  private isStaticExport: boolean;

  constructor() {
    // 静的エクスポート環境かどうかを判定
    // next.config.mjsでoutput: "export"が設定されている場合
    // API Routesが利用できない環境を検出
    this.isStaticExport =
      typeof window !== "undefined" &&
      !!window.location &&
      !!window.location.hostname &&
      (process.env.NODE_ENV === "production" || 
       !window.location.hostname.includes("localhost"));
  }

  async chat(
    messages: ChatMessage[],
    options: AIClientOptions = {}
  ): Promise<AIResponse> {
    if (this.isStaticExport) {
      // 静的エクスポート環境ではFirebase Functionsを使用
      return await firebaseFunctionsAIClient.chat(messages, options);
    } else if (typeof window === "undefined") {
      // Node.js環境（テストスクリプト）ではテスト用クライアントを使用
      return await firebaseFunctionsTestAIClient.chat(messages, options);
    } else {
      // 開発環境では直接API Routesを使用
      return await this.callAPIRoute("/api/ai/chat", { messages, options });
    }
  }

  async generateStudyRecommendations(
    userProgress: any,
    weakAreas: string[]
  ): Promise<string> {
    if (this.isStaticExport) {
      return await firebaseFunctionsAIClient.generateStudyRecommendations(
        userProgress,
        weakAreas
      );
    } else if (typeof window === "undefined") {
      return await firebaseFunctionsTestAIClient.generateStudyRecommendations(
        userProgress,
        weakAreas
      );
    } else {
      return await this.callAPIRoute("/api/ai/recommendations", {
        userProgress,
        weakAreas,
      });
    }
  }

  async generateQuestionExplanation(
    question: string,
    correctAnswer: string,
    userAnswer: string
  ): Promise<string> {
    if (this.isStaticExport) {
      return await firebaseFunctionsAIClient.generateQuestionExplanation(
        question,
        correctAnswer,
        userAnswer
      );
    } else if (typeof window === "undefined") {
      return await firebaseFunctionsTestAIClient.generateQuestionExplanation(
        question,
        correctAnswer,
        userAnswer
      );
    } else {
      return await this.callAPIRoute("/api/ai/explanation", {
        question,
        correctAnswer,
        userAnswer,
      });
    }
  }

  async generateMotivationalMessage(
    streak: number,
    recentPerformance: number
  ): Promise<string> {
    if (this.isStaticExport) {
      return await firebaseFunctionsAIClient.generateMotivationalMessage(
        streak,
        recentPerformance
      );
    } else if (typeof window === "undefined") {
      return await firebaseFunctionsTestAIClient.generateMotivationalMessage(
        streak,
        recentPerformance
      );
    } else {
      return await this.callAPIRoute("/api/ai/motivation", {
        streak,
        recentPerformance,
      });
    }
  }

  private async callAPIRoute(endpoint: string, data: any): Promise<any> {
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        // より詳細なエラーメッセージ
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error || 
          `API request failed: ${response.status} ${response.statusText}`
        );
      }

      const result = await response.json();
      return (
        result.data ||
        result.explanation ||
        result.message ||
        result.recommendations
      );
    } catch (error) {
      // ネットワークエラーやAPI Routesが利用できない場合の処理
      // エラーを再スロー（統一実装が適切に処理）
      throw error;
    }
  }
}

export const aiClient = new UnifiedAIClient();

// 既存の型定義を再エクスポート
export type { ChatMessage, AIClientOptions, AIResponse };
