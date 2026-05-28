/**
 * App Store 審査リスクの自動回帰テスト
 *
 * 2026-03-15 のリジェクトで指摘された 5 項目（と関連する周辺リスク）が
 * コード/設定上で再発していないかを CI で検出する。
 *
 *   5.1.2(i)  Privacy / ATT       … NSUserTrackingUsageDescription を持たない
 *   2.3.8     アイコンプレースホルダー … AppIcon-1024x1024@1x.png が実画像（10KB超）として存在
 *   2.3.10    Android / Google Play 表記 … 該当ページが useIsIOSApp で分岐済み、もしくは表記なし
 *   4.8       Sign in with Apple   … ログイン画面に Apple ログインが実装されている
 *   2.1(a)    IAP プランタップ失敗  … createCheckoutSession 系のエラー UI が存在
 */

import { existsSync, readFileSync, statSync } from "fs";
import { join } from "path";

const root = process.cwd();
const failures: string[] = [];

function read(relativePath: string): string {
  return readFileSync(join(root, relativePath), "utf8");
}

function expect(condition: boolean, message: string) {
  if (!condition) failures.push(message);
}

// ---------------------------------------------------------------------------
// 既存チェック: 広告・ATT・PrivacyInfo
// ---------------------------------------------------------------------------

const layout = read("app/layout.tsx");
expect(
  !layout.includes("TrackingPermission"),
  "Root layout must not request ATT automatically on first launch"
);
expect(
  !layout.includes("pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"),
  "Root layout must not inject AdSense directly into the iOS shell"
);
expect(
  layout.includes("AdSenseScript"),
  "Root layout should delegate ad loading to the guarded AdSenseScript component"
);

