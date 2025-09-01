import { expect, test } from "@playwright/test";
import { setupApiMock } from "./utils/mockApi";

test.describe("Layout Consistency E2E Tests", () => {
  test.beforeEach(async ({ page }) => {
    await setupApiMock(page);
  });
  // 概要: ナビゲーション間でのレイアウト幅の一貫性をテスト
  // 目的: TodoページとCategoriesページ間でコンテンツ幅が一貫していることを保証
  test("should maintain consistent layout width across navigation", async ({
    page,
  }) => {
    await page.goto("/");
    await page.waitForSelector(".MuiContainer-root", { timeout: 10000 });

    // TodoページのContainer要素の幅を取得
    const todoContainer = page.locator(".MuiContainer-root").first();
    const todoContainerBox = await todoContainer.boundingBox();
    expect(todoContainerBox).not.toBeNull();

    // カテゴリ管理ページに移動
    await page.click('[role="tab"]:has-text("カテゴリ管理")');
    await page.waitForURL("/categories");
    await page.waitForSelector(".MuiContainer-root", { timeout: 10000 });

    // Categoriesページのコンテナ幅を確認
    const categoriesContainer = page.locator(".MuiContainer-root").first();
    const categoriesContainerBox = await categoriesContainer.boundingBox();
    expect(categoriesContainerBox).not.toBeNull();

    // 幅が一致していることを確認
    expect(categoriesContainerBox!.width).toBe(todoContainerBox!.width);
  });

  // 概要: ナビゲーションバーの一貫性をテスト
  // 目的: Navigation barが全ページで統一されていることを保証
  test("should maintain navigation bar consistency across pages", async ({
    page,
  }) => {
    const pages = ["/", "/categories"];

    const navBarWidths: number[] = [];

    for (const path of pages) {
      await page.goto(path);
      await page.waitForSelector(".MuiTabs-root", { timeout: 10000 });

      // Navigation barの幅を測定
      const navBar = page.locator(".MuiTabs-root").first();
      const navBox = await navBar.boundingBox();
      expect(navBox).not.toBeNull();

      navBarWidths.push(navBox!.width);
    }

    // 全ページでナビゲーション幅がほぼ同じであることを確認（1px程度の差は許容）
    const firstWidth = navBarWidths[0];
    expect(
      navBarWidths.every((width) => Math.abs(width - firstWidth) <= 1),
    ).toBe(true);
  });
});
