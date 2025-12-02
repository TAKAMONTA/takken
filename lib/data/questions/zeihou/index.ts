/**
 * 税・その他 - AI生成問題のみ使用
 * 著作権問題を解決するため、過去問ベースの問題を削除
 */
import { Question } from "@/lib/types/quiz";
import { zeihouNewQuestions as zeihouAIGenerated1 } from "./ai-generated-1";
import { zeihouNewQuestions as zeihouAIGenerated2 } from "./ai-generated-2";
import { zeihouAdditionalQuestions_20241026 } from "./additional-20241026";
import { zeihouAdditionalQuestions_20241219 } from "./additional-20241219";
import { zeihouAdditionalQuestions_20251101_batch1 } from "./additional-2025-11-01-batch1";
import { zeihouAdditionalQuestions_20251101_batch2 } from "./additional-2025-11-01-batch2";
import { zeihouAdditionalQuestions_20251101_batch3 } from "./additional-2025-11-01-batch3";
import { zeihouAdditionalQuestions_20251101_batch4 } from "./additional-2025-11-01-batch4";

export const zeihouQuestions: Question[] = [
  ...zeihouAIGenerated1,
  ...zeihouAIGenerated2,
  // 追加問題
  ...zeihouAdditionalQuestions_20241026,
  ...zeihouAdditionalQuestions_20241219,
  ...zeihouAdditionalQuestions_20251101_batch1,
  ...zeihouAdditionalQuestions_20251101_batch2,
  ...zeihouAdditionalQuestions_20251101_batch3,
  ...zeihouAdditionalQuestions_20251101_batch4,
];

// 難易度別の問題数統計
export const zeihouStats = {
  total: zeihouQuestions.length,
  basic: zeihouQuestions.filter(q => q.difficulty === "基礎").length,
  standard: zeihouQuestions.filter(q => q.difficulty === "標準").length,
  advanced: zeihouQuestions.filter(q => q.difficulty === "応用").length,
};

// 年度別の問題数統計
export const zeihouByYear = zeihouQuestions.reduce((acc, question) => {
  acc[question.year] = (acc[question.year] || 0) + 1;
  return acc;
}, {} as Record<string, number>);
