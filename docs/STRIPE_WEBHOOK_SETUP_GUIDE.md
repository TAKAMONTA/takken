# Stripe Webhook設定ガイド

## 📋 概要

このガイドでは、実装済みのStripe WebhookエンドポイントをStripeダッシュボードで設定する手順を説明します。

## ✅ 実装済み機能

以下のWebhookイベントが処理されます：

- **`checkout.session.completed`**: 決済完了時
- **`customer.subscription.updated`**: サブスクリプション更新時
- **`customer.subscription.deleted`**: サブスクリプションキャンセル時

## 🚀 設定手順

### ステップ 1: StripeダッシュボードでWebhookエンドポイントを追加

1. **Stripeダッシュボードにログイン**
   - https://dashboard.stripe.com/ にアクセス

2. **Webhookセクションに移動**
   - 左側メニューから「**開発者**」→「**Webhook**」を選択
   - または直接: https://dashboard.stripe.com/webhooks

3. **送信先を追加**
   - 「**+ 送信先を追加する**」ボタンをクリック

4. **エンドポイントURLを入力**
   ```
   本番環境:
   https://takken-study.com/api/subscription/webhook
   
   開発環境（ローカルテスト用）:
   http://localhost:3000/api/subscription/webhook
   ```

5. **イベントを選択**
   以下の3つのイベントを選択してください：
   - ✅ `checkout.session.completed`
   - ✅ `customer.subscription.updated`
   - ✅ `customer.subscription.deleted`

6. **送信先を追加**
   - 「**送信先を追加**」ボタンをクリック

### ステップ 2: Webhookシークレットを取得

1. **Webhookエンドポイントの詳細ページを開く**
   - 追加したWebhookエンドポイントをクリック

2. **署名シークレットをコピー**
   - 「**署名シークレット**」セクションから `whsec_...` で始まるシークレットをコピー

3. **環境変数に設定**
   ```bash
   # .env.local または本番環境の環境変数に追加
   STRIPE_WEBHOOK_SECRET=whsec_...
   ```

### ステップ 3: ローカル環境でのテスト（開発時）

#### 方法1: Stripe CLIを使用（推奨）

1. **Stripe CLIをインストール**
   ```bash
   # Windows (Scoop)
   scoop install stripe
   
   # または公式サイトからダウンロード
   # https://stripe.com/docs/stripe-cli
   ```

2. **Stripe CLIにログイン**
   ```bash
   stripe login
   ```

3. **ローカルリスナーを起動**
   ```bash
   stripe listen --forward-to localhost:3000/api/subscription/webhook
   ```

4. **Webhookシークレットを取得**
   - コマンド実行後、`whsec_...` で始まるシークレットが表示されます
   - これを `.env.local` の `STRIPE_WEBHOOK_SECRET` に設定

5. **テストイベントを送信**
   ```bash
   # 別のターミナルで実行
   stripe trigger checkout.session.completed
   ```

#### 方法2: Stripeダッシュボードのローカルリスナー機能を使用

1. **StripeダッシュボードのWebhookページで「ローカルリスナーでテストする」をクリック**
   - 画面下部の「ローカルリスナーでテストする」ボタンを使用

2. **ローカル開発サーバーを起動**
   ```bash
   npm run dev
   ```

3. **テストイベントを送信**
   - Stripeダッシュボードから手動でイベントを送信
   - または Stripe CLI で `stripe trigger` コマンドを使用

### ステップ 4: 本番環境での設定

1. **本番環境のWebhookエンドポイントを追加**
   ```
   URL: https://takken-study.com/api/subscription/webhook
   ```

2. **環境変数を設定**
   - Vercel/Netlify等の環境変数設定で以下を追加：
     ```
     STRIPE_SECRET_KEY=sk_live_...
     STRIPE_WEBHOOK_SECRET=whsec_...
     NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
     ```

3. **動作確認**
   - テスト決済を実行して、Webhookが正しく動作するか確認
   - Stripeダッシュボードの「イベント」タブでWebhookの送信状況を確認

## 🔍 動作確認方法

### 1. Webhookイベントの確認

Stripeダッシュボードで以下を確認：

1. **「開発者」→「イベント」** に移動
2. 送信されたイベントの一覧を確認
3. 各イベントをクリックして詳細を確認
   - ✅ 成功: ステータスが「成功」になっている
   - ❌ 失敗: エラーメッセージを確認

