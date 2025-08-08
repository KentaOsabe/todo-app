import '@testing-library/jest-dom'
import '@testing-library/jest-dom/vitest'

// matchMediaのモック - ダークモード機能のテストに必要
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => {},
  }),
})
