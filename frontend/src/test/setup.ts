import '@testing-library/jest-dom'

// Mock Ant Design 的動態樣式載入
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (() => ({
    matches: false,
    media: '',
    onchange: null,
    addListener: () => { }, // deprecated
    removeListener: () => { }, // deprecated
    addEventListener: () => { },
    removeEventListener: () => { },
    dispatchEvent: () => { },
  })),
})

  // Mock ResizeObserver
  (global as any).ResizeObserver = (() => ({
    observe: () => { },
    unobserve: () => { },
    disconnect: () => { },
  }))

    // Mock IntersectionObserver
    (global as any).IntersectionObserver = (() => ({
      observe: () => { },
      unobserve: () => { },
      disconnect: () => { },
    }))

// 清理測試後的狀態
import { afterEach } from 'vitest'
afterEach(() => {
  document.body.innerHTML = ''
})
