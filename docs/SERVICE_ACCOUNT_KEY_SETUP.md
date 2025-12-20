# サービスアカウントキーの設定ガイド

## 前提条件

- Firebase Consoleからサービスアカウントキー（JSONファイル）をダウンロード済み
- プロジェクトID: `takken-d3a2b`

## 設定方法

### 方法1: PowerShellスクリプトを使用（推奨）

1. ダウンロードしたサービスアカウントキーのJSONファイルをプロジェクトルートに配置
   - 例: `serviceAccountKey.json`

2. PowerShellでスクリプトを実行:
   ```powershell
   .\scripts\encode-service-account.ps1 -InputFile serviceAccountKey.json
   ```

3. 出力されたBASE64文字列を`.env.local`に設定:
   ```bash
   FIREBASE_SERVICE_ACCOUNT_KEY=eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9...
   ```

### 方法2: 手動でBASE64エンコード

1. PowerShellで以下を実行:
   ```powershell
   $bytes = [System.IO.File]::ReadAllBytes("serviceAccountKey.json")
   [Convert]::ToBase64String($bytes)
   ```

2. 出力されたBASE64文字列を`.env.local`に設定

### 方法3: JSON文字列として直接設定（開発環境のみ）

⚠️ 注意: 改行が含まれる場合、すべてを1行にまとめる必要があります。

1. JSONファイルの内容を開く
2. すべての改行を削除して1行にする
3. `.env.local`に設定:
   ```bash
   FIREBASE_SERVICE_ACCOUNT_KEY='{"type":"service_account","project_id":"takken-d3a2b",...}'
   ```

## プロジェクトIDの確認

サービスアカウントキーのJSONファイルを開き、`project_id`が`takken-d3a2b`であることを確認してください:

```json
{
  "type": "service_account",
  "project_id": "takken-d3a2b",
  ...
}
```

⚠️ 重要: `project_id`が一致していない場合、認証エラーが発生します。

## 設定後の確認

1. 開発サーバーを再起動:
   ```bash
   npm run dev
   ```

2. ログで以下を確認:
   ```
   [INFO] Firebase Admin SDK初期化成功（サービスアカウントキー使用） {"projectId":"takken-d3a2b"}
   ```

3. エラーが発生する場合:
   - `project_id`が一致しているか確認
   - BASE64文字列が正しく設定されているか確認
   - `.env.local`が正しく読み込まれているか確認

## トラブルシューティング

### エラー: "FirebaseプロジェクトIDが不一致です"

- サービスアカウントキーの`project_id`を確認
- `.env.local`の`NEXT_PUBLIC_FIREBASE_PROJECT_ID`が`takken-d3a2b`であることを確認

### エラー: "FIREBASE_SERVICE_ACCOUNT_KEYのパースに失敗しました"

- BASE64文字列が正しく設定されているか確認
- 環境変数に改行が含まれていないか確認
- PowerShellスクリプトを使用して再エンコード

### エラー: "Firebase IDトークンのaudience claim不一致"

- サービスアカウントキーとクライアント設定のプロジェクトIDが一致していることを確認
- 新しいサービスアカウントキーを使用している場合、ブラウザをリロードして新しいトークンを取得
