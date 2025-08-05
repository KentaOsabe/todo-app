import { describe, it, expect } from 'vitest'
import type { Todo } from '../../src/types/todo'
import type { FilterState } from '../../src/types/filter'
import {
  filterByCompletion,
  filterByCategories,
  filterByTags,
  filterBySearch,
  applyFilters,
  getActiveFilterCount
} from '../../src/utils/filterLogic'

const mockTodos: Todo[] = [
  {
    id: '1',
    text: 'Buy groceries',
    completed: false,
    createdAt: new Date('2025-01-01'),
    categoryId: 'personal',
    tags: ['shopping', 'urgent']
  },
  {
    id: '2',
    text: 'Fix bug in APPLICATION',
    completed: true,
    createdAt: new Date('2025-01-02'),
    categoryId: 'work',
    tags: ['development', 'urgent']
  },
  {
    id: '3',
    text: 'Read book',
    completed: false,
    createdAt: new Date('2025-01-03'),
    categoryId: 'personal',
    tags: ['learning']
  },
  {
    id: '4',
    text: 'Team meeting preparation',
    completed: true,
    createdAt: new Date('2025-01-04'),
    categoryId: 'work',
    tags: ['meeting', 'preparation']
  },
  {
    id: '5',
    text: 'No category todo',
    completed: false,
    createdAt: new Date('2025-01-05'),
    categoryId: undefined,
    tags: []
  }
]

