# スクリプトファイル整理計画

## 📊 現状分析

### 使用中スクリプト（削除不可）

1. **`generate-questions-simple.js`** ✅
   - package.json: `generate:questions`
   - 現在の主力問題生成スクリプト
   - JavaScript版（TypeScriptコンパイル不要）

2. **`generate-and-integrate-all.js`** ✅
   - package.json: `generate:all`
   - バッチ生成＋統合の自動化
   - JavaScript版

3. **`integrate-additional-questions.ts`** ✅
   - package.json: `integrate:questions`
   - 問題の統合処理

4. **`check-env.ts`** ✅
   - package.json: `check-env`
   - 環境変数チェック

5. **`check-question-counts.ts`** ✅
   - package.json: `check:questions`
   - 問題数チェック

6. **`duplicate-questions.ts`** ✅
   - package.json: `duplicate:questions`
   - 重複チェック

7. **`test-env.ts`** ✅
   - package.json: `test:env`
   - 環境テスト

8. **`test-firebase-functions.ts`** ✅
   - package.json: `test:functions`
   - Firebase Functionsテスト

9. **`start-emulators.js`** ✅
   - package.json: `emulators`
   - Firebaseエミュレータ起動

10. **デプロイスクリプト** ✅
    - `deploy-functions.sh` / `.bat` / `.ps1`
    - package.json: `deploy:functions` / `deploy:functions:win`

11. **アイコン生成スクリプト** ✅
    - `generate-icons.js`, `generate-ios-icons.js`, `generate-pwa-icons.js`, etc.

---

### 削除対象スクリプト（重複・未使用・一時的）

#### 問題生成系の重複（削除推奨）

1. **`generate-questions-with-ai.ts`** ❌
   - package.jsonで定義されているが、実際には`generate-questions-simple.js`が使用されている
   - **削除理由**: `generate-questions-simple.js`と機能が重複

2. **`generate-questions-fixed.ts`** ❌
   - **削除理由**: 修正版だが、`generate-questions-simple.js`に置き換えられた

3. **`generate-questions-debug.ts`** ❌
   - **削除理由**: 一時的なデバッグスクリプト（目的完了）

4. **`generate-questions-direct.ts`** ❌
   - **削除理由**: 未使用、`generate-questions-simple.js`と重複

5. **`generate-questions-openai.ts`** ❌
   - **削除理由**: 未使用、機能が重複

6. **`generate-questions-batch.ts`** ❌
   - **削除理由**: 未使用、`generate-and-integrate-all.js`に統合された

7. **`generate-questions-batch-unified.ts`** ❌
   - **削除理由**: 未使用、エラーが発生していた

#### 追加問題生成系の重複（削除推奨）

8. **`generate-additional-questions.ts`** ❌
   - **削除理由**: 未使用、エラーが発生していた

9. **`generate-additional-questions-fixed.ts`** ❌
   - **削除理由**: 未使用、`generate-questions-simple.js`に統合された

#### 統合系の重複（削除推奨）

10. **`generate-and-integrate-all.ts`** ❌
    - **削除理由**: JavaScript版（`.js`）が使用されているため、TypeScript版は不要

11. **`integrate-new-questions.ts`** ❌
    - **削除理由**: `generate-and-integrate-all.js`に統合された

#### テスト・デバッグスクリプト（削除推奨）

12. **`test-basic.js`** ❌
    - **削除理由**: 一時的なテストスクリプト

13. **`test-import.js`** ❌
    - **削除理由**: 一時的なテストスクリプト

14. **`test-simple-generate.ts`** ❌
    - **削除理由**: 一時的なテストスクリプト

15. **`debug-split-error.js`** ❌
    - **削除理由**: 一時的なデバッグスクリプト（目的完了）

#### その他未使用スクリプト

16. **`generate-minimal.js`** ❌
    - **削除理由**: 実験的スクリプト

17. **`generate-simple.js`** ❌
    - **削除理由**: 未使用、機能が重複

18. **`quick-ai-generate.ts`** ❌
    - **削除理由**: 未使用、機能が重複

19. **`generate-ai-questions-batch.ts`** ❌
    - **削除理由**: 未使用、`generate-and-integrate-all.js`に統合された

