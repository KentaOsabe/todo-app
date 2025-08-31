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
} from "@mui/material";
import { Delete as DeleteIcon, Edit as EditIcon } from "@mui/icons-material";
import type { Todo, EditTodoData } from "../types/todo";
import type { Category } from "../types/category";
import { TodoEditForm } from "./TodoEditForm";
import { useEditTodo } from "../hooks/useEditTodo";

interface TodoItemProps {
  todo: Todo;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit?: (id: string, data: EditTodoData) => void;
  categories?: Category[];
}

export const TodoItem = ({
  todo,
  onToggle,
  onDelete,
  onEdit,
  categories = [],
}: TodoItemProps) => {
  const category = todo.categoryId
    ? categories.find((cat) => cat.id === todo.categoryId)
    : undefined;

  const editTodo = useEditTodo(todo, onEdit || (() => {}));

  const handleDoubleClick = () => {
    if (onEdit) {
      editTodo.startEdit();
    }
  };

  if (editTodo.isEditing) {
    return (
      <TodoEditForm
        editData={editTodo.editData}
        categories={categories}
        onSave={editTodo.saveEdit}
        onCancel={editTodo.cancelEdit}
        onUpdateData={editTodo.updateEditData}
      />
    );
  }

  return (
    <ListItem
      secondaryAction={
        <Box sx={{ display: "flex", gap: 1 }}>
          {onEdit && (
            <IconButton
              edge="end"
              aria-label="edit"
              onClick={editTodo.startEdit}
              color="primary"
            >
              <EditIcon />
            </IconButton>
          )}
          <IconButton
            edge="end"
            aria-label="delete"
            onClick={() => onDelete(todo.id)}
            color="error"
          >
            <DeleteIcon />
          </IconButton>
        </Box>
      }
      disablePadding
    >
      <ListItemButton
        onClick={() => onToggle(todo.id)}
        onDoubleClick={handleDoubleClick}
        dense
      >
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
                  textDecoration: todo.completed ? "line-through" : "none",
                  color: todo.completed ? "text.secondary" : "text.primary",
                  mb: category || (todo.tags && todo.tags.length > 0) ? 1 : 0,
                }}
              >
                {todo.text}
              </Typography>

              {/* カテゴリとタグのChip表示 */}
              {(category || (todo.tags && todo.tags.length > 0)) && (
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                  {/* カテゴリChip */}
                  {category && (
                    <Chip
                      label={category.name}
                      size="small"
                      sx={{
                        backgroundColor: category.color,
                        color: "white",
                        fontSize: "0.75rem",
                      }}
                    />
                  )}

                  {/* タグChips */}
                  {todo.tags && todo.tags.length > 0 && (
                    <Box
                      data-testid="tags-container"
                      sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}
                    >
                      {todo.tags.map((tag, index) => (
                        <Chip
                          key={index}
                          label={tag}
                          size="small"
                          variant="outlined"
                          sx={{ fontSize: "0.75rem" }}
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
  );
};
