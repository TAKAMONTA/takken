# NOXプレイヤーでのAndroidアプリテストガイド

## 結論
✅ **NOXプレイヤーでのテストは可能です**

## 前提条件
- NOXプレイヤーがインストール済み
- Android Studio（Android SDK必須）
- Java JDK 11以上
- Node.js環境

## テスト手順

### 1. アプリのビルド
```bash
# Next.jsアプリをビルド（静的エクスポート）
npm run build

# Capacitorでアプリを同期
npx cap sync android

# Android Studioでプロジェクトを開く
npx cap open android
```

### 2. APKファイルの作成
1. Android Studioでプロジェクトが開かれる
2. メニューから `Build` → `Build Bundle(s) / APK(s)` → `Build APK(s)` を選択
3. ビルド完了後、APKファイルが以下の場所に作成される：
   ```
   android/app/build/outputs/apk/debug/app-debug.apk
   ```

### 3. NOXプレイヤーでのインストール・テスト
1. NOXプレイヤーを起動
2. 作成された `app-debug.apk` ファイルをNOXプレイヤーの画面にドラッグ&ドロップ
3. インストール完了後、アプリアイコンをタップして起動
4. アプリの動作をテスト

## テスト可能な項目
- ✅ UI/UXの表示確認
- ✅ 画面遷移の動作
- ✅ タッチ操作の反応
- ✅ データの保存・読み込み
- ✅ Firebase連携機能
- ✅ PWA機能（オフライン動作など）

## 制限事項・注意点
- ⚠️ エミュレーターのため実機より動作が重い
- ⚠️ 一部センサー機能（加速度計、ジャイロスコープ）が制限される
- ⚠️ カメラ機能のテストが困難
- ⚠️ プッシュ通知の完全なテストが困難
- ⚠️ GPSや位置情報サービスが制限される

## トラブルシューティング

### ビルドエラーが発生した場合
```bash
# 依存関係を再インストール
npm install

# Capacitorキャッシュをクリア
npx cap clean android
npx cap sync android
```

### NOXプレイヤーでアプリが起動しない場合
1. NOXプレイヤーのAndroidバージョンを確認（Android 7.0以上推奨）
2. NOXプレイヤーの設定で「開発者オプション」を有効化
3. 「不明なソースからのアプリ」を許可

## 代替テスト方法
NOXプレイヤーで問題が発生する場合の代替案：
- Android Studio内蔵エミュレーター
- BlueStacks
- 実機でのUSBデバッグ
- ブラウザでのPWAテスト（Chrome DevToolsのモバイルモード）

## 現在のプロジェクト設定確認済み
- ✅ Capacitor設定: `com.takken.rpg`
- ✅ 静的エクスポート設定済み
- ✅ PWA設定済み
- ✅ Firebase設定済み
- ✅ Androidプロジェクト構築済み
