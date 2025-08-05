import { useMemo } from 'react'
import type { Todo } from '../types/todo'
import type { FilterState } from '../types/filter'
import { useLocalStorage } from './useLocalStorage'

interface UseFiltersReturn {
  filters: FilterState;
  updateFilters: (filters: Partial<FilterState>) => void;
  resetFilters: () => void;
  filteredTodos: Todo[];
  availableTags: string[];
  activeFilterCount: number;
}

const defaultFilters: FilterState = {
  completionStatus: 'all',
  categoryIds: [],
  tags: [],
  tagCondition: 'any',
  searchText: ''
}

export const useFilters = (todos: Todo[]): UseFiltersReturn => {
  const [filters, setStoredFilters] = useLocalStorage<FilterState>('todoFilters', defaultFilters)

  const updateFilters = (newFilters: Partial<FilterState>) => {
    setStoredFilters(prev => ({ ...prev, ...newFilters }))
  }

  const resetFilters = () => {
    setStoredFilters(defaultFilters)
  }

  const filteredTodos = useMemo(() => {
    return todos.filter(todo => {
      // 完了状態フィルター
      if (filters.completionStatus === 'completed' && !todo.completed) return false
      if (filters.completionStatus === 'incomplete' && todo.completed) return false

      // カテゴリフィルター
      if (filters.categoryIds.length > 0 && !filters.categoryIds.includes(todo.categoryId || '')) {
        return false
      }

      // タグフィルター
      if (filters.tags.length > 0) {
        if (filters.tagCondition === 'all') {
          // 全てのタグが含まれている必要がある
          if (!filters.tags.every(tag => todo.tags.includes(tag))) return false
        } else {
          // いずれかのタグが含まれている必要がある
          if (!filters.tags.some(tag => todo.tags.includes(tag))) return false
        }
      }

      // テキスト検索フィルター
      if (filters.searchText && !todo.text.toLowerCase().includes(filters.searchText.toLowerCase())) {
        return false
      }

      return true
    })
  }, [todos, filters])

  const availableTags = useMemo(() => {
    const tagsSet = new Set<string>()
    todos.forEach(todo => {
      todo.tags.forEach(tag => tagsSet.add(tag))
    })
    return Array.from(tagsSet).sort()
  }, [todos])

  const activeFilterCount = useMemo(() => {
    let count = 0
    if (filters.completionStatus !== 'all') count++
    if (filters.categoryIds.length > 0) count++
    if (filters.tags.length > 0) count++
    if (filters.searchText.trim() !== '') count++
    return count
  }, [filters])

  return {
    filters,
    updateFilters,
    resetFilters,
    filteredTodos,
    availableTags,
    activeFilterCount
  }
}