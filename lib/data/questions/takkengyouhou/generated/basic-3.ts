import { TrueFalseItem } from '@/lib/types/quiz';

export const takkengyouhouBasicQuestions_営業保証金_保証協会: TrueFalseItem[] = [
  {
    id: "takkengyouhou_basic_1",
    law: "takkengyouhou" as const,
    statement: "宅地建物取引業者は、主たる事務所に対して1,000万円、その他の事務所に対して500万円の営業保証金を供託しなければならない。",
    answer: true,
    source: {
      type: "frequency-blank" as const,
      topic: "営業保証金・保証協会",
      year: "2024"
    },
    explanation: "宅地建物取引業者は、保証協会に加盟するか、国土交通大臣に営業保証金を供託するかを選択しなければならない。供託する営業保証金の額は、主たる事務所に対して1,000万円、その他の事務所に対して500万円である。",
    reference: {
      law: "宅地建物取引業法",
      article: "34条"
    },
    topicWeight: 1
  },
];
