# セキュリティポリシー

## 🔒 セキュリティの概要

「宅建合格ロード」アプリケーションのセキュリティに関する情報とベストプラクティスをまとめています。

## 📋 セキュリティチェックリスト

### 環境変数とAPIキー

- [ ] `.env.local` ファイルが `.gitignore` に含まれている
- [ ] すべてのAPIキーが環境変数として管理されている
- [ ] クライアント側で使用する環境変数のみ `NEXT_PUBLIC_` プレフィックス付き
- [ ] サーバー専用のAPIキーは `NEXT_PUBLIC_` なし

#### ✅ 正しい環境変数の使い方

```bash
# ✅ クライアント側（Firebase設定など）
NEXT_PUBLIC_FIREBASE_API_KEY=xxx
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=xxx

# ✅ サーバー専用（AI APIキーなど）
OPENAI_API_KEY=xxx
ANTHROPIC_API_KEY=xxx
GOOGLE_AI_API_KEY=xxx

# ❌ 間違い：サーバー専用キーにNEXT_PUBLIC_を付けない
# NEXT_PUBLIC_OPENAI_API_KEY=xxx  <- これはNG！
```

### Firebase セキュリティ

#### Firestore セキュリティルール

現在の設定: `firestore.rules`

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // ユーザーは自分のデータのみアクセス可能
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // 学習記録は自分のデータのみ
    match /learningRecords/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

**定期的に確認すべき項目:**
- [ ] 認証されたユーザーのみデータアクセス可能
- [ ] ユーザーは自分のデータのみ読み書き可能
- [ ] 管理者権限が適切に設定されている

#### Firebase Authentication

- [ ] パスワードポリシーの設定（最小8文字など）
- [ ] メールアドレス確認の有効化
- [ ] 不正ログイン試行の監視
- [ ] セッション管理の適切な設定

### AI APIの安全な使用

#### ⚠️ 重要: クライアント側でAI APIを呼ばない

現在のアーキテクチャの問題:
```typescript
// ❌ 問題：lib/ai-client.ts がクライアント側で直接AI APIを呼んでいる
const apiKey = process.env.OPENAI_API_KEY; // これはクライアントでは undefined
```

**解決方法:**

1. **API Routeを使用する（推奨）**

```typescript
// app/api/ai/chat/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { aiClient } from '@/lib/ai-client';

export async function POST(request: NextRequest) {
  // 認証チェック
  const session = await getServerSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { messages } = await request.json();
  
  // サーバー側でAI APIを呼び出し
  const response = await aiClient.chat(messages);
  
  return NextResponse.json(response);
}
```

2. **クライアント側から呼び出し**

```typescript
// components/AIChat.tsx
const response = await fetch('/api/ai/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ messages })
});
```

#### レート制限

- [ ] AI APIのレート制限を監視
- [ ] ユーザーごとのクォータ管理
- [ ] エラーハンドリングとフォールバック

### Android アプリのセキュリティ

詳細は [ANDROID_SECURITY.md](./ANDROID_SECURITY.md) を参照

- [ ] 署名鍵がリポジトリに含まれていない
- [ ] パスワードがソースコードに記載されていない
- [ ] Google Play App Signing を有効化
- [ ] ProGuard/R8による難読化を有効化

### 依存関係のセキュリティ

#### 定期的な更新

```bash
# 脆弱性スキャン
npm audit

# 自動修復
npm audit fix

# パッケージの更新
npm update
```

#### セキュリティアラート

- [ ] GitHub Dependabot を有効化
- [ ] セキュリティアラートの通知設定
- [ ] 重大な脆弱性は即座に対応

### データ保護

#### 個人情報の取り扱い

- [ ] 必要最小限の個人情報のみ収集
- [ ] 個人情報は暗号化して保存
- [ ] GDPR/個人情報保護法に準拠
- [ ] プライバシーポリシーの明記

#### データの暗号化

```typescript
// lib/crypto-utils.ts を使用
import CryptoJS from 'crypto-js';

// 暗号化
const encrypted = CryptoJS.AES.encrypt(data, secretKey).toString();

// 復号化
const decrypted = CryptoJS.AES.decrypt(encrypted, secretKey).toString(CryptoJS.enc.Utf8);
```

### HTTPS とネットワークセキュリティ

- [ ] 本番環境ではHTTPSのみ使用
- [ ] Mixed Contentエラーがない
- [ ] CSP（Content Security Policy）の設定
- [ ] CORS設定の確認

## 🚨 脆弱性の報告

セキュリティ上の問題を発見した場合は、以下の方法で報告してください：

### 報告方法

1. **緊急の場合**: [メールアドレス] に直接連絡
2. **GitHub Security Advisory**: リポジトリのSecurityタブから報告
3. **Issues**: 機密性の低い問題のみ

### 報告時に含める情報

- 脆弱性の詳細な説明
- 再現手順
- 影響範囲
- 可能であれば修正案

## 🔐 セキュリティベストプラクティス

### 開発時

1. **環境変数の管理**
   - `.env.local` を使用（Gitにコミットしない）
   - APIキーは絶対にコードに直接記載しない
   - `.env.example` でテンプレートを提供

2. **認証の実装**
   - Firebase Authenticationを適切に使用
   - トークンの有効期限を設定
   - セッション管理を適切に実装

3. **入力のバリデーション**
   - すべてのユーザー入力を検証
   - XSS対策（Reactは自動でエスケープ）
   - SQL/NoSQLインジェクション対策

### デプロイ時

1. **ビルド前のチェック**
   ```bash
   # Lintチェック
   npm run lint
   
   # 型チェック
   npx tsc --noEmit
   
   # セキュリティスキャン
   npm audit
   ```

2. **環境変数の設定**
   - 本番環境の環境変数を正しく設定
   - 開発用のキーを本番で使用しない
   - Firebase プロジェクトを開発/本番で分離

3. **デプロイ後の確認**
   - HTTPS動作確認
   - CSP設定の確認
   - Firebase セキュリティルールのテスト

## 📚 参考資料

### セキュリティガイドライン

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Next.js Security Headers](https://nextjs.org/docs/app/api-reference/next-config-js/headers)
- [Firebase Security Rules](https://firebase.google.com/docs/rules)
- [Android Security](https://developer.android.com/topic/security/best-practices)

### ツール

- [npm audit](https://docs.npmjs.com/cli/v8/commands/npm-audit)
- [Snyk](https://snyk.io/)
- [OWASP ZAP](https://www.zaproxy.org/)

## 📝 セキュリティ更新履歴

### 2025-10-09
- ✅ Puppeteerを devDependencies に移動
- ✅ Android署名情報をgradle.propertiesから削除
- ✅ ANDROID_SECURITY.md を作成
- ✅ AI APIの適切な使用方法を文書化
- ⚠️ AI API呼び出しをサーバー専用に移行する必要あり（TODO）

### 今後の改善予定
- [ ] AI API呼び出しをAPI Routeに移行
- [ ] CSP（Content Security Policy）の設定
- [ ] セキュリティヘッダーの追加
- [ ] Firebase App Check の実装
- [ ] レート制限の実装

---

**重要**: このドキュメントは定期的に更新してください。新しい脆弱性や対策が見つかった場合は、速やかに反映させましょう。

**最終更新:** 2025年10月9日

