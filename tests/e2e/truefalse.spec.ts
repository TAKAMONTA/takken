import { test, expect } from '@playwright/test';

test.describe('○×問題（法令別）', () => {
  test('カテゴリ選択から出題開始まで', async ({ page }) => {
    // ○×問題ページにアクセス
    await page.goto('/truefalse');

    // ページタイトルの確認
    await expect(page.locator('h1')).toContainText('○×問題（法令別）');

    // 法令カテゴリが表示されることを確認
    await expect(page.locator('text=宅建業法')).toBeVisible();
    await expect(page.locator('text=民法等')).toBeVisible();
    await expect(page.locator('text=法令上の制限')).toBeVisible();
    await expect(page.locator('text=税・その他')).toBeVisible();

    // 宅建業法を選択
    await page.click('text=宅建業法');

    // 出題数選択が表示されることを確認
    await expect(page.getByRole('button', { name: '10問' })).toBeVisible();
    await expect(page.getByRole('button', { name: '20問' })).toBeVisible();
    await expect(page.getByRole('button', { name: '30問' })).toBeVisible();

    // 20問を選択
    await page.getByRole('button', { name: '20問' }).click();

    // 開始ボタンが有効になることを確認
    const startButton = page.locator('text=○×問題を開始');
    await expect(startButton).toBeEnabled();

    // 選択内容の確認表示
    await expect(page.locator('text=宅建業法の○×問題を 20問 出題します')).toBeVisible();

    // 開始ボタンをクリック
    await startButton.click();

    // クイズページに遷移することを確認
    await expect(page).toHaveURL(/\/truefalse\/quiz\/?\?law=takkengyouhou&count=20/);
  });

  test('○×問題の回答フロー', async ({ page }) => {
    // クイズページに直接アクセス（宅建業法、10問）
    await page.goto('/truefalse/quiz?law=takkengyouhou&count=10');

    // ページが読み込まれるまで待機
    await page.waitForSelector('text=宅建業法 ○×問題', { timeout: 10000 });

    // 問題が表示されることを確認
    await expect(page.locator('text=問題 1 / 10')).toBeVisible();

    // ○×ボタンが表示されることを確認
    await expect(page.locator('text=○（正しい）')).toBeVisible();
    await expect(page.locator('text=×（誤り）')).toBeVisible();

    // ○ボタンをクリック
    await page.click('text=○（正しい）');

    // 結果が表示されることを確認（正解または不正解）
    await expect(page.locator('text=正解！').or(page.locator('text=不正解'))).toBeVisible();

    // 次へボタンが表示されることを確認
    const nextButton = page.locator('text=次の問題へ');
    await expect(nextButton).toBeVisible();

    // 次へボタンをクリック
    await nextButton.click();

    // 次の問題に進むことを確認
    await expect(page.locator('text=問題 2 / 10')).toBeVisible();
  });

  test('○×問題の完了フロー', async ({ page }) => {
    // クイズページに直接アクセス（少ない問題数でテスト）
    await page.goto('/truefalse/quiz?law=zeihou&count=3');

    // ページが読み込まれるまで待機
    await page.waitForSelector('text=税・その他 ○×問題', { timeout: 10000 });

    // 3問すべてに回答
    for (let i = 1; i <= 3; i++) {
      // 問題番号の確認
      await expect(page.locator(`text=問題 ${i} / 3`)).toBeVisible();

      // ○ボタンをクリック
      await page.click('text=○（正しい）');

      // 結果表示を待機
      await expect(page.locator('text=正解！').or(page.locator('text=不正解'))).toBeVisible();

      if (i < 3) {
        // 最後の問題でない場合は次へ
        await page.click('text=次の問題へ');
      } else {
        // 最後の問題の場合は結果を見る
        await page.click('text=結果を見る');
      }
    }

    // 結果画面が表示されることを確認
    await expect(page.locator('text=お疲れさまでした！')).toBeVisible();

    // スコアが表示されることを確認
    await expect(page.locator('text=点').first()).toBeVisible();

    // 統計情報が表示されることを確認
    await expect(page.locator('text=正解数')).toBeVisible();
    await expect(page.locator('text=総問題数')).toBeVisible();
    await expect(page.locator('text=所要時間')).toBeVisible();
    await expect(page.locator('text=獲得XP')).toBeVisible();

    // アクションボタンが表示されることを確認
    await expect(page.locator('text=もう一度挑戦')).toBeVisible();
    await expect(page.locator('text=他のカテゴリへ')).toBeVisible();

    // 他のカテゴリへボタンをクリック
    await page.click('text=他のカテゴリへ');

    // カテゴリ選択画面に戻ることを確認
    await expect(page).toHaveURL(/\/truefalse\/?$/);
  });

  test('進捗バーの動作確認', async ({ page }) => {
    // クイズページにアクセス
    await page.goto('/truefalse/quiz?law=hourei&count=5');

    // ページが読み込まれるまで待機
    await page.waitForSelector('text=法令上の制限 ○×問題', { timeout: 10000 });

    // 初期の進捗バーを確認（進捗バーコンテナが存在することを確認）
    const progressContainer = page.locator('[role="progressbar"], .w-full.bg-gray-200');
    await expect(progressContainer).toBeVisible();

    // 1問目に回答
    await page.click('text=×（誤り）');
    await expect(page.locator('text=正解！').or(page.locator('text=不正解'))).toBeVisible();

    // 進捗が進んでいることを確認（視覚的な変化）
    await page.click('text=次の問題へ');
    await expect(page.locator('text=問題 2 / 5')).toBeVisible();
  });

  test('データが正しく生成されることを確認', async ({ page }) => {
    // 各カテゴリで問題が生成されることを確認
    const categories = ['takkengyouhou', 'minpou', 'hourei', 'zeihou'];

    for (const category of categories) {
      await page.goto(`/truefalse/quiz?law=${category}&count=1`);
      
      // 問題が表示されることを確認
      await page.waitForSelector('text=○（正しい）', { timeout: 10000 });
      await expect(page.locator('text=×（誤り）')).toBeVisible();

      // 問題文が存在することを確認（空でない）
      const questionText = await page.locator('.text-lg.leading-relaxed').textContent();
      expect(questionText).toBeTruthy();
      expect(questionText!.length).toBeGreaterThan(5);
    }
  });
});
