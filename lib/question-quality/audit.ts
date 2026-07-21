import { Question } from "../types/quiz";
import { QualityIssue, QualityPriority, QualityAuditResult } from "./types";
import { QUARANTINED_QUESTION_IDS, QUARANTINE_REASONS } from "./quarantine";

const STANDARD_HEADINGS = ["【正解】", "【各選択肢の解説】", "【ポイント】"] as const;
const SHORT_EXPLANATION_CHARS = 80;

/** 重要事項説明なのに37条だけを根拠にしているパターン */
function hasArticle35_37Confusion(q: Question): boolean {
  const explanation = q.explanation || "";
  const question = q.question || "";

  // 解説が「重要事項＝37条」と誤って結びつけている場合のみ
  const wrongAttribution =
    /重要事項[\s\S]{0,30}第?37条/.test(explanation) ||
    /第?37条[\s\S]{0,30}重要事項を書面で説明/.test(explanation) ||
    /第?37条では[、,]?宅地建物取引業者は[、,]?契約の締結前に[、,]?重要事項/.test(
      explanation
    ) ||
    /第37条の規定により[\s\S]{0,40}重要事項/.test(explanation);

  // 正しい対比（35条と37条の役割分担）は除外
  const correctContrast =
    /35条.*37条|37条.*35条/.test(explanation) &&
    /(契約前|成立前|成立後|遅滞なく)/.test(explanation);

  if (correctContrast) return false;

  // 問題文が重要事項なのに解説が37条のみを根拠にする
  const qAboutImportant = /重要事項/.test(question);
  const expOnly37ForImportant =
    qAboutImportant &&
    /第?37条/.test(explanation) &&
    !/第?35条/.test(explanation);

  return wrongAttribution || expOnly37ForImportant;
}

function hasFabricatedCoolingPeriod(q: Question): boolean {
  const text = `${q.question}\n${q.explanation}`;
  if (!/冷却期間/.test(text)) return false;
  // 「ない」「存在しない」「架空」など否定している場合は教材として正しい
  if (
    /冷却期間.{0,20}(ない|存在しない|ありません)|架空.{0,10}冷却期間|冷却期間.{0,10}架空/.test(
      text
    )
  ) {
    return false;
  }
  return true;
}

const FABRICATED_TERM_CHECKS: Array<{
  test: (q: Question) => boolean;
  label: string;
}> = [{ test: hasFabricatedCoolingPeriod, label: "冷却期間" }];

function hasBrokenAllCorrectQuestion(q: Question): boolean {
  return (
    /全て正しい|すべて正しい|全選択肢が正しい/.test(q.explanation) &&
    /誤っているもの|正しくないもの/.test(q.question)
  );
}

function hasPlaceholderExplanation(q: Question): boolean {
  return /○○のため正しい|（要確認）|TODO|FIXME|仮の解説/.test(q.explanation);
}

function missingStandardFormat(q: Question): boolean {
  const exp = q.explanation || "";
  if (exp.trim().length < SHORT_EXPLANATION_CHARS) return true;
  const hasCorrect = exp.includes("【正解】") || exp.includes("【基本解説】");
  const hasChoices =
    exp.includes("【各選択肢") ||
    exp.includes("【選択肢") ||
    /[1-4][\.．:：]/.test(exp);
  return !hasCorrect || !hasChoices;
}

function pushIssue(
  issues: QualityIssue[],
  q: Question,
  priority: QualityPriority,
  code: string,
  reason: string,
  sourceHint?: string
) {
  issues.push({
    questionId: q.id,
    category: q.category,
    priority,
    code,
    reason,
    sourceHint,
  });
}

export function auditQuestion(q: Question): QualityIssue[] {
  const issues: QualityIssue[] = [];

  if (QUARANTINED_QUESTION_IDS.has(q.id)) {
    pushIssue(
      issues,
      q,
      "critical",
      "quarantined",
      QUARANTINE_REASONS[q.id] || "隔離リストに登録済み",
      "quarantine"
    );
  }

  if (!q.explanation || q.explanation.trim().length === 0) {
    pushIssue(issues, q, "critical", "empty_explanation", "解説が空です");
  } else if (q.explanation.trim().length < SHORT_EXPLANATION_CHARS) {
    pushIssue(
      issues,
      q,
      "high",
      "short_explanation",
      `解説が短すぎます（${q.explanation.trim().length}文字）`
    );
  }

  if (!q.options || q.options.length < 2) {
    pushIssue(issues, q, "critical", "bad_options", "選択肢が不足しています");
  } else if (q.correctAnswer < 0 || q.correctAnswer >= q.options.length) {
    pushIssue(
      issues,
      q,
      "critical",
      "bad_correct_index",
      `正解インデックスが無効です (${q.correctAnswer})`
    );
  }

  for (const check of FABRICATED_TERM_CHECKS) {
    if (check.test(q)) {
      pushIssue(
        issues,
        q,
        "critical",
        "fabricated_term",
        `架空・不正確な用語の疑い: ${check.label}`
      );
      break;
    }
  }

  if (hasArticle35_37Confusion(q)) {
    pushIssue(
      issues,
      q,
      "critical",
      "article_35_37_confusion",
      "重要事項説明（35条）と37条書面の混同の疑い"
    );
  }

  if (hasBrokenAllCorrectQuestion(q)) {
    pushIssue(
      issues,
      q,
      "critical",
      "broken_all_correct",
      "全肢正しいのに『誤っているものはどれか』形式"
    );
  }

  if (hasPlaceholderExplanation(q)) {
    pushIssue(
      issues,
      q,
      "high",
      "placeholder_explanation",
      "プレースホルダ解説（○○のため正しい 等）"
    );
  }

  if (
    missingStandardFormat(q) &&
    (q.explanation?.trim().length ?? 0) >= SHORT_EXPLANATION_CHARS
  ) {
    pushIssue(
      issues,
      q,
      "medium",
      "format_incomplete",
      "標準解説見出し（【正解】【各選択肢の解説】等）が不足"
    );
  }

  if (q.options) {
    const trimmed = q.options.map((o) => o.trim());
    if (new Set(trimmed).size !== trimmed.length) {
      pushIssue(issues, q, "high", "duplicate_options", "選択肢に重複があります");
    }
  }

  return issues;
}

export function auditQuestions(questions: Question[]): QualityAuditResult {
  const issues: QualityIssue[] = [];
  for (const q of questions) {
    issues.push(...auditQuestion(q));
  }

  const byPriority: Record<QualityPriority, number> = {
    critical: 0,
    high: 0,
    medium: 0,
    low: 0,
  };
  for (const issue of issues) {
    byPriority[issue.priority] += 1;
  }

  const order: Record<QualityPriority, number> = {
    critical: 0,
    high: 1,
    medium: 2,
    low: 3,
  };
  issues.sort(
    (a, b) => order[a.priority] - order[b.priority] || a.questionId - b.questionId
  );

  return {
    scannedAt: new Date().toISOString(),
    totalQuestions: questions.length,
    issueCount: issues.length,
    byPriority,
    issues,
  };
}

export function hasStandardExplanationFormat(explanation: string): boolean {
  return (
    STANDARD_HEADINGS.every((h) => explanation.includes(h)) ||
    (explanation.includes("【正解】") &&
      explanation.includes("【各選択肢") &&
      (explanation.includes("【ポイント】") ||
        explanation.includes("【重要ポイント】")))
  );
}

export { SHORT_EXPLANATION_CHARS, STANDARD_HEADINGS };
