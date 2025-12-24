# Firebase認証問題の修正サマリー

## 修正日時
2025-12-19

## 問題の概要

1. **FIREBASE_SERVICE_ACCOUNT_KEYのJSONパース失敗**
   - 環境変数のJSON文字列が壊れている、または改行/クォートの問題
   - エラー: "Expected property name or '}' in JSON at position 1"

2. **Firebase IDトークンのaudience claim不一致**
   - Admin SDKが参照しているFirebaseプロジェクトと、クライアント側のプロジェクトが不一致
   - エラー: Expected "AIzaSyAznPMBHnEZzTB7iehxAFXUT38uCKHORBs" but got "takken-d3a2b"
   - 原因: サービスアカウントキーの`project_id`と`NEXT_PUBLIC_FIREBASE_PROJECT_ID`が不一致

3. **default credentials読み込み失敗**
   - ローカル開発で明示的な認証情報が設定されていない

4. **開発環境での認証バイパスが曖昧**
   - 開発環境で無条件に認証をスキップしていた

## 修正内容

### 1. FIREBASE_SERVICE_ACCOUNT_KEYのパースを堅牢化

**ファイル**: `lib/firebase-admin-auth.ts`

- **BASE64エンコード対応**: BASE64エンコードされた文字列を自動検出してデコード
- **改行・クォート処理**: 環境変数に含まれる改行や余計なクォートを除去
- **形式検証**: サービスアカウントキーの必須フィールド（`private_key`, `project_id`）を検証

```typescript
function parseServiceAccountKey(key: string): any | null {
  // BASE64デコードを試行
  // JSON文字列としてパース
  // 改行・クォートを除去
  // 形式を検証
}
```

### 2. Admin SDK初期化時のproject_id一致検証

**ファイル**: `lib/firebase-admin-auth.ts`

- サービスアカウントキーの`project_id`と`NEXT_PUBLIC_FIREBASE_PROJECT_ID`が一致することを検証
- 不一致の場合は本番環境では即エラー、開発環境では警告を出力
- 詳細なエラーメッセージで原因を明確化

```typescript
if (expectedProjectId && serviceAccountProjectId !== expectedProjectId) {
  const errorMsg = `FirebaseプロジェクトIDが不一致です。サービスアカウント: ${serviceAccountProjectId}, 環境変数: ${expectedProjectId}`;
  // 本番環境では即エラー、開発環境では警告
}
```

### 3. 開発環境認証バイパスの明示的制御

**ファイル**: `lib/firebase-admin-auth.ts`

- `ALLOW_DEV_BYPASS_AUTH=true`フラグがある場合のみ認証をバイパス
- 本番環境では無条件に認証を要求
- 開発環境でも、フラグがない場合は通常の認証フローを実行

```typescript
const allowDevBypass = process.env.ALLOW_DEV_BYPASS_AUTH === "true";
if (!userIdHeader && !isProduction && allowDevBypass) {
  // 認証バイパス（開発環境のみ、明示的フラグがある場合）
}
```

### 4. エラーハンドリングの改善

**ファイル**: `lib/firebase-admin-auth.ts`

- 本番環境では認証情報が無い場合に即エラー
- 開発環境では警告を出力してフォールバックを試行
- audience claim不一致の場合は詳細なエラーメッセージを出力

### 5. webhook/route.tsの初期化ロジックを統一

**ファイル**: `app/api/subscription/webhook/route.ts`

- 共通の`initializeAdminSDK()`関数を使用
- 重複コードを削除
- 一貫したエラーハンドリング

### 6. .env.exampleの更新

**ファイル**: `env.example.txt`

- `FIREBASE_SERVICE_ACCOUNT_KEY`の設定方法を詳細に説明
- JSON文字列方式とBASE64方式の両方を説明
- `ALLOW_DEV_BYPASS_AUTH`フラグの説明を追加

## 設定手順

### 1. サービスアカウントキーの取得

1. Firebase Console > プロジェクト設定 > サービスアカウント
2. 「新しい秘密鍵の生成」をクリック
3. JSONファイルをダウンロード

### 2. 環境変数の設定

#### 方法1: JSON文字列として直接設定（開発環境推奨）

```bash
# .env.local
FIREBASE_SERVICE_ACCOUNT_KEY='{"type":"service_account","project_id":"takken-d3a2b",...}'
```

⚠️ 注意: 改行が含まれる場合は、すべてを1行にまとめる必要があります。

#### 方法2: BASE64エンコード（本番環境推奨）

```bash
# Windows
certutil -encode serviceAccountKey.json encoded.txt
# encoded.txtの内容をコピーして環境変数に設定

# Linux/Mac
base64 -i serviceAccountKey.json
# 出力をコピーして環境変数に設定
```

```bash
# .env.local
FIREBASE_SERVICE_ACCOUNT_KEY=eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9...
```

### 3. プロジェクトIDの確認

```bash
# .env.local
NEXT_PUBLIC_FIREBASE_PROJECT_ID=takken-d3a2b
```

⚠️ 重要: サービスアカウントキーの`project_id`と`NEXT_PUBLIC_FIREBASE_PROJECT_ID`が一致している必要があります。

### 4. 開発環境での認証バイパス（オプション、非推奨）

```bash
# .env.local
ALLOW_DEV_BYPASS_AUTH=true
```

⚠️ 警告: 本番環境では使用しないでください。

## 動作確認

### 1. 開発サーバーの起動

```bash
npm run dev
```

### 2. ログの確認

正常に初期化されると、以下のログが出力されます:

```
[INFO] Firebase Admin SDK初期化成功（サービスアカウントキー使用） {"projectId":"takken-d3a2b"}
```

### 3. APIエンドポイントのテスト

```bash
# /api/ai/chat にリクエストを送信
# 認証が正常に動作していることを確認
```

## トラブルシューティング

### 1. JSONパースエラーが発生する場合

- BASE64方式を使用することを推奨
- 環境変数に改行が含まれていないか確認
- クォートが正しくエスケープされているか確認

### 2. audience claim不一致エラーが発生する場合

- サービスアカウントキーの`project_id`を確認
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`と一致しているか確認
- `.firebaserc`の`default`プロジェクトと一致しているか確認

### 3. 認証エラーが発生する場合

- `FIREBASE_SERVICE_ACCOUNT_KEY`が正しく設定されているか確認
- サービスアカウントキーが有効か確認（Firebase Consoleで再生成）
- 開発環境では`ALLOW_DEV_BYPASS_AUTH=true`を設定（非推奨）

## セキュリティ注意事項

1. **サービスアカウントキーは機密情報です**
   - `.env.local`をGitにコミットしない
   - 本番環境では環境変数として安全に管理

2. **開発環境での認証バイパス**
   - `ALLOW_DEV_BYPASS_AUTH=true`は開発環境でのみ使用
   - 本番環境では無視されますが、設定しないことを推奨

3. **プロジェクトIDの一致**
   - サービスアカウントキーとクライアント設定のプロジェクトIDが一致している必要があります
   - 不一致の場合は認証エラーが発生します

## 関連ファイル

- `lib/firebase-admin-auth.ts`: 認証ヘルパー（修正済み）
- `app/api/subscription/webhook/route.ts`: Webhook API（修正済み）
- `app/api/ai/chat/route.ts`: AI Chat API（変更なし、認証ヘルパーを使用）
- `env.example.txt`: 環境変数テンプレート（更新済み）





