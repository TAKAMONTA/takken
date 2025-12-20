# 📱 iOS App Store 申請準備 - 進捗レポート

**作成日**: 2025 年 10 月 10 日  
**アプリ名**: 宅建合格ロード  
**Bundle ID**: com.takkenroad.app  
**ステータス**: 🟡 申請準備完了（Apple Developer Program 登録待ち）

---

## ✅ 完了した作業

### 1. iOS プロジェクトのセットアップ ✓

- [x] Capacitor プロジェクトの作成
- [x] iOS ディレクトリの生成
- [x] Xcode ワークスペースの作成
- [x] 基本的なプロジェクト構造の確立

### 2. アプリアイコンの作成 ✓

- [x] 1024x1024px マスターアイコンの生成
- [x] 全サイズのアイコン自動生成スクリプト作成
- [x] AppIcon.appiconset への配置
- [x] Contents.json の生成

**生成されたアイコン**:

```
ios/App/App/Assets.xcassets/AppIcon.appiconset/
├── app-icon-1024.png (1024x1024)
├── icon-20@1x.png (20x20)
├── icon-20@2x.png (40x40)
├── icon-20@3x.png (60x60)
├── icon-29@1x.png (29x29)
├── icon-29@2x.png (58x58)
├── icon-29@3x.png (87x87)
├── icon-40@1x.png (40x40)
├── icon-40@2x.png (80x80)
├── icon-40@3x.png (120x120)
├── icon-60@2x.png (120x120)
├── icon-60@3x.png (180x180)
├── icon-76@1x.png (76x76)
├── icon-76@2x.png (152x152)
├── icon-83.5@2x.png (167x167)
└── Contents.json
```

### 3. プロジェクト設定の完了 ✓

- [x] Bundle Identifier: `com.takkenroad.app`
- [x] アプリ表示名: `宅建合格ロード`
- [x] バージョン: 1.0.0
- [x] ビルド番号: 1
- [x] iOS Deployment Target: 13.0

### 4. Info.plist の設定 ✓

- [x] CFBundleDisplayName（アプリ表示名）
- [x] NSUserTrackingUsageDescription（広告用）
- [x] SKAdNetworkItems（AdSense 用）
- [x] プライバシー設定

### 5. Capacitor 設定の最適化 ✓

- [x] capacitor.config.ts の更新
- [x] appId の変更
- [x] appName の変更
- [x] Splash Screen 設定
- [x] iOS 固有設定の追加

### 6. In-App Purchase 実装 ✓

- [x] ネイティブプラグインの作成（Swift）
- [x] StoreKit 2 統合
- [x] TypeScript 型定義
- [x] サブスクリプション管理サービス
- [x] UI 実装（購入画面）

### 7. サブスクリプション機能 ✓

- [x] 無料/有料プランの機能制限
- [x] AI 使用回数制限（無料版: 月 3 回）
- [x] 広告表示制御（有料版: 非表示）
- [x] 過去問アクセス制限（無料版: 3 年分のみ）
- [x] 購入復元機能

### 8. サポートページ実装 ✓

- [x] `/support` ページの作成
- [x] よくある質問（FAQ）
- [x] お問い合わせ情報
- [x] トラブルシューティング

### 9. ドキュメント作成 ✓

- [x] App Store 申請ガイド
- [x] App Store 掲載情報（説明文、キーワードなど）
- [x] スクリーンショット撮影ガイド
- [x] iOS App Store 公開手順書
- [x] 進捗レポート（このファイル）

---

## ⏳ 次に必要な作業

### ユーザーが実行する必要がある作業

#### 1. Apple Developer Program への登録 🔴 **必須**

**ステータス**: 未完了  
**所要時間**: 10 分（審査: 最大 24 時間）  
**費用**: $99 USD/年

**手順**:

1. https://developer.apple.com/programs/ にアクセス
2. 「Enroll」をクリック
3. Apple ID でサインイン
4. 個人開発者を選択
5. 必要情報を入力
6. クレジットカードで支払い

**重要**: この登録が完了しないと、次のステップに進めません。

---

#### 2. Mac の用意 🔴 **必須**

**ステータス**: 確認が必要  
**理由**: Windows ではビルド＆アップロードができない

**オプション**:

- **自分の Mac を使用**（理想的）
- **友人・知人の Mac を借りる**
- **Mac レンタルサービス**（ReRe レンタル等）
- **クラウド Mac サービス**（MacStadium、Mac in Cloud）

