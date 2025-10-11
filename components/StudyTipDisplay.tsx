'use client';

import { useState } from 'react';
import { StudyTip } from '@/lib/types/quiz';

interface StudyTipDisplayProps {
  studyTips: StudyTip[];
  className?: string;
}

export default function StudyTipDisplay({ studyTips, className = '' }: StudyTipDisplayProps) {
  const [selectedTip, setSelectedTip] = useState<StudyTip | null>(null);

  if (!studyTips || studyTips.length === 0) {
    return null;
  }

  const getTypeColor = (type: StudyTip['type']) => {
    switch (type) {
      case 'memory':
        return 'bg-purple-50 border-purple-200 text-purple-800';
      case 'understanding':
        return 'bg-orange-50 border-orange-200 text-orange-800';
      case 'application':
        return 'bg-teal-50 border-teal-200 text-teal-800';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  const getTypeLabel = (type: StudyTip['type']) => {
    switch (type) {
      case 'memory':
        return '記憶のコツ';
      case 'understanding':
        return '理解のポイント';
      case 'application':
        return '応用のヒント';
      default:
        return '学習のコツ';
    }
  };

  const getTypeIcon = (type: StudyTip['type']) => {
    switch (type) {
      case 'memory':
        return '🧠';
      case 'understanding':
        return '💡';
      case 'application':
        return '🎯';
      default:
        return '📝';
    }
  };

  return (
    <div className={`bg-purple-50 rounded-lg p-4 ${className}`}>
      <h3 className="font-bold text-sm text-purple-800 mb-3 flex items-center gap-2">
        ✨ 学習のコツ
      </h3>
      <div className="space-y-2">
        {studyTips.map((tip, index) => (
          <button
            key={index}
            onClick={() => setSelectedTip(tip)}
            className={`w-full text-left rounded-lg p-3 border transition-colors hover:shadow-sm ${getTypeColor(tip.type)}`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-lg">
                  {tip.icon || getTypeIcon(tip.type)}
                </span>
                <span className="text-sm font-medium">
                  {getTypeLabel(tip.type)}
                </span>
              </div>
              <div className="text-xs opacity-70">
                詳細 →
              </div>
            </div>
            <div className="text-xs mt-1 opacity-80 line-clamp-2">
              {tip.content.length > 50 ? `${tip.content.substring(0, 50)}...` : tip.content}
            </div>
          </button>
        ))}
      </div>

      {/* 学習のコツ詳細ポップアップ */}
      {selectedTip && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-sm w-full shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                {selectedTip.icon || getTypeIcon(selectedTip.type)} {getTypeLabel(selectedTip.type)}
              </h3>
              <button
                onClick={() => setSelectedTip(null)}
                className="text-gray-400 hover:text-gray-600 text-xl"
              >
                ×
              </button>
            </div>
            
            <div className={`rounded-lg p-4 mb-4 ${getTypeColor(selectedTip.type)}`}>
              <div className="text-sm leading-relaxed">
                {selectedTip.content}
              </div>
            </div>

            <button
              onClick={() => setSelectedTip(null)}
              className="w-full bg-purple-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-purple-700 transition-colors"
            >
              参考になりました
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
