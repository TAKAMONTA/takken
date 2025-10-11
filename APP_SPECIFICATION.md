# 宅建合格ロード - アプリケーション仕様書

**バージョン**: 2.0  
**最終更新**: 2025 年 10 月 9 日  
**ステータス**: 安定版

---

## 📱 アプリケーション概要

### プロジェクト名

**宅建合格ロード (Takken RPG)**

### コンセプト

AI と共に楽しく学習して、宅地建物取引士試験に合格しよう！

### ターゲットユーザー

- 宅地建物取引士試験の受験生
- 効率的な学習方法を求める社会人
- スマホ・PC で隙間時間に学習したい方

### アプリの特徴

1. **AI 学習サポート**: 躓いた時に対話型でヒントを提供
2. **包括的試験対策**: 全 4 分野の過去問を完全網羅
3. **多様な学習モード**: 学習目的に応じた 5 つのモード
4. **詳細な進捗分析**: AI による個別推奨機能
5. **PWA 対応**: オフラインでも学習可能

---

## 🛠️ 技術スタック

### フロントエンド

| 技術          | バージョン | 用途                        |
| ------------- | ---------- | --------------------------- |
| Next.js       | 14.2.32    | フレームワーク (App Router) |
| React         | 18         | UI ライブラリ               |
| TypeScript    | 5.x        | 型安全な開発                |
| Tailwind CSS  | 3.3.0      | スタイリング                |
| Framer Motion | 12.23.12   | アニメーション              |

### バックエンド

| 技術                     | 用途         |
| ------------------------ | ------------ |
| Firebase Authentication  | ユーザー認証 |
| Cloud Firestore          | データベース |
| Firebase Hosting         | ホスティング |
| Firebase Cloud Messaging | プッシュ通知 |

### AI 統合

| プロバイダー | モデル | 用途               |
| ------------ | ------ | ------------------ |
| OpenAI       | GPT-4o | メイン AI エンジン |
| Anthropic    | Claude | バックアップ AI    |
| Google       | Gemini | セカンダリ AI      |

### PWA

- Service Worker による オフライン対応
- Web App Manifest
- Push Notification API

### モバイルアプリ

| 技術      | バージョン    | 用途               |
| --------- | ------------- | ------------------ |
| Capacitor | 6.0.0         | ネイティブラッパー |
| Android   | API Level 33+ | Android アプリ     |

---

## 🎯 主要機能

### 1. 認証システム

#### 対応認証方法

- **メールアドレス・パスワード認証**
- **Google アカウント認証** (予定)
- **ローカルストレージフォールバック** (Firebase 利用不可時)

#### ユーザープロファイル

```typescript
interface UserProfile {
  id: string;
  username: string;
  email: string;
  level: number;
  xp: number;
  joinedAt: string;
  streak: {
    currentStreak: number;
    longestStreak: number;
    lastStudyDate: string;
    studyDates: string[];
  };
  progress: {
    totalQuestions: number;
    correctAnswers: number;
    studyTimeMinutes: number;
    categoryProgress: Record<string, any>;
  };
  badges: Badge[];
}
```

### 2. 学習モード

#### 2.1 分野別練習 (`/practice`)

- **対象**: 過去問演習
- **分野**:
  - 宅建業法
  - 民法等
  - 法令上の制限
  - 税・その他
- **問題数**: 分野により異なる（平成 3 年～令和 7 年度）
- **機能**:
  - 基礎レベル問題には学習支援機能
  - 関連条文の表示
  - ヒントシステム
  - 学習のコツ表示
  - **AI ヒントチャット** (ベータ版)

#### 2.2 弱点克服 (`/weak-points`)

- **対象**: 間違えた問題・苦手分野
- **学習方法**:
  - 集中特訓（10 問・30 分）
  - 混合練習（他分野も混在・8 問・20 分）
  - 詳細解説（6 問・40 分）
- **特徴**: 弱点ポイントと克服のヒントを表示

#### 2.3 模擬試験 (`/mock-exam`)

- **対象**: 本番形式の模擬試験
- **問題数**:
  - 完全模試: 50 問・120 分
  - スピード模試: 40 問・90 分
  - 復習模試: 30 問・時間無制限
- **機能**:
  - 分野別成績表示
  - 問題別詳細結果
  - 不正解問題の解説付き復習

#### 2.4 クイックテスト (`/quick-test`)

- **対象**: 短時間での実力チェック
- **問題数**: 5 問程度
- **制限時間**: 1 問 1 分
- **用途**: 隙間時間の活用

#### 2.5 ○× 問題 (`/truefalse`)

- **対象**: 重要ポイントの確認
- **形式**: ○× 形式
- **特徴**: サクサク進められる

### 3. AI 学習サポート

#### 3.1 AI ヒントチャット

