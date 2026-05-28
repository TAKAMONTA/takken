import type { Question } from "@/lib/types/quiz";

export function normalizeQuestionText(text: string): string {
  return text.replace(/\u3000/g, " ").replace(/\s+/g, " ").trim();
}

export function uniqueQuestionsByText<T extends Pick<Question, "question">>(
  questions: T[]
): T[] {
  const seen = new Set<string>();
  const unique: T[] = [];

  for (const question of questions) {
    const normalized = normalizeQuestionText(question.question || "");

    if (!normalized) {
      unique.push(question);
      continue;
    }

    if (seen.has(normalized)) {
      continue;
    }

    seen.add(normalized);
    unique.push(question);
  }

  return unique;
}

export function shuffleQuestions<T>(questions: T[]): T[] {
  return [...questions].sort(() => Math.random() - 0.5);
}
