import { readFileSync } from "fs";
import { join } from "path";
import { PLAN_CONFIGS, SubscriptionPlan } from "../../lib/types/subscription";

const root = process.cwd();
const failures: string[] = [];

function expect(condition: boolean, message: string) {
  if (!condition) failures.push(message);
}

function read(relativePath: string): string {
  return readFileSync(join(root, relativePath), "utf8");
}

const pricingPage = read("app/subscription/pricing/page.tsx");
const subscriptionPage = read("app/subscription/page.tsx");
const legalPage = read("app/legal/page.tsx");
const storeKit = JSON.parse(read("ios/App/TakkenIAP.storekit"));

const freeCardDuplicatePattern =
  /AI予想問題（\{freeConfig\.features\.questionLimit[\s\S]*?AI予想問題（\{freeConfig\.features\.questionLimit/;
expect(
  !freeCardDuplicatePattern.test(pricingPage),
  "Free plan card should not list the same AI question limit twice"
);

expect(
  !pricingPage.includes("初回購入後7日以内であれば、返金に応じます"),
  "Pricing FAQ should not promise a direct 7-day refund for App Store purchases"
);

expect(
  !subscriptionPage.includes("優先サポート"),
  "Subscription page should not advertise priority support when the plan config disables it"
);

expect(
  !legalPage.includes("3ヶ月分お得"),
  "Legal pricing copy should not hard-code a discount that can drift from plan pricing"
);

const storeKitYearlyProduct = storeKit.subscriptionGroups
  ?.flatMap((group: { subscriptions?: Array<{ productID: string; displayPrice: string }> }) => group.subscriptions || [])
  .find((subscription: { productID: string }) => subscription.productID === "com.takamonta.takken.premium.yearly");
expect(!!storeKitYearlyProduct, "StoreKit yearly product price is missing");

if (storeKitYearlyProduct) {
  const storeKitYearlyPrice = Number(storeKitYearlyProduct.displayPrice);
  const appYearlyPrice = PLAN_CONFIGS[SubscriptionPlan.PREMIUM].yearlyPrice;
  expect(
    appYearlyPrice === storeKitYearlyPrice,
    `App yearly price (${appYearlyPrice}) must match StoreKit yearly price (${storeKitYearlyPrice})`
  );
}

if (failures.length > 0) {
  console.error("Subscription copy consistency check failed:");
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log("subscription copy consistency checks passed");
