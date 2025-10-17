import { TrueFalseItem } from '@/lib/types/quiz';

export const minpouBasicQuestions_共有: TrueFalseItem[] = [
  {
    id: "minpou_basic_共有_1",
    law: "minpou" as const,
    statement: "共有の持分は、必ずしも等しくなければならない。",
    answer: false,
    source: {
      type: "frequency-blank" as const,
      topic: "共有",
      year: "2024"
    },
    explanation: "共有の持分は原則として均等であるが、特約により不等にすることが可能です。つまり、共有者間で持分が異なることも可能なのです。",
    reference: {
      law: "民法",
      article: "第248条"
    },
    topicWeight: 1
  },
  {
    id: "minpou_basic_共有_2",
    law: "minpou" as const,
    statement: "共有物の一部を売却した場合、共有者全員の同意が必要である。",
    answer: true,
    source: {
      type: "frequency-blank" as const,
      topic: "共有",
      year: "2024"
    },
    explanation: "共有物の処分は、共有者全員の合意が必要とされています。例えば、共有物の一部でも売却する場合は、他の共有者全員の同意が必要となります。",
    reference: {
      law: "民法",
      article: "第251条"
    },
    topicWeight: 1
  },
];