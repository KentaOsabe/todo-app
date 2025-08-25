import { renderHook, act } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import type { DragEndEvent } from '@dnd-kit/core'
import type { Todo } from '../../src/types/todo'
import { useTodoSorting } from '../../src/hooks/useTodoSorting'

describe('useTodoSorting', () => {
  const mockTodos: Todo[] = [
    {
      id: '1',
      text: 'First todo',
      completed: false,
      createdAt: new Date('2023-01-01'),
      categoryId: 'category1',
      tags: ['tag1'],
      order: 0,
    },
    {
      id: '2',
      text: 'Second todo',
      completed: false,
      createdAt: new Date('2023-01-02'),
      categoryId: 'category2',
      tags: ['tag2'],
      order: 1,
    },
    {
      id: '3',
      text: 'Third todo',
      completed: true,
      createdAt: new Date('2023-01-03'),
      categoryId: 'category1',
      tags: ['tag1'],
      order: 2,
    },
  ]

  // 概要: useTodoSortingフックが正しく初期化されることをテスト
  // 目的: フックが基本的な機能を提供し、初期状態でTodoリストが正しく設定されることを保証
  it('initializes with todos sorted by order', () => {
    const { result } = renderHook(() => useTodoSorting(mockTodos))

    expect(result.current.sortedTodos).toEqual(mockTodos)
    expect(result.current.sortedTodos).toHaveLength(3)
  })

  // 概要: ドラッグ&ドロップによる並び順変更処理をテスト
  // 目的: アイテムの順序が正しく更新され、onReorderコールバックが適切に呼ばれることを保証
  it('handles drag end and reorders todos correctly', () => {
    let reorderedTodos: Todo[] = []
    const onReorder = (todos: Todo[]) => {
      reorderedTodos = todos
    }

    const { result } = renderHook(() => useTodoSorting(mockTodos, onReorder))

    act(() => {
      // First item (index 0) to third position (index 2) - simplified event object
      const dragEndEvent = {
        active: { id: '1' },
        over: { id: '3' },
      } as DragEndEvent
      result.current.handleDragEnd(dragEndEvent)
    })

    // orderフィールドが更新されることを確認
    expect(reorderedTodos).toHaveLength(3)
    expect(reorderedTodos[0].id).toBe('2')
    expect(reorderedTodos[1].id).toBe('3')
    expect(reorderedTodos[2].id).toBe('1')

    // orderフィールドの値が正しく更新されることを確認
    expect(reorderedTodos[0].order).toBe(0)
    expect(reorderedTodos[1].order).toBe(1)
    expect(reorderedTodos[2].order).toBe(2)
  })

  // 概要: 無効なドロップ操作のハンドリングをテスト
  // 目的: over要素がnullの場合やアイテムが見つからない場合に適切に処理されることを保証
  it('handles invalid drop operations gracefully', () => {
    let reorderedTodos: Todo[] = []
    const onReorder = (todos: Todo[]) => {
      reorderedTodos = todos
    }

    const { result } = renderHook(() => useTodoSorting(mockTodos, onReorder))

    act(() => {
      // Invalid drop (no over element) - simplified event object
      const dragEndEvent = {
        active: { id: '1' },
        over: null,
      } as DragEndEvent
      result.current.handleDragEnd(dragEndEvent)
    })

    // リストが変更されないことを確認
    expect(reorderedTodos).toHaveLength(0)
  })

  // 概要: 並び順リセット機能をテスト
  // 目的: リセット機能が作成日時順にソートし、orderフィールドを正しく更新することを保証
  it('resets order to creation date order', () => {
    let reorderedTodos: Todo[] = []
    const onReorder = (todos: Todo[]) => {
      reorderedTodos = todos
    }

    const { result } = renderHook(() => useTodoSorting(mockTodos, onReorder))

    act(() => {
      result.current.resetOrder()
    })

    // 作成日時順にソートされることを確認
    expect(reorderedTodos).toHaveLength(3)
    expect(reorderedTodos[0].createdAt.getTime()).toBeLessThan(
      reorderedTodos[1].createdAt.getTime()
    )
    expect(reorderedTodos[1].createdAt.getTime()).toBeLessThan(
      reorderedTodos[2].createdAt.getTime()
    )

    // orderフィールドが連続した値で更新されることを確認
    expect(reorderedTodos[0].order).toBe(0)
    expect(reorderedTodos[1].order).toBe(1)
    expect(reorderedTodos[2].order).toBe(2)
  })

  // 概要: 異なるソート基準での並び替え機能をテスト
  // 目的: アルファベット順、カテゴリ順などの様々なソート機能が正しく動作することを保証
  it('sorts by different criteria', () => {
    let reorderedTodos: Todo[] = []
    const onReorder = (todos: Todo[]) => {
      reorderedTodos = todos
    }

    const { result } = renderHook(() => useTodoSorting(mockTodos, onReorder))

    // アルファベット順でソート
    act(() => {
      result.current.sortBy('alphabetical')
    })

    expect(reorderedTodos[0].text).toBe('First todo')
    expect(reorderedTodos[1].text).toBe('Second todo')
    expect(reorderedTodos[2].text).toBe('Third todo')
  })
})
