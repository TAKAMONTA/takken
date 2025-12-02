#!/usr/bin/env ts-node
/**
 * 環境変数チェックスクリプト
 */

// 環境変数を明示的に読み込み
import * as dotenv from "dotenv";
import * as path from "path";
import { formatApiKeyStatus } from "../utils/security";
import { validateEnvironment } from "../../lib/env-validator";
const logger = require('../utils/logger');

// .env.local ファイルを明示的に読み込み
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

logger.header("環境変数チェック");

logger.info("Node環境", {
  NODE_ENV: process.env.NODE_ENV || "undefined",
  PWD: process.cwd(),
});

logger.info("AI API キー", {
  OPENAI_API_KEY: formatApiKeyStatus(process.env.OPENAI_API_KEY, {
    showPartial: true, // 開発環境のみ末尾4文字を表示
  }),
  ANTHROPIC_API_KEY: formatApiKeyStatus(process.env.ANTHROPIC_API_KEY),
  GOOGLE_AI_API_KEY: formatApiKeyStatus(process.env.GOOGLE_AI_API_KEY),
});

logger.info("Firebase", {
  NEXT_PUBLIC_FIREBASE_API_KEY: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ? "設定済み" : "未設定",
});

// 環境変数の検証
try {
  validateEnvironment();
  logger.success("環境変数の検証が完了しました");
} catch (error: unknown) {
  const message = error instanceof Error ? error.message : String(error);
  logger.error("環境変数の検証に失敗しました", error instanceof Error ? error : new Error(message), {
    errorMessage: message,
  });
  process.exit(1);
}

// AI設定の検証
import {
  getConfiguredAIProviders,
  getPrimaryAIProvider,
} from "../../lib/ai-config";

const providers = getConfiguredAIProviders();
const primary = getPrimaryAIProvider();

logger.info("AI プロバイダー設定", {
  providers: providers.map(p => ({
    name: p.name,
    configured: p.isConfigured,
  })),
  primary: primary ? primary.name : null,
});

providers.forEach((p) => {
  logger.info(`  ${p.name}: ${p.isConfigured ? "設定済み" : "未設定"}`, {
    provider: p.name,
    configured: p.isConfigured,
  });
});

if (primary) {
  logger.success(`プライマリプロバイダー: ${primary.name}`, { provider: primary.name });
} else {
  logger.warn("プライマリプロバイダー: なし", {
    suggestion: "AI プロバイダーが設定されていません",
  });
}

if (!primary) {
  logger.error("AI プロバイダーが設定されていません", undefined, {
    solution: [
      "1. .env.local ファイルに以下を追加:",
      "   OPENAI_API_KEY=sk-your-api-key-here",
      "2. OpenAI API キーの取得:",
      "   https://platform.openai.com/api-keys",
    ],
  });
  process.exit(1);
} else {
  logger.success("AI 問題生成の準備完了！");
}

