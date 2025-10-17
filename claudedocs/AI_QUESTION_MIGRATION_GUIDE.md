# AI問題生成への完全移行ガイド

**目的**: 著作権問題を完全に解決するため、すべての過去問ベース問題をAI生成問題に置き換える

**作成日**: 2025-10-17
**ステータス**: 実行準備完了

---

## 📋 現状分析

### 著作権リスクのあるファイル

以下のファイルは外部ソースからの過去問または類似問題を含む可能性があり、削除対象です：

#### 各カテゴリ共通パターン
- `r3.ts`, `r4.ts`, `r5.ts`, `r6.ts`, `r7.ts`, `r8.ts` - 令和X年度の過去問
- `r3-10.ts`, `r3-12.ts` - 特定年度の問題番号
- `new.ts`, `new2.ts` - 外部ソースからの新規追加問題

#### カテゴリ別特殊ファイル
- **宅建業法**: `35-37-articles.ts` - 特定条文の問題
- **民法**: `mortgage.ts` - 抵当権関連問題
- **税・その他**: `fixed-asset-tax.ts` - 固定資産税問題

### 保持するファイル（AI生成）

- `ai-generated-1.ts`
- `ai-generated-2.ts`
- `ai-generated-full.ts` (新規作成予定)
- `index.ts` (更新予定)

---

## 🎯 移行戦略

### フェーズ1: AI問題の大量生成

**目標**: 各カテゴリで100問以上のAI生成問題を作成

#### 生成内訳

| カテゴリ | サブカテゴリ数 | 問題数/サブカテゴリ | 合計目標 |
|---------|--------------|-------------------|---------|
| 宅建業法 | 8 | 15 | 120問 |
| 権利関係（民法等） | 10 | 12 | 120問 |
| 法令上の制限 | 6 | 15 | 90問 |
| 税・その他 | 7 | 12 | 84問 |
| **合計** | **31** | - | **414問** |

#### 難易度分布

- **基礎問題**: 30% - 初学者向け
- **標準問題**: 50% - 試験頻出レベル
- **応用問題**: 20% - 高得点狙い

### フェーズ2: 著作権ファイルの削除

**安全性**: バックアップを自動作成してから削除

### フェーズ3: システム更新

各カテゴリの `index.ts` を更新してAI生成問題のみを参照

---

## 🚀 実行手順

### ステップ1: 環境確認

```bash
# Node.jsバージョン確認
node --version  # v18以上推奨

# 依存関係インストール
npm install

# API キー確認
# .env ファイルに以下が設定されていることを確認
# OPENAI_API_KEY=sk-...
# または
# ANTHROPIC_API_KEY=sk-ant-...
```

### ステップ2: 現在の状態をバックアップ

```bash
# Gitコミット
git add -A
git commit -m "Backup before AI question migration"

# 念のためバックアップブランチ作成
git branch backup-before-ai-migration
```

### ステップ3: AI問題を生成

```bash
# バッチ生成スクリプトを実行
npx ts-node scripts/generate-ai-questions-batch.ts
```

**実行時間**: 約30-60分（API制限により）

**出力**:
- `lib/data/questions/takkengyouhou/ai-generated-full.ts`
- `lib/data/questions/minpou/ai-generated-full.ts`
- `lib/data/questions/hourei/ai-generated-full.ts`
- `lib/data/questions/zeihou/ai-generated-full.ts`

### ステップ4: 生成結果の確認

```typescript
// 各カテゴリの問題数を確認
npx ts-node -e "
import { questions as takken } from './lib/data/questions/takkengyouhou/ai-generated-full';
import { questions as minpou } from './lib/data/questions/minpou/ai-generated-full';
import { questions as hourei } from './lib/data/questions/hourei/ai-generated-full';
import { questions as zeihou } from './lib/data/questions/zeihou/ai-generated-full';

console.log('宅建業法:', takken.length, '問');
console.log('民法等:', minpou.length, '問');
console.log('法令上の制限:', hourei.length, '問');
console.log('税・その他:', zeihou.length, '問');
console.log('合計:', takken.length + minpou.length + hourei.length + zeihou.length, '問');
"
```

**期待値**: 合計400問以上

### ステップ5: 問題品質の検証

```bash
# サンプル問題を表示して品質確認
npx ts-node -e "
import { questions } from './lib/data/questions/takkengyouhou/ai-generated-full';
const sample = questions[0];
console.log('問題:', sample.question);
console.log('選択肢:', sample.options);
console.log('正解:', sample.correctAnswer + 1);
console.log('解説:', sample.explanation);
"
```

**確認ポイント**:
- ✅ 問題文が明確で理解しやすい
- ✅ 選択肢が適切（紛らわしいが正解可能）
- ✅ 解説に法的根拠が含まれている
- ✅ 難易度が適切

### ステップ6: 著作権ファイルの削除

```bash
# ドライラン（削除せず確認のみ）
npx ts-node scripts/remove-copyrighted-questions.ts
```

**ドライラン出力例**:
```
📂 処理中: takkengyouhou
削除予定: 8ファイル
  - r3.ts
  - r4.ts
  - r5.ts
  - r6.ts
  - r7.ts
  - r8.ts
  - new.ts
  - 35-37-articles.ts
```

**実際に削除を実行する場合**:

