import assert from "node:assert/strict";

import {
  applyAttempt,
  computeIsWeak,
  questionStatDocId,
  QuestionAttempt,
  QuestionStat,
  REVIEW_INTERVALS_DAYS,
  selectWeakQuestionIds,
  summarizeByCategory,
  WEAK_ACCURACY_THRESHOLD,
} from "../../lib/question-mastery";

const MS_PER_DAY = 24 * 60 * 60 * 1000;
const T0 = new Date("2026-05-29T00:00:00.000Z");

function attempt(overrides: Partial<QuestionAttempt> = {}): QuestionAttempt {
  return {
    questionId: 1,
    category: "minpou",
    topic: "抵当権",
    difficulty: "標準",
    selectedAnswer: 0,
    correctAnswer: 0,
    ...overrides,
  };
}

// ---------------- computeIsWeak ----------------
{
  assert.equal(computeIsWeak(0, 0, true), false, "未回答は弱点でない");
  assert.equal(computeIsWeak(1, 0, false), true, "直近不正解は弱点");
  assert.equal(computeIsWeak(1, 1, true), false, "1/1 正解は弱点でない");
  assert.equal(computeIsWeak(10, 6, true), true, "直近正解でも正答率0.6は弱点");
  assert.equal(computeIsWeak(10, 7, true), false, "正答率0.7ちょうどは弱点でない");
  assert.equal(
    computeIsWeak(10, 9, false),
    true,
    "高正答率でも直近不正解なら弱点",
  );
}

// ---------------- applyAttempt: 初回正解 ----------------
{
  const stat = applyAttempt(null, attempt({ selectedAnswer: 0, correctAnswer: 0 }), T0);
  assert.equal(stat.attempts, 1);
  assert.equal(stat.correctCount, 1);
  assert.equal(stat.consecutiveCorrect, 1);
  assert.equal(stat.lastIsCorrect, true);
  assert.equal(stat.isWeak, false);
  assert.equal(stat.lastAnsweredAt, T0.getTime());
  // 連続1回正解 → REVIEW_INTERVALS_DAYS[1] = 1日後
  assert.equal(stat.nextReviewAt, T0.getTime() + REVIEW_INTERVALS_DAYS[1] * MS_PER_DAY);
  assert.equal(stat.topic, "抵当権");
  assert.equal(stat.category, "minpou");
}

// ---------------- applyAttempt: 初回不正解 ----------------
{
  const stat = applyAttempt(null, attempt({ selectedAnswer: 1, correctAnswer: 0 }), T0);
  assert.equal(stat.attempts, 1);
  assert.equal(stat.correctCount, 0);
  assert.equal(stat.consecutiveCorrect, 0);
  assert.equal(stat.lastIsCorrect, false);
  assert.equal(stat.isWeak, true);
  // consecutiveCorrect=0 → 間隔0日（即復習対象）
  assert.equal(stat.nextReviewAt, T0.getTime());
}

// ---------------- applyAttempt: 不正解→正解で弱点フラグが残る/外れる ----------------
{
  // 1回目不正解
  let stat = applyAttempt(null, attempt({ selectedAnswer: 1, correctAnswer: 0 }), T0);
  assert.equal(stat.isWeak, true);
  assert.equal(stat.attempts, 1);

  // 2回目正解 → accuracy = 1/2 = 0.5 < 0.7 なのでまだ弱点
  const T1 = new Date(T0.getTime() + MS_PER_DAY);
  stat = applyAttempt(stat, attempt({ selectedAnswer: 0, correctAnswer: 0 }), T1);
  assert.equal(stat.attempts, 2);
  assert.equal(stat.correctCount, 1);
  assert.equal(stat.consecutiveCorrect, 1);
  assert.equal(stat.isWeak, true, "正答率0.5はまだ弱点");

  // 3回目正解 → 2/3 = 0.67 < 0.7 まだ弱点
  const T2 = new Date(T1.getTime() + MS_PER_DAY);
  stat = applyAttempt(stat, attempt({ selectedAnswer: 0, correctAnswer: 0 }), T2);
  assert.equal(stat.correctCount, 2);
  assert.equal(stat.consecutiveCorrect, 2);
  assert.equal(stat.isWeak, true, "正答率0.67はまだ弱点");

  // 4回目正解 → 3/4 = 0.75 >= 0.7 かつ直近正解 → 弱点を脱出
  const T3 = new Date(T2.getTime() + MS_PER_DAY);
  stat = applyAttempt(stat, attempt({ selectedAnswer: 0, correctAnswer: 0 }), T3);
  assert.equal(stat.correctCount, 3);
  assert.equal(stat.consecutiveCorrect, 3);
  assert.equal(stat.isWeak, false, "正答率0.75で弱点脱出");
  // consecutiveCorrect=3 → REVIEW_INTERVALS_DAYS[3]=7日後
  assert.equal(stat.nextReviewAt, T3.getTime() + REVIEW_INTERVALS_DAYS[3] * MS_PER_DAY);
}

