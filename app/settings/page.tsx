"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, signOut } from "firebase/auth";
import Link from "next/link";
import { logger } from "@/lib/logger";

export default function SettingsPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    // Firebase認証状態を監視
    let unsubscribe: (() => void) | undefined;

    const initAuth = async () => {
      try {
        const { onAuthStateChanged } = await import("firebase/auth");
        const { initializeFirebase } = await import(
          "../../lib/firebase-client"
        );
        const { auth } = initializeFirebase();

        unsubscribe = onAuthStateChanged(auth, (currentUser) => {
          if (!currentUser) {
            router.push("/auth/login");
          } else {
            setUser(currentUser);
            // ローカルストレージから設定を読み込み
            const savedNotifications = localStorage.getItem("notifications");
            const savedDarkMode = localStorage.getItem("darkMode");
            if (savedNotifications !== null) {
              setNotifications(savedNotifications === "true");
            }
            if (savedDarkMode !== null) {
              setDarkMode(savedDarkMode === "true");
            }
          }
          setLoading(false);
        });
      } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error));
        logger.error("Firebase initialization error", err);
        setLoading(false);
      }
    };

    initAuth();

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [router]);

  const handleLogout = async () => {
    try {
      const { signOut } = await import("firebase/auth");
      const { initializeFirebase } = await import("../../lib/firebase-client");
      const { auth } = initializeFirebase();

      await signOut(auth);
      router.push("/");
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error("ログアウトエラー", err);
    }
  };

  const handleNotificationToggle = () => {
    const newValue = !notifications;
    setNotifications(newValue);
    localStorage.setItem("notifications", newValue.toString());
  };

  const handleDarkModeToggle = () => {
    const newValue = !darkMode;
    setDarkMode(newValue);
    localStorage.setItem("darkMode", newValue.toString());
    // ダークモードのクラスをbodyに適用
    if (newValue) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* シンプルなヘッダー */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-md mx-auto px-4 py-4">
          <div className="flex items-center space-x-3">
            <Link
              href="/dashboard"
              className="text-gray-600 hover:text-gray-900"
            >
              <i className="ri-arrow-left-line text-xl"></i>
            </Link>
            <h1 className="text-lg font-medium text-gray-900">設定</h1>
          </div>
        </div>
      </header>

      <main className="max-w-md mx-auto px-4 py-6 pb-24">
        {/* アカウント情報 */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
          <h2 className="text-lg font-medium text-gray-900 mb-3">
            アカウント情報
          </h2>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-gray-600 text-sm">メールアドレス</span>
              <span className="text-gray-900 text-sm">{user?.email}</span>
            </div>
          </div>
        </div>

        {/* アプリ設定 */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
          <h2 className="text-lg font-medium text-gray-900 mb-3">アプリ設定</h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-gray-900 font-medium">通知</p>
                <p className="text-sm text-gray-500">
                  学習リマインダーや重要なお知らせ
                </p>
              </div>
              <button
                onClick={handleNotificationToggle}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  notifications ? "bg-blue-600" : "bg-gray-200"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    notifications ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>
            <div className="flex justify-between items-center">
              <div>
                <p className="text-gray-900 font-medium">ダークモード</p>
                <p className="text-sm text-gray-500">
                  目に優しい暗い配色に切り替え
                </p>
              </div>
              <button
                onClick={handleDarkModeToggle}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  darkMode ? "bg-blue-600" : "bg-gray-200"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    darkMode ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* 法的情報 */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">法的情報</h2>
          <div className="space-y-3">
            <Link
              href="/settings/terms"
              className="flex justify-between items-center py-2 hover:bg-gray-50 rounded-lg px-2 transition-colors"
            >
              <span className="text-gray-700">利用規約</span>
              <svg
                className="w-5 h-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </Link>
            <Link
              href="/settings/privacy"
              className="flex justify-between items-center py-2 hover:bg-gray-50 rounded-lg px-2 transition-colors"
            >
              <span className="text-gray-700">プライバシーポリシー</span>
              <svg
                className="w-5 h-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </Link>
          </div>
        </div>

        {/* ログアウトボタン */}
        <div className="mt-6">
          <button
            onClick={handleLogout}
            className="w-full bg-red-600 text-white py-4 px-6 rounded-lg font-medium hover:bg-red-700 transition-colors"
          >
            ログアウト
          </button>
        </div>
      </main>

      {/* シンプルなボトムナビゲーション */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200">
        <div className="max-w-md mx-auto px-4">
          <div className="flex justify-around items-center h-16">
            <Link
              href="/dashboard"
              className="flex flex-col items-center space-y-1 text-gray-600 hover:text-gray-900"
            >
              <i className="ri-home-line text-xl"></i>
              <span className="text-xs">ホーム</span>
            </Link>
            <Link
              href="/practice"
              className="flex flex-col items-center space-y-1 text-gray-600 hover:text-gray-900"
            >
              <i className="ri-book-open-line text-xl"></i>
              <span className="text-xs">学習</span>
            </Link>
            <Link
              href="/stats"
              className="flex flex-col items-center space-y-1 text-gray-600 hover:text-gray-900"
            >
              <i className="ri-bar-chart-line text-xl"></i>
              <span className="text-xs">分析</span>
            </Link>
            <Link
              href="/profile"
              className="flex flex-col items-center space-y-1 text-blue-600"
            >
              <i className="ri-user-line text-xl"></i>
              <span className="text-xs">設定</span>
            </Link>
          </div>
        </div>
      </nav>
    </div>
  );
}
