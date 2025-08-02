import { useMemo } from 'react'
import {
  Container,
  Typography,
  Box,
  List,
  Paper,
  ThemeProvider,
  createTheme,
  IconButton,
  CssBaseline,
} from '@mui/material'
import { 
  DarkMode as DarkModeIcon,
  LightMode as LightModeIcon,
} from '@mui/icons-material'
import type { Todo } from '../types/todo'
import { TodoItem } from './TodoItem'
import { TodoForm } from './TodoForm'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { useDarkMode } from '../hooks/useDarkMode'
import { useCategories } from '../hooks/useCategories'

export const TodoApp = () => {
  const [storedTodos, setStoredTodos] = useLocalStorage<Todo[]>('todos', [])
  
  // localStorageから読み込んだTodoを正規化（tagsフィールドが欠けている可能性に対応）
  const todos = useMemo(() => 
    storedTodos.map(todo => ({
      ...todo,
      tags: todo.tags || []
    }))
  , [storedTodos])
  
  const setTodos = (value: Todo[] | ((prev: Todo[]) => Todo[])) => {
    if (typeof value === 'function') {
      setStoredTodos(prev => {
        const normalized = prev.map(todo => ({ ...todo, tags: todo.tags || [] }))
        return value(normalized)
      })
    } else {
      setStoredTodos(value)
    }
  }
  const { isDarkMode, toggleDarkMode } = useDarkMode()
  const { categories } = useCategories()

  // ダークモードに応じて動的にテーマを作成
  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode: isDarkMode ? 'dark' : 'light',
          primary: {
            main: '#1976d2',
          },
          secondary: {
            main: '#dc004e',
          },
        },
      }),
    [isDarkMode]
  )

  const handleAddTodo = (data: { text: string; categoryId?: string; tags: string[] }) => {
    const newTodo: Todo = {
      id: Date.now().toString(),
      text: data.text,
      completed: false,
      createdAt: new Date(),
      categoryId: data.categoryId,
      tags: data.tags,
    }

    setTodos(prev => [...prev, newTodo])
  }

  const handleToggleTodo = (id: string) => {
    setTodos(prev =>
      prev.map(todo =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    )
  }

  const handleDeleteTodo = (id: string) => {
    setTodos(prev => prev.filter(todo => todo.id !== id))
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h3" component="h1" color="primary">
            Todo App
          </Typography>
          <IconButton
            onClick={toggleDarkMode}
            color="primary"
            aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            size="large"
          >
            {isDarkMode ? <LightModeIcon /> : <DarkModeIcon />}
          </IconButton>
        </Box>
        
        <TodoForm onSubmit={handleAddTodo} categories={categories} />

        {todos.length > 0 && (
          <Paper elevation={2}>
            <List>
              {todos.map(todo => (
                <TodoItem
                  key={todo.id}
                  todo={todo}
                  onToggle={handleToggleTodo}
                  onDelete={handleDeleteTodo}
                  categories={categories}
                />
              ))}
            </List>
          </Paper>
        )}

        {todos.length === 0 && (
          <Typography variant="body1" align="center" color="text.secondary" sx={{ mt: 4 }}>
            No todos yet. Add one above to get started!
          </Typography>
        )}
      </Container>
    </ThemeProvider>
  )
}