import { TrueFalseItem } from '@/lib/types/quiz';

export const takkengyouhouBasicQuestions_広告_契約の規制: TrueFalseItem[] = [
  {
    id: "takkengyouhou_basic_1",
    law: "takkengyouhou" as const,
    statement: "宅地建物取引業者は、不動産の販売に関する広告を行う際、価格や販売条件を明記しなければならない。",
    answer: true,
    source: {
      type: "frequency-blank" as const,
      topic: "広告・契約の規制",
      year: "2024"
    },
    explanation: "宅地建物取引業法では、業者が不動産の販売に関する広告を行う際、価格や販売条件を明記することが規定されています。これは消費者保護の観点から、消費者が不動産取引を行う際の情報を適切に得ることを保証するための措置です。",
    reference: {
      law: "宅地建物取引業法",
      article: "第34条"
    },
    topicWeight: 1
  }
];
