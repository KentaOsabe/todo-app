import {
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Checkbox,
  IconButton,
  Typography,
} from '@mui/material'
import { Delete as DeleteIcon } from '@mui/icons-material'
import type { Todo } from '../types/todo'

interface TodoItemProps {
  todo: Todo
  onToggle: (id: string) => void
  onDelete: (id: string) => void
}

export const TodoItem = ({ todo, onToggle, onDelete }: TodoItemProps) => {
  return (
    <ListItem
      secondaryAction={
        <IconButton
          edge="end"
          aria-label="delete"
          onClick={() => onDelete(todo.id)}
          color="error"
        >
          <DeleteIcon />
        </IconButton>
      }
      disablePadding
    >
      <ListItemButton onClick={() => onToggle(todo.id)} dense>
        <ListItemIcon>
          <Checkbox
            edge="start"
            checked={todo.completed}
            tabIndex={-1}
            disableRipple
          />
        </ListItemIcon>
        <ListItemText
          primary={
            <Typography
              variant="body1"
              sx={{
                textDecoration: todo.completed ? 'line-through' : 'none',
                color: todo.completed ? 'text.secondary' : 'text.primary',
              }}
            >
              {todo.text}
            </Typography>
          }
        />
      </ListItemButton>
    </ListItem>
  )
}