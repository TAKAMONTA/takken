import {
  StudyStreak,
  StudyProgress,
  LearningRecord,
  UserProfile,
} from "./types";
import { Question } from "./types/quiz";
import { logger } from "./logger";
import {
  FrequencyDataset,
  getFrequencyCount,
} from "./data/past-exams/frequency";
import { allQuestions } from "./data/questions/index";

// 基本学習記録データ（一時的に空）
export const LEARNING_RECORDS: Omit<
  LearningRecord,
  "isCompleted" | "completedAt"
>[] = [];

// 新しく完了した学習記録の判定（一時的に無効化）
export function checkNewLearningRecords(
  profile: UserProfile
): LearningRecord[] {
  return [];
}

// XPとレベルの計算（一時的に無効化）
export function calculateXPAndLevel(
  questionsAnswered: number,
  correctAnswers: number,
  streakBonus: number
): { xp: number; level: number } {
  return { xp: 0, level: 1 };
}

// 学習ストリークの更新
export function updateStudyStreak(
  currentStreak: StudyStreak,
  studyDate: string
): StudyStreak {
  // ビルド時の実行を避けるため、防御的チェックを追加
  const todayISO = new Date().toISOString();
  if (!todayISO || typeof todayISO !== 'string') {
    return currentStreak;
  }
  const today = todayISO.split("T")[0];
  const lastStudyDate = currentStreak.lastStudyDate;

  if (lastStudyDate === today) {
    // 今日すでに学習済み
    return currentStreak;
  }

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayISO = yesterday.toISOString();
  if (!yesterdayISO || typeof yesterdayISO !== 'string') {
    return currentStreak;
  }
  const yesterdayStr = yesterdayISO.split("T")[0];

  let newCurrentStreak = currentStreak.currentStreak;
  let newLongestStreak = currentStreak.longestStreak;

  if (lastStudyDate === yesterdayStr) {
    // 連続学習
    newCurrentStreak += 1;
  } else if (lastStudyDate !== today) {
    // 連続が途切れた
    newCurrentStreak = 1;
  }

  newLongestStreak = Math.max(newLongestStreak, newCurrentStreak);

  const newStudyDates = [...currentStreak.studyDates];
  if (!newStudyDates.includes(today)) {
    newStudyDates.push(today);
  }

  return {
    currentStreak: newCurrentStreak,
    longestStreak: newLongestStreak,
    lastStudyDate: today,
    studyDates: newStudyDates,
  };
}

// 学習進捗の更新
export function updateStudyProgress(
  currentProgress: StudyProgress,
  questionsAnswered: number,
  correctAnswers: number,
  studyTimeMinutes: number,
  category: string
): StudyProgress {
  const newTotalQuestions = currentProgress.totalQuestions + questionsAnswered;
  const newCorrectAnswers = currentProgress.correctAnswers + correctAnswers;
  const newStudyTimeMinutes =
    currentProgress.studyTimeMinutes + studyTimeMinutes;

  const newCategoryProgress = { ...currentProgress.categoryProgress };
  if (!newCategoryProgress[category]) {
    newCategoryProgress[category] = {
      total: 0,
      correct: 0,
      timeSpent: 0,
    };
  }

  newCategoryProgress[category] = {
    total: newCategoryProgress[category].total + questionsAnswered,
    correct: newCategoryProgress[category].correct + correctAnswers,
    timeSpent: newCategoryProgress[category].timeSpent + studyTimeMinutes,
  };

  return {
    totalQuestions: newTotalQuestions,
    correctAnswers: newCorrectAnswers,
    studyTimeMinutes: newStudyTimeMinutes,
    categoryProgress: newCategoryProgress,
  };
}

// 学習データの保存
export async function saveStudyData(
  userId: string,
  questionsAnswered: number,
  correctAnswers: number,
  studyTimeMinutes: number,
  category: string
): Promise<void> {
  try {
    // ローカルストレージから現在のユーザーデータを取得
    const userDataStr = localStorage.getItem("takken_user");
    if (!userDataStr) return;

    const userData = JSON.parse(userDataStr);

    // 学習データを更新
    const updatedStreak = updateStudyStreak(
      userData.streak || {
        currentStreak: 0,
        longestStreak: 0,
        lastStudyDate: "",
        studyDates: [],
      },
      new Date().toISOString()
    );

    const updatedProgress = updateStudyProgress(
      userData.progress || {
        totalQuestions: 0,
        correctAnswers: 0,
        studyTimeMinutes: 0,
        categoryProgress: {},
      },
      questionsAnswered,
      correctAnswers,
      studyTimeMinutes,
      category
    );

    // 更新されたデータを保存
    const updatedUserData = {
      ...userData,
      streak: updatedStreak,
      progress: updatedProgress,
    };

    localStorage.setItem("takken_user", JSON.stringify(updatedUserData));
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error("学習データの保存に失敗しました", err);
    }
}

// 頻出問題の取得
export function getFrequencyQuestions(
  category: string,
  limit: number = 10
): Question[] {
  const categoryQuestions = allQuestions.filter((q) => q.category === category);

  // 頻出度順にソート（一時的に無効化）
  const sortedQuestions = categoryQuestions;

  return sortedQuestions.slice(0, limit);
}

// クイックテスト用の問題取得
export function getQuickTestQuestions(limit: number = 5): Question[] {
  const allQuestionsList = Object.values(allQuestions).flat();

  // ランダムに選択
  const shuffled = allQuestionsList.sort(() => 0.5 - Math.random());
  return shuffled.slice(0, limit);
}
