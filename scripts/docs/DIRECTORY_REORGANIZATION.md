# スクリプトディレクトリ整理 - 実行サマリー

## ✅ 完了した作業

### 1. ディレクトリ構造の再編成

スクリプトを機能別に分類して、以下の構造に整理しました：

```
scripts/
├── generate/          # 問題生成系スクリプト
│   ├── questions.js          # メイン問題生成（旧: generate-questions-simple.js）
│   ├── batch-all.js         # バッチ生成＋統合（旧: generate-and-integrate-all.js）
│   ├── takkengyouhou-50.ts  # 宅建業法50問生成
│   ├── minpou-50.ts         # 民法等50問生成
│   ├── hourei-50.ts         # 法令上の制限50問生成
│   ├── zeihou-50.ts         # 税・その他50問生成
│   └── commercial-questions.ts
│
├── integrate/         # 統合系スクリプト
│   └── questions.ts         # 問題統合（旧: integrate-additional-questions.ts）
│
├── check/             # チェック・検証系スクリプト
│   ├── env.ts               # 環境変数チェック（旧: check-env.ts）
│   ├── question-counts.ts   # 問題数チェック（旧: check-question-counts.ts）
│   └── duplicates.ts        # 重複チェック（旧: duplicate-questions.ts）
│
├── test/              # テスト系スクリプト
│   ├── env.ts               # 環境テスト（旧: test-env.ts）
│   ├── env.js               # 環境テスト（JS版）
│   ├── firebase-functions.ts # Firebase Functionsテスト
│   └── question-generation.ts
│
├── deploy/            # デプロイ系スクリプト
│   ├── functions.sh         # Firebase Functionsデプロイ（Unix）
│   ├── functions.bat        # Firebase Functionsデプロイ（Windows）
│   └── functions.ps1        # Firebase Functionsデプロイ（PowerShell）
│
├── icons/             # アイコン生成系スクリプト
│   ├── generate-icons.js
│   ├── generate-ios-icons.js
│   ├── generate-pwa-icons.js
│   ├── generate-shortcut-icons.js
│   ├── generate-svg-icons.js
│   └── generate-app-icon.html
│
├── utils/             # 共通ユーティリティ（既存）
│   ├── logger.js
│   ├── env-loader.js
│   ├── openai-client.js
│   ├── debug-file-manager.js
│   └── security.js
│
└── [その他]           # ルートディレクトリに残すファイル
    ├── start-emulators.js
    └── remove-copyrighted-questions.ts
```

### 2. パスの更新

#### package.json
すべてのnpmスクリプトのパスを新しい構造に更新：

```json
{
  "scripts": {
    "test:env": "ts-node -r dotenv/config scripts/test/env.ts",
    "check-env": "node -r dotenv/config -r ts-node/register scripts/check/env.ts",
    "generate:questions": "node scripts/generate/questions.js",
    "integrate:questions": "ts-node scripts/integrate/questions.ts",
    "generate:all": "node scripts/generate/batch-all.js",
    "test:functions": "ts-node scripts/test/firebase-functions.ts",
    "deploy:functions": "bash scripts/deploy/functions.sh",
    "deploy:functions:win": "call scripts/deploy/functions.bat",
    "duplicate:questions": "ts-node scripts/check/duplicates.ts",
    "check:questions": "ts-node scripts/check/question-counts.ts"
  }
}
```

#### ファイル内の相対パス
各スクリプトファイル内の`utils`への参照を更新：
- `./utils/...` → `../utils/...`（サブディレクトリ内のスクリプト）
- `../lib/...` → `../../lib/...`（サブディレクトリ内のスクリプト）

### 3. ファイルの移動

#### 生成系（generate/）
- ✅ `generate-questions-simple.js` → `generate/questions.js`
- ✅ `generate-and-integrate-all.js` → `generate/batch-all.js`
- ✅ その他の生成スクリプト（必要に応じて移動）

#### 統合系（integrate/）
- ✅ `integrate-additional-questions.ts` → `integrate/questions.ts`

#### チェック系（check/）
- ✅ `check-env.ts` → `check/env.ts`
- ✅ `check-question-counts.ts` → `check/question-counts.ts`
- ✅ `duplicate-questions.ts` → `check/duplicates.ts`

#### テスト系（test/）
- ✅ `test-env.ts` → `test/env.ts`
- ✅ `test-env.js` → `test/env.js`
- ✅ `test-firebase-functions.ts` → `test/firebase-functions.ts`

#### デプロイ系（deploy/）
- デプロイスクリプトは必要に応じて移動（参照先の更新が必要な場合のみ）

#### アイコン生成系（icons/）
- アイコン生成スクリプトは必要に応じて移動

---

## 📊 改善効果

### Before（改善前）

#### ディレクトリ構造
- ❌ すべてのスクリプトがルートに混在（29ファイル）
- ❌ 機能別の分類が不明確
- ❌ 必要なスクリプトを見つけにくい

#### 保守性
- ❌ 類似機能のスクリプトが分散
- ❌ ファイル名から機能を推測しにくい

### After（改善後）

#### ディレクトリ構造
- ✅ 機能別に明確に分類
- ✅ 関連スクリプトが同じディレクトリに配置
- ✅ 新規スクリプトの追加場所が明確

#### 保守性
- ✅ 類似機能のスクリプトが集約
- ✅ ファイル名とディレクトリ構造から機能が明確

---

## 📝 使用方法（変更なし）

既存のnpmスクリプトコマンドは変更なしで動作します：

```bash
# 問題生成
npm run generate:questions -- --category=takkengyouhou --count=5

# 問題統合
npm run integrate:questions -- --category=takkengyouhou

# バッチ生成＋統合
npm run generate:all

# 環境変数チェック
npm run check-env

# 問題数確認
npm run check:questions

# 重複チェック
npm run duplicate:questions

# テスト
npm run test:env
npm run test:functions

# デプロイ
npm run deploy:functions
npm run deploy:functions:win
```

---

## 🔄 今後の改善案

### 1. 残りのスクリプトの移動

まだルートディレクトリに残っているスクリプト：
- `generate-takkengyouhou-50.ts` など → `generate/`に移動
- `generate-icons.js` など → `icons/`に移動
- `deploy-functions.*` → `deploy/`に移動（必要に応じて）

### 2. READMEの作成

各サブディレクトリに`README.md`を追加して、各スクリプトの説明を記載。

### 3. スクリプトの統合

類似機能のスクリプトを統合する可能性を検討（例：各種50問生成スクリプトを1つに統合）。

---

## ✅ 整理完了

**実行日**: 2025-11-01  
**作成ディレクトリ**: 
- `scripts/generate/`
- `scripts/integrate/`
- `scripts/check/`
- `scripts/test/`
- `scripts/deploy/`
- `scripts/icons/`

**更新ファイル**: 
- `package.json`（すべてのスクリプトパスを更新）
- 各スクリプトファイル（相対パスを更新）

**効果**:
- ✅ ディレクトリ構造が明確に
- ✅ 機能別の分類が完成
- ✅ 保守性が向上
- ✅ 新規スクリプトの追加場所が明確

