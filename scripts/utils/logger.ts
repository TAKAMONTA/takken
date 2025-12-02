/**
 * スクリプト用ロガーユーティリティ（TypeScript版）
 * Node.jsスクリプト専用の独立したロガー実装
 * lib/logger.tsへの依存を排除し、実行時の安定性を確保
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogMetadata {
  [key: string]: unknown;
}

function getTimestamp(): string {
  return new Date().toISOString();
}

function formatLog(level: LogLevel, message: string, metadata?: LogMetadata): string {
  const timestamp = getTimestamp();
  // 機密情報の簡易的なマスキング
  const sanitizedMeta = metadata ? sanitizeMetadata(metadata) : undefined;
  const metaStr = sanitizedMeta ? ` ${JSON.stringify(sanitizedMeta)}` : '';

  return `[${timestamp}] [${level.toUpperCase()}] ${message}${metaStr}`;
}

function sanitizeMetadata(metadata: LogMetadata): LogMetadata {
  const sanitized: LogMetadata = {};
  const sensitiveKeys = ['key', 'token', 'secret', 'password', 'auth'];

  for (const [key, value] of Object.entries(metadata)) {
    const lowerKey = key.toLowerCase();
    if (sensitiveKeys.some(k => lowerKey.includes(k))) {
      sanitized[key] = '***REDACTED***';
    } else {
      sanitized[key] = value;
    }
  }
  return sanitized;
}

export const logger = {
  debug(message: string, metadata?: LogMetadata): void {
    console.debug(formatLog('debug', message, metadata));
  },

  info(message: string, metadata?: LogMetadata): void {
    console.info(formatLog('info', message, metadata));
  },

  warn(message: string, metadata?: LogMetadata): void {
    console.warn(formatLog('warn', message, metadata));
  },

  error(message: string, error?: Error | unknown, metadata?: LogMetadata): void {
    const errorMetadata: LogMetadata = {
      ...metadata,
      ...(error instanceof Error ? {
        name: error.name,
        message: error.message,
        stack: error.stack,
      } : { error }),
    };
    console.error(formatLog('error', message, errorMetadata));
  },

  success(message: string, metadata?: LogMetadata): void {
    console.log(formatLog('info', `✅ ${message}`, metadata));
  },

  start(message: string, metadata?: LogMetadata): void {
    console.log(formatLog('info', `🚀 ${message}`, metadata));
  },

  header(title: string, metadata?: LogMetadata): void {
    const separator = '='.repeat(70);
    console.log(`\n${separator}\n${title}\n${separator}\n`);
  },
};

