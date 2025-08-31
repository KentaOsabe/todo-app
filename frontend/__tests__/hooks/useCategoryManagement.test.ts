import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { useCategoryManagement } from "../../src/hooks/useCategoryManagement";
import type { CategoryFormData } from "../../src/types/category";

// useLocalStorageをモック
vi.mock("../../src/hooks/useLocalStorage", () => ({
  useLocalStorage: vi.fn(),
}));

describe("useCategoryManagement", () => {
  const mockSetCategories = vi.fn();

  beforeEach(async () => {
    vi.clearAllMocks();
    const mockUseLocalStorage = vi.mocked(
      await import("../../src/hooks/useLocalStorage"),
    ).useLocalStorage;
    mockUseLocalStorage.mockReturnValue([
      [
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
      ],
      mockSetCategories,
    ]);
  });

  // 概要: useCategoryManagementフックの初期状態をテスト
  // 目的: カテゴリ一覧が正しく取得できることを保証
  it("初期状態でカテゴリ一覧を返す", () => {
    const { result } = renderHook(() => useCategoryManagement());

    expect(result.current.categories).toHaveLength(2);
    expect(result.current.categories[0].name).toBe("仕事");
    expect(result.current.categories[1].name).toBe("プライベート");
  });

  // 概要: createCategory機能をテスト
  // 目的: 新規カテゴリが正しく作成・追加されることを保証
  it("新規カテゴリを作成できる", () => {
    const { result } = renderHook(() => useCategoryManagement());

    const newCategoryData: CategoryFormData = {
      name: "学習",
      color: "#4caf50",
      description: "学習関連のタスク",
    };

    act(() => {
      result.current.createCategory(newCategoryData);
    });

    expect(mockSetCategories).toHaveBeenCalledWith(expect.any(Function));
  });

  // 概要: カテゴリ名の重複チェック機能をテスト
  // 目的: 同名カテゴリの作成を防止することを保証
  it("同名のカテゴリ作成時は重複チェックする", () => {
    const { result } = renderHook(() => useCategoryManagement());

    const duplicateData: CategoryFormData = {
      name: "仕事", // 既に存在する名前
      color: "#000000",
    };

    act(() => {
      result.current.createCategory(duplicateData);
    });

    // 重複する場合は何も追加されない
    expect(mockSetCategories).not.toHaveBeenCalled();
  });

  // 概要: updateCategory機能をテスト
  // 目的: 既存カテゴリの情報が正しく更新されることを保証
  it("カテゴリを更新できる", () => {
    const { result } = renderHook(() => useCategoryManagement());

    const updateData: CategoryFormData = {
      name: "仕事（重要）",
      color: "#e91e63",
      description: "重要な仕事のタスク",
    };

    act(() => {
      result.current.updateCategory("work", updateData);
    });

    expect(mockSetCategories).toHaveBeenCalledWith(expect.any(Function));
  });

  // 概要: isCategoryInUse機能をテスト
  // 目的: カテゴリがTodoで使用されているかを正確に判定することを保証
  it("使用中のカテゴリを正しく検出する", () => {
    const { result } = renderHook(() => useCategoryManagement());

    expect(result.current.isCategoryInUse("work")).toBe(true);
    expect(result.current.isCategoryInUse("private")).toBe(false);
    expect(result.current.isCategoryInUse("nonexistent")).toBe(false);
  });

  // 概要: 使用中カテゴリの削除制限をテスト
  // 目的: 使用中カテゴリの削除を防止することを保証
  it("使用中のカテゴリ削除時はfalseを返す", () => {
    const { result } = renderHook(() => useCategoryManagement());

    const deleteResult = result.current.deleteCategory("work");

    expect(deleteResult).toBe(false);
    expect(mockSetCategories).not.toHaveBeenCalled();
  });

  // 概要: 未使用カテゴリの削除機能をテスト
  // 目的: 未使用カテゴリが正しく削除されることを保証
  it("未使用のカテゴリは削除できる", () => {
    const { result } = renderHook(() => useCategoryManagement());

    const deleteResult = result.current.deleteCategory("private");

    expect(deleteResult).toBe(true);
    expect(mockSetCategories).toHaveBeenCalledWith(expect.any(Function));
  });

  // 概要: 存在しないカテゴリの削除処理をテスト
  // 目的: 存在しないカテゴリID指定時の適切な処理を保証
  it("存在しないカテゴリの削除時はfalseを返す", () => {
    const { result } = renderHook(() => useCategoryManagement());

    const deleteResult = result.current.deleteCategory("nonexistent");

    expect(deleteResult).toBe(false);
    expect(mockSetCategories).not.toHaveBeenCalled();
  });
});
