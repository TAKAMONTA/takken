// AI生成問題を使用した模試用問題データ
import { Question } from '@/lib/types/quiz';
import { shuffleQuestions, uniqueQuestionsByText } from '@/lib/question-dedupe';
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
      // 本番形式模試（50問）— 本試験と完全一致の構成
      // 宅建業法20 / 民法等14 / 法令上の制限8 / 税・その他8
      questionCounts = {
        'takkengyouhou': 20,
        'minpou': 14,
        'hourei': 8,
        'zeihou': 8,
      };
      break;
    case 'speed_exam':
      // スピード模試（26問）— 短時間練習用、本番比率を維持
      questionCounts = {
        'takkengyouhou': 10,
        'minpou': 7,
        'hourei': 4,
        'zeihou': 5,
      };
      break;
    case 'review_exam':
      // 復習重視模試（20問）
      questionCounts = {
        'takkengyouhou': 8,
        'minpou': 6,
        'hourei': 3,
        'zeihou': 3,
      };
      break;
    default:
      // 既定は full_exam と同じ
      questionCounts = {
        'takkengyouhou': 20,
        'minpou': 14,
        'hourei': 8,
        'zeihou': 8,
      };
  }

  const selectedQuestions: Question[] = [];

  // カテゴリごとに問題を選択
  Object.entries(questionCounts).forEach(([category, count]) => {
    const categoryQuestions = uniqueQuestionsByText(allQuestions.filter(q => q.category === category));

    // 問題をシャッフルして指定数を選択
    const shuffled = shuffleQuestions(categoryQuestions);
    const selected = shuffled.slice(0, Math.min(count, categoryQuestions.length));

    selectedQuestions.push(...selected);
  });

  // 問題をシャッフルして返す
  return shuffleQuestions(uniqueQuestionsByText(selectedQuestions));
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
