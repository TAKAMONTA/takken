# 🚨 緊急修正が必要：Stripe API Key の設定エラー

## 問題の概要

`.env.local`ファイルの`STRIPE_SECRET_KEY`に、**Publishable Key**（公開可能キー）が設定されています。
これは**Secret Key**（秘密キー）を設定する必要があります。

---

## ❌ 現在の状態（間違っている）

```bash
STRIPE_SECRET_KEY=pk_live_xxxxxxxxxxxxx  # ❌ これはPublishable Key
```

- `pk_`で始まるキーは**Publishable Key**（公開可能キー）
- これはフロントエンド用のキーで、バックエンドのAPI呼び出しには使えません

---

## ✅ 正しい設定

```bash
STRIPE_SECRET_KEY=sk_live_xxxxxxxxxxxxx  # ✅ これがSecret Key
```

- `sk_`で始まるキーは**Secret Key**（秘密キー）
- これはバックエンド専用で、Stripe APIの全機能にアクセスできます

---

## 🔧 修正手順

### ステップ 1: Stripe Dashboard にアクセス

https://dashboard.stripe.com/apikeys

### ステップ 2: 本番モードに切り替え

画面左上のトグルで「**本番モード**」を選択してください。
（現在テストモードの場合は、本番モードに切り替えてください）

### ステップ 3: Secret Key をコピー

「**Secret key**」セクションから、`sk_live_...`で始まるキーをコピーします。

**重要:** 
- 「Reveal test key token」または「Reveal live key token」ボタンをクリックしてキーを表示
- キー全体をコピー（`sk_live_`または`sk_test_`で始まる長い文字列）

### ステップ 4: .env.local を修正

プロジェクトルートの`.env.local`ファイルを開き、以下の行を修正します：

**修正前:**
```bash
STRIPE_SECRET_KEY=pk_live_xxxxxxxxxxxxx
```

**修正後:**
```bash
STRIPE_SECRET_KEY=sk_live_xxxxxxxxxxxxx
```

### ステップ 5: 開発サーバーを再起動

環境変数を変更したので、開発サーバーを再起動してください：

```bash
# Ctrl+C で停止
# 再起動
npm run dev
```

### ステップ 6: スクリプトを再実行して確認

```bash
npm run check:webhook
```

今度は正常に動作するはずです。

---

## 📝 Stripe API Key の種類

| キーの種類 | プレフィックス | 用途 | 公開可否 |
|-----------|--------------|------|---------|
| **Publishable Key** | `pk_test_...` / `pk_live_...` | フロントエンド（決済フォーム等） | ✅ 公開可能 |
| **Secret Key** | `sk_test_...` / `sk_live_...` | バックエンド（API呼び出し） | ❌ 絶対に公開しない |
| **Webhook Secret** | `whsec_...` | Webhook署名検証 | ❌ 絶対に公開しない |

---

## 🌐 Vercel環境変数も確認

本番環境（Vercel）でも同じ問題がある可能性があります。

### Vercelの環境変数を確認・修正

1. https://vercel.com/ にアクセス
2. プロジェクトを選択
3. **Settings** > **Environment Variables**
4. `STRIPE_SECRET_KEY` を確認
   - ❌ `pk_live_...` になっている場合は削除して再作成
   - ✅ `sk_live_...` になっているか確認
5. 修正した場合は**再デプロイ**が必要

---

## ✅ 確認方法

修正後、以下のコマンドで動作確認してください：

```bash
# Stripeイベント履歴を確認
npm run check:webhook

# Firestoreのサブスクリプションデータを確認
npm run check:subscription

# 両方を一度に確認
npm run verify:webhook
```

---

## 🔒 セキュリティ上の注意

### ⚠️ Secret Key を安全に管理する

- **絶対にGitにコミットしない**（`.env.local`は`.gitignore`に含まれています）
- **絶対に公開リポジトリにプッシュしない**
- **フロントエンドのコードに含めない**
- **定期的にキーをローテーションする**

### 🚨 もしSecret Keyが漏洩した場合

1. Stripe Dashboard > API Keys にアクセス
2. 漏洩したキーを**即座に無効化**
3. 新しいSecret Keyを生成
4. `.env.local`とVercelの環境変数を更新
5. 再デプロイ

---

## 📚 参考リンク

- [Stripe API Keys ドキュメント](https://stripe.com/docs/keys)
- [Stripe セキュリティベストプラクティス](https://stripe.com/docs/security/guide)
- [環境変数設定ガイド](docs/ENV_VARIABLES_GUIDE.md)

---

**🔥 この修正を完了してから、Webhook動作確認を続けてください！**



