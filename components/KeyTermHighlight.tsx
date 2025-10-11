'use client';

import { useState } from 'react';
import { KeyTerm } from '@/lib/types/quiz';

interface KeyTermHighlightProps {
  text: string;
  keyTerms: KeyTerm[];
  className?: string;
}

export default function KeyTermHighlight({ text, keyTerms, className = '' }: KeyTermHighlightProps) {
  const [selectedTerm, setSelectedTerm] = useState<KeyTerm | null>(null);

  // テキスト内の重要語句をハイライト表示するための処理
  const highlightText = (text: string, keyTerms: KeyTerm[]) => {
    if (!keyTerms || keyTerms.length === 0) {
      return <span>{text}</span>;
    }

    let highlightedText = text;
    const termPositions: Array<{ start: number; end: number; term: KeyTerm }> = [];

    // 各重要語句の位置を特定
    keyTerms.forEach(keyTerm => {
      const regex = new RegExp(keyTerm.term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
      let match;
      while ((match = regex.exec(text)) !== null) {
        termPositions.push({
          start: match.index,
          end: match.index + match[0].length,
          term: keyTerm
        });
      }
    });

    // 位置でソート（重複を避けるため）
    termPositions.sort((a, b) => a.start - b.start);

    // 重複する範囲を除去
    const filteredPositions = termPositions.filter((pos, index) => {
      if (index === 0) return true;
      const prevPos = termPositions[index - 1];
      return pos.start >= prevPos.end;
    });

    if (filteredPositions.length === 0) {
      return <span>{text}</span>;
    }

    const elements = [];
    let lastIndex = 0;

    filteredPositions.forEach((pos, index) => {
      // ハイライト前のテキスト
      if (pos.start > lastIndex) {
        elements.push(
          <span key={`text-${index}`}>
            {text.substring(lastIndex, pos.start)}
          </span>
        );
      }

      // ハイライトされた重要語句
      elements.push(
        <button
          key={`term-${index}`}
          className="relative inline-block bg-yellow-100 border-b-2 border-yellow-400 px-1 rounded-sm hover:bg-yellow-200 transition-colors cursor-pointer font-medium text-blue-700"
          onClick={() => setSelectedTerm(pos.term)}
          title={`クリックして「${pos.term.term}」の説明を見る`}
        >
          {text.substring(pos.start, pos.end)}
        </button>
      );

      lastIndex = pos.end;
    });

    // 最後の部分のテキスト
    if (lastIndex < text.length) {
      elements.push(
        <span key="text-final">
          {text.substring(lastIndex)}
        </span>
      );
    }

    return <>{elements}</>;
  };

  return (
    <div className={`relative ${className}`}>
      <div className="leading-relaxed">
        {highlightText(text, keyTerms)}
      </div>

      {/* 重要語句の説明ポップアップ */}
      {selectedTerm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-sm w-full shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                📚 {selectedTerm.term}
              </h3>
              <button
                onClick={() => setSelectedTerm(null)}
                className="text-gray-400 hover:text-gray-600 text-xl"
              >
                ×
              </button>
            </div>
            <div className="text-sm text-gray-700 leading-relaxed mb-4">
              {selectedTerm.definition}
            </div>
            <button
              onClick={() => setSelectedTerm(null)}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              理解しました
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
