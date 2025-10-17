// AI生成問題を使用した模試用問題データ
import { Question } from '@/lib/types/quiz';
import { takkengyouhouQuestions } from './questions/takkengyouhou';
import { minpouQuestions } from './questions/minpou';
import { houreiQuestions } from './questions/hourei';
import { zeihouQuestions } from './questions/zeihou';

// 全カテゴリの問題データ
const allQuestions: Question[] = [
  ...takkengyouhouQuestions,
  ...minpouQuestions,
  ...houreiQuestions,
  ...zeihouQuestions,
];

/**
 * 模試用問題を取得する関数
 * @param mode 模試モード
 * @returns 模試用問題配列
 */
export function getMockExamQuestions(mode: string): Question[] {
  let questionCounts: { [key: string]: number };

  switch (mode) {
    case 'full_exam':
      // 本番形式模試（50問） - AI生成問題のみのため問題数を調整
      questionCounts = {
        'takkengyouhou': 10,
        'minpou': 6,
        'hourei': 5,
        'zeihou': 5
      };
      break;
    case 'speed_exam':
      // スピード模試（26問）
      questionCounts = {
        'takkengyouhou': 10,
        'minpou': 6,
        'hourei': 5,
        'zeihou': 5
      };
      break;
    case 'review_exam':
      // 復習重視模試（20問）
      questionCounts = {
        'takkengyouhou': 7,
        'minpou': 5,
        'hourei': 4,
        'zeihou': 4
      };
      break;
    default:
      questionCounts = {
        'takkengyouhou': 10,
        'minpou': 6,
        'hourei': 5,
        'zeihou': 5
      };
  }

  const selectedQuestions: Question[] = [];

  // カテゴリごとに問題を選択
  Object.entries(questionCounts).forEach(([category, count]) => {
    const categoryQuestions = allQuestions.filter(q => q.category === category);

    // 問題をシャッフルして指定数を選択
    const shuffled = [...categoryQuestions].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, Math.min(count, categoryQuestions.length));

    selectedQuestions.push(...selected);
  });

  // 問題をシャッフルして返す
  return selectedQuestions.sort(() => Math.random() - 0.5);
}

/**
 * AI生成問題の統計情報を取得
 */
export function getQuestionStats() {
  const stats = {
    takkengyouhou: takkengyouhouQuestions.length,
    minpou: minpouQuestions.length,
    hourei: houreiQuestions.length,
    zeihou: zeihouQuestions.length,
    total: allQuestions.length
  };

  return stats;
}

/**
 * カテゴリ別の問題を取得
 */
export function getQuestionsByCategory(category: string): Question[] {
  return allQuestions.filter(q => q.category === category);
}

/**
 * 全問題を取得
 */
export function getAllQuestions(): Question[] {
  return [...allQuestions];
}

// 下位互換性のためのエイリアス
export const getR7QuestionStats = getQuestionStats;
export const getR7QuestionsByCategory = getQuestionsByCategory;
export const getAllR7Questions = getAllQuestions;
