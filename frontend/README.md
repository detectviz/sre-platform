# SRE Platform Frontend

SRE 平台的前端應用，基於 React + TypeScript + Ant Design 5 開發。

## 🚀 快速開始

### 安裝依賴

```bash
npm install
```

### 啟動開發服務器

```bash
npm run dev
```

### 建構生產版本

```bash
npm run build
```

### 預覽生產版本

```bash
npm run preview
```

## 📁 項目結構

```
src/
├── components/          # 共用組件
│   ├── ContextualKPICard.tsx    # KPI 狀態卡片
│   ├── ToolbarActions.tsx       # 工具列操作
│   ├── PageHeader.tsx          # 頁面標題
│   └── index.ts                # 組件匯出
├── layouts/             # 佈局組件
│   └── AppLayout.tsx           # 主應用佈局
├── pages/               # 頁面組件
│   ├── HomePage.tsx            # 首頁
│   ├── IncidentsPage.tsx       # 事件管理頁面
│   ├── ResourcesPage.tsx       # 資源管理頁面
│   ├── SettingsPage.tsx        # 設定頁面
│   └── ProfilePage.tsx         # 個人資料頁面
├── styles/              # 樣式文件
│   ├── variables.css           # 設計系統變數
│   ├── design-system.css       # 設計系統樣式
├── hooks/               # 自訂 Hooks
│   └── useLocalStorage.ts      # 本地存儲 Hook
├── App.tsx              # 主應用組件
├── main.tsx             # 應用入口
└── index.css            # 全域樣式
```

## 🎨 設計系統

採用統一的設計系統，包含：

- **深色主題**：預設深色主題，支援淺色模式切換
- **玻璃效果**：現代化的毛玻璃效果組件
- **統一間距**：基於 8px 網格系統的間距規範
- **語義化色彩**：基於業務含義的色彩定義
- **統一圖標語言**：一致的 Ant Design 圖標使用

## 🛠️ 技術棧

- **React 18** - UI 框架
- **TypeScript** - 類型檢查
- **Vite** - 建構工具
- **React Router DOM** - 路由管理
- **Ant Design 5** - UI 組件庫
- **React Query** - 數據獲取和狀態管理
- **ESLint** - 代碼檢查

## 📱 功能模組

1. **首頁** - SRE 戰情室，系統狀態總覽
2. **事件管理** - 事件監控、規則配置、靜音管理
3. **資源管理** - 資源清單、群組管理、拓撲視圖
4. **儀表板管理** - 系統監控和業務洞察
5. **分析中心** - 容量規劃和效能分析
6. **自動化中心** - 腳本管理和排程配置
7. **設定** - 系統全域配置管理
8. **個人資料** - 用戶資訊和偏好設定

## 🔧 開發指南

### 新增頁面

1. 在 `src/pages/` 目錄建立新頁面組件
2. 在 `App.tsx` 中添加路由配置
3. 在菜單配置中添加導航項目

### 新增組件

1. 在 `src/components/` 目錄建立新組件
2. 在 `components/index.ts` 中匯出
3. 在需要使用的頁面中導入

### 樣式開發

使用 CSS 變數進行樣式開發：

```css
.my-component {
  background: var(--bg-elevated);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-lg);
  padding: var(--spacing-lg);
}
```

## 📄 授權

MIT License
