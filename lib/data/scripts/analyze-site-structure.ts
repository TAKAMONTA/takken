// 宅建試験過去問道場のサイト構造分析スクリプト
import puppeteer, { Browser, Page } from 'puppeteer';
import fs from 'fs';
import path from 'path';

export class SiteAnalyzer {
  private browser: Browser | null = null;
  private page: Page | null = null;

  async initialize(): Promise<void> {
    console.log('ブラウザを起動中...');
    this.browser = await puppeteer.launch({
      headless: false,
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
    
    await this.page.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    );
  }

  async analyzeSite(): Promise<void> {
    if (!this.page) throw new Error('ページが初期化されていません');
    
    try {
      console.log('サイトにアクセス中...');
      await this.page.goto('https://takken-siken.com/kakomon.php', { 
        waitUntil: 'networkidle2',
        timeout: 30000 
      });
      
      // ページタイトルを取得
      const title = await this.page.title();
      console.log(`ページタイトル: ${title}`);
      
      // HTMLソースを取得
      const htmlContent = await this.page.content();
      
      // HTMLを保存
      const outputDir = path.join(process.cwd(), 'scraped-data');
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }
      
      const htmlPath = path.join(outputDir, 'site-structure.html');
      fs.writeFileSync(htmlPath, htmlContent, 'utf-8');
      console.log(`HTMLを ${htmlPath} に保存しました`);
      
      // 主要な要素を分析
      await this.analyzeElements();
      
    } catch (error) {
      console.error('サイト分析でエラー:', error);
      throw error;
    }
  }

  async analyzeElements(): Promise<void> {
    if (!this.page) return;
    
    console.log('\n=== 要素分析開始 ===');
    
    // フォーム要素を分析
    const formElements = await this.page.evaluate(() => {
      const forms = Array.from(document.querySelectorAll('form'));
      return forms.map(form => ({
        id: form.id,
        className: form.className,
        action: form.action,
        method: form.method
      }));
    });
    
    console.log('フォーム要素:', formElements);
    
    // ボタン要素を分析
    const buttons = await this.page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button, input[type="button"], input[type="submit"]'));
      return btns.map(btn => ({
        tagName: btn.tagName,
        type: btn.getAttribute('type'),
        id: btn.id,
        className: btn.className,
        textContent: btn.textContent?.trim(),
        value: btn.getAttribute('value')
      }));
    });
    
    console.log('ボタン要素:', buttons);
    
    // チェックボックス要素を分析
    const checkboxes = await this.page.evaluate(() => {
      const inputs = Array.from(document.querySelectorAll('input[type="checkbox"]'));
      return inputs.map(input => ({
        id: input.id,
        name: input.getAttribute('name'),
        value: input.getAttribute('value'),
        className: input.className,
        checked: (input as HTMLInputElement).checked
      }));
    });
    
    console.log('チェックボックス要素:', checkboxes);
    
    // タブ要素を分析
    const tabs = await this.page.evaluate(() => {
      const tabElements = Array.from(document.querySelectorAll('[id^="tab"], .tab, [role="tab"]'));
      return tabElements.map(tab => ({
        id: tab.id,
        className: tab.className,
        textContent: tab.textContent?.trim(),
        tagName: tab.tagName
      }));
    });
    
    console.log('タブ要素:', tabs);
    
    // 分析結果を保存
    const analysis = {
      timestamp: new Date().toISOString(),
      forms: formElements,
      buttons: buttons,
      checkboxes: checkboxes,
      tabs: tabs
    };
    
    const analysisPath = path.join(process.cwd(), 'scraped-data', 'site-analysis.json');
    fs.writeFileSync(analysisPath, JSON.stringify(analysis, null, 2), 'utf-8');
    console.log(`分析結果を ${analysisPath} に保存しました`);
  }

  async testInteraction(): Promise<void> {
    if (!this.page) return;
    
    console.log('\n=== インタラクションテスト開始 ===');
    
    try {
      // 5秒待機してページが完全に読み込まれるのを待つ
      await new Promise(resolve => setTimeout(resolve, 5000));
      
      // 出題開始ボタンを探す
      const startButtons = await this.page.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll('button, input[type="button"], input[type="submit"]'));
        return buttons
          .filter(btn => btn.textContent?.includes('出題開始') || btn.getAttribute('value')?.includes('出題開始'))
          .map(btn => ({
            tagName: btn.tagName,
            textContent: btn.textContent?.trim(),
            value: btn.getAttribute('value'),
            className: btn.className,
            id: btn.id
          }));
      });
      
      console.log('出題開始ボタン候補:', startButtons);
      
      // スクリーンショットを撮影
      const screenshotPath = path.join(process.cwd(), 'scraped-data', 'site-screenshot.png') as `${string}.png`;
      await this.page.screenshot({ path: screenshotPath, fullPage: true });
      console.log(`スクリーンショットを ${screenshotPath} に保存しました`);
      
    } catch (error) {
      console.error('インタラクションテストでエラー:', error);
    }
  }

  async close(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      console.log('ブラウザを終了しました');
    }
  }
}

// メイン実行関数
export async function analyzeSiteStructure(): Promise<void> {
  const analyzer = new SiteAnalyzer();
  
  try {
    await analyzer.initialize();
    await analyzer.analyzeSite();
    await analyzer.testInteraction();
    
  } catch (error) {
    console.error('サイト構造分析でエラーが発生しました:', error);
  } finally {
    await analyzer.close();
  }
}

// スクリプトとして直接実行された場合
if (require.main === module) {
  analyzeSiteStructure().catch(console.error);
}
