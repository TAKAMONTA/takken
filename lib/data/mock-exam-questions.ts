// 令和7年度予想模試用問題データ
import { Question } from '@/lib/types/quiz';
import { takkengyouhouR7Questions } from './questions/takkengyouhou/r7';
import { minpouR7Questions } from './questions/minpou/r7';
import { houreiR7Questions } from './questions/hourei/r7';
import { zeihouR7Questions } from './questions/zeihou/r7';

// 令和7年度の全問題データ
const allR7Questions: Question[] = [
  ...takkengyouhouR7Questions,
  ...minpouR7Questions,
  ...houreiR7Questions,
  ...zeihouR7Questions,
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
      // 本番形式模試（50問）
      questionCounts = {
        'takkengyouhou': 20,
        'minpou': 14,
        'hourei': 8,
        'zeihou': 8
      };
      break;
    case 'speed_exam':
      // スピード模試（40問）
      questionCounts = {
        'takkengyouhou': 16,
        'minpou': 12,
        'hourei': 6,
        'zeihou': 6
      };
      break;
    case 'review_exam':
      // 復習重視模試（30問）
      questionCounts = {
        'takkengyouhou': 12,
        'minpou': 10,
        'hourei': 4,
        'zeihou': 4
      };
      break;
    default:
      questionCounts = {
        'takkengyouhou': 20,
        'minpou': 14,
        'hourei': 8,
        'zeihou': 8
      };
  }

  const selectedQuestions: Question[] = [];

  // カテゴリごとに問題を選択
  Object.entries(questionCounts).forEach(([category, count]) => {
    const categoryQuestions = allR7Questions.filter(q => q.category === category);
    
    // 問題をシャッフルして指定数を選択
    const shuffled = [...categoryQuestions].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, Math.min(count, categoryQuestions.length));
    
    selectedQuestions.push(...selected);
  });

  // 問題をシャッフルして返す
  return selectedQuestions.sort(() => Math.random() - 0.5);
}

/**
 * 令和7年度予想問題の統計情報を取得
 */
export function getR7QuestionStats() {
  const stats = {
    takkengyouhou: takkengyouhouR7Questions.length,
    minpou: minpouR7Questions.length,
    hourei: houreiR7Questions.length,
    zeihou: zeihouR7Questions.length,
    total: allR7Questions.length
  };

  return stats;
}

/**
 * カテゴリ別の令和7年度問題を取得
 */
export function getR7QuestionsByCategory(category: string): Question[] {
  return allR7Questions.filter(q => q.category === category);
}

/**
 * 令和7年度の全問題を取得
 */
export function getAllR7Questions(): Question[] {
  return [...allR7Questions];
}
