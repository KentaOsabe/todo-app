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
import { SortableTodoItem } from './SortableTodoItem'
import { TodoForm } from './TodoForm'
import { FilterBar } from './FilterBar'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { useDarkMode } from '../hooks/useDarkMode'
import { useCategories } from '../hooks/useCategories'
import { useFilters } from '../hooks/useFilters'
import { useTodoSorting } from '../hooks/useTodoSorting'
import { DndContext, closestCenter } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'

export const TodoApp = () => {
  const [storedTodos, setStoredTodos] = useLocalStorage<Todo[]>('todos', [])
  
  // localStorageから読み込んだTodoを正規化（tagsフィールドとorderフィールドが欠けている可能性に対応）
  const todos = useMemo(() => 
    storedTodos.map((todo, index) => ({
      ...todo,
      tags: todo.tags || [],
      order: todo.order !== undefined ? todo.order : index
    }))
  , [storedTodos])
  
  const setTodos = (value: Todo[] | ((prev: Todo[]) => Todo[])) => {
    if (typeof value === 'function') {
      setStoredTodos(prev => {
        const normalized = prev.map((todo, index) => ({ 
          ...todo, 
          tags: todo.tags || [],
          order: todo.order !== undefined ? todo.order : index
        }))
        return value(normalized)
      })
    } else {
      setStoredTodos(value)
    }
  }
  const { isDarkMode, toggleDarkMode } = useDarkMode()
  const { categories } = useCategories()
  const { filters, filteredTodos, updateFilters, resetFilters, availableTags, activeFilterCount } = useFilters(todos)

  // ドラッグ&ドロップによる並び替え機能
  const { sortedTodos, handleDragEnd } = useTodoSorting(filteredTodos, setTodos)

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
    const maxOrder = todos.length > 0 ? Math.max(...todos.map(t => t.order || 0)) : -1
    const newTodo: Todo = {
      id: Date.now().toString(),
      text: data.text,
      completed: false,
      createdAt: new Date(),
      categoryId: data.categoryId,
      tags: data.tags,
      order: maxOrder + 1,
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

        <FilterBar
          filters={filters}
          onFiltersChange={updateFilters}
          onReset={resetFilters}
          categories={categories}
          availableTags={availableTags}
          activeFilterCount={activeFilterCount}
        />

        {sortedTodos.length > 0 && (
          <Paper elevation={2}>
            <DndContext 
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext 
                items={sortedTodos.map(todo => todo.id)}
                strategy={verticalListSortingStrategy}
              >
                <List>
                  {sortedTodos.map(todo => (
                    <SortableTodoItem
                      key={todo.id}
                      todo={todo}
                      onToggle={handleToggleTodo}
                      onDelete={handleDeleteTodo}
                      categories={categories}
                    />
                  ))}
                </List>
              </SortableContext>
            </DndContext>
          </Paper>
        )}

        {todos.length === 0 && (
          <Typography variant="body1" align="center" color="text.secondary" sx={{ mt: 4 }}>
            No todos yet. Add one above to get started!
          </Typography>
        )}

        {todos.length > 0 && sortedTodos.length === 0 && (
          <Typography variant="body1" align="center" color="text.secondary" sx={{ mt: 4 }}>
            No todos match the current filters.
          </Typography>
        )}
      </Container>
    </ThemeProvider>
  )
}