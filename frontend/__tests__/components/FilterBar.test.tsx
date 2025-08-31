import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { FilterBar } from "../../src/components/FilterBar";
import type { FilterState } from "../../src/types/filter";
import type { Category } from "../../src/types/category";

const mockCategories: Category[] = [
  { id: "work", name: "仕事", color: "#1976d2" },
  { id: "personal", name: "プライベート", color: "#ff5722" },
  { id: "other", name: "その他", color: "#9e9e9e" },
];

const mockAvailableTags = ["urgent", "shopping", "learning", "meeting"];

const defaultFilters: FilterState = {
  completionStatus: "all",
  categoryIds: [],
  tags: [],
  tagCondition: "any",
  searchText: "",
};

describe("FilterBar", () => {
  // 概要: フィルターバーの基本UI要素が表示されることを確認
  // 目的: 全てのフィルター操作UI要素が適切にレンダリングされることを保証
  it("renders all filter UI elements", () => {
    const mockOnFiltersChange = vi.fn();
    const mockOnReset = vi.fn();

    render(
      <FilterBar
        filters={defaultFilters}
        onFiltersChange={mockOnFiltersChange}
        onReset={mockOnReset}
        categories={mockCategories}
        availableTags={mockAvailableTags}
        activeFilterCount={0}
      />,
    );

    // 完了状態フィルター
    expect(
      screen.getByRole("group", { name: /完了状態/i }),
    ).toBeInTheDocument();

    // カテゴリフィルター
    expect(screen.getByLabelText(/カテゴリ/i)).toBeInTheDocument();

    // タグフィルター
    expect(screen.getByRole("combobox", { name: /タグ/i })).toBeInTheDocument();

    // 検索フィルター
    expect(screen.getByLabelText(/検索/i)).toBeInTheDocument();

    // リセットボタン
    expect(
      screen.getByRole("button", { name: /リセット/i }),
    ).toBeInTheDocument();
  });

  // 概要: 完了状態フィルターの変更時にコールバックが呼ばれることを確認
  // 目的: 完了状態切り替えUIが正しく動作することを保証
  it("calls onFiltersChange when completion status changes", () => {
    const mockOnFiltersChange = vi.fn();
    const mockOnReset = vi.fn();

    render(
      <FilterBar
        filters={defaultFilters}
        onFiltersChange={mockOnFiltersChange}
        onReset={mockOnReset}
        categories={mockCategories}
        availableTags={mockAvailableTags}
        activeFilterCount={0}
      />,
    );

    const completedButton = screen.getByRole("button", { name: /完了済み/i });
    fireEvent.click(completedButton);

    expect(mockOnFiltersChange).toHaveBeenCalledWith({
      completionStatus: "completed",
    });
  });

  // 概要: カテゴリフィルターの変更時にコールバックが呼ばれることを確認
  // 目的: カテゴリ選択UIが正しく動作することを保証
  it("calls onFiltersChange when category changes", async () => {
    const mockOnFiltersChange = vi.fn();
    const mockOnReset = vi.fn();

    render(
      <FilterBar
        filters={defaultFilters}
        onFiltersChange={mockOnFiltersChange}
        onReset={mockOnReset}
        categories={mockCategories}
        availableTags={mockAvailableTags}
        activeFilterCount={0}
      />,
    );

    const categorySelect = screen.getByLabelText(/カテゴリ/i);
    fireEvent.mouseDown(categorySelect);

    await waitFor(() => {
      const workOption = screen.getByText("仕事");
      fireEvent.click(workOption);
    });

    expect(mockOnFiltersChange).toHaveBeenCalledWith({
      categoryIds: ["work"],
    });
  });

  // 概要: タグフィルターの変更時にコールバックが呼ばれることを確認
  // 目的: タグ選択UIが正しく動作することを保証
  it("calls onFiltersChange when tags change", async () => {
    const mockOnFiltersChange = vi.fn();
    const mockOnReset = vi.fn();

    render(
      <FilterBar
        filters={defaultFilters}
        onFiltersChange={mockOnFiltersChange}
        onReset={mockOnReset}
        categories={mockCategories}
        availableTags={mockAvailableTags}
        activeFilterCount={0}
      />,
    );

    const tagInput = screen.getByRole("combobox", { name: /タグ/i });

    // Autocompleteにフォーカスして入力を開始
    fireEvent.focus(tagInput);
    fireEvent.change(tagInput, { target: { value: "ur" } });

    await waitFor(() => {
      const urgentOption = screen.getByText("urgent");
      fireEvent.click(urgentOption);
    });

    expect(mockOnFiltersChange).toHaveBeenCalledWith({
      tags: ["urgent"],
    });
  });

  // 概要: 検索フィルターの変更時にコールバックが呼ばれることを確認
  // 目的: 検索入力UIが正しく動作することを保証
  it("calls onFiltersChange when search text changes", () => {
    const mockOnFiltersChange = vi.fn();
    const mockOnReset = vi.fn();

    render(
      <FilterBar
        filters={defaultFilters}
        onFiltersChange={mockOnFiltersChange}
        onReset={mockOnReset}
        categories={mockCategories}
        availableTags={mockAvailableTags}
        activeFilterCount={0}
      />,
    );

    const searchInput = screen.getByLabelText(/検索/i);
    fireEvent.change(searchInput, { target: { value: "test search" } });

    expect(mockOnFiltersChange).toHaveBeenCalledWith({
      searchText: "test search",
    });
  });

  // 概要: タグ条件切り替えの動作確認
  // 目的: AND/OR条件の切り替えUIが正しく動作することを保証
  it("allows switching tag condition between any and all", () => {
    const mockOnFiltersChange = vi.fn();
    const mockOnReset = vi.fn();

    render(
      <FilterBar
        filters={defaultFilters}
        onFiltersChange={mockOnFiltersChange}
        onReset={mockOnReset}
        categories={mockCategories}
        availableTags={mockAvailableTags}
        activeFilterCount={0}
      />,
    );

    const tagConditionToggle = screen.getByLabelText(/タグ条件/i);
    fireEvent.click(tagConditionToggle);

    expect(mockOnFiltersChange).toHaveBeenCalledWith({
      tagCondition: "all",
    });
  });

  // 概要: リセットボタンの動作確認
  // 目的: フィルターリセット機能が正しく動作することを保証
  it("calls onReset when reset button is clicked", () => {
    const mockOnFiltersChange = vi.fn();
    const mockOnReset = vi.fn();

    render(
      <FilterBar
        filters={defaultFilters}
        onFiltersChange={mockOnFiltersChange}
        onReset={mockOnReset}
        categories={mockCategories}
        availableTags={mockAvailableTags}
        activeFilterCount={3}
      />,
    );

    const resetButton = screen.getByRole("button", { name: /リセット/i });
    fireEvent.click(resetButton);

    expect(mockOnReset).toHaveBeenCalled();
  });

  // 概要: アクティブフィルター数の表示確認
  // 目的: 現在適用されているフィルター数が視覚的に表示されることを保証
  it("displays active filter count", () => {
    const mockOnFiltersChange = vi.fn();
    const mockOnReset = vi.fn();

    render(
      <FilterBar
        filters={defaultFilters}
        onFiltersChange={mockOnFiltersChange}
        onReset={mockOnReset}
        categories={mockCategories}
        availableTags={mockAvailableTags}
        activeFilterCount={3}
      />,
    );

    expect(screen.getByText("3")).toBeInTheDocument();
  });

  // 概要: アクティブフィルターがない場合のバッジ非表示確認
  // 目的: フィルターが設定されていない時に不要な表示がされないことを保証
  it("does not display badge when no active filters", () => {
    const mockOnFiltersChange = vi.fn();
    const mockOnReset = vi.fn();

    render(
      <FilterBar
        filters={defaultFilters}
        onFiltersChange={mockOnFiltersChange}
        onReset={mockOnReset}
        categories={mockCategories}
        availableTags={mockAvailableTags}
        activeFilterCount={0}
      />,
    );

    const badge = screen.queryByText("0");
    expect(badge).not.toBeInTheDocument();
  });

  // 概要: 現在のフィルター値の表示確認
  // 目的: 設定済みフィルターが適切にUIに反映されることを保証
  it("displays current filter values", () => {
    const activeFilters: FilterState = {
      completionStatus: "completed",
      categoryIds: ["work"],
      tags: ["urgent"],
      tagCondition: "all",
      searchText: "test",
    };

    const mockOnFiltersChange = vi.fn();
    const mockOnReset = vi.fn();

    render(
      <FilterBar
        filters={activeFilters}
        onFiltersChange={mockOnFiltersChange}
        onReset={mockOnReset}
        categories={mockCategories}
        availableTags={mockAvailableTags}
        activeFilterCount={4}
      />,
    );

    // 完了済みが選択されている
    const completedButton = screen.getByRole("button", { name: /完了済み/i });
    expect(completedButton).toHaveAttribute("aria-pressed", "true");

    // 検索テキストが入力されている
    const searchInput = screen.getByDisplayValue("test");
    expect(searchInput).toBeInTheDocument();
  });

  // 概要: 空のカテゴリリストの処理確認
  // 目的: データが不足している場合でもUIが正常に動作することを保証
  it("handles empty categories list", () => {
    const mockOnFiltersChange = vi.fn();
    const mockOnReset = vi.fn();

    render(
      <FilterBar
        filters={defaultFilters}
        onFiltersChange={mockOnFiltersChange}
        onReset={mockOnReset}
        categories={[]}
        availableTags={mockAvailableTags}
        activeFilterCount={0}
      />,
    );

    const categorySelect = screen.getByLabelText(/カテゴリ/i);
    expect(categorySelect).toBeInTheDocument();
  });

  // 概要: 空のタグリストの処理確認
  // 目的: データが不足している場合でもUIが正常に動作することを保証
  it("handles empty tags list", () => {
    const mockOnFiltersChange = vi.fn();
    const mockOnReset = vi.fn();

    render(
      <FilterBar
        filters={defaultFilters}
        onFiltersChange={mockOnFiltersChange}
        onReset={mockOnReset}
        categories={mockCategories}
        availableTags={[]}
        activeFilterCount={0}
      />,
    );

    const tagInput = screen.getByRole("combobox", { name: /タグ/i });
    expect(tagInput).toBeInTheDocument();
  });

  // 概要: アクセシビリティ対応の確認
  // 目的: 適切なaria-labelやroleが設定されていることを保証
  it("has proper accessibility attributes", () => {
    const mockOnFiltersChange = vi.fn();
    const mockOnReset = vi.fn();

    render(
      <FilterBar
        filters={defaultFilters}
        onFiltersChange={mockOnFiltersChange}
        onReset={mockOnReset}
        categories={mockCategories}
        availableTags={mockAvailableTags}
        activeFilterCount={0}
      />,
    );

    // 各フィルターにラベルが適切に設定されている
    expect(screen.getByLabelText(/カテゴリ/i)).toBeInTheDocument();
    expect(screen.getByRole("combobox", { name: /タグ/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/検索/i)).toBeInTheDocument();

    // 完了状態フィルターにgroup roleが設定されている
    expect(
      screen.getByRole("group", { name: /完了状態/i }),
    ).toBeInTheDocument();
  });
});
