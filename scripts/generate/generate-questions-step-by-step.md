# 問題生成ステップバイステップガイド

## 📋 生成計画

| カテゴリ | 追加数 | バッチ構成 | 開始ID |
|---------|-------|-----------|--------|
| 宅建業法 | 20問 | 5問×4バッチ | 3100 |
| 民法等 | 15問 | 5問×3バッチ | 4100 |
| 法令上の制限 | 10問 | 5問×2バッチ | 5100 |
| 税・その他 | 10問 | 5問×2バッチ | 6100 |

## 🚀 実行手順

### 1. 宅建業法（20問 = 5問×4バッチ）

#### バッチ1（ID: 3100-3104）
```bash
npx ts-node scripts/generate-questions-with-ai.ts --category takkengyouhou --count 5 --difficulty 標準 --startId 3100 --output lib/data/questions/takkengyouhou/additional-20250117-batch1.ts
```

**確認事項：**
- 生成された問題の品質を確認
- 正誤が正しいか確認
- 解説が適切か確認

#### バッチ2（ID: 3105-3109）
```bash
npx ts-node scripts/generate-questions-with-ai.ts --category takkengyouhou --count 5 --difficulty 標準 --startId 3105 --output lib/data/questions/takkengyouhou/additional-20250117-batch2.ts
```

#### バッチ3（ID: 3110-3114）
```bash
npx ts-node scripts/generate-questions-with-ai.ts --category takkengyouhou --count 5 --difficulty 標準 --startId 3110 --output lib/data/questions/takkengyouhou/additional-20250117-batch3.ts
```

#### バッチ4（ID: 3115-3119）
```bash
npx ts-node scripts/generate-questions-with-ai.ts --category takkengyouhou --count 5 --difficulty 標準 --startId 3115 --output lib/data/questions/takkengyouhou/additional-20250117-batch4.ts
```

---

### 2. 民法等（15問 = 5問×3バッチ）

#### バッチ1（ID: 4100-4104）
```bash
npx ts-node scripts/generate-questions-with-ai.ts --category minpou --count 5 --difficulty 標準 --startId 4100 --output lib/data/questions/minpou/additional-20250117-batch1.ts
```

#### バッチ2（ID: 4105-4109）
```bash
npx ts-node scripts/generate-questions-with-ai.ts --category minpou --count 5 --difficulty 標準 --startId 4105 --output lib/data/questions/minpou/additional-20250117-batch2.ts
```

#### バッチ3（ID: 4110-4114）
```bash
npx ts-node scripts/generate-questions-with-ai.ts --category minpou --count 5 --difficulty 標準 --startId 4110 --output lib/data/questions/minpou/additional-20250117-batch3.ts
```

---

### 3. 法令上の制限（10問 = 5問×2バッチ）

#### バッチ1（ID: 5100-5104）
```bash
npx ts-node scripts/generate-questions-with-ai.ts --category hourei --count 5 --difficulty 標準 --startId 5100 --output lib/data/questions/hourei/additional-20250117-batch1.ts
```

#### バッチ2（ID: 5105-5109）
```bash
npx ts-node scripts/generate-questions-with-ai.ts --category hourei --count 5 --difficulty 標準 --startId 5105 --output lib/data/questions/hourei/additional-20250117-batch2.ts
```

---

### 4. 税・その他（10問 = 5問×2バッチ）

#### バッチ1（ID: 6100-6104）
```bash
npx ts-node scripts/generate-questions-with-ai.ts --category zeihou --count 5 --difficulty 標準 --startId 6100 --output lib/data/questions/zeihou/additional-20250117-batch1.ts
```

#### バッチ2（ID: 6105-6109）
```bash
npx ts-node scripts/generate-questions-with-ai.ts --category zeihou --count 5 --difficulty 標準 --startId 6105 --output lib/data/questions/zeihou/additional-20250117-batch2.ts
```

---

## 🔍 品質チェックリスト

各バッチ生成後、以下を確認：

