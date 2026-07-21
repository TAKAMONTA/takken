/**
 * 短い／崩れた解説の一括リライト（解説のみ）
 * 呼び出し: package.json → npm run rewrite:explanations
 * 既存同目的: なし（improve:question-quality は評価中心）
 * 出力: scripts/check/reports/explanation-rewrites.json
 *   { scannedAt: "2026-07-19T00:00:00.000Z", rewrites: [{ questionId, beforeLen, after, status }] }
 * 指示: Implement the plan as specified... Do NOT edit the plan file itself.
 */

import * as fs from "fs";
import * as path from "path";
import { Question } from "../../lib/types/quiz";
import {
  auditQuestions,
  hasStandardExplanationFormat,
  SHORT_EXPLANATION_CHARS,
} from "../../lib/question-quality/audit";
import { aiClient } from "../../lib/ai-client";

const MAX_REWRITE = Number(process.env.EXPLANATION_REWRITE_LIMIT || "30");

async function loadPublished(): Promise<Question[]> {
  const cats = ["takkengyouhou", "minpou", "hourei", "zeihou"] as const;
  const all: Question[] = [];
  for (const name of cats) {
    const mod = require(`../../lib/data/questions/${name}/index`);
    all.push(...(mod[`${name}Questions`] || []));
  }
  return all;
}

async function rewriteExplanation(q: Question): Promise<string> {
  const prompt = `次の宅建問題の解説だけを、標準フォーマットで書き直してください。
問題文・選択肢・正解番号は変えない前提です。

問題: ${q.question}
選択肢: ${q.options.map((o, i) => `${i + 1}. ${o}`).join("\n")}
正解番号（0始まり）: ${q.correctAnswer}
既存解説: ${q.explanation}

出力は解説本文のみ。必ず次の見出しを含めること:
【正解】
【各選択肢の解説】
【ポイント】

架空の制度は書かない。重要事項説明は35条、契約書面は37条を混同しない。`;

  const response = await aiClient.chat(
    [
      {
        role: "system",
        content:
          "宅建試験の解説作成者です。法的に正確で分かりやすい解説だけを出力します。",
      },
      { role: "user", content: prompt },
    ],
    { temperature: 0.3, maxTokens: 1200 }
  );
  return response.content.trim();
}

async function main() {
  console.log("=== 解説リライト ===\n");
  if (!process.env.OPENAI_API_KEY && !process.env.ANTHROPIC_API_KEY) {
    console.error("APIキーがありません");
    process.exit(1);
  }

  const questions = await loadPublished();
  const audit = auditQuestions(questions);
  const targetIds = [
    ...new Set(
      audit.issues
        .filter(
          (i) =>
            i.code === "short_explanation" ||
            i.code === "format_incomplete" ||
            i.code === "placeholder_explanation"
        )
        .map((i) => i.questionId)
    ),
  ].slice(0, MAX_REWRITE);

  const targets = questions.filter((q) => targetIds.includes(q.id));
  console.log(`対象: ${targets.length} 問`);

  const rewrites: Array<{
    questionId: number;
    category: string;
    beforeLen: number;
    after: string;
    status: "ok" | "failed" | "unchanged";
  }> = [];

  for (const q of targets) {
    try {
      const after = await rewriteExplanation(q);
      const ok =
        after.length >= SHORT_EXPLANATION_CHARS &&
        hasStandardExplanationFormat(after);
      rewrites.push({
        questionId: q.id,
        category: q.category,
        beforeLen: q.explanation?.length ?? 0,
        after,
        status: ok ? "ok" : "unchanged",
      });
      console.log(`id=${q.id}: ${ok ? "ok" : "unchanged"} (${after.length}字)`);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.error(`id=${q.id}: ${message}`);
      rewrites.push({
        questionId: q.id,
        category: q.category,
        beforeLen: q.explanation?.length ?? 0,
        after: "",
        status: "failed",
      });
    }
  }

  const outDir = path.join(process.cwd(), "scripts", "check", "reports");
  fs.mkdirSync(outDir, { recursive: true });
  const outPath = path.join(outDir, "explanation-rewrites.json");
  fs.writeFileSync(
    outPath,
    JSON.stringify(
      {
        scannedAt: new Date().toISOString(),
        summary: {
          ok: rewrites.filter((r) => r.status === "ok").length,
          failed: rewrites.filter((r) => r.status === "failed").length,
          unchanged: rewrites.filter((r) => r.status === "unchanged").length,
        },
        rewrites,
      },
      null,
      2
    ),
    "utf8"
  );
  console.log(`\nレポート: ${outPath}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
