/**
 * 税・その他 - AI生成問題のみ使用
 * 著作権問題を解決するため、過去問ベースの問題を削除
 */
import { Question } from "@/lib/types/quiz";
import { preparePublishedQuestions } from "../../../question-quality/prepare";
import { zeihouNewQuestions as zeihouAIGenerated1 } from "./ai-generated-1";
import { zeihouNewQuestions as zeihouAIGenerated2 } from "./ai-generated-2";
import { zeihouAdditionalQuestions_20241026 } from "./additional-20241026";
import { zeihouAdditionalQuestions_20241219 } from "./additional-20241219";
import { zeihouAdditionalQuestions_20251101_batch1 } from "./additional-2025-11-01-batch1";
import { zeihouAdditionalQuestions_20251101_batch2 } from "./additional-2025-11-01-batch2";
import { zeihouAdditionalQuestions_20251101_batch3 } from "./additional-2025-11-01-batch3";
import { zeihouAdditionalQuestions_20251101_batch4 } from "./additional-2025-11-01-batch4";
import { zeiTrendAIQuestions } from "./trend-ai";
import { zeihouPred_00 } from "./prediction/不動産取得税_基礎";
import { zeihouPred_01 } from "./prediction/不動産取得税_応用";
import { zeihouPred_02 } from "./prediction/不動産取得税_標準";
import { zeihouPred_03 } from "./prediction/不動産登記法_基礎";
import { zeihouPred_04 } from "./prediction/不動産登記法_応用";
import { zeihouPred_05 } from "./prediction/不動産登記法_標準";
import { zeihouPred_06 } from "./prediction/不動産鑑定評価基準_基礎";
import { zeihouPred_07 } from "./prediction/不動産鑑定評価基準_応用";
import { zeihouPred_08 } from "./prediction/不動産鑑定評価基準_標準";
import { zeihouPred_09 } from "./prediction/印紙税_基礎";
import { zeihouPred_10 } from "./prediction/印紙税_応用";
import { zeihouPred_11 } from "./prediction/印紙税_標準";
import { zeihouPred_12 } from "./prediction/固定資産税_基礎";
import { zeihouPred_13 } from "./prediction/固定資産税_応用";
import { zeihouPred_14 } from "./prediction/固定資産税_標準";
import { zeihouPred_15 } from "./prediction/地価公示法_基礎";
import { zeihouPred_16 } from "./prediction/地価公示法_応用";
import { zeihouPred_17 } from "./prediction/地価公示法_標準";
import { zeihouPred_18 } from "./prediction/所得税_譲渡所得__基礎";
import { zeihouPred_19 } from "./prediction/所得税_譲渡所得__応用";
import { zeihouPred_20 } from "./prediction/所得税_譲渡所得__標準";
import { zeihouPred_21 } from "./prediction/登録免許税_基礎";
import { zeihouPred_22 } from "./prediction/登録免許税_応用";
import { zeihouPred_23 } from "./prediction/登録免許税_標準";
import { zeihouPred_b2 } from "./prediction/batch2_fill_60";
import { zeihouPred_b3 } from "./prediction/batch3_tax_40";

export const zeihouQuestions: Question[] = preparePublishedQuestions([
  ...zeihouAIGenerated1,
  ...zeihouAIGenerated2,
  ...zeihouAdditionalQuestions_20241026,
  ...zeihouAdditionalQuestions_20241219,
  ...zeihouAdditionalQuestions_20251101_batch1,
  ...zeihouAdditionalQuestions_20251101_batch2,
  ...zeihouAdditionalQuestions_20251101_batch3,
  ...zeihouAdditionalQuestions_20251101_batch4,
  ...zeiTrendAIQuestions,
  ...zeihouPred_00,
  ...zeihouPred_01,
  ...zeihouPred_02,
  ...zeihouPred_03,
  ...zeihouPred_04,
  ...zeihouPred_05,
  ...zeihouPred_06,
  ...zeihouPred_07,
  ...zeihouPred_08,
  ...zeihouPred_09,
  ...zeihouPred_10,
  ...zeihouPred_11,
  ...zeihouPred_12,
  ...zeihouPred_13,
  ...zeihouPred_14,
  ...zeihouPred_15,
  ...zeihouPred_16,
  ...zeihouPred_17,
  ...zeihouPred_18,
  ...zeihouPred_19,
  ...zeihouPred_20,
  ...zeihouPred_21,
  ...zeihouPred_22,
  ...zeihouPred_23,
  ...zeihouPred_b2,
  ...zeihouPred_b3,
]).questions;

export const zeihouStats = {
  total: zeihouQuestions.length,
  basic: zeihouQuestions.filter(q => q.difficulty === "基礎").length,
  standard: zeihouQuestions.filter(q => q.difficulty === "標準").length,
  advanced: zeihouQuestions.filter(q => q.difficulty === "応用").length,
};

export const zeihouByYear = zeihouQuestions.reduce((acc, question) => {
  acc[question.year] = (acc[question.year] || 0) + 1;
  return acc;
}, {} as Record<string, number>);
