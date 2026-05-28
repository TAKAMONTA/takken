import assert from "node:assert/strict";
import {
  findCategoryMismatch,
  findDuplicateIds,
  findEmptyFields,
  findInsufficientOptions,
  findInvalidCorrectAnswer,
  findQuestionsWithDuplicateOptions,
  isTrueFalseQuestion,
} from "../check/question-quality-utils";
import { Question } from "../../lib/types/quiz";

const baseQuestion = (overrides: Partial<Question> = {}): Question => ({
  id: 1,
  question: "サンプル問題",
  options: ["A", "B", "C", "D"],
  correctAnswer: 0,
  explanation: "解説",
  category: "test",
  difficulty: "基礎",
  year: "2026",
  ...overrides,
});

// duplicate options
{
  const questions: Question[] = [
    baseQuestion({ id: 1, options: ["A", "B", "A", "B "] }),
    baseQuestion({ id: 2, options: ["A", "B", "C", "D"] }),
  ];
  assert.deepEqual(findQuestionsWithDuplicateOptions(questions), [
    { id: 1, questionPreview: "サンプル問題", duplicateOptions: ["A", "B"] },
  ]);
}

// invalid correctAnswer
{
  const questions: Question[] = [
    baseQuestion({ id: 1, correctAnswer: 0 }),
    baseQuestion({ id: 2, correctAnswer: 3 }),
    baseQuestion({ id: 3, correctAnswer: 4 }),
    baseQuestion({ id: 4, correctAnswer: -1 }),
    baseQuestion({ id: 5, correctAnswer: 1.5 as unknown as number }),
  ];
  const findings = findInvalidCorrectAnswer(questions);
  assert.equal(findings.length, 3);
  assert.deepEqual(
    findings.map((f) => f.id).sort(),
    [3, 4, 5]
  );
}

// isTrueFalseQuestion
{
  assert.equal(
    isTrueFalseQuestion(baseQuestion({ options: ["正しい", "誤っている"] })),
    true
  );
  assert.equal(
    isTrueFalseQuestion(baseQuestion({ options: ["誤っている", "正しい"] })),
    true,
    "順序が逆でもTF判定"
  );
  assert.equal(
    isTrueFalseQuestion(baseQuestion({ options: ["A", "B"] })),
    false,
    "正しい/誤っているでなければTFではない"
  );
  assert.equal(
    isTrueFalseQuestion(baseQuestion({ options: ["A", "B", "C", "D"] })),
    false,
    "4択はTFではない"
  );
}

// insufficient options (TF questions are skipped)
{
  const questions: Question[] = [
    baseQuestion({ id: 1, options: ["A", "B", "C", "D"] }),
    baseQuestion({ id: 2, options: ["A", "B", "C"] }),
    baseQuestion({ id: 3, options: ["A", "B"] }),
    baseQuestion({ id: 4, options: ["A", "B", "", "  "] }),
    baseQuestion({ id: 5, options: ["正しい", "誤っている"] }), // TFはskip
  ];
  const findings = findInsufficientOptions(questions, 4);
  assert.deepEqual(
    findings.map((f) => f.id).sort(),
    [2, 3, 4]
  );
}

// empty fields
{
  const questions: Question[] = [
    baseQuestion({ id: 1, question: "" }),
    baseQuestion({ id: 2, explanation: "" }),
    baseQuestion({ id: 3, options: ["A", "", "C", "D"] }),
    baseQuestion({ id: 4 }),
  ];
  const findings = findEmptyFields(questions);
  const byId = new Map(findings.map((f) => [f.id, f.missingFields]));
  assert.deepEqual(byId.get(1), ["question"]);
  assert.deepEqual(byId.get(2), ["explanation"]);
  assert.deepEqual(byId.get(3), ["options[1]"]);
  assert.equal(byId.has(4), false);
}

// duplicate IDs
{
  const questions: Question[] = [
    baseQuestion({ id: 100 }),
    baseQuestion({ id: 100 }),
    baseQuestion({ id: 101 }),
    baseQuestion({ id: 102 }),
    baseQuestion({ id: 102 }),
    baseQuestion({ id: 102 }),
  ];
  const findings = findDuplicateIds(questions);
  assert.deepEqual(findings, [
    { id: 100, occurrenceCount: 2 },
    { id: 102, occurrenceCount: 3 },
  ]);
}

// category mismatch
{
  const questions: Question[] = [
    baseQuestion({ id: 1, category: "minpou" }),
    baseQuestion({ id: 2, category: "takkengyouhou" }),
    baseQuestion({ id: 3, category: "" }),
  ];
  const findings = findCategoryMismatch("minpou", questions);
  assert.deepEqual(
    findings.map((f) => ({ id: f.id, actual: f.actualCategory })),
    [
      { id: 2, actual: "takkengyouhou" },
      { id: 3, actual: "" },
    ]
  );
}

console.log("question quality util checks passed");
