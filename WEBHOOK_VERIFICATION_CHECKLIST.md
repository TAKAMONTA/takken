# 🔍 Stripe Webhook 動作確認チェックリスト

このドキュメントでは、Stripe WebhookとFirestoreの連携が正しく動作しているかを確認する手順を説明します。

---

## 📋 クイックチェック

以下のコマンドを実行して、現在の状態を確認してください。

### 1️⃣ Stripeのイベント履歴を確認

```bash
npm run check:webhook
```

**確認ポイント:**
- ✅ Webhookエンドポイントが登録されているか
- ✅ 必要な3つのイベント（checkout.session.completed, customer.subscription.updated, customer.subscription.deleted）が登録されているか
- ✅ 最近のイベントが存在するか
- ✅ イベントにuserIdとplanのmetadataが含まれているか

### 2️⃣ Firestoreのサブスクリプションデータを確認

```bash
npm run check:subscription
```

**確認ポイント:**
- ✅ subscriptionsコレクションにデータが存在するか
- ✅ アクティブなプレミアムユーザーが存在するか
- ✅ plan が "premium" になっているか
- ✅ status が "active" になっているか
- ✅ stripeSubscriptionId が設定されているか
- ✅ 期間情報（currentPeriodEnd）が正しく設定されているか

### 3️⃣ 両方を一度に確認

```bash
npm run verify:webhook
```

---

## 🎯 詳細確認手順

### ステップ 1: Stripe Dashboard で確認

1. **Stripe Dashboardにアクセス**
   - URL: https://dashboard.stripe.com/webhooks

2. **Webhookエンドポイントを確認**
   - [ ] エンドポイントURL: `https://takken-study.com/api/subscription/webhook` が登録されている
   - [ ] ステータスが「有効」になっている
   - [ ] 以下の3つのイベントが登録されている:
     - [ ] `checkout.session.completed`
     - [ ] `customer.subscription.updated`
     - [ ] `customer.subscription.deleted`

3. **イベント履歴を確認**
   - [ ] 最近のイベントが存在する
   - [ ] イベントのステータスが成功（200 OK）になっている
   - [ ] 失敗したイベントがある場合、エラーメッセージを確認

---

### ステップ 2: 環境変数を確認

#### Vercel環境変数（本番環境）

1. **Vercelダッシュボードにアクセス**
   - URL: https://vercel.com/

2. **プロジェクト > Settings > Environment Variables**

3. **必要な環境変数が設定されているか確認**
   - [ ] `STRIPE_SECRET_KEY` (sk_live_... で始まる)
   - [ ] `STRIPE_WEBHOOK_SECRET` (whsec_... で始まる)
   - [ ] `FIREBASE_SERVICE_ACCOUNT_KEY` (JSON形式)

4. **本番環境に適用されているか確認**
   - [ ] Environment: `Production` にチェックが入っている

#### ローカル環境変数

1. **`.env.local` ファイルを確認**

2. **必要な環境変数が設定されているか確認**
   ```
   STRIPE_SECRET_KEY=sk_live_...
   STRIPE_WEBHOOK_SECRET=whsec_...
   FIREBASE_SERVICE_ACCOUNT_KEY={"type":"service_account",...}
   ```

---

### ステップ 3: Vercelログを確認

1. **Vercelダッシュボード > Deployments > 最新のデプロイメントを選択**

2. **「Functions」タブを確認**

3. **Webhook関連のログを検索**
   - 検索キーワード: `webhook`, `stripe`, `subscription`

4. **ログの内容を確認**

**✅ 正常なログの例:**
```
[INFO] Stripe Webhookイベント受信 { type: "checkout.session.completed", id: "evt_xxx" }
[INFO] サブスクリプション情報を保存しました { userId: "xxx", plan: "premium" }
```

**❌ エラーログの例:**
```
[ERROR] STRIPE_WEBHOOK_SECRETが設定されていません
[ERROR] Stripe Webhook署名検証エラー
[ERROR] Firestore is not initialized
```

---

### ステップ 4: Firestoreでデータを確認

1. **Firebase Consoleにアクセス**
   - URL: https://console.firebase.google.com/

2. **Firestore Database > データを確認**

3. **`subscriptions` コレクションを開く**

4. **サブスクリプションデータの内容を確認**

**確認ポイント:**
- [ ] `userId` が設定されている
- [ ] `plan` が "premium" になっている
- [ ] `status` が "active" になっている
- [ ] `stripeSubscriptionId` が設定されている (sub_... で始まる)
- [ ] `stripeCustomerId` が設定されている (cus_... で始まる)
- [ ] `currentPeriodStart` が過去の日付になっている
- [ ] `currentPeriodEnd` が未来の日付になっている
- [ ] `autoRenew` が `true` になっている
- [ ] `createdAt` と `updatedAt` が設定されている

---

### ステップ 5: エンドツーエンドテスト

#### テスト決済を実行

