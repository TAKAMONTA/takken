"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { UserProfile } from "@/lib/types";
import {
  frequencyData,
  FrequencyCategory,
} from "@/lib/data/frequency-questions";
import {
  getCategoryIcon,
  getCategoryColors,
} from "@/lib/utils/text-processing";
import FrequencyQuestionCard from "@/components/FrequencyQuestionCard";
import ErrorBoundary from "@/components/ErrorBoundary";

interface TabItem {
  id: string;
  name: string;
  icon: string;
  colors: {
    bg: string;
    text: string;
    border: string;
    accent: string;
  };
}

export default function FrequencyQuestions() {
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(frequencyData[0].id);

  // タブデータをメモ化
  const tabs = useMemo((): TabItem[] => {
    return frequencyData.map((category) => ({
      id: category.id,
      name: category.name,
      icon: getCategoryIcon(category.id),
      colors: getCategoryColors(category.id),
    }));
  }, []);

  // 現在のカテゴリをメモ化
  const currentCategory = useMemo((): FrequencyCategory | undefined => {
    return frequencyData.find((cat) => cat.id === activeTab);
  }, [activeTab]);

  // タブ変更ハンドラー
  const handleTabChange = useCallback((tabId: string) => {
    setActiveTab(tabId);
  }, []);

  // キーボードナビゲーション
  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent, tabId: string) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        handleTabChange(tabId);
      }
    },
    [handleTabChange]
  );

  useEffect(() => {
    // 認証チェック（テスト用に一時的に無効化）
    // const savedUser = localStorage.getItem('takken_rpg_user');
    // if (savedUser) {
    //   const userData = JSON.parse(savedUser);
    //   setUser(userData);
    // } else {
    //   router.push('/');
    //   return;
    // }

    // テスト用のダミーユーザー
    setUser({
      id: "test-user",
      name: "テストユーザー",
      email: "test@example.com",
      streak: {
        currentStreak: 0,
        longestStreak: 0,
        lastStudyDate: "",
        studyDates: [],
      },
      progress: {
        totalQuestions: 0,
        correctAnswers: 0,
        studyTimeMinutes: 0,
        categoryProgress: {},
      },
      badges: [],
      level: 1,
      xp: 0,
      joinedAt: new Date().toISOString(),
    });
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <div className="text-lg font-medium text-gray-600">読み込み中...</div>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-purple-50 pb-20">
        {/* ヘッダー */}
        <header className="bg-white shadow-sm border-b fixed top-0 w-full z-10">
          <div className="max-w-md mx-auto px-4 py-4 flex items-center">
            <Link
              href="/study-guide"
              className="text-purple-600 mr-4 hover:text-purple-700 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 rounded-md p-1"
              aria-label="学習ガイドに戻る"
            >
              <div className="w-5 h-5 flex items-center justify-center">
                <i
                  className="ri-arrow-left-line text-xl"
                  aria-hidden="true"
                ></i>
              </div>
            </Link>
            <h1 className="text-xl font-bold text-gray-800">
              出題頻度順重要問題
            </h1>
          </div>
        </header>

        {/* タブナビゲーション */}
        <nav
          className="bg-white border-b sticky top-16 z-10"
          role="tablist"
          aria-label="試験分野選択"
        >
          <div className="max-w-md mx-auto px-2 py-2">
            <div className="flex space-x-1 overflow-x-auto">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  onKeyDown={(e) => handleKeyDown(e, tab.id)}
                  className={`flex-shrink-0 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 ${
                    activeTab === tab.id
                      ? `${tab.colors.accent} ${tab.colors.text} shadow-sm`
                      : "text-gray-600 hover:text-purple-700 hover:bg-gray-50"
                  }`}
                  role="tab"
                  aria-selected={activeTab === tab.id}
                  aria-controls={`panel-${tab.id}`}
                  tabIndex={activeTab === tab.id ? 0 : -1}
                >
                  <span className="mr-1" aria-hidden="true">
                    {tab.icon}
                  </span>
                  {tab.name}
                </button>
              ))}
            </div>
          </div>
        </nav>

        {/* メインコンテンツ */}
        <main className="max-w-md mx-auto px-4 pt-4 pb-6 space-y-6">
          {currentCategory && (
            <div
              id={`panel-${currentCategory.id}`}
              role="tabpanel"
              aria-labelledby={`tab-${currentCategory.id}`}
            >
              {/* カテゴリ概要 */}
              <section className="bg-white rounded-xl p-6 shadow-sm mb-6 border-l-4 border-purple-400">
                <h2 className="text-lg font-bold text-gray-800 mb-2">
                  {currentCategory.name}
                </h2>
                <div className="grid grid-cols-2 gap-4 mb-3">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      {currentCategory.questionsCount}
                    </div>
                    <div className="text-xs text-gray-600">出題数</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-green-600">
                      {currentCategory.targetScore}
                    </div>
                    <div className="text-xs text-gray-600">目標点</div>
                  </div>
                </div>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {currentCategory.description}
                </p>
              </section>

              {/* トピック別問題 */}
              {currentCategory.topics.map((topic, topicIndex) => (
                <section
                  key={topicIndex}
                  className="bg-white rounded-xl p-6 shadow-sm mb-6"
                >
                  <header className="mb-4">
                    <h3 className="text-lg font-bold text-gray-800 mb-2">
                      {topic.topic}
                    </h3>
                    <div className="flex items-center text-sm">
                      <span className="mr-2" aria-hidden="true">
                        🔥
                      </span>
                      <span className="text-purple-600 font-medium">
                        {topic.frequency}
                      </span>
                    </div>
                  </header>

                  <div
                    className="space-y-4"
                    role="group"
                    aria-label={`${topic.topic}の問題一覧`}
                  >
                    {topic.questions.map((question, questionIndex) => (
                      <FrequencyQuestionCard
                        key={`${topicIndex}-${questionIndex}`}
                        question={question}
                        index={questionIndex}
                        categoryId={currentCategory.id}
                      />
                    ))}
                  </div>
                </section>
              ))}

              {/* 学習のヒント */}
              <section className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-6 border border-purple-200">
                <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center">
                  <span className="mr-2" aria-hidden="true">
                    💡
                  </span>
                  学習のポイント
                </h3>
                <ul className="text-sm text-gray-700 space-y-2">
                  <li className="flex items-start">
                    <span className="mr-2 text-purple-600" aria-hidden="true">
                      •
                    </span>
                    これらの問題は出題頻度が非常に高いため、確実に覚えましょう
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2 text-purple-600" aria-hidden="true">
                      •
                    </span>
                    空欄の前後の文脈も含めて理解することが重要です
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2 text-purple-600" aria-hidden="true">
                      •
                    </span>
                    繰り返し学習して長期記憶に定着させましょう
                  </li>
                </ul>
              </section>
            </div>
          )}
        </main>

        {/* ボトムナビゲーション */}
        <nav
          className="bg-white border-t fixed bottom-0 w-full"
          role="navigation"
          aria-label="メインナビゲーション"
        >
          <div className="max-w-md mx-auto px-0 py-2">
            <div className="grid grid-cols-4 gap-0">
              <Link
                href="/dashboard"
                className="flex flex-col items-center justify-center py-2 px-1 hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 rounded-md"
                aria-label="ダッシュボード"
              >
                <div className="w-5 h-5 flex items-center justify-center">
                  <i
                    className="ri-home-line text-gray-400 text-lg"
                    aria-hidden="true"
                  ></i>
                </div>
                <span className="text-xs text-gray-400 mt-1">ホーム</span>
              </Link>

              <Link
                href="/practice"
                className="flex flex-col items-center justify-center py-2 px-1 hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 rounded-md"
                aria-label="学習ページ"
              >
                <div className="w-5 h-5 flex items-center justify-center">
                  <i
                    className="ri-book-line text-gray-400 text-lg"
                    aria-hidden="true"
                  ></i>
                </div>
                <span className="text-xs text-gray-400 mt-1">学習</span>
              </Link>

              <Link
                href="/stats"
                className="flex flex-col items-center justify-center py-2 px-1 hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 rounded-md"
                aria-label="統計ページ"
              >
                <div className="w-5 h-5 flex items-center justify-center">
                  <i
                    className="ri-bar-chart-line text-gray-400 text-lg"
                    aria-hidden="true"
                  ></i>
                </div>
                <span className="text-xs text-gray-400 mt-1">統計</span>
              </Link>

              <Link
                href="/profile"
                className="flex flex-col items-center justify-center py-2 px-1 hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 rounded-md"
                aria-label="プロフィールページ"
              >
                <div className="w-5 h-5 flex items-center justify-center">
                  <i
                    className="ri-user-line text-gray-400 text-lg"
                    aria-hidden="true"
                  ></i>
                </div>
                <span className="text-xs text-gray-400 mt-1">プロフィール</span>
              </Link>
            </div>
          </div>
        </nav>
      </div>
    </ErrorBoundary>
  );
}
