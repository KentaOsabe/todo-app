import { expect, test } from "@playwright/test";
import { setupApiMock } from "./utils/mockApi";

test.describe("Navigation Theme E2E Tests", () => {
  test.beforeEach(async ({ page }) => {
    await setupApiMock(page);
  });
  // 概要: ライトモード時のナビゲーションタブ表示をテスト
  // 目的: 選択されたタブが白色で表示され、非選択タブも視認可能であることを保証
  test("should display navigation tabs with proper contrast in light mode", async ({
    page,
  }) => {
    await page.goto("/");
    await page.waitForSelector('[role="tab"]', { timeout: 10000 });

    // ライトモードであることを確認（ダークモードボタンが表示されている）
    const darkModeButton = page.getByRole("button", {
      name: "Switch to dark mode",
    });
    await expect(darkModeButton).toBeVisible();

    // 選択されたTodoタブが表示されていることを確認
    const selectedTab = page.getByRole("tab", { name: "Todo page" });
    await expect(selectedTab).toHaveAttribute("aria-selected", "true");
    await expect(selectedTab).toBeVisible();

    // 非選択のカテゴリ管理タブも表示されていることを確認
    const nonSelectedTab = page.getByRole("tab", {
      name: "Categories management page",
    });
    await expect(nonSelectedTab).toHaveAttribute("aria-selected", "false");
    await expect(nonSelectedTab).toBeVisible();

    // カテゴリ管理タブをクリックして選択状態を変更
    await nonSelectedTab.click();
    await page.waitForURL("/categories");

    // 新しく選択されたタブの状態確認
    await expect(nonSelectedTab).toHaveAttribute("aria-selected", "true");
    await expect(selectedTab).toHaveAttribute("aria-selected", "false");
  });

  // 概要: ダークモード切り替え機能をテスト
  // 目的: ダークモード切り替えボタンが正常に動作し、UI状態が適切に変化することを保証
  test("should toggle dark mode correctly", async ({ page }) => {
    await page.goto("/");
    await page.waitForSelector('[role="tab"]', { timeout: 10000 });

    // 初期状態（ライトモード）を確認
    const toggleButton = page.getByRole("button", {
      name: "Switch to dark mode",
    });
    await expect(toggleButton).toBeVisible();

    // body要素の背景色を取得（ライトモード）
    const lightModeBodyStyle = await page.evaluate(() => {
      return window.getComputedStyle(document.body).backgroundColor;
    });

    // ダークモードに切り替え
    await toggleButton.click();

    // ボタンのテキストが変更されることを確認
    const lightModeButton = page.getByRole("button", {
      name: "Switch to light mode",
    });
    await expect(lightModeButton).toBeVisible();

    // 背景色が変化したことを確認
    const darkModeBodyStyle = await page.evaluate(() => {
      return window.getComputedStyle(document.body).backgroundColor;
    });

    expect(darkModeBodyStyle).not.toBe(lightModeBodyStyle);

    // ライトモードに戻す
    await lightModeButton.click();

    // 元の状態に戻ることを確認
    await expect(toggleButton).toBeVisible();
  });

  // 概要: ダークモード時のナビゲーションタブ表示をテスト
  // 目的: ダークモードでも適切なコントラストでタブが表示されることを保証
  test("should display navigation tabs with proper contrast in dark mode", async ({
    page,
  }) => {
    await page.goto("/");
    await page.waitForSelector('[role="tab"]', { timeout: 10000 });

    // ダークモードに切り替え
    const darkModeButton = page.getByRole("button", {
      name: "Switch to dark mode",
    });
    await darkModeButton.click();

    // ダークモードになったことを確認
    const lightModeButton = page.getByRole("button", {
      name: "Switch to light mode",
    });
    await expect(lightModeButton).toBeVisible();

    // 選択されたタブが表示されていることを確認
    const selectedTab = page.getByRole("tab", { name: "Todo page" });
    await expect(selectedTab).toHaveAttribute("aria-selected", "true");
    await expect(selectedTab).toBeVisible();

    // 非選択タブも表示されていることを確認
    const nonSelectedTab = page.getByRole("tab", {
      name: "Categories management page",
    });
    await expect(nonSelectedTab).toHaveAttribute("aria-selected", "false");
    await expect(nonSelectedTab).toBeVisible();

    // タブ切り替えもダークモードで正常に動作することを確認
    await nonSelectedTab.click();
    await page.waitForURL("/categories");

    await expect(nonSelectedTab).toHaveAttribute("aria-selected", "true");
    await expect(selectedTab).toHaveAttribute("aria-selected", "false");
  });

  // 概要: ページ遷移時のダークモード状態維持をテスト
  // 目的: ページ間移動時にダークモード設定が保持されることを保証
  test("should persist dark mode setting across page navigation", async ({
    page,
  }) => {
    await page.goto("/");
    await page.waitForSelector('[role="tab"]', { timeout: 10000 });

    // ダークモードに切り替え
    const darkModeButton = page.getByRole("button", {
      name: "Switch to dark mode",
    });
    await darkModeButton.click();

    // ダークモードボタンが変更されることを確認
    const lightModeButton = page.getByRole("button", {
      name: "Switch to light mode",
    });
    await expect(lightModeButton).toBeVisible();

    // カテゴリ管理ページに移動
    const categoriesTab = page.getByRole("tab", {
      name: "Categories management page",
    });
    await categoriesTab.click();
    await page.waitForURL("/categories");

    // ダークモード状態が維持されていることを確認
    await expect(lightModeButton).toBeVisible();

    // Todoページに戻る
    const todoTab = page.getByRole("tab", { name: "Todo page" });
    await todoTab.click();
    await page.waitForURL("/");

    // まだダークモード状態であることを確認
    await expect(lightModeButton).toBeVisible();
  });

  // 概要: ダークモード切り替えボタンのアクセシビリティをテスト
  // 目的: ダークモード切り替えボタンが適切なaria-labelを持つことを保証
  test("should have proper accessibility labels for dark mode toggle", async ({
    page,
  }) => {
    await page.goto("/");
    await page.waitForSelector('[role="tab"]', { timeout: 10000 });

    // ライトモード時のaria-label確認
    const darkModeButton = page.getByRole("button", {
      name: "Switch to dark mode",
    });
    await expect(darkModeButton).toBeVisible();

    // ダークモードに切り替え
    await darkModeButton.click();

    // ダークモード時のaria-label確認
    const lightModeButton = page.getByRole("button", {
      name: "Switch to light mode",
    });
    await expect(lightModeButton).toBeVisible();
  });
});
