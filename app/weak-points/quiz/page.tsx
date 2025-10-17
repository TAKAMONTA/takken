"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
// 植物機能は削除
import ExplanationDisplay from "@/components/ExplanationDisplay";
import QuestionDisplay from "@/components/QuestionDisplay";
import StudyTipDisplay from "@/components/StudyTipDisplay";
import { getStudyTipsByDomain } from "@/lib/data/study-strategy";

// 弱点克服用の問題データ
const weaknessQuestions = {
  "juuyou-jikoku": [
    {
      id: 1,
      question:
        "宅地建物取引業者が行う重要事項の説明に関する次の記述のうち、宅地建物取引業法の規定によれば、正しいものはどれか。",
      options: [
        "重要事項説明書の交付は、宅地建物取引士が行わなければならないが、説明は宅地建物取引士以外の者が行ってもよい。",
        "重要事項の説明は、売買契約締結後に行えばよい。",
        "重要事項の説明は、宅地建物取引士証を提示して、宅地建物取引士が行わなければならない。",
        "重要事項説明書は、売主・買主双方に交付する必要はない。",
      ],
      correctAnswer: 2,
      explanation:
        "宅建業法第35条により、重要事項の説明は宅地建物取引士が取引士証を提示して行わなければなりません。説明と書面の交付は契約締結前に行い、相手方に交付する必要があります。",
      category: "宅建業法",
      weakness: "説明義務者の要件が曖昧",
      studyTip:
        "35条書面は「説明+交付」がセット、37条書面は「交付のみ」と覚えましょう",
    },
    {
      id: 2,
      question:
        "35条書面（重要事項説明書）の記載事項に関する次の記述のうち、宅地建物取引業法の規定によれば、誤っているものはどれか。",
      options: [
        "建物の売買の場合、建物の構造及び階数を記載しなければならない。",
        "代金以外に授受される金銭の額及び目的を記載しなければならない。",
        "契約の解除に関する事項を記載しなければならない。",
        "損害賠償額の予定又は違約金に関する事項は記載する必要がない。",
      ],
      correctAnswer: 3,
      explanation:
        "35条書面には損害賠償額の予定又は違約金に関する事項も記載しなければなりません。これは契約締結前に買主等が知っておくべき重要な事項だからです。",
      category: "宅建業法",
      weakness: "35条書面の記載事項の理解不足",
      studyTip:
        "35条書面は「契約前に知るべき事項」、37条書面は「契約内容の確認事項」と区別して覚えましょう",
    },
  ],
  teitouken: [
    {
      id: 3,
      question:
        "Aが所有する甲土地にBが1番抵当権、Cが2番抵当権を設定している場合に関する次の記述のうち、民法の規定によれば、正しいものはどれか。",
      options: [
        "甲土地上にAが建物を新築した場合、Bの抵当権の効力は建物に及ばない。",
        "甲土地上にAが建物を新築した場合、建物についてBのために法定地上権が成立する。",
        "甲土地が競売された場合、買受人は既存の建物を収去して土地の引渡しを求めることができる。",
        "甲土地上の建物について、Bの抵当権設定前から賃借権が存在していた場合、その賃借権はBに対抗できない。",
      ],
      correctAnswer: 0,
      explanation:
        "抵当権の効力は原則として抵当権設定時に存在していた物に限られます。抵当権設定後に新築された建物は、別個の不動産として扱われ、抵当権の効力は及びません。",
      category: "民法等",
      weakness: "抵当権の効力の及ぶ範囲",
      studyTip:
        "抵当権は「設定時に存在していた物」が原則。後から追加された物には及ばないと覚えましょう",
    },
  ],
  toshikeikaku: [
    {
      id: 4,
      question:
        "都市計画法に関する開発許可に関する次の記述のうち、正しいものはどれか。",
      options: [
        "市街化区域内において1,500平方メートルの住宅地造成を行う場合、開発許可を受ける必要がある。",
        "市街化調整区域内においては、規模に関係なくすべての開発行為について開発許可を受ける必要がある。",
        "非線引き区域内において2,000平方メートルの宅地造成を行う場合、開発許可を受ける必要はない。",
        "準都市計画区域内においては、開発許可制度は適用されない。",
      ],
      correctAnswer: 0,
      explanation:
        "市街化区域内では1,000㎡以上の開発行為に開発許可が必要です。1,500㎡は1,000㎡以上なので許可が必要です。市街化調整区域では原則すべて、非線引き区域等では3,000㎡以上が対象です。",
      category: "法令上の制限",
      weakness: "開発許可の対象・規模",
      studyTip:
        "市街化区域1,000㎡、非線引き等3,000㎡、市街化調整区域は原則全て許可必要と覚えましょう",
    },
  ],
  "fudousan-shutokuzei": [
    {
      id: 5,
      question: "不動産取得税に関する次の記述のうち、正しいものはどれか。",
      options: [
        "不動産取得税は、不動産を取得した者に課される国税である。",
        "相続により不動産を取得した場合には、不動産取得税が課される。",
        "新築住宅を取得した場合の課税標準の算定については、一定の要件を満たせば控除が受けられる。",
        "不動産取得税の税率は、すべての不動産について4%である。",
      ],
      correctAnswer: 2,
      explanation:
        "新築住宅については、床面積等の要件を満たせば課税標準から1,200万円（長期優良住宅等は1,300万円）が控除されます。不動産取得税は地方税で、相続による取得は非課税、住宅・住宅用土地は軽減税率3%です。",
      category: "税・その他",
      weakness: "課税標準の特例適用要件",
      studyTip:
        "新築住宅は1,200万円控除、住宅用土地は軽減税率3%、相続は非課税と覚えましょう",
    },
  ],
};

function WeakPointsQuizContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const topic = searchParams.get("topic");
  const method = searchParams.get("method");

  const [user, setUser] = useState<any>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [answers, setAnswers] = useState<boolean[]>([]);
  const [isComplete, setIsComplete] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [showDetailedExplanation, setShowDetailedExplanation] = useState(false);
  // 植物機能は削除

  useEffect(() => {
    const savedUser = localStorage.getItem("takken_user");
    if (savedUser) {
      const userData = JSON.parse(savedUser);
      setUser(userData);
    } else {
      router.push("/");
      return;
    }

    // 弱点問題を準備
    if (topic && weaknessQuestions[topic as keyof typeof weaknessQuestions]) {
      const topicQuestions =
        weaknessQuestions[topic as keyof typeof weaknessQuestions];

      let selectedQuestions = [...topicQuestions];

      // 学習方法に応じて設定を調整
      switch (method) {
        case "intensive":
          selectedQuestions = selectedQuestions.slice(0, 10);
          setTimeLeft(30 * 60); // 30分
          break;
        case "mixed":
          // 他の弱点問題も混ぜる
          const allWeakQuestions = Object.values(weaknessQuestions).flat();
          selectedQuestions = allWeakQuestions
            .sort(() => Math.random() - 0.5)
            .slice(0, 8);
          setTimeLeft(20 * 60); // 20分
          break;
        case "detailed":
          selectedQuestions = selectedQuestions.slice(0, 6);
          setTimeLeft(40 * 60); // 40分
          setShowDetailedExplanation(true);
          break;
      }

      setQuestions(selectedQuestions);
      setStartTime(new Date());
    }
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

    const isCorrect =
      selectedAnswer === questions[currentQuestionIndex].correctAnswer;
    const newAnswers = [...answers, isCorrect];
    setAnswers(newAnswers);
    setShowExplanation(true);

    // 1問解答するごとに記録を保存
    saveProgressAfterAnswer(isCorrect);
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
    localStorage.setItem("takken_user", JSON.stringify(updatedUser));
    // 植物状態の保存は不要

    console.log("弱点克服1問解答後の学習履歴を保存しました:", {
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
    localStorage.setItem("takken_user", JSON.stringify(updatedUser));
    // 植物状態の保存は不要

    console.log("弱点克服学習履歴を保存しました:", {
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

  if (!user || questions.length === 0) {
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
              {questions.map((question, index) => (
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

  const currentQuestion = questions[currentQuestionIndex];

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
          {/* 問題情報 */}
          <div className="flex items-center justify-between mb-4 text-xs">
            <span className="bg-red-100 text-red-700 px-2 py-1 rounded">
              💪 弱点克服
            </span>
            <span className="text-gray-500">{currentQuestion.category}</span>
          </div>

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
