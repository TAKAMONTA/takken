import { DuplicateQuestionGroup } from "./duplicate-utils";
import { QuestionSourceLocation } from "./question-source-locator";

export interface DuplicateQuestionTarget {
  id: number;
  locations: QuestionSourceLocation[];
}

export interface DuplicateQuestionReportGroup extends DuplicateQuestionGroup {
  keepTarget: DuplicateQuestionTarget;
  removeTargets: DuplicateQuestionTarget[];
}

export interface DuplicateQuestionReportCategory {
  category: string;
  groupCount: number;
  pairCount: number;
  groups: DuplicateQuestionReportGroup[];
}

export interface DuplicateQuestionReport {
  generatedAt: string;
  mode: string;
  totalGroups: number;
  totalPairs: number;
  categories: DuplicateQuestionReportCategory[];
}

function formatLocations(locations: QuestionSourceLocation[]): string[] {
  if (locations.length === 0) return ["  - source unknown"];

  return locations.map((location) => "  - " + location.file + ":" + location.line);
}

function formatTarget(target: DuplicateQuestionTarget): string[] {
  return ["- ID: " + target.id, ...formatLocations(target.locations)];
}

export function formatDuplicateMarkdownReport(
  report: DuplicateQuestionReport
): string {
  const lines: string[] = [
    "# 重複問題レポート",
    "",
    "- 生成日時: " + report.generatedAt,
    "- 判定モード: " + report.mode,
    "- 合計: " + report.totalGroups + "グループ / " + report.totalPairs + "組",
    "",
    "基本方針: `残す` の問題を維持し、`削除候補` のソース位置を確認して重複を取り除く。",
    "",
  ];

  for (const category of report.categories) {
    lines.push(
      "## " + category.category,
      "",
      "- 小計: " + category.groupCount + "グループ / " + category.pairCount + "組",
      ""
    );

    category.groups.forEach((group, index) => {
      lines.push(
        "### グループ " + (index + 1),
        "",
        "- 問題文: " + group.questionPreview,
        "- 重複ID: " + group.ids.join(", "),
        "- 残す: " + group.keepId,
        ""
      );
      lines.push(...formatLocations(group.keepTarget.locations), "", "削除候補:", "");

      for (const target of group.removeTargets) {
        lines.push(...formatTarget(target), "");
      }
    });
  }

  return lines.join("\n").trimEnd() + "\n";
}
