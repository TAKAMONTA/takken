# 問題データ拡張ガイド

## 📊 現在の問題数

### 分野別の問題データ状況

| 分野         | 年度別ファイル                   | 推定問題数 |
| ------------ | -------------------------------- | ---------- |
| 宅建業法     | r3, r4, r5, r6, r7               | 約 100 問  |
| 民法等       | r3, r3-10, r3-12, r4, r5, r6, r7 | 約 150 問  |
| 法令上の制限 | r3, r5, r6, r7                   | 約 80 問   |
| 税・その他   | r3, r5, r6, r7                   | 約 80 問   |

**総問題数**: 約 400-500 問（推定）

---

## 🎯 問題を増やす方法

### 方法 1: 過去問の追加（推奨）

#### ステップ 1: 年度別ファイルを追加

各分野に新しい年度の問題ファイルを作成します。

**例**: 令和 8 年度の宅建業法問題を追加

```bash
# ファイルパス
lib/data/questions/takkengyouhou/r8.ts
```

**ファイルテンプレート**:

```typescript
// 令和8年度 宅建業法の問題データ（問題31-50）
import { Question } from "@/lib/types/quiz";

export const takkengyouhouR8Questions: Question[] = [
  {
    id: 601, // ユニークなID（既存の最大値+1から開始）
    question: "問題文をここに入力",
    options: ["選択肢1", "選択肢2", "選択肢3", "選択肢4"],
    correctAnswer: 0, // 正解の選択肢インデックス（0-3）
    explanation: "解説文をここに入力",
    category: "takkengyouhou",
    difficulty: "標準", // "基礎" | "標準" | "応用"
    year: "2026", // 西暦

    // 基礎レベル問題の場合は以下を追加（オプション）
    keyTerms: [{ term: "重要用語", explanation: "用語の説明" }],
    relatedArticles: [{ title: "関連条文", content: "条文の内容" }],
    hints: ["ヒント1", "ヒント2"],
    studyTips: ["学習のコツ1", "学習のコツ2"],
  },
  // ... 他の問題
];
```

#### ステップ 2: インデックスファイルに追加

各分野の `index.ts` ファイルに新しい年度をインポート・エクスポートします。

**例**: `lib/data/questions/takkengyouhou/index.ts`

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

---

### 方法 2: AI による問題自動生成（開発中）

#### 概要

OpenAI/Claude/Gemini を使用して過去問パターンを学習し、新しい問題を自動生成します。

#### 実装予定の機能

```typescript
// lib/ai-question-generator.ts（既存ファイル）
export async function generateQuestions(
  category: string,
  count: number,
  difficulty: "基礎" | "標準" | "応用"
): Promise<Question[]> {
  // AI APIを使用して問題を生成
  // 既存の過去問をテンプレートとして学習
  // 法律の最新動向を反映
}
```

#### 使い方（実装後）

```bash
npm run generate-questions -- --category takkengyouhou --count 50 --difficulty 標準
```

---

### 方法 3: データスクレイピング（要注意）

#### 概要

公式サイトや過去問データベースから問題を取得します。

#### 注意事項

⚠️ **著作権に注意**:

- 公式に公開されている過去問のみ使用
- 出典を明記
- 商用利用の場合は許諾が必要

#### 既存のスクレイピングツール

```bash
# lib/data/scripts/ にスクリプトあり
- scrape-takken-siken.ts     # 宅建試験サイトからのスクレイピング
- import-questions.ts         # 問題データのインポート
- validate-questions.ts       # 問題データの検証
```

#### 使い方

```bash
# スクレイピング実行（要環境設定）
npm run scrape-questions

# データ検証
npm run validate-questions
```

---

## 📝 問題作成のベストプラクティス

### 1. ID 管理

- **ユニークな ID**: 既存の最大 ID + 1 から開始
- **分野ごとに範囲を分ける**:
  - 宅建業法: 500-599
  - 民法等: 600-699
  - 法令上の制限: 700-799
  - 税・その他: 800-899

### 2. 難易度設定

- **基礎**: 条文の基本的な理解を問う
  - キーターム、関連条文、ヒント、学習のコツを追加