// ---------------- applyAttempt: 連続正解で間隔が伸び、間違えるとリセット ----------------
{
  let stat: QuestionStat | null = null;
  const base = T0.getTime();
  // 5連続正解
  for (let i = 0; i < 5; i++) {
    stat = applyAttempt(stat, attempt({ selectedAnswer: 0, correctAnswer: 0 }), new Date(base + i * MS_PER_DAY));
  }
  assert.equal(stat!.consecutiveCorrect, 5);
  // index 5 = 35日
  const t5 = base + 4 * MS_PER_DAY;
  assert.equal(stat!.nextReviewAt, t5 + REVIEW_INTERVALS_DAYS[5] * MS_PER_DAY);

  // 6連続目も上限の35日のまま（配列を超えても最後の値）
  stat = applyAttempt(stat, attempt({ selectedAnswer: 0, correctAnswer: 0 }), new Date(base + 5 * MS_PER_DAY));
  assert.equal(stat!.consecutiveCorrect, 6);
  assert.equal(stat!.nextReviewAt, base + 5 * MS_PER_DAY + 35 * MS_PER_DAY);

  // 間違えると consecutiveCorrect=0、即復習
  stat = applyAttempt(stat, attempt({ selectedAnswer: 1, correctAnswer: 0 }), new Date(base + 6 * MS_PER_DAY));
  assert.equal(stat!.consecutiveCorrect, 0);
  assert.equal(stat!.isWeak, true);
  assert.equal(stat!.nextReviewAt, base + 6 * MS_PER_DAY);
}

// ---------------- selectWeakQuestionIds ----------------
{
  const now = T0;
  const stats: QuestionStat[] = [
    // 弱点・期限到来・低正答率 → 最優先
    { questionId: 100, category: "minpou", attempts: 4, correctCount: 1, lastSelectedAnswer: 1, lastIsCorrect: false, lastAnsweredAt: now.getTime() - 10 * MS_PER_DAY, consecutiveCorrect: 0, isWeak: true, nextReviewAt: now.getTime() - MS_PER_DAY },
    // 弱点・期限到来・やや高い正答率
    { questionId: 101, category: "minpou", attempts: 4, correctCount: 2, lastSelectedAnswer: 1, lastIsCorrect: false, lastAnsweredAt: now.getTime() - 5 * MS_PER_DAY, consecutiveCorrect: 0, isWeak: true, nextReviewAt: now.getTime() - MS_PER_DAY },
    // 弱点だが期限未到来（後回し）
    { questionId: 102, category: "zeihou", attempts: 2, correctCount: 0, lastSelectedAnswer: 1, lastIsCorrect: false, lastAnsweredAt: now.getTime(), consecutiveCorrect: 0, isWeak: true, nextReviewAt: now.getTime() + 3 * MS_PER_DAY },
    // 非弱点（除外される）
    { questionId: 103, category: "hourei", attempts: 5, correctCount: 5, lastSelectedAnswer: 0, lastIsCorrect: true, lastAnsweredAt: now.getTime(), consecutiveCorrect: 5, isWeak: false, nextReviewAt: now.getTime() + 35 * MS_PER_DAY },
  ];

  const ids = selectWeakQuestionIds(stats, 10, now);
  // 非弱点 103 は含まれない
  assert.ok(!ids.includes(103), "非弱点は除外");
  // 期限到来の 100, 101 が期限未到来 102 より先
  assert.deepEqual(ids, [100, 101, 102]);

  // limit が効く
  assert.deepEqual(selectWeakQuestionIds(stats, 1, now), [100]);
  // limit 0 は空
  assert.deepEqual(selectWeakQuestionIds(stats, 0, now), []);
  // 弱点ゼロなら空
  assert.deepEqual(selectWeakQuestionIds([stats[3]], 10, now), []);
}

// ---------------- summarizeByCategory ----------------
{
  const stats: QuestionStat[] = [
    { questionId: 1, category: "minpou", attempts: 2, correctCount: 1, lastSelectedAnswer: 0, lastIsCorrect: true, lastAnsweredAt: 0, consecutiveCorrect: 1, isWeak: true, nextReviewAt: 0 },
    { questionId: 2, category: "minpou", attempts: 3, correctCount: 3, lastSelectedAnswer: 0, lastIsCorrect: true, lastAnsweredAt: 0, consecutiveCorrect: 3, isWeak: false, nextReviewAt: 0 },
    { questionId: 3, category: "zeihou", attempts: 1, correctCount: 0, lastSelectedAnswer: 1, lastIsCorrect: false, lastAnsweredAt: 0, consecutiveCorrect: 0, isWeak: true, nextReviewAt: 0 },
  ];
  const summary = summarizeByCategory(stats);
  assert.equal(summary.length, 2);

  const minpou = summary.find((s) => s.category === "minpou")!;
  assert.equal(minpou.uniqueQuestions, 2);
  assert.equal(minpou.attempts, 5);
  assert.equal(minpou.correctCount, 4);
  assert.equal(minpou.accuracy, 4 / 5);
  assert.equal(minpou.weakCount, 1);

  const zeihou = summary.find((s) => s.category === "zeihou")!;
  assert.equal(zeihou.uniqueQuestions, 1);
  assert.equal(zeihou.accuracy, 0);
  assert.equal(zeihou.weakCount, 1);

  // 空入力
  assert.deepEqual(summarizeByCategory([]), []);
}

// ---------------- questionStatDocId ----------------
{
  assert.equal(questionStatDocId("user123", 456), "user123_456");
}

// ---------------- 定数の健全性 ----------------
{
  assert.equal(WEAK_ACCURACY_THRESHOLD, 0.7);
  assert.equal(REVIEW_INTERVALS_DAYS[0], 0);
  // 単調増加
  for (let i = 1; i < REVIEW_INTERVALS_DAYS.length; i++) {
    assert.ok(REVIEW_INTERVALS_DAYS[i] > REVIEW_INTERVALS_DAYS[i - 1], "復習間隔は単調増加");
  }
}

console.log("question-mastery checks passed");
