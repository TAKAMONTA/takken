"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { UserProfile } from "@/lib/types";
import { Question } from "@/lib/types/quiz";
import { getQuestionsByCategory } from "@/lib/data/questions";
import { learningAnalytics } from "@/lib/analytics";
import KeyTermHighlight from "@/components/KeyTermHighlight";
import ArticleReference from "@/components/ArticleReference";
import HintSystem from "@/components/HintSystem";
import StudyTipDisplay from "@/components/StudyTipDisplay";
import ExplanationDisplay from "@/components/ExplanationDisplay";
import QuestionDisplay from "@/components/QuestionDisplay";
import { getStudyTipsByDomain } from "@/lib/data/study-strategy";
import AIHintChat from "@/components/AIHintChat";
import AnswerFeedback from "@/components/AnswerFeedback";
import { soundEffects } from "@/lib/sound-effects";
import AdSense from "@/components/AdSense";
import { logger } from "@/lib/logger";
import StudyInfoSection from "@/components/StudyInfoSection";
import LessonScreen from "@/components/LessonScreen";
import { getLessonForQuestion, getDefaultLesson } from "@/lib/data/lessons";
import { requireCachedUserForCurrentAuth, setCachedUser } from "@/lib/auth-cache";
import QuestionMetaBadges from "@/components/QuestionMetaBadges";

function QuizContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get("category");
  const subcategoryParam = searchParams.get("subcategory");
  const modeParam = searchParams.get("mode");
  const levelParam = searchParams.get("level"); // "beginner" | "intermediate"

  const isBeginnerMode = levelParam === "beginner";

  const [user, setUser] = useState<UserProfile | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [answers, setAnswers] = useState<boolean[]>([]);
  const [isComplete, setIsComplete] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [startTime, setStartTime] = useState<Date | null>(null);
  // アニメーション用の状態
  const [showFeedback, setShowFeedback] = useState<boolean | null>(null);
  const [currentStreak, setCurrentStreak] = useState(0);

  // 初級モード用：解説プレビュー表示状態
  const [showLesson, setShowLesson] = useState(isBeginnerMode);

  useEffect(() => {
    // 問題を動的に取得
    const loadQuestions = async () => {
      const cachedUser = await requireCachedUserForCurrentAuth<UserProfile>(() =>
        router.push("/auth/login")
      );
      if (!cachedUser) return;
      setUser(cachedUser);

      if (!categoryParam) return;

      try {
        const categoryQuestions = await getQuestionsByCategory(categoryParam);

        if (categoryQuestions.length === 0) {
          logger.warn("No questions available for category", {
            category: categoryParam,
          });
          router.push("/dashboard");
          return;
        }

        let selectedQuestions = [...categoryQuestions];

        // 初級モードは「基礎」難易度を優先、中級は全難易度
        if (isBeginnerMode) {
          const basicQuestions = selectedQuestions.filter(
            (q) => q.difficulty === "基礎"
          );
          // 基礎問題が十分あればそこから選ぶ
          if (basicQuestions.length >= 5) {
            selectedQuestions = basicQuestions;
          }
        }

        selectedQuestions = selectedQuestions
          .sort(() => Math.random() - 0.5)
          .slice(0, Math.min(10, selectedQuestions.length));

        setQuestions(selectedQuestions);

        // 初級は時間制限を緩くする（授業時間分加算）
        const timePerQuestion = isBeginnerMode ? 180 : 120; // 初級3分、中級2分
        setTimeLeft(selectedQuestions.length * timePerQuestion);
        setStartTime(new Date());

        // 初級モードの場合、最初の問題の前に解説を表示
        if (isBeginnerMode && selectedQuestions.length > 0) {
          setShowLesson(true);
        }
      } catch (error) {
        const err =
          error instanceof Error ? error : new Error(String(error));
        logger.error("Error loading questions", err, {
          category: categoryParam,
        });
        router.push("/dashboard");
      }
    };

    loadQuestions();
  }, [categoryParam, subcategoryParam, router, isBeginnerMode]);

  useEffect(() => {
    // レッスン表示中はタイマーを止める
    if (timeLeft > 0 && !isComplete && !showLesson) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [timeLeft, isComplete, showLesson]);

  const handleLessonComplete = () => {
    setShowLesson(false);
  };

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

    // 連続正解数を更新
    if (isCorrect) {
      const newStreak = currentStreak + 1;
      setCurrentStreak(newStreak);
      soundEffects.playCorrect(newStreak);
    } else {
      setCurrentStreak(0);
      soundEffects.playIncorrect();
    }

    // アニメーションを表示
    setShowFeedback(isCorrect);

    // アニメーション終了後に解説を表示
    setTimeout(() => {
      setShowExplanation(true);
      setShowFeedback(null);
    }, 1500);

    // 1問解答するごとに記録を保存
    saveProgressAfterAnswer(isCorrect);
  };

  const saveProgressAfterAnswer = (isCorrect: boolean) => {
    if (!user) return;

    const updatedUser = { ...user };

    // 学習履歴を更新（1問ずつ）
    if (!updatedUser.studyHistory) {
      updatedUser.studyHistory = [];
    }

    const today = new Date().toISOString().split("T")[0] || "";
    const todayRecord = updatedUser.studyHistory.find(
      (record: any) => record.date === today
    );

    if (todayRecord) {
      todayRecord.questionsAnswered += 1;
      todayRecord.correctAnswers += isCorrect ? 1 : 0;
      todayRecord.studyTimeMinutes += 1;
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

    // Analytics システムにも1問ずつ保存
    try {
      learningAnalytics.saveStudySession({
        userId: updatedUser.id,
        startTime: startTime || new Date(),
        endTime: new Date(),
        category: categoryParam || "unknown",
        mode: isBeginnerMode ? "beginner" : modeParam || "practice",
        questionsAnswered: 1,
        correctAnswers: isCorrect ? 1 : 0,
        timeSpent: 1,
        difficulty: questions[currentQuestionIndex]?.difficulty || "basic",
        xpEarned: isCorrect ? 10 : 0,
      });
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error("Analytics session save failed", err);
    }

    logger.debug("1問解答後の学習履歴を保存しました", {
      questionIndex: currentQuestionIndex + 1,
      isCorrect: isCorrect,
      totalQuestions: updatedUser.totalStats.totalQuestions,
      totalCorrect: updatedUser.totalStats.totalCorrect,
      currentStreak: updatedUser.streak.currentStreak,
    });
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      const nextIndex = currentQuestionIndex + 1;
      setCurrentQuestionIndex(nextIndex);
      setSelectedAnswer(null);
      setShowExplanation(false);

      // 初級モード：次の問題の前に解説を表示
      if (isBeginnerMode) {
        setShowLesson(true);
      }
    } else {
      setIsComplete(true);
      saveResults();
    }
  };

  const saveResults = () => {
    if (!user) return;

    const correctCount = answers.filter((answer) => answer).length;
    const studyTimeMinutes = startTime
      ? Math.round((new Date().getTime() - startTime.getTime()) / 1000 / 60)
      : 0;

    // ユーザーデータを更新
    const updatedUser = { ...user };

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

    // Analytics システムにも学習セッションを保存
    try {
      learningAnalytics.saveStudySession({
        userId: updatedUser.id,
        startTime: startTime || new Date(),
        endTime: new Date(),
        category: categoryParam || "unknown",
        mode: isBeginnerMode ? "beginner" : modeParam || "practice",
        questionsAnswered: questions.length,
        correctAnswers: correctCount,
        timeSpent: studyTimeMinutes,
        difficulty: questions[0]?.difficulty || "basic",
        xpEarned: correctCount * 10,
      });
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error("Analytics session save failed", err);
    }

    logger.debug("学習履歴を保存しました", {
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

  const currentQuestion = questions[currentQuestionIndex];

  if (!user || questions.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-2xl font-bold text-gray-600">Loading...</div>
      </div>
    );
  }

  // 初級モード：問題の前にミニ授業を10秒間プレビュー
  if (showLesson && isBeginnerMode && currentQuestion) {
    const structuredLesson =
      getLessonForQuestion(
        currentQuestion.category,
        currentQuestion.topic
      ) ?? getDefaultLesson(currentQuestion.category);
    return (
      <LessonScreen
        explanation={currentQuestion.explanation}
        lesson={structuredLesson}
        duration={10}
        onComplete={handleLessonComplete}
        questionNumber={currentQuestionIndex + 1}
        totalQuestions={questions.length}
      />
    );
  }

  if (isComplete) {
    const correctCount = answers.filter((answer) => answer).length;
    const score = Math.round((correctCount / questions.length) * 100);

    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-purple-50">
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-md mx-auto px-4 py-4">
            <h1 className="text-xl font-bold text-gray-800 text-center">
              結果発表
            </h1>
          </div>
        </div>

        <div className="max-w-md mx-auto px-4 py-8 space-y-6">
          <div className="bg-white rounded-xl p-6 shadow-sm text-center">
            <div className="text-4xl mb-4">
              {score >= 80 ? "🎉" : score >= 60 ? "😊" : "😅"}
            </div>

            {/* レベルバッジ */}
            {isBeginnerMode && (
              <span className="inline-block bg-emerald-100 text-emerald-700 text-xs font-bold px-3 py-1 rounded-full mb-3">
                🌱 初級モード
              </span>
            )}

            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              {correctCount}/{questions.length}問正解
            </h2>
            <div className="text-3xl font-bold text-purple-600 mb-2">
              {score}%
            </div>
            <p className="text-gray-600 mb-4">
              {score >= 80
                ? isBeginnerMode
                  ? "素晴らしい！中級に挑戦してみましょう！"
                  : "素晴らしい成績です！"
                : score >= 60
                ? "よく頑張りました！"
                : isBeginnerMode
                ? "授業の内容を思い出しながら復習しましょう！"
                : "もう少し復習が必要です"}
            </p>
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
                    <div className="text-sm text-gray-700">
                      問題{index + 1}
                    </div>
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
            {/* 初級で好成績なら中級への誘導 */}
            {isBeginnerMode && score >= 70 && (
              <Link
                href={`/practice/quiz?category=${categoryParam}&subcategory=${subcategoryParam}&level=intermediate`}
              >
                <button className="w-full bg-purple-600 text-white py-3 px-6 rounded-lg font-bold hover:bg-purple-700 transition-colors !rounded-button mb-2">
                  🔥 中級に挑戦する
                </button>
              </Link>
            )}
            <Link href="/practice">
              <button className="w-full bg-purple-600 text-white py-3 px-6 rounded-lg font-bold hover:bg-purple-700 transition-colors !rounded-button">
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

  if (!currentQuestion) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-2xl font-bold text-gray-600">Loading...</div>
      </div>
    );
  }

  // テーマカラー（初級=エメラルド、中級=パープル）
  const themeColor = isBeginnerMode ? "emerald" : "purple";
  const bgGradient = isBeginnerMode
    ? "from-emerald-50 to-blue-50"
    : "from-blue-50 to-purple-50";

  return (
    <div className={`min-h-screen bg-gradient-to-b ${bgGradient}`}>
      {/* ヘッダー */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-md mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/practice" className="text-purple-600">
              <div className="w-5 h-5 flex items-center justify-center">
                <i className="ri-arrow-left-line text-xl"></i>
              </div>
            </Link>
            <div className="text-center">
              <div className="flex items-center justify-center gap-2">
                {isBeginnerMode && (
                  <span className="bg-emerald-100 text-emerald-700 text-[10px] font-bold px-1.5 py-0.5 rounded">
                    初級
                  </span>
                )}
                <div className="text-sm text-gray-500">
                  {currentQuestionIndex + 1} / {questions.length}
                </div>
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
            className={`h-2 rounded-full transition-all duration-300 ${
              isBeginnerMode ? "bg-emerald-500" : "bg-purple-500"
            }`}
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
          <QuestionMetaBadges question={currentQuestion} className="mb-4" />

          {/* 問題文 */}
          <div className="mb-6">
            {currentQuestion.difficulty === "基礎" &&
            currentQuestion.keyTerms ? (
              <KeyTermHighlight
                text={currentQuestion.question}
                keyTerms={currentQuestion.keyTerms}
                className="question-text text-gray-800"
              />
            ) : (
              <QuestionDisplay question={currentQuestion.question} />
            )}
          </div>

          {/* 基礎レベル向け学習支援機能（中級モードのみ表示） */}
          {!isBeginnerMode &&
            currentQuestion.difficulty === "基礎" &&
            !showExplanation && (
              <div className="space-y-4 mb-6">
                {/* 関連条文 */}
                {currentQuestion.relatedArticles && (
                  <ArticleReference articles={currentQuestion.relatedArticles} />
                )}

                {/* ヒント機能 */}
                {currentQuestion.hints && (
                  <HintSystem
                    hints={currentQuestion.hints}
                    onHintUsed={(hintIndex) => {
                      logger.debug(`ヒント${hintIndex + 1}を使用しました`, {
                        hintIndex,
                        questionId: currentQuestion.id,
                      });
                    }}
                  />
                )}

                {/* 学習のコツ（問題個別 → 分野デフォルトにフォールバック） */}
                {(() => {
                  const domain = (
                    currentQuestion.category || ""
                  ).toLowerCase();
                  const tipsFromQuestion =
                    currentQuestion.studyTips &&
                    currentQuestion.studyTips.length > 0
                      ? currentQuestion.studyTips
                      : undefined;
                  const tipsFromDomain =
                    !tipsFromQuestion &&
                    (domain === "takkengyouhou" ||
                      domain === "hourei" ||
                      domain === "zeihou" ||
                      domain === "minpou")
                      ? getStudyTipsByDomain(
                          domain as
                            | "takkengyouhou"
                            | "hourei"
                            | "zeihou"
                            | "minpou"
                        )
                      : [];
                  const tipsToShow = tipsFromQuestion || tipsFromDomain;

                  return tipsToShow && tipsToShow.length > 0 ? (
                    <StudyTipDisplay studyTips={tipsToShow} />
                  ) : null;
                })()}

                {/* AIヒントチャット */}
                <AIHintChat
                  question={currentQuestion.question}
                  options={currentQuestion.options}
                  category={currentQuestion.category}
                  year={currentQuestion.year}
                  difficulty={currentQuestion.difficulty}
                  className="mt-4"
                />
              </div>
            )}

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
                    ? isBeginnerMode
                      ? "border-emerald-500 bg-emerald-50"
                      : "border-purple-500 bg-purple-50"
                    : "border-gray-200 hover:border-purple-300"
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
                        ? isBeginnerMode
                          ? "border-emerald-500 bg-emerald-500 text-white"
                          : "border-purple-500 bg-purple-500 text-white"
                        : "border-gray-300"
                    }`}
                  >
                    {index + 1}
                  </div>
                  <span className="text-sm text-gray-800 flex-1">
                    {option}
                  </span>
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
              relatedArticles={currentQuestion.relatedArticles}
              topic={currentQuestion.topic}
              source={currentQuestion.source}
              className="mb-6"
            />
          )}

          {/* 学習情報セクション - 問題解答後 */}
          {showExplanation && (
            <div className="mb-6">
              <StudyInfoSection user={user} />
            </div>
          )}

          {/* ボタン */}
          <div className="space-y-3">
            {!showExplanation ? (
              <button
                onClick={handleAnswerSubmit}
                disabled={selectedAnswer === null}
                className={`w-full text-white py-3 px-6 rounded-lg font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed !rounded-button ${
                  isBeginnerMode
                    ? "bg-emerald-600 hover:bg-emerald-700"
                    : "bg-purple-600 hover:bg-purple-700"
                }`}
              >
                回答する
              </button>
            ) : (
              <button
                onClick={handleNextQuestion}
                className={`w-full text-white py-3 px-6 rounded-lg font-bold transition-colors !rounded-button ${
                  isBeginnerMode
                    ? "bg-emerald-600 hover:bg-emerald-700"
                    : "bg-purple-600 hover:bg-purple-700"
                }`}
              >
                {currentQuestionIndex < questions.length - 1
                  ? isBeginnerMode
                    ? "次の授業へ"
                    : "次の問題へ"
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

      {/* 正解・不正解アニメーション */}
      <AnswerFeedback
        isCorrect={showFeedback}
        streak={currentStreak}
        isWeakPoint={false}
      />
    </div>
  );
}

export default function Quiz() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-b from-blue-50 to-purple-50 flex items-center justify-center">
          <div className="text-2xl font-bold text-gray-600">Loading...</div>
        </div>
      }
    >
      <QuizContent />
    </Suspense>
  );
}
