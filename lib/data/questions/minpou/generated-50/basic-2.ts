import { TrueFalseItem } from '@/lib/types/quiz';

export const minpouBasicQuestions_意思表示: TrueFalseItem[] = [
  {
    id: "minpou_basic_意思表示_1",
    law: "minpou" as const,
    statement: "意思表示は、相手に通報されなければ有効にならない。",
    answer: true,
    source: {
      type: "frequency-blank" as const,
      topic: "意思表示",
      year: "2024"
    },
    explanation: "意思表示は、相手に伝達されて初めてその効力を生じます。例えば、契約の申し込みは、相手に通知が到達した時点で有効になるとされています。",
    reference: {
      law: "民法",
      article: "第92条"
    },
    topicWeight: 1
  },
  {
    id: "minpou_basic_意思表示_2",
    law: "minpou" as const,
    statement: "営業所等の留守中に、その場所に手紙等により意思表示をした場合、本人が帰宅した時点で意思表示は通知されたとみなされる。",
    answer: false,
    source: {
      type: "frequency-blank" as const,
      topic: "意思表示",
      year: "2024"
    },
    explanation: "実際には、意思表示が通知されるとは、その意思表示の通知が相手方の受信用設備に到達した時点を指します。したがって、本人が帰宅してその手紙等を読んだ時点ではなく、手紙等がその場所に到達した時点で通知されたとみなされます。",
    reference: {
      law: "民法",
      article: "第92条"
    },
    topicWeight: 1
  }
];