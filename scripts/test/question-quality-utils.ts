import assert from "node:assert/strict";
import { findQuestionsWithDuplicateOptions } from "../check/question-quality-utils";
import { Question } from "../../lib/types/quiz";

const questions: Question[] = [
  {
    id: 1,
    question: "選択肢が重複する問題",
    options: ["A", "B", "A", "B "] ,
    correctAnswer: 0,
    explanation: "",
    category: "test",
    difficulty: "基礎",
    year: "2026",
  },
  {
    id: 2,
    question: "選択肢が一意の問題",
    options: ["A", "B", "C", "D"],
    correctAnswer: 0,
    explanation: "",
    category: "test",
    difficulty: "基礎",
    year: "2026",
  },
];

assert.deepEqual(findQuestionsWithDuplicateOptions(questions), [
  {
    id: 1,
    questionPreview: "選択肢が重複する問題",
    duplicateOptions: ["A", "B"],
  },
]);

console.log("question quality util checks passed");
