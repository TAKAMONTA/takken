import { Question } from "../types/quiz";
import { filterQuarantinedQuestions } from "./quarantine";
import { assignFrequencyGrades, GradeOptions } from "./grades";
import { enrichQuestions } from "./enrichment";
import { PreparedQuestionStats } from "./types";
import { normalizeExplanations } from "./normalize-explanation";
import { dedupePublishedQuestions } from "./dedupe";

export interface PrepareOptions {
  gradeOptions?: GradeOptions;
  applyQuarantine?: boolean;
  applyGrades?: boolean;
  applyEnrichment?: boolean;
  applyExplanationNormalize?: boolean;
}

/**
 * 公開用に問題配列を整える（隔離 → 解説整形 → グレード → 学習補助）
 */
export function preparePublishedQuestions(
  questions: Question[],
  options?: PrepareOptions
): { questions: Question[]; stats: PreparedQuestionStats } {
  const applyQuarantine = options?.applyQuarantine !== false;
  const applyGrades = options?.applyGrades !== false;
  const applyEnrichment = options?.applyEnrichment !== false;
  const applyExplanationNormalize = options?.applyExplanationNormalize !== false;

  let working = questions;
  let quarantined = 0;

  if (applyQuarantine) {
    const filtered = filterQuarantinedQuestions(working);
    working = filtered.published;
    quarantined = filtered.quarantined.length;
  }

  const deduped = dedupePublishedQuestions(working);
  working = deduped.questions;
  const dedupedCount = deduped.stats.removedDuplicateText;

  if (applyExplanationNormalize) {
    working = normalizeExplanations(working).questions;
  }

  let graded = 0;
  if (applyGrades) {
    working = assignFrequencyGrades(working, options?.gradeOptions);
    graded = working.filter((q) => q.grade).length;
  }

  let enriched = 0;
  if (applyEnrichment) {
    const result = enrichQuestions(working);
    working = result.questions;
    enriched = result.enrichedCount;
  }

  return {
    questions: working,
    stats: {
      input: questions.length,
      quarantined,
      deduped: dedupedCount,
      published: working.length,
      enriched,
      graded,
    },
  };
}
