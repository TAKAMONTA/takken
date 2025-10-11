# 宅建合格ロード (Takken RPG)

AI と共に楽しく宅建試験に合格しよう！革新的な宅地建物取引士試験対策アプリケーション。

## 🎯 アプリケーション概要

「宅建合格ロード」は、従来の単調な試験勉強を楽しく継続できるゲーミフィケーション学習プラットフォームです。

### 主な機能

- **🤖 AI 学習サポート**: AI ヒントチャットで躓いた時の対話型サポート
- **📚 包括的試験対策**: 宅建業法、民法等、法令上の制限、税・その他の 4 分野完全対応
- **🎮 多様な学習モード**: 過去問演習、ミニテスト、模試モード、弱点克服
- **📊 学習分析**: AI 搭載の詳細な学習進捗分析と個別推奨
- **📱 PWA 対応**: オフライン学習とプッシュ通知
- **💳 サブスクリプション**: プレミアムプラン月額 500 円（初回 7 日間無料）

## 🛠️ 技術スタック

### フロントエンド

- **Next.js 14.2.32** (App Router)
- **React 18** + TypeScript
- **Tailwind CSS** (スタイリング)
- **PWA** (Service Worker + Manifest)

### バックエンド

- **Firebase Authentication** (認証)
- **Cloud Firestore** (データベース)
- **Firebase Hosting** (ホスティング)
- **Firebase Cloud Messaging** (プッシュ通知)

### AI 統合

- **OpenAI GPT-4** (学習推奨・解説生成)
- **Anthropic Claude** (バックアップ AI)
- **Google Gemini** (セカンダリ AI)

## 🚀 セットアップ手順

### 1. 環境変数の設定

`.env.local`ファイルを作成し、以下の環境変数を設定してください：