**必要な環境**:

- macOS 13 (Ventura) 以降
- Xcode 15 以降
- 空き容量: 最低 20GB

---

#### 3. App Store Connect でアプリ登録 🟡

**ステータス**: Apple Developer Program 登録後に実施可能  
**所要時間**: 30-60 分

**必要な情報**（すべて準備済み）:

- ✅ アプリ名: 宅建合格ロード
- ✅ サブタイトル: AI 先生と楽しく学ぶ宅建試験対策
- ✅ 説明文: `docs/APP_STORE_DESCRIPTION.md` に記載
- ✅ キーワード: 準備済み
- ✅ カテゴリ: 教育、仕事効率化
- ✅ サポート URL: https://takken-study.com/support
- ✅ プライバシーポリシー URL: https://takken-study.com/privacy

**手順**:
`docs/APP_STORE_SUBMISSION_GUIDE.md` の「手順 2」を参照

---

#### 4. スクリーンショットの撮影 🟡

**ステータス**: Mac 環境で実施  
**所要時間**: 30-60 分

**必要なスクリーンショット（5-8 枚）**:

1. ダッシュボード画面
2. 過去問演習画面
3. AI 先生チャット
4. 回答後の解説画面
5. 学習進捗画面
6. サブスクリプション画面（オプション）

**サイズ**: 1290 x 2796 px（iPhone 15 Pro Max）

**撮影方法**:
`scripts/generate-screenshots.md` の手順に従って、Xcode シミュレーターで撮影

---

#### 5. In-App Purchase 商品の設定 🟡

**ステータス**: App Store Connect 登録後に実施  
**所要時間**: 15-30 分

**設定内容**（準備済み）:

```
商品ID: premium_monthly
参照名: プレミアムプラン（月額）
期間: 1ヶ月
価格: ¥500
無料トライアル: 7日間
```

**手順**:
`docs/APP_STORE_SUBMISSION_GUIDE.md` の「手順 4」を参照

---

#### 6. Xcode でビルド＆アップロード 🟡

**ステータス**: Mac 環境で実施  
**所要時間**: 30-60 分

**前提条件**:

- Mac が用意できている
- Xcode 15 以降がインストール済み
- Apple Developer Program に登録済み

**手順**:

1. Mac でプロジェクトを開く
2. 署名設定を確認
3. デバイスを「Any iOS Device」に設定
4. Product → Archive
5. Distribute App → App Store Connect → Upload

**詳細**:
`docs/IOS_APP_STORE_PUBLICATION.md` の「手順 5」を参照

---

#### 7. 審査に提出 🟡

**ステータス**: ビルドアップロード後に実施  
**所要時間**: 15-30 分

**必要な情報**（準備済み）:

- ✅ テストアカウント情報
- ✅ 審査メモ
- ✅ プライバシー申告内容

**手順**:
`docs/IOS_APP_STORE_PUBLICATION.md` の「手順 6」を参照

---

## 📊 進捗率

### 全体進捗

```
████████████████░░░░ 80%
```

### カテゴリ別進捗

| カテゴリ               | 進捗 | ステータス |
| ---------------------- | ---- | ---------- |
| 開発作業               | 100% | ✅ 完了    |
| プロジェクト設定       | 100% | ✅ 完了    |
| アプリアイコン         | 100% | ✅ 完了    |
| In-App Purchase 実装   | 100% | ✅ 完了    |
| サポートページ         | 100% | ✅ 完了    |
| ドキュメント作成       | 100% | ✅ 完了    |
| Apple Developer 登録   | 0%   | ⏳ 待機中  |
| App Store Connect 設定 | 0%   | ⏳ 待機中  |
| スクリーンショット     | 0%   | ⏳ 待機中  |
| ビルド＆アップロード   | 0%   | ⏳ 待機中  |

---

## 📁 作成されたファイル一覧

### iOS プロジェクト

```
ios/
├── App/
│   ├── App/
│   │   ├── Assets.xcassets/
│   │   │   └── AppIcon.appiconset/  ← アプリアイコン
│   │   ├── Info.plist  ← 設定完了
│   │   └── ...
│   └── App.xcodeproj/  ← Bundle ID設定完了
```

### スクリプト

