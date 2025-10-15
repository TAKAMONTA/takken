// 法令上の制限の問題データ
import { Question } from "@/lib/types/quiz";
import { houreiR7Questions } from "./r7";
import { houreiR6Questions } from "./r6";
import { houreiR5Questions } from "./r5";
import { houreiR3Questions } from "./r3";
import { houreiNewQuestions } from "./new";
import { houreiNewQuestions as houreiNew2Questions } from "./new2";
import { houreiNewQuestions as houreiAIGenerated1 } from "./ai-generated-1";
import { houreiNewQuestions as houreiAIGenerated2 } from "./ai-generated-2";

// 法令上の制限の問題データ（本番環境用）
export const houreiQuestions: Question[] = [
  ...houreiNew2Questions,
  ...houreiNewQuestions,
  ...houreiAIGenerated1,
  ...houreiAIGenerated2,
  ...houreiR7Questions,
  ...houreiR6Questions,
  ...houreiR5Questions,
  ...houreiR3Questions,
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
