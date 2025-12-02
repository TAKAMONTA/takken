# Firebase Functions デプロイメントガイド

## 🚀 API Routes 制約の解決

`output: "export"`設定により制限されていた API Routes を、Firebase Functions に移行して解決しました。

## 📋 移行内容

### 移行された API

- `/api/ai/chat` → `aiChat` Function
- `/api/ai/explanation` → `aiExplanation` Function
- `/api/ai/motivation` → `aiMotivation` Function
- `/api/ai/recommendations` → `aiRecommendations` Function

### 新しいファイル構成

```
functions/
├── package.json          # Functions依存関係
├── tsconfig.json         # TypeScript設定
└── src/
    └── index.ts          # Functions実装

lib/
├── ai-client-unified.ts      # 統合AI Client
├── firebase-functions-client.ts # Firebase Functions Client
└── ai-client-legacy.ts       # レガシーClient（開発用）
```

## 🔧 セットアップ手順

### 1. Firebase Functions の初期化

```bash
# Functionsディレクトリで依存関係をインストール
cd functions
npm install

# TypeScriptビルド
npm run build
```

### 2. 環境変数の設定

Firebase Functions の環境変数を設定：

```bash
# Firebase CLIで環境変数を設定
firebase functions:config:set \
  openai.api_key="your-openai-api-key" \
  anthropic.api_key="your-anthropic-api-key" \
  google_ai.api_key="your-google-ai-api-key"
```

### 3. デプロイ

```bash
# Functionsのみデプロイ
firebase deploy --only functions

# 全体デプロイ
firebase deploy
```

## 🔄 クライアント側の変更

### 統合 AI Client の使用

既存のコードは変更不要です。統合 AI Client が自動的に環境を判定します：

```typescript
// 既存のコードはそのまま動作
import { aiClient } from "@/lib/ai-client-unified";

// 静的エクスポート環境 → Firebase Functions
// 開発環境 → API Routes
const response = await aiClient.chat(messages, options);
```

### 環境別の動作

- **開発環境**: 既存の API Routes を使用
- **本番環境**: Firebase Functions を使用
- **自動判定**: 環境に応じて適切なクライアントを選択

## 🧪 テスト方法

### 1. ローカルエミュレーター

```bash
# Firebase エミュレーターを起動
firebase emulators:start

# Functionsのテスト
curl -X POST http://localhost:5001/your-project-id/us-central1/aiChat \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"messages": [{"role": "user", "content": "Hello"}]}'
```

### 2. 本番環境テスト

```bash
# Functionsのデプロイ後
curl -X POST https://us-central1-your-project-id.cloudfunctions.net/aiChat \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"messages": [{"role": "user", "content": "Hello"}]}'
```

## 📊 監視とログ

### Functions ログの確認

```bash
# リアルタイムログ
firebase functions:log

# 特定のFunctionのログ
firebase functions:log --only aiChat
```

### 使用量の追跡

Firebase Functions では自動的に使用量が Firestore に記録されます：

```typescript
// 自動記録されるデータ
{
  userId: "user-id",
  provider: "OpenAI",
  tokens: 150,
  timestamp: "2025-01-17T10:00:00Z"
}
```

## 🔒 セキュリティ

### 認証の強化

- Firebase Admin SDK によるトークン検証
- CORS 設定による適切なオリジン制御
- レート制限の実装（今後の拡張）

### 環境変数の管理

- 機密情報は Firebase Functions Config で管理
- クライアント側には API キーを露出しない

## 🚀 パフォーマンス

### コールドスタート対策

- Node.js 18 ランタイム使用
- 適切なメモリ設定
- 接続プールの最適化

### キャッシュ戦略

- AI API レスポンスのキャッシュ
- ユーザー認証トークンのキャッシュ
- 使用量データのバッチ処理

## 🔧 トラブルシューティング

### よくある問題

1. **認証エラー**

   ```bash
   # トークンの確認
   firebase auth:export users.json
   ```

2. **環境変数エラー**

   ```bash
   # 設定の確認
   firebase functions:config:get
   ```

3. **デプロイエラー**
   ```bash
   # ログの確認
   firebase functions:log --only aiChat
   ```

## 📈 今後の拡張

### 予定されている機能

- レート制限の実装
- 使用量の詳細分析
- エラーハンドリングの強化
- パフォーマンス監視

### 最適化のポイント

- Functions のメモリ設定
- タイムアウト設定の調整
- 並行処理の最適化

## ✅ 移行完了チェックリスト

- [x] Firebase Functions 設定完了
- [x] API Routes 移行完了
- [x] クライアント側統合完了
- [x] 環境変数設定完了
- [x] デプロイメント準備完了
- [ ] 本番環境テスト
- [ ] パフォーマンス監視設定
- [ ] エラーハンドリング強化

## 🎯 次のステップ

1. **本番環境でのテスト**: 実際のユーザーでの動作確認
2. **監視設定**: Firebase Monitoring の設定
3. **最適化**: パフォーマンスの継続的な改善
4. **拡張**: 新しい AI 機能の追加

これで、`output: "export"`設定による API Routes 制約が完全に解決されました！
