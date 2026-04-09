/**
 * App Store 審査用に、Capacitor 内でも有効な公開サイトのベース URL を返す。
 * 本番 iOS ビルドでは NEXT_PUBLIC_APP_URL に本番ドメインを必ず設定すること。
 */
export function getAppPublicBaseUrl(): string {
  const fromEnv = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (fromEnv && /^https:\/\//i.test(fromEnv)) {
    return fromEnv.replace(/\/$/, "");
  }
  return "https://takken-study.com";
}
