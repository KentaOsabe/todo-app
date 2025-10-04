import { renderHook, act, waitFor } from "@testing-library/react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { useCategoryManagement } from "../../src/hooks/useCategoryManagement";
import type {
  CategoryFormData,
  DeleteCategoryResult,
} from "../../src/types/category";

// Category APIをモック
vi.mock("../../src/api/categories", () => ({
  listCategories: vi.fn(),
  createCategory: vi.fn(),
  updateCategory: vi.fn(),
  deleteCategory: vi.fn(),
  getCategoryUsage: vi.fn(),
}));

describe("useCategoryManagement", () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    const cats = await import("../../src/api/categories");
    const mocked = cats as unknown as {
      listCategories: ReturnType<typeof vi.fn>;
      createCategory: ReturnType<typeof vi.fn>;
      updateCategory: ReturnType<typeof vi.fn>;
      deleteCategory: ReturnType<typeof vi.fn>;
      getCategoryUsage: ReturnType<typeof vi.fn>;
    };

    mocked.listCategories.mockResolvedValue([
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
    mocked.createCategory.mockImplementation(
      async ({ name }: { name: string }) => ({
        id: `new-${Date.now()}`,
        name,
        color: "#1976d2",
        createdAt: new Date(),
        updatedAt: new Date(),
      }),
    );
    mocked.updateCategory.mockImplementation(
      async (_id: string, { name }: { name: string }) => ({
        id: _id,
        name,
        color: "#1976d2",
        createdAt: new Date(),
        updatedAt: new Date(),
      }),
    );
    mocked.deleteCategory.mockResolvedValue(undefined);
    mocked.getCategoryUsage.mockResolvedValue({
      inUse: false,
      counts: { todos: 0 },
    });
  });

  // 概要: useCategoryManagementフックの初期状態をテスト
  // 目的: カテゴリ一覧が正しく取得できることを保証
  it("初期状態でカテゴリ一覧をAPIから取得して返す", async () => {
    const { result } = renderHook(() => useCategoryManagement());

    await waitFor(() => {
      const names = result.current.categories.map((c) => c.name);
      expect(names).toEqual(expect.arrayContaining(["仕事", "プライベート"]));
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

    const namesNow = result.current.categories.map((c) => c.name);
    expect(namesNow).toEqual(expect.arrayContaining(["楽観カテゴリ"]));
  });

  // 概要: 作成APIが失敗した場合、楽観的に追加されたカテゴリがロールバックされることをテスト
  // 目的: エラーパスでUI不整合が残らないことを保証
  it("作成失敗時は楽観的追加がロールバックされる", async () => {
    const cats = await import("../../src/api/categories");
    const mocked = cats as unknown as {
      createCategory: ReturnType<typeof vi.fn>;
    };
    mocked.createCategory.mockRejectedValueOnce(new Error("fail"));

    const { result } = renderHook(() => useCategoryManagement());

    const data: CategoryFormData = {
      name: "一時カテゴリ",
      color: "#abcdef",
      description: "temp",
    };

    act(() => {
      result.current.createCategory(data);
    });

    expect(
      result.current.categories.some((c) => c.name === "一時カテゴリ"),
    ).toBe(true);

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
      name: "仕事",
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

  // 概要: 使用状況APIを通じてカテゴリ使用中か判定できることをテスト
  // 目的: inUse が true の場合に正しく検出できることを保証
  it("使用中のカテゴリを正しく検出する", async () => {
    const cats = await import("../../src/api/categories");
    const mocked = cats as unknown as {
      getCategoryUsage: ReturnType<typeof vi.fn>;
    };
    mocked.getCategoryUsage.mockImplementation(async (id: string) => ({
      inUse: id === "work",
      counts: { todos: id === "work" ? 2 : 0 },
    }));

    const { result } = renderHook(() => useCategoryManagement());

    let workInUse = false;
    let privateInUse = true;
    await act(async () => {
      workInUse = await result.current.isCategoryInUse("work");
      privateInUse = await result.current.isCategoryInUse("private");
    });

    expect(workInUse).toBe(true);
    expect(privateInUse).toBe(false);
  });

  // 概要: 使用状況APIの失敗時の挙動をテスト
  // 目的: エラー発生時にエラーメッセージを設定し、falseを返すことを保証
  it("使用状況APIが失敗した場合はerrorを設定しfalseを返す", async () => {
    const cats = await import("../../src/api/categories");
    const mocked = cats as unknown as {
      getCategoryUsage: ReturnType<typeof vi.fn>;
    };
    mocked.getCategoryUsage.mockRejectedValueOnce(new Error("network"));

    const { result } = renderHook(() => useCategoryManagement());

    let inUseResult = true;
    await act(async () => {
      inUseResult = await result.current.isCategoryInUse("work");
    });

    expect(inUseResult).toBe(false);

    await waitFor(() => {
      expect(result.current.error).toBe(
        "カテゴリの使用状況の取得に失敗しました",
      );
    });
  });

  // 概要: 使用状況APIが失敗した場合の削除挙動をテスト
  // 目的: usageエラー時に削除APIを呼ばず、usageCheckFailedを返すことを保証
  it("使用状況API失敗時の削除はusageCheckFailedを返す", async () => {
    const cats = await import("../../src/api/categories");
    const mocked = cats as unknown as {
      getCategoryUsage: ReturnType<typeof vi.fn>;
      deleteCategory: ReturnType<typeof vi.fn>;
    };
    mocked.getCategoryUsage.mockRejectedValueOnce(new Error("network"));

    const { result } = renderHook(() => useCategoryManagement());

    let deleteResult: DeleteCategoryResult | null = null;
    await act(async () => {
      deleteResult = await result.current.deleteCategory("private");
    });

    expect(deleteResult).not.toBeNull();
    const resultValue = deleteResult as DeleteCategoryResult;
    expect(resultValue).toEqual({ status: "usageCheckFailed" });
    expect(mocked.deleteCategory).not.toHaveBeenCalled();
    expect(result.current.categories.some((c) => c.id === "private")).toBe(
      true,
    );
    await waitFor(() => {
      expect(result.current.error).toBe(
        "カテゴリの使用状況の取得に失敗しました",
      );
    });
  });

  // 概要: 使用中カテゴリの削除制限をテスト
  // 目的: 使用中カテゴリの削除を防止し、API削除を呼ばないことを保証
  it("使用中のカテゴリ削除時はfalseを返し削除APIを呼ばない", async () => {
    const cats = await import("../../src/api/categories");
    const mocked = cats as unknown as {
      getCategoryUsage: ReturnType<typeof vi.fn>;
      deleteCategory: ReturnType<typeof vi.fn>;
    };
    mocked.getCategoryUsage.mockResolvedValue({
      inUse: true,
      counts: { todos: 1 },
    });

    const { result } = renderHook(() => useCategoryManagement());

    let deleteResult: DeleteCategoryResult | null = null;
    await act(async () => {
      deleteResult = await result.current.deleteCategory("work");
    });

    expect(deleteResult).not.toBeNull();
    const resultValue = deleteResult as DeleteCategoryResult;
    expect(resultValue).toEqual({ status: "inUse" });
    expect(result.current.categories.some((c) => c.id === "work")).toBe(true);
    expect(mocked.deleteCategory).not.toHaveBeenCalled();
    expect(result.current.error).toBeNull();
  });

  // 概要: 未使用カテゴリの削除機能をテスト
  // 目的: 未使用カテゴリが削除でき、API削除が呼ばれることを保証
  it("未使用のカテゴリは削除できる", async () => {
    const cats = await import("../../src/api/categories");
    const mocked = cats as unknown as {
      deleteCategory: ReturnType<typeof vi.fn>;
    };
    mocked.deleteCategory.mockResolvedValue(undefined);

    const { result } = renderHook(() => useCategoryManagement());

    let deleteResult: DeleteCategoryResult | null = null;
    await act(async () => {
      deleteResult = await result.current.deleteCategory("private");
    });

    expect(deleteResult).not.toBeNull();
    const resultValue = deleteResult as DeleteCategoryResult;
    expect(resultValue).toEqual({ status: "success" });
    await waitFor(() => {
      expect(result.current.categories.some((c) => c.id === "private")).toBe(
        false,
      );
    });
    expect(mocked.deleteCategory).toHaveBeenCalledWith("private");
  });

  // 概要: 削除API失敗時の挙動をテスト
  // 目的: APIエラーで削除に失敗した場合にエラーメッセージを設定し、カテゴリが残ることを保証
  it("削除APIが失敗した場合はエラーメッセージを設定しfalseを返す", async () => {
    const cats = await import("../../src/api/categories");
    const mocked = cats as unknown as {
      deleteCategory: ReturnType<typeof vi.fn>;
    };
    mocked.deleteCategory.mockRejectedValueOnce(new Error("server"));

    const { result } = renderHook(() => useCategoryManagement());

    let deleteResult: DeleteCategoryResult | null = null;
    await act(async () => {
      deleteResult = await result.current.deleteCategory("private");
    });

    expect(deleteResult).not.toBeNull();
    const resultValue = deleteResult as DeleteCategoryResult;
    expect(resultValue).toEqual({
      status: "error",
      message: "カテゴリの削除に失敗しました。再試行してください。",
    });
    expect(result.current.categories.some((c) => c.id === "private")).toBe(
      true,
    );
    await waitFor(() => {
      expect(result.current.error).toBe(
        "カテゴリの削除に失敗しました。再試行してください。",
      );
    });
  });

  // 概要: 存在しないカテゴリの削除処理をテスト
  // 目的: 存在しないカテゴリID指定時にfalseを返すことを保証
  it("存在しないカテゴリの削除時はfalseを返す", async () => {
    const { result } = renderHook(() => useCategoryManagement());

    let deleteResult: DeleteCategoryResult | null = null;
    await act(async () => {
      deleteResult = await result.current.deleteCategory("nonexistent");
    });

    const resultValue = deleteResult as DeleteCategoryResult;
    expect(resultValue).toEqual({ status: "notFound" });
    expect(result.current.categories.length).toBeGreaterThan(0);
  });

  // 概要: オフラインイベントがリスナー登録前に発火した場合でも検知できることをテスト
  // 目的: イベント取りこぼし時でもnavigator.onLineの状態から警告表示が行われることを保証
  it("オフラインイベントを取りこぼしてもnavigator状態からオフライン判定できる", async () => {
    const originalDescriptor = Object.getOwnPropertyDescriptor(
      window.navigator,
      "onLine",
    );

    const setNavigatorOnline = (value: boolean) => {
      Object.defineProperty(window.navigator, "onLine", {
        configurable: true,
        get: () => value,
      });
    };

    setNavigatorOnline(true);

    const { result } = renderHook(() => useCategoryManagement());

    setNavigatorOnline(false);

    await waitFor(() => {
      expect(result.current.offline).toBe(true);
    });

    if (originalDescriptor) {
      Object.defineProperty(window.navigator, "onLine", originalDescriptor);
    } else {
      setNavigatorOnline(true);
    }
  });
});
