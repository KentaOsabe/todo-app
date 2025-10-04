import { isAbortError } from "../utils/error";

export type ApiError = {
  status?: number;
  message: string;
  type?: "network" | "http" | "unknown" | "abort";
  details?: unknown;
};

/**
 * APIエラーレスポンスの型定義
 * Rails APIから返される標準的なエラーレスポンス形式
 */
export interface ApiErrorResponse {
  errors?: Array<{
    message: string;
    field?: string; // フィールド固有のエラーの場合
    code?: string; // エラーコード（将来的な拡張用）
  }>;
}

type RequestOptions = {
  headers?: Record<string, string>;
  signal?: AbortSignal;
};

const defaultHeaders = {
  "Content-Type": "application/json",
};

function buildUrl(baseURL: string, path: string) {
  return `${baseURL.replace(/\/$/, "")}${path.startsWith("/") ? "" : "/"}${path}`;
}

async function parseJsonSafe(res: Response): Promise<ApiErrorResponse | null> {
  try {
    return (await res.json()) as ApiErrorResponse;
  } catch {
    return null;
  }
}

/**
 * APIエラーレスポンスからメッセージを抽出する
 * @param body - パース済みのエラーレスポンス
 * @param statusText - HTTPステータステキスト
 * @returns 抽出されたエラーメッセージ
 */
function extractErrorMessage(
  body: ApiErrorResponse | null,
  statusText: string,
): string {
  // 1. エラー配列の最初のメッセージを優先
  if (body?.errors?.[0]?.message) {
    return body.errors[0].message;
  }

  // 2. statusTextをフォールバック
  if (statusText) {
    return statusText;
  }

  // 3. デフォルトメッセージ
  return "Request failed";
}

function isApiError(value: unknown): value is ApiError {
  if (typeof value !== "object" || value === null) return false;
  const v = value as Record<string, unknown>;
  const hasMessage = typeof v.message === "string";
  const hasStatus = typeof v.status === "number";
  const hasValidType =
    typeof v.type === "string" &&
    (v.type === "network" || v.type === "http" || v.type === "unknown");
  // ApiError と判定するには、最低でも message と (status または type) を持つ必要がある
  return hasMessage && (hasStatus || hasValidType);
}

export function createApiClient(baseURL: string) {
  return {
    async get<T = unknown>(
      path: string,
      options: RequestOptions = {},
    ): Promise<T> {
      try {
        const res = await fetch(buildUrl(baseURL, path), {
          method: "GET",
          headers: { ...defaultHeaders, ...options.headers },
          signal: options.signal,
        });
        if (!res.ok) {
          const body = await parseJsonSafe(res);
          const message = extractErrorMessage(body, res.statusText);
          const err: ApiError = {
            status: res.status,
            message,
            type: "http",
            details: body,
          };
          throw err;
        }
        return (await res.json()) as T;
      } catch (e: unknown) {
        // AbortErrorはキャンセル扱い
        if (isAbortError(e)) {
          const err: ApiError = { type: "abort", message: "Request aborted" };
          throw err;
        }
        if (isApiError(e)) throw e;
        if (e instanceof TypeError) {
          const err: ApiError = { type: "network", message: e.message };
          throw err;
        }
        const err: ApiError = {
          type: "unknown",
          message: e instanceof Error ? e.message : "Unknown error",
        };
        throw err;
      }
    },

    async post<T = unknown>(
      path: string,
      body?: unknown,
      options: RequestOptions = {},
    ): Promise<T> {
      try {
        const res = await fetch(buildUrl(baseURL, path), {
          method: "POST",
          headers: { ...defaultHeaders, ...options.headers },
          body: body !== undefined ? JSON.stringify(body) : undefined,
          signal: options.signal,
        });
        if (!res.ok) {
          const body = await parseJsonSafe(res);
          const message = extractErrorMessage(body, res.statusText);
          const err: ApiError = {
            status: res.status,
            message,
            type: "http",
            details: body,
          };
          throw err;
        }
        return (await res.json()) as T;
      } catch (e: unknown) {
        if (isAbortError(e)) {
          const err: ApiError = { type: "abort", message: "Request aborted" };
          throw err;
        }
        if (isApiError(e)) throw e;
        if (e instanceof TypeError) {
          const err: ApiError = { type: "network", message: e.message };
          throw err;
        }
        const err: ApiError = {
          type: "unknown",
          message: e instanceof Error ? e.message : "Unknown error",
        };
        throw err;
      }
    },

    async patch<T = unknown>(
      path: string,
      body?: unknown,
      options: RequestOptions = {},
    ): Promise<T> {
      try {
        const res = await fetch(buildUrl(baseURL, path), {
          method: "PATCH",
          headers: { ...defaultHeaders, ...options.headers },
          body: body !== undefined ? JSON.stringify(body) : undefined,
          signal: options.signal,
        });
        if (!res.ok) {
          const body = await parseJsonSafe(res);
          const message = extractErrorMessage(body, res.statusText);
          const err: ApiError = {
            status: res.status,
            message,
            type: "http",
            details: body,
          };
          throw err;
        }
        return (await res.json()) as T;
      } catch (e: unknown) {
        if (isAbortError(e)) {
          const err: ApiError = { type: "abort", message: "Request aborted" };
          throw err;
        }
        if (isApiError(e)) throw e;
        if (e instanceof TypeError) {
          const err: ApiError = { type: "network", message: e.message };
          throw err;
        }
        const err: ApiError = {
          type: "unknown",
          message: e instanceof Error ? e.message : "Unknown error",
        };
        throw err;
      }
    },

    async delete(path: string, options: RequestOptions = {}): Promise<void> {
      try {
        const res = await fetch(buildUrl(baseURL, path), {
          method: "DELETE",
          headers: { ...defaultHeaders, ...options.headers },
          signal: options.signal,
        });
        if (!res.ok) {
          const body = await parseJsonSafe(res);
          const message = extractErrorMessage(body, res.statusText);
          const err: ApiError = {
            status: res.status,
            message,
            type: "http",
            details: body,
          };
          throw err;
        }
        return;
      } catch (e: unknown) {
        if (isAbortError(e)) {
          const err: ApiError = { type: "abort", message: "Request aborted" };
          throw err;
        }
        if (isApiError(e)) throw e;
        if (e instanceof TypeError) {
          const err: ApiError = { type: "network", message: e.message };
          throw err;
        }
        const err: ApiError = {
          type: "unknown",
          message: e instanceof Error ? e.message : "Unknown error",
        };
        throw err;
      }
    },
  };
}

const defaultBase =
  import.meta.env?.VITE_API_BASE_URL || "http://localhost:3001/api";
export const api = createApiClient(defaultBase);
