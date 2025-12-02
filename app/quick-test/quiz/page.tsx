"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { UserProfile } from "@/lib/types";
import { getQuickTestQuestions } from "@/lib/study-utils";
// 植物機能は削除
import { Question } from "@/lib/types/quiz";
import { learningAnalytics } from "@/lib/analytics";
import ExplanationDisplay from "@/components/ExplanationDisplay";
import QuestionDisplay from "@/components/QuestionDisplay";
import { logger } from "@/lib/logger";

function QuickTestQuizContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get("category") || "mixed";

  const [user, setUser] = useState<UserProfile | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [answers, setAnswers] = useState<boolean[]>([]);
  const [isComplete, setIsComplete] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [startTime, setStartTime] = useState<Date | null>(null);
  // 植物機能は削除

  useEffect(() => {
    const savedUser = localStorage.getItem("takken_user");
    if (savedUser) {
      const userData = JSON.parse(savedUser);
      setUser(userData);

      // 植物機能は削除
    } else {
      router.push("/");
      return;
    }

    // クイックテスト用の問題を取得
    const loadQuestions = async () => {
      try {
        const quickTestQuestions = await getQuickTestQuestions(5);

        if (quickTestQuestions.length === 0) {
          logger.warn(
            "No questions available for quick test category",
            { category: categoryParam }
          );
          router.push("/dashboard");
          return;
        }

        setQuestions(quickTestQuestions);
        setTimeLeft(quickTestQuestions.length * 60); // クイックテストは1問1分
        setStartTime(new Date());
      } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error));
        logger.error("Error loading quick test questions", err, { category: categoryParam });
        router.push("/dashboard");
      }
    };

    loadQuestions();
  }, [categoryParam, router]);

  useEffect(() => {
    if (timeLeft > 0 && !isComplete) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    }
    return undefined;
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
  };

  const saveProgressAfterAnswer = (_isCorrect: boolean) => {
    if (!user) return;

    const updatedUser = { ...user };
    setUser(updatedUser);
    localStorage.setItem("takken_user", JSON.stringify(updatedUser));
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
    const xpEarned = correctCount * 5; // クイックテスト用のボーナスXP
    const studyTimeMinutes = startTime
      ? Math.round((new Date().getTime() - startTime.getTime()) / 1000 / 60)
      : 0;

    const updatedUser = { ...user };

    // 植物機能は削除

    // 学習履歴を更新
    if (!updatedUser.studyHistory) {
      updatedUser.studyHistory = [];
    }

    const today = new Date().toISOString().split("T")[0] || "";
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

    setUser(updatedUser);
    localStorage.setItem("takken_user", JSON.stringify(updatedUser));

    // Analytics システムにも学習セッションを保存
    try {
      learningAnalytics.saveStudySession({
        userId: updatedUser.id,
        startTime: startTime || new Date(),
        endTime: new Date(),
        category: categoryParam || "mixed",
        mode: "quick-test",
        questionsAnswered: questions.length,
        correctAnswers: correctCount,
        timeSpent: studyTimeMinutes,
        difficulty: "mixed",
        xpEarned: xpEarned,
      });
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error("Analytics session save failed", err, { userId: user?.id });
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  if (!user || questions.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-blue-50 flex items-center justify-center">
        <div className="text-2xl font-bold text-gray-600">Loading...</div>
      </div>
    );
  }

  if (isComplete) {
    const correctCount = answers.filter((answer) => answer).length;
    const score = Math.round((correctCount / questions.length) * 100);
    const xpEarned = correctCount * 5;

    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-blue-50">
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-md mx-auto px-4 py-4">
            <h1 className="text-xl font-bold text-gray-800 text-center">
              クイックテスト結果
            </h1>
          </div>
        </div>

        <div className="max-w-md mx-auto px-4 py-8 space-y-6">
          <div className="bg-white rounded-xl p-6 shadow-sm text-center">
            <div className="text-4xl mb-4">
              {score >= 80 ? "🎉" : score >= 60 ? "😊" : "😅"}
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              {correctCount}/{questions.length}問正解
            </h2>
            <div className="text-3xl font-bold text-green-600 mb-2">
              {score}%
            </div>
            <p className="text-gray-600 mb-4">
              {score >= 80
                ? "素晴らしい成績です！"
                : score >= 60
                ? "よく頑張りました！"
                : "もう少し復習が必要です"}
            </p>
            <div className="bg-green-50 rounded-lg p-3">
              <div className="text-sm text-gray-700">獲得XP</div>
              <div className="text-xl font-bold text-green-600">
                +{xpEarned} XP
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h3 className="font-bold text-lg mb-4 text-gray-800">
              📊 詳細結果
            </h3>
            <div className="space-y-3">
              {questions.map((_, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between py-2 border-b border-gray-100"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-sm ${
                        answers[index] ? "bg-green-500" : "bg-red-500"
                      }`}
                    >
                      {index + 1}
                    </div>
                    <div className="text-sm text-gray-700">問題{index + 1}</div>
                  </div>
                  <div
                    className={`text-sm font-bold ${
                      answers[index] ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {answers[index] ? "正解" : "不正解"}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <Link href="/quick-test">
              <button className="w-full bg-green-600 text-white py-3 px-6 rounded-lg font-bold hover:bg-green-700 transition-colors !rounded-button">
                もう一度挑戦する
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

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-blue-50">
      {/* ヘッダー */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-md mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/quick-test" className="text-green-600">
              <div className="w-5 h-5 flex items-center justify-center">
                <i className="ri-arrow-left-line text-xl"></i>
              </div>
            </Link>
            <div className="text-center">
              <div className="text-sm text-gray-500">
                {currentQuestionIndex + 1} / {questions.length}
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
            className="bg-green-500 h-2 rounded-full transition-all duration-300"
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
          {/* 問題情報 */}
          <div className="flex items-center justify-between mb-4 text-xs">
            <span className="bg-green-100 text-green-700 px-2 py-1 rounded">
              クイックテスト
            </span>
            <span className="text-gray-500">
              {currentQuestion.year} {currentQuestion.difficulty}
            </span>
          </div>

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
                    ? "border-green-500 bg-green-50"
                    : "border-gray-200 hover:border-green-300"
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
                        ? "border-green-500 bg-green-500 text-white"
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
            <ExplanationDisplay
              explanation={currentQuestion.explanation}
              isCorrect={selectedAnswer === currentQuestion.correctAnswer}
              correctAnswer={currentQuestion.correctAnswer}
              options={currentQuestion.options}
              className="mb-6"
            />
          )}

          {/* ボタン */}
          <div className="space-y-3">
            {!showExplanation ? (
              <button
                onClick={handleAnswerSubmit}
                disabled={selectedAnswer === null}
                className="w-full bg-green-600 text-white py-3 px-6 rounded-lg font-bold hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed !rounded-button"
              >
                回答する
              </button>
            ) : (
              <button
                onClick={handleNextQuestion}
                className="w-full bg-green-600 text-white py-3 px-6 rounded-lg font-bold hover:bg-green-700 transition-colors !rounded-button"
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

export default function QuickTestQuiz() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-b from-green-50 to-blue-50 flex items-center justify-center">
          <div className="text-2xl font-bold text-gray-600">Loading...</div>
        </div>
      }
    >
      <QuickTestQuizContent />
    </Suspense>
  );
}
