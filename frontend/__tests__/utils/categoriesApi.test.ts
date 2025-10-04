import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import {
  listCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  getCategoryUsage,
} from "../../src/api/categories";

// 概要: Category APIラッパーの基本操作（一覧/作成/更新/削除）をテスト
// 目的: Issue #25 のCategory機能API化に向けたI/Fと変換（snake->camel, Date変換）を保証

let fetchMock: ReturnType<typeof vi.fn>;

beforeEach(() => {
  fetchMock = vi.fn();
  vi.stubGlobal("fetch", fetchMock as unknown as typeof fetch);
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("categories api", () => {
  // 概要: GET /categories のレスポンスをCategory[]に変換する
  // 目的: created_at/updated_atをDateへ変換し、id/nameを取り出す
  it("lists categories and maps fields", async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({
        data: [
          {
            id: 1,
            name: "仕事",
            created_at: "2025-08-30T10:00:00Z",
            updated_at: "2025-08-30T10:00:00Z",
          },
        ],
      }),
    } as unknown as Response);

    const categories = await listCategories();
    expect(fetchMock).toHaveBeenCalledWith(
      "http://localhost:3001/api/categories",
      expect.objectContaining({ method: "GET" }),
    );
    expect(categories).toHaveLength(1);
    expect(categories[0].id).toBe("1");
    expect(categories[0].name).toBe("仕事");
    expect(categories[0].createdAt).toBeInstanceOf(Date);
  });

  // 概要: POST /categories の作成が正しいペイロードで送られ、変換後のCategoryが返る
  // 目的: JSONヘッダー/ボディ、snake->camel 変換を保証
  it("creates category and returns mapped entity", async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      status: 201,
      json: async () => ({
        data: {
          id: 10,
          name: "学習",
          created_at: "2025-08-30T10:00:00Z",
          updated_at: "2025-08-30T10:00:00Z",
        },
      }),
    } as unknown as Response);

    const cat = await createCategory({ name: "学習" });
    expect(fetchMock).toHaveBeenCalledWith(
      "http://localhost:3001/api/categories",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          "Content-Type": "application/json",
        }),
        body: JSON.stringify({ name: "学習" }),
      }),
    );
    expect(cat.id).toBe("10");
    expect(cat.name).toBe("学習");
  });

  // 概要: PATCH /categories/:id の更新が正しく送信され、変換後のCategoryが返る
  // 目的: name変更の送受信を保証
  it("updates category and returns mapped entity", async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({
        data: {
          id: 10,
          name: "重要な学習",
          created_at: "2025-08-30T10:00:00Z",
          updated_at: "2025-08-31T10:00:00Z",
        },
      }),
    } as unknown as Response);

    const cat = await updateCategory("10", { name: "重要な学習" });
    expect(fetchMock).toHaveBeenCalledWith(
      "http://localhost:3001/api/categories/10",
      expect.objectContaining({
        method: "PATCH",
        headers: expect.objectContaining({
          "Content-Type": "application/json",
        }),
      }),
    );
    expect(cat.name).toBe("重要な学習");
  });

  // 概要: DELETE /categories/:id の削除が200/204で成功する
  // 目的: エラーを投げずに完了することを保証
  it("deletes category", async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      status: 204,
    } as unknown as Response);
    await expect(deleteCategory("10")).resolves.toBeUndefined();
    expect(fetchMock).toHaveBeenCalledWith(
      "http://localhost:3001/api/categories/10",
      expect.objectContaining({ method: "DELETE" }),
    );
  });

  // 概要: GET /categories/:id/usage のレスポンスをCategoryUsageへ変換する
  // 目的: in_use/counts.todos を camelCase へ変換し、数値が保持されることを保証
  it("fetches category usage and maps fields", async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({
        data: {
          in_use: true,
          counts: {
            todos: 5,
          },
        },
      }),
    } as unknown as Response);

    const usage = await getCategoryUsage("10");
    expect(fetchMock).toHaveBeenCalledWith(
      "http://localhost:3001/api/categories/10/usage",
      expect.objectContaining({ method: "GET" }),
    );
    expect(usage.inUse).toBe(true);
    expect(usage.counts.todos).toBe(5);
  });
});
