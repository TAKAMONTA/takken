import { Question } from "@/lib/types/quiz";
import { TrueFalseItem } from "@/lib/types/quiz";
import { preparePublishedQuestions } from "../../../question-quality/prepare";

// 基礎レベル（肢別形式）
import { takkengyouhouBasicQuestions_宅建業の免許制度 } from "./generated-50/basic-1";
import { takkengyouhouBasicQuestions_宅地建物取引士 } from "./generated-50/basic-2";
import { takkengyouhouBasicQuestions_営業保証金_保証協会 } from "./generated-50/basic-3";
import { takkengyouhouBasicQuestions_Advertisement_ContractRegulation } from "./generated-50/basic-4";
import { takkengyouhouBasicQuestions_重要事項説明_37条書面 } from "./generated-50/basic-5";
import { takkengyouhouBasicQuestions_業務上の規制 } from "./generated-50/basic-6";
import { takkengyouhouBasicQuestions_監督_罰則 } from "./generated-50/basic-7";
import { takkengyouhouBasicQuestions_報酬の制限 } from "./generated-50/basic-8";
import { takkengyouhouBasicQuestions_自ら売主制限 } from "./generated-50/basic-9";

// 標準レベル（多肢選択）
import { takkengyouhouStandardQuestions_宅建業の免許制度 } from "./generated-50/standard-1";
import { takkengyouhouStandardQuestions_宅地建物取引士 } from "./generated-50/standard-2";
import { takkengyouhouStandardQuestions_BusinessGuaranteeMoney_GuaranteeAssociation } from "./generated-50/standard-3";
import { takkengyouhouStandardQuestions_Advertisement_ContractRegulations } from "./generated-50/standard-4";
import { takkengyouhouStandardQuestions_重要事項説明_37条書面 } from "./generated-50/standard-5";
import { takkengyouhouStandardQuestions_BusinessRegulations } from "./generated-50/standard-6";
import { takkengyouhouStandardQuestions_監督罰則 } from "./generated-50/standard-7";
import { takkengyouhouStandardQuestions_報酬の制限 } from "./generated-50/standard-8";
import { takkengyouhouStandardQuestions_自ら売主制限 } from "./generated-50/standard-9";

// 応用レベル（多肢選択）
import { takkengyouhouAdvancedQuestions_LicenseSystem } from "./generated-50/advanced-1";
import { takkengyouhou応用Questions_宅地建物取引士 } from "./generated-50/advanced-2";
import { takkengyouhouAdvancedQuestions_BusinessGuaranteeMoney_GuaranteeAssociation } from "./generated-50/advanced-3";
import { takkengyouhouAdvancedQuestions_Advertisement_ContractRegulation } from "./generated-50/advanced-4";
// advanced-5（重要事項/37条混同）は品質隔離のため公開から除外
import { takkengyouhouAdvancedQuestions_businessRegulation } from "./generated-50/advanced-6";
import { takkengyouhouAdvancedQuestions_supervision_penalty } from "./generated-50/advanced-7";
import { takkengyouhouAdvancedQuestions_RewardLimit } from "./generated-50/advanced-8";

import { takkengyouhouQualityFixed_重要事項_37条 } from "./quality-fixed-35-37";

