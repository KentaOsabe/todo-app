import { useState, useMemo } from 'react'
import {
  Container,
  Typography,
  TextField,
  Button,
  Box,
  List,
  Paper,
  ThemeProvider,
  createTheme,
  IconButton,
  CssBaseline,
} from '@mui/material'
import { 
  Add as AddIcon,
  DarkMode as DarkModeIcon,
  LightMode as LightModeIcon,
} from '@mui/icons-material'
import type { Todo } from '../types/todo'
import { TodoItem } from './TodoItem'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { useDarkMode } from '../hooks/useDarkMode'

export const TodoApp = () => {
  const [todos, setTodos] = useLocalStorage<Todo[]>('todos', [])
  const [inputValue, setInputValue] = useState('')
  const { isDarkMode, toggleDarkMode } = useDarkMode()

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

  const handleAddTodo = () => {
    if (inputValue.trim() === '') return

    const newTodo: Todo = {
      id: Date.now().toString(),
      text: inputValue.trim(),
      completed: false,
      createdAt: new Date(),
    }

    setTodos(prev => [...prev, newTodo])
    setInputValue('')
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

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAddTodo()
    }
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
        
        <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Add new todo"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
            />
            <Button
              variant="contained"
              onClick={handleAddTodo}
              startIcon={<AddIcon />}
              sx={{ minWidth: 120 }}
            >
              Add
            </Button>
          </Box>
        </Paper>

        {todos.length > 0 && (
          <Paper elevation={2}>
            <List>
              {todos.map(todo => (
                <TodoItem
                  key={todo.id}
                  todo={todo}
                  onToggle={handleToggleTodo}
                  onDelete={handleDeleteTodo}
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