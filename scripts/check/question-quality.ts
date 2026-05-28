/**
 * 問題品質チェックスクリプト
 *
 * 重要度:
 *   CRITICAL: クイズとして成立しない（exit 1 で verify:release を止める）
 *     - 選択肢重複 / 正解index範囲外 / 必須フィールド空 / カテゴリ不一致
 *     - 4択前提の選択肢不足（真偽問題は除外）
 *   WARNING: 既存データの技術的負債（exit 0、ログのみ）
 *     - ID重複: AIバッチ生成器が同IDを複数バッチで再利用。
 *       runtime dedupe (lib/question-dedupe.ts) で表示側は同一テキストを1つに絞っており
 *       ユーザー直接影響は限定的。別途リナンバーで根治予定。
 */

import { questionSets } from "./question-data";
import {
  findCategoryMismatch,
  findDuplicateIds,
  findEmptyFields,
  findInsufficientOptions,
  findInvalidCorrectAnswer,
  findQuestionsWithDuplicateOptions,
} from "./question-quality-utils";
import {
  buildQuestionSourceIndex,
  findQuestionSourceLocations,
  formatQuestionSourceLocations,
} from "./question-source-locator";

const logger = require("../utils/logger");

const MAX_DETAILS = Number(process.env.MAX_QUESTION_QUALITY_DETAILS || 20);
const MIN_OPTIONS = Number(process.env.QUESTION_QUALITY_MIN_OPTIONS || 4);

function locate(
  sourceIndex: ReturnType<typeof buildQuestionSourceIndex>,
  category: string,
  id: number,
  questionPreview: string
): string {
  const locations = findQuestionSourceLocations(
    sourceIndex,
    category,
    id,
    questionPreview
  );
  return formatQuestionSourceLocations(locations, 2);
}

interface Totals {
  critical: number;
  warnings: number;
}

