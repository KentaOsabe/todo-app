import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import {
  listTodos,
  createTodo,
  updateTodo,
  deleteTodo,
} from "../../src/api/todos";

let fetchMock: ReturnType<typeof vi.fn>;

beforeEach(() => {
  fetchMock = vi.fn();
  vi.stubGlobal("fetch", fetchMock as unknown as typeof fetch);
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("todos api - abort signal forwarding", () => {
  // 概要: listTodosがAbortSignalをfetchへ透過する
  // 目的: APIラッパーがoptions.signalを正しく下層へ伝えることを保証
  it("forwards signal on listTodos", async () => {
    const controller = new AbortController();
    fetchMock.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ data: [] }),
    } as unknown as Response);

    await listTodos({ signal: controller.signal });

    const [, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(init.signal).toBe(controller.signal);
  });

  // 概要: createTodoがAbortSignalをfetchへ透過する
  // 目的: POSTでもsignalが正しく渡ることを保証
  it("forwards signal on createTodo", async () => {
    const controller = new AbortController();
    fetchMock.mockResolvedValueOnce({
      ok: true,
      status: 201,
      json: async () => ({
        data: {
          id: 1,
          text: "x",
          completed: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      }),
    } as unknown as Response);

    await createTodo({ text: "x" }, { signal: controller.signal });
    const [, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(init.signal).toBe(controller.signal);
  });

  // 概要: updateTodoがAbortSignalをfetchへ透過する
  // 目的: PATCHでもsignalが正しく渡ることを保証
  it("forwards signal on updateTodo", async () => {
    const controller = new AbortController();
    fetchMock.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({
        data: {
          id: 1,
          text: "x",
          completed: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      }),
    } as unknown as Response);

    await updateTodo("1", { completed: true }, { signal: controller.signal });
    const [, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(init.signal).toBe(controller.signal);
  });

  // 概要: deleteTodoがAbortSignalをfetchへ透過する
  // 目的: DELETEでもsignalが正しく渡ることを保証
  it("forwards signal on deleteTodo", async () => {
    const controller = new AbortController();
    fetchMock.mockResolvedValueOnce({
      ok: true,
      status: 204,
    } as unknown as Response);

    await deleteTodo("1", { signal: controller.signal });
    const [, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(init.signal).toBe(controller.signal);
  });
});
