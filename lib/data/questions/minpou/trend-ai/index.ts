import { Question } from '@/lib/types/quiz';
import { trendAI_相続 } from './相続';
import { trendAI_賃貸借_使用貸借 } from './賃貸借_使用貸借';
import { trendAI_借地法 } from './借地法';
import { trendAI_借家法 } from './借家法';
import { trendAI_不動産登記法 } from './不動産登記法';
import { trendAI_区分所有法 } from './区分所有法';

export const kenriTrendAIQuestions: Question[] = [
  ...trendAI_相続,
  ...trendAI_賃貸借_使用貸借,
  ...trendAI_借地法,
  ...trendAI_借家法,
  ...trendAI_不動産登記法,
  ...trendAI_区分所有法,
];
