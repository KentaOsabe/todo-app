import { renderHook, act, waitFor } from "@testing-library/react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { useCategoryManagement } from "../../src/hooks/useCategoryManagement";
import type { CategoryFormData } from "../../src/types/category";

// Category APIをモック
vi.mock("../../src/api/categories", () => ({
  listCategories: vi.fn(),
  createCategory: vi.fn(),
  updateCategory: vi.fn(),
  deleteCategory: vi.fn(),
}));

describe("useCategoryManagement", () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    const cats = await import("../../src/api/categories");
    (
      cats.listCategories as unknown as ReturnType<typeof vi.fn>
    ).mockResolvedValue([
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
    ]);
    (
      cats.createCategory as unknown as ReturnType<typeof vi.fn>
    ).mockImplementation(async ({ name }: { name: string }) => ({
      id: `new-${Date.now()}`,
      name,
      color: "#1976d2",
      createdAt: new Date(),
      updatedAt: new Date(),
    }));
  });

  // 概要: useCategoryManagementフックの初期状態をテスト
  // 目的: カテゴリ一覧が正しく取得できることを保証
  it("初期状態でカテゴリ一覧をAPIから取得して返す", async () => {
    const { result } = renderHook(() => useCategoryManagement());

    await waitFor(() => {
      const names = result.current.categories.map((c) => c.name);
      expect(names).toEqual(expect.arrayContaining(["仕事", "プライベート"]));
      // APIモックが反映されていること（最終件数は2件）
      expect(result.current.categories.length).toBe(2);
    });
  });

  // 概要: createCategory機能をテスト
  // 目的: 新規カテゴリが正しく作成・追加されることを保証
  it("新規カテゴリを作成できる", async () => {
    const { result } = renderHook(() => useCategoryManagement());

    const newCategoryData: CategoryFormData = {
      name: "学習",
      color: "#4caf50",
      description: "学習関連のタスク",
    };

    act(() => {
      result.current.createCategory(newCategoryData);
    });

    await waitFor(() => {
      expect(
        result.current.categories.some((c) => c.name === "学習"),
      ).toBeTruthy();
    });
  });

  // 概要: 新規カテゴリ作成時にUIへ即時反映（楽観的更新）されることをテスト
  // 目的: ユーザーの体感を改善し、API応答待ちの間も結果が見えることを保証
  it("新規カテゴリは楽観的に即時表示される", async () => {
    const { result } = renderHook(() => useCategoryManagement());

    const optimisticData: CategoryFormData = {
      name: "楽観カテゴリ",
      color: "#123456",
      description: "optimistic",
    };

    act(() => {
      result.current.createCategory(optimisticData);
    });

    // API応答前でも即時に反映されること
    const namesNow = result.current.categories.map((c) => c.name);
    expect(namesNow).toEqual(expect.arrayContaining(["楽観カテゴリ"]));
  });

  // 概要: 作成APIが失敗した場合、楽観的に追加されたカテゴリがロールバックされることをテスト
  // 目的: エラーパスでUI不整合が残らないことを保証
  it("作成失敗時は楽観的追加がロールバックされる", async () => {
    const cats = await import("../../src/api/categories");
    (
      cats.createCategory as unknown as ReturnType<typeof vi.fn>
    ).mockRejectedValueOnce(new Error("fail"));

    const { result } = renderHook(() => useCategoryManagement());

    const data: CategoryFormData = {
      name: "一時カテゴリ",
      color: "#abcdef",
      description: "temp",
    };

    act(() => {
      result.current.createCategory(data);
    });

    // 直後は追加されている
    expect(
      result.current.categories.some((c) => c.name === "一時カテゴリ"),
    ).toBe(true);

    // 失敗後にロールバックされる
    await waitFor(() => {
      expect(
        result.current.categories.some((c) => c.name === "一時カテゴリ"),
      ).toBe(false);
    });
  });

  // 概要: カテゴリ名の重複チェック機能をテスト
  // 目的: 同名カテゴリの作成を防止することを保証
  it("同名のカテゴリ作成時は重複チェックする", async () => {
    const { result } = renderHook(() => useCategoryManagement());

    const duplicateData: CategoryFormData = {
      name: "仕事", // 既に存在する名前
      color: "#000000",
    };

    act(() => {
      result.current.createCategory(duplicateData);
    });

    await waitFor(() => {
      const dupes = result.current.categories.filter((c) => c.name === "仕事");
      expect(dupes.length).toBe(1);
    });
  });

  // 概要: updateCategory機能をテスト
  // 目的: 既存カテゴリの情報が正しく更新されることを保証
  it("カテゴリを更新できる", async () => {
    const { result } = renderHook(() => useCategoryManagement());

    const updateData: CategoryFormData = {
      name: "仕事（重要）",
      color: "#e91e63",
      description: "重要な仕事のタスク",
    };

    act(() => {
      result.current.updateCategory("work", updateData);
    });

    await waitFor(() => {
      const updated = result.current.categories.find((c) => c.id === "work");
      expect(updated?.name).toBe("仕事（重要）");
      expect(updated?.color).toBe("#e91e63");
    });
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
    // 楽観的更新抑止のため、削除されていないことを確認
    expect(result.current.categories.some((c) => c.id === "work")).toBe(true);
  });

  // 概要: 未使用カテゴリの削除機能をテスト
  // 目的: 未使用カテゴリが正しく削除されることを保証
  it("未使用のカテゴリは削除できる", async () => {
    const { result } = renderHook(() => useCategoryManagement());

    const deleteResult = result.current.deleteCategory("private");

    expect(deleteResult).toBe(true);
    await waitFor(() => {
      expect(result.current.categories.some((c) => c.id === "private")).toBe(
        false,
      );
    });
  });

  // 概要: 存在しないカテゴリの削除処理をテスト
  // 目的: 存在しないカテゴリID指定時の適切な処理を保証
  it("存在しないカテゴリの削除時はfalseを返す", () => {
    const { result } = renderHook(() => useCategoryManagement());

    const deleteResult = result.current.deleteCategory("nonexistent");

    expect(deleteResult).toBe(false);
    expect(result.current.categories.length).toBeGreaterThan(0);
  });
});
