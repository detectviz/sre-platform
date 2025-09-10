# SRE 平台前端項目

這是一個基於 React、TypeScript 和 Ant Design 的 SRE 平台前端項目，實現了 specs.md 中定義的所有功能頁面。

## 技術棧

- React 18
- TypeScript
- Ant Design 5
- ECharts 5
- React Router 6
- Redux Toolkit 

## 如何運行

1. 安裝依賴：
   ```
   npm install
   ```

2. 啟動開發服務器：
   ```
   npm run dev
   ```

3. 構建生產版本：
   ```
   npm run build
   ```

## 開發指南

1. 所有頁面組件位於 `src/pages/` 目錄下
2. 全局佈局組件位於 `src/layouts/` 目錄下
3. 可複用組件位於 `src/components/` 目錄下
4. 功能模組組件位於 `src/features/` 目錄下
5. 路由配置在 `src/App.tsx` 文件中

## 注意事項

1. 項目使用 Vite 作為構建工具
2. 圖表組件使用 ECharts 實現
3. UI 組件主要使用 Ant Design
4. 路由使用 React Router 實現