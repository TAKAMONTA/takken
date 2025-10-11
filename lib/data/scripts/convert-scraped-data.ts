// スクレイピングしたデータを現在のシステム形式に変換するスクリプト
import fs from 'fs';
import path from 'path';
import { Question } from '../../types/quiz';

interface ScrapedQuestion {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  category: string;
  difficulty: string;
  year: string;
  exam?: string;
}

interface ConversionConfig {
  categoryMapping: {
    [key: string]: string;
  };
  yearMapping: {
    [key: string]: string;
  };
}

const config: ConversionConfig = {
  categoryMapping: {
    'minpou': '民法等',
    'hourei': '法令上の制限',
    'zeihou': '税法',
    'takkengyouhou': '宅建業法'
  },
  yearMapping: {
    '令和2年10月試験': 'r2-10',
    '令和2年12月試験': 'r2-12',
    '令和元年試験': 'r1',
    '平成30年試験': 'h30',
    '平成29年試験': 'h29',
    '平成28年試験': 'h28',
    '平成27年試験': 'h27',
    '平成26年試験': 'h26',
    '平成25年試験': 'h25',
    '平成24年試験': 'h24'
  }
};

export class DataConverter {
  
  /**
   * スクレイピングしたデータを現在のシステム形式に変換
   */
  convertScrapedData(scrapedQuestions: ScrapedQuestion[]): Question[] {
    return scrapedQuestions.map((scraped, index) => {
      // IDを生成（年度 + カテゴリ + 連番）
      const yearCode = config.yearMapping[scraped.year] || 'unknown';
      const questionId = `${yearCode}_${scraped.category}_${String(index + 1).padStart(2, '0')}`;
      
      const question: Question = {
        id: scraped.id,
        question: this.cleanText(scraped.question),
        options: scraped.options.map(option => this.cleanText(option)),
        correctAnswer: scraped.correctAnswer,
        explanation: this.cleanText(scraped.explanation),
        category: config.categoryMapping[scraped.category] || scraped.category,
        difficulty: this.mapDifficulty(scraped.difficulty),
        year: yearCode,
        exam: this.extractExamType(scraped.year)
      };
      
      return question;
    });
  }
  
  /**
   * テキストをクリーンアップ
   */
  private cleanText(text: string): string {
    return text
      .replace(/\s+/g, ' ') // 複数の空白を1つに
      .replace(/^\s+|\s+$/g, '') // 前後の空白を削除
      .replace(/\n\s*\n/g, '\n') // 複数の改行を1つに
      .trim();
  }
  
  /**
   * 難易度をマッピング
   */
  private mapDifficulty(difficulty: string): string {
    const difficultyMap: { [key: string]: string } = {
      'easy': 'easy',
      'medium': 'medium',
      'hard': 'hard'
    };
    
    return difficultyMap[difficulty] || 'medium';
  }
  
  /**
   * 試験タイプを抽出
   */
  private extractExamType(year: string): string | undefined {
    if (year.includes('10月')) return '10月';
    if (year.includes('12月')) return '12月';
    return undefined;
  }
  
  /**
   * カテゴリ別にデータを分類
   */
  groupByCategory(questions: Question[]): { [category: string]: Question[] } {
    const grouped: { [category: string]: Question[] } = {};
    
    questions.forEach(question => {
      const category = question.category;
      if (!grouped[category]) {
        grouped[category] = [];
      }
      grouped[category].push(question);
    });
    
    return grouped;
  }
  
  /**
   * 年度別にデータを分類
   */
  groupByYear(questions: Question[]): { [year: string]: Question[] } {
    const grouped: { [year: string]: Question[] } = {};
    
    questions.forEach(question => {
      const year = question.year;
      if (!grouped[year]) {
        grouped[year] = [];
      }
      grouped[year].push(question);
    });
    
    return grouped;
  }
  
  /**
   * TypeScriptファイル形式で出力
   */
  generateTypeScriptFile(questions: Question[], category: string, year: string): string {
    const categoryName = category.toLowerCase().replace(/[^a-z0-9]/g, '');
    const yearCode = year.toLowerCase();
    
    const template = `// ${category} ${year}年度 過去問データ
import { Question } from '../../../types/quiz';

export const ${categoryName}${yearCode}Questions: Question[] = ${JSON.stringify(questions, null, 2)};
`;
    
    return template;
  }
  
