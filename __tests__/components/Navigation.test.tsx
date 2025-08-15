import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import { Navigation } from '../../src/components/Navigation'

const renderWithRouter = (initialPath: string) => {
  return render(
    <MemoryRouter
      initialEntries={[initialPath]}
      future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
    >
      <Navigation />
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
})
