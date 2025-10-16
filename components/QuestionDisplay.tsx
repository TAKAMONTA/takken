'use client';

import React from 'react';
import { formatQuestionText, sanitizeHtml } from '@/lib/text-utils';

interface QuestionDisplayProps {
  question: string;
  className?: string;
}

const QuestionDisplay: React.FC<QuestionDisplayProps> = ({
  question,
  className = ''
}) => {
  // 問題文を改行処理し、サニタイズ
  const formattedQuestion = formatQuestionText(question);
  const safeHtml = sanitizeHtml(formattedQuestion.replace(/\n/g, '<br />'));

  return (
    <div className={`question-text text-gray-800 ${className}`}>
      <div
        dangerouslySetInnerHTML={{
          __html: safeHtml
        }}
      />
    </div>
  );
};

export default QuestionDisplay;
