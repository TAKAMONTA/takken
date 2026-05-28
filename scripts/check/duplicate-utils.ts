import { Question } from "../../lib/types/quiz";

export interface DuplicateQuestion {
  q1: number;
  q2: number;
  reason: string;
}

export interface DuplicateQuestionGroup {
  ids: number[];
  keepId: number;
  removeIds: number[];
  duplicateCount: number;
  questionPreview: string;
  questionText: string;
}

export interface DuplicateOptions {
  includeSimilar: boolean;
  similarityThreshold?: number;
}

interface DuplicateCandidate {
  id: number;
  score: number;
  order: number;
}

interface DuplicateGroupBuilder {
  ids: number[];
  candidates: DuplicateCandidate[];
  questionPreview: string;
  questionText: string;
}

function normalizeQuestionText(text: string): string {
  return text.replace(/\u3000/g, " ").trim().replace(/\s+/g, " ");
}

function normalizeOptions(options: Question["options"]): string[] {
  return (options || []).map((option) => normalizeQuestionText(String(option)));
}

function getContentFingerprint(question: Question): string {
  return JSON.stringify({
    question: normalizeQuestionText(question.question),
    options: normalizeOptions(question.options),
    correctAnswer: question.correctAnswer,
  });
}

function getChoiceFingerprint(question: Question): string {
  return JSON.stringify({
    options: normalizeOptions(question.options),
    correctAnswer: question.correctAnswer,
  });
}

function getFrequencyScore(value?: "A" | "B" | "C"): number {
  if (value === "A") return 30;
  if (value === "B") return 20;
  if (value === "C") return 10;
  return 0;
}

function getQuestionMetadataScore(question: Question): number {
  return (
    (question.topic ? 50 : 0) +
    getFrequencyScore(question.frequency) +
    getFrequencyScore(question.grade) +
    (question.frequencyCount ?? 0) +
    Math.min(question.explanation?.length ?? 0, 1000) / 100 +
    ((question.relatedArticles?.length ?? 0) * 5) +
    ((question.keyTerms?.length ?? 0) * 3) +
    ((question.hints?.length ?? 0) * 2)
  );
}

function selectKeepCandidate(candidates: DuplicateCandidate[]): DuplicateCandidate {
  return [...candidates].sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return a.order - b.order;
  })[0];
}

export function findDuplicateQuestions(
  questions: Question[],
  options: DuplicateOptions
): DuplicateQuestion[] {
  const duplicates: DuplicateQuestion[] = [];
  const threshold = options.similarityThreshold ?? 0.92;

  for (let i = 0; i < questions.length; i++) {
    for (let j = i + 1; j < questions.length; j++) {
      const q1 = questions[i];
      const q2 = questions[j];
      if (!q1 || !q2) continue;

      const content1 = getContentFingerprint(q1);
      const content2 = getContentFingerprint(q2);
      const text1 = normalizeQuestionText(q1.question);
      const text2 = normalizeQuestionText(q2.question);

      if (content1 === content2) {
        duplicates.push({
          q1: Number(q1.id),
          q2: Number(q2.id),
          reason: "問題内容が完全一致",
        });
      } else if (
        options.includeSimilar &&
        getChoiceFingerprint(q1) === getChoiceFingerprint(q2) &&
        calculateSimilarity(text1, text2) >= threshold
      ) {
        duplicates.push({
          q1: Number(q1.id),
          q2: Number(q2.id),
          reason: `問題内容が類似（${Math.round(threshold * 100)}%以上一致）`,
        });
      }
    }
  }

  return duplicates;
}

export function findDuplicateQuestionGroups(
  questions: Question[]
): DuplicateQuestionGroup[] {
  const groups = new Map<string, DuplicateGroupBuilder>();

  questions.forEach((question, order) => {
    if (!question) return;

    const normalizedText = normalizeQuestionText(question.question);
    if (!normalizedText) return;

    const fingerprint = getContentFingerprint(question);
    const candidate: DuplicateCandidate = {
      id: Number(question.id),
      score: getQuestionMetadataScore(question),
      order,
    };
    const existing = groups.get(fingerprint);

    if (existing) {
      existing.ids.push(candidate.id);
      existing.candidates.push(candidate);
    } else {
      groups.set(fingerprint, {
        ids: [candidate.id],
        candidates: [candidate],
        questionPreview:
          normalizedText.length > 80
            ? normalizedText.slice(0, 77) + "..."
            : normalizedText,
        questionText: normalizedText,
      });
    }
  });

  return Array.from(groups.values())
    .filter((group) => group.ids.length > 1)
    .map((group) => {
      const keepCandidate = selectKeepCandidate(group.candidates);
      let removedKeep = false;
      const removeIds = group.candidates
        .filter((candidate) => {
          if (!removedKeep && candidate.order === keepCandidate.order) {
            removedKeep = true;
            return false;
          }
          return true;
        })
        .map((candidate) => candidate.id);

      return {
        ids: group.ids,
        keepId: keepCandidate.id,
        removeIds,
        duplicateCount: group.ids.length,
        questionPreview: group.questionPreview,
        questionText: group.questionText,
      };
    });
}

function calculateSimilarity(str1: string, str2: string): number {
  const longer = str1.length > str2.length ? str1 : str2;
  const shorter = str1.length > str2.length ? str2 : str1;
  if (longer.length === 0) return 1.0;
  const distance = levenshteinDistance(longer, shorter);
  return (longer.length - distance) / longer.length;
}

function levenshteinDistance(str1: string, str2: string): number {
  const matrix: number[][] = [];

  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }

  return matrix[str2.length][str1.length];
}
