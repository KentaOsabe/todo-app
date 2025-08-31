import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { createApiClient } from "../../src/api/client";

// 概要: APIクライアントの基本動作（GET/POST・エラーハンドリング）をテスト
// 目的: Issue #25 の「API通信基盤」要件（baseURL, JSON処理, エラー処理）を最小限で担保

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

describe("api client", () => {
  // 概要: GETがbaseURLに対して正しいパスでリクエストされ、JSONが返ることをテスト
  // 目的: 基本的なGET通信の成功パスを保証
  it("GET: 正しいURLにリクエストし、JSONを返す", async () => {
    const api = createApiClient(BASE_URL);
    fetchMock.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ data: [{ id: 1, text: "A" }] }),
    } as unknown as Response);

    const res = await api.get("/todos");
    expect(fetchMock).toHaveBeenCalledWith(
      `${BASE_URL}/todos`,
      expect.objectContaining({ method: "GET" }),
    );
    expect(res).toEqual({ data: [{ id: 1, text: "A" }] });
  });

  // 概要: POSTがJSONボディと適切なヘッダーで送信されることをテスト
  // 目的: 作成・更新系の基本ヘッダーとボディシリアライズを保証
  it("POST: JSONヘッダーとボディで送信する", async () => {
    const api = createApiClient(BASE_URL);
    fetchMock.mockResolvedValueOnce({
      ok: true,
      status: 201,
      json: async () => ({ data: { id: 10, text: "B" } }),
    } as unknown as Response);

    const payload = { text: "B" };
    const res = await api.post<{ data: { id: number; text: string } }>(
      "/todos",
      payload,
    );
    expect(fetchMock).toHaveBeenCalledWith(
      `${BASE_URL}/todos`,
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          "Content-Type": "application/json",
        }),
        body: JSON.stringify(payload),
      }),
    );
    expect(res.data.id).toBe(10);
  });

  // 概要: 4xx/5xx時にエラーメッセージとステータスを含む例外を投げることをテスト
  // 目的: エラーハンドリングの最小仕様（Issue #25の要件）を担保
  it("エラー応答: ステータスとメッセージを含む例外を投げる", async () => {
    const api = createApiClient(BASE_URL);
    fetchMock.mockResolvedValueOnce({
      ok: false,
      status: 422,
      json: async () => ({ errors: [{ message: "validation failed" }] }),
    } as unknown as Response);

    await expect(api.get("/todos")).rejects.toMatchObject({
      status: 422,
      message: expect.stringContaining("validation failed"),
    });
  });

  // 概要: ネットワークエラー時に識別可能な例外を投げることをテスト
  // 目的: オフライン検知・再試行UIに活用できるようエラー種別を付与
  it("ネットワークエラー: typeが'network'の例外を投げる", async () => {
    const api = createApiClient(BASE_URL);
    fetchMock.mockRejectedValueOnce(new TypeError("Failed to fetch"));

    await expect(api.get("/todos")).rejects.toMatchObject({
      type: "network",
    });
  });
});
