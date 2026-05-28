import { Question } from "../../lib/types/quiz";

export interface DuplicateOptionFinding {
  id: number;
  questionPreview: string;
  duplicateOptions: string[];
}

export interface InvalidCorrectAnswerFinding {
  id: number;
  questionPreview: string;
  correctAnswer: number;
  optionCount: number;
}

export interface InsufficientOptionsFinding {
  id: number;
  questionPreview: string;
  optionCount: number;
  expectedAtLeast: number;
}

export interface EmptyFieldFinding {
  id: number;
  questionPreview: string;
  missingFields: string[];
}

export interface DuplicateIdFinding {
  id: number;
  occurrenceCount: number;
}

export interface CategoryMismatchFinding {
  id: number;
  questionPreview: string;
  expectedCategory: string;
  actualCategory: string;
}

function normalizeOption(option: string): string {
  return option.replace(/　/g, " ").trim().replace(/\s+/g, " ");
}

function preview(text: string): string {
  const normalized = normalizeOption(text || "");
  return normalized.length > 80 ? normalized.slice(0, 77) + "..." : normalized;
}

// 「正しい / 誤っている」型の真偽問題は2択が正しい設計。
// 多肢選択前提のチェックから除外する。
export function isTrueFalseQuestion(question: Question): boolean {
  const options = (question.options || []).map((o) => normalizeOption(String(o)));
  if (options.length !== 2) return false;
  const set = new Set(options);
  return set.has("正しい") && set.has("誤っている");
}

export function findQuestionsWithDuplicateOptions(
  questions: Question[]
): DuplicateOptionFinding[] {
  const findings: DuplicateOptionFinding[] = [];

  for (const question of questions) {
    const seen = new Set<string>();
    const duplicates = new Set<string>();

    for (const option of question.options || []) {
      const normalized = normalizeOption(String(option));
      if (!normalized) continue;

      if (seen.has(normalized)) {
        duplicates.add(normalized);
      } else {
        seen.add(normalized);
      }
    }

    if (duplicates.size > 0) {
      findings.push({
        id: Number(question.id),
        questionPreview: preview(question.question),
        duplicateOptions: Array.from(duplicates),
      });
    }
  }

  return findings;
}

export function findInvalidCorrectAnswer(
  questions: Question[]
): InvalidCorrectAnswerFinding[] {
  const findings: InvalidCorrectAnswerFinding[] = [];

  for (const question of questions) {
    const optionCount = (question.options || []).length;
    const correctAnswer = question.correctAnswer;

    if (
      typeof correctAnswer !== "number" ||
      !Number.isInteger(correctAnswer) ||
      correctAnswer < 0 ||
      correctAnswer >= optionCount
    ) {
      findings.push({
        id: Number(question.id),
        questionPreview: preview(question.question),
        correctAnswer,
        optionCount,
      });
    }
  }

  return findings;
}

export function findInsufficientOptions(
  questions: Question[],
  expectedAtLeast = 4
): InsufficientOptionsFinding[] {
  const findings: InsufficientOptionsFinding[] = [];

  for (const question of questions) {
    if (isTrueFalseQuestion(question)) continue;

    const options = (question.options || []).filter(
      (option) => normalizeOption(String(option || "")).length > 0
    );

    if (options.length < expectedAtLeast) {
      findings.push({
        id: Number(question.id),
        questionPreview: preview(question.question),
        optionCount: options.length,
        expectedAtLeast,
      });
    }
  }

  return findings;
}

export function findEmptyFields(questions: Question[]): EmptyFieldFinding[] {
  const findings: EmptyFieldFinding[] = [];

  for (const question of questions) {
    const missingFields: string[] = [];

    if (!normalizeOption(String(question.question || ""))) {
      missingFields.push("question");
    }

    if (!normalizeOption(String(question.explanation || ""))) {
      missingFields.push("explanation");
    }

    const options = question.options || [];
    options.forEach((option, index) => {
      if (!normalizeOption(String(option || ""))) {
        missingFields.push(`options[${index}]`);
      }
    });

    if (missingFields.length > 0) {
      findings.push({
        id: Number(question.id),
        questionPreview: preview(question.question || ""),
        missingFields,
      });
    }
  }

  return findings;
}

export function findDuplicateIds(questions: Question[]): DuplicateIdFinding[] {
  const counts = new Map<number, number>();

  for (const question of questions) {
    const id = Number(question.id);
    counts.set(id, (counts.get(id) || 0) + 1);
  }

  const findings: DuplicateIdFinding[] = [];
  counts.forEach((occurrenceCount, id) => {
    if (occurrenceCount > 1) {
      findings.push({ id, occurrenceCount });
    }
  });

  return findings.sort((a, b) => a.id - b.id);
}

export function findCategoryMismatch(
  expectedCategory: string,
  questions: Question[]
): CategoryMismatchFinding[] {
  const findings: CategoryMismatchFinding[] = [];

  for (const question of questions) {
    const actual = String(question.category || "");
    if (actual !== expectedCategory) {
      findings.push({
        id: Number(question.id),
        questionPreview: preview(question.question || ""),
        expectedCategory,
        actualCategory: actual,
      });
    }
  }

  return findings;
}
