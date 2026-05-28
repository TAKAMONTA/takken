import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import {
  buildQuestionSourceIndex,
  findQuestionSourceLocations,
  formatQuestionSourceLocations,
} from "../check/question-source-locator";

const root = fs.mkdtempSync(path.join(os.tmpdir(), "question-source-locator-"));

try {
  fs.mkdirSync(path.join(root, "minpou", "nested"), { recursive: true });
  fs.mkdirSync(path.join(root, "minpou", "_backup_copyrighted"), {
    recursive: true,
  });
  fs.mkdirSync(path.join(root, "utils"), { recursive: true });

  fs.writeFileSync(
    path.join(root, "minpou", "index.ts"),
    "export { minpouQuestions } from './sample';\n"
  );

  fs.writeFileSync(
    path.join(root, "minpou", "sample.ts"),
    [
      "export const minpouQuestions = [",
      "  {",
      "    id: 10,",
      "    question: 'A',",
      "  },",
      "  {",
      "    id: 11,",
      "    question: 'B',",
      "  },",
      "];",
      "",
    ].join("\n")
  );

  fs.writeFileSync(
    path.join(root, "minpou", "nested", "extra.ts"),
    ["export const extra = [", "  { \"id\": 10, question: 'C' },", "];", ""].join(
      "\n"
    )
  );

  fs.writeFileSync(
    path.join(root, "minpou", "unused.ts"),
    "export const unused = [{ id: 10, question: 'A' }];\n"
  );

  fs.writeFileSync(
    path.join(root, "minpou", "_backup_copyrighted", "old.ts"),
    "export const old = [{ id: 10, question: 'old' }];\n"
  );
  fs.writeFileSync(
    path.join(root, "utils", "helper.ts"),
    "export const helper = { id: 10 };\n"
  );

  const index = buildQuestionSourceIndex(root);
  const id10Locations = findQuestionSourceLocations(index, "minpou", 10).sort(
    (a, b) => a.file.localeCompare(b.file)
  );

  assert.equal(id10Locations.length, 3);
  assert.equal(id10Locations[0].category, "minpou");
  assert.equal(id10Locations[0].id, 10);
  assert.ok(id10Locations[0].file.endsWith("minpou/nested/extra.ts"));
  assert.equal(id10Locations[0].line, 2);
  assert.ok(id10Locations[1].file.endsWith("minpou/sample.ts"));
  assert.equal(id10Locations[1].line, 3);

  const questionALocations = findQuestionSourceLocations(index, "minpou", 10, "A");
  assert.equal(questionALocations.length, 2);
  assert.ok(questionALocations[0].file.endsWith("minpou/sample.ts"));

  const questionCLocations = findQuestionSourceLocations(index, "minpou", 10, "C");
  assert.equal(questionCLocations.length, 1);
  assert.ok(questionCLocations[0].file.endsWith("minpou/nested/extra.ts"));

  const id11Locations = findQuestionSourceLocations(index, "minpou", 11);
  assert.equal(id11Locations.length, 1);
  assert.ok(formatQuestionSourceLocations(id11Locations).includes(":7"));

  assert.deepEqual(findQuestionSourceLocations(index, "unknown", 10), []);
  assert.match(formatQuestionSourceLocations(id10Locations, 1), /\+2 more/);
  const activeIndex = buildQuestionSourceIndex(root, { activeOnly: true });
  const activeQuestionALocations = findQuestionSourceLocations(
    activeIndex,
    "minpou",
    10,
    "A"
  );
  assert.equal(activeQuestionALocations.length, 1);
  assert.ok(activeQuestionALocations[0].file.endsWith("minpou/sample.ts"));
  assert.deepEqual(findQuestionSourceLocations(activeIndex, "minpou", 10, "C"), []);

  assert.equal(formatQuestionSourceLocations([], 1), "source unknown");

  console.log("question source locator checks passed");
} finally {
  fs.rmSync(root, { recursive: true, force: true });
}