- **場所**: 過去問演習ページ（基礎レベル問題）
- **機能**:
  - 問題文・選択肢を理解した上でヒント提供
  - 直接答えは教えず、着眼点や関連法令を段階的に提示
  - 対話形式で理解を深める
- **実装**:
  - システムプロンプトで「家庭教師」として振る舞う
  - 問題コンテキスト（分野・年度・難易度）を含む
  - API Route (production) / Direct AI Client (development) のフォールバック

#### 3.2 AI 先生メッセージ

- **場所**: ダッシュボード
- **機能**:
  - 学習状況に応じた励ましメッセージ
  - 連続学習のモチベーション維持
  - 学習推奨の提示

#### 3.3 AI 分析・推奨（計画中）

- 学習計画の自動生成
- 弱点分析と推奨問題
- 記憶定着度の評価

### 4. 学習記録・分析

#### 4.1 学習履歴

```typescript
interface StudyHistory {
  date: string; // YYYY-MM-DD
  questionsAnswered: number;
  correctAnswers: number;
  studyTimeMinutes: number;
  sessions: number;
}
```

#### 4.2 統計情報

- **総合統計**:
  - 総学習時間
  - 総問題数
  - 正答率
  - 連続学習日数
- **分野別統計**:
  - 分野ごとの正答率
  - 分野ごとの学習時間
  - 弱点分野の特定

#### 4.3 進捗ページ (`/dashboard/progress`)

- 学習時間の推移グラフ
- 正答率の推移
- 分野別パフォーマンス
- 学習カレンダー

### 5. PWA 機能

#### 5.1 オフライン対応

- **Service Worker**:
  - 問題データのキャッシュ
  - 静的アセットのキャッシュ
  - オフライン時の学習継続
- **ローカルストレージ**:
  - 学習進捗の一時保存
  - オンライン復帰時に同期

#### 5.2 プッシュ通知

- **学習リマインダー**: 定期的な学習促進
- **連続学習維持**: 途切れそうな時の通知
- **目標達成**: マイルストーン到達時の祝福

#### 5.3 ホーム画面追加

- アプリライクな起動体験
- スプラッシュスクリーン
- フルスクリーンモード

---

## 📊 データ構造

### 問題データ

```typescript
interface Question {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  category: string;
  year: string;
  difficulty: "基礎" | "標準" | "応用";

  // 基礎レベル問題の学習支援
  keyTerms?: Array<{ term: string; explanation: string }>;
  relatedArticles?: Array<{ title: string; content: string }>;
  hints?: string[];
  studyTips?: string[];
}
```

### 学習セッション

```typescript
interface StudySession {
  userId: string;
  startTime: Date;
  endTime: Date;
  category: string;
  mode: string;
  questionsAnswered: number;
  correctAnswers: number;
  timeSpent: number;
  difficulty: string;
  xpEarned: number;
}
```

---

## 🗂️ プロジェクト構造

```
takken/
├── app/                      # Next.js App Router
│   ├── auth/                # 認証ページ
│   │   ├── login/          # ログイン
│   │   └── register/       # 新規登録
│   ├── dashboard/           # ダッシュボード
│   │   └── progress/       # 進捗詳細
│   ├── practice/            # 過去問演習
│   │   ├── page.tsx        # 分野選択
│   │   └── quiz/           # クイズ実行
│   ├── weak-points/         # 弱点克服
│   ├── mock-exam/           # 模擬試験
│   ├── quick-test/          # クイックテスト
│   ├── truefalse/           # ○×問題
│   ├── profile/             # プロフィール
│   ├── settings/            # 設定
│   ├── test-ai/             # AI機能テスト
│   └── api/                 # API Routes (static exportでは無効)
│       └── ai/              # AI関連エンドポイント
├── components/              # React コンポーネント
│   ├── AIHintChat.tsx      # AIヒントチャット
│   ├── AITeacher.tsx       # AI先生メッセージ
│   ├── ArticleReference.tsx # 関連条文表示
│   ├── HintSystem.tsx      # ヒント表示
│   ├── KeyTermHighlight.tsx # 重要用語ハイライト
│   ├── StudyTipDisplay.tsx # 学習のコツ表示
│   ├── ExplanationDisplay.tsx # 解説表示
│   └── QuestionDisplay.tsx # 問題表示
├── lib/                     # ライブラリ・ユーティリティ
│   ├── ai-client.ts        # AI API クライアント
│   ├── ai-config.ts        # AI 設定
│   ├── analytics.ts        # 学習分析
│   ├── firebase-client.js  # Firebase 初期化
│   ├── firestore-service.ts # Firestore 操作
│   ├── study-utils.ts      # 学習ユーティリティ
│   ├── pwa-utils.ts        # PWA ユーティリティ
│   └── data/               # 問題データ
│       ├── questions/      # 過去問データ（分野別・年度別）
│       └── study-strategy.ts # 学習戦略
├── public/                  # 静的ファイル
│   ├── manifest.json       # PWA マニフェスト
│   ├── sw.js               # Service Worker
│   └── icons/              # アプリアイコン
├── android/                 # Android アプリ (Capacitor)
├── docs/                    # ドキュメント
├── tests/                   # E2E テスト (Playwright)
├── firebase.json            # Firebase 設定
├── firestore.rules         # Firestore セキュリティルール
├── next.config.mjs         # Next.js 設定
├── package.json            # 依存関係
└── capacitor.config.ts     # Capacitor 設定
```

