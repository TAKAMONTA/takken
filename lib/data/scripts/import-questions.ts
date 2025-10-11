// Firestoreへの問題データインポートスクリプト
import { Question } from '../../types/quiz';
import { collection, doc, setDoc, writeBatch, getDocs } from 'firebase/firestore';
import { db } from '../../firebase.js';

// 問題データをFirestoreにインポートする関数
export async function importQuestionsToFirestore(
  questions: Question[],
  category: string
): Promise<void> {
  try {
    console.log(`${category}カテゴリの問題データをインポート中...`);
    
    // バッチ処理でFirestoreに書き込み（効率的な一括処理）
    const batch = writeBatch(db);
    const questionsRef = collection(db, 'questions');
    
    questions.forEach((question) => {
      const questionDoc = doc(questionsRef, `${category}_${question.id}`);
      batch.set(questionDoc, {
        ...question,
        category,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    });
    
    await batch.commit();
    console.log(`${questions.length}問の問題データをインポートしました`);
    
  } catch (error) {
    console.error('問題データのインポートに失敗しました:', error);
    throw error;
  }
}

// 全カテゴリの問題データをインポート
export async function importAllQuestions(): Promise<void> {
  try {
    // 動的インポートで各カテゴリの問題データを取得
    const { takkengyouhouQuestions } = await import('../questions/takkengyouhou');
    const { minpouQuestions } = await import('../questions/minpou');
    const { houreiQuestions } = await import('../questions/hourei');
    const { zeihouQuestions } = await import('../questions/zeihou');
    
    // 各カテゴリをインポート
    await importQuestionsToFirestore(takkengyouhouQuestions, 'takkengyouhou');
    await importQuestionsToFirestore(minpouQuestions, 'minpou');
    await importQuestionsToFirestore(houreiQuestions, 'hourei');
    await importQuestionsToFirestore(zeihouQuestions, 'zeihou');
    
    console.log('全ての問題データのインポートが完了しました');
    
  } catch (error) {
    console.error('問題データの一括インポートに失敗しました:', error);
    throw error;
  }
}

// 既存の問題データを削除する関数（再インポート時に使用）
export async function clearExistingQuestions(): Promise<void> {
  try {
    console.log('既存の問題データを削除中...');
    
    const questionsRef = collection(db, 'questions');
    const snapshot = await getDocs(questionsRef);
    
    const batch = writeBatch(db);
    snapshot.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });
    
    await batch.commit();
    console.log('既存の問題データを削除しました');
    
  } catch (error) {
    console.error('問題データの削除に失敗しました:', error);
    throw error;
  }
}

// 問題データの統計情報を取得
export async function getQuestionStats(): Promise<{
  total: number;
  byCategory: Record<string, number>;
  byDifficulty: Record<string, number>;
}> {
  try {
    const questionsRef = collection(db, 'questions');
    const snapshot = await getDocs(questionsRef);
    
    const stats = {
      total: snapshot.size,
      byCategory: {} as Record<string, number>,
      byDifficulty: {} as Record<string, number>
    };
    
    snapshot.docs.forEach((doc) => {
      const data = doc.data() as Question;
      
      // カテゴリ別統計
      stats.byCategory[data.category] = (stats.byCategory[data.category] || 0) + 1;
      
      // 難易度別統計
      stats.byDifficulty[data.difficulty] = (stats.byDifficulty[data.difficulty] || 0) + 1;
    });
    
    return stats;
    
  } catch (error) {
    console.error('統計情報の取得に失敗しました:', error);
    throw error;
  }
}

// 使用例とテスト用の関数
export async function testImport(): Promise<void> {
  try {
    console.log('問題データインポートのテストを開始...');
    
    // 統計情報を表示
    const stats = await getQuestionStats();
    console.log('現在の問題データ統計:', stats);
    
    // 必要に応じて既存データを削除
    // await clearExistingQuestions();
    
    // 全問題データをインポート
    // await importAllQuestions();
    
    // インポート後の統計情報を表示
    const newStats = await getQuestionStats();
    console.log('インポート後の問題データ統計:', newStats);
    
  } catch (error) {
    console.error('テストに失敗しました:', error);
  }
}

// スクリプトとして直接実行された場合のメイン処理
if (require.main === module) {
  importAllQuestions().catch(console.error);
}
