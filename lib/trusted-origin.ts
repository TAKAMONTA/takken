/**
 * リクエストの Origin ヘッダーを信頼できる範囲に絞るユーティリティ。
 *
 * 攻撃シナリオ: 攻撃者がユーザーの ID トークンを XSS などで取得後、
 * 自分のドメインから `POST /api/subscription/create-checkout-session` を呼ぶと、
 * Stripe Checkout の success_url / cancel_url が攻撃者ドメインになり、
 * `session_id` を攻撃者に渡せる（フィッシング経路）。
 *
 * 対策: NEXT_PUBLIC_APP_URL (および dev では localhost) のみを許可し、
 * それ以外の origin はフォールバック (NEXT_PUBLIC_APP_URL 既定値) に置換する。
 */

export interface TrustedOriginEnv {
  NEXT_PUBLIC_APP_URL?: string;
  NODE_ENV?: string;
}

const FALLBACK_PROD_URL = "https://takken-study.com";

/**
 * リクエストの origin が信頼できれば返し、そうでなければフォールバックに置換。
 *
 * - 本番 / 非本番共通: NEXT_PUBLIC_APP_URL と origin 一致なら通す
 * - 非本番のみ localhost / 127.0.0.1 (任意ポート) も許可
 * - パース失敗 / 空 / 不一致は全てフォールバック
 */
export function resolveTrustedOrigin(
  requestOrigin: string | null | undefined,
  env: TrustedOriginEnv = process.env,
): string {
  const trustedAppUrl = env.NEXT_PUBLIC_APP_URL || FALLBACK_PROD_URL;
  const isProd = env.NODE_ENV === "production";

  if (!requestOrigin) return trustedAppUrl;

  let parsed: URL;
  try {
    parsed = new URL(requestOrigin);
  } catch {
    return trustedAppUrl;
  }

  try {
    const trusted = new URL(trustedAppUrl);
    if (parsed.origin === trusted.origin) {
      return parsed.origin;
    }
  } catch {
    // NEXT_PUBLIC_APP_URL がパース不能 → フォールバック扱い
  }

  if (!isProd && (parsed.hostname === "localhost" || parsed.hostname === "127.0.0.1")) {
    return parsed.origin;
  }

  return trustedAppUrl;
}
