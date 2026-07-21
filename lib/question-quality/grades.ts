import { Question } from "@/lib/types/quiz";
import {
  FrequencyDataset,
  getFrequencyCount,
  frequency10y,
} from "../data/past-exams/frequency";

export interface GradeOptions {
  thresholds?: { A: number; B: number };
  percentiles?: { A: number; B: number };
  method?: "threshold" | "percentile";
}

const DEFAULT_THRESHOLDS = { A: 10, B: 6 };

export function normalizeTopicKey(topic: string): string {
  return topic
    .replace(/[（(].*?[）)]/g, "")
    .replace(/・/g, "")
    .replace(/\s+/g, "")
    .trim();
}

function resolveFrequencyCount(
  question: Question,
  dataset: FrequencyDataset
): number | undefined {
  if (typeof question.frequencyCount === "number") {
    return question.frequencyCount;
  }
  if (!question.topic) return undefined;

  const direct = getFrequencyCount(question.topic, dataset);
  if (direct !== undefined) return direct;

  const normalized = normalizeTopicKey(question.topic);
  for (const [key, count] of Object.entries(dataset.data)) {
    if (normalizeTopicKey(key) === normalized) return count;
    if (key.includes(question.topic) || question.topic.includes(key)) return count;
  }
  return undefined;
}

function gradeFromCount(
  count: number | undefined,
  thresholds: { A: number; B: number }
): "A" | "B" | "C" {
  if (count === undefined) return "C";
  if (count >= thresholds.A) return "A";
  if (count >= thresholds.B) return "B";
  return "C";
}

function gradeByPercentile(
  questions: Question[],
  counts: Map<number, number | undefined>,
  percentiles: { A: number; B: number }
): Map<number, "A" | "B" | "C"> {
  const values = [...counts.values()]
    .filter((v): v is number => typeof v === "number")
    .sort((a, b) => b - a);

  const aCut =
    values.length === 0
      ? Infinity
      : values[Math.max(0, Math.floor(values.length * (percentiles.A / 100)))] ?? 0;
  const bCut =
    values.length === 0
      ? Infinity
      : values[Math.max(0, Math.floor(values.length * (percentiles.B / 100)))] ?? 0;

  const result = new Map<number, "A" | "B" | "C">();
  for (const q of questions) {
    const c = counts.get(q.id);
    if (c === undefined) result.set(q.id, "C");
    else if (c >= aCut) result.set(q.id, "A");
    else if (c >= bCut) result.set(q.id, "B");
    else result.set(q.id, "C");
  }
  return result;
}

export function assignFrequencyGrades(
  questions: Question[],
  options?: GradeOptions,
  dataset: FrequencyDataset = frequency10y
): Question[] {
  const method = options?.method ?? "threshold";
  const thresholds = options?.thresholds ?? DEFAULT_THRESHOLDS;
  const percentiles = options?.percentiles ?? { A: 30, B: 60 };

  const counts = new Map<number, number | undefined>();
  for (const q of questions) {
    counts.set(q.id, resolveFrequencyCount(q, dataset));
  }

  const percentileGrades =
    method === "percentile"
      ? gradeByPercentile(questions, counts, percentiles)
      : null;

  return questions.map((q) => {
    const count = counts.get(q.id);
    const grade =
      percentileGrades?.get(q.id) ?? gradeFromCount(count, thresholds);
    return {
      ...q,
      frequencyCount: count,
      grade,
      frequency: grade,
    };
  });
}

export function sortByGradeABC(questions: Question[]): Question[] {
  const order = { A: 0, B: 1, C: 2 } as const;
  return [...questions].sort((a, b) => {
    const ga = a.grade ? order[a.grade] : 3;
    const gb = b.grade ? order[b.grade] : 3;
    if (ga !== gb) return ga - gb;
    return (b.frequencyCount ?? 0) - (a.frequencyCount ?? 0);
  });
}

export function getGradeStats(questions: Question[]): {
  A: number;
  B: number;
  C: number;
  total: number;
} {
  const stats = { A: 0, B: 0, C: 0, total: questions.length };
  for (const q of questions) {
    if (q.grade === "A") stats.A += 1;
    else if (q.grade === "B") stats.B += 1;
    else if (q.grade === "C") stats.C += 1;
  }
  return stats;
}
