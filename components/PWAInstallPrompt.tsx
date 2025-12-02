"use client";

import { useState, useEffect } from "react";
import { logger } from "@/lib/logger";

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // インストール済みかチェック
    const checkInstalled = () => {
      const isStandalone = window.matchMedia(
        "(display-mode: standalone)"
      ).matches;
      const isInApp = (window.navigator as any).standalone;
      setIsInstalled(isStandalone || isInApp);
    };

    checkInstalled();

    // beforeinstallpromptイベントのリスナー
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);

      // ユーザーがまだインストールしていない場合のみ表示
      if (!isInstalled) {
        setShowInstallPrompt(true);
      }
    };

    // appinstalledイベントのリスナー
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setShowInstallPrompt(false);
      setDeferredPrompt(null);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt
      );
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, [isInstalled]);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;

      if (outcome === "accepted") {
        logger.info("User accepted the install prompt", { outcome });
      } else {
        logger.debug("User dismissed the install prompt", { outcome });
      }

      setDeferredPrompt(null);
      setShowInstallPrompt(false);
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error("Error during installation", err);
    }
  };

  const handleDismiss = () => {
    setShowInstallPrompt(false);
    // 24時間後に再表示
    localStorage.setItem("pwa-install-dismissed", Date.now().toString());
  };

  // 24時間以内に非表示にした場合は表示しない
  useEffect(() => {
    const dismissed = localStorage.getItem("pwa-install-dismissed");
    if (dismissed) {
      const dismissedTime = parseInt(dismissed);
      const now = Date.now();
      const hoursPassed = (now - dismissedTime) / (1000 * 60 * 60);

      if (hoursPassed < 24) {
        setShowInstallPrompt(false);
      }
    }
  }, []);

  if (!showInstallPrompt || isInstalled) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-4 md:max-w-sm">
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-4">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
              <span className="text-purple-600 text-lg">📱</span>
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-medium text-gray-900">
              アプリをインストール
            </h3>
            <p className="text-xs text-gray-600 mt-1">
              ホーム画面に追加して、より快適に学習しましょう
            </p>

            <div className="mt-3 flex space-x-2">
              <button
                onClick={handleInstallClick}
                className="flex-1 bg-purple-600 text-white text-xs py-2 px-3 rounded-md font-medium hover:bg-purple-700 transition-colors"
              >
                インストール
              </button>
              <button
                onClick={handleDismiss}
                className="flex-1 bg-gray-100 text-gray-700 text-xs py-2 px-3 rounded-md font-medium hover:bg-gray-200 transition-colors"
              >
                後で
              </button>
            </div>
          </div>

          <button
            onClick={handleDismiss}
            className="flex-shrink-0 text-gray-400 hover:text-gray-600"
          >
            <span className="sr-only">閉じる</span>
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
