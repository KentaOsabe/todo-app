import { renderHook, act } from '@testing-library/react'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useLocalStorage } from './useLocalStorage'

// localStorageのモック
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
}

// グローバルオブジェクトのlocalStorageをモックで置き換え
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
})

describe('useLocalStorage', () => {
  beforeEach(() => {
    // 各テスト前にモックをリセット
    localStorageMock.getItem.mockClear()
    localStorageMock.setItem.mockClear()
    localStorageMock.removeItem.mockClear()
    localStorageMock.clear.mockClear()
  })

  // 概要: 初期値が正しく設定されることをテスト
  // 目的: localStorageに値がない場合、初期値が使用されることを確認
  it('returns initial value when localStorage is empty', () => {
    localStorageMock.getItem.mockReturnValue(null)
    
    const { result } = renderHook(() => useLocalStorage('test-key', 'initial-value'))
    
    expect(result.current[0]).toBe('initial-value')
    expect(localStorageMock.getItem).toHaveBeenCalledWith('test-key')
  })

  // 概要: localStorageから既存の値を正しく読み込むことをテスト
  // 目的: 保存された値が正しく復元されることを確認
  it('returns stored value from localStorage', () => {
    localStorageMock.getItem.mockReturnValue(JSON.stringify('stored-value'))
    
    const { result } = renderHook(() => useLocalStorage('test-key', 'initial-value'))
    
    expect(result.current[0]).toBe('stored-value')
    expect(localStorageMock.getItem).toHaveBeenCalledWith('test-key')
  })

  // 概要: 値を更新したときにlocalStorageに保存されることをテスト
  // 目的: setValue関数が正しく動作することを確認
  it('updates localStorage when value is set', () => {
    localStorageMock.getItem.mockReturnValue(null)
    
    const { result } = renderHook(() => useLocalStorage('test-key', 'initial-value'))
    
    act(() => {
      result.current[1]('new-value')
    })
    
    expect(result.current[0]).toBe('new-value')
    expect(localStorageMock.setItem).toHaveBeenCalledWith('test-key', JSON.stringify('new-value'))
  })

  // 概要: 関数型の値更新が正しく動作することをテスト
  // 目的: setValue((prev) => newValue)の形式が正しく動作することを確認
  it('updates value using function updater', () => {
    localStorageMock.getItem.mockReturnValue(JSON.stringify(5))
    
    const { result } = renderHook(() => useLocalStorage('test-key', 0))
    
    act(() => {
      result.current[1]((prev: number) => prev + 1)
    })
    
    expect(result.current[0]).toBe(6)
    expect(localStorageMock.setItem).toHaveBeenCalledWith('test-key', JSON.stringify(6))
  })

  // 概要: オブジェクトや配列が正しく保存・復元されることをテスト
  // 目的: JSON.stringify/parseが正しく動作することを確認
  it('handles complex objects correctly', () => {
    const complexObject = { items: ['todo1', 'todo2'], count: 2 }
    localStorageMock.getItem.mockReturnValue(JSON.stringify(complexObject))
    
    const { result } = renderHook(() => useLocalStorage('test-key', { items: [], count: 0 }))
    
    expect(result.current[0]).toEqual(complexObject)
  })

  // 概要: localStorageでエラーが発生した場合の処理をテスト
  // 目的: エラーハンドリングが正しく動作することを確認
  it('handles localStorage errors gracefully', () => {
    localStorageMock.getItem.mockImplementation(() => {
      throw new Error('Storage error')
    })
    
    // コンソール警告をモック
    const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    
    const { result } = renderHook(() => useLocalStorage('test-key', 'fallback-value'))
    
    expect(result.current[0]).toBe('fallback-value')
    expect(consoleWarnSpy).toHaveBeenCalled()
    
    consoleWarnSpy.mockRestore()
  })
})