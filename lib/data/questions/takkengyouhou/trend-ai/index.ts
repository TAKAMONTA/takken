import { Question } from '@/lib/types/quiz';
import { trendAI_37条書面_契約書面 } from './37条書面_契約書面';
import { trendAI_住宅瑕疵担保履行法 } from './住宅瑕疵担保履行法';
import { trendAI_宅建士 } from './宅建士';
import { trendAI_媒介_代理契約 } from './媒介_代理契約';
import { trendAI_報酬額の制限 } from './報酬額の制限';
import { trendAI_広告等に関する規制 } from './広告等に関する規制';
import { trendAI_弁済業務保証金 } from './弁済業務保証金';
import { trendAI_自ら売主制限_8種制限 } from './自ら売主制限_8種制限';
import { trendAI_重要事項の説明_35条書面 } from './重要事項の説明_35条書面';

/**
 * 宅建業法 trend-ai 出題傾向反映 AI 問題集。
 *
 * 注意: 解説や条文番号には監査で検出された hallucination が含まれる可能性が
 * あります（W3-4 で教材 validator を使った一次レビュー予定）。
 * UI 上での誤情報リスクを下げるため、現状は法律家による最終確認待ち。
 */
export const takkengyouhouTrendAIQuestions: Question[] = [
  ...trendAI_37条書面_契約書面,
  ...trendAI_住宅瑕疵担保履行法,
  ...trendAI_宅建士,
  ...trendAI_媒介_代理契約,
  ...trendAI_報酬額の制限,
  ...trendAI_広告等に関する規制,
  ...trendAI_弁済業務保証金,
  ...trendAI_自ら売主制限_8種制限,
  ...trendAI_重要事項の説明_35条書面,
];
