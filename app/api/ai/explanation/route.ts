import { NextRequest, NextResponse } from "next/server";
import { aiClient } from "@/lib/ai-client";

/**
 * AI Question Explanation API Route
 * 
 * 問題の解説を生成するAPI
 * 
 * ⚠️ 注意: このAPIは現在の設定（output: "export"）では動作しません
 */

export async function POST(request: NextRequest) {
  try {
    // 認証チェック
    const authHeader = request.headers.get("authorization");
    
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "認証が必要です" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { question, correctAnswer, userAnswer } = body;

    // バリデーション
    if (!question || !correctAnswer || !userAnswer) {
      return NextResponse.json(
        { error: "question, correctAnswer, userAnswerが必要です" },
        { status: 400 }
      );
    }

    // AI APIを呼び出し
    const explanation = await aiClient.generateQuestionExplanation(
      question,
      correctAnswer,
      userAnswer
    );

    return NextResponse.json({
      success: true,
      explanation,
    });
  } catch (error: any) {
    console.error("AI Explanation API error:", error);

    return NextResponse.json(
      { error: "解説の生成中にエラーが発生しました" },
      { status: 500 }
    );
  }
}

