# Stripe Webhook 動作確認ガイド

## 📋 確認項目チェックリスト

このドキュメントでは、Stripe WebhookがFirestoreに正しくデータを更新しているかを確認する手順を説明します。

---

## ✅ 1. Stripe Dashboard でWebhook設定を確認

### 手順

1. **Stripe Dashboardにアクセス**
   ```
   https://dashboard.stripe.com/webhooks
   ```

2. **Webhookエンドポイントを確認**
   - エンドポイントURL: `https://takken-study.com/api/subscription/webhook`
   - 状態: 「有効」になっているか確認

3. **登録されているイベントを確認**
   - ✅ `checkout.session.completed`
   - ✅ `customer.subscription.updated`
   - ✅ `customer.subscription.deleted`

4. **署名シークレット（Webhook Secret）を確認**
   - `whsec_...` で始まるシークレットキーをコピー
   - Vercelの環境変数 `STRIPE_WEBHOOK_SECRET` に設定されているか確認

---

## ✅ 2. Webhookイベント履歴を確認

### 手順

1. **Stripe Dashboard > Webhooks > エンドポイントを選択**

2. **「イベント」タブを確認**
   - 最近のイベントが表示されているか確認
   - 各イベントのステータスを確認:
     - ✅ 成功: 緑色のチェックマーク
     - ❌ 失敗: 赤色のXマーク

3. **失敗したイベントがある場合**
   - イベントをクリックして詳細を確認
   - レスポンスコードとエラーメッセージを確認:
     - `200`: 成功
     - `400`: 署名検証エラー
     - `500`: サーバーエラー

4. **イベントの詳細を確認**
   ```json
   {
     "id": "evt_xxx",
     "type": "checkout.session.completed",
     "data": {
       "object": {
         "id": "cs_xxx",
         "metadata": {
           "userId": "ユーザーID",
           "plan": "premium"
         }
       }
     }
   }
   ```

---

## ✅ 3. Vercel環境変数を確認

### 手順

1. **Vercelダッシュボードにアクセス**
   ```
   https://vercel.com/
   ```

2. **プロジェクトを選択 > Settings > Environment Variables**

3. **必要な環境変数が設定されているか確認**
   - ✅ `STRIPE_SECRET_KEY` (sk_live_... で始まる)
   - ✅ `STRIPE_WEBHOOK_SECRET` (whsec_... で始まる)
   - ✅ `FIREBASE_SERVICE_ACCOUNT_KEY` (JSON形式)

4. **本番環境に適用されているか確認**
   - Environment: `Production` にチェックが入っているか

---

## ✅ 4. Vercelデプロイメントログを確認

### 手順

1. **Vercelダッシュボード > Deployments > 最新のデプロイメントを選択**

2. **「Functions」タブを確認**
   - Webhook関連のログを探す
   - 検索: `webhook`, `stripe`, `subscription`

3. **ログの内容を確認**
   ```
   ✅ 正常なログの例:
   [INFO] Stripe Webhookイベント受信 { type: "checkout.session.completed", id: "evt_xxx" }
   [INFO] サブスクリプション情報を保存しました { userId: "xxx", plan: "premium" }
   
   ❌ エラーログの例:
   [ERROR] STRIPE_WEBHOOK_SECRETが設定されていません
   [ERROR] Stripe Webhook署名検証エラー
   [ERROR] Firestore is not initialized
   ```

---

## ✅ 5. Firestoreでデータを確認

### 手順

1. **Firebase Consoleにアクセス**
   ```
   https://console.firebase.google.com/
   ```

2. **Firestore Database > データを確認**

3. **`subscriptions` コレクションを開く**

4. **決済を行ったユーザーのドキュメントを確認**
   ```
   subscriptions/{userId}
   ```

5. **保存されているデータを確認**
   ```json
   {
     "userId": "ユーザーID",
     "plan": "premium",
     "planId": "premium",
     "status": "active",
     "stripeSubscriptionId": "sub_xxx",
     "stripeCustomerId": "cus_xxx",
     "currentPeriodStart": "2025-12-22T00:00:00Z",
     "currentPeriodEnd": "2026-01-22T00:00:00Z",
     "startDate": "2025-12-22T00:00:00Z",
     "endDate": "2026-01-22T00:00:00Z",
     "cancelAtPeriodEnd": false,
     "autoRenew": true,
     "createdAt": "2025-12-22T00:00:00Z",
     "updatedAt": "2025-12-22T00:00:00Z"
   }
   ```

### 確認ポイント

