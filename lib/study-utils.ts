import { StudyStreak, StudyProgress, Badge, UserProfile } from "./types";
import { Question } from "./types/quiz";
import {
  FrequencyDataset,
  getFrequencyCount,
} from "./data/past-exams/frequency";
import { allQuestions } from "./data/questions/index";

// 基本バッジデータ
export const BADGES: Omit<Badge, "acquired" | "acquiredAt">[] = [
  {
    id: "first-study",
    name: "学習開始",
    description: "初めての学習を完了",
    icon: "🎯",
    category: "achievement",
    condition: { type: "questions", threshold: 1 },
  },
  {
    id: "streak-3",
    name: "3日連続学習",
    description: "3日連続で学習を継続",
    icon: "🔥",
    category: "streak",
    condition: { type: "streak", threshold: 3 },
  },
  {
    id: "streak-7",
    name: "週間学習者",
    description: "7日連続で学習を継続",
    icon: "🌟",
    category: "streak",
    condition: { type: "streak", threshold: 7 },
  },
  {
    id: "questions-50",
    name: "初級学習者",
    description: "50問を解答",
    icon: "📚",
    category: "questions",
    condition: { type: "questions", threshold: 50 },
  },
  {
    id: "questions-100",
    name: "中級学習者",
    description: "100問を解答",
    icon: "📖",
    category: "questions",
    condition: { type: "questions", threshold: 100 },
  },
  {
    id: "accuracy-80",
    name: "精鋭学習者",
    description: "80%以上の正答率を達成",
    icon: "🎓",
    category: "accuracy",
    condition: { type: "accuracy", threshold: 80 },
  },
];

// 学習ストリークの更新
export function updateStudyStreak(currentStreak: StudyStreak): StudyStreak {
  const today = new Date().toISOString().split("T")[0];
  const lastStudyDate = currentStreak.lastStudyDate;

  // 今日すでに学習済みの場合は更新しない
  if (lastStudyDate === today) {
    return currentStreak;
  }

  // 前日に学習していた場合はストリークを継続
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split("T")[0];

  let newCurrentStreak = currentStreak.currentStreak;
  if (lastStudyDate === yesterdayStr) {
    newCurrentStreak += 1;
  } else {
    newCurrentStreak = 1; // ストリークリセット
  }

  return {
    currentStreak: newCurrentStreak,
    longestStreak: Math.max(newCurrentStreak, currentStreak.longestStreak),
    lastStudyDate: today,
    studyDates: [...new Set([...currentStreak.studyDates, today])],
  };
}

// 学習進捗の更新
export function updateStudyProgress(
  currentProgress: StudyProgress,
  category: string,
  questionsAnswered: number,
  correctAnswers: number,
  timeSpent: number
): StudyProgress {
  const categoryProgress = currentProgress.categoryProgress[category] || {
    total: 0,
    correct: 0,
    timeSpent: 0,
  };

  return {
    totalQuestions: currentProgress.totalQuestions + questionsAnswered,
    correctAnswers: currentProgress.correctAnswers + correctAnswers,
    studyTimeMinutes: currentProgress.studyTimeMinutes + timeSpent,
    categoryProgress: {
      ...currentProgress.categoryProgress,
      [category]: {
        total: categoryProgress.total + questionsAnswered,
        correct: categoryProgress.correct + correctAnswers,
        timeSpent: categoryProgress.timeSpent + timeSpent,
      },
    },
  };
}

// 新しく獲得したバッジの判定
export function checkNewBadges(profile: UserProfile): Badge[] {
  const newBadges: Badge[] = [];
  const accuracy =
    (profile.progress.correctAnswers / profile.progress.totalQuestions) * 100;

  BADGES.forEach((badgeTemplate) => {
    // すでに獲得済みのバッジはスキップ
    if (profile.badges.some((b) => b.id === badgeTemplate.id)) {
      return;
    }

    let achieved = false;
    switch (badgeTemplate.condition.type) {
      case "questions":
        achieved =
          profile.progress.totalQuestions >= badgeTemplate.condition.threshold;
        break;
      case "streak":
        achieved =
          profile.streak.currentStreak >= badgeTemplate.condition.threshold;
        break;
      case "time":
        achieved =
          profile.progress.studyTimeMinutes >=
          badgeTemplate.condition.threshold;
        break;
      case "accuracy":
        achieved = accuracy >= badgeTemplate.condition.threshold;
        break;
    }

    if (achieved) {
      newBadges.push({
        ...badgeTemplate,
        acquired: true,
        acquiredAt: new Date().toISOString(),
      });
    }
  });

  return newBadges;
}

// XPとレベルの計算
export function calculateXPAndLevel(
  questionsAnswered: number,
  correctAnswers: number,
  streakBonus: number
): { xp: number; level: number } {
  // 基本XP: 正解1問につき10XP
  const baseXP = correctAnswers * 10;

  // ストリークボーナス: ストリーク日数 × 5XP
  const streakXP = streakBonus * 5;

  // 正答率ボーナス
  const accuracyRate = (correctAnswers / questionsAnswered) * 100;
  const accuracyBonus = accuracyRate >= 80 ? 50 : accuracyRate >= 60 ? 20 : 0;

  const totalXP = baseXP + streakXP + accuracyBonus;

  // レベル = XPを100で割った数の切り上げ
  const level = Math.ceil(totalXP / 100);

  return { xp: totalXP, level };
}

