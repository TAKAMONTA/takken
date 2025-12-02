# Takken RPG (宅建RPG)

宅建試験対策のためのRPG風学習アプリケーションです。

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

### 問題データの生成

AIを使用して問題データを生成します。

```bash
# 全カテゴリの問題を一括生成
npm run generate:all

# 個別の生成スクリプト実行（例：宅建業法）
npx ts-node scripts/generate/generate-takkengyouhou-50.ts
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