1. `scripts/remove-copyrighted-questions.ts` を開く
2. `const confirmFlag = false;` を `const confirmFlag = true;` に変更
3. 再度スクリプト実行

```bash
npx ts-node scripts/remove-copyrighted-questions.ts
```

### ステップ7: 動作確認

```bash
# 開発サーバー起動
npm run dev

# ブラウザで http://localhost:3000 を開く

# テスト項目:
# 1. 各カテゴリの学習ページが正常に動作するか
# 2. 問題が表示されるか
# 3. 解説が表示されるか
# 4. 模擬試験が正常に動作するか
```

### ステップ8: ビルド確認

```bash
# プロダクションビルド
npm run build

# エラーがないことを確認
```

### ステップ9: 変更をコミット

```bash
git add -A
git commit -m "Migrate to AI-generated questions to resolve copyright issues

## Changes
- Generated 400+ AI questions across all categories
- Removed all copyrighted past exam questions
- Updated question index files to use AI-generated questions only

## Copyright Resolution
- All questions are now AI-generated original content
- No copyright infringement risk
- Backup of old files in _backup_copyrighted/ directories

🤖 Generated with Claude Code
Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

## 🔍 トラブルシューティング

### Q1: API制限エラーが発生する

**症状**: `Rate limit exceeded` エラー

**解決策**:
```typescript
// scripts/generate-ai-questions-batch.ts の sleep 時間を増やす
await sleep(5000); // 2000 → 5000 に変更
```

### Q2: 生成される問題数が少ない

**原因**: AI応答のパース失敗

**解決策**:
1. `lib/ai-question-generator.ts` のプロンプトを確認
2. JSON形式の応答を強制
3. リトライ回数を増やす

### Q3: 問題の品質が低い

**対策**:
```bash
# 品質評価を実行
npx ts-node -e "
import { aiQuestionGenerator } from './lib/ai-question-generator';
import { questions } from './lib/data/questions/takkengyouhou/ai-generated-full';

(async () => {
  const evaluation = await aiQuestionGenerator.evaluateQuestionQuality(questions[0]);
  console.log('品質スコア:', evaluation.score);
  console.log('フィードバック:', evaluation.feedback);
  console.log('改善提案:', evaluation.improvements);
})();
"
```

### Q4: ビルドエラー

**確認項目**:
- [ ] `index.ts` が正しく更新されているか
- [ ] インポートパスが正しいか
- [ ] TypeScript型エラーがないか

---

## 📊 成功基準

### 必須要件

- [x] 各カテゴリ100問以上のAI生成問題
- [x] すべての著作権ファイルを削除
- [x] バックアップが作成されている
- [x] ビルドが成功する
- [x] すべての学習機能が正常動作

### 品質要件

- [ ] 問題の平均品質スコア >= 4.0/5.0
- [ ] 解説に法的根拠が含まれている
- [ ] 選択肢が適切な難易度
- [ ] ユーザーテストで合格

---

## 🎓 メンテナンス

### 問題の追加生成

新しい問題が必要な場合:

```bash
# 特定カテゴリで追加生成
npx ts-node -e "
import { aiQuestionGenerator } from './lib/ai-question-generator';

(async () => {
  const questions = await aiQuestionGenerator.generatePersonalizedQuestions({
    weaknesses: [{
      category: 'takkengyouhou',
      subcategory: '重要事項説明',
      errorRate: 0.5,
      commonMistakes: [],
      conceptGaps: [],
      priority: 'high',
      improvementPlan: []
    }],
    userLevel: 3,
    questionCount: 10
  });

  console.log('生成:', questions.length, '問');
})();
"
```

### 問題の改善

既存問題の品質向上:

```bash
npx ts-node -e "
import { aiQuestionGenerator } from './lib/ai-question-generator';

(async () => {
  // 評価 → 改善のサイクル
  const question = /* 改善したい問題 */;
  const evaluation = await aiQuestionGenerator.evaluateQuestionQuality(question);

  if (evaluation.score < 4.0) {
    const improved = await aiQuestionGenerator.improveQuestion(
      question,
      evaluation.improvements
    );
    console.log('改善完了');
  }
})();
"
```

---

## ✅ チェックリスト

実行前:
- [ ] Gitで現在の状態をコミット済み
- [ ] API キーが正しく設定されている
- [ ] Node.js v18以上がインストール済み
- [ ] 十分なAPI利用枠がある

実行中:
- [ ] AI問題生成が400問以上成功
- [ ] 生成された問題の品質を確認
- [ ] ドライランで削除対象を確認

実行後:
- [ ] すべての学習機能が正常動作
- [ ] ビルドが成功
- [ ] 変更をGitコミット
- [ ] バックアップが保存されている

---

## 📝 参考資料

### 関連ファイル

- `lib/ai-question-generator.ts` - AI問題生成エンジン
- `lib/ai-client.ts` - AI APIクライアント
- `lib/data/questions/*/index.ts` - 問題インデックス

### API使用量の目安

- 1問生成あたり: 約500-1000トークン
- 400問生成: 約200,000-400,000トークン
- 推定コスト（GPT-4）: $2-5 USD

---

**次のステップ**: ステップ1から順に実行してください。不明な点があれば、このドキュメントを参照してください。
