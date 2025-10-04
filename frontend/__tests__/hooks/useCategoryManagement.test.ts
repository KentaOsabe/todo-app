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
      expect(result.current.error).toBe(
        "カテゴリの作成に失敗しました。再試行してください。",
      );
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

  // 概要: 更新API失敗時にロールバックされることをテスト
  // 目的: 更新失敗時にカテゴリ情報が巻き戻り、エラーが通知されることを保証
  it("更新失敗時は変更前のカテゴリ情報へロールバックしerrorを設定する", async () => {
    const cats = await import("../../src/api/categories");
    const mocked = cats as unknown as {
      updateCategory: ReturnType<typeof vi.fn>;
    };
    mocked.updateCategory.mockRejectedValueOnce(new Error("server"));

    const { result } = renderHook(() => useCategoryManagement());

    const original = result.current.categories.find((c) => c.id === "work");
    expect(original).toBeDefined();

    const updateData: CategoryFormData = {
      name: "更新失敗カテゴリ",
      color: "#000000",
      description: "rollback",
    };

    act(() => {
      result.current.updateCategory("work", updateData);
    });

    await waitFor(() => {
      const target = result.current.categories.find((c) => c.id === "work");
      expect(target?.name).toBe(original?.name);
      expect(target?.color).toBe(original?.color);
      expect(target?.description).toBe(original?.description);
      expect(result.current.error).toBe(
        "カテゴリの更新に失敗しました。再試行してください。",
      );
    });
  });

  // 概要: 複数の更新が並行した場合に最新更新結果を維持することをテスト
  // 目的: 古いリクエストの失敗で最新の成功結果がロールバックされないことを保証
  it("前回更新の失敗で最新の成功結果を巻き戻さない", async () => {
    const cats = await import("../../src/api/categories");
    const mocked = cats as unknown as {
      updateCategory: ReturnType<typeof vi.fn>;
    };

    let rejectFirst: ((reason?: unknown) => void) | undefined;
    mocked.updateCategory
      .mockImplementationOnce(
        () =>
          new Promise<never>((_resolve, reject) => {
            rejectFirst = reject;
          }),
      )
      .mockImplementationOnce(
        async (_id: string, { name }: { name: string }) => ({
          id: _id,
          name,
          color: "#1976d2",
          createdAt: new Date(),
          updatedAt: new Date(),
        }),
      );

    const { result } = renderHook(() => useCategoryManagement());

    const firstData: CategoryFormData = {
      name: "一時変更A",
      color: "#101010",
      description: "A",
    };
    const secondData: CategoryFormData = {
      name: "確定変更B",
      color: "#202020",
      description: "B",
    };

    act(() => {
      result.current.updateCategory("work", firstData);
    });

    act(() => {
      result.current.updateCategory("work", secondData);
    });

    await waitFor(() => {
      const updated = result.current.categories.find((c) => c.id === "work");
      expect(updated?.name).toBe("確定変更B");
      expect(updated?.color).toBe("#202020");
    });

    await act(async () => {
      rejectFirst?.(new Error("first failed"));
      await Promise.resolve();
    });

    await waitFor(() => {
      expect(result.current.error).toBe(
        "カテゴリの更新に失敗しました。再試行してください。",
      );
    });

    const finalState = result.current.categories.find((c) => c.id === "work");
    expect(finalState?.name).toBe("確定変更B");
    expect(finalState?.color).toBe("#202020");
    expect(finalState?.description).toBe("B");
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

    let deletePromise: Promise<DeleteCategoryResult> | null = null;
    act(() => {
      deletePromise = result.current.deleteCategory("private");
    });

    const deleteResult = await deletePromise;
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
  // 概要: 削除API失敗時にロールバックされることをテスト
  // 目的: 削除失敗時にカテゴリが復元され、エラーが通知されることを保証
  it("削除APIが失敗した場合はロールバックしエラーを設定する", async () => {
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
    // 楽観的に一時削除された後、失敗時に復元される
    const afterDelete = result.current.categories.map((c) => c.id);
    expect(afterDelete).toContain("private");
    await waitFor(() => {
      expect(result.current.error).toBe(
        "カテゴリの削除に失敗しました。再試行してください。",
      );
    });
  });

  // 概要: 直前の失敗エラーが成功操作でクリアされることをテスト
  // 目的: エラーメッセージが成功後に残留しないことを保証
  it("直前のエラーは成功操作でクリアされる", async () => {
    const cats = await import("../../src/api/categories");
    const mocked = cats as unknown as {
      createCategory: ReturnType<typeof vi.fn>;
    };
    mocked.createCategory
      .mockRejectedValueOnce(new Error("fail"))
      .mockResolvedValueOnce({
        id: "new-success",
        name: "成功カテゴリ",
        color: "#1976d2",
        createdAt: new Date(),
        updatedAt: new Date(),
      });

    const { result } = renderHook(() => useCategoryManagement());

    const data: CategoryFormData = {
      name: "一時カテゴリ",
      color: "#abcdef",
      description: "temp",
    };

    act(() => {
      result.current.createCategory(data);
    });

    await waitFor(() => {
      expect(result.current.error).toBe(
        "カテゴリの作成に失敗しました。再試行してください。",
      );
    });

    const successData: CategoryFormData = {
      name: "成功カテゴリ",
      color: "#112233",
      description: "ok",
    };

    act(() => {
      result.current.createCategory(successData);
    });

    await waitFor(() => {
      expect(
        result.current.categories.some((c) => c.name === "成功カテゴリ"),
      ).toBe(true);
      expect(result.current.error).toBeNull();
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