const adSenseScriptPath = "components/AdSenseScript.tsx";
expect(existsSync(join(root, adSenseScriptPath)), "AdSenseScript component is missing");
if (existsSync(join(root, adSenseScriptPath))) {
  const adSenseScript = read(adSenseScriptPath);
  expect(
    /Capacitor\.getPlatform\(\)\s*===\s*["']ios["']/.test(adSenseScript),
    "AdSenseScript must skip loading ads inside the iOS Capacitor app"
  );
  expect(
    adSenseScript.includes("pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"),
    "AdSenseScript should keep web AdSense loading for non-iOS web builds"
  );
}

const pricingPage = read("app/subscription/pricing/page.tsx");
expect(
  pricingPage.includes("native-purchase-success"),
  "Pricing page must handle the native iOS purchase success sentinel"
);
expect(
  pricingPage.includes('router.push("/subscription/success'),
  "Native iOS purchases should route to the success screen instead of assigning window.location.href"
);

const privacyManifestPath = "ios/App/App/PrivacyInfo.xcprivacy";
expect(existsSync(join(root, privacyManifestPath)), "PrivacyInfo.xcprivacy is missing from the iOS app target");
if (existsSync(join(root, privacyManifestPath))) {
  const privacyManifest = read(privacyManifestPath);
  [
    "NSPrivacyTracking",
    "<false/>",
    "NSPrivacyAccessedAPICategoryUserDefaults",
    "CA92.1",
    "NSPrivacyCollectedDataTypeEmailAddress",
    "NSPrivacyCollectedDataTypeUserID",
    "NSPrivacyCollectedDataTypeProductInteraction",
    "NSPrivacyCollectedDataTypePurchaseHistory",
  ].forEach((needle) => {
    expect(
      privacyManifest.includes(needle),
      `Privacy manifest must include ${needle}`
    );
  });
}

const projectFile = read("ios/App/App.xcodeproj/project.pbxproj");
expect(
  projectFile.includes("PrivacyInfo.xcprivacy in Resources"),
  "PrivacyInfo.xcprivacy must be copied into the iOS app bundle resources"
);

// ---------------------------------------------------------------------------
// 5.1.2(i): Info.plist に NSUserTrackingUsageDescription を持たない
// ---------------------------------------------------------------------------

const infoPlistPath = "ios/App/App/Info.plist";
expect(existsSync(join(root, infoPlistPath)), "Info.plist is missing");
if (existsSync(join(root, infoPlistPath))) {
  const infoPlist = read(infoPlistPath);
  expect(
    !infoPlist.includes("NSUserTrackingUsageDescription"),
    "[Guideline 5.1.2(i)] Info.plist must NOT contain NSUserTrackingUsageDescription (App Tracking Transparency)"
  );
  expect(
    !infoPlist.includes("SKAdNetworkItems"),
    "[Guideline 5.1.2(i)] Info.plist should not list SKAdNetworkItems while ads are disabled on iOS"
  );
}

// ---------------------------------------------------------------------------
// 2.3.8: アプリアイコンがプレースホルダーでないこと
// ---------------------------------------------------------------------------

const appIcon1024Path = "ios/App/App/Assets.xcassets/AppIcon.appiconset/AppIcon-1024x1024@1x.png";
expect(
  existsSync(join(root, appIcon1024Path)),
  "[Guideline 2.3.8] 1024x1024 app icon is missing"
);
if (existsSync(join(root, appIcon1024Path))) {
  const size = statSync(join(root, appIcon1024Path)).size;
  expect(
    size > 10 * 1024,
    `[Guideline 2.3.8] 1024x1024 app icon is suspiciously small (${size} bytes) — likely placeholder. Replace with the final asset.`
  );
}

// ---------------------------------------------------------------------------
// 2.3.10: Android / Google Play 表記は useIsIOSApp で分岐済みか、表記が無いこと
// ---------------------------------------------------------------------------

const androidGuardedPages = [
  "app/page.tsx",
  "app/legal/page.tsx",
  "app/subscription/page.tsx",
  "app/support/page.tsx",
];

const androidMentionPattern = /(Android|Google Play|googleplay|Play ストア)/i;

androidGuardedPages.forEach((relativePath) => {
  const fullPath = join(root, relativePath);
  if (!existsSync(fullPath)) return;
  const source = read(relativePath);
  if (!androidMentionPattern.test(source)) {
    return;
  }
  expect(
    /useIsIOSApp|useIsIosApp/.test(source),
    `[Guideline 2.3.10] ${relativePath} mentions Android / Google Play but is not gated behind useIsIOSApp`
  );
});

// ---------------------------------------------------------------------------
// 4.8: ログイン画面に Sign in with Apple があること
// ---------------------------------------------------------------------------

const loginPage = read("app/auth/login/page.tsx");
expect(
  /Sign in with Apple|Appleでログイン|handleAppleLogin/.test(loginPage),
  "[Guideline 4.8] Login page must offer Sign in with Apple"
);
expect(
  /apple\.com|apple-sign-in/.test(loginPage),
  "[Guideline 4.8] Login page must wire Apple OAuth (Firebase apple.com provider or @capacitor-community/apple-sign-in)"
);

// ---------------------------------------------------------------------------
// 2.1(a): IAP / Checkout のエラーがユーザーに見える形で扱われていること
// ---------------------------------------------------------------------------

expect(
  /try\s*\{[\s\S]*createCheckoutSession[\s\S]*catch/.test(pricingPage) ||
    /createCheckoutSession[\s\S]*\.catch/.test(pricingPage),
  "[Guideline 2.1(a)] Pricing page must wrap createCheckoutSession in try/catch (so plan-tap errors are surfaced gracefully)"
);
expect(
  /toast|alert|setError|エラー/.test(pricingPage),
  "[Guideline 2.1(a)] Pricing page must surface plan-tap errors via UI (toast/alert/inline message)"
);

// ---------------------------------------------------------------------------
// 結果出力
// ---------------------------------------------------------------------------

if (failures.length > 0) {
  console.error("App Store safety check failed:");
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log("App Store safety check passed");
