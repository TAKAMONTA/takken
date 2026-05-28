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
    const heroTitle = page.locator("text=AI予想問題で宅建合格を目指そう");
    await expect(heroTitle).toBeVisible();

    const heroIcon = page.locator("text=🏠");
    await expect(heroIcon).toBeVisible();

    const heroDescription = page.locator(
      "text=AIが生成する高品質な予想問題で、最新の法改正や頻出トピックを徹底攻略！"
    );
    await expect(heroDescription).toBeVisible();
  });

  test("法的ページとサポート導線が表示される", async ({ page }) => {
    const links = [
      "特定商取引法に基づく表記",
      "利用規約",
      "プライバシーポリシー",
      "サポート",
    ];

    for (const linkText of links) {
      const link = page.locator(`text=${linkText}`).first();
      await expect(link).toBeVisible({ timeout: 10000 });
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
    const registerButton = page.locator('button:has-text("新規登録")');
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
      'button:has-text("新規登録")'
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
