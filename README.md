# 宅建合格ロード - AI予想問題アプリ

宅建試験対策のためのAI予想問題学習アプリケーションです。

## 特徴

- 🤖 **AI生成予想問題**: 過去問ではなく、AIが試験傾向を分析して生成した高品質な予想問題
- 📚 **豊富な問題数**: 各カテゴリ200-300問、合計800-1000問以上
- 🎯 **最新対応**: 最新の法改正や頻出トピックを反映
- 💡 **AI学習サポート**: わからない問題はAI先生が丁寧に解説
- 📊 **弱点分析**: あなたの苦手分野を自動分析して効率的に学習

## プロジェクト構造

```
takken/
├── app/                  # Next.js App Router
├── components/           # Reactコンポーネント
├── lib/                  # ユーティリティ、データ、型定義
│   ├── data/             # 問題データ
│   └── ...
├── public/               # 静的ファイル
├── scripts/              # 開発・運用スクリプト
│   ├── check/            # チェック用スクリプト
│   ├── deploy/           # デプロイ用スクリプト
│   ├── docs/             # スクリプト関連ドキュメント
│   ├── generate/         # データ生成スクリプト
│   ├── integrate/        # データ統合スクリプト
│   ├── test/             # テスト用スクリプト
│   └── utils/            # スクリプト共通ユーティリティ
├── functions/            # Firebase Functions
└── ...
```

## スクリプトの使用方法

### AI予想問題の生成

AIを使用して予想問題データを生成します。

```bash
# 全カテゴリの予想問題を一括生成（推奨）
npm run generate:prediction

# カテゴリ別に生成
npm run generate:prediction:takkengyouhou  # 宅建業法（約260問）
npm run generate:prediction:minpou         # 民法等（約300問）
npm run generate:prediction:hourei         # 法令上の制限（約220問）
npm run generate:prediction:zeihou         # 税・その他（約200問）
```

### デプロイ

Firebase Functionsへのデプロイを行います。

```bash
# Windows
npm run deploy:functions:win

# Mac/Linux
npm run deploy:functions
```

### テスト

```bash
# Functionsのテスト
npm run test:functions

# 問題生成のテスト
npx ts-node scripts/test/test-question-generation.ts
```

## 環境設定

`.env.local` ファイルに以下の環境変数を設定してください。

```
OPENAI_API_KEY=your_openai_api_key
NEXT_PUBLIC_GOOGLE_API_KEY=your_google_api_key
# ... その他の設定
```

## 開発ガイド

詳細な開発ガイドやスクリプトの仕様については `scripts/docs/` ディレクトリ内のドキュメントを参照してください。
