import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { TodoItem } from './TodoItem'
import type { Todo } from '../types/todo'

const mockTodo: Todo = {
  id: '1',
  text: 'Test Todo',
  completed: false,
  createdAt: new Date('2023-01-01')
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
})