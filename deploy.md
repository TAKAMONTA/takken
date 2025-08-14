# 宅建合格ロード - デプロイメントガイド

## 🚀 本番リリース準備チェックリスト

### 1. 環境変数の設定

#### Firebase設定
```bash
# Firebase Console から取得
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

#### AI API設定（いずれか1つ以上）
```bash
# OpenAI
OPENAI_API_KEY=sk-...

# Anthropic
ANTHROPIC_API_KEY=sk-ant-...

# Google AI
GOOGLE_AI_API_KEY=AI...
```

#### PWA設定
```bash
# VAPID キー（Firebase Console > Cloud Messaging で生成）
NEXT_PUBLIC_VAPID_PUBLIC_KEY=your_vapid_public_key

# アプリケーションURL
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

### 2. Firebase プロジェクト設定

#### 2.1 Authentication設定
```bash
# Firebase Console > Authentication > Sign-in method
- Email/Password: 有効化
- Google: 有効化（オプション）
```

#### 2.2 Firestore設定
```bash
# セキュリティルールのデプロイ
firebase deploy --only firestore:rules

# インデックスのデプロイ
firebase deploy --only firestore:indexes
```

#### 2.3 Cloud Messaging設定
```bash
# Firebase Console > Cloud Messaging
1. VAPIDキーを生成
2. 環境変数に設定
```

#### 2.4 Hosting設定
```bash
# firebase.json の確認
{
  "hosting": {
    "public": "out",
    "ignore": ["firebase.json", "**/.*", "**/node_modules/**"],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ],
    "headers": [
      {
        "source": "/sw.js",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "no-cache"
          }
        ]
      }
    ]
  }
}
```

### 3. ビルドとデプロイ

#### 3.1 依存関係のインストール
```bash
npm install
```

#### 3.2 TypeScript型チェック
```bash
npm run type-check
```

#### 3.3 本番ビルド
```bash
npm run build
```

#### 3.4 Firebase デプロイ
```bash
# 全体デプロイ
firebase deploy

# 個別デプロイ
firebase deploy --only hosting
firebase deploy --only firestore:rules
firebase deploy --only firestore:indexes
```

### 4. PWA設定の確認

#### 4.1 マニフェストファイル
- [x] `public/manifest.json` 設定済み
- [x] アイコンファイル配置済み
- [x] メタタグ設定済み

#### 4.2 Service Worker
- [x] `public/sw.js` 実装済み
- [x] オフライン機能対応
- [x] プッシュ通知対応

#### 4.3 PWA検証
```bash
# Lighthouse PWA監査
npm run lighthouse

# PWA Builder検証
https://www.pwabuilder.com/
```

### 5. セキュリティチェック

#### 5.1 環境変数
- [x] APIキーが環境変数化されている
- [x] `.env.local` が `.gitignore` に含まれている
- [x] `.env.example` が提供されている

#### 5.2 Firestore セキュリティルール
- [x] 認証済みユーザーのみアクセス可能
- [x] ユーザー固有データの保護
- [x] 適切な読み書き権限設定

#### 5.3 HTTPS設定
- [x] Firebase Hosting は自動的にHTTPS
- [x] Mixed Content エラーなし

### 6. パフォーマンス最適化

#### 6.1 画像最適化
```bash
# Next.js Image コンポーネント使用
- [x] 自動WebP変換
- [x] 遅延読み込み
- [x] レスポンシブ画像
```

#### 6.2 コード分割
```bash
# 動的インポート
- [x] ページレベル分割
- [x] コンポーネント分割
- [x] ライブラリ分割
```

#### 6.3 キャッシュ戦略
```bash
# Service Worker キャッシュ
- [x] 静的アセット
- [x] API レスポンス
- [x] オフライン対応
```

### 7. 監視とログ

#### 7.1 Firebase Analytics
```bash
# Google Analytics 4 設定
- [x] イベント追跡
- [x] ユーザー行動分析
- [x] コンバージョン追跡
```

#### 7.2 Performance Monitoring
```bash
# Firebase Performance
- [x] ページ読み込み時間
- [x] ネットワークリクエスト
- [x] カスタムメトリクス
```

#### 7.3 Crashlytics
```bash
# エラー追跡
- [x] JavaScript エラー
- [x] ユーザーセッション
- [x] クラッシュレポート
```

### 8. テスト

#### 8.1 機能テスト
- [ ] ユーザー登録・ログイン
- [ ] 問題演習機能
- [ ] ペット育成機能
- [ ] プッシュ通知
- [ ] オフライン機能

#### 8.2 デバイステスト
- [ ] iOS Safari
- [ ] Android Chrome
- [ ] デスクトップブラウザ
- [ ] PWAインストール

#### 8.3 パフォーマンステスト
- [ ] Lighthouse スコア 90+
- [ ] Core Web Vitals
- [ ] ネットワーク速度テスト

### 9. ドメイン設定

#### 9.1 カスタムドメイン
```bash
# Firebase Hosting でカスタムドメイン設定
1. Firebase Console > Hosting
2. カスタムドメイン追加
3. DNS設定
4. SSL証明書自動発行
```

#### 9.2 DNS設定例
```bash
# A レコード
@ 151.101.1.195
@ 151.101.65.195

# CNAME レコード
www your-project.web.app
```

### 10. 本番リリース後

#### 10.1 監視設定
- [ ] Firebase アラート設定
- [ ] エラー通知設定
- [ ] パフォーマンス監視

#### 10.2 バックアップ
- [ ] Firestore データエクスポート
- [ ] 設定ファイルバックアップ
- [ ] ソースコードタグ付け

#### 10.3 ユーザーサポート
- [ ] ヘルプドキュメント
- [ ] FAQ作成
- [ ] フィードバック収集

## 🔧 トラブルシューティング

### よくある問題と解決方法

#### 1. ビルドエラー
```bash
# TypeScript エラー
npm run type-check

# 依存関係エラー
npm install --force
```

#### 2. Firebase デプロイエラー
```bash
# 認証エラー
firebase login

# プロジェクト設定
firebase use your-project-id
```

#### 3. PWA インストールできない
```bash
# HTTPS必須
# マニフェストファイル確認
# Service Worker 確認
```

#### 4. プッシュ通知が届かない
```bash
# VAPID キー確認
# 通知許可確認
# Service Worker 登録確認
```

## 📞 サポート

問題が発生した場合は、以下を確認してください：

1. [Firebase Console](https://console.firebase.google.com/) でエラーログ確認
2. ブラウザの開発者ツールでコンソールエラー確認
3. [GitHub Issues](https://github.com/your-username/takken-rpg/issues) で既知の問題確認

---

**本番リリース準備完了！** 🎉

このチェックリストを完了すれば、宅建合格ロードを安全かつ効率的に本番環境にデプロイできます。