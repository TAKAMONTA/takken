import { TrueFalseItem } from '@/lib/types/quiz';

export const minpouBasicQuestions_債務不履行_解除: TrueFalseItem[] = [
  {
    id: "minpou_basic_債務不履行・解除_1",
    law: "minpou" as const,
    statement: "債権者が債務の履行を求められない場合、債務不履行とは言えない。",
    answer: false,
    source: {
      type: "frequency-blank" as const,
      topic: "債務不履行・解除",
      year: "2024"
    },
    explanation: "債務の履行が遅れる、または全くなされない場合、これを債務不履行と言います。債務者が履行をしない場合、債権者が履行を求められないという理由で債務不履行とは言えないという考え方は誤りです。",
    reference: {
      law: "民法",
      article: "第415条"
    },
    topicWeight: 1
  },
];