  /**
   * ファイルに保存
   */
  async saveToFiles(questions: Question[], outputDir: string): Promise<void> {
    // カテゴリ別に分類
    const byCategory = this.groupByCategory(questions);
    
    for (const [category, categoryQuestions] of Object.entries(byCategory)) {
      // 年度別に分類
      const byYear = this.groupByYear(categoryQuestions);
      
      for (const [year, yearQuestions] of Object.entries(byYear)) {
        const categoryDir = this.getCategoryDirectory(category);
        const fullDir = path.join(outputDir, categoryDir);
        
        // ディレクトリを作成
        if (!fs.existsSync(fullDir)) {
          fs.mkdirSync(fullDir, { recursive: true });
        }
        
        // TypeScriptファイルを生成
        const tsContent = this.generateTypeScriptFile(yearQuestions, category, year);
        const filename = `${year}.ts`;
        const filepath = path.join(fullDir, filename);
        
        fs.writeFileSync(filepath, tsContent, 'utf-8');
        console.log(`${category} ${year}年度のデータを ${filepath} に保存しました (${yearQuestions.length}問)`);
      }
    }
  }
  
  /**
   * カテゴリに対応するディレクトリ名を取得
   */
  private getCategoryDirectory(category: string): string {
    const dirMap: { [key: string]: string } = {
      '民法等': 'minpou',
      '法令上の制限': 'hourei',
      '税法': 'zeihou',
      '宅建業法': 'takkengyouhou'
    };
    
    return dirMap[category] || 'other';
  }
  
  /**
   * データ品質チェック
   */
  validateData(questions: Question[]): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    questions.forEach((question, index) => {
      // 必須フィールドのチェック
      if (!question.question || question.question.trim() === '') {
        errors.push(`問題 ${index + 1}: 問題文が空です`);
      }
      
      if (!question.options || question.options.length !== 4) {
        errors.push(`問題 ${index + 1}: 選択肢が4つではありません`);
      }
      
      if (question.correctAnswer < 1 || question.correctAnswer > 4) {
        errors.push(`問題 ${index + 1}: 正解番号が1-4の範囲外です`);
      }
      
      if (!question.explanation || question.explanation.trim() === '') {
        errors.push(`問題 ${index + 1}: 解説が空です`);
      }
      
      // 選択肢の内容チェック
      question.options.forEach((option, optionIndex) => {
        if (!option || option.trim() === '') {
          errors.push(`問題 ${index + 1}: 選択肢 ${optionIndex + 1} が空です`);
        }
      });
    });
    
    return {
      valid: errors.length === 0,
      errors
    };
  }
}

/**
 * メイン変換関数
 */
export async function convertScrapedData(inputFile: string, outputDir: string): Promise<void> {
  try {
    console.log(`スクレイピングデータの変換を開始: ${inputFile}`);
    
    // スクレイピングデータを読み込み
    const scrapedData: ScrapedQuestion[] = JSON.parse(fs.readFileSync(inputFile, 'utf-8'));
    console.log(`${scrapedData.length}問のデータを読み込みました`);
    
    // データ変換
    const converter = new DataConverter();
    const convertedQuestions = converter.convertScrapedData(scrapedData);
    
    // データ品質チェック
    const validation = converter.validateData(convertedQuestions);
    if (!validation.valid) {
      console.warn('データ品質の問題が検出されました:');
      validation.errors.forEach(error => console.warn(`  - ${error}`));
    }
    
    // ファイルに保存
    await converter.saveToFiles(convertedQuestions, outputDir);
    
    // 統計情報を表示
    const byCategory = converter.groupByCategory(convertedQuestions);
    console.log('\n=== 変換完了統計 ===');
    Object.entries(byCategory).forEach(([category, questions]) => {
      console.log(`${category}: ${questions.length}問`);
    });
    
    console.log(`\n変換完了: 合計 ${convertedQuestions.length}問`);
    
  } catch (error) {
    console.error('データ変換でエラーが発生しました:', error);
    throw error;
  }
}

// スクリプトとして直接実行された場合
if (require.main === module) {
  const inputFile = process.argv[2] || 'scraped-data/test-scraped-questions.json';
  const outputDir = process.argv[3] || 'lib/data/questions';
  
  convertScrapedData(inputFile, outputDir).catch(console.error);
}
