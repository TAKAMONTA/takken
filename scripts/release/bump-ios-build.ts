/**
 * iOS ビルド番号 (CURRENT_PROJECT_VERSION) を bump する。
 *
 * App Store 提出のたびに CURRENT_PROJECT_VERSION を上げないと
 * 「This build is already on the App Store」エラーで弾かれるため、
 * 提出フローに必ず差し込む。
 *
 * 使い方:
 *   ts-node scripts/release/bump-ios-build.ts                  # build を +1
 *   ts-node scripts/release/bump-ios-build.ts --dry-run        # 差分プレビューのみ
 *   ts-node scripts/release/bump-ios-build.ts --marketing patch # MARKETING_VERSION も patch bump (1.4 -> 1.4.1)
 *   ts-node scripts/release/bump-ios-build.ts --marketing minor # MARKETING_VERSION を minor bump (1.4 -> 1.5)
 *   ts-node scripts/release/bump-ios-build.ts --marketing major # MARKETING_VERSION を major bump (1.4 -> 2.0)
 *
 * 安全装置:
 *   - DEBUG / RELEASE 両 config の CURRENT_PROJECT_VERSION が一致しなければ fail
 *   - MARKETING_VERSION も同様に一致確認
 *   - 書き込み前に行末セミコロンを検証して破壊書き込みを防止
 */

import { readFileSync, writeFileSync } from "fs";
import { join } from "path";

const PBXPROJ = "ios/App/App.xcodeproj/project.pbxproj";

const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");
const marketingIndex = args.indexOf("--marketing");
const marketingMode: "patch" | "minor" | "major" | null = marketingIndex >= 0
  ? (args[marketingIndex + 1] as "patch" | "minor" | "major")
  : null;

if (marketingIndex >= 0 && !["patch", "minor", "major"].includes(args[marketingIndex + 1])) {
  console.error("--marketing は patch / minor / major のいずれかを指定してください");
  process.exit(2);
}

const path = join(process.cwd(), PBXPROJ);
const original = readFileSync(path, "utf8");

const buildRegex = /CURRENT_PROJECT_VERSION = (\d+);/g;
const buildMatches = Array.from(original.matchAll(buildRegex));
if (buildMatches.length === 0) {
  console.error(`${PBXPROJ} に CURRENT_PROJECT_VERSION が見つかりません`);
  process.exit(1);
}

const buildValues = new Set(buildMatches.map((m) => m[1]));
if (buildValues.size !== 1) {
  console.error(
    `CURRENT_PROJECT_VERSION が config 間で不一致です: ${Array.from(buildValues).join(", ")}`
  );
  process.exit(1);
}

const currentBuild = Number(buildMatches[0][1]);
const nextBuild = currentBuild + 1;

const marketingRegex = /MARKETING_VERSION = ([\d.]+);/g;
const marketingMatches = Array.from(original.matchAll(marketingRegex));
if (marketingMatches.length === 0) {
  console.error(`${PBXPROJ} に MARKETING_VERSION が見つかりません`);
  process.exit(1);
}

const marketingValues = new Set(marketingMatches.map((m) => m[1]));
if (marketingValues.size !== 1) {
  console.error(
    `MARKETING_VERSION が config 間で不一致です: ${Array.from(marketingValues).join(", ")}`
  );
  process.exit(1);
}

const currentMarketing = marketingMatches[0][1];
let nextMarketing = currentMarketing;

if (marketingMode) {
  const parts = currentMarketing.split(".").map((n) => Number(n));
  while (parts.length < 3) parts.push(0);
  if (marketingMode === "patch") {
    parts[2] += 1;
  } else if (marketingMode === "minor") {
    parts[1] += 1;
    parts[2] = 0;
  } else {
    parts[0] += 1;
    parts[1] = 0;
    parts[2] = 0;
  }
  nextMarketing = parts.join(".");
}

let updated = original.replace(
  buildRegex,
  `CURRENT_PROJECT_VERSION = ${nextBuild};`
);
if (marketingMode) {
  updated = updated.replace(
    marketingRegex,
    `MARKETING_VERSION = ${nextMarketing};`
  );
}

// 破壊書き込みガード: 行末セミコロンを必ず維持
if (!new RegExp(`CURRENT_PROJECT_VERSION = ${nextBuild};`).test(updated)) {
  console.error("書き換え後の検証に失敗しました（CURRENT_PROJECT_VERSION）。中断します。");
  process.exit(1);
}
if (marketingMode && !new RegExp(`MARKETING_VERSION = ${nextMarketing.replace(/\./g, "\\.")};`).test(updated)) {
  console.error("書き換え後の検証に失敗しました（MARKETING_VERSION）。中断します。");
  process.exit(1);
}

const summary = [
  `CURRENT_PROJECT_VERSION: ${currentBuild} -> ${nextBuild}`,
  marketingMode
    ? `MARKETING_VERSION:      ${currentMarketing} -> ${nextMarketing} (${marketingMode})`
    : `MARKETING_VERSION:      ${currentMarketing} (unchanged)`,
];

if (dryRun) {
  console.log("[dry-run]");
  summary.forEach((line) => console.log("  " + line));
  process.exit(0);
}

writeFileSync(path, updated, "utf8");
console.log("iOS build version bumped:");
summary.forEach((line) => console.log("  " + line));
console.log(`\n次のアクション:`);
console.log(`  1. git diff ${PBXPROJ} で内容確認`);
console.log(`  2. git add ${PBXPROJ} && git commit -m "chore(ios): bump build to ${nextBuild}"`);
console.log(`  3. npx cap sync ios && Xcode で Archive → Upload`);
