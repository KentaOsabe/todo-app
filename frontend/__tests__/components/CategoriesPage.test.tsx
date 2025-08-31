import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { MemoryRouter } from "react-router-dom";
import { CategoriesPage } from "../../src/components/CategoriesPage";
import type { Category } from "../../src/types/category";

// useNavigateをモック
const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// useCategoryManagementをモック
const mockDeleteCategory = vi.fn();
const mockCategories: Category[] = [
  {
    id: "work",
    name: "仕事",
    color: "#1976d2",
    description: "仕事関連のタスク",
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
  },
  {
    id: "private",
    name: "プライベート",
    color: "#ff5722",
    description: "個人的なタスク",
    createdAt: new Date("2024-01-02"),
    updatedAt: new Date("2024-01-02"),
  },
];

vi.mock("../../src/hooks/useCategoryManagement", () => ({
  useCategoryManagement: () => ({
    categories: mockCategories,
    createCategory: vi.fn(),
    updateCategory: vi.fn(),
    deleteCategory: mockDeleteCategory,
  }),
}));

const renderWithRouter = () => {
  return render(
    <MemoryRouter
      future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
    >
      <CategoriesPage />
    </MemoryRouter>,
  );
};

describe("CategoriesPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // window.confirmをモック
    Object.defineProperty(window, "confirm", {
      writable: true,
      value: vi.fn().mockReturnValue(true),
    });
  });

  // 概要: カテゴリ一覧ページの基本表示をテスト
  // 目的: ページタイトルと新規作成ボタンが表示されることを保証（Issue #5要件）
  it("displays page title and new button", () => {
    renderWithRouter();

    expect(screen.getByText("カテゴリ管理")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "新規作成" }),
    ).toBeInTheDocument();
  });

  // 概要: カテゴリ一覧の表示をテスト
  // 目的: 全てのカテゴリが名前と共に表示されることを保証（Issue #5要件）
  it("displays all categories with names", () => {
    renderWithRouter();

    expect(screen.getByText("仕事")).toBeInTheDocument();
    expect(screen.getByText("プライベート")).toBeInTheDocument();
  });

  // 概要: 新規作成ボタンの遷移機能をテスト
  // 目的: 新規作成ボタンクリック時に/categories/newに遷移することを保証（Issue #5要件）
  it("navigates to new category page when new button clicked", () => {
    renderWithRouter();

    const newButton = screen.getByRole("button", { name: "新規作成" });
    fireEvent.click(newButton);

    expect(mockNavigate).toHaveBeenCalledWith("/categories/new");
  });

  // 概要: 編集ボタンの表示と遷移機能をテスト
  // 目的: 各カテゴリに編集ボタンが表示され、クリック時に適切な編集ページに遷移することを保証（Issue #5要件）
  it("displays edit buttons and navigates to edit page", () => {
    renderWithRouter();

    const editButtons = screen.getAllByRole("button", { name: "編集" });
    expect(editButtons).toHaveLength(2); // 2つのカテゴリ分

    fireEvent.click(editButtons[0]);
    expect(mockNavigate).toHaveBeenCalledWith("/categories/work/edit");
  });

  // 概要: 削除ボタンの表示と確認ダイアログをテスト
  // 目的: 各カテゴリに削除ボタンが表示され、クリック時に確認ダイアログが表示されることを保証（Issue #5要件）
  it("displays delete buttons and shows confirmation dialog", () => {
    renderWithRouter();

    const deleteButtons = screen.getAllByRole("button", { name: "削除" });
    expect(deleteButtons).toHaveLength(2); // 2つのカテゴリ分

    fireEvent.click(deleteButtons[0]);
    expect(window.confirm).toHaveBeenCalledWith("このカテゴリを削除しますか？");
  });

  // 概要: 削除機能の実行をテスト
  // 目的: 確認ダイアログでOKが選択された場合、削除処理が実行されることを保証（Issue #5要件）
  it("calls delete function when confirmed", () => {
    renderWithRouter();

    const deleteButtons = screen.getAllByRole("button", { name: "削除" });
    fireEvent.click(deleteButtons[0]);

    expect(mockDeleteCategory).toHaveBeenCalledWith("work");
  });
});
