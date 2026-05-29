/**
 * 教材内容 validator
 *
 * 目的: 各問題を Claude API に投げ、法的正確性 (条文番号 / 判例 / 法改正 / 用語) を
 * 一次評価して Markdown report に出力する。法律家による最終確認の前段。
 *
 * 設計:
 * - ANTHROPIC_API_KEY 未設定なら skip（CI で grep されてエラーにならない）
 * - デフォルトは 10 件だけ sampling（API コスト保護）
 * - --all で全件処理（544 問 × ~$0.003 ≈ $1.5）
 * - 並列度は --concurrency で制御（既定 3）
 * - 出力は docs/question-content-validation-report.md
 *
 * 使い方:
 *   ANTHROPIC_API_KEY=sk-ant-... ts-node scripts/check/question-content-validator.ts --limit=10
 *   ts-node scripts/check/question-content-validator.ts --all --output=docs/validation-full.md
 *   ts-node scripts/check/question-content-validator.ts --category=takkengyouhou
 */

import { writeFileSync } from "fs";
import { join } from "path";

import { Question } from "../../lib/types/quiz";
import { questionSets } from "./question-data";
import {
  buildQuestionSourceIndex,
  findQuestionSourceLocations,
  formatQuestionSourceLocations,
} from "./question-source-locator";

interface CliArgs {
  limit: number;
  all: boolean;
  category?: string;
  concurrency: number;
  output: string;
  model: string;
}

function parseArgs(argv: string[]): CliArgs {
  const args: CliArgs = {
    limit: 10,
    all: false,
    concurrency: 3,
    output: "docs/question-content-validation-report.md",
    model: "claude-3-5-sonnet-20241022",
  };
  for (const arg of argv) {
    if (arg === "--all") args.all = true;
    else if (arg.startsWith("--limit=")) args.limit = Number(arg.split("=")[1]);
    else if (arg.startsWith("--category=")) args.category = arg.split("=")[1];
    else if (arg.startsWith("--concurrency=")) args.concurrency = Number(arg.split("=")[1]);
    else if (arg.startsWith("--output=")) args.output = arg.split("=")[1];
    else if (arg.startsWith("--model=")) args.model = arg.split("=")[1];
  }
  if (args.all) args.limit = Number.POSITIVE_INFINITY;
  return args;
}

interface Issue {
  type: "条文番号" | "判例" | "法改正" | "用語" | "論理" | "その他";
  detail: string;
}

interface ValidationVerdict {
  status: "ok" | "issue" | "error";
  severity?: "critical" | "warning" | "info";
  issues: Issue[];
  rawResponse?: string;
}

interface ValidatedQuestion {
  category: string;
  question: Question;
  source: string;
  verdict: ValidationVerdict;
}

const SYSTEM_PROMPT = `あなたは宅地建物取引士試験 (宅建試験) のベテラン講師で、宅建業法・民法・借地借家法・法令上の制限・税法を含む不動産関連法令の専門家です。

以下に与えられる試験問題について、法的正確性を厳格に評価してください。

評価軸:
1. 条文番号: 引用されている条文番号 (民法 X 条、宅建業法 Y 条 等) は実在し、内容と一致するか
2. 判例: 引用されている判例は実在し、論点に適切か
3. 法改正: 2020 民法改正 (契約不適合責任など)、2022/2024 宅建業法改正 (電子化、電磁的方法等)、その他主要改正が反映されているか。旧法用語 (「瑕疵担保責任」「成年年齢 20 歳」など) が残っていないか
4. 用語: 業法・民法に存在しない用語が捏造されていないか (「信託口座管理義務」「冷却期間 7 日」など)
5. 論理: 正解選択肢が本当に正しいか、解説が問題と整合しているか

出力形式 (厳格に従ってください):
- 問題が無い場合: 文字列 "OK" のみ
- 問題がある場合: JSON のみを単独で返す
  {
    "severity": "critical" | "warning" | "info",
    "issues": [
      { "type": "条文番号" | "判例" | "法改正" | "用語" | "論理", "detail": "<具体的な指摘と訂正案>" }
    ]
  }

critical: 学習者を不合格にしうる致命的誤り (条文番号間違い、捏造ルール、改正未対応)
warning: 学習効果を損なう不正確 (出典不明、論点曖昧)
info: 改善余地 (補足あれば良い)`;

