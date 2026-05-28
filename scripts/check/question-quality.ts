/**
 * 問題品質チェックスクリプト
 * 選択肢の重複など、ユーザー体験を落とすデータ品質問題を検出する。
 */

import { questionSets } from "./question-data";
import { findQuestionsWithDuplicateOptions } from "./question-quality-utils";
import {
  buildQuestionSourceIndex,
  findQuestionSourceLocations,
  formatQuestionSourceLocations,
} from "./question-source-locator";

const logger = require("../utils/logger");

const MAX_DETAILS = Number(process.env.MAX_QUESTION_QUALITY_DETAILS || 20);

function checkQuestionQuality() {
  logger.header("問題品質チェック");

  const sourceIndex = buildQuestionSourceIndex(undefined, { activeOnly: true });
  let totalFindings = 0;

  Object.entries(questionSets).forEach(([category, questions]) => {
    const duplicateOptionFindings = findQuestionsWithDuplicateOptions(questions);
    totalFindings += duplicateOptionFindings.length;

    if (duplicateOptionFindings.length === 0) {
      logger.success(category + ": 選択肢重複なし", { category });
      return;
    }

    logger.warn(category + ": " + duplicateOptionFindings.length + "問で選択肢重複を検出", {
      category,
      count: duplicateOptionFindings.length,
    });

    duplicateOptionFindings.slice(0, MAX_DETAILS).forEach((finding) => {
      const locations = findQuestionSourceLocations(
        sourceIndex,
        category,
        finding.id,
        finding.questionPreview
      );
      logger.info(
        "問題ID " +
          finding.id +
          " (" +
          formatQuestionSourceLocations(locations, 2) +
          ")",
        {
          id: finding.id,
          questionPreview: finding.questionPreview,
          duplicateOptions: finding.duplicateOptions,
        }
      );
    });

    if (duplicateOptionFindings.length > MAX_DETAILS) {
      logger.info("表示を" + MAX_DETAILS + "件に制限しました", {
        hiddenFindings: duplicateOptionFindings.length - MAX_DETAILS,
      });
    }
  });

  logger.header("問題品質チェック完了: 合計 " + totalFindings + "件");
}

checkQuestionQuality();
