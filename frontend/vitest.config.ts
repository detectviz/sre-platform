/// <reference types="vitest/globals" />
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'
import { resolve } from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    css: true,
    // 測試超時時間
    testTimeout: 10000,
    // 並發運行
    threads: true,
    // 環境變數
    environmentVariables: {
      NODE_ENV: 'test',
    },
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      exclude: [
        'node_modules/',
        'src/test/',
        '**/*.d.ts',
        '**/*.config.*',
        'dist/',
        '**/*.stories.*',
        '**/*.story.*',
        'src/main.tsx',
        'src/vite-env.d.ts',
      ],
      // 覆蓋率閾值
      thresholds: {
        global: {
          branches: 70,
          functions: 70,
          lines: 70,
          statements: 70,
        },
      },
      // 包含源文件
      include: ['src/**/*.{ts,tsx}'],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@/components/*': path.resolve(__dirname, './src/components/*'),
      '@/hooks/*': path.resolve(__dirname, './src/hooks/*'),
      '@/utils/*': path.resolve(__dirname, './src/utils/*'),
      '@/types/*': path.resolve(__dirname, './src/types/*'),
    },
  },
})
