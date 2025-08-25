import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import { NotFoundPage } from '../../src/components/NotFoundPage'

// useNavigateをモック
const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

const renderWithRouter = () => {
  return render(
    <MemoryRouter
      future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
    >
      <NotFoundPage />
    </MemoryRouter>
  )
}

describe('NotFoundPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  // 概要: 404ページの基本表示をテスト
  // 目的: 404エラーメッセージとページタイトルが表示されることを保証（Issue #5要件）
  it('displays 404 error message and page title', () => {
    renderWithRouter()

    expect(screen.getByText('404')).toBeInTheDocument()
    expect(screen.getByText('ページが見つかりません')).toBeInTheDocument()
  })

  // 概要: エラーの詳細説明をテスト
  // 目的: ユーザーに分かりやすいエラー説明が表示されることを保証（Issue #5要件）
  it('displays user-friendly error description', () => {
    renderWithRouter()

    expect(
      screen.getByText('お探しのページは存在しないか、移動した可能性があります')
    ).toBeInTheDocument()
  })

  // 概要: ホームページへの戻るボタンをテスト
  // 目的: ユーザーがメインページに戻れるナビゲーションが提供されることを保証（Issue #5要件）
  it('displays home navigation button', () => {
    renderWithRouter()

    expect(
      screen.getByRole('button', { name: 'ホームに戻る' })
    ).toBeInTheDocument()
  })

  // 概要: ホームへの遷移機能をテスト
  // 目的: ホームボタンクリック時にルートページに遷移することを保証（Issue #5要件）
  it('navigates to home when home button clicked', () => {
    renderWithRouter()

    const homeButton = screen.getByRole('button', { name: 'ホームに戻る' })
    fireEvent.click(homeButton)

    expect(mockNavigate).toHaveBeenCalledWith('/')
  })

  // 概要: カテゴリページへの戻るボタンをテスト
  // 目的: カテゴリ管理ページに戻れるナビゲーションが提供されることを保証（Issue #5要件）
  it('displays category navigation button', () => {
    renderWithRouter()

    expect(
      screen.getByRole('button', { name: 'カテゴリ管理に戻る' })
    ).toBeInTheDocument()
  })

  // 概要: カテゴリページへの遷移機能をテスト
  // 目的: カテゴリボタンクリック時にカテゴリページに遷移することを保証（Issue #5要件）
  it('navigates to categories when category button clicked', () => {
    renderWithRouter()

    const categoryButton = screen.getByRole('button', {
      name: 'カテゴリ管理に戻る',
    })
    fireEvent.click(categoryButton)

    expect(mockNavigate).toHaveBeenCalledWith('/categories')
  })
})
