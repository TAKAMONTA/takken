"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import { requireCachedUserForCurrentAuth } from "@/lib/auth-cache";
import { firestoreService } from "@/lib/firestore-service";
import {
  CategoryAccuracy,
  summarizeByCategory,
} from "@/lib/question-mastery";
import { logger } from "@/lib/logger";

const CATEGORY_DISPLAY: Record<string, { name: string; icon: string }> = {
  takkengyouhou: { name: "宅建業法", icon: "🏠" },
  minpou: { name: "民法等", icon: "⚖️" },
  hourei: { name: "法令上の制限", icon: "📐" },
  zeihou: { name: "税・その他", icon: "💴" },
};

interface StudyMethod {
  id: string;
  title: string;
  icon: string;
  description: string;
  questionCount: number;
}

const STUDY_METHODS: StudyMethod[] = [
  {
    id: "intensive",
    title: "集中特訓 (10問)",
    icon: "💪",
    description: "弱点問題を10問、優先度の高い順に解く",
    questionCount: 10,
  },
  {
    id: "mixed",
    title: "ミックス学習 (8問)",
    icon: "🎯",
    description: "弱点を8問だけ、全カテゴリから万遍なく",
    questionCount: 8,
  },
  {
    id: "detailed",
    title: "解説重視 (6問)",
    icon: "📚",
    description: "弱点問題を6問じっくり、詳細解説で理解を深める",
    questionCount: 6,
  },
];

export default function WeakPoints() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [categorySummary, setCategorySummary] = useState<CategoryAccuracy[]>([]);
  const [totalWeak, setTotalWeak] = useState(0);
  const [selectedMethod, setSelectedMethod] = useState<string>("");

  useEffect(() => {
    let cancelled = false;

    const init = async () => {
      try {
        const cachedUser = await requireCachedUserForCurrentAuth<any>(() =>
          router.push("/auth/login"),
        );
        if (!cachedUser || cancelled) return;
        setUser(cachedUser);

        const stats = await firestoreService.getQuestionStats(cachedUser.id);
        if (cancelled) return;

        const summary = summarizeByCategory(stats);
        setCategorySummary(summary);
        setTotalWeak(summary.reduce((sum, s) => sum + s.weakCount, 0));
      } catch (err) {
        const e = err instanceof Error ? err : new Error(String(err));
        logger.error("Failed to load weak-point stats", e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    init();
    return () => {
      cancelled = true;
    };
  }, [router]);

  const handleStart = () => {
    if (!selectedMethod) return;
    router.push(`/weak-points/quiz?method=${selectedMethod}`);
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

  const isEmpty = totalWeak === 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-md mx-auto px-4 py-4">
          <div className="flex items-center space-x-3">
            <Link
              href="/dashboard"
              className="text-gray-600 hover:text-gray-900"
              aria-label="ダッシュボードに戻る"
            >
              <i className="ri-arrow-left-line text-xl"></i>
            </Link>
            <h1 className="text-lg font-medium text-gray-900">弱点克服</h1>
          </div>
        </div>
      </header>

      <main className="max-w-md mx-auto px-4 py-6 pb-24 space-y-6">
        {/* 弱点サマリ */}
        <section className="bg-white rounded-lg border border-gray-200 p-5">
          <div className="text-center mb-4">
            <div className="text-3xl mb-1">💪</div>
            <h2 className="text-lg font-medium text-gray-900">あなたの弱点</h2>
            <p className="text-3xl font-bold text-purple-600 mt-2">
              {totalWeak}問
            </p>
            <p className="text-sm text-gray-500 mt-1">
              {isEmpty ? "まだ弱点がありません" : "復習推奨の問題があります"}
            </p>
          </div>

          {!isEmpty && (
            <div className="grid grid-cols-2 gap-2">
              {categorySummary
                .filter((c) => c.weakCount > 0)
                .map((c) => {
                  const display =
                    CATEGORY_DISPLAY[c.category] || {
                      name: c.category,
                      icon: "📚",
                    };
                  return (
                    <div
                      key={c.category}
                      className="bg-gray-50 rounded-lg p-3 flex items-center gap-2"
                    >
                      <span className="text-xl">{display.icon}</span>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs text-gray-600 truncate">
                          {display.name}
                        </div>
                        <div className="text-sm font-bold text-gray-900">
                          {c.weakCount}問
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </section>

        {isEmpty ? (
          <section className="bg-white rounded-lg border border-gray-200 p-6 text-center">
            <p className="text-gray-700 mb-2 text-sm">
              まずは問題を解いてみましょう。
            </p>
            <p className="text-gray-500 text-xs mb-4">
              間違えた問題と正答率の低い問題が自動で弱点として記録されます。
            </p>
            <Link href="/practice">
              <button className="w-full bg-purple-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-purple-700 transition-colors">
                練習を始める
              </button>
            </Link>
          </section>
        ) : (
          <>
            <section className="space-y-2">
              <h3 className="text-base font-medium text-gray-900 px-1">
                学習方法を選択
              </h3>
              {STUDY_METHODS.map((method) => (
                <button
                  key={method.id}
                  onClick={() => setSelectedMethod(method.id)}
                  className={`w-full bg-white rounded-lg border p-4 hover:bg-gray-50 transition-colors text-left ${
                    selectedMethod === method.id
                      ? "border-purple-500 bg-purple-50"
                      : "border-gray-200"
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-xl">{method.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-900">
                        {method.title}
                      </div>
                      <div className="text-xs text-gray-500 mt-0.5">
                        {method.description}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </section>

            <button
              onClick={handleStart}
              disabled={!selectedMethod}
              className="w-full bg-purple-600 text-white py-4 px-6 rounded-lg font-bold hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {selectedMethod
                ? "弱点克服を開始する"
                : "学習方法を選択してください"}
            </button>
          </>
        )}
      </main>

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
