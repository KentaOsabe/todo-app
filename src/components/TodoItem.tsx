import {
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Checkbox,
  IconButton,
  Typography,
  Chip,
  Box,
} from '@mui/material'
import { Delete as DeleteIcon } from '@mui/icons-material'
import type { Todo } from '../types/todo'
import type { Category } from '../types/category'

interface TodoItemProps {
  todo: Todo
  onToggle: (id: string) => void
  onDelete: (id: string) => void
  categories?: Category[]
}

export const TodoItem = ({ todo, onToggle, onDelete, categories = [] }: TodoItemProps) => {
  const category = todo.categoryId 
    ? categories.find(cat => cat.id === todo.categoryId)
    : undefined

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
            <Box>
              <Typography
                variant="body1"
                sx={{
                  textDecoration: todo.completed ? 'line-through' : 'none',
                  color: todo.completed ? 'text.secondary' : 'text.primary',
                  mb: category || (todo.tags && todo.tags.length > 0) ? 1 : 0,
                }}
              >
                {todo.text}
              </Typography>
              
              {/* カテゴリとタグのChip表示 */}
              {(category || (todo.tags && todo.tags.length > 0)) && (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {/* カテゴリChip */}
                  {category && (
                    <Chip
                      label={category.name}
                      size="small"
                      sx={{
                        backgroundColor: category.color,
                        color: 'white',
                        fontSize: '0.75rem',
                      }}
                    />
                  )}
                  
                  {/* タグChips */}
                  {todo.tags && todo.tags.length > 0 && (
                    <Box data-testid="tags-container" sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {todo.tags.map((tag, index) => (
                        <Chip
                          key={index}
                          label={tag}
                          size="small"
                          variant="outlined"
                          sx={{ fontSize: '0.75rem' }}
                        />
                      ))}
                    </Box>
                  )}
                </Box>
              )}
            </Box>
          }
        />
      </ListItemButton>
    </ListItem>
  )
}