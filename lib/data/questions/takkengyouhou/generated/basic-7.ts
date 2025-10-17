import { TrueFalseItem } from '@/lib/types/quiz';

export const takkengyouhouBasicQuestions_監督_罰則: TrueFalseItem[] = [
  {
    id: "takkengyouhou_basic_1",
    law: "takkengyouhou" as const,
    statement: "宅地建物取引業者が法令違反を犯した場合、罰金や営業停止といった行政処分が科されることはない。",
    answer: false,
    source: {
      type: "frequency-blank" as const,
      topic: "監督・罰則",
      year: "2024"
    },
    explanation: "宅地建物取引業法には、業者が法令違反を犯した場合の行政処分を規定しています。具体的には、罰金や営業停止、免許の取消しといった処分が科される可能性があります。",
    reference: {
      law: "宅地建物取引業法",
      article: "70条"
    },
    topicWeight: 1
  },
];
