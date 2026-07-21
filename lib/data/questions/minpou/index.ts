/**
 * 民法 - 商品化レベルの問題（50問）
 * 基礎15問（肢別形式） + 標準25問（多肢選択） + 応用10問（多肢選択）
 */
import { Question } from "@/lib/types/quiz";
import { TrueFalseItem } from "@/lib/types/quiz";
import { preparePublishedQuestions } from "../../../question-quality/prepare";

// 基礎レベル（肢別形式）
import { minpouBasicQuestions_制限行為能力者 } from "./generated-50/basic-1";
import { minpouBasicQuestions_意思表示 } from "./generated-50/basic-2";
import { minpouBasicQuestions_代理 } from "./generated-50/basic-3";
import { minpouBasicQuestions_時効 } from "./generated-50/basic-4";
import { minpouBasicQuestions_物権変動 } from "./generated-50/basic-5";
import { minpouBasicQuestions_共有 } from "./generated-50/basic-6";
import { minpouBasicQuestions_抵当権 } from "./generated-50/basic-7";
import { minpouBasicQuestions_債務不履行_解除 } from "./generated-50/basic-8";
import { minpouBasicQuestions_相続 } from "./generated-50/basic-9";

// 標準レベル（多肢選択）
import { minpouStandardQuestions_制限行為能力者 } from "./generated-50/standard-1";
import { minpouStandardQuestions_意思表示 } from "./generated-50/standard-2";
import { minpouStandardQuestions_代理 } from "./generated-50/standard-3";
import { minpouStandardQuestions_時効 } from "./generated-50/standard-4";
import { minpouStandardQuestions_物権変動 } from "./generated-50/standard-5";
import { minpouStandardQuestions_共有 } from "./generated-50/standard-6";
import { minpouStandardQuestions_抵当権 } from "./generated-50/standard-7";
import { minpouStandardQuestions_債務不履行_解除 } from "./generated-50/standard-8";
import { minpouStandardQuestions_相続 } from "./generated-50/standard-9";

// 応用レベル（多肢選択）
import { minpouAdvancedQuestions_制限行為能力者 } from "./generated-50/advanced-1";
import { minpouAdvancedQuestions_意思表示 } from "./generated-50/advanced-2";
import { minpouAdvancedQuestions_代理 } from "./generated-50/advanced-3";
import { minpouAdvancedQuestions_時効 } from "./generated-50/advanced-4";
import { minpouAdvancedQuestions_物権変動 } from "./generated-50/advanced-5";
import { minpouAdvancedQuestions_共有 } from "./generated-50/advanced-6";
import { minpouAdvancedQuestions_抵当権 } from "./generated-50/advanced-7";
import { minpouAdvancedQuestions_債務不履行_解除 } from "./generated-50/advanced-8";
import { minpouAdvancedQuestions_相続 } from "./generated-50/advanced-9";

// 追加問題
import { minpouAdditionalQuestions_20241026 } from "./additional-20241026";
import { minpouAdditionalQuestions_20241219 } from "./additional-20241219";
import { minpouAdditionalQuestions_20251101_batch1 } from "./additional-2025-11-01-batch1";
import { minpouAdditionalQuestions_20251101_batch2 } from "./additional-2025-11-01-batch2";
import { minpouAdditionalQuestions_20251101_batch3 } from "./additional-2025-11-01-batch3";
import { minpouAdditionalQuestions_20251101_batch4 } from "./additional-2025-11-01-batch4";
import { minpouAdditionalQuestions_20251101_batch5 } from "./additional-2025-11-01-batch5";
import { minpouAdditionalQuestions_20251101_batch6 } from "./additional-2025-11-01-batch6";
import { kenriTrendAIQuestions } from "./trend-ai";
import { minpouPred_00 } from "./prediction/2020年民法改正対応問題_基礎";
import { minpouPred_01 } from "./prediction/2020年民法改正対応問題_応用";
import { minpouPred_02 } from "./prediction/2020年民法改正対応問題_標準";
import { minpouPred_03 } from "./prediction/代理_基礎";
import { minpouPred_04 } from "./prediction/代理_応用";
import { minpouPred_05 } from "./prediction/代理_標準";
import { minpouPred_06 } from "./prediction/債務不履行_損害賠償_基礎";
import { minpouPred_07 } from "./prediction/債務不履行_損害賠償_応用";
import { minpouPred_08 } from "./prediction/債務不履行_損害賠償_標準";
import { minpouPred_09 } from "./prediction/共有_基礎";
import { minpouPred_10 } from "./prediction/共有_応用";
import { minpouPred_11 } from "./prediction/共有_標準";
import { minpouPred_12 } from "./prediction/制限行為能力者_基礎";
import { minpouPred_13 } from "./prediction/制限行為能力者_応用";
import { minpouPred_14 } from "./prediction/制限行為能力者_標準";
import { minpouPred_15 } from "./prediction/契約の解除_基礎";
import { minpouPred_16 } from "./prediction/契約の解除_応用";
import { minpouPred_17 } from "./prediction/契約の解除_標準";
import { minpouPred_18 } from "./prediction/意思表示_詐欺_強迫等__基礎";
import { minpouPred_19 } from "./prediction/意思表示_詐欺_強迫等__応用";
import { minpouPred_20 } from "./prediction/意思表示_詐欺_強迫等__標準";
import { minpouPred_21 } from "./prediction/抵当権_基礎";
import { minpouPred_22 } from "./prediction/抵当権_応用";
import { minpouPred_23 } from "./prediction/抵当権_標準";
import { minpouPred_24 } from "./prediction/時効_基礎";
import { minpouPred_25 } from "./prediction/時効_応用";
import { minpouPred_26 } from "./prediction/時効_標準";
import { minpouPred_27 } from "./prediction/物権変動_対抗問題_基礎";
import { minpouPred_28 } from "./prediction/物権変動_対抗問題_応用";
import { minpouPred_29 } from "./prediction/物権変動_対抗問題_標準";
import { minpouPred_30 } from "./prediction/相続_基礎";
import { minpouPred_31 } from "./prediction/相続_応用";
import { minpouPred_32 } from "./prediction/相続_標準";

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
    id: index + 2000,
    question: `次の記述について、民法の規定によれば、正しいか誤っているか判断しなさい。\n\n「${statement}」`,
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
    category: "minpou",
    difficulty: "基礎",
    year: year,
    topic: topic,
  };
}

