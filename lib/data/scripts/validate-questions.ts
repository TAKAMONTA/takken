// 問題データの検証スクリプト
import { Question } from '@/lib/types/quiz';

// 問題データの検証結果の型定義
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  stats: {
    totalQuestions: number;
    validQuestions: number;
    invalidQuestions: number;
  };
}

// 単一の問題データを検証する関数
export function validateQuestion(question: Question, index: number): string[] {
  const errors: string[] = [];
  
  // 必須フィールドの検証
  if (!question.id || question.id <= 0) {
    errors.push(`問題${index + 1}: IDが無効です (${question.id})`);
  }
  
  if (!question.question || question.question.trim().length === 0) {
    errors.push(`問題${index + 1}: 問題文が空です`);
  }
  
  if (!question.options || !Array.isArray(question.options)) {
    errors.push(`問題${index + 1}: 選択肢が配列ではありません`);
  } else {
    // 選択肢の検証
    if (question.options.length < 2) {
      errors.push(`問題${index + 1}: 選択肢が2つ未満です`);
    }
    
    if (question.options.length > 5) {
      errors.push(`問題${index + 1}: 選択肢が5つを超えています`);
    }
    
    question.options.forEach((option, optionIndex) => {
      if (!option || option.trim().length === 0) {
        errors.push(`問題${index + 1}: 選択肢${optionIndex + 1}が空です`);
      }
    });
  }
  
  // 正解の検証
  if (question.correctAnswer === undefined || question.correctAnswer === null) {
    errors.push(`問題${index + 1}: 正解が設定されていません`);
  } else {
    if (question.correctAnswer < 0 || question.correctAnswer >= question.options.length) {
      errors.push(`問題${index + 1}: 正解のインデックスが無効です (${question.correctAnswer})`);
    }
  }
  
  // 解説の検証
  if (!question.explanation || question.explanation.trim().length === 0) {
    errors.push(`問題${index + 1}: 解説が空です`);
  }
  
  // カテゴリの検証
  const validCategories = ['takkengyouhou', 'minpou', 'hourei', 'zeihou'];
  if (!question.category || !validCategories.includes(question.category)) {
    errors.push(`問題${index + 1}: カテゴリが無効です (${question.category})`);
  }
  
  // 難易度の検証
  const validDifficulties = ['基礎', '標準', '応用'];
  if (!question.difficulty || !validDifficulties.includes(question.difficulty)) {
    errors.push(`問題${index + 1}: 難易度が無効です (${question.difficulty})`);
  }
  
  // 年度の検証
  if (!question.year || question.year.trim().length === 0) {
    errors.push(`問題${index + 1}: 年度が設定されていません`);
  } else {
    const yearNum = parseInt(question.year);
    const currentYear = new Date().getFullYear();
    if (isNaN(yearNum) || yearNum < 1988 || yearNum > currentYear) {
      errors.push(`問題${index + 1}: 年度が無効です (${question.year})`);
    }
  }
  
  return errors;
}

// 問題データ配列を検証する関数
export function validateQuestions(questions: Question[]): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  let validQuestions = 0;
  
  if (!Array.isArray(questions)) {
    errors.push('問題データが配列ではありません');
    return {
      isValid: false,
      errors,
      warnings,
      stats: {
        totalQuestions: 0,
        validQuestions: 0,
        invalidQuestions: 0
      }
    };
  }
  
  // IDの重複チェック
  const ids = questions.map(q => q.id);
  const duplicateIds = ids.filter((id, index) => ids.indexOf(id) !== index);
  if (duplicateIds.length > 0) {
    errors.push(`重複するIDが見つかりました: ${duplicateIds.join(', ')}`);
  }
  
  // 各問題の検証
  questions.forEach((question, index) => {
    const questionErrors = validateQuestion(question, index);
    if (questionErrors.length === 0) {
      validQuestions++;
    } else {
      errors.push(...questionErrors);
    }
  });
  
  // 警告の生成
  if (questions.length === 0) {
    warnings.push('問題データが空です');
  } else if (questions.length < 10) {
    warnings.push(`問題数が少なすぎます (${questions.length}問)`);
  }
  
  // カテゴリ別の問題数チェック
  const categoryCount = questions.reduce((acc, q) => {
    acc[q.category] = (acc[q.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  Object.entries(categoryCount).forEach(([category, count]) => {
    if (count < 5) {
      warnings.push(`${category}カテゴリの問題数が少なすぎます (${count}問)`);
    }
  });
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    stats: {
      totalQuestions: questions.length,
      validQuestions,
      invalidQuestions: questions.length - validQuestions
    }
  };
}

// カテゴリ別の問題データを検証
export async function validateAllCategories(): Promise<Record<string, ValidationResult>> {
  const results: Record<string, ValidationResult> = {};
  
  try {
    // 各カテゴリの問題データを動的インポートして検証
    const categories = [
      { name: 'takkengyouhou', path: '../questions/takkengyouhou' },
      { name: 'minpou', path: '../questions/minpou' },
      { name: 'hourei', path: '../questions/hourei' },
      { name: 'zeihou', path: '../questions/zeihou' }
    ];
    
    for (const category of categories) {
      try {
        const module = await import(category.path);
        const questions = module[`${category.name}Questions`] || [];
        results[category.name] = validateQuestions(questions);
      } catch (error) {
        results[category.name] = {
          isValid: false,
          errors: [`${category.name}カテゴリの読み込みに失敗しました: ${error}`],
          warnings: [],
          stats: {
            totalQuestions: 0,
            validQuestions: 0,
            invalidQuestions: 0
          }
        };
      }
    }
    
  } catch (error) {
    console.error('検証処理でエラーが発生しました:', error);
  }
  
  return results;
}

// 検証結果をコンソールに出力
export function printValidationResults(results: Record<string, ValidationResult>): void {
  console.log('\n=== 問題データ検証結果 ===\n');
  
  let totalQuestions = 0;
  let totalValid = 0;
  let totalInvalid = 0;
  
  Object.entries(results).forEach(([category, result]) => {
    console.log(`【${category}】`);
    console.log(`  総問題数: ${result.stats.totalQuestions}`);
    console.log(`  有効問題数: ${result.stats.validQuestions}`);
    console.log(`  無効問題数: ${result.stats.invalidQuestions}`);
    console.log(`  検証結果: ${result.isValid ? '✅ 合格' : '❌ 不合格'}`);
    
    if (result.errors.length > 0) {
      console.log('  エラー:');
      result.errors.forEach(error => console.log(`    - ${error}`));
    }
    
    if (result.warnings.length > 0) {
      console.log('  警告:');
      result.warnings.forEach(warning => console.log(`    - ${warning}`));
    }
    
    console.log('');
    
    totalQuestions += result.stats.totalQuestions;
    totalValid += result.stats.validQuestions;
    totalInvalid += result.stats.invalidQuestions;
  });
  
  console.log('=== 全体統計 ===');
  console.log(`総問題数: ${totalQuestions}`);
  console.log(`有効問題数: ${totalValid}`);
  console.log(`無効問題数: ${totalInvalid}`);
  console.log(`全体検証結果: ${totalInvalid === 0 ? '✅ 合格' : '❌ 不合格'}`);
}

// メイン検証関数
export async function runValidation(): Promise<void> {
  console.log('問題データの検証を開始します...\n');
  
  const results = await validateAllCategories();
  printValidationResults(results);
}

// スクリプトとして直接実行された場合のメイン処理
if (require.main === module) {
  runValidation().catch(console.error);
}
