import { describe, it, expect, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import type { Todo } from "../../src/types/todo";
import { useFilters } from "../../src/hooks/useFilters";

const mockTodos: Todo[] = [
  {
    id: "1",
    text: "Buy groceries",
    completed: false,
    createdAt: new Date("2025-01-01"),
    categoryId: "personal",
    tags: ["shopping", "urgent"],
  },
  {
    id: "2",
    text: "Fix bug in application",
    completed: true,
    createdAt: new Date("2025-01-02"),
    categoryId: "work",
    tags: ["development", "urgent"],
  },
  {
    id: "3",
    text: "Read book",
    completed: false,
    createdAt: new Date("2025-01-03"),
    categoryId: "personal",
    tags: ["learning"],
  },
  {
    id: "4",
    text: "Team meeting preparation",
    completed: true,
    createdAt: new Date("2025-01-04"),
    categoryId: "work",
    tags: ["meeting", "preparation"],
  },
];

describe("useFilters", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  // 概要: 初期状態でフィルター機能の動作を確認
  // 目的: フックが正しく初期化され、全てのTodoが表示されることを保証
  it("初期状態では全てのTodoが表示される", () => {
    const { result } = renderHook(() => useFilters(mockTodos));

    expect(result.current.filters.completionStatus).toBe("all");
    expect(result.current.filters.categoryIds).toEqual([]);
    expect(result.current.filters.tags).toEqual([]);
    expect(result.current.filters.tagCondition).toBe("any");
    expect(result.current.filters.searchText).toBe("");
    expect(result.current.filteredTodos).toEqual(mockTodos);
    expect(result.current.activeFilterCount).toBe(0);
  });

  // 概要: 完了状態フィルターの動作確認
  // 目的: 完了済みのTodoのみが正しくフィルタリングされることを保証
  it("完了状態でフィルタリングできる", () => {
    const { result } = renderHook(() => useFilters(mockTodos));

    act(() => {
      result.current.updateFilters({ completionStatus: "completed" });
    });

    expect(result.current.filteredTodos).toHaveLength(2);
    expect(result.current.filteredTodos.every((todo) => todo.completed)).toBe(
      true,
    );
    expect(result.current.activeFilterCount).toBe(1);
  });

  // 概要: 未完了状態フィルターの動作確認
  // 目的: 未完了のTodoのみが正しくフィルタリングされることを保証
  it("未完了状態でフィルタリングできる", () => {
    const { result } = renderHook(() => useFilters(mockTodos));

    act(() => {
      result.current.updateFilters({ completionStatus: "incomplete" });
    });

    expect(result.current.filteredTodos).toHaveLength(2);
    expect(result.current.filteredTodos.every((todo) => !todo.completed)).toBe(
      true,
    );
    expect(result.current.activeFilterCount).toBe(1);
  });

  // 概要: カテゴリフィルターの動作確認
  // 目的: 指定したカテゴリのTodoのみが正しくフィルタリングされることを保証
  it("カテゴリでフィルタリングできる", () => {
    const { result } = renderHook(() => useFilters(mockTodos));

    act(() => {
      result.current.updateFilters({ categoryIds: ["work"] });
    });

    expect(result.current.filteredTodos).toHaveLength(2);
    expect(
      result.current.filteredTodos.every((todo) => todo.categoryId === "work"),
    ).toBe(true);
    expect(result.current.activeFilterCount).toBe(1);
  });

  // 概要: タグフィルター（OR条件）の動作確認
  // 目的: 指定したタグのいずれかを持つTodoが正しくフィルタリングされることを保証
  it("タグでフィルタリングできる（any条件）", () => {
    const { result } = renderHook(() => useFilters(mockTodos));

    act(() => {
      result.current.updateFilters({ tags: ["urgent"], tagCondition: "any" });
    });

    expect(result.current.filteredTodos).toHaveLength(2);
    expect(
      result.current.filteredTodos.every((todo) =>
        todo.tags.includes("urgent"),
      ),
    ).toBe(true);
    expect(result.current.activeFilterCount).toBe(1);
  });

  // 概要: タグフィルター（AND条件）の動作確認
  // 目的: 指定したタグを全て持つTodoが正しくフィルタリングされることを保証
  it("タグでフィルタリングできる（all条件）", () => {
    const { result } = renderHook(() => useFilters(mockTodos));

    act(() => {
      result.current.updateFilters({
        tags: ["urgent", "shopping"],
        tagCondition: "all",
      });
    });

    expect(result.current.filteredTodos).toHaveLength(1);
    expect(result.current.filteredTodos[0].id).toBe("1");
    expect(result.current.activeFilterCount).toBe(1);
  });

  // 概要: テキスト検索フィルターの動作確認
  // 目的: 指定したテキストを含むTodoが正しくフィルタリングされることを保証
  it("テキスト検索でフィルタリングできる", () => {
    const { result } = renderHook(() => useFilters(mockTodos));

    act(() => {
      result.current.updateFilters({ searchText: "bug" });
    });

    expect(result.current.filteredTodos).toHaveLength(1);
    expect(result.current.filteredTodos[0].text).toContain("bug");
    expect(result.current.activeFilterCount).toBe(1);
  });

  // 概要: 複数フィルターの組み合わせ動作確認
  // 目的: 複数の条件を同時に適用したフィルタリングが正しく動作することを保証
  it("複数フィルターの組み合わせが可能", () => {
    const { result } = renderHook(() => useFilters(mockTodos));

    act(() => {
      result.current.updateFilters({
        completionStatus: "incomplete",
        categoryIds: ["personal"],
      });
    });

    expect(result.current.filteredTodos).toHaveLength(2);
    expect(
      result.current.filteredTodos.every(
        (todo) => !todo.completed && todo.categoryId === "personal",
      ),
    ).toBe(true);
    expect(result.current.activeFilterCount).toBe(2);
  });

  // 概要: フィルターリセット機能の動作確認
  // 目的: reupdateFilters関数が全てのフィルターを初期状態に戻すことを保証
  it("フィルターをリセットできる", () => {
    const { result } = renderHook(() => useFilters(mockTodos));

    act(() => {
      result.current.updateFilters({
        completionStatus: "completed",
        categoryIds: ["work"],
        searchText: "test",
      });
    });

    expect(result.current.activeFilterCount).toBe(3);

    act(() => {
      result.current.resetFilters();
    });

    expect(result.current.filters.completionStatus).toBe("all");
    expect(result.current.filters.categoryIds).toEqual([]);
    expect(result.current.filters.searchText).toBe("");
    expect(result.current.filteredTodos).toEqual(mockTodos);
    expect(result.current.activeFilterCount).toBe(0);
  });

  // 概要: フィルター状態の永続化機能の動作確認
  // 目的: フィルター設定がlocalStorageに正しく保存されることを保証
  it("フィルター状態がlocalStorageに保存される", () => {
    const { result } = renderHook(() => useFilters(mockTodos));

    act(() => {
      result.current.updateFilters({ completionStatus: "completed" });
    });

    const savedFilters = JSON.parse(
      localStorage.getItem("todoFilters") || "{}",
    );
    expect(savedFilters.completionStatus).toBe("completed");
  });

  // 概要: 永続化されたフィルター状態の復元機能の動作確認
  // 目的: localStorageから保存されたフィルター設定が正しく復元されることを保証
  it("localStorageから保存されたフィルター状態を復元する", () => {
    const savedFilters = {
      completionStatus: "completed",
      categoryIds: ["work"],
      tags: [],
      tagCondition: "any",
      searchText: "",
    };
    localStorage.setItem("todoFilters", JSON.stringify(savedFilters));

    const { result } = renderHook(() => useFilters(mockTodos));

    expect(result.current.filters.completionStatus).toBe("completed");
    expect(result.current.filters.categoryIds).toEqual(["work"]);
    expect(result.current.filteredTodos).toHaveLength(2);
    expect(
      result.current.filteredTodos.every(
        (todo) => todo.completed && todo.categoryId === "work",
      ),
    ).toBe(true);
  });
});