20. **`generate-commercial-questions.ts`** ❌
    - **削除理由**: 未使用、特殊用途

21. **`count-ai-questions.ts`** / **`count-ai-questions-simple.ts`** ❌
    - **削除理由**: 未使用、`check-question-counts.ts`に機能が統合された可能性

22. **`remove-copyrighted-questions.ts`** ⚠️
    - **要確認**: 過去に使用された可能性があるが、現在は未使用か確認が必要

---

## 🗂️ 整理後の構造案

```
scripts/
├── generate/              # 問題生成スクリプト
│   ├── questions.js       # メイン生成スクリプト（simple.jsから改名）
│   └── batch-all.js       # バッチ生成＋統合（generate-and-integrate-all.jsから移動）
│
├── integrate/             # 統合スクリプト
│   └── questions.ts       # integrate-additional-questions.tsから移動
│
├── check/                 # チェック・検証スクリプト
│   ├── env.ts             # check-env.tsから移動
│   ├── questions.ts       # check-question-counts.tsから移動
│   └── duplicates.ts      # duplicate-questions.tsから移動
│
├── test/                  # テストスクリプト
│   ├── env.ts             # test-env.tsから移動
│   └── functions.ts       # test-firebase-functions.tsから移動
│
├── deploy/                # デプロイスクリプト
│   ├── functions.sh
│   ├── functions.bat
│   └── functions.ps1
│
├── icons/                 # アイコン生成スクリプト
│   ├── icons.js
│   ├── ios-icons.js
│   └── pwa-icons.js
│
├── utils/                 # 共通ユーティリティ（新規作成）
│   ├── env-loader.ts      # 環境変数読み込みの統一
│   ├── api-client.ts      # API呼び出しの統一
│   └── logger.ts          # ログの統一（lib/logger.tsへのラッパー）
│
├── emulators/             # エミュレータ関連
│   └── start.js           # start-emulators.jsから移動
│
└── docs/                  # ドキュメント
    ├── INTEGRATION_GUIDE.md
    └── SCRIPT_CLEANUP_PLAN.md（このファイル）
```

---

## 🎯 実行計画

### Phase 1: 削除（即座に実行可能）

1. 明らかに未使用・重複のスクリプトを削除
2. package.jsonから未使用のスクリプト定義を削除

### Phase 2: 整理（構造改善）

1. 機能別サブディレクトリを作成
2. スクリプトを適切なディレクトリに移動
3. package.jsonのスクリプトパスを更新

### Phase 3: 共通化（リファクタリング）

1. 共通ユーティリティ関数を抽出
2. すべてのスクリプトで共通関数を使用

---

## ⚠️ 注意事項

1. **削除前に確認**: 
   - 各スクリプトの最終更新日を確認
   - 最近使用された可能性のあるスクリプトは慎重に判断

2. **バックアップ**: 
   - 重要なスクリプトは削除前にバックアップ（gitで管理されているので安全）

3. **段階的実行**: 
   - 一度にすべて削除せず、段階的に実行して問題がないか確認

---

## 📝 削除リスト（Phase 1）

```bash
# 問題生成系の重複
scripts/generate-questions-with-ai.ts
scripts/generate-questions-fixed.ts
scripts/generate-questions-debug.ts
scripts/generate-questions-direct.ts
scripts/generate-questions-openai.ts
scripts/generate-questions-batch.ts
scripts/generate-questions-batch-unified.ts

# 追加問題生成系の重複
scripts/generate-additional-questions.ts
scripts/generate-additional-questions-fixed.ts

# 統合系の重複
scripts/generate-and-integrate-all.ts
scripts/integrate-new-questions.ts

# テスト・デバッグスクリプト
scripts/test-basic.js
scripts/test-import.js
scripts/test-simple-generate.ts
scripts/debug-split-error.js

# その他未使用
scripts/generate-minimal.js
scripts/generate-simple.js
scripts/quick-ai-generate.ts
scripts/generate-ai-questions-batch.ts
scripts/count-ai-questions.ts
scripts/count-ai-questions-simple.ts
```

**合計: 20ファイル削除予定**

