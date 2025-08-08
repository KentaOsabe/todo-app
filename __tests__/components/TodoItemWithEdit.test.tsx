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
  categoryId: 'cat1',
  tags: ['tag1', 'tag2'],
  order: 0,
}

const mockCategories: Category[] = [
  { id: 'cat1', name: '仕事', color: '#2196f3' },
  { id: 'cat2', name: '個人', color: '#4caf50' },
]

describe('TodoItem with Edit functionality', () => {
  // 概要: 編集ボタンが表示されることをテスト
  // 目的: TodoItemに編集ボタンが正しく表示されることを保証
  it('renders edit button', () => {
    const onToggle = vi.fn()
    const onDelete = vi.fn()
    const onEdit = vi.fn()

    render(
      <TodoItem
        todo={mockTodo}
        onToggle={onToggle}
        onDelete={onDelete}
        onEdit={onEdit}
        categories={mockCategories}
      />
    )

    const editButton = screen.getByRole('button', { name: /編集|edit/i })
    expect(editButton).toBeInTheDocument()
  })

  // 概要: 編集ボタンクリックで編集モードに入ることをテスト
  // 目的: 編集ボタンをクリックした際に編集フォームが表示されることを保証
  it('enters edit mode when edit button is clicked', () => {
    const onToggle = vi.fn()
    const onDelete = vi.fn()
    const onEdit = vi.fn()

    render(
      <TodoItem
        todo={mockTodo}
        onToggle={onToggle}
        onDelete={onDelete}
        onEdit={onEdit}
        categories={mockCategories}
      />
    )

    const editButton = screen.getByRole('button', { name: /編集|edit/i })
    fireEvent.click(editButton)

    // 編集モードでは保存・キャンセルボタンが表示される
    expect(
      screen.getByRole('button', { name: /保存|save/i })
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: /キャンセル|cancel/i })
    ).toBeInTheDocument()
  })

  // 概要: ダブルクリックで編集モードに入ることをテスト
  // 目的: TodoItemをダブルクリックした際に編集フォームが表示されることを保証
  it('enters edit mode when double-clicked', () => {
    const onToggle = vi.fn()
    const onDelete = vi.fn()
    const onEdit = vi.fn()

    render(
      <TodoItem
        todo={mockTodo}
        onToggle={onToggle}
        onDelete={onDelete}
        onEdit={onEdit}
        categories={mockCategories}
      />
    )

    const todoText = screen.getByText('Test Todo')
    fireEvent.doubleClick(todoText)

    // 編集モードでは保存・キャンセルボタンが表示される
    expect(
      screen.getByRole('button', { name: /保存|save/i })
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: /キャンセル|cancel/i })
    ).toBeInTheDocument()
  })

  // 概要: 編集モードでテキストが編集フィールドに表示されることをテスト
  // 目的: 編集モードに入った際に現在のTodoテキストが編集フィールドに表示されることを保証
  it('shows todo text in edit field when in edit mode', () => {
    const onToggle = vi.fn()
    const onDelete = vi.fn()
    const onEdit = vi.fn()

    render(
      <TodoItem
        todo={mockTodo}
        onToggle={onToggle}
        onDelete={onDelete}
        onEdit={onEdit}
        categories={mockCategories}
      />
    )

    const editButton = screen.getByRole('button', { name: /編集|edit/i })
    fireEvent.click(editButton)

    expect(screen.getByDisplayValue('Test Todo')).toBeInTheDocument()
  })

  // 概要: 編集保存でonEditが呼ばれることをテスト
  // 目的: 編集内容を保存した際にonEditコールバックが正しいデータで呼ばれることを保証
  it('calls onEdit when edit is saved', () => {
    const onToggle = vi.fn()
    const onDelete = vi.fn()
    const onEdit = vi.fn()

    render(
      <TodoItem
        todo={mockTodo}
        onToggle={onToggle}
        onDelete={onDelete}
        onEdit={onEdit}
        categories={mockCategories}
      />
    )

    // 編集モードに入る
    const editButton = screen.getByRole('button', { name: /編集|edit/i })
    fireEvent.click(editButton)

    // テキストを変更
    const textInput = screen.getByDisplayValue('Test Todo')
    fireEvent.change(textInput, { target: { value: 'Updated Todo' } })

    // 保存ボタンをクリック
    const saveButton = screen.getByRole('button', { name: /保存|save/i })
    fireEvent.click(saveButton)

    expect(onEdit).toHaveBeenCalledWith('1', {
      text: 'Updated Todo',
      categoryId: 'cat1',
      tags: ['tag1', 'tag2'],
    })
  })

  // 概要: 編集キャンセルで元の表示に戻ることをテスト
  // 目的: 編集をキャンセルした際に元のTodoアイテム表示に戻ることを保証
  it('returns to normal view when edit is cancelled', () => {
    const onToggle = vi.fn()
    const onDelete = vi.fn()
    const onEdit = vi.fn()

    render(
      <TodoItem
        todo={mockTodo}
        onToggle={onToggle}
        onDelete={onDelete}
        onEdit={onEdit}
        categories={mockCategories}
      />
    )

    // 編集モードに入る
    const editButton = screen.getByRole('button', { name: /編集|edit/i })
    fireEvent.click(editButton)

    // テキストを変更
    const textInput = screen.getByDisplayValue('Test Todo')
    fireEvent.change(textInput, { target: { value: 'Updated Todo' } })

    // キャンセルボタンをクリック
    const cancelButton = screen.getByRole('button', {
      name: /キャンセル|cancel/i,
    })
    fireEvent.click(cancelButton)

    // 元のテキストが表示されている
    expect(screen.getByText('Test Todo')).toBeInTheDocument()
    // 編集ボタンが再び表示されている
    expect(
      screen.getByRole('button', { name: /編集|edit/i })
    ).toBeInTheDocument()
    // onEditは呼ばれていない
    expect(onEdit).not.toHaveBeenCalled()
  })

  // 概要: Enterキーで編集保存されることをテスト
  // 目的: 編集フィールドでEnterキーを押した際に編集内容が保存されることを保証
  it('saves edit when Enter key is pressed', () => {
    const onToggle = vi.fn()
    const onDelete = vi.fn()
    const onEdit = vi.fn()

    render(
      <TodoItem
        todo={mockTodo}
        onToggle={onToggle}
        onDelete={onDelete}
        onEdit={onEdit}
        categories={mockCategories}
      />
    )

    // 編集モードに入る
    const editButton = screen.getByRole('button', { name: /編集|edit/i })
    fireEvent.click(editButton)

    // テキストを変更してEnterキーを押す
    const textInput = screen.getByDisplayValue('Test Todo')
    fireEvent.change(textInput, { target: { value: 'Enter saved Todo' } })
    fireEvent.keyPress(textInput, { key: 'Enter', code: 'Enter', charCode: 13 })

    expect(onEdit).toHaveBeenCalledWith('1', {
      text: 'Enter saved Todo',
      categoryId: 'cat1',
      tags: ['tag1', 'tag2'],
    })
  })

  // 概要: Escapeキーで編集キャンセルされることをテスト
  // 目的: 編集フィールドでEscapeキーを押した際に編集がキャンセルされることを保証
  it('cancels edit when Escape key is pressed', () => {
    const onToggle = vi.fn()
    const onDelete = vi.fn()
    const onEdit = vi.fn()

    render(
      <TodoItem
        todo={mockTodo}
        onToggle={onToggle}
        onDelete={onDelete}
        onEdit={onEdit}
        categories={mockCategories}
      />
    )

    // 編集モードに入る
    const editButton = screen.getByRole('button', { name: /編集|edit/i })
    fireEvent.click(editButton)

    // テキストを変更してEscapeキーを押す
    const textInput = screen.getByDisplayValue('Test Todo')
    fireEvent.change(textInput, { target: { value: 'Escape cancelled Todo' } })
    fireEvent.keyDown(textInput, { key: 'Escape', code: 'Escape' })

    // 元のテキストが表示されている
    expect(screen.getByText('Test Todo')).toBeInTheDocument()
    // onEditは呼ばれていない
    expect(onEdit).not.toHaveBeenCalled()
  })

  // 概要: 編集モードでは削除ボタンが非表示になることをテスト
  // 目的: 編集中は誤削除を防ぐため削除ボタンが非表示になることを保証
  it('hides delete button in edit mode', () => {
    const onToggle = vi.fn()
    const onDelete = vi.fn()
    const onEdit = vi.fn()

    render(
      <TodoItem
        todo={mockTodo}
        onToggle={onToggle}
        onDelete={onDelete}
        onEdit={onEdit}
        categories={mockCategories}
      />
    )

    // 通常モードでは削除ボタンが表示されている
    expect(screen.getByRole('button', { name: /delete/i })).toBeInTheDocument()

    // 編集モードに入る
    const editButton = screen.getByRole('button', { name: /編集|edit/i })
    fireEvent.click(editButton)

    // 編集モードでは削除ボタンが非表示
    expect(
      screen.queryByRole('button', { name: /delete/i })
    ).not.toBeInTheDocument()
  })
})
