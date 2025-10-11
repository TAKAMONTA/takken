'use client';

import React, { useState } from 'react';
import { QuestionItem } from '@/lib/data/frequency-questions';
import { getBlankCharacter } from '@/lib/utils/text-processing';

interface FrequencyQuestionCardProps {
  question: QuestionItem;
  index: number;
  categoryId: string;
}

const FrequencyQuestionCard: React.FC<FrequencyQuestionCardProps> = ({ 
  question, 
  index, 
  categoryId 
}) => {
  const [showAnswer, setShowAnswer] = useState(false);

  const renderTextWithBlanks = (text: string, values: string[], isAnswer: boolean) => {
    const elements: (string | JSX.Element)[] = [];
    let currentText = text;
    let elementKey = 0;

    values.forEach((value, i) => {
      const blankChar = getBlankCharacter(i);
      const blankPattern = `（ ${blankChar} ）`;
      const blankIndex = currentText.indexOf(blankPattern);

      if (blankIndex !== -1) {
        // 空欄の前のテキストを追加
        if (blankIndex > 0) {
          elements.push(currentText.substring(0, blankIndex));
        }

        // 空欄部分を追加
        elements.push(
          <span
            key={`blank-${elementKey++}`}
            className={`inline-block min-w-[3rem] text-center border-b-2 mx-1 px-2 py-1 transition-all duration-200 ${
              isAnswer
                ? 'border-solid border-purple-500 bg-purple-50 font-bold text-purple-700 rounded-sm'
                : 'border-dotted border-gray-400 text-gray-500'
            }`}
            role="textbox"
            aria-label={isAnswer ? `解答: ${value}` : `空欄${i + 1}`}
          >
            {isAnswer ? value : blankChar}
          </span>
        );

        // 残りのテキストを更新
        currentText = currentText.substring(blankIndex + blankPattern.length);
      }
    });

    // 最後の残りテキストを追加
    if (currentText.length > 0) {
      elements.push(currentText);
    }

    return <>{elements}</>;
  };

  return (
    <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200">
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-bold text-gray-800">問{index + 1}</h4>
        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
          {categoryId === 'takkengyouhou' ? '宅建業法' :
           categoryId === 'kenri' ? '権利関係' :
           categoryId === 'hourei' ? '法令制限' : '税・その他'}
        </span>
      </div>
      
      <div className="text-gray-700 text-base mb-4 question-text leading-relaxed">
        {renderTextWithBlanks(question.text, question.blanks, false)}
      </div>
      
      <button
        onClick={() => setShowAnswer(!showAnswer)}
        className="text-sm bg-purple-100 text-purple-700 px-4 py-2 rounded-lg font-medium hover:bg-purple-200 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
        aria-expanded={showAnswer}
        aria-controls={`answer-${index}`}
      >
        {showAnswer ? '解答を隠す' : '解答を見る'}
      </button>
      
      {showAnswer && (
        <div 
          id={`answer-${index}`}
          className="bg-purple-50 rounded-lg p-4 mt-3 animate-fadeIn border-l-4 border-purple-400"
          role="region"
          aria-label="解答表示エリア"
        >
          <div className="text-sm text-gray-600 mb-2 font-medium">【解答】</div>
          <div className="text-purple-800 font-bold text-base question-text leading-relaxed">
            {renderTextWithBlanks(question.text, question.answers, true)}
          </div>
        </div>
      )}
    </div>
  );
};

export default FrequencyQuestionCard;
