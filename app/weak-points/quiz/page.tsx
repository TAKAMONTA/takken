"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
// 植物機能は削除
import ExplanationDisplay from "@/components/ExplanationDisplay";
import QuestionDisplay from "@/components/QuestionDisplay";
import StudyTipDisplay from "@/components/StudyTipDisplay";
import { getStudyTipsByDomain } from "@/lib/data/study-strategy";
import { logger } from "@/lib/logger";
import { requireCachedUserForCurrentAuth, setCachedUser } from "@/lib/auth-cache";
import QuestionMetaBadges from "@/components/QuestionMetaBadges";
import { shuffleQuestions, uniqueQuestionsByText } from "@/lib/question-dedupe";
import { firestoreService } from "@/lib/firestore-service";
import { selectWeakQuestionIds } from "@/lib/question-mastery";
import { getQuestionsByCategory } from "@/lib/data/questions";
import { Question } from "@/lib/types/quiz";

// 旧 hardcoded weaknessQuestions に存在した補助フィールドへのレガシー参照を型安全に
// 扱うためのアダプタ。実 Question データには weakness / studyTip は存在せず、
// UI 側は条件付きレンダーで自動的に非表示になる。
type LegacyQuestion = Question & {
  weakness?: string;
  studyTip?: string;
};

const STUDY_CATEGORIES = ["takkengyouhou", "minpou", "hourei", "zeihou"] as const;

// 学習方法ごとの問題数と時間制限（分）
const METHOD_CONFIG: Record<string, { count: number; minutes: number; detailed: boolean }> = {
  intensive: { count: 10, minutes: 30, detailed: false },
  mixed: { count: 8, minutes: 20, detailed: false },
  detailed: { count: 6, minutes: 40, detailed: true },
};

// 旧 hardcoded weaknessQuestions 定数は W1-4 で撤去。実データは
// firestoreService.getQuestionStats と selectWeakQuestionIds から動的に取得する
// （W1-1/W1-2 で構築した土台を使う）。

function WeakPointsQuizContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const topic = searchParams.get("topic");
  const method = searchParams.get("method");

  const [user, setUser] = useState<any>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [answers, setAnswers] = useState<boolean[]>([]);
  const [isComplete, setIsComplete] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [showDetailedExplanation, setShowDetailedExplanation] = useState(false);
  // "ready" まで Loading、"empty" は弱点なし状態
  const [loadingState, setLoadingState] = useState<"loading" | "ready" | "empty">("loading");

  useEffect(() => {
    let cancelled = false;

    const initialize = async () => {
      const cachedUser = await requireCachedUserForCurrentAuth<any>(() =>
        router.push("/auth/login")
      );
      if (!cachedUser || cancelled) return;
      setUser(cachedUser);

      // 学習方法（クエリパラメータ method）から設定を引く。fallback は intensive。
      const config = METHOD_CONFIG[method ?? ""] ?? METHOD_CONFIG.intensive;
      if (config.detailed) setShowDetailedExplanation(true);
      setTimeLeft(config.minutes * 60);

      try {
        // 1) ユーザーの全 mastery レコードを取得
        const stats = await firestoreService.getQuestionStats(cachedUser.id);
        if (cancelled) return;

        // 2) 弱点問題 ID を優先度順に選定
        const weakIds = selectWeakQuestionIds(stats, config.count);
        if (weakIds.length === 0) {
          if (!cancelled) setLoadingState("empty");
          return;
        }

        // 3) 全カテゴリの問題を並列ロードして ID で resolve
        const categoryResults = await Promise.all(
          STUDY_CATEGORIES.map((c) => getQuestionsByCategory(c)),
        );
        if (cancelled) return;
        const allQuestions = uniqueQuestionsByText(categoryResults.flat());

        const byId = new Map<number, Question>(
          allQuestions.map((q) => [Number(q.id), q]),
        );
        // selectWeakQuestionIds の順序を保持して resolve、見つからない ID はスキップ
        const resolved = weakIds
          .map((id) => byId.get(id))
          .filter((q): q is Question => Boolean(q));

        if (resolved.length === 0) {
          // 弱点はあるが対応する問題本体が見つからない（データ移行後など）
          logger.warn("Weak question IDs do not resolve to question bodies", {
            weakIds,
          });
          if (!cancelled) setLoadingState("empty");
          return;
        }

        // mixed モードはカテゴリの偏りを減らすためシャッフルし直す
        const finalQuestions =
          method === "mixed" ? shuffleQuestions(resolved) : resolved;

        setQuestions(finalQuestions);
        setStartTime(new Date());
        setLoadingState("ready");
      } catch (err) {
        const e = err instanceof Error ? err : new Error(String(err));
        logger.error("Failed to initialize weak-point quiz", e);
        if (!cancelled) setLoadingState("empty");
      }
    };

    initialize();

    return () => {
      cancelled = true;
    };
  }, [topic, method, router]);

  useEffect(() => {
    if (timeLeft > 0 && !isComplete) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [timeLeft, isComplete]);

  const handleAnswerSelect = (answerIndex: number) => {
    if (showExplanation) return;
    setSelectedAnswer(answerIndex);
  };

  const handleAnswerSubmit = () => {
    if (selectedAnswer === null) return;

    const currentQuestion = questions[currentQuestionIndex];
    if (!currentQuestion) return;

    const isCorrect = selectedAnswer === currentQuestion.correctAnswer;
    const newAnswers = [...answers, isCorrect];
    setAnswers(newAnswers);
    setShowExplanation(true);

    // 1問解答するごとに記録を保存
    saveProgressAfterAnswer(isCorrect);

    // per-question 習熟度記録（弱点克服モードでは特に重要 — 正解で nextReviewAt が後ろ倒し、
    // 不正解なら継続的に弱点として再出題される）
    if (user?.id) {
      void firestoreService
        .recordQuestionAnswer(user.id, {
          questionId: Number(currentQuestion.id),
          category: currentQuestion.category,
          topic: currentQuestion.topic,
          difficulty: currentQuestion.difficulty,
          selectedAnswer: selectedAnswer as number,
          correctAnswer: currentQuestion.correctAnswer,
        })
        .catch((err) => {
          const e = err instanceof Error ? err : new Error(String(err));
          logger.error("Failed to record weak-point mastery", e, {
            questionId: currentQuestion.id,
          });
        });
    }
  };

  const saveProgressAfterAnswer = (isCorrect: boolean) => {
    if (!user) return;

    const updatedUser = { ...user };

    // 植物機能は削除

    // 学習履歴を更新（1問ずつ）
    if (!updatedUser.studyHistory) {
      updatedUser.studyHistory = [];
    }

    const today = new Date().toISOString().split("T")[0];
    const todayRecord = updatedUser.studyHistory.find(
      (record: any) => record.date === today
    );

    if (todayRecord) {
      todayRecord.questionsAnswered += 1;
      todayRecord.correctAnswers += isCorrect ? 1 : 0;
      todayRecord.studyTimeMinutes += 1; // 1問あたり約1分として計算
    } else {
      updatedUser.studyHistory.push({
        date: today,
        questionsAnswered: 1,
        correctAnswers: isCorrect ? 1 : 0,
        studyTimeMinutes: 1,
        sessions: 1,
      });
    }

    // 総学習統計を更新
    if (!updatedUser.totalStats) {
      updatedUser.totalStats = {
        totalQuestions: 0,
        totalCorrect: 0,
        totalStudyTime: 0,
        totalSessions: 0,
      };
    }

    updatedUser.totalStats.totalQuestions += 1;
    updatedUser.totalStats.totalCorrect += isCorrect ? 1 : 0;
    updatedUser.totalStats.totalStudyTime += 1;

    // 連続学習日数を更新（初回のみ）
    if (!updatedUser.streak) {
      updatedUser.streak = {
        currentStreak: 0,
        longestStreak: 0,
        lastStudyDate: "",
        studyDates: [],
      };
    }

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split("T")[0];

    if (updatedUser.streak.lastStudyDate !== today) {
      if (updatedUser.streak.lastStudyDate === yesterdayStr) {
        updatedUser.streak.currentStreak += 1;
      } else if (updatedUser.streak.lastStudyDate === "") {
        updatedUser.streak.currentStreak = 1;
      } else {
        updatedUser.streak.currentStreak = 1;
      }

      updatedUser.streak.lastStudyDate = today;
      if (!updatedUser.streak.studyDates.includes(today)) {
        updatedUser.streak.studyDates.push(today);
      }

      if (updatedUser.streak.currentStreak > updatedUser.streak.longestStreak) {
        updatedUser.streak.longestStreak = updatedUser.streak.currentStreak;
      }
    }

    setUser(updatedUser);
    setCachedUser(updatedUser);
    // 植物状態の保存は不要

    logger.debug("弱点克服1問解答後の学習履歴を保存しました", {
      questionIndex: currentQuestionIndex + 1,
      isCorrect: isCorrect,
      totalQuestions: updatedUser.totalStats.totalQuestions,
      totalCorrect: updatedUser.totalStats.totalCorrect,
      currentStreak: updatedUser.streak.currentStreak,
    });
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer(null);
      setShowExplanation(false);
    } else {
      setIsComplete(true);
      saveResults();
    }
  };

  const saveResults = () => {
    if (!user) return;

    const correctCount = answers.filter((answer) => answer).length;
    const score = Math.round((correctCount / questions.length) * 100);
    const baseXP = correctCount * 12; // 弱点克服は通常より多めのXP
    const studyTimeMinutes = startTime
      ? Math.round((new Date().getTime() - startTime.getTime()) / 1000 / 60)
      : 0;

    // 植物機能は削除

    // ユーザーデータを更新
    const updatedUser = { ...user };

    // 学習履歴を更新
    if (!updatedUser.studyHistory) {
      updatedUser.studyHistory = [];
    }

    const today = new Date().toISOString().split("T")[0];
    const todayRecord = updatedUser.studyHistory.find(
      (record: any) => record.date === today
    );

    // 学習履歴は sessions のみ更新（questionsAnswered/correctAnswers/
    // studyTimeMinutes は saveProgressAfterAnswer が 1問ごと加算済み。
    // ここで再加算すると2倍カウントの double-counting バグになる）
    if (todayRecord) {
      todayRecord.sessions += 1;
    } else {
      updatedUser.studyHistory.push({
        date: today,
        questionsAnswered: 0,
        correctAnswers: 0,
        studyTimeMinutes: studyTimeMinutes,
        sessions: 1,
      });
    }

    // 総学習統計は totalSessions のみ更新（他フィールドは saveProgressAfterAnswer 側）
    if (!updatedUser.totalStats) {
      updatedUser.totalStats = {
        totalQuestions: 0,
        totalCorrect: 0,
        totalStudyTime: 0,
        totalSessions: 0,
      };
    }

    updatedUser.totalStats.totalSessions += 1;

    // 連続学習日数を更新
    if (!updatedUser.streak) {
      updatedUser.streak = {
        currentStreak: 0,
        longestStreak: 0,
        lastStudyDate: "",
        studyDates: [],
      };
    }

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split("T")[0];

    if (
      updatedUser.streak.lastStudyDate === yesterdayStr ||
      updatedUser.streak.lastStudyDate === today
    ) {
      if (updatedUser.streak.lastStudyDate !== today) {
        updatedUser.streak.currentStreak += 1;
      }
    } else {
      updatedUser.streak.currentStreak = 1;
    }

    updatedUser.streak.lastStudyDate = today;
    if (!updatedUser.streak.studyDates.includes(today)) {
      updatedUser.streak.studyDates.push(today);
    }

    if (updatedUser.streak.currentStreak > updatedUser.streak.longestStreak) {
      updatedUser.streak.longestStreak = updatedUser.streak.currentStreak;
    }

    setUser(updatedUser);
    setCachedUser(updatedUser);
    // 植物状態の保存は不要

    logger.debug("弱点克服学習履歴を保存しました", {
      questionsAnswered: questions.length,
      correctAnswers: correctCount,
      studyTimeMinutes: studyTimeMinutes,
      currentStreak: updatedUser.streak.currentStreak,
    });
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  if (!user || loadingState === "loading") {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-2xl font-bold text-gray-600">Loading...</div>
      </div>
    );
  }

  // 弱点がない（未学習 or 全て十分習熟）→ 空状態の案内
  if (loadingState === "empty") {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-purple-50 flex items-center justify-center px-4">
        <div className="max-w-sm bg-white rounded-xl shadow p-6 text-center">
          <div className="text-4xl mb-3">🎉</div>
          <h2 className="text-lg font-bold text-gray-900 mb-2">
            弱点がありません
          </h2>
          <p className="text-sm text-gray-600 mb-6">
            まずは問題を解いてみましょう。間違えた問題と正答率の低い問題が
            自動的に弱点として記録されます。
          </p>
          <div className="space-y-2">
            <Link href="/practice">
              <button className="w-full bg-purple-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-purple-700 transition-colors">
                練習を始める
              </button>
            </Link>
            <Link href="/dashboard">
              <button className="w-full bg-gray-200 text-gray-700 py-3 px-6 rounded-lg font-medium hover:bg-gray-300 transition-colors">
                ホームに戻る
              </button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-2xl font-bold text-gray-600">Loading...</div>
      </div>
    );
  }

  if (isComplete) {
    const correctCount = answers.filter((answer) => answer).length;
    const score = Math.round((correctCount / questions.length) * 100);
    const xpEarned = correctCount * 12;

    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-purple-50">
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-md mx-auto px-4 py-4">
            <h1 className="text-xl font-bold text-gray-800 text-center">
              弱点克服結果
            </h1>
          </div>
        </div>

        <div className="max-w-md mx-auto px-4 py-8 space-y-6">
          <div className="bg-gradient-to-r from-red-500 to-pink-500 rounded-xl p-6 shadow-sm text-center text-white">
            <div className="text-4xl mb-4">
              {score >= 80 ? "🎉" : score >= 60 ? "💪" : "🔥"}
            </div>
            <h2 className="text-2xl font-bold mb-2">弱点克服完了！</h2>
            <div className="text-3xl font-bold mb-2">
              {correctCount}/{questions.length}問正解
            </div>
            <p className="text-white/90 mb-4">
              {score >= 80
                ? "素晴らしい改善です！"
                : score >= 60
                ? "着実に克服できています！"
                : "もう少し練習が必要です"}
            </p>
            <div className="bg-white/20 rounded-lg p-3">
              <div className="text-sm">獲得XP（特別ボーナス）</div>
              <div className="text-xl font-bold">+{xpEarned} XP</div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h3 className="font-bold text-lg mb-4 text-gray-800">
              📊 詳細結果
            </h3>
            <div className="space-y-3">
              {(questions as LegacyQuestion[]).map((question, index) => (
                <div key={index} className="border rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-sm ${
                          answers[index] ? "bg-green-500" : "bg-red-500"
                        }`}
                      >
                        {index + 1}
                      </div>
                      <div className="text-sm font-medium text-gray-800">
                        {question.category}
                      </div>
                    </div>
                    <div
                      className={`text-sm font-bold ${
                        answers[index] ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {answers[index] ? "✓ 正解" : "✗ 不正解"}
                    </div>
                  </div>

                  {!answers[index] && question.weakness && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded p-2 mt-2">
                      <div className="text-xs font-bold text-yellow-800 mb-1">
                        弱点ポイント
                      </div>
                      <div className="text-xs text-yellow-700">
                        {question.weakness}
                      </div>
                      {question.studyTip && (
                        <>
                          <div className="text-xs font-bold text-yellow-800 mt-2 mb-1">
                            学習のコツ
                          </div>
                          <div className="text-xs text-yellow-700">
                            {question.studyTip}
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h3 className="font-bold text-lg mb-4 text-gray-800">
              🎯 次のステップ
            </h3>
            <div className="space-y-3">
              {score < 80 && (
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                  <div className="font-bold text-orange-800 mb-1">
                    📚 復習推奨
                  </div>
                  <div className="text-sm text-orange-700">
                    正答率が80%未満です。同じ分野をもう一度学習することをお勧めします。
                  </div>
                </div>
              )}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="font-bold text-blue-800 mb-1">
                  💡 学習アドバイス
                </div>
                <div className="text-sm text-blue-700">
                  間違えた問題の解説をしっかり読み、類似問題でパターンを覚えましょう。
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <Link href="/weak-points">
              <button className="w-full bg-gradient-to-r from-red-600 to-pink-600 text-white py-3 px-6 rounded-lg font-bold hover:bg-red-700 transition-colors !rounded-button">
                他の弱点も克服する
              </button>
            </Link>
            <Link href="/dashboard">
              <button className="w-full bg-gray-600 text-white py-3 px-6 rounded-lg font-bold hover:bg-gray-700 transition-colors !rounded-button">
                ホームに戻る
              </button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex] as LegacyQuestion;

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-purple-50">
      {/* ヘッダー */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-md mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/weak-points" className="text-purple-600">
              <div className="w-5 h-5 flex items-center justify-center">
                <i className="ri-arrow-left-line text-xl"></i>
              </div>
            </Link>
            <div className="text-center">
              <div className="text-sm text-gray-500">
                弱点克服 {currentQuestionIndex + 1} / {questions.length}
              </div>
              <div className="text-xs text-gray-500">
                残り時間: {formatTime(timeLeft)}
              </div>
            </div>
            <div className="w-5"></div>
          </div>
        </div>
      </div>

      {/* プログレスバー */}
      <div className="max-w-md mx-auto px-4 py-2">
        <div className="bg-gray-200 rounded-full h-2">
          <div
            className="bg-red-500 h-2 rounded-full transition-all duration-300"
            style={{
              width: `${
                ((currentQuestionIndex + 1) / questions.length) * 100
              }%`,
            }}
          ></div>
        </div>
      </div>

      {/* 問題表示 */}
      <div className="max-w-md mx-auto px-4 py-6">
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <QuestionMetaBadges
            question={{
              category: currentQuestion.category,
              topic: currentQuestion.weakness,
              source: "弱点克服",
            }}
            className="mb-4"
          />

          {/* 弱点ポイント表示 */}
          {currentQuestion.weakness && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
              <div className="text-xs font-bold text-yellow-800 mb-1">
                🎯 この問題の弱点ポイント
              </div>
              <div className="text-xs text-yellow-700">
                {currentQuestion.weakness}
              </div>
            </div>
          )}

          {/* 問題文 */}
          <div className="mb-6">
            <QuestionDisplay question={currentQuestion.question} />
          </div>

          {/* 選択肢 */}
          <div className="space-y-3 mb-6">
            {currentQuestion.options.map((option: string, index: number) => (
              <button
                key={index}
                onClick={() => handleAnswerSelect(index)}
                disabled={showExplanation}
                className={`w-full text-left p-4 rounded-lg border-2 transition-all !rounded-button ${
                  showExplanation
                    ? index === currentQuestion.correctAnswer
                      ? "border-green-500 bg-green-50"
                      : selectedAnswer === index
                      ? "border-red-500 bg-red-50"
                      : "border-gray-200"
                    : selectedAnswer === index
                    ? "border-red-500 bg-red-50"
                    : "border-gray-200 hover:border-red-300"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-sm font-bold ${
                      showExplanation
                        ? index === currentQuestion.correctAnswer
                          ? "border-green-500 bg-green-500 text-white"
                          : selectedAnswer === index
                          ? "border-red-500 bg-red-500 text-white"
                          : "border-gray-300"
                        : selectedAnswer === index
                        ? "border-red-500 bg-red-500 text-white"
                        : "border-gray-300"
                    }`}
                  >
                    {index + 1}
                  </div>
                  <span className="text-sm text-gray-800 flex-1">{option}</span>
                </div>
              </button>
            ))}
          </div>

          {/* 解説表示 */}
          {showExplanation && (
            <div className="bg-gradient-to-r from-red-50 to-pink-50 border-l-4 border-red-500 rounded-lg p-5 mb-6 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-bold">解</span>
                </div>
                <h3 className="font-bold text-lg text-gray-800">詳しい解説</h3>
              </div>

              {/* 正解・不正解の表示 */}
              <div
                className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-bold mb-4 ${
                  selectedAnswer === currentQuestion.correctAnswer
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                {selectedAnswer === currentQuestion.correctAnswer ? (
                  <>
                    <span className="text-green-600">✓</span>
                    正解です！弱点克服！
                  </>
                ) : (
                  <>
                    <span className="text-red-600">✗</span>
                    不正解です
                  </>
                )}
              </div>

              {/* 正解の選択肢を表示 */}
              <div className="bg-white rounded-lg p-3 mb-4 border border-green-200">
                <div className="text-sm text-gray-600 mb-1">正解</div>
                <div className="font-medium text-gray-800">
                  {currentQuestion.correctAnswer + 1}.{" "}
                  {currentQuestion.options[currentQuestion.correctAnswer]}
                </div>
              </div>

              {/* 解説本文 */}
              <div className="bg-white rounded-lg p-4 border border-gray-200 mb-4">
                <div className="text-base text-gray-800 leading-relaxed">
                  {currentQuestion.explanation}
                </div>
              </div>

              <div className="bg-white rounded-lg p-3 mb-4 border border-blue-100">
                <div className="text-xs font-bold text-gray-700 mb-2">
                  信頼性情報
                </div>
                <div className="space-y-1 text-xs text-gray-600">
                  <p>関連論点: {currentQuestion.weakness || currentQuestion.category}</p>
                  <p>出所: 弱点克服</p>
                  <p>法令・制度は改正される場合があります。重要な論点は最新の公的情報や教材でも確認してください。</p>
                </div>
              </div>

              {/* 弱点ポイントの詳細説明 */}
              {currentQuestion.weakness && (
                <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200 mb-4">
                  <div className="text-sm font-medium text-yellow-800 mb-2">
                    🎯 弱点ポイント
                  </div>
                  <div className="text-sm text-yellow-700 mb-3">
                    {currentQuestion.weakness}
                  </div>
                  {selectedAnswer !== currentQuestion.correctAnswer && (
                    <div className="bg-yellow-100 rounded p-2">
                      <div className="text-xs font-bold text-yellow-800 mb-1">
                        💡 克服のヒント
                      </div>
                      <div className="text-xs text-yellow-700">
                        この分野は多くの受験生が間違えやすいポイントです。解説をしっかり読んで理解を深めましょう。
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* 学習のコツ */}
              {currentQuestion.studyTip && (
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                  <div className="text-sm font-medium text-blue-800 mb-2">
                    📚 学習のコツ
                  </div>
                  <div className="text-sm text-blue-700">
                    {currentQuestion.studyTip}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ボタン */}
          <div className="space-y-3">
            {!showExplanation ? (
              <button
                onClick={handleAnswerSubmit}
                disabled={selectedAnswer === null}
                className="w-full bg-red-600 text-white py-3 px-6 rounded-lg font-bold hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed !rounded-button"
              >
                回答する
              </button>
            ) : (
              <button
                onClick={handleNextQuestion}
                className="w-full bg-red-600 text-white py-3 px-6 rounded-lg font-bold hover:bg-red-700 transition-colors !rounded-button"
              >
                {currentQuestionIndex < questions.length - 1
                  ? "次の問題へ"
                  : "結果を見る"}
              </button>
            )}
            {showExplanation && (
              <button
                onClick={() => {
                  saveResults();
                  router.push("/dashboard");
                }}
                className="w-full bg-gray-600 text-white py-3 px-6 rounded-lg font-bold hover:bg-gray-700 transition-colors !rounded-button"
              >
                学習記録を保存してトップページに戻る
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function WeakPointsQuiz() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-b from-blue-50 to-purple-50 flex items-center justify-center">
          <div className="text-2xl font-bold text-gray-600">Loading...</div>
        </div>
      }
    >
      <WeakPointsQuizContent />
    </Suspense>
  );
}
