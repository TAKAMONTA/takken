# 重複ファイル削除作業

## 📋 削除対象ファイル

以下のファイルは新しいディレクトリ構造に移動済みのため、古いパスのファイルを削除します：

### 確認済み（package.jsonで新しいパスを使用）

1. ✅ `scripts/check-env.ts` 
   - → 移動先: `scripts/check/env.ts` 
   - → package.json: `check-env` → `scripts/check/env.ts` ✅

2. ✅ `scripts/test-env.ts`
   - → 移動先: `scripts/test/env.ts`
   - → package.json: `test:env` → `scripts/test/env.ts` ✅

3. ✅ `scripts/integrate-additional-questions.ts`
   - → 移動先: `scripts/integrate/questions.ts`
   - → package.json: `integrate:questions` → `scripts/integrate/questions.ts` ✅

4. ✅ `scripts/check-question-counts.ts`
   - → 移動先: `scripts/check/question-counts.ts`
   - → package.json: `check:questions` → `scripts/check/question-counts.ts` ✅

5. ✅ `scripts/duplicate-questions.ts`
   - → 移動先: `scripts/check/duplicates.ts`
   - → package.json: `duplicate:questions` → `scripts/check/duplicates.ts` ✅

6. ✅ `scripts/test-firebase-functions.ts`
   - → 移動先: `scripts/test/firebase-functions.ts`
   - → package.json: `test:functions` → `scripts/test/firebase-functions.ts` ✅

### その他（確認必要）

7. ⚠️ `scripts/generate-and-integrate-all.js`
   - → 移動先: `scripts/generate/batch-all.js`
   - → package.json: `generate:all` → `scripts/generate/batch-all.js` ✅

8. ⚠️ `scripts/generate-questions-simple.js`
   - → 移動先: `scripts/generate/questions.js`
   - → package.json: `generate:questions` → `scripts/generate/questions.js` ✅

9. ⚠️ `scripts/test-env.js`
   - → 移動先: `scripts/test/env.ts`
   - → 用途不明（TypeScript版に統合済み）

---

## 🔍 削除前の確認

- ✅ package.jsonのすべてのスクリプトが新しいパスを使用している
- ✅ 新しいディレクトリ構造でファイルが存在する
- ✅ 古いファイルはconsole.logを使用（loggerに統一済みではない）

---

## 🎯 削除実行

準備完了後、上記のファイルを削除します。

