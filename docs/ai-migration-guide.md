# AI機能のサーバー移行ガイド

## 📋 概要

現在のアプリケーションでは、AI API（OpenAI/Anthropic/Google AI）がクライアント側で直接呼ばれており、以下の問題があります：

### 現在の問題点

1. **セキュリティリスク**: APIキーがクライアントに露出する可能性
2. **動作不可**: `next.config.mjs` で `output: "export"` を使用しているため、サーバー環境変数にアクセスできない
3. **コスト管理困難**: ユーザーごとの使用量制限やレート制限が実装されていない

### 解決方法

AI API呼び出しをサーバー側（API Route / Firebase Functions）に移行する必要があります。

## 🎯 移行オプション

### オプション1: Next.js API Routes（推奨）

**メリット:**
- 最小限の変更で移行可能
- Next.jsの機能をフル活用
- 開発体験が良い

**デメリット:**
- Vercel/Node.jsサーバーが必要（Firebase Hostingのみでは不可）
- デプロイ先の変更が必要

**実装手順:**

#### 1. next.config.mjsを修正

```javascript
// next.config.mjs
const nextConfig = {
  // output: "export", を削除またはコメントアウト
  trailingSlash: true,
  // ... 他の設定
};
```

#### 2. APIルートの実装（既に作成済み）

- `app/api/ai/chat/route.ts`
- `app/api/ai/recommendations/route.ts`
- `app/api/ai/explanation/route.ts`
- `app/api/ai/motivation/route.ts`

#### 3. クライアント側のコードを更新

**変更前:**
```typescript
import { aiClient } from '@/lib/ai-client';

// ❌ クライアント側で直接呼び出し
const response = await aiClient.chat(messages);
```

**変更後:**
```typescript
import { chat } from '@/lib/ai-api-client';

// ✅ API Route経由で呼び出し
const response = await chat(messages);
```

#### 4. 環境変数の設定

デプロイ先（Vercel/Cloud Runなど）で環境変数を設定：

```bash
OPENAI_API_KEY=sk-xxxxx
ANTHROPIC_API_KEY=sk-ant-xxxxx
GOOGLE_AI_API_KEY=xxxxx
```

#### 5. Vercelへデプロイ

```bash
# Vercel CLIのインストール
npm i -g vercel

# デプロイ
vercel --prod
```

### オプション2: Firebase Functions

**メリット:**
- Firebase Hostingと統合しやすい
- 既存のFirebaseプロジェクトを活用
- 無料枠が大きい

**デメリット:**
- Firebase Functionsの学習コストが必要
- コールドスタートの遅延がある

**実装手順:**

#### 1. Firebase Functionsのセットアップ

```bash
npm install -g firebase-tools
firebase init functions
```

#### 2. 関数の実装

```typescript
// functions/src/index.ts
import * as functions from 'firebase-functions';
import { OpenAI } from 'openai';

export const aiChat = functions.https.onCall(async (data, context) => {
  // 認証チェック
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', '認証が必要です');
  }

  const { messages, options } = data;
  const openai = new OpenAI({
    apiKey: functions.config().openai.key,
  });

  const response = await openai.chat.completions.create({
    model: 'gpt-4-turbo-preview',
    messages,
    ...options,
  });

  return {
    content: response.choices[0].message.content,
    usage: response.usage,
  };
});
```

#### 3. クライアント側から呼び出し

```typescript
import { getFunctions, httpsCallable } from 'firebase/functions';

const functions = getFunctions();
const aiChat = httpsCallable(functions, 'aiChat');

const result = await aiChat({ messages, options });
console.log(result.data);
```

#### 4. 環境変数の設定

```bash
firebase functions:config:set openai.key="sk-xxxxx"
firebase deploy --only functions
```

### オプション3: Firebase Hosting + Cloudflare Workers（上級）

**メリット:**
- 静的エクスポートを維持できる
- エッジで高速実行
- コスト効率が良い

**デメリット:**
- 設定が複雑
- Cloudflare Workersの学習コストが必要

## 📝 移行チェックリスト

### Phase 1: 準備（現在完了）
- [x] AI API Routeの実装
- [x] クライアント側ラッパー（`ai-api-client.ts`）の作成
- [x] セキュリティドキュメントの作成
- [x] 移行ガイドの作成

### Phase 2: コード修正
- [ ] `next.config.mjs` から `output: "export"` を削除（オプション1の場合）
- [ ] すべてのAI呼び出し箇所を特定
- [ ] `aiClient` を `ai-api-client` に置き換え
- [ ] 認証トークンの取得処理を追加

