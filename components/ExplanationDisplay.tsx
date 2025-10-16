'use client';

import React from 'react';
import { splitIntoParagraphs, highlightAndSanitize } from '@/lib/text-utils';

interface ExplanationDisplayProps {
  explanation: string;
  isCorrect: boolean;
  correctAnswer: number;
  options: string[];
  className?: string;
}

const ExplanationDisplay: React.FC<ExplanationDisplayProps> = ({
  explanation,
  isCorrect,
  correctAnswer,
  options,
  className = ''
}) => {
  // 解説を段落に分割
  const paragraphs = splitIntoParagraphs(explanation);

  // 段落の種類を判定する関数
  const getParagraphType = (paragraph: string) => {
    if (paragraph.includes('【基本解説】')) return 'basic';
    if (paragraph.includes('【🎯 ここが引っ掛け！】')) return 'trap';
    if (paragraph.includes('【解法・思考プロセス】')) return 'process';
    if (paragraph.includes('【💡 記憶法・覚え方】')) return 'memory';
    if (paragraph.includes('【⚠️ 間違いやすいポイント】')) return 'warning';
    if (paragraph.includes('【📚 関連知識・発展学習】')) return 'related';
    return 'default';
  };

  // 段落のスタイルを取得する関数
  const getParagraphStyle = (type: string) => {
    switch (type) {
      case 'basic':
        return 'bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-lg';
      case 'trap':
        return 'bg-red-50 border-l-4 border-red-400 p-4 rounded-r-lg';
      case 'process':
        return 'bg-green-50 border-l-4 border-green-400 p-4 rounded-r-lg';
      case 'memory':
        return 'bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-lg';
      case 'warning':
        return 'bg-orange-50 border-l-4 border-orange-400 p-4 rounded-r-lg';
      case 'related':
        return 'bg-purple-50 border-l-4 border-purple-400 p-4 rounded-r-lg';
      default:
        return 'bg-gray-50 p-4 rounded-lg';
    }
  };

  // 見出しを抽出して装飾する関数
  const formatParagraphContent = (paragraph: string) => {
    // 見出しを抽出
    const headingMatch = paragraph.match(/【([^】]+)】/);
    if (headingMatch) {
      const heading = headingMatch[1];
      const content = paragraph.replace(/【[^】]+】\n?/, '').trim();

      return (
        <div>
          <h4 className="font-bold text-sm mb-3 flex items-center gap-2">
            {getHeadingIcon(heading)}
            <span>{heading}</span>
          </h4>
          <div
            className="explanation-text text-gray-700 leading-relaxed"
            dangerouslySetInnerHTML={{
              __html: highlightAndSanitize(content).replace(/\n/g, '<br />')
            }}
          />
        </div>
      );
    }

    return (
      <div
        className="explanation-text text-gray-700 leading-relaxed"
        dangerouslySetInnerHTML={{
          __html: highlightAndSanitize(paragraph).replace(/\n/g, '<br />')
        }}
      />
    );
  };

  // 見出しに対応するアイコンを取得する関数
  const getHeadingIcon = (heading: string) => {
    if (heading.includes('基本解説')) return '📖';
    if (heading.includes('引っ掛け')) return '🎯';
    if (heading.includes('思考プロセス')) return '🧠';
    if (heading.includes('記憶法') || heading.includes('覚え方')) return '💡';
    if (heading.includes('間違いやすい')) return '⚠️';
    if (heading.includes('関連知識') || heading.includes('発展学習')) return '📚';
    return '📝';
  };

  return (
    <div className={`bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-500 rounded-lg p-5 shadow-sm ${className}`}>
      {/* ヘッダー */}
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
          <span className="text-white text-sm font-bold">解</span>
        </div>
        <h3 className="font-bold text-lg text-gray-800">詳しい解説</h3>
      </div>
      
      {/* 正解・不正解の表示 */}
      <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-bold mb-4 ${
        isCorrect
          ? 'bg-green-100 text-green-800'
          : 'bg-red-100 text-red-800'
      }`}>
        {isCorrect ? (
          <>
            <span className="text-green-600">✓</span>
            正解です！
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
          {correctAnswer + 1}. {options[correctAnswer]}
        </div>
      </div>

      {/* 構造化された解説 */}
      <div className="space-y-4">
        {paragraphs.map((paragraph, index) => {
          const type = getParagraphType(paragraph);
          const style = getParagraphStyle(type);
          
          return (
            <div key={index} className={style}>
              {formatParagraphContent(paragraph)}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ExplanationDisplay;
