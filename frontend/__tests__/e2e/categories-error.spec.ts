import { expect, test } from "@playwright/test";
import { setupApiMock } from "./utils/mockApi";

test.describe("Categories Error Handling", () => {
  test.beforeEach(async ({ page }) => {
    await setupApiMock(page);
  });

  // 概要: カテゴリ削除失敗時にUIがロールバックされることをテスト
  // 目的: 削除API失敗時にカテゴリ一覧が復元され、エラーメッセージが表示されることを保証
  test("should restore category and show error snackbar when delete fails", async ({
    page,
  }) => {
    await page.route("**/api/categories/private", async (route) => {
      if (route.request().method() === "DELETE") {
        await route.fulfill({
          status: 500,
          contentType: "application/json",
          body: JSON.stringify({ error: "server" }),
        });
        return;
      }
      await route.fallback();
    });

    page.on("dialog", async (dialog) => {
      await dialog.accept();
    });

    await page.goto("/categories");

    const privateRow = page
      .locator("li")
      .filter({ hasText: "プライベート" })
      .first();
    await expect(privateRow).toBeVisible();

    const deleteButton = privateRow.getByRole("button", { name: "削除" });
    await deleteButton.click();

    const errorMessage = "カテゴリの削除に失敗しました。再試行してください。";
    const snackbarAlert = page
      .locator('.MuiSnackbar-root [role="alert"]')
      .filter({ hasText: errorMessage })
      .first();

    await expect(snackbarAlert).toBeVisible();
    await expect(page.getByTestId("categories-error")).toContainText(
      errorMessage,
    );
    await expect(privateRow).toBeVisible();
  });
});
