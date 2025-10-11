// 宅建試験過去問道場からのデータ抽出スクリプト
import puppeteer, { Browser, Page } from 'puppeteer';
import { Question } from '../../types/quiz';
import fs from 'fs';
import path from 'path';

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

interface ScrapeConfig {
  baseUrl: string;
  years: string[];
  categories: {
    [key: string]: {
      name: string;
      mapping: string; // 現在のシステムでのカテゴリ名
    };
  };
  delay: number; // リクエスト間隔（ミリ秒）
}

const config: ScrapeConfig = {
  baseUrl: 'https://takken-siken.com/kakomon.php',
  years: [
    '令和2年10月試験',
    '令和2年12月試験',
    '令和元年試験',
    '平成30年試験',
    '平成29年試験',
    '平成28年試験',
    '平成27年試験',
    '平成26年試験',
    '平成25年試験',
    '平成24年試験'
  ],
  categories: {
    '権利関係': { name: '権利関係', mapping: 'minpou' },
    '法令上の制限': { name: '法令上の制限', mapping: 'hourei' },
    '税に関する法令': { name: '税に関する法令', mapping: 'zeihou' },
    '宅地建物取引業法等': { name: '宅地建物取引業法等', mapping: 'takkengyouhou' },
    '不動産価格の評定': { name: '不動産価格の評定', mapping: 'hourei' },
    '土地と建物及びその需給': { name: '土地と建物及びその需給', mapping: 'hourei' }
  },
  delay: 2000 // 2秒間隔
};

export class TakkenSikenScraper {
  private browser: Browser | null = null;
  private page: Page | null = null;

