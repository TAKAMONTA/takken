import type { Question } from "./types/quiz";
import { normalizeQuestionText, uniqueQuestionsByText } from "./question-dedupe";

/** Stable IDs start at 1_000_000 to avoid collision with legacy hardcoded ranges. */
export const STABLE_ID_BASE = 1_000_000;

/** FNV-1a 32-bit hash over a UTF-8 string. */
export function fnv1a32(input: string): number {
  let hash = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
}

/**
 * Deterministic global question ID from category + normalized question text.
 * Same (category, question) always yields the same ID regardless of load path.
 */
export function stableQuestionId(category: string, questionText: string): number {
  const key = `${category}|${normalizeQuestionText(questionText)}`;
  return STABLE_ID_BASE + (fnv1a32(key) % 1_000_000_000);
}

/**
 * Assign stable IDs to every question. On rare hash collision, appends a
 * disambiguating suffix to the hash input and retries.
 */
export function withStableQuestionIds<T extends Question>(questions: T[]): T[] {
  const usedIds = new Map<number, string>();

  return questions.map((q) => {
    const category = String(q.category || "");
    const text = q.question || "";
    let id = stableQuestionId(category, text);
    let salt = 0;

    while (usedIds.has(id)) {
      const existing = usedIds.get(id)!;
      const candidateText = normalizeQuestionText(text);
      const existingText = normalizeQuestionText(existing.split("|").slice(1).join("|"));
      if (existingText === candidateText) {
        break;
      }
      salt++;
      id = stableQuestionId(category, `${text}\0${salt}`);
    }

    usedIds.set(id, `${category}|${normalizeQuestionText(text)}`);
    return { ...q, id };
  });
}

/** Dedupe by question text, then assign globally unique stable IDs. */
export function prepareQuestionsForRuntime<T extends Question>(
  questions: T[],
): T[] {
  return withStableQuestionIds(uniqueQuestionsByText(questions));
}
