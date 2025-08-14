import { Routes, Route } from 'react-router-dom'
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material'
import { useMemo } from 'react'
import { TodoApp } from './components/TodoApp'
import { Navigation } from './components/Navigation'
import { CategoriesPage } from './components/CategoriesPage'
import { CategoryForm } from './components/CategoryForm'
import { NotFoundPage } from './components/NotFoundPage'
import { useDarkMode } from './hooks/useDarkMode'
import './App.css'

function App() {
  const { isDarkMode } = useDarkMode()

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode: isDarkMode ? 'dark' : 'light',
        },
      }),
    [isDarkMode]
  )

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <div className="App">
        <Navigation />
        <Routes>
          <Route path="/" element={<TodoApp />} />
          <Route path="/categories" element={<CategoriesPage />} />
          <Route path="/categories/new" element={<CategoryForm />} />
          <Route path="/categories/:id/edit" element={<CategoryForm />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </div>
    </ThemeProvider>
  )
}

export default App
