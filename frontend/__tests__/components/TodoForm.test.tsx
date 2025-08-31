import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { TodoForm } from "../../src/components/TodoForm";
import type { Category } from "../../src/types/category";

const mockCategories: Category[] = [
  { id: "work", name: "仕事", color: "#1976d2" },
  { id: "private", name: "プライベート", color: "#ff5722" },
  { id: "other", name: "その他", color: "#9e9e9e" },
];

describe("TodoForm", () => {
  // 概要: Todoテキスト入力フィールドが表示されることを確認
  // 目的: 基本的な入力UIが正しく表示されることを保証
  it("renders todo text input field", () => {
    const mockOnSubmit = vi.fn();

    render(<TodoForm onSubmit={mockOnSubmit} categories={mockCategories} />);

    const textInput = screen.getByPlaceholderText("新しいタスクを入力");
    expect(textInput).toBeInTheDocument();
  });

  // 概要: カテゴリ選択フィールドが表示されることを確認
  // 目的: カテゴリ選択UIが適切に表示されることを保証
  it("renders category selection field", () => {
    const mockOnSubmit = vi.fn();

    render(<TodoForm onSubmit={mockOnSubmit} categories={mockCategories} />);

    const categorySelect = screen.getByLabelText("カテゴリ");
    expect(categorySelect).toBeInTheDocument();
  });

  // 概要: タグ入力フィールドが表示されることを確認
  // 目的: タグ入力UIが適切に表示されることを保証
  it("renders tag input field", () => {
    const mockOnSubmit = vi.fn();

    render(<TodoForm onSubmit={mockOnSubmit} categories={mockCategories} />);

    const tagInput = screen.getByLabelText("タグ");
    expect(tagInput).toBeInTheDocument();
  });

  // 概要: 追加ボタンが表示されることを確認
  // 目的: フォーム送信ボタンが適切に表示されることを保証
  it("renders add button", () => {
    const mockOnSubmit = vi.fn();

    render(<TodoForm onSubmit={mockOnSubmit} categories={mockCategories} />);

    const addButton = screen.getByRole("button", { name: /追加/i });
    expect(addButton).toBeInTheDocument();
  });

  // 概要: テキストを入力してフォームを送信できることを確認
  // 目的: 基本的なTodo作成機能が動作することを保証
  it("submits form with text only", async () => {
    const mockOnSubmit = vi.fn();

    render(<TodoForm onSubmit={mockOnSubmit} categories={mockCategories} />);

    const textInput = screen.getByPlaceholderText("新しいタスクを入力");
    const addButton = screen.getByRole("button", { name: /追加/i });

    fireEvent.change(textInput, { target: { value: "テストタスク" } });
    fireEvent.click(addButton);

    expect(mockOnSubmit).toHaveBeenCalledWith({
      text: "テストタスク",
      categoryId: undefined,
      tags: [],
    });
  });

  // 概要: カテゴリを選択してフォームを送信できることを確認
  // 目的: カテゴリ付きTodo作成機能が動作することを保証
  it("submits form with category selected", async () => {
    const mockOnSubmit = vi.fn();

    render(<TodoForm onSubmit={mockOnSubmit} categories={mockCategories} />);

    const textInput = screen.getByPlaceholderText("新しいタスクを入力");
    const categorySelect = screen.getByLabelText("カテゴリ");
    const addButton = screen.getByRole("button", { name: /追加/i });

    fireEvent.change(textInput, { target: { value: "カテゴリ付きタスク" } });
    fireEvent.mouseDown(categorySelect);

    await waitFor(() => {
      const workOption = screen.getByText("仕事");
      fireEvent.click(workOption);
    });

    fireEvent.click(addButton);

    expect(mockOnSubmit).toHaveBeenCalledWith({
      text: "カテゴリ付きタスク",
      categoryId: "work",
      tags: [],
    });
  });

  // 概要: タグを入力してフォームを送信できることを確認
  // 目的: タグ付きTodo作成機能が動作することを保証
  it("submits form with tags", async () => {
    const mockOnSubmit = vi.fn();

    render(<TodoForm onSubmit={mockOnSubmit} categories={mockCategories} />);

    const textInput = screen.getByPlaceholderText("新しいタスクを入力");
    const tagInput = screen.getByLabelText("タグ");
    const addButton = screen.getByRole("button", { name: /追加/i });

    fireEvent.change(textInput, { target: { value: "タグ付きタスク" } });
    fireEvent.change(tagInput, { target: { value: "重要, 急ぎ" } });
    fireEvent.click(addButton);

    expect(mockOnSubmit).toHaveBeenCalledWith({
      text: "タグ付きタスク",
      categoryId: undefined,
      tags: ["重要", "急ぎ"],
    });
  });

  // 概要: カテゴリとタグの両方を設定してフォームを送信できることを確認
  // 目的: 完全なTodo作成機能が動作することを保証
  it("submits form with both category and tags", async () => {
    const mockOnSubmit = vi.fn();

    render(<TodoForm onSubmit={mockOnSubmit} categories={mockCategories} />);

    const textInput = screen.getByPlaceholderText("新しいタスクを入力");
    const categorySelect = screen.getByLabelText("カテゴリ");
    const tagInput = screen.getByLabelText("タグ");
    const addButton = screen.getByRole("button", { name: /追加/i });

    fireEvent.change(textInput, { target: { value: "完全なタスク" } });

    fireEvent.mouseDown(categorySelect);
    await waitFor(() => {
      const privateOption = screen.getByText("プライベート");
      fireEvent.click(privateOption);
    });

    fireEvent.change(tagInput, { target: { value: "買い物, 今日中" } });
    fireEvent.click(addButton);

    expect(mockOnSubmit).toHaveBeenCalledWith({
      text: "完全なタスク",
      categoryId: "private",
      tags: ["買い物", "今日中"],
    });
  });

  // 概要: 空のテキストでフォーム送信を試みてもコールバックが呼ばれないことを確認
  // 目的: 不正な入力での送信を防ぐことを保証
  it("does not submit form with empty text", () => {
    const mockOnSubmit = vi.fn();

    render(<TodoForm onSubmit={mockOnSubmit} categories={mockCategories} />);

    const addButton = screen.getByRole("button", { name: /追加/i });
    fireEvent.click(addButton);

    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  // 概要: フォーム送信後に入力フィールドがクリアされることを確認
  // 目的: ユーザーが連続してTodoを追加しやすくなることを保証
  it("clears form after successful submission", async () => {
    const mockOnSubmit = vi.fn();

    render(<TodoForm onSubmit={mockOnSubmit} categories={mockCategories} />);

    const textInput = screen.getByPlaceholderText(
      "新しいタスクを入力",
    ) as HTMLInputElement;
    const tagInput = screen.getByLabelText("タグ") as HTMLInputElement;
    const addButton = screen.getByRole("button", { name: /追加/i });

    fireEvent.change(textInput, { target: { value: "テストタスク" } });
    fireEvent.change(tagInput, { target: { value: "タグ1, タグ2" } });
    fireEvent.click(addButton);

    await waitFor(() => {
      expect(textInput.value).toBe("");
      expect(tagInput.value).toBe("");
    });
  });

  // 概要: カテゴリが空の配列の場合でもフォームが正常に動作することを確認
  // 目的: データの欠如時でもアプリケーションが安定動作することを保証
  it("works with empty categories array", () => {
    const mockOnSubmit = vi.fn();

    render(<TodoForm onSubmit={mockOnSubmit} categories={[]} />);

    const textInput = screen.getByPlaceholderText("新しいタスクを入力");
    expect(textInput).toBeInTheDocument();

    const categorySelect = screen.getByLabelText("カテゴリ");
    expect(categorySelect).toBeInTheDocument();
  });

  // 概要: Enterキーでフォームを送信できることを確認
  // 目的: キーボードショートカットでの送信が動作することを保証
  it("submits form when Enter is pressed in text field", () => {
    const mockOnSubmit = vi.fn();

    render(<TodoForm onSubmit={mockOnSubmit} categories={mockCategories} />);

    const textInput = screen.getByPlaceholderText("新しいタスクを入力");

    fireEvent.change(textInput, { target: { value: "Enterテスト" } });
    fireEvent.keyPress(textInput, {
      key: "Enter",
      code: "Enter",
      charCode: 13,
    });

    expect(mockOnSubmit).toHaveBeenCalledWith({
      text: "Enterテスト",
      categoryId: undefined,
      tags: [],
    });
  });
});