// 過去問傾向反映AI予想問題
import { takkengyouhouTrendAIQuestions } from "./trend-ai";
import { takkenPred_00 } from "./prediction/2024年法改正対応問題_基礎";
import { takkenPred_01 } from "./prediction/2024年法改正対応問題_応用";
import { takkenPred_02 } from "./prediction/2024年法改正対応問題_標準";
import { takkenPred_03 } from "./prediction/営業保証金_保証協会_基礎";
import { takkenPred_04 } from "./prediction/営業保証金_保証協会_応用";
import { takkenPred_05 } from "./prediction/営業保証金_保証協会_標準";
import { takkenPred_06 } from "./prediction/報酬の制限_基礎";
import { takkenPred_07 } from "./prediction/報酬の制限_応用";
import { takkenPred_08 } from "./prediction/報酬の制限_標準";
import { takkenPred_09 } from "./prediction/宅地建物取引士_基礎";
import { takkenPred_10 } from "./prediction/宅地建物取引士_応用";
import { takkenPred_11 } from "./prediction/宅地建物取引士_標準";
import { takkenPred_12 } from "./prediction/宅建業の免許制度_基礎";
import { takkenPred_13 } from "./prediction/宅建業の免許制度_応用";
import { takkenPred_14 } from "./prediction/宅建業の免許制度_標準";
import { takkenPred_15 } from "./prediction/広告_契約の規制_基礎";
import { takkenPred_16 } from "./prediction/広告_契約の規制_応用";
import { takkenPred_17 } from "./prediction/広告_契約の規制_標準";
import { takkenPred_18 } from "./prediction/業務上の規制_基礎";
import { takkenPred_19 } from "./prediction/業務上の規制_応用";
import { takkenPred_20 } from "./prediction/業務上の規制_標準";
import { takkenPred_21 } from "./prediction/監督_罰則_基礎";
import { takkenPred_22 } from "./prediction/監督_罰則_応用";
import { takkenPred_23 } from "./prediction/監督_罰則_標準";
import { takkenPred_24 } from "./prediction/自ら売主制限_8種制限__基礎";
import { takkenPred_25 } from "./prediction/自ら売主制限_8種制限__応用";
import { takkenPred_26 } from "./prediction/自ら売主制限_8種制限__標準";
import { takkenPred_27 } from "./prediction/重要事項説明_37条書面_基礎";
import { takkenPred_28 } from "./prediction/重要事項説明_37条書面_応用";
import { takkenPred_29 } from "./prediction/重要事項説明_37条書面_標準";

// 追加問題
import { takkengyouhouAdditionalQuestions_20241026 } from "./additional-20241026";
import { takkengyouhouAdditionalQuestions_20241219 } from "./additional-20241219";
import { takkengyouhouAdditionalQuestions_20251101 } from "./additional-2025-11-01";
import { takkengyouhouAdditionalQuestions_20251101_batch1 } from "./additional-2025-11-01-batch1";
import { takkengyouhouAdditionalQuestions_20251101_batch2 } from "./additional-2025-11-01-batch2";
import { takkengyouhouAdditionalQuestions_20251101_batch3 } from "./additional-2025-11-01-batch3";
import { takkengyouhouAdditionalQuestions_20251101_batch4 } from "./additional-2025-11-01-batch4";
import { takkengyouhouAdditionalQuestions_20251101_batch5 } from "./additional-2025-11-01-batch5";

// 基礎問題（肢別形式）を多肢選択形式に変換する関数
function convertTrueFalseToQuestion(
  item: TrueFalseItem,
  index: number
): Question {
  // 防御的チェックを追加
  const statement = item?.statement || "";
  const explanation = item?.explanation || "";
  const year = item?.source?.year || "2024";
  const topic = item?.source?.topic || "";
  
  return {
    id: index + 1000,
    question: `次の記述について、宅建業法の規定によれば、正しいか誤っているか判断しなさい。\n\n「${statement}」`,
    options: ["正しい", "誤っている"],
    correctAnswer: item?.answer ? 0 : 1,
    explanation: (() => {
      const base = explanation || "";
      if (base.includes("【正解】") && base.replace(/\s/g, "").length >= 120) return base;
      const verdict = item?.answer ? "正しい" : "誤っている";
      return `【正解】この記述は「${verdict}」。

【各選択肢の解説】
1. 「正しい」を選ぶ場合 — 記述の内容が法令・制度に合っているとき。
2. 「誤っている」を選ぶ場合 — 記述に誤りや不正確な点があるとき。
本問の答えは「${verdict}」。

【ポイント】
- ○×形式では条文の原則と例外の区別が重要
- 似た制度名・手続名の入れ替えに注意

【覚え方】
テーマ「${topic || "基礎"}」。キーワードを一文で言えるようにする。

【試験での出方】
肢別（○×）は本試験の選択肢攻略の基礎。誤りの根拠を言葉で説明できるようにする。`;
    })(),
    category: "takkengyouhou",
    difficulty: "基礎",
    year: year,
    topic: topic,
  };
}

