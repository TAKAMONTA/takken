"use client";

import { useState, useEffect, Suspense, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { getMockExamQuestions } from "@/lib/data/mock-exam-questions";
import { logger } from "@/lib/logger";
import { requireCachedUserForCurrentAuth, setCachedUser } from "@/lib/auth-cache";
import { firestoreService } from "@/lib/firestore-service";
// 植物機能は削除

function MockExamQuizContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const mode = searchParams.get("mode") || "full_exam";

  const [user, setUser] = useState<any>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [answers, setAnswers] = useState<(number | null)[]>([]);
  const [isComplete, setIsComplete] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [totalTime, setTotalTime] = useState(0);
  const [showResults, setShowResults] = useState(false);
  // 植物機能は削除

  useEffect(() => {
    let cancelled = false;

    const initialize = async () => {
      const cachedUser = await requireCachedUserForCurrentAuth<any>(() =>
        router.push("/auth/login")
      );
      if (!cachedUser || cancelled) return;
      setUser(cachedUser);

      // モードに応じて問題を設定
      let timeLimit = 120; // 分

      switch (mode) {
        case "speed_exam":
          timeLimit = 90;
          break;
        case "review_exam":
          timeLimit = 0; // 無制限
          break;
        default: // full_exam
          timeLimit = 120;
          break;
      }

      // 現在の試験年度向けの予想問題データを取得
      const selectedQuestions = getMockExamQuestions(mode);
      setQuestions(selectedQuestions);
      setAnswers(new Array(selectedQuestions.length).fill(null));

      if (timeLimit > 0) {
        const totalSeconds = timeLimit * 60;
        setTimeLeft(totalSeconds);
        setTotalTime(totalSeconds);
      }

      setStartTime(new Date());
    };

    initialize();

    return () => {
      cancelled = true;
    };
  }, [mode, router]);

  const handleAnswerSelect = (questionIndex: number, answerIndex: number) => {
    const newAnswers = [...answers];
    newAnswers[questionIndex] = answerIndex;
    setAnswers(newAnswers);
    setSelectedAnswer(answerIndex);
  };

  const handleQuestionJump = (questionIndex: number) => {
    setCurrentQuestionIndex(questionIndex);
    setSelectedAnswer(answers[questionIndex] ?? null);
  };

  const handleSubmitExam = () => {
    if (
      window.confirm("模試を終了しますか？未回答の問題があっても提出されます。")
    ) {
      setIsComplete(true);
      setShowResults(true);

      // per-question 習熟度記録（弱点克服・間隔反復の土台）
      // 模試は最後に一括提出なので、回答済みの全問を並列で記録する。
      // fire-and-forget で UI を待たせない。
      if (user?.id) {
        const userId = user.id as string;
        const attempts = answers
          .map((selected, idx) => ({ selected, q: questions[idx] }))
          .filter((x) => x.selected !== null && x.q)
          .map((x) =>
            firestoreService
              .recordQuestionAnswer(userId, {
                questionId: Number(x.q.id),
                category: x.q.category,
                topic: x.q.topic,
                difficulty: x.q.difficulty,
                selectedAnswer: x.selected as number,
                correctAnswer: x.q.correctAnswer,
              })
              .catch((err) => {
                const e = err instanceof Error ? err : new Error(String(err));
                logger.error("Failed to record mock-exam mastery", e, {
                  questionId: x.q.id,
                });
              })
          );
        void Promise.allSettled(attempts);
      }

      saveResults();
    }
  };

  const saveResults = useCallback(() => {
    if (!user) return;

    const correctAnswers = answers.map(
      (answer, index) => answer === questions[index]?.correctAnswer
    );
    const correctCount = correctAnswers.filter((correct) => correct).length;
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

    if (todayRecord) {
      todayRecord.questionsAnswered += questions.length;
      todayRecord.correctAnswers += correctCount;
      todayRecord.studyTimeMinutes += studyTimeMinutes;
      todayRecord.sessions += 1;
    } else {
      updatedUser.studyHistory.push({
        date: today,
        questionsAnswered: questions.length,
        correctAnswers: correctCount,
        studyTimeMinutes: studyTimeMinutes,
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

    updatedUser.totalStats.totalQuestions += questions.length;
    updatedUser.totalStats.totalCorrect += correctCount;
    updatedUser.totalStats.totalStudyTime += studyTimeMinutes;
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

    logger.debug("模擬試験学習履歴を保存しました", {
      questionsAnswered: questions.length,
      correctAnswers: correctCount,
      studyTimeMinutes: studyTimeMinutes,
      currentStreak: updatedUser.streak.currentStreak,
    });
  }, [answers, questions, startTime, user]);

  const handleTimeUp = useCallback(() => {
    setIsComplete(true);
    setShowResults(true);
    saveResults();
  }, [saveResults]);

  useEffect(() => {
    if (timeLeft > 0 && !isComplete && totalTime > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && totalTime > 0 && !isComplete) {
      handleTimeUp();
    }
    return undefined;
  }, [timeLeft, isComplete, totalTime, handleTimeUp]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hours > 0) {
      return `${hours}:${mins.toString().padStart(2, "0")}:${secs
        .toString()
        .padStart(2, "0")}`;
    }
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const getTimeColor = () => {
    if (totalTime === 0) return "text-gray-600";
    const remaining = timeLeft / totalTime;
    if (remaining > 0.5) return "text-green-600";
    if (remaining > 0.2) return "text-orange-600";
    return "text-red-600";
  };

  const getAnsweredCount = () =>
    answers.filter((answer) => answer !== null).length;

  const getRank = (percentage: number) => {
    if (percentage >= 85) return { rank: "S", color: "bg-study-accent" };
    if (percentage >= 75) return { rank: "A", color: "bg-green-500" };
    if (percentage >= 65) return { rank: "B", color: "bg-blue-500" };
    if (percentage >= 50) return { rank: "C", color: "bg-orange-500" };
    return { rank: "D", color: "bg-red-500" };
  };

  if (!user || questions.length === 0) {
    return (
      <div className="study-shell flex items-center justify-center">
        <div className="text-2xl font-bold text-gray-600">Loading...</div>
      </div>
    );
  }

  if (showResults) {
    const correctAnswers = answers.map(
      (answer, index) => answer === questions[index]?.correctAnswer
    );
    const correctCount = correctAnswers.filter((correct) => correct).length;
    const score = Math.round((correctCount / questions.length) * 100);
    const xpEarned = correctCount * 15;
    const rankInfo = getRank(score);

    return (
      <div className="study-shell">
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-md mx-auto px-4 py-4">
            <h1 className="text-xl font-bold text-gray-800 text-center">
              模試結果
            </h1>
          </div>
        </div>

        <div className="max-w-md mx-auto px-4 py-8 space-y-6">
          {/* 総合結果 */}
          <div className="study-card p-6 text-center">
            <div
              className={`w-16 h-16 rounded-full ${rankInfo.color} text-white text-2xl font-bold flex items-center justify-center mx-auto mb-4`}
            >
              {rankInfo.rank}
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              {correctCount}/{questions.length}問正解
            </h2>
            <div className="mb-4 text-4xl font-bold text-study-accent">
              {score}%
            </div>
            {/* 本試験50問モードのみ、35点ボーダーで明示的な合否判定を出す */}
            {questions.length === 50 && (
              <div className={`inline-block px-4 py-2 rounded-lg mb-4 font-bold ${
                correctCount >= 35
                  ? "bg-green-100 text-green-800"
                  : "bg-orange-100 text-orange-800"
              }`}>
                {correctCount >= 35
                  ? `🎉 合格ライン到達（35点以上）`
                  : `あと${35 - correctCount}点で合格ライン（35点）`}
              </div>
            )}
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-lg bg-study-accent-soft p-3">
                <div className="text-sm text-gray-700">獲得XP</div>
                <div className="text-xl font-bold text-study-accent">
                  +{xpEarned}
                </div>
              </div>
              <div className="bg-blue-50 rounded-lg p-3">
                <div className="text-sm text-gray-700">判定</div>
                <div className="text-lg font-bold text-blue-600">
                  {score >= 70 ? "合格圏" : score >= 60 ? "もう少し" : "要復習"}
                </div>
              </div>
            </div>
          </div>

          {/* 分野別結果 */}
          <div className="study-card p-6">
            <h3 className="font-bold text-lg mb-4 text-gray-800">
              📊 分野別成績
            </h3>
            {[
              { display: "宅建業法", key: "takkengyouhou" },
              { display: "民法等", key: "minpou" },
              { display: "法令上の制限", key: "hourei" },
              { display: "税・その他", key: "zeihou" },
            ].map(({ display, key }) => {
              const categoryQuestions = questions.filter(
                (q) => q.category === key
              );
              const categoryCorrect = categoryQuestions.filter((q) => {
                const originalIndex = questions.findIndex(
                  (qq) => qq.id === q.id
                );
                return answers[originalIndex] === q.correctAnswer;
              }).length;
              const categoryScore =
                categoryQuestions.length > 0
                  ? Math.round(
                      (categoryCorrect / categoryQuestions.length) * 100
                    )
                  : 0;

              return (
                <div
                  key={key}
                  className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0"
                >
                  <div>
                    <div className="text-sm font-medium text-gray-800">
                      {display}
                    </div>
                    <div className="text-xs text-gray-500">
                      {categoryCorrect}/{categoryQuestions.length}問
                    </div>
                  </div>
                  <div className="text-right">
                    <div
                      className={`text-lg font-bold ${
                        categoryScore >= 80
                          ? "text-green-600"
                          : categoryScore >= 60
                          ? "text-blue-600"
                          : "text-red-600"
                      }`}
                    >
                      {categoryScore}%
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* 問題別詳細 */}
          <div className="study-card p-6">
            <h3 className="font-bold text-lg mb-4 text-gray-800">
              📝 問題別結果
            </h3>
            <div className="grid grid-cols-10 gap-1">
              {questions.map((question, index) => {
                const isCorrect = answers[index] === question.correctAnswer;
                const isAnswered = answers[index] !== null;
                return (
                  <div
                    key={index}
                    className={`w-8 h-8 rounded text-xs font-bold flex items-center justify-center text-white ${
                      !isAnswered
                        ? "bg-gray-400"
                        : isCorrect
                        ? "bg-green-500"
                        : "bg-red-500"
                    }`}
                  >
                    {index + 1}
                  </div>
                );
              })}
            </div>
            <div className="flex justify-center gap-4 mt-4 text-xs">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-green-500 rounded"></div>
                <span>正解</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-red-500 rounded"></div>
                <span>不正解</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-gray-400 rounded"></div>
                <span>未回答</span>
              </div>
            </div>
          </div>

          {/* 解説表示 */}
          <div className="study-card p-6">
            <h3 className="font-bold text-lg mb-4 text-gray-800">
              📚 解説・復習
            </h3>
            <div className="space-y-3">
              {questions.map((question, index) => {
                const isCorrect = answers[index] === question.correctAnswer;
                const isAnswered = answers[index] !== null;

                if (isCorrect) return null; // 正解した問題は表示しない

                return (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-sm ${
                            !isAnswered ? "bg-gray-500" : "bg-red-500"
                          }`}
                        >
                          {index + 1}
                        </div>
                        <span className="text-sm font-medium text-gray-800">
                          {question.category}
                        </span>
                      </div>
                      <span
                        className={`text-sm font-bold ${
                          !isAnswered ? "text-gray-600" : "text-red-600"
                        }`}
                      >
                        {!isAnswered ? "未回答" : "不正解"}
                      </span>
                    </div>

                    <div className="text-sm text-gray-700 mb-3 line-clamp-2">
                      {question.question}
                    </div>

                    <div className="rounded-lg border-l-4 border-study-accent bg-study-accent-soft p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs font-bold">
                            解
                          </span>
                        </div>
                        <span className="font-bold text-sm text-gray-800">
                          正解と解説
                        </span>
                      </div>

                      <div className="bg-white rounded p-3 mb-3 border border-green-200">
                        <div className="text-xs text-gray-600 mb-1">正解</div>
                        <div className="text-sm font-medium text-gray-800">
                          {question.correctAnswer + 1}.{" "}
                          {question.options[question.correctAnswer]}
                        </div>
                      </div>

                      <div className="text-sm text-gray-700 leading-relaxed">
                        {question.explanation}
                      </div>
                    </div>
                  </div>
                );
              })}

              {questions.every(
                (question, index) => answers[index] === question.correctAnswer
              ) && (
                <div className="text-center py-8">
                  <div className="text-4xl mb-2">🎉</div>
                  <div className="text-lg font-bold text-gray-800 mb-2">
                    完璧です！
                  </div>
                  <div className="text-sm text-gray-600">
                    全問正解のため、復習する問題はありません。
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-3">
            <Link href="/mock-exam">
              <button className="study-btn">
                もう一度挑戦する
              </button>
            </Link>
            <button
              onClick={() => {
                saveResults();
                router.push("/dashboard");
              }}
              className="study-btn"
            >
              学習記録を保存してトップページに戻る
            </button>
            <Link href="/dashboard">
              <button className="study-btn-secondary">
                ホームに戻る
              </button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <div className="study-shell">
      {/* ヘッダー */}
      <div className="fixed top-0 z-20 w-full border-b border-study-border bg-white/95 backdrop-blur-sm" style={{ paddingTop: "var(--safe-top)" }}>
        <div className="mx-auto max-w-md px-4 py-3">
          <div className="flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={() => {
                if (
                  window.confirm(
                    "模試を中断してホームに戻りますか？\n途中の回答は保存されません。"
                  )
                ) {
                  router.push("/dashboard");
                }
              }}
              className="tap-target inline-flex items-center gap-1 rounded-lg px-2 text-sm font-medium text-study-accent"
            >
              <span aria-hidden>←</span>
              <span>ホーム</span>
            </button>
            <div className="min-w-0 text-center">
              <div className="text-sm font-medium text-study-ink">
                問題 {currentQuestionIndex + 1}/{questions.length}
              </div>
              {totalTime > 0 && (
                <div className={`text-xs font-bold ${getTimeColor()}`}>
                  ⏰ {formatTime(timeLeft)}
                </div>
              )}
            </div>
            <div className="min-w-[4.5rem] text-right text-xs text-study-muted">
              回答済 {getAnsweredCount()}/{questions.length}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 pt-20 pb-24">
        {/* 問題表示 */}
        <div className="study-card p-6 mb-6">
          {/* 問題情報 */}
          <div className="flex items-center justify-between mb-4 text-xs">
            <span className="rounded bg-study-accent-soft px-2 py-1 text-study-accent">
              {currentQuestion.category}
            </span>
            <span className="text-gray-500">
              {currentQuestion.year} {currentQuestion.difficulty}
            </span>
          </div>

          {/* 問題文 */}
          <div className="mb-6">
            <h2 className="text-sm text-gray-800 leading-relaxed">
              {currentQuestion.question}
            </h2>
          </div>

          {/* 選択肢 */}
          <div className="space-y-3">
            {currentQuestion.options.map((option: string, index: number) => (
              <button
                key={index}
                onClick={() => handleAnswerSelect(currentQuestionIndex, index)}
                className={`study-option !rounded-button ${
                  selectedAnswer === index
                    ? "border-study-accent bg-study-accent-soft"
                    : answers[currentQuestionIndex] === index
                    ? "border-study-accent bg-study-accent-soft"
                    : "border-study-border hover:border-study-accent"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-sm font-bold ${
                      selectedAnswer === index
                        ? "border-study-accent bg-study-accent text-white"
                        : answers[currentQuestionIndex] === index
                        ? "border-study-accent bg-study-accent text-white"
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
        </div>

        {/* 問題一覧 */}
        <div className="study-card mb-6 p-4">
          <h3 className="font-bold text-sm mb-3 text-gray-800">問題一覧</h3>
          <div className="grid grid-cols-10 gap-1">
            {questions.map((_, index) => (
              <button
                key={index}
                onClick={() => handleQuestionJump(index)}
                className={`w-8 h-8 rounded text-xs font-bold transition-all !rounded-button ${
                  index === currentQuestionIndex
                    ? "bg-study-accent text-white"
                    : answers[index] !== null
                    ? "bg-study-beginner text-white"
                    : "bg-gray-200 text-gray-600 hover:bg-gray-300"
                }`}
              >
                {index + 1}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ボトム操作パネル */}
      <div className="fixed bottom-0 w-full border-t border-study-border bg-white/95 backdrop-blur-sm" style={{ paddingBottom: "var(--safe-bottom)" }}>
        <div className="max-w-md mx-auto px-4 py-3">
          <div className="flex gap-2">
            <button
              onClick={() =>
                setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1))
              }
              disabled={currentQuestionIndex === 0}
              className="study-btn-secondary flex-1 disabled:cursor-not-allowed disabled:opacity-50"
            >
              前の問題
            </button>

            {currentQuestionIndex === questions.length - 1 ? (
              <button
                onClick={handleSubmitExam}
                className="study-btn flex-1"
              >
                提出する
              </button>
            ) : (
              <button
                onClick={() =>
                  setCurrentQuestionIndex(
                    Math.min(questions.length - 1, currentQuestionIndex + 1)
                  )
                }
                className="study-btn flex-1"
              >
                次の問題
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function MockExamQuiz() {
  return (
    <Suspense
      fallback={
        <div className="study-shell flex items-center justify-center">
          <div className="text-2xl font-bold text-gray-600">Loading...</div>
        </div>
      }
    >
      <MockExamQuizContent />
    </Suspense>
  );
}
