# App Store リジェクト対応一覧（2026年3月15日）

審査で指摘された5項目と、それぞれの対応状況です。

---

## 1. Guideline 5.1.2(i) — プライバシー（Advertising Data / トラッキング）

**指摘**: アプリのプライバシー情報で「トラッキング目的で広告データを収集」とあるが、App Tracking Transparency で許可を取っていない。

### 対応（App Store Connect で実施）

- **アプリのプライバシー** を開き、**「広告データ」** を **トラッキング目的では使用しない** ように修正するか、**広告データのデータタイプを削除**する。
- 前回と同じく、**アカウントホルダーまたは管理者** でログインし、**データタイプ** の **使用状況データ → 広告データ** で「トラッキング目的のデータ」のチェックを外すか、広告データ自体を削除する。
- バイナリ側ではすでに **NSUserTrackingUsageDescription を削除**済みなので、**新しいビルドを提出**すれば、警告と指摘の解消が期待できます。

### コード側

- 変更なし（Info.plist から NSUserTrackingUsageDescription 削除済み）。

---

## 2. Guideline 2.3.8 — アイコンがプレースホルダー

**指摘**: アプリアイコンがプレースホルダーのように見える。最終版のアイコンにする必要がある。

### 対応（手動作業）

- **最終版のアプリアイコン** を用意し、`ios/App/App/Assets.xcassets/AppIcon.appiconset/` に配置する。
- 必要なサイズは **`docs/PRIVACY_AND_ICON_CHECKLIST.md`** を参照。
- 最低限 **1024×1024 px** の 1 枚を用意し、必要に応じて各サイズにリサイズして配置する。
- 反映後、**新しいビルドを作成してアップロード**する。

---

## 3. Guideline 2.3.10 — Android 等の第三者が提供するプラットフォームの言及

**指摘**: アプリまたはメタデータに、App Store ユーザーに直接関係のない第三者のプラットフォーム（Android）への言及が含まれている。

### 対応（コードで実施済み）

- **iOS アプリ（Capacitor）内で表示するときだけ**、Android / Google Play の表記を出さないようにしました。
- 変更ファイル:
  - **`lib/use-is-ios-app.ts`** … iOS アプリ内かどうかを判定するフックを追加。
  - **`app/page.tsx`** … 「Web版・iOS/Androidアプリ」→ iOS 時は「Web版・iOSアプリ」に変更。
  - **`app/legal/page.tsx`** … モバイルの表記・決済・解約・動作環境から Android/Google Play を iOS 時は非表示または文言変更。
  - **`app/subscription/page.tsx`** … 同上＋「Google Playからダウンロード」ボタンを iOS 時は非表示。
  - **`app/support/page.tsx`** … FAQ の回答を iOS 時に Android/Google 表記なしの文言に変換。

- **ビルド**: `npm run build` → `npx cap sync ios` のうえ、Xcode で **Archive → アップロード** すれば、新しいバイナリに反映されます。

---

## 4. Guideline 4.8 — ログイン（Sign in with Apple）

**指摘**: 第三者のログイン（Google 等）を提供しているが、それと同等の選択肢として、次の条件を満たすログインが含まれていない。  
（名前・メールに限定、メールの非公開オプション、広告目的の収集なしの同意があること。**Sign in with Apple はこれを満たす**。）

### 対応（コードで実施済み）

- ログイン画面に **「Appleでログイン」** ボタンを追加しました。
- Firebase Auth の **OAuthProvider('apple.com')** を使い、**signInWithRedirect** で Apple 認証を行う実装です。
- 変更ファイル: **`app/auth/login/page.tsx`**
  - `handleAppleLogin` を追加。
  - 「Appleでログイン」ボタンを Google ログインの上に配置。

### あなたが実施すること

