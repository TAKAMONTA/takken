'use client';

import { useState, useEffect } from 'react';
import { aiAnalyticsService, AnswerPattern } from '@/lib/ai-analytics';

interface AIRealTimeFeedbackProps {
  currentQuestion: any;
  userAnswer: string;
  timeSpent: number;
  previousAnswers: AnswerPattern[];
  onFeedbackReceived?: (feedback: any) => void;
  className?: string;
}

interface FeedbackData {
  encouragement: string;
  hint?: string;
  strategy?: string;
  confidence: number;
  type: 'positive' | 'neutral' | 'constructive';
}

export default function AIRealTimeFeedback({
  currentQuestion,
  userAnswer,
  timeSpent,
  previousAnswers,
  onFeedbackReceived,
  className = ''
}: AIRealTimeFeedbackProps) {
  const [feedback, setFeedback] = useState<FeedbackData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (userAnswer && currentQuestion) {
      generateFeedback();
    }
  }, [userAnswer, currentQuestion, timeSpent]);

  const generateFeedback = async () => {
    if (!userAnswer || !currentQuestion) return;

    setIsLoading(true);
    try {
      const aiResponse = await aiAnalyticsService.generateRealTimeFeedback(
        currentQuestion,
        userAnswer,
        timeSpent,
        previousAnswers
      );

      const feedbackData: FeedbackData = {
        ...aiResponse,
        type: determineFeedbackType(aiResponse, userAnswer, currentQuestion)
      };

      setFeedback(feedbackData);
      setIsVisible(true);
      
      if (onFeedbackReceived) {
        onFeedbackReceived(feedbackData);
      }
    } catch (error) {
      console.error('リアルタイムフィードバック生成エラー:', error);
      // フォールバックフィードバック
      setFeedback({
        encouragement: '解答お疲れ様でした！継続的な学習が大切です。',
        confidence: 0.5,
        type: 'neutral'
      });
      setIsVisible(true);
    } finally {
      setIsLoading(false);
    }
  };

  const determineFeedbackType = (
    response: any,
    userAnswer: string,
    question: any
  ): 'positive' | 'neutral' | 'constructive' => {
    const isCorrect = userAnswer === question.choices[question.correctAnswer - 1];
    
    if (isCorrect) return 'positive';
    if (response.hint || response.strategy) return 'constructive';
    return 'neutral';
  };

  const getFeedbackIcon = (type: string) => {
    switch (type) {
      case 'positive':
        return '🎉';
      case 'constructive':
        return '💡';
      default:
        return '📚';
    }
  };

  const getFeedbackColor = (type: string) => {
    switch (type) {
      case 'positive':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'constructive':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      default:
        return 'bg-blue-50 border-blue-200 text-blue-800';
    }
  };

  if (isLoading) {
    return (
      <div className={`${className} animate-pulse`}>
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
            <div className="flex-1">
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-3/4"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!feedback || !isVisible) return null;

  return (
    <div 
      className={`${className} transition-all duration-500 transform ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
      }`}
    >
      <div className={`rounded-lg border-2 p-4 ${getFeedbackColor(feedback.type)}`}>
        {/* ヘッダー */}
        <div className="flex items-center space-x-3 mb-3">
          <div className="text-2xl">{getFeedbackIcon(feedback.type)}</div>
          <div className="flex-1">
            <h3 className="font-semibold text-sm">AI学習コーチ</h3>
            <div className="flex items-center space-x-2 text-xs opacity-75">
              <span>信頼度: {Math.round(feedback.confidence * 100)}%</span>
              <span>•</span>
              <span>解答時間: {timeSpent}秒</span>
            </div>
          </div>
        </div>

        {/* メインフィードバック */}
        <div className="space-y-3">
          <div className="bg-white bg-opacity-50 rounded-md p-3">
            <p className="text-sm leading-relaxed">{feedback.encouragement}</p>
          </div>

          {/* ヒント */}
          {feedback.hint && (
            <div className="bg-white bg-opacity-50 rounded-md p-3">
              <div className="flex items-start space-x-2">
                <span className="text-lg">💡</span>
                <div>
                  <h4 className="font-medium text-sm mb-1">ヒント</h4>
                  <p className="text-sm">{feedback.hint}</p>
                </div>
              </div>
            </div>
          )}

          {/* 学習戦略 */}
          {feedback.strategy && (
            <div className="bg-white bg-opacity-50 rounded-md p-3">
              <div className="flex items-start space-x-2">
                <span className="text-lg">🎯</span>
                <div>
                  <h4 className="font-medium text-sm mb-1">学習戦略</h4>
                  <p className="text-sm">{feedback.strategy}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* アクションボタン */}
        <div className="mt-4 flex space-x-2">
          <button
            onClick={() => setIsVisible(false)}
            className="text-xs bg-white bg-opacity-50 hover:bg-opacity-75 px-3 py-1.5 rounded-md transition-colors"
          >
            閉じる
          </button>
          {feedback.type === 'constructive' && (
            <button
              onClick={() => {
                // 類似問題の提案などの追加アクション
                console.log('類似問題を提案');
              }}
              className="text-xs bg-white bg-opacity-50 hover:bg-opacity-75 px-3 py-1.5 rounded-md transition-colors"
            >
              類似問題
            </button>
          )}
        </div>

        {/* 信頼度インジケーター */}
        <div className="mt-3 pt-3 border-t border-white border-opacity-30">
          <div className="flex items-center justify-between text-xs opacity-75">
            <span>AI分析の信頼度</span>
            <div className="flex items-center space-x-1">
              <div className="w-16 h-1.5 bg-white bg-opacity-30 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-current transition-all duration-300"
                  style={{ width: `${feedback.confidence * 100}%` }}
                ></div>
              </div>
              <span>{Math.round(feedback.confidence * 100)}%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


// ユーティリティ関数
function getFeedbackColor(type: string): string {
  switch (type) {
    case 'positive':
      return 'bg-green-50 border-green-200 text-green-800';
    case 'constructive':
      return 'bg-yellow-50 border-yellow-200 text-yellow-800';
    default:
      return 'bg-blue-50 border-blue-200 text-blue-800';
  }
}