### Phase 3: テスト
- [ ] ローカル環境でAPI Routeの動作確認
- [ ] 認証フローのテスト
- [ ] エラーハンドリングのテスト
- [ ] レート制限のテスト

### Phase 4: デプロイ
- [ ] 環境変数の設定
- [ ] 本番環境へのデプロイ
- [ ] 本番での動作確認
- [ ] 監視・ログの設定

### Phase 5: クリーンアップ
- [ ] 不要になった古いコードの削除
- [ ] ドキュメントの更新
- [ ] チームへの共有

## 🔍 AI呼び出し箇所の特定

以下のファイルでAI機能を使用しています：

```
lib/ai-teacher-messages.ts
lib/ai-voice-assistant.ts
lib/ai-enhancement-system.ts
lib/ai-master-system.ts
lib/ai-exam-predictor.ts
lib/ai-memory-retention.ts
```

### 置き換え例

**lib/ai-teacher-messages.ts:**

```typescript
// 変更前
import { aiClient } from "./ai-client";
const response = await aiClient.generateMotivationalMessage(
  context.streak,
  context.recentPerformance || 0
);

// 変更後
import { generateMotivationalMessage } from "./ai-api-client";
const response = await generateMotivationalMessage(
  context.streak,
  context.recentPerformance || 0
);
```

## 🚨 重要な注意事項

### 1. 認証の実装

すべてのAPI Routeで認証チェックを行う必要があります：

```typescript
// 認証チェックの例
const authHeader = request.headers.get("authorization");
if (!authHeader || !authHeader.startsWith("Bearer ")) {
  return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
}

// Firebase Admin SDKでトークンを検証
const token = authHeader.split("Bearer ")[1];
const decodedToken = await admin.auth().verifyIdToken(token);
const userId = decodedToken.uid;
```

### 2. レート制限

ユーザーごとのリクエスト制限を実装してください：

```typescript
// 簡易実装例
const userLimit = await checkUserQuota(userId);
if (!userLimit.hasQuota) {
  return NextResponse.json(
    { error: "月間利用制限に達しました" },
    { status: 429 }
  );
}
```

### 3. エラーハンドリング

ユーザーフレンドリーなエラーメッセージを返してください：

```typescript
try {
  const response = await aiClient.chat(messages);
  return NextResponse.json({ success: true, data: response });
} catch (error: any) {
  if (error.message?.includes("rate limit")) {
    return NextResponse.json(
      { error: "リクエスト数が上限に達しました" },
      { status: 429 }
    );
  }
  // 詳細なエラーはログに出力、ユーザーには一般的なメッセージを返す
  console.error("AI API error:", error);
  return NextResponse.json(
    { error: "処理中にエラーが発生しました" },
    { status: 500 }
  );
}
```

### 4. コスト管理

AI APIの使用量を監視し、予期しない高額請求を防ぐ：

```typescript
// Firestoreに使用量を記録
await db.collection('aiUsage').add({
  userId,
  tokens: response.usage?.tokens || 0,
  cost: calculateCost(response.usage),
  timestamp: new Date(),
  provider: response.provider,
});
```

## 📊 期待される効果

移行後の改善点：

- ✅ **セキュリティ**: APIキーが完全にサーバー側で管理される
- ✅ **コスト管理**: ユーザーごとの使用量制限が可能
- ✅ **監視**: リクエスト数、エラー率、レスポンス時間の追跡
- ✅ **パフォーマンス**: レスポンスのキャッシュが可能
- ✅ **信頼性**: エラーハンドリングとフォールバックの実装

## 🆘 トラブルシューティング

### エラー: "output: export と API Routes は併用できません"

**解決方法:**
- `next.config.mjs` から `output: "export"` を削除
- Firebase Functionsを使用する

### エラー: "Environment variable not found"

**解決方法:**
- デプロイ先で環境変数が正しく設定されているか確認
- `.env.local` をGitにコミットしていないか確認

### エラー: "CORS policy error"

**解決方法:**
- API Routeに適切なCORSヘッダーを追加
- または、同一オリジンから呼び出す

## 📚 参考資料

- [Next.js API Routes](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)
- [Firebase Cloud Functions](https://firebase.google.com/docs/functions)
- [Vercel Deployment](https://vercel.com/docs)
- [OpenAI Best Practices](https://platform.openai.com/docs/guides/production-best-practices)

---

**最終更新:** 2025年10月9日

**質問・問題がある場合:**
このガイドの内容で不明な点があれば、開発チームに相談してください。

