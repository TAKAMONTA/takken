# Vercel環境変数設定リスト

このファイルは、Vercelに設定する環境変数の一覧です。
`.env.local`から値をコピーして、Vercelの「Environment Variables」に設定してください。

---

## 📋 必須環境変数

### Firebase設定（すべて必須）

| 変数名 | 説明 | 例 |
|--------|------|-----|
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Firebase APIキー | `AIza...` |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Firebase Auth Domain | `your-project.firebaseapp.com` |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Firebase Project ID | `your-project-id` |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | Firebase Storage Bucket | `your-project.firebasestorage.app` |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Firebase Messaging Sender ID | `123456789` |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | Firebase App ID | `1:123456789:web:abc123` |
| `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID` | Firebase Measurement ID | `G-XXXXXXXXXX` |

### セキュリティ設定（必須）

| 変数名 | 説明 | 要件 |
|--------|------|------|
| `NEXT_PUBLIC_ENCRYPTION_KEY` | 暗号化キー | **32文字以上** |

### AI API設定（いずれか1つ以上必須）

| 変数名 | 説明 | 取得先 |
|--------|------|--------|
| `OPENAI_API_KEY` | OpenAI APIキー | https://platform.openai.com/api-keys |
| `ANTHROPIC_API_KEY` | Anthropic APIキー | https://console.anthropic.com/settings/keys |
| `GOOGLE_AI_API_KEY` | Google AI APIキー | https://makersuite.google.com/app/apikey |

---

## 🔧 オプション環境変数

### Firebase設定

| 変数名 | 説明 | デフォルト値 |
|--------|------|-------------|
| `NEXT_PUBLIC_USE_FIREBASE_EMULATORS` | Firebaseエミュレーター使用 | `false` |

### PWA設定

| 変数名 | 説明 | 取得先 |
|--------|------|--------|
| `NEXT_PUBLIC_VAPID_PUBLIC_KEY` | VAPID公開鍵 | Firebase Console > Cloud Messaging |
| `NEXT_PUBLIC_APP_URL` | アプリケーションURL | デプロイ後のVercel URL |

### iOS設定（モバイルアプリ用）

| 変数名 | 説明 | 取得先 |
|--------|------|--------|
| `APPLE_SHARED_SECRET` | Apple App Store Connect Shared Secret | App Store Connect |
| `NEXT_PUBLIC_APPLE_APP_ID` | Apple App ID | App Store Connect |

---

## 📝 Vercelでの設定手順

### 1. 環境変数の追加方法

1. Vercelダッシュボードでプロジェクトを開く
2. 「Settings」→「Environment Variables」を開く
3. 「Add New」をクリック
4. 以下を入力：
   - **Key**: 変数名（例: `NEXT_PUBLIC_FIREBASE_API_KEY`）
   - **Value**: `.env.local`からコピーした値
   - **Environment**: すべて選択（Production, Preview, Development）

### 2. 設定のコツ

- **一括設定**: 一度にすべての変数を設定する必要はありません
- **段階的設定**: まず必須変数だけ設定してデプロイし、動作確認後にオプション変数を追加
- **値の確認**: `.env.local`からコピーする際、前後の空白や改行が入らないように注意

### 3. 環境変数の確認

設定後、以下で確認できます：
- Vercelダッシュボードの「Environment Variables」セクション
- デプロイログで環境変数が読み込まれているか確認

---

## ⚠️ 重要な注意事項

### セキュリティ

- **機密情報の取り扱い**: APIキーなどの機密情報は、Vercelの環境変数で管理してください
- **Gitにコミットしない**: `.env.local`は`.gitignore`に含まれているため、Gitにコミットされません
- **共有しない**: 環境変数の値は他人と共有しないでください

### 環境変数の種類

- **`NEXT_PUBLIC_`で始まる変数**: クライアント側（ブラウザ）でも使用されます
- **それ以外**: サーバー側（API Routes）でのみ使用されます

### デプロイ後の確認

環境変数が正しく設定されているか確認する方法：

1. **ビルドログを確認**: デプロイ時のログでエラーがないか確認
2. **動作確認**: アプリが正常に動作するか確認
3. **API Routesの確認**: AI機能などが正常に動作するか確認

---

## 🔍 トラブルシューティング

### 問題: 環境変数が読み込まれない

**原因**: 
- 変数名のタイプミス
- 値に空白や改行が含まれている
- 環境（Production/Preview/Development）が選択されていない

**解決方法**:
1. 変数名を再確認（大文字小文字も正確に）
2. 値を再コピー（前後の空白を削除）
3. すべての環境に設定されているか確認

### 問題: API Routesが動作しない

**原因**: 
- AI APIキーが設定されていない
- 環境変数が正しく設定されていない

**解決方法**:
1. `OPENAI_API_KEY`（または他のAI APIキー）が設定されているか確認
2. 再デプロイを実行

---

## ✅ チェックリスト

デプロイ前に確認：

- [ ] すべての必須環境変数が設定されている
- [ ] `NEXT_PUBLIC_ENCRYPTION_KEY`が32文字以上である
- [ ] 少なくとも1つのAI APIキーが設定されている
- [ ] すべての環境（Production, Preview, Development）に設定されている
- [ ] 値に空白や改行が含まれていない

---

**完了です！** これでVercelに環境変数を設定する準備ができました。

