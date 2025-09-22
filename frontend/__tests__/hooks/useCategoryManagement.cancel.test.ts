import { renderHook, act, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { useCategoryManagement } from "../../src/hooks/useCategoryManagement";

// useCategoryManagementを対象にするため、カテゴリAPIをモック
vi.mock("../../src/api/categories", () => ({
  listCategories: vi.fn(),
  createCategory: vi.fn(),
  updateCategory: vi.fn(),
  deleteCategory: vi.fn(),
}));

describe("useCategoryManagement - cancel", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // 概要: アンマウント時に進行中のカテゴリ取得を中断することをテスト
  // 目的: AbortControllerのsignalがhookからAPI層へ伝搬し、cleanupでabortされることを保証
  it("アンマウント時にlistCategoriesのsignalがabortされる", async () => {
    const cats = await import("../../src/api/categories");
    let capturedSignal: AbortSignal | undefined;

    (
      cats.listCategories as unknown as ReturnType<typeof vi.fn>
    ).mockImplementation((options?: { signal?: AbortSignal }) => {
      capturedSignal = options?.signal;
      return new Promise((_resolve, reject) => {
        // abort時にAbortErrorでrejectさせる（fetchの挙動に合わせる）
        capturedSignal?.addEventListener("abort", () => {
          // DOMExceptionが存在しない環境でもnameプロパティを付与
          type AbortLikeError = Error & { name: string };
          const err =
            typeof DOMException !== "undefined"
              ? (new DOMException(
                  "Aborted",
                  "AbortError",
                ) as unknown as AbortLikeError)
              : (Object.assign(new Error("Aborted"), {
                  name: "AbortError",
                }) as AbortLikeError);
          reject(err);
        });
      });
    });

    const { unmount } = renderHook(() => useCategoryManagement());

    // アンマウントでcleanup -> abort()
    act(() => {
      unmount();
    });

    // signalが渡され、アンマウントでabortedになっていること
    expect(capturedSignal).toBeDefined();
    expect(capturedSignal?.aborted).toBe(true);
  });

  // 概要: 取得処理がAbortErrorで中断された場合にエラー扱いしないことをテスト
  // 目的: キャンセルはUIエラーにしない（errorを設定しない）ことを保証
  it("AbortErrorはエラー扱いせずerrorを設定しない", async () => {
    const cats = await import("../../src/api/categories");
    (
      cats.listCategories as unknown as ReturnType<typeof vi.fn>
    ).mockImplementation(() => {
      type AbortLikeError = Error & { name: string };
      const err =
        typeof DOMException !== "undefined"
          ? (new DOMException(
              "Aborted",
              "AbortError",
            ) as unknown as AbortLikeError)
          : (Object.assign(new Error("Aborted"), {
              name: "AbortError",
            }) as AbortLikeError);
      return Promise.reject(err);
    });

    const { result } = renderHook(() => useCategoryManagement());

    // loadingがfalseになるまで待って、errorが設定されていないことを確認
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeNull();
    });
  });
});
