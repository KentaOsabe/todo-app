import { render, screen, waitFor } from "@testing-library/react";
import { it, expect, vi } from "vitest";
import { TodoApp } from "../../src/components/TodoApp";

vi.mock("../../src/api/todos", () => ({
  listTodos: vi.fn(),
  createTodo: vi.fn(),
  updateTodo: vi.fn(),
  deleteTodo: vi.fn(),
}));

import { listTodos } from "../../src/api/todos";

// 概要: 初期取得結果の適用が初回のみであることをテスト
// 目的: マウント後の再レンダリング（状態変化）でAPI再取得や再適用が行われないことを保証
it("applies fetched todos only on first mount", async () => {
  (listTodos as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce([
    {
      id: "1",
      text: "From API",
      completed: false,
      createdAt: new Date("2025-08-30T10:00:00Z"),
      categoryId: undefined,
      tags: [],
      order: 0,
    },
  ]);

  render(<TodoApp />);

  // 初回取得結果が描画される
  await waitFor(() => {
    expect(screen.getByText("From API")).toBeInTheDocument();
  });

  // オフラインイベントで状態変化→再レンダリングを誘発
  window.dispatchEvent(new Event("offline"));

  // 取得は初回のみ（StrictMode でない通常レンダリング前提）
  expect(listTodos).toHaveBeenCalledTimes(1);
});

// 概要: 再レンダリング（同一インスタンス）では初回適用の結果が維持されることをスモークで確認
// 目的: props変更なしの再レンダリングでAPI結果の再適用が発生しないことを保証
it("keeps first applied data across simple rerenders (smoke)", async () => {
  (listTodos as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce([
    {
      id: "a",
      text: "First Batch",
      completed: false,
      createdAt: new Date("2025-08-30T10:00:00Z"),
      categoryId: undefined,
      tags: [],
      order: 0,
    },
  ]);

  const { rerender } = render(<TodoApp />);

  await waitFor(() => {
    expect(screen.getByText("First Batch")).toBeInTheDocument();
  });

  // もし再適用された場合にUIが変わるよう次の返り値を用意
  (listTodos as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce([
    {
      id: "b",
      text: "Second Batch",
      completed: false,
      createdAt: new Date("2025-08-30T10:05:00Z"),
      categoryId: undefined,
      tags: [],
      order: 0,
    },
  ]);

  // 同一インスタンスでの再レンダリング
  rerender(<TodoApp />);

  // UIは初回適用の内容を維持する（Second Batch に置き換わらない）
  await waitFor(() => {
    expect(screen.queryByText("Second Batch")).not.toBeInTheDocument();
    expect(screen.getByText("First Batch")).toBeInTheDocument();
  });
});
