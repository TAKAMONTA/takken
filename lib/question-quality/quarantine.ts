/**
 * 公開プールから除外する問題ID（自動隔離）
 * 法的誤り・架空ルール・出題として破綻しているものを対象とする
 */
export const QUARANTINED_QUESTION_IDS: ReadonlySet<number> = new Set([
  // 重要事項説明を37条と誤記／冷却期間など架空ルール
  56149,
  56150,
  56151,
  // 基礎○×変換: 重要事項を37条と誤記
  1008,
  1009,
  // 重要事項の調査義務を37条と誤記
  109914,
  // 国土利用計画法: 全選択肢が正しいのに「誤っているものはどれか」
  100004,
  // 民法: 全選択肢が同一文で出題破綻
  3006,
  3007,
  3008,
  3009,
  // prediction: 不正な correctAnswer インデックス
  301076,
  301094,
  401048,
  401049,
  101016,
  101071,
  201026,
  201085,
  302017,
  302056,
]);

export const QUARANTINE_REASONS: Record<number, string> = {
  56149: "重要事項説明（35条）を37条と混同した解説・選択肢根拠",
  56150: "存在しない『冷却期間』ルールを含む誤解説",
  56151: "重要事項説明義務違反の効果（解除権）を誤った記述",
  1008: "重要事項説明を宅建業法第37条と誤記（正しくは第35条）",
  1009: "重要事項説明を宅建業法第37条と誤記（正しくは第35条）",
  109914: "重要事項関連義務を第37条と誤記し、信用調査義務を誇張",
  100004: "全選択肢が正しいのに『誤っているものはどれか』形式で出題破綻",
  3006: "4選択肢が全て同一文で出題として破綻",
  3007: "4選択肢が全て同一文で出題として破綻",
  3008: "4選択肢が全て同一文で出題として破綻",
  3009: "4選択肢が全て同一文で出題として破綻",
  301076: "正解インデックスが選択肢数外",
  301094: "正解インデックスが選択肢数外",
  401048: "正解インデックスが選択肢数外",
  401049: "正解インデックスが選択肢数外",
  101016: "重要事項説明（35条）と37条書面の混同の疑い",
  101071: "重要事項説明（35条）と37条書面の混同の疑い",
  201026: "正解インデックスが選択肢数外",
  201085: "正解インデックスが選択肢数外",
  302017: "正解インデックスが選択肢数外",
  302056: "正解インデックスが選択肢数外",
};

export function isQuarantinedQuestionId(id: number): boolean {
  return QUARANTINED_QUESTION_IDS.has(id);
}

export function filterQuarantinedQuestions<T extends { id: number }>(
  questions: T[]
): { published: T[]; quarantined: T[] } {
  const published: T[] = [];
  const quarantined: T[] = [];
  for (const q of questions) {
    if (isQuarantinedQuestionId(q.id)) {
      quarantined.push(q);
    } else {
      published.push(q);
    }
  }
  return { published, quarantined };
}
