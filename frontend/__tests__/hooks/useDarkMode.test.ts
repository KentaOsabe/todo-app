import { renderHook, act } from '@testing-library/react'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useDarkMode } from '../../src/hooks/useDarkMode'

// localStorageのモック
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
}

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
})

// matchMediaのモック
const matchMediaMock = vi.fn()
Object.defineProperty(window, 'matchMedia', {
  value: matchMediaMock,
})

describe('useDarkMode', () => {
  beforeEach(() => {
    // 各テスト前にモックをリセット
    localStorageMock.getItem.mockClear()
    localStorageMock.setItem.mockClear()
    matchMediaMock.mockClear()
  })

  // 概要: 初期状態でシステム設定を検出することをテスト
  // 目的: ユーザーのシステム設定（ダークモード）を自動検出することを保証
  it('detects system dark mode preference initially', () => {
    localStorageMock.getItem.mockReturnValue(null)
    matchMediaMock.mockReturnValue({
      matches: true,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })

    const { result } = renderHook(() => useDarkMode())

    expect(result.current.isDarkMode).toBe(true)
    expect(matchMediaMock).toHaveBeenCalledWith('(prefers-color-scheme: dark)')
  })

  // 概要: システム設定がライトモードの場合の初期状態をテスト
  // 目的: ライトモードのシステム設定が正しく検出されることを確認
  it('detects system light mode preference initially', () => {
    localStorageMock.getItem.mockReturnValue(null)
    matchMediaMock.mockReturnValue({
      matches: false,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })

    const { result } = renderHook(() => useDarkMode())

    expect(result.current.isDarkMode).toBe(false)
  })

  // 概要: localStorageに保存された設定を優先することをテスト
  // 目的: ユーザーの明示的な選択がシステム設定より優先されることを保証
  it('uses stored preference over system preference', () => {
    localStorageMock.getItem.mockReturnValue(JSON.stringify(true))
    matchMediaMock.mockReturnValue({
      matches: false, // システムはライトモード
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })

    const { result } = renderHook(() => useDarkMode())

    expect(result.current.isDarkMode).toBe(true) // ストレージの設定を使用
  })

  // 概要: ダークモードのトグル機能をテスト
  // 目的: toggleDarkMode関数が正しく動作することを確認
  it('toggles dark mode and saves to localStorage', () => {
    localStorageMock.getItem.mockReturnValue(null)
    matchMediaMock.mockReturnValue({
      matches: false,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })

    const { result } = renderHook(() => useDarkMode())

    expect(result.current.isDarkMode).toBe(false)

    act(() => {
      result.current.toggleDarkMode()
    })

    expect(result.current.isDarkMode).toBe(true)
    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      'darkMode',
      JSON.stringify(true)
    )
  })

  // 概要: 手動設定機能をテスト
  // 目的: setDarkMode関数で明示的にモードを設定できることを確認
  it('allows manual setting of dark mode', () => {
    localStorageMock.getItem.mockReturnValue(null)
    matchMediaMock.mockReturnValue({
      matches: false,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })

    const { result } = renderHook(() => useDarkMode())

    act(() => {
      result.current.setDarkMode(true)
    })

    expect(result.current.isDarkMode).toBe(true)
    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      'darkMode',
      JSON.stringify(true)
    )

    act(() => {
      result.current.setDarkMode(false)
    })

    expect(result.current.isDarkMode).toBe(false)
    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      'darkMode',
      JSON.stringify(false)
    )
  })

  // 概要: システム設定変更時の動的更新をテスト
  // 目的: ユーザーがシステム設定を変更したときの自動追従を確認
  it('updates when system preference changes', () => {
    const mockAddEventListener = vi.fn()
    const mockRemoveEventListener = vi.fn()

    localStorageMock.getItem.mockReturnValue(null)
    matchMediaMock.mockReturnValue({
      matches: false,
      addEventListener: mockAddEventListener,
      removeEventListener: mockRemoveEventListener,
    })

    const { unmount } = renderHook(() => useDarkMode())

    expect(mockAddEventListener).toHaveBeenCalledWith(
      'change',
      expect.any(Function)
    )

    unmount()

    expect(mockRemoveEventListener).toHaveBeenCalledWith(
      'change',
      expect.any(Function)
    )
  })

  // 概要: エラー処理のテスト
  // 目的: matchMediaが利用不可能な環境でも正常に動作することを確認
  it('handles environments without matchMedia', () => {
    localStorageMock.getItem.mockReturnValue(null)
    matchMediaMock.mockImplementation(() => {
      throw new Error('matchMedia not supported')
    })

    const { result } = renderHook(() => useDarkMode())

    // エラーが発生してもデフォルト値（false）が返される
    expect(result.current.isDarkMode).toBe(false)
  })
})
