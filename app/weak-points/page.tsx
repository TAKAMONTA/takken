"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { requireCachedUserForCurrentAuth } from "@/lib/auth-cache";

const weaknessData: any[] = [];

const studyMethods = [
  {
    id: "intensive",
    title: "集中特訓",
    icon: "💪",
    description: "この分野だけを徹底的に学習",
    duration: "30分",
    questions: 10,
    mode: "focused",
  },
  {
    id: "mixed",
    title: "ミックス学習",
    icon: "🎯",
    description: "弱点分野を他分野と混ぜて出題",
    duration: "20分",
    questions: 8,
    mode: "mixed",
  },
  {
    id: "explanation",
    title: "解説重視",
    icon: "📚",
    description: "詳細解説で理解を深める",
    duration: "40分",
    questions: 6,
    mode: "detailed",
  },
];

export default function WeakPoints() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedWeakness, setSelectedWeakness] = useState<any>(null);
  const [selectedMethod, setSelectedMethod] = useState<string>("");

  useEffect(() => {
    let cancelled = false;

    requireCachedUserForCurrentAuth<any>(() => router.push("/auth/login"))
      .then((cachedUser) => {
        if (!cancelled && cachedUser) {
          setUser(cachedUser);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [router]);

  const handleStartWeakPointStudy = () => {
    if (!selectedWeakness || !selectedMethod) {
      alert("弱点分野と学習方法を選択してください");
      return;
    }

    router.push(
      `/weak-points/quiz?topic=${selectedWeakness.id}&method=${selectedMethod}`
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-2xl font-bold text-gray-600">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">ログインが必要です</p>
          <Link href="/">
            <button className="bg-purple-600 text-white px-6 py-3 rounded-lg font-bold !rounded-button">
              ホームに戻る
            </button>
          </Link>
        </div>
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
            <h1 className="text-lg font-medium text-gray-900">弱点克服</h1>
          </div>
        </div>
      </header>

      <main className="max-w-md mx-auto px-4 py-6 pb-24">
        {/* シンプルな説明 */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
          <div className="text-center">
            <div className="text-2xl mb-2">💪</div>
            <h2 className="text-lg font-medium text-gray-900 mb-1">弱点克服</h2>
            <p className="text-gray-600 text-sm">
              苦手な問題を集中的に学習しましょう
            </p>
          </div>
        </div>

        {/* シンプルな学習開始 */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900">学習方法を選択</h3>
          <div className="space-y-2">
            {studyMethods.map((method) => (
              <button
                key={method.id}
                onClick={() => setSelectedMethod(method.id)}
                className={`w-full bg-white rounded-lg border border-gray-200 p-4 hover:bg-gray-50 transition-colors text-left ${
                  selectedMethod === method.id
                    ? "border-blue-500 bg-blue-50"
                    : ""
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="text-xl">{method.icon}</span>
                    <div>
                      <div className="font-medium text-gray-900">
                        {method.title}
                      </div>
                      <div className="text-sm text-gray-500">
                        {method.description}
                      </div>
                    </div>
                  </div>
                  <i className="ri-arrow-right-s-line text-gray-400"></i>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* 学習開始ボタン */}
        <div className="mt-6">
          <button
            onClick={handleStartWeakPointStudy}
            disabled={!selectedMethod}
            className="w-full bg-blue-600 text-white py-4 px-6 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {selectedMethod
              ? "弱点克服を開始する"
              : "学習方法を選択してください"}
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
              className="flex flex-col items-center space-y-1 text-gray-600 hover:text-gray-900"
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
