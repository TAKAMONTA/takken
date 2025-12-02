# 問題統合ガイド

## 手順

### 1. 問題を生成
```powershell
npm run generate:questions -- --category=takkengyouhou --count=5
```

### 2. 生成されたファイルを確認
生成されたファイルは `lib/data/questions/[カテゴリ]/additional-[日付]-batch[番号].ts` に保存されます。

### 3. index.tsに統合
生成されたファイルのエクスポート名を確認して、以下の2箇所を編集：

#### 3-1. インポート文を追加
```typescript
// 追加問題
import { takkengyouhouAdditionalQuestions_20241026 } from "./additional-20241026";
import { takkengyouhouAdditionalQuestions_20241219 } from "./additional-20241219";
import { takkengyouhouAdditionalQuestions_20251101 } from "./additional-2025-11-01";
import { [エクスポート名] } from "./additional-[日付]-batch[番号]"; // ← 追加
```

#### 3-2. エクスポート配列に追加
```typescript
export const takkengyouhouQuestions: Question[] = [
  // ... 既存の問題 ...
  // 追加問題
  ...takkengyouhouAdditionalQuestions_20241026,
  ...takkengyouhouAdditionalQuestions_20241219,
  ...takkengyouhouAdditionalQuestions_20251101,
  ...[エクスポート名], // ← 追加
];
```

## カテゴリ別のエクスポート名パターン

- **宅建業法**: `takkengyouhouAdditionalQuestions_YYYYMMDD_batchN`
- **民法等**: `minpouAdditionalQuestions_YYYYMMDD_batchN`
- **法令上の制限**: `houreiAdditionalQuestions_YYYYMMDD_batchN`
- **税・その他**: `zeihouAdditionalQuestions_YYYYMMDD_batchN`

