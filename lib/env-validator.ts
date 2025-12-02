/**
 * 環境変数のバリデーション
 *
 * ビルド時に必須の環境変数が設定されているかチェックし、
 * 設定不足の場合は明確なエラーメッセージを表示します。
 */

import { logger } from './logger';

interface EnvConfig {
  key: string;
  description: string;
  required: boolean;
  minLength?: number;
}

/**
 * 必須の環境変数リスト
 */
const ENV_CONFIGS: EnvConfig[] = [
  // Firebase設定（必須）
  {
    key: 'NEXT_PUBLIC_FIREBASE_API_KEY',
    description: 'Firebase APIキー',
    required: true,
  },
  {
    key: 'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
    description: 'Firebase Auth Domain',
    required: true,
  },
  {
    key: 'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
    description: 'Firebase Project ID',
    required: true,
  },
  {
    key: 'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET',
    description: 'Firebase Storage Bucket',
    required: true,
  },
  {
    key: 'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
    description: 'Firebase Messaging Sender ID',
    required: true,
  },
  {
    key: 'NEXT_PUBLIC_FIREBASE_APP_ID',
    description: 'Firebase App ID',
    required: true,
  },
  {
    key: 'NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID',
    description: 'Firebase Measurement ID',
    required: true,
  },

  // 暗号化キー（必須、32文字以上）
  {
    key: 'NEXT_PUBLIC_ENCRYPTION_KEY',
    description: '暗号化キー（32文字以上）',
    required: true,
    minLength: 32,
  },

  // AI APIキー（いずれか1つ必須）
  {
    key: 'OPENAI_API_KEY',
    description: 'OpenAI APIキー',
    required: false,
  },
  {
    key: 'ANTHROPIC_API_KEY',
    description: 'Anthropic APIキー',
    required: false,
  },
  {
    key: 'GOOGLE_AI_API_KEY',
    description: 'Google AI APIキー',
    required: false,
  },

  // iOS In-App Purchase設定（オプション）
  {
    key: 'APPLE_SHARED_SECRET',
    description: 'Apple App Store Connect Shared Secret',
    required: false,
  },
  {
    key: 'NEXT_PUBLIC_APPLE_APP_ID',
    description: 'Apple App ID',
    required: false,
  },
];

/**
 * 環境変数の検証エラー
 */
class EnvValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'EnvValidationError';
  }
}

/**
 * 個別の環境変数を検証する
 */
function validateEnvVar(config: EnvConfig): string | null {
  const value = process.env[config.key];

  // 必須チェック
  if (config.required && !value) {
    return `❌ ${config.key} が設定されていません（${config.description}）`;
  }

  // 最小長チェック
  if (value && config.minLength && value.length < config.minLength) {
    return `❌ ${config.key} は${config.minLength}文字以上必要です（現在: ${value.length}文字）`;
  }

  // 設定済みの場合
  if (value) {
    return null; // エラーなし
  }

  // オプションで未設定の場合
  return null;
}

/**
 * すべての環境変数を検証する
 */
export function validateEnvironment(): void {
  const errors: string[] = [];
  const warnings: string[] = [];

  // 各環境変数をチェック
  for (const config of ENV_CONFIGS) {
    const error = validateEnvVar(config);
    if (error) {
      errors.push(error);
    }
  }

  // AI APIキーのチェック（いずれか1つ必要）
  const hasAnyAIKey =
    process.env.OPENAI_API_KEY ||
    process.env.ANTHROPIC_API_KEY ||
    process.env.GOOGLE_AI_API_KEY;

  if (!hasAnyAIKey) {
    warnings.push(
      '⚠️  AI APIキーが設定されていません。AI機能を使用する場合は、' +
      'OPENAI_API_KEY、ANTHROPIC_API_KEY、GOOGLE_AI_API_KEYのいずれかを設定してください。'
    );
  }

  // エラーがある場合は例外を投げる
  if (errors.length > 0) {
    const errorMessage = [
      '',
      '🔴 環境変数の設定エラーが見つかりました:',
      '',
      ...errors,
      '',
      '📝 対処方法:',
      '1. .env.localファイルを作成してください',
      '2. .env.exampleを参考に、必要な環境変数を設定してください',
      '3. 設定後、開発サーバーを再起動してください',
      '',
    ].join('\n');

    throw new EnvValidationError(errorMessage);
  }

  // 警告がある場合は表示
  if (warnings.length > 0 && process.env.NODE_ENV === 'development') {
    logger.warn('環境変数の警告', { warnings });
  }

  // 成功メッセージ（開発環境のみ）
  if (process.env.NODE_ENV === 'development') {
    logger.info('環境変数の検証が完了しました');
  }
}

/**
 * 環境変数の一覧を表示する（開発環境のみ）
 */
export function displayEnvironmentStatus(): void {
  if (process.env.NODE_ENV !== 'development') {
    return;
  }

  logger.debug('環境変数の設定状況を表示中');

  const statusList: Array<{ status: string; key: string; required: string }> = [];
  for (const config of ENV_CONFIGS) {
    const value = process.env[config.key];
    const status = value ? '✅ 設定済み' : '❌ 未設定';
    const required = config.required ? '（必須）' : '（オプション）';
    statusList.push({ status, key: config.key, required });
  }
  
  logger.debug('環境変数設定状況', { statusList });
}
