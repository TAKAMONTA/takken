'use client';

import { useState, useEffect } from 'react';
import { TrueFalseItem } from '@/lib/types/quiz';
import ExplanationDisplay from './ExplanationDisplay';
import ArticleReference from './ArticleReference';

interface TrueFalseQuestionCardProps {
  item: TrueFalseItem;
  onAnswer: (answer: boolean) => void;
  showResult?: boolean;
  userAnswer?: boolean | null;
}

export function TrueFalseQuestionCard({
  item,
  onAnswer,
  showResult = false,
  userAnswer = null
}: TrueFalseQuestionCardProps) {
  const [selectedAnswer, setSelectedAnswer] = useState<boolean | null>(userAnswer);

  // 問題が変わったときに状態をリセット
  useEffect(() => {
    setSelectedAnswer(userAnswer);
  }, [item.id, userAnswer]);

  const handleAnswer = (answer: boolean) => {
    if (selectedAnswer !== null) return; // 既に回答済みの場合は無視
    setSelectedAnswer(answer);
    onAnswer(answer);
  };

  const isCorrect = (userAnswer ?? selectedAnswer) === item.answer;

  return (
    <div className="bg-white rounded-lg shadow-md p-6 max-w-2xl mx-auto">
      {/* 問題文 */}
      <div className="mb-6">
        <div className="text-sm text-gray-500 mb-2">
          {item.law === 'takkengyouhou' && '宅建業法'}
          {item.law === 'minpou' && '民法等'}
          {item.law === 'hourei' && '法令上の制限'}
          {item.law === 'zeihou' && '税・その他'}
          {item.source.topic && ` - ${item.source.topic}`}
        </div>
        <p className="text-lg leading-relaxed text-gray-800">
          {item.statement}
        </p>
      </div>

      {/* 回答ボタン */}
      {!showResult && (
        <div className="flex gap-4 justify-center mb-6">
          <button
            onClick={() => handleAnswer(true)}
            className={`px-8 py-4 rounded-lg font-bold text-lg transition-colors ${
              selectedAnswer === true
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-blue-50'
            }`}
            disabled={selectedAnswer !== null}
          >
            ○（正しい）
          </button>
          <button
            onClick={() => handleAnswer(false)}
            className={`px-8 py-4 rounded-lg font-bold text-lg transition-colors ${
              selectedAnswer === false
                ? 'bg-red-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-red-50'
            }`}
            disabled={selectedAnswer !== null}
          >
            ×（誤り）
          </button>
        </div>
      )}

      {/* 結果表示 */}
      {showResult && selectedAnswer !== null && (
        <div className="space-y-4">
          {/* 正誤判定 */}
          <div className={`p-4 rounded-lg text-center ${
            isCorrect 
              ? 'bg-green-50 border border-green-200' 
              : 'bg-red-50 border border-red-200'
          }`}>
            <div className={`text-xl font-bold ${
              isCorrect ? 'text-green-700' : 'text-red-700'
            }`}>
              {isCorrect ? '正解！' : '不正解'}
            </div>
            <div className="text-sm text-gray-600 mt-1">
              正解: {item.answer ? '○（正しい）' : '×（誤り）'}
            </div>
          </div>

          {/* 解説 */}
          {item.explanation && (
            <div className="bg-blue-50 rounded-lg p-4">
              <h4 className="font-bold text-sm text-blue-800 mb-2 flex items-center gap-2">
                📖 解説
              </h4>
              <div className="text-sm text-gray-700 leading-relaxed">
                {item.explanation}
              </div>
            </div>
          )}

          {/* 参考情報 */}
          {item.reference && (item.reference.law || item.reference.article) && (
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-bold text-sm text-gray-700 mb-2 flex items-center gap-2">
                📚 参考
              </h4>
              <div className="text-sm text-gray-600">
                {item.reference.law && <span>{item.reference.law}</span>}
                {item.reference.article && <span> {item.reference.article}</span>}
                {item.reference.url && (
                  <a 
                    href={item.reference.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 ml-2"
                  >
                    詳細 →
                  </a>
                )}
              </div>
            </div>
          )}

          {/* 出所情報 */}
          <div className="text-xs text-gray-500 border-t pt-2">
            出所: {item.source.type === 'mcq' ? '過去問' : '頻出テーマ'}
            {item.source.year && ` (${item.source.year}年度)`}
            {item.source.questionId && ` - 問題${item.source.questionId}`}
          </div>
        </div>
      )}
    </div>
  );
}
