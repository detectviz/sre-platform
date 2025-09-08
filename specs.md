# SRE 平台前端開發規格書 (SSOT)

**版本**: 1.0
**最後更新**: 2025-09-08

---

## **目錄**

- [1. 總覽 (Overview)](#1-總覽-overview)
- [2. 全局開發原則 (Global Principles)](#2-全局開發原則-global-principles)
- [3. 全局佈局與導航 (Global Layout & Navigation)](#3-全局佈局與導航-global-layout--navigation)
- [4. 登入與登出 (Authentication)](#4-登入與登出-authentication)
- [5. 儀表板頁面 (Dashboard Page)](#5-儀表板頁面-dashboard-page)
- [6. 資源管理 (Resource Management)](#6-資源管理-resource-management)
- [7. 組織管理 (Organization Management)](#7-組織管理-organization-management)
- [8. 事件規則 (Alert Rules)](#8-事件規則-alert-rules)
- [9. 自動化 (Automation)](#9-自動化-automation)
- [10. 容量規劃 (Capacity Planning)](#10-容量規劃-capacity-planning)
  - [10.5. 容量預測功能](#105-容量預測功能)
  - [10.6. 容量報告功能](#106-容量報告功能)
- [11. 事件紀錄 (Incidents)](#11-事件紀錄-incidents)
- [12. 個人資料與設定 (Profile & Settings)](#12-個人資料與設定-profile--settings)
- [13. 系統設定 (System Settings)](#13-系統設定-system-settings)
- [14. 平台維運 (Platform Operations)](#14-平台維運-platform-operations)
- [15. 非功能性需求 (Non-Functional Requirements)](#15-非功能性需求-non-functional-requirements)
- [16. 通知管道 (Notification Channels)](#16-通知管道-notification-channels)
- [17. 資源群組 (Resource Groups)](#17-資源群組-resource-groups)
- [18. 審計日誌 (Audit Logs)](#18-審計日誌-audit-logs)
- [19. 錯誤碼語意與前端文案對照（人讀版）](#19-錯誤碼語意與前端文案對照人讀版)
- [20. 規則與即時更新補充](#20-規則與即時更新補充)
- [21. 角色權限矩陣 (Role Permission Matrix)](#21-角色權限矩陣-role-permission-matrix)
- [22. 通知中心 (Notification Center)](#22-通知中心-notification-center)
- [23. 全局搜索 (Global Search)](#23-全局搜索-global-search)
- [24. 平台診斷 (Platform Diagnostics)](#24-平台診斷-platform-diagnostics)
- [25. 角色管理 (Role Management)](#25-角色管理-role-management)
- [附錄：API 錯誤處理的具體 UI 呈現方式](#附錄api-錯誤處理的具體-ui-呈現方式)

---

## **1. 總覽 (Overview)**

本文件為 SRE 平台前端專案的**唯一、權威的開發規格來源 (Single Source of Truth)**。其目標是定義一個清晰、完整且可執行的開發藍圖，足以讓任何一位工程師能夠獨立、準確地完成整個專案的實作。

### **1.1. 技術選型 (Technology Stack)**

| 類別 | 技術選型 |
| :--- | :--- |
| **核心框架** | `React` |
| **UI 元件庫** | `Ant Design (AntD)` |
| **狀態管理** | `Redux Toolkit (RTK)` |
| **資料視覺化** | `ECharts for React` |
| **前端路由** | `React Router` |
| **開發與建構** | `Vite` |

## **2. 全局開發原則 (Global Principles)**

- **目錄結構**:
    - `src/components`: 存放可在多個頁面間複用的展示型元件。
    - `src/features`: 存放與特定功能模組相關的所有檔案 (e.g., `features/Dashboard`)。
    - `src/services`: 存放自動生成的 API 客戶端 (RTK Query)。
    - `src/store`: 存放 Redux store。
    - `src/layouts`: 存放應用程式的主體佈局元件。
    - `src/pages`: 存放頁面級元件，負責組合 layout 和 features。
- **元件設計**: 遵循「容器(Container)與展示(Presentational)元件」分離的模式。
- **狀態管理**:
    - **Redux (RTK)**: 用於管理全域狀態、伺服器快取 (RTK Query)。
    - **本地狀態 (useState/useReducer)**: 用於管理單一元件內部 UI 狀態（如表單輸入、Modal 開關）。

## **3. 全局佈局與導航 (Global Layout & Navigation)**

### **3.1. 功能目標**
建立一個一致性的應用框架，包含頂部導航、側邊菜單和主內容區，為所有功能頁面提供統一的導航體驗。

### **3.2. 功能規格**
- **頂部 Header**:
    - **左側**: SRE 平台 Logo 和應用名稱。
    - **右側**:
        - **全局搜索框**: 支援 `Ctrl+K` 快捷鍵，能夠跨越多種資源類型進行搜尋。
        - **通知中心**: 鈴鐺圖標，圖標上的紅點 (`Badge`) 應顯示未讀通知數量。點擊後彈出通知列表。
        - **用戶菜單**: 包含「個人設置」、「登出」等選項。
- **側邊導航 (Sidebar)**:
    - **可收合**: 提供按鈕進行側邊導航的收縮和展開。
    - **菜單項**: 儀表板、資源管理、組織管理、事件規則、自動化、容量規劃、事件紀錄、通知管道、系統設定。

#### **3.3. 視覺設計**

* **核心風格**: 整體採用 Ant Design 的經典專業後台佈局，確保資訊架構的清晰與操作的一致性。
* **設計重點**:
  * **側邊導航欄 (Sidebar Navigation)**: 固定在左側，提供主要功能模組的入口。選中狀態清晰可辨，方便用戶快速切換。使用圖標配合文字，提升辨識度。
  * **頂部導航欄 (Top Navigation Bar)**: 包含平台Logo、搜索框、通知、用戶頭像/菜單等常用功能。搜索框設計突出，便於用戶快速查找信息。
  * **內容區域 (Content Area)**: 佔據主要部分，根據不同功能模組顯示相應的內容。保持整體佈局簡潔，留有足夠的留白。
  * **響應式設計 (Responsive Design)**: 考慮到不同設備的適配性，確保在不同屏幕尺寸下也能提供良好的用戶體驗（例如，在小屏幕上側邊導航可收起或轉換為頂部漢堡菜單）。
  * **品牌色與輔助色 (Brand & Accent Colors)**: 運用品牌主色調（如藍色）點綴導航選中狀態、按鈕等，提升品牌統一性。輔助色用於提示、警告等信息。
* **頁面說明**:  
  * **[通知中心]**: 此圖展示了點擊頂部 Header 右側鈴鐺圖標後彈出的 Popover。Popover 內部分為頂部的標題「通知中心」和下方的滾動列表。每條通知包含一個代表狀態的圖標、通知標題和時間戳。未讀通知會有藍點提示，整體風格緊湊且資訊清晰。

### **3.4. 開發規格**
- **核心元件**: `MainLayout.tsx`, `Header.tsx`, `Sidebar.tsx`
- **API 端點**:
    - `GET /api/v1/search`: 用於全局搜尋（結果）。
    - `GET /api/v1/autocomplete`: 用於全局搜尋的即時建議（支援 type=all）。
    - `GET /api/v1/notifications/summary`: 用於獲取未讀通知數。
    - `GET /api/v1/notifications`: 用於獲取通知列表。
- **驗收條件**:
    - [ ] 頁面佈局在各種螢幕尺寸下保持穩定。
    - [ ] 側邊欄菜單能正確導航至對應頁面，並高亮顯示當前頁面。
    - [ ] 通知中心的未讀數量能正確顯示。

## **4. 登入與登出 (Authentication)**

### **4.1. 登入頁面 (Login Page)**

#### **4.1.1. 功能目標**
作為系統入口，提供統一的身份驗證界面。

#### **4.1.2. 功能規格**
* **用戶輸入**: 用戶名/郵箱輸入框、密碼輸入框  
* **操作按鈕**: 登入按鈕  
* **其他功能**: 忘記密碼連結、註冊帳號連結（如適用）  
* **安全性**: 密碼輸入框應隱藏輸入內容，支持回車鍵提交

#### **4.1.3. 視覺設計**
* **核心風格**: 提供一個置中的登入表單，背景通常為簡潔的深色或帶有科技感的漸層，旨在營造專業且安全的氛圍。  
* **頁面說明**:  
  * **[登入頁面]**: 畫面中央是一個清晰的白色表單框，包含 SRE 平台 Logo、標題「登入您的帳號」、用戶名/郵箱輸入框、密碼輸入框，以及一個藍色的「登入」主操作按鈕。表單下方提供「忘記密碼」等次要連結。整體佈局對稱且焦點集中，引導使用者快速完成登入操作。

#### **4.1.4. 開發規格**
* **核心元件**: LoginPage, LoginForm  
* **認證模式**:  
  * **正式（Option A - OIDC/Keycloak）**：點擊登入 → 導向 IdP（Keycloak） → 回跳攜帶 code → 交換 Token（由 BFF 或前端 + 控制平面完成）→ 設定 bearer token。無 `/api/v1/auth/login` API。  
  * **開發（Option B - 本地帳密）**：呼叫 `POST /api/v1/auth/login`，取得 `access_token`、`refresh_token`、`expires_in`。  
* **API 端點（開發模式）**: `POST /api/v1/auth/login`  
* **狀態管理**: 登入表單狀態為本地狀態；成功後儲存 access token（記憶體 + sessionStorage）並跳轉至儀表板；啟用自動刷新。  
* **驗收條件**:  
  * [ ] 正確顯示登入表單  
  * [ ] 輸入驗證（用戶名和密碼必填）  
  * [ ]（開發）正確呼叫登入 API 並儲存 Token  
  * [ ]（正式）可透過 OIDC 流程成功回跳並設置 Token  
  * [ ] 登入成功後跳轉至儀表板  
  * [ ] 登入失敗時顯示錯誤訊息

### **4.2. 登出功能 (Logout Functionality)**

#### **4.2.1. 功能目標**
提供安全的用戶登出機制，清除用戶會話並返回登入頁面。

#### **4.2.2. 功能規格**
* **登出觸發**: 通過點擊頂部導航欄中的用戶菜單並選擇「登出」選項來觸發登出操作  
* **確認機制**: 點擊登出後，顯示確認對話框以防止誤操作  
* **會話清除**: 清除用戶的認證令牌和本地存儲的用戶相關數據  
* **頁面跳轉**: 登出成功後自動跳轉到登入頁面  
* **安全性**: 確保登出後無法通過瀏覽器的返回按鈕訪問受保護的頁面

#### **4.2.3. 視覺設計**
* **核心風格**: 提供一個置中的登入表單，背景通常為簡潔的深色或帶有科技感的漸層，旨在營造專業且安全的氛圍。
* **設計重點**:
  * **簡潔聚焦 (Clean and Focused)**: 登入頁面設計應極簡，將用戶注意力引導至輸入框。背景可選用平台品牌元素或簡潔圖案，但避免過於複雜。
  * **直觀的表單 (Intuitive Form)**: 用戶名/郵箱和密碼輸入框應清晰標識。提供「忘記密碼」和可選的「記住我」功能。
  * **錯誤提示 (Error Messages)**: 錯誤信息（如密碼錯誤）應即時、明確地顯示在輸入框下方或旁邊，避免混淆。
  * **安全性考量 (Security Considerations)**: 考慮提供多因素認證 (MFA) 的入口或提示。
  * **登出確認 (Logout Confirmation)**: 登出時可提供一個簡單的確認彈窗，防止誤操作，並引導回登入頁面。
* **頁面說明**:
  * **[登入頁面]**: 畫面中央是一個清晰的白色表單框，包含 SRE 平台 Logo、標題「登入您的帳號」、用戶名/郵箱輸入框、密碼輸入框，以及一個藍色的「登入」主操作按鈕。表單下方提供「忘記密碼」等次要連結。整體佈局對稱且焦點集中，引導使用者快速完成登入操作。
  * **[登出頁面]**: 畫面中央是一個清晰的白色表單框，包含 SRE 平台 Logo、標題「登出您的帳號」、確認登出按鈕。整體佈局對稱且焦點集中，引導使用者快速完成登出操作。
  
#### **4.2.4. 開發規格**
* **核心元件**: LogoutHandler, LogoutConfirmationModal  
* **認證模式**:  
  * **正式（Option A - OIDC/Keycloak）**：導向 IdP end-session（或後端登出端點）以註銷會話，回跳登入頁。  
  * **開發（Option B - 本地帳密）**：呼叫 `POST /api/v1/auth/logout`，同時清除本地 Token。  
* **API 端點（開發模式）**: `POST /api/v1/auth/logout`  
* **狀態管理**: 登出成功後清除所有用戶資料、RTK Query 快取、路由守衛狀態。  
* **驗收條件**:  
  * [ ] 點擊用戶菜單中的登出選項應顯示確認對話框  
  * [ ]（開發）確認登出後應正確呼叫登出 API 並清除 Token  
  * [ ]（正式）成功導向 OIDC end-session 並回跳登入頁  
  * [ ] 登出成功後應清除所有用戶數據  
  * [ ] 登出成功後應跳轉到登入頁面  
  * [ ] 登出後無法通過瀏覽器返回按鈕訪問受保護頁面

### **4.3. Token 刷新與路由保護**
* **自動刷新**：在 Token 將過期（例如剩餘 < 2 分鐘）時，於背景呼叫 `POST /api/v1/auth/refresh`（開發模式）以換取新 Token。  
* **401 攔截**：若 API 回傳 401，先嘗試刷新；仍失敗則導向登入。  
* **路由守衛**：受保護頁面需檢查有效 Token；無效則跳轉登入。  

### **4.4. 環境切換（正式 vs 開發）**
* **設定來源**：以環境變數或設定檔控制（如 `VITE_AUTH_MODE=oidc|local`、`VITE_OIDC_ISSUER`、`VITE_CLIENT_ID`、`VITE_REDIRECT_URI`）。  
* **行為**：  
  * `oidc`：啟用 OIDC 重導流程；不呼叫本地 `/auth/*`。  
  * `local`：使用 `/api/v1/auth/login|refresh|logout`。  

### **4.5. 錯誤處理與 UX**
* **表單錯誤**：必填與格式校驗、API 返回 400/401 的提示。  
* **全局錯誤**：通用錯誤提示（如網路中斷、500）。  

### **4.6. 安全建議**
* 儘量將 `access_token` 放於記憶體；如需持久化，使用 sessionStorage 並設定最小可用範圍。  
* 刷新 Token 使用安全通道（HTTPS），避免在 URL 或 Log 中暴露。  
* 登出後清除所有敏感資訊與快取。

## **5. 儀表板頁面 (Dashboard Page)**

### **5.1. 功能目標**
作為系統首頁，提供一個高層次的視圖，讓使用者能快速掌握系統的整體健康狀況與關鍵指標。

### **5.2. 功能規格**
儀表板以視覺化的圖表和卡片，彙整了系統當前最重要的狀態摘要。主要包含：

* **狀態趨勢卡片**: 顯示「新事件」、「處理中」、「今日已解決」的數量，並與昨日數據比較呈現趨勢。  
* **關鍵績效指標 (KPI)**: 包含「資源妥善率」、「總資源數」等核心指標。  
* **圖表區**: 「資源群組狀態總覽」長條圖與「資源狀態分佈」圓餅圖。  
* **增補功能**:  
  * 趨勢指標加入迷你圖 (Sparkline)。  
  * 允許使用者自訂卡片排列。

### **5.3. 視覺設計**
* **核心風格**: 
  * 強調**一覽性**和**關鍵資訊快速獲取**。  
  * 採用 Ant Design Grid 和 Card 形成卡片式佈局。  
  * 使用不同顏色區分卡片狀態，提升視覺衝擊力。   
* **設計重點**:
  * **概覽性信息 (Overview Information)**: 頂部展示關鍵指標（KPIs），如新事件、進行中事件、已解決事件等，用大數字和趨勢箭頭清晰呈現。
  * **模塊化設計 (Modular Design)**: 將不同類型的數據（如事件狀態、資源組狀態、資源分佈）劃分為獨立的卡片或面板，方便用戶快速掃描。
  * **圖表可視化 (Chart Visualization)**: 使用柱狀圖、餅圖等直觀的圖表展示數據分佈和趨勢，如「資源組狀態概覽」和「資源狀態分佈」。
  * **顏色標識 (Color Coding)**: 運用不同顏色來區分數據狀態（如健康-綠、警告-黃、異常-紅），提高信息辨識度。
  * **可自定義性 (Customizability - Optional)**: 未來可考慮允許用戶自定義儀表板模塊的佈局和顯示內容。
  * **數據更新提示 (Data Refresh Indication)**: 考慮在關鍵數據旁添加最後更新時間或刷新按鈕。
* **頁面說明**:  
  * **[儀表板]**: 畫面由多個卡片組成。頂部是三張並排的 KPI 狀態趨勢卡片（例如：「新事件」、「處理中」、「今日已解決」），使用 Statistic 元件突顯核心數字，並附有與昨日比較的趨勢百分比。下方左側是「資源群組狀態總覽」的長條圖，右側是「資源狀態分佈」的圓餅圖，兩者都使用了 ECharts 進行數據可視化，色彩清晰，圖例明確。

### **5.4. 開發規格**
* **核心元件**: DashboardPage, SummaryCard, KpiCard, ResourceStatusChart, StatusDistributionChart  
* **API 端點**: GET /api/v1/dashboard/summary, GET /api/v1/dashboard/trends, GET /api/v1/dashboard/resource-distribution  
* **狀態管理**: 頁面載入和錯誤狀態由 RTK Query 管理，API 數據由 RTK Query 快取。  
* **驗收條件**:  
  * [ ] 正確呼叫所有 dashboard API。  
  * [ ] 正確渲染所有統計卡片和圖表。  
  * [ ] API 呼叫失敗時顯示錯誤提示。

## **6. 資源管理 (Resource Management)**

### **6.1. 功能目標**
提供對所有監控資源的集中管理、探索與高效的批次操作能力，並能快速追溯資源的相關事件與歷史指標。

### **6.2. 功能規格**
- **資源列表**:
    - 應提供基於狀態、類型、群組和關鍵字的篩選功能。
    - 支援複選框 (Checkbox) 進行多選。
    - 當勾選資源後，頁面頂部應動態出現「批次操作欄」，提供批次刪除、加入群組等操作。
- **資源詳情**:
    - 點擊任一資源應能進入其詳情頁面。
    - 詳情頁建議使用**頁籤 (`Tabs`)** 佈局，區分以下內容：
        - **基本資訊**: 展示資源的詳細屬性。
        - **歷史指標**: 繪製 CPU、記憶體等關鍵指標在過去一段時間的趨勢圖。
        - **關聯事件**: 展示與該資源相關的事件歷史列表。
- **資源探索**:
    - 提供「掃描網段」功能，非同步探索網路中的未知資源。

### **6.3. 視覺設計**
* **核心風格**: 強調列表的**高效篩選**與**批次操作**，是典型的數據驅動管理界面。
* **設計重點**:
  * **列表視圖 (List View)**: 主要採用表格形式展示資源列表，包含名稱、IP地址、標籤、所屬群組、操作等關鍵信息。
  * **搜索與過濾 (Search & Filter)**: 提供頂部搜索框和篩選器，方便用戶快速定位和篩選資源。標籤（如「運行中」、「維護中」）可用不同顏色或樣式區分，提升可讀性。
  * **批量操作 (Batch Operations)**: 支持多選資源進行批量操作（如批量啟動、停止、刪除）。
  * **單個資源詳情 (Single Resource Details)**: 點擊資源名稱或操作按鈕可導航到其詳細信息頁面，展示更細粒度的數據和操作選項。
  * **分頁控制 (Pagination)**: 當資源數量較多時，提供分頁功能，改善加載速度和用戶體驗。
  * **「添加資源」按鈕 (Add Resource Button)**: 明確的按鈕用於創建新資源。
* **頁面說明**:  
  * **[資源管理主頁]**: 頁面頂部是操作區，包含一個搜尋框、藍色的「新增資源」按鈕和「掃描網路」按鈕。下方是 Ant Design Table，展示了資源列表。表格的欄位包含資源名稱、IP、狀態（使用不同顏色的 Tag 標示）等。每行末尾都有「編輯」、「刪除」等文字按鈕連結。  
  * **[資源批次操作]**: 此圖展示了當使用者在表格中勾選了多個項目後的介面變化。表格頂部會**動態浮現**一個操作列，明確顯示「已選 X 項」，並提供「批次刪除」、「批次加入群組」等 Button。這個互動設計極大地提升了批次管理的效率。

### **6.4. 開發規格**
- **核心元件**: `ResourcesPage.tsx`, `ResourceTable.tsx`, `ResourceDetailPage.tsx`, `MetricsChart.tsx`, `AssociatedIncidentsTable.tsx`, `ScanNetworkModal.tsx`
- **API 端點**:
    - `GET /api/v1/resources`: 獲取資源列表。
    - `GET /api/v1/resources/{resourceId}`: 獲取資源詳情。
    - `GET /api/v1/resources/{resourceId}/metrics`: 獲取歷史指標數據，用於繪製圖表。
    - `GET /api/v1/incidents?resource_id={resourceId}`: 獲取關聯事件列表。
    - 其他資源管理的 CRUD 和掃描 API。
- **驗收條件**:
    - [ ] 資源列表能正確篩選和分頁。
    - [ ] 批次操作功能運作正常。
    - [ ] 資源詳情頁的三個頁籤（基本資訊、歷史指標、關聯事件）都能正確載入並顯示數據。

## **7. 組織管理 (Organization Management)**

### **7.1. 功能目標**
提供對使用者 (Personnel) 和團隊 (Teams) 的管理功能，並確保在大規模使用者環境下的操作流暢性。

### **7.2. 功能規格**
- **頁面佈局**: 使用**頁籤 (`Tabs`)** 區分「人員管理」和「團隊管理」。
- **人員管理**:
    - 提供對使用者的 CRUD 操作。
    - 在設定角色時，應提供提示圖示，懸浮後顯示的角色說明需由後端 API 提供。
- **團隊管理**:
    - 提供對團隊的 CRUD 操作。
    - 在編輯團隊並選擇成員或通知訂閱者時，應使用**搜尋自動完成**的方式，而非一次性載入所有使用者列表。

### **7.3. 視覺設計**
* **核心風格**: 採用頁籤 (Tabs) 佈局，將不同但相關的管理功能（人員與團隊）清晰地組織在同一頁面內，提供一致的管理體驗。
* **設計重點**:
  * **用戶與團隊列表 (User & Team Lists)**: 提供清晰的用戶和團隊（或部門）列表，顯示關鍵信息如姓名、角色、所屬團隊、狀態等。
  * **層級結構 (Hierarchical Structure)**: 如果組織結構複雜，可考慮樹狀圖或可折疊列表來展示團隊層級關係。
  * **權限管理 (Permission Management)**: 為每個用戶或角色提供詳細的權限配置界面，可通過勾選框或下拉菜單進行設定。
  * **邀請與添加 (Invite & Add)**: 明確的「邀請用戶」或「添加團隊」按鈕，引導用戶進行相關操作。
  * **編輯與刪除 (Edit & Delete)**: 提供行級操作按鈕（如編輯圖標、刪除圖標），方便管理單個用戶或團隊。
  * **搜索與篩選 (Search & Filter)**: 針對用戶名、角色、團隊等屬性提供搜索和篩選功能。
* **頁面說明**:  
  * **[人員管理頁面]**: 畫面頂部是「人員管理」和「團隊管理」的頁籤，當前選中的是「人員管理」。頁籤下方是操作區，包含搜尋框和藍色的「新增人員」按鈕。主體部分是一個 Ant Design Table，列出了用戶 ID、姓名、郵箱、角色（使用不同顏色的 Tag 標示）、所屬團隊等資訊。  
  * **[新增/編輯人員彈窗]**: 點擊「新增人員」後，會彈出一個 Modal。Modal 內部是一個 Form，包含了姓名、郵箱、密碼、角色（多選 Select）和所屬團隊（多選 Select）等輸入項。表單佈局簡潔，標籤與輸入框對齊，底部有「取消」和「確定」按鈕。  
  * **[編輯團隊彈窗]**: 在「團隊管理」頁籤中，編輯團隊時會彈出 Modal。此 Modal 的核心是其成員選擇器，使用了 Transfer (穿梭框) 元件。左側框列出了所有可選的人員，右側框列出了已選入該團隊的成員，使用者可以方便地在兩者之間進行勾選和移動，互動非常直觀。

### **7.4. 開發規格**
- **核心元件**: `OrganizationPage.tsx`, `PersonnelTable.tsx`, `TeamTable.tsx`, `TeamFormModal.tsx`
- **API 端點**:
    - `GET/POST/PUT/DELETE /api/v1/users`: 管理使用者。
    - `GET/POST/PUT/DELETE /api/v1/teams`: 管理團隊。
    - `GET /api/v1/roles`: 動態獲取角色定義。
    - `GET /api/v1/autocomplete?type=user&q={keyword}`: 用於團隊成員選擇時的搜尋建議。
- **權限**:
    - 使用者（Users）寫入：僅 `super_admin`。
    - 團隊（Teams）寫入：`team_manager` 或 `super_admin`。
- **驗收條件**:
    - [ ] 能對人員和團隊進行完整的 CRUD 操作（依權限顯示或禁用操作）。
    - [ ] 角色說明是動態載入的。
    - [ ] 編輯團隊時，新增成員的體驗是流暢的搜尋和選擇，而非等待長列表載入。

## **8. 事件規則 (Alert Rules)**

### **8.1. 功能目標**
提供一個強大且靈活的界面，讓使用者可以定義事件觸發條件，並關聯通知管道和自動化腳本。

### **8.2. 功能規格**
- **表單設計**:
    - 在「新增/編輯事件規則」的表單中，「監控指標」的下拉選單選項應從後端動態載入。
    - 表單中應包含一個「自動化響應」區塊，允許使用者：
        1.  選擇一個已存在的自動化腳本。
        2.  將事件事件的變數（如資源 IP、觸發值）映射到腳本所需的參數上。
- **生命週期管理**: 提供對事件規則的啟用、停用和測試功能。

### **8.3. 視覺設計**
* **核心風格**: 強調規則邏輯的清晰配置和可擴展性，特別是在處理複雜表單時，採用了分組和動態渲染的設計。
* **設計重點**:
  * **規則列表 (Rules List)**: 以表格形式展示現有的告警規則，包含規則名稱、監控對象、觸發條件、通知方式、狀態（啟用/禁用）等。
  * **「新建規則」按鈕 (Create New Rule Button)**: 突出顯示，引導用戶創建新的告警規則。
  * **規則配置表單 (Rule Configuration Form)**: 創建或編輯規則時，提供清晰的多步驟或分組表單，引導用戶定義監控指標、閾值、時間範圍、通知渠道等。
  * **狀態切換 (Status Toggle)**: 允許用戶方便地啟用或禁用某條規則。
  * **測試規則 (Test Rule - Optional)**: 提供一個「測試規則」功能，讓用戶在保存前預覽告警觸發效果。
  * **搜索與篩選 (Search & Filter)**: 針對規則名稱、監控對象等屬性提供搜索和篩選功能。
* **頁面說明**:  
  * **[新增/編輯規則彈窗]**: 這是此功能的核心視覺。一個寬大的 Modal 內部，使用 Collapse (摺疊面板) 將複雜的表單分成了「基本信息」、「觸發條件」、「事件內容與通知」和「自動化響應」等幾個可獨立展開/收合的區塊。  
  * 在「觸發條件」區塊內，使用了 Form.List，允許使用者動態新增或刪除多組「AND/OR」條件，每組條件內部又可以新增多個具體的監控指標判斷，提供了極高的靈活性。  
  * 在「自動化響應」區塊，當使用者從下拉選單中選擇一個腳本後，下方會**動態生成**該腳本所需的參數輸入框，實現了高度互動的配置體驗。

### **8.4. 開發規格**
- **核心元件**: `AlertRulesPage.tsx`, `RuleFormModal.tsx`
- **API 端點**:
    - `GET/POST/PUT/DELETE /api/v1/alert-rules`: 管理事件規則。
    - `GET /api/v1/metrics/definitions`: 用於動態填充「監控指標」下拉選單。
    - `GET /api/v1/automation/scripts`: 用於獲取可關聯的腳本列表。
- **驗收條件**:
    - [ ] 「監控指標」下拉選單的內容是透過 API 動態載入的。
    - [ ] 能夠成功建立一條關聯了自動化腳本的事件規則。
    - [ ] 規則的啟用/停用功能正常。

## **9. 自動化 (Automation)**

### **9.1. 功能目標**
建立一個集腳本開發、排程管理和執行追蹤於一體的自動化中心。

### **9.2. 功能規格**
- **頁面佈局**: 使用**頁籤 (`Tabs`)** 區分「腳本庫」、「排程管理」和「執行日誌」。
- **腳本庫**:
    - 提供對腳本的 CRUD 操作。
    - 列表中的每一項腳本都應有「運行」按鈕，允許使用者手動觸發以進行測試。
- **排程管理**:
    - 提供對定時執行任務的完整 CRUD 操作。
- **執行日誌**:
    - 列表應清晰展示每次執行的狀態（成功/失敗）、觸發方式（手動/事件）、執行時間等。
    - 如果是由事件觸發的，應提供一個可點擊的連結，直接跳轉到該事件事件的詳情頁。

### **9.3. 視覺設計**
* **核心風格**: 為技術操作人員（如 SRE）設計的專業界面，特別是將專業的代碼編輯器無縫整合進管理流程中。
* **設計重點**:
  * **自動化任務列表 (Automation Task List)**: 展示已配置的自動化任務，包含任務名稱、觸發條件、執行動作、上次執行時間、狀態等。
  * **「新建自動化」按鈕 (Create New Automation Button)**: 明確的入口用於配置新的自動化流程。
  * **流程可視化 (Workflow Visualization - Advanced)**: 如果條件允許，提供圖形化的工作流編輯器，通過拖拽模塊（觸發器、條件判斷、動作）來構建複雜的自動化流程。
  * **預設模板 (Predefined Templates)**: 提供一些常用的自動化任務模板，方便用戶快速上手。
  * **執行日誌 (Execution Logs)**: 每個自動化任務應有詳細的執行日誌，記錄每次執行的結果、成功/失敗原因等。
  * **任務啟停 (Task Start/Stop)**: 方便地啟動、停止或暫停自動化任務。
* **頁面說明**:  
  * **[腳本庫頁面]**: 頁面佈局與其他管理頁面類似，採用頂部 Tabs 區分「腳本庫」和「執行日誌」。表格列出了腳本的名稱、類型、描述、創建者等，操作列包含「編輯」、「運行」、「刪除」按鈕。  
  * **[腳本編輯器彈窗]**: 點擊「新增腳本」或「編輯」後，彈出的 Modal 內部嵌入了 **Monaco Editor** 專業代碼編輯器組件。編輯器區域佔據了 Modal 的大部分空間，支持語法高亮、行號和代碼自動補全，提供了流暢的腳本編寫體驗。編輯器上方是腳本名稱、描述等元數據的輸入表單。  
  * **[執行日誌詳情]**: 點擊「執行日誌」表格中的「查看日誌」操作，會彈出一個 Modal。Modal 內部是一個不可編輯的、顯示著黑底白字執行輸出的日誌查看器，支持滾動和一鍵複製，風格類似於終端 (Terminal)，符合開發者的使用習慣。

### **9.4. 開發規格**
- **核心元件**: `AutomationPage.tsx`, `ScriptsTable.tsx`, `SchedulesTable.tsx`, `ExecutionsTable.tsx`
- **API 端點**:
    - `GET/POST/PUT/DELETE /api/v1/automation/scripts`: 管理腳本。
    - `POST /api/v1/automation/scripts/{scriptId}/run`: 手動執行腳本。
    - `GET/POST/PUT/DELETE /api/v1/automation/schedules`: 管理排程。
    - `GET /api/v1/automation/executions`: 檢視日誌。
- **權限**:
    - 腳本/排程寫入與手動執行：`team_manager` 或 `super_admin`。
    - 執行歷史與詳情：所有登入使用者可讀（依後端授權策略限制範圍）。
- **驗收條件**:
    - [ ] 能在「腳本庫」頁籤中手動執行一個腳本並在「執行日誌」中看到結果。
    - [ ] 能在「排程管理」頁籤中成功建立並管理一個定時任務。
    - [ ] 能從一條由事件觸發的執行紀錄，成功跳轉到對應的事件詳情。

## **10. 容量規劃頁面 (Capacity Planning Page)**

### **10.1. 功能目標**
分析歷史數據，預測未來資源消耗趨勢，從被動事件轉向主動規劃。

### **10.2. 功能規格**
* **輸入**: 選擇「資源群組」和關鍵效能指標。  
* **輸出**:  
  * **關鍵預測指標**: 以卡片形式呈現，如「預計將在 45 天後達到 80% 警戒線」。  
  * **趨勢圖**: 包含歷史數據與未來預測的趨勢線。  
  * **建議措施**: 系統提出的建議，並可觸發對應的自動化腳本。

### **10.3. 視覺設計**
* **核心風格**: 這是一個數據分析與預測導向的頁面，設計上強調**輸入的簡潔性**與**輸出的可視化**，幫助使用者從歷史數據中洞察未來趨勢。  
* **頁面說明**:  
  * **[容量規劃初始頁面]**: 畫面佈局清晰，頂部是一個配置表單 (Form)，包含三個核心的下拉選單：「選擇資源」、「選擇關鍵效能指標」和「預測期間」，旁邊是一個藍色的「開始分析」按鈕。初始狀態下，主內容區會提示使用者進行選擇以開始分析。  
  * **[容量規劃結果頁面]**: 點擊分析後，頁面會動態呈現結果。頂部會出現幾張並排的 Card，用 Statistic 元件醒目地展示關鍵預測指標，例如：「預計將在 **45 天後** 達到 80% 警戒線」。  
  * 下方的主圖表是一個 ECharts 折線圖，圖中用**兩種不同顏色或線型**（例如實線代表歷史，虛線代表預測）清晰地繪製了**歷史數據趨勢**與**未來預測趨勢**，並可能包含一條代表「警戒線」的水平標示線，視覺衝擊力強，結果一目了然。
  * **分析與建議區塊**: 在圖表下方，針對每一條建議進行渲染時：
    * 若該建議的 `actionable` 欄位為 `true`，則應在建議文字的右側顯示一個**主操作按鈕 (Button)**，按鈕文字根據 `action_type` 決定（例如「執行擴容腳本」）。
    * **互動流程**:
      1.  使用者點擊此按鈕。
      2.  系統彈出一個**確認對話框 (Modal)**，標題為「確認執行自動化腳本」。
      3.  對話框中會顯示即將執行的腳本名稱（可透過 `action_target` 的 script_id 查詢 `GET /api/v1/automation/scripts/{scriptId}` 獲得），以及預先填好的目標資源等參數。
      4.  使用者確認後，前端呼叫 `POST /api/v1/automation/scripts/{scriptId}/run` API 來執行腳本。

#### **輸入區詳細設計**

* **資源ID**: 應為一個支援遠端搜尋的下拉選單(Select)。當使用者輸入關鍵字時，應即時呼叫GET /api/v1/autocomplete?type=resourceAPI 來動態載入符合的資源列表，供使用者從中選擇。

* **監控指標**: 應為一個下拉選單(Select)。其選項應在頁面載入時，透過呼叫GET /api/v1/metrics/definitionsAPI 來一次填入所有可用的指標。

* **預測期間**: 應為一個下拉選單(Select)，提供固定的時間範圍選項（如：未來7 天、未來30 天、未來90 天）。

#### **容量預測功能視覺設計**
* **核心風格**: 數據驅動的預測視圖，強調歷史趨勢與未來預測的對比。
* **視覺設計描述**:
  * **頁面佈局**: 可作為容量規劃頁面的一個子功能或獨立頁面。
  * **預測圖表**: 使用 ECharts 折線圖，用不同顏色或線型區分歷史數據（實線）和預測數據（虛線）。
  * **預測指標卡片**: 顯示關鍵預測數據，如預計達到特定使用率的時間點。

#### **容量報告功能視覺設計**
* **核心風格**: 報告管理界面，強調內容的結構化呈現。
* **視覺設計描述**:
  * **報告列表頁面**: 使用 Ant Design Table 顯示報告列表，包含報告名稱、生成時間、相關資源等欄位。
  * **報告詳情頁面**: 採用卡片式佈局展示報告的各個部分，包括摘要、圖表、預測指標和建議措施。

### **10.4. 開發規格**
* **核心元件**: CapacityPlanningPage.tsx, CapacityAnalysisForm.tsx, CapacityForecastChart.tsx  
* **API 端點**: POST /api/v1/capacity-planning/analyze  
  * 備註：若 UI 以「群組」為輸入，前端應先透過 `/api/v1/resource-groups` 或 `/api/v1/resources` 解析並組裝 `resource_ids` 傳入；或待後端支援 `group_id` 參數。  
  * 備註：後端提供了別名端點 `POST /api/v1/diagnostics/capacity-analysis` 以實現相容性，但建議前端統一使用 `/capacity-planning/analyze`。  
* **狀態管理**: 表單狀態為本地狀態，分析結果由 RTK Query 管理。  
* **驗收條件**:  
  * [ ] 選擇群組或資源與指標後能正確呼叫 API。  
  * [ ] 能正確顯示預測指標卡片和趨勢圖。  
  * [ ] 圖表 Y 軸和 Tooltip 顯示正確單位。  
  * [ ] 建議措施旁的按鈕可被點擊並觸發流程。

## **10.5. 容量預測功能**

### **10.5.1. 功能目標**
提供基於歷史數據的資源使用量預測功能，幫助使用者了解未來資源消耗趨勢。

### **10.5.2. 功能規格**
* **輸入**: 選擇特定資源和預測時間範圍。
* **輸出**: 
  * **預測趨勢圖**: 顯示歷史數據與未來預測的趨勢線。
  * **關鍵預測指標**: 以卡片形式呈現預測的關鍵數據點。

### **10.5.3. 視覺設計**
* **核心風格**: 數據驅動的預測視圖，強調歷史趨勢與未來預測的對比。
* **視覺設計描述**:
  * **頁面佈局**: 可作為容量規劃頁面的一個子功能或獨立頁面。
  * **預測圖表**: 使用 ECharts 折線圖，用不同顏色或線型區分歷史數據（實線）和預測數據（虛線）。
  * **預測指標卡片**: 顯示關鍵預測數據，如預計達到特定使用率的時間點。

### **10.5.4. 開發規格**
* **核心元件**: CapacityForecastChart.tsx, CapacityForecastMetrics.tsx
* **API 端點**: POST /api/v1/capacity/forecast
* **驗收條件**:
  * [ ] 能正確呼叫預測 API 並顯示結果
  * [ ] 圖表能清晰區分歷史與預測數據
  * [ ] 預測指標能正確顯示關鍵數據點

## **10.6. 容量報告功能**

### **10.6.1. 功能目標**
提供容量規劃分析報告的存儲、查看和管理功能。

### **10.6.2. 功能規格**
* **報告列表**: 顯示所有容量規劃報告，支援分頁、排序和過濾。
* **報告詳情**: 顯示單個報告的完整分析結果，包括圖表和建議措施。

### **10.6.3. 視覺設計**
* **核心風格**: 報告管理界面，強調內容的結構化呈現。
* **視覺設計描述**:
  * **報告列表頁面**: 使用 Ant Design Table 顯示報告列表，包含報告名稱、生成時間、相關資源等欄位。
  * **報告詳情頁面**: 採用卡片式佈局展示報告的各個部分，包括摘要、圖表、預測指標和建議措施。

### **10.6.4. 開發規格**
* **核心元件**: CapacityReportsPage.tsx, CapacityReportDetailPage.tsx
* **API 端點**: 
  * GET /api/v1/capacity/reports (獲取報告列表)
  * GET /api/v1/capacity/reports/{reportId} (獲取報告詳情)
* **驗收條件**:
  * [ ] 能正確顯示報告列表並支援分頁
  * [ ] 能查看報告詳情並顯示所有分析結果
  * [ ] 報告內容能完整呈現分析數據和建議

## **11. 事件紀錄 (Incidents)**

### **11.1. 功能目標**
提供一個高效的事件處理中心，支援快速篩選、批次處理、關聯分析和自動化追蹤。

### **11.2. 功能規格**
- **列表與篩選**: 提供基於時間、等級、狀態和**資源**的進階篩選功能。
- **批次處理**: 使用者在勾選多筆事件後，可執行「批次確認」和「批次解決」操作。
- **事件詳情**:
    - 彈出視窗中應包含一個「關聯事件」頁籤，用於展示與當前事件相關的其他事件。
    - 如果此事件觸發了自動化腳本，應在詳情中清晰展示**自動化執行紀錄的 ID**，並提供連結跳轉至該紀錄的詳情。

### **11.3. 視覺設計**
* **核心風格**: 為高壓力的事件處理場景設計，強調**資訊的快速過濾**與**上下文的清晰呈現**。  
* **頁面說明**:  
  * **[事件紀錄主頁]**: 頁面頂部是一個功能強大的篩選區，包含時間範圍選擇器 (DatePicker.RangePicker)、事件等級 (Select) 和處理狀態 (Select) 等多個篩選條件。下方是事件列表 Table，其中「事件等級」和「處理狀態」欄位使用了**不同顏色的 Tag** (例如：Critical 為紅色，Resolved 為綠色) 來高亮顯示，讓維運人員能迅速定位重要事件。  
  * **[事件詳情彈窗]**: 點擊單筆紀錄後，彈出的 Modal 內部採用了 Tabs 佈局。  
    * **「詳情」頁籤**：展示事件的所有元數據。  
    * **「處理歷史」頁籤**：顯示確認、解決、指派等操作的歷史紀錄。  
    * **「關聯事件」頁籤**：顯示透過 API 獲取的、與此事件相關的其他事件列表。  
    * 「自動化」頁籤：如果此事件觸發了自動化腳本，這裡會顯示一個或多個可點擊的執行紀錄 ID。  
      這種分頁設計使得大量資訊被清晰地組織起來，避免了介面混亂。  
  * **[AI 輔助報告]**: 當使用者勾選多筆事件並點擊「生成事件報告」後，會彈出一個專門的 Modal。Modal 內以結構化的格式（如標題、摘要、可能原因、建議方案）清晰地展示 AI 生成的報告內容，並提供一鍵複製功能。
* **設計重點**：
  * **事件列表 (Incident List)**：以表格形式展示所有事件，包含事件ID、標題、狀態、嚴重程度、受影響資源、觸發時間、解決時間等。
  * **狀態標識 (Status Indicators)**：使用不同顏色或圖標來明確標識事件的狀態（如「新事件」、「處理中」、「已解決」、「關閉」）和嚴重程度（如「高」、「中」、「低」）。
  * **搜索與篩選 (Search & Filter)**：提供強大的搜索和篩選功能，按狀態、嚴重程度、時間範圍、受影響資源等進行過濾。
  * **事件詳情頁 (Incident Details Page)**：點擊事件後進入詳細頁面，展示事件描述、歷史日誌、相關資源、處理人、評論等。
  * **操作按鈕 (Action Buttons)**：在事件列表或詳情頁提供處理事件的快速操作按鈕（如「分配給」、「更改狀態」、「添加評論」）。
  * **時間軸視圖 (Timeline View - Optional)**：在事件詳情中，以時間軸形式展示事件的處理進度、所有操作和評論，清晰呈現事件的生命週期。


### **11.4. 開發規格**
- **核心元件**: `IncidentsPage.tsx`, `IncidentsTable.tsx`, `IncidentDetailModal.tsx`
- **API 端點**:
    - `GET /api/v1/incidents`: 獲取事件列表（支援 `resource_id` 篩選）。
    - `POST /api/v1/incidents/batch`: 執行批次處理。
    - `GET /api/v1/incidents/{incidentId}/correlated`: 獲取關聯事件。
    - 其他事件管理的 CRUD API。
- **權限**:
    - 一般登入使用者可檢視與操作自己有權限的事件（依後端授權判斷）。
    - 無權限的操作入口應隱藏或禁用，嘗試操作時以 403 規範回饋。
- **驗收條件**:
    - [ ] 能夠成功對多個事件進行批次確認。
    - [ ] 在事件詳情中，能成功載入並顯示「關聯事件」列表。
    - [ ] 在事件詳情中，能清晰看到其觸發的「自動化執行紀錄」連結。
    - [ ] 無權限操作會有一致的權限不足 UI 提示。

## **12. 個人資料與設定 (Profile & Settings)**

### **12.1. 功能目標**
提供使用者個人化設定和管理員系統級設定的統一入口。

### **12.2. 功能規格**
- **頁面佈局**: 使用**頁籤 (`Tabs`)** 佈局，區分「個人資料」和「系統設定」（僅管理員可見）。
- **個人資料**:
    - 包含基本資訊修改、密碼變更、通知偏好設定。
- **系統設定**:
    - 包含對**維護時段**的完整 CRUD 管理功能。

### **12.3. 視覺設計**
* **核心風格**: 這是一個純粹的表單驅動的管理界面，設計上注重**分區的邏輯性**和**操作的回饋感**。  
* **頁面說明**:  
  * **[頁面佈局]**: 整個頁面使用頂層的 Tabs 將「個人資料」和「系統設定」完全分開。  
  * **[個人資料頁籤]**: 內部再次使用 Tabs 將「個人資訊」、「密碼安全」和「通知設定」三個部分清晰地劃分開來。  
    * 在「通知設定」頁籤中，每個聯絡方式（Email, SMS）後面都有一個狀態指示器（例如「已驗證」的綠色標籤）和獨立的操作按鈕（「傳送驗證」、「測試」），介面清晰地傳達了每個聯絡渠道的狀態和可用操作。  
  * **[系統設定頁籤]**: (僅管理員可見) 同樣使用內部 Tabs 劃分不同的系統級設定，例如「整合設定」（用於配置 Grafana 等）和「維護時段管理」。  
    * 「維護時段管理」的介面是一個標準的 CRUD 表格，包含列表、新增、編輯和刪除按鈕，與平台其他管理頁面的風格保持一致。


### **12.4. 開發規格**
- **核心元件**: `SettingsPage.tsx`, `ProfileForm.tsx`, `MaintenanceWindowsTable.tsx`
- **API 端點**:
    - `GET/PUT /api/v1/users/profile`: 管理個人資料。
    - `GET/POST/PUT/DELETE /api/v1/settings/maintenance-windows`: 管理維護時段。
- **驗收條件**:
    - [ ] 普通使用者只能看到「個人資料」頁籤。
    - [ ] 管理員能看到並成功管理「系統設定」中的維護時段。

## **13. 系統設定 (System Settings)**

### **13.1. 維護時段管理 (Maintenance Window Management)**

#### **功能目標**
提供對全域維護時段的集中管理，確保在計畫性維護期間能自動抑制事件。

### **13.2. 功能規格**
*   **列表與管理**: 提供對已設定維護時段的列表、新增、編輯和刪除功能。此功能解決了 **G-09** 缺口，提供了完整的生命週期管理。
*   **關聯資源**: 在設定時，可以指定此維護時段影響的資源群組或特定資源。

### **13.3. 視覺設計**

* **核心風格**: 這是一個標準的 CRUD (建立、讀取、更新、刪除) 管理界面，設計上強調**資訊的結構化呈現**和**表單設定的直觀性**。整體風格會與「資源管理」、「組織管理」等頁面保持高度一致，以降低管理員的學習成本。  
* **頁面說明**: (此頁面可參考**資源管理**或**人員管理**的佈局，因為它們都是標準的表格管理界面)  
  * **[資源管理主頁]**  
* **視覺設計描述**:  
  * **頁面佈局**:  
    * 此功能會作為「系統設定」頁面下的一個**頁籤 (Tab)**。  
    * 頁籤內容頂部是操作區，包含一個**搜尋框**（用於快速查找特定維護時段）和一個藍色的**「新增維護時段」按鈕**。  
    * 下方主體部分是一個 Ant Design Table，用於展示所有已設定的維護時段列表。  
  * **表格 (Table) 設計**:  
    * **表格欄位**會清晰地列出維護時段的關鍵資訊，例如：「名稱」、「描述」、「開始時間」、「結束時間」、「是否重複 (Recurring)」以及「影響的資源/群組」。  
    * 「是否重複」欄位可以使用 Tag 或 Switch 元件來直觀顯示狀態。  
    * 每行末尾都會有「編輯」和「刪除」的文字按鈕，用於管理單個項目。  
  * **新增/編輯彈窗 (Modal) 設計**:  
    * 點擊「新增」或「編輯」按鈕後，會彈出一個 Modal，內部是一個結構清晰的 Form。  
    * **表單欄位**會包含：  
      * **名稱/描述**: 標準的文字輸入框 (Input, Input.TextArea)。  
      * **時間範圍**: 使用 DatePicker.RangePicker 元件，讓使用者可以方便地選擇開始和結束的日期與時間。  
      * **重複規則**: 可能是一個 Checkbox ("是否重複")，勾選後會出現 Select 元件讓使用者選擇重複頻率（每日、每週、每月）。  
      * **關聯資源**: 這是一個關鍵的互動設計。可能會使用 Transfer (穿梭框) 或支持搜尋自動完成的多選 Select 元件 (Select.Multiple)，讓管理員可以從所有資源或資源群組中，精確地選擇此維護時段要影響的對象。


### **13.4. 開發規格**
*   **API 端點**: `GET/POST/PUT/DELETE /api/v1/settings/maintenance-windows`
*   **核心元件**: MaintenanceWindowsPage.tsx, MaintenanceWindowsTable.tsx, MaintenanceWindowFormModal.tsx

## **14. 平台維運 (Platform Operations)**

### **14.1. 平台狀態診斷 (Platform Diagnostics)**

### **14.1. 功能目標**
提供平台管理員一個儀表板，用以了解系統自身的健康狀況，例如：「過去 24 小時內，哪個自動化腳本失敗率最高？」或「哪個通知管道最近一直發送失敗？」。

### **14.2. 視覺設計**
* **核心風格**: 這是一個純粹的數據和健康度監控儀表板，設計上應極度注重**資訊的清晰度**和**異常狀態的突顯**。整體風格會與主儀表板類似，但內容更聚焦於平台自身的內部指標。  
* **頁面說明**: (此頁面可參考**儀表板**的卡片式佈局，但內容替換為平台健康度指標)  
  * **[儀表板]**  
* **視覺設計描述**:
  * **頁面佈局**: 整個頁面會採用與主儀表板類似的**卡片式 (Card) 網格佈局**。頁面標題為「平台狀態診斷」，並可能有一個時間範圍選擇器（例如「過去 24 小時 / 7 天」）來調整數據的可視範圍。  
  * **自動化健康度 (Automation Health) 卡片**:  
    * 這會是一個核心的卡片，標題為「自動化腳本健康度」。  
    * 內部是一個 Ant Design Table，列出從 GET /api/v1/admin/diagnostics API 中獲取的腳本健康度數據。  
    * **表格欄位**可能包含：「腳本名稱」、「總執行次數」、「失敗次數」和「失敗率」。  
    * **視覺增強**: 「失敗率」這一欄會是視覺焦點。  
      * 失敗率為 0% 的腳本可以顯示綠色的 Tag。  
      * 失敗率高於某個閾值（例如 5%）的腳本，其整行背景可能會被標示為淡紅色，或者在失敗率旁邊顯示一個紅色的警告圖標，以**強力突顯異常**，讓管理員能第一時間注意到有問題的腳本。  
  * **通知管道健康度 (Notification Health) 卡片**:  
    * 另一個關鍵卡片，標題為「通知管道健康度」。  
    * 內部同樣是一個 Table，展示 notification_health 的數據。  
    * **表格欄位**包含：「管道名稱」、「已發送數量」、「失敗數量」和「失敗率」。  
    * **視覺增強**: 同樣地，對於失敗數量或失敗率較高的通知管道，會使用**顏色或圖標**來進行視覺警示，確保管理員能快速識別出可能影響事件通知的系統瓶頸。
* **設計重點**：這是一個純粹的數據和健康度監控儀表板，設計上應極度注重**資訊的清晰度**和**異常狀態的突顯**。整體風格會與主儀表板類似，但內容更聚焦於平台自身的內部指標。
  * **頁面佈局**: 整個頁面會採用與主儀表板類似的**卡片式 (Card) 網格佈局**。頁面標題為「平台狀態診斷」，並可能有一個時間範圍選擇器（例如「過去 24 小時 / 7 天」）來調整數據的可視範圍。
  * **自動化健康度 (Automation Health) 卡片**: 這會是一個核心的卡片，標題為「自動化腳本健康度」。內部是一個 Ant Design Table，列出從 GET /api/v1/admin/diagnostics API 中獲取的腳本健康度數據。**表格欄位**可能包含：「腳本名稱」、「總執行次數」、「失敗次數」和「失敗率」。**視覺增強**: 「失敗率」這一欄會是視覺焦點。失敗率為 0% 的腳本可以顯示綠色的 Tag。失敗率高於某個閾值（例如 5%）的腳本，其整行背景可能會被標示為淡紅色，或者在失敗率旁邊顯示一個紅色的警告圖標，以**強力突顯異常**，讓管理員能第一時間注意到有問題的腳本。
  * **通知管道健康度 (Notification Health) 卡片**: 另一個關鍵卡片，標題為「通知管道健康度」。內部同樣是一個 Table，展示 notification_health 的數據。**表格欄位**包含：「管道名稱」、「已發送數量」、「失敗數量」和「失敗率」。**視覺增強**: 同樣地，對於失敗數量或失敗率較高的通知管道，會使用**顏色或圖標**來進行視覺警示，確保管理員能快速識別出可能影響事件通知的系統瓶頸。

### **14.3. 開發規格**
*   **API 端點**: `GET /api/v1/admin/diagnostics`
    * 支援查詢參數：`period`（1h/24h/7d/30d，預設 24h）或 `start_time`/`end_time`（ISO 8601）
*   **核心元件**: PlatformDiagnosticsPage.tsx, HealthDashboard.tsx

## **15. 非功能性需求 (Non-Functional Requirements)**

### **15.1. 國際化 (Internationalization - i18n)**

* **目標**: 支援多語言，初期支援**繁體中文 (zh-TW)** 和**英文 (en)**。  
* **體現之處**: 語言切換器。  
* **視覺描述**: 它的視覺設計已經包含在「**全局佈局**」的頂部 Header 中了。它通常是一個「地球」或「語言」圖標的 Dropdown 按鈕。點擊後，會彈出一個菜單，列出可選的語言（如「繁體中文」、「English」），使用者點擊後，整個介面的文字會即時切換。
* **實作要求**:  
  * [ ] 建立語言資源檔結構 (src/locales/zh-TW.json, src/locales/en.json)。  
  * [ ] 所有 UI 靜態文字都必須使用 i18n key。  
  * [ ] 提供語言切換器。

### **15.2. 無障礙訪問 (Accessibility - A11y)**

* **目標**: 確保應用程式可被輔助技術操作。
* **體現之處**: 焦點指示器 (Focus Indicator) 和 清晰的標籤。  
* **視覺描述**: 這不是一個頁面，而是一種**全局互動樣式**。當使用者使用鍵盤 Tab 鍵在頁面上導航時，所有可互動的元件（按鈕、連結、輸入框）周圍都會出現一個清晰的輪廓框（通常是藍色或白色的光暈），明確地告訴使用者當前的焦點在哪裡。這是確保鍵盤導航可用的核心視覺元素。  
* **實作要求**:  
  * [ ] **鍵盤導航**: 所有互動元件都必須可以透過 Tab 鍵聚焦。  
  * [ ] **ARIA 標籤**: 為非語意化元件提供正確的 ARIA 角色和屬性。  
  * [ ] **快捷鍵**: 為常用操作提供快捷鍵 (如 Ctrl+K 搜尋)。

### **15.3. 效能 (Performance)**

* **目標**: 提供快速、流暢的使用者體驗。
* **體現之處**: 載入狀態指示器 (Loading Indicators)。  
* **視覺描述**: 這也不是一個頁面，而是**元件的各種「載入中」狀態**。  
  * **頁面級載入**: 當載入整個頁面數據時，會在內容區中央顯示一個 Ant Design Spin (旋轉的圓圈)。  
  * **表格載入**: 當表格正在刷新數據時，整個表格內容會被一層半透明的遮罩覆蓋，中間有一個 Spin。  
  * **按鈕載入**: 當使用者點擊一個會觸發 API 請求的按鈕（如「儲存」、「登入」）時，按鈕會進入 loading 狀態，文字前會出現一個旋轉圖標，並且按鈕會被禁用，直到請求完成。  
* **實作要求**:  
  * [ ] **載入狀態**: 所有網路請求操作都必須有明確的 loading 狀態指示器。  
  * [ ] **表單草稿暫存**: 複雜表單應實作自動儲存草稿至 sessionStorage。  
  * [ ] **分頁**: 所有大量數據列表都必須實作後端分頁。

### **15.4. 響應式設計 (Responsive Web Design - RWD)**

* **目標**: 確保在行動裝置上有良好的瀏覽和操作體驗。  
* **體現之處**: **所有頁面在不同裝置上的佈局變化**。  
* **視覺描述**: 這不是一個新的設計，而是我們已經討論過的所有視覺設計的**一種適應性行為**。  
  * 例如，在桌面裝置上，「儀表板」的 KPI 卡片可能是四欄並排。  
  * 在平板裝置上，它們可能會自動變為兩欄。  
  * 在手機上，它們可能會變為單欄垂直排列，並且左側的 Sidebar 會自動收起，變為一個需要點擊才能展開的漢堡菜單。
* **實作要求**:  
  * [ ] 佈局應能自動適應螢幕寬度，避免水平滾動。  
  * [ ] 優化觸控目標的大小。

### **15.5. 錯誤對應與 UI 規範**
- 400 Bad Request：表單欄位顯示校驗錯誤（紅色提示），Header 顯示「請檢查輸入」。
- 401 Unauthorized：嘗試自動刷新（開發模式）；失敗則導向登入。顯示「請重新登入」。
- 403 Forbidden：顯示權限不足結果頁（含返回首頁的按鈕）；隱藏或禁用無權限的操作入口。
- 404 Not Found：顯示資源不存在提示與返回上一頁 CTA。
- 409 Conflict：顯示阻塞原因與解法（如「需先移轉任務」）；提供次要 CTA（查看關聯資源）。
- 500 Internal Server Error：顯示全局錯誤提示與「重試」按鈕；記錄 request_id。

### **15.6. 載入骨架與空狀態**
- 頁面級載入：Skeleton/Spin 居中；表格載入覆蓋層；按鈕載入態禁用。
- 空狀態：提供圖示 + 標題 + 說明 + 主操作（例如「建立第一個資源」）。
- 錯誤態：保留當前頁面佈局，於主區域顯示錯誤與重試 CTA。

### **15.7. 列表分頁/排序/過濾一致性**
- 一律採後端分頁：page/page_size，顯示 total。
- 排序參數：sort_by/sort_order；預設按 created_at desc（如端點支援）。
- 變更過濾條件重置到第 1 頁；維持目前排序設定不變。
- 表格選取保持在當前頁，切頁清除選取。

### **15.8. API 重試策略**
- GET 等冪等請求：網路錯誤可自動重試 1 次；仍失敗顯示重試 CTA。
- 非冪等（POST/PUT/DELETE）：不自動重試，僅提供手動重試入口。
- 全局記錄 request_id 以便除錯。

## **16. 通知管道 (Notification Channels)**

### **16.1. 功能目標**
提供系統通知管道（Email/Webhook/Slack/LINE/SMS）的集中管理、測試與狀態追蹤。

### **16.2. 功能規格**
- 列表：顯示名稱、類型、啟用狀態、最近測試結果/時間。
- 建立/編輯：根據類型動態顯示配置欄位（如 Webhook URL、Slack webhook、Email SMTP 設定等）。
- 測試：提供「發送測試」按鈕，顯示成功/失敗與訊息。
- 過濾/排序/分頁：支援後端分頁、sort_by/sort_order。

### **16.3. 視覺設計**
- 與其他管理頁一致的表格 + Modal 表單模式；測試結果以 Tag 或 Tooltip 呈現。
* **設計重點**：與其他管理頁一致的表格 + Modal 表單模式；測試結果以 Tag 或 Tooltip 呈現。
  * **頁面佈局**: 類似於「資源管理」或「人員管理」頁面，頂部有搜尋框和「新增通知管道」按鈕。
  * **通知管道列表**: 使用 Ant Design Table，欄位包含「名稱」、「類型」（Email, Webhook, Slack, LINE, SMS 等）、 「啟用狀態」（Switch 元件）、 「最近測試結果」（用不同顏色的 Tag 顯示「成功」或「失敗」，並可能帶有 Tooltip 顯示詳細錯誤訊息）和「最近測試時間」。
  * **新增/編輯彈窗**: 點擊「新增」或「編輯」按鈕後彈出 Modal。Modal 內部是一個 Form，會根據選擇的「管道類型」動態顯示不同的配置欄位。例如：
    * **Email**: SMTP 伺服器、埠號、發件人、密碼。
    * **Webhook**: URL、Header、Body 範本。
    * **Slack**: Webhook URL。
  * **測試功能**: 在新增/編輯 Modal 底部，會有一個「發送測試」按鈕。點擊後，會顯示一個 Message 提示測試結果（成功/失敗）。

### **16.4. 開發規格**
- 核心元件：`NotificationChannelsPage.tsx`, `NotificationChannelFormModal.tsx`
- API 端點：
  - `GET/POST/PUT/DELETE /api/v1/notification-channels`
  - `POST /api/v1/notification-channels/{channelId}/test`
- 權限：僅 `super_admin` 可寫入與測試。
- 驗收條件：
  - [ ] 不同類型的表單欄位可動態切換與驗證。
  - [ ] 測試成功/失敗能清晰回饋並記錄最近結果。
  - [ ] 列表支援分頁與排序。

## **17. 資源群組 (Resource Groups)**

### **17.1. 功能目標**
管理資源的分群，支援階層（可選），並提供群組層級的狀態摘要與成員管理。

### **17.2. 功能規格**
- 列表：顯示名稱、描述、成員數、狀態摘要（healthy/warning/critical）。
- CRUD：建立/編輯/刪除群組。
- 成員管理：以 Transfer 或多選 Select（支援搜尋）新增/移除資源。
- 過濾/排序/分頁：支援後端分頁、sort_by/sort_order。

### **17.3. 視覺設計**
- 標準表格頁，詳情頁可顯示狀態摘要卡片與最近相關事件。
* **設計重點**：強調對資源進行邏輯分組的能力，界面簡潔而功能強大，方便使用者管理群組及其成員。與其他列表管理頁面保持視覺和操作上的一致性。
  * **資源群組列表**: 頁面頂部是搜尋框和「新增群組」按鈕。主體是一個 Ant Design Table，列出所有資源群組。表格欄位包括「群組名稱」、「描述」、「成員數量」、「狀態摘要」（使用不同顏色的 Tag 顯示 `Healthy` / `Warning` / `Critical` 狀態，快速識別群組健康度），以及操作列（編輯、刪除、管理成員）。
  * **新增/編輯群組彈窗**: 點擊「新增群組」或編輯按鈕後彈出 Modal。Modal 內部是 Form，包含「群組名稱」、「描述」等基本資訊。核心互動是「群組成員」選擇器，這裡建議使用 Ant Design 的 `Transfer` (穿梭框) 或支援搜尋的 `Select.Multiple`，讓使用者可以從所有可用資源中，以拖曳、勾選或搜尋的方式，方便地將資源加入或移出群組。

### **17.4. 開發規格**
- 核心元件：`ResourceGroupsPage.tsx`, `ResourceGroupFormModal.tsx`, `GroupMembersModal.tsx`
- API 端點：
  - `GET/POST/PUT/DELETE /api/v1/resource-groups`
  - `POST /api/v1/resource-groups/{groupId}/members`
  - `GET /api/v1/resources?group_id={groupId}`（載入群組資源）
- 權限：`team_manager` 或 `super_admin` 可寫入與成員維護。
- 驗收條件：
  - [ ] 能新增/編輯/刪除群組並即時更新列表。
  - [ ] 成員管理支援搜尋與批次加入/移除。
  - [ ] 列表支援分頁與排序。

## **18. 審計日誌 (Audit Logs)**

### **18.1. 功能目標**
追蹤平台重要操作的審計紀錄，用於追溯與合規。

### **18.2. 功能規格**
- 列表欄位：時間、使用者、動作（create/update/delete/execute/login/logout）、資源類型/ID、結果（success/failure）。
- 過濾：時間範圍、使用者、動作、資源類型。
- 詳情：顯示 before/after 差異摘要（若有）。
- 分頁/排序：後端分頁、sort_by/sort_order。

### **18.3. 視覺設計**
- 表格 + 篩選區 + 詳情 Drawer/Modal；失敗行以顏色或圖示凸顯。
* **設計重點**：強調事件的可追溯性和合規性，界面設計需清晰地展示大量時間序列數據，並提供強大的過濾和詳情查看功能。
  * **審計日誌列表**: 頁面頂部是一個複雜的篩選區，包含「時間範圍選擇器」、「使用者」、「動作類型」、「資源類型」等下拉選單。主體是一個 Ant Design Table，展示了審計日誌列表。表格欄位包括「時間」、「操作者」、「動作」、「資源類型」、「資源 ID」、「結果」（使用綠色「成功」或紅色「失敗」的 Tag 顯示）。
  * **審計日誌詳情**: 點擊表格中單筆日誌的「查看詳情」按鈕後，右側會滑出一個 `Drawer`。Drawer 內部清晰地展示了該條日誌的所有詳細資訊，特別是「操作前 (Before)」和「操作後 (After)」的數據差異對比，方便管理員追溯具體的變動內容。失敗的日誌條目會特別醒目，例如整行背景變為淡紅色。

### **18.4. 開發規格**
- 核心元件：`AuditLogsPage.tsx`, `AuditLogDetailDrawer.tsx`
- API 端點：`GET /api/v1/audit-logs`
- 驗收條件：
  - [ ] 可依多條件查詢並分頁顯示。
  - [ ] 可展開單筆檢視重要變更前後的差異摘要。

## **19. 錯誤碼語意與前端文案對照（人讀版）**

以下為 ErrorResponse.error 常見值、對應 HTTP 狀態與建議前端文案（可作為 i18n key 與預設文案基礎）。

- BAD_REQUEST（400）
  - i18n key：errors.badRequest
  - 建議文案：請檢查輸入內容
  - 使用時機：欄位驗證失敗、缺少必要參數
- UNAUTHORIZED（401）
  - i18n key：errors.unauthorized
  - 建議文案：請重新登入
  - 使用時機：Token 過期/無效、尚未登入
- FORBIDDEN（403）
  - i18n key：errors.forbidden
  - 建議文案：您沒有權限執行此操作
  - 使用時機：角色或範圍不足（需 super_admin / team_manager）
- NOT_FOUND（404）
  - i18n key：errors.notFound
  - 建議文案：找不到資源或已被移除
  - 使用時機：ID 不存在、路由錯誤
- CONFLICT（409）
  - i18n key：errors.conflict
  - 建議文案：操作衝突，請先處理關聯項目
  - 使用時機：刪除使用者前需移轉任務、重名衝突
- RATE_LIMITED（429）
  - i18n key：errors.rateLimited
  - 建議文案：請稍後再試（請求過於頻繁）
  - 使用時機：後端節流/速率限制（如需採用，請於 API 補 429）
- INTERNAL_ERROR（500）
  - i18n key：errors.internal
  - 建議文案：系統發生錯誤，請稍後再試
  - 使用時機：非預期伺服器錯誤

前端處理建議：
- 依第 15.5 節的 UI 規範顯示對應視覺與 CTA；保留 ErrorResponse.request_id 於錯誤詳情（利於客服與除錯）。

### **19.1 i18n key 建議結構**
- errors.badRequest / errors.unauthorized / errors.forbidden / errors.notFound / errors.conflict / errors.rateLimited / errors.internal
- 可擴充：errors.field.required、errors.field.format、errors.network、errors.timeout

### **19.2 與後端對齊建議**
- 後端統一 ErrorResponse.error 值；前端以 mapping 渲染文案與操作建議（重試/回首頁/檢視說明）。

### **15.9. Mock（MSW）開發指南**
- 目錄：`src/mocks/`
- 內容：
  - `src/mocks/data/*.json`：各域假資料
  - `src/mocks/handlers.ts`：Mock 路由清單
  - `src/mocks/browser.ts` / `src/mocks/server.ts`：瀏覽器/Node 啟動
- 啟用方式：
  - 前端入口（main.tsx）在開發模式動態匯入 `src/mocks/browser` 後 `worker.start()`；在測試環境匯入 `src/mocks/server`。
- 原則：
  - 偽資料與 openapi.yaml 的 examples 對齊；遇缺未支援的端點可先回傳空集合或最小結構。

## 20. 規則與即時更新補充

### 20.1 資源健康判定規則（與 OpenAPI x-resource-status-rules 對齊）
- default：
  - critical: cpu > 90 OR memory > 95
  - warning: cpu > 80 OR memory > 85
  - healthy: cpu <= 80 AND memory <= 85
- server：
  - critical: cpu > 90 OR memory > 95 OR disk > 95
  - warning: cpu > 80 OR memory > 85 OR disk > 90
  - healthy: cpu <= 80 AND memory <= 85 AND disk <= 90
- database：
  - critical: cpu > 85 OR memory > 90 OR replication_lag_s > 10 OR connections_pct > 95
  - warning: cpu > 75 OR memory > 85 OR replication_lag_s > 5 OR connections_pct > 90
  - healthy: cpu <= 75 AND memory <= 85 AND replication_lag_s <= 5 AND connections_pct <= 90
- network：
  - critical: packet_loss_pct > 5 OR latency_ms > 200
  - warning: packet_loss_pct > 1 OR latency_ms > 100
  - healthy: packet_loss_pct <= 1 AND latency_ms <= 100
- application：
  - critical: error_rate_pct > 5 OR p95_latency_ms > 1000
  - warning: error_rate_pct > 1 OR p95_latency_ms > 500
  - healthy: error_rate_pct <= 1 AND p95_latency_ms <= 500
- container：
  - critical: cpu > 90 OR memory > 95 OR restarts_5m > 3
  - warning: cpu > 80 OR memory > 85 OR restarts_5m > 0
  - healthy: cpu <= 80 AND memory <= 85 AND restarts_5m == 0
- 說明：未覆蓋的資源類型沿用 default；若後端實作中有更精細的規則，請同步至 openapi.yaml 的 vendor extensions 並更新本段。

### 20.2 Incident 狀態機（與 OpenAPI x-incident-lifecycle 對齊）
- 狀態：new → acknowledged → resolved
- 允許轉換與角色：
  - new → acknowledged：team_member, team_manager, super_admin
  - acknowledged → resolved：team_member, team_manager, super_admin
- 對應端點：
  - POST /api/v1/incidents/{incidentId}/acknowledge
  - POST /api/v1/incidents/{incidentId}/resolve

### 20.3 權限檢查流程（與 OpenAPI x-permission-check 對齊）
- 後端：以 x-roles 強制校驗寫入端點
- 前端：
  - 未登入（401）：導向登入頁或彈出登入
  - 權限不足（403）：顯示 Forbidden 狀態，提供返回/申請權限 CTA
  - 批次操作部分成功：以 OperationResult/BatchOperationResult 顯示逐項成功/失敗

### 20.4 即時更新
- 首選 SSE：GET /api/v1/events?channels=alerts,incidents
  - text/event-stream；內含 ping 心跳，請以退避策略自動重連
  - 使用 lastEventId header 續傳
- 替代 WS：/ws/notifications（記載於 OpenAPI x-websocket）
  - 建議在需要雙向互動時採用（如訂閱管理），否則以 SSE 為主

### 20.5 資源批次操作
- 支援動作：delete, move_group, tag_add, tag_remove
- 參數：
  - move_group：parameters.group_id 必填
  - tag_add / tag_remove：parameters.tags 必填
- 回應：BatchOperationResult，前端以逐項呈現成功/失敗與訊息

## **21. 角色權限矩陣 (Role Permission Matrix)**

### **21.1. 角色定義**

| 角色名稱 | 角色標識 | 說明 |
| :--- | :--- | :--- |
| **超級管理員** | `super_admin` | 擁有系統最高權限，可以執行所有操作，包括系統級設定、用戶管理、審計日誌查看等 |
| **團隊管理員** | `team_manager` | 可以管理團隊成員、資源、事件規則、自動化腳本等團隊範圍內的資源 |
| **團隊成員** | `team_member` | 可以查看團隊資源、處理事件、執行腳本（受限），但不能進行管理級操作 |
| **唯讀用戶** | `viewer` | 僅可查看資源狀態、儀表板、報表，不能進行任何寫入操作 |

### **21.2. 功能模組權限對照表**

| 功能模組 | 操作 | super_admin | team_manager | team_member | viewer |
| :--- | :--- | :---: | :---: | :---: | :---: |
| **儀表板** | 查看 | ✔ | ✔ | ✔ | ✔ |
| **資源管理** | 查看列表 | ✔ | ✔ | ✔ | ✔ |
| | 新增資源 | ✔ | ✔ | ✗ | ✗ |
| | 編輯資源 | ✔ | ✔ | ✗ | ✗ |
| | 刪除資源 | ✔ | ✔ | ✗ | ✗ |
| | 批次操作 | ✔ | ✔ | ✗ | ✗ |
| | 網段掃描 | ✔ | ✔ | ✗ | ✗ |
| **資源群組** | 查看 | ✔ | ✔ | ✔ | ✔ |
| | 管理群組 | ✔ | ✔ | ✗ | ✗ |
| **事件事件** | 查看 | ✔ | ✔ | ✔ | ✔ |
| | 確認/解決 | ✔ | ✔ | ✔ | ✗ |
| | 批次處理 | ✔ | ✔ | ✔ | ✗ |
| | AI 報告 | ✔ | ✔ | ✔ | ✗ |
| **事件規則** | 查看 | ✔ | ✔ | ✔ | ✔ |
| | 管理規則 | ✔ | ✔ | ✗ | ✗ |
| **自動化** | 查看腳本 | ✔ | ✔ | ✔ | ✔ |
| | 編輯腳本 | ✔ | ✔ | ✗ | ✗ |
| | 執行腳本 | ✔ | ✔ | ✔* | ✗ |
| | 管理排程 | ✔ | ✔ | ✗ | ✗ |
| **用戶管理** | 查看 | ✔ | ✔ | ✗ | ✗ |
| | 管理用戶 | ✔ | ✗ | ✗ | ✗ |
| **團隊管理** | 查看 | ✔ | ✔ | ✔ | ✔ |
| | 管理團隊 | ✔ | ✔ | ✗ | ✗ |
| **通知管道** | 查看 | ✔ | ✔ | ✔ | ✔ |
| | 管理管道 | ✔ | ✗ | ✗ | ✗ |
| **系統設定** | 查看 | ✔ | ✗ | ✗ | ✗ |
| | 修改設定 | ✔ | ✗ | ✗ | ✗ |
| **維護時段** | 查看 | ✔ | ✔ | ✔ | ✔ |
| | 管理 | ✔ | ✗ | ✗ | ✗ |
| **審計日誌** | 查看 | ✔ | ✗ | ✗ | ✗ |
| **平台診斷** | 查看 | ✔ | ✗ | ✗ | ✗ |
| **容量規劃** | 執行分析 | ✔ | ✔ | ✔ | ✔ |

*註：`team_member` 可執行腳本，但可能受到腳本本身的權限限制

### **21.3. API 端點權限映射 (x-roles)**

以下列出 openapi.yaml 中已定義 x-roles 的主要端點：

| API 端點 | HTTP 方法 | 需要角色 |
| :--- | :--- | :--- |
| `/api/v1/resources` | POST | team_manager, super_admin |
| `/api/v1/resources/{resourceId}` | PUT, DELETE | team_manager, super_admin |
| `/api/v1/resources/batch` | POST | team_manager, super_admin |
| `/api/v1/resources/scan` | POST | team_manager, super_admin |
| `/api/v1/resource-groups` | POST | team_manager, super_admin |
| `/api/v1/resource-groups/{groupId}` | PUT, DELETE | team_manager, super_admin |
| `/api/v1/users` | POST | super_admin |
| `/api/v1/users/{userId}` | PUT, DELETE | super_admin |
| `/api/v1/teams` | POST | team_manager, super_admin |
| `/api/v1/teams/{teamId}` | PUT, DELETE | team_manager, super_admin |
| `/api/v1/notification-channels` | POST | super_admin |
| `/api/v1/notification-channels/{channelId}` | PUT, DELETE | super_admin |
| `/api/v1/alert-rules` | POST | team_manager, super_admin |
| `/api/v1/alert-rules/{ruleId}` | PUT, DELETE | team_manager, super_admin |
| `/api/v1/automation/scripts` | POST | team_manager, super_admin |
| `/api/v1/automation/scripts/{scriptId}` | PUT, DELETE | team_manager, super_admin |
| `/api/v1/automation/scripts/{scriptId}/run` | POST | team_manager, super_admin, team_member |
| `/api/v1/automation/execute` | POST | team_manager, super_admin |
| `/api/v1/automation/schedules` | POST | team_manager, super_admin |
| `/api/v1/settings` | PUT | super_admin |
| `/api/v1/settings/maintenance-windows` | GET, POST | super_admin |
| `/api/v1/audit-logs` | GET | super_admin |
| `/api/v1/admin/diagnostics` | GET | super_admin |
| `/api/v1/capacity-planning/analyze` | POST | team_manager, super_admin |
| `/api/v1/capacity/forecast` | POST | team_manager, super_admin |
| `/api/v1/capacity/reports` | GET | team_manager, super_admin |
| `/api/v1/capacity/reports/{reportId}` | GET | team_manager, super_admin |

### **21.4. 前端權限控制實作指引**

#### **21.4.1. 權限檢查工具函數**

```typescript
// src/utils/permissions.ts
export const hasRole = (userRoles: string[], requiredRoles: string[]): boolean => {
  return requiredRoles.some(role => userRoles.includes(role));
};

export const canWrite = (userRoles: string[]): boolean => {
  return hasRole(userRoles, ['team_manager', 'super_admin']);
};

export const isAdmin = (userRoles: string[]): boolean => {
  return hasRole(userRoles, ['super_admin']);
};
```

#### **21.4.2. UI 元件權限控制**

- **隱藏操作按鈕**：當用戶無權限時，不顯示「新增」、「編輯」、「刪除」等按鈕
- **禁用表單**：在唯讀模式下，表單欄位設為 `disabled`
- **路由守衛**：在路由層級檢查權限，無權限時導向 403 頁面
- **菜單過濾**：根據角色動態顯示/隱藏側邊欄菜單項

#### **21.4.3. 錯誤處理**

- **401 未授權**：引導用戶重新登入
- **403 無權限**：顯示「您沒有權限執行此操作」提示，提供返回按鈕

### **21.5. 角色管理最佳實踐**

1. **最小權限原則**：預設給予最低必要權限
2. **權限分離**：系統管理與業務操作分離
3. **審計追蹤**：所有權限相關操作都記錄在審計日誌
4. **定期審查**：定期檢查用戶權限是否適當

* **設計重點**：這是一個供管理員查看和理解系統權限分配的頁面，設計上追求清晰、易讀，幫助管理員快速定位不同角色的權限範圍。
  * **角色權限矩陣頁面**:
    * 頁面頂部可能會有一個簡潔的說明文字，解釋不同角色的定義。
    * 主體是一個大型的、可滾動的表格，即**角色權限矩陣**本身。
    * **行**: 列出所有「功能模組」和其下的「操作」。
    * **列**: 列出所有「角色名稱」（`super_admin`, `team_manager` 等）。
    * **單元格**: 使用綠色的「✔」表示有權限，紅色的「✗」表示無權限。這種直觀的視覺符號讓權限對照一目了然。
    * 表格可能提供篩選功能，讓管理員可以按功能模組或角色來縮小顯示範圍。

## **22. 通知中心 (Notification Center)**

### **22.1. 功能目標**
在不離開當前頁面的情況下，提供一個快速查閱、管理個人通知的入口。

### **22.2. 功能規格**
- **觸發**: 點擊頂部 Header 右側的鈴鐺圖標 (`BellOutlined`)。
- **未讀計數**: 鈴鐺圖標上應有 Ant Design `Badge` 元件，顯示未讀通知總數 (`unread_count`)。
- **列表展示**: 彈出一個 `Popover` 或 `Dropdown`，內部使用 `List` 元件展示最近的通知。
- **操作**:
    - 點擊單則通知可跳轉至相關頁面（如事件詳情）。
    - 提供「全部標為已讀」按鈕。
    - 提供「查看所有通知」的連結，導向獨立的通知歷史頁面。

### **22.3. 視覺設計**
* **核心風格**: 輕量、快速、不打擾。設計目標是讓使用者能迅速掃描最新動態，並決定是否需要進一步操作。
* **視覺設計描述**:
    - **觸發器**: 頂部 Header 右側的鈴鐺圖標。當 `unread_count` > 0 時，圖標右上角會顯示一個紅色的 `Badge`。
    - **彈出層 (Popover)**:
        - 點擊鈴鐺後，下方會彈出一個固定寬度的 Popover。
        - **頂部**: 標題為「通知中心」，右側有一個「全部標為已讀」的文字按鈕。
        - **中間 (列表)**: 使用 Ant Design `List` 元件，每則通知 (`List.Item`) 包含：
            - **左側**: 一個代表通知類型的圖標 (例如：`error` 用紅色 `ExclamationCircleOutlined`，`system` 用藍色 `InfoCircleOutlined`)。
            - **中間**: 通知標題和摘要訊息。未讀通知的標題會**加粗**顯示。
            - **右側**: 顯示通知的相對時間（例如「5 分鐘前」）。
        - **底部**: 一個置中的「查看所有通知」連結，點擊後跳轉到完整的通知歷史頁面。
* **設計重點**：輕量、快速、不打擾。設計目標是讓使用者能迅速掃描最新動態，並決定是否需要進一步操作。
  * **通知中心 Popover**: 此圖展示了點擊頂部 Header 右側鈴鐺圖標後彈出的 Popover。Popover 內部分為頂部的標題「通知中心」和下方的滾動列表。每條通知包含一個代表狀態的圖標（例如，紅色感嘆號表示錯誤，藍色資訊圖標表示普通通知）、通知標題（未讀會加粗）和時間戳（如「5分鐘前」）。未讀通知會有一顆藍點提示。底部有一個「全部標為已讀」按鈕和「查看所有通知」的連結。整體風格緊湊且資訊清晰。

### **22.4. 開發規格**
- **核心元件**: `NotificationCenter.tsx` (在 `Header.tsx` 中使用)
- **API 端點**:
    - `GET /api/v1/notifications/summary`: 獲取 `unread_count`。
    - `GET /api/v1/notifications?page_size=5`: 獲取最近 5 則通知。
    - `POST /api/v1/notifications/mark-all-as-read`: 標記全部已讀。
- **驗收條件**:
    - [ ] 鈴鐺圖標能正確顯示未讀數量
    - [ ] 點擊鈴鐺能彈出通知列表
    - [ ] 未讀通知在列表中能正確加粗顯示
    - [ ] 能成功標記所有通知為已讀
    - [ ] 能跳轉到通知詳情頁面

## **23. 全局搜索 (Global Search)**

### **23.1. 功能目標**
提供一個快速、跨模組的搜索入口，讓使用者可以透過關鍵字迅速定位到平台內的任何資源、腳本或事件。

### **23.2. 功能規格**
- **觸發**:
    - 點擊頂部 Header 的搜索框。
    - 使用快捷鍵 `Ctrl+K` (macOS 上為 `Cmd+K`)。
- **互動**:
    - 觸發後，螢幕中央彈出一個 `Modal` 或類似 Spotlight 的搜索框。
    - 輸入關鍵字時，即時調用 `autocomplete` API 顯示建議。
    - 按下 Enter 或點擊搜索按鈕後，調用 `search` API 展示完整結果。
- **結果展示**: 搜索結果應按資源類型分組（例如：資源、事件、自動化腳本）。

### **23.3. 視覺設計**
* **核心風格**: 快速、聚焦、高效。靈感來源於 VS Code 的命令面板或 macOS 的 Spotlight 搜尋。
* **視覺設計描述**:
    - **觸發器**: Header 中的搜索框，或鍵盤快捷鍵。
    - **搜索模態框 (Modal)**:
        - 觸發後，螢幕中央彈出一個無邊框、帶有柔和陰影的 `Modal`。背景會被半透明的遮罩覆蓋，讓使用者的焦點完全集中在搜索上。
        - **頂部**: 一個大的、無邊框的 `Input` 輸入框，帶有搜索圖標。
        - **結果列表**: 輸入框下方是滾動的結果列表。
            - **分組**: 結果使用 Ant Design `List` 顯示，並帶有分組標題 (例如 `Divider` 標示的「資源」、「事件」)。
            - **列表項**: 每個結果項都包含：
                - **圖標**: 代表資源類型的圖標。
                - **標題**: 資源名稱，其中與關鍵字匹配的部分會**高亮**顯示。
                - **描述**: 簡短的描述或路徑，例如資源的 IP 地址或事件的狀態。
            - **互動**: 可以使用鍵盤上下鍵導航，Enter 鍵或滑鼠點擊可跳轉到對應的詳情頁。
* **設計重點**：快速、聚焦、高效。靈感來源於 VS Code 的命令面板或 macOS 的 Spotlight 搜尋。
  * **全局搜索模態框**: 點擊頂部 Header 的搜尋框或按下 `Ctrl+K` 後，螢幕中央彈出一個簡潔的 Modal。Modal 頂部是一個大的搜尋輸入框，旁邊提示快捷鍵「Cmd+K」。下方是按類型分組的搜尋結果列表。
  * **結果分組**: 搜尋結果分為「資源」、「事件」、「自動化腳本」等區塊，每個區塊由一個分隔線和標題隔開。
  * **列表項**: 每條結果都包含一個代表類型的圖標、標題（與關鍵字匹配的部分高亮顯示）和簡要描述（如資源 IP 或事件狀態）。列表底部有鍵盤導航提示。

### **23.4. 開發規格**
- **核心元件**: `GlobalSearch.tsx`, `SearchModal.tsx`
- **API 端點**:
    - `GET /api/v1/autocomplete`: 用於即時搜尋建議。
    - `GET /api/v1/search`: 用於獲取完整的搜尋結果。
- **驗收條件**:
    - [ ] 能通過點擊搜索框或快捷鍵觸發搜索
    - [ ] 輸入關鍵字時能顯示自動完成建議
    - [ ] 搜索結果能按類型分組顯示
    - [ ] 能通過鍵盤或鼠標選擇搜索結果並跳轉

## **24. 平台診斷 (Platform Diagnostics)**

### **24.1. 功能目標**
為 `super_admin` 提供一個專門的儀表板，用以監控 SRE 平台自身的健康狀況，快速發現系統瓶頸（如失敗率高的腳本或通知管道）。

### **24.2. 功能規格**
- **權限**: 僅 `super_admin` 可見，在側邊欄菜單中顯示。
- **佈局**: 採用與主儀表板類似的卡片式佈局。
- **數據展示**:
    - **自動化健康度**: 以表格形式展示腳本的總執行次數、失敗次數和失敗率。
    - **通知管道健康度**: 以表格形式展示各管道的發送總數、失敗數和失敗率。
- **互動**: 允許按時間範圍（過去 24 小時 / 7 天）篩選數據。

### **24.3. 視覺設計**
* **核心風格**: 數據驅動、異常突顯。設計目標是讓平台管理員能一眼看出系統哪個環節出了問題。
* **視覺設計描述**:
    - **頁面佈局**: 整個頁面是一個**卡片式網格佈局**。頁面頂部有標題「平台狀態診斷」和一個 `Radio.Group` 或 `Select` 用於切換時間範圍。
    - **關鍵卡片 (Card)**:
        - **自動化腳本健康度**:
            - 卡片標題為「自動化健康度」。
            - 內部是一個 Ant Design `Table`，列出「腳本名稱」、「總執行次數」、「失敗率」。
            - **視覺警示**: 「失敗率」一欄是視覺重點。使用 `Progress` 元件來視覺化失敗率，並根據閾值改變顏色（例如 > 5% 為紅色）。失敗率高的行也可以用淡紅色背景高亮，強力吸引管理員注意。
        - **通知管道健康度**:
            - 卡片標題為「通知管道健康度」。
            - 內部同樣是一個 `Table`，列出「管道名稱」、「發送總數」、「失敗率」。
            - **視覺警示**: 同樣使用顏色和進度條等視覺元素來突顯失敗率異常的管道。
* **設計重點**：數據驅動、異常突顯。設計目標是讓平台管理員能一眼看出系統哪個環節出了問題。
  * **平台診斷儀表板**: 整個頁面是一個卡片式網格佈局。頁面頂部有標題「平台狀態診斷」和一個用於切換時間範圍的選擇器（如「過去 24 小時 / 7 天」）。
  * **自動化腳本健康度卡片**: 卡片標題為「自動化腳本健康度」。內部是一個 Ant Design Table，列出「腳本名稱」、「總執行次數」、「失敗率」。失敗率一欄是視覺重點，使用 `Progress` 元件視覺化失敗率，並根據閾值改變顏色（例如 > 5% 為紅色）。失敗率高的行也可以用淡紅色背景高亮，強力吸引管理員注意。
  * **通知管道健康度卡片**: 卡片標題為「通知管道健康度」。內部同樣是一個 Table，列出「管道名稱」、「發送總數」、「失敗率」。同樣使用顏色和進度條等視覺元素來突顯失敗率異常的管道。

### **24.4. 開發規格**
- **核心元件**: `PlatformDiagnosticsPage.tsx`, `HealthStatusCard.tsx`
- **API 端點**: `GET /api/v1/admin/diagnostics`
- **驗收條件**:
    - [ ] 僅 super_admin 能訪問此頁面
    - [ ] 能正確顯示自動化腳本健康度表格
    - [ ] 能正確顯示通知管道健康度表格
    - [ ] 能按時間範圍篩選數據
    - [ ] 高失敗率項目能正確高亮顯示

## **25. 角色管理 (Role Management)**

### **25.1. 功能目標**
為 `super_admin` 提供一個管理系統角色與其權限的界面。

### **25.2. 功能規格**
- **權限**: 僅 `super_admin` 可訪問。
- **列表**: 展示所有系統角色，包括內建角色和自定義角色。
- **操作**:
    - **查看**: 點擊角色可查看其擁有的權限列表。
    - **新增/編輯**: 允許創建新的自定義角色，或修改現有自定義角色的權限。
    - **內建角色**: 內建角色（如 `super_admin`, `team_manager`）的權限應為只讀，不可修改。

### **25.3. 視覺設計**
* **核心風格**: 清晰、結構化、安全。設計上要明確區分可編輯和不可編輯的內容，防止誤操作。
* **視覺設計描述**:
    - **頁面佈局**: 採用左右分欄佈局。
        - **左側**: 是一個 `List` 或 `Table`，展示所有角色的列表。列表項包含角色名稱和描述。當前選中的角色會高亮顯示。列表頂部有一個「新增角色」按鈕。
        - **右側**: 顯示當前在左側選中角色的詳細權限。
    - **權限詳情 (右側)**:
        - **標題**: 顯示角色名稱，旁邊可能有個標籤指示其為「內建角色」或「自定義角色」。
        - **權限樹 (Tree)**: 使用 Ant Design `Tree` 元件來展示所有權限。權限按模組（如「資源管理」、「事件管理」）進行分組。
        - **互動**:
            - 如果選中的是**自定義角色**，`Tree` 元件會帶有複選框 (`checkable`)，管理員可以勾選或取消勾選來增刪權限。底部會有一個「儲存變更」按鈕。
            - 如果選中的是**內建角色**，`Tree` 的複選框會被禁用 (`disabled`)，純粹用於展示，且沒有「儲存變更」按鈕，以防管理員試圖修改核心角色的權限。
* **設計重點**：清晰、結構化、安全。設計上要明確區分可編輯和不可編輯的內容，防止誤操作。
  * **角色管理頁面**: 採用左右分欄佈局。
    * **左側**: 是一個列表，展示所有角色的名稱（如 `super_admin`, `team_manager`, `viewer` 以及自定義角色）。當前選中的角色會高亮顯示。列表頂部有一個「新增角色」按鈕。
    * **右側**: 顯示當前在左側選中角色的詳細權限。
  * **權限詳情 (右側)**:
    * **標題**: 顯示角色名稱，旁邊可能有個標籤指示其為「內建角色」或「自定義角色」。
    * **權限樹 (Tree)**: 使用 Ant Design `Tree` 元件來展示所有權限。權限按模組（如「資源管理」、「事件管理」）進行分組。
    * **互動**:
      * 如果選中的是**自定義角色**，`Tree` 元件會帶有複選框 (`checkable`)，管理員可以勾選或取消勾選來增刪權限。底部會有一個「儲存變更」按鈕。
      * 如果選中的是**內建角色**，`Tree` 的複選框會被禁用 (`disabled`)，純粹用於展示，且沒有「儲存變更」按鈕，以防管理員試圖修改核心角色的權限。

### **25.4. 開發規格**
- **核心元件**: `RoleManagementPage.tsx`, `RoleList.tsx`, `PermissionTree.tsx`
- **API 端點**:
    - `GET /api/v1/roles`: 獲取角色列表。
    - `POST /api/v1/roles`: 創建新角色。
    - `PUT /api/v1/roles/{roleName}`: 更新角色權限。
- **驗收條件**:
    - [ ] 僅 super_admin 能訪問角色管理頁面
    - [ ] 能查看所有角色列表
    - [ ] 能查看角色的權限詳情
    - [ ] 能創建和編輯自定義角色
    - [ ] 內建角色的權限為只讀

## **附錄：API 錯誤處理的具體 UI 呈現方式**

本節詳細定義不同 HTTP 錯誤狀態碼在前端的統一視覺呈現和互動方式，以確保使用者在遇到問題時能獲得清晰、一致的指引。

### **通用錯誤提示**

- **`Message` 元件**: 對於非阻塞性的、操作級的錯誤（例如，儲存失敗），應在頁面頂部中間彈出一個 Ant Design `message.error()` 提示。
    - **內容**: 包含一個錯誤圖標和簡潔的錯誤文案（來自 i18n key）。
    - **持續時間**: 預設 3 秒後自動消失。
- **`Alert` 元件**: 對於需要使用者注意但不完全阻塞頁面內容的錯誤（例如，某個圖表載入失敗），在對應的卡片或區域內顯示一個 Ant Design `Alert` 元件。
    - **樣式**: `type="error"`。
    - **內容**: 包含錯誤標題 (`message`) 和詳細描述 (`description`)，以及一個可選的「重試」按鈕。

### **特定 HTTP 狀態碼的 UI 呈現**
* **設計重點**：本節詳細定義不同 HTTP 錯誤狀態碼在前端的統一視覺呈現和互動方式，以確保使用者在遇到問題時能獲得清晰、一致的指引。
  * **通用錯誤提示**:
    * **Message 元件 (頁面頂部中間)**: `message.error()` 彈出提示會以一個簡潔的紅色條形框出現在頁面頂部中央，包含一個感嘆號圖標和錯誤文案（例如：「儲存失敗，請檢查輸入內容」）。
    * **Alert 元件 (卡片或區域內)**: 在圖表或特定數據載入失敗的卡片內部，會顯示一個紅色的 `Alert` 提示框，包含錯誤標題、詳細描述和一個「重試」按鈕。
  * **400 Bad Request**:
    * **表單級錯誤**: 表單提交失敗時，相關輸入框的邊框會變為紅色，下方顯示具體校驗錯誤訊息（例如「電子郵件格式不正確」）。頁面頂部也可能彈出 `message.error("請檢查輸入內容")`。
  * **401 Unauthorized**:
    * **強制重導與提示**: 頁面會自動重導至登入頁 (`/login`)。登入頁頂部會顯示一個 `Alert` 提示框：「您的登入已過期，請重新登入」。
  * **403 Forbidden**:
    * **操作級**: 如果是點擊無權限按鈕，按鈕會無反應或彈出 `message.error("您沒有權限執行此操作")`。
    * **頁面級**: 如果訪問無權限頁面，頁面中央會顯示一個 `Result` 元件，標題為「403」、副標題「抱歉，您無權訪問此頁面。」，下方有一個藍色的「返回首頁」按鈕。
  * **404 Not Found**:
    * **頁面級**: 頁面中央會顯示一個 `Result` 元件，標題為「404」、副標題「抱歉，您訪問的頁面不存在。」，下方有一個藍色的「返回首頁」按鈕。
  * **409 Conflict**:
    * **對話框提示**: 彈出一個 `Modal.warning()` 對話框，標題為「操作無法完成」，內容詳細解釋衝突原因（例如「無法刪除此群組，因為它仍包含 X 個資源。請先將資源移轉至其他群組。」），並提供一個「我知道了」按鈕。
  * **500 Internal Server Error**:
    * **頁面級**: 頁面中央會顯示一個 `Result` 元件，標題為「500」、副標題「抱歉，伺服器發生錯誤，請稍後再試。」，下方有一個「重試」按鈕。
    * **操作級**: 彈出 `message.error("系統發生錯誤，請稍後再試")`。

-   **400 Bad Request (請求錯誤)**
    - **場景**: 通常發生在表單提交時，由於使用者輸入的數據未通過後端驗證。
    - **UI 呈現**:
        - 觸發 `message.error("請檢查輸入內容")` 全局提示。
        - 在對應的 `Form.Item`下方顯示具體的錯誤訊息（例如「此電子郵件已被註冊」）。該 `Form.Item` 的輸入框邊框會變為紅色。
        - 提交按鈕的 `loading` 狀態應解除。

-   **401 Unauthorized (未授權)**
    - **場景**: Token 過期或無效，使用者需要重新登入。
    - **UI 呈現**:
        - 不應只顯示錯誤訊息。應攔截此響應，清除本地所有使用者狀態和 Token。
        - **強制重導**: 自動將頁面重導至 `/login` 登入頁。
        - 可以在重導後的登入頁 URL 中附加一個參數（如 `?session_expired=true`），以便在登入頁頂部顯示一個 `Alert`提示：「您的登入已過期，請重新登入」。

-   **403 Forbidden (禁止訪問)**
    - **場景**: 使用者已登入，但其角色沒有權限執行某項操作或訪問某個頁面。
    - **UI 呈現**:
        - **操作級**: 如果是點擊某個按鈕（如「刪除」）觸發，則按鈕應立即恢復原狀，並彈出 `message.error("您沒有權限執行此操作")`。理想情況下，無權限的按鈕應該在一開始就被禁用或隱藏。
        - **頁面級**: 如果是訪問整個頁面，則不應顯示頁面內容，而是渲染一個 Ant Design `Result` 元件。
            - `status="403"`
            - `title="403"`
            - `subTitle="抱歉，您無權訪問此頁面。"`
            - `extra`: 提供一個藍色的「返回首頁」按鈕 (`<Button type="primary">`)。

-   **404 Not Found (未找到)**
    - **場景**: 訪問的資源 ID 不存在（例如 `.../resources/一個不存在的ID`），或訪問了一個無效的路由。
    - **UI 呈現**:
        - 渲染一個 Ant Design `Result` 元件。
            - `status="404"`
            - `title="404"`
            - `subTitle="抱歉，您訪問的頁面不存在。"`
            - `extra`: 提供一個藍色的「返回首頁」按鈕。

-   **409 Conflict (衝突)**
    - **場景**: 操作因狀態衝突而無法完成（例如，刪除一個仍有關聯資源的群組）。
    - **UI 呈現**:
        - 使用 Ant Design `Modal.confirm()` 或 `Modal.warning()` 彈出一個對話框，清楚地向使用者解釋衝突原因和解決步驟。
        - `title`: "操作無法完成"
        - `content`: "無法刪除此群組，因為它仍包含 X 個資源。請先將資源移轉至其他群組。"
        - `okText`: "我知道了" (通常只有一個確認按鈕)
        - `cancelButtonProps`: `{ style: { display: 'none' } }`

-   **500 Internal Server Error (伺服器內部錯誤)**
    - **場景**: 後端發生了非預期的錯誤。
    - **UI 呈現**:
        - **頁面級**: 如果是頁面載入時發生，應渲染 `Result` 元件。
            - `status="500"`
            - `title="500"`
            - `subTitle="抱歉，伺服器發生錯誤，請稍後再試。"`
            - `extra`: 提供一個「重試」按鈕，點擊後重新觸發頁面數據的 API 請求。
        - **操作級**: 如果是某個按鈕操作觸發，則彈出 `message.error("系統發生錯誤，請稍後再試")`。