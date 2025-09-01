import {
  render,
  screen,
  fireEvent,
  waitFor,
  within,
} from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { TodoApp } from "../../src/components/TodoApp";
import type { Todo } from "../../src/types/todo";

// 概要: APIモックを使ってTodoAppがAPI経由でデータ取得・作成・更新・削除することをテスト
// 目的: LocalStorageからAPI連携への移行（Issue #25）の動作保証

vi.mock("../../src/api/todos", () => {
  return {
    listTodos: vi.fn(),
    createTodo: vi.fn(),
    updateTodo: vi.fn(),
    deleteTodo: vi.fn(),
  };
});

import {
  listTodos,
  createTodo,
  updateTodo,
  deleteTodo,
} from "../../src/api/todos";

const makeTodo = (overrides: Partial<Todo> = {}): Todo => ({
  id: "1",
  text: "First",
  completed: false,
  createdAt: new Date("2025-08-30T10:00:00Z"),
  categoryId: undefined,
  tags: [],
  order: 0,
  ...overrides,
});

describe("TodoApp (API)", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  // 概要: 初期表示時にAPIからTodo一覧を取得して表示する
  // 目的: listTodosが呼ばれ、結果がレンダリングされることを保証
  it("fetches and renders todos on mount", async () => {
    (listTodos as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce([
      makeTodo({ id: "1", text: "API Todo" }),
    ]);

    render(<TodoApp />);

    await waitFor(() => {
      expect(screen.getByText("API Todo")).toBeInTheDocument();
    });
  });

  // 概要: フォーム送信でcreateTodoが呼ばれ、UIに反映される
  // 目的: 追加フローがAPI経由で動作することを保証
  it("creates todo via API and renders it", async () => {
    (listTodos as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
      [],
    );
    (createTodo as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
      makeTodo({ id: "10", text: "Created via API" }),
    );

    render(<TodoApp />);

    const input = await screen.findByPlaceholderText("新しいタスクを入力");
    fireEvent.change(input, { target: { value: "Created via API" } });
    fireEvent.click(screen.getByRole("button", { name: "追加" }));

    await waitFor(() => {
      expect(screen.getByText("Created via API")).toBeInTheDocument();
    });
  });

  // 概要: チェックボックス操作でupdateTodoが呼ばれる
  // 目的: 完了状態切替がAPI経由で行われることを保証（UIは楽観的更新）
  it("toggles completion via API", async () => {
    (listTodos as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce([
      makeTodo({ id: "1", text: "Toggle", completed: false }),
    ]);
    (updateTodo as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(
      makeTodo({ id: "1", text: "Toggle", completed: true }),
    );

    render(<TodoApp />);
    // 対象のTodo行に限定してチェックボックスを取得（FilterBar等のチェック系UIを回避）
    const itemText = await screen.findByText("Toggle");
    const listItem = itemText.closest("li") as HTMLElement;
    const checkbox = within(listItem).getByRole("checkbox");
    fireEvent.click(checkbox);

    await waitFor(() => {
      expect(updateTodo).toHaveBeenCalled();
    });
  });

  // 概要: 削除ボタンでdeleteTodoが呼ばれ、UIから消える
  // 目的: 削除フローがAPI経由で動作することを保証
  it("deletes todo via API", async () => {
    (listTodos as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce([
      makeTodo({ id: "1", text: "To Delete" }),
    ]);
    (deleteTodo as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
      undefined,
    );

    render(<TodoApp />);

    // 初期表示
    await screen.findByText("To Delete");

    // 削除
    const deleteButton = screen.getByLabelText(/delete/i);
    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(deleteTodo).toHaveBeenCalledWith("1");
      expect(screen.queryByText("To Delete")).not.toBeInTheDocument();
    });
  });
});
