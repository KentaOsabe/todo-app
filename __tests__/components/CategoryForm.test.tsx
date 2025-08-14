import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import { CategoryForm } from '../../src/components/CategoryForm'
import type { Category } from '../../src/types/category'

// useParamsとuseNavigateをモック
const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useParams: vi.fn(),
    useNavigate: () => mockNavigate,
  }
})

// useCategoryManagementをモック
const mockCreateCategory = vi.fn()
const mockUpdateCategory = vi.fn()
const mockCategories: Category[] = [
  {
    id: 'work',
    name: '仕事',
    color: '#1976d2',
    description: '仕事関連のタスク',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
]

vi.mock('../../src/hooks/useCategoryManagement', () => ({
  useCategoryManagement: () => ({
    categories: mockCategories,
    createCategory: mockCreateCategory,
    updateCategory: mockUpdateCategory,
    deleteCategory: vi.fn(),
    isCategoryInUse: vi.fn(),
  }),
}))

const renderWithRouter = (initialPath: string = '/categories/new') => {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <CategoryForm />
    </MemoryRouter>
  )
}

describe('CategoryForm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  // 概要: 新規作成モードでフォームが正しく表示されることをテスト
  // 目的: /categories/newパスで新規作成フォームが適切に初期化されることを保証
  it('renders create form correctly', async () => {
    const { useParams } = vi.mocked(await import('react-router-dom'))
    useParams.mockReturnValue({})

    renderWithRouter()

    expect(screen.getByText('カテゴリ新規作成')).toBeInTheDocument()
    expect(
      screen.getByRole('textbox', { name: /カテゴリ名/ })
    ).toBeInTheDocument()
    expect(screen.getByDisplayValue('#1976d2')).toBeInTheDocument() // 色フィールド
    expect(screen.getByRole('textbox', { name: /説明/ })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '作成' })).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'キャンセル' })
    ).toBeInTheDocument()
  })

  // 概要: 編集モードでフォームが正しく表示されることをテスト
  // 目的: /categories/:id/editパスで編集フォームが適切に初期化されることを保証
  it('renders edit form correctly', async () => {
    const { useParams } = vi.mocked(await import('react-router-dom'))
    useParams.mockReturnValue({ id: 'work' })

    renderWithRouter('/categories/work/edit')

    expect(screen.getByText('カテゴリ編集')).toBeInTheDocument()
    expect(screen.getByDisplayValue('仕事')).toBeInTheDocument()
    expect(screen.getByDisplayValue('#1976d2')).toBeInTheDocument()
    expect(screen.getByDisplayValue('仕事関連のタスク')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '更新' })).toBeInTheDocument()
  })

  // 概要: 新規作成時のフォーム入力機能をテスト
  // 目的: ユーザーがフォームフィールドに正しく入力できることを保証
  it('allows user input in create mode', async () => {
    const { useParams } = vi.mocked(await import('react-router-dom'))
    useParams.mockReturnValue({})

    renderWithRouter()

    const nameInput = screen.getByRole('textbox', { name: /カテゴリ名/ })
    const colorInput = screen.getByDisplayValue('#1976d2') // 色フィールド
    const descriptionInput = screen.getByRole('textbox', { name: /説明/ })

    fireEvent.change(nameInput, { target: { value: '学習' } })
    fireEvent.change(colorInput, { target: { value: '#4caf50' } })
    fireEvent.change(descriptionInput, {
      target: { value: '学習関連のタスク' },
    })

    expect(nameInput).toHaveValue('学習')
    expect(colorInput).toHaveValue('#4caf50')
    expect(descriptionInput).toHaveValue('学習関連のタスク')
  })

  // 概要: 新規作成フォームの送信機能をテスト
  // 目的: 作成ボタンクリック時に正しくカテゴリが作成されることを保証
  it('submits create form correctly', async () => {
    const { useParams } = vi.mocked(await import('react-router-dom'))
    useParams.mockReturnValue({})

    renderWithRouter()

    const nameInput = screen.getByRole('textbox', { name: /カテゴリ名/ })
    const colorInput = screen.getByDisplayValue('#1976d2') // 色フィールド
    const descriptionInput = screen.getByRole('textbox', { name: /説明/ })
    const submitButton = screen.getByRole('button', { name: '作成' })

    fireEvent.change(nameInput, { target: { value: '学習' } })
    fireEvent.change(colorInput, { target: { value: '#4caf50' } })
    fireEvent.change(descriptionInput, {
      target: { value: '学習関連のタスク' },
    })

    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(mockCreateCategory).toHaveBeenCalledWith({
        name: '学習',
        color: '#4caf50',
        description: '学習関連のタスク',
      })
    })

    expect(mockNavigate).toHaveBeenCalledWith('/categories')
  })

  // 概要: 編集フォームの送信機能をテスト
  // 目的: 更新ボタンクリック時に正しくカテゴリが更新されることを保証
  it('submits edit form correctly', async () => {
    const { useParams } = vi.mocked(await import('react-router-dom'))
    useParams.mockReturnValue({ id: 'work' })

    renderWithRouter('/categories/work/edit')

    const nameInput = screen.getByDisplayValue('仕事')
    const submitButton = screen.getByRole('button', { name: '更新' })

    fireEvent.change(nameInput, { target: { value: '重要な仕事' } })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(mockUpdateCategory).toHaveBeenCalledWith('work', {
        name: '重要な仕事',
        color: '#1976d2',
        description: '仕事関連のタスク',
      })
    })

    expect(mockNavigate).toHaveBeenCalledWith('/categories')
  })

  // 概要: 必須フィールドのバリデーション機能をテスト
  // 目的: カテゴリ名が空の場合にエラーメッセージが表示されることを保証
  it('shows validation error for empty name', async () => {
    const { useParams } = vi.mocked(await import('react-router-dom'))
    useParams.mockReturnValue({})

    renderWithRouter()

    // フォーム要素を見つけて直接submitする
    const form = document.querySelector('form')
    if (form) {
      fireEvent.submit(form)
    }

    await waitFor(
      () => {
        // エラー状態の確認
        const nameInput = screen.getByRole('textbox', { name: /カテゴリ名/ })
        expect(nameInput).toHaveAttribute('aria-invalid', 'true')
      },
      { timeout: 3000 }
    )

    // helperTextの確認
    expect(screen.getByText('カテゴリ名は必須です')).toBeInTheDocument()

    expect(mockCreateCategory).not.toHaveBeenCalled()
  })

  // 概要: 重複チェック機能をテスト
  // 目的: 既存のカテゴリ名と重複する場合にエラーが表示されることを保証
  it('shows validation error for duplicate name', async () => {
    const { useParams } = vi.mocked(await import('react-router-dom'))
    useParams.mockReturnValue({})

    renderWithRouter()

    const nameInput = screen.getByRole('textbox', { name: /カテゴリ名/ })
    const submitButton = screen.getByRole('button', { name: '作成' })

    fireEvent.change(nameInput, { target: { value: '仕事' } }) // 既存の名前
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(
        screen.getByText('このカテゴリ名は既に存在します')
      ).toBeInTheDocument()
    })

    expect(mockCreateCategory).not.toHaveBeenCalled()
  })

  // 概要: キャンセル機能をテスト
  // 目的: キャンセルボタンクリック時にカテゴリ一覧に戻ることを保証
  it('navigates to categories on cancel', async () => {
    const { useParams } = vi.mocked(await import('react-router-dom'))
    useParams.mockReturnValue({})

    renderWithRouter()

    const cancelButton = screen.getByRole('button', { name: 'キャンセル' })
    fireEvent.click(cancelButton)

    expect(mockNavigate).toHaveBeenCalledWith('/categories')
  })

  // 概要: 存在しないカテゴリの編集でエラー表示をテスト
  // 目的: 存在しないIDで編集画面にアクセスした場合の適切な処理を保証
  it('shows error for non-existent category in edit mode', async () => {
    const { useParams } = vi.mocked(await import('react-router-dom'))
    useParams.mockReturnValue({ id: 'non-existent' })

    renderWithRouter('/categories/non-existent/edit')

    expect(screen.getByText('カテゴリが見つかりません')).toBeInTheDocument()
  })
})
