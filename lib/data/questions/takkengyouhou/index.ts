// 宅建業法の問題データ
import { Question } from "@/lib/types/quiz";
import { takkengyouhouR8Questions } from "./r8";
import { takkengyouhouR7Questions } from "./r7";
import { takkengyouhouR6Questions } from "./r6";
import { takkengyouhouR5Questions } from "./r5";
import { takkengyouhouR4Questions } from "./r4";
import { takkengyouhouR3Questions } from "./r3";
import { takkengyouhouNewQuestions } from "./new";
import { takkengyouhouNewQuestions as takkengyouhou35_37Questions } from "./35-37-articles";

// 宅建業法の問題データ（本番環境用）
export const takkengyouhouQuestions: Question[] = [
  ...takkengyouhou35_37Questions,
  ...takkengyouhouNewQuestions,
  ...takkengyouhouR8Questions,
  ...takkengyouhouR7Questions,
  ...takkengyouhouR6Questions,
  ...takkengyouhouR5Questions,
  ...takkengyouhouR4Questions,
  ...takkengyouhouR3Questions,
];

// 難易度別の問題数統計
export const takkengyouhouStats = {
  total: takkengyouhouQuestions.length,
  basic: takkengyouhouQuestions.filter((q) => q.difficulty === "基礎").length,
  standard: takkengyouhouQuestions.filter((q) => q.difficulty === "標準")
    .length,
  advanced: takkengyouhouQuestions.filter((q) => q.difficulty === "応用")
    .length,
};

// 年度別の問題数統計
export const takkengyouhouByYear = takkengyouhouQuestions.reduce(
  (acc, question) => {
    acc[question.year] = (acc[question.year] || 0) + 1;
    return acc;
  },
  {} as Record<string, number>
);
