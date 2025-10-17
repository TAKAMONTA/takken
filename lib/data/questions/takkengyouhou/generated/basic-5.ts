import { TrueFalseItem } from '@/lib/types/quiz';

export const takkengyouhouBasicQuestions_重要事項説明_37条書面: TrueFalseItem[] = [
  {
    id: "takkengyouhou_basic_1",
    law: "takkengyouhou" as const,
    statement: "重要事項説明・37条書面は、契約の締結前に交付しなければならない。",
    answer: true,
    source: {
      type: "frequency-blank" as const,
      topic: "重要事項説明・37条書面",
      year: "2024"
    },
    explanation: "宅地建物取引業法では、契約の締結前に重要な事項を消費者に説明し、37条書面を交付することが義務付けられています。これにより、消費者が契約内容を理解しやすくなるように配慮されています。",
    reference: {
      law: "宅地建物取引業法",
      article: "37条"
    },
    topicWeight: 1
  },
];
