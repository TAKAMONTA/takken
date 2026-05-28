/**
 * 重複問題チェックスクリプト
 * 同じ問題文の問題を検出する。類似判定は誤検知が多いため、必要な時だけ
 * CHECK_SIMILARITY=true で有効化する。
 */

import fs from "node:fs";
import path from "node:path";
import { questionSets } from "./question-data";
import { findDuplicateQuestionGroups, findDuplicateQuestions } from "./duplicate-utils";
import {
  buildQuestionSourceIndex,
  findQuestionSourceLocations,
  formatQuestionSourceLocations,
} from "./question-source-locator";
import {
  DuplicateQuestionReportCategory,
  DuplicateQuestionReportGroup,
  formatDuplicateMarkdownReport,
} from "./duplicate-report";

const logger = require("../utils/logger");

const MAX_DETAILS = Number(process.env.MAX_DUPLICATE_DETAILS || 20);
const MAX_GROUPS = Number(process.env.MAX_DUPLICATE_GROUPS || MAX_DETAILS);
const includeSimilar = process.env.CHECK_SIMILARITY === "true";

function getReportPath(args: string[]): string | null {
  const reportFlagIndex = args.indexOf("--report");
  if (reportFlagIndex === -1) return process.env.DUPLICATE_REPORT_PATH || null;

  const reportPath = args[reportFlagIndex + 1];
  if (!reportPath) {
    throw new Error("--report には出力先パスを指定してください");
  }
  return reportPath;
}

function formatQuestionIdWithSource(
  sourceIndex: ReturnType<typeof buildQuestionSourceIndex>,
  category: string,
  id: number,
  questionText: string
): string {
  const locations = findQuestionSourceLocations(
    sourceIndex,
    category,
    id,
    questionText
  );
  return id + " (" + formatQuestionSourceLocations(locations, 2) + ")";
}

function buildQuestionSourceTarget(
  sourceIndex: ReturnType<typeof buildQuestionSourceIndex>,
  category: string,
  id: number,
  questionText: string
) {
  return {
    id,
    locations: findQuestionSourceLocations(sourceIndex, category, id, questionText),
  };
}

function buildReportGroups(
  sourceIndex: ReturnType<typeof buildQuestionSourceIndex>,
  category: string,
  groups: ReturnType<typeof findDuplicateQuestionGroups>
): DuplicateQuestionReportGroup[] {
  return groups.map((group) => ({
    ...group,
    keepTarget: buildQuestionSourceTarget(sourceIndex, category, group.keepId, group.questionText),
    removeTargets: group.removeIds.map((id) =>
      buildQuestionSourceTarget(sourceIndex, category, id, group.questionText)
    ),
  }));
}

function writeMarkdownReport(
  reportPath: string,
  categories: DuplicateQuestionReportCategory[],
  totalGroups: number,
  totalPairs: number
): void {
  const absolutePath = path.resolve(process.cwd(), reportPath);
  fs.mkdirSync(path.dirname(absolutePath), { recursive: true });
  fs.writeFileSync(
    absolutePath,
    formatDuplicateMarkdownReport({
      generatedAt: new Date().toISOString(),
      mode: includeSimilar ? "exact+similar" : "exact",
      totalGroups,
      totalPairs,
      categories,
    })
  );
  logger.success("重複レポートを書き出しました: " + reportPath);
}

function checkDuplicates() {
  logger.header("重複問題チェック");

  const reportPath = getReportPath(process.argv.slice(2));
  const sourceIndex = buildQuestionSourceIndex(undefined, { activeOnly: true });
  const reportCategories: DuplicateQuestionReportCategory[] = [];
  let totalDuplicates = 0;
  let totalGroups = 0;

  Object.entries(questionSets).forEach(([category, questions]) => {
    const duplicates = findDuplicateQuestions(questions, {
      includeSimilar,
    });
    const duplicateGroups = findDuplicateQuestionGroups(questions);

    if (duplicates.length > 0) {
      const reportGroups = buildReportGroups(sourceIndex, category, duplicateGroups);
      reportCategories.push({
        category,
        groupCount: duplicateGroups.length,
        pairCount: duplicates.length,
        groups: reportGroups,
      });

      logger.warn(category + ": " + duplicateGroups.length + "グループ / " + duplicates.length + "組の重複候補を検出", {
        category,
        groups: duplicateGroups.length,
        pairs: duplicates.length,
        mode: includeSimilar ? "exact+similar" : "exact",
      });

      reportGroups.slice(0, MAX_GROUPS).forEach((group, index) => {
        const keepText = formatQuestionIdWithSource(
          sourceIndex,
          category,
          group.keepId,
          group.questionText
        );
        const removeText = group.removeIds
          .map((id) => formatQuestionIdWithSource(sourceIndex, category, id, group.questionText))
          .join(" / ");

        logger.info(
          "重複グループ " +
            (index + 1) +
            ": 残すID " +
            keepText +
            " / 削除候補 " +
            removeText,
          {
            ids: group.ids,
            keepId: group.keepId,
            removeIds: group.removeIds,
            duplicateCount: group.duplicateCount,
            questionPreview: group.questionPreview,
          }
        );
      });

      if (duplicateGroups.length > MAX_GROUPS) {
        logger.info("グループ表示を" + MAX_GROUPS + "件に制限しました", {
          hiddenGroups: duplicateGroups.length - MAX_GROUPS,
          maxGroups: MAX_GROUPS,
        });
      }

      totalDuplicates += duplicates.length;
      totalGroups += duplicateGroups.length;
    } else {
      logger.success(`${category}: 重複なし`, { category });
    }
  });

  if (reportPath) {
    writeMarkdownReport(reportPath, reportCategories, totalGroups, totalDuplicates);
  }

  logger.header("重複チェック完了: 合計 " + totalGroups + "グループ / " + totalDuplicates + "組の重複候補");
}

checkDuplicates();
