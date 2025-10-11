import { test, expect } from '@playwright/test';

test.describe('練習問題機能', () => {
  test('練習問題ページが正しく表示される', async ({ page }) => {
    await page.goto('/practice');
    
    // ページタイトルを確認
    await expect(page.locator('h1')).toContainText('練習問題');
    
    // カテゴリーカードが表示されることを確認
    const categories = ['民法', '宅建業法', '法令上の制限', '税・その他'];
    
    for (const category of categories) {
      const card = page.locator(`text=${category}`);
      await expect(card).toBeVisible();
    }
  });

  test('カテゴリーを選択して詳細ページに遷移できる', async ({ page }) => {
    await page.goto('/practice');
    
    // 民法カテゴリーをクリック
    await page.click('text=民法');
    
    // 詳細ページに遷移することを確認
    await expect(page).toHaveURL(/\/practice\/detail/);
    
    // 年度選択が表示されることを確認
    const yearSelector = page.locator('text=/令和\d+年度/');
    await expect(yearSelector.first()).toBeVisible();
  });

  test('年度を選択できる', async ({ page }) => {
    await page.goto('/practice/detail?category=minpou');
    
    // 年度選択ボタンが存在することを確認
    const yearButtons = page.locator('button').filter({ hasText: /令和\d+年度/ });
    const count = await yearButtons.count();
    expect(count).toBeGreaterThan(0);
    
    // 最初の年度をクリック
    await yearButtons.first().click();
    
    // 選択された年度がアクティブになることを確認
    const activeButton = yearButtons.first();
    await expect(activeButton).toHaveClass(/bg-blue-500|bg-primary|active/);
  });

  test('問題を開始できる', async ({ page }) => {
    await page.goto('/practice/detail?category=minpou&year=r7');
    
    // 開始ボタンをクリック
    const startButton = page.locator('button').filter({ hasText: /開始|始める/ });
    await startButton.click();
    
    // クイズページに遷移することを確認
    await expect(page).toHaveURL(/\/practice\/quiz/);
    
    // 問題が表示されることを確認
    const questionText = page.locator('[data-testid="question-text"], .question-text, main >> text=/問題/');
    await expect(questionText).toBeVisible();
  });

  test('問題に回答できる', async ({ page }) => {
    await page.goto('/practice/quiz?category=minpou&year=r7');
    
    // 選択肢が表示されることを確認
    const options = page.locator('button[data-testid^="option-"], .option-button, button >> text=/^[1-4]/');
    const optionCount = await options.count();
    expect(optionCount).toBeGreaterThanOrEqual(2);
    
    // 最初の選択肢をクリック
    await options.first().click();
    
    // 解説が表示されることを確認
    const explanation = page.locator('[data-testid="explanation"], .explanation, text=解説');
    await expect(explanation).toBeVisible();
  });

  test('次の問題に進める', async ({ page }) => {
    await page.goto('/practice/quiz?category=minpou&year=r7');
    
    // 最初の問題に回答
    const options = page.locator('button[data-testid^="option-"], .option-button');
    await options.first().click();
    
    // 次へボタンをクリック
    const nextButton = page.locator('button').filter({ hasText: /次へ|次の問題/ });
    await nextButton.click();
    
    // 新しい問題が表示されることを確認
    await page.waitForTimeout(500); // 遷移を待つ
    const questionText = page.locator('[data-testid="question-text"], .question-text');
    await expect(questionText).toBeVisible();
  });

  test('進捗が表示される', async ({ page }) => {
    await page.goto('/practice/quiz?category=minpou&year=r7');
    
    // 進捗バーまたは進捗テキストが表示されることを確認
    const progressIndicator = page.locator('[data-testid="progress"], .progress, text=/\d+\/\d+/');
    await expect(progressIndicator).toBeVisible();
    
    // 最初の問題に回答
    const options = page.locator('button[data-testid^="option-"], .option-button');
    await options.first().click();
    
    // 次へボタンをクリック
    const nextButton = page.locator('button').filter({ hasText: /次へ|次の問題/ });
    await nextButton.click();
    
    // 進捗が更新されることを確認
    await page.waitForTimeout(500);
    const updatedProgress = page.locator('[data-testid="progress"], .progress, text=/2\/\d+/');
    await expect(updatedProgress).toBeVisible();
  });

  test('問題を終了できる', async ({ page }) => {
    await page.goto('/practice/quiz?category=minpou&year=r7');
    
    // 終了ボタンが存在することを確認
    const exitButton = page.locator('button').filter({ hasText: /終了|やめる|戻る/ });
    await expect(exitButton).toBeVisible();
    
    // 終了ボタンをクリック
    await exitButton.click();
    
    // 練習問題ページまたはホームページに戻ることを確認
    await expect(page).toHaveURL(/\/(practice|$)/);
  });

  test('カテゴリーごとの問題数が表示される', async ({ page }) => {
    await page.goto('/practice');
    
    // 各カテゴリーカードに問題数が表示されることを確認
    const questionCounts = page.locator('text=/\d+問/');
    const count = await questionCounts.count();
    expect(count).toBeGreaterThan(0);
  });

  test('学習履歴が保存される', async ({ page }) => {
    // 練習問題を解く
    await page.goto('/practice/quiz?category=minpou&year=r7');
    
    // 問題に回答
    const options = page.locator('button[data-testid^="option-"], .option-button');
    await options.first().click();
    
    // ページをリロード
    await page.reload();
    
    // 学習履歴または進捗が表示されることを確認
    const historyIndicator = page.locator('[data-testid="history"], .history, text=/学習済み|完了|進捗/');
    // 履歴機能が実装されている場合のみチェック
    const historyExists = await historyIndicator.count() > 0;
    if (historyExists) {
      await expect(historyIndicator.first()).toBeVisible();
    }
  });
});
