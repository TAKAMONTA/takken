/**
 * 問題品質監査スクリプト（ヒューリスティック）
 * npm run check:question-quality → このファイル
 * 既存の同目的: なし（validate-questions.ts は形式のみ）
 * 出力: scripts/check/reports/question-quality-audit.json
 *   { scannedAt: "2026-07-19T00:00:00.000Z", totalQuestions, issues: [{ questionId, priority, code, reason }] }
 * 指示: Implement the plan as specified, it is attached for your reference. Do NOT edit the plan file itself.
 */

import * as fs from "fs";
import * as path from "path";
import { Question } from "../../lib/types/quiz";
import { auditQuestions } from "../../lib/question-quality/audit";
import { filterQuarantinedQuestions } from "../../lib/question-quality/quarantine";

async function loadAllQuestions(): Promise<Question[]> {
  const categories = [
    "takkengyouhou",
    "minpou",
    "hourei",
    "zeihou",
  ] as const;

  const all: Question[] = [];
  for (const name of categories) {
    try {
      const mod = require(`../../lib/data/questions/${name}/index`);
      const questions: Question[] = mod[`${name}Questions`] || [];
      console.log(`Loaded ${name}: ${questions.length} questions`);
      all.push(...questions);
    } catch (err) {
      console.error(`Failed to load ${name}:`, err);
    }
  }
  return all;
}

async function main() {
  console.log("=== 問題品質監査 ===\n");

  const published = await loadAllQuestions();
  const result = auditQuestions(published);
  const { quarantined } = filterQuarantinedQuestions(published);

  const outDir = path.join(process.cwd(), "scripts", "check", "reports");
  fs.mkdirSync(outDir, { recursive: true });
  const outPath = path.join(outDir, "question-quality-audit.json");

  const report = {
    ...result,
    publishedCount: published.length,
    stillInPoolButQuarantined: quarantined.length,
    criticalQuestionIds: [
      ...new Set(
        result.issues
          .filter((i) => i.priority === "critical")
          .map((i) => i.questionId)
      ),
    ],
  };

  fs.writeFileSync(outPath, JSON.stringify(report, null, 2), "utf8");

  console.log(`総問題数（公開パイプライン経由）: ${result.totalQuestions}`);
  console.log(`指摘件数: ${result.issueCount}`);
  console.log(`  critical: ${result.byPriority.critical}`);
  console.log(`  high:     ${result.byPriority.high}`);
  console.log(`  medium:   ${result.byPriority.medium}`);
  console.log(`  low:      ${result.byPriority.low}`);
  console.log(`\nレポート: ${outPath}`);

  const top = result.issues
    .filter((i) => i.priority === "critical")
    .slice(0, 15);
  if (top.length > 0) {
    console.log("\n--- critical 上位 ---");
    for (const issue of top) {
      console.log(
        `  [${issue.category}] id=${issue.questionId} ${issue.code}: ${issue.reason}`
      );
    }
  }

  const criticalInPublished = result.issues.filter(
    (i) =>
      i.priority === "critical" &&
      i.code !== "quarantined" &&
      published.some((q) => q.id === i.questionId)
  );
  if (criticalInPublished.length > 0) {
    console.error(
      `\n公開プールに未隔離の critical が ${criticalInPublished.length} 件あります`
    );
    process.exitCode = 1;
  } else {
    console.log("\n公開プールの未隔離 critical は 0 件です");
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
