# SRE 平台前端專案

本專案使用 `React` + `TypeScript` + `Vite` 進行開發。

這是一個基礎樣板，提供了一個最小化的設定，讓 React 能夠在 Vite 中正常運作，並包含熱模組替換 (HMR) 和一些基礎的 ESLint 規則。

## 技術棧

- **核心框架**: `React`
- **語言**: `TypeScript`
- **建構工具**: `Vite`
- **UI 元件庫**: `Ant Design (AntD)`
- **狀態管理**: `Redux Toolkit (RTK)`
- **資料視覺化**: `ECharts for React`
- **前端路由**: `React Router`

## 開發

1.  **安裝依賴**:
    ```bash
    npm install
    ```

2.  **啟動開發伺服器**:
    ```bash
    npm run dev
    ```
    伺服器將會啟動在 `http://localhost:5173`。

## 建構

若要為生產環境建構應用程式，請執行：

```bash
npm run build
```

這會在 `dist/` 目錄下產生最佳化後的靜態檔案。

## ESLint 設定擴展

如果您正在開發一個生產級別的應用程式，我們建議更新設定以啟用類型感知的 lint 規則，這有助於在開發階段捕捉到更多潛在錯誤。

更多資訊請參考 `vite-plugin-react` 的官方文件。
