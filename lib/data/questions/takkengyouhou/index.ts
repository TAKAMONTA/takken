/**
 * 宅建業法 - 商品化レベルの問題（50問）
 * 基礎15問（肢別形式） + 標準25問（多肢選択） + 応用10問（多肢選択）
 */
import { Question } from "@/lib/types/quiz";
import { TrueFalseItem } from "@/lib/types/quiz";

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
import { takkengyouhouAdvancedQuestions_重要事項説明_37条書面 } from "./generated-50/advanced-5";
import { takkengyouhouAdvancedQuestions_businessRegulation } from "./generated-50/advanced-6";
import { takkengyouhouAdvancedQuestions_supervision_penalty } from "./generated-50/advanced-7";
import { takkengyouhouAdvancedQuestions_RewardLimit } from "./generated-50/advanced-8";

// 基礎問題（肢別形式）を多肢選択形式に変換する関数
function convertTrueFalseToQuestion(item: TrueFalseItem, index: number): Question {
  return {
    id: index + 1000,
    question: `次の記述について、宅建業法の規定によれば、正しいか誤っているか判断しなさい。\n\n「${item.statement}」`,
    options: ["正しい", "誤っている"],
    correctAnswer: item.answer ? 0 : 1,
    explanation: item.explanation || "",
    category: "takkengyouhou",
    difficulty: "基礎",
    year: item.source.year || "2024",
    topic: item.source.topic
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

// 全問題を統合
export const takkengyouhouQuestions: Question[] = [
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
  ...takkengyouhouAdvancedQuestions_重要事項説明_37条書面,
  ...takkengyouhouAdvancedQuestions_businessRegulation,
  ...takkengyouhouAdvancedQuestions_supervision_penalty,
  ...takkengyouhouAdvancedQuestions_RewardLimit,
];

// 難易度別の問題数統計
export const takkengyouhouStats = {
  total: takkengyouhouQuestions.length,
  basic: takkengyouhouQuestions.filter((q) => q.difficulty === "基礎").length,
  standard: takkengyouhouQuestions.filter((q) => q.difficulty === "標準").length,
  advanced: takkengyouhouQuestions.filter((q) => q.difficulty === "応用").length,
};

// 年度別の問題数統計
export const takkengyouhouByYear = takkengyouhouQuestions.reduce((acc, question) => {
  acc[question.year] = (acc[question.year] || 0) + 1;
  return acc;
}, {} as Record<string, number>);
