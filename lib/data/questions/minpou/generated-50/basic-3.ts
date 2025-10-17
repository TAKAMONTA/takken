import { TrueFalseItem } from '@/lib/types/quiz';

export const minpouBasicQuestions_代理: TrueFalseItem[] = [
  {
    id: "minpou_basic_代理_1",
    law: "minpou" as const,
    statement: "代理人が本人のために行った法律行為は、本人に対してその効果が生じる。",
    answer: true,
    source: {
      type: "frequency-blank" as const,
      topic: "代理",
      year: "2024"
    },
    explanation: "代理人が行った法律行為は、本人のために行われるものであり、その結果は本人に影響します。したがって、代理人が契約を締結した場合、その契約は本人の契約となります。",
    reference: {
      law: "民法",
      article: "第95条"
    },
    topicWeight: 1
  },
  {
    id: "minpou_basic_代理_2",
    law: "minpou" as const,
    statement: "代理人が法律行為を行うためには、必ずしも本人からの明示的な委任が必要である。",
    answer: false,
    source: {
      type: "frequency-blank" as const,
      topic: "代理",
      year: "2024"
    },
    explanation: "民法における代理行為は、本人からの明示的な委任がなくても、事実上の委任（黙示的委任）があれば代理行為を行うことができます。つまり、本人の意向が事実上代理人に伝えられ、代理人がその意向に基づいて行動する場合、それは代理行為と認められます。",
    reference: {
      law: "民法",
      article: "第95条"
    },
    topicWeight: 1
  }
];