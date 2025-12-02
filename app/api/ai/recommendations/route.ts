import { NextRequest, NextResponse } from "next/server";
import { aiClient } from "@/lib/ai-client";
import {
  verifyRequestAuth,
  createAuthErrorResponse,
} from "@/lib/firebase-admin-auth";
import { logger } from "@/lib/logger";

/**
 * AI Study Recommendations API Route
 *
 * 学習の推奨事項を生成するAPI
 *
 * ⚠️ 注意: このAPIは現在の設定（output: "export"）では動作しません
 */

export async function POST(request: NextRequest) {
  let userId: string | undefined;
  try {
    // Firebase Admin SDKでトークンを検証
    userId = await verifyRequestAuth(request);

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
  } catch (error: unknown) {
    const err = error instanceof Error ? error : new Error(String(error));
    logger.error("AI Recommendations API error", err, { userId });

    // 認証エラーの場合
    if (
      err.message?.includes("認証が必要です") ||
      err.message?.includes("Invalid")
    ) {
      return createAuthErrorResponse();
    }

    return NextResponse.json(
      { error: "推奨事項の生成中にエラーが発生しました" },
      { status: 500 }
    );
  }
}
