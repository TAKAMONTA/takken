import { existsSync, readFileSync } from "fs";
import { join } from "path";

const root = process.cwd();
const failures: string[] = [];

function read(relativePath: string): string {
  return readFileSync(join(root, relativePath), "utf8");
}

function expect(condition: boolean, message: string) {
  if (!condition) failures.push(message);
}

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

if (failures.length > 0) {
  console.error("App Store safety check failed:");
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log("App Store safety check passed");
