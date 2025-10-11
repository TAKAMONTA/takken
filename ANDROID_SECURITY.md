# Android セキュリティガイド

## ⚠️ 重要: 署名鍵のセキュリティ

このドキュメントでは、Androidアプリの署名鍵を安全に管理する方法を説明します。

## 🔒 現在のセキュリティ状態

**以前の問題（解決済み）:**
- ~~署名鍵のパスワードが `android/gradle.properties` にコミットされていました~~
- ~~keystoreファイルがリポジトリに含まれていました~~

**現在の状態:**
- `android/gradle.properties` から署名情報を削除しました
- ローカル環境でのみ署名設定を使用する仕組みに変更しました

## 📋 ローカル環境のセットアップ

### 1. ユーザーローカルのGradle設定ファイルを作成

Windows環境の場合、以下の場所にファイルを作成します：

```
C:\Users\{ユーザー名}\.gradle\gradle.properties
```

### 2. 署名情報を追加

上記ファイルに以下の内容を追加します：

```properties
# Android署名設定（ローカル専用 - Gitにコミットしない）
MYAPP_UPLOAD_STORE_FILE=C:/Users/{ユーザー名}/keystore/takken-study-keystore.jks
MYAPP_UPLOAD_KEY_ALIAS=takken-study-key
MYAPP_UPLOAD_STORE_PASSWORD=your_actual_password
MYAPP_UPLOAD_KEY_PASSWORD=your_actual_password
```

**重要:**
- パスは絶対パスまたはプロジェクトルートからの相対パスで指定
- Windowsでもパス区切りは `/` を使用（`\` はエスケープが必要）
- このファイルは `.gitignore` により自動的に除外されます

### 3. keystoreファイルの保管

keystoreファイル（`.jks`）は以下のいずれかの方法で管理します：

#### オプションA: ローカル保管（推奨）
```
C:\Users\{ユーザー名}\keystore\takken-study-keystore.jks
```

#### オプションB: プロジェクト外の安全な場所
```
C:\secure\android-keys\takken-study-keystore.jks
```

**絶対にしないこと:**
- ❌ keystoreファイルをGitリポジトリにコミット
- ❌ パスワードをソースコードに記載
- ❌ keystoreファイルをメールやチャットで送信

## 🔄 既存のkeystoreの削除（推奨）

リポジトリに既にkeystoreファイルがコミットされている場合：

### 1. 現在のkeystoreを削除

```bash
# Gitの履歴から完全に削除（慎重に実行）
git filter-repo --path keystore/ --invert-paths
git filter-repo --path android/gradle.properties --invert-paths
```

### 2. .gitignoreに追加

`.gitignore` に以下を追加（既に追加済みの場合はスキップ）：

```
# Android signing keys
keystore/
*.jks
*.keystore
android/gradle.properties.local
```

### 3. 新しいkeystoreを生成

```bash
keytool -genkeypair -v -storetype PKCS12 \
  -keystore takken-study-keystore.jks \
  -alias takken-study-key \
  -keyalg RSA -keysize 2048 -validity 10000
```

### 4. Google Play Console で新しい鍵を登録

1. Google Play Console にログイン
2. アプリを選択 → 設定 → アプリの整合性
3. 「アップロード鍵をリセット」を実行
4. 新しいkeystoreの証明書をアップロード

## 🏗️ CI/CD環境での署名

GitHub Actions や他のCI/CD環境で署名する場合：

### GitHub Actionsの例

1. リポジトリのSecretsに以下を登録：
   - `ANDROID_KEYSTORE_BASE64`: keystoreファイルをBase64エンコードしたもの
   - `ANDROID_KEY_ALIAS`: キーのエイリアス
   - `ANDROID_STORE_PASSWORD`: ストアのパスワード
   - `ANDROID_KEY_PASSWORD`: キーのパスワード

2. Workflowで使用：

```yaml
- name: Decode Keystore
  run: |
    echo "${{ secrets.ANDROID_KEYSTORE_BASE64 }}" | base64 -d > android/app/release.keystore

- name: Build Release APK
  run: |
    cd android
    ./gradlew assembleRelease
  env:
    MYAPP_UPLOAD_STORE_FILE: ../app/release.keystore
    MYAPP_UPLOAD_KEY_ALIAS: ${{ secrets.ANDROID_KEY_ALIAS }}
    MYAPP_UPLOAD_STORE_PASSWORD: ${{ secrets.ANDROID_STORE_PASSWORD }}
    MYAPP_UPLOAD_KEY_PASSWORD: ${{ secrets.ANDROID_KEY_PASSWORD }}
```

## 🔐 Google Play App Signingの使用（最も推奨）

最も安全な方法は、Google Play App Signingを使用することです：

### メリット
- Googleが署名鍵を安全に管理
- アップロード鍵が漏洩してもリセット可能
- 鍵の紛失リスクがない

### 設定方法
1. Google Play Console → アプリ → 設定 → アプリの整合性
2. 「Play App Signingを使用する」を有効化
3. アップロード鍵を生成して登録

これにより、アップロード用の鍵のみを管理すればよくなります。

## 📝 チェックリスト

リリース前に以下を確認してください：

- [ ] `android/gradle.properties` に署名情報が含まれていない
- [ ] keystoreファイルがGitにコミットされていない
- [ ] ローカルの `~/.gradle/gradle.properties` に署名情報を設定済み
- [ ] keystoreファイルをバックアップ済み（安全な場所に）
- [ ] Google Play App Signingを有効化済み
- [ ] チームメンバーに署名鍵の管理方法を共有済み

## 🆘 トラブルシューティング

### エラー: "signing config is not specified"

原因: ローカルのGradle設定に署名情報がありません

解決方法:
1. `~/.gradle/gradle.properties` に署名情報を追加
2. またはデバッグビルドを使用：`./gradlew assembleDebug`

### エラー: "keystore file not found"

原因: keystoreファイルのパスが間違っています

解決方法:
1. `MYAPP_UPLOAD_STORE_FILE` のパスを確認
2. 絶対パスで指定してみる
3. ファイルが実際に存在するか確認

## 📚 参考資料

- [Android Developers - アプリに署名する](https://developer.android.com/studio/publish/app-signing?hl=ja)
- [Google Play Console - App Signing](https://support.google.com/googleplay/android-developer/answer/9842756)
- [Gradle - Properties](https://docs.gradle.org/current/userguide/build_environment.html#sec:gradle_configuration_properties)

---

**最終更新:** 2025年10月9日

