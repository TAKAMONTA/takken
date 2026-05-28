import assert from "assert";
import { uniqueQuestionsByText } from "../../lib/question-dedupe";
import { Question } from "../../lib/types/quiz";

function makeQuestion(id: number, question: string): Question {
  return {
    id,
    question,
    options: ["A", "B", "C", "D"],
    correctAnswer: 0,
    explanation: "explanation",
    category: "minpou",
    difficulty: "標準",
    year: "2026",
  };
}

const questions = [
  makeQuestion(1, "  同じ 問題文です。 "),
  makeQuestion(2, "同じ　問題文です。"),
  makeQuestion(3, "別の問題文です。"),
  makeQuestion(4, ""),
  makeQuestion(5, ""),
];

const unique = uniqueQuestionsByText(questions);

assert.deepStrictEqual(
  unique.map((question) => question.id),
  [1, 3, 4, 5],
  "keeps the first duplicate text while preserving distinct and blank questions"
);

console.log("question dedupe checks passed");
