"use client";

import { useState, useEffect } from "react";

/**
 * iOSアプリ（Capacitor）内で実行されているかどうか。
 * App Store 審査 Guideline 2.3.10 対応: iOSビルドでは Android/Google Play 表記を出さないため。
 */
export function useIsIOSApp(): boolean {
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        if (typeof window === "undefined") return;
        const { Capacitor } = await import("@capacitor/core");
        if (!cancelled) setIsIOS(Capacitor.getPlatform() === "ios");
      } catch {
        if (!cancelled) setIsIOS(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return isIOS;
}
