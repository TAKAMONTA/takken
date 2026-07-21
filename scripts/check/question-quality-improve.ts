/**
 * AI品質評価・自動改善バッチ
 * 呼び出し: package.json → npm run improve:question-quality
 * 同目的の既存ファイル: なし（ai-question-generator の単体APIのみ）
 * 出力: scripts/check/reports/question-quality-improve.json
 *   { scannedAt: ISO8601, results: [{ questionId, scoreBefore, scoreAfter, status }] }
 * 指示: Implement the plan as specified... Do NOT edit the plan file itself.
 */

import * as fs from "fs";
import * as path from "path";
import { Question } from "../../lib/types/quiz";
import {
  auditQuestions,
  hasStandardExplanationFormat,
} from "../../lib/question-quality/audit";
import {
  aiQuestionGenerator,
  GeneratedQuestion,
} from "../../lib/ai-question-generator";

const MIN_SCORE = 4;
const MAX_TO_IMPROVE = Number(process.env.QUALITY_IMPROVE_LIMIT || "20");

function toGenerated(q: Question): GeneratedQuestion {
  return {
    id: String(q.id),
    category: q.category,
    subcategory: q.topic || q.category,
    question: q.question,
    choices: q.options,
    correctAnswer: q.correctAnswer + 1,
    explanation: q.explanation,
    difficulty:
      q.difficulty === "基礎" ? 1 : q.difficulty === "応用" ? 3 : 2,
    concepts: q.topic ? [q.topic] : [],
    targetWeakness: q.topic || "",
    generatedAt: new Date(),
    aiProvider: "audit-batch",
  };
}

async function loadPublishedQuestions(): Promise<Question[]> {
  const categories = ["takkengyouhou", "minpou", "hourei", "zeihou"] as const;
  const all: Question[] = [];
  for (const name of categories) {
    const mod = require(`../../lib/data/questions/${name}/index`);
    all.push(...(mod[`${name}Questions`] || []));
  }
  return all;
}

async function main() {
  console.log("=== AI品質改善バッチ ===\n");

  if (!process.env.OPENAI_API_KEY && !process.env.ANTHROPIC_API_KEY) {
    console.error("APIキーがありません。.env.local を確認してください。");
    process.exit(1);
  }

  const questions = await loadPublishedQuestions();
  const audit = auditQuestions(questions);

  const targetIds = [
    ...new Set(
      audit.issues
        .filter(
          (i) =>
            i.priority === "critical" ||
            i.priority === "high" ||
            i.code === "format_incomplete" ||
            i.code === "short_explanation" ||
            i.code === "placeholder_explanation"
        )
        .map((i) => i.questionId)
    ),
  ].slice(0, MAX_TO_IMPROVE);

  const targets = questions.filter((q) => targetIds.includes(q.id));
  console.log(`改善対象: ${targets.length} 問（上限 ${MAX_TO_IMPROVE}）`);

  const results: Array<{
    questionId: number;
    scoreBefore: number | null;
    scoreAfter: number | null;
    status: "improved" | "kept" | "failed" | "skipped";
    improvements: string[];
    explanationPreview?: string;
  }> = [];

  for (const q of targets) {
    const generated = toGenerated(q);
    try {
      const evaluation = await aiQuestionGenerator.evaluateQuestionQuality(
        generated,
        { failOpen: false }
      );

      if (
        evaluation.score >= MIN_SCORE &&
        hasStandardExplanationFormat(q.explanation)
      ) {
        results.push({
          questionId: q.id,
          scoreBefore: evaluation.score,
          scoreAfter: evaluation.score,
          status: "skipped",
          improvements: evaluation.improvements,
        });
        console.log(`id=${q.id}: score=${evaluation.score} → skip`);
        continue;
      }

      const improved = await aiQuestionGenerator.improveQuestion(
        generated,
        evaluation.improvements.length > 0
          ? evaluation.improvements
          : [
              "法的根拠（条文）を正確に記載する",
              "解説を【正解】【各選択肢の解説】【ポイント】形式に統一する",
              "架空の制度・誤った条文番号を除去する",
            ]
      );

      const after = await aiQuestionGenerator.evaluateQuestionQuality(improved, {
        failOpen: false,
      });

      results.push({
        questionId: q.id,
        scoreBefore: evaluation.score,
        scoreAfter: after.score,
        status: after.score >= MIN_SCORE ? "improved" : "kept",
        improvements: evaluation.improvements,
        explanationPreview: improved.explanation?.slice(0, 200),
      });

      console.log(
        `id=${q.id}: ${evaluation.score} → ${after.score} (${
          after.score >= MIN_SCORE ? "improved" : "kept"
        })`
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.error(`id=${q.id}: failed — ${message}`);
      results.push({
        questionId: q.id,
        scoreBefore: null,
        scoreAfter: null,
        status: "failed",
        improvements: [message],
      });
    }
  }

  const outDir = path.join(process.cwd(), "scripts", "check", "reports");
  fs.mkdirSync(outDir, { recursive: true });
  const outPath = path.join(outDir, "question-quality-improve.json");
  fs.writeFileSync(
    outPath,
    JSON.stringify(
      {
        scannedAt: new Date().toISOString(),
        minScore: MIN_SCORE,
        results,
        summary: {
          improved: results.filter((r) => r.status === "improved").length,
          kept: results.filter((r) => r.status === "kept").length,
          failed: results.filter((r) => r.status === "failed").length,
          skipped: results.filter((r) => r.status === "skipped").length,
        },
      },
      null,
      2
    ),
    "utf8"
  );

  console.log(`\nレポート: ${outPath}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
