import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { createApiClient } from "../../src/api/client";
import type { ApiErrorResponse } from "../../src/api/client";

// 概要: APIエラーレスポンスの型安全性とメッセージ抽出ロジックをテスト
// 目的: Issue #39 の型安全化とメッセージ抽出共通化の要件を担保

const BASE_URL = "http://localhost:3001/api";

// fetch のモック
let fetchMock: ReturnType<typeof vi.fn>;

beforeEach(() => {
  fetchMock = vi.fn();
  vi.stubGlobal("fetch", fetchMock as unknown as typeof fetch);
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("ApiErrorResponse type", () => {
  // 概要: ApiErrorResponse型が正しい構造を受け入れることをテスト
  // 目的: 型定義が期待通りのエラーレスポンス構造を持つことを保証
  it("accepts valid error response structure", () => {
    const response: ApiErrorResponse = {
      errors: [
        { message: "Error message" },
        { message: "Field error", field: "email" },
        { message: "Code error", code: "INVALID_FORMAT" },
        { message: "Full error", field: "password", code: "TOO_SHORT" },
      ],
    };
    expect(response.errors).toHaveLength(4);
  });
});

describe("extractErrorMessage", () => {
  // Note: extractErrorMessage は内部関数のため、HTTP methods を通じて間接的にテスト

  // 概要: errors[0].messageが存在する場合の優先使用をテスト
  // 目的: エラー配列の最初のメッセージが最優先で抽出されることを保証
  it("returns errors[0].message when available", async () => {
    const api = createApiClient(BASE_URL);
    fetchMock.mockResolvedValueOnce({
      ok: false,
      status: 422,
      statusText: "Unprocessable Entity",
      json: async () => ({ errors: [{ message: "Validation failed" }] }),
    } as unknown as Response);

    await expect(api.get("/test")).rejects.toMatchObject({
      status: 422,
      message: "Validation failed",
      type: "http",
    });
  });

  // 概要: errorsが空配列の場合にstatusTextへフォールバックすることをテスト
  // 目的: エラー配列が空でもstatusTextから情報を取得できることを保証
  it("falls back to statusText when errors array is empty", async () => {
    const api = createApiClient(BASE_URL);
    fetchMock.mockResolvedValueOnce({
      ok: false,
      status: 500,
      statusText: "Internal Server Error",
      json: async () => ({ errors: [] }),
    } as unknown as Response);

    await expect(api.post("/test", {})).rejects.toMatchObject({
      status: 500,
      message: "Internal Server Error",
      type: "http",
    });
  });

  // 概要: errorsがundefinedの場合にstatusTextへフォールバックすることをテスト
  // 目的: エラー配列が存在しない場合でもstatusTextから情報を取得できることを保証
  it("falls back to statusText when errors is undefined", async () => {
    const api = createApiClient(BASE_URL);
    fetchMock.mockResolvedValueOnce({
      ok: false,
      status: 404,
      statusText: "Not Found",
      json: async () => ({}),
    } as unknown as Response);

    await expect(api.patch("/test/1", {})).rejects.toMatchObject({
      status: 404,
      message: "Not Found",
      type: "http",
    });
  });

  // 概要: JSONパースエラー時にstatusTextを使用することをテスト
  // 目的: レスポンスボディが不正でもstatusTextからエラー情報を取得できることを保証
  it("falls back to statusText when body is null (JSON parse error)", async () => {
    const api = createApiClient(BASE_URL);
    fetchMock.mockResolvedValueOnce({
      ok: false,
      status: 502,
      statusText: "Bad Gateway",
      json: async () => {
        throw new SyntaxError("Unexpected token");
      },
    } as unknown as Response);

    await expect(api.delete("/test/1")).rejects.toMatchObject({
      status: 502,
      message: "Bad Gateway",
      type: "http",
    });
  });

  // 概要: bodyとstatusTextの両方が使用不可の場合にデフォルトメッセージを返すことをテスト
  // 目的: すべての情報源が失敗した場合でも適切なエラーメッセージを提供することを保証
  it("returns default message when both body and statusText are unavailable", async () => {
    const api = createApiClient(BASE_URL);
    fetchMock.mockResolvedValueOnce({
      ok: false,
      status: 400,
      statusText: "",
      json: async () => ({}),
    } as unknown as Response);

    await expect(api.get("/test")).rejects.toMatchObject({
      status: 400,
      message: "Request failed",
      type: "http",
    });
  });

  // 概要: messageが空文字列の場合にstatusTextへフォールバックすることをテスト
  // 目的: 無効なメッセージ（空文字列）の場合でも適切な代替メッセージを提供することを保証
  it("falls back to statusText when message is empty string", async () => {
    const api = createApiClient(BASE_URL);
    fetchMock.mockResolvedValueOnce({
      ok: false,
      status: 403,
      statusText: "Forbidden",
      json: async () => ({ errors: [{ message: "" }] }),
    } as unknown as Response);

    await expect(api.post("/test", {})).rejects.toMatchObject({
      status: 403,
      message: "Forbidden",
      type: "http",
    });
  });

  // 概要: 複数のエラーがある場合に最初のエラーメッセージを返すことをテスト
  // 目的: エラー配列の最初の要素が優先されることを保証
  it("returns first error message when multiple errors exist", async () => {
    const api = createApiClient(BASE_URL);
    fetchMock.mockResolvedValueOnce({
      ok: false,
      status: 400,
      statusText: "Bad Request",
      json: async () => ({
        errors: [
          { message: "First error", field: "name" },
          { message: "Second error", field: "email" },
        ],
      }),
    } as unknown as Response);

    await expect(api.patch("/test/1", {})).rejects.toMatchObject({
      status: 400,
      message: "First error",
      type: "http",
    });
  });
});

describe("HTTP methods error handling integration", () => {
  // 概要: GET メソッドで構造化されたエラーレスポンスを正しく処理することをテスト
  // 目的: 実際のGET呼び出しで型安全なエラー処理が動作することを保証
  it("GET: handles structured error response", async () => {
    const api = createApiClient(BASE_URL);
    fetchMock.mockResolvedValueOnce({
      ok: false,
      status: 422,
      statusText: "Unprocessable Entity",
      json: async () => ({
        errors: [{ message: "Email is invalid", field: "email" }],
      }),
    } as unknown as Response);

    await expect(api.get("/users")).rejects.toMatchObject({
      status: 422,
      message: "Email is invalid",
      type: "http",
    });
  });

  // 概要: POST メソッドでエラー配列が空の場合を正しく処理することをテスト
  // 目的: POST呼び出しでstatusTextへのフォールバックが動作することを保証
  it("POST: handles empty errors array", async () => {
    const api = createApiClient(BASE_URL);
    fetchMock.mockResolvedValueOnce({
      ok: false,
      status: 500,
      statusText: "Internal Server Error",
      json: async () => ({ errors: [] }),
    } as unknown as Response);

    await expect(api.post("/todos", {})).rejects.toMatchObject({
      status: 500,
      message: "Internal Server Error",
      type: "http",
    });
  });

  // 概要: PATCH メソッドでJSONパースエラーを正しく処理することをテスト
  // 目的: PATCH呼び出しでJSONパース失敗時のフォールバックが動作することを保証
  it("PATCH: handles JSON parse error", async () => {
    const api = createApiClient(BASE_URL);
    fetchMock.mockResolvedValueOnce({
      ok: false,
      status: 502,
      statusText: "Bad Gateway",
      json: async () => {
        throw new SyntaxError("Unexpected token");
      },
    } as unknown as Response);

    await expect(api.patch("/todos/1", {})).rejects.toMatchObject({
      status: 502,
      message: "Bad Gateway",
      type: "http",
    });
  });

  // 概要: DELETE メソッドでstatusTextが空の場合を正しく処理することをテスト
  // 目的: DELETE呼び出しでデフォルトメッセージへのフォールバックが動作することを保証
  it("DELETE: handles missing statusText", async () => {
    const api = createApiClient(BASE_URL);
    fetchMock.mockResolvedValueOnce({
      ok: false,
      status: 400,
      statusText: "",
      json: async () => ({}),
    } as unknown as Response);

    await expect(api.delete("/todos/1")).rejects.toMatchObject({
      status: 400,
      message: "Request failed",
      type: "http",
    });
  });

  // 概要: GET メソッドで複数エラー時に最初のメッセージを使用することをテスト
  // 目的: 複数のエラーがある場合の優先順位が正しいことを保証
  it("GET: uses first error message from multiple errors", async () => {
    const api = createApiClient(BASE_URL);
    fetchMock.mockResolvedValueOnce({
      ok: false,
      status: 400,
      statusText: "Bad Request",
      json: async () => ({
        errors: [
          { message: "Name is required", field: "name" },
          { message: "Email is invalid", field: "email" },
        ],
      }),
    } as unknown as Response);

    await expect(api.get("/categories")).rejects.toMatchObject({
      status: 400,
      message: "Name is required",
      type: "http",
    });
  });
});

describe("backward compatibility", () => {
  // 概要: 既存のエラーハンドリング動作が維持されることをテスト
  // 目的: リファクタリングが既存の挙動を壊さないことを保証
  it("maintains existing error handling behavior", async () => {
    const api = createApiClient(BASE_URL);
    fetchMock.mockResolvedValueOnce({
      ok: false,
      status: 422,
      statusText: "Unprocessable Entity",
      json: async () => ({ errors: [{ message: "validation failed" }] }),
    } as unknown as Response);

    await expect(api.get("/todos")).rejects.toMatchObject({
      status: 422,
      message: expect.stringContaining("validation failed"),
    });
  });
});
