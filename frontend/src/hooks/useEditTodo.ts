import { useState, useCallback } from 'react'
import type { Todo, EditTodoData } from '../types/todo'

export interface UseEditTodoReturn {
  isEditing: boolean
  editData: EditTodoData
  startEdit: () => void
  cancelEdit: () => void
  saveEdit: () => void
  updateEditData: (data: Partial<EditTodoData>) => void
}

export const useEditTodo = (
  todo: Todo,
  onEdit: (id: string, data: EditTodoData) => void
): UseEditTodoReturn => {
  const [isEditing, setIsEditing] = useState(false)
  const [editData, setEditData] = useState<EditTodoData>({
    text: todo.text,
    categoryId: todo.categoryId,
    tags: todo.tags,
  })

  const startEdit = useCallback(() => {
    setIsEditing(true)
  }, [])

  const cancelEdit = useCallback(() => {
    setIsEditing(false)
    setEditData({
      text: todo.text,
      categoryId: todo.categoryId,
      tags: todo.tags,
    })
  }, [todo.text, todo.categoryId, todo.tags])

  const updateEditData = useCallback((data: Partial<EditTodoData>) => {
    setEditData(prev => ({ ...prev, ...data }))
  }, [])

  const saveEdit = useCallback(() => {
    if (editData.text.trim() === '') {
      return
    }

    onEdit(todo.id, editData)
    setIsEditing(false)
  }, [editData, todo.id, onEdit])

  return {
    isEditing,
    editData,
    startEdit,
    cancelEdit,
    saveEdit,
    updateEditData,
  }
}
