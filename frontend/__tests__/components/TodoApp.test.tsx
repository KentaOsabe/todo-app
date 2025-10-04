import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import type { Todo } from "../../src/types/todo";

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

vi.mock("../../src/api/todos", () => ({
  listTodos: vi.fn(),
  createTodo: vi.fn(),
  updateTodo: vi.fn(),
  deleteTodo: vi.fn(),
}));

import { TodoApp } from "../../src/components/TodoApp";
import {
  listTodos,
  createTodo,
  updateTodo,
  deleteTodo,
} from "../../src/api/todos";

const makeTodo = (overrides: Partial<Todo> = {}): Todo => ({
  id: String(Date.now()),
  text: "Mock",
  completed: false,
  createdAt: new Date(),
  categoryId: undefined,
  tags: [],
  order: 0,
  ...overrides,
});

describe("TodoApp", () => {
  beforeEach(() => {
    // APIモックの初期化
    vi.resetAllMocks();
    // フィルターなどの永続状態が他テストに干渉しないようクリア
    window.localStorage.clear();
    (listTodos as unknown as ReturnType<typeof vi.fn>).mockResolvedValue([]);
    (createTodo as unknown as ReturnType<typeof vi.fn>).mockImplementation(
      async ({ text, categoryId }: { text: string; categoryId?: string }) =>
        makeTodo({ id: String(Date.now()), text, categoryId }),
    );
    (updateTodo as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(
      makeTodo(),
    );
    (deleteTodo as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(
      undefined,
    );
  });
  // 概要: アプリケーションのタイトルが正しく表示されることを確認
  // 目的: UIの基本構造が正しくレンダリングされることを保証
  it("renders todo app title", () => {
    render(<TodoApp />);
    expect(
      screen.getByRole("heading", { name: /todo app/i }),
    ).toBeInTheDocument();
  });

  // 概要: 新しいTodoを入力するためのフィールドが表示されることを確認
  // 目的: ユーザーがTodoを入力できるUIが提供されていることを保証
  it("renders input field for new todo", () => {
    render(<TodoApp />);
    expect(
      screen.getByPlaceholderText("新しいタスクを入力"),
    ).toBeInTheDocument();
  });

  // 概要: Todoを追加するためのボタンが表示されることを確認
  // 目的: ユーザーがTodoを追加するアクションを実行できることを保証
  it("renders add button", () => {
    render(<TodoApp />);
    expect(screen.getByRole("button", { name: "追加" })).toBeInTheDocument();
  });

  // 概要: フォームが送信されたときに新しいTodoが追加されることを確認
  // 目的: Todo追加機能の基本動作が正しく実装されていることを保証
  it("adds new todo when form is submitted", () => {
    render(<TodoApp />);
    const input = screen.getByPlaceholderText("新しいタスクを入力");
    const addButton = screen.getByRole("button", { name: "追加" });

    fireEvent.change(input, { target: { value: "Learn React" } });
    fireEvent.click(addButton);

    expect(screen.getByText("Learn React")).toBeInTheDocument();
  });

  // 概要: Todoを追加した後、入力フィールドがクリアされることを確認
  // 目的: UXの向上とユーザーが連続してTodoを追加できることを保証
  it("clears input after adding todo", () => {
    render(<TodoApp />);
    const input = screen.getByPlaceholderText(
      "新しいタスクを入力",
    ) as HTMLInputElement;
    const addButton = screen.getByRole("button", { name: "追加" });

    fireEvent.change(input, { target: { value: "Learn React" } });
    fireEvent.click(addButton);

    expect(input.value).toBe("");
  });

  // 概要: Todoの完了状態を切り替えられることを確認
  // 目的: Todo完了機能が正しく動作することを保証
  it("toggles todo completion status", () => {
    render(<TodoApp />);
    const input = screen.getByPlaceholderText("新しいタスクを入力");
    const addButton = screen.getByRole("button", { name: "追加" });

    fireEvent.change(input, { target: { value: "Learn React" } });
    fireEvent.click(addButton);

    // Todo項目のcheckboxを特定（data-testidなどで区別）
    const todoCheckboxes = screen.getAllByRole("checkbox");
    const todoCheckbox = todoCheckboxes.find(
      (checkbox) =>
        checkbox.getAttribute("data-indeterminate") === "false" &&
        checkbox.tabIndex === -1,
    );

    expect(todoCheckbox).not.toBeChecked();

    fireEvent.click(todoCheckbox!);
    expect(todoCheckbox).toBeChecked();
  });

  // 概要: 削除ボタンをクリックしたときにTodoが削除されることを確認
  // 目的: Todo削除機能が正しく動作することを保証
  it("deletes todo when delete button is clicked", () => {
    render(<TodoApp />);
    const input = screen.getByPlaceholderText("新しいタスクを入力");
    const addButton = screen.getByRole("button", { name: "追加" });

    fireEvent.change(input, { target: { value: "Learn React" } });
    fireEvent.click(addButton);

    expect(screen.getByText("Learn React")).toBeInTheDocument();

    const deleteButton = screen.getByLabelText(/delete/i);
    fireEvent.click(deleteButton);

    expect(screen.queryByText("Learn React")).not.toBeInTheDocument();
  });

  // 概要: 空のTodoが追加されないことを確認
  // 目的: バリデーション機能が正しく動作し、無効なデータの登録を防ぐことを保証
  it("does not add empty todo", () => {
    render(<TodoApp />);
    const addButton = screen.getByRole("button", { name: "追加" });

    fireEvent.click(addButton);

    // FilterBarのSwitchではなく、Todo項目のcheckboxがないことを確認
    const todoCheckboxes = screen.getAllByRole("checkbox");
    const todoCheckbox = todoCheckboxes.find(
      (checkbox) =>
        checkbox.getAttribute("data-indeterminate") === "false" &&
        checkbox.tabIndex === -1,
    );
    expect(todoCheckbox).toBeUndefined();
  });

  // 概要: フィルターバーが表示されることを確認
  // 目的: フィルター機能のUIが正しく統合されていることを保証
  it("renders filter bar", () => {
    render(<TodoApp />);

    // 完了状態フィルター
    expect(
      screen.getByRole("group", { name: /完了状態/i }),
    ).toBeInTheDocument();

    // カテゴリフィルター（FilterBar内の）
    const categoryFilterElements = screen.getAllByLabelText("カテゴリ");
    expect(categoryFilterElements.length).toBeGreaterThan(0);

    // タグフィルター
    expect(screen.getByRole("combobox", { name: /タグ/i })).toBeInTheDocument();

    // 検索フィルター
    expect(screen.getByLabelText(/検索/i)).toBeInTheDocument();

    // リセットボタン
    expect(screen.getByText("リセット")).toBeInTheDocument();
  });

  // 概要: 完了状態フィルターが機能することを確認
  // 目的: 完了状態によるTodoの絞り込みが正しく動作することを保証
  it("filters todos by completion status", async () => {
    render(<TodoApp />);
    const input = screen.getByPlaceholderText("新しいタスクを入力");
    const addButton = screen.getByRole("button", { name: "追加" });

    // 2つのTodoを追加
    fireEvent.change(input, { target: { value: "Task 1" } });
    fireEvent.click(addButton);
    fireEvent.change(input, { target: { value: "Task 2" } });
    fireEvent.click(addButton);

    // 1つ目を完了にする
    const todoCheckboxes = screen.getAllByRole("checkbox");
    const todoCheckbox = todoCheckboxes.find(
      (checkbox) =>
        checkbox.getAttribute("data-indeterminate") === "false" &&
        checkbox.tabIndex === -1,
    );
    fireEvent.click(todoCheckbox!);

    // 完了済みフィルターを選択
    const completedButton = screen.getByLabelText("完了済み");
    fireEvent.click(completedButton);

    await waitFor(() => {
      expect(screen.getByText("Task 1")).toBeInTheDocument();
      expect(screen.queryByText("Task 2")).not.toBeInTheDocument();
    });
  });

  // 概要: 検索フィルターが機能することを確認
  // 目的: テキスト検索によるTodoの絞り込みが正しく動作することを保証
  it("filters todos by search text", async () => {
    render(<TodoApp />);
    const input = screen.getByPlaceholderText("新しいタスクを入力");
    const addButton = screen.getByRole("button", { name: "追加" });

    // 2つのTodoを追加
    fireEvent.change(input, { target: { value: "Learn React" } });
    fireEvent.click(addButton);
    fireEvent.change(input, { target: { value: "Learn Vue" } });
    fireEvent.click(addButton);

    // 検索フィルターを入力
    const searchInput = screen.getByLabelText(/検索/i);
    fireEvent.change(searchInput, { target: { value: "React" } });

    await waitFor(() => {
      expect(screen.getByText("Learn React")).toBeInTheDocument();
      expect(screen.queryByText("Learn Vue")).not.toBeInTheDocument();
    });
  });

  // 概要: フィルターリセット機能が動作することを確認
  // 目的: 全てのフィルターが初期状態に戻ることを保証
  it("resets filters when reset button is clicked", async () => {
    render(<TodoApp />);
    const input = screen.getByPlaceholderText("新しいタスクを入力");
    const addButton = screen.getByRole("button", { name: "追加" });

    // Todoを追加
    fireEvent.change(input, { target: { value: "Test Task" } });
    fireEvent.click(addButton);

    // 検索フィルターを適用
    const searchInput = screen.getByLabelText(/検索/i);
    fireEvent.change(searchInput, { target: { value: "nonexistent" } });

    await waitFor(() => {
      expect(screen.queryByText("Test Task")).not.toBeInTheDocument();
    });

    // リセットボタンをクリック
    const resetButton = screen.getByText("リセット");
    fireEvent.click(resetButton);

    await waitFor(() => {
      expect(screen.getByText("Test Task")).toBeInTheDocument();
      expect(searchInput).toHaveValue("");
    });
  });

  // 概要: Todoの編集機能が正常に動作することを確認
  // 目的: ユーザーが既存のTodoを編集できることを保証
  it("allows editing todo text", async () => {
    render(<TodoApp />);
    const input = screen.getByPlaceholderText("新しいタスクを入力");
    const addButton = screen.getByRole("button", { name: "追加" });

    // Todoを追加
    fireEvent.change(input, { target: { value: "Original Task" } });
    fireEvent.click(addButton);

    // 編集ボタンをクリック
    const editButton = screen.getByRole("button", { name: /edit/i });
    fireEvent.click(editButton);

    // テキストを変更
    const editInput = screen.getByDisplayValue("Original Task");
    fireEvent.change(editInput, { target: { value: "Updated Task" } });

    // 保存ボタンをクリック
    const saveButton = screen.getByRole("button", { name: /保存|save/i });
    fireEvent.click(saveButton);

    // 更新されたテキストが表示されることを確認
    await waitFor(() => {
      expect(screen.getByText("Updated Task")).toBeInTheDocument();
      expect(screen.queryByText("Original Task")).not.toBeInTheDocument();
    });
  });

  // 概要: Todo編集のキャンセル機能が正常に動作することを確認
  // 目的: ユーザーが編集を取り消せることを保証
  it("allows canceling todo edit", async () => {
    render(<TodoApp />);
    const input = screen.getByPlaceholderText("新しいタスクを入力");
    const addButton = screen.getByRole("button", { name: "追加" });

    // Todoを追加
    fireEvent.change(input, { target: { value: "Original Task" } });
    fireEvent.click(addButton);

    // 編集ボタンをクリック
    const editButton = screen.getByRole("button", { name: /edit/i });
    fireEvent.click(editButton);

    // テキストを変更
    const editInput = screen.getByDisplayValue("Original Task");
    fireEvent.change(editInput, { target: { value: "Updated Task" } });

    // キャンセルボタンをクリック
    const cancelButton = screen.getByRole("button", {
      name: /キャンセル|cancel/i,
    });
    fireEvent.click(cancelButton);

    // 元のテキストが表示されることを確認
    await waitFor(() => {
      expect(screen.getByText("Original Task")).toBeInTheDocument();
      expect(screen.queryByText("Updated Task")).not.toBeInTheDocument();
    });
  });

  // 概要: ダブルクリックでTodo編集モードに入ることを確認
  // 目的: ユーザビリティを向上させる直感的な編集操作が機能することを保証
  it("allows editing todo by double click", async () => {
    render(<TodoApp />);
    const input = screen.getByPlaceholderText("新しいタスクを入力");
    const addButton = screen.getByRole("button", { name: "追加" });

    // Todoを追加
    fireEvent.change(input, { target: { value: "Double Click Task" } });
    fireEvent.click(addButton);

    // Todoテキストをダブルクリック
    const todoText = screen.getByText("Double Click Task");
    fireEvent.doubleClick(todoText);

    // 編集フィールドが表示されることを確認
    await waitFor(() => {
      expect(screen.getByDisplayValue("Double Click Task")).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /保存|save/i }),
      ).toBeInTheDocument();
    });
  });
});
