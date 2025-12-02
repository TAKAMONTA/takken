/**
 * 問題データの遅延読み込みユーティリティ
 * 
 * Next.jsの静的エクスポート環境でも動作するように設計
 * 問題データを必要になった時点で読み込む
 */

import { Question } from '@/lib/types/quiz';
import { logger } from '@/lib/logger';

type QuestionLoader = () => Promise<Question[]>;
type QuestionArrayGetter = () => Question[];

/**
 * カテゴリ別の問題データローダー
 */
const questionLoaders: Record<string, QuestionLoader | QuestionArrayGetter> = {
  takkengyouhou: async () => {
    const module = await import('../takkengyouhou/index');
    return module.takkengyouhouQuestions;
  },
  minpou: async () => {
    const module = await import('../minpou/index');
    return module.minpouQuestions;
  },
  hourei: async () => {
    const module = await import('../hourei/index');
    return module.houreiQuestions;
  },
  zeihou: async () => {
    const module = await import('../zeihou/index');
    return module.zeihouQuestions;
  },
};

/**
 * キャッシュされた問題データ
 */
const questionCache: Record<string, Question[]> = {};

/**
 * カテゴリ別の問題データを取得（キャッシュ付き）
 */
export async function getQuestionsByCategoryLazy(
  category: string
): Promise<Question[]> {
  // キャッシュがある場合は即座に返す
  if (questionCache[category]) {
    return questionCache[category];
  }

  // ローダーが見つからない場合は空配列を返す
  const loader = questionLoaders[category];
  if (!loader) {
    logger.warn(`No loader found for category: ${category}`);
    return [];
  }

  try {
    // 動的インポートまたは直接読み込み
    const questions = await Promise.resolve(loader());
    
    // キャッシュに保存
    questionCache[category] = questions;
    
    return questions;
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    logger.error(`Error loading questions for category ${category}`, err);
    return [];
  }
}

/**
 * 複数カテゴリの問題データを一度に取得
 */
export async function getQuestionsByCategoriesLazy(
  categories: string[]
): Promise<Record<string, Question[]>> {
  const results: Record<string, Question[]> = {};
  
  await Promise.all(
    categories.map(async (category) => {
      results[category] = await getQuestionsByCategoryLazy(category);
    })
  );
  
  return results;
}

/**
 * 全カテゴリの問題データを取得
 */
export async function getAllQuestionsLazy(): Promise<Question[]> {
  const categories = Object.keys(questionLoaders);
  const categoryQuestions = await getQuestionsByCategoriesLazy(categories);
  
  return Object.values(categoryQuestions).flat();
}

/**
 * キャッシュをクリア
 */
export function clearQuestionCache(category?: string): void {
  if (category) {
    delete questionCache[category];
  } else {
    Object.keys(questionCache).forEach((key) => {
      delete questionCache[key];
    });
  }
}

/**
 * キャッシュの状態を取得
 */
export function getCacheStatus(): Record<string, boolean> {
  return Object.keys(questionLoaders).reduce((acc, category) => {
    acc[category] = category in questionCache;
    return acc;
  }, {} as Record<string, boolean>);
}

