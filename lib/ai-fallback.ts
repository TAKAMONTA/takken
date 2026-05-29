/**
 * AI API 失敗時のフォールバック動作を統一する utility。
 *
 * 目的:
 *   - OpenAI / Anthropic / Google AI が落ちた / レート制限 / ネットワーク失敗の各ケースを
 *     consumer 側で一貫したやり方で扱う。
 *   - 失敗を必ず error-reporter 経由で観測する（Sentry に飛ぶ）。
 *   - エラー文言をユーザーに優しい中立的な日本語に翻訳する。
 *   - 静的に用意できるフォールバック値（例: 既存の question.explanation）を返せる。
 *
 * 設計:
 *   withAIFallback() に AI 呼び出し関数とオプションを渡すと、AIFallbackResult を返す。
 *   呼び出し側は result.success で分岐し、失敗時は result.fallback と result.userMessage
 *   を表示することでデグレードした UX を提供する。
 */

import {
  APIError,
  APIErrorType,
  getUserFriendlyErrorMessage,
} from "./api-error-handler";
import { reportError } from "./error-reporter";

export type AIFallbackReason =
  | "rate_limit"
  | "network"
  | "timeout"
  | "auth"
  | "server"
  | "unknown";

export interface AIFallbackResult<T> {
  /** AI 呼び出しが成功したか */
  success: boolean;
  /** 成功時の値（success===true のときのみ） */
  value?: T;
  /** 失敗時のフォールバック値（options.fallback で渡したもの） */
  fallback?: T;
  /** ユーザー向けの中立的な日本語メッセージ */
  userMessage?: string;
  /** プログラム的な分類（UI 分岐用） */
  reason?: AIFallbackReason;
  /** retry を再試行ボタンとして見せて意味があるか */
  retryable: boolean;
}

export interface WithAIFallbackOptions<T> {
  /** AI が落ちたときに代替として返す値（既存の静的解説など） */
  fallback?: T;
  /** Sentry / logger に流すタグ。route, component などを入れる想定 */
  tags?: Record<string, string>;
  /** observability コンテキスト */
  userId?: string;
}

/**
 * AI 呼び出しをラップし、失敗時に observability + フォールバック値返却を保証する。
 */
export async function withAIFallback<T>(
  operation: () => Promise<T>,
  options: WithAIFallbackOptions<T> = {},
): Promise<AIFallbackResult<T>> {
  try {
    const value = await operation();
    return { success: true, value, retryable: false };
  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err));
    const reason = classifyError(error);
    const userMessage = humanMessage(reason, error);
    const retryable = isRetryable(reason);

    // 観測: rate_limit は warning、それ以外は error として Sentry に送る
    reportError(error, {
      tags: { ...options.tags, ai_fallback: "true", reason },
      userId: options.userId,
      severity: reason === "rate_limit" ? "warning" : "error",
    });

    return {
      success: false,
      fallback: options.fallback,
      userMessage,
      reason,
      retryable,
    };
  }
}

/**
 * APIError / 通常 Error を AIFallbackReason に分類する。
 */
export function classifyError(err: Error): AIFallbackReason {
  if (err instanceof APIError) {
    switch (err.type) {
      case APIErrorType.AI_USAGE_LIMIT:
        return "rate_limit";
      case APIErrorType.NETWORK:
        return "network";
      case APIErrorType.TIMEOUT:
        return "timeout";
      case APIErrorType.AUTHENTICATION:
      case APIErrorType.AUTHORIZATION:
        return "auth";
      case APIErrorType.SERVER:
        return "server";
      case APIErrorType.VALIDATION:
      case APIErrorType.UNKNOWN:
      default:
        return "unknown";
    }
  }

  // メッセージ文字列ベースのヒューリスティック
  const msg = err.message || "";
  if (/network|fetch failed|失敗.*ネットワーク|オフライン/i.test(msg)) {
    return "network";
  }
  if (/timeout|タイムアウト/i.test(msg)) {
    return "timeout";
  }
  if (/ログイン|認証|unauthorized|forbidden/i.test(msg)) {
    return "auth";
  }
  return "unknown";
}

function isRetryable(reason: AIFallbackReason): boolean {
  return reason === "network" || reason === "timeout" || reason === "server";
}

/**
 * ユーザー向けの日本語メッセージ。
 * 「サービス側が悪い」と取られないよう中立に。具体的に何ができるかを必ず示す。
 */
function humanMessage(reason: AIFallbackReason, err: Error): string {
  switch (reason) {
    case "rate_limit":
      return "今月のAI機能利用回数の上限に達しました。プランをアップグレードいただくか、来月のリセットまでお待ちください。";
    case "network":
      return "ネットワーク接続をご確認ください。AI による詳細解説の代わりに、基本解説を表示しています。";
    case "timeout":
      return "AI の応答に時間がかかっています。基本解説を表示しています。もう一度お試しいただくこともできます。";
    case "auth":
      return "再度ログインが必要です。ページを再読み込みしてください。";
    case "server":
      return "AI サービスが一時的に混雑しています。基本解説を表示しています。少し時間をおいてからもう一度お試しください。";
    case "unknown":
    default:
      return getUserFriendlyErrorMessage(err);
  }
}
