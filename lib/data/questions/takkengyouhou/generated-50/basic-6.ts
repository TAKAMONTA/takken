import { TrueFalseItem } from '@/lib/types/quiz';

export const takkengyouhouBasicQuestions_業務上の規制: TrueFalseItem[] = [
  {
    id: "takken_basic_業務上の規制_1",
    law: "takkengyouhou" as const,
    statement: "宅地建物取引業者は、契約の内容を消費者に十分理解させるための説明を行う必要がある。",
    answer: true,
    source: {
      type: "frequency-blank" as const,
      topic: "業務上の規制",
      year: "2024"
    },
    explanation: "宅地建物取引業者は、消費者が取引の内容を十分理解できるよう説明する義務が法律で定められている。",
    reference: {
      law: "宅建業法",
      article: "第35条"
    },
    topicWeight: 1
  },
  {
    id: "takken_basic_業務上の規制_2",
    law: "takkengyouhou" as const,
    statement: "宅地建物取引業者は、消費者から依頼を受けた業務以外の業務を行ってはならない。",
    answer: true,
    source: {
      type: "frequency-blank" as const,
      topic: "業務上の規制",
      year: "2024"
    },
    explanation: "宅地建物取引業者は、消費者からの依頼を受けた業務の範囲内で行動することが法律で定められている。",
    reference: {
      law: "宅建業法",
      article: "第34条"
    },
    topicWeight: 1
  }
];
