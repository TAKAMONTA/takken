import assert from "node:assert/strict";
import { formatDuplicateMarkdownReport } from "../check/duplicate-report";

const markdown = formatDuplicateMarkdownReport({
  generatedAt: "2026-05-27T00:00:00.000Z",
  mode: "exact",
  totalGroups: 1,
  totalPairs: 1,
  categories: [
    {
      category: "minpou",
      groupCount: 1,
      pairCount: 1,
      groups: [
        {
          ids: [1, 2],
          keepId: 1,
          removeIds: [2],
          duplicateCount: 2,
          questionPreview: "同じ問題文",
          questionText: "同じ問題文",
          keepTarget: {
            id: 1,
            locations: [
              { category: "minpou", id: 1, file: "lib/data/questions/minpou/a.ts", line: 10 },
            ],
          },
          removeTargets: [
            {
              id: 2,
              locations: [
                { category: "minpou", id: 2, file: "lib/data/questions/minpou/b.ts", line: 20 },
              ],
            },
          ],
        },
      ],
    },
  ],
});

assert.match(markdown, /^# 重複問題レポート/m);
assert.match(markdown, /合計: 1グループ \/ 1組/);
assert.match(markdown, /## minpou/);
assert.match(markdown, /残す: 1/);
assert.match(markdown, /lib\/data\/questions\/minpou\/a\.ts:10/);
assert.match(markdown, /削除候補/);
assert.match(markdown, /lib\/data\/questions\/minpou\/b\.ts:20/);

console.log("duplicate report checks passed");
