"use client";

import { useEffect } from "react";
import { logger } from "@/lib/logger";

interface AdSenseProps {
  adSlot: string;
  adFormat?: "auto" | "rectangle" | "vertical" | "horizontal";
  adStyle?: React.CSSProperties;
  className?: string;
}

export default function AdSense({
  adSlot,
  adFormat = "auto",
  adStyle = { display: "block" },
  className = "",
}: AdSenseProps) {
  useEffect(() => {
    // 広告の初期化
    try {
      ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push(
        {}
      );
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error("AdSense error", err, { adSlot });
    }
  }, []);

  return (
    <div className={`text-center ${className}`}>
      <ins
        className="adsbygoogle"
        style={adStyle}
        data-ad-client="ca-pub-6068024385307000"
        data-ad-slot={adSlot}
        data-ad-format={adFormat}
        data-full-width-responsive="true"
      />
    </div>
  );
}
