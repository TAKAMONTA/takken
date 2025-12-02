/**
 * 法令上の制限 - AI生成問題のみ使用
 * 著作権問題を解決するため、過去問ベースの問題を削除
 */
import { Question } from "@/lib/types/quiz";
import { houreiNewQuestions as houreiAIGenerated1 } from "./ai-generated-1";
import { houreiNewQuestions as houreiAIGenerated2 } from "./ai-generated-2";
import { houreiAdditionalQuestions_20241026 } from "./additional-20241026";
import { houreiAdditionalQuestions_20241219 } from "./additional-20241219";
import { houreiAdditionalQuestions_20251101_batch1 } from "./additional-2025-11-01-batch1";
import { houreiAdditionalQuestions_20251101_batch2 } from "./additional-2025-11-01-batch2";
import { houreiAdditionalQuestions_20251101_batch3 } from "./additional-2025-11-01-batch3";
import { houreiAdditionalQuestions_20251101_batch4 } from "./additional-2025-11-01-batch4";
import { houreiAdditionalQuestions_20251101_batch5 } from "./additional-2025-11-01-batch5";

export const houreiQuestions: Question[] = [
  ...houreiAIGenerated1,
  ...houreiAIGenerated2,
  // 追加問題
  ...houreiAdditionalQuestions_20241026,
  ...houreiAdditionalQuestions_20241219,
  ...houreiAdditionalQuestions_20251101_batch1,
  ...houreiAdditionalQuestions_20251101_batch2,
  ...houreiAdditionalQuestions_20251101_batch3,
  ...houreiAdditionalQuestions_20251101_batch4,
  ...houreiAdditionalQuestions_20251101_batch5,
];

// 難易度別の問題数統計
export const houreiStats = {
  total: houreiQuestions.length,
  basic: houreiQuestions.filter(q => q.difficulty === "基礎").length,
  standard: houreiQuestions.filter(q => q.difficulty === "標準").length,
  advanced: houreiQuestions.filter(q => q.difficulty === "応用").length,
};

// 年度別の問題数統計
export const houreiByYear = houreiQuestions.reduce((acc, question) => {
  acc[question.year] = (acc[question.year] || 0) + 1;
  return acc;
}, {} as Record<string, number>);
