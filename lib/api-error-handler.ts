import { logger } from "./logger";

/**
 * APIエラーの種類
 */
export enum APIErrorType {
  NETWORK = "network",
  AUTHENTICATION = "authentication",
  AUTHORIZATION = "authorization",
  VALIDATION = "validation",
  SERVER = "server",
  TIMEOUT = "timeout",
  UNKNOWN = "unknown",
}

/**
 * APIエラークラス
 */
export class APIError extends Error {
  public readonly type: APIErrorType;
  public readonly statusCode?: number;
  public readonly retryable: boolean;

  constructor(
    message: string,
    type: APIErrorType = APIErrorType.UNKNOWN,
    statusCode?: number,
    retryable = false
  ) {
    super(message);
    this.name = "APIError";
    this.type = type;
    this.statusCode = statusCode;
    this.retryable = retryable;
  }
}

/**
 * APIリクエストのリトライ設定
 */
interface RetryOptions {
  maxRetries: number;
  retryDelay: number;
  retryableStatusCodes: number[];
}

const DEFAULT_RETRY_OPTIONS: RetryOptions = {
  maxRetries: 3,
  retryDelay: 1000,
  retryableStatusCodes: [408, 429, 500, 502, 503, 504],
};

/**
 * レスポンスからエラーを解析
 */
export function parseAPIError(response: Response, responseData?: any): APIError {
  const statusCode = response.status;
  const errorMessage = responseData?.error || responseData?.message || response.statusText;

  switch (statusCode) {
    case 400:
      return new APIError(
        errorMessage || "リクエストが正しくありません",
        APIErrorType.VALIDATION,
        statusCode,
        false
      );
    case 401:
      return new APIError(
        "ログインが必要です。ページを再読み込みしてください。",
        APIErrorType.AUTHENTICATION,
        statusCode,
        false
      );
    case 403:
      return new APIError(
        "この機能を利用する権限がありません",
        APIErrorType.AUTHORIZATION,
        statusCode,
        false
      );
    case 404:
      return new APIError(
        "要求されたリソースが見つかりません",
        APIErrorType.VALIDATION,
        statusCode,
        false
      );
    case 408:
      return new APIError(
        "リクエストがタイムアウトしました。もう一度お試しください。",
        APIErrorType.TIMEOUT,
        statusCode,
        true
      );
    case 429:
      return new APIError(
        "リクエストが多すぎます。しばらく待ってから再試行してください。",
        APIErrorType.SERVER,
        statusCode,
        true
      );
    case 500:
    case 502:
    case 503:
    case 504:
      return new APIError(
        "サーバーエラーが発生しました。しばらく待ってから再試行してください。",
        APIErrorType.SERVER,
        statusCode,
        true
      );
    default:
      return new APIError(
        errorMessage || "エラーが発生しました",
        APIErrorType.UNKNOWN,
        statusCode,
        statusCode >= 500
      );
  }
}

/**
 * ネットワークエラーを解析
 */
export function parseNetworkError(error: Error): APIError {
  if (error.message.includes("fetch") || error.message.includes("network")) {
    return new APIError(
      "ネットワーク接続に失敗しました。インターネット接続を確認してください。",
      APIErrorType.NETWORK,
      undefined,
      true
    );
  }

  if (error.message.includes("timeout") || error.message.includes("タイムアウト")) {
    return new APIError(
      "リクエストがタイムアウトしました。もう一度お試しください。",
      APIErrorType.TIMEOUT,
      undefined,
      true
    );
  }

  return new APIError(
    error.message || "エラーが発生しました",
    APIErrorType.UNKNOWN,
    undefined,
    false
  );
}

/**
 * リトライ付きfetch
 */
export async function fetchWithRetry(
  url: string,
  options: RequestInit = {},
  retryOptions: Partial<RetryOptions> = {}
): Promise<Response> {
  const finalRetryOptions = { ...DEFAULT_RETRY_OPTIONS, ...retryOptions };
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= finalRetryOptions.maxRetries; attempt++) {
    try {
      const response = await fetch(url, options);

      // リトライ可能なステータスコードの場合
      if (
        attempt < finalRetryOptions.maxRetries &&
        finalRetryOptions.retryableStatusCodes.includes(response.status)
      ) {
        logger.debug("APIリトライ", {
          url,
          attempt: attempt + 1,
          maxRetries: finalRetryOptions.maxRetries,
          statusCode: response.status,
        });

        // リトライ前に待機
        await new Promise((resolve) => setTimeout(resolve, finalRetryOptions.retryDelay * (attempt + 1)));
        continue;
      }

      return response;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      // ネットワークエラーの場合、リトライ
      if (attempt < finalRetryOptions.maxRetries) {
        logger.debug("ネットワークエラー、リトライします", {
          url,
          attempt: attempt + 1,
          maxRetries: finalRetryOptions.maxRetries,
          error: lastError.message,
        });

        // リトライ前に待機
        await new Promise((resolve) => setTimeout(resolve, finalRetryOptions.retryDelay * (attempt + 1)));
        continue;
      }

      // 最大リトライ回数に達した場合
      throw parseNetworkError(lastError);
    }
  }

  // すべてのリトライが失敗した場合
  throw lastError || new APIError("リクエストに失敗しました", APIErrorType.UNKNOWN);
}

/**
 * ユーザーフレンドリーなエラーメッセージを取得
 */
export function getUserFriendlyErrorMessage(error: Error | APIError): string {
  if (error instanceof APIError) {
    return error.message;
  }

  // 一般的なエラーメッセージ
  if (error.message.includes("fetch") || error.message.includes("network")) {
    return "ネットワーク接続に失敗しました。インターネット接続を確認してください。";
  }

  if (error.message.includes("timeout") || error.message.includes("タイムアウト")) {
    return "リクエストがタイムアウトしました。もう一度お試しください。";
  }

  if (error.message.includes("Firebase") && error.message.includes("No Firebase App")) {
    return "アプリの初期化に失敗しました。ページを再読み込みしてください。";
  }

  if (error.message.includes("認証") || error.message.includes("ログイン")) {
    return "ログインが必要です。ページを再読み込みしてログインしてください。";
  }

  return error.message || "エラーが発生しました。しばらく待ってから再試行してください。";
}
