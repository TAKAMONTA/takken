/**
 * Next.js 15 App Router の instrumentation エントリーポイント。
 *
 * runtime に応じて適切な sentry config を読み込む。
 * Sentry のドキュメント推奨パターン。
 */

export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    await import("./sentry.server.config");
  }

  if (process.env.NEXT_RUNTIME === "edge") {
    await import("./sentry.edge.config");
  }
}

// API route の Server Component / Route Handler 内エラーを Sentry に紐づける
export { captureRequestError as onRequestError } from "@sentry/nextjs";
