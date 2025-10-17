import { TrueFalseItem } from '@/lib/types/quiz';

export const takkengyouhouBasicQuestions_重要事項説明_37条書面: TrueFalseItem[] = [
  {
    id: "takken_basic_重要事項説明・37条書面_1",
    law: "takkengyouhou" as const,
    statement: "宅地建物取引業者は、契約の締結前に、重要事項を書面で説明しなければならない。",
    answer: true,
    source: {
      type: "frequency-blank" as const,
      topic: "重要事項説明・37条書面",
      year: "2022"
    },
    explanation: "宅建業法第37条では、宅地建物取引業者は、契約の締結前に、重要事項を書面で説明することが義務付けられています。",
    reference: {
      law: "宅建業法",
      article: "第37条"
    },
    topicWeight: 1
  },
  {
    id: "takken_basic_重要事項説明・37条書面_2",
    law: "takkengyouhou" as const,
    statement: "重要事項の説明は、口頭だけでも法律上は問題ない。",
    answer: false,
    source: {
      type: "frequency-blank" as const,
      topic: "重要事項説明・37条書面",
      year: "2022"
    },
    explanation: "宅建業法第37条には、「宅地建物取引業者は、契約の締結前に、重要事項を書面で説明しなければならない」とあります。したがって、口頭だけでは法律上は不十分です。",
    reference: {
      law: "宅建業法",
      article: "第37条"
    },
    topicWeight: 1
  },
];
