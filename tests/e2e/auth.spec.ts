import { test, expect } from '@playwright/test';

test.describe('認証機能', () => {
  test('ログインページが正しく表示される', async ({ page }) => {
    await page.goto('/auth/login');
    
    // ページタイトルを確認
    await expect(page.locator('h1')).toContainText('ログイン');
    
    // フォーム要素が存在することを確認
    const emailInput = page.locator('input[type="email"]');
    const passwordInput = page.locator('input[type="password"]');
    const submitButton = page.locator('button[type="submit"]');
    
    await expect(emailInput).toBeVisible();
    await expect(passwordInput).toBeVisible();
    await expect(submitButton).toBeVisible();
    
    // 新規登録リンクが存在することを確認
    const registerLink = page.locator('text=新規登録');
    await expect(registerLink).toBeVisible();
  });

  test('新規登録ページが正しく表示される', async ({ page }) => {
    await page.goto('/auth/register');
    
    // ページタイトルを確認
    await expect(page.locator('h1')).toContainText('新規登録');
    
    // フォーム要素が存在することを確認
    const nameInput = page.locator('input[name="name"]');
    const emailInput = page.locator('input[type="email"]');
    const passwordInput = page.locator('input[type="password"]');
    const confirmPasswordInput = page.locator('input[name="confirmPassword"]');
    const submitButton = page.locator('button[type="submit"]');
    
    await expect(nameInput).toBeVisible();
    await expect(emailInput).toBeVisible();
    await expect(passwordInput).toBeVisible();
    await expect(confirmPasswordInput).toBeVisible();
    await expect(submitButton).toBeVisible();
  });

  test('無効なメールアドレスでエラーが表示される', async ({ page }) => {
    await page.goto('/auth/login');
    
    // 無効なメールアドレスを入力
    await page.fill('input[type="email"]', 'invalid-email');
    await page.fill('input[type="password"]', 'password123');
    
    // 送信ボタンをクリック
    await page.click('button[type="submit"]');
    
    // エラーメッセージが表示されることを確認
    const errorMessage = page.locator('text=有効なメールアドレスを入力してください');
    await expect(errorMessage).toBeVisible();
  });

  test('パスワードが短すぎる場合にエラーが表示される', async ({ page }) => {
    await page.goto('/auth/register');
    
    // 短いパスワードを入力
    await page.fill('input[name="name"]', 'テストユーザー');
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', '123');
    await page.fill('input[name="confirmPassword"]', '123');
    
    // 送信ボタンをクリック
    await page.click('button[type="submit"]');
    
    // エラーメッセージが表示されることを確認
    const errorMessage = page.locator('text=/パスワードは.+文字以上/');
    await expect(errorMessage).toBeVisible();
  });

  test('パスワードが一致しない場合にエラーが表示される', async ({ page }) => {
    await page.goto('/auth/register');
    
    // 異なるパスワードを入力
    await page.fill('input[name="name"]', 'テストユーザー');
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', 'password123');
    await page.fill('input[name="confirmPassword"]', 'password456');
    
    // 送信ボタンをクリック
    await page.click('button[type="submit"]');
    
    // エラーメッセージが表示されることを確認
    const errorMessage = page.locator('text=パスワードが一致しません');
    await expect(errorMessage).toBeVisible();
  });

  test('ログインページから新規登録ページへ遷移できる', async ({ page }) => {
    await page.goto('/auth/login');
    
    // 新規登録リンクをクリック
    await page.click('text=新規登録');
    
    // 新規登録ページに遷移することを確認
    await expect(page).toHaveURL(/\/auth\/register/);
    await expect(page.locator('h1')).toContainText('新規登録');
  });

  test('新規登録ページからログインページへ遷移できる', async ({ page }) => {
    await page.goto('/auth/register');
    
    // ログインリンクをクリック
    await page.click('text=ログイン');
    
    // ログインページに遷移することを確認
    await expect(page).toHaveURL(/\/auth\/login/);
    await expect(page.locator('h1')).toContainText('ログイン');
  });

  test('パスワードの表示/非表示切り替えが機能する', async ({ page }) => {
    await page.goto('/auth/login');
    
    const passwordInput = page.locator('input[type="password"]');
    const toggleButton = page.locator('[aria-label="パスワードを表示"]');
    
    // 初期状態ではパスワードが非表示
    await expect(passwordInput).toHaveAttribute('type', 'password');
    
    // トグルボタンをクリック
    await toggleButton.click();
    
    // パスワードが表示される
    await expect(passwordInput).toHaveAttribute('type', 'text');
    
    // 再度クリックで非表示に戻る
    await toggleButton.click();
    await expect(passwordInput).toHaveAttribute('type', 'password');
  });
});
