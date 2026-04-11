# App Store 再提出ガイド — 宅建合格ロード

リジェクトメールで指摘された4点への対応と、修正ビルドのアップロード手順です。

---

## 1. 新しいビルドのアップロード手順

### 前提
- 修正を反映した状態で **Next.js のビルド** と **Capacitor の同期** が完了していること
- Mac で **Xcode** が利用できること

### 手順

1. **Web ビルドの更新**
   ```bash
   cd /Users/taka/takken-main
   npm run build
   npx cap sync ios
   ```

2. **Xcode でプロジェクトを開く**
   - `ios/App/App.xcworkspace` を開く（`.xcodeproj` ではなく `.xcworkspace`）
   - または: `npx cap open ios` で開く

3. **バージョン・ビルド番号の更新（必要に応じて）**
   - プロジェクトナビゲータで「App」を選択 → **Signing & Capabilities** タブ
   - **General** タブで **Version** と **Build** を更新
   - 再提出の場合は **Build** を必ず1つ上げる（例: 1 → 2）

4. **アーカイブの作成**
   - メニュー: **Product** → **Destination** で **Any iOS Device (arm64)** を選択
   - **Product** → **Archive** を実行
   - 完了後、Organizer ウィンドウが開く

5. **App Store Connect へアップロード**
   - Organizer で該当アーカイブを選択 → **Distribute App**
   - **App Store Connect** → **Upload** を選択
   - オプションは既定のままで **Next** → 署名設定を確認 → **Upload**
   - アップロード完了後、**App Store Connect** 上でビルドが「処理中」→「利用可能」になるまで待つ（数分〜30分程度）