---

## 🔐 セキュリティ

### 認証

- Firebase Authentication による安全なユーザー管理
- パスワードは Firebase が暗号化して管理
- ローカルフォールバック時は crypto-js でハッシュ化

### データアクセス

- Firestore Security Rules によるアクセス制御
- ユーザーは自分のデータのみ読み書き可能
- 管理者のみ問題データを編集可能

### API キー

- 環境変数 (`.env.local`) で管理
- `.gitignore` で Git にコミットしない
- `SECURITY.md` にベストプラクティスを記載

### Android 署名

- Keystore ファイルは `.gitignore` で除外
- `ANDROID_SECURITY.md` に管理方法を記載
- Google Play App Signing 推奨

---

## 🚀 デプロイ

### 開発環境

```bash
npm run dev
```

- ポート: http://localhost:3000
- Firebase Emulators 対応

### 本番ビルド

```bash
npm run build
```

- 静的サイト生成 (`output: "export"`)
- 出力先: `out/` ディレクトリ

### Firebase デプロイ

```bash
firebase deploy
```

- Hosting: 静的ファイル
- Firestore: ルールとインデックス

### Android アプリ

```bash
npm run build
npx cap sync
npx cap open android
```

- Android Studio でビルド
- APK/AAB 生成

---

## 📱 対応環境

### Web ブラウザ

- Chrome/Edge: 最新版
- Safari: 最新版
- Firefox: 最新版

### モバイル OS

- Android: 8.0 (API Level 26) 以上
- iOS: 予定 (Capacitor iOS 対応)

### 画面サイズ

- モバイル: 320px 〜
- タブレット: 768px 〜
- デスクトップ: 1024px 〜

---

## 🎨 デザイン

### カラーパレット

- **プライマリ**: Purple/Blue (学習・プログレス)
- **セカンダリ**: Green (成功・正解)
- **アクセント**: Red/Pink (弱点・警告)
- **ニュートラル**: Gray (背景・テキスト)

### タイポグラフィ

- フォント: システムフォント
- 日本語: -apple-system, BlinkMacSystemFont, "Segoe UI"
- サイズ: レスポンシブ (rem 単位)

### UI パターン

- **カード型レイアウト**: 情報のグルーピング
- **ボトムナビゲーション**: モバイルでの操作性
- **モーダル/ダイアログ**: 詳細情報・確認画面
- **プログレスバー**: 進捗の可視化

---

## 🔄 開発フロー

### ブランチ戦略

- `main`: 本番環境
- `develop`: 開発環境
- `feature/*`: 機能開発

### コミット規約

- `feat:` 新機能
- `fix:` バグ修正
- `docs:` ドキュメント
- `refactor:` リファクタリング
- `test:` テスト追加

### コードレビュー

- Pull Request 必須
- Lint エラー 0 が必須
- テスト通過確認

---

## 📈 今後の予定

### 短期 (1-3 ヶ月)

- [ ] Google 認証の実装
- [ ] AI 学習計画の自動生成
- [ ] 過去問データの追加（令和 8 年度以降）
- [ ] iOS アプリ対応

### 中期 (3-6 ヶ月)

- [ ] ソーシャル機能（ランキング、学習グループ）
- [ ] AI による問題自動生成
- [ ] 音声読み上げ機能
- [ ] ダークモード

### 長期 (6 ヶ月以降)

- [ ] 他資格対応（行政書士、司法書士等）
- [ ] VR/AR 対応
- [ ] 有料プラン（サブスクリプション）

---

## 📞 サポート

### ドキュメント

- `README.md`: プロジェクト概要
- `SECURITY.md`: セキュリティガイド
- `ANDROID_SECURITY.md`: Android 署名管理
- `PROJECT_CLEANUP_SUMMARY.md`: 整理履歴
- `APP_SPECIFICATION.md`: 本仕様書

### 問い合わせ

- GitHub Issues: バグ報告・機能要望
- Email: (設定予定)

---

**宅建合格ロード** - AI と共に楽しく学習して、宅建試験に合格しよう！ 🏠✨
