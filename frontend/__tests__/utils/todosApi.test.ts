import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import {
  listTodos,
  createTodo,
  updateTodo,
  deleteTodo,
} from "../../src/api/todos";

// 概要: Todo APIラッパーの基本操作（一覧/作成/更新/削除）をテスト
// 目的: Issue #25 のTodo機能API化に向けたI/Fと変換（snake->camel, Date変換, デフォルト値）を保証

let fetchMock: ReturnType<typeof vi.fn>;

beforeEach(() => {
  fetchMock = vi.fn();
  vi.stubGlobal("fetch", fetchMock as unknown as typeof fetch);
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("todos api", () => {
  // 概要: GET /todos のレスポンスをTodo[]に変換する
  // 目的: created_at/updated_atをDateへ、category_idをcategoryIdへ、tagsのデフォルト付与
  it("lists todos and maps fields", async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({
        data: [
          {
            id: 1,
            text: "A",
            completed: false,
            category_id: 2,
            created_at: "2025-08-30T10:00:00Z",
            updated_at: "2025-08-30T10:00:00Z",
          },
        ],
      }),
    } as unknown as Response);

    const todos = await listTodos();
    expect(fetchMock).toHaveBeenCalledWith(
      "http://localhost:3001/api/todos",
      expect.objectContaining({ method: "GET" }),
    );
    expect(todos).toHaveLength(1);
    expect(todos[0].id).toBe("1");
    expect(todos[0].categoryId).toBe("2");
    expect(Array.isArray(todos[0].tags)).toBe(true);
    expect(todos[0].createdAt).toBeInstanceOf(Date);
  });

  // 概要: POST /todos の作成が正しいペイロードで送られ、変換後のTodoが返る
  // 目的: JSONヘッダー/ボディ、snake->camel 変換を保証
  it("creates todo and returns mapped entity", async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      status: 201,
      json: async () => ({
        data: {
          id: 10,
          text: "B",
          completed: false,
          category_id: 2,
          created_at: "2025-08-30T10:00:00Z",
          updated_at: "2025-08-30T10:00:00Z",
        },
      }),
    } as unknown as Response);

    const todo = await createTodo({ text: "B", categoryId: "2" });
    expect(fetchMock).toHaveBeenCalledWith(
      "http://localhost:3001/api/todos",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          "Content-Type": "application/json",
        }),
        body: JSON.stringify({ text: "B", category_id: "2" }),
      }),
    );
    expect(todo.id).toBe("10");
    expect(todo.categoryId).toBe("2");
  });

  // 概要: PATCH /todos/:id の更新が正しく送信され、変換後のTodoが返る
  // 目的: completed切替やtext変更の送受信を保証
  it("updates todo and returns mapped entity", async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({
        data: {
          id: 10,
          text: "C",
          completed: true,
          category_id: 2,
          created_at: "2025-08-30T10:00:00Z",
          updated_at: "2025-08-31T10:00:00Z",
        },
      }),
    } as unknown as Response);

    const todo = await updateTodo("10", { text: "C", completed: true });
    expect(fetchMock).toHaveBeenCalledWith(
      "http://localhost:3001/api/todos/10",
      expect.objectContaining({
        method: "PATCH",
        headers: expect.objectContaining({
          "Content-Type": "application/json",
        }),
      }),
    );
    expect(todo.text).toBe("C");
    expect(todo.completed).toBe(true);
  });

  // 概要: DELETE /todos/:id の削除が200/204で成功する
  // 目的: エラーを投げずに完了することを保証
  it("deletes todo", async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      status: 204,
    } as unknown as Response);
    await expect(deleteTodo("10")).resolves.toBeUndefined();
    expect(fetchMock).toHaveBeenCalledWith(
      "http://localhost:3001/api/todos/10",
      expect.objectContaining({ method: "DELETE" }),
    );
  });
});
