# AI 問題生成ガイド

## 🤖 概要

AI（OpenAI GPT-4o）を使用して宅建試験問題を自動生成するツールです。過去問形式に準拠した高品質な問題を短時間で大量に作成できます。

---

## 🚀 使用方法

### 方法 1: コマンドラインツール（推奨）

#### 基本的な使い方

```bash
npm run generate-questions -- --category takkengyouhou --count 10 --year r8
```

#### オプション一覧

| オプション     | 説明                                       | 例               | デフォルト      |
| -------------- | ------------------------------------------ | ---------------- | --------------- |
| `--category`   | 分野（takkengyouhou/minpou/hourei/zeihou） | `takkengyouhou`  | `takkengyouhou` |
| `--count`      | 生成する問題数                             | `10`             | `10`            |
| `--year`       | 年度（r8, r9 など）                        | `r8`             | `r8`            |
| `--difficulty` | 難易度（基礎/標準/応用）                   | `標準`           | `標準`          |
| `--startId`    | 開始 ID                                    | `601`            | 自動設定        |
| `--output`     | 出力ファイルパス                           | `custom/path.ts` | 自動設定        |

#### 使用例

**例 1: 宅建業法の標準問題を 10 問生成**

```bash
npm run generate-questions -- --category takkengyouhou --count 10 --year r8
```

**例 2: 民法等の基礎問題を 5 問生成**

```bash
npm run generate-questions -- --category minpou --count 5 --year r8 --difficulty 基礎
```

**例 3: 法令上の制限の応用問題を 15 問生成**

```bash
npm run generate-questions -- --category hourei --count 15 --year r8 --difficulty 応用
```

**例 4: カスタム ID と出力先を指定**

```bash
npm run generate-questions -- --category zeihou --count 8 --year r8 --startId 850 --output lib/data/questions/zeihou/r8-custom.ts
```

---

## 📋 生成される問題の形式

### 標準レベルの問題例

```typescript
{
  id: 601,
  question: "報酬に関する次の記述のうち、正しいものはどれか。",
  options: [
    "選択肢1の内容",
    "選択肢2の内容",
    "選択肢3の内容",
    "選択肢4の内容"
  ],
  correctAnswer: 0,
  explanation: "選択肢1が正しい。\n\n【解説】\n・選択肢1：正しい。理由...\n・選択肢2：誤り。理由...",
  category: "takkengyouhou",
  difficulty: "標準",
  year: "2026"
}
```

### 基礎レベルの問題（学習支援付き）

```typescript
{
  id: 602,
  question: "免許に関する次の記述のうち、正しいものはどれか。",
  options: ["選択肢1", "選択肢2", "選択肢3", "選択肢4"],
  correctAnswer: 0,
  explanation: "詳細な解説...",
  category: "takkengyouhou",
  difficulty: "基礎",
  year: "2026",

  // 基礎レベル特有の学習支援
  keyTerms: [
    { term: "免許", explanation: "宅建業を営むために必要な許可" }
  ],
  relatedArticles: [
    { title: "宅建業法第3条", content: "免許制度について規定" }
  ],
  hints: [
    "免許の有効期間を確認しましょう",
    "免許権者の違いに注意"
  ],
  studyTips: [
    "免許の種類（国土交通大臣免許・都道府県知事免許）を整理",
    "免許換えの手続きを理解する"
  ]
}
```

---

## 🔄 ワークフロー

### ステップ 1: 問題を生成

```bash
npm run generate-questions -- --category takkengyouhou --count 10 --year r8
```

**出力例:**

```
🤖 AI問題生成を開始します...
分野: 宅建業法
問題数: 10問
難易度: 標準
年度: 令和8年度
開始ID: 500

✅ 10問の生成に成功しました！

問題1: 報酬に関する次の記述のうち、正しいものはどれか...
問題2: 業務上の禁止事項に関する次の記述のうち、正しいも...
...

📝 問題データを出力しました: lib/data/questions/takkengyouhou/r8.ts
```

### ステップ 2: インデックスファイルに追加

生成されたファイルを分野のインデックスに追加します。

**`lib/data/questions/takkengyouhou/index.ts` を編集:**

```typescript
import { Question } from "@/lib/types/quiz";
import { takkengyouhouR3Questions } from "./r3";
import { takkengyouhouR4Questions } from "./r4";
import { takkengyouhouR5Questions } from "./r5";
import { takkengyouhouR6Questions } from "./r6";
import { takkengyouhouR7Questions } from "./r7";
import { takkengyouhouR8Questions } from "./r8"; // 追加

export const takkengyouhouQuestions: Question[] = [
  ...takkengyouhouR3Questions,
  ...takkengyouhouR4Questions,
  ...takkengyouhouR5Questions,
  ...takkengyouhouR6Questions,
  ...takkengyouhouR7Questions,
  ...takkengyouhouR8Questions, // 追加
];
```

### ステップ 3: 動作確認

```bash
npm run dev
```

ブラウザで `http://localhost:3000/practice` にアクセスして、新しい問題が表示されることを確認します。

---

