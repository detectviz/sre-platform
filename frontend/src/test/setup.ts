/// <reference types="vitest/globals" />
import '@testing-library/jest-dom'

// Mock matchMedia
(globalThis as any).matchMedia = (() => ({
  matches: false,
  media: '',
  onchange: null,
  addListener: () => {},
  removeListener: () => {},
  addEventListener: () => {},
  removeEventListener: () => {},
  dispatchEvent: () => {},
}))

// Mock ResizeObserver
(globalThis as any).ResizeObserver = (() => ({
  observe: () => {},
  unobserve: () => {},
  disconnect: () => {},
}))

// Mock IntersectionObserver
(globalThis as any).IntersectionObserver = (() => ({
  observe: () => {},
  unobserve: () => {},
  disconnect: () => {},
}))

// Mock window.location methods
Object.defineProperty(window, 'location', {
  value: {
    ...window.location,
    reload: () => { },
    replace: () => { },
    assign: () => { },
  },
  writable: true,
})

// 監控 console 錯誤
const originalConsoleError = console.error
console.error = (...args: any[]) => {
  // 如果是測試預期的錯誤，則不拋出異常
  if (args[0]?.includes?.('Warning: ReactDOM.render is deprecated')) {
    return
  }
  originalConsoleError.apply(console, args)
}

// 全局測試設置
beforeAll(() => {
  // 設置測試環境標誌
  (globalThis as any).process = { env: { NODE_ENV: 'test' } }
})

afterAll(() => {
  // 恢復原始環境
  (globalThis as any).process = { env: { NODE_ENV: 'development' } }
})

// 清理測試後的狀態
afterEach(() => {
  document.body.innerHTML = ''
    // 清理所有 timers
    (globalThis as any).jest?.clearAllTimers?.()
    // 清理所有 mocks
    (globalThis as any).jest?.clearAllMocks?.()
})
