/**
 * CommonJS logger for Node scripts.
 *
 * Exports both the logger object itself and a named `logger` property so old
 * `const logger = require(...)` scripts and TS `import { logger }` scripts both
 * resolve to the same API at runtime.
 */

function getTimestamp() {
  return new Date().toISOString();
}

function sanitizeMetadata(metadata) {
  if (!metadata || typeof metadata !== "object") {
    return {};
  }

  const sanitized = {};
  const sensitiveKeys = ["key", "token", "secret", "password", "auth"];

  for (const [key, value] of Object.entries(metadata)) {
    const lowerKey = key.toLowerCase();
    if (sensitiveKeys.some((sensitive) => lowerKey.includes(sensitive))) {
      sanitized[key] = "***REDACTED***";
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized;
}

function formatLog(level, message, metadata) {
  const sanitized = sanitizeMetadata(metadata);
  const metaStr = Object.keys(sanitized).length > 0
    ? ` ${JSON.stringify(sanitized)}`
    : "";

  return `[${getTimestamp()}] [${level.toUpperCase()}] ${message}${metaStr}`;
}

const logger = {
  debug(message, metadata) {
    console.debug(formatLog("debug", message, metadata));
  },

  info(message, metadata) {
    console.info(formatLog("info", message, metadata));
  },

  warn(message, metadata) {
    console.warn(formatLog("warn", message, metadata));
  },

  error(message, error, metadata) {
    const errorMetadata = {
      ...metadata,
      ...(error instanceof Error
        ? {
            name: error.name,
            message: error.message,
            stack: error.stack,
          }
        : error
          ? { error }
          : {}),
    };
    console.error(formatLog("error", message, errorMetadata));
  },

  success(message, metadata) {
    console.log(formatLog("info", `SUCCESS: ${message}`, metadata));
  },

  start(message, metadata) {
    console.log(formatLog("info", `START: ${message}`, metadata));
  },

  header(title) {
    const separator = "=".repeat(70);
    console.log(`\n${separator}\n${title}\n${separator}\n`);
  },
};

module.exports = logger;
module.exports.logger = logger;
