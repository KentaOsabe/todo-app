import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { MemoryRouter } from "react-router-dom";
import { CategoriesPage } from "../../src/components/CategoriesPage";

// 概要: CategoriesPageのUI/UX（ローディング/エラー/オフライン表示）をテスト
// 目的: Issue #25 のUI/UX改善要件（スピナー、エラーメッセージ、オフライン警告）を保証

const renderWithRouter = () =>
  render(
    <MemoryRouter
      future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
    >
      <CategoriesPage />
    </MemoryRouter>,
  );

// useCategoryManagementをモック
vi.mock("../../src/hooks/useCategoryManagement", () => ({
  useCategoryManagement: vi.fn(),
}));

describe("CategoriesPage UI/UX", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // 概要: ローディング中にスピナーが表示されることをテスト
  // 目的: データ取得中のユーザー向けフィードバックを保証
  it("shows loading spinner when loading is true", async () => {
    const { useCategoryManagement } = vi.mocked(
      await import("../../src/hooks/useCategoryManagement"),
    );
    useCategoryManagement.mockReturnValue({
      categories: [],
      createCategory: vi.fn(),
      updateCategory: vi.fn(),
      deleteCategory: vi.fn().mockResolvedValue({ status: "success" }),
      isCategoryInUse: vi.fn().mockResolvedValue(false),
      loading: true,
      error: null,
      offline: false,
    });

    renderWithRouter();

    expect(screen.getByRole("progressbar")).toBeInTheDocument();
  });

  // 概要: エラー発生時にエラーメッセージが表示されることをテスト
  // 目的: API失敗時のユーザーへの分かりやすい通知を保証
  it("shows error alert when error is set", async () => {
    const { useCategoryManagement } = vi.mocked(
      await import("../../src/hooks/useCategoryManagement"),
    );
    useCategoryManagement.mockReturnValue({
      categories: [],
      createCategory: vi.fn(),
      updateCategory: vi.fn(),
      deleteCategory: vi.fn().mockResolvedValue({ status: "success" }),
      isCategoryInUse: vi.fn().mockResolvedValue(false),
      error: "カテゴリの取得に失敗しました",
      loading: false,
      offline: false,
    });

    renderWithRouter();

    expect(
      screen.getByText("カテゴリの取得に失敗しました"),
    ).toBeInTheDocument();
  });

  // 概要: オフライン時に警告が表示されることをテスト
  // 目的: ネットワーク切断状態の明示的な可視化を保証
  it("shows offline warning when offline flag is true", async () => {
    const { useCategoryManagement } = vi.mocked(
      await import("../../src/hooks/useCategoryManagement"),
    );
    useCategoryManagement.mockReturnValue({
      categories: [],
      createCategory: vi.fn(),
      updateCategory: vi.fn(),
      deleteCategory: vi.fn().mockResolvedValue({ status: "success" }),
      isCategoryInUse: vi.fn().mockResolvedValue(false),
      offline: true,
      loading: false,
      error: null,
    });

    renderWithRouter();

    expect(screen.getByText(/オフライン/)).toBeInTheDocument();
  });
});
