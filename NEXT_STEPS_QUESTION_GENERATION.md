# 📝 問題数増加アクションプラン

**実行予定**: 2025年12月23日以降  
**目標**: 各カテゴリの問題を200-300問に増やす（合計800-1000問）

---

## 🎯 目標

### 現在の問題数
- 宅建業法: 約60-80問
- 民法等: 約60-80問
- 法令上の制限: 約50-60問
- 税・その他: 約50-60問
- **現在合計: 約220-280問**

### 目標の問題数
- 宅建業法: 200-250問
- 民法等: 200-250問
- 法令上の制限: 150-200問
- 税・その他: 150-200問
- **目標合計: 700-900問**

---

## 📋 準備事項

### 1. 環境変数の確認

`.env.local` に以下が設定されていることを確認：

```bash
OPENAI_API_KEY=sk-proj-...
```

### 2. スクリプトの確認

問題生成スクリプトが存在するか確認：

```bash
# スクリプトの一覧を確認
ls scripts/generate/

# 利用可能なコマンドを確認
npm run | grep generate
```

---

## 🚀 実行手順

### ステップ 1: 既存のスクリプトで生成

#### 方法 A: 一括生成（推奨）

```bash
npm run generate:all
```

このコマンドで、すべてのカテゴリの問題を一括生成します。

#### 方法 B: カテゴリ別に生成

各カテゴリを個別に生成する場合：

```bash
# 宅建業法
npx ts-node scripts/generate/generate-takkengyouhou-50.ts

# 民法
npx ts-node scripts/generate/generate-minpou-50.ts

# 法令上の制限
npx ts-node scripts/generate/generate-hourei-50.ts

# 税法
npx ts-node scripts/generate/generate-zeihou-50.ts
```

### ステップ 2: 生成された問題の確認

```bash
# 問題数を確認
npm run check:questions

# または手動で確認
ls lib/data/questions/takkengyouhou/
ls lib/data/questions/minpou/
ls lib/data/questions/hourei/
ls lib/data/questions/zeihou/
```

### ステップ 3: ビルドとテスト

```bash
# ビルドが通るか確認
npm run build

# 開発サーバーで動作確認
npm run dev
```

### ステップ 4: デプロイ

```bash
# Vercelにデプロイ
vercel --prod
```

---

## ⚙️ カスタマイズ方法

### 問題数を調整する

各生成スクリプトを編集して、生成する問題数を調整できます：

```typescript
// scripts/generate/generate-takkengyouhou-50.ts

const QUESTIONS_TO_GENERATE = 150; // デフォルト: 50 → 150に増やす
```

### トピックを追加する

新しいトピックを追加する場合：

```typescript
const topics = [
  "宅建業の免許制度",
  "宅地建物取引士",
  "営業保証金・保証協会",
  // 新しいトピックを追加
  "新規トピック名",
];
```

### 難易度の割合を調整する

```typescript
const difficultyDistribution = {
  基礎: 0.3,   // 30%
  標準: 0.5,   // 50%
  応用: 0.2,   // 20%
};
```

---

## 📊 推定所要時間とコスト

### 所要時間
- **準備**: 5分
- **生成実行**: 2-3時間（API呼び出しの待ち時間）
- **確認**: 15分
- **デプロイ**: 5分
- **合計**: 約3時間

### コスト（OpenAI API）
- 1問あたり: 約$0.02-0.03
- 600問生成: 約$12-18
- **推定合計**: $15-20

---

## ⚠️ 注意事項

### 1. API制限

OpenAI APIには以下の制限があります：

- **Rate Limit**: 1分あたりのリクエスト数制限
- **Quota Limit**: 月間の使用量制限

エラーが出た場合は、スクリプトを再実行してください。

### 2. データの品質確認

生成された問題は、以下を確認してください：

- ✅ 正解が正しいか
- ✅ 解説が適切か
- ✅ 選択肢が妥当か
- ✅ 重複がないか

### 3. ビルドサイズ

問題数が増えると、ビルドサイズも増加します：

- 現在: 約16MB
- 増加後: 約40-50MB（推定）

Vercelの制限（50MB）内に収まるように注意してください。

---

## 🔧 トラブルシューティング

### 問題 1: API Key エラー

```
Error: Invalid API Key
```

**解決策**:
1. `.env.local` の `OPENAI_API_KEY` を確認
2. APIキーが有効か確認: https://platform.openai.com/api-keys

### 問題 2: Rate Limit エラー

```
Error: Rate limit exceeded
```

**解決策**:
1. 数分待ってから再実行
2. 生成する問題数を減らす
3. バッチサイズを調整する

### 問題 3: メモリエラー

```
Error: JavaScript heap out of memory
```

**解決策**:
```bash
# Node.jsのメモリ上限を増やす
NODE_OPTIONS=--max_old_space_size=4096 npm run generate:all
```

### 問題 4: ビルドエラー

```
Error: Module build failed
```

**解決策**:
1. `node_modules` を削除して再インストール:
   ```bash
   rm -rf node_modules
   npm install
   ```
2. キャッシュをクリア:
   ```bash
   npm run build -- --no-cache
   ```

---

## 📈 段階的な実行計画

### フェーズ 1: テスト生成（推奨）

まずは少数の問題で動作確認：

```bash
# 各カテゴリ50問ずつ生成（現在の2倍）
# 既存のスクリプトを実行
npm run generate:all
```

### フェーズ 2: 本番生成

テストが成功したら、目標数まで生成：

```bash
# スクリプトを編集して問題数を増やす
# QUESTIONS_TO_GENERATE = 200

# 再度実行
npm run generate:all
```

### フェーズ 3: デプロイとモニタリング

```bash
# デプロイ
vercel --prod

# 動作確認
# - 問題が正しく表示されるか
# - パフォーマンスに問題がないか
# - ビルドサイズが制限内か
```

---

## 📚 参考ドキュメント

- 問題生成の詳細手順: `scripts/generate/generate-questions-step-by-step.md`
- 問題データ管理: `docs/question-data-management.md`
- 利用可能な試験データ: `docs/available-exam-data.md`

---

## ✅ チェックリスト

実行前に確認：

- [ ] `OPENAI_API_KEY` が設定されている
- [ ] OpenAI APIの残高が十分にある（$20以上推奨）
- [ ] ローカル環境でビルドが通る
- [ ] Git で変更をコミットしている（バックアップ）

実行後に確認：

- [ ] 問題が生成されている
- [ ] 問題数が目標に達している
- [ ] ビルドが成功する
- [ ] ローカルで動作確認済み
- [ ] Vercelにデプロイ成功
- [ ] 本番環境で動作確認済み

---

## 🎯 成功の定義

以下が達成されれば成功：

1. ✅ 各カテゴリ150問以上
2. ✅ 合計600問以上
3. ✅ ビルドが成功
4. ✅ 本番環境で正常動作
5. ✅ パフォーマンスに問題なし

---

**明日からの作業、頑張ってください！🚀**

何か問題があれば、いつでも相談してください。



