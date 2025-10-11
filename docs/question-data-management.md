# 問題データ管理システム

宅建試験アプリの本番用問題データ管理システムの使用方法について説明します。

## フォルダ構成

```
lib/data/
├── questions/                  # 問題データ管理
│   ├── index.ts               # 問題データの統合管理
│   ├── takkengyouhou/         # 宅建業法
│   │   └── index.ts
│   ├── minpou/                # 民法等
│   │   └── index.ts
│   ├── hourei/                # 法令上の制限
│   │   └── index.ts
│   └── zeihou/                # 税・その他
│       └── index.ts
├── scripts/                   # 管理用スクリプト
│   ├── import-questions.ts    # Firestoreへのインポート
│   └── validate-questions.ts  # 問題データの検証
└── questions.ts               # メインAPIファイル
```

## 問題データの構造

各問題は以下の構造を持ちます：

```typescript
interface Question {
  id: number;                    // 問題ID
  question: string;              // 問題文
  options: string[];             // 選択肢（配列）
  correctAnswer: number;         // 正解のインデックス
  explanation: string;           // 解説
  category: string;              // カテゴリ
  difficulty: string;            // 難易度（基礎/標準/応用）
  year: string;                  // 年度
}
```

## 使用方法

### 1. 問題データの追加

各カテゴリのファイル（例：`lib/data/questions/takkengyouhou/index.ts`）に問題を追加：

```typescript
export const takkengyouhouQuestions: Question[] = [
  {
    id: 1,
    question: "宅地建物取引業法に関する問題文...",
    options: [
      "選択肢1",
      "選択肢2", 
      "選択肢3",
      "選択肢4"
    ],
    correctAnswer: 0,
    explanation: "解説文...",
    category: "takkengyouhou",
    difficulty: "基礎",
    year: "2024"
  },
  // 追加の問題...
];
```

### 2. 問題データの検証

問題データを追加した後、検証スクリプトを実行：

```typescript
import { runValidation } from '@/lib/data/scripts/validate-questions';

// 検証実行
await runValidation();
```

### 3. Firestoreへのインポート

検証が完了したら、Firestoreにデータをインポート：

```typescript
import { importAllQuestions } from '@/lib/data/scripts/import-questions';

// 全カテゴリをインポート
await importAllQuestions();
```

### 4. アプリケーションでの使用

```typescript
import { getQuestionsByCategory } from '@/lib/data/questions';

// カテゴリ別の問題取得
const questions = await getQuestionsByCategory('takkengyouhou');

// 難易度別の問題取得
const basicQuestions = await getQuestionsByDifficulty('基礎');

// ランダムな問題取得
const randomQuestions = await getRandomQuestions('minpou', 10);
```

## データの取得フロー

1. **Firestore優先**: まずFirestoreから問題データを取得
2. **ローカルフォールバック**: Firestoreにデータがない場合はローカルデータを使用
3. **エラーハンドリング**: エラー時は空配列またはローカルデータを返す

## カテゴリ情報

各カテゴリには以下の情報が含まれます：

- **宅建業法** (takkengyouhou): 本試験20問出題
- **民法等** (minpou): 本試験14問出題  
- **法令上の制限** (hourei): 本試験8問出題
- **税・その他** (zeihou): 本試験8問出題

## 管理用スクリプト

### 検証スクリプト

```bash
# TypeScriptで直接実行
npx tsx lib/data/scripts/validate-questions.ts
```

### インポートスクリプト

```bash
# TypeScriptで直接実行
npx tsx lib/data/scripts/import-questions.ts
```

## 注意事項

1. **著作権**: 実際の宅建試験問題は著作権があるため、適切に処理してください
2. **データ品質**: 問題追加時は必ず検証スクリプトを実行してください
3. **バックアップ**: Firestoreにインポートする前にデータのバックアップを取ってください
4. **テスト**: 本番環境にデプロイする前に十分なテストを行ってください

## トラブルシューティング

### TypeScriptエラーが発生する場合

1. 問題データの型が正しいか確認
2. 必須フィールドが全て設定されているか確認
3. インポートパスが正しいか確認

### Firestoreへの接続エラー

1. Firebase設定が正しいか確認
2. Firestoreルールが適切に設定されているか確認
3. 認証情報が正しいか確認

### 問題データが表示されない場合

1. Firestoreにデータが正しくインポートされているか確認
2. ローカルデータが正しく設定されているか確認
3. ブラウザのコンソールでエラーを確認
