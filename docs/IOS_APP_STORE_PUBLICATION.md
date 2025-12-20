# 📱 iOS App Store 公開手順書

## 完全版：宅建合格ロードを App Store に公開する方法

---

## 🎯 前提条件

### ✅ 完了している項目

- [x] Xcode プロジェクト作成
- [x] アプリアイコン生成（1024x1024px）
- [x] Bundle ID 設定: `com.takkenroad.app`
- [x] アプリ名設定: 宅建合格ロード
- [x] In-App Purchase 実装
- [x] サブスクリプション機能実装
- [x] サポートページ実装
- [x] プライバシーポリシー実装
- [x] 利用規約実装

### 📋 必要なもの

1. **Apple Developer Program アカウント**（年額 $99 USD）
2. **macOS 搭載の Mac**（Windows では App Store 申請不可）
3. **Xcode 15 以降**
4. **有効な Apple ID**

---

## 📍 あなたの現在地

現在、以下の作業が完了しています：

### ✅ 完了済み

1. iOS プロジェクトの作成とセットアップ
2. アプリアイコンの生成と設定
3. Bundle Identifier の設定
4. Info.plist の設定（アプリ名、権限など）
5. In-App Purchase プラグインの実装
6. サブスクリプション機能の実装
7. サポートページの実装
8. App Store 申請用ドキュメントの準備

### ⏳ 次に必要な作業

1. Apple Developer Program への登録
2. App Store Connect でアプリ登録
3. スクリーンショットの撮影と準備
4. In-App Purchase 商品の設定
5. Xcode でビルドをアーカイブ
6. App Store Connect にアップロード
7. 審査に提出

---

## 🚀 手順 1: Apple Developer Program に登録

### 登録方法

1. https://developer.apple.com/programs/ にアクセス
2. 「Enroll」をクリック
3. Apple ID でサインイン
4. 個人または組織を選択
5. 必要情報を入力
6. 年会費 $99 USD を支払い

### 所要時間

- 個人: 即時〜24 時間
- 組織: 1 週間〜2 週間（D-U-N-S 番号が必要）

### 重要な注意点

- **個人開発者**として登録することをおすすめ（手続きが簡単）
- クレジットカードまたはデビットカードが必要
- 登録完了後、Apple Developer Console と App Store Connect にアクセス可能

---

## 🏗️ 手順 2: App Store Connect でアプリ登録

### Step 2-1: 新規アプリ作成

1. https://appstoreconnect.apple.com/ にアクセス
2. 「マイ App」→「＋」→「新規 App」をクリック
3. 以下の情報を入力：

```
プラットフォーム: iOS
名前: 宅建合格ロード
プライマリ言語: 日本語
Bundle ID: com.takkenroad.app
SKU: TAKKENROAD001
ユーザーアクセス: 完全なアクセス
```

### Step 2-2: App 情報の入力

#### 基本情報

```
名前: 宅建合格ロード
サブタイトル: AI先生と楽しく学ぶ宅建試験対策
カテゴリ:
  - プライマリ: 教育
  - セカンダリ: 仕事効率化
```

#### 説明文

`docs/APP_STORE_DESCRIPTION.md` を参照してコピー&ペースト

#### URL 情報

```
サポートURL: https://takken-study.com/support
マーケティングURL: https://takken-study.com（オプション）
プライバシーポリシーURL: https://takken-study.com/privacy
```

#### キーワード

```
宅建,宅地建物取引士,資格試験,過去問,AI学習,教育,不動産,法律,民法,宅建業法,試験対策,オフライン学習
```

---

## 📸 手順 3: スクリーンショットの準備

### 撮影方法

詳細は `scripts/generate-screenshots.md` を参照

### 必要なスクリーンショット

1. **ダッシュボード画面**（第一印象）
2. **過去問演習画面**（メイン機能）
3. **AI 先生チャット**（差別化要素）
4. **回答後の解説画面**（学習効果）
5. **学習進捗画面**（データ分析）
6. **サブスクリプション画面**（オプション）

### Xcode シミュレーターでの撮影手順

```bash
# 1. Xcodeでプロジェクトを開く
npx cap open ios

# 2. シミュレーターの選択
# ツールバーで「iPhone 15 Pro Max」を選択

# 3. アプリを実行
# ビルド＆実行ボタン (▶️) をクリック

# 4. スクリーンショット撮影
# 各画面で Cmd + S を押す
```

### サイズ要件

- **iPhone 6.7 インチ**: 1290 x 2796 px（必須）
- フォーマット: JPEG または PNG
- ファイルサイズ: 最大 8MB

---

## 💰 手順 4: In-App Purchase 商品の設定

### Step 4-1: サブスクリプショングループ作成

1. App Store Connect →「App 内課金」
2. 「サブスクリプショングループを作成」
3. グループ名: `プレミアムプラン`
4. グループ参照名: `premium_subscription_group`

