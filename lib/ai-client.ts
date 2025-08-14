// AI API Client for multiple providers

import { AIResponse, getPrimaryAIProvider, AI_MODELS } from './ai-config';

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface AIClientOptions {
  provider?: 'OpenAI' | 'Anthropic' | 'Google AI';
  model?: string;
  temperature?: number;
  maxTokens?: number;
}

class AIClient {
  private baseURL: { [key: string]: string } = {
    'OpenAI': 'https://api.openai.com/v1',
    'Anthropic': 'https://api.anthropic.com/v1',
    'Google AI': 'https://generativelanguage.googleapis.com/v1beta'
  };

  async chat(
    messages: ChatMessage[],
    options: AIClientOptions = {}
  ): Promise<AIResponse> {
    const provider = options.provider || getPrimaryAIProvider()?.name;
    
    if (!provider) {
      throw new Error('No AI provider configured');
    }

    switch (provider) {
      case 'OpenAI':
        return this.chatOpenAI(messages, options);
      case 'Anthropic':
        return this.chatAnthropic(messages, options);
      case 'Google AI':
        return this.chatGoogleAI(messages, options);
      default:
        throw new Error(`Unsupported provider: ${provider}`);
    }
  }

  private async chatOpenAI(
    messages: ChatMessage[],
    options: AIClientOptions
  ): Promise<AIResponse> {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const response = await fetch(`${this.baseURL['OpenAI']}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: options.model || AI_MODELS.OpenAI.chat,
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
      provider: 'OpenAI',
      usage: {
        tokens: data.usage?.total_tokens || 0,
      },
    };
  }

  private async chatAnthropic(
    messages: ChatMessage[],
    options: AIClientOptions
  ): Promise<AIResponse> {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      throw new Error('Anthropic API key not configured');
    }

    // Convert messages format for Anthropic
    const systemMessage = messages.find(m => m.role === 'system')?.content || '';
    const userMessages = messages.filter(m => m.role !== 'system');

    const response = await fetch(`${this.baseURL['Anthropic']}/messages`, {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'Content-Type': 'application/json',
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: options.model || AI_MODELS.Anthropic.chat,
        max_tokens: options.maxTokens || 1000,
        system: systemMessage,
        messages: userMessages,
      }),
    });

    if (!response.ok) {
      throw new Error(`Anthropic API error: ${response.statusText}`);
    }

    const data = await response.json();
    
    return {
      content: data.content[0].text,
      provider: 'Anthropic',
      usage: {
        tokens: data.usage?.input_tokens + data.usage?.output_tokens || 0,
      },
    };
  }

  private async chatGoogleAI(
    messages: ChatMessage[],
    options: AIClientOptions
  ): Promise<AIResponse> {
    const apiKey = process.env.GOOGLE_AI_API_KEY;
    if (!apiKey) {
      throw new Error('Google AI API key not configured');
    }

    // Convert messages format for Google AI
    const contents = messages.map(msg => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }],
    }));

    const response = await fetch(
      `${this.baseURL['Google AI']}/models/${options.model || AI_MODELS['Google AI'].chat}:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents,
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
      provider: 'Google AI',
      usage: {
        tokens: data.usageMetadata?.totalTokenCount || 0,
      },
    };
  }

  // Generate study recommendations
  async generateStudyRecommendations(
    userProgress: any,
    weakAreas: string[]
  ): Promise<string> {
    const messages: ChatMessage[] = [
      {
        role: 'system',
        content: `あなたは宅地建物取引士試験の学習アドバイザーです。ユーザーの学習進捗と苦手分野を分析して、具体的で実践的な学習アドバイスを提供してください。`
      },
      {
        role: 'user',
        content: `
学習進捗: ${JSON.stringify(userProgress, null, 2)}
苦手分野: ${weakAreas.join(', ')}

上記の情報を基に、今後の学習計画と具体的なアドバイスを日本語で提供してください。
        `
      }
    ];

    const response = await this.chat(messages, {
      temperature: 0.7,
      maxTokens: 800
    });

    return response.content;
  }

  // Generate question explanations
  async generateQuestionExplanation(
    question: string,
    correctAnswer: string,
    userAnswer: string
  ): Promise<string> {
    const messages: ChatMessage[] = [
      {
        role: 'system',
        content: `あなたは宅地建物取引士試験の問題解説の専門家です。問題の解説を分かりやすく、法的根拠を含めて説明してください。`
      },
      {
        role: 'user',
        content: `
問題: ${question}
正解: ${correctAnswer}
ユーザーの回答: ${userAnswer}

この問題について、なぜ正解がその選択肢なのか、他の選択肢がなぜ間違いなのかを法的根拠とともに詳しく解説してください。
        `
      }
    ];

    const response = await this.chat(messages, {
      temperature: 0.3,
      maxTokens: 600
    });

    return response.content;
  }

  // Generate motivational messages
  async generateMotivationalMessage(
    streak: number,
    recentPerformance: number
  ): Promise<string> {
    const messages: ChatMessage[] = [
      {
        role: 'system',
        content: `あなたは学習者を励ます優しいコーチです。ユーザーの学習状況に応じて、前向きで具体的な励ましのメッセージを提供してください。`
      },
      {
        role: 'user',
        content: `
連続学習日数: ${streak}日
最近の正答率: ${recentPerformance}%

ユーザーを励まし、継続的な学習をサポートするメッセージを日本語で作成してください。
        `
      }
    ];

    const response = await this.chat(messages, {
      temperature: 0.8,
      maxTokens: 200
    });

    return response.content;
  }
}

export const aiClient = new AIClient();