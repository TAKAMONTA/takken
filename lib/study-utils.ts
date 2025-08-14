import { StudyStreak, StudyProgress, Badge, UserProfile } from './types';

// 基本バッジデータ
export const BADGES: Omit<Badge, 'acquired' | 'acquiredAt'>[] = [
  {
    id: 'first-study',
    name: '学習開始',
    description: '初めての学習を完了',
    icon: '🎯',
    category: 'achievement',
    condition: { type: 'questions', threshold: 1 }
  },
  {
    id: 'streak-3',
    name: '3日連続学習',
    description: '3日連続で学習を継続',
    icon: '🔥',
    category: 'streak',
    condition: { type: 'streak', threshold: 3 }
  },
  {
    id: 'streak-7',
    name: '週間学習者',
    description: '7日連続で学習を継続',
    icon: '🌟',
    category: 'streak',
    condition: { type: 'streak', threshold: 7 }
  },
  {
    id: 'questions-50',
    name: '初級学習者',
    description: '50問を解答',
    icon: '📚',
    category: 'questions',
    condition: { type: 'questions', threshold: 50 }
  },
  {
    id: 'questions-100',
    name: '中級学習者',
    description: '100問を解答',
    icon: '📖',
    category: 'questions',
    condition: { type: 'questions', threshold: 100 }
  },
  {
    id: 'accuracy-80',
    name: '精鋭学習者',
    description: '80%以上の正答率を達成',
    icon: '🎓',
    category: 'accuracy',
    condition: { type: 'accuracy', threshold: 80 }
  }
];

// 学習ストリークの更新
export function updateStudyStreak(currentStreak: StudyStreak): StudyStreak {
  const today = new Date().toISOString().split('T')[0];
  const lastStudyDate = currentStreak.lastStudyDate;
  
  // 今日すでに学習済みの場合は更新しない
  if (lastStudyDate === today) {
    return currentStreak;
  }

  // 前日に学習していた場合はストリークを継続
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];

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
    studyDates: [...new Set([...currentStreak.studyDates, today])]
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
    timeSpent: 0
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
        timeSpent: categoryProgress.timeSpent + timeSpent
      }
    }
  };
}

// 新しく獲得したバッジの判定
export function checkNewBadges(profile: UserProfile): Badge[] {
  const newBadges: Badge[] = [];
  const accuracy = (profile.progress.correctAnswers / profile.progress.totalQuestions) * 100;

  BADGES.forEach(badgeTemplate => {
    // すでに獲得済みのバッジはスキップ
    if (profile.badges.some(b => b.id === badgeTemplate.id)) {
      return;
    }

    let achieved = false;
    switch (badgeTemplate.condition.type) {
      case 'questions':
        achieved = profile.progress.totalQuestions >= badgeTemplate.condition.threshold;
        break;
      case 'streak':
        achieved = profile.streak.currentStreak >= badgeTemplate.condition.threshold;
        break;
      case 'time':
        achieved = profile.progress.studyTimeMinutes >= badgeTemplate.condition.threshold;
        break;
      case 'accuracy':
        achieved = accuracy >= badgeTemplate.condition.threshold;
        break;
    }

    if (achieved) {
      newBadges.push({
        ...badgeTemplate,
        acquired: true,
        acquiredAt: new Date().toISOString()
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
  localStorage.setItem('takken_rpg_user', JSON.stringify(profile));
}

// 学習データの読み込み
export function loadStudyData(): UserProfile | null {
  const savedData = localStorage.getItem('takken_rpg_user');
  return savedData ? JSON.parse(savedData) : null;
}
