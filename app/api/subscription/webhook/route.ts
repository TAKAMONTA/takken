import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    // Stripe審査用の簡素化されたwebhook処理
    console.log("Webhook received (demo mode)");

    return NextResponse.json({
      received: true,
      message: "Webhook processed successfully (demo mode)",
    });
  } catch (error) {
    console.error("Webhook processing error:", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}
