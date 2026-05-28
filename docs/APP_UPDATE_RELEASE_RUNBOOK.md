# App Update Release Runbook

「商品として自信を持ってリリースする」ためのチェック動線。

## 1. ローカル / CI ゲート

CI (`.github/workflows/ci.yml`) と PR レビューで毎回走る:

```bash
npm run verify:release
```

中身（package.json:36）:

1. `lint:strict` — ESLint warnings ゼロ
2. `check-env` — 必須 env 変数の存在
3. `check:questions` — カテゴリ別問題数のスナップショット
4. `duplicate:questions` — 「問題文+選択肢+正解」フィンガープリント重複
5. `check:question-quality` — クイズとして成立しないデータの検出（CRITICAL=ブロック、WARNING=ログのみ）
   - CRITICAL: 選択肢重複 / 正解index範囲外 / 必須フィールド空 / カテゴリ不一致 / 4択前提の選択肢不足
   - WARNING: ID重複（既存技術的負債、要リナンバー）
6. `check:app-store` — App Store 審査5項目（後述）の自動回帰
7. `check:subscription-copy` — 価格表記の整合性
8. `build` — Next.js 本番ビルド

スモーク E2E:

```bash
npm run test:e2e:smoke
```

## 2. App Store 審査5項目の自動チェック

`scripts/test/app-store-safety.ts` で 2026-03-15 リジェクトの再発を検出:

| Guideline | 検出内容 |
|---|---|
| 5.1.2(i) Privacy / ATT | Info.plist に NSUserTrackingUsageDescription / SKAdNetworkItems が無いこと、AdSenseScript が iOS で skip すること |
| 2.3.8 アイコン | AppIcon-1024x1024@1x.png が 10KB 超（プレースホルダー画像でない） |
| 2.3.10 Android/Google Play 表記 | app/page, /legal, /subscription, /support で言及があれば useIsIOSApp 分岐必須 |
| 4.8 Sign in with Apple | auth/login に Apple ログインボタン + OAuth ワイヤリング |
| 2.1(a) IAP プランタップエラー | pricing の createCheckoutSession が try/catch でエラー UI に繋がる |

## 3. 本番デプロイ前（Vercel / App Store ビルド）

CI の placeholder env では検出できない本番固有の設定を確認:

```bash
npm run release:production
```

内訳:

1. `verify:production-env` (`scripts/check/production-env.ts`)
   - `STRIPE_SECRET_KEY` は `sk_live_` で始まる（`pk_` 誤投入を即検出）
   - `STRIPE_WEBHOOK_SECRET` / `PRICE_ID` の prefix 整合
   - `FIREBASE_SERVICE_ACCOUNT_KEY` の JSON 妥当性、`project_id` が NEXT_PUBLIC_FIREBASE_PROJECT_ID と一致
   - `NEXT_PUBLIC_APP_URL` が https
   - `ALLOW_DEV_BYPASS_AUTH=true` / `NEXT_PUBLIC_SKIP_AUTH=true` で fail
2. `verify:release` — 上記の全ゲート

加えて、ランタイム起動時 (`lib/env-validator.ts`) が `NODE_ENV=production` でも
同じ検証を行うため、Vercel 上で env を間違えてもデプロイ直後に loud fail する。

## 4. App Store ビルド前

```bash
npm run verify:ios
```

中身: `check:app-store` + `build:ios` (Capacitor 用 static export)。

加えて手動チェック:

- `ios/App/App/PrivacyInfo.xcprivacy` が Xcode の target resources に含まれること
- App Store Connect の IAP 価格が `lib/types/subscription.ts` / `ios/App/TakkenIAP.storekit` と一致
- サブスクメタが価格・期間・自動更新文言・利用規約/プライバシーリンク・購入復元を表示
- iOS ビルドが起動時に Web 広告スクリプトを読まず、ATT を最初に要求しないこと

## 5. TestFlight Pass

- iPhone と iPad の両方で実機インストール
- 起動→ログイン→無料学習フロー→プレミアム画面→購入復元→サポート→利用規約→プライバシー の動線
- 審査メモにデモアカウント情報を記載（ログイン必須機能がある場合）

## 6. リリースノート 雛形

```text
This update improves App Store compliance, subscription display consistency, and release checks. It also stabilizes Firebase initialization and restores automated verification for the main login and home flows.
```

## 既知の警告（非ブロッキング）

- `react-hooks/exhaustive-deps` がいくつかの既存コンポーネントに残存
- `check:question-quality` の WARNING で ID重複が 25 件表示される。
  AIバッチ生成器が同IDレンジを複数バッチで再利用した既存データ起因。
  runtime dedupe (`lib/question-dedupe.ts`) で表示重複は1つに絞られているため
  ユーザー直接影響は限定的。次の P1 タスクで全体リナンバー予定。
- `build:ios` は Capacitor の static export 仕様により Next.js の標準警告を出す

## P1（次の改善候補）

- Sentry / Firebase Crashlytics 同等の error reporting 導入
- AI API 失敗時のフォールバック UX 明示化
- Stripe webhook 冪等性のユニットテスト
- ID重複リナンバー（同カテゴリ内 IDs を一意化、Firestore 影響評価込み）
- E2E golden path 拡張（register→quiz→answer→stats）
