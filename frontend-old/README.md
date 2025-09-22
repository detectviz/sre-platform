# SRE 平台前端

基於 React 18 + TypeScript + Ant Design v5 + Vite 的現代化 SRE 平台前端應用。

## 📋 核心契約文件 (SSOT)
前端開發必須嚴格遵循以下唯一真實來源：
- **[../openapi.yaml](../openapi.yaml)** - API 契約規範，所有 API 調用的標準
- **[../db_schema.sql](../db_schema.sql)** - 數據模型結構，TypeScript 類型定義參考
- **[../pages.md](../pages.md)** - UI 原型和功能規格
- **[../prototype.html](../prototype.html)** - 完整設計系統和視覺規範
- **[../TODO.md](../TODO.md)** - 開發任務分工和進度追蹤
- **[../AI_PROMPTS.md](../AI_PROMPTS.md)** - AI 協作開發指引

## 🚀 快速開始

### 開發環境啟動
```bash
npm install
npm run dev
```

### 與 Mock Server 聯調
```bash
# 終端 1: 啟動 Mock Server
cd ../mock-server
PORT=8080 node server.js

# 終端 2: 啟動前端開發服務器
cd frontend
npm run dev
```

## 🏗️ 技術棧

- **React 18** - 前端框架
- **TypeScript** - 類型安全
- **Ant Design v5** - UI 組件庫
- **Vite** - 構建工具
- **ECharts** - 圖表庫
- **dayjs** - 日期處理

## 📁 項目結構

```
src/
├── components/
│   ├── common/          # 共享組件 (AI Agent A 負責)
│   ├── incident/        # 事件管理組件 (AI Agent B 負責)
│   ├── resource/        # 資源管理組件 (AI Agent C 負責)
│   └── charts/          # 圖表組件 (AI Agent C 負責)
├── hooks/               # 自定義 hooks (與 openapi.yaml 對應)
├── pages/               # 頁面組件
├── styles/              # 設計系統 CSS (基於 prototype.html)
├── types/               # TypeScript 類型定義 (基於 openapi.yaml)
└── utils/               # 工具函數
```

## 🎨 設計系統

前端設計完全基於 `../prototype.html` 中定義的設計系統：
- CSS 變量系統 (品牌色、間距、陰影)
- 玻璃效果 (glass morphism) 設計
- 深色主題支持
- 響應式設計

## 🔌 API 整合

所有 API 調用必須遵循 `../openapi.yaml` 契約：
- 使用標準化的錯誤處理
- 支持分頁和查詢參數
- 實現正確的 HTTP 狀態碼
- 與 Mock Server (localhost:8080) 完整對接

## 👥 開發協作

本項目採用 AI 協作開發模式：
- **AI Agent A**: 設計系統與核心組件
- **AI Agent B**: 事件管理模組
- **AI Agent C**: 資源管理與儀表板

詳細分工請參考 `../TODO.md` 和 `../AI_PROMPTS.md`。

## ✅ 開發檢查清單

- [ ] 遵循 `openapi.yaml` API 契約
- [ ] 使用 `prototype.html` 設計系統
- [ ] 實現 `pages.md` 功能規格
- [ ] TypeScript 嚴格模式無錯誤
- [ ] 響應式設計適配
- [ ] 深色主題一致性
- [ ] 與 Mock Server API 整合無錯誤

## 📚 相關文檔

- [專案總 README](../README.md)
- [架構設計](../docs/architecture.md)
- [部署指南](../docs/DEPLOYMENT.md)
- [開發規劃](../docs/development.md)