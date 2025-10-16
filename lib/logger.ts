/**
 * 構造化ログサービス
 *
 * 開発環境ではコンソールに出力し、本番環境では適切なログサービスに送信します。
 * 機密情報の露出を防ぎ、デバッグ情報を適切に管理します。
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogMetadata {
  [key: string]: unknown;
}

/**
 * ログレベルを判定する
 */
function shouldLog(level: LogLevel): boolean {
  const isDevelopment = process.env.NODE_ENV === 'development';
  const isProduction = process.env.NODE_ENV === 'production';

  // 本番環境ではdebug, infoログを抑制
  if (isProduction && (level === 'debug' || level === 'info')) {
    return false;
  }

  return true;
}

/**
 * メタデータから機密情報を除外する
 */
function sanitizeMetadata(metadata?: LogMetadata): LogMetadata {
  if (!metadata) return {};

  const sanitized: LogMetadata = {};
  const sensitiveKeys = ['password', 'token', 'apiKey', 'secret', 'key'];

  for (const [key, value] of Object.entries(metadata)) {
    const lowerKey = key.toLowerCase();
    const isSensitive = sensitiveKeys.some(sensitive => lowerKey.includes(sensitive));

    if (isSensitive) {
      sanitized[key] = '***REDACTED***';
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized;
}

/**
 * ログをフォーマットする
 */
function formatLog(level: LogLevel, message: string, metadata?: LogMetadata): string {
  const timestamp = new Date().toISOString();
  const sanitized = sanitizeMetadata(metadata);

  if (Object.keys(sanitized).length > 0) {
    return `[${timestamp}] [${level.toUpperCase()}] ${message} ${JSON.stringify(sanitized)}`;
  }

  return `[${timestamp}] [${level.toUpperCase()}] ${message}`;
}

/**
 * 本番環境でログを外部サービスに送信する
 * （将来的にSentry, LogRocket, Datadogなどに送信可能）
 */
function sendToLoggingService(level: LogLevel, message: string, metadata?: LogMetadata): void {
  // TODO: 本番環境でのログサービス統合
  // 例: Sentry.captureMessage(message, { level, extra: metadata });
}

/**
 * ロガーオブジェクト
 */
export const logger = {
  /**
   * デバッグログ（開発環境のみ）
   */
  debug(message: string, metadata?: LogMetadata): void {
    if (!shouldLog('debug')) return;

    if (process.env.NODE_ENV === 'development') {
      console.log(formatLog('debug', message, metadata));
    }
  },

  /**
   * 情報ログ
   */
  info(message: string, metadata?: LogMetadata): void {
    if (!shouldLog('info')) return;

    if (process.env.NODE_ENV === 'development') {
      console.log(formatLog('info', message, metadata));
    } else {
      sendToLoggingService('info', message, metadata);
    }
  },

  /**
   * 警告ログ
   */
  warn(message: string, metadata?: LogMetadata): void {
    if (!shouldLog('warn')) return;

    const formatted = formatLog('warn', message, metadata);

    if (process.env.NODE_ENV === 'development') {
      console.warn(formatted);
    } else {
      console.warn(formatted); // 本番環境でも警告は出力
      sendToLoggingService('warn', message, metadata);
    }
  },

  /**
   * エラーログ
   */
  error(message: string, error?: Error | unknown, metadata?: LogMetadata): void {
    if (!shouldLog('error')) return;

    const errorMetadata: LogMetadata = {
      ...metadata,
      ...(error instanceof Error && {
        errorName: error.name,
        errorMessage: error.message,
        errorStack: error.stack,
      }),
    };

    const formatted = formatLog('error', message, errorMetadata);

    console.error(formatted);

    if (process.env.NODE_ENV === 'production') {
      sendToLoggingService('error', message, errorMetadata);
    }
  },

  /**
   * Firebase設定などの機密情報を含む可能性のあるログ
   * 開発環境でのみ詳細を出力し、本番環境では機密情報を隠す
   */
  config(message: string, config: Record<string, unknown>): void {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[CONFIG] ${message}`, config);
    } else {
      // 本番環境では設定の有無のみ確認
      const sanitizedConfig: Record<string, string> = {};
      for (const key of Object.keys(config)) {
        sanitizedConfig[key] = config[key] ? 'Set' : 'Not Set';
      }
      console.log(`[CONFIG] ${message}`, sanitizedConfig);
    }
  },
};

/**
 * パフォーマンス測定ユーティリティ
 */
export class PerformanceLogger {
  private startTime: number;
  private label: string;

  constructor(label: string) {
    this.label = label;
    this.startTime = performance.now();
  }

  end(metadata?: LogMetadata): void {
    const endTime = performance.now();
    const duration = endTime - this.startTime;

    logger.debug(`${this.label} completed`, {
      ...metadata,
      durationMs: duration.toFixed(2),
    });
  }
}

/**
 * パフォーマンス測定のヘルパー関数
 */
export function measurePerformance<T>(
  label: string,
  fn: () => T | Promise<T>
): T | Promise<T> {
  const perfLogger = new PerformanceLogger(label);

  const result = fn();

  if (result instanceof Promise) {
    return result.finally(() => perfLogger.end());
  }

  perfLogger.end();
  return result;
}
