import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { TodoItem } from '../../src/components/TodoItem'
import type { Todo } from '../../src/types/todo'
import type { Category } from '../../src/types/category'

const mockTodo: Todo = {
  id: '1',
  text: 'Test Todo',
  completed: false,
  createdAt: new Date('2023-01-01'),
  categoryId: undefined,
  tags: [],
  order: 0,
}

const mockCategories: Category[] = [
  { id: 'work', name: '仕事', color: '#1976d2' },
  { id: 'private', name: 'プライベート', color: '#ff5722' },
]

const mockTodoWithCategory: Todo = {
  id: '2',
  text: 'Work Todo',
  completed: false,
  createdAt: new Date('2023-01-01'),
  categoryId: 'work',
  tags: [],
  order: 1,
}

const mockTodoWithTags: Todo = {
  id: '3',
  text: 'Tagged Todo',
  completed: false,
  createdAt: new Date('2023-01-01'),
  categoryId: undefined,
  tags: ['重要', '急ぎ'],
  order: 2,
}

const mockTodoWithCategoryAndTags: Todo = {
  id: '4',
  text: 'Full Todo',
  completed: false,
  createdAt: new Date('2023-01-01'),
  categoryId: 'private',
  tags: ['買い物', '今日中'],
  order: 3,
}

