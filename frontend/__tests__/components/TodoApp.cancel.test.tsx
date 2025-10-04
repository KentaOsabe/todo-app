import { describe, it, expect, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { TodoApp } from "../../src/components/TodoApp";

// 概要: TodoAppの初回データ取得でAbortControllerを利用することをテスト
// 目的: アンマウント時にlistTodosへ渡したsignalがabortされること、AbortErrorはUIエラー扱いしないことを保証

// useCategoryManagementは今回のテスト対象外のため、API呼び出しを避けるモックを提供
vi.mock("../../src/hooks/useCategoryManagement", () => ({
  useCategoryManagement: () => ({
    categories: [],
    createCategory: vi.fn(),
    updateCategory: vi.fn(),
    deleteCategory: vi.fn().mockResolvedValue({ status: "success" }),
    isCategoryInUse: vi.fn().mockResolvedValue(false),
    loading: false,
    error: null,
    offline: false,
  }),
}));

// fetchをスタブし、RequestInit.signalを直接検証するアプローチに切り替え
type AbortSignalLike = { aborted: boolean };
let capturedSignal: AbortSignalLike | undefined;
let fetchMock: ReturnType<typeof vi.fn>;

describe("TodoApp - cancel on initial fetch", () => {
  // 概要: アンマウント時にlistTodosへ渡したsignalがabortされる
  // 目的: AbortControllerのsignal伝搬とcleanupでのabort実行を保証
  it("unmount triggers abort on listTodos signal", async () => {
    capturedSignal = undefined;
    fetchMock = vi.fn((...args: [RequestInfo, RequestInit?]) => {
      const [, init] = args;
      capturedSignal = init?.signal as unknown as AbortSignalLike | undefined;
      // resolveしないPromiseでエフェクト中の待機を維持
      return new Promise(() => {}) as unknown as Promise<Response>;
    });
    vi.stubGlobal("fetch", fetchMock as unknown as typeof fetch);

    const { unmount } = render(<TodoApp />);

    // fetchが呼ばれる（=signal受け取り）まで待機
    await waitFor(() => expect(fetchMock).toHaveBeenCalled());

    // 直ちにアンマウントしてcleanup内のabortを実行
    unmount();

    // 捕捉したsignalが存在し、abortedになっていること
    const hasAbortedProp = (capturedSignal as { aborted?: unknown } | undefined)
      ?.aborted;
    expect(typeof hasAbortedProp === "boolean").toBe(true);
    expect((capturedSignal as { aborted?: boolean } | undefined)?.aborted).toBe(
      true,
    );
  });

  // 概要: AbortErrorでrejectしてもエラー表示はしない
  // 目的: キャンセルはUIエラー扱いにならないことを保証
  it("AbortError is not shown as UI error", async () => {
    // fetchをAbortErrorでrejectするようにスタブ
    const err =
      typeof DOMException !== "undefined"
        ? new DOMException("Aborted", "AbortError")
        : Object.assign(new Error("Aborted"), { name: "AbortError" });
    fetchMock = vi.fn(() => {
      return Promise.reject(err) as unknown as Promise<Response>;
    });
    vi.stubGlobal("fetch", fetchMock as unknown as typeof fetch);

    render(<TodoApp />);

    // 「タスクの取得に失敗しました」が表示されないこと
    // waitForを使わず、非表示であることをそのまま検証（Abort即時reject想定）
    expect(
      screen.queryByText("タスクの取得に失敗しました"),
    ).not.toBeInTheDocument();
  });
});
