export const takkenExamConfig = {
  targetYear: 2026,
  eraYearLabel: "令和8年度",
  examName: "宅地建物取引士資格試験",
  examDate: "2026-10-18",
  examDateLabel: "2026年10月18日（日）",
  examTimeLabel: "13:00〜15:00",
  internetApplicationStart: "2026-07-01T09:30:00+09:00",
  internetApplicationEnd: "2026-07-31T23:59:00+09:00",
  internetApplicationLabel: "2026年7月1日（水）9:30〜7月31日（金）23:59",
  postalApplicationStart: "2026-07-01",
  postalApplicationEnd: "2026-07-15",
  postalApplicationLabel: "2026年7月1日（水）〜7月15日（水）",
  admissionTicketMailingDate: "2026-10-02",
  resultAnnouncementDate: "2026-11-25",
  resultAnnouncementLabel: "2026年11月25日（水）",
  sourceName: "一般財団法人 不動産適正取引推進機構",
  sourceUrl: "https://www.retio.or.jp/exam/schedule/",
  officialNoticeDate: "2026年4月1日",
  officialGazetteDateLabel: "2026年6月5日（金）予定",
  statusLabel: "予定",
} as const;

export function getExamDate(): Date {
  return new Date(`${takkenExamConfig.examDate}T13:00:00+09:00`);
}

export function getDaysUntilExam(now = new Date()): number {
  const diffMs = getExamDate().getTime() - now.getTime();
  return Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
}

export function getExamMilestones() {
  return [
    {
      date: "2026-08-31",
      title: "基礎学習完了",
      description: "全分野の基本問題を80%以上の正答率で解けるようになる",
      completed: false,
    },
    {
      date: "2026-09-30",
      title: "応用学習完了",
      description: "過去問・予想問題を70%以上の正答率で解けるようになる",
      completed: false,
    },
    {
      date: "2026-10-11",
      title: "総仕上げ完了",
      description: "模擬試験で80%以上の得点を安定して取れるようになる",
      completed: false,
    },
  ];
}
