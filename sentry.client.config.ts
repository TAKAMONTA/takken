/**
 * Sentry 初期化（ブラウザ / Capacitor WebView 側）。
 *
 * DSN 未設定なら何もせず終了する。dev/CI/dev環境でもエラーを起こさない設計。
 */

import * as Sentry from "@sentry/nextjs";

const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;

if (dsn) {
  Sentry.init({
    dsn,
    environment: process.env.NEXT_PUBLIC_SENTRY_ENVIRONMENT || process.env.NODE_ENV,
    release: process.env.NEXT_PUBLIC_SENTRY_RELEASE,

    // free tier (5k events/月) に収めるための保守的 sampling。
    // 本番で event 数が見えてきたら上げる。
    tracesSampleRate: Number(process.env.NEXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE || 0.1),

    // Session Replay はエラー時のみ収集する。通常 session はオフ。
    replaysSessionSampleRate: 0,
    replaysOnErrorSampleRate: Number(
      process.env.NEXT_PUBLIC_SENTRY_REPLAYS_ON_ERROR_SAMPLE_RATE || 1.0
    ),

    // 本番のみ送信。dev で誤って Sentry にゴミが行かない保険。
    enabled: process.env.NODE_ENV === "production",

    // PII を絞る: メール・IP は送らない。userId だけ setReportUser 経由で付ける。
    sendDefaultPii: false,

    // 想定済みエラーは送らない
    ignoreErrors: [
      // ネットワーク断（ユーザー操作の領域）
      "Network request failed",
      "NetworkError",
      "Failed to fetch",
      // ブラウザ拡張由来の noise
      "ResizeObserver loop limit exceeded",
      "ResizeObserver loop completed with undelivered notifications",
    ],
  });
}
