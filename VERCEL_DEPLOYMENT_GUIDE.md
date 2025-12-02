# Vercelデプロイメントガイド

## 📋 事前準備チェックリスト

- [ ] GitHubアカウントを持っている
- [ ] プロジェクトがGitHubリポジトリにプッシュされている
- [ ] `.env.local`に環境変数が設定されている

---

## 🚀 ステップ1: Vercelアカウント作成

1. **Vercelにアクセス**
   - https://vercel.com にアクセス

2. **アカウント作成**
   - 「Sign Up」をクリック
   - **GitHubアカウントでログイン**（推奨）
   - または、Email/Googleでアカウント作成

3. **GitHub連携**
   - GitHubアカウントでログインした場合、自動的に連携されます
   - 必要に応じて、リポジトリへのアクセス権限を許可

---

## 📦 ステップ2: プロジェクトをVercelにインポート

1. **ダッシュボードから新規プロジェクト作成**
   - Vercelダッシュボードで「Add New...」→「Project」をクリック

2. **GitHubリポジトリを選択**
   - 「Import Git Repository」を選択
   - リポジトリ一覧から `takken` を選択
   - リポジトリが見つからない場合は、GitHubにプッシュしてください

3. **プロジェクト設定**
   - **Framework Preset**: `Next.js`（自動検出されるはず）
   - **Root Directory**: `./`（そのまま）
   - **Build Command**: `npm run build`（自動検出）
   - **Output Directory**: `.next`（自動検出）
   - **Install Command**: `npm install`（自動検出）

4. **「Deploy」はまだクリックしない！**
   - 先に環境変数を設定します

---

## 🔐 ステップ3: 環境変数の設定

### 3-1. 環境変数一覧を準備

`.env.local`から以下の環境変数をVercelに設定します：

#### Firebase設定（必須 - NEXT_PUBLIC_で始まるもの）
```
NEXT_PUBLIC_FIREBASE_API_KEY
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
NEXT_PUBLIC_FIREBASE_PROJECT_ID
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
NEXT_PUBLIC_FIREBASE_APP_ID
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
```

#### 暗号化キー（必須）
```
NEXT_PUBLIC_ENCRYPTION_KEY
```

#### AI API設定（いずれか1つ以上必須）
```
OPENAI_API_KEY
ANTHROPIC_API_KEY
GOOGLE_AI_API_KEY
```

#### その他（オプション）
```
NEXT_PUBLIC_USE_FIREBASE_EMULATORS=false
NEXT_PUBLIC_VAPID_PUBLIC_KEY
NEXT_PUBLIC_APP_URL
APPLE_SHARED_SECRET
NEXT_PUBLIC_APPLE_APP_ID
```

### 3-2. Vercelで環境変数を設定

1. **プロジェクト設定画面で環境変数を追加**
   - インポート画面の「Environment Variables」セクションを開く
   - または、デプロイ後に「Settings」→「Environment Variables」から設定

2. **各環境変数を追加**
   - `.env.local`の値をコピーして、Vercelに貼り付け
   - **重要**: `NEXT_PUBLIC_`で始まる変数は、すべての環境（Production, Preview, Development）に設定
   - それ以外（APIキーなど）も、すべての環境に設定

3. **環境変数の確認**
   - すべての変数が正しく設定されているか確認
   - 特に `NEXT_PUBLIC_ENCRYPTION_KEY` が32文字以上であることを確認

---

## 🚀 ステップ4: デプロイ実行

1. **デプロイ開始**
   - 環境変数を設定したら、「Deploy」ボタンをクリック

2. **ビルドの進行を確認**
   - ビルドログを確認
   - エラーが出た場合は、ログを確認して修正

3. **デプロイ完了を待つ**
   - 通常、3-5分で完了します
   - 完了すると、URLが表示されます（例: `https://takken-xxx.vercel.app`）

---

## ✅ ステップ5: デプロイ後の確認

### 5-1. 動作確認

1. **デプロイされたURLにアクセス**
   - ホームページが表示されるか確認

