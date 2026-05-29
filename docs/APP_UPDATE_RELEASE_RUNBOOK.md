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
# 1. ビルド番号を bump（CURRENT_PROJECT_VERSION）。提出のたび必須。
npm run bump:ios-build:dry     # 差分プレビュー
npm run bump:ios-build         # 実行 (例: 3 -> 4)

# パッチ版を上げるときは marketing version も bump
npx ts-node scripts/release/bump-ios-build.ts --marketing patch   # 1.4 -> 1.4.1

# 2. iOS preflight
npm run verify:ios
```

`verify:ios` の中身: `check:app-store` + `build:ios` (Capacitor 用 static export)。

加えて手動チェック:

- `ios/App/App/PrivacyInfo.xcprivacy` が Xcode の target resources に含まれること
- App Store Connect の IAP 価格が `lib/types/subscription.ts` / `ios/App/TakkenIAP.storekit` と一致
- サブスクメタが価格・期間・自動更新文言・利用規約/プライバシーリンク・購入復元を表示
- iOS ビルドが起動時に Web 広告スクリプトを読まず、ATT を最初に要求しないこと

### CFBundleVersion bump スクリプトの安全装置

`scripts/release/bump-ios-build.ts` は次の事故を防ぐ:

- DEBUG / RELEASE config の `CURRENT_PROJECT_VERSION` が乖離していたら fail
- `MARKETING_VERSION` も同様
- 書き換え後に行末セミコロンを再検証し、破壊書き込みを防止
- `--dry-run` で実書き込みなしのプレビュー

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

## 7. 本番障害の観測（error reporting）

`lib/error-reporter.ts` の抽象 + `@sentry/nextjs` SDK + `components/SentryWireup.tsx`
で **client / server / edge** の全 runtime をカバー済み。残りは Sentry 側で
プロジェクトを作って DSN を投入するだけ。

### コードから使う

```ts
import { reportError, setReportUser } from "@/lib/error-reporter";

// ログイン時（FirebaseInitializer などで）
setReportUser(firebaseUser.uid);

