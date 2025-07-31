import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { TodoApp } from './TodoApp'

describe('TodoApp', () => {
  // 概要: アプリケーションのタイトルが正しく表示されることを確認
  // 目的: UIの基本構造が正しくレンダリングされることを保証
  it('renders todo app title', () => {
    render(<TodoApp />)
    expect(screen.getByRole('heading', { name: /todo app/i })).toBeInTheDocument()
  })

  // 概要: 新しいTodoを入力するためのフィールドが表示されることを確認
  // 目的: ユーザーがTodoを入力できるUIが提供されていることを保証
  it('renders input field for new todo', () => {
    render(<TodoApp />)
    expect(screen.getByPlaceholderText(/add new todo/i)).toBeInTheDocument()
  })

  // 概要: Todoを追加するためのボタンが表示されることを確認
  // 目的: ユーザーがTodoを追加するアクションを実行できることを保証
  it('renders add button', () => {
    render(<TodoApp />)
    expect(screen.getByRole('button', { name: /add/i })).toBeInTheDocument()
  })

  // 概要: フォームが送信されたときに新しいTodoが追加されることを確認
  // 目的: Todo追加機能の基本動作が正しく実装されていることを保証
  it('adds new todo when form is submitted', () => {
    render(<TodoApp />)
    const input = screen.getByPlaceholderText(/add new todo/i)
    const addButton = screen.getByRole('button', { name: /add/i })

    fireEvent.change(input, { target: { value: 'Learn React' } })
    fireEvent.click(addButton)

    expect(screen.getByText('Learn React')).toBeInTheDocument()
  })

  // 概要: Todoを追加した後、入力フィールドがクリアされることを確認
  // 目的: UXの向上とユーザーが連続してTodoを追加できることを保証
  it('clears input after adding todo', () => {
    render(<TodoApp />)
    const input = screen.getByPlaceholderText(/add new todo/i) as HTMLInputElement
    const addButton = screen.getByRole('button', { name: /add/i })

    fireEvent.change(input, { target: { value: 'Learn React' } })
    fireEvent.click(addButton)

    expect(input.value).toBe('')
  })

  // 概要: Todoの完了状態を切り替えられることを確認
  // 目的: Todo完了機能が正しく動作することを保証
  it('toggles todo completion status', () => {
    render(<TodoApp />)
    const input = screen.getByPlaceholderText(/add new todo/i)
    const addButton = screen.getByRole('button', { name: /add/i })

    fireEvent.change(input, { target: { value: 'Learn React' } })
    fireEvent.click(addButton)

    const checkbox = screen.getByRole('checkbox')
    expect(checkbox).not.toBeChecked()

    fireEvent.click(checkbox)
    expect(checkbox).toBeChecked()
  })

  // 概要: 削除ボタンをクリックしたときにTodoが削除されることを確認
  // 目的: Todo削除機能が正しく動作することを保証
  it('deletes todo when delete button is clicked', () => {
    render(<TodoApp />)
    const input = screen.getByPlaceholderText(/add new todo/i)
    const addButton = screen.getByRole('button', { name: /add/i })

    fireEvent.change(input, { target: { value: 'Learn React' } })
    fireEvent.click(addButton)

    expect(screen.getByText('Learn React')).toBeInTheDocument()

    const deleteButton = screen.getByRole('button', { name: /delete/i })
    fireEvent.click(deleteButton)

    expect(screen.queryByText('Learn React')).not.toBeInTheDocument()
  })

  // 概要: 空のTodoが追加されないことを確認
  // 目的: バリデーション機能が正しく動作し、無効なデータの登録を防ぐことを保証
  it('does not add empty todo', () => {
    render(<TodoApp />)
    const addButton = screen.getByRole('button', { name: /add/i })

    fireEvent.click(addButton)

    expect(screen.queryByRole('checkbox')).not.toBeInTheDocument()
  })
})