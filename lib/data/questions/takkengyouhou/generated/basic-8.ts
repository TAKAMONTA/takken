import { TrueFalseItem } from '@/lib/types/quiz';

export const takkengyouhouBasicQuestions_報酬の制限: TrueFalseItem[] = [
  {
    id: "takkengyouhou_basic_1",
    law: "takkengyouhou" as const,
    statement: "宅地建物取引士は、取引報酬の額を自由に設定することができる。",
    answer: false,
    source: {
      type: "frequency-blank" as const,
      topic: "報酬の制限",
      year: "2024"
    },
    explanation: "宅地建物取引士の取引報酬の額は、公正取引委員会の定める基準に基づいて設定される。これは、消費者を不当な取引報酬から守るための制度である。",
    reference: {
      law: "宅地建物取引業法",
      article: "37条"
    },
    topicWeight: 1
  },
];
