import { TrueFalseItem } from '@/lib/types/quiz';

export const minpouBasicQuestions_相続: TrueFalseItem[] = [
  {
    id: "minpou_basic_相続_1",
    law: "minpou" as const,
    statement: "相続人が複数いる場合、相続人全員の同意がなければ遺産を分割することはできない。",
    answer: false,
    source: {
      type: "frequency-blank" as const,
      topic: "相続",
      year: "2024"
    },
    explanation: "民法では、遺産分割については相続人全員の同意がなくとも、相続人の一人が申し立てれば家庭裁判所に分割を請求することができます。したがって、全員の同意がなくても遺産を分割することが可能です。",
    reference: {
      law: "民法",
      article: "第892条"
    },
    topicWeight: 1
  },
];