import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { userId, plan, yearly = false } = await request.json();

    if (!userId || !plan) {
      return NextResponse.json(
        { error: "ユーザーIDとプランが必要です" },
        { status: 400 }
      );
    }

    // Stripe審査用の簡素化されたレスポンス
    return NextResponse.json({
      sessionId: "demo-session-id",
      url: "/subscription/pricing",
      message: "プレミアムプランの機能は現在開発中です。",
    });
  } catch (error) {
    console.error("Subscription API error:", error);
    return NextResponse.json(
      { error: "チェックアウトセッションの作成に失敗しました" },
      { status: 500 }
    );
  }
}
