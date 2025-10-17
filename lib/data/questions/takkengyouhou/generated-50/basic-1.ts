import { TrueFalseItem } from '@/lib/types/quiz';

export const takkengyouhouBasicQuestions_宅建業の免許制度: TrueFalseItem[] = [
  {
    id: "takken_basic_宅建業の免許制度_1",
    law: "takkengyouhou" as const,
    statement: "宅地建物取引業を営むためには、都道府県知事からの免許が必要である。",
    answer: true,
    source: {
      type: "frequency-blank" as const,
      topic: "宅建業の免許制度",
      year: "2024"
    },
    explanation: "宅地建物取引業を営むためには、都道府県知事から宅地建物取引業者の免許を受ける必要があります。",
    reference: {
      law: "宅建業法",
      article: "第16条"
    },
    topicWeight: 1
  },
  {
    id: "takken_basic_宅建業の免許制度_2",
    law: "takkengyouhou" as const,
    statement: "宅地建物取引業者の免許は、一度受ければ更新の必要はない。",
    answer: false,
    source: {
      type: "frequency-blank" as const,
      topic: "宅建業の免許制度",
      year: "2024"
    },
    explanation: "宅地建物取引業者の免許は、5年ごとに更新する必要があります。",
    reference: {
      law: "宅建業法",
      article: "第17条"
    },
    topicWeight: 1
  }
];