interface ClaudeResponseContent {
  text: string;
}
interface ClaudeResponse {
  content?: ClaudeResponseContent[];
}

async function callClaude(
  apiKey: string,
  model: string,
  userPrompt: string,
): Promise<string> {
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      max_tokens: 800,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: userPrompt }],
    }),
  });

  if (!response.ok) {
    const errBody = await response.text().catch(() => "");
    throw new Error(`Claude API error: ${response.status} ${response.statusText} ${errBody.slice(0, 200)}`);
  }

  const data = (await response.json()) as ClaudeResponse;
  return data.content?.[0]?.text || "";
}

function questionToPrompt(q: Question): string {
  return [
    `問題:`,
    q.question,
    ``,
    `選択肢:`,
    ...(q.options || []).map((o, i) => `${i}: ${o}`),
    ``,
    `正解: ${q.correctAnswer}: ${(q.options || [])[q.correctAnswer] ?? "(範囲外)"}`,
    ``,
    `解説:`,
    q.explanation || "(なし)",
    ``,
    `メタ: カテゴリ=${q.category} / 論点=${q.topic ?? "未指定"} / 出題年=${q.year ?? "未指定"}`,
  ].join("\n");
}

function parseVerdict(raw: string): ValidationVerdict {
  const trimmed = raw.trim();
  if (trimmed === "OK" || trimmed.toLowerCase() === "ok") {
    return { status: "ok", issues: [] };
  }

  const jsonMatch = trimmed.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    return {
      status: "issue",
      severity: "info",
      issues: [{ type: "その他", detail: `parse 不能: ${trimmed.slice(0, 200)}` }],
      rawResponse: trimmed,
    };
  }

  try {
    const parsed = JSON.parse(jsonMatch[0]);
    const issues: Issue[] = Array.isArray(parsed.issues)
      ? parsed.issues.map((it: unknown) => {
          const obj = it as { type?: string; detail?: string };
          const allowedTypes: Issue["type"][] = ["条文番号", "判例", "法改正", "用語", "論理", "その他"];
          const type = (allowedTypes as string[]).includes(obj.type ?? "")
            ? (obj.type as Issue["type"])
            : "その他";
          return {
            type,
            detail: typeof obj.detail === "string" ? obj.detail : JSON.stringify(obj),
          };
        })
      : [];
    const severity: ValidationVerdict["severity"] =
      parsed.severity === "critical" || parsed.severity === "warning" || parsed.severity === "info"
        ? parsed.severity
        : "info";
    return { status: "issue", severity, issues, rawResponse: trimmed };
  } catch (err) {
    return {
      status: "issue",
      severity: "info",
      issues: [{ type: "その他", detail: `JSON parse 失敗: ${(err as Error).message}` }],
      rawResponse: trimmed,
    };
  }
}

function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

async function processBatch(
  apiKey: string,
  model: string,
  batch: { category: string; question: Question; source: string }[],
): Promise<ValidatedQuestion[]> {
  return Promise.all(
    batch.map(async ({ category, question, source }) => {
      try {
        const raw = await callClaude(apiKey, model, questionToPrompt(question));
        const verdict = parseVerdict(raw);
        return { category, question, source, verdict };
      } catch (err) {
        return {
          category,
          question,
          source,
          verdict: {
            status: "error" as const,
            issues: [
              { type: "その他" as const, detail: `API エラー: ${(err as Error).message}` },
            ],
          },
        };
      }
    }),
  );
}

