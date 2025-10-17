/**
 * 法令上の制限 - AI生成問題のみ使用
 * 著作権問題を解決するため、過去問ベースの問題を削除
 */
import { Question } from "@/lib/types/quiz";
import { houreiNewQuestions as houreiAIGenerated1 } from "./ai-generated-1";
import { houreiNewQuestions as houreiAIGenerated2 } from "./ai-generated-2";

export const houreiQuestions: Question[] = [
  ...houreiAIGenerated1,
  ...houreiAIGenerated2,
];

// 難易度別の問題数統計
export const houreiStats = {
  total: houreiQuestions.length,
  basic: houreiQuestions.filter((q) => q.difficulty === "基礎").length,
  standard: houreiQuestions.filter((q) => q.difficulty === "標準").length,
  advanced: houreiQuestions.filter((q) => q.difficulty === "応用").length,
};

// 年度別の問題数統計
export const houreiByYear = houreiQuestions.reduce((acc, question) => {
  acc[question.year] = (acc[question.year] || 0) + 1;
  return acc;
}, {} as Record<string, number>);