- [ ] 問題文が明確で誤解がない
- [ ] 選択肢が4つすべて存在する
- [ ] 正解番号が正しい
- [ ] 解説が各選択肢の正誤理由を含む
- [ ] 法的根拠が明確
- [ ] タイポや誤字がない
- [ ] IDが重複していない

---

## 📝 統合作業

すべてのバッチ生成が完了したら、各カテゴリの `index.ts` にインポートを追加：

### 宅建業法 (takkengyouhou/index.ts)
```typescript
import { takkengyouhouAdditionalQuestions_20250117_batch1 } from "./additional-20250117-batch1";
import { takkengyouhouAdditionalQuestions_20250117_batch2 } from "./additional-20250117-batch2";
import { takkengyouhouAdditionalQuestions_20250117_batch3 } from "./additional-20250117-batch3";
import { takkengyouhouAdditionalQuestions_20250117_batch4 } from "./additional-20250117-batch4";

// 既存の配列に追加
export const takkengyouhouQuestions: Question[] = [
  // ... 既存の問題 ...
  ...takkengyouhouAdditionalQuestions_20250117_batch1,
  ...takkengyouhouAdditionalQuestions_20250117_batch2,
  ...takkengyouhouAdditionalQuestions_20250117_batch3,
  ...takkengyouhouAdditionalQuestions_20250117_batch4,
];
```

### 民法等 (minpou/index.ts)
```typescript
import { minpouAdditionalQuestions_20250117_batch1 } from "./additional-20250117-batch1";
import { minpouAdditionalQuestions_20250117_batch2 } from "./additional-20250117-batch2";
import { minpouAdditionalQuestions_20250117_batch3 } from "./additional-20250117-batch3";

export const minpouQuestions: Question[] = [
  // ... 既存の問題 ...
  ...minpouAdditionalQuestions_20250117_batch1,
  ...minpouAdditionalQuestions_20250117_batch2,
  ...minpouAdditionalQuestions_20250117_batch3,
];
```

### 法令上の制限 (hourei/index.ts)
```typescript
import { houreiAdditionalQuestions_20250117_batch1 } from "./additional-20250117-batch1";
import { houreiAdditionalQuestions_20250117_batch2 } from "./additional-20250117-batch2";

export const houreiQuestions: Question[] = [
  // ... 既存の問題 ...
  ...houreiAdditionalQuestions_20250117_batch1,
  ...houreiAdditionalQuestions_20250117_batch2,
];
```

### 税・その他 (zeihou/index.ts)
```typescript
import { zeihouAdditionalQuestions_20250117_batch1 } from "./additional-20250117-batch1";
import { zeihouAdditionalQuestions_20250117_batch2 } from "./additional-20250117-batch2";

export const zeihouQuestions: Question[] = [
  // ... 既存の問題 ...
  ...zeihouAdditionalQuestions_20250117_batch1,
  ...zeihouAdditionalQuestions_20250117_batch2,
];
```

---

## ⚠️ 注意事項

1. **APIキーの設定**: `.env.local` に `OPENAI_API_KEY` または `ANTHROPIC_API_KEY` を設定
2. **段階的実行**: 一度に全問生成せず、バッチごとに確認してから次へ
3. **バックアップ**: 生成前に現在の `index.ts` をバックアップ
4. **テスト**: 統合後は必ず動作確認（`npm run dev`）

---

## 📊 進捗トラッキング

- [ ] 宅建業法 バッチ1/4 完了
- [ ] 宅建業法 バッチ2/4 完了
- [ ] 宅建業法 バッチ3/4 完了
- [ ] 宅建業法 バッチ4/4 完了
- [ ] 民法等 バッチ1/3 完了
- [ ] 民法等 バッチ2/3 完了
- [ ] 民法等 バッチ3/3 完了
- [ ] 法令上の制限 バッチ1/2 完了
- [ ] 法令上の制限 バッチ2/2 完了
- [ ] 税・その他 バッチ1/2 完了
- [ ] 税・その他 バッチ2/2 完了
- [ ] 全ファイル統合完了
- [ ] 動作確認完了

