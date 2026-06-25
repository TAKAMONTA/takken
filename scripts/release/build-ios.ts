/**
 * iOS / Capacitor 用の静的エクスポートビルド。
 *
 * 問題:
 *   `CAPACITOR_BUILD=true next build` は `output: "export"` を有効化するため、
 *   `app/api/*` の Route Handlers と `middleware.ts` が静的エクスポート不可で fail する。
 *
 * 解決:
 *   ビルド中だけ `app/api/` と `middleware.ts` を `.ios-build-backup/` に退避し、
 *   ビルド成功/失敗/中断のいずれでも必ず元に戻す。
 *
 * 安全装置:
 *   - 起動時に stale backup を検出: 中途半端な状態なら自動復旧 or 警告
 *   - try/finally でビルド失敗時も復元
 *   - SIGINT / SIGTERM をハンドルして Ctrl+C でも復元
 *   - 復元時に dest が既存なら overwrite せず警告（手動回復のチャンス）
 */

import { existsSync, mkdirSync, renameSync, rmSync } from "fs";
import { spawnSync } from "child_process";
import { dirname, join } from "path";

const ROOT = process.cwd();
const BACKUP_DIR = ".ios-build-backup";

interface Target {
  src: string;
  backup: string;
}

const TARGETS: Target[] = [
  { src: "app/api", backup: `${BACKUP_DIR}/app/api` },
];

function abs(rel: string): string {
  return join(ROOT, rel);
}

function ensureParent(p: string): void {
  const parent = dirname(p);
  if (!existsSync(parent)) {
    mkdirSync(parent, { recursive: true });
  }
}

function logStep(message: string): void {
  console.log(`[build-ios] ${message}`);
}

/**
 * 起動時の状態を確認し、必要なら自動復旧して進める。
 * 復旧不能な状態（src と backup が両方存在）なら exit 1。
 */
function preflightOrRecover(): void {
  for (const t of TARGETS) {
    const srcExists = existsSync(abs(t.src));
    const backupExists = existsSync(abs(t.backup));

    if (srcExists && backupExists) {
      console.error(
        `[build-ios] FATAL: ${t.src} と ${t.backup} が両方存在します。\n` +
          `前回のビルドが異常終了した可能性があります。\n` +
          `${t.backup} の中身を確認のうえ、不要なら手動で削除してください。`
      );
      process.exit(1);
    }

    if (!srcExists && backupExists) {
      logStep(`stale backup を復旧: ${t.backup} -> ${t.src}`);
      ensureParent(abs(t.src));
      renameSync(abs(t.backup), abs(t.src));
    }
  }

  // バックアップが空になったら除去
  if (existsSync(abs(BACKUP_DIR))) {
    rmSync(abs(BACKUP_DIR), { recursive: true, force: true });
  }
}

function backupAll(): void {
  for (const t of TARGETS) {
    if (!existsSync(abs(t.src))) continue;
    ensureParent(abs(t.backup));
    renameSync(abs(t.src), abs(t.backup));
    logStep(`退避: ${t.src} -> ${t.backup}`);
  }
}

function restoreAll(): void {
  for (const t of TARGETS) {
    if (!existsSync(abs(t.backup))) continue;
    if (existsSync(abs(t.src))) {
      console.error(
        `[build-ios] WARN: ${t.src} が既に存在するため ${t.backup} を上書きしません。手動確認が必要です。`
      );
      continue;
    }
    ensureParent(abs(t.src));
    renameSync(abs(t.backup), abs(t.src));
    logStep(`復元: ${t.backup} -> ${t.src}`);
  }

  if (existsSync(abs(BACKUP_DIR))) {
    rmSync(abs(BACKUP_DIR), { recursive: true, force: true });
  }
}

let restored = false;
function safeRestore(): void {
  if (restored) return;
  restored = true;
  try {
    restoreAll();
  } catch (err) {
    console.error(`[build-ios] 復元中にエラー:`, err);
    console.error(
      `[build-ios] ${BACKUP_DIR} の中身を手動で ${TARGETS.map((t) => t.src).join(", ")} に戻してください。`
    );
  }
}

process.on("SIGINT", () => {
  console.error("\n[build-ios] SIGINT 受信、復元してから終了");
  safeRestore();
  process.exit(130);
});
process.on("SIGTERM", () => {
  console.error("\n[build-ios] SIGTERM 受信、復元してから終了");
  safeRestore();
  process.exit(143);
});

function main(): void {
  preflightOrRecover();

  let exitCode = 0;

  try {
    backupAll();
    logStep("CAPACITOR_BUILD=true next build を実行");

    const next = spawnSync(
      process.platform === "win32" ? "next.cmd" : "next",
      ["build"],
      {
        stdio: "inherit",
        env: { ...process.env, CAPACITOR_BUILD: "true" },
        cwd: ROOT,
      }
    );

    exitCode = typeof next.status === "number" ? next.status : 1;
  } catch (err) {
    console.error("[build-ios] ビルド中にエラー:", err);
    exitCode = 1;
  } finally {
    safeRestore();
  }

  if (exitCode === 0) {
    logStep("iOS 用静的バンドル生成完了。次は `npx cap sync ios` を実行。");
  }

  process.exit(exitCode);
}

main();
