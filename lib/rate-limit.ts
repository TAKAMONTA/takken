/**
 * 簡易レート制限（インメモリ）
 *
 * 単一インスタンス内でユーザー単位のリクエスト数を制限する。
 * Vercel/Node.jsサーバーレスでは warm instance 間のみ有効で、
 * コールドスタート跨ぎでは共有されないため「ソフト制限」として機能する。
 *
 * 分散環境での厳格な制限が必要な場合は @upstash/ratelimit + Redis への
 * 移行を推奨（TODO: production hardening）。
 */

type WindowState = {
  timestamps: number[];
};

const buckets = new Map<string, WindowState>();

// 定期的に古いエントリを掃除（メモリリーク防止）
const CLEANUP_INTERVAL_MS = 5 * 60 * 1000;
let lastCleanup = Date.now();

function maybeCleanup(now: number) {
  if (now - lastCleanup < CLEANUP_INTERVAL_MS) return;
  lastCleanup = now;
  // 10分以上古いバケットは削除
  const cutoff = now - 10 * 60 * 1000;
  for (const [key, state] of buckets) {
    const latest = state.timestamps[state.timestamps.length - 1] ?? 0;
    if (latest < cutoff) buckets.delete(key);
  }
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
  retryAfterSec: number;
}

export interface RateLimitConfig {
  /** 最大リクエスト数 */
  maxRequests: number;
  /** 時間窓（秒） */
  windowSeconds: number;
}

/**
 * ユーザー単位のスライディングウィンドウ制限。
 *
 * @param userId - 制限対象のユーザーID（または IP など）
 * @param scope  - エンドポイント識別子（例: "ai:chat"）
 * @param config - 上限設定
 */
export function checkRateLimit(
  userId: string,
  scope: string,
  config: RateLimitConfig
): RateLimitResult {
  const now = Date.now();
  maybeCleanup(now);

  const windowMs = config.windowSeconds * 1000;
  const windowStart = now - windowMs;
  const key = `${scope}:${userId}`;

  const state = buckets.get(key) ?? { timestamps: [] };
  // 古いタイムスタンプを除去
  state.timestamps = state.timestamps.filter((t) => t > windowStart);

  if (state.timestamps.length >= config.maxRequests) {
    const oldest = state.timestamps[0];
    const resetAt = oldest + windowMs;
    return {
      allowed: false,
      remaining: 0,
      resetAt,
      retryAfterSec: Math.max(1, Math.ceil((resetAt - now) / 1000)),
    };
  }

  state.timestamps.push(now);
  buckets.set(key, state);

  return {
    allowed: true,
    remaining: config.maxRequests - state.timestamps.length,
    resetAt: now + windowMs,
    retryAfterSec: 0,
  };
}

/** AI 系エンドポイントの既定設定（20 req/min per user） */
export const AI_RATE_LIMIT: RateLimitConfig = {
  maxRequests: 20,
  windowSeconds: 60,
};
