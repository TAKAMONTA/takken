import { TrueFalseItem } from '@/lib/types/quiz';

export const takkengyouhouBasicQuestions_宅建業の免許制度: TrueFalseItem[] = [
  {
    id: "takkengyouhou_basic_1",
    law: "takkengyouhou" as const,
    statement: "宅地建物取引業者となるには、都道府県知事の認定を受ける必要がある。",
    answer: true,
    source: {
      type: "frequency-blank" as const,
      topic: "宅建業の免許制度",
      year: "2024"
    },
    explanation: "宅建業法では、宅地建物取引業者となるためには、都道府県知事から宅地建物取引業の許可を受ける必要があると定められています。この許可を受けるには、営業保証金の供託や主たる事務所の設置など、一定の要件を満たす必要があります。",
    reference: {
      law: "宅建業法",
      article: "34条"
    },
    topicWeight: 1
  },
];
