# 🔍 Webhook デバッグガイド

## 📊 現在の状況

### ✅ 確認済み

1. **Stripe側**
   - ✅ Webhookエンドポイントが設定されている
   - ✅ 必要なイベントが登録されている
   - ✅ 決済イベント（checkout.session.completed）が記録されている
   - ✅ メタデータ（userId, plan）が正しく設定されている

2. **環境変数**
   - ✅ STRIPE_SECRET_KEY が正しく設定されている（sk_live_...）
   - ✅ FIREBASE_SERVICE_ACCOUNT_KEY が設定されている（BASE64エンコード済み）

### ❌ 問題点

3. **Firestore**
   - ❌ `subscriptions`コレクションにデータが存在しない
   - ❌ Webhookからのデータ保存が行われていない

---

## 🎯 問題の原因を特定する手順

### ステップ 1: Stripe Dashboard でWebhook配信ログを確認

#### 1-1. Stripe Dashboardにアクセス

https://dashboard.stripe.com/webhooks

#### 1-2. Webhookエンドポイントを選択

`https://takken-study.com/api/subscription/webhook` をクリック

#### 1-3. 「イベント」タブを開く

最近のイベントの配信状況を確認します。

#### 1-4. 各イベントの詳細を確認

特に `checkout.session.completed` イベント（2025/12/21 13:06:47）をクリックして確認：

**確認ポイント:**

1. **配信状態**
   - ✅ 成功（200 OK）: Webhookが正常に配信された
   - ❌ 失敗（400, 500等）: エラーが発生している

2. **レスポンス内容**
   - 成功の場合: `{"received": true}` が返されているか
   - 失敗の場合: エラーメッセージを確認

3. **配信の試行回数**
   - 複数回試行されている場合: 一時的なエラーの可能性
   - 1回のみ: 初回から失敗している可能性

4. **イベントのペイロード**
   - metadata に userId と plan が含まれているか確認:
     ```json
     {
       "metadata": {
         "userId": "user-1766203482784",
         "plan": "premium",
         "yearly": "false"
       }
     }
     ```

---

### ステップ 2: Vercelデプロイメントログを確認

#### 2-1. Vercelダッシュボードにアクセス

https://vercel.com/

#### 2-2. プロジェクトを選択

#### 2-3. 最新のデプロイメントを選択

「Deployments」タブから、最新のデプロイメントをクリック

#### 2-4. 「Functions」タブを開く

#### 2-5. Webhook関連のログを検索

検索キーワード:
- `webhook`
- `subscription`
- `checkout.session.completed`
- `user-1766203482784`（決済したユーザーID）

#### 2-6. ログの内容を確認

**✅ 正常なログの例:**
```
[INFO] Stripe Webhookイベント受信 { type: "checkout.session.completed", id: "evt_xxx" }
[INFO] サブスクリプション情報を保存しました { userId: "user-1766203482784", plan: "premium" }
```

**❌ エラーログの例:**
```
[ERROR] STRIPE_WEBHOOK_SECRETが設定されていません
[ERROR] Stripe Webhook署名検証エラー
[ERROR] Firestore is not initialized
[ERROR] CheckoutセッションにuserIdが含まれていません
[ERROR] Firebase Admin SDK初期化エラー
```

---

### ステップ 3: 可能性のある問題と解決策

#### 問題 1: Webhookが配信されていない

**症状:** 
- Stripe Dashboardで「未配信」または「配信試行なし」となっている

**原因:**
- Webhookエンドポイントが無効になっている
- StripeがWebhookを送信していない

**解決策:**
1. Webhookエンドポイントのステータスを「有効」にする
2. テストイベントを送信して確認

#### 問題 2: Webhook署名検証エラー（400エラー）

**症状:**
- Stripe Dashboardで400エラーが表示される
- 「署名検証に失敗しました」のエラーメッセージ

**原因:**
- `STRIPE_WEBHOOK_SECRET` が間違っている
- Vercelの環境変数が更新されていない

**解決策:**
1. Stripe DashboardからWebhook Secretを再コピー
2. Vercelの環境変数 `STRIPE_WEBHOOK_SECRET` を更新
3. Vercelで再デプロイ

**確認コマンド:**
```bash
# Vercel CLIで環境変数を確認
vercel env ls

# 環境変数を追加/更新
vercel env add STRIPE_WEBHOOK_SECRET production
```

#### 問題 3: Firestore初期化エラー（500エラー）

**症状:**
- Stripe Dashboardで500エラーが表示される
- Vercelログに「Firestore is not initialized」

**原因:**
- `FIREBASE_SERVICE_ACCOUNT_KEY` が正しく設定されていない
- Firebase Admin SDKの初期化に失敗

**解決策:**
1. Vercelの環境変数 `FIREBASE_SERVICE_ACCOUNT_KEY` を確認
2. BASE64エンコードされた値が正しいか確認
3. Vercelで再デプロイ

