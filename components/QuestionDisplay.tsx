'use client';

import React from 'react';
import { formatQuestionText } from '@/lib/text-utils';

interface QuestionDisplayProps {
  question: string;
  className?: string;
}

const QuestionDisplay: React.FC<QuestionDisplayProps> = ({
  question,
  className = ''
}) => {
  // 問題文を改行処理
  const formattedQuestion = formatQuestionText(question);

  return (
    <div className={`question-text text-gray-800 ${className}`}>
      <div 
        dangerouslySetInnerHTML={{ 
          __html: formattedQuestion.replace(/\n/g, '<br />') 
        }}
      />
    </div>
  );
};

export default QuestionDisplay;