function renderReport(args: CliArgs, results: ValidatedQuestion[]): string {
  const total = results.length;
  const critical = results.filter((r) => r.verdict.severity === "critical").length;
  const warning = results.filter((r) => r.verdict.severity === "warning").length;
  const info = results.filter((r) => r.verdict.severity === "info").length;
  const ok = results.filter((r) => r.verdict.status === "ok").length;
  const errored = results.filter((r) => r.verdict.status === "error").length;

  const lines: string[] = [];
  lines.push(`# 教材内容検証レポート`);
  lines.push(``);
  lines.push(`- 実行モデル: \`${args.model}\``);
  lines.push(`- 対象問題数: ${total}${args.all ? " (全件)" : ` (limit=${args.limit})`}`);
  if (args.category) lines.push(`- カテゴリ: \`${args.category}\``);
  lines.push(``);
  lines.push(`## サマリ`);
  lines.push(``);
  lines.push(`| 状態 | 件数 |`);
  lines.push(`|---|---|`);
  lines.push(`| 🔴 critical | ${critical} |`);
  lines.push(`| 🟡 warning | ${warning} |`);
  lines.push(`| 🔵 info | ${info} |`);
  lines.push(`| ✅ OK | ${ok} |`);
  lines.push(`| ⚠️ API エラー | ${errored} |`);
  lines.push(``);

  const byCategory = new Map<string, ValidatedQuestion[]>();
  for (const r of results) {
    if (!byCategory.has(r.category)) byCategory.set(r.category, []);
    byCategory.get(r.category)!.push(r);
  }

  const severityOrder = { critical: 0, warning: 1, info: 2 } as const;

  for (const [category, group] of byCategory) {
    const issues = group.filter((r) => r.verdict.status === "issue");
    if (issues.length === 0) {
      lines.push(`## ${category}`);
      lines.push(``);
      lines.push(`問題なし (${group.length}件中)`);
      lines.push(``);
      continue;
    }
    lines.push(`## ${category}`);
    lines.push(``);
    lines.push(`合計 ${issues.length} 件の指摘 (検証総数 ${group.length})`);
    lines.push(``);

    issues.sort(
      (a, b) =>
        (severityOrder[a.verdict.severity ?? "info"] ?? 9) -
        (severityOrder[b.verdict.severity ?? "info"] ?? 9),
    );

    for (const r of issues) {
      const sev = r.verdict.severity ?? "info";
      const emoji = sev === "critical" ? "🔴" : sev === "warning" ? "🟡" : "🔵";
      lines.push(`### ${emoji} ID ${r.question.id} — \`${r.source}\``);
      lines.push(``);
      if (r.question.topic) lines.push(`- 論点: ${r.question.topic}`);
      lines.push(`- 問題: ${r.question.question.slice(0, 200)}${r.question.question.length > 200 ? "..." : ""}`);
      lines.push(``);
      lines.push(`| Type | Detail |`);
      lines.push(`|---|---|`);
      for (const issue of r.verdict.issues) {
        const detail = issue.detail.replace(/\|/g, "\\|").replace(/\n/g, " ");
        lines.push(`| ${issue.type} | ${detail} |`);
      }
      lines.push(``);
    }
  }

  lines.push(`---`);
  lines.push(``);
  lines.push(`*このレポートは Claude による一次評価です。実際の修正は法律家レビューを通してから行ってください。*`);
  return lines.join("\n");
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    console.error("ANTHROPIC_API_KEY が未設定です。skip します。");
    console.error("実行する場合: ANTHROPIC_API_KEY=sk-ant-... npm run check:question-content");
    process.exit(0);
  }

  console.log(`[validator] model=${args.model} limit=${args.all ? "all" : args.limit} concurrency=${args.concurrency}`);

  const sourceIndex = buildQuestionSourceIndex(undefined, { activeOnly: true });
  const tasks: { category: string; question: Question; source: string }[] = [];
  for (const [category, questions] of Object.entries(questionSets)) {
    if (args.category && args.category !== category) continue;
    for (const q of questions) {
      const locations = findQuestionSourceLocations(
        sourceIndex,
        category,
        Number(q.id),
        q.question,
      );
      tasks.push({
        category,
        question: q,
        source: formatQuestionSourceLocations(locations, 1) || "(source unknown)",
      });
      if (tasks.length >= args.limit) break;
    }
    if (tasks.length >= args.limit) break;
  }

  console.log(`[validator] 対象 ${tasks.length} 問を検証します...`);

  const results: ValidatedQuestion[] = [];
  for (const batch of chunk(tasks, args.concurrency)) {
    const verdicts = await processBatch(apiKey, args.model, batch);
    results.push(...verdicts);
    console.log(`[validator] ${results.length}/${tasks.length} 件完了`);
  }

  const report = renderReport(args, results);
  const outPath = join(process.cwd(), args.output);
  writeFileSync(outPath, report, "utf8");
  console.log(`[validator] レポートを生成しました: ${outPath}`);

  const critical = results.filter((r) => r.verdict.severity === "critical").length;
  const warning = results.filter((r) => r.verdict.severity === "warning").length;
  const ok = results.filter((r) => r.verdict.status === "ok").length;
  console.log(`[validator] サマリ: critical=${critical} warning=${warning} ok=${ok}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
