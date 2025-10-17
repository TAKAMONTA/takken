import { TrueFalseItem } from '@/lib/types/quiz';

export const minpouBasicQuestions_制限行為能力者: TrueFalseItem[] = [
  {
    id: "minpou_basic_制限行為能力者_1",
    law: "minpou" as const,
    statement: "未成年者は、法律行為をするには親権者の同意が必要である。",
    answer: true,
    source: {
      type: "frequency-blank" as const,
      topic: "制限行為能力者",
      year: "2024"
    },
    explanation: "未成年者は制限行為能力者として扱われ、一部の法律行為については親権者の同意が必要とされています。これは、未成年者が自己の利益を守るために必要な判断を十分にする能力が未熟であるとされるためです。",
    reference: {
      law: "民法",
      article: "第5条"
    },
    topicWeight: 1
  },
  {
    id: "minpou_basic_制限行為能力者_2",
    law: "minpou" as const,
    statement: "20歳未満の者は全て制限行為能力者である。",
    answer: false,
    source: {
      type: "frequency-blank" as const,
      topic: "制限行為能力者",
      year: "2024"
    },
    explanation: "20歳未満の者は原則的に制限行為能力者であるが、結婚や親権者の許可による成年宣言を行った者は、成年者として全面的な行為能力を有します。したがって、全ての20歳未満の者が制限行為能力者であるわけではありません。",
    reference: {
      law: "民法",
      article: "第4条、第766条、第821条"
    },
    topicWeight: 1
  }
];