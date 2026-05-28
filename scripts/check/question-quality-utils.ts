import { Question } from "../../lib/types/quiz";

export interface DuplicateOptionFinding {
  id: number;
  questionPreview: string;
  duplicateOptions: string[];
}

function normalizeOption(option: string): string {
  return option.replace(/\u3000/g, " ").trim().replace(/\s+/g, " ");
}

function preview(text: string): string {
  const normalized = normalizeOption(text);
  return normalized.length > 80 ? normalized.slice(0, 77) + "..." : normalized;
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
