'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

// 模試用問題データ（本番形式の問題を50問分用意）
const mockExamQuestions = [
  // 宅建業法（20問）
  {
    id: 1,
    question: "宅地建物取引業者が宅地建物取引業に関して広告をする場合に関する次の記述のうち、宅地建物取引業法の規定によれば、正しいものはどれか。",
    options: [
      "宅地建物取引業者は、広告に宅地建物取引業者である旨を表示しなければならない。",
      "宅地建物取引業者は、広告に免許番号を表示する義務はない。",
      "宅地建物取引業者は、広告に商号または名称を表示する必要はない。",
      "宅地建物取引業者は、広告に所在地を表示する義務はない。"
    ],
    correctAnswer: 0,
    explanation: "宅地建物取引業法第13条の規定により、宅地建物取引業者が広告をする場合は、宅地建物取引業者である旨、商号または名称、免許番号、所在地を表示しなければなりません。",
    category: "宅建業法",
    difficulty: "基本",
    year: "令和5年"
  },
  {
    id: 2,
    question: "宅地建物取引士に関する次の記述のうち、宅地建物取引業法の規定によれば、正しいものはどれか。",
    options: [
      "宅地建物取引士は、取引士証の交付を受けた日から5年ごとに法定講習を受けなければならない。",
      "宅地建物取引士は、その業務を行う際に、常に取引士証を携帯する必要はない。",
      "宅地建物取引士は、重要事項の説明をする際に、相手方に取引士証を提示する義務はない。",
      "宅地建物取引士は、他人の求めに応じて取引士証を提示する義務はない。"
    ],
    correctAnswer: 0,
    explanation: "宅地建物取引業法第22条の2の規定により、宅地建物取引士は5年ごとに都道府県知事が指定する講習を受ける必要があります。",
    category: "宅建業法",
    difficulty: "基本",
    year: "令和5年"
  },
  {
    id: 3,
    question: "宅地建物取引業者が行う営業保証金に関する次の記述のうち、宅地建物取引業法の規定によれば、正しいものはどれか。",
    options: [
      "主たる事務所については1,000万円、その他の事務所については1か所につき500万円を供託する。",
      "主たる事務所については1,500万円、その他の事務所については1か所につき300万円を供託する。",
      "主たる事務所については2,000万円、その他の事務所については1か所につき500万円を供託する。",
      "主たる事務所については1,000万円、その他の事務所については1か所につき300万円を供託する。"
    ],
    correctAnswer: 0,
    explanation: "宅建業法第25条により、営業保証金は主たる事務所1,000万円、その他の事務所1か所につき500万円です。",
    category: "宅建業法",
    difficulty: "基本",
    year: "令和5年"
  },
  // 民法等（14問）
  {
    id: 4,
    question: "AがBに対して負っている100万円の債務について、CがAのためにBに100万円を弁済した場合に関する次の記述のうち、民法の規定及び判例によれば、正しいものはどれか。",
    options: [
      "CがAの意思に反して弁済した場合、CはAに対して求償することができない。",
      "CがAの委託を受けて弁済した場合、CはAに対して100万円の求償ができる。",
      "CがAの委託を受けずに弁済した場合、CはAに対して求償することができない。",
      "CがAの意思に反して弁済した場合でも、CはAに対して100万円の求償ができる。"
    ],
    correctAnswer: 1,
    explanation: "民法第459条の規定により、委託を受けた保証人が弁済した場合、債務者に対して求償することができます。",
    category: "民法等",
    difficulty: "応用",
    year: "令和5年"
  },
  {
    id: 5,
    question: "時効に関する次の記述のうち、民法の規定によれば、正しいものはどれか。",
    options: [
      "債権の消滅時効期間は、権利を行使することができることを知った時から3年間である。",
      "債権の消滅時効期間は、権利を行使することができる時から20年間である。",
      "債権の消滅時効期間は、権利を行使することができることを知った時から5年間である。",
      "債権の消滅時効期間は、権利を行使することができることを知った時から3年間、権利を行使することができる時から20年間である。"
    ],
    correctAnswer: 3,
    explanation: "民法第166条により、債権の消滅時効は知った時から5年、権利を行使できる時から20年（ただし、人の生命又は身体の侵害による損害賠償請求権は知った時から3年）です。",
    category: "民法等",
    difficulty: "応用",
    year: "令和5年"
  },
  // 法令上の制限（8問）
  {
    id: 6,
    question: "都市計画法に関する次の記述のうち、正しいものはどれか。",
    options: [
      "市街化区域内においては、開発許可を受けることなく、1,000平方メートルの宅地造成を行うことができる。",
      "市街化調整区域内においては、原則として開発行為は禁止されている。",
      "開発許可を受けた開発区域内において建築物を建築する場合、建築確認は不要である。",
      "開発許可権者は、都道府県知事に限られる。"
    ],
    correctAnswer: 1,
    explanation: "都市計画法第34条により、市街化調整区域内では、原則として開発行為は抑制されています。",
    category: "法令上の制限",
    difficulty: "基本",
    year: "令和5年"
  },
  {
    id: 7,
    question: "建築基準法に関する次の記述のうち、正しいものはどれか。",
    options: [
      "建築物の敷地は、原則として幅員4m以上の道路に2m以上接していなければならない。",
      "建築物の敷地は、原則として幅員6m以上の道路に3m以上接していなければならない。",
      "建築物の敷地は、原則として幅員4m以上の道路に3m以上接していなければならない。",
      "建築物の敷地は、道路に接する必要はない。"
    ],
    correctAnswer: 0,
    explanation: "建築基準法第43条により、建築物の敷地は原則として幅員4m以上の道路に2m以上接していなければなりません。",
    category: "法令上の制限",
    difficulty: "基本",
    year: "令和5年"
  },
  // 税・その他（8問）
  {
    id: 8,
    question: "不動産取得税に関する次の記述のうち、正しいものはどれか。",
    options: [
      "不動産取得税は国税である。",
      "相続による不動産の取得には不動産取得税が課税される。",
      "不動産取得税の税率は、住宅及び住宅用土地については3%である。",
      "不動産取得税は取得した日から30日以内に申告しなければならない。"
    ],
    correctAnswer: 2,
    explanation: "不動産取得税の標準税率は4%ですが、住宅及び住宅用土地については軽減税率3%が適用されます。",
    category: "税・その他",
    difficulty: "基本",
    year: "令和5年"
  },
  {
    id: 9,
    question: "固定資産税に関する次の記述のうち、正しいものはどれか。",
    options: [
      "住宅用地の課税標準額は、価格の6分の1の額とする。",
      "住宅用地の課税標準額は、価格の3分の1の額とする。",
      "住宅用地の課税標準額は、価格の2分の1の額とする。",
      "住宅用地に対する軽減措置はない。"
    ],
    correctAnswer: 0,
    explanation: "地方税法により、小規模住宅用地（200㎡以下）の固定資産税の課税標準額は価格の6分の1になります。",
    category: "税・その他",
    difficulty: "基本",
    year: "令和5年"
  },
  {
    id: 10,
    question: "登録免許税に関する次の記述のうち、正しいものはどれか。",
    options: [
      "所有権の保存登記の税率は、原則として1000分の4である。",
      "所有権の移転登記の税率は、原則として1000分の10である。",
      "抵当権の設定登記の税率は、原則として1000分の4である。",
      "上記すべて正しい。"
    ],
    correctAnswer: 3,
    explanation: "登録免許税法により、所有権保存登記1000分の4、所有権移転登記1000分の20（軽減税率適用時1000分の3〜10）、抵当権設定登記1000分の4です。",
    category: "税・その他",
    difficulty: "応用",
    year: "令和5年"
  }
];

