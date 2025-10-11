import { test, expect } from "@playwright/test";

test.describe("ホームページ", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("ページタイトルが正しく表示される", async ({ page }) => {
    await expect(page).toHaveTitle(/宅建合格ロード/);
  });

  test("ヘッダータイトルが正しく表示される", async ({ page }) => {
    // ヘッダーのタイトルを確認
    const headerTitle = page.locator("text=宅建合格ロード").first();
    await expect(headerTitle).toBeVisible();
  });

  test("ヒーローセクションが表示される", async ({ page }) => {
    // ヒーローセクションの要素を確認
    const heroTitle = page.locator("text=宅建合格への道のりを始めよう");
    await expect(heroTitle).toBeVisible();

    const heroIcon = page.locator("text=🏠");
    await expect(heroIcon).toBeVisible();

    const heroDescription = page.locator(
      "text=学習で植物を育てながら、楽しく宅建試験に合格しよう"
    );
    await expect(heroDescription).toBeVisible();
  });

  test("機能カードが表示される", async ({ page }) => {
    // 各機能カードの存在を確認
    const features = ["試験特化", "性格診断", "進捗管理", "弱点克服"];

    for (const feature of features) {
      const card = page.locator(`text=${feature}`);
      await expect(card).toBeVisible({ timeout: 10000 });
    }
  });

  test("ログインボタンが機能する", async ({ page }) => {
    // ログインボタンをクリック
    const loginButton = page.locator('button:has-text("ログイン")');
    await expect(loginButton).toBeVisible();
    await loginButton.click();

    // ログインページに遷移することを確認
    await expect(page).toHaveURL(/\/auth\/login/);
  });

  test("新規登録ページへの遷移が機能する", async ({ page }) => {
    // 新規登録ボタンをクリック
    const registerButton = page.locator("text=新規登録して始める");
    await expect(registerButton).toBeVisible({ timeout: 10000 });
    await registerButton.click();

    // 新規登録ページに遷移することを確認
    await expect(page).toHaveURL(/\/auth\/register/);
  });

  test("レスポンシブデザインが機能する（モバイル）", async ({ page }) => {
    // モバイルビューポートに設定
    await page.setViewportSize({ width: 375, height: 667 });

    // ページが正常に表示される
    const headerTitle = page
      .locator("h1")
      .filter({ hasText: "宅建合格ロード" });
    await expect(headerTitle).toBeVisible();

    // ボタンが正常に表示される
    const registerButton = page.locator(
      'button:has-text("新規登録して始める")'
    );
    await expect(registerButton).toBeVisible();
  });

  test("ページの読み込み速度が適切", async ({ page }) => {
    const startTime = Date.now();
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    const loadTime = Date.now() - startTime;

    // 10秒以内に読み込まれることを確認（現実的な値に調整）
    expect(loadTime).toBeLessThan(10000);
  });
});
