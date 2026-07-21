"use client";

/**
 * 弱点克服クイズ
 * 呼び出し: /weak-points → quiz?topic=&method=
 * 既存ハードコード問題を公開プールから動的読込に置換
 * 指示: Implement the plan as specified... Do NOT edit the plan file itself.
 */

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import ExplanationDisplay from "@/components/ExplanationDisplay";
import QuestionDisplay from "@/components/QuestionDisplay";
import StudyTipDisplay from "@/components/StudyTipDisplay";
import { getStudyTipsByDomain } from "@/lib/data/study-strategy";
import { getQuestionsByCategory } from "@/lib/data/questions";
import { Question } from "@/lib/types/quiz";
import { learningAnalytics } from "@/lib/analytics";
import { getCategoryDisplayName } from "@/lib/weakness-helper";
import { logger } from "@/lib/logger";

const CATEGORY_IDS = ["takkengyouhou", "minpou", "hourei", "zeihou"] as const;

async function loadWeaknessQuestions(
  topic: string,
  method: string | null
): Promise<Question[]> {
  const count =
    method === "mixed" ? 8 : method === "explanation" ? 6 : 10;

  if (method === "mixed") {
    const pools = await Promise.all(
      CATEGORY_IDS.map((c) => getQuestionsByCategory(c))
    );
    const idx = CATEGORY_IDS.indexOf(topic as (typeof CATEGORY_IDS)[number]);
    const primary = idx >= 0 ? pools[idx] : [];
    const others = pools.flat().filter((q) => q.category !== topic);
    const primaryPick = [...primary]
      .sort(() => Math.random() - 0.5)
      .slice(0, Math.ceil(count * 0.6));
    const otherPick = [...others]
      .sort(() => Math.random() - 0.5)
      .slice(0, count - primaryPick.length);
    return [...primaryPick, ...otherPick].sort(() => Math.random() - 0.5);
  }

  const categoryQuestions = await getQuestionsByCategory(topic);
  return [...categoryQuestions].sort(() => Math.random() - 0.5).slice(0, count);
}

function WeakPointsQuizContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const topic = searchParams.get("topic") || "takkengyouhou";
  const method = searchParams.get("method");

  const [user, setUser] = useState<any>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loadingQuestions, setLoadingQuestions] = useState(true);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [answers, setAnswers] = useState<boolean[]>([]);
  const [isComplete, setIsComplete] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [startTime, setStartTime] = useState<Date | null>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem("takken_user");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    } else {
      router.push("/");
      return;
    }

    let cancelled = false;
    (async () => {
      setLoadingQuestions(true);
      try {
        const selected = await loadWeaknessQuestions(topic, method);
        if (cancelled) return;
        setQuestions(selected);
        setStartTime(new Date());
        if (method === "mixed") setTimeLeft(20 * 60);
        else if (method === "explanation") setTimeLeft(40 * 60);
        else setTimeLeft(30 * 60);
      } catch (err) {
        logger.error(
          "弱点問題の読み込みに失敗",
          err instanceof Error ? err : new Error(String(err))
        );
      } finally {
        if (!cancelled) setLoadingQuestions(false);
      }
    })();

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

  const saveProgressAfterAnswer = (isCorrect: boolean) => {
    if (!user) return;
    const updatedUser = { ...user };
    if (!updatedUser.studyHistory) updatedUser.studyHistory = [];
    const today = new Date().toISOString().split("T")[0];
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
    setUser(updatedUser);
    localStorage.setItem("takken_user", JSON.stringify(updatedUser));

    try {
      learningAnalytics.saveStudySession({
        userId: updatedUser.id,
        startTime: startTime || new Date(),
        endTime: new Date(),
        category: topic,
        mode: "weak-points",
        questionsAnswered: 1,
        correctAnswers: isCorrect ? 1 : 0,
        timeSpent: 1,
        difficulty: questions[currentQuestionIndex]?.difficulty || "basic",
        xpEarned: isCorrect ? 10 : 0,
      });
    } catch (error) {
      logger.error(
        "Analytics session save failed",
        error instanceof Error ? error : new Error(String(error))
      );
    }
  };

  const handleAnswerSelect = (answerIndex: number) => {
    if (showExplanation) return;
    setSelectedAnswer(answerIndex);
  };

  const handleAnswerSubmit = () => {
    if (selectedAnswer === null || !questions[currentQuestionIndex]) return;
    const isCorrect =
      selectedAnswer === questions[currentQuestionIndex].correctAnswer;
    setAnswers([...answers, isCorrect]);
    setShowExplanation(true);
    saveProgressAfterAnswer(isCorrect);
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer(null);
      setShowExplanation(false);
    } else {
      setIsComplete(true);
      if (user && startTime) {
        const correctCount = answers.filter(Boolean).length + (selectedAnswer === questions[currentQuestionIndex]?.correctAnswer ? 0 : 0);
        // answers already includes current via submit; use answers length
        try {
          learningAnalytics.saveStudySession({
            userId: user.id,
            startTime,
            endTime: new Date(),
            category: topic,
            mode: "weak-points",
            questionsAnswered: questions.length,
            correctAnswers: answers.filter(Boolean).length,
            timeSpent: Math.max(
              1,
              Math.round((Date.now() - startTime.getTime()) / 60000)
            ),
            difficulty: "basic",
            xpEarned: answers.filter(Boolean).length * 10,
          });
        } catch {
          /* ignore */
        }
      }
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  if (loadingQuestions) {
    return (
      <div className="study-shell flex items-center justify-center">
        <div className="text-gray-600">問題を準備中...</div>
      </div>
    );
  }

  if (!user || questions.length === 0) {
    return (
      <div className="study-shell flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-gray-600 mb-4">問題を読み込めませんでした</p>
          <Link href="/weak-points" className="text-study-accent underline">
            弱点克服に戻る
          </Link>
        </div>
      </div>
    );
  }

  if (isComplete) {
    const correctCount = answers.filter(Boolean).length;
    const rate = Math.round((correctCount / questions.length) * 100);
    return (
      <div className="study-shell">
        <div className="mx-auto max-w-md px-4 py-12 text-center">
          <div className="mb-4 text-4xl">🎉</div>
          <h2 className="mb-2 text-2xl font-bold text-study-ink">完了！</h2>
          <p className="mb-1 text-study-muted">
            {getCategoryDisplayName(topic)}
          </p>
          <p className="mb-6 text-3xl font-bold text-study-accent">
            {correctCount} / {questions.length}（{rate}%）
          </p>
          <div className="space-y-3">
            <Link href={`/weak-points/quiz?topic=${topic}&method=${method || "intensive"}`}>
              <button className="study-btn">もう1セット</button>
            </Link>
            <Link href="/mock-exam">
              <button className="study-btn-secondary">模試に挑戦</button>
            </Link>
            <Link href="/dashboard">
              <button className="w-full py-2 text-study-muted">
                ダッシュボードへ
              </button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const domainTips =
    topic === "takkengyouhou" ||
    topic === "minpou" ||
    topic === "hourei" ||
    topic === "zeihou"
      ? getStudyTipsByDomain(topic)
      : [];

  return (
    <div className="study-shell">
      <header className="sticky top-0 z-20 border-b border-study-border bg-white/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-md items-center justify-between gap-2 px-4 py-3">
          <Link
            href="/dashboard"
            className="tap-target inline-flex items-center gap-1 rounded-lg px-2 text-sm font-medium text-study-accent"
          >
            <span aria-hidden>←</span>
            <span>ホーム</span>
          </Link>
          <div className="min-w-0 flex-1 text-center">
            <div className="truncate text-sm font-medium text-study-ink">
              {getCategoryDisplayName(topic)} {currentQuestionIndex + 1}/
              {questions.length}
            </div>
            <div className="text-xs text-study-muted">{formatTime(timeLeft)}</div>
          </div>
          <Link
            href="/weak-points"
            className="tap-target inline-flex items-center justify-center rounded-lg px-2 text-xs font-medium text-study-muted"
          >
            戻る
          </Link>
        </div>
        <div className="h-1.5 bg-study-border">
          <div
            className="h-1.5 bg-study-accent transition-all"
            style={{
              width: `${((currentQuestionIndex + 1) / questions.length) * 100}%`,
            }}
          />
        </div>
      </header>

      <main className="mx-auto max-w-md px-4 py-6 pb-safe-nav">
        <div className="mb-2 text-sm text-study-muted">
          問題 {currentQuestionIndex + 1} / {questions.length}
        </div>
        <QuestionDisplay question={currentQuestion.question} />

        {domainTips.length > 0 && !showExplanation && (
          <div className="mt-4">
            <StudyTipDisplay studyTips={domainTips.slice(0, 1)} />
          </div>
        )}

        <div className="mt-6 space-y-3">
          {currentQuestion.options.map((option, index) => (
            <button
              key={index}
              type="button"
              onClick={() => handleAnswerSelect(index)}
              disabled={showExplanation}
              className={`study-option ${
                showExplanation
                  ? index === currentQuestion.correctAnswer
                    ? "border-green-500 bg-green-50"
                    : selectedAnswer === index
                    ? "border-red-500 bg-red-50"
                    : ""
                  : selectedAnswer === index
                  ? "study-option-selected"
                  : ""
              }`}
            >
              <span className="mr-2 font-bold text-study-accent">{index + 1}.</span>
              <span className="text-[15px] leading-relaxed text-study-ink">{option}</span>
            </button>
          ))}
        </div>

        {showExplanation && (
          <div className="mt-6">
            <ExplanationDisplay
              explanation={currentQuestion.explanation}
              isCorrect={
                selectedAnswer === currentQuestion.correctAnswer
              }
              correctAnswer={currentQuestion.correctAnswer}
              options={currentQuestion.options}
            />
          </div>
        )}
      </main>

      <div className="fixed bottom-0 left-0 right-0 border-t border-study-border bg-white/95 p-4 backdrop-blur-sm" style={{ paddingBottom: "calc(1rem + var(--safe-bottom))" }}>
        <div className="mx-auto max-w-md">
          {!showExplanation ? (
            <button
              type="button"
              onClick={handleAnswerSubmit}
              disabled={selectedAnswer === null}
              className="study-btn disabled:opacity-50"
            >
              回答する
            </button>
          ) : (
            <button
              type="button"
              onClick={handleNextQuestion}
              className="study-btn"
            >
              {currentQuestionIndex < questions.length - 1
                ? "次の問題へ"
                : "結果を見る"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function WeakPointsQuizPage() {
  return (
    <Suspense
      fallback={
        <div className="study-shell flex items-center justify-center">
          読み込み中...
        </div>
      }
    >
      <WeakPointsQuizContent />
    </Suspense>
  );
}
