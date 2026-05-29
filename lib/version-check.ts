/**
 * 強制アップデート機構 — current vs minimum バージョン比較とリモート config 取得。
 *
 * 背景:
 *   リリース済みアプリでクリティカルバグを発見しても、ユーザーが古いビルドを
 *   使い続けると修正が届かない。起動時に「最低サポートバージョン」をリモートから
 *   取得し、満たさなければストア誘導の force-update 画面を出す。
 *
 * 設計:
 *   - current version は build 時に `NEXT_PUBLIC_APP_VERSION` で焼き付ける
 *     （iOS は MARKETING_VERSION と一致させる、web はリリース毎に bump）
 *   - minimum version は `${NEXT_PUBLIC_APP_URL}/app-config.json` から fetch
 *     （静的ファイル、Vercel edge cache に乗る、無料・低レイテンシ）
 *   - 比較は semver-like の純粋関数で、テスト容易
 *   - fetch 失敗時は「強制更新は要求しない」が安全側のフォールバック
 *     （何かが壊れて全ユーザーをロックアウトする事故を防ぐ）
 */

export interface AppConfig {
  /** プラットフォーム別の最低サポートバージョン */
  minVersion?: {
    ios?: string;
    web?: string;
  };
  /** グローバルな強制更新フラグ（メンテナンス時など） */
  forceUpdate?: boolean;
  /** 案内文（任意） */
  message?: string;
  /** ストアリンクオーバーライド（任意） */
  storeUrl?: {
    ios?: string;
    web?: string;
  };
}

export type Platform = "ios" | "web";

/**
 * semver-like 文字列 "1.4.0" を [1, 4, 0] にパースする。
 * "1.4" は [1, 4, 0] として扱う。不正な入力は null。
 */
export function parseVersion(version: string): number[] | null {
  if (!version || typeof version !== "string") return null;
  const trimmed = version.trim();
  // prerelease タグ (1.4.0-beta) は無視して数値部分だけを見る
  const numericPart = trimmed.split(/[-+]/)[0];
  const parts = numericPart.split(".").map((p) => Number(p));
  if (parts.some((p) => !Number.isFinite(p) || p < 0)) return null;
  while (parts.length < 3) parts.push(0);
  return parts.slice(0, 3);
}

/**
 * 2 バージョンを比較。a < b なら -1、a == b なら 0、a > b なら 1。
 * 不正な入力（パース不能）は 0 を返す（=保守的に「強制更新不要」側）。
 */
export function compareVersions(a: string, b: string): -1 | 0 | 1 {
  const va = parseVersion(a);
  const vb = parseVersion(b);
  if (!va || !vb) return 0;
  for (let i = 0; i < 3; i++) {
    if (va[i] < vb[i]) return -1;
    if (va[i] > vb[i]) return 1;
  }
  return 0;
}

/**
 * current が minimum 未満なら強制更新必須。
 * minimum が空 / parse 不能なら false（保守的）。
 */
export function isForceUpdateRequired(
  current: string | undefined,
  minimum: string | undefined,
): boolean {
  if (!current || !minimum) return false;
  return compareVersions(current, minimum) < 0;
}

/**
 * Capacitor のプラットフォーム判定。SSR / Node では "web"。
 */
export async function detectPlatform(): Promise<Platform> {
  if (typeof window === "undefined") return "web";
  try {
    const { Capacitor } = await import("@capacitor/core");
    return Capacitor.getPlatform() === "ios" ? "ios" : "web";
  } catch {
    return "web";
  }
}

/**
 * 現在の build に焼き付けられたアプリバージョン。
 * NEXT_PUBLIC_APP_VERSION が未設定なら undefined（チェック skip 扱い）。
 */
export function getCurrentVersion(): string | undefined {
  return process.env.NEXT_PUBLIC_APP_VERSION || undefined;
}

const APP_CONFIG_PATH = "/app-config.json";

/**
 * remote の app-config.json を取得。
 * 失敗時は null（強制更新を要求しない安全側）。
 */
export async function fetchAppConfig(
  baseUrl: string = (typeof window !== "undefined" && window.location?.origin) || "",
  fetchFn: typeof fetch = fetch,
): Promise<AppConfig | null> {
  if (!baseUrl) return null;
  try {
    // バンドル経由ではなく remote の最新 config を見るため cache: no-store
    const res = await fetchFn(`${baseUrl}${APP_CONFIG_PATH}`, { cache: "no-store" });
    if (!res.ok) return null;
    const json = (await res.json()) as AppConfig;
    return json && typeof json === "object" ? json : null;
  } catch {
    return null;
  }
}

export interface VersionCheckResult {
  /** 強制更新必須か */
  forceUpdate: boolean;
  /** チェックに使った値（デバッグ用） */
  current?: string;
  minimum?: string;
  platform: Platform;
  /** 表示するメッセージ（config 由来 or デフォルト） */
  message?: string;
  /** ストア / 更新ページの URL */
  storeUrl?: string;
}

const DEFAULT_STORE_URL_IOS = "https://apps.apple.com/jp/app/id0000000000"; // 実 App ID に差し替え予定
const DEFAULT_MESSAGE =
  "アプリの重要な更新があります。最新版にアップデートしてください。";

/**
 * リモート config を取得し、現バージョンと比較した結果を返す。
 * config 取得失敗・current 未設定なら forceUpdate=false で返す（安全側）。
 */
export async function checkAppVersion(options?: {
  baseUrl?: string;
  fetchFn?: typeof fetch;
  /** テスト用にプラットフォーム固定 */
  platform?: Platform;
  /** テスト用に current を固定 */
  current?: string;
}): Promise<VersionCheckResult> {
  const platform = options?.platform ?? (await detectPlatform());
  const current = options?.current ?? getCurrentVersion();

  const config = await fetchAppConfig(options?.baseUrl, options?.fetchFn);

  if (!config) {
    return { forceUpdate: false, current, platform };
  }

  const minimum =
    platform === "ios" ? config.minVersion?.ios : config.minVersion?.web;

  // グローバル forceUpdate フラグが明示的に true ならバージョン比較なしで強制
  const versionMismatch = isForceUpdateRequired(current, minimum);
  const forceUpdate = Boolean(config.forceUpdate) || versionMismatch;

  const storeUrl =
    (platform === "ios" ? config.storeUrl?.ios : config.storeUrl?.web) ||
    (platform === "ios" ? DEFAULT_STORE_URL_IOS : undefined);

  return {
    forceUpdate,
    current,
    minimum,
    platform,
    message: config.message || (forceUpdate ? DEFAULT_MESSAGE : undefined),
    storeUrl,
  };
}
