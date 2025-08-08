import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { TodoEditForm } from '../../src/components/TodoEditForm'
import type { EditTodoData } from '../../src/types/todo'
import type { Category } from '../../src/types/category'

const mockCategories: Category[] = [
  { id: 'cat1', name: '仕事', color: '#2196f3' },
  { id: 'cat2', name: '個人', color: '#4caf50' },
]

const mockEditData: EditTodoData = {
  text: 'Edit this todo',
  categoryId: 'cat1',
  tags: ['tag1', 'tag2'],
}

describe('TodoEditForm', () => {
  // 概要: TodoEditFormコンポーネントの初期表示をテスト
  // 目的: 初期データが正しくフォームフィールドに表示されることを保証
  it('renders with initial edit data', () => {
    const onSave = vi.fn()
    const onCancel = vi.fn()

    render(
      <TodoEditForm
        editData={mockEditData}
        categories={mockCategories}
        onSave={onSave}
        onCancel={onCancel}
        onUpdateData={vi.fn()}
      />
    )

    expect(screen.getByDisplayValue('Edit this todo')).toBeInTheDocument()
    expect(screen.getByDisplayValue('tag1, tag2')).toBeInTheDocument()
    expect(screen.getByText('仕事')).toBeInTheDocument()
  })

  // 概要: テキスト入力の変更をテスト
  // 目的: テキストフィールドの変更がonUpdateDataコールバックを呼び出すことを保証
  it('calls onUpdateData when text input changes', () => {
    const onUpdateData = vi.fn()
    const onSave = vi.fn()
    const onCancel = vi.fn()

    render(
      <TodoEditForm
        editData={mockEditData}
        categories={mockCategories}
        onSave={onSave}
        onCancel={onCancel}
        onUpdateData={onUpdateData}
      />
    )

    const textInput = screen.getByDisplayValue('Edit this todo')
    fireEvent.change(textInput, { target: { value: 'Updated todo text' } })

    expect(onUpdateData).toHaveBeenCalledWith({ text: 'Updated todo text' })
  })

  // 概要: カテゴリ選択の変更をテスト
  // 目的: カテゴリセレクトの変更がonUpdateDataコールバックを呼び出すことを保証
  it('calls onUpdateData when category selection changes', () => {
    const onUpdateData = vi.fn()
    const onSave = vi.fn()
    const onCancel = vi.fn()

    render(
      <TodoEditForm
        editData={mockEditData}
        categories={mockCategories}
        onSave={onSave}
        onCancel={onCancel}
        onUpdateData={onUpdateData}
      />
    )

    const categorySelect = screen.getByRole('combobox', { name: /カテゴリ/i })
    fireEvent.mouseDown(categorySelect)

    const personalOption = screen.getByRole('option', { name: '個人' })
    fireEvent.click(personalOption)

    expect(onUpdateData).toHaveBeenCalledWith({ categoryId: 'cat2' })
  })

  // 概要: タグ入力の変更をテスト
  // 目的: タグフィールドの変更がonUpdateDataコールバックを呼び出すことを保証
  it('calls onUpdateData when tags input changes', () => {
    const onUpdateData = vi.fn()
    const onSave = vi.fn()
    const onCancel = vi.fn()

    render(
      <TodoEditForm
        editData={mockEditData}
        categories={mockCategories}
        onSave={onSave}
        onCancel={onCancel}
        onUpdateData={onUpdateData}
      />
    )

    const tagsInput = screen.getByDisplayValue('tag1, tag2')
    fireEvent.change(tagsInput, {
      target: { value: 'newtag1, newtag2, newtag3' },
    })

    expect(onUpdateData).toHaveBeenCalledWith({
      tags: ['newtag1', 'newtag2', 'newtag3'],
    })
  })

  // 概要: 保存ボタンのクリックをテスト
  // 目的: 保存ボタンがクリックされた際にonSaveコールバックが呼ばれることを保証
  it('calls onSave when save button is clicked', () => {
    const onSave = vi.fn()
    const onCancel = vi.fn()

    render(
      <TodoEditForm
        editData={mockEditData}
        categories={mockCategories}
        onSave={onSave}
        onCancel={onCancel}
        onUpdateData={vi.fn()}
      />
    )

    const saveButton = screen.getByRole('button', { name: /保存|save/i })
    fireEvent.click(saveButton)

    expect(onSave).toHaveBeenCalled()
  })

  // 概要: キャンセルボタンのクリックをテスト
  // 目的: キャンセルボタンがクリックされた際にonCancelコールバックが呼ばれることを保証
  it('calls onCancel when cancel button is clicked', () => {
    const onCancel = vi.fn()
    const onSave = vi.fn()

    render(
      <TodoEditForm
        editData={mockEditData}
        categories={mockCategories}
        onSave={onSave}
        onCancel={onCancel}
        onUpdateData={vi.fn()}
      />
    )

    const cancelButton = screen.getByRole('button', {
      name: /キャンセル|cancel/i,
    })
    fireEvent.click(cancelButton)

    expect(onCancel).toHaveBeenCalled()
  })

  // 概要: Enterキーでの保存をテスト
  // 目的: テキストフィールドでEnterキーを押した際にonSaveが呼ばれることを保証
  it('calls onSave when Enter key is pressed in text field', () => {
    const onSave = vi.fn()
    const onCancel = vi.fn()

    render(
      <TodoEditForm
        editData={mockEditData}
        categories={mockCategories}
        onSave={onSave}
        onCancel={onCancel}
        onUpdateData={vi.fn()}
      />
    )

    const textInput = screen.getByDisplayValue('Edit this todo')
    fireEvent.keyPress(textInput, { key: 'Enter', code: 'Enter', charCode: 13 })

    expect(onSave).toHaveBeenCalled()
  })

  // 概要: Escapeキーでのキャンセルをテスト
  // 目的: Escapeキーを押した際にonCancelが呼ばれることを保証
  it('calls onCancel when Escape key is pressed', () => {
    const onCancel = vi.fn()
    const onSave = vi.fn()

    render(
      <TodoEditForm
        editData={mockEditData}
        categories={mockCategories}
        onSave={onSave}
        onCancel={onCancel}
        onUpdateData={vi.fn()}
      />
    )

    const textInput = screen.getByDisplayValue('Edit this todo')
    fireEvent.keyDown(textInput, { key: 'Escape', code: 'Escape' })

    expect(onCancel).toHaveBeenCalled()
  })

  // 概要: カテゴリなしの選択をテスト
  // 目的: カテゴリを「なし」に変更した際にcategoryIdがundefinedになることを保証
  it('handles "none" category selection', () => {
    const onUpdateData = vi.fn()
    const onSave = vi.fn()
    const onCancel = vi.fn()

    render(
      <TodoEditForm
        editData={mockEditData}
        categories={mockCategories}
        onSave={onSave}
        onCancel={onCancel}
        onUpdateData={onUpdateData}
      />
    )

    const categorySelect = screen.getByRole('combobox', { name: /カテゴリ/i })
    fireEvent.mouseDown(categorySelect)

    const noneOption = screen.getByRole('option', { name: 'なし' })
    fireEvent.click(noneOption)

    expect(onUpdateData).toHaveBeenCalledWith({ categoryId: undefined })
  })

  // 概要: フォーカス管理をテスト
  // 目的: コンポーネントがマウントされた際にテキストフィールドにフォーカスが当たることを保証
  it('focuses on text input when component mounts', () => {
    const onSave = vi.fn()
    const onCancel = vi.fn()

    render(
      <TodoEditForm
        editData={mockEditData}
        categories={mockCategories}
        onSave={onSave}
        onCancel={onCancel}
        onUpdateData={vi.fn()}
      />
    )

    const textInput = screen.getByDisplayValue('Edit this todo')
    expect(textInput).toHaveFocus()
  })
})
