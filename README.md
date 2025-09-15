# SRE 平台 - 新一代自動化維運平台

[![React](https://img.shields.io/badge/React-18+-61DAFB?logo=react&logoColor=white)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Ant Design](https://img.shields.io/badge/Ant%20Design-5.0+-0170FE?logo=antdesign&logoColor=white)](https://ant.design/)
[![ECharts](https://img.shields.io/badge/ECharts-5.0+-AA344D)](https://echarts.apache.org/)
[![License](https://img.shields.io/badge/License-Apache%202.0-green.svg)](LICENSE)

> 🚀 **現代化 SRE 工作流程的智能化平台 - 從被動故障應對到主動系統管理的完美轉型**

這是一個基於 React、TypeScript 和 Ant Design 的 SRE 平台前端項目，實現了 specs.md 中定義的所有功能頁面。

---

## 🎯 專案亮點

- **🧠 智能化診斷**: 提供可擴展的診斷引擎與自動化工作流程，支援AI驅動的根因分析
- **⚡ 零配置啟動**: 一鍵 `npm install` + `npm run dev` 完成環境設定
- **📊 全方位監控**: 整合 Prometheus、Loki、Grafana 構建完整可觀測性棧
- **🛡️ 企業級安全**: 基於 Keycloak 的 OIDC 認證系統，支援M2M服務間通訊
- **🎨 現代化 UI**: React + Ant Design 驅動的響應式介面，輕量且高效
- **🔧 開發友好**: 完整的 TypeScript 支援與熱重載，Vite 快速構建
- **🏗️ 統一管理層**: 作為「統一管理平面」(Unified Management Plane)，整合Grafana Alerting等開源工具
- **⚡ 自動化引擎**: 支持事件驅動、排程觸發、手動觸發、Webhook觸發四大自動化機制

## 📖 目錄

- [專案簡介](#專案簡介)
- [核心架構](#核心架構)
- [互動原型體驗](#互動原型體驗)
- [技術棧](#技術棧)
- [快速入門](#快速入門)
- [功能展示](#功能展示)
- [開發指南](#開發指南)
- [專案結構](#專案結構)
- [詳細文件](#詳細文件)
- [部署說明](#部署說明)
- [貢獻指南](#貢獻指南)

---

## 專案簡介

SRE 平台是一個現代化的維運平台，專為企業級 SRE 團隊設計。作為「統一管理平面」(Unified Management Plane)，它整合 Grafana Alerting、Grafana OnCall 等開源工具，實現從傳統的被動故障應對模式向主動系統管理的革命性轉變。

本平台遵循 [Google SRE Book](https://sre.google/sre-book/) 的最佳實踐，主要參考章節：

- **[Chapter 4: Service Level Objectives](google-sre-book/Chapter-04-Service-Level-Objectives.md)** - SLO/SLA 管理框架
- **[Chapter 6: Monitoring Distributed Systems](google-sre-book/Chapter-06-Monitoring-Distributed-Systems.md)** - 四個黃金信號監控
- **[Chapter 7: The Evolution of Automation at Google](google-sre-book/Chapter-07-The-Evolution-of-Automation-at-Google.md)** - 自動化哲學
- **[Chapter 14: Managing Incidents](google-sre-book/Chapter-14-Managing-Incidents.md)** - 事件管理實踐

實現服務水準目標 (SLO) 管理、錯誤預算控制、四個黃金信號監控等核心功能。

### 🏗️ 核心組件

<table>
<tr>
<td width="50%">

**🎯 前端平台 (React + TypeScript)**
- **角色**: 現代化 Web UI 指揮中心
- **技術**: React 18 + TypeScript + Ant Design 5
- **職責**:
  - 統一的管理介面
  - 資源生命週期管理
  - 任務編排與調度
  - 使用者認證與授權

</td>
<td width="50%">

**🔧 後端服務 (API)**
- **角色**: RESTful API 服務與智慧告警處理中樞
- **技術**: 整合現有後端服務 + Webhook服務
- **職責**:
  - 業務邏輯處理
  - 數據存儲與管理
  - 外部系統整合
  - AI Agent驅動的根因分析
  - 自動化修復與告警風暴總結

</td>
</tr>
</table>

### 🎨 設計理念

```mermaid
graph LR
    A[傳統被動模式] -->|轉型| B[智能主動模式]

    subgraph "被動模式"
        A1[人工監控] --> A2[告警響應] --> A3[手動診斷] --> A4[人工修復]
    end

    subgraph "主動模式"
        B1[智能監控] --> B2[預測分析] --> B3[自動診斷] --> B4[智能修復]
    end
```

---

## 核心架構

### 🏛️ 整體架構圖

```mermaid
graph TB
    subgraph "🌐 使用者層"
        User([👨‍💻 SRE 工程師])
        Admin([👩‍💼 系統管理員])
    end

    subgraph "🎯 前端平台 (React)"
        Frontend[🖥️ React Web UI<br/>TypeScript + Ant Design]
        Router[🔀 React Router<br/>頁面導航]
    end

    subgraph "🔧 後端服務層"
        API[🔌 REST API<br/>業務邏輯處理]
        Auth[🔐 認證服務<br/>Keycloak OIDC]
    end

    subgraph "💾 數據與監控層"
        Database[(🐘 PostgreSQL<br/>業務數據庫)]
        Timeseries[(📊 VictoriaMetrics<br/>時序數據庫)]
        Cache[(⚡ Redis<br/>快取服務)]
        Monitoring[🔍 可觀測性堆疊<br/>Prometheus + Loki]
        Grafana[📈 Grafana<br/>可視化平台]
    end

    subgraph "📡 外部系統"
        Infrastructure[🏗️ 基礎設施<br/>K8s + Docker + ...]
        External[🔗 第三方服務<br/>工單系統 + 通知管道]
    end

    %% 使用者互動
    User --> Frontend
    Admin --> Frontend

    %% 前後端通訊
    Frontend --> API
    API --> Auth

    %% 數據流
    API --> Database
    Frontend --> Timeseries
    Frontend --> Grafana

    %% 監控目標
    Monitoring --> Infrastructure
    API --> External
```

### 🔄 關鍵架構特性

- **📱 響應式設計**: 適配桌面、平板、行動設備
- **🔒 安全認證**: OIDC/OAuth2 整合 Keycloak
- **📊 實時監控**: 整合 Grafana 儀表板與告警
- **🔄 狀態管理**: Redux Toolkit 統一狀態管理
- **🎨 組件化**: 高可複用的 UI 組件設計
- **🏗️ 統一管理層**: 作為「統一管理平面」(Unified Management Plane)
- **🤖 智慧告警處理**: Webhook作為AI整合點，所有告警先經平台再分發
- **⚡ 自動化引擎**: 支持事件驅動、排程觸發、手動觸發、Webhook觸發四大機制

---

## 互動原型體驗

我們提供了一個功能完整的互動原型，讓您無需安裝即可體驗平台的核心功能：

🌟 **[立即體驗 Live Demo](https://detectviz.github.io/sre-platform-frontend/prototype.html)**

### 📱 功能預覽

![主頁](images/dashboard.png)
![alerts-list](images/alerts-list.png)
![resource-overview](images/resource-overview.png)
![capacity-planning](images/capacity-planning.png)

---

## 技術棧

### 🎨 前端框架
- **React 18** - 最新的 React 版本，提供更好的性能和開發體驗
- **TypeScript 5.0+** - 提供類型安全和更好的開發體驗
- **Ant Design 5** - 企業級 UI 組件庫，提供豐富的組件和設計語言
- **React Router 6** - 現代化的路由管理

### 📊 數據可視化
- **ECharts 5** - 強大的圖表庫，支持多種圖表類型
- **@ant-design/charts** - 基於 G2Plot 的 React 圖表組件

### 🏪 狀態管理與數據
- **Redux Toolkit** - 現代化的 Redux 狀態管理方案
- **React Query** - 強大的數據獲取和快取庫
- **Axios** - HTTP 客戶端，支持請求攔截和響應處理

### 🛠️ 開發工具
- **Vite** - 快速的現代化構建工具
- **ESLint + Prettier** - 代碼規範和格式化
- **Husky + lint-staged** - Git 鉤子和代碼檢查

### 📦 其他依賴
- **Day.js** - 輕量級的日期處理庫
- **lodash** - 實用的 JavaScript 工具函數庫
- **clsx** - 條件性 CSS 類名工具

### 🔧 關鍵技術決策

#### 統一管理層架構
- **告警管理完全委託給 Grafana**：不自行實作告警規則判斷邏輯，專注於用戶體驗
- **用戶狀態管理完全委託給 Keycloak**：移除平台內用戶狀態欄位，簡化管理介面
- **數據收集策略**：優先使用`node_exporter`進行深度監控，無法安裝時fallback到`snmp_exporter`

---

## 快速入門

### 🎯 環境要求

| 項目 | 版本要求 | 說明 |
|------|----------|------|
| **Node.js** | 18.0+ | 運行 React 應用 |
| **npm** | 8.0+ | 包管理工具 |
| **Git** | 2.0+ | 版本控制 |

### 🚀 一鍵啟動

```bash
# 📥 1. 下載專案
git clone https://github.com/detectviz/sre-platform-frontend
cd sre-platform-frontend

# ⚡ 2. 安裝依賴
npm install

# 🚀 3. 啟動開發服務器
npm run dev

# ✅ 4. 訪問應用
# 打開瀏覽器訪問 http://localhost:5173
```

### 🛠️ 常用指令

```bash
# 📊 開發服務器
npm run dev          # 啟動開發服務器
npm run build        # 構建生產版本
npm run preview      # 預覽生產版本

# 🧪 測試與檢查
npm run lint         # ESLint 代碼檢查
npm run lint:fix     # 自動修復 ESLint 錯誤
npm run format       # Prettier 代碼格式化

# 🔧 其他工具
npm run clean        # 清理快取和構建文件
npm run analyze      # 分析包大小
```

---

## 功能展示

### 📱 核心功能預覽

<table>
<tr>
<td width="33%">

**🎯 資源管理**
- 統一的基礎設施視圖
- 批次操作與網段掃描
- 即時狀態監控
- 智能分組管理

</td>
<td width="33%">

**🚨 智能告警**
- AI 驅動的根因分析
- 自動化修復建議
- 告警關聯與去重
- 結構化事件報告

</td>
<td width="33%">

**📊 容量規劃**
- 基於機器學習的預測
- 多維度趨勢分析
- 主動容量建議
- 成本優化建議

</td>
</tr>
</table>

### 🎯 分階段實施策略

#### Phase 1：監控與洞察核心 (當前)
- ✅ SRE主頁儀表板
- ✅ 資源列表與Top N資源列表
- ✅ 告警列表
- ✅ AI分析彈窗(唯讀版)

#### Phase 2：響應與協作整合 (未來)
- 🚀 查看Runbook功能
- 🚀 創建工單功能
- 🚀 其他系統整合

### 🔥 核心工作流程演示

```mermaid
sequenceDiagram
    participant U as 👨‍💻 SRE 工程師
    participant FE as 🎯 前端平台
    participant BE as 🔧 後端服務
    participant DB as 💾 數據庫

    U->>FE: 1. 點擊資源管理
    FE->>BE: 2. GET /api/resources
    activate BE
    BE->>DB: 3. 查詢資源數據
    DB-->>BE: 4. 返回資源列表
    BE-->>FE: 5. 返回 API 響應
    deactivate BE
    FE-->>U: 6. 渲染資源列表頁面
```

---

## 開發指南

### 📂 專案結構

```
sre-platform-frontend/
├── 📁 public/                    # 靜態資源
├── 📁 src/
│   ├── 📁 components/            # 可複用組件
│   │   ├── common/              # 通用組件
│   │   └── layout/              # 佈局組件
│   ├── 📁 pages/                # 頁面組件
│   │   ├── dashboard/           # 儀表板頁面
│   │   ├── resources/           # 資源管理頁面
│   │   ├── incidents/           # 事件管理頁面
│   │   └── settings/            # 設定頁面
│   ├── 📁 features/             # 功能模組
│   │   ├── auth/                # 認證功能
│   │   ├── monitoring/          # 監控功能
│   │   └── notifications/       # 通知功能
│   ├── 📁 hooks/                # 自訂 React Hooks
│   ├── 📁 utils/                # 工具函數
│   ├── 📁 types/                # TypeScript 類型定義
│   ├── 📁 constants/            # 常量定義
│   ├── 📁 services/             # API 服務
│   ├── 📁 store/                # Redux 狀態管理
│   ├── 📁 styles/               # 全局樣式
│   ├── App.tsx                  # 應用入口
│   └── main.tsx                 # React 入口
├── 📁 docs/                     # 文檔目錄
├── 📁 scripts/                  # 構建腳本
├── package.json                 # 項目配置
├── tsconfig.json                # TypeScript 配置
├── vite.config.ts               # Vite 配置
└── tailwind.config.js           # Tailwind CSS 配置
```

### 🔄 開發工作流程

```mermaid
gitgraph
    commit id: "🎯 Feature Planning"
    branch feature/new-component
    checkout feature/new-component
    commit id: "🔧 Component Implementation"
    commit id: "📝 Type Definitions"
    commit id: "🧪 Unit Tests"
    commit id: "📖 Documentation"
    checkout main
    merge feature/new-component
    commit id: "🚀 Release v1.x.x"
```

### 📝 開發規範

**🎯 代碼規範**：
- **TypeScript**: 強類型檢查，禁止使用 `any` 類型
- **React**: 使用函數組件 + Hooks，避免類組件
- **組件**: 使用小寫字母開頭，PascalCase 命名
- **文件**: 使用 kebab-case 命名

**📋 Commit 訊息範例**：
```
feat: 新增資源詳情頁面組件
fix: 修復圖表渲染錯誤
docs: 更新組件使用文檔
test: 增加資源列表單元測試
refactor: 重構狀態管理邏輯
```

---

## 詳細文件

我們提供了完整的文件體系，涵蓋使用、開發、架構等各個層面：

### 📚 核心文件

| 文件 | 目標讀者 | 內容概述 |
|------|----------|----------|
| **[📋 架構設計書](Architecture.md)** | 技術架構師、開發者 | 系統架構、設計理念、技術選型、重要決策 |
| **[🎯 使用者指南](specs.md)** | SRE 工程師、運維人員 | 功能說明、操作指南、互動原型 |
| **[🛠️ 開發總規劃](development.md)** | 專案經理、開發團隊 | 開發階段、任務規劃、里程碑 |
| **[🔧 組件文檔](ui-guide.md)** | UI/UX 設計師、前端開發者 | 組件設計規範、互動模式 |
| **[🤖 AI代理指南](AGENT.md)** | AI 開發者、代理系統 | AI 代理操作指南、自動化流程 |

### 📖 專業文件

- **[🔒 安全配置指南](docs/SECURITY.md)** - 認證、授權、加密配置
- **[📈 監控與告警](docs/MONITORING.md)** - 可觀測性最佳實踐
- **[🚀 部署指南](docs/DEPLOYMENT.md)** - 生產環境部署說明
- **[🔧 故障排除](docs/TROUBLESHOOTING.md)** - 常見問題與解決方案
- **[⚡ 性能調優](docs/PERFORMANCE.md)** - 性能優化指南

### 📚 參考資源

- **[🎓 Google SRE Book 參考指南](google-sre-book/REFERENCES.md)** - 本平台設計參考的核心理念和實踐
  - 包含具體章節連結和概念映射
  - 詳細說明每個功能模組的理論依據

---

## 部署說明

### 🐳 Docker 部署

```bash
# 構建 Docker 鏡像
docker build -t sre-platform-frontend .

# 運行容器
docker run -p 80:80 sre-platform-frontend
```

### ☁️ 雲端部署

- **Vercel**: 推薦用於靜態部署
- **Netlify**: 支持 CDN 和表單處理
- **AWS S3 + CloudFront**: 企業級部署方案

### 🔧 環境變數

```bash
# .env 檔案範例
VITE_API_BASE_URL=https://api.your-domain.com
VITE_GRAFANA_URL=https://grafana.your-domain.com
VITE_KEYCLOAK_URL=https://keycloak.your-domain.com
```

---

## 貢獻指南

### 🏃‍♂️ 本地開發設定

1. Fork 此專案
2. 建立功能分支: `git checkout -b feature/amazing-feature`
3. 提交變更: `git commit -m 'Add amazing feature'`
4. 推送分支: `git push origin feature/amazing-feature`
5. 開啟 Pull Request

### 📋 貢獻規範

- 所有新功能都需要對應的測試
- 確保通過所有 ESLint 和 TypeScript 檢查
- 更新相關文檔
- 遵循現有的代碼風格

### 🐛 問題回報

發現 Bug 或有功能建議？歡迎：

1. 檢查 [Issues](../../issues) 是否已有相關問題
2. 如果沒有，建立新的 Issue
3. 提供詳細的問題描述和重現步驟

---

## 📄 授權

本專案採用 Apache License 2.0 授權 - 詳見 [LICENSE](LICENSE) 文件

---

## 🙏 致謝

感謝所有為此專案做出貢獻的開發者和使用者！

特別感謝：
- [React](https://reactjs.org/) 團隊提供的優秀前端框架
- [Ant Design](https://ant.design/) 團隊提供的企業級 UI 組件
- [ECharts](https://echarts.apache.org/) 團隊提供的數據可視化工具