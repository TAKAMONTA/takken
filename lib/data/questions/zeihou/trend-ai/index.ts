import { Question } from '@/lib/types/quiz';
import { trendAI_不動産取得税 } from './不動産取得税';
import { trendAI_固定資産税 } from './固定資産税';
import { trendAI_地価公示法 } from './地価公示法';

export const zeiTrendAIQuestions: Question[] = [
  ...trendAI_不動産取得税,
  ...trendAI_固定資産税,
  ...trendAI_地価公示法,
];