```
scripts/
├── generate-app-icon.html  ← HTMLベースのアイコン生成
├── generate-ios-icons.js  ← Node.jsアイコン生成スクリプト
└── generate-screenshots.md  ← スクリーンショット撮影ガイド
```

### ドキュメント

```
docs/
├── APP_STORE_SUBMISSION_GUIDE.md  ← 申請ガイド
├── APP_STORE_DESCRIPTION.md  ← 掲載情報
├── IOS_APP_STORE_PUBLICATION.md  ← 公開手順書
└── IOS_APP_SUBMISSION_PROGRESS.md  ← このファイル
```

### アプリ機能

```
app/
├── subscription/page.tsx  ← サブスクリプション画面
├── support/page.tsx  ← サポートページ
├── privacy/page.tsx  ← プライバシーポリシー
└── terms/page.tsx  ← 利用規約
```

### ネイティブプラグイン

```
src/plugins/
├── InAppPurchase.swift  ← StoreKit 2実装
└── InAppPurchase.ts  ← TypeScript型定義
```

### サービス

```
lib/
└── subscription-service.ts  ← サブスクリプション管理
```

---

## 🎯 次のステップ（優先順）

### 今すぐできること

#### 1. Apple Developer Program に登録 ⚡ **最優先**

```
時間: 10分
費用: $99 USD
URL: https://developer.apple.com/programs/
```

→ この登録が完了しないと、次のステップに進めません。

---

#### 2. Mac の確保

```
オプション:
- 自分のMac
- 友人のMacを借りる
- Macレンタルサービス
- クラウドMac（MacStadium等）
```

→ Windows では最終的なビルド＆アップロードができません。

---

### Apple Developer Program 登録後にできること

#### 3. App Store Connect でアプリ登録

```
時間: 30-60分
必要なもの: すべて準備済み
ガイド: docs/APP_STORE_SUBMISSION_GUIDE.md
```

#### 4. In-App Purchase 商品の設定

```
時間: 15-30分
設定内容: 準備済み
```

---

### Mac 環境が整った後にできること

#### 5. スクリーンショットの撮影

```
時間: 30-60分
撮影方法: scripts/generate-screenshots.md
```

#### 6. Xcode でビルド＆アップロード

```
時間: 30-60分
手順: docs/IOS_APP_STORE_PUBLICATION.md
```

#### 7. 審査に提出

```
時間: 15-30分
最終ステップ: すべての情報を確認して提出
```

---

## 📞 サポート情報

### 質問がある場合

#### 技術的な質問

- このプロジェクトの開発者に連絡
- ドキュメントを再確認

#### Apple 関連の質問

- [Apple Developer サポート](https://developer.apple.com/support/)
- [App Store Connect ヘルプ](https://help.apple.com/app-store-connect/)

### トラブルシューティング

`docs/IOS_APP_STORE_PUBLICATION.md` の「トラブルシューティング」セクションを参照

---

## ✅ 完了チェックリスト

### 開発作業（完了）

- [x] iOS プロジェクト作成
- [x] アプリアイコン生成
- [x] Bundle ID 設定
- [x] アプリ名設定
- [x] Info.plist 設定
- [x] In-App Purchase 実装
- [x] サブスクリプション機能実装
- [x] サポートページ実装
- [x] ドキュメント作成

### ユーザーが実行する作業（未完了）

- [ ] Apple Developer Program に登録
- [ ] Mac を用意
- [ ] App Store Connect でアプリ登録
- [ ] スクリーンショットを撮影
- [ ] In-App Purchase 商品を設定
- [ ] Xcode でビルド＆アップロード
- [ ] 審査に提出

---

## 🎉 まとめ

### 現在の状況

**80%の準備が完了しています！** 🎊

残りの 20%は、あなたが実行する必要のあるステップです：

1. Apple Developer Program への登録
2. Mac の確保
3. App Store Connect での設定
4. スクリーンショットの撮影
5. ビルド＆アップロード
6. 審査提出

### 推定所要時間

- **Apple Developer Program 登録待ち**: 最大 24 時間
- **実作業時間**: 3-4 時間（Mac がある場合）
- **審査期間**: 2-3 日

### 最初の一歩

**今すぐ Apple Developer Program に登録しましょう！** ⚡

https://developer.apple.com/programs/

---

**すべての準備は整っています。あとはあなたが実行するだけです！**  
**頑張ってください！** 🚀📱✨
