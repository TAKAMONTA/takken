/**
 * 宅建業法 - AI生成問題のみ使用
 * 著作権問題を解決するため、過去問ベースの問題を削除
 *
 * 変更履歴:
 * - 2025-10-17: 著作権リスクのある過去問ファイルを削除
 * - AI生成問題のみを使用するように変更
 */

import { Question } from "@/lib/types/quiz";

// AI生成問題をインポート
import { takkengyouhouNewQuestions as takkengyouhouAIGenerated1 } from "./ai-generated-1";
import { takkengyouhouNewQuestions as takkengyouhouAIGenerated2 } from "./ai-generated-2";

// AI生成問題のみを使用（著作権フリー）
export const takkengyouhouQuestions: Question[] = [
  ...takkengyouhouAIGenerated1,
  ...takkengyouhouAIGenerated2,
];

// 難易度別の問題数統計
export const takkengyouhouStats = {
  total: takkengyouhouQuestions.length,
  basic: takkengyouhouQuestions.filter((q) => q.difficulty === "基礎").length,
  standard: takkengyouhouQuestions.filter((q) => q.difficulty === "標準").length,
  advanced: takkengyouhouQuestions.filter((q) => q.difficulty === "応用").length,
};

// 年度別の問題数統計
export const takkengyouhouByYear = takkengyouhouQuestions.reduce(
  (acc, question) => {
    acc[question.year] = (acc[question.year] || 0) + 1;
    return acc;
  },
  {} as Record<string, number>
);

// デフォルトエクスポート
export default takkengyouhouQuestions;
