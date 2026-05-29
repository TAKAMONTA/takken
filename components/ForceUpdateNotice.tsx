"use client";

/**
 * 強制アップデート通知モーダル。
 *
 * - 起動時に `checkAppVersion()` を呼び、forceUpdate=true ならフルスクリーン表示
 * - ユーザー操作（クイズ・購入など）をブロック
 * - ストアリンクを表示（iOS なら App Store、web なら再読み込みリンク）
 * - 通常時は null を返して描画ゼロ
 */

import { useEffect, useState } from "react";

import { checkAppVersion, type VersionCheckResult } from "@/lib/version-check";

export default function ForceUpdateNotice() {
  const [result, setResult] = useState<VersionCheckResult | null>(null);

  useEffect(() => {
    let cancelled = false;
    void checkAppVersion().then((res) => {
      if (!cancelled) setResult(res);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  if (!result || !result.forceUpdate) return null;

  const isIOS = result.platform === "ios";

  const handleAction = () => {
    if (result.storeUrl) {
      window.open(result.storeUrl, "_blank", "noopener,noreferrer");
    } else {
      // web で storeUrl 未設定 → ハードリロードで最新バンドル取得
      window.location.reload();
    }
  };

  return (
    <div
      className="fixed inset-0 z-[9999] bg-black/70 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="force-update-title"
    >
      <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6 text-center">
        <div className="text-4xl mb-3" aria-hidden>
          🚀
        </div>
        <h2 id="force-update-title" className="text-lg font-bold text-gray-900 mb-2">
          アップデートが必要です
        </h2>
        <p className="text-sm text-gray-700 mb-4 leading-relaxed">
          {result.message ??
            "アプリの重要な更新があります。最新版にアップデートしてください。"}
        </p>
        {result.current && result.minimum && (
          <p className="text-xs text-gray-500 mb-4">
            お使いのバージョン: {result.current} / 必須: {result.minimum}
          </p>
        )}
        <button
          onClick={handleAction}
          className="block w-full px-4 py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition"
        >
          {isIOS ? "App Store で更新" : "最新版を取得"}
        </button>
      </div>
    </div>
  );
}