  async initialize(): Promise<void> {
    console.log('ブラウザを起動中...');
    this.browser = await puppeteer.launch({
      headless: false, // デバッグ用に表示
      slowMo: 100,
      args: [
        '--no-sandbox', 
        '--disable-setuid-sandbox',
        '--ignore-certificate-errors',
        '--ignore-ssl-errors',
        '--allow-running-insecure-content',
        '--disable-web-security'
      ]
    });
    
    this.page = await this.browser.newPage();
    await this.page.setViewport({ width: 1200, height: 800 });
    
    // ユーザーエージェントを設定
    await this.page.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    );
  }

  async navigateToSite(): Promise<void> {
    if (!this.page) throw new Error('ページが初期化されていません');
    
    console.log('宅建試験過去問道場にアクセス中...');
    await this.page.goto(config.baseUrl, { waitUntil: 'networkidle2' });
    
    // ページが正しく読み込まれたか確認
    const title = await this.page.title();
    console.log(`ページタイトル: ${title}`);
  }

  async selectYearAndCategory(year: string, category: string): Promise<void> {
    if (!this.page) throw new Error('ページが初期化されていません');
    
    console.log(`年度: ${year}, カテゴリ: ${category} を選択中...`);
    
    try {
      // まず全てのチェックボックスを解除
      await this.page.evaluate(() => {
        const checkboxes = document.querySelectorAll('input[type="checkbox"]');
        checkboxes.forEach(checkbox => {
          (checkbox as HTMLInputElement).checked = false;
        });
      });
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // 年度マッピング（分析結果に基づく）
      const yearMapping: { [key: string]: string } = {
        '令和2年10月試験': '20-1',
        '令和2年12月試験': '20-2',
        '令和元年試験': '19',
        '平成30年試験': '18',
        '平成29年試験': '17',
        '平成28年試験': '16',
        '平成27年試験': '15',
        '平成26年試験': '14',
        '平成25年試験': '13',
        '平成24年試験': '12'
      };
      
      // 分野マッピング（分析結果に基づく）
      const categoryMapping: { [key: string]: string } = {
        '権利関係': '1',
        '法令上の制限': '2',
        '税に関する法令': '3',
        '不動産価格の評定': '4',
        '宅地建物取引業法等': '5',
        '土地と建物及びその需給': '6'
      };
      
      const yearValue = yearMapping[year];
      const categoryValue = categoryMapping[category];
      
      if (!yearValue) {
        throw new Error(`年度 ${year} のマッピングが見つかりません`);
      }
      
      if (!categoryValue) {
        throw new Error(`カテゴリ ${category} のマッピングが見つかりません`);
      }
      
      // 指定年度をチェック
      const yearChecked = await this.page.evaluate((value: string) => {
        const checkbox = document.querySelector(`input[name="times[]"][value="${value}"]`) as HTMLInputElement;
        if (checkbox) {
          checkbox.checked = true;
          return true;
        }
        return false;
      }, yearValue);
      
      if (!yearChecked) {
        console.warn(`年度 ${year} (値: ${yearValue}) のチェックボックスが見つかりません`);
      }
      
      // 指定分野をチェック
      const categoryChecked = await this.page.evaluate((value: string) => {
        const checkbox = document.querySelector(`input[name="fields[]"][value="${value}"]`) as HTMLInputElement;
        if (checkbox) {
          checkbox.checked = true;
          return true;
        }
        return false;
      }, categoryValue);
      
      if (!categoryChecked) {
        console.warn(`カテゴリ ${category} (値: ${categoryValue}) のチェックボックスが見つかりません`);
      }
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
    } catch (error) {
      console.error(`年度・カテゴリ選択でエラー: ${error}`);
      throw error;
    }
  }

  async startQuiz(): Promise<void> {
    if (!this.page) throw new Error('ページが初期化されていません');
    
    console.log('出題開始ボタンをクリック...');
    
    try {
      // 出題開始ボタンをクリック（クラス名で特定）
      const startButton = await this.page.$('button.submit.sendConfigform');
      if (startButton) {
        await startButton.click();
        await this.page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 30000 });
      } else {
        throw new Error('出題開始ボタンが見つかりません');
      }
    } catch (error) {
      console.error(`出題開始でエラー: ${error}`);
      throw error;
    }
  }

  async extractQuestionData(): Promise<ScrapedQuestion[]> {
    if (!this.page) throw new Error('ページが初期化されていません');
    
    const questions: ScrapedQuestion[] = [];
    let questionNumber = 1;
    
    console.log('問題データの抽出を開始...');
    
    try {
      while (true) {
        console.log(`問題 ${questionNumber} を抽出中...`);
        
        // 問題文を取得
        const questionText = await this.page.$eval('.question-text', (el: Element) => el.textContent?.trim() || '');
        
        // 選択肢を取得
        const options = await this.page.$$eval('.option', (elements: Element[]) => 
          elements.map((el: Element) => el.textContent?.trim() || '')
        );
        
        // 正解を表示するために解答ボタンをクリック
        const answerButton = await this.page.$('.show-answer-btn');
        if (answerButton) {
          await answerButton.click();
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
        
        // 正解番号を取得
        const correctAnswer = await this.page.$eval('.correct-answer', (el: Element) => {
          const text = el.textContent || '';
          const match = text.match(/(\d+)/);
          return match ? parseInt(match[1]) : 1;
        });
        
        // 解説を取得
        const explanation = await this.page.$eval('.explanation', (el: Element) => el.textContent?.trim() || '');
        
        const question: ScrapedQuestion = {
          id: questionNumber,
          question: questionText,
          options: options,
          correctAnswer: correctAnswer,
          explanation: explanation,
          category: 'unknown', // 後で設定
          difficulty: 'medium', // デフォルト値
          year: 'unknown', // 後で設定
        };
        
        questions.push(question);
        
        // 次の問題へ
        const nextButton = await this.page.$('.next-question-btn');
        if (nextButton) {
          await nextButton.click();
          await new Promise(resolve => setTimeout(resolve, config.delay));
          questionNumber++;
        } else {
          console.log('全ての問題を抽出完了');
          break;
        }
      }
    } catch (error) {
      console.error(`問題抽出でエラー: ${error}`);
      throw error;
    }
    
    return questions;
  }

  async scrapeYearCategory(year: string, category: string): Promise<ScrapedQuestion[]> {
    try {
      await this.navigateToSite();
      await this.selectYearAndCategory(year, category);
      await this.startQuiz();
      
      const questions = await this.extractQuestionData();
      
      // カテゴリと年度情報を設定
      const categoryMapping = config.categories[category]?.mapping || 'unknown';
      questions.forEach(q => {
        q.category = categoryMapping;
        q.year = year;
      });
      
      return questions;
      
    } catch (error) {
      console.error(`${year} - ${category} の抽出でエラー: ${error}`);
      return [];
    }
  }

  async scrapeAllData(): Promise<ScrapedQuestion[]> {
    const allQuestions: ScrapedQuestion[] = [];
    
    for (const year of config.years) {
      for (const category of Object.keys(config.categories)) {
        console.log(`\n=== ${year} - ${category} の抽出開始 ===`);
        
        try {
          const questions = await this.scrapeYearCategory(year, category);
          allQuestions.push(...questions);
          
          console.log(`${questions.length}問を抽出しました`);
          
          // 次のカテゴリまで待機
          await new Promise(resolve => setTimeout(resolve, config.delay));
          
        } catch (error) {
          console.error(`${year} - ${category} の抽出に失敗: ${error}`);
          continue;
        }
      }
    }
    
    return allQuestions;
  }

  async saveToFile(questions: ScrapedQuestion[], filename: string): Promise<void> {
    const outputDir = path.join(process.cwd(), 'scraped-data');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    const filePath = path.join(outputDir, filename);
    fs.writeFileSync(filePath, JSON.stringify(questions, null, 2), 'utf-8');
    
    console.log(`データを ${filePath} に保存しました`);
  }

  async close(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      console.log('ブラウザを終了しました');
    }
  }
}

// メイン実行関数
export async function scrapeTakkenSiken(): Promise<void> {
  const scraper = new TakkenSikenScraper();
  
  try {
    await scraper.initialize();
    
    // テスト用に1年度・1カテゴリのみ抽出
    console.log('=== テスト抽出開始 ===');
    const testQuestions = await scraper.scrapeYearCategory('令和2年10月試験', '権利関係');
    
    if (testQuestions.length > 0) {
      await scraper.saveToFile(testQuestions, 'test-scraped-questions.json');
      console.log(`テスト抽出完了: ${testQuestions.length}問`);
    }
    
    // 全データ抽出（コメントアウト）
    // const allQuestions = await scraper.scrapeAllData();
    // await scraper.saveToFile(allQuestions, 'all-scraped-questions.json');
    
  } catch (error) {
    console.error('スクレイピングでエラーが発生しました:', error);
  } finally {
    await scraper.close();
  }
}

// スクリプトとして直接実行された場合
if (require.main === module) {
  scrapeTakkenSiken().catch(console.error);
}
