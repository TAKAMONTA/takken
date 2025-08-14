import { NextRequest, NextResponse } from 'next/server';
import { aiClient } from '@/lib/ai-client';
import { getPrimaryAIProvider, validateAIConfiguration } from '@/lib/ai-config';

export async function POST(request: NextRequest) {
  try {
    const { message, context, userId } = await request.json();

    if (!message) {
      return NextResponse.json(
        { error: 'メッセージが必要です' },
        { status: 400 }
      );
    }

    // AI設定を検証
    const validation = validateAIConfiguration();
    if (!validation.isValid) {
      return NextResponse.json(
        { error: 'AI機能が正しく設定されていません', details: validation.errors },
        { status: 503 }
      );
    }

    // プライマリAIプロバイダーを取得
    const primaryProvider = getPrimaryAIProvider();
    if (!primaryProvider) {
      return NextResponse.json(
        { error: 'AI プロバイダーが設定されていません' },
        { status: 503 }
      );
    }

    // 学習コンテキストを構築
    const systemMessage = {
      role: 'system' as const,
      content: `あなたは宅地建物取引士試験の学習をサポートするAIアシスタントです。
以下の役割を担います：

1. 宅建試験の問題解説と詳細な説明
2. 学習方法のアドバイス
3. 弱点分野の特定と改善提案
4. モチベーション維持のサポート
5. 法改正情報の提供

回答は以下の点に注意してください：
- 正確で分かりやすい説明を心がける
- 具体例を交えて説明する
- 学習者のレベルに合わせた内容にする
- 励ましの言葉を含める
- 必要に応じて関連する条文や判例を引用する

現在の学習コンテキスト：
${context ? JSON.stringify(context, null, 2) : '初回相談'}`
    };

    const userMessage = {
      role: 'user' as const,
      content: `ユーザーID: ${userId || 'anonymous'}
質問: ${message}`
    };

    // AI応答を生成
    const response = await aiClient.chat(
      [systemMessage, userMessage],
      {
        provider: primaryProvider.name as 'OpenAI' | 'Anthropic' | 'Google AI',
        maxTokens: 1000,
        temperature: 0.7,
      }
    );

    return NextResponse.json({
      response: response.content,
      provider: response.provider,
      usage: response.usage,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('AI Chat API Error:', error);
    
    return NextResponse.json(
      { 
        error: 'AI応答の生成中にエラーが発生しました',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  // AI機能の状態を確認
  const validation = validateAIConfiguration();
  const primaryProvider = getPrimaryAIProvider();
  
  return NextResponse.json({
    enabled: validation.isValid,
    validation,
    primaryProvider: primaryProvider?.name || null,
    timestamp: new Date().toISOString(),
  });
}