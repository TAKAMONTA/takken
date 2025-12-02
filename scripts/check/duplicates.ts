/**
 * 重複問題チェックスクリプト
 * 同じ問題文や選択肢の問題を検出
 */

import { questionsByCategory } from "../../lib/data/questions/index";
const logger = require('../utils/logger');

function checkDuplicates() {
  logger.header("重複問題チェック");

  let totalDuplicates = 0;

  Object.entries(questionsByCategory).forEach(([category, questions]) => {
    const duplicates: Array<{ q1: number; q2: number; reason: string }> = [];

    for (let i = 0; i < questions.length; i++) {
      for (let j = i + 1; j < questions.length; j++) {
        const q1 = questions[i];
        const q2 = questions[j];

        // 問題文の完全一致
        if (q1.question === q2.question) {
          duplicates.push({
            q1: q1.id,
            q2: q2.id,
            reason: "問題文が完全一致",
          });
        }
        // 問題文の類似（80%以上一致）
        else if (calculateSimilarity(q1.question, q2.question) > 0.8) {
          duplicates.push({
            q1: q1.id,
            q2: q2.id,
            reason: "問題文が類似（80%以上一致）",
          });
        }
      }
    }

    if (duplicates.length > 0) {
      logger.warn(`${category}: ${duplicates.length}組の重複を検出`, {
        category,
        duplicates,
        count: duplicates.length,
      });
      duplicates.forEach((dup) => {
        logger.debug(`問題ID ${dup.q1} と ${dup.q2}: ${dup.reason}`, {
          questionId1: dup.q1,
          questionId2: dup.q2,
          reason: dup.reason,
        });
      });
      totalDuplicates += duplicates.length;
    } else {
      logger.success(`${category}: 重複なし`, { category });
    }
  });

  logger.header(`重複チェック完了: 合計 ${totalDuplicates}組の重複`, {
    totalDuplicates,
  });
}

function calculateSimilarity(str1: string, str2: string): number {
  const longer = str1.length > str2.length ? str1 : str2;
  const shorter = str1.length > str2.length ? str2 : str1;
  if (longer.length === 0) return 1.0;
  const distance = levenshteinDistance(longer, shorter);
  return (longer.length - distance) / longer.length;
}

function levenshteinDistance(str1: string, str2: string): number {
  const matrix: number[][] = [];

  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }

  return matrix[str2.length][str1.length];
}

checkDuplicates();

