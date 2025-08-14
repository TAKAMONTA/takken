# Android Studioでのアプリテストガイド

## クイックスタート手順

### 1. アプリのビルドと同期
```bash
# Next.jsアプリをビルド
npm run build

# Capacitorでアプリを同期
npx cap sync android

# Android Studioでプロジェクトを開く
npx cap open android
```

### 2. Android Studioでのテスト実行

#### エミュレーターでのテスト
1. Android Studioが開いたら、上部の「▶️ Run」ボタンをクリック
2. エミュレーターを選択（なければ新規作成）
3. アプリが自動的にビルド・インストール・起動される

#### 実機でのテスト（USBデバッグ）
1. Androidデバイスの開発者オプションを有効化
2. USBデバッグをON
3. PCとUSBケーブルで接続
4. Android Studioで実機を選択して「▶️ Run」

### 3. デバッグツール
- **Logcat**: アプリのログを確認
- **Layout Inspector**: UIレイアウトを視覚的に確認
- **Profiler**: パフォーマンス分析

## トラブルシューティング

### ビルドエラーの場合
```bash
# クリーンビルド
cd android
./gradlew clean
cd ..
npx cap sync android
```

### エミュレーターが重い場合
- エミュレーターの設定でRAMを増やす
- ハードウェアアクセラレーションを有効化
- 実機でのテストに切り替える

## 現在のプロジェクト情報
- App ID: `com.takken.rpg`
- App Name: `takken-rpg`
- 出力ディレクトリ: `out`
