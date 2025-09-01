import { test, expect } from "@playwright/test";

// 概要: UI/UX改善（ローディング・エラー・オフライン）をE2Eで確認
// 目的: 実ブラウザ環境でユーザー体験が満たされていることを保証

// 概要: Todoトップでオフライン時に警告が表示される
// 目的: オンライン→オフラインの遷移で警告が出ることを保証
test("todo page shows offline warning when going offline", async ({ page }) => {
  await page.goto("/");

  await page.context().setOffline(true);
  await page.evaluate(() => window.dispatchEvent(new Event("offline")));

  await expect(page.getByText(/オフライン/)).toBeVisible();

  await page.context().setOffline(false);
  await page.evaluate(() => window.dispatchEvent(new Event("online")));
});

// 概要: カテゴリ一覧ページでオフライン時に警告が表示される
// 目的: 画面遷移後のオフライン検知も機能することを保証
test("categories page shows offline warning when going offline", async ({
  page,
}) => {
  await page.goto("/categories");

  await page.context().setOffline(true);
  await page.evaluate(() => window.dispatchEvent(new Event("offline")));

  await expect(page.getByTestId("categories-offline")).toBeVisible();

  await page.context().setOffline(false);
  await page.evaluate(() => window.dispatchEvent(new Event("online")));
});

// 概要: カテゴリ一覧の取得が失敗した場合、エラーメッセージが表示される
// 目的: APIエラー時にユーザーへ適切に通知されることを保証
test("categories page shows error alert when API fails", async ({
  page,
  context,
}) => {
  // 絶対URLパターンで事前にルート登録（ナビゲーション前）
  await context.route(
    /https?:\/\/localhost:3001\/api\/categories(\?.*)?$/,
    async (route) => {
      await route.fulfill({
        status: 500,
        contentType: "application/json",
        body: JSON.stringify({ errors: [{ message: "backend error" }] }),
      });
    },
  );

  await page.goto("/categories");
  await expect(page.getByTestId("categories-error")).toBeVisible({
    timeout: 10000,
  });
});

// 概要: カテゴリ一覧取得中はローディングスピナーが表示される
// 目的: データ取得中のフィードバックを保証
test("categories page shows loading spinner while fetching", async ({
  page,
  context,
}) => {
  // 絶対URLパターンで事前にルート登録（ナビゲーション前）
  await context.route(
    /https?:\/\/localhost:3001\/api\/categories(\?.*)?$/,
    async (route) => {
      // 人工遅延でloadingを可視化
      await new Promise((r) => setTimeout(r, 700));
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ data: [] }),
      });
    },
  );

  await page.goto("/categories");
  // API応答遅延中にローディングが表示される
  await expect(page.getByTestId("categories-loading")).toBeVisible({
    timeout: 10000,
  });
  // 念のためローディング解除まで待機
  await expect(page.getByTestId("categories-loading")).toBeHidden({
    timeout: 10000,
  });
});
