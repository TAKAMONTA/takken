/**
 * 公開プールの重複除去と ID 衝突解消
 * 呼び出し予定: lib/question-quality/prepare.ts（quarantine の直後）
 * 既存同目的: scripts/check/duplicates.ts は診断のみで公開パイプライン未適用（Globで dedupe.ts なし）
 * データファイル読み書きなし（メモリ上の Question[] のみ）
 * 指示: B — 著作権は並行で、まずAI問題の増強実装に進む
 */
import { Question } from "../types/quiz";
import { nextFreeId } from "./ids";
import { isQuarantinedQuestionId } from "./quarantine";

function normalizeQuestionText(text: string): string {
  // 全文で判定する（冒頭200字だけだと「〜に関する次の記述のうち」で誤結合する）
  return (text || "")
    .replace(/\s+/g, " ")
    .replace(/【AI予想問題】/g, "")
    .trim();
}

export interface DedupeStats {
  input: number;
  removedDuplicateText: number;
  remappedIds: number;
  output: number;
}

/**
 * 問題文の完全一致（正規化後）で重複を落とし、ID 衝突はカテゴリ名前空間で振り直す。
 * 先に出た問題を優先（index の並び順を尊重）。
 */
export function dedupePublishedQuestions(questions: Question[]): {
  questions: Question[];
  stats: DedupeStats;
} {
  const seenText = new Set<string>();
  const usedIds = new Set<number>();
  const output: Question[] = [];
  let removedDuplicateText = 0;
  let remappedIds = 0;

  for (const q of questions) {
    const key = normalizeQuestionText(q.question);
    if (!key) continue;
    if (seenText.has(key)) {
      removedDuplicateText += 1;
      continue;
    }
    seenText.add(key);

    let id = q.id;
    // 隔離済み ID や衝突 ID は振り直す（隔離IDの再利用を防ぐ）
    if (usedIds.has(id) || isQuarantinedQuestionId(id)) {
      const category = q.category || "unknown";
      id = nextFreeIdSkippingQuarantine(category, usedIds);
      remappedIds += 1;
    }
    usedIds.add(id);

    if (id !== q.id) {
      output.push({ ...q, id });
    } else {
      output.push(q);
    }
  }

  return {
    questions: output,
    stats: {
      input: questions.length,
      removedDuplicateText,
      remappedIds,
      output: output.length,
    },
  };
}

function nextFreeIdSkippingQuarantine(
  category: string,
  used: Set<number>
): number {
  // used に隔離IDを一時的に足してから探す
  const blocked = new Set(used);
  // 隔離セットは大きいので、nextFreeId ループ側で判定する方が安い
  let id = nextFreeId(category, blocked);
  let guard = 0;
  while (isQuarantinedQuestionId(id) || used.has(id)) {
    blocked.add(id);
    id = nextFreeId(category, blocked);
    guard += 1;
    if (guard > 100000) {
      throw new Error(`Cannot allocate non-quarantined ID for ${category}`);
    }
  }
  return id;
}
