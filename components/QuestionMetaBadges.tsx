"use client";

import type { Question } from "@/lib/types/quiz";

interface QuestionMetaBadgesProps {
  question: Partial<Question> & {
    weakness?: string;
  };
  compact?: boolean;
  className?: string;
}

function getSourceLabel(source?: string): string {
  if (!source) return "AI生成問題";
  if (source.includes("AI") || source.includes("生成")) return source;
  return source;
}

function getReliabilityLabel(question: QuestionMetaBadgesProps["question"]): string {
  if (question.relatedArticles && question.relatedArticles.length > 0) {
    return "条文情報あり";
  }
  if (question.source?.includes("過去問")) {
    return "過去問由来";
  }
  return "AI生成";
}

function getFrequencyLabel(question: QuestionMetaBadgesProps["question"]): string | null {
  const grade = question.grade || question.frequency;
  if (!grade) return null;

  const labels = {
    A: "高頻出",
    B: "中頻出",
    C: "低頻出",
  };

  return labels[grade];
}

export default function QuestionMetaBadges({
  question,
  compact = false,
  className = "",
}: QuestionMetaBadgesProps) {
  const frequencyLabel = getFrequencyLabel(question);
  const badgeClass = compact
    ? "rounded px-2 py-0.5 text-[11px]"
    : "rounded-md px-2.5 py-1 text-xs";

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex flex-wrap items-center gap-2">
        {question.category && (
          <span className={`${badgeClass} bg-blue-50 text-blue-700 border border-blue-100`}>
            {question.category}
          </span>
        )}
        {question.difficulty && (
          <span className={`${badgeClass} bg-slate-50 text-slate-700 border border-slate-200`}>
            {question.difficulty}
          </span>
        )}
        {question.topic && (
          <span className={`${badgeClass} bg-emerald-50 text-emerald-700 border border-emerald-100`}>
            論点: {question.topic}
          </span>
        )}
        {frequencyLabel && (
          <span className={`${badgeClass} bg-amber-50 text-amber-700 border border-amber-100`}>
            {frequencyLabel}
            {typeof question.frequencyCount === "number" ? ` ${question.frequencyCount}回` : ""}
          </span>
        )}
        {question.year && (
          <span className={`${badgeClass} bg-gray-50 text-gray-600 border border-gray-200`}>
            {question.year}
          </span>
        )}
      </div>

      {!compact && (
        <div className="flex flex-wrap items-center gap-2 text-[11px] text-gray-500">
          <span>{getSourceLabel(question.source)}</span>
          <span>•</span>
          <span>{getReliabilityLabel(question)}</span>
          {question.relatedArticles && question.relatedArticles.length > 0 && (
            <>
              <span>•</span>
              <span>関連条文 {question.relatedArticles.length}件</span>
            </>
          )}
        </div>
      )}
    </div>
  );
}
