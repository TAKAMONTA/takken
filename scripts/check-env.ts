#!/usr/bin/env ts-node
/**
 * 環境変数チェックスクリプト
 */

// 環境変数を明示的に読み込み
import * as dotenv from "dotenv";
import * as path from "path";

// .env.local ファイルを明示的に読み込み
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

console.log("🔍 環境変数チェック\n");

console.log("Node環境:");
console.log(`  NODE_ENV: ${process.env.NODE_ENV || "undefined"}`);
console.log(`  PWD: ${process.cwd()}\n`);

console.log("AI API キー:");
console.log(
  `  OPENAI_API_KEY: ${
    process.env.OPENAI_API_KEY
      ? "✅ 設定済み (***" + process.env.OPENAI_API_KEY.slice(-4) + ")"
      : "❌ 未設定"
  }`
);
console.log(
  `  ANTHROPIC_API_KEY: ${
    process.env.ANTHROPIC_API_KEY ? "✅ 設定済み" : "❌ 未設定"
  }`
);
console.log(
  `  GOOGLE_AI_API_KEY: ${
    process.env.GOOGLE_AI_API_KEY ? "✅ 設定済み" : "❌ 未設定"
  }\n`
);

console.log("Firebase:");
console.log(
  `  NEXT_PUBLIC_FIREBASE_API_KEY: ${
    process.env.NEXT_PUBLIC_FIREBASE_API_KEY ? "✅ 設定済み" : "❌ 未設定"
  }\n`
);

// AI設定の検証
import {
  getConfiguredAIProviders,
  getPrimaryAIProvider,
} from "../lib/ai-config";

const providers = getConfiguredAIProviders();
const primary = getPrimaryAIProvider();

console.log("AI プロバイダー設定:");
providers.forEach((p) => {
  console.log(`  ${p.name}: ${p.isConfigured ? "✅ 設定済み" : "❌ 未設定"}`);
});

console.log(
  `\nプライマリプロバイダー: ${primary ? `✅ ${primary.name}` : "❌ なし"}`
);

if (!primary) {
  console.log("\n⚠️ エラー: AI プロバイダーが設定されていません");
  console.log("\n解決方法:");
  console.log("1. .env.local ファイルに以下を追加:");
  console.log("   OPENAI_API_KEY=sk-your-api-key-here");
  console.log("\n2. OpenAI API キーの取得:");
  console.log("   https://platform.openai.com/api-keys");
  process.exit(1);
} else {
  console.log("\n✅ AI 問題生成の準備完了！");
}