function checkQuestionQuality(): Totals {
  logger.header("問題品質チェック");

  const sourceIndex = buildQuestionSourceIndex(undefined, { activeOnly: true });
  const totals: Totals = { critical: 0, warnings: 0 };

  Object.entries(questionSets).forEach(([category, questions]) => {
    let categoryCritical = 0;
    let categoryWarnings = 0;

    const duplicateOptionFindings =
      findQuestionsWithDuplicateOptions(questions);
    if (duplicateOptionFindings.length > 0) {
      categoryCritical += duplicateOptionFindings.length;
      logger.warn(
        category +
          ": [CRITICAL] " +
          duplicateOptionFindings.length +
          "問で選択肢重複",
        { category, count: duplicateOptionFindings.length }
      );
      duplicateOptionFindings.slice(0, MAX_DETAILS).forEach((finding) => {
        logger.info(
          "[選択肢重複] ID " +
            finding.id +
            " (" +
            locate(sourceIndex, category, finding.id, finding.questionPreview) +
            ")",
          finding
        );
      });
    }

    const invalidCorrectAnswerFindings = findInvalidCorrectAnswer(questions);
    if (invalidCorrectAnswerFindings.length > 0) {
      categoryCritical += invalidCorrectAnswerFindings.length;
      logger.warn(
        category +
          ": [CRITICAL] " +
          invalidCorrectAnswerFindings.length +
          "問で正解インデックスが選択肢範囲外",
        { category, count: invalidCorrectAnswerFindings.length }
      );
      invalidCorrectAnswerFindings.slice(0, MAX_DETAILS).forEach((finding) => {
        logger.info(
          "[正解index範囲外] ID " +
            finding.id +
            " correctAnswer=" +
            finding.correctAnswer +
            " optionCount=" +
            finding.optionCount +
            " (" +
            locate(sourceIndex, category, finding.id, finding.questionPreview) +
            ")",
          finding
        );
      });
    }

    const insufficientOptionsFindings = findInsufficientOptions(
      questions,
      MIN_OPTIONS
    );
    if (insufficientOptionsFindings.length > 0) {
      categoryCritical += insufficientOptionsFindings.length;
      logger.warn(
        category +
          ": [CRITICAL] " +
          insufficientOptionsFindings.length +
          "問で選択肢数が" +
          MIN_OPTIONS +
          "未満（真偽問題を除く）",
        { category, count: insufficientOptionsFindings.length }
      );
      insufficientOptionsFindings.slice(0, MAX_DETAILS).forEach((finding) => {
        logger.info(
          "[選択肢不足] ID " +
            finding.id +
            " optionCount=" +
            finding.optionCount +
            " (" +
            locate(sourceIndex, category, finding.id, finding.questionPreview) +
            ")",
          finding
        );
      });
    }

    const emptyFieldFindings = findEmptyFields(questions);
    if (emptyFieldFindings.length > 0) {
      categoryCritical += emptyFieldFindings.length;
      logger.warn(
        category +
          ": [CRITICAL] " +
          emptyFieldFindings.length +
          "問で必須フィールドが空",
        { category, count: emptyFieldFindings.length }
      );
      emptyFieldFindings.slice(0, MAX_DETAILS).forEach((finding) => {
        logger.info(
          "[空フィールド] ID " +
            finding.id +
            " missing=" +
            finding.missingFields.join(",") +
            " (" +
            locate(sourceIndex, category, finding.id, finding.questionPreview) +
            ")",
          finding
        );
      });
    }

    const categoryMismatchFindings = findCategoryMismatch(category, questions);
    if (categoryMismatchFindings.length > 0) {
      categoryCritical += categoryMismatchFindings.length;
      logger.warn(
        category +
          ": [CRITICAL] " +
          categoryMismatchFindings.length +
          "問で category フィールドが配置ディレクトリと不一致",
        { category, count: categoryMismatchFindings.length }
      );
      categoryMismatchFindings.slice(0, MAX_DETAILS).forEach((finding) => {
        logger.info(
          "[カテゴリ不一致] ID " +
            finding.id +
            " expected=" +
            finding.expectedCategory +
            " actual=" +
            finding.actualCategory +
            " (" +
            locate(sourceIndex, category, finding.id, finding.questionPreview) +
            ")",
          finding
        );
      });
    }

    // WARNING のみ: ID重複（既存技術的負債、別途リナンバー予定）
    const duplicateIdFindings = findDuplicateIds(questions);
    if (duplicateIdFindings.length > 0) {
      categoryWarnings += duplicateIdFindings.length;
      logger.warn(
        category +
          ": [WARNING] " +
          duplicateIdFindings.length +
          "件のIDが同カテゴリ内で重複（runtime dedupeで表示影響は限定的・要リナンバー）",
        { category, count: duplicateIdFindings.length }
      );
      duplicateIdFindings.slice(0, MAX_DETAILS).forEach((finding) => {
        logger.info(
          "[ID重複] ID " +
            finding.id +
            " が " +
            finding.occurrenceCount +
            " 回出現 (" +
            locate(sourceIndex, category, finding.id, "") +
            ")",
          finding
        );
      });
    }

    if (categoryCritical === 0 && categoryWarnings === 0) {
      logger.success(category + ": 問題品質チェック OK", { category });
    } else {
      logger.info(
        category +
          ": critical=" +
          categoryCritical +
          " warnings=" +
          categoryWarnings,
        { category, categoryCritical, categoryWarnings }
      );
    }

    totals.critical += categoryCritical;
    totals.warnings += categoryWarnings;
  });

  logger.header(
    "問題品質チェック完了: CRITICAL=" +
      totals.critical +
      " WARNING=" +
      totals.warnings
  );
  return totals;
}

const totals = checkQuestionQuality();
if (totals.critical > 0) {
  console.error(
    "\n問題品質チェック失敗: CRITICAL " +
      totals.critical +
      " 件。リリースをブロックします。"
  );
  process.exit(1);
}
