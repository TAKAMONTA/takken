# 問題データ最適化 - 実行サマリー

## ✅ 完了した作業

### 1. 遅延読み込み（Lazy Loading）の実装

#### `lib/data/questions/utils/lazy-loader.ts`
- **目的**: 問題データを必要になった時点で読み込む
- **機能**:
  - `getQuestionsByCategoryLazy()`: カテゴリ別の問題データを遅延読み込み
  - `getQuestionsByCategoriesLazy()`: 複数カテゴリを一度に取得
  - `getAllQuestionsLazy()`: 全カテゴリの問題データを取得
  - `clearQuestionCache()`: キャッシュのクリア
  - `getCacheStatus()`: キャッシュの状態確認

#### `lib/data/questions/index-optimized.ts`
- **目的**: 最適化された問題データ管理（動的インポート対応）
- **機能**:
  - カテゴリ情報のみを静的にインポート（軽量）
  - 問題データは必要になった時点で動的にインポート
  - 既存APIとの互換性を維持

### 2. `lib/data/questions.ts`の最適化

#### 変更内容
- **Before**: `questionsByCategory`を静的にインポート（全問題データが初期読み込み）
- **After**: `loadCategoryQuestions()`関数を使用して遅延読み込み

```typescript
// 変更前
const localQuestions = questionsByCategory[category] || [];

// 変更後
const localQuestions = await loadCategoryQuestions(category);
```

#### 効果
- ✅ 初期バンドルサイズの削減
- ✅ ビルド時間の短縮（不要な問題データを読み込まない）
- ✅ メモリ使用量の最適化（必要な時だけ読み込む）

### 3. 問題データの構造最適化ツール

#### `lib/data/questions/utils/index-builder.ts`
- **目的**: 問題ファイルの自動収集と最適化されたインデックス生成
- **機能**:
  - `collectQuestionFiles()`: カテゴリディレクトリから問題ファイルを収集
  - `extractExportName()`: TypeScriptファイルからエクスポート名を抽出
  - `generateOptimizedIndex()`: 最適化されたindex.tsファイルを生成

---

## 📊 改善効果

### Before（改善前）

#### インポート文
- ❌ 各カテゴリの`index.ts`で50+のimport文
- ❌ ビルド時に全問題データが読み込まれる
- ❌ 初期バンドルサイズが大きい

#### メモリ使用量
- ❌ 使用しないカテゴリの問題もメモリに保持
- ❌ ビルド時間が長い

### After（改善後）

#### インポート文
- ✅ 必要な時だけ問題データを読み込む
- ✅ 初期バンドルサイズが削減
- ✅ ビルド時間が短縮

#### メモリ使用量
- ✅ 使用するカテゴリの問題のみをメモリに保持
- ✅ キャッシュ機能により、2回目以降は高速

---

## 🎯 実装の詳細

### 遅延読み込みの仕組み

1. **初回アクセス時**
   ```typescript
   const questions = await loadCategoryQuestions('takkengyouhou');
   // → この時点で初めて takkengyouhou/index.ts が読み込まれる
   ```

2. **キャッシュ機能**
   ```typescript
   // 2回目以降はキャッシュから即座に返す
   const cached = questionCache[category];
   if (cached) return cached;
   ```

3. **Firestore優先**
   - Firestoreにデータがある場合は、ローカルデータを読み込まない
   - フォールバック時のみローカルデータを使用

### Next.js静的エクスポート環境への対応

Next.jsの静的エクスポート環境（`output: "export"`）では、動的インポートが完全には動作しない可能性があります。そのため、以下のアプローチを採用：

1. **条件付きインポート**
   ```typescript
   switch (category) {
     case 'takkengyouhou':
       const { takkengyouhouQuestions } = await import('./questions/takkengyouhou/index');
       return takkengyouhouQuestions;
   }
   ```

2. **キャッシュの活用**
   - 一度読み込んだ問題データはキャッシュに保持
   - 同じカテゴリへの2回目以降のアクセスは高速

---

## 📝 使用方法

### 基本的な使用方法（変更なし）

```typescript
import { getQuestionsByCategory } from '@/lib/data/questions';

// 既存のコードはそのまま動作
const questions = await getQuestionsByCategory('takkengyouhou');
```

### キャッシュの管理

```typescript
import { clearQuestionCache, getCacheStatus } from '@/lib/data/questions/utils/lazy-loader';

// キャッシュの状態を確認
const status = getCacheStatus();
console.log(status);
// { takkengyouhou: true, minpou: false, ... }

// キャッシュをクリア
clearQuestionCache('takkengyouhou'); // 特定カテゴリのみ
clearQuestionCache(); // 全カテゴリ
```

---

## 🔄 今後の改善案

### 1. 問題データの分割

各カテゴリの問題データをさらに小さなチャンクに分割：
- `basic-*.ts`（基礎問題）
- `standard-*.ts`（標準問題）
- `advanced-*.ts`（応用問題）
- `additional-*.ts`（追加問題）

### 2. インデックスファイルの自動生成

`index-builder.ts`を使用して、問題ファイルの追加・削除に応じて自動的に`index.ts`を更新。

### 3. バンドルサイズの監視

ビルド時にバンドルサイズを監視し、閾値を超えた場合に警告を表示。

---

## ✅ 改善完了

**実行日**: 2025-11-01  
**作成ファイル**: 
- `lib/data/questions/utils/lazy-loader.ts`
- `lib/data/questions/index-optimized.ts`
- `lib/data/questions/utils/index-builder.ts`

**更新ファイル**: 
- `lib/data/questions.ts`（遅延読み込み対応）

**効果**:
- ✅ 初期バンドルサイズの削減
- ✅ ビルド時間の短縮
- ✅ メモリ使用量の最適化
- ✅ 既存APIとの互換性維持

