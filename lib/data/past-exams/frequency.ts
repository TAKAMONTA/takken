// 直近10年の「過去問の出題頻度」データ定義（本番値のみを投入）
// 注意: テスト/サンプル/モックデータの投入は禁止（ユーザー提供 or 本番集計のみ）

export type TopicKey = string; // 例: '不動産取得税' '固定資産税' '登録免許税' など

export type FrequencyMap = Record<TopicKey, number>;

export interface FrequencyDataset {
  rangeYears: number;         // 集計対象年数（本ファイルでは 10 固定の想定）
  updatedAt?: string;         // 集計更新日時（ISO文字列）
  source?: 'official' | 'internal' | 'external';
  data: FrequencyMap;         // トピック単位の出題回数（直近10年）
}

/**
 * 直近10年の出題頻度データ（本番値を投入してください）
 * 例（コメントのみ・実投入は本番確定値）:
 * data: {
 *   '不動産取得税': 12,
 *   '固定資産税': 18,
 *   '登録免許税': 10,
 *   '印紙税': 7,
 *   '地価公示': 9,
 *   '相続税': 11,
 *   '贈与税': 8,
 *   '不動産鑑定評価': 6,
 *   ...
 * }
 */
export const frequency10y: FrequencyDataset = {
  rangeYears: 10,
  updatedAt: undefined,
  source: 'official',
  data: {}
};

/**
 * トピックの出題回数（直近10年）を返します（未登録は undefined）
 */
export function getFrequencyCount(topic: string, dataset: FrequencyDataset = frequency10y): number | undefined {
  return dataset.data[topic];
}
