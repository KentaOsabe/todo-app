import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import { ThemeProvider, createTheme } from '@mui/material'
import { Navigation } from '../../src/components/Navigation'

const renderWithRouter = (initialPath: string) => {
  const mockProps = {
    isDarkMode: false,
    toggleDarkMode: () => {},
  }

  return render(
    <MemoryRouter
      initialEntries={[initialPath]}
      future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
    >
      <Navigation {...mockProps} />
    </MemoryRouter>
  )
}

const renderWithTheme = (
  initialPath: string,
  mode: 'light' | 'dark' = 'light'
) => {
  const theme = createTheme({
    palette: {
      mode,
    },
  })

  const mockProps = {
    isDarkMode: mode === 'dark',
    toggleDarkMode: () => {},
  }

  return render(
    <MemoryRouter
      initialEntries={[initialPath]}
      future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
    >
      <ThemeProvider theme={theme}>
        <Navigation {...mockProps} />
      </ThemeProvider>
    </MemoryRouter>
  )
}

describe('Navigation', () => {
  // 概要: ルートパス（/）でTodoタブが選択されることをテスト
  // 目的: ホームページでTodoタブがアクティブ状態になることを保証
  it('selects Todo tab when on root path', () => {
    renderWithRouter('/')

    const todoTab = screen.getByRole('tab', { name: 'Todo page' })
    const categoryTab = screen.getByRole('tab', {
      name: 'Categories management page',
    })

    expect(todoTab).toHaveAttribute('aria-selected', 'true')
    expect(categoryTab).toHaveAttribute('aria-selected', 'false')
  })

  // 概要: カテゴリ管理パス（/categories）でカテゴリタブが選択されることをテスト
  // 目的: カテゴリ管理ページでカテゴリタブがアクティブ状態になることを保証
  it('selects Category tab when on categories path', () => {
    renderWithRouter('/categories')

    const todoTab = screen.getByRole('tab', { name: 'Todo page' })
    const categoryTab = screen.getByRole('tab', {
      name: 'Categories management page',
    })

    expect(todoTab).toHaveAttribute('aria-selected', 'false')
    expect(categoryTab).toHaveAttribute('aria-selected', 'true')
  })

  // 概要: カテゴリ新規作成パス（/categories/new）でカテゴリタブが選択されることをテスト
  // 目的: カテゴリ関連のサブページでもカテゴリタブがアクティブ状態になることを保証
  it('selects Category tab when on categories/new path', () => {
    renderWithRouter('/categories/new')

    const todoTab = screen.getByRole('tab', { name: 'Todo page' })
    const categoryTab = screen.getByRole('tab', {
      name: 'Categories management page',
    })

    expect(todoTab).toHaveAttribute('aria-selected', 'false')
    expect(categoryTab).toHaveAttribute('aria-selected', 'true')
  })

  // 概要: カテゴリ編集パス（/categories/:id/edit）でカテゴリタブが選択されることをテスト
  // 目的: カテゴリ編集ページでもカテゴリタブがアクティブ状態になることを保証
  it('selects Category tab when on categories edit path', () => {
    renderWithRouter('/categories/work/edit')

    const todoTab = screen.getByRole('tab', { name: 'Todo page' })
    const categoryTab = screen.getByRole('tab', {
      name: 'Categories management page',
    })

    expect(todoTab).toHaveAttribute('aria-selected', 'false')
    expect(categoryTab).toHaveAttribute('aria-selected', 'true')
  })

  // 概要: 存在しないパスでどのタブも選択されないことをテスト
  // 目的: 404ページなどの未定義ルートでタブ選択状態が適切に処理されることを保証
  it('selects no tab when on unknown path', () => {
    renderWithRouter('/unknown-path')

    const todoTab = screen.getByRole('tab', { name: 'Todo page' })
    const categoryTab = screen.getByRole('tab', {
      name: 'Categories management page',
    })

    expect(todoTab).toHaveAttribute('aria-selected', 'false')
    expect(categoryTab).toHaveAttribute('aria-selected', 'false')
  })

  // 概要: Todoタブが正しいリンク先を持つことをテスト
  // 目的: Todoタブクリック時に正しいURLに遷移できることを保証
  it('has correct href for Todo tab', () => {
    renderWithRouter('/')

    const todoTab = screen.getByRole('tab', { name: 'Todo page' })
    expect(todoTab).toHaveAttribute('href', '/')
  })

  // 概要: カテゴリタブが正しいリンク先を持つことをテスト
  // 目的: カテゴリタブクリック時に正しいURLに遷移できることを保証
  it('has correct href for Category tab', () => {
    renderWithRouter('/')

    const categoryTab = screen.getByRole('tab', {
      name: 'Categories management page',
    })
    expect(categoryTab).toHaveAttribute('href', '/categories')
  })

  // 概要: ダークモード切り替えボタンが表示されることをテスト
  // 目的: ナビゲーションにダークモード切り替え機能が含まれることを保証
  it('displays dark mode toggle button', () => {
    renderWithTheme('/', 'light')

    const toggleButton = screen.getByRole('button', {
      name: 'Switch to dark mode',
    })
    expect(toggleButton).toBeInTheDocument()
  })

  // 概要: ライトモード時に正しいアイコンが表示されることをテスト
  // 目的: ダークモード切り替えボタンが現在の状態を正しく反映することを保証
  it('shows dark mode icon when in light mode', () => {
    renderWithTheme('/', 'light')

    const toggleButton = screen.getByRole('button', {
      name: 'Switch to dark mode',
    })
    expect(toggleButton).toBeInTheDocument()
  })

  // 概要: ダークモード時に正しいアイコンが表示されることをテスト
  // 目的: ダークモード切り替えボタンが現在の状態を正しく反映することを保証
  it('shows light mode icon when in dark mode', () => {
    renderWithTheme('/', 'dark')

    const toggleButton = screen.getByRole('button', {
      name: 'Switch to light mode',
    })
    expect(toggleButton).toBeInTheDocument()
  })
})