- **標準**: 過去問の典型的なパターン
- **応用**: 複数の知識を組み合わせる必要がある

### 3. 解説の書き方

```typescript
explanation: `
選択肢Xが正解です。

【理由】
- ポイント1
- ポイント2

【各選択肢の解説】
・選択肢1: ○○のため誤り
・選択肢2: △△のため誤り
・選択肢3: □□のため正しい
・選択肢4: ××のため誤り

【関連知識】
この問題では〜を理解していることが重要です。
`;
```

### 4. カテゴリ名

- `takkengyouhou`: 宅建業法
- `minpou`: 民法等
- `hourei`: 法令上の制限
- `zeihou`: 税・その他

---

## 🚀 簡単な問題追加手順

### クイックスタート（5 分で 10 問追加）

1. **既存ファイルをコピー**

```bash
# 例: 宅建業法の令和7年度をコピーして令和8年度を作成
cp lib/data/questions/takkengyouhou/r7.ts lib/data/questions/takkengyouhou/r8.ts
```

2. **ID と内容を変更**

```typescript
// r8.ts
export const takkengyouhouR8Questions: Question[] = [
  {
    id: 601, // 500番台の続きから
    question: "新しい問題文",
    // ... 他のフィールド
    year: "2026",
  },
  // ... 10問追加
];
```

3. **インデックスに追加**

```typescript
// takkengyouhou/index.ts
import { takkengyouhouR8Questions } from "./r8";

export const takkengyouhouQuestions: Question[] = [
  // ... 既存の問題
  ...takkengyouhouR8Questions, // 追加
];
```

4. **動作確認**

```bash
npm run dev
# http://localhost:3000/practice にアクセス
# 宅建業法を選択して問題が表示されるか確認
```

---

## 🔍 問題データの検証

### 自動検証スクリプト

```bash
npm run validate-questions
```

**チェック項目**:

- ユニーク ID の重複確認
- 必須フィールドの存在確認
- 選択肢の数（4 つ）
- 正解インデックスの範囲（0-3）
- カテゴリ名の正確性
- 難易度の値（基礎/標準/応用）

---

## 📊 目標問題数

### 本試験相当の問題数を目指す

| 分野         | 本試験出題数 | 目標問題数（10 年分） |
| ------------ | ------------ | --------------------- |
| 宅建業法     | 20 問        | 200 問                |
| 民法等       | 14 問        | 140 問                |
| 法令上の制限 | 8 問         | 80 問                 |
| 税・その他   | 8 問         | 80 問                 |
| **合計**     | **50 問**    | **500 問**            |

### マイルストーン

- ✅ **フェーズ 1**: 各分野 100 問（現在達成中）
- 🎯 **フェーズ 2**: 各分野 150 問（次の目標）
- 🎯 **フェーズ 3**: 各分野 200 問（最終目標）

---

## 💡 問題作成のヒント

### 効率的な問題作成

1. **公式過去問を参考にする**

   - 不動産適正取引推進機構の公式過去問
   - 過去 10 年分をカバー

2. **問題パターンを学ぶ**

   - 頻出テーマを把握
   - 典型的なひっかけパターンを理解

3. **AI を活用する**

   - ChatGPT/Claude で問題文を生成
   - 解説文を自動作成
   - ただし必ず人間が最終確認

4. **段階的に追加**
   - 一度に大量追加せず、10-20 問ずつ
   - 品質を優先

---

## 🆘 トラブルシューティング

### 問題が表示されない

1. `npm run build` でエラーが出ていないか確認
2. ブラウザのコンソールでエラーを確認
3. ID の重複がないか確認

### 型エラーが出る

```bash
# TypeScript の型チェック
npx tsc --noEmit
```

### 問題数が増えない

- index.ts に新しいファイルをインポートしたか確認
- ブラウザのキャッシュをクリア

---

## 📞 サポート

問題追加で困ったことがあれば：

1. `QUESTION_EXPANSION_GUIDE.md`（このファイル）を参照
2. `lib/data/questions/` の既存ファイルを参考にする
3. GitHub Issues で質問

---

**宅建合格ロード** - 豊富な問題で合格をサポート！ 📚✨
