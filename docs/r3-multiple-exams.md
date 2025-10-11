# 令和3年度 複数試験対応について

## 概要
令和3年度は宅建試験が2回実施されました：
- **10月試験**：令和3年10月17日実施
- **12月試験**：令和3年12月19日実施

## データ構造の変更

### 1. ファイル構造
各科目ごとに以下のファイル構造を採用：
```
lib/data/questions/
├── minpou/
│   ├── r3-10.ts    # 令和3年度10月試験
│   ├── r3-12.ts    # 令和3年度12月試験
│   ├── r3.ts       # 互換性のため残す（将来的に削除予定）
│   └── index.ts    # 両試験を統合
├── takkengyouhou/
│   ├── r3-10.ts    # 令和3年度10月試験
│   ├── r3-12.ts    # 令和3年度12月試験
│   └── ...
├── hourei/
│   ├── r3-10.ts    # 令和3年度10月試験
│   ├── r3-12.ts    # 令和3年度12月試験
│   └── ...
└── zeihou/
    ├── r3-10.ts    # 令和3年度10月試験
    ├── r3-12.ts    # 令和3年度12月試験
    └── ...
```

### 2. Question型の拡張
`lib/types/quiz.ts`に`exam`フィールドを追加：
```typescript
export interface Question {
  // ... 既存のフィールド
  exam?: string;  // 試験回（例：「10月」「12月」）
}
```

### 3. データのインポート
各科目のindex.tsで両試験のデータをインポート：
```typescript
import { minpouR3_10Questions } from './r3-10';  // 令和3年度10月試験
import { minpouR3_12Questions } from './r3-12';  // 令和3年度12月試験

export const minpouQuestions: Question[] = [
  ...minpouR7Questions,
  ...minpouR6Questions,
  ...minpouR5Questions,
  ...minpouR4Questions,
  ...minpouR3_10Questions,  // 令和3年度10月試験
  ...minpouR3_12Questions,  // 令和3年度12月試験
];
```

## 実装状況

### ✅ 完了
- [x] Question型にexamフィールドを追加
- [x] 民法等（minpou）のファイル構造を更新
  - r3-10.ts（10月試験データ）作成
  - r3-12.ts（12月試験データ枠）作成
  - index.tsを更新

### 📝 TODO
- [ ] 宅建業法（takkengyouhou）のファイル構造を更新
- [ ] 法令上の制限（hourei）のファイル構造を更新
- [ ] 税・その他（zeihou）のファイル構造を更新
- [ ] 令和3年度12月試験の実際のデータを追加
- [ ] UIで試験回を表示・フィルタリングする機能を追加

## データ追加方法

### 10月試験データの追加
1. 各科目のr3-10.tsファイルを編集
2. 問題データに`exam: "10月"`を追加
3. IDは401番台から開始（既存のr3.tsと同じ）

### 12月試験データの追加
1. 各科目のr3-12.tsファイルを編集
2. 問題データに`exam: "12月"`を追加
3. IDは450番台から開始（10月試験と重複しないように）

## 注意事項
- 既存のr3.tsファイルは互換性のため残していますが、将来的に削除予定
- 新しいデータは必ずr3-10.tsまたはr3-12.tsに追加してください
- examフィールドは必須ではありませんが、令和3年度のデータには必ず設定してください

## 参考資料
- [令和3年度10月試験問題（PDF）](https://www.retio.or.jp/wp-content/uploads/2024/12/R3-question.pdf)
- 令和3年度12月試験問題（PDFリンクを追加予定）
