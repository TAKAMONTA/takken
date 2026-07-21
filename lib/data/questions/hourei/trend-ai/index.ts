import { Question } from '@/lib/types/quiz';
import { trendAI_国土利用計画法 } from './国土利用計画法';
import { trendAI_土地区画整理法 } from './土地区画整理法';
import { trendAI_宅地造成等規制法_盛土規制法 } from './宅地造成等規制法_盛土規制法';
import { trendAI_建築確認_単体規定 } from './建築確認_単体規定';
import { trendAI_農地法_3条_4条_5条許可 } from './農地法_3条_4条_5条許可';
import { trendAI_都市計画の内容_都市計画制限等 } from './都市計画の内容_都市計画制限等';
import { trendAI_開発許可の要否 } from './開発許可の要否';

/**
 * 法令上の制限 trend-ai 出題傾向反映 AI 問題集。
 *
 * 注意: 解説や条文番号には監査で検出された hallucination が含まれる可能性が
 * あります（W3-4 で教材 validator を使った一次レビュー予定）。
 * UI 上での誤情報リスクを下げるため、現状は法律家による最終確認待ち。
 */
export const houreiTrendAIQuestions: Question[] = [
  ...trendAI_国土利用計画法,
  ...trendAI_土地区画整理法,
  ...trendAI_宅地造成等規制法_盛土規制法,
  ...trendAI_建築確認_単体規定,
  ...trendAI_農地法_3条_4条_5条許可,
  ...trendAI_都市計画の内容_都市計画制限等,
  ...trendAI_開発許可の要否,
];
