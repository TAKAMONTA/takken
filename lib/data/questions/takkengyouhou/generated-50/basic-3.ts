import { TrueFalseItem } from '@/lib/types/quiz';

export const takkengyouhouBasicQuestions_営業保証金_保証協会: TrueFalseItem[] = [
  {
    id: "takken_basic_営業保証金・保証協会_1",
    law: "takkengyouhou" as const,
    statement: "宅地建物取引業者は、自己の営業に関して生じる損害賠償責任を保証するために、営業保証金を供託しなければならない。",
    answer: true,
    source: {
      type: "frequency-blank" as const,
      topic: "営業保証金・保証協会",
      year: "2024"
    },
    explanation: "宅地建物取引業法では、業者の営業に関する損害賠償責任を保証するため、営業保証金の供託が義務付けられています。",
    reference: {
      law: "宅建業法",
      article: "第37条"
    },
    topicWeight: 1
  },
  {
    id: "takken_basic_営業保証金・保証協会_2",
    law: "takkengyouhou" as const,
    statement: "宅地建物取引保証協会の会員であれば、営業保証金の供託は不要である。",
    answer: true,
    source: {
      type: "frequency-blank" as const,
      topic: "営業保証金・保証協会",
      year: "2024"
    },
    explanation: "宅地建物取引保証協会の会員であれば、その加入が営業保証金供託の義務を免除します。",
    reference: {
      law: "宅建業法",
      article: "第37条の2"
    },
    topicWeight: 1
  }
];
