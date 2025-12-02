/**
 * セキュリティユーティリティ（TypeScript版）
 * 機密情報のマスキングとセキュアな表示機能
 */

const IS_DEVELOPMENT = process.env.NODE_ENV !== 'production';

interface MaskSecretOptions {
  showTail?: boolean;
  tailLength?: number;
  forceMask?: boolean;
}

/**
 * APIキーやシークレットを安全にマスクする
 */
export function maskSecret(value: string | undefined, options: MaskSecretOptions = {}): string {
  if (!value || typeof value !== 'string') {
    return '***REDACTED***';
  }

  const {
    showTail = false,
    tailLength = 4,
    forceMask = false,
  } = options;

  // 強制マスクまたは本番環境では完全にマスク
  if (forceMask || !IS_DEVELOPMENT) {
    return '***REDACTED***';
  }

  // 開発環境で末尾表示が許可されている場合
  if (showTail && IS_DEVELOPMENT) {
    if (value.length <= tailLength) {
      return '***REDACTED***';
    }
    return `***${value.slice(-tailLength)}`;
  }

  return '***REDACTED***';
}

/**
 * APIキーのステータス表示用フォーマット
 */
export function formatApiKeyStatus(
  key: string | undefined,
  options: { showPartial?: boolean } = {}
): string {
  if (!key) {
    return '❌ 未設定';
  }

  const { showPartial = false } = options;

  if (showPartial && IS_DEVELOPMENT) {
    if (key.length <= 4) {
      return '✅ 設定済み (***REDACTED***)';
    }
    return `✅ 設定済み (***${key.slice(-4)})`;
  }

  return '✅ 設定済み (***REDACTED***)';
}

/**
 * 機密情報を含む可能性のある文字列を検出してマスクする
 */
export function sanitizeString(str: string): string {
  if (!str || typeof str !== 'string') {
    return str;
  }

  const sensitivePatterns = [
    /(api[_-]?key\s*[=:]\s*)([^\s,;'"`]+)/gi,
    /(password\s*[=:]\s*)([^\s,;'"`]+)/gi,
    /(secret\s*[=:]\s*)([^\s,;'"`]+)/gi,
    /(token\s*[=:]\s*)([^\s,;'"`]+)/gi,
    /(auth\s*[=:]\s*)([^\s,;'"`]+)/gi,
  ];

  let sanitized = str;
  sensitivePatterns.forEach(pattern => {
    sanitized = sanitized.replace(pattern, (match, prefix, value) => {
      return prefix + maskSecret(value, { forceMask: true });
    });
  });

  return sanitized;
}

/**
 * オブジェクト内の機密情報を再帰的にマスクする
 */
export function sanitizeObject(obj: unknown): unknown {
  if (!obj || typeof obj !== 'object') {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeObject(item));
  }

  const sanitized: Record<string, unknown> = {};
  const sensitiveKeys = ['apiKey', 'api_key', 'password', 'secret', 'token', 'auth'];

  for (const [key, value] of Object.entries(obj)) {
    const lowerKey = key.toLowerCase();
    const isSensitive = sensitiveKeys.some(sk => lowerKey.includes(sk));

    if (isSensitive && typeof value === 'string') {
      sanitized[key] = maskSecret(value, { forceMask: true });
    } else if (typeof value === 'object') {
      sanitized[key] = sanitizeObject(value);
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized;
}