2. **主要機能のテスト**
   - [ ] ログイン/新規登録が動作するか
   - [ ] ダッシュボードが表示されるか
   - [ ] 問題演習が動作するか
   - [ ] AI機能（チャット、解説）が動作するか

3. **API Routesの確認**
   - ブラウザの開発者ツール（F12）でNetworkタブを確認
   - `/api/ai/chat` などのAPIが正常に動作しているか確認

### 5-2. エラーが発生した場合

1. **ビルドエラー**
   - Vercelダッシュボードの「Deployments」タブでログを確認
   - エラーメッセージを確認して修正

2. **実行時エラー**
   - ブラウザのコンソールでエラーを確認
   - Vercelの「Functions」タブでAPI Routesのログを確認

3. **環境変数のエラー**
   - 「Settings」→「Environment Variables」で設定を再確認
   - 特に `NEXT_PUBLIC_` の有無を確認

---

## 🔄 ステップ6: 自動デプロイの設定（推奨）

### 6-1. GitHub連携による自動デプロイ

1. **自動デプロイは既に有効**
   - GitHubリポジトリと連携している場合、自動的に有効になっています

2. **動作確認**
   - `main`ブランチにプッシュすると、自動的にデプロイされます
   - プルリクエストを作成すると、プレビュー環境が作成されます

### 6-2. ブランチ戦略

- **Production**: `main`ブランチ → 本番環境に自動デプロイ
- **Preview**: その他のブランチ → プレビュー環境に自動デプロイ

---

## 🌐 ステップ7: カスタムドメイン設定（オプション）

1. **Vercelダッシュボードで設定**
   - 「Settings」→「Domains」を開く
   - ドメイン名を入力（例: `takken.example.com`）

2. **DNS設定**
   - Vercelが表示するDNSレコードを、ドメインのDNS設定に追加
   - 通常、CNAMEレコードを追加します

3. **SSL証明書**
   - Vercelが自動的にSSL証明書を発行します（無料）

---

## 📝 重要な注意事項

### ⚠️ Firebase Hostingとの関係

- **Firebase Hostingは使用しない**
  - Vercelにデプロイする場合、Firebase Hostingは使用しません
  - Firebase Auth/Firestoreは引き続き使用可能です

### ⚠️ 環境変数の管理

- **機密情報の取り扱い**
  - APIキーなどの機密情報は、Vercelの環境変数で管理
  - `.env.local`はGitにコミットしない（`.gitignore`に含まれています）

### ⚠️ ビルド時間

- **初回ビルド**: 3-5分
- **通常のビルド**: 2-3分
- **無料プラン**: 月100GB時間まで

---

## 🛠️ トラブルシューティング

### 問題1: ビルドが失敗する

**原因**: 環境変数が不足している、またはコードエラー

**解決方法**:
1. ビルドログを確認
2. 環境変数がすべて設定されているか確認
3. ローカルで `npm run build` を実行してエラーを確認

### 問題2: API Routesが動作しない

**原因**: 環境変数（特にAPIキー）が設定されていない

**解決方法**:
1. 「Settings」→「Environment Variables」で確認
2. `OPENAI_API_KEY` などが設定されているか確認
3. 再デプロイを実行

### 問題3: Firebase認証が動作しない

**原因**: Firebase設定の環境変数が不足

**解決方法**:
1. `NEXT_PUBLIC_FIREBASE_*` の環境変数がすべて設定されているか確認
2. Firebase Consoleで設定を確認

---

## 📚 参考リンク

- [Vercel公式ドキュメント](https://vercel.com/docs)
- [Next.js on Vercel](https://vercel.com/docs/frameworks/nextjs)
- [環境変数の管理](https://vercel.com/docs/concepts/projects/environment-variables)

---

## ✅ チェックリスト

デプロイ前に確認：

- [ ] GitHubリポジトリにコードがプッシュされている
- [ ] Vercelアカウントを作成した
- [ ] プロジェクトをVercelにインポートした
- [ ] すべての環境変数を設定した
- [ ] デプロイが成功した
- [ ] 動作確認が完了した

---

**完了です！** 🎉

Vercelでのデプロイが完了しました。今後は、GitHubにプッシュするだけで自動的にデプロイされます。

