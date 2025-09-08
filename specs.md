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
- [11. 事件紀錄 (Incidents)](#11-事件紀錄-incidents)
- [12. 個人資料與設定 (Profile & Settings)](#12-個人資料與設定-profile--settings)
- [13. 系統設定 (System Settings)](#13-系統設定-system-settings)
- [14. 平台維運 (Platform Operations)](#14-平台維運-platform-operations)
- [15. 非功能性需求 (Non-Functional Requirements)](#15-非功能性需求-non-functional-requirements)
- [16. 通知管道 (Notification Channels)](#16-通知管道-notification-channels)
- [17. 資源分組 (Resource Groups)](#17-資源分組-resource-groups)
- [18. 審計日誌 (Audit Logs)](#18-審計日誌-audit-logs)
- [19. 錯誤碼語意與前端文案對照（人讀版）](#19-錯誤碼語意與前端文案對照人讀版)
- [20. 規則與即時更新補充](#20-規則與即時更新補充)
- [21. 角色權限矩陣 (Role Permission Matrix)](#21-角色權限矩陣-role-permission-matrix)
- [22. 通知中心 (Notification Center)](#22-通知中心-notification-center)
- [23. 全局搜索 (Global Search)](#23-全局搜索-global-search)
- [24. 平台診斷 (Platform Diagnostics)](#24-平台診斷-platform-diagnostics)
- [25. 角色管理 (Role Management)](#25-角色管理-role-management)

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
* 確保用戶能夠安全地結束當前會話。  
* **頁面說明**:
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
* **圖表區**: 「資源分組狀態總覽」長條圖與「資源狀態分佈」圓餅圖。  
* **增補功能**:  
  * 趨勢指標加入迷你圖 (Sparkline)。  
  * 允許使用者自訂卡片排列。

### **5.3. 視覺設計**
* **核心風格**: 
	* 強調**一覽性**和**關鍵資訊快速獲取**。  
	* 採用 Ant Design Grid 和 Card 形成卡片式佈局。  
	* 使用不同顏色區分卡片狀態，提升視覺衝擊力。   
* **頁面說明**:  
  * **[儀表板]**: 畫面由多個卡片組成。頂部是三張並排的 KPI 狀態趨勢卡片（例如：「新事件」、「處理中」、「今日已解決」），使用 Statistic 元件突顯核心數字，並附有與昨日比較的趨勢百分比。下方左側是「資源分組狀態總覽」的長條圖，右側是「資源狀態分佈」的圓餅圖，兩者都使用了 ECharts 進行數據可視化，色彩清晰，圖例明確。

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
* **輸入**: 選擇「資源分組」和關鍵效能指標。  
* **輸出**:  
  * **關鍵預測指標**: 以卡片形式呈現，如「預計將在 45 天後達到 80% 警戒線」。  
  * **趨勢圖**: 包含歷史數據與未來預測的趨勢線。  
  * **建議措施**: 系統提出的建議，並可觸發對應的自動化腳本。

### **10.3. 視覺設計**
* **核心風格**: 這是一個數據分析與預測導向的頁面，設計上強調**輸入的簡潔性**與**輸出的可視化**，幫助使用者從歷史數據中洞察未來趨勢。  
* **頁面說明**:  
  * **[容量規劃初始頁面]**: 畫面佈局清晰，頂部是一個配置表單 (Form)，包含兩個核心的下拉選單：「選擇資源分組」和「選擇關鍵效能指標」，旁邊是一個藍色的「開始分析」按鈕。初始狀態下，主內容區會提示使用者進行選擇以開始分析。  
  * **[容量規劃結果頁面]**: 點擊分析後，頁面會動態呈現結果。頂部會出現幾張並排的 Card，用 Statistic 元件醒目地展示關鍵預測指標，例如：「預計將在 **45 天後** 達到 80% 警戒線」。  
  * 下方的主圖表是一個 ECharts 折線圖，圖中用**兩種不同顏色或線型**（例如實線代表歷史，虛線代表預測）清晰地繪製了**歷史數據趨勢**與**未來預測趨勢**，並可能包含一條代表「警戒線」的水平標示線，視覺衝擊力強，結果一目了然。

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
    - 包含對**維護窗口**的完整 CRUD 管理功能。

### **12.3. 視覺設計**
* **核心風格**: 這是一個純粹的表單驅動的管理界面，設計上注重**分區的邏輯性**和**操作的回饋感**。  
* **頁面說明**:  
  * **[頁面佈局]**: 整個頁面使用頂層的 Tabs 將「個人資料」和「系統設定」完全分開。  
  * **[個人資料頁籤]**: 內部再次使用 Tabs 將「個人資訊」、「密碼安全」和「通知設定」三個部分清晰地劃分開來。  
    * 在「通知設定」頁籤中，每個聯絡方式（Email, SMS）後面都有一個狀態指示器（例如「已驗證」的綠色標籤）和獨立的操作按鈕（「傳送驗證」、「測試」），介面清晰地傳達了每個聯絡渠道的狀態和可用操作。  
  * **[系統設定頁籤]**: (僅管理員可見) 同樣使用內部 Tabs 劃分不同的系統級設定，例如「整合設定」（用於配置 Grafana 等）和「維護窗口管理」。  
    * 「維護窗口管理」的介面是一個標準的 CRUD 表格，包含列表、新增、編輯和刪除按鈕，與平台其他管理頁面的風格保持一致。


### **12.4. 開發規格**
- **核心元件**: `SettingsPage.tsx`, `ProfileForm.tsx`, `MaintenanceWindowsTable.tsx`
- **API 端點**:
    - `GET/PUT /api/v1/users/profile`: 管理個人資料。
    - `GET/POST/PUT/DELETE /api/v1/settings/maintenance-windows`: 管理維護窗口。
- **驗收條件**:
    - [ ] 普通使用者只能看到「個人資料」頁籤。
    - [ ] 管理員能看到並成功管理「系統設定」中的維護窗口。

## **13. 系統設定 (System Settings)**

### **13.1. 維護窗口管理 (Maintenance Window Management)**

#### **功能目標**
提供對全域維護窗口的集中管理，確保在計畫性維護期間能自動抑制事件。

### **13.2. 功能規格**
*   **列表與管理**: 提供對已設定維護窗口的列表、新增、編輯和刪除功能。此功能解決了 **G-09** 缺口，提供了完整的生命週期管理。
*   **關聯資源**: 在設定時，可以指定此維護窗口影響的資源分組或特定資源。

### **13.3. 視覺設計**

* **核心風格**: 這是一個標準的 CRUD (建立、讀取、更新、刪除) 管理界面，設計上強調**資訊的結構化呈現**和**表單設定的直觀性**。整體風格會與「資源管理」、「組織管理」等頁面保持高度一致，以降低管理員的學習成本。  
* **頁面說明**: (此頁面可參考**資源管理**或**人員管理**的佈局，因為它們都是標準的表格管理界面)  
  * **[資源管理主頁]**  
* **視覺設計描述**:  
  * **頁面佈局**:  
    * 此功能會作為「系統設定」頁面下的一個**頁籤 (Tab)**。  
    * 頁籤內容頂部是操作區，包含一個**搜尋框**（用於快速查找特定維護窗口）和一個藍色的**「新增維護窗口」按鈕**。  
    * 下方主體部分是一個 Ant Design Table，用於展示所有已設定的維護窗口列表。  
  * **表格 (Table) 設計**:  
    * **表格欄位**會清晰地列出維護窗口的關鍵資訊，例如：「名稱」、「描述」、「開始時間」、「結束時間」、「是否重複 (Recurring)」以及「影響的資源/群組」。  
    * 「是否重複」欄位可以使用 Tag 或 Switch 元件來直觀顯示狀態。  
    * 每行末尾都會有「編輯」和「刪除」的文字按鈕，用於管理單個項目。  
  * **新增/編輯彈窗 (Modal) 設計**:  
    * 點擊「新增」或「編輯」按鈕後，會彈出一個 Modal，內部是一個結構清晰的 Form。  
    * **表單欄位**會包含：  
      * **名稱/描述**: 標準的文字輸入框 (Input, Input.TextArea)。  
      * **時間範圍**: 使用 DatePicker.RangePicker 元件，讓使用者可以方便地選擇開始和結束的日期與時間。  
      * **重複規則**: 可能是一個 Checkbox ("是否重複")，勾選後會出現 Select 元件讓使用者選擇重複頻率（每日、每週、每月）。  
      * **關聯資源**: 這是一個關鍵的互動設計。可能會使用 Transfer (穿梭框) 或支持搜尋自動完成的多選 Select 元件 (Select.Multiple)，讓管理員可以從所有資源或資源分組中，精確地選擇此維護窗口要影響的對象。


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

## **17. 資源分組 (Resource Groups)**

### **17.1. 功能目標**
管理資源的分群，支援階層（可選），並提供群組層級的狀態摘要與成員管理。

### **17.2. 功能規格**
- 列表：顯示名稱、描述、成員數、狀態摘要（healthy/warning/critical）。
- CRUD：建立/編輯/刪除群組。
- 成員管理：以 Transfer 或多選 Select（支援搜尋）新增/移除資源。
- 過濾/排序/分頁：支援後端分頁、sort_by/sort_order。

### **17.3. 視覺設計**
- 標準表格頁，詳情頁可顯示狀態摘要卡片與最近相關事件。

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
| **資源分組** | 查看 | ✔ | ✔ | ✔ | ✔ |
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
| **維護窗口** | 查看 | ✔ | ✔ | ✔ | ✔ |
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
| `/api/v1/automation/scripts/{scriptId}/run` | POST | team_manager, super_admin |
| `/api/v1/automation/schedules` | POST | team_manager, super_admin |
| `/api/v1/settings` | PUT | super_admin |
| `/api/v1/settings/maintenance-windows` | GET, POST | super_admin |
| `/api/v1/audit-logs` | GET | super_admin |
| `/api/v1/admin/diagnostics` | GET | super_admin |

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