### Step 4-2: サブスクリプション商品の追加

```
商品ID: premium_monthly
参照名: プレミアムプラン（月額）
期間: 1ヶ月
価格: ¥500

表示名（日本語）: プレミアムプラン
説明: AI機能無制限、広告非表示、全年度の過去問アクセスなど、すべての機能が使い放題

無料トライアル: 7日間（推奨）
```

### Step 4-3: 審査情報の入力

```
スクリーンショット:
- サブスクリプション画面のスクリーンショット

審査メモ:
このサブスクリプションにより、以下の機能が解放されます：
• AI先生への質問無制限（無料版は月3回まで）
• 広告の非表示
• 全年度の過去問アクセス（無料版は直近3年分のみ）
• AI問題生成機能
• 詳細な学習分析
• プッシュ通知による学習リマインダー
• オフライン学習の拡張
```

---

## 🔨 手順 5: Xcode でビルドをアーカイブ

### macOS での作業（重要）

**Windows 環境では実行できません。Mac が必要です。**

### Step 5-1: Xcode を開く

```bash
# ターミナルで実行（Mac上）
cd /path/to/takken
npx cap open ios
```

### Step 5-2: 署名設定

1. プロジェクトナビゲーターで「App」を選択
2. 「Signing & Capabilities」タブ
3. Team: Apple Developer Team を選択
4. 「Automatically manage signing」にチェック

### Step 5-3: ビルド設定

1. デバイスを「Any iOS Device (arm64)」に変更
2. メニューバー →「Product」→「Archive」
3. ビルドが完了するまで待つ（5-10 分）

### Step 5-4: Archive 完了後

1. Organizer ウィンドウが自動で開く
2. 最新の Archive を選択
3. 「Distribute App」をクリック
4. 「App Store Connect」を選択
5. 「Upload」を選択
6. 証明書とプロビジョニングプロファイルを確認
7. 「Upload」をクリック

---

## 📤 手順 6: App Store Connect で審査提出

### Step 6-1: ビルドの選択

1. App Store Connect にログイン
2. アプリを選択
3. 「TestFlight」タブ
4. アップロードしたビルドが表示されるまで待つ（5-10 分）
5. ビルドの処理が完了したら「App Store」タブに移動

### Step 6-2: バージョン情報の入力

```
バージョン: 1.0.0
著作権: © 2025 宅建合格ロード. All rights reserved.
```

### Step 6-3: プライバシーの申告

1. 「App プライバシー」セクション
2. 以下のデータタイプを申告：

**収集するデータ:**

- 学習進捗データ（ユーザーアカウントにリンク）
- 使用状況データ（分析用）
- 広告データ（Google AdSense）

**データの使用目的:**

- アプリ機能の提供
- 分析
- 広告の最適化

### Step 6-4: テストアカウントの提供

```
ユーザー名: reviewer@takaapps.com
パスワード: [安全なパスワードを設定]

注記:
このアカウントはプレミアムプランが有効化されています。
すべての機能をテストできます。
```

### Step 6-5: 審査メモ

`docs/APP_STORE_DESCRIPTION.md` の審査員へのメモをコピー

### Step 6-6: 審査に提出

1. すべての情報を確認
2. 「審査に提出」をクリック
3. 確認ダイアログで「提出」

---

## ⏱️ 審査のタイムライン

| ステップ           | 所要時間   |
| ------------------ | ---------- |
| ビルドアップロード | 即時       |
| 処理中             | 5-30 分    |
| 審査待ち           | 1-3 日     |
| 審査中             | 24-48 時間 |
| 承認/リジェクト    | 即時       |

### 審査中にできること

- App Store Connect で統計を確認
- TestFlight でベータテスト（オプション）
- 次のバージョンの開発準備

---

## ❌ よくあるリジェクト理由と対策

### 1. 最小限の機能不足 (Guideline 4.2)

**理由**: アプリの機能が不十分
**対策**: 過去問、AI 機能、学習分析など、十分な教育的価値を提供していることを説明

### 2. In-App Purchase の説明不足 (Guideline 3.1.2)

**理由**: サブスクリプションの機能が不明確
**対策**: サブスクリプション画面で無料版との違いを明確に表示

### 3. プライバシーポリシーの不備 (Guideline 5.1.1)

**理由**: プライバシーポリシーが不完全
**対策**: `/privacy` ページで詳細なプライバシーポリシーを提供済み

### 4. デモアカウントの不提供 (Guideline 2.1)

**理由**: 審査員がアプリをテストできない
**対策**: テストアカウントを提供済み

### 5. メタデータとアプリの不一致 (Guideline 2.3)

**理由**: 説明文とアプリの機能が異なる
**対策**: 説明文を正確に記述し、スクリーンショットも実際の画面を使用

