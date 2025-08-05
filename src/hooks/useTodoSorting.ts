import { useMemo, useCallback } from 'react'
import { arrayMove } from '@dnd-kit/sortable'
import type { DragEndEvent } from '@dnd-kit/core'
import type { Todo } from '../types/todo'

export interface UseTodoSortingReturn {
  sortedTodos: Todo[]
  handleDragEnd: (event: DragEndEvent) => void
  resetOrder: () => void
  sortBy: (criteria: 'created' | 'alphabetical' | 'category' | 'custom') => void
}

export const useTodoSorting = (
  todos: Todo[],
  onReorder?: (reorderedTodos: Todo[]) => void
): UseTodoSortingReturn => {
  const sortedTodos = useMemo(() => {
    return [...todos].sort((a, b) => a.order - b.order)
  }, [todos])

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event

    if (!over || active.id === over.id) {
      return
    }

    const oldIndex = sortedTodos.findIndex(todo => todo.id === active.id)
    const newIndex = sortedTodos.findIndex(todo => todo.id === over.id)

    if (oldIndex === -1 || newIndex === -1) {
      return
    }

    const reordered = arrayMove(sortedTodos, oldIndex, newIndex)
    const reorderedWithOrder = reordered.map((todo, index) => ({
      ...todo,
      order: index
    }))

    onReorder?.(reorderedWithOrder)
  }, [sortedTodos, onReorder])

  const resetOrder = useCallback(() => {
    const sorted = [...todos].sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
    const reorderedWithOrder = sorted.map((todo, index) => ({
      ...todo,
      order: index
    }))
    onReorder?.(reorderedWithOrder)
  }, [todos, onReorder])

  const sortBy = useCallback((criteria: 'created' | 'alphabetical' | 'category' | 'custom') => {
    let sorted: Todo[]
    
    switch (criteria) {
      case 'created':
        sorted = [...todos].sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
        break
      case 'alphabetical':
        sorted = [...todos].sort((a, b) => a.text.localeCompare(b.text))
        break
      case 'category':
        sorted = [...todos].sort((a, b) => {
          const categoryA = a.categoryId || ''
          const categoryB = b.categoryId || ''
          return categoryA.localeCompare(categoryB)
        })
        break
      case 'custom':
      default:
        sorted = [...todos].sort((a, b) => a.order - b.order)
        break
    }

    const reorderedWithOrder = sorted.map((todo, index) => ({
      ...todo,
      order: index
    }))
    onReorder?.(reorderedWithOrder)
  }, [todos, onReorder])

  return {
    sortedTodos,
    handleDragEnd,
    resetOrder,
    sortBy
  }
}