/**
 * 問題ごとの習熟度（mastery）ドメインロジック — 純粋関数のみ。
 *
 * 背景:
 *   現状アプリは「どの問題を間違えたか」を一切記録していない。集計カウント
 *   （日別・カテゴリ別の正答数）しか持たないため、弱点克服・間隔反復（SM-2）・
 *   既出問題の判定が全て構造的に不可能だった。
 *
 *   このモジュールは「(user, question) ごとに1件の習熟度レコード」を upsert する
 *   ための純粋な計算ロジックを提供する。Firestore 等の永続化は別レイヤー
 *   (lib/firestore-service など) が担い、ここは I/O を持たない＝完全にテスト可能。
 *
 * 設計方針:
 *   - 追記ログではなく「最新状態」を1件持つ（ユーザーあたり最大 ~問題総数 で有界）
 *   - 弱点(isWeak)は「直近で間違えた」または「正答率が閾値未満」で立つ
 *   - 間隔反復は SM-2 を簡略化（consecutiveCorrect に応じて次回出題日を後ろ倒し）
 */

export interface QuestionAttempt {
  questionId: number;
  category: string;
  topic?: string;
  difficulty?: string;
  selectedAnswer: number;
  correctAnswer: number;
}

export interface QuestionStat {
  questionId: number;
  category: string;
  topic?: string;
  difficulty?: string;
  /** 総回答回数 */
  attempts: number;
  /** 正解した回数 */
  correctCount: number;
  /** 直近の選択肢 index */
  lastSelectedAnswer: number;
  /** 直近の正誤 */
  lastIsCorrect: boolean;
  /** 直近の回答時刻 (epoch ms) */
  lastAnsweredAt: number;
  /** 連続正解数（間違えると 0 にリセット） */
  consecutiveCorrect: number;
  /** 弱点フラグ（導出値だが query 効率のため保存する） */
  isWeak: boolean;
  /** 次回出題推奨時刻 (epoch ms)。間隔反復用 */
  nextReviewAt: number;
}

/** 弱点と判定する正答率の閾値（これ未満なら弱点）。 */
export const WEAK_ACCURACY_THRESHOLD = 0.7;

/**
 * 連続正解数に応じた復習間隔（日）。SM-2 を簡略化した固定スケジュール。
 * index = consecutiveCorrect。上限を超えたら最後の値を使う。
 */
export const REVIEW_INTERVALS_DAYS = [0, 1, 3, 7, 16, 35] as const;

const MS_PER_DAY = 24 * 60 * 60 * 1000;

function reviewIntervalDays(consecutiveCorrect: number): number {
  if (consecutiveCorrect <= 0) return REVIEW_INTERVALS_DAYS[0];
  const idx = Math.min(consecutiveCorrect, REVIEW_INTERVALS_DAYS.length - 1);
  return REVIEW_INTERVALS_DAYS[idx];
}

/**
 * 弱点判定。
 * - 直近が不正解なら弱点
 * - 正答率が閾値未満なら弱点
 * 直近正解かつ正答率が閾値以上なら弱点ではない。
 */
export function computeIsWeak(
  attempts: number,
  correctCount: number,
  lastIsCorrect: boolean,
): boolean {
  if (attempts <= 0) return false;
  if (!lastIsCorrect) return true;
  const accuracy = correctCount / attempts;
  return accuracy < WEAK_ACCURACY_THRESHOLD;
}

/**
 * 1回の回答を既存の習熟度レコードに適用し、新しいレコードを返す純粋関数。
 *
 * @param prev    既存レコード（初回なら null）
 * @param attempt 今回の回答
 * @param now     現在時刻（テスト容易性のため注入）
 */
export function applyAttempt(
  prev: QuestionStat | null,
  attempt: QuestionAttempt,
  now: Date = new Date(),
): QuestionStat {
  const isCorrect = attempt.selectedAnswer === attempt.correctAnswer;
  const nowMs = now.getTime();

  const attempts = (prev?.attempts ?? 0) + 1;
  const correctCount = (prev?.correctCount ?? 0) + (isCorrect ? 1 : 0);
  const consecutiveCorrect = isCorrect
    ? (prev?.consecutiveCorrect ?? 0) + 1
    : 0;

  const isWeak = computeIsWeak(attempts, correctCount, isCorrect);
  const nextReviewAt = nowMs + reviewIntervalDays(consecutiveCorrect) * MS_PER_DAY;

  return {
    questionId: attempt.questionId,
    category: attempt.category,
    topic: attempt.topic ?? prev?.topic,
    difficulty: attempt.difficulty ?? prev?.difficulty,
    attempts,
    correctCount,
    lastSelectedAnswer: attempt.selectedAnswer,
    lastIsCorrect: isCorrect,
    lastAnsweredAt: nowMs,
    consecutiveCorrect,
    isWeak,
    nextReviewAt,
  };
}

/**
 * 復習対象として出題すべき弱点問題の ID を、優先度順に返す。
 *
 * 優先度:
 *   1. nextReviewAt が現在以前（復習期限が来ている）ものを優先
 *   2. その中で「正答率が低い順」、同率なら「より昔に回答した順」
 *
 * @param stats 全習熟度レコード
 * @param limit 返す最大件数
 * @param now   現在時刻
 */
export function selectWeakQuestionIds(
  stats: QuestionStat[],
  limit: number,
  now: Date = new Date(),
): number[] {
  const nowMs = now.getTime();

  const weak = stats.filter((s) => s.isWeak);

  const sorted = weak.slice().sort((a, b) => {
    // 復習期限が来ているものを優先
    const aDue = a.nextReviewAt <= nowMs ? 0 : 1;
    const bDue = b.nextReviewAt <= nowMs ? 0 : 1;
    if (aDue !== bDue) return aDue - bDue;

    // 正答率が低い順
    const aAcc = a.attempts > 0 ? a.correctCount / a.attempts : 0;
    const bAcc = b.attempts > 0 ? b.correctCount / b.attempts : 0;
    if (aAcc !== bAcc) return aAcc - bAcc;

    // より昔に回答した順（長く放置されたものを先に）
    return a.lastAnsweredAt - b.lastAnsweredAt;
  });

  return sorted.slice(0, Math.max(0, limit)).map((s) => s.questionId);
}

/**
 * カテゴリ別の正答率サマリを習熟度レコードから集計する。
 * 模試の弱点表示・進捗ページで使う。
 */
export interface CategoryAccuracy {
  category: string;
  uniqueQuestions: number;
  attempts: number;
  correctCount: number;
  accuracy: number; // 0..1
  weakCount: number;
}

export function summarizeByCategory(stats: QuestionStat[]): CategoryAccuracy[] {
  const byCategory = new Map<string, CategoryAccuracy>();

  for (const s of stats) {
    const entry =
      byCategory.get(s.category) ??
      {
        category: s.category,
        uniqueQuestions: 0,
        attempts: 0,
        correctCount: 0,
        accuracy: 0,
        weakCount: 0,
      };
    entry.uniqueQuestions += 1;
    entry.attempts += s.attempts;
    entry.correctCount += s.correctCount;
    if (s.isWeak) entry.weakCount += 1;
    byCategory.set(s.category, entry);
  }

  const result = Array.from(byCategory.values());
  for (const entry of result) {
    entry.accuracy = entry.attempts > 0 ? entry.correctCount / entry.attempts : 0;
  }
  return result.sort((a, b) => a.category.localeCompare(b.category));
}

/** Firestore doc id 規約。ai_usage と同じ {userId}_{questionId} 形式。 */
export function questionStatDocId(userId: string, questionId: number): string {
  return `${userId}_${questionId}`;
}
