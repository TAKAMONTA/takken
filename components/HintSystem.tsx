'use client';

import { useState } from 'react';

interface HintSystemProps {
  hints: string[];
  className?: string;
  onHintUsed?: (hintIndex: number) => void;
}

export default function HintSystem({ hints, className = '', onHintUsed }: HintSystemProps) {
  const [currentHintIndex, setCurrentHintIndex] = useState(-1);
  const [showHintModal, setShowHintModal] = useState(false);

  if (!hints || hints.length === 0) {
    return null;
  }

  const showNextHint = () => {
    const nextIndex = currentHintIndex + 1;
    if (nextIndex < hints.length) {
      setCurrentHintIndex(nextIndex);
      setShowHintModal(true);
      onHintUsed?.(nextIndex);
    }
  };

  const hasMoreHints = currentHintIndex < hints.length - 1;
  const hasUsedHints = currentHintIndex >= 0;

  return (
    <div className={`bg-green-50 rounded-lg p-4 ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-bold text-sm text-green-800 flex items-center gap-2">
          💡 ヒント ({currentHintIndex + 1}/{hints.length})
        </h3>
        {hasMoreHints && (
          <button
            onClick={showNextHint}
            className="bg-green-600 text-white px-3 py-1 rounded-lg text-xs font-medium hover:bg-green-700 transition-colors"
          >
            ヒントを見る
          </button>
        )}
      </div>

      {hasUsedHints && (
        <div className="space-y-2">
          {hints.slice(0, currentHintIndex + 1).map((hint, index) => (
            <div
              key={index}
              className="bg-white rounded-lg p-3 border border-green-200"
            >
              <div className="flex items-start gap-2">
                <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded font-medium min-w-fit">
                  ヒント{index + 1}
                </span>
                <div className="text-sm text-gray-700 leading-relaxed">
                  {hint}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {!hasUsedHints && (
        <div className="text-sm text-green-700">
          困ったときはヒントボタンを押してください。段階的にヒントを表示します。
        </div>
      )}

      {!hasMoreHints && hasUsedHints && (
        <div className="text-xs text-green-600 mt-2 text-center">
          すべてのヒントを表示しました
        </div>
      )}

      {/* ヒント表示モーダル */}
      {showHintModal && currentHintIndex >= 0 && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-sm w-full shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                💡 ヒント {currentHintIndex + 1}
              </h3>
              <button
                onClick={() => setShowHintModal(false)}
                className="text-gray-400 hover:text-gray-600 text-xl"
              >
                ×
              </button>
            </div>
            
            <div className="bg-green-50 rounded-lg p-4 mb-4">
              <div className="text-sm text-gray-800 leading-relaxed">
                {hints[currentHintIndex]}
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowHintModal(false)}
                className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-green-700 transition-colors"
              >
                理解しました
              </button>
              {hasMoreHints && (
                <button
                  onClick={() => {
                    setShowHintModal(false);
                    setTimeout(() => showNextHint(), 100);
                  }}
                  className="flex-1 bg-gray-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-gray-700 transition-colors"
                >
                  次のヒント
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