describe('TodoItem', () => {
  // 概要: Todoのテキストが正しく表示されることを確認
  // 目的: TodoItemコンポーネントが基本的なデータを正しく表示することを保証
  it('renders todo text', () => {
    const mockOnToggle = vi.fn()
    const mockOnDelete = vi.fn()

    render(
      <TodoItem
        todo={mockTodo}
        onToggle={mockOnToggle}
        onDelete={mockOnDelete}
      />
    )

    expect(screen.getByText('Test Todo')).toBeInTheDocument()
  })

  // 概要: チェックボックスが正しい状態で表示されることを確認
  // 目的: Todo完了状態の視覚的フィードバックが正しく表示されることを保証
  it('renders checkbox with correct checked state', () => {
    const mockOnToggle = vi.fn()
    const mockOnDelete = vi.fn()

    render(
      <TodoItem
        todo={mockTodo}
        onToggle={mockOnToggle}
        onDelete={mockOnDelete}
      />
    )

    const checkbox = screen.getByRole('checkbox')
    expect(checkbox).not.toBeChecked()
  })

  // 概要: 完了済みTodoのチェックボックスがチェック状態で表示されることを確認
  // 目的: 完了済みTodoの視覚的状態が正しく反映されることを保証
  it('renders checked checkbox for completed todo', () => {
    const completedTodo = { ...mockTodo, completed: true }
    const mockOnToggle = vi.fn()
    const mockOnDelete = vi.fn()

    render(
      <TodoItem
        todo={completedTodo}
        onToggle={mockOnToggle}
        onDelete={mockOnDelete}
      />
    )

    const checkbox = screen.getByRole('checkbox')
    expect(checkbox).toBeChecked()
  })

  // 概要: チェックボックスクリック時にonToggleコールバックが呼ばれることを確認
  // 目的: TodoItemからの状態変更イベントが正しく親コンポーネントに伝達されることを保証
  it('calls onToggle when checkbox is clicked', () => {
    const mockOnToggle = vi.fn()
    const mockOnDelete = vi.fn()

    render(
      <TodoItem
        todo={mockTodo}
        onToggle={mockOnToggle}
        onDelete={mockOnDelete}
      />
    )

    const checkbox = screen.getByRole('checkbox')
    fireEvent.click(checkbox)

    expect(mockOnToggle).toHaveBeenCalledWith('1')
  })

  // 概要: 削除ボタンクリック時にonDeleteコールバックが呼ばれることを確認
  // 目的: TodoItemからの削除イベントが正しく親コンポーネントに伝達されることを保証
  it('calls onDelete when delete button is clicked', () => {
    const mockOnToggle = vi.fn()
    const mockOnDelete = vi.fn()

    render(
      <TodoItem
        todo={mockTodo}
        onToggle={mockOnToggle}
        onDelete={mockOnDelete}
      />
    )

    const deleteButton = screen.getByRole('button', { name: /delete/i })
    fireEvent.click(deleteButton)

    expect(mockOnDelete).toHaveBeenCalledWith('1')
  })

  // 概要: 完了済みTodoのテキストに取り消し線が適用されることを確認
  // 目的: 完了済みTodoの視覚的フィードバックが適切に提供されることを保証
  it('applies strikethrough style to completed todo text', () => {
    const completedTodo = { ...mockTodo, completed: true }
    const mockOnToggle = vi.fn()
    const mockOnDelete = vi.fn()

    render(
      <TodoItem
        todo={completedTodo}
        onToggle={mockOnToggle}
        onDelete={mockOnDelete}
      />
    )

    const todoText = screen.getByText('Test Todo')
    expect(todoText).toHaveStyle('text-decoration: line-through')
  })

  // 概要: カテゴリが設定されたTodoでカテゴリChipが表示されることを確認
  // 目的: カテゴリ情報が適切に視覚化されることを保証
  it('displays category chip when todo has category', () => {
    const mockOnToggle = vi.fn()
    const mockOnDelete = vi.fn()

    render(
      <TodoItem
        todo={mockTodoWithCategory}
        onToggle={mockOnToggle}
        onDelete={mockOnDelete}
        categories={mockCategories}
      />
    )

    const categoryChip = screen.getByText('仕事')
    expect(categoryChip).toBeInTheDocument()
  })

  // 概要: カテゴリが設定されていないTodoでカテゴリChipが表示されないことを確認
  // 目的: カテゴリなしのTodoで不要なUIが表示されないことを保証
  it('does not display category chip when todo has no category', () => {
    const mockOnToggle = vi.fn()
    const mockOnDelete = vi.fn()

    render(
      <TodoItem
        todo={mockTodo}
        onToggle={mockOnToggle}
        onDelete={mockOnDelete}
        categories={mockCategories}
      />
    )

    const categoryChip = screen.queryByText('仕事')
    expect(categoryChip).not.toBeInTheDocument()
  })

  // 概要: タグが設定されたTodoでタグChipが表示されることを確認
  // 目的: タグ情報が適切に視覚化されることを保証
  it('displays tag chips when todo has tags', () => {
    const mockOnToggle = vi.fn()
    const mockOnDelete = vi.fn()

    render(
      <TodoItem
        todo={mockTodoWithTags}
        onToggle={mockOnToggle}
        onDelete={mockOnDelete}
        categories={mockCategories}
      />
    )

    const importantTag = screen.getByText('重要')
    const urgentTag = screen.getByText('急ぎ')

    expect(importantTag).toBeInTheDocument()
    expect(urgentTag).toBeInTheDocument()
  })

  // 概要: タグが設定されていないTodoでタグChipが表示されないことを確認
  // 目的: タグなしのTodoで不要なUIが表示されないことを保証
  it('does not display tag chips when todo has no tags', () => {
    const mockOnToggle = vi.fn()
    const mockOnDelete = vi.fn()

    render(
      <TodoItem
        todo={mockTodo}
        onToggle={mockOnToggle}
        onDelete={mockOnDelete}
        categories={mockCategories}
      />
    )

    const tagContainer = screen.queryByTestId('tags-container')
    expect(tagContainer).not.toBeInTheDocument()
  })

  // 概要: カテゴリとタグの両方が設定されたTodoで両方が表示されることを確認
  // 目的: 複数の分類情報が適切に同時表示されることを保証
  it('displays both category and tag chips when todo has both', () => {
    const mockOnToggle = vi.fn()
    const mockOnDelete = vi.fn()

    render(
      <TodoItem
        todo={mockTodoWithCategoryAndTags}
        onToggle={mockOnToggle}
        onDelete={mockOnDelete}
        categories={mockCategories}
      />
    )

    const categoryChip = screen.getByText('プライベート')
    const shoppingTag = screen.getByText('買い物')
    const todayTag = screen.getByText('今日中')

    expect(categoryChip).toBeInTheDocument()
    expect(shoppingTag).toBeInTheDocument()
    expect(todayTag).toBeInTheDocument()
  })

  // 概要: 存在しないカテゴリIDの場合にエラーが発生しないことを確認
  // 目的: データの整合性が取れない場合でもアプリケーションが安定して動作することを保証
  it('handles invalid category id gracefully', () => {
    const todoWithInvalidCategory = { ...mockTodo, categoryId: 'invalid-id' }
    const mockOnToggle = vi.fn()
    const mockOnDelete = vi.fn()

    expect(() => {
      render(
        <TodoItem
          todo={todoWithInvalidCategory}
          onToggle={mockOnToggle}
          onDelete={mockOnDelete}
          categories={mockCategories}
        />
      )
    }).not.toThrow()

    // 無効なカテゴリIDの場合はカテゴリChipが表示されない
    const invalidCategoryChip = screen.queryByText('invalid-id')
    expect(invalidCategoryChip).not.toBeInTheDocument()
  })

  // 概要: 編集機能なしでも正常に動作することをテスト
  // 目的: onEditプロパティがない場合でも後方互換性を保つことを保証
  it('renders without edit functionality when onEdit is not provided', () => {
    const mockOnToggle = vi.fn()
    const mockOnDelete = vi.fn()

    render(
      <TodoItem
        todo={mockTodo}
        onToggle={mockOnToggle}
        onDelete={mockOnDelete}
      />
    )

    expect(screen.getByText('Test Todo')).toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: /編集|edit/i })
    ).not.toBeInTheDocument()
  })

  // 概要: onEditが提供された場合に編集ボタンが表示されることをテスト
  // 目的: 編集機能が有効な場合に適切なUIが表示されることを保証
  it('renders edit button when onEdit is provided', () => {
    const mockOnToggle = vi.fn()
    const mockOnDelete = vi.fn()
    const mockOnEdit = vi.fn()

    render(
      <TodoItem
        todo={mockTodo}
        onToggle={mockOnToggle}
        onDelete={mockOnDelete}
        onEdit={mockOnEdit}
      />
    )

    expect(screen.getByRole('button', { name: /edit/i })).toBeInTheDocument()
  })
})
