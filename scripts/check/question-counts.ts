/**
 * 問題数確認スクリプト
 * 各カテゴリの問題数を確認
 */

import { questionsByCategory } from "../../lib/data/questions/index";
import { Question } from "../../lib/types/quiz";
const logger = require('../utils/logger');

function checkQuestionCounts() {
  logger.header("問題数確認レポート");

  let totalQuestions = 0;

  Object.entries(questionsByCategory).forEach(([category, questions]) => {
    const count = questions.length;
    totalQuestions += count;

    // 難易度別の内訳
    const byDifficulty = (questions as Question[]).reduce((acc: Record<string, number>, q: Question) => {
      const difficulty = q.difficulty || "不明";
      acc[difficulty] = (acc[difficulty] || 0) + 1;
      return acc;
    }, {});

    logger.info(`${category}: ${count}問`, {
      category,
      total: count,
      byDifficulty,
    });
  });

  logger.success(`合計: ${totalQuestions}問`, { totalQuestions });
}

checkQuestionCounts();

