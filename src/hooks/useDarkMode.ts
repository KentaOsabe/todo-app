import { useState, useEffect } from 'react'
import { useLocalStorage } from './useLocalStorage'

export interface UseDarkModeReturn {
  isDarkMode: boolean
  toggleDarkMode: () => void
  setDarkMode: (value: boolean) => void
}

export function useDarkMode(): UseDarkModeReturn {
  // システムのダークモード設定を検出
  const getSystemPreference = (): boolean => {
    if (typeof window === 'undefined') return false
    
    try {
      return window.matchMedia('(prefers-color-scheme: dark)').matches
    } catch (error) {
      console.warn('matchMedia not supported:', error)
      return false
    }
  }

  const systemPreference = getSystemPreference()
  
  // localStorageから設定を取得、なければシステム設定を使用
  const [storedDarkMode, setStoredDarkMode] = useLocalStorage<boolean | null>(
    'darkMode', 
    null
  )

  // 実際のダークモード状態
  const [isDarkMode, setIsDarkMode] = useState<boolean>(
    storedDarkMode !== null ? storedDarkMode : systemPreference
  )

  // システム設定の変更を監視
  useEffect(() => {
    if (typeof window === 'undefined') return

    try {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
      
      const handleChange = (e: MediaQueryListEvent) => {
        // ユーザーが明示的に設定していない場合のみシステム設定に従う
        if (storedDarkMode === null) {
          setIsDarkMode(e.matches)
        }
      }

      mediaQuery.addEventListener('change', handleChange)
      return () => mediaQuery.removeEventListener('change', handleChange)
    } catch (error) {
      console.warn('Error setting up system preference listener:', error)
    }
  }, [storedDarkMode])

  // ストレージの値が変更されたときにstateを更新
  useEffect(() => {
    if (storedDarkMode !== null) {
      setIsDarkMode(storedDarkMode)
    } else {
      setIsDarkMode(getSystemPreference())
    }
  }, [storedDarkMode])

  const toggleDarkMode = () => {
    const newValue = !isDarkMode
    setStoredDarkMode(newValue)
    setIsDarkMode(newValue)
  }

  const setDarkMode = (value: boolean) => {
    setStoredDarkMode(value)
    setIsDarkMode(value)
  }

  return {
    isDarkMode,
    toggleDarkMode,
    setDarkMode,
  }
}