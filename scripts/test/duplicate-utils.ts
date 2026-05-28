import assert from "node:assert/strict";
import {
  findDuplicateQuestionGroups,
  findDuplicateQuestions,
} from "../check/duplicate-utils";
import { Question } from "../../lib/types/quiz";

const questions: Question[] = [
  {
    id: 1,
    question: "同じ 問題",
    options: ["A", "B"],
    correctAnswer: 0,
    explanation: "first",
    category: "test",
    difficulty: "基礎",
    year: "2026",
  },
  {
    id: 2,
    question: "同じ\n問題",
    options: ["A", "B"],
    correctAnswer: 0,
    explanation: "second with a fuller explanation",
    topic: "抵当権",
    frequency: "A",
    category: "test",
    difficulty: "基礎",
    year: "2026",
  },
  {
    id: 3,
    question: "同じ 問題",
    options: ["C", "D"],
    correctAnswer: 1,
    explanation: "same stem but different choices",
    category: "test",
    difficulty: "標準",
    year: "2026",
  },
  {
    id: 4,
    question: "違う問題",
    options: ["A", "B"],
    correctAnswer: 1,
    explanation: "",
    category: "test",
    difficulty: "標準",
    year: "2026",
  },
];

const exactDuplicates = findDuplicateQuestions(questions, {
  includeSimilar: false,
});

assert.deepEqual(exactDuplicates, [
  { q1: 1, q2: 2, reason: "問題内容が完全一致" },
]);

const duplicateGroups = findDuplicateQuestionGroups(questions);

assert.deepEqual(duplicateGroups, [
  {
    ids: [1, 2],
    keepId: 2,
    removeIds: [1],
    duplicateCount: 2,
    questionPreview: "同じ 問題",
    questionText: "同じ 問題",
  },
]);

console.log("duplicate util checks passed");
