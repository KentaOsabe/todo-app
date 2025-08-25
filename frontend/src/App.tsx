import { Routes, Route } from 'react-router-dom'
import {
  ThemeProvider,
  createTheme,
  CssBaseline,
  Container,
} from '@mui/material'
import { useMemo } from 'react'
import { TodoApp } from './components/TodoApp'
import { Navigation } from './components/Navigation'
import { CategoriesPage } from './components/CategoriesPage'
import { CategoryForm } from './components/CategoryForm'
import { NotFoundPage } from './components/NotFoundPage'
import { useDarkMode } from './hooks/useDarkMode'
import './App.css'

function App() {
  const { isDarkMode, toggleDarkMode } = useDarkMode()

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
        <Navigation isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} />
        <Container
          maxWidth="md"
          sx={{
            minHeight: 'calc(100vh - 64px)', // AppBarの高さ(64px)を差し引いた最小高さ
            py: 0, // パディングを統一
            display: 'flex',
            flexDirection: 'column',
            width: '100%', // 明示的に幅を指定
            maxWidth: '900px', // Material-UI md breakpoint
            margin: '0 auto', // 中央配置を保証
          }}
        >
          <Routes>
            <Route path="/" element={<TodoApp />} />
            <Route path="/categories" element={<CategoriesPage />} />
            <Route path="/categories/new" element={<CategoryForm />} />
            <Route path="/categories/:id/edit" element={<CategoryForm />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Container>
      </div>
    </ThemeProvider>
  )
}

export default App