// 基礎問題を多肢選択形式に変換
const basicQuestionsConverted: Question[] = [
  ...minpouBasicQuestions_制限行為能力者,
  ...minpouBasicQuestions_意思表示,
  ...minpouBasicQuestions_代理,
  ...minpouBasicQuestions_時効,
  ...minpouBasicQuestions_物権変動,
  ...minpouBasicQuestions_共有,
  ...minpouBasicQuestions_抵当権,
  ...minpouBasicQuestions_債務不履行_解除,
  ...minpouBasicQuestions_相続,
].map((item, index) => convertTrueFalseToQuestion(item, index));

// 全問題を統合
export const minpouQuestions: Question[] = preparePublishedQuestions([
  ...basicQuestionsConverted,
  ...minpouStandardQuestions_制限行為能力者,
  ...minpouStandardQuestions_意思表示,
  ...minpouStandardQuestions_代理,
  ...minpouStandardQuestions_時効,
  ...minpouStandardQuestions_物権変動,
  ...minpouStandardQuestions_共有,
  ...minpouStandardQuestions_抵当権,
  ...minpouStandardQuestions_債務不履行_解除,
  ...minpouStandardQuestions_相続,
  ...minpouAdvancedQuestions_制限行為能力者,
  ...minpouAdvancedQuestions_意思表示,
  ...minpouAdvancedQuestions_代理,
  ...minpouAdvancedQuestions_時効,
  ...minpouAdvancedQuestions_物権変動,
  ...minpouAdvancedQuestions_共有,
  ...minpouAdvancedQuestions_抵当権,
  ...minpouAdvancedQuestions_債務不履行_解除,
  ...minpouAdvancedQuestions_相続,
  // 追加問題
  ...minpouAdditionalQuestions_20241026,
  ...minpouAdditionalQuestions_20241219,
  ...minpouAdditionalQuestions_20251101_batch1,
  ...minpouAdditionalQuestions_20251101_batch2,
  ...minpouAdditionalQuestions_20251101_batch3,
  ...minpouAdditionalQuestions_20251101_batch4,
  ...minpouAdditionalQuestions_20251101_batch5,
  ...minpouAdditionalQuestions_20251101_batch6,
  ...kenriTrendAIQuestions,
  ...minpouPred_00,
  ...minpouPred_01,
  ...minpouPred_02,
  ...minpouPred_03,
  ...minpouPred_04,
  ...minpouPred_05,
  ...minpouPred_06,
  ...minpouPred_07,
  ...minpouPred_08,
  ...minpouPred_09,
  ...minpouPred_10,
  ...minpouPred_11,
  ...minpouPred_12,
  ...minpouPred_13,
  ...minpouPred_14,
  ...minpouPred_15,
  ...minpouPred_16,
  ...minpouPred_17,
  ...minpouPred_18,
  ...minpouPred_19,
  ...minpouPred_20,
  ...minpouPred_21,
  ...minpouPred_22,
  ...minpouPred_23,
  ...minpouPred_24,
  ...minpouPred_25,
  ...minpouPred_26,
  ...minpouPred_27,
  ...minpouPred_28,
  ...minpouPred_29,
  ...minpouPred_30,
  ...minpouPred_31,
  ...minpouPred_32,
]).questions;

// 難易度別の問題数統計
export const minpouStats = {
  total: minpouQuestions.length,
  basic: minpouQuestions.filter(q => q.difficulty === "基礎").length,
  standard: minpouQuestions.filter(q => q.difficulty === "標準").length,
  advanced: minpouQuestions.filter(q => q.difficulty === "応用").length,
};

// 年度別の問題数統計
export const minpouByYear = minpouQuestions.reduce((acc, question) => {
  acc[question.year] = (acc[question.year] || 0) + 1;
  return acc;
}, {} as Record<string, number>);