- ✅ `plan` が `premium` になっているか
- ✅ `status` が `active` になっているか
- ✅ `stripeSubscriptionId` が設定されているか
- ✅ `currentPeriodEnd` が未来の日付になっているか
- ✅ `autoRenew` が `true` になっているか

---

## ✅ 6. テスト決済を実行

### 手順

1. **アプリにアクセス**
   ```
   https://takken-study.com/subscription
   ```

2. **プレミアムプランを選択**

3. **Stripeテストカードで決済**
   ```
   カード番号: 4242 4242 4242 4242
   有効期限: 任意の未来の日付（例: 12/25）
   CVC: 任意の3桁（例: 123）
   郵便番号: 任意（例: 12345）
   ```

4. **決済完了後、以下を確認**
   - ✅ 成功ページにリダイレクトされるか
   - ✅ Stripe Dashboardでイベントが記録されているか
   - ✅ Firestoreにデータが保存されているか
   - ✅ アプリでプレミアム機能が使えるようになっているか

---

## 🔍 トラブルシューティング

### ケース1: Webhookイベントが失敗している（400エラー）

**原因**: 署名検証エラー

**解決策**:
1. Stripe DashboardからWebhook Secretをコピー
2. Vercelの環境変数 `STRIPE_WEBHOOK_SECRET` を更新
3. Vercelで再デプロイ

### ケース2: Webhookイベントが失敗している（500エラー）

**原因**: サーバーエラー（Firestore初期化失敗など）

**解決策**:
1. Vercelログを確認してエラーメッセージを特定
2. `FIREBASE_SERVICE_ACCOUNT_KEY` が正しく設定されているか確認
3. Firebase Admin SDKが正しく初期化されているか確認

### ケース3: Firestoreにデータが保存されない

**原因**: Webhook処理は成功しているが、Firestoreへの書き込みが失敗

**解決策**:
1. Firestore Rulesを確認（Admin SDKは制限を受けないはずだが念のため）
2. Vercelログで `saveUserSubscription` 関連のエラーを確認
3. Firebase Service Accountの権限を確認

### ケース4: データは保存されているが、アプリで反映されない

**原因**: クライアント側のサブスクリプション状態の取得に失敗

**解決策**:
1. ブラウザのキャッシュをクリア
2. ログアウト/ログインを試す
3. `useSubscription` フックでデータが正しく取得されているか確認

---

## 📊 正常動作の確認フロー

```
[ユーザー] 決済ボタンをクリック
    ↓
[アプリ] Stripe Checkoutセッション作成
    ↓
[Stripe] 決済ページを表示
    ↓
[ユーザー] カード情報を入力して決済
    ↓
[Stripe] 決済を処理
    ↓
[Stripe] Webhookイベントを送信
    ↓ (checkout.session.completed)
[Webhook API] イベントを受信
    ↓
[Webhook API] 署名を検証 ✓
    ↓
[Webhook API] handleCheckoutSessionCompleted() を実行
    ↓
[Webhook API] Firestoreにサブスクリプション情報を保存 ✓
    ↓
[Webhook API] 200レスポンスをStripeに返す
    ↓
[アプリ] 成功ページにリダイレクト
    ↓
[アプリ] Firestoreからサブスクリプション状態を取得
    ↓
[アプリ] プレミアム機能を有効化 ✓
```

---

## 📝 確認結果の記録

### Webhook設定状態
- [ ] Webhookエンドポイントが登録されている
- [ ] 3つのイベントタイプが登録されている
- [ ] Webhook Secretが設定されている

### イベント履歴
- [ ] 最近のイベントが存在する
- [ ] すべてのイベントが成功（200）している
- [ ] イベントのmetadataにuserIdとplanが含まれている

### 環境変数
- [ ] STRIPE_SECRET_KEY が設定されている
- [ ] STRIPE_WEBHOOK_SECRET が設定されている
- [ ] FIREBASE_SERVICE_ACCOUNT_KEY が設定されている

### Firestoreデータ
- [ ] subscriptions コレクションにデータが存在する
- [ ] plan が "premium" になっている
- [ ] status が "active" になっている
- [ ] stripeSubscriptionId が設定されている
- [ ] 期間情報が正しく設定されている

### アプリ動作
- [ ] 決済完了後に成功ページが表示される
- [ ] プレミアム機能が使えるようになる
- [ ] 広告が非表示になる
- [ ] AI機能が無制限で使える

---

## 🎉 完了！

すべての項目にチェックが入れば、Webhook とFirestoreの連携は正常に動作しています！