### 2. Firestoreの確認

Firebase Consoleで以下を確認：

1. **Firestore Database** に移動
2. **`subscriptions`** コレクションを確認
3. ユーザーIDをキーとして、サブスクリプション情報が保存されているか確認
   ```json
   {
     "userId": "user_xxx",
     "plan": "premium",
     "status": "active",
     "stripeSubscriptionId": "sub_xxx",
     "currentPeriodStart": "2025-01-27T...",
     "currentPeriodEnd": "2025-02-27T...",
     ...
   }
   ```

### 3. ログの確認

アプリケーションのログで以下を確認：

- ✅ `Stripe Webhookイベント受信` - イベントが受信された
- ✅ `サブスクリプション情報を保存しました` - 決済完了時
- ✅ `サブスクリプション情報を更新しました` - 更新時
- ✅ `サブスクリプションをキャンセルしました` - キャンセル時

## ⚠️ トラブルシューティング

### 問題1: Webhookが受信されない

**原因と対処法:**

1. **URLが正しいか確認**
   - 本番環境: `https://takken-study.com/api/subscription/webhook`
   - 開発環境: `http://localhost:3000/api/subscription/webhook`

2. **サーバーが起動しているか確認**
   ```bash
   npm run dev
   ```

3. **ファイアウォールやネットワーク設定を確認**
   - ローカル環境では、Stripe CLIのフォワーディング機能を使用

### 問題2: 署名検証エラー

**エラーメッセージ:**
```
署名検証に失敗しました
```

**対処法:**

1. **`STRIPE_WEBHOOK_SECRET`が正しく設定されているか確認**
   ```bash
   # .env.local を確認
   STRIPE_WEBHOOK_SECRET=whsec_...
   ```

2. **Webhookシークレットが正しいか確認**
   - Stripeダッシュボードで、該当するWebhookエンドポイントの「署名シークレット」を確認
   - テスト環境と本番環境で異なるシークレットを使用している可能性があります

3. **環境変数が読み込まれているか確認**
   ```bash
   # 開発サーバーを再起動
   npm run dev
   ```

### 問題3: Firestoreへの保存が失敗する

**エラーメッセージ:**
```
Firebase Admin SDK初期化エラー
```

**対処法:**

1. **Firebase Admin SDKの認証情報を確認**
   ```bash
   # .env.local または環境変数に以下を設定
   FIREBASE_SERVICE_ACCOUNT_KEY={"type":"service_account",...}
   # または
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   ```

2. **Firestoreのセキュリティルールを確認**
   - `subscriptions`コレクションへの書き込み権限があるか確認

### 問題4: イベントが処理されない

**対処法:**

1. **イベントタイプが正しく選択されているか確認**
   - Stripeダッシュボードで、Webhookエンドポイントの「イベント」タブを確認
   - 必要な3つのイベントが選択されているか確認

2. **ログを確認**
   - アプリケーションのログで、イベントが受信されているか確認
   - `未処理のStripe Webhookイベント` というログが出ていないか確認

## 📝 チェックリスト

### 開発環境

- [ ] Stripe CLIがインストールされている
- [ ] `STRIPE_WEBHOOK_SECRET`が設定されている（ローカル用）
- [ ] ローカル開発サーバーが起動している
- [ ] `stripe listen`コマンドでフォワーディングが動作している
- [ ] テストイベントが正しく処理される

### 本番環境

- [ ] Webhookエンドポイントが追加されている
- [ ] 3つのイベントが選択されている
- [ ] `STRIPE_WEBHOOK_SECRET`が設定されている（本番用）
- [ ] `STRIPE_SECRET_KEY`が本番キー（`sk_live_...`）に設定されている
- [ ] テスト決済でWebhookが動作することを確認
- [ ] Firestoreにサブスクリプション情報が保存されることを確認

## 🔗 関連リンク

- [Stripe Webhook ドキュメント](https://stripe.com/docs/webhooks)
- [Stripe CLI ドキュメント](https://stripe.com/docs/stripe-cli)
- [実装コード: `app/api/subscription/webhook/route.ts`](../app/api/subscription/webhook/route.ts)

## 📞 サポート

問題が解決しない場合は、以下を確認してください：

1. Stripeダッシュボードの「イベント」タブでエラー詳細を確認
2. アプリケーションのログを確認
3. Firestoreのセキュリティルールを確認


