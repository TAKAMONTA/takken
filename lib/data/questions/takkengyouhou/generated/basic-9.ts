import { TrueFalseItem } from '@/lib/types/quiz';

export const takkengyouhouBasicQuestions_自ら売主制限: TrueFalseItem[] = [
  {
    id: "takkengyouhou_basic_1",
    law: "takkengyouhou" as const,
    statement: "宅地建物取引業者は、自らが売主である場合に限り、各種開発事業者の仲介を行うことができる。",
    answer: true,
    source: {
      type: "frequency-blank" as const,
      topic: "自ら売主制限",
      year: "2024"
    },
    explanation: "自ら売主制限とは、取引業者が自らの所有する物件の売買を行う場合のみ、各種開発事業者（都市再開発事業者、土地区画整理事業者等）の新築分譲住宅の仲介が許可される制限のことを指します。これは、消費者保護の観点から設けられた制度です。",
    reference: {
      law: "宅地建物取引業法",
      article: "34条の5"
    },
    topicWeight: 1
  },
  // 1問すべて
];
