"use client";

import { useEffect } from "react";

const ADSENSE_CLIENT_ID = "ca-pub-6068024385307000";
const ADSENSE_SCRIPT_SRC = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT_ID}`;

export default function AdSenseScript() {
  useEffect(() => {
    let cancelled = false;

    const loadScript = async () => {
      try {
        const { Capacitor } = await import("@capacitor/core");
        if (Capacitor.getPlatform() === "ios") {
          return;
        }
      } catch {
        // Non-Capacitor web builds should still load the web ad script.
      }

      if (cancelled || typeof document === "undefined") {
        return;
      }

      const existingScript = document.querySelector(
        `script[data-takken-adsense="${ADSENSE_CLIENT_ID}"]`
      );
      if (existingScript) {
        return;
      }

      const script = document.createElement("script");
      script.async = true;
      script.src = ADSENSE_SCRIPT_SRC;
      script.crossOrigin = "anonymous";
      script.dataset.takkenAdsense = ADSENSE_CLIENT_ID;
      document.head.appendChild(script);
    };

    loadScript();

    return () => {
      cancelled = true;
    };
  }, []);

  return null;
}