1. **アプリにアクセス**
   ```
   https://takken-study.com/subscription
   ```

2. **プレミアムプランを選択**

3. **Stripeテストカードで決済（テストモードの場合）**
   ```
   カード番号: 4242 4242 4242 4242
   有効期限: 任意の未来の日付（例: 12/25）
   CVC: 任意の3桁（例: 123）
   郵便番号: 任意（例: 12345）
   ```

4. **決済完了後、以下を確認**
   - [ ] 成功ページにリダイレクトされる
   - [ ] Stripe Dashboardでイベントが記録されている
   - [ ] Firestoreにデータが保存されている
   - [ ] アプリでプレミアム機能が使えるようになっている

#### アプリでの確認

1. **ログインした状態でアプリを開く**

2. **プレミアム機能の動作を確認**
   - [ ] 広告が表示されない
   - [ ] AI機能が無制限で使える
   - [ ] 過去問が全年度アクセスできる
   - [ ] プレミアムバッジが表示されている

---

## 🔧 トラブルシューティング

### 問題 1: Webhookイベントが失敗している（400エラー）

**症状:**
- Stripe Dashboardで400エラーが表示される
- ログに「署名検証エラー」が記録されている

**原因:**
- Webhook Secretが正しく設定されていない
- Webhook Secretが古い（エンドポイントを再作成した場合）

**解決策:**
1. Stripe DashboardからWebhook Secretをコピー
2. Vercelの環境変数 `STRIPE_WEBHOOK_SECRET` を更新
3. Vercelで再デプロイ

---

### 問題 2: Webhookイベントが失敗している（500エラー）

**症状:**
- Stripe Dashboardで500エラーが表示される
- ログに「Firestore is not initialized」等のエラーが記録されている

**原因:**
- Firebase Admin SDKの初期化に失敗している
- FIREBASE_SERVICE_ACCOUNT_KEY が正しく設定されていない

**解決策:**
1. Vercelログでエラーメッセージを確認
2. `FIREBASE_SERVICE_ACCOUNT_KEY` が正しいJSON形式か確認
3. Firebase Service Accountの権限を確認
4. Vercelで再デプロイ

---

### 問題 3: Firestoreにデータが保存されない

**症状:**
- Webhookは成功（200 OK）しているが、Firestoreにデータがない
- ログに「サブスクリプション情報を保存しました」が記録されていない

**原因:**
- Webhook処理中にエラーが発生している
- userIdがmetadataに含まれていない

**解決策:**
1. Vercelログで詳細なエラーメッセージを確認
2. Checkoutセッション作成時にmetadata（userId, plan）を設定しているか確認
3. Firebase Admin SDKの権限を確認

---

### 問題 4: アプリでプレミアム機能が使えない

**症状:**
- Firestoreにはデータが保存されているが、アプリで反映されない
- 広告が表示される、AI機能が制限される

**原因:**
- クライアント側でサブスクリプション状態の取得に失敗している
- キャッシュが古い

**解決策:**
1. ブラウザのキャッシュをクリア
2. ログアウト/ログインを試す
3. `useSubscription` フックでデータが正しく取得されているか確認（開発者ツールで確認）
4. Firestoreのセキュリティルールを確認

---

## 📊 正常動作フロー

```
[ユーザー] 決済ボタンをクリック
    ↓
[アプリ] Stripe Checkoutセッション作成
    ↓ (metadata: userId, plan)
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
[Webhook API] userIdをmetadataから取得
    ↓
[Webhook API] Stripeからサブスクリプション情報を取得
    ↓
[Webhook API] Firestoreにサブスクリプション情報を保存 ✓
    ↓ (subscriptions/{userId})
[Webhook API] 200レスポンスをStripeに返す
    ↓
[アプリ] 成功ページにリダイレクト
    ↓
[アプリ] Firestoreからサブスクリプション状態を取得
    ↓
[アプリ] プレミアム機能を有効化 ✓
```

---

## 📖 関連ドキュメント

- **詳細ガイド:** [`scripts/verify-webhook-status.md`](scripts/verify-webhook-status.md)
- **Webhook設定ガイド:** [`docs/STRIPE_WEBHOOK_SETUP_GUIDE.md`](docs/STRIPE_WEBHOOK_SETUP_GUIDE.md)
- **Webhook実装:** [`app/api/subscription/webhook/route.ts`](app/api/subscription/webhook/route.ts)

---

## ✅ 完了チェック

すべての項目をチェックできたら、Webhook とFirestoreの連携は正常に動作しています！

- [ ] Webhookエンドポイントが登録されている
- [ ] 必要なイベントタイプが登録されている
- [ ] 環境変数が正しく設定されている
- [ ] 最近のイベントが成功（200 OK）している
- [ ] Firestoreにデータが保存されている
- [ ] アプリでプレミアム機能が使える
- [ ] テスト決済でエンドツーエンドの動作を確認済み

---

**🎉 すべて完了したら、本番運用の準備完了です！**