**環境変数の設定方法:**
```bash
# Firebase Service Account Keyの取得
# 1. Firebase Console > Project Settings > Service Accounts
# 2. 「新しい秘密鍵の生成」をクリック
# 3. ダウンロードしたJSONファイルをBASE64エンコード

# Windows（PowerShell）:
$content = Get-Content -Path serviceAccountKey.json -Raw
$bytes = [System.Text.Encoding]::UTF8.GetBytes($content)
$base64 = [System.Convert]::ToBase64String($bytes)
Write-Output $base64

# Mac/Linux:
base64 -i serviceAccountKey.json | tr -d '\n'

# Vercelに設定:
vercel env add FIREBASE_SERVICE_ACCOUNT_KEY production
# → 上記でコピーしたBASE64文字列を貼り付け
```

#### 問題 4: metadataにuserIdが含まれていない

**症状:**
- Vercelログに「CheckoutセッションにuserIdが含まれていません」

**原因:**
- Checkoutセッション作成時にmetadataを設定していない

**解決策:**
1. Checkoutセッション作成のコードを確認
2. metadataに`userId`と`plan`を設定

**コード例:**
```typescript
// app/api/subscription/create-checkout-session/route.ts
const session = await stripe.checkout.sessions.create({
  // ... other parameters ...
  metadata: {
    userId: userId,
    plan: 'premium',
    yearly: 'false',
  },
});
```

#### 問題 5: Webhookエンドポイントが重複している

**症状:**
- 2個のWebhookエンドポイントが設定されている
- どちらか一方のみが動作している

**原因:**
- 古いWebhookエンドポイントが残っている
- Webhook Secretが異なる

**解決策:**
1. Stripe Dashboardで古いエンドポイントを削除
2. 使用中のエンドポイントのWebhook Secretを確認
3. Vercelの環境変数を更新

---

### ステップ 4: 手動テストでWebhookの動作を確認

#### 4-1. Stripe CLIをインストール（オプション）

https://stripe.com/docs/stripe-cli

#### 4-2. ローカルでWebhookをテスト

```bash
# Stripe CLIでログイン
stripe login

# Webhookイベントをローカルにフォワード
stripe listen --forward-to localhost:3000/api/subscription/webhook

# テストイベントを送信
stripe trigger checkout.session.completed
```

#### 4-3. Stripe Dashboardからテストイベントを送信

1. https://dashboard.stripe.com/webhooks にアクセス
2. Webhookエンドポイントを選択
3. 「テストイベントを送信」をクリック
4. `checkout.session.completed` を選択
5. イベントのJSONを編集（metadataを追加）:
   ```json
   {
     "data": {
       "object": {
         "id": "cs_test_xxx",
         "metadata": {
           "userId": "test-user-123",
           "plan": "premium",
           "yearly": "false"
         },
         "subscription": "sub_test_xxx"
       }
     }
   }
   ```
6. 「イベントを送信」をクリック
7. Vercelログを確認

---

## 📋 チェックリスト

### Stripe Dashboard

- [ ] Webhookエンドポイントが「有効」になっている
- [ ] 2個のエンドポイントのうち、正しいものが有効
- [ ] checkout.session.completedイベントの配信状態が「成功（200）」
- [ ] イベントのペイロードにmetadata（userId, plan）が含まれている
- [ ] レスポンスが`{"received": true}`になっている

### Vercel環境変数

- [ ] `STRIPE_SECRET_KEY` が設定されている（sk_live_...）
- [ ] `STRIPE_WEBHOOK_SECRET` が設定されている（whsec_...）
- [ ] `FIREBASE_SERVICE_ACCOUNT_KEY` が設定されている（BASE64）
- [ ] すべての環境変数が「Production」に適用されている
- [ ] 環境変数更新後に再デプロイ済み

### Vercelログ

- [ ] Webhookイベント受信のログがある
- [ ] エラーログがない
- [ ] 「サブスクリプション情報を保存しました」のログがある

---

## 🆘 それでも解決しない場合

### 最終手段: Webhookエンドポイントを再作成

1. **現在のWebhookエンドポイントを削除**
   - Stripe Dashboard > Webhooks
   - 古いエンドポイントを削除

2. **新しいWebhookエンドポイントを作成**
   - 「送信先を追加する」をクリック
   - URL: `https://takken-study.com/api/subscription/webhook`
   - イベントを選択:
     - `checkout.session.completed`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`

3. **新しいWebhook Secretをコピー**
   - 作成後、Webhook Secretをコピー

4. **Vercelの環境変数を更新**
   ```bash
   vercel env rm STRIPE_WEBHOOK_SECRET production
   vercel env add STRIPE_WEBHOOK_SECRET production
   # → 新しいWebhook Secretを貼り付け
   ```

5. **Vercelで再デプロイ**

6. **テスト決済を実行**
   - 新しいテストカードで決済を実行
   - Firestoreにデータが保存されるか確認

---

## 📞 次のステップ

1. **Stripe Dashboardでイベント配信ログを確認**
   - 成功（200）か失敗（400/500）かを確認

2. **Vercelログを確認**
   - エラーメッセージを特定

3. **問題に応じて解決策を実施**

4. **再度確認**
   ```bash
   npm run verify:webhook
   ```

---

**重要:** Stripe Dashboardとしてログを確認した結果を教えてください。それに基づいて、具体的な解決策を提案します。