// 基礎問題を多肢選択形式に変換
const basicQuestionsConverted: Question[] = [
  ...takkengyouhouBasicQuestions_宅建業の免許制度,
  ...takkengyouhouBasicQuestions_宅地建物取引士,
  ...takkengyouhouBasicQuestions_営業保証金_保証協会,
  ...takkengyouhouBasicQuestions_Advertisement_ContractRegulation,
  ...takkengyouhouBasicQuestions_重要事項説明_37条書面,
  ...takkengyouhouBasicQuestions_業務上の規制,
  ...takkengyouhouBasicQuestions_監督_罰則,
  ...takkengyouhouBasicQuestions_報酬の制限,
  ...takkengyouhouBasicQuestions_自ら売主制限,
].map((item, index) => convertTrueFalseToQuestion(item, index));

// 全問題を統合（生データ）
const takkengyouhouQuestionsRaw: Question[] = [
  ...basicQuestionsConverted,
  ...takkengyouhouStandardQuestions_宅建業の免許制度,
  ...takkengyouhouStandardQuestions_宅地建物取引士,
  ...takkengyouhouStandardQuestions_BusinessGuaranteeMoney_GuaranteeAssociation,
  ...takkengyouhouStandardQuestions_Advertisement_ContractRegulations,
  ...takkengyouhouStandardQuestions_重要事項説明_37条書面,
  ...takkengyouhouStandardQuestions_BusinessRegulations,
  ...takkengyouhouStandardQuestions_監督罰則,
  ...takkengyouhouStandardQuestions_報酬の制限,
  ...takkengyouhouStandardQuestions_自ら売主制限,
  ...takkengyouhouAdvancedQuestions_LicenseSystem,
  ...takkengyouhou応用Questions_宅地建物取引士,
  ...takkengyouhouAdvancedQuestions_BusinessGuaranteeMoney_GuaranteeAssociation,
  ...takkengyouhouAdvancedQuestions_Advertisement_ContractRegulation,
  ...takkengyouhouAdvancedQuestions_businessRegulation,
  ...takkengyouhouAdvancedQuestions_supervision_penalty,
  ...takkengyouhouAdvancedQuestions_RewardLimit,
  ...takkengyouhouQualityFixed_重要事項_37条,
  // 追加問題
  ...takkengyouhouAdditionalQuestions_20241026,
  ...takkengyouhouAdditionalQuestions_20241219,
  ...takkengyouhouAdditionalQuestions_20251101,
  ...takkengyouhouAdditionalQuestions_20251101_batch1,
  ...takkengyouhouAdditionalQuestions_20251101_batch2,
  ...takkengyouhouAdditionalQuestions_20251101_batch3,
  ...takkengyouhouAdditionalQuestions_20251101_batch4,
  ...takkengyouhouAdditionalQuestions_20251101_batch5,
  // 過去問傾向反映AI予想問題
  ...takkengyouhouTrendAIQuestions,
  ...takkenPred_00,
  ...takkenPred_01,
  ...takkenPred_02,
  ...takkenPred_03,
  ...takkenPred_04,
  ...takkenPred_05,
  ...takkenPred_06,
  ...takkenPred_07,
  ...takkenPred_08,
  ...takkenPred_09,
  ...takkenPred_10,
  ...takkenPred_11,
  ...takkenPred_12,
  ...takkenPred_13,
  ...takkenPred_14,
  ...takkenPred_15,
  ...takkenPred_16,
  ...takkenPred_17,
  ...takkenPred_18,
  ...takkenPred_19,
  ...takkenPred_20,
  ...takkenPred_21,
  ...takkenPred_22,
  ...takkenPred_23,
  ...takkenPred_24,
  ...takkenPred_25,
  ...takkenPred_26,
  ...takkenPred_27,
  ...takkenPred_28,
  ...takkenPred_29,
];

// 隔離・頻度グレード・学習補助を適用した公開セット
export const takkengyouhouQuestions: Question[] =
  preparePublishedQuestions(takkengyouhouQuestionsRaw).questions;

// 難易度別の問題数統計
export const takkengyouhouStats = {
  total: takkengyouhouQuestions.length,
  basic: takkengyouhouQuestions.filter(q => q.difficulty === "基礎").length,
  standard: takkengyouhouQuestions.filter(q => q.difficulty === "標準").length,
  advanced: takkengyouhouQuestions.filter(q => q.difficulty === "応用").length,
};

// 年度別の問題数統計
export const takkengyouhouByYear = takkengyouhouQuestions.reduce(
  (acc, question) => {
    acc[question.year] = (acc[question.year] || 0) + 1;
    return acc;
  },
  {} as Record<string, number>
);
