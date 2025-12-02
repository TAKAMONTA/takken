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
 * メタデータから機密情報を除外する（強化版）
 */
function sanitizeMetadata(metadata?: LogMetadata): LogMetadata {
  if (!metadata) return {};

  const sanitized: LogMetadata = {};
  const sensitiveKeys = [
    'password', 'token', 'apiKey', 'secret', 'key', 
    'auth', 'authorization', 'apikey', 'api_key',
    'firebase_api_key', 'openai_api_key', 'anthropic_api_key',
    'google_ai_api_key', 'encryption_key'
  ];

  // APIキーのパターンマッチング
  const apiKeyPatterns = [
    /^sk-[a-zA-Z0-9]{20,}$/i, // OpenAI API key format
    /^sk-ant-[a-zA-Z0-9-]+$/i, // Anthropic API key format
    /^AIza[a-zA-Z0-9_-]{35}$/i, // Google AI API key format
    /^[a-zA-Z0-9_-]{32,}$/i, // General API key format
  ];

  for (const [key, value] of Object.entries(metadata)) {
    const lowerKey = key.toLowerCase();
    const isSensitiveKey = sensitiveKeys.some(sensitive => lowerKey.includes(sensitive));

    if (isSensitiveKey) {
      sanitized[key] = '***REDACTED***';
    } else if (typeof value === 'string') {
      // 値がAPIキーのパターンに一致するかチェック
      const isApiKeyValue = apiKeyPatterns.some(pattern => pattern.test(value));
      if (isApiKeyValue) {
        sanitized[key] = '***REDACTED***';
      } else {
        sanitized[key] = value;
      }
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
 * Firebase Analyticsを使用してログイベントを記録
 */
async function sendToLoggingService(
  level: LogLevel,
  message: string,
  metadata?: LogMetadata
): Promise<void> {
  // クライアントサイドでのみ実行
  if (typeof window === 'undefined') {
    return;
  }

  // 本番環境でのみFirebase Analyticsに送信
  if (process.env.NODE_ENV === 'production') {
    try {
      // 動的インポートでFirebase Analyticsを読み込み
      const { logEvent } = await import('firebase/analytics');
      const { initializeFirebase } = await import('./firebase-client');
      
      // initializeFirebaseはPromiseまたはオブジェクトを返す可能性がある
      const firebaseInitResult = initializeFirebase();
      const firebaseInstance = firebaseInitResult instanceof Promise
        ? await firebaseInitResult
        : firebaseInitResult;
      
      const { analytics } = firebaseInstance;
      
      if (analytics) {
        // Firebase Analyticsのイベント名としてログレベルを含める
        const eventName = `log_${level}`;
        
        // メタデータを整理（機密情報は既に除外済み）
        const eventParams: Record<string, string | number> = {
          message: message ? message.substring(0, 100) : '', // 長いメッセージは切り詰め
          timestamp: Date.now(),
        };

        // メタデータを追加（Firebase Analyticsの制限に合わせて）
        if (metadata) {
          Object.entries(metadata).forEach(([key, value]) => {
            // Firebase Analyticsは文字列値のみをサポート
            const stringValue = value !== undefined && value !== null
              ? (typeof value === 'object' 
                  ? JSON.stringify(value).substring(0, 100)
                  : String(value).substring(0, 100))
              : '';
            eventParams[key] = stringValue;
          });
        }

        logEvent(analytics, eventName, eventParams);
      }
    } catch (error) {
      // ログ送信の失敗は静かに処理（無限ループを防ぐ）
      console.warn('Failed to send log to Firebase Analytics:', error);
    }
  }
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
      // 非同期で送信（エラーは無視）
      sendToLoggingService('info', message, metadata).catch(() => {
        // エラーは静かに無視
      });
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
      // 非同期で送信（エラーは静かに無視）
      sendToLoggingService('warn', message, metadata).catch(() => {
        // エラーは静かに無視
      });
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
      // 非同期で送信（エラーは静かに無視）
      sendToLoggingService('error', message, errorMetadata).catch(() => {
        // エラーは静かに無視
      });
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
