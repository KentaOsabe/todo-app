import { describe, it, expect } from 'vitest'
import type { EditTodoData } from '../../src/types/todo'

describe('EditTodoData type', () => {
  // 概要: EditTodoDataインターフェースの基本構造をテスト
  // 目的: 型定義が期待通りのフィールドを持つことを保証
  it('has correct structure with required text field', () => {
    const editData: EditTodoData = {
      text: 'Test text',
      tags: ['tag1', 'tag2'],
    }

    expect(editData.text).toBe('Test text')
    expect(editData.tags).toEqual(['tag1', 'tag2'])
    expect(editData.categoryId).toBeUndefined()
  })

  // 概要: categoryIdがオプショナルであることをテスト
  // 目的: categoryIdフィールドが省略可能であることを保証
  it('allows optional categoryId field', () => {
    const editDataWithCategory: EditTodoData = {
      text: 'Test text',
      categoryId: 'cat1',
      tags: [],
    }

    const editDataWithoutCategory: EditTodoData = {
      text: 'Test text',
      tags: [],
    }

    expect(editDataWithCategory.categoryId).toBe('cat1')
    expect(editDataWithoutCategory.categoryId).toBeUndefined()
  })

  // 概要: tagsフィールドが配列であることをテスト
  // 目的: tagsフィールドが適切な型（string[]）であることを保証
  it('enforces tags as string array', () => {
    const editData: EditTodoData = {
      text: 'Test text',
      tags: [],
    }

    editData.tags.push('new tag')
    expect(editData.tags).toContain('new tag')
    expect(Array.isArray(editData.tags)).toBe(true)
  })

  // 概要: textフィールドが必須であることをテスト
  // 目的: textフィールドが省略できないことを保証
  it('requires text field', () => {
    // TypeScriptコンパイル時エラーになることを期待
    // 以下のコードはコンパイルエラーになるべき：
    // const invalidEditData: EditTodoData = { tags: [] }

    const validEditData: EditTodoData = {
      text: '',
      tags: [],
    }

    expect(validEditData.text).toBeDefined()
    expect(typeof validEditData.text).toBe('string')
  })

  // 概要: 完全なEditTodoDataオブジェクトの作成テスト
  // 目的: 全てのフィールドを含むオブジェクトが正しく作成できることを保証
  it('creates complete EditTodoData object', () => {
    const completeEditData: EditTodoData = {
      text: 'Complete task description',
      categoryId: 'work',
      tags: ['urgent', 'important', 'today'],
    }

    expect(completeEditData.text).toBe('Complete task description')
    expect(completeEditData.categoryId).toBe('work')
    expect(completeEditData.tags).toEqual(['urgent', 'important', 'today'])
  })
})