6. **審査用にビルドを選択**
   - [App Store Connect](https://appstoreconnect.apple.com) → **マイApp** → **宅建合格ロード**
   - **iOS App** → 該当バージョン（例: 1.0）の **ビルド** で、今アップロードしたビルドを選択
   - **保存** 後、**審査に提出** で再提出

---

## 2. リジェクト指摘への対応

### Guideline 5.1.2 — プライバシー（トラッキング）

**指摘**: アプリのプライバシー情報で「トラッキングのため」に Device ID・Advertising Data を収集すると記載されているが、App Tracking Transparency（ATT）で許可を取っていない。

**対応（どちらか一方でよい）**

- **アプリがトラッキングをしていない場合（推奨）**
  1. App Store Connect → **宅建合格ロード** → **アプリのプライバシー**
  2. 「データの収集」で **トラッキング目的のデータ収集** を **オフ** にする、または
  3. Device ID・Advertising Data を「トラッキング目的」では収集しないようにラベルを修正
  4. 必要に応じて、該当データタイプを削除または「アプリの機能提供」のみに変更
  5. **アカウントホルダー** または **管理者** ロールが必要です。変更できない場合は、リジェクトへの返信で「アプリはトラッキングを行っていません。プライバシーラベルを更新します」と記載

- **アプリがトラッキングする場合**
  - トラッキングを開始する**前**に、`AppTrackingTransparency` で `requestTrackingAuthorization` を呼ぶ実装にする
  - 本プロジェクトでは `capacitor.config.json` に `AppTrackingTransparencyPlugin` が含まれており、`Info.plist` に `NSUserTrackingUsageDescription` が設定済みです。**実際にトラッキングする**のであれば、アプリ起動後適切なタイミングで許可ダイアログを表示する処理を追加してください。

---

### Guideline 2.3.8 — メタデータ（アイコン）

**指摘**: アプリアイコンがプレースホルダーのように見える。

**対応**

1. すべての必要なサイズで **最終版のアプリアイコン** を用意する
2. Xcode: **Assets.xcassets** → **AppIcon** に、各サイズの画像を設定
3. アイコンは相互に似たデザインにして、ストアやホーム画面で同一アプリと分かるようにする
4. 再アーカイブして新しいビルドをアップロードする

参考: [Adding icons - Apple](https://developer.apple.com/help/app-store-connect/reference/adding-icons)

---

### Guideline 2.1 — アプリの完全性（月額プランタップ時のエラー）

**指摘**: 「月額プランに登録」をタップするとエラーが表示される。  
（審査端末: iPad Air 11-inch (M3), iPadOS 26.2）

**原因の可能性**

- **App 内課金（IAP）が App Store Connect に登録・提出されていない**  
  → StoreKit で商品を取得できず `Product not found` 相当のエラーになりやすいです。
- 上記を解消したうえで、**iPad** でも同様の操作でエラーが出ないか実機で確認してください。

**対応**

1. **IAP の提出**（下記「Guideline 2.1 — App 内課金」を完了する）
2. **実機での動作確認**
   - iPad でアプリをインストール
   - ダッシュボード → プレミアム/月額プラン → 「月額プランに登録」をタップ
   - エラーやクラッシュが出ないこと、購入フローが進むことを確認
3. 問題が再現する場合は、エラーメッセージや再現手順をメモし、**審査用メモ** に記載して再提出

---

### Guideline 2.1 — アプリの完全性（App 内課金の未提出）

**指摘**: アプリに「Premium Plan」の記載があるが、対応する App 内課金商品が審査に提出されていない。

**対応（必須）**

1. **App Store Connect で IAP を作成・提出**
   - App Store Connect → **宅建合格ロード** → **収益化** → **App 内課金**
   - 以下の **サブスクリプション**（または該当する課金タイプ）を作成し、**審査に提出** する:
     - **月額**: 商品 ID `com.takamonta.takken.premium.monthly`
     - **年額**: 商品 ID `com.takamonta.takken.premium.yearly`
   - 価格・表示名・説明・**App Review 用スクリーンショット** をすべて入力する

2. **App Review 用スクリーンショット**
   - アプリ内で「月額プランに登録」やプレミアムプラン選択画面が表示されている画面のスクリーンショットを用意
   - 各 IAP のメタデータの「**App Review 用スクリーンショット**」に追加（必須）

3. **審査用メモ（Review Notes）**
   - 再提出時の **審査メモ** に、例えば次のように記載することを推奨します:
     - 「App 内課金（月額・年額のプレミアムプラン）を提出しました。購入はプレミアムプラン画面の『月額プランに登録』『年額プランに登録』から行えます。」

4. **新しいバイナリのアップロード**
   - IAP を提出した**後**に、上記「1. 新しいビルドのアップロード手順」に従い、**新しいビルド**をアップロードして、そのビルドを審査に紐付けて提出する

参考: [Submitting In-App Purchases and subscriptions to App Review](https://developer.apple.com/help/app-store-connect/submit-your-app/submitting-in-app-purchases-and-subscriptions-to-app-review)

---

## 3. 再提出前チェックリスト

- [ ] プライバシー: トラッキングを行っていない場合は App Store Connect のプライバシーラベルを修正した（または ATT を実装した）
- [ ] アイコン: すべてのアプリアイコンを最終版に差し替え、Xcode で反映した
- [ ] IAP: 月額・年額の App 内課金を作成し、App Review 用スクリーンショットを添付して審査に提出した
- [ ] バグ: iPad で「月額プランに登録」をタップし、エラーが出ないことを確認した
- [ ] ビルド: `npm run build` → `npx cap sync ios` を実行した
- [ ] アーカイブ: Xcode で **Build** 番号を上げ、**Archive** → **Distribute App** でアップロードした
- [ ] App Store Connect で該当バージョンに新しいビルドを選択し、**審査に提出** した
- [ ] 必要に応じて **審査メモ** に、IAP の場所・プライバシー対応内容・テスト手順を記載した

---

## 4. リジェクトへの返信（例）

App Store Connect の該当審査の **「返信」** で、以下のような内容を送れます。

```
お世話になっております。

以下の対応を行いました。

1. プライバシー（5.1.2）
   - 本アプリはトラッキングを行っておりません。App Store Connect の
     「アプリのプライバシー」で、トラッキング目的のデータ収集に関する
     表示を修正しました。
     （または: ATT を実装し、トラッキング前に許可を求めるようにしました。）

2. アイコン（2.3.8）
   - すべてのアプリアイコンを正式版に差し替えた新ビルドをアップロードしました。

3. 月額プランタップ時のエラー（2.1）
   - App 内課金を審査に提出したうえで、iPad 実機で動作確認済みです。
     プレミアムプラン画面の「月額プランに登録」から購入フローをご確認ください。

4. App 内課金の提出（2.1）
   - プレミアムプラン（月額・年額）の App 内課金を登録し、
     App Review 用スクリーンショットを添付のうえ審査に提出しました。

ご確認のほどよろしくお願いいたします。
```

---

以上を実施したうえで、新しいビルドをアップロードし、審査に再提出してください。
