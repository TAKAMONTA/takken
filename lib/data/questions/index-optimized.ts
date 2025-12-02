/**
 * 問題データの統合管理ファイル（最適化版）
 * 
 * 動的インポートを使用して、必要な時だけ問題データを読み込む
 * これにより、初期バンドルサイズを削減し、ビルド時間を短縮
 */

import { Question } from "@/lib/types/quiz";
import { getQuestionsByCategoryLazy, getAllQuestionsLazy } from "./utils/lazy-loader";

// カテゴリ情報（軽量なので静的にインポート）
export const categoryInfo = {
  takkengyouhou: {
    name: "宅建業法",
    description: "宅地建物取引業法に関する問題",
    targetQuestions: 20,
    color: "#3B82F6",
  },
  minpou: {
    name: "民法等",
    description: "民法、借地借家法、区分所有法等に関する問題",
    targetQuestions: 14,
    color: "#10B981",
  },
  hourei: {
    name: "法令上の制限",
    description: "都市計画法、建築基準法等に関する問題",
    targetQuestions: 8,
    color: "#F59E0B",
  },
  zeihou: {
    name: "税・その他",
    description: "税法、不動産鑑定評価基準等に関する問題",
    targetQuestions: 8,
    color: "#EF4444",
  },
};

/**
 * カテゴリ別問題データの統合（遅延読み込み）
 * 実際のデータは必要になった時点で読み込まれる
 */
export const questionsByCategory: {
  [key: string]: Question[] | Promise<Question[]>;
} = {
  takkengyouhou: getQuestionsByCategoryLazy("takkengyouhou"),
  minpou: getQuestionsByCategoryLazy("minpou"),
  hourei: getQuestionsByCategoryLazy("hourei"),
  zeihou: getQuestionsByCategoryLazy("zeihou"),
  cho_shokyu: Promise.resolve([]),
  cho_shokyu_extra: Promise.resolve([]),
};

/**
 * 全問題データの統合（遅延読み込み）
 */
export const allQuestions: Promise<Question[]> = getAllQuestionsLazy();

/**
 * カテゴリ別の問題データを取得（同期版 - レガシー対応）
 * 注意: この関数はPromiseを返すので、async/awaitが必要
 */
export async function getQuestionsByCategory(
  category: string
): Promise<Question[]> {
  const questions = questionsByCategory[category];
  
  if (questions instanceof Promise) {
    return questions;
  }
  
  return questions || [];
}

/**
 * 全問題データを取得（同期版 - レガシー対応）
 */
export async function getAllQuestions(): Promise<Question[]> {
  return allQuestions;
}

/**
 * 難易度別の問題取得
 */
export async function getQuestionsByDifficulty(
  difficulty: string
): Promise<Question[]> {
  const all = await getAllQuestions();
  return all.filter((q) => q.difficulty === difficulty);
}

/**
 * 年度別の問題取得
 */
export async function getQuestionsByYear(year: string): Promise<Question[]> {
  const all = await getAllQuestions();
  return all.filter((q) => q.year === year);
}

/**
 * カテゴリと難易度による問題取得
 */
export async function getQuestionsByCategoryAndDifficulty(
  category: string,
  difficulty: string
): Promise<Question[]> {
  const categoryQuestions = await getQuestionsByCategory(category);
  return categoryQuestions.filter((q) => q.difficulty === difficulty);
}

/**
 * ランダムな問題取得
 */
export async function getRandomQuestions(
  category?: string,
  count: number = 10
): Promise<Question[]> {
  const sourceQuestions = category
    ? await getQuestionsByCategory(category)
    : await getAllQuestions();
  const shuffled = [...sourceQuestions].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

/**
 * 一時的に無効化された機能（過去問頻度による格付け）
 */
export const getAllQuestionsWithGrades = async (options?: {
  thresholds?: { A: number; B: number };
  percentiles?: { A: number; B: number };
  method?: "threshold" | "percentile";
}): Promise<Question[]> => {
  return getAllQuestions();
};

export const getCategoryQuestionsWithGrades = async (
  category: string,
  options?: {
    thresholds?: { A: number; B: number };
    percentiles?: { A: number; B: number };
    method?: "threshold" | "percentile";
  }
): Promise<Question[]> => {
  return getQuestionsByCategory(category);
};

export const getQuestionsSortedByGrade = async (
  category?: string,
  options?: {
    thresholds?: { A: number; B: number };
    percentiles?: { A: number; B: number };
    method?: "threshold" | "percentile";
  }
): Promise<Question[]> => {
  const questions = category
    ? await getCategoryQuestionsWithGrades(category, options)
    : await getAllQuestionsWithGrades(options);
  return questions;
};

export const getQuestionGradeStats = async (
  category?: string,
  options?: {
    thresholds?: { A: number; B: number };
    percentiles?: { A: number; B: number };
    method?: "threshold" | "percentile";
  }
): Promise<{ A: number; B: number; C: number; total: number }> => {
  return { A: 0, B: 0, C: 0, total: 0 };
};

export const getQuestionsByGrade = async (
  grade: "A" | "B" | "C",
  category?: string,
  options?: {
    thresholds?: { A: number; B: number };
    percentiles?: { A: number; B: number };
    method?: "threshold" | "percentile";
  }
): Promise<Question[]> => {
  const questions = category
    ? await getCategoryQuestionsWithGrades(category, options)
    : await getAllQuestionsWithGrades(options);
  return questions.filter((q) => q.grade === grade);
};

