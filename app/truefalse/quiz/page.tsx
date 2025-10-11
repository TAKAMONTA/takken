'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { TrueFalseItem, TrueFalseQuizState, TrueFalseQuizResults } from '@/lib/types/quiz';
import { getTFQuizSet, getLawDisplayName } from '@/lib/utils/generate-truefalse-items';
import { TrueFalseQuestionCard } from '@/components/TrueFalseQuestionCard';
import { learningAnalytics } from '@/lib/analytics';

function TrueFalseQuizContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const lawParam = searchParams.get('law');
  const countParam = searchParams.get('count');

  // 型安全な法令パラメータの検証
  const isValidLaw = (law: string | null): law is 'takkengyouhou' | 'minpou' | 'hourei' | 'zeihou' => {
    return law !== null && ['takkengyouhou', 'minpou', 'hourei', 'zeihou'].includes(law);
  };

  const law = isValidLaw(lawParam) ? lawParam : null;
  const count = countParam ? Math.max(1, Math.min(100, parseInt(countParam) || 10)) : 10;

  const [quizState, setQuizState] = useState<TrueFalseQuizState>({
    items: [],
    currentIndex: 0,
    selectedAnswer: null,
    showExplanation: false,
    answers: [],
    isComplete: false,
    startTime: null,
    law: law || 'takkengyouhou'
  });

  const [results, setResults] = useState<TrueFalseQuizResults | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // クイズ初期化
  useEffect(() => {
    const initializeQuiz = async () => {
      try {
        setIsLoading(true);
        setError(null);

        if (!law) {
          router.push('/truefalse');
          return;
        }

        const items = getTFQuizSet(law, count);
        
        if (items.length === 0) {
          setError(`${getLawDisplayName(law)}の問題データが見つかりません。他のカテゴリをお試しください。`);
          return;
        }

        setQuizState(prev => ({
          ...prev,
          items,
          law: law!,
          startTime: new Date()
        }));
      } catch (err) {
        console.error('Quiz initialization error:', err);
        setError('問題の読み込み中にエラーが発生しました。ページを再読み込みしてください。');
      } finally {
        setIsLoading(false);
      }
    };

    initializeQuiz();
  }, [law, count, router]);

  // 回答処理
  const handleAnswer = (answer: boolean) => {
    const currentItem = quizState.items[quizState.currentIndex];
    const isCorrect = answer === currentItem.answer;

    // 分析イベント送信（簡易版）
    console.log('TrueFalse Answer:', {
      law,
      itemId: currentItem.id,
      correct: isCorrect,
      timeMs: Date.now() - (quizState.startTime?.getTime() || 0),
      sourceType: currentItem.source.type
    });

    setQuizState(prev => ({
      ...prev,
      selectedAnswer: answer,
      showExplanation: true,
      answers: [...prev.answers, isCorrect]
    }));
  };

  // 次の問題へ
  const handleNext = () => {
    const nextIndex = quizState.currentIndex + 1;
    
    if (nextIndex >= quizState.items.length) {
      // クイズ完了
      const correctCount = quizState.answers.filter(Boolean).length + 
        (quizState.selectedAnswer === quizState.items[quizState.currentIndex].answer ? 1 : 0);
      const totalQuestions = quizState.items.length;
      const score = Math.round((correctCount / totalQuestions) * 100);
      const timeSpent = quizState.startTime 
        ? Math.round((Date.now() - quizState.startTime.getTime()) / 1000)
        : 0;
      const xpEarned = correctCount * 10;

      const finalResults: TrueFalseQuizResults = {
        correctCount,
        totalQuestions,
        score,
        timeSpent,
        law: law!,
        xpEarned
      };

      // 完了イベント送信（簡易版）
      console.log('TrueFalse Completed:', {
        law,
        correctCount,
        totalQuestions,
        score,
        timeSpent,
        xpEarned
      });

      setResults(finalResults);
      setQuizState(prev => ({ ...prev, isComplete: true }));
    } else {
      // 次の問題へ
      setQuizState(prev => ({
        ...prev,
        currentIndex: nextIndex,
        selectedAnswer: null,
        showExplanation: false
      }));
    }
  };

  // 再挑戦
  const handleRetry = () => {
    if (!law) return;
    
    const items = getTFQuizSet(law, count);
    setQuizState({
      items,
      currentIndex: 0,
      selectedAnswer: null,
      showExplanation: false,
      answers: [],
      isComplete: false,
      startTime: new Date(),
      law
    });
    setResults(null);
  };

  // 他のカテゴリへ
  const handleBackToSelection = () => {
    router.push('/truefalse');
  };

  // エラー状態の表示
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center bg-white rounded-xl shadow-lg p-8 max-w-md">
          <div className="text-red-600 text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-gray-800 mb-4">エラーが発生しました</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <div className="flex gap-4 justify-center">
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition-colors"
            >
              再読み込み
            </button>
            <button
              onClick={handleBackToSelection}
              className="px-6 py-3 bg-gray-600 text-white rounded-lg font-bold hover:bg-gray-700 transition-colors"
            >
              カテゴリ選択に戻る
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ローディング状態の表示
  if (isLoading || !law || quizState.items.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">問題を準備中...</p>
          {law && (
            <p className="text-sm text-gray-500 mt-2">
              {getLawDisplayName(law)}の問題を読み込んでいます
            </p>
          )}
        </div>
      </div>
    );
  }

  const currentItem = quizState.items[quizState.currentIndex];
  const progress = ((quizState.currentIndex + (quizState.showExplanation ? 1 : 0)) / quizState.items.length) * 100;
  const correctCount = quizState.answers.filter(Boolean).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {!quizState.isComplete ? (
          <>
            {/* ヘッダー */}
            <div className="text-center mb-6">
              <h1 className="text-2xl font-bold text-gray-800 mb-2">
                {getLawDisplayName(law)} ○×問題
              </h1>
              <div className="text-sm text-gray-600">
                問題 {quizState.currentIndex + 1} / {quizState.items.length}
                {quizState.answers.length > 0 && (
                  <span className="ml-4">
                    正答率: {Math.round((correctCount / quizState.answers.length) * 100)}%
                  </span>
                )}
              </div>
            </div>

            {/* 進捗バー */}
            <div className="mb-6">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>

            {/* 問題カード */}
            <TrueFalseQuestionCard
              item={currentItem}
              onAnswer={handleAnswer}
              showResult={quizState.showExplanation}
              userAnswer={quizState.selectedAnswer}
            />

            {/* 次へボタン */}
            {quizState.showExplanation && (
              <div className="text-center mt-6">
                <button
                  onClick={handleNext}
                  className="px-8 py-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition-colors"
                >
                  {quizState.currentIndex + 1 >= quizState.items.length ? '結果を見る' : '次の問題へ'}
                </button>
              </div>
            )}
          </>
        ) : (
          /* 結果画面 */
          <div className="text-center">
            <div className="bg-white rounded-xl shadow-lg p-8 mb-6">
              <h1 className="text-3xl font-bold text-gray-800 mb-4">
                お疲れさまでした！
              </h1>
              
              {results && (
                <>
                  <div className="text-6xl font-bold mb-4">
                    <span className={
                      results.score >= 80 ? 'text-green-600' :
                      results.score >= 60 ? 'text-yellow-600' : 'text-red-600'
                    }>
                      {results.score}点
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-blue-50 rounded-lg p-4">
                      <div className="text-2xl font-bold text-blue-600">
                        {results.correctCount}
                      </div>
                      <div className="text-sm text-gray-600">正解数</div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="text-2xl font-bold text-gray-600">
                        {results.totalQuestions}
                      </div>
                      <div className="text-sm text-gray-600">総問題数</div>
                    </div>
                    <div className="bg-green-50 rounded-lg p-4">
                      <div className="text-2xl font-bold text-green-600">
                        {Math.floor(results.timeSpent / 60)}:{String(results.timeSpent % 60).padStart(2, '0')}
                      </div>
                      <div className="text-sm text-gray-600">所要時間</div>
                    </div>
                    <div className="bg-yellow-50 rounded-lg p-4">
                      <div className="text-2xl font-bold text-yellow-600">
                        {results.xpEarned}
                      </div>
                      <div className="text-sm text-gray-600">獲得XP</div>
                    </div>
                  </div>

                  <div className="text-lg text-gray-700 mb-6">
                    {getLawDisplayName(law)}の○×問題
                  </div>
                </>
              )}

              <div className="flex gap-4 justify-center">
                <button
                  onClick={handleRetry}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition-colors"
                >
                  もう一度挑戦
                </button>
                <button
                  onClick={handleBackToSelection}
                  className="px-6 py-3 bg-gray-600 text-white rounded-lg font-bold hover:bg-gray-700 transition-colors"
                >
                  他のカテゴリへ
                </button>
                <button
                  onClick={() => router.push('/')}
                  className="px-6 py-3 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 transition-colors"
                >
                  🏠 トップページに戻る
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function TrueFalseQuizPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
          <div className="text-2xl font-bold text-gray-600">Loading...</div>
        </div>
      }
    >
      <TrueFalseQuizContent />
    </Suspense>
  );
}
