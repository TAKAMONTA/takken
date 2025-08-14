
'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { UserProfile } from '@/lib/types';
import { 
  updateStudyStreak, 
  updateStudyProgress, 
  checkNewBadges, 
  calculateXPAndLevel,
  saveStudyData 
} from '@/lib/study-utils';
import { Question, QuizProps, QuizState, QuizResults, StudySession } from '@/lib/types/quiz';
import { sampleQuestions } from '@/lib/data/questions';

function QuizContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get('category');
  const modeParam = searchParams.get('mode');

  const [user, setUser] = useState<UserProfile | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [answers, setAnswers] = useState<boolean[]>([]);
  const [isComplete, setIsComplete] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [startTime, setStartTime] = useState<Date | null>(null);

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
    if (categoryParam && sampleQuestions[categoryParam as keyof typeof sampleQuestions]) {
      const categoryQuestions = sampleQuestions[categoryParam as keyof typeof sampleQuestions];

      let selectedQuestions = [...categoryQuestions];

      // モードに応じて問題を選択
      switch (modeParam) {
        case 'random':
          selectedQuestions = selectedQuestions.sort(() => Math.random() - 0.5).slice(0, 10);
          break;
        case 'weak':
          // 弱点問題（デモでは同じ問題）
          selectedQuestions = selectedQuestions.slice(0, 5);
          break;
        case 'year':
          // 年度別（デモでは同じ問題）
          selectedQuestions = selectedQuestions;
          break;
        case 'mock':
          // 模擬試験（他のカテゴリからも問題を混ぜる）
          const allQuestions = Object.values(sampleQuestions).flat();
          selectedQuestions = allQuestions.sort(() => Math.random() - 0.5).slice(0, 10);
          break;
      }

      setQuestions(selectedQuestions);
      setTimeLeft(selectedQuestions.length * 120); // 1問2分
      setStartTime(new Date());
    }
  }, [categoryParam, modeParam, router]);

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
    const xpEarned = correctCount * 10;
    const studyTimeMinutes = startTime ? Math.round((new Date().getTime() - startTime.getTime()) / 1000 / 60) : 0;

    // ユーザーデータを更新
    const updatedUser = { ...user };
    
    // ペットのXPとレベルを更新
    updatedUser.pet.xp += xpEarned;
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
    
    console.log('学習履歴を保存しました:', {
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
    const xpEarned = correctCount * 10;

    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-purple-50">
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-md mx-auto px-4 py-4">
            <h1 className="text-xl font-bold text-gray-800 text-center">結果発表</h1>
          </div>
        </div>

        <div className="max-w-md mx-auto px-4 py-8 space-y-6">
          <div className="bg-white rounded-xl p-6 shadow-sm text-center">
            <div className="text-4xl mb-4">
              {score >= 80 ? '🎉' : score >= 60 ? '😊' : '😅'}
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              {correctCount}/{questions.length}問正解
            </h2>
            <div className="text-3xl font-bold text-purple-600 mb-2">
              {score}%
            </div>
            <p className="text-gray-600 mb-4">
              {score >= 80
                ? '素晴らしい成績です！'
                : score >= 60
                ? 'よく頑張りました！'
                : 'もう少し復習が必要です'}
            </p>
            <div className="bg-purple-50 rounded-lg p-3">
              <div className="text-sm text-gray-700">獲得XP</div>
              <div className="text-xl font-bold text-purple-600">+{xpEarned} XP</div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h3 className="font-bold text-lg mb-4 text-gray-800">📊 詳細結果</h3>
            <div className="space-y-3">
              {questions.map((question, index) => (
                <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-sm ${answers[index]
                        ? 'bg-green-500'
                        : 'bg-red-500'
                      }`}
                    >
                      {index + 1}
                    </div>
                    <div className="text-sm text-gray-700">問題{index + 1}</div>
                  </div>
                  <div
                    className={`text-sm font-bold ${answers[index] ? 'text-green-600' : 'text-red-600'}`}
                  >
                    {answers[index] ? '正解' : '不正解'}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-3">
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

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-purple-50">
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
            className="bg-purple-500 h-2 rounded-full transition-all duration-300"
            style={{
              width: `${((currentQuestionIndex + 1) / questions.length) * 100}%`
            }}
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
          <div className="space-y-3 mb-6">
            {currentQuestion.options.map((option: string, index: number) => (
              <button
                key={index}
                onClick={() => handleAnswerSelect(index)}
                disabled={showExplanation}
                className={`w-full text-left p-4 rounded-lg border-2 transition-all !rounded-button ${showExplanation
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
                  <div
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-sm font-bold ${showExplanation
                      ? index === currentQuestion.correctAnswer
                        ? 'border-green-500 bg-green-500 text-white'
                        : selectedAnswer === index
                        ? 'border-red-500 bg-red-500 text-white'
                        : 'border-gray-300'
                      : selectedAnswer === index
                      ? 'border-purple-500 bg-purple-500 text-white'
                      : 'border-gray-300'
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
                {currentQuestionIndex < questions.length - 1
                  ? '次の問題へ'
                  : '結果を見る'}
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
