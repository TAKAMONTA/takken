# 🔐 環境変数設定ガイド

このドキュメントでは、アプリケーションとスクリプトで必要な環境変数の設定方法を説明します。

---

## 📋 必要な環境変数の一覧

### Stripe関連

| 変数名 | 形式 | 用途 | 例 |
|--------|------|------|-----|
| `STRIPE_SECRET_KEY` | `sk_test_...` または `sk_live_...` | サーバー側でのStripe API呼び出し | `sk_live_xxxxxxxxxxxxx` |
| `STRIPE_WEBHOOK_SECRET` | `whsec_...` | Webhook署名の検証 | `whsec_xxxxxxxxxxxxx` |
| `STRIPE_PRICE_ID_PREMIUM_MONTHLY` | `price_...` | プレミアム月額プランのPrice ID | `price_xxxxxxxxxxxxx` |
| `STRIPE_PRICE_ID_PREMIUM_YEARLY` | `price_...` | プレミアム年額プランのPrice ID | `price_xxxxxxxxxxxxx` |

### Firebase関連

| 変数名 | 形式 | 用途 |
|--------|------|------|
| `NEXT_PUBLIC_FIREBASE_API_KEY` | 文字列 | Firebase Client SDK |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | `プロジェクト.firebaseapp.com` | Firebase Auth |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | 文字列 | Firebaseプロジェクト識別子 |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | `プロジェクト.appspot.com` | Firebase Storage |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | 数値 | Firebase Messaging |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | 文字列 | Firebase App ID |
| `FIREBASE_SERVICE_ACCOUNT_KEY` | JSON文字列 | Firebase Admin SDK（サーバー側） |

### その他

| 変数名 | 形式 | 用途 |
|--------|------|------|
| `OPENAI_API_KEY` | `sk-...` | OpenAI API（AI機能） |
| `ANTHROPIC_API_KEY` | `sk-ant-...` | Anthropic API（Claude） |
| `GOOGLE_AI_API_KEY` | 文字列 | Google AI API |
| `ALLOW_DEV_BYPASS_AUTH` | `true` または `false` | 開発環境での認証バイパス |

---

## 🔍 現在の問題: STRIPE_SECRET_KEY

**エラーメッセージ:**
```
StripePermissionError: This API call cannot be made with a publishable API key. 
Please use a secret API key.
```

**原因:**
`.env.local`の`STRIPE_SECRET_KEY`に、Publishable Key（`pk_`で始まるキー）が設定されています。

**解決方法:**
1. Stripe Dashboardにアクセス: https://dashboard.stripe.com/apikeys
2. **Secret Key**（`sk_live_...` または `sk_test_...` で始まるキー）をコピー
3. `.env.local`の`STRIPE_SECRET_KEY`を更新

---

## 📝 .env.local ファイルの確認と修正

### ステップ 1: .env.local を開く

プロジェクトルートの`.env.local`ファイルを開きます。

### ステップ 2: Stripe Secret Keyを確認

以下の変数が正しく設定されているか確認してください：

```bash
# ❌ 間違った設定（Publishable Keyが設定されている）
STRIPE_SECRET_KEY=pk_live_xxxxxxxxxxxxx

# ✅ 正しい設定（Secret Keyが設定されている）
STRIPE_SECRET_KEY=sk_live_xxxxxxxxxxxxx
```

### ステップ 3: Stripe Webhookシークレットを確認

```bash
# Webhookシークレット（whsec_で始まる）
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx
```

---

## 🔑 Stripe APIキーの取得方法

### 1. Stripe Dashboardにアクセス

https://dashboard.stripe.com/apikeys

### 2. 本番環境とテスト環境を選択

画面左上のトグルで、「テストモード」または「本番モード」を選択します。

- **テストモード**: テスト用のキー（`sk_test_...`, `pk_test_...`）
- **本番モード**: 本番用のキー（`sk_live_...`, `pk_live_...`）

### 3. キーをコピー

#### Secret Key（秘密キー）

- バックエンドで使用
- **絶対に公開してはいけない**キー
- `sk_test_...` または `sk_live_...` で始まる
- 環境変数: `STRIPE_SECRET_KEY`

### 4. Webhook Secret の取得

1. https://dashboard.stripe.com/webhooks にアクセス
2. 登録済みのWebhookエンドポイントをクリック
3. 「署名シークレット」セクションから`whsec_...`で始まるキーをコピー
4. 環境変数: `STRIPE_WEBHOOK_SECRET`

---

## 🌐 Vercel環境変数の設定

本番環境（Vercel）でも同じ環境変数を設定する必要があります。

### ステップ 1: Vercelダッシュボードにアクセス

https://vercel.com/

### ステップ 2: プロジェクトを選択

### ステップ 3: Settings > Environment Variables

### ステップ 4: 環境変数を追加

| Name | Value | Environment |
|------|-------|-------------|
| `STRIPE_SECRET_KEY` | `sk_live_xxxxxxxxxxxxx` | ✅ Production |
| `STRIPE_WEBHOOK_SECRET` | `whsec_xxxxxxxxxxxxx` | ✅ Production |
| `STRIPE_PRICE_ID_PREMIUM_MONTHLY` | `price_xxxxxxxxxxxxx` | ✅ Production |
| `STRIPE_PRICE_ID_PREMIUM_YEARLY` | `price_xxxxxxxxxxxxx` | ✅ Production |
| `FIREBASE_SERVICE_ACCOUNT_KEY` | `{"type":"service_account",...}` | ✅ Production |
| `NEXT_PUBLIC_APP_URL` | `https://your-production-domain` | ✅ Production |