describe('filterLogic', () => {
  describe('filterByCompletion', () => {
    // 概要: 全ての状態で全Todoが返されることを確認
    // 目的: 'all'指定時にフィルタリングが行われないことを保証
    it('returns all todos when status is "all"', () => {
      const result = filterByCompletion(mockTodos, 'all')
      expect(result).toEqual(mockTodos)
    })

    // 概要: 完了済みTodoのみが返されることを確認
    // 目的: 'completed'指定時に完了済みTodoのみが正しくフィルタリングされることを保証
    it('returns only completed todos when status is "completed"', () => {
      const result = filterByCompletion(mockTodos, 'completed')
      expect(result).toHaveLength(2)
      expect(result.every(todo => todo.completed)).toBe(true)
    })

    // 概要: 未完了Todoのみが返されることを確認
    // 目的: 'incomplete'指定時に未完了Todoのみが正しくフィルタリングされることを保証
    it('returns only incomplete todos when status is "incomplete"', () => {
      const result = filterByCompletion(mockTodos, 'incomplete')
      expect(result).toHaveLength(3)
      expect(result.every(todo => !todo.completed)).toBe(true)
    })

    // 概要: 空配列に対する処理の確認
    // 目的: エッジケースでもエラーが発生しないことを保証
    it('handles empty array', () => {
      const result = filterByCompletion([], 'completed')
      expect(result).toEqual([])
    })
  })

  describe('filterByCategories', () => {
    // 概要: 空のカテゴリIDリストで全Todoが返されることを確認
    // 目的: カテゴリフィルターが無効時に全Todoが表示されることを保証
    it('returns all todos when category ids is empty', () => {
      const result = filterByCategories(mockTodos, [])
      expect(result).toEqual(mockTodos)
    })

    // 概要: 指定カテゴリのTodoのみが返されることを確認
    // 目的: 単一カテゴリでのフィルタリングが正しく動作することを保証
    it('returns todos with specified category', () => {
      const result = filterByCategories(mockTodos, ['work'])
      expect(result).toHaveLength(2)
      expect(result.every(todo => todo.categoryId === 'work')).toBe(true)
    })

    // 概要: 複数カテゴリでのフィルタリング確認
    // 目的: 複数カテゴリ指定時にOR条件でフィルタリングされることを保証
    it('returns todos with any of specified categories', () => {
      const result = filterByCategories(mockTodos, ['work', 'personal'])
      expect(result).toHaveLength(4)
      expect(result.every(todo => ['work', 'personal'].includes(todo.categoryId || ''))).toBe(true)
    })

    // 概要: カテゴリ未設定Todoの処理確認
    // 目的: categoryIdがundefinedのTodoが適切に処理されることを保証
    it('excludes todos without category when filtering by category', () => {
      const result = filterByCategories(mockTodos, ['personal'])
      expect(result).toHaveLength(2)
      expect(result.find(todo => todo.id === '5')).toBeUndefined()
    })
  })

  describe('filterByTags', () => {
    // 概要: 空のタグリストで全Todoが返されることを確認
    // 目的: タグフィルターが無効時に全Todoが表示されることを保証
    it('returns all todos when tags is empty', () => {
      const result = filterByTags(mockTodos, [], 'any')
      expect(result).toEqual(mockTodos)
    })

    // 概要: OR条件でのタグフィルタリング確認
    // 目的: 'any'指定時に指定タグのいずれかを持つTodoが返されることを保証
    it('returns todos with any of specified tags (OR condition)', () => {
      const result = filterByTags(mockTodos, ['urgent'], 'any')
      expect(result).toHaveLength(2)
      expect(result.every(todo => todo.tags.includes('urgent'))).toBe(true)
    })

    // 概要: AND条件でのタグフィルタリング確認
    // 目的: 'all'指定時に指定タグを全て持つTodoが返されることを保証
    it('returns todos with all specified tags (AND condition)', () => {
      const result = filterByTags(mockTodos, ['urgent', 'shopping'], 'all')
      expect(result).toHaveLength(1)
      expect(result[0].id).toBe('1')
    })

    // 概要: AND条件で該当なしの場合の確認
    // 目的: 全てのタグを持つTodoがない場合に空配列が返されることを保証
    it('returns empty array when no todos have all specified tags', () => {
      const result = filterByTags(mockTodos, ['urgent', 'nonexistent'], 'all')
      expect(result).toHaveLength(0)
    })

    // 概要: タグなしTodoの処理確認
    // 目的: tagsが空配列のTodoが適切に処理されることを保証
    it('excludes todos without tags when filtering by tags', () => {
      const result = filterByTags(mockTodos, ['learning'], 'any')
      expect(result).toHaveLength(1)
      expect(result[0].id).toBe('3')
    })
  })

  describe('filterBySearch', () => {
    // 概要: 空の検索文字列で全Todoが返されることを確認  
    // 目的: 検索フィルターが無効時に全Todoが表示されることを保証
    it('returns all todos when search text is empty', () => {
      const result = filterBySearch(mockTodos, '')
      expect(result).toEqual(mockTodos)
    })

    // 概要: 大文字小文字を区別しない検索の確認
    // 目的: 検索が大文字小文字を区別せずに動作することを保証
    it('performs case-insensitive search', () => {
      const result = filterBySearch(mockTodos, 'APPLICATION')
      expect(result).toHaveLength(1)
      expect(result[0].text).toContain('APPLICATION')
    })

    // 概要: 部分一致検索の確認
    // 目的: 部分文字列での検索が正しく動作することを保証
    it('performs partial text search', () => {
      const result = filterBySearch(mockTodos, 'bug')
      expect(result).toHaveLength(1)
      expect(result[0].text).toContain('bug')
    })

    // 概要: 該当なし検索の確認
    // 目的: 検索文字列に該当するTodoがない場合に空配列が返されることを保証
    it('returns empty array when no todos match search text', () => {
      const result = filterBySearch(mockTodos, 'nonexistent')
      expect(result).toHaveLength(0)
    })

    // 概要: 空白文字の処理確認
    // 目的: 空白のみの検索文字列が適切に処理されることを保証
    it('treats whitespace-only search as empty', () => {
      const result = filterBySearch(mockTodos, '   ')
      expect(result).toEqual(mockTodos)
    })
  })

  describe('applyFilters', () => {
    // 概要: デフォルトフィルターで全Todoが返されることを確認
    // 目的: 初期状態で全Todoが表示されることを保証
    it('returns all todos with default filters', () => {
      const filters: FilterState = {
        completionStatus: 'all',
        categoryIds: [],
        tags: [],
        tagCondition: 'any',
        searchText: ''
      }
      const result = applyFilters(mockTodos, filters)
      expect(result).toEqual(mockTodos)
    })

    // 概要: 複数フィルターの組み合わせ確認
    // 目的: 複数の条件を同時に適用したフィルタリングが正しく動作することを保証
    it('applies multiple filters correctly', () => {
      const filters: FilterState = {
        completionStatus: 'incomplete',
        categoryIds: ['personal'],
        tags: [],
        tagCondition: 'any',
        searchText: ''
      }
      const result = applyFilters(mockTodos, filters)
      expect(result).toHaveLength(2)
      expect(result.every(todo => !todo.completed && todo.categoryId === 'personal')).toBe(true)
    })

    // 概要: 全フィルター条件の組み合わせ確認
    // 目的: 全ての種類のフィルターを同時適用した場合の動作を保証
    it('applies all filter types together', () => {
      const filters: FilterState = {
        completionStatus: 'incomplete',
        categoryIds: ['personal'],
        tags: ['shopping'],
        tagCondition: 'any',
        searchText: 'Buy'
      }
      const result = applyFilters(mockTodos, filters)
      expect(result).toHaveLength(1)
      expect(result[0].id).toBe('1')
    })
  })

  describe('getActiveFilterCount', () => {
    // 概要: デフォルトフィルターでのカウント確認
    // 目的: 初期状態でアクティブフィルター数が0であることを保証
    it('returns 0 for default filters', () => {
      const filters: FilterState = {
        completionStatus: 'all',
        categoryIds: [],
        tags: [],
        tagCondition: 'any',
        searchText: ''
      }
      const count = getActiveFilterCount(filters)
      expect(count).toBe(0)
    })

    // 概要: 単一フィルターのカウント確認
    // 目的: 1つのフィルターが設定された時のカウントが正しいことを保証
    it('counts completion status filter', () => {
      const filters: FilterState = {
        completionStatus: 'completed',
        categoryIds: [],
        tags: [],
        tagCondition: 'any',
        searchText: ''
      }
      const count = getActiveFilterCount(filters)
      expect(count).toBe(1)
    })

    // 概要: 複数フィルターのカウント確認
    // 目的: 複数のフィルターが設定された時のカウントが正しいことを保証
    it('counts multiple active filters', () => {
      const filters: FilterState = {
        completionStatus: 'completed',
        categoryIds: ['work', 'personal'],
        tags: ['urgent'],
        tagCondition: 'any',
        searchText: 'test'
      }
      const count = getActiveFilterCount(filters)
      expect(count).toBe(4)
    })

    // 概要: 空白検索文字列の処理確認
    // 目的: 空白のみの検索文字列がカウントされないことを保証
    it('does not count whitespace-only search text', () => {
      const filters: FilterState = {
        completionStatus: 'all',
        categoryIds: [],
        tags: [],
        tagCondition: 'any',
        searchText: '   '
      }
      const count = getActiveFilterCount(filters)
      expect(count).toBe(0)
    })
  })
})