// エラー発生時
try {
  await createCheckoutSession(...);
} catch (err) {
  reportError(err, { tags: { route: "/subscription/pricing" }, severity: "error" });
  throw err;
}
```

DSN 未設定でも `logger` に構造化ログを出すだけで no-op。Sentry SDK の init
自体が DSN 無しでスキップされ、`SentryWireup` も実質 idle になる。

### Sentry を有効化する手順

1. https://sentry.io でプロジェクト作成（Platform: Next.js）
2. DSN と auth token を取得
3. `.env.local` / Vercel 環境変数に投入:
   ```
   NEXT_PUBLIC_SENTRY_DSN=https://xxxx@oXXXX.ingest.sentry.io/XXXX
   SENTRY_ORG=your-org-slug
   SENTRY_PROJECT=takken
   SENTRY_AUTH_TOKEN=sntrys_xxxxx
   ```
4. デプロイ。`production-env` チェックが DSN 形式を検証する。

### サンプリング設定（free tier 5k events/月に収めるため）

| env var | 既定値 | 用途 |
|---|---|---|
| `NEXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE` | 0.1 | パフォーマンストレースの 10% を送信 |
| `NEXT_PUBLIC_SENTRY_REPLAYS_ON_ERROR_SAMPLE_RATE` | 1.0 | エラー発生時のセッションリプレイを 100% 取得 |

通常時 (no-error) のセッションリプレイは常時 OFF (`replaysSessionSampleRate: 0`)。

### Firebase Crashlytics（iOS native crash 用、未実装）

iOS WebView 内の JS エラーは Sentry が自動捕捉するが、Capacitor / Swift 層の
ネイティブクラッシュは別途 Crashlytics か `@sentry/capacitor` で追加対応が必要。

## 8. iOS ビルドの仕組み（API Routes / middleware の退避）

`npm run build:ios` は `scripts/release/build-ios.ts` のラッパー。
直接 `CAPACITOR_BUILD=true next build` を呼ぶと、API Routes と middleware が
`output: "export"` 不可で fail するため、次の手順で安全にビルドする:

1. `app/api/` と `middleware.ts` を `.ios-build-backup/` に退避
2. `CAPACITOR_BUILD=true next build` を実行（静的エクスポート）
3. ビルド成否に関わらず `app/api/` と `middleware.ts` を復元
4. `.ios-build-backup/` を削除

安全装置:
- 起動時に stale backup を検出: src が無く backup だけある状態なら自動復旧、
  src と backup の両方ある状態なら fatal で人間判断を促す
- `try/finally` でビルド失敗時も復元
- `SIGINT` / `SIGTERM` ハンドラで Ctrl+C 中断時も復元
- 復元時に dest が既存なら overwrite せず警告

Web 版（Vercel）は API Routes と middleware を含む。iOS 版はそれらを除いた
静的バンドルのみで動作する（iOS の課金は StoreKit ネイティブ、API は
fetch で本番 Vercel エンドポイントを叩く）。

## 9. Stripe Webhook の冪等性

`lib/stripe-webhook-idempotency.ts` で「claim → 処理 → 完了マーク」のライフ
サイクルを実装し、`app/api/subscription/webhook/route.ts` が全イベントを
それでラップしている。

| 状況 | 挙動 |
|---|---|
| 初回受信 | Firestore `processedStripeEvents/{event.id}` を作成 → handler 実行 → completed |
| Stripe が同じ event.id を再送（最大10回） | claim transaction で既存検出 → handler スキップ → `{ received: true, idempotency: "skipped" }` |
| 並行リクエスト（webhook を同時受信） | Firestore transaction で原子的に claim、一方だけが処理 |
| handler 失敗（throw） | release で claim を解放、Stripe の再送に再処理を委ねる（500 を返す） |

これにより、再送 / 並行リクエスト / リトライのいずれでも `stripe.subscriptions.retrieve`
と `subscriptions/{userId}` への書き込みが二重実行されない。

データモデル: `processedStripeEvents/{event.id}` に `{ eventId, type,
status: "processing" | "completed", claimedAt, completedAt }` を保存。

検証: `npm run test:stripe-webhook-idempotency` で 7 ケース（初回処理、重複スキップ、
失敗時 release、release 失敗時のエラー伝播、metadata 記録、独立性、5 回再送で
1 回のみ実行）を pass。

## 10. AI API 失敗時のフォールバック

`lib/ai-fallback.ts` の `withAIFallback()` が AI 呼び出しをラップし、
失敗時に以下を保証する:

1. **観測**: `error-reporter` 経由で Sentry に forward（DSN 未設定なら logger のみ）
2. **分類**: `rate_limit` / `network` / `timeout` / `auth` / `server` / `unknown` の reason
3. **ユーザー向け文言**: reason 別の中立的な日本語メッセージ
4. **retryable フラグ**: network / timeout / server のときのみ true
5. **fallback 値**: consumer が `options.fallback` で渡したもの（例: question.explanation）

統合済み:

- [components/AIHintChat.tsx](components/AIHintChat.tsx)
  - 重複した API key 文字列マッチを撤去、`withAIFallback` に統一
  - rate_limit は AIUsageLimitNotice、それ以外は通常エラー UI に振り分け
  - retryable な失敗は「もう一度試す」ボタンを表示し、同じメッセージで再送
- [components/StudyInfoSection.tsx](components/StudyInfoSection.tsx)
  - AI 学習アドバイス取得を `withAIFallback` 化
  - 既存の `generateFallbackInfo()` 静的アドバイスを失敗時に表示
  - キャッシュ JSON 破損や localStorage 容量超過も try/catch でガード
  - エラー footer の文言を「キャッシュから表示」から実態の「汎用アドバイス表示」に修正

```ts
const result = await withAIFallback(
  () => aiClient.chat(messages, options),
  { tags: { component: "AIHintChat", questionCategory: category } },
);

