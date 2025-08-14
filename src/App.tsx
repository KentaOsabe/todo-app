import { Routes, Route } from 'react-router-dom'
import { TodoApp } from './components/TodoApp'
import { Navigation } from './components/Navigation'
import { CategoriesPage } from './components/CategoriesPage'
import { CategoryForm } from './components/CategoryForm'
import { NotFoundPage } from './components/NotFoundPage'
import './App.css'

function App() {
  return (
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
  )
}

export default App
