// 問題データの統合管理ファイル
import { Question } from "@/lib/types/quiz";
// 一時的にコメントアウト
// import {
//   assignFrequencyGrades,
//   sortByGradeABC,
//   getGradeStats,
// } from "@/lib/study-utils";
// ビルド時の実行を避けるため、インポートをコメントアウト
// import { frequency10y } from "@/lib/data/past-exams/frequency";
import { logger } from "@/lib/logger";

// ビルド時の実行を避けるため、問題データのインポートを動的に変更
// 静的なインポートはビルド時に実行されるため、エラーを引き起こす可能性がある

// カテゴリ別問題データの統合（動的読み込み）
export const questionsByCategory: { [key: string]: Question[] } = {
  takkengyouhou: [], // 動的に読み込まれる
  minpou: [], // 動的に読み込まれる
  hourei: [], // 動的に読み込まれる
  zeihou: [], // 動的に読み込まれる
  cho_shokyu: [], // 超初級（基礎問題）
  cho_shokyu_extra: [], // 超初級追加問題
};

// 全問題データの統合（動的読み込み）
// ビルド時には空配列を返し、実行時に動的に読み込む
export const allQuestions: Question[] = [];

// デバッグ用：各カテゴリの問題数を確認
// ビルド時の実行を避けるため、条件分岐を追加
// 問題データは動的に読み込まれるため、ここではログを出力しない

// カテゴリ情報
export const categoryInfo = {
  takkengyouhou: {
    name: "宅建業法",
    description: "宅地建物取引業法に関する問題",
    targetQuestions: 20, // 本試験での出題数
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

// 難易度別の問題取得
export const getQuestionsByDifficulty = (difficulty: string): Question[] => {
  if (!difficulty || typeof difficulty !== 'string') {
    return [];
  }
  return allQuestions.filter((q) => q && q.difficulty === difficulty);
};

// 年度別の問題取得
export const getQuestionsByYear = (year: string): Question[] => {
  if (!year || typeof year !== 'string') {
    return [];
  }
  return allQuestions.filter((q) => q && q.year === year);
};

// カテゴリと難易度による問題取得
export const getQuestionsByCategoryAndDifficulty = (
  category: string,
  difficulty: string
): Question[] => {
  const categoryQuestions = questionsByCategory[category] || [];
  return categoryQuestions.filter((q) => q.difficulty === difficulty);
};

// ランダムな問題取得
export const getRandomQuestions = (
  category?: string,
  count: number = 10
): Question[] => {
  const sourceQuestions = category
    ? (questionsByCategory[category] || [])
    : allQuestions;
  if (!sourceQuestions || !Array.isArray(sourceQuestions)) {
    return [];
  }
  const shuffled = [...sourceQuestions].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.max(0, count));
};

// 過去問頻度による格付け機能

/**
 * 全問題に過去問頻度による格付け（A/B/C）を適用した問題配列を取得
 * @param options 格付けオプション（しきい値またはパーセンタイル方式）
 * @returns 格付け済みの全問題配列
 */
export const getAllQuestionsWithGrades = (options?: {
  thresholds?: { A: number; B: number };
  percentiles?: { A: number; B: number };
  method?: "threshold" | "percentile";
}): Question[] => {
  return allQuestions; // 一時的に無効化
};

/**
 * カテゴリ別問題に格付けを適用した問題配列を取得
 * @param category カテゴリ名
 * @param options 格付けオプション
 * @returns 格付け済みのカテゴリ別問題配列
 */
export const getCategoryQuestionsWithGrades = (
  category: string,
  options?: {
    thresholds?: { A: number; B: number };
    percentiles?: { A: number; B: number };
    method?: "threshold" | "percentile";
  }
): Question[] => {
  const categoryQuestions = questionsByCategory[category] || [];
  return categoryQuestions; // 一時的に無効化
};

/**
 * ABC格付け順（A→B→C）でソートされた問題配列を取得
 * @param category カテゴリ名（省略時は全問題）
 * @param options 格付けオプション
 * @returns ABC順でソートされた格付け済み問題配列
 */
export const getQuestionsSortedByGrade = (
  category?: string,
  options?: {
    thresholds?: { A: number; B: number };
    percentiles?: { A: number; B: number };
    method?: "threshold" | "percentile";
  }
): Question[] => {
  const questions = category
    ? getCategoryQuestionsWithGrades(category, options)
    : getAllQuestionsWithGrades(options);

  return questions; // 一時的に無効化
};

/**
 * 格付け統計を取得
 * @param category カテゴリ名（省略時は全問題）
 * @param options 格付けオプション
 * @returns 格付け別の問題数統計
 */
export const getQuestionGradeStats = (
  category?: string,
  options?: {
    thresholds?: { A: number; B: number };
    percentiles?: { A: number; B: number };
    method?: "threshold" | "percentile";
  }
): { A: number; B: number; C: number; total: number } => {
  const questions = category
    ? getCategoryQuestionsWithGrades(category, options)
    : getAllQuestionsWithGrades(options);

  return { A: 0, B: 0, C: 0, total: 0 }; // 一時的に無効化
};

/**
 * 特定の格付けの問題のみを取得
 * @param grade 取得したい格付け（A/B/C）
 * @param category カテゴリ名（省略時は全問題）
 * @param options 格付けオプション
 * @returns 指定した格付けの問題配列
 */
export const getQuestionsByGrade = (
  grade: "A" | "B" | "C",
  category?: string,
  options?: {
    thresholds?: { A: number; B: number };
    percentiles?: { A: number; B: number };
    method?: "threshold" | "percentile";
  }
): Question[] => {
  const questions = category
    ? getCategoryQuestionsWithGrades(category, options)
    : getAllQuestionsWithGrades(options);

  return questions.filter((q) => q.grade === grade);
};
