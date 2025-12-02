# Android Studio 署名済み APK 生成ガイド

## 🎯 目標

「宅建合格ロード」アプリの署名済み APK を生成して、Google Play Console でクローズドテストを開始する

## 📱 現在の状況

- **アプリ名**: 宅建合格ロード
- **パッケージ名**: com.takken.study
- **署名なし APK**: 生成済み (`app-release-unsigned.apk`)
- **キーストア**: `takken-study-keystore.jks` (既存)
- **Android Studio**: 起動済み

## 🔧 Android Studio での作業手順

### Step 1: 署名済み APK の生成

1. **メニューから選択**

   - `Build` → `Generate Signed Bundle / APK...`

2. **APK を選択**

   - `APK` を選択（AAB ではなく）
   - `Next` をクリック

3. **キーストアの設定**

   - **Key store path**: `C:\Users\tnaka\takken\keystore\takken-study-keystore.jks`
   - **Key store password**: `takken123`
   - **Key alias**: `takken-study`
   - **Key password**: `takken123`
   - `Next` をクリック

4. **ビルド設定**
   - **Destination Folder**: `C:\Users\tnaka\takken\`
   - **Build Variants**: `release` を選択
   - `Create` をクリック

### Step 2: ビルドの確認

1. **ビルドプロセス**を待機（数分かかる場合があります）
2. **ビルド完了**の通知を確認
3. **生成された APK**の場所を確認

### Step 3: APK ファイルの確認

- **生成場所**: `C:\Users\tnaka\takken\app-release.apk`
- **ファイルサイズ**: 約 10MB 程度
- **署名状態**: 署名済み

## 📋 Google Play Console 準備

### Step 4: Google Play Console での作業

1. **Google Play Console**にアクセス
2. **「宅建合格ロード」**アプリを選択
3. **「テストとリリース」**セクションに移動
4. **「クローズドテスト」**をクリック
5. **「新しいリリースを作成」**をクリック

### Step 5: APK アップロード

1. **APK をアップロード**
   - 生成した `app-release.apk` をドラッグ&ドロップ
2. **リリース名**を入力
   - 例: `v1.0.0 - クローズドテスト`
3. **リリースノート**を入力
   - 例: `初回リリース - 宅建試験学習アプリ`

### Step 6: テストトラック設定

1. **テスターを追加**
   - 内部テスターのメールアドレスを追加
2. **テスト範囲**を設定
   - 内部テストまたはクローズドテスト
3. **リリース**をクリック

## ⚠️ 注意事項

### キーストア情報

- **ファイル**: `takken-study-keystore.jks`
- **パスワード**: `takken123`
- **エイリアス**: `takken-study`
- **キーパスワード**: `takken123`

### トラブルシューティング

- **キーストアが見つからない場合**: パスを正確に入力
- **パスワードエラー**: 大文字小文字を確認
- **ビルドエラー**: `Clean Project` → `Rebuild Project`

## 🎯 成功の確認

### APK 生成成功の条件

- ✅ 署名済み APK が生成される
- ✅ ファイルサイズが適切（10MB 程度）
- ✅ インストール可能な状態

### Google Play Console 準備完了の条件

- ✅ APK がアップロードされる
- ✅ テストトラックが設定される
- ✅ テスターが招待される

## 📞 サポート

問題が発生した場合は、以下の情報を確認してください：

- Android Studio のバージョン
- エラーメッセージの詳細
- キーストアファイルの存在確認

---

**次のステップ**: APK 生成完了後、Google Play Console でクローズドテストを開始
