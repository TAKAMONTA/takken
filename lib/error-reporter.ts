/**
 * Error reporting abstraction.
 *
 * 目的:
 *   - 既存ユーザーがいる本番アプリで「何が起きているか分からない」を解消する。
 *   - 外部サービス（Sentry / Firebase Crashlytics 等）を後から差し込めるようにする。
 *
 * 仕様:
 *   - 常に既存 logger に構造化ログを出力する（reporter 未登録でも動く）。
 *   - registerExternalReporter() で外部 SDK を差し込むと、エラーが forward される。
 *   - 外部 reporter が throw しても、本流のフローは止めない。
 *
 * Sentry を入れるとき:
 *   1. npm install @sentry/nextjs
 *   2. sentry.client.config.ts / sentry.server.config.ts を生成（wizard 推奨）
 *   3. 起動時に registerExternalReporter({ captureException: Sentry.captureException, ... }) を呼ぶ
 *
 * Firebase Crashlytics を入れるとき（iOS native crash）:
 *   1. Capacitor 用 plugin を導入
 *   2. 同様に registerExternalReporter で wrap
 */

import { logger } from "./logger";

export type ReportSeverity = "info" | "warning" | "error" | "fatal";

export interface ReportContext {
  /** ユーザー識別子（PII を避けて UID を推奨） */
  userId?: string;
  /** エラー発生箇所のタグ（component / route / api endpoint） */
  tags?: Record<string, string>;
  /** 任意の構造化コンテキスト（logger 側で sanitize される） */
  extra?: Record<string, unknown>;
  /** 重要度 */
  severity?: ReportSeverity;
}

export interface ExternalReporter {
  captureException: (error: Error, context?: ReportContext) => void;
  captureMessage: (message: string, context?: ReportContext) => void;
  setUser: (user: { id: string } | null) => void;
}

let externalReporter: ExternalReporter | null = null;

/**
 * 外部 error reporter を差し込む（Sentry / Crashlytics 等）。
 * アプリ起動時に一度だけ呼ぶ。
 */
export function registerExternalReporter(reporter: ExternalReporter | null): void {
  externalReporter = reporter;
}

/**
 * テスト用: 現在登録されている reporter を取得。
 */
export function getExternalReporter(): ExternalReporter | null {
  return externalReporter;
}

function safeForward(action: () => void, fallbackMessage: string): void {
  if (!externalReporter) return;
  try {
    action();
  } catch (forwardErr) {
    // reporter 自体の失敗で本流を止めない
    logger.warn(fallbackMessage, {
      forwardError: forwardErr instanceof Error ? forwardErr.message : String(forwardErr),
    });
  }
}

/**
 * エラーを記録する。常に構造化ログ出力、外部 reporter があれば forward。
 */
export function reportError(error: unknown, context: ReportContext = {}): void {
  const err = error instanceof Error ? error : new Error(String(error));
  const severity = context.severity || "error";

  logger.error(err.message, err, {
    severity,
    tags: context.tags,
    extra: context.extra,
    userId: context.userId,
  });

  safeForward(
    () => externalReporter!.captureException(err, context),
    "external reporter captureException failed"
  );
}

/**
 * メッセージのみを記録（例外オブジェクトがない警告など）。
 */
export function reportMessage(message: string, context: ReportContext = {}): void {
  const severity = context.severity || "info";
  const meta = { severity, tags: context.tags, extra: context.extra, userId: context.userId };

  if (severity === "error" || severity === "fatal") {
    logger.error(message, undefined, meta);
  } else if (severity === "warning") {
    logger.warn(message, meta);
  } else {
    logger.info(message, meta);
  }

  safeForward(
    () => externalReporter!.captureMessage(message, context),
    "external reporter captureMessage failed"
  );
}

/**
 * ログインユーザーを設定（以降のレポートに自動付帯）。
 * ログアウト時は null を渡す。
 */
export function setReportUser(userId: string | null): void {
  safeForward(
    () => externalReporter!.setUser(userId ? { id: userId } : null),
    "external reporter setUser failed"
  );
}
