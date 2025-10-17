import { TrueFalseItem } from '@/lib/types/quiz';

export const takkengyouhouBasicQuestions_宅地建物取引士: TrueFalseItem[] = [
  {
    id: "takken_basic_宅地建物取引士_1",
    law: "takkengyouhou" as const,
    statement: "宅地建物取引士の資格は一生有効である。",
    answer: false,
    source: {
      type: "frequency-blank" as const,
      topic: "宅地建物取引士",
      year: "2024"
    },
    explanation: "宅地建物取引士の資格は5年ごとの更新が必要であり、一生有効ではない。",
    reference: {
      law: "宅建業法",
      article: "第３４条"
    },
    topicWeight: 1
  },
  {
    id: "takken_basic_宅地建物取引士_2",
    law: "takkengyouhou" as const,
    statement: "宅地建物取引士は、宅地建物取引業者の登録を受けなくても業務を行うことができる。",
    answer: false,
    source: {
      type: "frequency-blank" as const,
      topic: "宅地建物取引士",
      year: "2024"
    },
    explanation: "宅地建物取引士は、宅地建物取引業者として登録を受けるか、宅地建物取引業者に所属して業務を行うことが必要である。",
    reference: {
      law: "宅建業法",
      article: "第３６条"
    },
    topicWeight: 1
  },
];