```bash
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id

# Development Mode (Firebase Emulators)
NEXT_PUBLIC_USE_FIREBASE_EMULATORS=false

# AI API Configuration (いずれか1つ以上設定)
OPENAI_API_KEY=your_openai_api_key
ANTHROPIC_API_KEY=your_anthropic_api_key
GOOGLE_AI_API_KEY=your_google_ai_api_key

# PWA Configuration
NEXT_PUBLIC_VAPID_PUBLIC_KEY=your_vapid_public_key

# App Configuration
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

#### 🔧 開発環境での Firebase エミュレーター使用

Firebase エミュレーターを使用して開発する場合：

1. Firebase CLI をインストール：

```bash
npm install -g firebase-tools
```

2. エミュレーターを起動：

```bash
npm run emulators
```

3. エミュレーターと Next.js を同時起動：

```bash
npm run dev:emulator
```

4. 環境変数を設定：

```bash
NEXT_PUBLIC_USE_FIREBASE_EMULATORS=true
```

### 2. 依存関係のインストール

```bash
npm install
```

### 3. Firebase プロジェクトの設定

1. [Firebase Console](https://console.firebase.google.com/)でプロジェクトを作成
2. Authentication を有効化（Email/Password、Google 認証）
3. Cloud Firestore を有効化
4. Firebase Hosting を設定
5. Cloud Messaging を設定（VAPID キー生成）

### 4. Firestore セキュリティルールのデプロイ

```bash
firebase deploy --only firestore:rules
firebase deploy --only firestore:indexes
```

### 5. 開発サーバーの起動

```bash
npm run dev
```

### 6. 本番ビルドとデプロイ

```bash
npm run build
firebase deploy
```

## 🔧 トラブルシューティング

### Firebase 認証エラー

**エラー**: `auth/configuration-not-found`

**解決方法**:

1. `.env.local`ファイルに Firebase 設定が正しく記載されているか確認
2. Firebase プロジェクトの設定を確認
3. 開発環境ではエミュレーターを使用：
   ```bash
   NEXT_PUBLIC_USE_FIREBASE_EMULATORS=true npm run dev:emulator
   ```

### 環境変数の確認

設定を確認するには：

```bash
npm run test:env
```

### エミュレーターの起動エラー

Firebase CLI がインストールされていない場合：

```bash
npm install -g firebase-tools
firebase login
```

## 📁 プロジェクト構造

```
takken-rpg/
├── app/                    # Next.js App Router
│   ├── auth/              # 認証関連ページ
│   ├── dashboard/         # ダッシュボード
│   ├── practice/          # 過去問演習
│   ├── weak-points/       # 弱点克服
│   ├── mock-exam/         # 模擬試験
│   ├── quick-test/        # クイックテスト
│   ├── legal/             # 特定商取引法に基づく表記
│   ├── terms/             # 利用規約
│   ├── privacy/           # プライバシーポリシー
│   ├── support/           # サポート
│   └── ...
├── lib/                   # ユーティリティ・設定
│   ├── firebase.js       # Firebase設定
│   ├── ai-client.ts      # AI API クライアント
│   ├── analytics.ts      # 学習分析
│   ├── pwa-utils.ts      # PWA機能
│   └── firestore-service.ts # Firestore操作
├── public/               # 静的ファイル
│   ├── manifest.json     # PWA マニフェスト
│   ├── sw.js            # Service Worker
│   └── icons/           # PWA アイコン
├── firebase.json         # Firebase設定
├── firestore.rules      # Firestore セキュリティルール
└── firestore.indexes.json # Firestore インデックス
```

## 🔧 実装済み機能

### ✅ 完了済み

- [x] **Firebase 設定**: 環境変数化、セキュリティ強化
- [x] **AI API 統合**: OpenAI、Anthropic、Google AI 対応
- [x] **PWA 化**: マニフェスト、Service Worker、オフライン対応
- [x] **プッシュ通知**: Firebase Cloud Messaging 統合
- [x] **学習分析**: 詳細な進捗分析と AI 推奨機能
- [x] **バックエンド統合**: Firestore サービス、リアルタイム同期
- [x] **セキュリティ**: Firestore ルール、データ検証
- [x] **本番リリース準備**: デプロイ設定、最適化
- [x] **法的ページ**: 利用規約、プライバシーポリシー、特定商取引法
- [x] **決済機能**: Stripe 統合、サブスクリプション管理

### 🚧 実装中・今後の予定

- [ ] **ソーシャル機能**: フレンド、ランキング、学習グループ
- [ ] **高度な AI 機能**: 個別学習計画、自動問題生成
- [ ] **VR/AR 対応**: 没入型学習体験
- [ ] **他資格対応**: 行政書士、司法書士等への展開

## 🎮 使用方法

### 基本的な学習フロー

1. **アカウント作成**: メールアドレスまたは Google アカウントで登録
2. **学習開始**: 過去問演習、ミニテスト、模試から選択
3. **AI サポート**: 躓いた時に AI ヒントチャットで対話型サポート
4. **進捗確認**: 詳細な分析と AI 推奨で効率的な学習

### PWA 機能

- **オフライン学習**: インターネット接続なしでも問題演習可能
- **プッシュ通知**: 学習リマインダー通知
- **ホーム画面追加**: ネイティブアプリのような体験

## 🔒 セキュリティ

- **Firebase Authentication**: 安全なユーザー認証
- **Firestore Security Rules**: データアクセス制御
- **環境変数**: API キーの安全な管理
- **HTTPS**: 全通信の暗号化
- **Stripe 決済**: PCI DSS 準拠の安全な決済処理

## 📄 法的ページ

本アプリは以下の法的ページを提供しています：

- **特定商取引法に基づく表記** (`/legal`): 事業者情報、販売価格、返品規定等
- **利用規約** (`/terms`): サービス利用に関する規約
- **プライバシーポリシー** (`/privacy`): 個人情報の取り扱いについて
- **サポート** (`/support`): よくある質問とお問い合わせ

### Stripe 決済対応について

Stripe での決済を利用する場合、`/app/legal/page.tsx`内の事業者情報を正確に入力する必要があります。
詳細は [`docs/STRIPE_RESUBMISSION_GUIDE.md`](./docs/STRIPE_RESUBMISSION_GUIDE.md) を参照してください。

## 📊 分析・監視

- **Firebase Analytics**: ユーザー行動分析
- **Performance Monitoring**: アプリパフォーマンス監視
- **Crashlytics**: エラー追跡とクラッシュレポート

## 🤝 コントリビューション

1. このリポジトリをフォーク
2. 機能ブランチを作成 (`git checkout -b feature/amazing-feature`)
3. 変更をコミット (`git commit -m 'Add amazing feature'`)
4. ブランチにプッシュ (`git push origin feature/amazing-feature`)
5. プルリクエストを作成

## 📄 ライセンス

このプロジェクトは MIT ライセンスの下で公開されています。

## 🤖 AI 問題生成

AI を使って宅建試験問題を自動生成できます：

```bash
# 宅建業法の問題を10問生成
npm run generate-questions -- --category takkengyouhou --count 10 --year r8

# 民法等の基礎問題を5問生成
npm run generate-questions -- --category minpou --count 5 --year r8 --difficulty 基礎
```

詳細は [`AI_QUESTION_GENERATION_GUIDE.md`](./AI_QUESTION_GENERATION_GUIDE.md) を参照してください。

---

## 🆘 サポート

問題や質問がある場合は、[Issues](https://github.com/your-username/takken-rpg/issues) を作成してください。

## 🎉 謝辞

- 宅地建物取引士試験の過去問題データ
- Firebase チームの素晴らしいプラットフォーム
- Next.js コミュニティのサポート
- AI プロバイダー（OpenAI、Anthropic、Google）

---

**宅建合格ロード** - AI と共に楽しく学習して、宅建試験に合格しよう！ 🏠✨
