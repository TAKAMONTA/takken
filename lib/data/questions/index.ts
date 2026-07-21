/**
 * 問題データの統合管理（lazy-loader + Firestore フォールバック）
 */

import { Question } from "@/lib/types/quiz";
import { shuffleQuestions, uniqueQuestionsByText } from "@/lib/question-dedupe";
import { firestoreService } from "@/lib/firestore-service";
import { prepareQuestionsForRuntime } from "@/lib/question-identity";
import { logger } from "@/lib/logger";
import {
  getQuestionsByCategoryLazy,
  getAllQuestionsLazy,
} from "./utils/lazy-loader";

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

export const questionCategories = Object.entries(categoryInfo).reduce(
  (acc, [key, info]) => {
    acc[key] = info.name;
    return acc;
  },
  {} as Record<string, string>
);

async function loadCategoryQuestions(category: string): Promise<Question[]> {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const firestoreQuestions =
      await firestoreService.getQuestionsByCategory(category);

    if (firestoreQuestions.length > 0) {
      return prepareQuestionsForRuntime(firestoreQuestions);
    }

    return await getQuestionsByCategoryLazy(category);
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    logger.error(`Failed to load questions for category: ${category}`, err);
    return getQuestionsByCategoryLazy(category);
  }
}

export async function getQuestionsByCategory(
  category: string
): Promise<Question[]> {
  const questions = await loadCategoryQuestions(category);
  return uniqueQuestionsByText(questions);
}

export async function getAllQuestions(): Promise<Question[]> {
  if (typeof window === "undefined") {
    return [];
  }
  return uniqueQuestionsByText(await getAllQuestionsLazy());
}

export async function getQuestionsByDifficulty(
  difficulty: string
): Promise<Question[]> {
  if (!difficulty || typeof difficulty !== "string") {
    return [];
  }
  const all = await getAllQuestions();
  return uniqueQuestionsByText(all.filter((q) => q.difficulty === difficulty));
}

export async function getQuestionsByYear(year: string): Promise<Question[]> {
  if (!year || typeof year !== "string") {
    return [];
  }
  const all = await getAllQuestions();
  return all.filter((q) => q.year === year);
}

export async function getQuestionsByCategoryAndDifficulty(
  category: string,
  difficulty: string
): Promise<Question[]> {
  const categoryQuestions = await getQuestionsByCategory(category);
  return uniqueQuestionsByText(
    categoryQuestions.filter((q) => q.difficulty === difficulty)
  );
}

export async function getRandomQuestions(
  category?: string,
  count: number = 10
): Promise<Question[]> {
  const sourceQuestions = category
    ? await getQuestionsByCategory(category)
    : await getAllQuestions();
  const shuffled = shuffleQuestions(uniqueQuestionsByText(sourceQuestions));
  return shuffled.slice(0, Math.max(0, count));
}

export async function getAllQuestionsWithGrades(_options?: {
  thresholds?: { A: number; B: number };
  percentiles?: { A: number; B: number };
  method?: "threshold" | "percentile";
}): Promise<Question[]> {
  return getAllQuestions();
}

export async function getCategoryQuestionsWithGrades(
  category: string,
  _options?: {
    thresholds?: { A: number; B: number };
    percentiles?: { A: number; B: number };
    method?: "threshold" | "percentile";
  }
): Promise<Question[]> {
  return getQuestionsByCategory(category);
}

export async function getQuestionsSortedByGrade(
  category?: string,
  options?: {
    thresholds?: { A: number; B: number };
    percentiles?: { A: number; B: number };
    method?: "threshold" | "percentile";
  }
): Promise<Question[]> {
  return category
    ? getCategoryQuestionsWithGrades(category, options)
    : getAllQuestionsWithGrades(options);
}

export async function getQuestionGradeStats(
  _category?: string,
  _options?: {
    thresholds?: { A: number; B: number };
    percentiles?: { A: number; B: number };
    method?: "threshold" | "percentile";
  }
): Promise<{ A: number; B: number; C: number; total: number }> {
  return { A: 0, B: 0, C: 0, total: 0 };
}

export async function getQuestionsByGrade(
  grade: "A" | "B" | "C",
  category?: string,
  options?: {
    thresholds?: { A: number; B: number };
    percentiles?: { A: number; B: number };
    method?: "threshold" | "percentile";
  }
): Promise<Question[]> {
  const questions = category
    ? await getCategoryQuestionsWithGrades(category, options)
    : await getAllQuestionsWithGrades(options);
  return questions.filter((q) => q.grade === grade);
}

/** @deprecated 同期アクセス用。getQuestionsByCategory を使用してください。 */
export const questionsByCategory: { [key: string]: Question[] } = {
  takkengyouhou: [],
  minpou: [],
  hourei: [],
  zeihou: [],
  cho_shokyu: [],
  cho_shokyu_extra: [],
};

/** @deprecated getAllQuestions を使用してください */
export const allQuestions: Question[] = [];

export const sampleQuestions: { [key: string]: Question[] } = {
  takkengyouhou: [],
  minpou: [],
  hourei: [],
  zeihou: [],
  cho_shokyu: [],
  cho_shokyu_extra: [],
};
