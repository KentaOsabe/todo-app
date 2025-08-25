import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import '@testing-library/jest-dom'
import { DndContext } from '@dnd-kit/core'
import type { Todo } from '../../src/types/todo'
import type { Category } from '../../src/types/category'
import { SortableTodoItem } from '../../src/components/SortableTodoItem'

describe('SortableTodoItem', () => {
  const mockTodo: Todo = {
    id: '1',
    text: 'Test todo',
    completed: false,
    createdAt: new Date('2023-01-01'),
    categoryId: 'category1',
    tags: ['tag1'],
    order: 0,
  }

  const mockCategories: Category[] = [
    { id: 'category1', name: 'Work', color: '#1976d2' },
  ]

  const mockOnToggle = vi.fn()
  const mockOnDelete = vi.fn()
  const mockOnEdit = vi.fn()

  const renderWithDndContext = (component: React.ReactElement) => {
    return render(<DndContext>{component}</DndContext>)
  }

  // 概要: SortableTodoItemが正しくレンダリングされることをテスト
  // 目的: コンポーネントが基本的な要素（TodoItem、ドラッグハンドル）を含むことを保証
  it('renders todo item with drag handle', () => {
    renderWithDndContext(
      <SortableTodoItem
        todo={mockTodo}
        onToggle={mockOnToggle}
        onDelete={mockOnDelete}
        categories={mockCategories}
      />
    )

    expect(screen.getByText('Test todo')).toBeInTheDocument()
    expect(screen.getByLabelText('Drag to reorder')).toBeInTheDocument()
  })

  // 概要: ドラッグハンドルがデフォルトで非表示になっていることをテスト
  // 目的: UIの初期状態でドラッグハンドルが目立たないことを保証
  it('has drag handle hidden by default', () => {
    renderWithDndContext(
      <SortableTodoItem
        todo={mockTodo}
        onToggle={mockOnToggle}
        onDelete={mockOnDelete}
        categories={mockCategories}
      />
    )

    const dragHandle = screen.getByLabelText('Drag to reorder')
    expect(dragHandle).toHaveStyle({ opacity: 0 })
  })

  // 概要: TodoItemコンポーネントが適切なpropsで呼び出されることをテスト
  // 目的: SortableTodoItemがTodoItemを正しくラップしていることを保証
  it('passes correct props to TodoItem', () => {
    renderWithDndContext(
      <SortableTodoItem
        todo={mockTodo}
        onToggle={mockOnToggle}
        onDelete={mockOnDelete}
        categories={mockCategories}
      />
    )

    // TodoItemの内容が表示されることを確認
    expect(screen.getByText('Test todo')).toBeInTheDocument()
    // カテゴリが表示されることを確認
    expect(screen.getByText('Work')).toBeInTheDocument()
  })

  // 概要: onEditプロパティがTodoItemに正しく渡されることをテスト
  // 目的: 編集機能がSortableTodoItem経由でも正常に動作することを保証
  it('passes onEdit prop to TodoItem when provided', () => {
    renderWithDndContext(
      <SortableTodoItem
        todo={mockTodo}
        onToggle={mockOnToggle}
        onDelete={mockOnDelete}
        onEdit={mockOnEdit}
        categories={mockCategories}
      />
    )

    // 編集ボタンが表示されることを確認（TodoItemが正しくonEditを受け取っている証拠）
    expect(screen.getByRole('button', { name: /edit/i })).toBeInTheDocument()
  })

  // 概要: onEditが提供されない場合の動作をテスト
  // 目的: 編集機能が無効な場合でも正常に動作することを保証
  it('works correctly when onEdit is not provided', () => {
    renderWithDndContext(
      <SortableTodoItem
        todo={mockTodo}
        onToggle={mockOnToggle}
        onDelete={mockOnDelete}
        categories={mockCategories}
      />
    )

    // 編集ボタンが表示されないことを確認
    expect(
      screen.queryByRole('button', { name: /edit/i })
    ).not.toBeInTheDocument()
  })
})
