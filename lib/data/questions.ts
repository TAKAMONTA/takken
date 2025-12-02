import { Question } from '@/lib/types/quiz';
import { firestoreService } from '../firestore-service';
// ビルド時の実行を避けるため、categoryInfoを直接定義
// import { categoryInfo } from './questions/index';
import { logger } from '../logger';

// categoryInfoを直接定義（ビルド時の実行を避けるため）
const categoryInfo = {
  takkengyouhou: {
    name: "宅建業法",
    description: "宅地建物取引業法に関する問題",
    targetQuestions: 20,
    color: "#3B82F6",
  },
  minpou: {
    name: "民法等",
    description: "民法、借地借家法、区分所有法等に関する問題",
    targetQuestions: 14,
    color: "#10B981",
  },
  hourei: {
    name: "法令上の制限",
    description: "都市計画法、建築基準法等に関する問題",
    targetQuestions: 8,
    color: "#F59E0B",
  },
  zeihou: {
    name: "税・その他",
    description: "税法、不動産鑑定評価基準等に関する問題",
    targetQuestions: 8,
    color: "#EF4444",
  },
};

// 問題データの遅延読み込み（必要になった時だけインポート）
// Next.jsの静的エクスポート環境では動的インポートが制限されるため、
// 各カテゴリを個別にインポートする関数を使用
async function loadCategoryQuestions(category: string): Promise<Question[]> {
  // ビルド時の実行を避けるため、ビルド時は常に空配列を返す
  // 実行時（ブラウザ環境）でのみ問題データを読み込む
  if (typeof window === 'undefined') {
    // ビルド時（サーバーサイド）は空配列を返す
    return [];
  }
  
  try {
    switch (category) {
      case 'takkengyouhou':
        const { takkengyouhouQuestions } = await import('./questions/takkengyouhou/index');
        return takkengyouhouQuestions || [];
      case 'minpou':
        const { minpouQuestions } = await import('./questions/minpou/index');
        return minpouQuestions || [];
      case 'hourei':
        const { houreiQuestions } = await import('./questions/hourei/index');
        return houreiQuestions || [];
      case 'zeihou':
        const { zeihouQuestions } = await import('./questions/zeihou/index');
        return zeihouQuestions || [];
      default:
        return [];
    }
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    logger.error(`Failed to load questions for category: ${category}`, err);
    return [];
  }
}

// 本番環境用の問題データ取得関数
export const getQuestionsByCategory = async (category: string): Promise<Question[]> => {
  // ビルド時の実行を避けるため、ブラウザ環境でのみ実行
  if (typeof window === 'undefined') {
    // ビルド時（サーバーサイド）は空配列を返す
    return [];
  }
  
  try {
    logger.debug(`${category}カテゴリの問題データを取得中`, { category });
    
    // まずFirestoreから問題データを取得を試行
    const firestoreQuestions = await firestoreService.getQuestionsByCategory(category);
    
    if (firestoreQuestions.length > 0) {
      logger.debug(`Firestoreから${firestoreQuestions.length}問を取得しました`, { 
        category, 
        count: firestoreQuestions.length,
        source: 'firestore',
      });
      return firestoreQuestions;
    }
    
    // Firestoreにデータがない場合は、ローカルの問題データを使用（遅延読み込み）
    const localQuestions = await loadCategoryQuestions(category);
    logger.debug(`ローカルデータから${localQuestions.length}問を取得しました`, { 
      category, 
      count: localQuestions.length,
      source: 'local',
    });
    
    return localQuestions;
    
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    logger.error('Error fetching questions', err, { category });
    
    // エラーが発生した場合はローカルデータにフォールバック（遅延読み込み）
    const fallbackQuestions = await loadCategoryQuestions(category);
    logger.debug(`フォールバックで${fallbackQuestions.length}問を返します`, { 
      category, 
      count: fallbackQuestions.length,
    });
    
    return fallbackQuestions;
  }
};

// 難易度別の問題取得
export const getQuestionsByDifficulty = async (difficulty: string): Promise<Question[]> => {
  try {
    return await firestoreService.getQuestionsByDifficulty(difficulty);
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    logger.error('Error fetching questions by difficulty', err, { difficulty });
    return [];
  }
};

// カテゴリと難易度による問題取得
export const getQuestionsByCategoryAndDifficulty = async (
  category: string, 
  difficulty: string
): Promise<Question[]> => {
  try {
    return await firestoreService.getQuestionsByCategoryAndDifficulty(category, difficulty);
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    logger.error('Error fetching questions by category and difficulty', err, { category, difficulty });
    return [];
  }
};

// ランダムな問題取得
export const getRandomQuestions = async (
  category?: string, 
  count: number = 10
): Promise<Question[]> => {
  try {
    return await firestoreService.getRandomQuestions(category, count);
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    logger.error('Error fetching random questions', err, { category, count });
    return [];
  }
};

// レガシー対応：既存のsampleQuestionsオブジェクト
export const sampleQuestions: { [key: string]: Question[] } = {
  takkengyouhou: [],
  minpou: [],
  hourei: [],
  zeihou: [],
  cho_shokyu: [],
  cho_shokyu_extra: []
};

// カテゴリ情報（新しい構造から取得）
export const questionCategories = Object.entries(categoryInfo).reduce((acc, [key, info]) => {
  acc[key] = info.name;
  return acc;
}, {} as Record<string, string>);

// カテゴリの詳細情報をエクスポート
export { categoryInfo };
