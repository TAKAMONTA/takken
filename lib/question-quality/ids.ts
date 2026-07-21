/**
 * 公開問題のカテゴリ別 ID 名前空間
 * 呼び出し予定: lib/question-quality/prepare.ts, lib/question-quality/dedupe.ts,
 * scripts/migrate/remap-trend-ids.ts, scripts/generate/*
 * 既存の同目的ファイル: なし（Glob確認済み）
 * データファイルの読み書きなし
 * 指示: B — 著作権は並行で、まずAI問題の増強実装に進む
 */
export const CATEGORY_ID_BASE: Record<string, number> = {
  takkengyouhou: 100000,
  minpou: 200000,
  hourei: 300000,
  zeihou: 400000,
};

export const CATEGORY_ID_SPAN = 100000;

export function getCategoryIdBase(category: string): number {
  return CATEGORY_ID_BASE[category] ?? 900000;
}

/** 名前空間内で未使用の次 ID を返す */
export function nextFreeId(
  category: string,
  used: Set<number>,
  preferred?: number
): number {
  const base = getCategoryIdBase(category);
  const max = base + CATEGORY_ID_SPAN - 1;
  if (
    typeof preferred === "number" &&
    preferred >= base &&
    preferred <= max &&
    !used.has(preferred)
  ) {
    return preferred;
  }
  for (let id = base; id <= max; id++) {
    if (!used.has(id)) return id;
  }
  throw new Error(`ID namespace exhausted for category: ${category}`);
}
