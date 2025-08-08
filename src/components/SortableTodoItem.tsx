import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { DragIndicator } from '@mui/icons-material'
import { Box, IconButton } from '@mui/material'
import type { Todo, EditTodoData } from '../types/todo'
import type { Category } from '../types/category'
import { TodoItem } from './TodoItem'

interface SortableTodoItemProps {
  todo: Todo
  onToggle: (id: string) => void
  onDelete: (id: string) => void
  onEdit?: (id: string, data: EditTodoData) => void
  categories: Category[]
}

export const SortableTodoItem = ({
  todo,
  onToggle,
  onDelete,
  onEdit,
  categories,
}: SortableTodoItemProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: todo.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <Box
      ref={setNodeRef}
      style={style}
      sx={{
        display: 'flex',
        alignItems: 'center',
        '&:hover .drag-handle': {
          opacity: 1,
        },
      }}
    >
      <IconButton
        className="drag-handle"
        {...attributes}
        {...listeners}
        sx={{
          opacity: 0,
          transition: 'opacity 0.2s',
          cursor: 'grab',
          '&:active': {
            cursor: 'grabbing',
          },
        }}
        size="small"
        aria-label="Drag to reorder"
      >
        <DragIndicator />
      </IconButton>
      <Box sx={{ flex: 1 }}>
        <TodoItem
          todo={todo}
          onToggle={onToggle}
          onDelete={onDelete}
          onEdit={onEdit}
          categories={categories}
        />
      </Box>
    </Box>
  )
}