// 残りの40問も同様に追加（実際の実装では50問分必要）
for (let i = 11; i <= 50; i++) {
  const categories = ['宅建業法', '民法等', '法令上の制限', '税・その他'];
  const categoryIndex = (i - 1) % 4;
  const category = categories[categoryIndex];
  
  mockExamQuestions.push({
    id: i,
    question: `【${category}】問題${i}：この問題は模試システムのデモ用サンプル問題です。実際の問題文がここに入ります。`,
    options: [
      "選択肢1：正解となる選択肢の内容",
      "選択肢2：不正解の選択肢の内容",
      "選択肢3：不正解の選択肢の内容",
      "選択肢4：不正解の選択肢の内容"
    ],
    correctAnswer: 0,
    explanation: `この問題の解説文です。${category}に関する重要なポイントを説明します。`,
    category: category,
    difficulty: i % 3 === 0 ? "応用" : "基本",
    year: "令和5年"
  });
}

function MockExamQuizContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const mode = searchParams.get('mode') || 'full_exam';

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
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    const savedUser = localStorage.getItem('takken_rpg_user');
    if (savedUser) {
      const userData = JSON.parse(savedUser);
      setUser(userData);
    } else {
      router.push('/');
      return;
    }

    // モードに応じて問題を設定
    let questionCount = 50;
    let timeLimit = 120; // 分

    switch (mode) {
      case 'speed_exam':
        questionCount = 40;
        timeLimit = 90;
        break;
      case 'review_exam':
        questionCount = 30;
        timeLimit = 0; // 無制限
        break;
      default: // full_exam
        questionCount = 50;
        timeLimit = 120;
        break;
    }

    const selectedQuestions = mockExamQuestions.slice(0, questionCount);
    setQuestions(selectedQuestions);
    setAnswers(new Array(questionCount).fill(null));

    if (timeLimit > 0) {
      const totalSeconds = timeLimit * 60;
      setTimeLeft(totalSeconds);
      setTotalTime(totalSeconds);
    }

    setStartTime(new Date());
  }, [mode, router]);

  useEffect(() => {
    if (timeLeft > 0 && !isComplete && !isPaused && totalTime > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && totalTime > 0 && !isComplete) {
      handleTimeUp();
    }
  }, [timeLeft, isComplete, isPaused, totalTime]);

  const handleTimeUp = () => {
    setIsComplete(true);
    setShowResults(true);
    saveResults();
  };

  const handleAnswerSelect = (questionIndex: number, answerIndex: number) => {
    const newAnswers = [...answers];
    newAnswers[questionIndex] = answerIndex;
    setAnswers(newAnswers);
    setSelectedAnswer(answerIndex);
  };

  const handleQuestionJump = (questionIndex: number) => {
    setCurrentQuestionIndex(questionIndex);
    setSelectedAnswer(answers[questionIndex]);
  };

  const handleSubmitExam = () => {
    if (window.confirm('模試を終了しますか？未回答の問題があっても提出されます。')) {
      setIsComplete(true);
      setShowResults(true);
      saveResults();
    }
  };

  const saveResults = () => {
    if (!user) return;

    const correctAnswers = answers.map((answer, index) => 
      answer === questions[index]?.correctAnswer
    );
    const correctCount = correctAnswers.filter(correct => correct).length;
    const score = Math.round((correctCount / questions.length) * 100);
    const xpEarned = correctCount * 15; // 模試は高めのXP
    const studyTimeMinutes = startTime ? Math.round((new Date().getTime() - startTime.getTime()) / 1000 / 60) : 0;

    // ユーザーデータを更新
    const updatedUser = { ...user };
    
    // ペットのXPとレベルを更新
    updatedUser.pet.xp += xpEarned;
    updatedUser.pet.happiness = Math.min(100, updatedUser.pet.happiness + 10);

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
    
    console.log('模擬試験学習履歴を保存しました:', {
      questionsAnswered: questions.length,
      correctAnswers: correctCount,
      studyTimeMinutes: studyTimeMinutes,
      currentStreak: updatedUser.streak.currentStreak
    });
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hours > 0) {
      return `${hours}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getTimeColor = () => {
    if (totalTime === 0) return 'text-gray-600';
    const remaining = timeLeft / totalTime;
    if (remaining > 0.5) return 'text-green-600';
    if (remaining > 0.2) return 'text-orange-600';
    return 'text-red-600';
  };

  const getAnsweredCount = () => answers.filter(answer => answer !== null).length;

  const getRank = (percentage: number) => {
    if (percentage >= 85) return { rank: 'S', color: 'bg-purple-500' };
    if (percentage >= 75) return { rank: 'A', color: 'bg-green-500' };
    if (percentage >= 65) return { rank: 'B', color: 'bg-blue-500' };
    if (percentage >= 50) return { rank: 'C', color: 'bg-orange-500' };
    return { rank: 'D', color: 'bg-red-500' };
  };

  if (!user || questions.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-2xl font-bold text-gray-600">Loading...</div>
      </div>
    );
  }

  if (showResults) {
    const correctAnswers = answers.map((answer, index) => 
      answer === questions[index]?.correctAnswer
    );
    const correctCount = correctAnswers.filter(correct => correct).length;
    const score = Math.round((correctCount / questions.length) * 100);
    const xpEarned = correctCount * 15;
    const rankInfo = getRank(score);

    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-purple-50">
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-md mx-auto px-4 py-4">
            <h1 className="text-xl font-bold text-gray-800 text-center">模試結果</h1>
          </div>
        </div>

        <div className="max-w-md mx-auto px-4 py-8 space-y-6">
          {/* 総合結果 */}
          <div className="bg-white rounded-xl p-6 shadow-sm text-center">
            <div className={`w-16 h-16 rounded-full ${rankInfo.color} text-white text-2xl font-bold flex items-center justify-center mx-auto mb-4`}>
              {rankInfo.rank}
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              {correctCount}/{questions.length}問正解
            </h2>
            <div className="text-4xl font-bold text-purple-600 mb-4">
              {score}%
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-purple-50 rounded-lg p-3">
                <div className="text-sm text-gray-700">獲得XP</div>
                <div className="text-xl font-bold text-purple-600">+{xpEarned}</div>
              </div>
              <div className="bg-blue-50 rounded-lg p-3">
                <div className="text-sm text-gray-700">判定</div>
                <div className="text-lg font-bold text-blue-600">
                  {score >= 70 ? '合格圏' : score >= 60 ? 'もう少し' : '要復習'}
                </div>
              </div>
            </div>
          </div>

          {/* 分野別結果 */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h3 className="font-bold text-lg mb-4 text-gray-800">📊 分野別成績</h3>
            {['宅建業法', '民法等', '法令上の制限', '税・その他'].map(category => {
              const categoryQuestions = questions.filter(q => q.category === category);
              const categoryCorrect = categoryQuestions.filter((q, i) => {
                const originalIndex = questions.findIndex(qq => qq.id === q.id);
                return answers[originalIndex] === q.correctAnswer;
              }).length;
              const categoryScore = categoryQuestions.length > 0 ? 
                Math.round((categoryCorrect / categoryQuestions.length) * 100) : 0;

              return (
                <div key={category} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                  <div>
                    <div className="text-sm font-medium text-gray-800">{category}</div>
                    <div className="text-xs text-gray-500">
                      {categoryCorrect}/{categoryQuestions.length}問
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-lg font-bold ${
                      categoryScore >= 80 ? 'text-green-600' : 
                      categoryScore >= 60 ? 'text-blue-600' : 'text-red-600'
                    }`}>
                      {categoryScore}%
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* 問題別詳細 */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h3 className="font-bold text-lg mb-4 text-gray-800">📝 問題別結果</h3>
            <div className="grid grid-cols-10 gap-1">
              {questions.map((question, index) => {
                const isCorrect = answers[index] === question.correctAnswer;
                const isAnswered = answers[index] !== null;
                return (
                  <div
                    key={index}
                    className={`w-8 h-8 rounded text-xs font-bold flex items-center justify-center text-white ${
                      !isAnswered ? 'bg-gray-400' :
                      isCorrect ? 'bg-green-500' : 'bg-red-500'
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

          <div className="space-y-3">
            <Link href="/mock-exam">
              <button className="w-full bg-red-600 text-white py-3 px-6 rounded-lg font-bold hover:bg-red-700 transition-colors !rounded-button">
                もう一度挑戦する
              </button>
            </Link>
            <button
              onClick={() => {
                saveResults();
                router.push('/dashboard');
              }}
              className="w-full bg-purple-600 text-white py-3 px-6 rounded-lg font-bold hover:bg-purple-700 transition-colors !rounded-button"
            >
              学習記録を保存してトップページに戻る
            </button>
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
      <div className="bg-white shadow-sm border-b fixed top-0 w-full z-10">
        <div className="max-w-md mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              問題 {currentQuestionIndex + 1}/{questions.length}
            </div>
            <div className="text-center">
              {totalTime > 0 && (
                <div className={`text-lg font-bold ${getTimeColor()}`}>
                  ⏰ {formatTime(timeLeft)}
                </div>
              )}
            </div>
            <div className="text-sm text-gray-600">
              回答済: {getAnsweredCount()}/{questions.length}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 pt-20 pb-24">
        {/* 問題表示 */}
        <div className="bg-white rounded-xl p-6 shadow-sm mb-6">
          {/* 問題情報 */}
          <div className="flex items-center justify-between mb-4 text-xs">
            <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded">
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
                className={`w-full text-left p-4 rounded-lg border-2 transition-all !rounded-button ${
                  selectedAnswer === index
                    ? 'border-purple-500 bg-purple-50'
                    : answers[currentQuestionIndex] === index
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-purple-300'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-sm font-bold ${
                    selectedAnswer === index
                      ? 'border-purple-500 bg-purple-500 text-white'
                      : answers[currentQuestionIndex] === index
                      ? 'border-blue-500 bg-blue-500 text-white'
                      : 'border-gray-300'
                  }`}>
                    {index + 1}
                  </div>
                  <span className="text-sm text-gray-800 flex-1">{option}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* 問題一覧 */}
        <div className="bg-white rounded-xl p-4 shadow-sm mb-6">
          <h3 className="font-bold text-sm mb-3 text-gray-800">問題一覧</h3>
          <div className="grid grid-cols-10 gap-1">
            {questions.map((_, index) => (
              <button
                key={index}
                onClick={() => handleQuestionJump(index)}
                className={`w-8 h-8 rounded text-xs font-bold transition-all !rounded-button ${
                  index === currentQuestionIndex
                    ? 'bg-purple-600 text-white'
                    : answers[index] !== null
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                }`}
              >
                {index + 1}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ボトム操作パネル */}
      <div className="bg-white border-t fixed bottom-0 w-full">
        <div className="max-w-md mx-auto px-4 py-3">
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1))}
              disabled={currentQuestionIndex === 0}
              className="flex-1 bg-gray-500 text-white py-2 px-4 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed !rounded-button"
            >
              前の問題
            </button>
            
            {currentQuestionIndex === questions.length - 1 ? (
              <button
                onClick={handleSubmitExam}
                className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg font-medium !rounded-button"
              >
                提出する
              </button>
            ) : (
              <button
                onClick={() => setCurrentQuestionIndex(Math.min(questions.length - 1, currentQuestionIndex + 1))}
                className="flex-1 bg-purple-600 text-white py-2 px-4 rounded-lg font-medium !rounded-button"
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
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-2xl font-bold text-gray-600">Loading...</div>
      </div>
    }>
      <MockExamQuizContent />
    </Suspense>
  );
}