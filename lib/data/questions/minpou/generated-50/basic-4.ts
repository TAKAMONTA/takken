import { TrueFalseItem } from '@/lib/types/quiz';

export const minpouBasicQuestions_時効: TrueFalseItem[] = [
  {
    id: "minpou_basic_時効_1",
    law: "minpou" as const,
    statement: "所有権については、20年以上の使用により時効が完成する。",
    answer: true,
    source: {
      type: "frequency-blank" as const,
      topic: "時効",
      year: "2024"
    },
    explanation: "所有権については、20年間不動産を無断で占有し続けた場合、時効によりその所有権を取得することができます。これは、不動産の平和的な占有者が一定期間その所有を継続することにより、法律の保護を受けることができるという意味です。",
    reference: {
      law: "民法",
      article: "第169条"
    },
    topicWeight: 1
  },
  {
    id: "minpou_basic_時効_2",
    law: "minpou" as const,
    statement: "債権に関する時効は、原則として10年である。",
    answer: true,
    source: {
      type: "frequency-blank" as const,
      topic: "時効",
      year: "2024"
    },
    explanation: "債権に関する時効は、原則として10年とされています。この期間が経過すると、債権者はその債権を行使することができなくなります。ただし、特別な規定がある場合は、その規定に従います。",
    reference: {
      law: "民法",
      article: "第167条"
    },
    topicWeight: 1
  },
];