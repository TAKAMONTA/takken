import { TrueFalseItem } from '@/lib/types/quiz';

export const minpouBasicQuestions_抵当権: TrueFalseItem[] = [
  {
    id: "minpou_basic_抵当権_1",
    law: "minpou" as const,
    statement: "抵当権は、債権の弁済を確保するために、特定の不動産に対する優先的な弁済権を付与される権利である。",
    answer: true,
    source: {
      type: "frequency-blank" as const,
      topic: "抵当権",
      year: "2024"
    },
    explanation: "抵当権は、民法に基づき設定される担保権の一つで、不動産を担保にした場合に設定されます。債権者は債権の弁済を求めるため、抵当権を行使して不動産の売却等を行い、その代金を優先的に得ることができます。",
    reference: {
      law: "民法",
      article: "第367条"
    },
    topicWeight: 1
  },
];