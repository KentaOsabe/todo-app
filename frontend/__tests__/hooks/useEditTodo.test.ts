import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { useEditTodo } from "../../src/hooks/useEditTodo";
import type { Todo, EditTodoData } from "../../src/types/todo";

const mockTodo: Todo = {
  id: "1",
  text: "Test todo",
  completed: false,
  createdAt: new Date("2024-01-01"),
  categoryId: "cat1",
  tags: ["tag1", "tag2"],
  order: 0,
};

describe("useEditTodo", () => {
  // 概要: useEditTodoフックの初期状態をテスト
  // 目的: フックが編集状態でない状態で初期化されることを保証
  it("initializes with correct default state", () => {
    const onEdit = vi.fn();
    const { result } = renderHook(() => useEditTodo(mockTodo, onEdit));

    expect(result.current.isEditing).toBe(false);
    expect(result.current.editData).toEqual({
      text: mockTodo.text,
      categoryId: mockTodo.categoryId,
      tags: mockTodo.tags,
    });
  });

  // 概要: 編集開始機能をテスト
  // 目的: startEdit関数が編集状態を正しくtrueに設定することを保証
  it("enters edit mode when startEdit is called", () => {
    const onEdit = vi.fn();
    const { result } = renderHook(() => useEditTodo(mockTodo, onEdit));

    act(() => {
      result.current.startEdit();
    });

    expect(result.current.isEditing).toBe(true);
  });

  // 概要: 編集キャンセル機能をテスト
  // 目的: cancelEdit関数が編集状態を正しくfalseに設定し、データをリセットすることを保証
  it("cancels edit mode and resets data when cancelEdit is called", () => {
    const onEdit = vi.fn();
    const { result } = renderHook(() => useEditTodo(mockTodo, onEdit));

    act(() => {
      result.current.startEdit();
    });

    act(() => {
      result.current.updateEditData({ text: "Modified text" });
    });

    act(() => {
      result.current.cancelEdit();
    });

    expect(result.current.isEditing).toBe(false);
    expect(result.current.editData.text).toBe(mockTodo.text);
  });

  // 概要: 編集データ更新機能をテスト
  // 目的: updateEditData関数が編集データを正しく更新することを保証
  it("updates edit data when updateEditData is called", () => {
    const onEdit = vi.fn();
    const { result } = renderHook(() => useEditTodo(mockTodo, onEdit));

    const newData: Partial<EditTodoData> = {
      text: "Updated text",
      tags: ["newtag"],
    };

    act(() => {
      result.current.updateEditData(newData);
    });

    expect(result.current.editData.text).toBe("Updated text");
    expect(result.current.editData.tags).toEqual(["newtag"]);
    expect(result.current.editData.categoryId).toBe(mockTodo.categoryId);
  });

  // 概要: 編集保存機能をテスト
  // 目的: saveEdit関数がonEdit callbackを呼び出し、編集モードを終了することを保証
  it("saves edit data and exits edit mode when saveEdit is called", () => {
    const onEdit = vi.fn();
    const { result } = renderHook(() => useEditTodo(mockTodo, onEdit));

    act(() => {
      result.current.startEdit();
    });

    const updatedData: Partial<EditTodoData> = {
      text: "Saved text",
    };

    act(() => {
      result.current.updateEditData(updatedData);
    });

    act(() => {
      result.current.saveEdit();
    });

    expect(onEdit).toHaveBeenCalledWith(mockTodo.id, {
      text: "Saved text",
      categoryId: mockTodo.categoryId,
      tags: mockTodo.tags,
    });
    expect(result.current.isEditing).toBe(false);
  });

  // 概要: 空のテキストでの保存防止をテスト
  // 目的: 空またはwhitespaceのみのテキストでsaveEditが呼ばれた際に保存されないことを保証
  it("does not save when text is empty or only whitespace", () => {
    const onEdit = vi.fn();
    const { result } = renderHook(() => useEditTodo(mockTodo, onEdit));

    act(() => {
      result.current.startEdit();
    });

    act(() => {
      result.current.updateEditData({ text: "   " });
    });

    act(() => {
      result.current.saveEdit();
    });

    expect(onEdit).not.toHaveBeenCalled();
    expect(result.current.isEditing).toBe(true);

    act(() => {
      result.current.updateEditData({ text: "" });
    });

    act(() => {
      result.current.saveEdit();
    });

    expect(onEdit).not.toHaveBeenCalled();
    expect(result.current.isEditing).toBe(true);
  });
});
