import { TrueFalseItem } from '@/lib/types/quiz';

export const minpouBasicQuestions_物権変動: TrueFalseItem[] = [
  {
    id: "minpou_basic_物権変動_1",
    law: "minpou" as const,
    statement: "物権は譲渡によってのみ変動する。",
    answer: false,
    source: {
      type: "frequency-blank" as const,
      topic: "物権変動",
      year: "2024"
    },
    explanation: "物権の変動は譲渡だけでなく、相続や担保設定などによっても変動します。譲渡は物権変動の一つの形態に過ぎません。",
    reference: {
      law: "民法",
      article: "第177条"
    },
    topicWeight: 1
  },
  {
    id: "minpou_basic_物権変動_2",
    law: "minpou" as const,
    statement: "所有権移転の登記がなければ、物権の変動は生じない。",
    answer: false,
    source: {
      type: "frequency-blank" as const,
      topic: "物権変動",
      year: "2024"
    },
    explanation: "所有権移転の登記は所有権移転の対抗要件となりますが、所有権移転そのもの（物権の変動）は契約によって既に生じています。つまり、登記がないと第三者に対して効力を発揮しないだけで、物権の変動自体は生じています。",
    reference: {
      law: "民法",
      article: "第601条"
    },
    topicWeight: 1
  },
];