import { TrueFalseItem } from '@/lib/types/quiz';

export const takkengyouhouBasicQuestions_業務上の規制: TrueFalseItem[] = [
  {
    id: "takkengyouhou_basic_1",
    law: "takkengyouhou" as const,
    statement: "宅地建物取引業者は、取引を要請された場合、無条件でそれに応じる義務がある。",
    answer: false,
    source: {
      type: "frequency-blank" as const,
      topic: "業務上の規制",
      year: "2024"
    },
    explanation: "宅地建物取引業者は、取引を要請された場合でも、詐欺的な取引や不適切な取引を避けるために、その要請を断ることができます。業者は顧客の利益を守る義務がありますが、それは違法または不適切な行為を許容する事を意味しません。",
    reference: {
      law: "宅地建物取引業法",
      article: "36条"
    },
    topicWeight: 1
  },
  // 1問すべて
];
