import { TrueFalseItem } from '@/lib/types/quiz';

export const takkengyouhouBasicQuestions_報酬の制限: TrueFalseItem[] = [
  {
    id: "takken_basic_報酬の制限_1",
    law: "takkengyouhou" as const,
    statement: "宅地建物取引業者が取引の相手方に対して、その取引に係る報酬を要求することは禁止されている。",
    answer: true,
    source: {
      type: "frequency-blank" as const,
      topic: "報酬の制限",
      year: "2024"
    },
    explanation: "宅地建物取引業法には、取引の相手方から報酬を直接受け取ることは、宅地建物取引業者の公正な取引を阻害するおそれがあるとして禁止されています。",
    reference: {
      law: "宅建業法",
      article: "第34条"
    },
    topicWeight: 1
  },
];