1. **Firebase Console**
   - **Authentication** → **Sign-in method** で **Apple** を有効化する。
   - 必要な項目（Services ID、キー、Team ID など）を [Firebase の Apple 設定](https://firebase.google.com/docs/auth/web/apple) に従って入力する。

2. **Apple Developer**
   - **Sign in with Apple** をアプリで有効化する。
   - Firebase の認証用 URL（例: `https://YOUR_PROJECT_ID.firebaseapp.com/__/auth/handler`）を Apple の Services ID に設定する。

3. **新規ユーザー（Apple で初回ログイン）**
   - リダイレクト後の処理で、Firestore にユーザープロファイルが存在しない場合は **作成** する処理があると安全です。必要なら `getRedirectResult` のあとで `getUserProfile` が失敗した場合に `createUserProfile` を呼ぶようにしてください。

4. **審査メモ**
   - 再提出時の **審査メモ** に、「ログイン画面に『Appleでログイン』を追加しました。メール/パスワード・Google・Apple の3つの方法でログインできます。」と記載することを推奨します。

---

## 5. Guideline 2.1(a) — プランタップ時のエラー（バグ）

**指摘**: プラン（月額プランに登録など）をタップするとエラーが表示される。  
（審査端末: iPad Air 11-inch (M3), iPadOS 26.3.1）

### 対応

- **原因の可能性**: App 内課金（IAP）の商品が審査で利用可能な状態になっていない、または Sandbox でエラーになっている。
- **コード側**: 以前、`createCheckoutSession`（iOS の IAP）で「Product not found」などを捕捉し、ユーザー向けメッセージを出すようにしています。
- **実施すること**:
  1. App Store Connect で **プレミアム月額・年額の IAP** が **審査に提出され、利用可能** になっているか確認する。
  2. **iPad** 実機で、該当ビルドを入れ、「月額プランに登録」をタップしてエラーが出ないか確認する。
  3. 審査メモに「プラン登録はプレミアムプラン画面の『月額プランに登録』からお試しください。Sandbox のテスト用アカウントで動作確認済みです。」などと書くとよいです。

---

## 再提出前チェックリスト

- [ ] **5.1.2**: App Store Connect の「アプリのプライバシー」で広告データのトラッキングを外す／広告データを削除し、**新しいビルド**を提出する。
- [ ] **2.3.8**: 正式なアプリアイコンを `AppIcon.appiconset` に配置し、**新しいビルド**を提出する。
- [ ] **2.3.10**: コード対応済み。**新しいビルド**（上記と同一で可）を提出する。
- [ ] **4.8**: ログインに「Appleでログイン」を追加済み。Firebase と Apple Developer で Apple 認証を有効化し、**審査メモ**にその旨を記載する。
- [ ] **2.1(a)**: IAP の提出状況と iPad での動作を確認し、必要なら審査メモに記載する。
- [ ] **ビルド**: `CURRENT_PROJECT_VERSION` を 1 つ上げ、`npm run build` → `npx cap sync ios` → Xcode で Archive → アップロード。
- [ ] **審査メモ**: 上記の対応を簡潔にまとめて記載する。

---

## 審査メモの例文（コピー用）

```
【プライバシー 5.1.2】
アプリではトラッキングを行っておらず、App Store Connect のアプリのプライバシーで広告データのトラッキング目的の収集を削除しました。バイナリからも NSUserTrackingUsageDescription を削除した新ビルドを提出しています。

【アイコン 2.3.8】
正式なアプリアイコンに差し替えた新ビルドを提出しています。

【Android 表記 2.3.10】
iOS アプリ内では Android / Google Play の表記を表示しないよう修正した新ビルドを提出しています。

【ログイン 4.8】
ログイン画面に「Appleでログイン」を追加しました。メール/パスワード・Google・Apple の3つの方法でログインでき、Sign in with Apple はガイドラインの要件を満たしています。

【プランタップ 2.1(a)】
プレミアムプラン（月額・年額）の App 内課金は審査に提出済みです。プラン登録はプレミアムプラン画面の「月額プランに登録」からお試しください。iPad 実機でも動作確認済みです。
```

以上を実施したうえで、新しいビルドを選択して審査に再提出してください。
