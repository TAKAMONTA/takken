import assert from "node:assert/strict";
import { questionSets } from "../check/question-data";

const categories = Object.keys(questionSets);
const total = Object.values(questionSets).reduce(
  (sum, questions) => sum + questions.length,
  0
);

assert.deepEqual(categories.sort(), ["hourei", "minpou", "takkengyouhou", "zeihou"]);
assert.ok(total > 0, "question checks must load real local question data");

for (const [category, questions] of Object.entries(questionSets)) {
  assert.ok(questions.length > 0, `${category} has at least one question`);
}

console.log("question data source checks passed");
