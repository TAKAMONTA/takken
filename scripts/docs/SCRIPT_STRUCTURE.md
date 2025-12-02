# スクリプトディレクトリ構成

`scripts/` ディレクトリは、プロジェクトの開発、運用、データ生成などを支援するスクリプト群を管理します。

## ディレクトリ構造

| ディレクトリ | 説明 | 主なファイル |
| --- | --- | --- |
| `check/` | 環境確認やデータ整合性チェック | `env.ts`, `question-counts.ts` |
| `deploy/` | デプロイ関連 | `deploy-functions.ps1`, `deploy-functions.sh` |
| `docs/` | スクリプト関連のドキュメント | `SCRIPT_STRUCTURE.md` (本ファイル) |
| `generate/` | データ生成（AI活用） | `generate-commercial-questions.ts`, `generate-icons.js` |
| `integrate/` | データ統合・加工 | `remove-copyrighted-questions.ts` |
| `test/` | テスト用スクリプト | `test-question-generation.ts` |
| `utils/` | 共通ユーティリティ | `logger.ts`, `openai-client.js` |

## 主要スクリプトの実行方法

### 問題生成

```bash
# 全カテゴリの問題を一括生成
npm run generate:all

# 個別の生成スクリプト実行
npx ts-node scripts/generate/generate-commercial-questions.ts
```

### デプロイ

```bash
# Firebase Functionsのデプロイ (Windows)
npm run deploy:functions:win

# Firebase Functionsのデプロイ (Mac/Linux)
npm run deploy:functions
```

### ユーティリティ

`scripts/utils/logger.ts` は、スクリプト実行時のログ出力を統一するためのロガーです。
`console.log` の代わりに `logger.info`, `logger.success`, `logger.error` などを使用してください。

## 開発者向けガイド

新しいスクリプトを追加する場合は、目的に応じて適切なサブディレクトリに配置してください。
また、共通機能は `scripts/utils/` に配置し、再利用性を高めてください。
