# SRE 平台前端項目

這是一個基於 React、TypeScript 和 Ant Design 的 SRE 平台前端項目，實現了 specs.md 中定義的所有功能頁面。

## 項目結構

```
src/
├── App.tsx                 # 應用程序根組件和路由配置
├── main.tsx                # 應用程序入口點
├── layouts/                # 全局佈局組件
│   └── MainLayout.tsx      # 主佈局組件，包含側邊欄和頂部導航
├── pages/                  # 頁面組件
│   ├── LoginPage.tsx        # 登入頁面
│   ├── DashboardPage.tsx   # 儀表板頁面
│   ├── ResourcesPage.tsx   # 資源管理頁面
│   ├── OrganizationPage.tsx # 團隊管理頁面
│   ├── AlertRulesPage.tsx  # 事件規則頁面
│   ├── AutomationPage.tsx  # 自動化頁面
│   ├── IncidentsPage.tsx   # 事件紀錄頁面
│   ├── CapacityPlanningPage.tsx # 容量規劃頁面
│   ├── NotificationChannelsPage.tsx # 通知管道頁面
│   ├── SystemSettingsPage.tsx # 系統設定頁面
│   ├── PlatformDiagnosticsPage.tsx # 平台診斷頁面
│   ├── RoleManagementPage.tsx # 角色管理頁面
│   ├── AuditLogsPage.tsx   # 審計日誌頁面
│   └── ProfileSettingsPage.tsx # 個人資料與設定頁面
├── components/             # 可複用組件
│   └── EchartsForReact.tsx # ECharts 圖表組件
└── features/               # 功能模組
    └── Notifications/      # 通知相關組件
        └── NotificationCenter.tsx # 通知中心組件
```

## 功能實現

根據 specs.md 文件的要求，我們實現了以下功能頁面：

1. **全局佈局與導航** - 包含頂部導航、側邊選單和主內容區
2. **登入與登出** - 登入表單和登出功能
3. **儀表板頁面** - 系統健康狀況和關鍵指標展示
4. **資源管理** - 資源列表和管理功能
5. **團隊管理** - 人員和團隊管理
6. **事件規則** - 事件規則定義和管理
7. **自動化** - 腳本庫和執行日誌
8. **容量規劃** - 容量預測和分析
9. **事件紀錄** - 事件處理和追踪
10. **通知管道** - 通知渠道管理
11. **系統設定** - 系統級別設定和靜音規則管理
12. **平台診斷** - 平台健康狀況監控
13. **角色管理** - 系統角色和權限管理
14. **審計日誌** - 操作審計和追蹤
15. **個人資料與設定** - 個人信息和通知偏好設定

## 技術棧

- React 18
- TypeScript
- Ant Design 5
- ECharts 5
- React Router 6
- Redux Toolkit (已在 package.json 中定義，但尚未完全實現)

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