// Firebase Functions Test Client
// テスト環境用 - 認証をスキップ

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

class FirebaseFunctionsTestAIClient {
  private baseURL: string;

  constructor() {
    // テスト環境ではエミュレーターのURLを使用
    this.baseURL = "http://localhost:5001/takken-d3a2b/us-central1";
  }

  private async makeRequest(endpoint: string, data: any): Promise<any> {
    const response = await fetch(`${this.baseURL}/${endpoint}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // テスト用の認証ヘッダーをスキップ
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

export const firebaseFunctionsTestAIClient =
  new FirebaseFunctionsTestAIClient();
