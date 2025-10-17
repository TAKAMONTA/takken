import { TrueFalseItem } from '@/lib/types/quiz';

export const takkengyouhouBasicQuestions_Advertisement_ContractRegulation: TrueFalseItem[] = [
  {
    id: "takken_basic_Advertisement_ContractRegulation_1",
    law: "takkengyouhou" as const,
    statement: "宅地建物取引業者は、宅地建物取引業法に基づき広告を掲示する際には、虚偽の事項を記載してはならない。",
    answer: true,
    source: {
      type: "frequency-blank" as const,
      topic: "広告・契約の規制",
      year: "2024"
    },
    explanation: "宅地建物取引業法においては、宅地建物取引業者が広告を掲示する際に虚偽の事項を記載することは禁止されています。",
    reference: {
      law: "宅建業法",
      article: "第34条"
    },
    topicWeight: 1
  },
  {
    id: "takken_basic_Advertisement_ContractRegulation_2",
    law: "takkengyouhou" as const,
    statement: "宅地建物取引業者は、消費者との契約時に必ず書面による契約を結ぶことが求められる。",
    answer: true,
    source: {
      type: "frequency-blank" as const,
      topic: "広告・契約の規制",
      year: "2024"
    },
    explanation: "宅地建物取引業法では、宅地建物取引業者と消費者との間での契約は原則として書面によるものとされています。",
    reference: {
      law: "宅建業法",
      article: "第35条"
    },
    topicWeight: 1
  },
];
