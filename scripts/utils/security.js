/**
 * セキュリティユーティリティ
 * 機密情報のマスキングとセキュアな表示機能
 */

const IS_DEVELOPMENT = process.env.NODE_ENV !== 'production';

/**
 * APIキーやシークレットを安全にマスクする
 * 
 * @param {string} value - マスクする値
 * @param {object} options - オプション
 * @param {boolean} options.showTail - 末尾を表示するか（開発環境のみ）
 * @param {number} options.tailLength - 末尾の文字数（デフォルト: 4）
 * @param {boolean} options.forceMask - 強制的に完全マスク（開発環境でも非表示）
 * @returns {string} マスクされた値
 */
function maskSecret(value, options = {}) {
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
      return '***REDACTED***'; // 短すぎる場合は完全マスク
    }
    return `***${value.slice(-tailLength)}`;
  }

  // デフォルトは完全マスク
  return '***REDACTED***';
}

/**
 * APIキーのステータス表示用フォーマット
 * 設定済みかどうかのみ表示（値は非表示）
 * 
 * @param {string} key - 環境変数の値
 * @param {object} options - オプション
 * @returns {string} フォーマットされた表示文字列
 */
function formatApiKeyStatus(key, options = {}) {
  if (!key) {
    return '❌ 未設定';
  }

  const { showPartial = false } = options;

  if (showPartial && IS_DEVELOPMENT) {
    // 開発環境のみ、末尾4文字を表示
    if (key.length <= 4) {
      return '✅ 設定済み (***REDACTED***)';
    }
    return `✅ 設定済み (***${key.slice(-4)})`;
  }

  // デフォルトは設定済みのみ表示
  return '✅ 設定済み (***REDACTED***)';
}

/**
 * 機密情報を含む可能性のある文字列を検出してマスクする
 * 
 * @param {string} str - チェックする文字列
 * @returns {string} マスクされた文字列
 */
function sanitizeString(str) {
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
 * 
 * @param {object} obj - マスクするオブジェクト
 * @returns {object} マスクされたオブジェクト
 */
function sanitizeObject(obj) {
  if (!obj || typeof obj !== 'object') {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeObject(item));
  }

  const sanitized = {};
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

module.exports = {
  maskSecret,
  formatApiKeyStatus,
  sanitizeString,
  sanitizeObject,
};

