# 📊 Webhook動作確認 - 中間レポート

**更新日時:** 2025年12月22日  
**ステータス:** 🟡 **調査中 - Webhook配信ログの確認が必要**

---

## ✅ 確認完了項目

### 1. Stripe イベント確認 ✅

**結果:** 正常に記録されています

- ✅ Webhookエンドポイント: 2個設定済み
- ✅ 必要なイベント: 3個登録済み
  - `checkout.session.completed`
  - `customer.subscription.updated`
  - `customer.subscription.deleted`
- ✅ 決済イベント記録: 2025/12/21 13:06:47
- ✅ 支払い状態: **paid**
- ✅ メタデータ:
  - `userId: user-1766203482784`
  - `plan: premium`
  - `yearly: false`
- ✅ サブスクリプションID: `sub_1Sgdur5KRLoxjqPcZggbSL64`

### 2. 環境変数確認 ✅

**結果:** 正しく設定されています

- ✅ `STRIPE_SECRET_KEY`: `sk_live_...` (Secret Key)
- ✅ `FIREBASE_SERVICE_ACCOUNT_KEY`: BASE64エンコード済み

### 3. Firestore データ確認 ❌

**結果:** データが存在しません

- ❌ `subscriptions`コレクションが空
- ❌ Webhookからのデータ保存が行われていない

---

## 🔴 発見された問題

### 問題: Webhook処理でデータがFirestoreに保存されていない

**症状:**
- Stripeには決済イベントが記録されている
- しかし、Firestoreにサブスクリプションデータが存在しない

**可能性のある原因:**

1. **Webhookが配信されていない**
   - Stripeからアプリケーションへの配信に失敗している
   - エンドポイントURLが間違っている

2. **Webhook署名検証エラー（400エラー）**
   - `STRIPE_WEBHOOK_SECRET`が間違っている
   - Vercelの環境変数が更新されていない

3. **Firestore初期化エラー（500エラー）**
   - Firebase Admin SDKの初期化に失敗
   - `FIREBASE_SERVICE_ACCOUNT_KEY`が正しく設定されていない

4. **metadata取得エラー**
   - CheckoutセッションのmetadataからuserIdが取得できない

---

## 🎯 次のステップ

### 優先度：最高 🔴

#### ステップ 1: Stripe Dashboard でWebhook配信ログを確認

1. **Stripe Dashboardにアクセス**
   - https://dashboard.stripe.com/webhooks

2. **Webhookエンドポイントを選択**
   - `https://takken-study.com/api/subscription/webhook` をクリック

3. **「イベント」タブを開く**

4. **checkout.session.completed イベント（2025/12/21 13:06:47）をクリック**

5. **配信状態を確認**
   - ✅ 成功（200 OK）: 配信は成功しているが、処理に問題がある
   - ❌ 失敗（400/500）: 配信時にエラーが発生している
   - ❓ 未配信: Webhookが送信されていない

6. **レスポンス内容を確認**
   - 成功の場合: `{"received": true}`
   - 失敗の場合: エラーメッセージをコピー

**📸 スクリーンショットをお願いします:**
- Webhook配信ログの画面
- イベント詳細の画面
- レスポンス内容

---

#### ステップ 2: Vercel デプロイメントログを確認

1. **Vercelダッシュボードにアクセス**
   - https://vercel.com/

2. **プロジェクトを選択**

3. **「Deployments」> 最新のデプロイメント > 「Functions」タブ**

4. **検索キーワード:**
   - `webhook`
   - `user-1766203482784`
   - `checkout.session.completed`

5. **ログの種類を確認**
   - ✅ `[INFO] Stripe Webhookイベント受信`
   - ✅ `[INFO] サブスクリプション情報を保存しました`
   - ❌ `[ERROR]` で始まるエラーログ

**📸 スクリーンショットをお願いします:**
- Vercelのログ画面（該当する時間帯: 2025/12/21 13:06-13:10頃）

---

## 📚 作成したデバッグツール

以下のドキュメントを参照してください：

1. **🔍 詳細なデバッグガイド**
   - [`WEBHOOK_DEBUG_GUIDE.md`](WEBHOOK_DEBUG_GUIDE.md)
   - 問題の原因と解決策の詳細

2. **📋 確認チェックリスト**
   - [`WEBHOOK_VERIFICATION_CHECKLIST.md`](WEBHOOK_VERIFICATION_CHECKLIST.md)
   - ステップバイステップの確認手順

3. **🔐 環境変数設定ガイド**
   - [`docs/ENV_VARIABLES_GUIDE.md`](docs/ENV_VARIABLES_GUIDE.md)
   - 環境変数の設定方法

---

## 💡 よくある原因と解決策

### ケース 1: STRIPE_WEBHOOK_SECRET が Vercelに設定されていない

**確認方法:**
```bash
vercel env ls
```

**解決方法:**
```bash
vercel env add STRIPE_WEBHOOK_SECRET production
# → Stripe DashboardからWebhook Secretをコピーして貼り付け
vercel --prod
```

---

### ケース 2: Webhook配信が本番URLではなくローカルURLに送られている

**症状:** Stripe Dashboardで「未配信」または「タイムアウト」

**解決方法:**
1. Stripe Dashboard > Webhooks
2. エンドポイントURLを確認
3. `https://takken-study.com/api/subscription/webhook` になっているか確認
4. `http://localhost:3000/...` になっている場合は削除して再作成

---

### ケース 3: 複数のWebhookエンドポイントが競合している

**症状:** 2個のエンドポイントが設定されており、どちらも異なるWebhook Secretを持っている

**解決方法:**
1. 使用していないエンドポイントを削除
2. 使用中のエンドポイントのWebhook Secretを確認
3. Vercelの環境変数を更新

---

## 📊 進捗状況

| タスク | ステータス |
|-------|----------|
| 1. Stripe設定確認 | ✅ 完了 |
| 2. 環境変数確認 | ✅ 完了 |
| 3. Firestoreデータ確認 | ✅ 完了（データなし） |
| 4. Webhook配信ログ確認 | ⏳ 実施中 |
| 5. Vercelログ確認 | ⏳ 実施中 |
| 6. 問題の特定と修正 | ⏳ 待機中 |
| 7. 再テスト | ⏳ 待機中 |

**進捗率:** 🔵🔵🔵⚪⚪⚪⚪ (3/7 = 43%)

---

## 🆘 サポートが必要な情報

以下の情報を確認してお知らせください：

### Stripe Dashboard

- [ ] Webhook配信ログのスクリーンショット
- [ ] checkout.session.completedイベントの詳細
- [ ] 配信状態（成功/失敗/未配信）
- [ ] レスポンス内容またはエラーメッセージ

### Vercel Dashboard

- [ ] 2025/12/21 13:06-13:10頃のログ
- [ ] Webhook関連のエラーログ
- [ ] 環境変数の設定状態（値は不要、設定されているかのみ）

---

## 📞 次のアクション

1. **Stripe DashboardでWebhook配信ログを確認**
2. **Vercelログを確認**
3. **結果を報告**
4. **問題に応じた解決策を実施**

---

**🔍 確認後、結果をお知らせください。それに基づいて、具体的な修正方法を提案します！**



