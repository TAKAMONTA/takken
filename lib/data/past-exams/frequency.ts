// 直近10年の「過去問の出題頻度」データ定義
// 出典: frequency-questions.ts / study-strategy のトピック分類から集計（問題本文は含まない）
// 「過去10年間（12回）全て出題」→ 12、「ほぼ毎年出題」→ 10
// 呼び出し: lib/question-quality/grades.ts, lib/utils/generate-truefalse-items.ts
// 指示: Implement the plan as specified... Do NOT edit the plan file itself.

export type TopicKey = string;

export type FrequencyMap = Record<TopicKey, number>;

export interface FrequencyDataset {
  rangeYears: number;
  updatedAt?: string;
  source?: "official" | "internal" | "external";
  data: FrequencyMap;
}

export const frequency10y: FrequencyDataset = {
  rangeYears: 10,
  updatedAt: "2026-07-19T00:00:00.000Z",
  source: "internal",
  data: {
    宅建士: 12,
    弁済業務保証金: 12,
    "媒介・代理契約": 12,
    広告等に関する規制: 12,
    "重要事項の説明（35条書面）": 12,
    "37条書面（契約書面）": 12,
    "自ら売主制限（8種制限）": 12,
    報酬額の制限: 12,
    住宅瑕疵担保履行法: 12,
    宅建業の免許: 10,
    宅建業の免許制度: 10,
    営業保証金: 12,
    報酬: 12,
    "業務上の規制（禁止事項・義務）": 10,
    業務上の規制: 10,
    "広告・契約締結時期": 10,
    媒介契約の規制: 12,
    相続: 12,
    "賃貸借・使用貸借": 12,
    借地法: 12,
    借家法: 12,
    不動産登記法: 12,
    区分所有法: 12,
    意思表示: 8,
    代理: 8,
    制限行為能力者: 8,
    物権変動: 8,
    抵当権: 8,
    時効: 8,
    共有: 8,
    "債務不履行・解除": 8,
    債権譲渡: 6,
    "都市計画の内容・都市計画制限等": 10,
    開発許可の要否: 10,
    "建築確認・単体規定": 10,
    "宅地造成等規制法（盛土規制法）": 10,
    土地区画整理法: 10,
    "農地法（3条・4条・5条許可）": 10,
    国土利用計画法: 10,
    不動産取得税: 10,
    固定資産税: 10,
    地価公示法: 10,
    印紙税: 8,
    登録免許税: 8,
    その他の税制: 6,
    不動産鑑定評価: 6,
  },
};

export function getFrequencyCount(
  topic: string,
  dataset: FrequencyDataset = frequency10y
): number | undefined {
  return dataset.data[topic];
}
