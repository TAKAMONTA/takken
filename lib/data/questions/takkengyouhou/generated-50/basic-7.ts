import { TrueFalseItem } from '@/lib/types/quiz';

export const takkengyouhouBasicQuestions_監督_罰則: TrueFalseItem[] = [
  {
    id: "takken_basic_監督・罰則_1",
    law: "takkengyouhou" as const,
    statement: "宅地建物取引業者が違法行為を行った場合、行政処分として営業停止を命じることができる。",
    answer: true,
    source: {
      type: "frequency-blank" as const,
      topic: "監督・罰則",
      year: "2024"
    },
    explanation: "宅地建物取引業法では、宅地建物取引業者が法令違反を行った場合、行政処分として営業停止を命じることが認められています。",
    reference: {
      law: "宅建業法",
      article: "第60条"
    },
    topicWeight: 1
  },
];
