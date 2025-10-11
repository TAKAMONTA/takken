import { NextRequest, NextResponse } from "next/server";
import { aiClient } from "@/lib/ai-client";

/**
 * AI Study Recommendations API Route
 * 
 * 学習の推奨事項を生成するAPI
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
    const { userProgress, weakAreas } = body;

    // バリデーション
    if (!userProgress || !weakAreas || !Array.isArray(weakAreas)) {
      return NextResponse.json(
        { error: "userProgressとweakAreasが必要です" },
        { status: 400 }
      );
    }

    // AI APIを呼び出し
    const recommendations = await aiClient.generateStudyRecommendations(
      userProgress,
      weakAreas
    );

    return NextResponse.json({
      success: true,
      recommendations,
    });
  } catch (error: any) {
    console.error("AI Recommendations API error:", error);

    return NextResponse.json(
      { error: "推奨事項の生成中にエラーが発生しました" },
      { status: 500 }
    );
  }
}

