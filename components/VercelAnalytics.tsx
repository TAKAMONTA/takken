"use client";

import { useEffect, useState } from "react";

/**
 * Vercel Analyticsコンポーネント
 * クライアントサイドでのみ読み込まれます
 */
export default function VercelAnalytics() {
  const [Analytics, setAnalytics] = useState<React.ComponentType | null>(null);

  useEffect(() => {
    // クライアントサイドでのみ動的にインポート
    import("@vercel/analytics/react")
      .then((mod) => {
        setAnalytics(() => mod.Analytics);
      })
      .catch((error) => {
        console.warn("[Analytics] 読み込みエラー:", error);
      });
  }, []);

  if (!Analytics) {
    return null;
  }

  return <Analytics />;
}