### ステップ 5: 再デプロイ

環境変数を更新したら、必ず再デプロイしてください。

```bash
# Vercel CLIを使用する場合
vercel --prod
```

または、Vercelダッシュボードから「Redeploy」ボタンをクリック。

---

## ✅ 環境変数の確認方法

### 方法 1: スクリプトで確認

```bash
npm run check:env
```

このコマンドは、必要な環境変数が設定されているかをチェックします。

本番公開前は、より厳格なチェックを実行してください。このチェックは秘密値を表示せず、形式と危険な開発フラグだけを検査します。

```bash
npm run check:production-env
```

### 方法 2: 手動で確認

`.env.local`ファイルを開いて、以下の形式になっているか確認：

```bash
# Stripe
STRIPE_SECRET_KEY=sk_live_xxxxxxxxxxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx
STRIPE_PRICE_ID_PREMIUM_MONTHLY=price_xxxxxxxxxxxxx
STRIPE_PRICE_ID_PREMIUM_YEARLY=price_xxxxxxxxxxxxx

# Firebase
NEXT_PUBLIC_FIREBASE_API_KEY=xxxxxxxxxxxxx
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=xxxxxxxxxxxxx.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=xxxxxxxxxxxxx
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=xxxxxxxxxxxxx.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=xxxxxxxxxxxxx
NEXT_PUBLIC_FIREBASE_APP_ID=xxxxxxxxxxxxx
FIREBASE_SERVICE_ACCOUNT_KEY='{"type":"service_account",...}'

# OpenAI
OPENAI_API_KEY=sk-xxxxxxxxxxxxx

# その他
ANTHROPIC_API_KEY=sk-ant-xxxxxxxxxxxxx
GOOGLE_AI_API_KEY=xxxxxxxxxxxxx
ALLOW_DEV_BYPASS_AUTH=false
```

---

## 🚨 セキュリティ上の注意

### ❌ やってはいけないこと

- Secret Key（`sk_`で始まるキー）をGitにコミットする
- Secret Keyをフロントエンドのコードに含める
- Secret Keyを公開リポジトリにプッシュする
- `.env.local`をGitに含める

### ✅ やるべきこと

- Secret Keyは`.env.local`に保存し、`.gitignore`に含める
- Vercelの環境変数に安全に保存する
- Firebase FunctionsのAIキーはFunctions secretsに保存する
- 定期的にキーをローテーションする
- 不要になったキーは無効化する

### Firebase Functions secrets

Firebase Hosting / Capacitorの静的配信では、AI処理はFirebase Functionsを使います。Functions側にもAIキーを設定してください。

```bash
firebase functions:secrets:set OPENAI_API_KEY
# または
firebase functions:secrets:set ANTHROPIC_API_KEY
firebase functions:secrets:set GOOGLE_AI_API_KEY
```

Functionsを更新したら再デプロイします。

```bash
firebase deploy --only functions
```

### Firebase Hosting のビルドモード

`firebase.json` の Hosting は `out` ディレクトリを公開します。Firebase Hostingへ静的配信する場合は、通常の `npm run build` ではなく次を使ってください。

```bash
npm run build:ios
firebase deploy --only hosting
```

VercelでWebを運用する場合は通常の `npm run build` / Vercelデプロイで問題ありません。

---

## 🔧 トラブルシューティング

### 問題 1: "STRIPE_SECRET_KEY が設定されていません"

**原因:** `.env.local`に`STRIPE_SECRET_KEY`が存在しない

**解決策:**
1. Stripe Dashboardから Secret Key をコピー
2. `.env.local`に追加:
   ```bash
   STRIPE_SECRET_KEY=sk_live_xxxxxxxxxxxxx
   ```

### 問題 2: "This API call cannot be made with a publishable API key"

**原因:** `STRIPE_SECRET_KEY`に Publishable Key（`pk_`）が設定されている

**解決策:**
1. Stripe Dashboardから **Secret Key**（`sk_`で始まるキー）をコピー
2. `.env.local`の`STRIPE_SECRET_KEY`を更新
3. 開発サーバーを再起動

### 問題 3: "FIREBASE_SERVICE_ACCOUNT_KEY が設定されていません"

**原因:** Firebase Admin SDK用のサービスアカウントキーが設定されていない

**解決策:**
1. Firebase Console > Project Settings > Service Accounts
2. 「新しい秘密鍵の生成」をクリック
3. ダウンロードしたJSONファイルの内容を、1行の文字列として`.env.local`に追加:
   ```bash
   FIREBASE_SERVICE_ACCOUNT_KEY='{"type":"service_account",...}'
   ```

---

## 📚 関連ドキュメント

- [Stripe API Keys](https://stripe.com/docs/keys)
- [Stripe Webhooks](https://stripe.com/docs/webhooks)
- [Firebase Admin SDK Setup](https://firebase.google.com/docs/admin/setup)
- [Vercel Environment Variables](https://vercel.com/docs/projects/environment-variables)

---

**✅ 環境変数を正しく設定したら、スクリプトを再実行してください！**

```bash
npm run check:webhook
npm run check:subscription
```


