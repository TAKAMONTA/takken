# デバッグファイル管理の改善

## ✅ 実施した改善

### 1. `.gitignore`の確認と更新

既に以下の設定が含まれていましたが、より明確に整理しました：

```
# Debug files
debug-*.json
debug-ai-response.json
tmp/debug/
```

### 2. デバッグファイル管理ユーティリティの作成

#### `scripts/utils/debug-file-manager.js` / `.ts`
- **目的**: デバッグファイルの統一管理
- **機能**:
  - デバッグファイルを`tmp/debug/`ディレクトリに保存
  - タイムスタンプ付きファイル名の自動生成
  - 開発環境または`DEBUG=true`の場合のみ保存
  - 自動クリーンアップ（古いファイルの削除）
  - 最大保持ファイル数の制限

### 3. スクリプトの更新

#### `generate-questions-simple.js`
- **変更前**: ルートディレクトリに`debug-ai-response.json`を直接保存
- **変更後**: `tmp/debug/ai-response-{timestamp}.json`に保存
- **効果**:
  - デバッグファイルが整理される
  - タイムスタンプで複数のデバッグファイルを保持可能
  - 開発環境のみ保存（本番環境では保存しない）

---

## 📁 デバッグファイルの保存場所

### Before
```
takken/
  debug-ai-response.json  ← ルートディレクトリ（毎回上書き）
```

### After
```
takken/
  tmp/
    debug/
      ai-response-2025-11-01T07-10-30-678Z.json
      ai-response-2025-11-01T08-15-45-123Z.json
      ...
```

---

## 🎯 使用方法

### デバッグファイルの保存

#### JavaScript
```javascript
const { saveDebugFileWithTimestamp } = require('./utils/debug-file-manager');

// タイムスタンプ付きで保存
const path = saveDebugFileWithTimestamp('ai-response', jsonContent);

// 開発環境または DEBUG=true の場合のみ保存
// 本番環境では null を返す（保存しない）
```

#### TypeScript
```typescript
import { saveDebugFileWithTimestamp } from './utils/debug-file-manager';

const path = saveDebugFileWithTimestamp('ai-response', jsonContent);
```

### デバッグファイルのクリーンアップ

```javascript
const { cleanupDebugFiles, clearAllDebugFiles } = require('./utils/debug-file-manager');

// 7日以上古いファイルを削除、最大10ファイル保持
cleanupDebugFiles({ maxAge: 7 * 24 * 60 * 60 * 1000, maxFiles: 10 });

// すべてのデバッグファイルを削除
clearAllDebugFiles();
```

---

## 🔧 環境変数による制御

### DEBUG環境変数
```bash
# デバッグファイルを保存する
DEBUG=true npm run generate:questions

# デバッグファイルを保存しない（本番環境）
NODE_ENV=production npm run generate:questions
```

---

## ✅ 改善効果

### Before
- ❌ デバッグファイルがルートディレクトリに散在
- ❌ 毎回上書きされる（過去のデバッグ情報が失われる）
- ❌ `.gitignore`は設定済みだが、ファイル管理が不十分

### After
- ✅ デバッグファイルが`tmp/debug/`に整理される
- ✅ タイムスタンプ付きで複数ファイルを保持可能
- ✅ 自動クリーンアップでディスク容量を管理
- ✅ 開発環境のみ保存（本番環境では保存しない）
- ✅ `.gitignore`で確実に除外

---

## 📝 注意事項

1. **既存のデバッグファイル**: 
   - ルートディレクトリの`debug-ai-response.json`は手動で削除可能
   - 今後は`tmp/debug/`に自動保存される

2. **ディスク容量**: 
   - 自動クリーンアップが有効（デフォルト: 7日以上古いファイルを削除）
   - 最大保持ファイル数: 10ファイル（デフォルト）

3. **本番環境**: 
   - `NODE_ENV=production`の場合、デバッグファイルは保存されない

---

## ✅ 改善完了

**実行日**: 2025-11-01  
**作成ファイル**: 
- `scripts/utils/debug-file-manager.js`
- `scripts/utils/debug-file-manager.ts`

**更新ファイル**: 
- `.gitignore`（`tmp/debug/`を追加）
- `scripts/generate-questions-simple.js`（デバッグファイル管理を統一）

**効果**:
- ✅ デバッグファイルの管理が統一された
- ✅ タイムスタンプ付きで複数のデバッグファイルを保持可能
- ✅ 自動クリーンアップ機能でディスク容量を管理
- ✅ 本番環境ではデバッグファイルを保存しない

