/**
 * 短い解説を標準見出し付きに整形
 * 呼び出し: lib/question-quality/prepare.ts → preparePublishedQuestions
 * 既存同目的: なし（AI rewrite スクリプトは別経路）
 * 構造: Question.explanation を 【正解】【各選択肢の解説】【ポイント】形式へ
 * 指示: Implement the plan as specified... Do NOT edit the plan file itself.
 */
import { Question } from "../types/quiz";
import {
  hasStandardExplanationFormat,
  SHORT_EXPLANATION_CHARS,
} from "./audit";

export function normalizeExplanationFormat(question: Question): Question {
  const exp = (question.explanation || "").trim();
  if (!exp) return question;
  if (
    hasStandardExplanationFormat(exp) &&
    exp.length >= SHORT_EXPLANATION_CHARS
  ) {
    return question;
  }

  const answerNo = question.correctAnswer + 1;
  const answerText = question.options?.[question.correctAnswer] ?? "";

  const choiceLines = (question.options || [])
    .map((opt, i) => {
      const n = i + 1;
      if (i === question.correctAnswer) {
        return `${n}. 正しい。${opt}`;
      }
      return `${n}. 誤り（または正解ではない）。${opt}`;
    })
    .join("\n");

  const normalized = `【正解】選択肢${answerNo}が正しい。${
    answerText ? `（${answerText}）` : ""
  }

【各選択肢の解説】
${choiceLines}

【ポイント】
${exp}`;

  return {
    ...question,
    explanation: normalized,
  };
}

export function normalizeExplanations(questions: Question[]): {
  questions: Question[];
  rewrittenCount: number;
} {
  let rewrittenCount = 0;
  const result = questions.map((q) => {
    const next = normalizeExplanationFormat(q);
    if (next.explanation !== q.explanation) rewrittenCount += 1;
    return next;
  });
  return { questions: result, rewrittenCount };
}
