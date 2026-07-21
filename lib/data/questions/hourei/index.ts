/**
 * 法令上の制限 - AI生成問題のみ使用
 * 著作権問題を解決するため、過去問ベースの問題を削除
 */
import { Question } from "@/lib/types/quiz";
import { preparePublishedQuestions } from "../../../question-quality/prepare";
import { houreiNewQuestions as houreiAIGenerated1 } from "./ai-generated-1";
import { houreiNewQuestions as houreiAIGenerated2 } from "./ai-generated-2";
import { houreiAdditionalQuestions_20241026 } from "./additional-20241026";
import { houreiAdditionalQuestions_20241219 } from "./additional-20241219";
import { houreiAdditionalQuestions_20251101_batch1 } from "./additional-2025-11-01-batch1";
import { houreiAdditionalQuestions_20251101_batch2 } from "./additional-2025-11-01-batch2";
import { houreiAdditionalQuestions_20251101_batch3 } from "./additional-2025-11-01-batch3";
import { houreiAdditionalQuestions_20251101_batch4 } from "./additional-2025-11-01-batch4";
import { houreiAdditionalQuestions_20251101_batch5 } from "./additional-2025-11-01-batch5";
import { houreiTrendAIQuestions } from "./trend-ai";
import { houreiPred_00 } from "./prediction/国土利用計画法_基礎";
import { houreiPred_01 } from "./prediction/国土利用計画法_応用";
import { houreiPred_02 } from "./prediction/国土利用計画法_標準";
import { houreiPred_03 } from "./prediction/土地区画整理法_基礎";
import { houreiPred_04 } from "./prediction/土地区画整理法_応用";
import { houreiPred_05 } from "./prediction/土地区画整理法_標準";
import { houreiPred_06 } from "./prediction/宅地造成等規制法_基礎";
import { houreiPred_07 } from "./prediction/宅地造成等規制法_応用";
import { houreiPred_08 } from "./prediction/宅地造成等規制法_標準";
import { houreiPred_09 } from "./prediction/建築基準法_基本編__基礎";
import { houreiPred_10 } from "./prediction/建築基準法_基本編__応用";
import { houreiPred_11 } from "./prediction/建築基準法_基本編__標準";
import { houreiPred_12 } from "./prediction/建築基準法_集団規定__基礎";
import { houreiPred_13 } from "./prediction/建築基準法_集団規定__応用";
import { houreiPred_14 } from "./prediction/建築基準法_集団規定__標準";
import { houreiPred_15 } from "./prediction/農地法_基礎";
import { houreiPred_16 } from "./prediction/農地法_応用";
import { houreiPred_17 } from "./prediction/農地法_標準";
import { houreiPred_18 } from "./prediction/都市計画法_基礎";
import { houreiPred_19 } from "./prediction/都市計画法_応用";
import { houreiPred_20 } from "./prediction/都市計画法_標準";
import { houreiPred_21 } from "./prediction/国土利用計画法_基礎_b2";
import { houreiPred_22 } from "./prediction/国土利用計画法_応用_b2";
import { houreiPred_23 } from "./prediction/国土利用計画法_標準_b2";
import { houreiPred_24 } from "./prediction/土地区画整理法_基礎_b2";
import { houreiPred_25 } from "./prediction/土地区画整理法_応用_b2";
import { houreiPred_26 } from "./prediction/土地区画整理法_標準_b2";
import { houreiPred_27 } from "./prediction/宅地造成等規制法_基礎_b2";
import { houreiPred_28 } from "./prediction/宅地造成等規制法_応用_b2";
import { houreiPred_29 } from "./prediction/宅地造成等規制法_標準_b2";
import { houreiPred_30 } from "./prediction/建築基準法_基本編__基礎_b2";
import { houreiPred_31 } from "./prediction/建築基準法_基本編__応用_b2";
import { houreiPred_32 } from "./prediction/建築基準法_基本編__標準_b2";
import { houreiPred_33 } from "./prediction/建築基準法_集団規定__基礎_b2";
import { houreiPred_34 } from "./prediction/建築基準法_集団規定__応用_b2";
import { houreiPred_35 } from "./prediction/建築基準法_集団規定__標準_b2";
import { houreiPred_36 } from "./prediction/農地法_基礎_b2";
import { houreiPred_37 } from "./prediction/農地法_応用_b2";
import { houreiPred_38 } from "./prediction/農地法_標準_b2";
import { houreiPred_39 } from "./prediction/都市計画法_基礎_b2";
import { houreiPred_40 } from "./prediction/都市計画法_応用_b2";
import { houreiPred_41 } from "./prediction/都市計画法_標準_b2";

export const houreiQuestions: Question[] = preparePublishedQuestions([
  ...houreiAIGenerated1,
  ...houreiAIGenerated2,
  ...houreiAdditionalQuestions_20241026,
  ...houreiAdditionalQuestions_20241219,
  ...houreiAdditionalQuestions_20251101_batch1,
  ...houreiAdditionalQuestions_20251101_batch2,
  ...houreiAdditionalQuestions_20251101_batch3,
  ...houreiAdditionalQuestions_20251101_batch4,
  ...houreiAdditionalQuestions_20251101_batch5,
  ...houreiTrendAIQuestions,
  ...houreiPred_00,
  ...houreiPred_01,
  ...houreiPred_02,
  ...houreiPred_03,
  ...houreiPred_04,
  ...houreiPred_05,
  ...houreiPred_06,
  ...houreiPred_07,
  ...houreiPred_08,
  ...houreiPred_09,
  ...houreiPred_10,
  ...houreiPred_11,
  ...houreiPred_12,
  ...houreiPred_13,
  ...houreiPred_14,
  ...houreiPred_15,
  ...houreiPred_16,
  ...houreiPred_17,
  ...houreiPred_18,
  ...houreiPred_19,
  ...houreiPred_20,
  ...houreiPred_21,
  ...houreiPred_22,
  ...houreiPred_23,
  ...houreiPred_24,
  ...houreiPred_25,
  ...houreiPred_26,
  ...houreiPred_27,
  ...houreiPred_28,
  ...houreiPred_29,
  ...houreiPred_30,
  ...houreiPred_31,
  ...houreiPred_32,
  ...houreiPred_33,
  ...houreiPred_34,
  ...houreiPred_35,
  ...houreiPred_36,
  ...houreiPred_37,
  ...houreiPred_38,
  ...houreiPred_39,
  ...houreiPred_40,
  ...houreiPred_41,
]).questions;

export const houreiStats = {
  total: houreiQuestions.length,
  basic: houreiQuestions.filter(q => q.difficulty === "基礎").length,
  standard: houreiQuestions.filter(q => q.difficulty === "標準").length,
  advanced: houreiQuestions.filter(q => q.difficulty === "応用").length,
};

export const houreiByYear = houreiQuestions.reduce((acc, question) => {
  acc[question.year] = (acc[question.year] || 0) + 1;
  return acc;
}, {} as Record<string, number>);
