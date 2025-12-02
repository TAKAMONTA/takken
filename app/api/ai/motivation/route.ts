import { NextRequest, NextResponse } from "next/server";
import { aiClient } from "@/lib/ai-client";
import {
  verifyRequestAuth,
  createAuthErrorResponse,
} from "@/lib/firebase-admin-auth";
import { logger } from "@/lib/logger";

/**
 * AI Motivational Message API Route
 *
 * モチベーション向上メッセージを生成するAPI
 *
 * ⚠️ 注意: このAPIは現在の設定（output: "export"）では動作しません
 */

export async function POST(request: NextRequest) {
  let userId: string | undefined;
  try {
    // Firebase Admin SDKでトークンを検証
    userId = await verifyRequestAuth(request);

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
  } catch (error: unknown) {
    const err = error instanceof Error ? error : new Error(String(error));
    logger.error("AI Motivation API error", err, { userId });

    // 認証エラーの場合
    if (
      err.message?.includes("認証が必要です") ||
      err.message?.includes("Invalid")
    ) {
      return createAuthErrorResponse();
    }

    return NextResponse.json(
      { error: "メッセージの生成中にエラーが発生しました" },
      { status: 500 }
    );
  }
}
