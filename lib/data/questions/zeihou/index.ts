// 税・その他の問題データ
import { Question } from "@/lib/types/quiz";
import { zeihouR7Questions } from "./r7";
import { zeihouR6Questions } from "./r6";
import { zeihouR5Questions } from "./r5";
import { zeihouR3Questions } from "./r3";
import { zeihouNewQuestions } from "./new";
import { zeihouNewQuestions as zeihouNew2Questions } from "./new2";
import { zeihouNewQuestions as zeihouFixedAssetTaxQuestions } from "./fixed-asset-tax";

// 税・その他の問題データ（本番環境用）
export const zeihouQuestions: Question[] = [
  ...zeihouFixedAssetTaxQuestions,
  ...zeihouNew2Questions,
  ...zeihouNewQuestions,
  ...zeihouR7Questions,
  ...zeihouR6Questions,
  ...zeihouR5Questions,
  ...zeihouR3Questions,
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
