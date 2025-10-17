import { TrueFalseItem } from '@/lib/types/quiz';

export const takkengyouhouBasicQuestions_宅地建物取引士: TrueFalseItem[] = [
  {
    id: "takkengyouhou_basic_1",
    law: "takkengyouhou" as const,
    statement: "宅地建物取引士証の有効期間は永久である。",
    answer: false,
    source: {
      type: "frequency-blank" as const,
      topic: "宅地建物取引士",
      year: "2024"
    },
    explanation: "宅地建物取引士証の有効期間は5年であって、永久ではありません。有効期間が過ぎると更新の手続きが必要になります。",
    reference: {
      law: "宅地建物取引業法",
      article: "第34条"
    },
    topicWeight: 1
  },
];
