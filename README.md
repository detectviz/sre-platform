# SRE 平台前端專案

本專案是 SRE (Site Reliability Engineering) 平台的前端實現，使用 `React` + `TypeScript` + `Vite` 進行開發，旨在提供一個現代化、高效能的運維管理界面。

## 專案概述

SRE 平台前端專案遵循 specs.md 中定義的規格，實現了完整的運維管理功能，包括儀表板、資源管理、事件處理、自動化腳本、容量規劃等核心模組。

## 技術棧

- **核心框架**: `React`
- **語言**: `TypeScript`
- **建構工具**: `Vite`
- **UI 元件庫**: `Ant Design (AntD)`
- **狀態管理**: `Redux Toolkit (RTK)`
- **資料視覺化**: `ECharts for React`
- **前端路由**: `React Router`

## 專案結構

根據 specs.md 中的全局開發原則，項目採用以下目錄結構：

```
src/
├── components/     # 可在多個頁面間複用的展示型元件
├── features/       # 特定功能模組相關檔案 (e.g., features/Dashboard)
├── services/       # 自動生成的 API 客戶端 (RTK Query)
├── store/          # Redux store
├── layouts/        # 應用程式的主體佈局元件
├── pages/          # 頁面級元件，負責組合 layout 和 features
└── utils/          # 工具函數
```

## 開發

1. **安裝依賴**:
    ```bash
    npm install
    ```

2. **啟動開發伺服器**:
    ```bash
    npm run dev
    ```
    伺服器將會啟動在 `http://localhost:5173`，並支援熱模組替換 (HMR)。

3. **程式碼規範**:
    - 使用 ESLint 進行程式碼檢查
    - 遵循 specs.md 中定義的開發原則和元件設計模式

4. **開發流程**:
    - 開發完成後，檢查相關文件是否需要更新
    - 更新 [TODO.md](./TODO.md) 中的開發進度
    - 確保所有變更都符合 [AGENT.md](./AGENT.md) 中的規範

## 建構

若要為生產環境建構應用程式，請執行：

```bash
npm run build
```

這會在 `dist/` 目錄下產生最佳化後的靜態檔案。

## 測試

項目包含單元測試和整合測試，運行測試：

```bash
npm run test
```

## 部署

建構完成後，將 `dist/` 目錄下的檔案部署到 Web 伺服器即可。

## 規格文件

- [specs.md](./specs.md) - 前端開發規格書 (SSOT)
- [openapi.yaml](./openapi.yaml) - 後端 API 規格
- [TODO.md](./TODO.md) - 開發驗收清單
- [AGENT.md](./AGENT.md) - AI 開發守則

## 貢獻

請參考 specs.md 中的開發原則進行貢獻，確保程式碼風格和架構一致。

## 授權

本項目採用 Apache 2.0 授權，詳情請見 [LICENSE](./LICENSE) 文件。