/**
 * 弱点分野の算出（学習セッション履歴ベース）
 * 呼び出し: app/weak-points/page.tsx, app/dashboard/page.tsx
 * 既存同目的: lib/analytics.ts の analyzeWeaknesses（UI向け一覧は本ファイル）
 * データ: study_sessions_{userId} の category / questionsAnswered / correctAnswers
 * 日付: studyHistory.date は "YYYY-MM-DD"
 * 指示: Implement the plan as specified... Do NOT edit the plan file itself.
 */
import { learningAnalytics } from "@/lib/analytics";

export type CategoryId = "takkengyouhou" | "minpou" | "hourei" | "zeihou";

export interface WeaknessItem {
  id: CategoryId;
  name: string;
  icon: string;
  accuracy: number | null;
  total: number;
  correct: number;
  isDefault: boolean;
  reason: string;
}

const CATEGORY_META: Record<
  CategoryId,
  { name: string; icon: string; defaultReason: string }
> = {
  takkengyouhou: {
    name: "宅建業法",
    icon: "🏢",
    defaultReason: "出題数最多・得点源。まずはここから固めましょう",
  },
  minpou: {
    name: "民法等",
    icon: "⚖️",
    defaultReason: "範囲が広く差がつきやすい分野です",
  },
  hourei: {
    name: "法令上の制限",
    icon: "📋",
    defaultReason: "数字の暗記が効く頻出分野です",
  },
  zeihou: {
    name: "税・その他",
    icon: "💰",
    defaultReason: "範囲が狭く仕上げやすい得点源です",
  },
};

const DEFAULT_ORDER: CategoryId[] = [
  "takkengyouhou",
  "hourei",
  "zeihou",
  "minpou",
];

function normalizeCategory(raw: string): CategoryId | null {
  const key = (raw || "").toLowerCase();
  if (key === "takkengyouhou" || key.includes("業法")) return "takkengyouhou";
  if (key === "minpou" || key.includes("民法") || key.includes("権利"))
    return "minpou";
  if (key === "hourei" || key.includes("法令")) return "hourei";
  if (key === "zeihou" || key.includes("税") || key === "zei") return "zeihou";
  return null;
}

export function getWeaknessItems(
  userId: string | undefined | null
): WeaknessItem[] {
  if (!userId || typeof window === "undefined") {
    return DEFAULT_ORDER.map((id) => ({
      id,
      name: CATEGORY_META[id].name,
      icon: CATEGORY_META[id].icon,
      accuracy: null,
      total: 0,
      correct: 0,
      isDefault: true,
      reason: CATEGORY_META[id].defaultReason,
    }));
  }

  const sessions = learningAnalytics.getStudySessions(userId);
  const stats: Record<CategoryId, { total: number; correct: number }> = {
    takkengyouhou: { total: 0, correct: 0 },
    minpou: { total: 0, correct: 0 },
    hourei: { total: 0, correct: 0 },
    zeihou: { total: 0, correct: 0 },
  };

  for (const session of sessions) {
    const cat = normalizeCategory(session.category);
    if (!cat) continue;
    stats[cat].total += session.questionsAnswered || 0;
    stats[cat].correct += session.correctAnswers || 0;
  }

  const hasAny = Object.values(stats).some((s) => s.total > 0);
  if (!hasAny) {
    return DEFAULT_ORDER.map((id) => ({
      id,
      name: CATEGORY_META[id].name,
      icon: CATEGORY_META[id].icon,
      accuracy: null,
      total: 0,
      correct: 0,
      isDefault: true,
      reason: CATEGORY_META[id].defaultReason,
    }));
  }

  const items: WeaknessItem[] = (
    Object.keys(CATEGORY_META) as CategoryId[]
  ).map((id) => {
    const s = stats[id];
    const accuracy =
      s.total > 0 ? Math.round((s.correct / s.total) * 100) : null;
    let reason = CATEGORY_META[id].defaultReason;
    if (accuracy === null) {
      reason = "まだ未学習です。一度解いてみましょう";
    } else if (accuracy < 50) {
      reason = `正答率 ${accuracy}%（要集中）`;
    } else if (accuracy < 70) {
      reason = `正答率 ${accuracy}%（もう少し）`;
    } else {
      reason = `正答率 ${accuracy}%（安定）`;
    }
    return {
      id,
      name: CATEGORY_META[id].name,
      icon: CATEGORY_META[id].icon,
      accuracy,
      total: s.total,
      correct: s.correct,
      isDefault: false,
      reason,
    };
  });

  return items.sort((a, b) => {
    const scoreA = a.accuracy === null ? 65 : a.accuracy;
    const scoreB = b.accuracy === null ? 65 : b.accuracy;
    if (scoreA !== scoreB) return scoreA - scoreB;
    return DEFAULT_ORDER.indexOf(a.id) - DEFAULT_ORDER.indexOf(b.id);
  });
}

export function getTodayQuestionsAnswered(user: {
  studyHistory?: Array<{ date: string; questionsAnswered?: number }>;
} | null): number {
  if (!user?.studyHistory) return 0;
  const today = new Date().toISOString().split("T")[0];
  const record = user.studyHistory.find((r) => r.date === today);
  return record?.questionsAnswered ?? 0;
}

export function getCategoryDisplayName(id: string): string {
  const cat = normalizeCategory(id);
  return cat ? CATEGORY_META[cat].name : id;
}
