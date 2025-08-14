'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

// ミニテスト用問題データ（短文で分かりやすい問題）
const quickTestQuestions = {
  mixed: [
    {
      id: 1,
      question: "宅地建物取引業者が広告をする場合、必ず表示しなければならないものはどれか。",
      options: [
        "宅地建物取引業者である旨",
        "売買価格",
        "建物の構造",
        "最寄り駅からの距離"
      ],
      correctAnswer: 0,
      explanation: "宅建業法第13条により、広告には宅建業者である旨、商号、免許番号、所在地の表示が義務付けられています。",
      category: "宅建業法",
      difficulty: "基本"
    },
    {
      id: 2,
      question: "相続による不動産の取得について正しいものはどれか。",
      options: [
        "不動産取得税が課税される",
        "不動産取得税は課税されない",
        "登録免許税のみ課税される",
        "固定資産税が2倍になる"
      ],
      correctAnswer: 1,
      explanation: "相続による不動産の取得は、不動産取得税の非課税要件に該当します。",
      category: "税・その他",
      difficulty: "基本"
    },
    {
      id: 3,
      question: "市街化調整区域内で開発行為を行う場合の原則はどれか。",
      options: [
        "自由に開発できる",
        "都道府県知事の許可が必要",
        "市町村長の許可が必要",
        "許可は不要"
      ],
      correctAnswer: 1,
      explanation: "市街化調整区域では、原則として開発が制限されており、都道府県知事の許可が必要です。",
      category: "法令上の制限",
      difficulty: "基本"
    },
    {
      id: 4,
      question: "債権者代位権について正しいものはどれか。",
      options: [
        "債権者は債務者に代わって債務者の権利を行使できる",
        "債権者は債務者の同意が必要",
        "金銭債権のみ行使できる",
        "債権額に制限はない"
      ],
      correctAnswer: 0,
      explanation: "債権者代位権は、債務者が権利を行使しない場合に、債権者が債務者に代わって権利を行使できる制度です。",
      category: "民法等",
      difficulty: "応用"
    },
    {
      id: 5,
      question: "宅建業法の重要事項説明について正しいものはどれか。",
      options: [
        "書面で行えば口頭説明は不要",
        "宅建士が書面交付と口頭説明を行う",
        "業者が口頭説明すれば十分",
        "書面のみで説明できる"
      ],
      correctAnswer: 1,
      explanation: "重要事項説明は、宅建士が書面を交付し、かつ口頭で説明することが必要です。",
      category: "宅建業法",
      difficulty: "基本"
    }
  ],
  takkengyouhou: [
    {
      id: 6,
      question: "宅建士証の有効期間は何年か。",
      options: [
        "3年",
        "5年",
        "7年",
        "10年"
      ],
      correctAnswer: 1,
      explanation: "宅地建物取引士証の有効期間は5年間です。",
      category: "宅建業法",
      difficulty: "基本"
    },
    {
      id: 7,
      question: "宅建業者の免許の有効期間は何年か。",
      options: [
        "3年",
        "5年",
        "7年",
        "10年"
      ],
      correctAnswer: 1,
      explanation: "宅地建物取引業の免許の有効期間は5年間です。",
      category: "宅建業法",
      difficulty: "基本"
    }
  ],
  minpou: [
    {
      id: 8,
      question: "時効の中断事由に該当するものはどれか。",
      options: [
        "債務の承認",
        "債権者の死亡",
        "債務者の転居",
        "契約書の紛失"
      ],
      correctAnswer: 0,
      explanation: "債務の承認は時効の中断事由の一つです。",
      category: "民法等",
      difficulty: "基本"
    }
  ],
  hourei: [
    {
      id: 9,
      question: "建築基準法の接道義務について正しいものはどれか。",
      options: [
        "幅員2m以上の道路に接する必要がある",
        "幅員3m以上の道路に接する必要がある",
        "幅員4m以上の道路に接する必要がある",
        "道路に接する必要はない"
      ],
      correctAnswer: 2,
      explanation: "建築物の敷地は、原則として幅員4m以上の道路に2m以上接していなければなりません。",
      category: "法令上の制限",
      difficulty: "基本"
    }
  ],
  zeihou: [
    {
      id: 10,
      question: "住宅用土地の固定資産税の軽減措置はどれか。",
      options: [
        "課税標準額を1/2に軽減",
        "課税標準額を1/3に軽減",
        "課税標準額を1/6に軽減",
        "軽減措置はない"
      ],
      correctAnswer: 2,
      explanation: "住宅用地（小規模住宅用地）の固定資産税は、課税標準額を1/6に軽減する特例があります。",
      category: "税・その他",
      difficulty: "基本"
    }
  ]
};

function QuickTestQuizContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const category = searchParams.get('category') || 'mixed';
  const mode = searchParams.get('mode') || 'normal';

  const [user, setUser] = useState<any>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [answers, setAnswers] = useState<boolean[]>([]);
  const [isComplete, setIsComplete] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [totalTime, setTotalTime] = useState(0);

  useEffect(() => {
    const savedUser = localStorage.getItem('takken_rpg_user');
    if (savedUser) {
      const userData = JSON.parse(savedUser);
      setUser(userData);
    } else {
      router.push('/');
      return;
    }

    // 問題を準備
    let selectedQuestions: any[] = [];
    
    if (category === 'mixed') {
      // 全分野から1問ずつ
      selectedQuestions = quickTestQuestions.mixed;
    } else if (quickTestQuestions[category as keyof typeof quickTestQuestions]) {
      const categoryQuestions = quickTestQuestions[category as keyof typeof quickTestQuestions];
      selectedQuestions = [...categoryQuestions];
      
      // 問題が足りない場合はmixedから補完
      if (selectedQuestions.length < 5) {
        const mixedQuestions = quickTestQuestions.mixed.filter(q => 
          !selectedQuestions.some(sq => sq.id === q.id)
        );
        selectedQuestions = selectedQuestions.concat(mixedQuestions.slice(0, 5 - selectedQuestions.length));
      }
    }
    
    selectedQuestions = selectedQuestions.slice(0, 5);
    setQuestions(selectedQuestions);
    
    // 時間設定（モードに応じて調整）
    const baseTime = 5 * 60; // 5分
    const timeMultiplier = mode === 'speed' ? 0.8 : mode === 'review' ? 1.5 : 1.0;
    const totalTime = Math.round(baseTime * timeMultiplier);
    
    setTimeLeft(totalTime);
    setTotalTime(totalTime);
    setStartTime(new Date());
  }, [category, mode, router]);

  useEffect(() => {
    if (timeLeft > 0 && !isComplete) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && !isComplete) {
      // 時間切れ
      handleTimeUp();
    }
  }, [timeLeft, isComplete]);

  const handleTimeUp = () => {
    setIsComplete(true);
    saveResults();
  };

  const handleAnswerSelect = (answerIndex: number) => {
    if (showExplanation) return;
    setSelectedAnswer(answerIndex);
  };

  const handleAnswerSubmit = () => {
    if (selectedAnswer === null) return;
    
    const isCorrect = selectedAnswer === questions[currentQuestionIndex].correctAnswer;
    const newAnswers = [...answers, isCorrect];
    setAnswers(newAnswers);
    setShowExplanation(true);
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
    
    const correctCount = answers.filter(answer => answer).length;
    const score = Math.round((correctCount / questions.length) * 100);
    const xpEarned = correctCount * 8; // ミニテストは少し少なめのXP
    const studyTimeMinutes = startTime ? Math.round((new Date().getTime() - startTime.getTime()) / 1000 / 60) : 0;
    
    // ユーザーデータを更新
    const updatedUser = { ...user };
    
    // ペットのXPとレベルを更新
    updatedUser.pet.xp += xpEarned;
    updatedUser.pet.happiness = Math.min(100, updatedUser.pet.happiness + 5);
    
    const newLevel = Math.floor(updatedUser.pet.xp / 100) + 1;
    if (newLevel > updatedUser.pet.level) {
      updatedUser.pet.level = newLevel;
      if (newLevel === 3 && updatedUser.pet.stage === 1) {
        updatedUser.pet.stage = 2;
      } else if (newLevel === 5 && updatedUser.pet.stage === 2) {
        updatedUser.pet.stage = 3;
      }
    }

    // 学習履歴を更新
    if (!updatedUser.studyHistory) {
      updatedUser.studyHistory = [];
    }
    
    const today = new Date().toISOString().split('T')[0];
    const todayRecord = updatedUser.studyHistory.find((record: any) => record.date === today);
    
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
        sessions: 1
      });
    }

    // 総学習統計を更新
    if (!updatedUser.totalStats) {
      updatedUser.totalStats = {
        totalQuestions: 0,
        totalCorrect: 0,
        totalStudyTime: 0,
        totalSessions: 0
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
        lastStudyDate: '',
        studyDates: []
      };
    }

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];
    
    if (updatedUser.streak.lastStudyDate === yesterdayStr || updatedUser.streak.lastStudyDate === today) {
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
    localStorage.setItem('takken_rpg_user', JSON.stringify(updatedUser));
    
    console.log('クイックテスト学習履歴を保存しました:', {
      questionsAnswered: questions.length,
      correctAnswers: correctCount,
      studyTimeMinutes: studyTimeMinutes,
      currentStreak: updatedUser.streak.currentStreak
    });
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getTimeColor = () => {
    const remaining = timeLeft / totalTime;
    if (remaining > 0.5) return 'text-green-600';
    if (remaining > 0.2) return 'text-orange-600';
    return 'text-red-600';
  };

  if (!user || questions.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-2xl font-bold text-gray-600">Loading...</div>
      </div>
    );
  }

  if (isComplete) {
    const correctCount = answers.filter(answer => answer).length;
    const score = Math.round((correctCount / questions.length) * 100);
    const xpEarned = correctCount * 8;
    const timeUsed = totalTime - timeLeft;
    
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-purple-50">
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-md mx-auto px-4 py-4">
            <h1 className="text-xl font-bold text-gray-800 text-center">ミニテスト完了！</h1>
          </div>
        </div>

        <div className="max-w-md mx-auto px-4 py-8 space-y-6">
          <div className="bg-white rounded-xl p-6 shadow-sm text-center">
            <div className="text-4xl mb-4">
              {score >= 80 ? '🎉' : score >= 60 ? '😊' : timeLeft === 0 ? '⏰' : '😅'}
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              {correctCount}/{questions.length}問正解
            </h2>
            <div className="text-3xl font-bold text-purple-600 mb-2">
              {score}%
            </div>
            <p className="text-gray-600 mb-4">
              {timeLeft === 0 ? '時間切れでした！' : 
               score >= 80 ? 'パーフェクト！' : 
               score >= 60 ? 'よくできました！' : 'もう少し頑張りましょう！'}
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-purple-50 rounded-lg p-3">
                <div className="text-sm text-gray-700">獲得XP</div>
                <div className="text-xl font-bold text-purple-600">+{xpEarned}</div>
              </div>
              <div className="bg-blue-50 rounded-lg p-3">
                <div className="text-sm text-gray-700">所要時間</div>
                <div className="text-xl font-bold text-blue-600">{formatTime(timeUsed)}</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h3 className="font-bold text-lg mb-4 text-gray-800">📊 詳細結果</h3>
            <div className="space-y-3">
              {questions.map((question, index) => (
                <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-sm ${
                      index < answers.length && answers[index] ? 'bg-green-500' : 'bg-red-500'
                    }`}>
                      {index + 1}
                    </div>
                    <div className="text-sm text-gray-700">
                      {question.category}
                    </div>
                  </div>
                  <div className={`text-sm font-bold ${
                    index < answers.length && answers[index] ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {index < answers.length ? (answers[index] ? '正解' : '不正解') : '未回答'}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <Link href="/quick-test">
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

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-purple-50">
      {/* ヘッダー */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-md mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/quick-test" className="text-purple-600">
              <div className="w-5 h-5 flex items-center justify-center">
                <i className="ri-arrow-left-line text-xl"></i>
              </div>
            </Link>
            <div className="text-center">
              <div className="text-sm text-gray-500">
                {currentQuestionIndex + 1} / {questions.length}
              </div>
              <div className={`text-lg font-bold ${getTimeColor()}`}>
                ⏰ {formatTime(timeLeft)}
              </div>
            </div>
            <div className="w-5"></div>
          </div>
        </div>
      </div>

      {/* プログレスバー */}
      <div className="max-w-md mx-auto px-4 py-2">
        <div className="bg-gray-200 rounded-full h-2 mb-2">
          <div 
            className="bg-purple-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
          ></div>
        </div>
        <div className="bg-gray-200 rounded-full h-1">
          <div 
            className={`h-1 rounded-full transition-all duration-1000 ${
              timeLeft / totalTime > 0.5 ? 'bg-green-500' : 
              timeLeft / totalTime > 0.2 ? 'bg-orange-500' : 'bg-red-500'
            }`}
            style={{ width: `${(timeLeft / totalTime) * 100}%` }}
          ></div>
        </div>
      </div>

      {/* 問題表示 */}
      <div className="max-w-md mx-auto px-4 py-6">
        <div className="bg-white rounded-xl p-6 shadow-sm">
          {/* 問題情報 */}
          <div className="flex items-center justify-between mb-4 text-xs">
            <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded">
              {currentQuestion.category}
            </span>
            <span className="text-gray-500">
              {currentQuestion.difficulty}
            </span>
          </div>

          {/* 問題文 */}
          <div className="mb-6">
            <h2 className="text-base text-gray-800 leading-relaxed font-medium">
              {currentQuestion.question}
            </h2>
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
                      ? 'border-green-500 bg-green-50'
                      : selectedAnswer === index
                      ? 'border-red-500 bg-red-50'
                      : 'border-gray-200'
                    : selectedAnswer === index
                    ? 'border-purple-500 bg-purple-50'
                    : 'border-gray-200 hover:border-purple-300'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-sm font-bold ${
                    showExplanation
                      ? index === currentQuestion.correctAnswer
                        ? 'border-green-500 bg-green-500 text-white'
                        : selectedAnswer === index
                        ? 'border-red-500 bg-red-500 text-white'
                        : 'border-gray-300'
                      : selectedAnswer === index
                      ? 'border-purple-500 bg-purple-500 text-white'
                      : 'border-gray-300'
                  }`}>
                    {index + 1}
                  </div>
                  <span className="text-sm text-gray-800 flex-1">{option}</span>
                </div>
              </button>
            ))}
          </div>

          {/* 解説表示 */}
          {showExplanation && mode === 'review' && (
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <h3 className="font-bold text-sm text-gray-800 mb-2">📝 解説</h3>
              <p className="text-sm text-gray-700 leading-relaxed">
                {currentQuestion.explanation}
              </p>
            </div>
          )}

          {/* ボタン */}
          <div className="space-y-3">
            {!showExplanation ? (
              <button
                onClick={handleAnswerSubmit}
                disabled={selectedAnswer === null}
                className="w-full bg-purple-600 text-white py-3 px-6 rounded-lg font-bold hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed !rounded-button"
              >
                回答する
              </button>
            ) : (
              <button
                onClick={handleNextQuestion}
                className="w-full bg-purple-600 text-white py-3 px-6 rounded-lg font-bold hover:bg-purple-700 transition-colors !rounded-button"
              >
                {currentQuestionIndex < questions.length - 1 ? '次の問題へ' : '結果を見る'}
              </button>
            )}
            {showExplanation && (
              <button
                onClick={() => {
                  saveResults();
                  router.push('/dashboard');
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
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-2xl font-bold text-gray-600">Loading...</div>
      </div>
    }>
      <QuickTestQuizContent />
    </Suspense>
  );
}