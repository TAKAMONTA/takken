import { NextRequest, NextResponse } from "next/server";
import { aiClient } from "@/lib/ai-client";

/**
 * AI Motivational Message API Route
 * 
 * モチベーション向上メッセージを生成するAPI
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
    const { streak, recentPerformance } = body;

    // バリデーション
    if (typeof streak !== "number" || typeof recentPerformance !== "number") {
      return NextResponse.json(
        { error: "streakとrecentPerformance（数値）が必要です" },
        { status: 400 }
      );
    }

    // AI APIを呼び出し
    const message = await aiClient.generateMotivationalMessage(
      streak,
      recentPerformance
    );

    return NextResponse.json({
      success: true,
      message,
    });
  } catch (error: any) {
    console.error("AI Motivation API error:", error);

    return NextResponse.json(
      { error: "メッセージの生成中にエラーが発生しました" },
      { status: 500 }
    );
  }
}

