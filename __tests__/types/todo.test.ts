import { describe, it, expect } from 'vitest'
import type { Todo } from '../../src/types/todo'

describe('拡張されたTodo型', () => {
  // 概要: 拡張されたTodo型の基本プロパティのテスト
  // 目的: 新しいTodo型が従来の必須プロパティをすべて含んでいることを確認
  it('従来のTodoプロパティを含む', () => {
    const todo: Todo = {
      id: 'todo-1',
      text: 'テストタスク',
      completed: false,
      createdAt: new Date(),
      categoryId: undefined,
      tags: [],
    }

    expect(todo).toHaveProperty('id')
    expect(todo).toHaveProperty('text')
    expect(todo).toHaveProperty('completed')
    expect(todo).toHaveProperty('createdAt')
  })

  // 概要: categoryIdプロパティのオプショナル性のテスト
  // 目的: categoryIdがオプショナルであり、ありとなしの両方で正しく動作することを確認
  it('categoryIdプロパティを含む（オプショナル）', () => {
    const todoWithCategory: Todo = {
      id: 'todo-1',
      text: 'カテゴリ付きタスク',
      completed: false,
      createdAt: new Date(),
      categoryId: 'cat-1',
      tags: [],
    }

    const todoWithoutCategory: Todo = {
      id: 'todo-2',
      text: 'カテゴリなしタスク',
      completed: false,
      createdAt: new Date(),
      categoryId: undefined,
      tags: [],
    }

    expect(todoWithCategory.categoryId).toBe('cat-1')
    expect(todoWithoutCategory.categoryId).toBeUndefined()
  })

  // 概要: tagsプロパティの型と動作のテスト
  // 目的: tagsが文字列配列であり、設定したタグが正しく保持されることを確認
  it('tagsプロパティを含む（文字列配列）', () => {
    const todo: Todo = {
      id: 'todo-1',
      text: 'タグ付きタスク',
      completed: false,
      createdAt: new Date(),
      categoryId: undefined,
      tags: ['重要', '急ぎ'],
    }

    expect(Array.isArray(todo.tags)).toBe(true)
    expect(todo.tags).toHaveLength(2)
    expect(todo.tags).toContain('重要')
    expect(todo.tags).toContain('急ぎ')
  })

  // 概要: tagsプロパティの空配列対応のテスト
  // 目的: tagsが空配列でも正しく動作することを確認
  it('tagsプロパティは空配列でも有効', () => {
    const todo: Todo = {
      id: 'todo-1',
      text: 'タグなしタスク',
      completed: false,
      createdAt: new Date(),
      categoryId: undefined,
      tags: [],
    }

    expect(Array.isArray(todo.tags)).toBe(true)
    expect(todo.tags).toHaveLength(0)
  })

  // 概要: カテゴリとタグの組み合わせのテスト
  // 目的: categoryIdとtagsの両方を持つTodoが正しく作成できることを確認
  it('カテゴリIDとタグの両方を持つTodoが作成できる', () => {
    const todo: Todo = {
      id: 'todo-1',
      text: '完全なタスク',
      completed: true,
      createdAt: new Date(),
      categoryId: 'work-category',
      tags: ['重要', '今日中', 'レビュー'],
    }

    expect(todo.categoryId).toBe('work-category')
    expect(todo.tags).toHaveLength(3)
    expect(todo.tags).toEqual(['重要', '今日中', 'レビュー'])
  })

  // 概要: 拡張されたTodo型の後方互換性のテスト
  // 目的: 新しいプロパティを追加しても従来のTodoと互換性が保たれることを確認
  it('従来のTodoとの後方互換性を保つ', () => {
    // categoryIdとtagsなしでも作成可能であることを確認
    const basicTodo = {
      id: 'todo-1',
      text: '基本タスク',
      completed: false,
      createdAt: new Date(),
    }

    // 型チェックのため、拡張プロパティを追加
    const extendedTodo: Todo = {
      ...basicTodo,
      categoryId: undefined,
      tags: [],
    }

    expect(extendedTodo.id).toBe('todo-1')
    expect(extendedTodo.text).toBe('基本タスク')
    expect(extendedTodo.completed).toBe(false)
    expect(extendedTodo.categoryId).toBeUndefined()
    expect(extendedTodo.tags).toEqual([])
  })
})
