/**
 * 税・その他 - AI生成問題のみ使用
 * 著作権問題を解決するため、過去問ベースの問題を削除
 */
import { Question } from "@/lib/types/quiz";
import { zeihouNewQuestions as zeihouAIGenerated1 } from "./ai-generated-1";
import { zeihouNewQuestions as zeihouAIGenerated2 } from "./ai-generated-2";

export const zeihouQuestions: Question[] = [
  ...zeihouAIGenerated1,
  ...zeihouAIGenerated2,
];

// 難易度別の問題数統計
export const zeihouStats = {
  total: zeihouQuestions.length,
  basic: zeihouQuestions.filter((q) => q.difficulty === "基礎").length,
  standard: zeihouQuestions.filter((q) => q.difficulty === "標準").length,
  advanced: zeihouQuestions.filter((q) => q.difficulty === "応用").length,
};

// 年度別の問題数統計
export const zeihouByYear = zeihouQuestions.reduce((acc, question) => {
  acc[question.year] = (acc[question.year] || 0) + 1;
  return acc;
}, {} as Record<string, number>);
