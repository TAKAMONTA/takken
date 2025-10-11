import { Question } from '@/lib/types/quiz';
import { firestoreService } from '../firestore-service';
import { questionsByCategory, categoryInfo } from './questions/index';

// 本番環境用の問題データ取得関数
export const getQuestionsByCategory = async (category: string): Promise<Question[]> => {
  try {
    console.log(`${category}カテゴリの問題データを取得中...`);
    
    // まずFirestoreから問題データを取得を試行
    const firestoreQuestions = await firestoreService.getQuestionsByCategory(category);
    
    if (firestoreQuestions.length > 0) {
      console.log(`Firestoreから${firestoreQuestions.length}問を取得しました`);
      return firestoreQuestions;
    }
    
    // Firestoreにデータがない場合は、ローカルの問題データを使用
    const localQuestions = questionsByCategory[category] || [];
    console.log(`ローカルデータから${localQuestions.length}問を取得しました`);
    
    return localQuestions;
    
  } catch (error) {
    console.error('Error fetching questions:', error);
    
    // エラーが発生した場合はローカルデータにフォールバック
    const fallbackQuestions = questionsByCategory[category] || [];
    console.log(`フォールバックで${fallbackQuestions.length}問を返します`);
    
    return fallbackQuestions;
  }
};

// 難易度別の問題取得
export const getQuestionsByDifficulty = async (difficulty: string): Promise<Question[]> => {
  try {
    return await firestoreService.getQuestionsByDifficulty(difficulty);
  } catch (error) {
    console.error('Error fetching questions by difficulty:', error);
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
    console.error('Error fetching questions by category and difficulty:', error);
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
    console.error('Error fetching random questions:', error);
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
