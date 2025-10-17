import { TrueFalseItem } from '@/lib/types/quiz';

export const takkengyouhouBasicQuestions_自ら売主制限: TrueFalseItem[] = [
  {
    id: "takken_basic_自ら売主制限_1",
    law: "takkengyouhou" as const,
    statement: "不動産の売買を行う際、宅地建物取引業者自身が売主となることは法律で禁止されている。",
    answer: false,
    source: {
      type: "frequency-blank" as const,
      topic: "自ら売主制限",
      year: "2024"
    },
    explanation: "宅地建物取引業者自身が売主となり、その事業として不動産の売買を行うこと自体は法律で禁止されていません。ただし、その際にはあくまで自己の所有物を売却するものであり、宅地建物取引業者は原則として仲介業務に従事するものとされています。",
    reference: {
      law: "宅建業法",
      article: "第34条"
    },
    topicWeight: 1
  },
];