// 学習データの保存
export function saveStudyData(profile: UserProfile): void {
  localStorage.setItem("takken_rpg_user", JSON.stringify(profile));
}

// 学習データの読み込み
export function loadStudyData(): UserProfile | null {
  const savedData = localStorage.getItem("takken_rpg_user");
  return savedData ? JSON.parse(savedData) : null;
}

// 過去問頻度による格付け機能
export interface GradeOptions {
  // しきい値方式: A >= thresholds.A, B >= thresholds.B, C < thresholds.B
  thresholds?: { A: number; B: number };
  // パーセンタイル方式: 上位percentiles.A%をA、次のpercentiles.B%をB、残りをC
  percentiles?: { A: number; B: number };
  // デフォルトはしきい値方式
  method?: "threshold" | "percentile";
}

/**
 * 問題配列に過去問頻度による格付け（A/B/C）を付与します
 * @param questions 格付け対象の問題配列
 * @param frequencyDataset 頻度データセット（デフォルトは frequency10y）
 * @param options 格付けオプション
 * @returns 格付け済みの問題配列
 */
export function assignFrequencyGrades(
  questions: Question[],
  frequencyDataset?: FrequencyDataset,
  options: GradeOptions = {}
): Question[] {
  // デフォルトオプション
  const {
    thresholds = { A: 8, B: 4 },
    percentiles = { A: 0.2, B: 0.5 },
    method = "threshold",
  } = options;

  // 各問題に頻度カウントを付与
  const questionsWithFrequency = questions.map((q) => {
    const frequencyCount = q.topic
      ? getFrequencyCount(q.topic, frequencyDataset)
      : undefined;
    return { ...q, frequencyCount };
  });

  // 格付け方式による処理
  if (method === "percentile") {
    // パーセンタイル方式
    const validFrequencies = questionsWithFrequency
      .filter((q) => q.frequencyCount !== undefined)
      .map((q) => q.frequencyCount!)
      .sort((a, b) => b - a); // 降順

    if (validFrequencies.length === 0) {
      // 頻度データがない場合はすべてC
      return questionsWithFrequency.map((q) => ({ ...q, grade: "C" as const }));
    }

    const aThreshold =
      validFrequencies[Math.floor(validFrequencies.length * percentiles.A)] ||
      0;
    const bThreshold =
      validFrequencies[
        Math.floor(validFrequencies.length * (percentiles.A + percentiles.B))
      ] || 0;

    return questionsWithFrequency.map((q) => {
      if (q.frequencyCount === undefined) return { ...q, grade: "C" as const };
      if (q.frequencyCount >= aThreshold) return { ...q, grade: "A" as const };
      if (q.frequencyCount >= bThreshold) return { ...q, grade: "B" as const };
      return { ...q, grade: "C" as const };
    });
  } else {
    // しきい値方式（デフォルト）
    return questionsWithFrequency.map((q) => {
      if (q.frequencyCount === undefined) return { ...q, grade: "C" as const };
      if (q.frequencyCount >= thresholds.A)
        return { ...q, grade: "A" as const };
      if (q.frequencyCount >= thresholds.B)
        return { ...q, grade: "B" as const };
      return { ...q, grade: "C" as const };
    });
  }
}

/**
 * 問題配列をABC格付け順（A→B→C）でソートします
 * @param questions ソート対象の問題配列
 * @returns ABC順でソートされた問題配列
 */
export function sortByGradeABC(questions: Question[]): Question[] {
  const gradeOrder: { [key: string]: number } = { A: 0, B: 1, C: 2 };

  return [...questions].sort((a, b) => {
    const aGrade = (a.grade || "C") as "A" | "B" | "C";
    const bGrade = (b.grade || "C") as "A" | "B" | "C";

    // まずグレードで比較
    const gradeComparison = gradeOrder[aGrade] - gradeOrder[bGrade];
    if (gradeComparison !== 0) return gradeComparison;

    // グレードが同じ場合は頻度カウントの降順
    const aFreq = a.frequencyCount || 0;
    const bFreq = b.frequencyCount || 0;
    if (aFreq !== bFreq) return bFreq - aFreq;

    // 最後にIDで安定ソート
    return a.id - b.id;
  });
}

/**
 * 格付け統計を取得します
 * @param questions 統計対象の問題配列
 * @returns 格付け別の問題数統計
 */
export function getGradeStats(questions: Question[]): {
  A: number;
  B: number;
  C: number;
  total: number;
} {
  const stats: { A: number; B: number; C: number; total: number } = {
    A: 0,
    B: 0,
    C: 0,
    total: questions.length,
  };

  questions.forEach((q) => {
    const grade = (q.grade || "C") as "A" | "B" | "C";
    stats[grade]++;
  });

  return stats;
}

// ミニテスト用の問題取得関数
export function getQuickTestQuestions(
  category: string,
  count: number = 5
): Question[] {
  if (category === "mixed") {
    // 全分野からランダムに取得
    const shuffled = [...allQuestions].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
  }

  // カテゴリマッピング
  const categoryMap: { [key: string]: string } = {
    takkengyouhou: "宅建業法",
    minpou: "民法等",
    hourei: "法令上の制限",
    zeihou: "税・その他",
  };

  const categoryName = categoryMap[category];
  if (!categoryName) {
    return [];
  }

  // 指定カテゴリの問題を取得
  const categoryQuestions = allQuestions.filter(
    (q) => q.category === categoryName
  );
  const shuffled = [...categoryQuestions].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}
