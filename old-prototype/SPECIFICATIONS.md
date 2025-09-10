# SRE Platform - UI/UX 元件規格文件

這份文件詳細描述了 SRE Platform 各個畫面的 UI/UX 元件規格，並與 `openapi.yaml` 後端契約對齊。

## 目錄

*   [Frame 000 — 登入頁面 (LoginPage)](#frame-000--登入頁面-loginpage)
*   [Frame 001 — 總覽儀表板 (Dashboard)](#frame-001--總覽儀表板-dashboard)
*   [Frame 002 — 通知中心下拉選單 (NotificationDropdown)](#frame-002--通知中心下拉選單-notificationdropdown)
*   [Frame 003 — 告警紀錄頁面 (IncidentListPage)](#frame-003--告警紀錄頁面-incidentlistpage)
*   [Frame 004 — 事件詳情模態框 (IncidentDetailsModal)](#frame-004--事件詳情模態框-incidentdetailsmodal)
*   [Frame 005 — 告警紀錄頁面 - 批次操作 (IncidentListPage - Batch Actions)](#frame-005--告警紀錄頁面---批次操作-incidentlistpage---batch-actions)
*   [Frame 006 — AI 分析報告模態框 (AIAnalysisReportModal)](#frame-006--ai-分析報告模態框-aianalysisreportmodal)
*   [Frame 007 — 資源管理頁面 (ResourceListPage)](#frame-007--資源管理頁面-resourcelistpage)
*   [Frame 008 & 009 — 網段掃描流程 (Network Scan Flow)](#frame-008--009--網段掃描流程-network-scan-flow)
*   [Frame 010 — 資源管理頁面 - 批次操作 (ResourceListPage - Batch Actions)](#frame-010--資源管理頁面---批次操作-resourcelistpage---batch-actions)
*   [Frame 011 — 新增資源模態框 (AddResourceModal)](#frame-011--新增資源模態框-addresourcemodal)
*   [Frame 012 — 刪除確認模態框 (ConfirmDeleteModal)](#frame-012--刪除確認模態框-confirmdeletemodal)
*   [Frame 013 — 資源群組頁面 (ResourceGroupListPage)](#frame-013--資源群組頁面-resourcegrouplistpage)
*   [Frame 014 — 資源群組頁面 - 批次操作 (ResourceGroupListPage - Batch Actions)](#frame-014--資源群組頁面---批次操作-resourcegrouplistpage---batch-actions)
*   [Frame 015 — 人員管理頁面 (UserListPage)](#frame-015--人員管理頁面-userlistpage)
*   [Frame 016 — 新增人員模態框 (AddUserModal)](#frame-016--新增人員模態框-addusermodal)
*   [Frame 017 — 編輯人員模態框 (EditUserModal)](#frame-017--編輯人員模態框-editusermodal)
*   [Frame 018 — 團隊管理頁面 (TeamListPage)](#frame-018--團隊管理頁面-teamlistpage)
*   [Frame 019 — 編輯團隊模態框 (EditTeamModal)](#frame-019--編輯團隊模態框-editteammodal)
*   [Frame 020 — 通知管道管理頁面 (NotificationChannelListPage)](#frame-020--通知管道管理頁面-notificationchannellistpage)
*   [Frame 021 — 編輯通知管道模態框 (EditNotificationChannelModal)](#frame-021--編輯通知管道模態框-editnotificationchannelmodal)
*   [Frame 022 — 告警規則管理頁面 (AlertRuleListPage)](#frame-022--告警規則管理頁面-alertrulelistpage)
*   [Frame 023-025 — 新增/編輯告警規則模態框 (AddEditAlertRuleModal)](#frame-023-025--新增編輯告警規則模態框-addeditalertrulemodal)
*   [Frame 026 — 自動化腳本頁面 (AutomationScriptsPage)](#frame-026--自動化腳本頁面-automationscriptspage)
*   [Frame 027 — 自動化執行日誌頁面 (AutomationExecutionLogPage)](#frame-027--自動化執行日誌頁面-automationexecutionlogpage)
*   [Frame 028 — 執行日誌輸出模態框 (ExecutionLogOutputModal)](#frame-028--執行日誌輸出模態框-executionlogoutputmodal)
*   [Frame 029-030 — 容量規劃頁面 (CapacityPlanningPage)](#frame-029-030--容量規劃頁面-capacityplanningpage)
*   [Frame 031-034 — 個人資料與設定頁面 (Profile & Settings)](#frame-031-034--個人資料與設定頁面-profile--settings)
*   [Frame 035-036 — 系統設定頁面 (System Settings)](#frame-035-036--系統設定頁面-system-settings)
*   [Frame 037 — 登出流程 (Logout Flow)](#frame-037--登出流程-logout-flow)

---

## Frame 000 — 登入頁面 (LoginPage)
![登入頁面](images/frame_000_01_login_page.png)
### **用途說明 (Purpose)**

提供 SRE Platform 的使用者登入介面，用於身份驗證。此為開發環境使用的帳號密碼登入，正式環境將整合 OIDC。

### **視覺要點 (Visual spec)**

*   **版面架構**：
    *   頁面垂直與水平置中一個卡片 (Card) 元件。
    *   背景為淺藍灰色 (`#E8EBF0` 或相近色)。
    *   卡片內部垂直排列：
        1.  平台 Logo (Icon)。
        2.  平台標題 "Control Plane"。
        3.  "帳號" (Label) 與對應的輸入框 (Input)。
        4.  "密碼" (Label) 與對應的密碼輸入框 (Input)。
        5.  "登入" 按鈕 (Button)。
        6.  "測試帳號" 提示區塊。
*   **字型**：
    *   平台標題 "Control Plane"：約 24px，`font-weight: bold`。
    *   欄位標籤 ("帳號", "密碼")：約 14px，`font-weight: normal`。
    *   輸入框文字：約 16px，`font-weight: normal`。
    *   登入按鈕文字：約 16px，`font-weight: bold`。
    *   測試帳號提示文字：約 12px，`font-weight: normal`，灰色 (`#888888` 或相近色)。
*   **圖示與圖像**：
    *   頂部使用一個方形 Logo，內部為風格化的線路圖示。

### **佈局與響應式規則 (Layout & Responsive)**

*   **佈局**：
    *   採用 Flexbox 進行主容器的置中 (`display: flex`, `justify-content: center`, `align-items: center`, `min-height: 100vh`)。
    *   卡片 (Card) 具備固定最大寬度，例如 `max-width: 400px`。
    *   卡片內部元素垂直堆疊，間距一致 (e.g., `gap: 16px`)。
*   **響應式**：
    *   **Mobile ( < 768px )**：
        *   卡片寬度佔滿螢幕寬度的 90-95% (`width: 90vw`)，取代固定寬度。
        *   卡片無陰影或陰影效果減弱，以節省空間感。
        *   字體大小可考慮整體略微縮小。
    *   **Tablet / Desktop ( >= 768px )**：
        *   維持設計稿中的固定寬度與置中佈局。

### **互動與行為 (Interactions)**

*   **輸入框 (Input)**：
    *   **Focus**：點擊輸入框時，邊框變為主題藍色 (`#1677FF` 或 Ant Design 的 `@primary-color`)，並可能有輕微外光暈效果。
    *   **Validation**：
        *   參考 `openapi.yaml` 的 `AuthLoginRequest`，"帳號" (`username`) 與 "密碼" (`password`) 均為必填。
        *   點擊 "登入" 按鈕時，若任一欄位為空，該輸入框下方顯示紅色錯誤提示文字 (e.g., "請輸入帳號")，邊框變為紅色。
*   **登入按鈕 (Button)**：
    *   **Default**：藍色背景，白色文字。
    *   **Hover**：背景顏色變為稍淺的藍色。
    *   **Active/Click**：背景顏色變為稍深的藍色。
    *   **Loading**：點擊後，發送登入請求 (`POST /api/v1/auth/login`) 期間，按鈕應顯示為 Loading 狀態 (e.g., 內部出現旋轉圖示，文字可能消失)，並禁用點擊。
*   **狀態處理**：
    *   **錯誤狀態 (Error)**：
        *   **401 Unauthorized (`UNAUTHORIZED`)**：API 回應 401 時，在登入按鈕下方顯示統一的錯誤訊息，如 "帳號或密碼錯誤"。
        *   **400 Bad Request (`VALIDATION_ERROR`)**：通常由前端驗證攔截，但若後端返回此錯誤，處理方式同 401。
        *   **500 Internal Server Error (`INTERNAL_ERROR`)**：顯示通用錯誤訊息，如 "系統發生錯誤，請稍後再試"。
    *   **成功狀態 (Success)**：
        *   API 回應 200 OK 並返回 `AuthTokens` 後，應將 `access_token` 和 `refresh_token` 儲存於安全的客戶端儲存中 (e.g., HttpOnly Cookie 或 LocalStorage)。
        *   頁面跳轉至儀表板 (`/dashboard`)，並有淡出淡入的過場動畫 (150ms)。
    *   **空資料狀態 (Empty Data)**：不適用於此頁面。
    *   **無權限狀態 (No Permission)**：不適用於此頁面。

---
## Frame 001 — 總覽儀表板 (Dashboard)
![總覽儀表板](images/frame_001_02_dashboard.png)
### **用途說明 (Purpose)**

作為 SRE Platform 的首頁，提供關鍵指標 (KPIs) 的即時總覽，讓使用者能快速掌握系統健康狀態與事件趨勢。

### **視覺要點 (Visual spec)**

*   **版面架構**：
    *   **主佈局**：典型的後台管理佈局，包含：
        *   **內容網格 (Grid)**：由多個卡片 (Card) 組成，以網格系統排列。
*   **卡片 (Card) 內容**：
    1.  **事件統計卡 (3個)**：
        *   "新告警 (New)"、"處理中 (In Progress)"、"今日已解決 (Resolved Today)"。
        *   每個卡片包含：標題、大數字指標、與昨日比較百分比 (帶有升/降箭頭圖示)。
        *   背景色根據語意變化：紅色代表新告警，黃色代表處理中，綠色代表已解決。
    2.  **關鍵指標卡 (2個)**：
        *   "資源妥善率"、"總資源數"。
        *   每個卡片包含：左側圓形背景圖示 (Icon)、標題、大數字指標。
    3.  **圖表卡 (2個)**：
        *   "資源群組狀態總覽"：堆疊長條圖 (Stacked Bar Chart)，X 軸為資源群組，Y 軸為數量，顏色區分健康狀態。
        *   "資源狀態分佈"：環圈圖 (Doughnut Chart)，顯示不同健康狀態的資源佔比。
*   **字型**：
    *   頁面標題 ("總覽儀表板")：約 20px，`font-weight: bold`。
    *   卡片標題：約 14px，`font-weight: normal`。
    *   卡片大數字指標：約 30px，`font-weight: bold`。
    *   百分比/單位文字：約 12px，`font-weight: normal`。
*   **圖示與圖像**：
    *   **KPI 卡片**：使用圓形背景的圖示，如 `CheckCircleOutlined`、`CloudOutlined`、`DashboardOutlined`。
    *   **百分比變化**：使用 `ArrowUpOutlined` 和 `ArrowDownOutlined` 圖示。

### **佈局與響應式規則 (Layout & Responsive)**

*   **佈局**：
    *   整體採用 Ant Design 的 `Layout` 元件 (Sider, Header, Content)。
    *   內容區的卡片使用 `Grid` 系統 (`Row`, `Col`)。
        *   第一排統計卡片：`span=8`，共 3 個。
        *   第二排 KPI 卡片：`span=8`，共 2 個。
        *   第三排圖表卡片：一個 `span=16` (長條圖)，一個 `span=8` (環圈圖)。
*   **響應式** (`x-requirements.responsive_design`):
    *   **Desktop (>= 1024px)**：如設計稿所示。
    *   **Tablet (768px - 1023px)**：
        *   卡片寬度調整，每行可能只放 2 個卡片 (`span=12`)。
    *   **Mobile (< 768px)**：
        *   左側導航欄 (Sider) 變為抽屜式 (Drawer)，點擊漢堡圖示展開。
        *   所有卡片變為單欄佈局，垂直堆疊 (`span=24`)。
        *   圖表可能會簡化，或提供水平滾動查看。

### **互動與行為 (Interactions)**

*   **菜單點擊**：點擊菜單項目 (e.g., "告警紀錄") 會跳轉到對應頁面，並高亮顯示當前頁面。
*   **通知圖示 (Bell)**：點擊後，下方會彈出通知下拉列表 (Dropdown/Popover)，展示最新通知。
*   **卡片 (Card)**：
    *   **Hover**：滑鼠懸停在卡片上時，卡片可能會出現輕微的陰影加深或上浮效果，增加立體感。
    *   **點擊**：統計卡片 (如 "新告警") 可設計為點擊後跳轉到對應的過濾後列表頁面 (e.g., `/incidents?status=new`)。
*   **圖表 (Chart)**：
    *   **Tooltip**：滑鼠懸停在圖表的某個區塊 (長條或環圈的扇區) 時，顯示詳細數據的提示框 (Tooltip)。例如，懸停在長條圖的 "核心交換器" 的 "正常" 區塊時，顯示 "核心交換器 - 正常: 2"。
*   **資料載入 (Data Loading)**：
    *   **API**：頁面載入時，並行發起多個請求：
        *   `GET /api/v1/dashboard/summary` (for KPI cards)
        *   `GET /api/v1/dashboard/resource-distribution` (for charts)
        *   `GET /api/v1/notifications/summary` (for notification badge count)
    *   **Loading 狀態**：在 API 請求完成前，每個卡片或圖表區域應顯示骨架屏 (Skeleton) 或旋轉圖示 (Spin)。
    *   **錯誤狀態 (Error)**：若任一 API 請求失敗，對應的卡片區域應顯示錯誤提示，如 "資料載入失敗"，並可提供一個重試按鈕。
    *   **空資料狀態 (Empty Data)**：若圖表沒有資料，應顯示 "暫無資料" 的提示，而非空白圖表。

---
## Frame 002 — 通知中心下拉選單 (NotificationDropdown)
![通知中心下拉選單](images/frame_002_03_notification_dropdown.png)
### **用途說明 (Purpose)**

在平台的任何頁面，讓使用者可以快速預覽最新的未讀通知，並提供進入完整通知頁面的入口。

### **視覺要點 (Visual spec)**

*   **版面架構**：
    *   此元件是一個下拉框 (Popover/Dropdown)，從頁首 (Header) 的鈴鐺圖示 (`BellOutlined`) 下方彈出。
    *   **頂部**：標題 "通知中心"。
    *   **中部**：一個可滾動的通知列表 (List)。
        *   每個列表項 (List.Item) 包含：
            *   一個表示嚴重性 (severity) 或類型 (type) 的彩色圓點 (Badge)。
            *   通知標題。
            *   通知內容。
    *   **底部**：一個 "查看所有通知" 的連結或按鈕。
*   **字型**：
    *   標題 "通知中心"：約 16px，`font-weight: bold`。
    *   列表項標題：約 14px，`font-weight: normal`。
    *   列表項內容：約 12px，`font-weight: normal`。
    *   底部連結：約 14px，`font-weight: normal`。
*   **圖示與圖像**：
    *   列表項左側的彩色圓點 (Badge) 應對應 `UserNotification` schema 中的 `severity`：
        *   `critical`: 紅色
        *   `error`: 橘紅色
        *   `warning`: 黃色
        *   `info`: 藍色或綠色
*   **顏色**：
    *   下拉框背景為帶有標準的卡片陰影。
    *   列表項在滑鼠懸停 (hover) 時應有背景色變化。

### **佈局與響應式規則 (Layout & Responsive)**

*   **佈局**：
    *   使用 Ant Design 的 `Popover` 或 `Dropdown` 元件，觸發元素為 Header 中的 `Badge` 包裹的 `BellOutlined` 圖示。
    *   下拉框內容使用 `List` 元件進行渲染。
    *   列表高度固定，當內容超出時，應出現垂直滾動條 (e.g., `max-height: 300px`, `overflow-y: auto`)。
*   **響應式**：
    *   **Desktop / Tablet**：如設計稿所示，為一個固定寬度的彈出框 (e.g., `width: 360px`)。
    *   **Mobile**：在小螢幕上，此下拉框可能會轉換為佔滿整個螢幕的模態框 (Modal) 或從頂部滑入的全寬面板，以提供更好的閱讀體驗。

### **互動與行為 (Interactions)**

*   **觸發**：
    *   點擊 Header 上的鈴鐺圖示，打開下拉框。
    *   再次點擊鈴鐺圖示或點擊下拉框以外的區域，關閉下拉框。
*   **列表項 (List.Item)**：
    *   **Hover**：滑鼠懸停時，列表項背景變色。
    *   **點擊**：
        *   點擊單個通知項，應觸發兩個行為：
            1.  將該通知標記為已讀 (`PUT /api/v1/notifications/{notificationId}/mark-as-read`)。
            2.  根據通知內容中的 `link` 欄位，跳轉至相關頁面 (e.g., `/incidents/i_1001`)。
        *   標記已讀後，該通知項在列表中應有視覺變化 (e.g., 標題文字變為灰色，彩色圓點消失或變淡)。
*   **底部連結**：
    *   點擊 "查看所有通知"，跳轉至完整的通知中心頁面 (`/notifications`)。
*   **資料載入與狀態**：
    *   **API**：
        *   當使用者點擊鈴鐺圖示首次打開下拉框時，觸發 `GET /api/v1/notifications?status=unread&page_size=5` 來獲取最新的未讀通知。
        *   可以實現輪詢或使用 WebSocket (`x-websocket`) 來即時更新鈴鐺圖示上的徽標 (Badge) 數字 (`GET /api/v1/notifications/summary`)。
    *   **Loading 狀態**：打開下拉框，正在載入通知時，列表區域應顯示骨架屏 (Skeleton) 或一個置中的旋轉圖示 (Spin)。
    *   **空資料狀態 (Empty Data)**：如果沒有未讀通知，列表區域應顯示一個提示，如 Ant Design 的 `Empty` 元件，文字為 "沒有新的通知"。
    *   **錯誤狀態 (Error)**：如果 API 請求失敗，顯示 "通知載入失敗" 的提示。

---
## Frame 003 — 告警紀錄頁面 (IncidentListPage)
![告警紀錄頁面](images/frame_003_04_logs_page.png)
### **用途說明 (Purpose)**

提供一個集中查看、篩選、和管理所有歷史與當前事件（Incidents）的介面。

### **視覺要點 (Visual spec)**

*   **版面架構**：
    *   **頂部篩選區 (Filter Bar)**：
        *   時間範圍選擇器 (DateRangePicker)。
        *   所有等級下拉選單 (Dropdown/Select for `severity`)。
        *   所有狀態下拉選單 (Dropdown/Select for `status`)。
        *   查詢按鈕 (Button)。
        *   "生成事件報告" 按鈕 (Button, Primary)。
        *   "全選" 文字連結 (Link)。
    *   **下方表格區 (Table)**：
        *   一個多欄位的表格，用於展示事件列表。
        *   **欄位 (Columns)**：複選框 (Checkbox)、狀態 (Status)、時間 (Time)、等級 (Severity)、處理人員 (Assignee)、資源名稱 (Resource Name)、說明 (Description)、操作 (Actions)。
*   **字型**：
    *   頁面標題 ("告警紀錄")：約 20px，`font-weight: bold`。
    *   表格標頭 (Header)：約 14px，`font-weight: bold`。
    *   表格內文 (Cell)：約 14px，`font-weight: normal`。
*   **元件樣式**：
    *   **狀態 (Status)**：使用 Ant Design 的 `Tag` 元件，並根據狀態給予不同顏色：
        *   "新告警" (new): 紅色 (`red`)
        *   "處理中" (acknowledged): 黃色 (`yellow`/`orange`)
        *   "已解決" (resolved): 綠色 (`green`)
    *   **等級 (Severity)**：使用帶有背景色的 `Tag` 元件：
        *   "高" (critical/error): 深紅色
        *   "中" (warning): 橘色
        *   "低" (info): 藍色或灰色
    *   **操作 (Actions)**：為文字連結 (Link)，如 "Ack"、"詳情"。

### **佈局與響應式規則 (Layout & Responsive)**

*   **佈局**：
    *   頂部篩選區使用 `Space` 或 `Form` 元件橫向排列篩選條件。
    *   下方使用 Ant Design 的 `Table` 元件。
    *   表格欄位寬度應設定，部分欄位（如 "說明"）可以較寬，部分（如 "等級"）可以較窄。
*   **響應式**：
    *   **Tablet (768px - 1023px)**：
        *   篩選條件可能會折行顯示。
        *   表格可能會出現水平滾動條。
    *   **Mobile (< 768px)**：
        *   篩選區塊變為垂直堆疊，或隱藏在一個 "篩選" 按鈕觸發的抽屜 (Drawer) 中。
        *   表格應轉換為列表 (List) 或卡片 (Card) 模式。每個事件顯示為一張卡片，垂直排列，卡片內顯示主要資訊（如資源名稱、說明、狀態），次要資訊可折疊或省略。

### **互動與行為 (Interactions)**

*   **篩選**：
    *   選擇時間範圍、等級、狀態後，點擊 "查詢" 按鈕，會帶上對應的查詢參數 (`start_time`, `end_time`, `severity`, `status`) 重新呼叫 `GET /api/v1/incidents` API，並刷新表格數據。
    *   篩選條件應保留在 URL 的 query string 中，以便分享和重新整理頁面。
*   **表格 (Table)**：
    *   **排序 (Sorting)**：點擊欄位標頭的排序圖示 (e.g., "時間", "等級")，可以對該欄位進行升序/降序排序 (`sort_by`, `sort_order` 參數)。
    *   **分頁 (Pagination)**：表格底部應有分頁元件 (`Pagination`)，用於切換頁面 (`page`, `page_size` 參數)。
    *   **批次選擇 (Batch Selection)**：
        *   點擊表頭的複選框可以全選/取消全選當前頁的項目。
        *   "全選" 文字連結可能用於跨頁全選所有符合篩選條件的項目。
        *   當有項目被選中時，"生成事件報告" 按鈕變為可點擊狀態。
*   **操作 (Actions)**：
    *   **Ack (Acknowledge)**：
        *   僅在狀態為 "新告警" (new) 時顯示。
        *   點擊後，觸發 `POST /api/v1/incidents/{incidentId}/acknowledge`。
        *   成功後，該行的狀態應即時更新為 "處理中"，處理人員更新為當前使用者，且 "Ack" 按鈕變為 "詳情"。
    *   **詳情 (Details)**：
        *   點擊後，彈出一個模態框 (Modal) 顯示該事件的完整詳細資訊 (參考 `frame_004_05_incident_details_modal.png`)。
*   **按鈕**：
    *   **生成事件報告**：
        *   在至少選擇一個事件後啟用。
        *   點擊後，彈出一個設定報告選項的模態框，或直接觸發 `POST /api/v1/incidents/generate-report`，並傳入選中的 `incident_ids`。
*   **資料載入與狀態**：
    *   **API**：頁面載入時，根據預設篩選條件（如最近24小時）呼叫 `GET /api/v1/incidents`。
    *   **Loading 狀態**：在表格數據載入或刷新時，表格區域應顯示 Loading 遮罩 (`spinning` 屬性)。
    *   **空資料狀態 (Empty Data)**：若篩選後無結果，表格應顯示 `Empty` 狀態，提示 "找不到符合條件的事件"。
    *   **錯誤狀態 (Error)**：API 請求失敗時，表格區域應顯示錯誤提示。

---
## Frame 004 — 事件詳情模態框 (IncidentDetailsModal)
![事件詳情模態框](images/frame_004_05_incident_details_modal.png)
### **用途說明 (Purpose)**

在不離開告警紀錄頁面的情況下，提供一個彈出視窗來展示單一事件的完整資訊，並允許使用者執行處理、指派、和添加註記等操作。

### **視覺要點 (Visual spec)**

*   **版面架構**：
    *   一個寬敞的模態框 (Modal)，標題為 "事件詳情"。
    *   **頂部資訊區**：
        *   事件標題 (e.g., "Edge SW13 - 資源斷線超過15分鐘")，字體較大、加粗。
        *   次要資訊：發生時間、仁愛分行 [88.201.0.13]。
        *   處理狀態標籤 (Tag)，如 "新告警"。
    *   **中間操作區**：
        *   左側：
            *   "指派給" 下拉選單 (Select)，用於指派處理人員。
            *   "確認收到 (Ack)" 按鈕。
            *   "AI 分析" 按鈕 (帶有 Icon)。
        *   右側：
            *   "確認人員" 欄位，顯示確認者的頭像和名稱。
    *   **下方紀錄區**：
        *   "處理紀錄" 標題，下方顯示處理歷史 (Timeline or List)。
        *   "新增處理紀錄..." 文字輸入區域 (Textarea)。
        *   "新增紀錄" 按鈕。
*   **字型**：
    *   Modal 標題：約 16px，`font-weight: bold`。
    *   事件主標題：約 20px，`font-weight: bold`。
    *   次要資訊/標籤：約 12-14px，`font-weight: normal`。
    *   區塊標題 ("處理紀錄")：約 14px，`font-weight: bold`。
*   **元件樣式**：
    *   **按鈕**：
        *   主要操作 (如 "確認收到") 使用 `type="primary"` 的按鈕。
        *   次要操作 (如 "AI 分析", "新增紀錄") 使用預設樣式按鈕。
    *   **下拉選單 (Select)**：用於指派人員，應包含搜尋功能，並能顯示使用者頭像和名稱。
    *   **處理紀錄**：可以使用 `Timeline` 元件來展示事件狀態的變遷（如 "Zoe 確認了此事件"）。

### **佈局與響應式規則 (Layout & Responsive)**

*   **佈局**：
    *   Modal 寬度較大，例如 `width: 720px` 或 `80vw`。
    *   內部使用 `Grid` (`Row`, `Col`) 和 `Space` 元件進行排版。
        *   頂部資訊區佔滿整行。
        *   中間操作區可分為左右兩欄 (`span=12` each)。
        *   下方紀錄區佔滿整行。
*   **響應式**：
    *   **Tablet / Desktop**：如設計稿所示。
    *   **Mobile (< 768px)**：
        *   Modal 寬度應佔滿螢幕 (`width: 100vw`)，高度也可能接近全高，類似一個新頁面。
        *   中間操作區的左右兩欄應改為垂直堆疊。
        *   文字輸入區和按鈕大小應適合觸控操作。

### **互動與行為 (Interactions)**

*   **資料載入**：
    *   打開 Modal 時，傳入 `incidentId`，並呼叫 `GET /api/v1/incidents/{incidentId}` 來獲取完整的事件資料並填充到介面中。
    *   在載入期間，Modal 內容區應顯示 `Skeleton` 或 `Spin`。
*   **指派 (Assign)**：
    *   從 "指派給" 下拉選單中選擇一位使用者。
    *   選擇後，觸發 `POST /api/v1/incidents/{incidentId}/assign`，請求體為 `{ "assignee_id": "selected_user_id" }`。
    *   成功後，更新介面對應的 "處理人員" 欄位。
*   **確認收到 (Acknowledge)**：
    *   僅在事件狀態為 "new" 時可見或可操作。
    *   點擊後，觸發 `POST /api/v1/incidents/{incidentId}/acknowledge`。
    *   成功後，更新事件狀態為 "acknowledged"，"確認人員" 顯示當前使用者，按鈕變為禁用或隱藏。
*   **AI 分析**：
    *   點擊後，觸發 `POST /api/v1/incidents/generate-report`，`incident_ids` 為當前事件ID，`report_type` 可設為 `root_cause`。
    *   API 可能會非同步處理，UI 應顯示一個載入提示，並在收到結果後，將 AI 分析報告展示在一個新的區域或另一個 Modal 中 (參考 `frame_006_07_logs_ai_report.png`)。
*   **新增處理紀錄 (Add Comment)**：
    *   在 Textarea 中輸入文字。
    *   點擊 "新增紀錄" 按鈕，觸發 `POST /api/v1/incidents/{incidentId}/comments`，請求體為 `{ "comment": "textarea_content" }`。
    *   成功後，清空 Textarea，並將新紀錄即時添加到上方的 "處理紀錄" 列表中。
*   **狀態處理**：
    *   **Loading**：所有觸發 API 呼叫的操作（指派、確認、新增紀錄、AI分析）在等待後端回應時，相關的按鈕都應顯示 Loading 狀態並被禁用。
    *   **Error**：任何 API 操作失敗時，應在 Modal 內通過 `message.error()` 或 `notification.error()` 顯示錯誤提示，而不關閉 Modal。
    *   **Success**：操作成功後，通過 `message.success()` 給予使用者正面回饋，並即時更新 UI。

---
## Frame 005 — 告警紀錄頁面 - 批次操作 (IncidentListPage - Batch Actions)
![告警紀錄頁面 - 批次操作](images/frame_005_06_logs_selected.png)
### **用途說明 (Purpose)**

此為告警紀錄頁面的一個特定狀態，當使用者選取多個事件時，提供批次處理（如批次確認、批次解決）的功能，以提升操作效率。

### **視覺要點 (Visual spec)**

*   **版面架構**：
    *   在頂部篩選區 (Filter Bar) 和表格區 (Table) 之間，會動態插入一個 **批次操作列 (Batch Action Bar)**。
    *   此操作列包含：
        1.  左側：提示文字，說明已選取的項目數量 (e.g., "已選取 2 個告警")。
        2.  右側：多個操作按鈕，包括 "批次確認"、"批次解決"、"清除選取"。
*   **元件樣式**：
    *   **操作列**：通常有淺藍色或灰色的背景，與頁面其他部分做出區分。
    *   **按鈕**：
        *   "批次確認" (Batch Acknowledge): 黃色或橙色系按鈕，與 "處理中" 狀態顏色呼應。
        *   "批次解決" (Batch Resolve): 綠色系按鈕，與 "已解決" 狀態顏色呼應。
        *   "清除選取" (Clear Selection): 預設或文字按鈕。
*   **狀態變化**：
    *   當沒有任何項目被選中時，此批次操作列應被隱藏。
    *   當至少有一個項目被選中時，此操作列以動畫（如淡入、滑入）方式出現。

### **佈局與響應式規則 (Layout & Responsive)**

*   **佈局**：
    *   批次操作列為一個全寬容器，內部使用 Flexbox佈局，將提示文字推向左側，按鈕群組推向右側 (`justify-content: space-between`)。
*   **響應式**：
    *   **Tablet / Desktop**：如設計稿所示。
    *   **Mobile (< 768px)**：
        *   批次操作列可能會固定在螢幕底部 (Bottom Sheet) 或頂部，以便在滾動頁面時始終可見。
        *   按鈕可能只顯示圖示以節省空間。

### **互動與行為 (Interactions)**

*   **觸發條件**：
    *   當使用者勾選表格中的任一複選框時，批次操作列出現。
    *   當使用者取消所有已勾選的複選框時，批次操作列消失。
*   **按鈕操作**：
    *   **批次確認 (Batch Acknowledge)**：
        *   點擊後，收集所有已選中事件的 `incident_ids`。
        *   呼叫 `POST /api/v1/incidents/batch` API，請求體為 `{ "operation": "acknowledge", "incident_ids": [...] }`。
        *   **按鈕可用性**：只有當選中的所有事件都處於 "新告警" (new) 狀態時，此按鈕才可點擊。若選中項目包含其他狀態，則禁用此按鈕。
    *   **批次解決 (Batch Resolve)**：
        *   點擊後，收集所有已選中事件的 `incident_ids`。
        *   呼叫 `POST /api/v1/incidents/batch` API，請求體為 `{ "operation": "resolve", "incident_ids": [...] }`。
        *   **按鈕可用性**：當選中的事件狀態為 "新告警" 或 "處理中" 時，此按鈕可點擊。
    *   **清除選取 (Clear Selection)**：
        *   點擊後，取消表格中所有行的選中狀態，並隱藏批次操作列。
*   **狀態處理與回饋**：
    *   **API 呼叫期間**：點擊任一批次操作按鈕後，該按鈕應顯示 Loading 狀態，並禁用操作列上的所有按鈕，直到 API 回應。
    *   **API 回應後**：
        *   觸發表格數據的重新整理。
        *   根據 `BatchOperationResult` 的回應，給予使用者明確的回饋：
            *   **全部成功**: 顯示 `message.success("已成功處理所有選取項目")`。
            *   **部分成功**: 顯示一個 `notification`，內容包含成功、失敗的數量及原因。例如："2 個項目處理完成，1 個項目失敗（原因：權限不足）"。
            *   **全部失敗**: 顯示 `message.error("所有項目處理失敗")`，並在 `notification` 中說明原因。
        *   操作完成後，清除所有選取狀態並隱藏批次操作列。

---
## Frame 006 — AI 分析報告模態框 (AIAnalysisReportModal)
![AI 分析報告模態框](images/frame_006_07_logs_ai_report.png)
### **用途說明 (Purpose)**

在一個獨立的模態框中，清晰地展示由 AI 針對一個或多個事件生成的分析報告，包括事件摘要、影響評估、和處理建議。

### **視覺要點 (Visual spec)**

*   **版面架構**：
    *   一個寬大的模態框 (Modal)，用於展示格式化後的報告內容。
    *   **標題**：帶有 Gemini (或類似 AI) 圖示的標題 "AI 分析報告"。
    *   **內容區**：
        *   一個可滾動的區域，用於渲染從 API 獲取的 Markdown 格式報告。
        *   報告內容應支援 Markdown 的各種元素：
            *   標題 (e.g., `## 1. 事件摘要:`)
            *   粗體 (`**...**`)
            *   項目符號列表 (`*` 或 `-`)
            *   數字列表 (`1.`, `2.`)
    *   **頁腳 (Footer)**：
        *   包含一個 "複製報告" 按鈕，用於將報告內容複製到剪貼簿。
*   **字型**：
    *   報告內的字體應遵循標準的 Markdown 渲染樣式，具備良好的可讀性。
    *   標題層級分明，列表縮排正確。
*   **圖示與圖像**：
    *   標題左側有一個代表 AI 或智能分析的圖示。

### **佈局與響應式規則 (Layout & Responsive)**

*   **佈局**：
    *   使用 Ant Design 的 `Modal` 元件。
    *   Modal 寬度較大，例如 `width: 800px`，以容納詳細報告。
    *   內容區應設定最大高度 (`max-height`)，當內容超出時顯示垂直滾動條。
    *   頁腳按鈕置左或置中。
*   **響應式**：
    *   **Tablet / Desktop**：如設計稿所示。
    *   **Mobile (< 768px)**：
        *   Modal 應轉換為全螢幕或接近全螢幕的寬度 (`width: 100vw`)。
        *   頁腳按鈕應保持可見，或固定在螢幕底部。

### **互動與行為 (Interactions)**

*   **觸發方式**：
    *   通常由其他介面（如 `IncidentDetailsModal`）的 "AI 分析" 按鈕觸發。
    *   觸發時，首先呼叫 `POST /api/v1/incidents/generate-report`。
*   **複製報告按鈕**：
    *   點擊 "複製報告" 按鈕。
    *   使用 `navigator.clipboard.writeText()` 將內容區渲染後的純文字報告複製到使用者的剪貼簿。
    *   複製成功後，顯示一個短暫的成功提示，例如 `message.success("報告已複製到剪貼簿")`。
*   **狀態處理**：
    *   **Loading 狀態**：
        *   在觸發 "AI 分析" 後、API 尚未回傳報告內容前，此 Modal 不應顯示。取而代之的是，觸發按鈕本身應處於 Loading 狀態。
        *   或者，可以先打開一個顯示 Loading 指示（如 `Spin` 元件和提示文字 "AI 報告生成中，請稍候..."）的 Modal，待 API 回應後再渲染內容。
    *   **空資料狀態 (Empty Data)**：若 API 回應成功但報告內容為空，應顯示提示 "AI 未能生成有效報告"。
    *   **錯誤狀態 (Error)**：
        *   若 `generate-report` API 呼叫失敗，應直接在來源介面（而非打開此 Modal）顯示錯誤通知 `notification.error("AI 報告生成失敗")`。

---
## Frame 007 — 資源管理頁面 (ResourceListPage)
![資源管理頁面](images/frame_007_08_resources_page.png)
### **用途說明 (Purpose)**

提供一個集中的介面來展示、搜尋、篩選和管理平台中所有的資源（如伺服器、資料庫、網路設備等）。

### **視覺要點 (Visual spec)**

*   **版面架構**：
    *   **頂部操作/篩選區**：
        *   一個搜尋框 (Search Input)，提示文字為 "搜尋資源名稱或 IP..."。
        *   "掃描網段" 按鈕 (Button)。
        *   "新增資源" 按鈕 (Button, Primary)。
        *   "全選" 文字連結 (Link)。
    *   **主體表格區 (Table)**：
        *   一個多欄位的表格，展示資源列表。
        *   **欄位 (Columns)**：複選框、狀態 (Status)、資源名稱 (Name)、IP 位址 (IP Address)、所屬群組 (Group)、操作 (Actions)。
    *   **頁腳分頁區 (Pagination)**：
        *   左側顯示當前項目範圍和總數 (e.g., "Showing 1 to 9 of 9 results")。
        *   右側為分頁控制器 (Previous, 1, Next)。
*   **元件樣式**：
    *   **狀態 (Status)**：使用一個簡單的彩色圓點 (Badge `status="dot"`) 來表示資源健康狀態，對應 `Resource` schema 中的 `status` 欄位：
        *   `healthy`: 綠色
        *   `warning`: 黃色
        *   `critical`: 紅色
        *   `unknown`: 灰色
    *   **操作 (Actions)**：為兩個並排的文字連結 (Link)："編輯" 和 "刪除"。
*   **字型**：
    *   表格標頭和內文均使用標準大小 (約 14px)。

### **佈局與響應式規則 (Layout & Responsive)**

*   **佈局**：
    *   頂部操作區使用 `Space` 或 Flexbox 橫向排列元件。
    *   下方使用 Ant Design 的 `Table` 元件。
    *   頁腳使用 Ant Design 的 `Pagination` 元件，並自訂顯示總數的文字。
*   **響應式**：
    *   **Tablet (768px - 1023px)**：
        *   頂部操作區的按鈕和搜尋框可能會折為兩行。
        *   表格出現水平滾動條。
    *   **Mobile (< 768px)**：
        *   搜尋框和按鈕垂直堆疊。
        *   表格應轉換為卡片列表 (Card List) 模式。每張卡片代表一個資源，顯示其名稱、狀態和 IP，並將 "編輯"、"刪除" 操作放在卡片底部或 "更多" (ellipsis) 選單中。

### **互動與行為 (Interactions)**

*   **搜尋與篩選**：
    *   在搜尋框輸入關鍵字後，可透過按下 Enter 或在輸入停止後的一小段延遲 (debounce) 後，觸發 API 請求，帶上 `search` 參數重新載入表格。
    *   (雖然此畫面未顯示，但根據 `openapi.yaml`，應可擴充篩選功能，如按狀態 `status`、類型 `type`、群組 `group_id` 進行篩選)。
*   **表格互動**：
    *   **排序**：點擊欄位標頭（如 "資源名稱"）可對該欄位進行排序 (`sort_by`, `sort_order` 參數)。
    *   **分頁**：點擊分頁數字或 "Previous"/"Next" 按鈕可切換頁面 (`page`, `page_size` 參數)。
    *   **批次選擇**：
        *   勾選複選框可選中資源。
        *   當有資源被選中時，會出現批次操作列 (參考 `frame_010_11_resources_batch_selection.png`)。
*   **按鈕與操作**：
    *   **掃描網段**：點擊後，彈出 "掃描網段" 模態框 (參考 `frame_008_09_scan_network_initial_modal.png`)。
    *   **新增資源**：點擊後，彈出 "新增資源" 模態框 (參考 `frame_011_12_add_resource_modal.png`)。
    *   **編輯**：點擊某行的 "編輯" 連結，彈出一個預填了該資源資料的 "編輯資源" 模態框（與新增資源的 Modal 相似）。
    *   **刪除**：點擊 "刪除" 連結，彈出一個確認對話框 (Confirm Modal)，詢問 "是否確定要刪除資源 {resource.name}？" (參考 `frame_012_13_confirm_delete_resource_modal.png`)。確認後，呼叫 `DELETE /api/v1/resources/{resourceId}`。
*   **資料載入與狀態**：
    *   **API**：頁面載入時，呼叫 `GET /api/v1/resources` 獲取第一頁資料。
    *   **Loading**：表格資料載入時，應顯示 `Table` 的 `loading` 狀態。
    *   **空資料**：若無任何資源，表格應顯示 `Empty` 狀態，並引導使用者 "新增資源" 或 "掃描網段"。
    *   **錯誤**：API 請求失敗時，顯示錯誤提示。

---
## Frame 008 & 009 — 網段掃描流程 (Network Scan Flow)
![網段掃描](images/frame_008_09_scan_network_initial_modal.png)
### **用途說明 (Purpose)**

提供一個非同步的網路掃描功能，讓使用者可以啟動掃描任務、在任務執行時獲得狀態反饋，並在完成後檢視結果。

### **視覺要點 (Visual spec)**

*   **初始模態框 (Frame 008)**：
    *   一個標題為 "網段掃描" 的模態框，包含 "網段範圍" 和 "掃描方式" 的輸入欄位。
    *   一個 "開始掃描" 按鈕。
*   **狀態提示 (Frame 009)**：
    *   掃描進行中，在主頁面浮動顯示一個帶有旋轉圖示的 `message` 提示，內容為 "正在掃描網段，請稍候..."。
*   **結果模態框 (未提供，但應存在)**：
    *   一個顯示已發現資源列表的模態框，使用者可以勾選要匯入的資源。

### **互動與行為 (Interactions)**

*   **流程**:
    1.  使用者在 **初始模態框** 中填寫 CIDR，點擊 "開始掃描"。
    2.  前端呼叫 `POST /api/v1/resources/scan`，API 回應 `task_id`。
    3.  前端關閉初始模態框，並顯示 **狀態提示**。
    4.  前端啟動輪詢機制，使用 `task_id` 定期呼叫 `GET /api/v1/resources/scan/{taskId}`。
    5.  當 API 回應 `status` 為 `completed` 時，停止輪詢，關閉狀態提示，並開啟 **結果模態框**，將 `discovered_resources` 填充到列表中。
    6.  使用者在結果模態框中選擇資源，點擊 "匯入"，前端再呼叫 `POST /api/v1/resources` (可能需要批次建立的端點) 來建立新資源。

---
## Frame 010 — 資源管理頁面 - 批次操作 (ResourceListPage - Batch Actions)
![資源管理頁面 - 批次操作](images/frame_010_11_resources_batch_selection.png)
### **用途說明 (Purpose)**

這是資源管理頁面的一個特定狀態，當使用者選取多個資源時，提供批次管理功能，如批次變更群組或批次刪除，以簡化重複性操作。

### **視覺要點 (Visual spec)**

*   **版面架構**：
    *   當表格中有項目被勾選時，在頂部操作區和表格之間，動態插入一個 **批次操作列 (Batch Action Bar)**。
    *   此操作列包含：
        1.  左側：提示文字，顯示已選取的項目數量 (e.g., "已選取 3 個資源")。
        2.  右側：一組操作按鈕："批次加入群組"、"批次移出群組"、"批次刪除"、"清除選取"。
*   **元件樣式**：
    *   **操作列**：具有淺藍色或灰色的背景，以便在視覺上與其他區塊區分。
    *   **按鈕**：
        *   "批次加入群組": 綠色按鈕。
        *   "批次移出群組": 預設樣式按鈕。
        *   "批次刪除": 紅色按鈕，表示為危險操作。
        *   "清除選取": 預設樣式按鈕。

### **佈局與響應式規則 (Layout & Responsive)**

*   **佈局**：
    *   操作列為一個全寬容器，內部使用 Flexbox 佈局，將提示文字置於左側，按鈕群組置於右側。
*   **響應式**：
    *   **Tablet / Desktop**：如設計稿所示。
    *   **Mobile (< 768px)**：
        *   操作列應固定在螢幕底部或頂部，以便在滾動時保持可見。
        *   按鈕文字可省略，只保留圖示。

### **互動與行為 (Interactions)**

*   **觸發條件**：
    *   當使用者勾選表格中的任一複選框時，批次操作列出現。
    *   取消所有勾選後，操作列消失。
*   **按鈕操作**：
    *   **批次加入群組**：
        1.  點擊後，彈出一個小型的對話框或下拉選單，讓使用者選擇要加入的目標群組。
        2.  確認後，收集所有選中項的 `resource_ids`，並呼叫 `POST /api/v1/resources/batch`，請求體為 `{ "operation": "move_group", "resource_ids": [...], "parameters": { "group_id": "selected_group_id" } }`。
    *   **批次移出群組**：
        1.  點擊後，呼叫 `POST /api/v1/resources/batch`，請求體為 `{ "operation": "move_group", "resource_ids": [...], "parameters": { "group_id": null } }`，將資源的群組設為空。
    *   **批次刪除**：
        1.  點擊後，彈出一個確認對話框，警告使用者此操作不可逆，例如 "確定要刪除選取的 3 個資源嗎？"。
        2.  使用者確認後，呼叫 `POST /api/v1/resources/batch`，請求體為 `{ "operation": "delete", "resource_ids": [...] }`。
    *   **清除選取**：
        1.  點擊後，清除表格中所有項目的勾選狀態，並隱藏操作列。
*   **狀態處理與回饋**：
    *   **API 呼叫期間**：點擊任一批次操作按鈕後，該按鈕應顯示 Loading 狀態，並禁用操作列上的所有其他按鈕。
    *   **API 回應後**：
        *   觸發表格數據的重新整理。
        *   根據 `BatchOperationResult` 回應，給予明確回饋（全部成功、部分成功、全部失敗），類似於告警紀錄的批次操作。
        *   操作完成後，清除所有選取狀態並隱藏批次操作列。

---
## Frame 011 — 新增資源模態框 (AddResourceModal)
![新增資源模態框](images/frame_011_12_add_resource_modal.png)
### **用途說明 (Purpose)**

提供一個手動操作的表單，讓使用者可以將新的單一資源註冊到 SRE Platform 中進行監控與管理。

### **視覺要點 (Visual spec)**

*   **版面架構**：
    *   一個標準的模態框 (Modal)，標題為 "新增資源"。
    *   **表單區域 (Form)**，包含以下欄位：
        1.  **資源名稱 (name)**：文字輸入框 (Input)。
        2.  **IP 位址 (ip_address)**：文字輸入框 (Input)。
        3.  **資源群組 (group_id)**：一個群組列表，供使用者選擇。
    *   **頁腳 (Footer)**：
        *   包含 "取消" 和 "匯入資源" 兩個按鈕。
*   **元件樣式**：
    *   **資源群組**：
        *   **設計稿分析**：設計稿中使用複選框 (Checkbox)，這通常表示可以多選。
        *   **API 契約對齊**：`openapi.yaml` 中的 `ResourceCreateRequest` schema 包含一個 `group_id: string` 欄位，這意味著一個資源只能屬於一個群組。
        *   **實作建議**：為了與後端契約保持一致，此處應使用 **單選元件**，例如 **單選按鈕群組 (Radio.Group)** 或 **下拉選單 (Select)**，而非複選框。列表資料應來自 `GET /api/v1/resources/groups`。
*   **字型**：
    *   表單標籤和輸入文字使用標準大小。

### **佈局與響應式規則 (Layout & Responsive)**

*   **佈局**：
    *   使用 Ant Design 的 `Modal` 包裹 `Form` 元件。
    *   表單欄位垂直排列，標籤 (Label) 在輸入元件的上方。
*   **響應式**：
    *   **Tablet / Desktop**：如設計稿所示，為固定寬度模態框。
    *   **Mobile (< 768px)**：
        *   Modal 寬度應變為全寬 (`width: 100vw`)，以方便在小螢幕上操作。

### **互動與行為 (Interactions)**

*   **表單輸入與驗證**：
    *   **資源名稱**：必填欄位。
    *   **IP 位址**：必填欄位，且需有前端驗證規則，確保其為有效的 IP v4 或 v6 位址。
    *   **資源群組**：可選欄位。
*   **按鈕操作**：
    *   **取消**：點擊後關閉 Modal，不做任何事。
    *   **匯入資源**：
        1.  點擊後，觸發表單驗證。
        2.  驗證通過後，收集表單資料，並呼叫 `POST /api/v1/resources` API。
*   **狀態處理與回饋**：
    *   **Loading 狀態**：點擊 "匯入資源" 後，在等待 API 回應期間，該按鈕應顯示 Loading 狀態。
    *   **成功回饋**：
        *   API 成功回應 (201 Created) 後，關閉此 Modal。
        *   顯示一個全域成功訊息 `message.success("資源已成功新增")`。
        *   觸發資源管理頁面 (`ResourceListPage`) 的表格數據重新整理，以顯示新加入的資源。
    *   **錯誤回饋**：
        *   **400 (Validation Error)**：若後端回傳驗證錯誤，應將錯誤訊息顯示在對應的表單欄位下方。
        *   **409 (Conflict)**：若資源名稱或 IP 位址已存在，應在 Modal 內顯示錯誤訊息，如 "資源名稱或 IP 位址重複"。
        *   **其他錯誤**：顯示通用的錯誤訊息。

---
## Frame 012 — 刪除確認模態框 (ConfirmDeleteModal)
![刪除確認模態框](images/frame_012_13_confirm_delete_resource_modal.png)
### **用途說明 (Purpose)**

在執行不可逆的刪除操作前，向使用者請求最終確認，以防止意外的資料刪除。

### **視覺要點 (Visual spec)**

*   **版面架構**：
    *   一個小型的、居中的確認模態框 (Confirm Modal)。
    *   **圖示 (Icon)**：左側有一個表示警告的圖示 (e.g., `ExclamationCircleFilled`)，通常為黃色或紅色。
    *   **內容 (Content)**：中間是確認問題的文字，例如 "您確定要刪除此資源嗎？"。
    *   **頁腳 (Footer)**：包含兩個按鈕："確定刪除" 和 "取消"。
*   **元件樣式**：
    *   **整體**：建議直接使用 Ant Design 的 `Modal.confirm()` 靜態方法，它可以快速生成此標準佈局。
    *   **按鈕**：
        *   "確定刪除" 按鈕應為 **危險按鈕 (Danger Button)**，紅色背景或紅色文字，以突顯其破壞性。
        *   "取消" 按鈕為預設樣式。
*   **字型**：
    *   使用標準的 Modal 內容字體大小。

### **佈局與響應式規則 (Layout & Responsive)**

*   **佈局**：
    *   `Modal.confirm()` 元件本身已包含完整的內部佈局邏輯。
*   **響應式**：
    *   此元件由 Ant Design 的 Modal 提供，其本身具備響應式能力，在小螢幕上會自動調整寬度。

### **互動與行為 (Interactions)**

*   **觸發方式**：
    *   當使用者在資源管理頁面點擊單一資源的 "刪除" 連結時觸發。
    *   當使用者在批次操作列點擊 "批次刪除" 按鈕時觸發。
*   **動態內容**：
    *   確認文字應根據情境動態生成：
        *   **單一刪除**： "您確定要刪除資源 **{resource.name}** 嗎？"
        *   **批次刪除**： "您確定要刪除選取的 **{count}** 個資源嗎？"
*   **按鈕操作**：
    *   **取消**：點擊後直接關閉模態框，不執行任何操作。
    *   **確定刪除**：
        1.  點擊後，觸發對應的 API 呼叫：
            *   單一刪除: `DELETE /api/v1/resources/{resourceId}`
            *   批次刪除: `POST /api/v1/resources/batch` (operation: `delete`)
        2.  在 API 請求期間，"確定刪除" 按鈕應顯示 Loading 狀態。
*   **狀態處理與回饋**：
    *   **成功回饋**：
        *   API 成功回應後，關閉模態框。
        *   顯示全域成功訊息 `message.success("資源已成功刪除")`。
        *   觸發資源列表的刷新。
    *   **錯誤回饋**：
        *   API 呼叫失敗時，關閉模態框。
        *   顯示一個全域錯誤通知 `notification.error`，說明失敗原因。例如，若收到 `409 Conflict` (`RESOURCE_IN_USE`)，提示 "無法刪除，因為該資源正在使用中或有關聯的事件"。

---
## Frame 013 — 資源群組頁面 (ResourceGroupListPage)
![資源群組頁面](images/frame_013_14_groups_page.png)
### **用途說明 (Purpose)**

提供一個管理資源群組的介面，使用者可以在此建立、檢視、編輯和刪除資源的邏輯分組。

### **視覺要點 (Visual spec)**

*   **版面架構**：
    *   **頂部操作/篩選區**：
        *   一個搜尋框 (Search Input)，提示文字為 "搜尋群組名稱或說明..."。
        *   一個 "新增群組" 按鈕 (Button, Primary)。
        *   一個 "全選" 文字連結 (Link)。
    *   **主體表格區 (Table)**：
        *   一個多欄位的表格，展示群組列表。
        *   **欄位 (Columns)**：複選框、群組名稱 (Name)、資源數量 (Resource Count)、說明 (Description)、操作 (Actions)。
    *   **頁腳分頁區 (Pagination)**：
        *   顯示項目範圍和總數，並提供分頁控制器。
*   **元件樣式**：
    *   **操作 (Actions)**：為兩個並排的文字連結 (Link)："編輯" 和 "刪除"。
*   **字型**：
    *   頁面和表格的字體遵循平台統一的標準。

### **佈局與響應式規則 (Layout & Responsive)**

*   **佈局**：
    *   與 `ResourceListPage` 結構相同，頂部為操作區，主體為 `Table`，底部為 `Pagination`。
*   **響應式**：
    *   **Tablet**：表格出現水平滾動條。
    *   **Mobile**：表格轉換為卡片列表模式。每張卡片顯示群組名稱、資源數量和說明，並包含操作按鈕。

### **互動與行為 (Interactions)**

*   **搜尋與排序**：
    *   **搜尋**：在搜尋框輸入後，根據名稱或說明篩選群組列表。
    *   **排序**：點擊欄位標頭（如 "群組名稱", "資源數量"）可對列表進行排序。
*   **分頁**：
    *   點擊分頁元件可載入不同頁面的群組資料。
*   **按鈕與操作**：
    *   **新增群組**：點擊後，彈出一個用於建立新群組的模態框 (應包含名稱、說明等欄位)，對應 `POST /api/v1/resources/groups`。
    *   **編輯**：點擊某行的 "編輯" 連結，彈出預填了該群組資料的模態框，對應 `PUT /api/v1/resources/groups/{groupId}`。
    *   **刪除**：點擊 "刪除" 連結，彈出確認對話框，確認後呼叫 `DELETE /api/v1/resources/groups/{groupId}`。
    *   **點擊群組名稱**：點擊群組名稱的連結，應導向到資源管理頁面，並自動篩選出屬於該群組的所有資源 (e.g., `/resources?group_id={groupId}`)。
*   **批次選擇**：
    *   勾選複選框可選中多個群組。
    *   選中後，會出現批次操作列 (參考 `frame_014_15_groups_batch_selection.png`)。
*   **資料載入與狀態**：
    *   **API**：頁面載入時，呼叫 `GET /api/v1/resources/groups` 獲取第一頁資料。
    *   **Loading/Empty/Error**：與其他表格頁面一樣，提供標準的載入中、無資料和錯誤狀態的視覺回饋。

---
## Frame 014 — 資源群組頁面 - 批次操作 (ResourceGroupListPage - Batch Actions)
![資源群組頁面 - 批次操作](images/frame_014_15_groups_batch_selection.png)
### **用途說明 (Purpose)**

這是資源群組頁面的一個特定狀態，當使用者選取多個群組時，提供批次刪除功能，以簡化管理操作。

### **視覺要點 (Visual spec)**

*   **版面架構**：
    *   當表格中有項目被勾選時，在頂部操作區和表格之間，會動態插入一個 **批次操作列 (Batch Action Bar)**。
    *   此操作列包含：
        1.  左側：提示文字，顯示已選取的項目數量 (e.g., "已選取 2 個群組")。
        2.  右側：操作按鈕："批次刪除" 和 "清除選取"。
*   **元件樣式**：
    *   **操作列**：具有淺藍色或灰色的背景。
    *   **按鈕**：
        *   "批次刪除": 紅色按鈕 (`danger`)，表示為危險操作。
        *   "清除選取": 預設樣式按鈕。

### **佈局與響應式規則 (Layout & Responsive)**

*   **佈局**：
    *   與其他頁面的批次操作列佈局一致，使用 Flexbox 將內容兩端對齊。
*   **響應式**：
    *   在小螢幕上，操作列應固定在螢幕底部或頂部，以保持可見性。

### **互動與行為 (Interactions)**

*   **觸發條件**：
    *   當使用者勾選表格中的任一複選框時，批次操作列出現。取消所有勾選後則消失。
*   **按鈕操作**：
    *   **清除選取**：
        *   點擊後，清除表格中所有行的選中狀態，並隱藏批次操作列。
    *   **批次刪除**：
        1.  點擊後，彈出一個確認對話框，例如 "您確定要刪除選取的 2 個群組嗎？此操作不可復原。"
        2.  使用者確認後，執行刪除邏輯。
*   **API 互動與回饋**：
    *   **API 呼叫**：
        *   由於 `openapi.yaml` 未定義群組的批次刪除端點，前端應 **遍歷 (iterate)** 所有選中的 `groupId`，並為每一個 ID 單獨呼叫 `DELETE /api/v1/resources/groups/{groupId}` API。
        *   **開發建議**：建議後端未來可新增 `POST /api/v1/resources/groups/batch` 端點以提高效能，避免前端發起大量請求。
    *   **狀態處理**：
        *   在 API 呼叫期間，按鈕應顯示 Loading 狀態。
        *   所有請求完成後，應提供一個總結性的通知 (`notification`) 給使用者，告知成功、失敗的數量。例如："1 個群組刪除成功，1 個失敗（原因：該群組尚包含資源）。"
        *   操作完成後，刷新表格數據並清除選取狀態。

---
## Frame 015 — 人員管理頁面 (UserListPage)
![人員管理頁面](images/frame_015_16_personnel_page.png)
### **用途說明 (Purpose)**

提供一個集中的使用者管理介面，讓管理員可以檢視、搜尋、新增、編輯和刪除平台上的使用者帳號。

### **視覺要點 (Visual spec)**

*   **版面架構**：
    *   **頂部操作/篩選區**：
        *   一個搜尋框 (Search Input)，提示文字為 "搜尋姓名或團隊..."。
        *   一個 "新增人員" 按鈕 (Button, Primary)。
    *   **主體表格區 (Table)**：
        *   **欄位 (Columns)**：複選框、姓名 (Name)、角色 (Role)、所屬團隊 (Teams)、接收等級 (Notification Level)、操作 (Actions)。
    *   **頁腳分頁區 (Pagination)**。
*   **元件樣式**：
    *   **角色 (Role)**：使用帶有顏色的 `Tag` 元件來區分不同角色，例如：
        *   "超級管理員": 紫色或深色
        *   "團隊管理員": 藍色
        *   "一般使用者": 灰色
    *   **所屬團隊 (Teams)**：若使用者屬於多個團隊，可以多個 `Tag` 顯示，或以文字逗號分隔。
    *   **接收等級 (Notification Level)**：使用不同顏色的 `Tag` 來表示該使用者設定接收的通知嚴重性。例如 "高" (Critical)、"中" (Warning)、"低" (Info)。此資料可能來自 `user.notification_preferences`。
    *   **操作 (Actions)**：為 "編輯" 和 "刪除" 兩個文字連結。

### **佈局與響應式規則 (Layout & Responsive)**

*   **佈局**：
    *   標準的表格頁面佈局。
*   **響應式**：
    *   **Tablet**：表格出現水平滾動條。
    *   **Mobile**：表格轉換為卡片列表模式。每張卡片顯示使用者的頭像、姓名、角色和團隊，操作項置於卡片角落的 "更多" 選單中。

### **互動與行為 (Interactions)**

*   **搜尋與排序**：
    *   支援按姓名、角色、團隊等條件進行搜尋和排序。
*   **按鈕與操作**：
    *   **新增人員**：點擊後，彈出 "新增人員" 模態框 (參考 `frame_016_17_add_personnel_modal.png`)，對應 `POST /api/v1/admin/users`。
    *   **編輯**：點擊某行的 "編輯" 連結，彈出預填了該使用者資料的 "編輯人員" 模態框 (參考 `frame_017_18_edit_personnel_modal.png`)，對應 `PUT /api/v1/admin/users/{userId}`。
    *   **刪除**：
        *   點擊 "刪除" 連結，彈出確認對話框。
        *   確認後呼叫 `DELETE /api/v1/admin/users/{userId}`。
        *   **錯誤處理**：如 API 回應 `409 Conflict` (因使用者尚有關聯任務)，需在畫面上顯示明確的錯誤通知，提示需要先轉移任務。
*   **批次選擇**：
    *   勾選複選框可選取多個使用者，以進行批次操作（如批次刪除、批次加入團隊等）。
*   **資料載入與狀態**：
    *   **API**：頁面載入時，呼叫 `GET /api/v1/admin/users` 獲取使用者列表。
    *   提供標準的載入中、無資料和錯誤狀態。

---
## Frame 016 — 新增人員模態框 (AddUserModal)
![新增人員模態框](images/frame_016_17_add_personnel_modal.png)
### **用途說明 (Purpose)**

提供一個表單介面，讓管理員可以建立新的使用者帳號，並設定其基本角色和團隊歸屬。

### **視覺要點 (Visual spec)**

*   **版面架構**：
    *   一個標準的模態框 (Modal)，標題為 "新增人員"。
    *   **提示區 (Alert)**：頂部有一個提示框，告知管理者密碼等敏感資訊需由使用者在首次登入後自行設定。
    *   **表單區域 (Form)**，包含以下欄位：
        1.  **姓名 (name)**：文字輸入框 (Input)。
        2.  **角色 (role)**：單選下拉選單 (Select)。
        3.  **團隊隸屬 (team_ids)**：多選下拉選單 (Select with `mode="multiple"`)。
    *   **頁腳 (Footer)**：包含 "取消" 和 "匯入資源" (應為 "建立人員") 按鈕。
*   **API 契約校準**：
    *   `openapi.yaml` 的 `UserCreateRequest` schema 將 `username`, `email`, `password`, `role` 標記為 **必填**。
    *   **實作建議**：此表單應 **額外增加** "帳號 (username)"、"電子郵件 (email)" 和 "初始密碼 (password)" 三個欄位，並設為必填，才能成功呼叫後端 API。頂部的提示訊息也應相應調整。

### **佈局與響應式規則 (Layout & Responsive)**

*   **佈局**：
    *   使用 Ant Design 的 `Modal` 和 `Form` 元件。表單欄位垂直排列。
*   **響應式**：
    *   在小螢幕上，Modal 應變為全寬以優化使用體驗。

### **互動與行為 (Interactions)**

*   **表單輸入與驗證**：
    *   **資料來源**：
        *   "角色" 下拉選單的選項應來自 `GET /api/v1/admin/roles`。
        *   "團隊隸屬" 下拉選單的選項應來自 `GET /api/v1/admin/teams`。
    *   **驗證 (Validation)**：
        *   所有 API 要求的必填欄位（姓名、帳號、Email、密碼、角色）都應有前端驗證規則。
        *   Email 欄位需驗證其格式。
*   **按鈕操作**：
    *   **取消**：點擊後關閉 Modal。
    *   **建立人員** (設計稿為 "匯入資源")：
        1.  點擊後，觸發表單驗證。
        2.  驗證通過後，呼叫 `POST /api/v1/admin/users` API。
*   **狀態處理與回饋**：
    *   **Loading 狀態**：點擊建立按鈕後，在 API 回應前，按鈕應顯示 Loading 狀態。
    *   **成功回饋**：
        *   API 成功回應後，關閉 Modal。
        *   顯示 `message.success("人員已成功建立")`。
        *   觸發人員管理頁面的表格刷新。
    *   **錯誤回饋**：
        *   若 API 回應 `409 Conflict` (帳號或 Email 重複)，應在對應欄位下方顯示錯誤訊息。
        *   其他錯誤則在 Modal 內顯示通用錯誤提示。

---
## Frame 017 — 編輯人員模態框 (EditUserModal)
![編輯人員模態框](images/frame_017_18_edit_personnel_modal.png)
### **用途說明 (Purpose)**

提供一個表單介面，讓管理員可以修改現有使用者的資訊，例如變更其角色或調整其所屬團隊。

### **視覺要點 (Visual spec)**

*   **版面架構**：
    *   與 "新增人員" 模態框 (`Frame 016`) 的介面佈局完全相同，但標題應為 "編輯人員"。
    *   表單欄位會預先填入該名使用者當前的資料。
*   **元件樣式**：
    *   **姓名**：此欄位通常設為唯讀 (`disabled`)，因為姓名或主鍵通常不允許修改。
    *   其他元件（下拉選單、提示框）與新增模態框一致。
    *   頁腳的確認按鈕文字應為 "儲存變更"。

### **佈局與響應式規則 (Layout & Responsive)**

*   與 `AddUserModal` (`Frame 016`) 相同。

### **互動與行為 (Interactions)**

*   **資料載入**：
    *   當模態框被觸發開啟時，需要傳入 `userId`。
    *   在顯示內容前，先呼叫 `GET /api/v1/admin/users/{userId}` API，獲取該使用者的完整資料。
    *   將 API 回應的資料（`name`, `role`, `team_ids` 等）填入對應的表單欄位作為初始值。
    *   在載入資料期間，表單區域應顯示 `Spin` 或 `Skeleton`。
*   **按鈕操作**：
    *   **取消**：點擊後關閉 Modal，不做任何事。
    *   **儲存變更**：
        1.  點擊後，觸發表單驗證。
        2.  驗證通過後，收集已變更的表單資料，並呼叫 `PUT /api/v1/admin/users/{userId}` API。
*   **狀態處理與回饋**：
    *   **Loading 狀態**：點擊儲存按鈕後，在 API 回應前，按鈕應顯示 Loading 狀態。
    *   **成功回饋**：
        *   API 成功回應後，關閉 Modal。
        *   顯示 `message.success("使用者資訊已更新")`。
        *   觸發人員管理頁面的表格刷新，以顯示更新後的資料。
    *   **錯誤回饋**：
        *   若 API 呼叫失敗，在 Modal 內顯示錯誤提示。

---
## Frame 018 — 團隊管理頁面 (TeamListPage)
![團隊管理頁面](images/frame_018_19_teams_page.png)
### **用途說明 (Purpose)**

提供一個集中管理團隊的介面，讓管理員可以建立、檢視、編輯和刪除使用者團隊，並指派管理者與成員。

### **視覺要點 (Visual spec)**

*   **版面架構**：
    *   **頂部操作/篩選區**：
        *   一個搜尋框 (Search Input)，提示文字為 "搜尋團隊名稱..."。
        *   一個 "新增團隊" 按鈕 (Button, Primary)。
        *   一個 "全選" 文字連結 (Link)。
    *   **主體表格區 (Table)**：
        *   **欄位 (Columns)**：複選框、團隊名稱 (Name)、團隊管理員 (Manager)、成員數量 (Member Count)、通知訂閱者 (Subscribers)、操作 (Actions)。
    *   **頁腳分頁區 (Pagination)**。
*   **元件樣式**：
    *   **通知訂閱者 (Subscribers)**：
        *   使用 `Tag` 元件來顯示訂閱了該團隊通知的使用者或管道。
        *   每個 `Tag` 前方可以加上圖示 (Icon) 來區分類型，例如：
            *   `UserOutlined`: 代表使用者。
            *   `SlackOutlined` 或 `MailOutlined`: 代表通知管道。
        *   此資料對應 `Team` schema 中的 `notification_settings.subscribers`。

### **佈局與響應式規則 (Layout & Responsive)**

*   **佈局**：
    *   標準的表格頁面佈局。
*   **響應式**：
    *   **Tablet**：表格出現水平滾動條。
    *   **Mobile**：表格轉換為卡片列表模式，每張卡片顯示團隊名稱、管理員和成員數。

### **互動與行為 (Interactions)**

*   **搜尋與排序**：
    *   支援按團隊名稱、管理員等條件進行搜尋和排序。
*   **按鈕與操作**：
    *   **新增團隊**：點擊後，彈出 "新增團隊" 模態框，對應 `POST /api/v1/admin/teams`。
    *   **編輯**：點擊某行的 "編輯" 連結，彈出預填了該團隊資料的 "編輯團隊" 模態框 (參考 `frame_019_20_edit_team_modal.png`)，對應 `PUT /api/v1/admin/teams/{teamId}`。
    *   **刪除**：點擊 "刪除" 連結，彈出確認對話框，確認後呼叫 `DELETE /api/v1/admin/teams/{teamId}`。
*   **批次選擇**：
    *   支援勾選複選框以進行批次操作（如批次刪除）。
*   **資料載入與狀態**：
    *   **API**：頁面載入時，呼叫 `GET /api/v1/admin/teams` 獲取團隊列表。
    *   提供標準的載入中、無資料和錯誤狀態。

---
## Frame 019 — 編輯團隊模態框 (EditTeamModal)
![編輯團隊模態框](images/frame_019_20_edit_team_modal.png)
### **用途說明 (Purpose)**

提供一個表單介面，讓管理員可以修改現有團隊的名稱和通知訂閱者（包括人員和通知管道）。

### **視覺要點 (Visual spec)**

*   **版面架構**：
    *   一個標準的模態框 (Modal)，標題為 "編輯團隊"。
    *   **表單區域 (Form)**，包含以下欄位：
        1.  **團隊名稱 (name)**：文字輸入框 (Input)。
        2.  **通知訂閱者 (subscribers)**：一個支援搜尋和多選的下拉選單 (Select with `mode="multiple"`)。
    *   **頁腳 (Footer)**：包含 "取消" 和 "匯入資源" (應為 "儲存變更") 按鈕。
*   **元件樣式**：
    *   **通知訂閱者**：
        *   此下拉選單應能同時搜尋並選取 **使用者** 和 **通知管道**。
        *   已選取的項目以 `Tag` 的形式顯示在輸入框中，`Tag` 前方可帶有圖示以區分類型 (e.g., `UserOutlined` for users, `SlackOutlined` for channels)。

### **佈局與響應式規則 (Layout & Responsive)**

*   **佈局**：
    *   使用 Ant Design 的 `Modal` 和 `Form` 元件。
*   **響應式**：
    *   在小螢幕上，Modal 應變為全寬。

### **互動與行為 (Interactions)**

*   **資料載入**：
    *   開啟 Modal 時，需傳入 `teamId`。
    *   呼叫 `GET /api/v1/admin/teams/{teamId}` 獲取當前團隊資料，並用其預填表單欄位。
    *   在載入期間，表單應顯示 `Spin` 或 `Skeleton`。
*   **表單輸入**：
    *   **通知訂閱者**：
        *   輸入框應支援遠端搜尋。當使用者輸入時，觸發 `GET /api/v1/autocomplete?type=all&q={keyword}` (或一個更精確的端點) 來獲取使用者和通知管道的建議列表。
*   **按鈕操作**：
    *   **取消**：點擊後關閉 Modal。
    *   **儲存變更**：
        1.  點擊後，觸發表單驗證。
        2.  驗證通過後，收集表單資料，並呼叫 `PUT /api/v1/admin/teams/{teamId}` API。請求體應包含 `name` 和 `notification_settings`。
*   **狀態處理與回饋**：
    *   **Loading**：點擊儲存按鈕後，按鈕應顯示 Loading 狀態。
    *   **Success**：API 成功回應後，關閉 Modal，顯示 `message.success("團隊資訊已更新")`，並刷新團隊列表。
    *   **Error**：若 API 呼叫失敗，在 Modal 內顯示錯誤提示。

---
## Frame 020 — 通知管道管理頁面 (NotificationChannelListPage)
![通知管道管理頁面](images/frame_020_21_channels_page.png)
### **用途說明 (Purpose)**

提供一個集中管理通知管道的介面，讓管理員可以設定、測試、編輯和刪除平台用來發送告警和通知的各種管道（如 Email、Webhook、Slack 等）。

### **視覺要點 (Visual spec)**

*   **版面架構**：
    *   **頂部操作/篩選區**：
        *   一個搜尋框 (Search Input)，提示文字為 "搜尋管道名稱..."。
        *   一個 "新增管道" 按鈕 (Button, Primary)。
    *   **主體表格區 (Table)**：
        *   **欄位 (Columns)**：複選框、管道名稱 (Name)、管道類型 (Type)、操作 (Actions)。
    *   **頁腳分頁區 (Pagination)**。
*   **元件樣式**：
    *   **管道類型 (Type)**：使用 `Tag` 元件顯示類型，不同類型可給予不同顏色以方便識別。
    *   **操作 (Actions)**：包含三個文字連結："測試"、"編輯"、"刪除"。

### **佈局與響應式規則 (Layout & Responsive)**

*   **佈局**：
    *   標準的表格頁面佈局。
*   **響應式**：
    *   **Tablet**：表格出現水平滾動條。
    *   **Mobile**：表格轉換為卡片列表模式，每張卡片顯示管道名稱和類型，並包含一組操作按鈕。

### **互動與行為 (Interactions)**

*   **搜尋與排序**：
    *   支援按管道名稱、類型進行搜尋和排序。
*   **按鈕與操作**：
    *   **新增管道**：點擊後，彈出 "新增管道" 模態框，對應 `POST /api/v1/admin/channels`。
    *   **測試 (Test)**：
        *   點擊後，觸發 `POST /api/v1/admin/channels/{channelId}/test` API。
        *   API 呼叫期間，"測試" 連結應顯示 Loading 狀態或禁用。
        *   API 回應後，顯示一個 `message` 或 `notification` 來告知使用者測試結果（"測試訊息已發送" 或 "測試失敗"）。
    *   **編輯 (Edit)**：點擊某行的 "編輯" 連結，彈出預填了該管道設定的 "編輯管道" 模態框 (參考 `frame_021_22_edit_channel_modal.png`)，對應 `PUT /api/v1/admin/channels/{channelId}`。
    *   **刪除 (Delete)**：點擊 "刪除" 連結，彈出確認對話框，確認後呼叫 `DELETE /api/v1/admin/channels/{channelId}`。
*   **資料載入與狀態**：
    *   **API**：頁面載入時，呼叫 `GET /api/v1/admin/channels` 獲取管道列表。
    *   提供標準的載入中、無資料和錯誤狀態。

---
## Frame 021 — 編輯通知管道模態框 (EditNotificationChannelModal)
![編輯通知管道模態框](images/frame_021_22_edit_channel_modal.png)
### **用途說明 (Purpose)**

提供一個表單介面，讓管理員可以修改現有通知管道的設定，例如變更 Webhook 的 URL 或 Email 伺服器的位址。

### **視覺要點 (Visual spec)**

*   **版面架構**：
    *   一個標準的模態框 (Modal)，標題為 "編輯通知管道" (或在新增時為 "新增通知管道")。
    *   **表單區域 (Form)**，包含：
        1.  **管道名稱 (name)**：文字輸入框。
        2.  **管道類型 (type)**：下拉選單。在編輯模式下，此欄位通常為 **唯讀 (disabled)**，因為變更類型會導致所需設定完全不同。
        3.  **動態設定區**：根據所選的 "管道類型"，動態顯示對應的設定欄位。
*   **動態欄位範例 (基於 `NotificationChannel` schema)**：
    *   **若類型為 `Webhook`**:
        *   Webhook URL: 文字輸入框。
        *   HTTP 方法 (Method): 下拉選單 (POST, PUT, GET)。
        *   (可選) Headers: 一個可動態增減鍵值對的區域。
    *   **若類型為 `Email`**:
        *   SMTP Host: 文字輸入框。
        *   SMTP Port: 數字輸入框。
        *   Username: 文字輸入框。
        *   Password: 密碼輸入框。
    *   **若類型為 `Slack`**:
        *   Webhook URL: 文字輸入框。
        *   Channel: 文字輸入框 (e.g., #alerts)。
*   **頁腳 (Footer)**：包含 "取消" 和 "儲存變更" 按鈕。

### **佈局與響應式規則 (Layout & Responsive)**

*   **佈局**：
    *   使用 Ant Design 的 `Modal` 和 `Form` 元件。
*   **響應式**：
    *   在小螢幕上，Modal 應變為全寬。

### **互動與行為 (Interactions)**

*   **資料載入 (編輯模式)**：
    *   開啟 Modal 時，傳入 `channelId`。
    *   呼叫 `GET /api/v1/admin/channels/{channelId}` 獲取當前管道資料，並用其預填所有表單欄位，包括動態設定區的內容。
*   **動態表單 (新增模式)**：
    *   當使用者在 "新增管道" 模態框中切換 "管道類型" 的選項時，下方的動態設定區應立即重新渲染，以顯示對應新類型的欄位。
*   **按鈕操作**：
    *   **取消**：點擊後關閉 Modal。
    *   **儲存變更**：
        1.  點擊後，觸發表單驗證。
        2.  驗證通過後，收集表單資料（包含 `name` 和 `configuration` 物件），並呼叫 `PUT /api/v1/admin/channels/{channelId}` API。
*   **狀態處理與回饋**：
    *   **Loading**：點擊儲存按鈕後，按鈕應顯示 Loading 狀態。
    *   **Success**：API 成功回應後，關閉 Modal，顯示 `message.success("管道已更新")`，並刷新管道列表。
    *   **Error**：若 API 呼叫失敗，在 Modal 內顯示錯誤提示。

---
## Frame 022 — 告警規則管理頁面 (AlertRuleListPage)
![告警規則管理頁面](images/frame_022_23_rules_page.png)
### **用途說明 (Purpose)**

提供一個集中管理告警規則的介面，使用者可以在此定義事件觸發的條件（例如 CPU 使用率超過 90% 持續 5 分鐘），以及觸發後的處理動作。

### **視覺要點 (Visual spec)**

*   **版面架構**：
    *   **頂部操作/篩選區**：
        *   一個搜尋框 (Search Input)，提示文字為 "搜尋規則名稱、目標或指標..."。
        *   一個 "新增告警規則" 按鈕 (Button, Primary)。
    *   **主體表格區 (Table)**：
        *   **欄位 (Columns)**：複選框、狀態 (Status)、規則名稱 (Name)、監控目標 (Target)、指標 (Metric)、操作 (Actions)。
    *   **頁腳分頁區 (Pagination)**。
*   **元件樣式**：
    *   **狀態 (Status)**：使用 `Tag` 或 `Switch` 元件來表示規則是否啟用 (`enabled`)。
        *   `啟用中`: 綠色 Tag。
        *   `已停用`: 灰色 Tag。
    *   **監控目標 (Target)**：此欄位應簡潔地描述規則所應用的資源範圍，來源於 `AlertRule.resource_filter` 物件。例如 "群組: 核心交換器"。
    *   **指標 (Metric)**：此欄位應簡潔地描述觸發條件，來源於 `AlertRule.condition` 物件。例如 "CPU 使用率 > 90%"。
    *   **操作 (Actions)**：包含 "編輯"、"停用" (或 "啟用")、"刪除" 等文字連結。

### **佈局與響應式規則 (Layout & Responsive)**

*   **佈局**：
    *   標準的表格頁面佈局。
*   **響應式**：
    *   **Tablet**：表格出現水平滾動條。
    *   **Mobile**：表格轉換為卡片列表模式。

### **互動與行為 (Interactions)**

*   **搜尋與排序**：
    *   支援按規則名稱、目標、指標等條件進行搜尋和排序。
*   **按鈕與操作**：
    *   **新增告警規則**：點擊後，彈出 "新增告警規則" 模態框 (參考 `frame_023_24_add_rule_modal.png`)，對應 `POST /api/v1/incidents/rules`。
    *   **編輯 (Edit)**：點擊某行的 "編輯" 連結，彈出預填了該規則資料的模態框，對應 `PUT /api/v1/incidents/rules/{ruleId}`。
    *   **停用/啟用 (Disable/Enable)**：
        *   點擊 "停用" 連結，呼叫 `POST /api/v1/incidents/rules/{ruleId}/disable`。
        *   點擊 "啟用" 連結，呼叫 `POST /api/v1/incidents/rules/{ruleId}/enable`。
        *   成功後，應即時更新該行的狀態顯示。
    *   **刪除 (Delete)**：點擊 "刪除" 連結，彈出確認對話框，確認後呼叫 `DELETE /api/v1/incidents/rules/{ruleId}`。
*   **資料載入與狀態**：
    *   **API**：頁面載入時，呼叫 `GET /api/v1/incidents/rules` 獲取規則列表。
    *   提供標準的載入中、無資料和錯誤狀態。

---
## Frame 023-025 — 新增/編輯告警規則模態框 (AddEditAlertRuleModal)
![新增告警規則模態框](images/frame_023_24_add_rule_modal.png)
### **用途說明 (Purpose)**

提供一個結構化的表單，讓使用者可以完整定義一條新的告警規則，或修改現有規則，包括基本資訊、觸發條件、自動化回應和自訂通知。

### **視覺要點 (Visual spec)**

*   **版面架構**：
    *   一個寬大的模態框 (Modal)，標題為 "新增告警規則" 或 "編輯告警規則"。
    *   內部使用可折疊面板 (`Collapse`) 將表單分為多個區塊。
*   **區塊 1: 基本設定 (Basic Settings)**
    *   **規則名稱**: 文字輸入框 (Input)。
    *   **啟用規則**: 開關 (Switch)。
    *   **監控目標**: 支援多選的下拉選單 (Select)，用於指定規則應用的資源。
    *   **指標**: 單選下拉選單 (Select)，用於選擇監控指標。
*   **區塊 2: 告警條件 (Alert Conditions)**
    *   一個可動態增減的條件列表，每行包含：運算子、閾值、持續時間、觸發等級。
    *   一個 "+ 新增條件" 按鈕。
*   **區塊 3: 自動化響應 (Automation Response)**
    *   **選擇腳本**: 一個下拉選單 (Select) 用於選擇自動化腳本。
    *   **參數映射**: 根據所選腳本動態生成的表單，用於將事件上下文變數映射到腳本參數。
*   **區塊 4: 通知內容自定義 (Custom Notification)**
    *   (此部分在設計稿中未展開，但應包含用於自訂通知標題和內容的模板輸入框)。
*   **頁腳 (Footer)**：包含 "取消" 和 "建立規則" (或 "儲存變更") 按鈕。

### **佈局與響應式規則 (Layout & Responsive)**

*   **佈局**：
    *   使用 Ant Design 的 `Modal` 搭配 `Collapse` 和 `Form`。
*   **響應式**：
    *   **Tablet/Desktop**: 如設計稿所示。
    *   **Mobile**: 考慮將 Modal 轉換為全螢幕檢視，或將多個區塊改為步驟式表單 (Steps)。

### **互動與行為 (Interactions)**

*   **資料來源**：
    *   **監控目標**: 選項應來自 `GET /api/v1/resources/groups` 等 API。
    *   **指標**: 選項應來自 `GET /api/v1/metrics/definitions`。
    *   **選擇腳本**: 選項應來自 `GET /api/v1/automation/scripts`。
*   **動態表單**：
    *   點擊 "+ 新增條件" 可以動態增加一行條件設定。
    *   選擇不同腳本時，"參數映射" 區塊會動態更新。
*   **按鈕操作**：
    *   **建立/儲存**: 點擊後，收集所有區塊的資料，組合成 `AlertRule` 物件，並呼叫 `POST` 或 `PUT` API。
*   **狀態處理**：提供標準的 Loading、Success 和 Error 回饋。

---
## Frame 026 — 自動化腳本頁面 (AutomationScriptsPage)
![自動化腳本頁面](images/frame_026_27_automation_scripts_tab.png)
### **用途說明 (Purpose)**

提供一個集中管理自動化腳本的介面，使用者可以在此建立、檢視、編輯和刪除用於診斷或修復的腳本（如 Shell, Python, Ansible Playbook 等）。

### **視覺要點 (Visual spec)**

*   **版面架構**：
    *   頁面頂部是一個頁籤 (`Tabs`) 元件，包含 "腳本" 和 "執行日誌" 兩個分頁。此畫面為 "腳本" 分頁的內容。
    *   **頂部操作區**：
        *   一個 "新增腳本" 按鈕 (Button, Primary)。
        *   一個 "全選" 文字連結 (Link)。
    *   **主體表格區 (Table)**：
        *   **欄位 (Columns)**：複選框、腳本名稱 (Name)、類型 (Type)、描述 (Description)、最後更新 (Last Updated)、操作 (Actions)。
    *   **頁腳分頁區 (Pagination)**。
*   **元件樣式**：
    *   **類型 (Type)**：使用 `Tag` 元件顯示腳本的語言或類型 (`language`)，例如 "Shell Script", "Ansible Playbook", "Python Script"。
    *   **操作 (Actions)**：包含 "測試"、"編輯"、"刪除" 三個文字連結。

### **佈局與響應式規則 (Layout & Responsive)**

*   **佈局**：
    *   頁面主體使用 `Tabs` 元件區分不同功能區。
    *   "腳本" 分頁內為標準的表格頁面佈局。
*   **響應式**：
    *   **Tablet**：表格出現水平滾動條。
    *   **Mobile**：表格轉換為卡片列表模式。

### **互動與行為 (Interactions)**

*   **頁籤切換 (Tab Switching)**：
    *   點擊 "執行日誌" 頁籤，會切換到執行日誌列表視圖 (參考 `frame_027_28_automation_logs_tab.png`)。
*   **按鈕與操作**：
    *   **新增腳本**：點擊後，應導向到一個專用的腳本編輯器頁面或開啟一個大型模態框，用於編寫和設定新腳本。對應 `POST /api/v1/automation/scripts`。
    *   **測試 (Test)**：
        *   點擊後，彈出一個模態框，讓使用者手動輸入執行所需的參數。
        *   確認後，呼叫 `POST /api/v1/automation/scripts/{scriptId}/run` 來手動觸發一次執行。
    *   **編輯 (Edit)**：點擊後，導向到該腳本的編輯器頁面，對應 `PUT /api/v1/automation/scripts/{scriptId}`。
    *   **刪除 (Delete)**：點擊後，彈出確認對話框，確認後呼叫 `DELETE /api/v1/automation/scripts/{scriptId}`。
*   **批次選擇**：
    *   支援勾選複選框以進行批次刪除等操作。
*   **資料載入與狀態**：
    *   **API**：頁面載入時，呼叫 `GET /api/v1/automation/scripts` 獲取腳本列表。
    *   提供標準的載入中、無資料和錯誤狀態。

---
## Frame 027 — 自動化執行日誌頁面 (AutomationExecutionLogPage)
![自動化執行日誌頁面](images/frame_027_28_automation_logs_tab.png)
### **用途說明 (Purpose)**

提供一個查詢和檢視所有自動化腳本執行歷史紀錄的介面，用於追蹤、審計和排查問題。

### **視覺要點 (Visual spec)**

*   **版面架構**：
    *   此為 `Frame 026` 中 "自動化" 頁面的 "執行日誌" 分頁內容。
    *   **頂部篩選區 (Filter Bar)**：
        *   時間範圍選擇器 (DateRangePicker)。
        *   狀態下拉選單 (Select for `status`)，選項包含 "所有狀態"、"成功"、"失敗" 等。
        *   "篩選" 按鈕 (Button)。
    *   **主體表格區 (Table)**：
        *   **欄位 (Columns)**：狀態 (Status)、執行時間 (Start Time)、腳本名稱 (Script Name)、觸發告警 (Triggering Incident)、執行時長 (Duration)、操作 (Actions)。
    *   **頁腳分頁區 (Pagination)**。
*   **元件樣式**：
    *   **狀態 (Status)**：使用 `Tag` 元件，並根據 `Execution.status` 給予不同顏色：
        *   `success`: 綠色
        *   `failed`: 紅色
        *   `running`: 藍色
        *   `pending`: 灰色
    *   **操作 (Actions)**：一個 "查看輸出" 的文字連結。

### **佈局與響應式規則 (Layout & Responsive)**

*   **佈局**：
    *   標準的表格頁面佈局。
*   **響應式**：
    *   **Tablet**：表格出現水平滾動條。
    *   **Mobile**：表格轉換為卡片列表模式。

### **互動與行為 (Interactions)**

*   **篩選**：
    *   選擇時間範圍或狀態後，點擊 "篩選" 按鈕，帶上對應的查詢參數 (`start_time`, `end_time`, `status`) 重新呼叫 `GET /api/v1/automation/executions` API 並刷新表格。
*   **表格互動**：
    *   **查看輸出**：點擊 "查看輸出" 連結，彈出一個顯示該次執行詳細日誌和輸出結果的模態框 (參考 `frame_028_29_execution_log_output_modal.png`)。
    *   **可點擊連結**：
        *   "腳本名稱" 欄位應可點擊，導向到該腳本的編輯頁面。
        *   "觸發告警" 欄位應可點擊，導向到觸發該次執行的事件詳情頁面。
*   **資料載入與狀態**：
    *   **API**：頁面載入時，呼叫 `GET /api/v1/automation/executions` 獲取最新的執行日誌。
    *   提供標準的載入中、無資料和錯誤狀態。

---
## Frame 028 — 執行日誌輸出模態框 (ExecutionLogOutputModal)
![執行日誌輸出模態框](images/frame_028_29_execution_log_output_modal.png)
### **用途說明 (Purpose)**

提供一個彈出視窗，用以展示單次自動化腳本執行的詳細資訊和完整的日誌輸出 (stdout/stderr)，方便使用者進行問題排查和結果確認。

### **視覺要點 (Visual spec)**

*   **版面架構**：
    *   一個標準的模態框 (Modal)，標題為 "執行日誌詳情"。
    *   **執行資訊區**：
        *   使用定義列表 (`Descriptions`) 展示該次執行的元數據：腳本名稱、觸發告警、執行時間、執行時長等。
    *   **執行輸出區**：
        *   一個標題為 "執行輸出" 的區塊。
        *   下方是一個 **唯讀的、深色背景的程式碼區塊 (Code Block/Viewer)**，用於顯示原始的日誌輸出。
    *   **頁腳 (Footer)**：
        *   包含一個 "關閉" 按鈕。圖中的 "匯入資源" 按鈕應為 "關閉" 或 "確定"。
        *   **建議**：可增加一個 "複製日誌" 按鈕，方便使用者將日誌內容複製到剪貼簿。
*   **元件樣式**：
    *   **執行輸出**: 應使用等寬字體 (Monospaced Font) 以保持日誌格式的對齊和可讀性。

### **佈局與響應式規則 (Layout & Responsive)**

*   **佈局**：
    *   使用 Ant Design 的 `Modal` 元件。資訊區和輸出區垂直排列。
*   **響應式**：
    *   在小螢幕上，Modal 應變為全寬。

### **互動與行為 (Interactions)**

*   **資料載入**：
    *   開啟 Modal 時，需傳入 `executionId`。
    *   呼叫 `GET /api/v1/automation/executions/{executionId}` 獲取該次執行的完整資料。
    *   將回傳的 `Execution` 物件資料填充到對應的欄位中，其中 `output` 或 `error` 欄位的內容顯示在 "執行輸出" 區塊。
    *   在載入期間，Modal 內容應顯示 `Spin` 或 `Skeleton`。
*   **按鈕操作**：
    *   **關閉**：點擊後關閉 Modal。
    *   **複製日誌 (建議功能)**：點擊後，將 "執行輸出" 區塊的內容複製到剪貼簿，並顯示 `message.success("日誌已複製")`。

---
## Frame 029-030 — 容量規劃頁面 (CapacityPlanningPage)
![容量規劃頁面](images/frame_029_30_capacity_planning_page.png)
### **用途說明 (Purpose)**

提供一個讓使用者設定參數、啟動容量分析與預測，並以圖表和摘要形式檢視結果的整合介面。

### **視覺要點 (Visual spec)**

*   **版面架構**：
    *   **初始狀態 (Frame 029)**：
        *   頁面頂部有一個設定列，包含 "選擇目標群組"、"選擇指標" 和 "開始分析" 按鈕。
        *   下方內容區為空白。
    *   **結果狀態 (Frame 030)**：
        *   頂部設定列保留，讓使用者可以再次分析。
        *   下方內容區顯示分析結果，包含：KPI 卡片區、建議措施區、趨勢圖表區。
*   **元件樣式**：
    *   **KPI 卡片**: 顯示平均月增長率、預計觸及警戒線天數等核心指標。
    *   **趨勢圖表**: 一個折線圖，包含歷史數據線、預測數據線和警戒線。

### **佈局與響應式規則 (Layout & Responsive)**

*   **佈局**：
    *   頂部設定列為橫向表單。結果區塊垂直堆疊。
*   **響應式**：
    *   **Tablet/Mobile**：設定列和 KPI 卡片應折行或變為單欄佈局。圖表在小螢幕上可能需要支援水平滾動。

### **互動與行為 (Interactions)**

*   **分析流程**：
    1.  使用者在設定列選擇群組和指標，點擊 "開始分析"。
    2.  前端呼叫 `POST /api/v1/analyzing/capacity`。
    3.  在等待 API 回應時，頁面顯示全域 Loading 狀態。
    4.  API 成功回應後，使用 `CapacityAnalysisResponse` 資料渲染結果區塊。
*   **圖表互動**：
    *   滑鼠懸停在圖表上時，應顯示包含詳細數據的 Tooltip。
*   **可執行的建議**：
    *   若建議項目為可執行的，應顯示為按鈕，點擊後觸發 `POST /api/v1/analyzing/capacity/execute-recommendation` API。

---
## Frame 031-034 — 個人資料與設定頁面 (Profile & Settings)
![個人資料與設定頁面](images/frame_031_32_profile_info_tab.png)
### **用途說明 (Purpose)**

提供一個多分頁的介面，讓使用者管理自己的個人資料、密碼、通知偏好等。

### **視覺要點 (Visual spec)**

*   **版面架構**：
    *   頁面頂部是一個頁籤 (`Tabs`) 元件，包含 "個人資訊"、"密碼安全"、"通知設定"。
*   **個人資訊分頁 (Frame 031)**：
    *   顯示姓名、角色、團隊、語言偏好等。
    *   部分欄位（如角色）為唯讀，部分（如姓名）可修改。
*   **密碼安全分頁 (Frame 033)**：
    *   提供一個包含 "目前密碼"、"新密碼"、"確認新密碼" 的表單來變更密碼。
*   **通知設定分頁 (Frame 034)**：
    *   分為 "聯絡方式" 和 "通知偏好" 兩個區塊。
    *   使用者可設定並驗證 Email/LINE/SMS，並勾選希望接收的告警等級。
*   **成功提示 (Frame 032)**:
    *   任何成功的儲存或更新操作後，都應顯示一個全域的、短暫的成功訊息 `message.success()`。

### **互動與行為 (Interactions)**

*   **API 對應**：
    *   **個人資訊**: `GET/PUT /api/v1/profile`
    *   **密碼安全**: `POST /api/v1/profile/security`
    *   **通知設定**:
        *   `PUT /api/v1/profile` (儲存聯絡方式)
        *   `PUT /api/v1/profile/notifications` (儲存偏好)
        *   `POST /api/v1/profile/verify-contact` (驗證聯絡方式)
*   **通用行為**：
    *   所有儲存按鈕在 API 請求期間都應顯示 Loading 狀態。
    *   所有表單都應有完整的前端驗證。
    *   頁面載入時，應先呼叫 `GET /api/v1/profile` 獲取資料並填充所有分頁的表單。

---
## Frame 035-036 — 系統設定頁面 (System Settings)
![系統設定頁面](images/frame_035_36_settings_integration_tab.png)
### **用途說明 (Purpose)**

提供一個僅供超級管理員存取的介面，用於設定全域的系統級參數。

### **視覺要點 (Visual spec)**

*   **版面架構**：
    *   頁面頂部是一個頁籤 (`Tabs`) 元件，包含 "整合設定" 和 "通知設定"。
*   **整合設定分頁 (Frame 035)**：
    *   提供表單以設定與外部系統（Grafana, Prometheus 等）的整合 URL。
*   **通知設定分頁 (Frame 036)**：
    *   提供表單以設定全域預設的通知發送服務（如 SMTP 伺服器、SMS 閘道）。
    *   **注意**: 此部分與 `openapi.yaml` 有差異，後端需擴充 `SystemSettings` schema。

### **互動與行為 (Interactions)**

*   **API 對應**: `GET/PUT /api/v1/admin/settings`
*   **通用行為**:
    *   頁面載入時獲取現有設定並填充表單。
    *   點擊 "儲存設定" 按鈕後，提交整個 `SystemSettings` 物件。
    *   提供標準的 Loading、Success 和 Error 回饋。

---
## Frame 037 — 登出流程 (Logout Flow)
![登出流程](images/frame_037_38_logout.png)
### **用途說明 (Purpose)**

定義使用者從平台登出的標準流程，以確保安全地終止使用者會話 (session) 並返回登入畫面。

### **互動與行為 (Interactions)**

*   **觸發點 (Trigger)**：
    *   使用者點擊位於平台右上角 **使用者頭像下拉選單** 中的 "登出" 選項。
*   **執行流程 (Execution Flow)**：
    1.  **點擊 "登出"**：觸發登出程序。
    2.  **API 呼叫**：前端應用程式立即呼叫 `POST /api/v1/auth/logout` API，以通知後端該使用者的 session 或 refresh token 應被銷毀。
    3.  **清除本地儲存**: 無論 API 呼叫成功與否，前端都必須清除所有儲存於客戶端的認證資訊。
    4.  **重導向 (Redirect)**：清除本地資料後，立即將使用者重導向至登入頁面 (`/login`)。
*   **狀態處理與回饋**：
    *   **Loading**: 點擊登出後，在 API 請求期間，頁面可顯示一個短暫的全螢幕 Loading 遮罩。
    *   **API 失敗**: 如果 `logout` API 呼叫失敗，前端應記錄此錯誤，但 **仍必須繼續執行** 清除本地儲存和重導向的步驟。
