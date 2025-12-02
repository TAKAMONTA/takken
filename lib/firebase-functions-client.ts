// Firebase Functions API Client
// 静的エクスポート環境でもFirebase Functionsを使用可能

import { getAuth } from "firebase/auth";

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface AIClientOptions {
  provider?: "OpenAI" | "Anthropic" | "Google AI";
  model?: string;
  temperature?: number;
  maxTokens?: number;
}

export interface AIResponse {
  content: string;
  provider: string;
  usage: {
    tokens: number;
  };
}

class FirebaseFunctionsAIClient {
  private baseURL: string;

  constructor() {
    // Firebase設定から動的に取得
    const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
    const region = process.env.NEXT_PUBLIC_FIREBASE_FUNCTIONS_REGION || 'us-central1';
    
    if (process.env.NODE_ENV === "production") {
      if (!projectId) {
        throw new Error(
          "NEXT_PUBLIC_FIREBASE_PROJECT_ID is required for production. " +
          "Please set it in your .env.local file."
        );
      }
      this.baseURL = `https://${region}-${projectId}.cloudfunctions.net`;
    } else {
      // 開発環境ではエミュレーターのURLを使用
      const emulatorHost = process.env.NEXT_PUBLIC_FIREBASE_EMULATOR_HOST || 'localhost';
      const emulatorPort = process.env.NEXT_PUBLIC_FIREBASE_EMULATOR_PORT || '5001';
      const emulatorProjectId = projectId || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'your-project-id';
      this.baseURL = `http://${emulatorHost}:${emulatorPort}/${emulatorProjectId}/${region}`;
    }
  }

  private async getAuthToken(): Promise<string> {
    const auth = getAuth();
    const user = auth.currentUser;

    if (!user) {
      throw new Error("ユーザーが認証されていません");
    }

    return await user.getIdToken();
  }

  private async makeRequest(endpoint: string, data: any): Promise<any> {
    const token = await this.getAuthToken();

    const response = await fetch(`${this.baseURL}/${endpoint}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "API request failed");
    }

    return await response.json();
  }

  async chat(
    messages: ChatMessage[],
    options: AIClientOptions = {}
  ): Promise<AIResponse> {
    const response = await this.makeRequest("aiChat", {
      messages,
      options,
    });

    return response.data;
  }

  async generateStudyRecommendations(
    userProgress: any,
    weakAreas: string[]
  ): Promise<string> {
    const response = await this.makeRequest("aiRecommendations", {
      userProgress,
      weakAreas,
    });

    return response.recommendations;
  }

  async generateQuestionExplanation(
    question: string,
    correctAnswer: string,
    userAnswer: string
  ): Promise<string> {
    const response = await this.makeRequest("aiExplanation", {
      question,
      correctAnswer,
      userAnswer,
    });

    return response.explanation;
  }

  async generateMotivationalMessage(
    streak: number,
    recentPerformance: number
  ): Promise<string> {
    const response = await this.makeRequest("aiMotivation", {
      streak,
      recentPerformance,
    });

    return response.message;
  }
}

export const firebaseFunctionsAIClient = new FirebaseFunctionsAIClient();