## ⚙️ 事前準備

### 1. API キーの設定

`.env.local` ファイルに OpenAI の API キーを設定してください：

```bash
# OpenAI API（必須）
OPENAI_API_KEY=sk-...your-api-key...
```

### 2. API キーの取得方法

1. [OpenAI Platform](https://platform.openai.com/) にアクセス
2. アカウント作成・ログイン
3. API Keys セクションで新しいキーを作成
4. `.env.local` にコピー

### 3. 料金について

- **GPT-4o**: 約 $0.005 / 問題（推定）
- **10 問生成**: 約 $0.05（約 7 円）
- **100 問生成**: 約 $0.50（約 70 円）

💡 **ヒント**: まずは 5-10 問で試して、品質を確認してから大量生成することをお勧めします。

---

## 📊 生成品質の向上

### AI が生成する問題の特徴

✅ **良い点:**

- 過去問形式に準拠
- 法的根拠を含む詳細な解説
- 紛らわしい選択肢
- 最新の法改正を反映

⚠️ **注意点:**

- 法的な正確性は人間が最終確認
- 解説の詳細度にばらつきがある場合あり
- まれに不自然な日本語が混じる

### 品質チェックリスト

生成された問題は以下を確認してください：

- [ ] 問題文が明確で理解しやすい
- [ ] 選択肢が適切で紛らわしい
- [ ] 正解が間違いなく正しい
- [ ] 解説が各選択肢の正誤理由を含む
- [ ] 法的根拠（条文番号など）が正確
- [ ] 最新の法改正を反映している

### 問題の修正方法

生成された TypeScript ファイル（例: `lib/data/questions/takkengyouhou/r8.ts`）を直接編集して修正できます。

---

## 🎯 ベストプラクティス

### 1. 段階的な生成

```bash
# まず5問で品質確認
npm run generate-questions -- --category takkengyouhou --count 5 --year r8

# 品質が良ければ追加生成
npm run generate-questions -- --category takkengyouhou --count 10 --year r8 --startId 605
```

### 2. 難易度別に生成

```bash
# 基礎レベル（学習支援付き）
npm run generate-questions -- --category minpou --count 10 --year r8 --difficulty 基礎

# 標準レベル（過去問相当）
npm run generate-questions -- --category minpou --count 20 --year r8 --difficulty 標準

# 応用レベル（思考力重視）
npm run generate-questions -- --category minpou --count 10 --year r8 --difficulty 応用
```

### 3. 分野をまんべんなく

```bash
# 各分野をバランス良く
npm run generate-questions -- --category takkengyouhou --count 20 --year r8
npm run generate-questions -- --category minpou --count 14 --year r8
npm run generate-questions -- --category hourei --count 8 --year r8
npm run generate-questions -- --category zeihou --count 8 --year r8
```

---

## 🔍 トラブルシューティング

### エラー: API key が設定されていません

**原因**: `.env.local` に API キーが設定されていない

**解決策**:

```bash
# .env.local ファイルを作成
echo "OPENAI_API_KEY=sk-your-api-key" > .env.local
```

### エラー: JSON parse error

**原因**: AI の出力が正しい JSON 形式ではない

**解決策**: もう一度実行してみてください。AI の出力は確率的なため、再実行で成功することがあります。

### エラー: Rate limit exceeded

**原因**: API の使用量制限に達した

**解決策**:

- 少し待ってから再実行
- OpenAI のダッシュボードで使用量を確認
- 課金プランをアップグレード

### 問題の品質が低い

**解決策**:

1. `--difficulty` オプションを調整
2. 生成後に手動で修正
3. プロンプトを調整（`scripts/generate-questions-with-ai.ts` を編集）

---

## 📚 応用例

### 例 1: 週次で新しい問題を追加

```bash
# 毎週月曜日に20問追加
npm run generate-questions -- --category takkengyouhou --count 20 --year r8
```

### 例 2: 特定のトピックに絞って生成

スクリプトを編集して、プロンプトに特定のトピックを追加：

```typescript
const userPrompt = `${categoryJp}の中でも特に「報酬」に関する問題を...`;
```

### 例 3: 複数分野を一括生成

```bash
# シェルスクリプトで一括実行（Bash/PowerShell）
for category in takkengyouhou minpou hourei zeihou; do
  npm run generate-questions -- --category $category --count 10 --year r8
done
```

---

## 📞 サポート

問題が発生した場合：

1. このガイドのトラブルシューティングを確認
2. `QUESTION_EXPANSION_GUIDE.md` も参照
3. GitHub Issues で報告

---

## 🎉 まとめ

AI 問題生成ツールを使えば：

✅ **時間短縮**: 手動作成の 1/10 の時間
✅ **大量生成**: 数百問を短時間で
✅ **品質**: 過去問レベルの問題
✅ **カスタマイズ**: 難易度・分野を自由に

**次のステップ**:

1. API キーを設定
2. 5 問で試してみる
3. 品質を確認
4. 本格的に生成開始！

---

**宅建合格ロード** - AI で効率的に問題を増やそう！ 🤖✨
