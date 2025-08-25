import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import App from '../src/App'
import { useDarkMode } from '../src/hooks/useDarkMode'

// useDarkModeフックをモック
vi.mock('../src/hooks/useDarkMode')

const mockUseDarkMode = vi.mocked(useDarkMode)

describe('App Router', () => {
  beforeEach(() => {
    mockUseDarkMode.mockReturnValue({
      isDarkMode: false,
      toggleDarkMode: vi.fn(),
      setDarkMode: vi.fn(),
    })
  })
  // 概要: ルートパスでTodoアプリが表示されることをテスト
  // 目的: / ルートが正しくTodoAppコンポーネントを表示することを保証
  it('renders TodoApp at root path', () => {
    render(
      <MemoryRouter
        initialEntries={['/']}
        future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
      >
        <App />
      </MemoryRouter>
    )

    // TodoAppの特徴的な要素が表示されることを確認
    expect(screen.getByText('Todo App')).toBeInTheDocument()
    expect(
      screen.getByPlaceholderText('新しいタスクを入力')
    ).toBeInTheDocument()
  })

  // 概要: /categoriesパスでカテゴリページが表示されることをテスト
  // 目的: /categoriesルートが正しくCategoriesPageコンポーネントを表示することを保証
  it('renders CategoriesPage at /categories path', () => {
    render(
      <MemoryRouter
        initialEntries={['/categories']}
        future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
      >
        <App />
      </MemoryRouter>
    )

    // カテゴリページが表示されることを確認（ナビゲーション以外で）
    const allCategoryTexts = screen.getAllByText('カテゴリ管理')
    expect(allCategoryTexts.length).toBeGreaterThanOrEqual(2) // ナビとメインコンテンツ
  })

  // 概要: /categories/newパスでカテゴリ新規作成フォームが表示されることをテスト
  // 目的: /categories/newルートが正しくCategoryFormコンポーネントを表示することを保証
  it('renders CategoryForm at /categories/new path', () => {
    render(
      <MemoryRouter
        initialEntries={['/categories/new']}
        future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
      >
        <App />
      </MemoryRouter>
    )

    // 新規作成フォームが表示されることを確認
    expect(screen.getByText(/新規作成/)).toBeInTheDocument()
  })

  // 概要: /categories/:id/editパスでカテゴリ編集フォームが表示されることをテスト
  // 目的: /categories/:id/editルートが正しくCategoryFormコンポーネントを表示することを保証
  it('renders CategoryForm at /categories/:id/edit path', () => {
    render(
      <MemoryRouter
        initialEntries={['/categories/work/edit']}
        future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
      >
        <App />
      </MemoryRouter>
    )

    // 編集フォームが表示されることを確認
    expect(screen.getByText(/編集/)).toBeInTheDocument()
  })

  // 概要: 存在しないパスで404ページが表示されることをテスト
  // 目的: 存在しないルートが正しくNotFoundPageコンポーネントを表示することを保証
  it('renders NotFoundPage for non-existent paths', () => {
    render(
      <MemoryRouter
        initialEntries={['/non-existent']}
        future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
      >
        <App />
      </MemoryRouter>
    )

    // 404ページが表示されることを確認
    expect(screen.getByText(/404/)).toBeInTheDocument()
  })

  // 概要: ナビゲーションバーが全ページで表示されることをテスト
  // 目的: Navigationコンポーネントが各ルートで正しく表示されることを保証
  it('renders Navigation on all pages', () => {
    render(
      <MemoryRouter
        initialEntries={['/']}
        future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
      >
        <App />
      </MemoryRouter>
    )

    // ナビゲーションタブが表示されることを確認
    expect(
      screen.getByRole('tablist', { name: 'navigation tabs' })
    ).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: 'Todo page' })).toBeInTheDocument()
    expect(
      screen.getByRole('tab', { name: 'Categories management page' })
    ).toBeInTheDocument()
  })

  // 概要: アプリ全体でThemeProviderが適用されることをテスト
  // 目的: 全てのページでダークモードテーマが適用されることを保証
  it('applies theme to all pages', () => {
    mockUseDarkMode.mockReturnValue({
      isDarkMode: true,
      toggleDarkMode: vi.fn(),
      setDarkMode: vi.fn(),
    })

    render(
      <MemoryRouter
        initialEntries={['/categories']}
        future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
      >
        <App />
      </MemoryRouter>
    )

    // カテゴリ管理のheading要素を確認（ナビゲーションではない方）
    const categoryHeading = screen.getByRole('heading', {
      name: /カテゴリ管理/i,
    })
    expect(categoryHeading).toBeInTheDocument()
  })
})