if (result.success) {
  // result.value を使う
} else if (result.reason === "rate_limit") {
  // 利用上限案内（プラン誘導）
} else {
  // result.userMessage を表示、result.retryable なら retry ボタン
}
```

検証: `npm run test:ai-fallback` で 8 ケース pass（classify の網羅、severity 振り分け、
retryable フラグ、fallback 値返却、reporter forward、非 Error の wrap）。

設計メモ: `withAIFallback<T>` の generic 型 T は AI 呼び出しの戻り値型に
固定されるため、AIResponse → 別ドメイン型（例: StudyInfo）への変換を伴う
fallback は `options.fallback` 経由では渡せない。consumer 側で
`result.success` を見て静的フォールバックに振り分ける。StudyInfoSection が
この典型例。

実態調査: quiz pages (`practice/quiz`, `mock-exam/quiz`, `weak-points/quiz`,
`quick-test/quiz`) は aiClient を直接呼んでおらず、AI 機能は AIHintChat /
StudyInfoSection / ExplanationDisplay (server 経由) を経由する構造。
従って主要 client-side AI 呼び出しは現状の 2 コンポーネントで網羅される。

## 11. 強制アップデート機構

`lib/version-check.ts` + `components/ForceUpdateNotice.tsx` で、リリース済み
アプリでクリティカルバグを発見した際に古いビルドのユーザーを最新版に誘導する
仕組み。

### 仕組み

```
起動 → app/layout.tsx に <ForceUpdateNotice /> マウント
  ↓ useEffect
  ↓ checkAppVersion()
  ├─ detectPlatform(): ios / web を判定
  ├─ getCurrentVersion(): NEXT_PUBLIC_APP_VERSION を読む
  ├─ fetchAppConfig("/app-config.json"): リモート config を取得 (cache: no-store)
  ├─ compareVersions(current, minimum[platform])
  └─ forceUpdate=true なら全画面モーダル表示 → ストアリンク
```

### リモート config: `public/app-config.json`

```json
{
  "minVersion": { "ios": "1.4.0", "web": "1.4.0" },
  "forceUpdate": false,
  "message": "重要な不具合修正があります。最新版にアップデートしてください。",
  "storeUrl": { "ios": "https://apps.apple.com/jp/app/<APP_ID>" }
}
```

緊急時は `public/app-config.json` を更新して再デプロイ → Vercel edge で
全クライアントに即時反映。`forceUpdate: true` でバージョン比較を飛ばして
全員強制（メンテナンス停止用）。

### 安全装置

- `fetchAppConfig` 失敗時は `forceUpdate: false`（全ユーザーロックアウト事故を防ぐ）
- `NEXT_PUBLIC_APP_VERSION` 未設定時も `forceUpdate: false`
- `parseVersion` 失敗時は比較スコア 0（保守的）

### リリース運用

提出のたびに3つを同期する:

1. `npm run bump:ios-build` で `CURRENT_PROJECT_VERSION` / `MARKETING_VERSION` を bump
2. `.env.local` / Vercel の `NEXT_PUBLIC_APP_VERSION` を新 `MARKETING_VERSION` に合わせる
3. 旧バージョンを切るタイミングで `public/app-config.json` の `minVersion` を更新

検証: `npm run test:version-check` で 18 ケース（parse / compare /
isForceUpdateRequired / fetch 成功・失敗・例外・空 baseUrl / checkAppVersion
の各分岐・プラットフォーム別 / forceUpdate=true 強制 / storeUrl オーバーライド
/ current 未設定）を pass。

## P1（次の改善候補）

- ✅ error reporter 抽象化
- ✅ Sentry SDK wire-up（client / server / edge / instrumentation 完成）
- ⏳ Sentry 側プロジェクト作成と DSN 投入（運用作業）
- ✅ CFBundleVersion 自動 bump スクリプト
- ✅ `build:ios` の API Routes 衝突解消（退避→ビルド→復元のラッパー）
- ✅ Stripe webhook 冪等性（実装 + ユニットテスト）
- ✅ AI API 失敗時のフォールバック UX（ライブラリ + AIHintChat + StudyInfoSection 統合）
- ✅ 強制アップデート機構（version-check + ForceUpdateNotice + remote app-config）
- ⏳ `public/app-config.json` の `storeUrl.ios` を実 App ID に差し替え（運用作業）
- ID重複リナンバー（同カテゴリ内 IDs を一意化、Firestore 影響評価込み）
- E2E golden path 拡張（register→quiz→answer→stats）
- 段階リリース（TestFlight Beta → Phased Release）の運用化
- iOS native crash の Crashlytics または `@sentry/capacitor` 追加
