# Vercelデプロイ - クイックスタートガイド

## 🚀 5分でデプロイ完了！

### ステップ1: Vercelアカウント作成（2分）

1. https://vercel.com にアクセス
2. 「Sign Up」→ **GitHubアカウントでログイン**（推奨）
3. GitHubのアクセス権限を許可

---

### ステップ2: プロジェクトをインポート（1分）

1. Vercelダッシュボードで「Add New...」→「Project」
2. GitHubリポジトリから `takken` を選択
3. プロジェクト設定は**そのまま**（自動検出されます）

---

### ステップ3: 環境変数を設定（2分）

**重要**: デプロイする前に環境変数を設定してください！

#### 3-1. `.env.local`を開く

#### 3-2. Vercelの「Environment Variables」に以下をコピー&ペースト

**Firebase設定（必須）**:
- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`
- `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID`

**その他（必須）**:
- `NEXT_PUBLIC_ENCRYPTION_KEY`（32文字以上）
- `OPENAI_API_KEY`（または他のAI APIキー）

**オプション**:
- `NEXT_PUBLIC_USE_FIREBASE_EMULATORS=false`
- `NEXT_PUBLIC_VAPID_PUBLIC_KEY`
- `NEXT_PUBLIC_APP_URL`
- `ANTHROPIC_API_KEY`
- `GOOGLE_AI_API_KEY`

#### 3-3. 環境変数の設定方法

1. Vercelのプロジェクト設定画面で「Environment Variables」セクションを開く
2. 各変数を追加：
   - **Key**: 変数名（例: `NEXT_PUBLIC_FIREBASE_API_KEY`）
   - **Value**: `.env.local`からコピーした値
   - **Environment**: すべて選択（Production, Preview, Development）

---

### ステップ4: デプロイ実行（1分）

1. 「Deploy」ボタンをクリック
2. ビルドが完了するまで待つ（3-5分）
3. 完了したら、表示されたURLにアクセス

---

## ✅ 完了！

デプロイが完了しました。URLは以下の形式です：
`https://takken-xxx.vercel.app`

---

## 🔄 今後のデプロイ

GitHubの`main`ブランチにプッシュすると、**自動的にデプロイ**されます！

---

## ❓ エラーが出た場合

1. **ビルドエラー**: Vercelダッシュボードの「Deployments」タブでログを確認
2. **環境変数エラー**: 「Settings」→「Environment Variables」で再確認
3. **動作しない**: ブラウザのコンソール（F12）でエラーを確認

詳細は `VERCEL_DEPLOYMENT_GUIDE.md` を参照してください。
















