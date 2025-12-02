/**
 * 民法 - 商品化レベルの問題（50問）
 * 基礎15問（肢別形式） + 標準25問（多肢選択） + 応用10問（多肢選択）
 */
import { Question } from "@/lib/types/quiz";
import { TrueFalseItem } from "@/lib/types/quiz";

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
    explanation: explanation,
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
export const minpouQuestions: Question[] = [
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
];

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