---

## 🎉 承認後のステップ

### 1. リリース

- App Store Connect で「このバージョンをリリース」をクリック
- 通常 24 時間以内に App Store に公開

### 2. 公開設定

```
リリース方法:
- 手動でリリース: 承認後に手動で公開
- 自動でリリース: 承認後すぐに公開（推奨）
```

### 3. マーケティング

- SNS（Twitter、Facebook）でアナウンス
- ウェブサイトで告知
- プレスリリース（オプション）

### 4. モニタリング

- App Store のレビューを毎日確認
- 評価への返信（ポジティブな印象）
- Crash Report の確認（Xcode から）

### 5. 継続的改善

- ユーザーフィードバックの収集
- バグ修正と新機能の開発
- 定期的なアップデート（月 1 回推奨）

---

## 📚 重要なリンク集

### Apple 公式

- [Apple Developer](https://developer.apple.com/)
- [App Store Connect](https://appstoreconnect.apple.com/)
- [App Store Review Guidelines](https://developer.apple.com/app-store/review/guidelines/)
- [Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/)

### ドキュメント（このプロジェクト）

- [App Store 申請ガイド](./APP_STORE_SUBMISSION_GUIDE.md)
- [App Store 掲載情報](./APP_STORE_DESCRIPTION.md)
- [スクリーンショット生成ガイド](../scripts/generate-screenshots.md)

---

## 🆘 トラブルシューティング

### Windows ユーザーの場合

**問題**: Xcode が使えず、ビルドできない

**解決策**:

1. **Mac を借りる/レンタルする**

   - 友人の Mac
   - インターネットカフェの Mac
   - Mac レンタルサービス ReRe レンタル等

2. **クラウド Mac サービスを使用**

   - MacStadium
   - Mac in Cloud
   - 月額 $30-50 程度

3. **仮想マシン（非推奨）**
   - VMware で macOS を実行
   - Apple の利用規約に違反する可能性あり

### ビルドエラーの場合

```bash
# 依存関係のクリーンアップ
cd ios/App
pod deintegrate
pod install

# Xcodeのキャッシュをクリア
rm -rf ~/Library/Developer/Xcode/DerivedData/*

# プロジェクトを再度開く
npx cap open ios
```

### 署名エラーの場合

1. Xcode → Preferences → Accounts
2. Apple ID を追加
3. 証明書を更新
4. プロジェクト設定で正しい Team を選択

---

## ✅ 最終チェックリスト

### Apple Developer Program

- [ ] Apple Developer Program に登録済み
- [ ] 年会費 $99 USD を支払い済み
- [ ] Apple Developer Console にアクセス可能

### App Store Connect

- [ ] アプリを作成済み
- [ ] App 情報を入力済み
- [ ] スクリーンショットをアップロード済み
- [ ] プライバシー情報を申告済み

### In-App Purchase

- [ ] サブスクリプショングループ作成済み
- [ ] プレミアムプラン商品を登録済み
- [ ] 価格を ¥500/月に設定済み
- [ ] 審査情報を入力済み

### ビルドとアップロード

- [ ] Mac でビルドをアーカイブ済み
- [ ] App Store Connect にアップロード済み
- [ ] ビルドの処理が完了

### 審査提出

- [ ] テストアカウントを作成済み
- [ ] 審査メモを入力済み
- [ ] すべての情報を確認済み
- [ ] 審査に提出完了

---

## 🎯 現時点での次のアクション

### あなたがすべきこと（優先順）

#### 1. Apple Developer Program に登録 ⚡

- https://developer.apple.com/programs/
- 所要時間: 10 分（審査は最大 24 時間）
- 費用: $99 USD/年

#### 2. Mac を用意

- 自分の Mac、または借りる/レンタル
- Xcode 15 以降をインストール

#### 3. スクリーンショットを撮影

- `scripts/generate-screenshots.md` を参照
- Xcode シミュレーターで撮影
- iPhone 15 Pro Max サイズ（1290 x 2796 px）

#### 4. App Store Connect でアプリ登録

- 基本情報の入力
- スクリーンショットのアップロード
- In-App Purchase 商品の設定

#### 5. Xcode でビルド＆アップロード

- Archive を作成
- App Store Connect にアップロード

#### 6. 審査に提出

- すべての情報を確認
- テストアカウントを提供
- 審査メモを入力
- 提出！

---

## 🎊 完了したら...

**おめでとうございます！** 🎉

これで「宅建合格ロード」が App Store に公開される準備が整いました。

審査は通常 2-3 日かかりますが、その間も：

- ユーザー獲得戦略を考える
- SNS アカウントを準備
- ウェブサイトの最適化
- 次のアップデートを計画

などの活動ができます。

**幸運を祈ります！頑張ってください！** 🚀📱
