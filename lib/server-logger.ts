type LogLevel = "debug" | "info" | "warn" | "error";

interface LogMetadata {
  [key: string]: unknown;
}

const sensitiveKeyFragments = [
  "password",
  "token",
  "apikey",
  "api_key",
  "apiKey",
  "secret",
  "authorization",
  "private_key",
  "client_email",
  "firebase_service_account",
  "stripe_secret",
  "webhook_secret",
];

function shouldLog(level: LogLevel): boolean {
  return !(process.env.NODE_ENV === "production" && (level === "debug" || level === "info"));
}

function sanitizeMetadata(metadata?: LogMetadata): LogMetadata {
  if (!metadata) return {};

  return Object.fromEntries(
    Object.entries(metadata).map(([key, value]) => {
      const lowerKey = key.toLowerCase();
      const isSensitive = sensitiveKeyFragments.some((fragment) =>
        lowerKey.includes(fragment.toLowerCase())
      );

      if (isSensitive) {
        return [key, "***REDACTED***"];
      }

      if (value instanceof Error) {
        return [
          key,
          {
            name: value.name,
            message: value.message,
            stack: value.stack,
          },
        ];
      }

      return [key, value];
    })
  );
}

function formatLog(level: LogLevel, message: string, metadata?: LogMetadata): string {
  const sanitized = sanitizeMetadata(metadata);
  const suffix = Object.keys(sanitized).length > 0 ? ` ${JSON.stringify(sanitized)}` : "";
  return `[${new Date().toISOString()}] [${level.toUpperCase()}] ${message}${suffix}`;
}

export const logger = {
  debug(message: string, metadata?: LogMetadata): void {
    if (shouldLog("debug")) {
      console.debug(formatLog("debug", message, metadata));
    }
  },

  info(message: string, metadata?: LogMetadata): void {
    if (shouldLog("info")) {
      console.info(formatLog("info", message, metadata));
    }
  },

  warn(message: string, metadata?: LogMetadata): void {
    if (shouldLog("warn")) {
      console.warn(formatLog("warn", message, metadata));
    }
  },

  error(message: string, error?: Error | unknown, metadata?: LogMetadata): void {
    if (!shouldLog("error")) return;

    const errorMetadata: LogMetadata = {
      ...metadata,
      ...(error instanceof Error
        ? {
            errorName: error.name,
            errorMessage: error.message,
            errorStack: error.stack,
          }
        : error
          ? { error: String(error) }
          : {}),
    };

    console.error(formatLog("error", message, errorMetadata));
  },
};
