# UI/UX 稽核報告

## 稽核日期
2025-09-20

## 稽核人員
Jules the Pirate 🏴‍☠️

---

## A. 通用檢查項 (General Checklist) 發現

### [G-1] 佈局與間距
*   **問題**: 功能按鈕不一致
*   **位置**: `PageHeader` 元件
*   **描述**: `ResourcesPage` 和 `AutomationCenterPage` 在頁面標頭中都包含一個「重新整理」按鈕，但 `IncidentsPage` 缺少此功能。雖然 `PageHeader` 的設計允許這種變化，但為了使用者體驗的一致性，建議在所有主要頁面都提供類似的核心操作（如刷新）。
*   **建議**: 在 `IncidentsPage.tsx` 的 `PageHeader` 中新增一個「重新整理」按鈕。

### [G-5] 導航與標題
*   **問題**: 頁面標題 (`<title>`) 未更新
*   **位置**: `IncidentsPage.tsx`, `AutomationCenterPage.tsx`
*   **描述**: `ResourcesPage.tsx` 會根據當前活動的 Tab 動態更新瀏覽器的頁面標題，但 `IncidentsPage.tsx` 和 `AutomationCenterPage.tsx` 沒有實現此功能，導致瀏覽器標籤頁標題始終保持不變。
*   **建議**: 在所有主要頁面 (`IncidentsPage.tsx`, `AutomationCenterPage.tsx` 等) 中新增一個 `useEffect` hook，以根據頁面內容或當前活動的 Tab 來更新 `document.title`。

---

## B. 通用檢查項改善建議

### [G-3] 資料格式化
*   **建議**: 建立一個共用的 `utils/formatters.ts` 檔案，將日期、時間、持續時間等格式化函數（如 `formatDateTime`, `formatRelative`, `formatDuration`）集中管理。
*   **理由**: 目前這些函數散落在各個頁面元件中 (`IncidentsPage.tsx`, `AutomationCenterPage.tsx`)，集中管理可以確保全站格式一致，並方便未來統一修改。

---

## C. 逐頁稽核清單 (Page-by-Page Checklist) 發現

### [00] 登入頁面 (Login Page) - ❌ 不符合 (Not Compliant)
*   **問題**: 未遵循 `prototype.html` 的設計規範。
*   **位置**: `frontend/src/pages/LoginPage.tsx`
*   **描述**:
    1.  **樣式不一致**: 整個頁面使用 `styled-components` 實現，其色彩、漸層、邊框圓角等樣式與 `prototype.html` 中定義的 CSS 變數 (`--brand-primary`, `--bg-page` 等) 完全不同。
    2.  **元件不一致**:
        *   **輸入框**: `StyledFormItem` 元件重新實作了輸入框樣式，而非使用 `prototype.html` 中已定義的 `.login-page .ant-input` 樣式。
        *   **登入按鈕**: `LoginButton` 是一個自訂的漸層按鈕，而非使用 `prototype.html` 中標準的 `.login-submit-btn` 主要按鈕樣式。
*   **建議**:
    1.  **重構頁面**: 移除 `styled-components` 的本地樣式，改為使用 `prototype.html` 中定義的全域 CSS class 和變數。
    2.  **統一元件**: 將輸入框和按鈕的 class 分別設定為 `.login-page .ant-input` 和 `.login-submit-btn`，以符合設計系統。

### [01] 使用者選單 (User Menu) - ❌ 不符合 (Not Compliant)
*   **問題**: 下拉選單未使用「玻璃效果 (Glassmorphism)」設計。
*   **位置**: `frontend/src/components/UserMenu.tsx`
*   **描述**: 使用者選單的下拉部分是一個標準的 Ant Design `Dropdown`，沒有套用 `prototype.html` 中定義的玻璃效果樣式 (`--glass-bg`, `--glass-border` 等)。`prototype.html` 中有 `.user-dropdown-menu` class 可供使用。
*   **建議**: 在 `Dropdown` 元件上添加 `overlayClassName="user-dropdown-menu"`，以套用正確的玻璃效果樣式。

### [02] 通知中心 (Notification Center) - ✅ 符合 (Compliant)
*   **問題**: 無
*   **描述**:
    1.  **圖示一致**: 元件內部使用 `STATUS_TONE` 物件來映射不同通知狀態 (`pending`, `sent`, `failed`, `delivered`) 對應的圖示和顏色，確保了視覺上的一致性。
    2.  **按鈕標準化**: 「全部已讀」和「查看所有」按鈕分別使用了 Ant Design 的 `text` 和 `link` 按鈕，符合標準化要求。
*   **改善建議**:
    *   為了與 `prototype.html` 中更精細的按鈕設計系統對齊，可以考慮將 `text` 和 `link` 按鈕替換為使用 `.platform-btn--text` 或 `.platform-btn--ghost` 樣式的自訂按鈕，以達到像素級的完美一致性。

---

## D. 事件管理 (Event Management)

### [10] 事件列表頁面 (Incidents List Page) - ✅ 符合 (Compliant)
*   **問題**: 無
*   **描述**:
    1.  **KPI 卡片**: 頁面正確使用 `ContextualKPICard` 共用元件，並透過 Ant Design 的 `Row` 和 `Col` 實現一致的網格佈局和間距。
    2.  **表格工具列**: 表格上方的篩選器（搜尋框、下拉選單）使用 `Space` 元件進行佈局，與其他頁面保持一致。
    3.  **狀態徽章**: 頁面內部定義了 `statusToneMap` 和 `severityToneMap` 來統一狀態和嚴重性的顏色，與設計系統的意圖相符。
*   **改善建議**:
    *   與 `[G-3]` 建議類似，可以考慮將 `statusToneMap` 和 `severityToneMap` 這類映射表提取到一個共享的 `constants` 或 `config` 檔案中，避免在多個頁面中重複定義。

### [11] 事件規則頁面 (Event Rules Page) - ❌ 不符合 (Not Compliant)
*   **問題**: 「啟用/暫停」功能未使用 `Switch` 元件。
*   **位置**: `IncidentsPage.tsx` 中的 `renderAlertingRules` 函數。
*   **描述**: 稽核清單要求使用 `Switch` 元件來控制規則的啟用和暫停狀態，但目前的實作是使用一個文字按鈕 (`Button` with `type="link"`)。雖然功能上可以實現，但未使用指定的 UI 元件，造成了介面不一致。
*   **建議**: 將「啟用/暫停」的 `Button` 替換為 Ant Design 的 `Switch` 元件，並將 `handleRuleStatusToggle` 函數綁定到其 `onChange` 事件上。

### [12] 靜音規則頁面 (Silences Page) - ❌ 不符合 (Not Compliant)
*   **問題**: 「匹配條件」未使用 `Tag` 元件顯示，可讀性差。
*   **位置**: `IncidentsPage.tsx` 中的 `renderSilenceRules` 函數。
*   **描述**: 靜音規則的匹配條件 (scope) 目前被呈現為一個純文字字串，例如 `"resource.type = database AND env = production"`。這使得條件難以快速解析。稽核清單要求使用標籤 (`Tag`) 來顯示這些條件，以提高可讀性。
*   **建議**: 修改 `scope` 欄位的 `render` 函數，將條件字串解析出來，並將每一個條件（例如 `resource.type = database`）都用一個 `Tag` 元件來包裹顯示。

### [13-16] 事件詳情 (彈窗) (Incident Details Modal) - ⚠️ 部分符合 (Partially Compliant)
*   **問題**: 「處理歷史」未使用自訂的時間軸 (`Timeline`) 樣式。
*   **位置**: `IncidentsPage.tsx` 中的事件詳情彈窗。
*   **描述**: `prototype.html` 中定義了一個名為 `.incident-timeline` 的自訂時間軸樣式，該樣式比 Ant Design 的預設 `Timeline` 樣式更豐富。然而，目前的實作直接使用了標準的 `Timeline` 元件。
*   **建議**: 在「處理歷史」標籤頁中，應使用自訂的 `incident-timeline` 樣式來取代標準的 `Timeline` 元件，以符合設計規範。

### [17] AI 事件分析報告 (彈窗) (AI Incident Analysis Report Modal) - ✅ 符合 (Compliant)
*   **問題**: 無
*   **描述**: 「可能原因」和「建議行動」都使用了標準的 Ant Design `List` 元件來呈現，條理清晰，易於閱讀。
*   **建議**: 無。

### [18] 建立靜音 (彈窗) (Create Silence Modal) - ⚠️ 部分符合 (Partially Compliant)
*   **問題**: 彈窗未使用 `prototype.html` 中指定的特殊背景和樣式。
*   **位置**: `frontend/src/components/CreateSilenceModal.tsx`
*   **描述**: `prototype.html` 為靜音規則彈窗定義了一個 `.silence-modal` class，其中包含特殊的深色背景。目前的實作使用了標準的 `Modal` 元件，沒有套用此 class，導致視覺風格不一致。
*   **建議**: 在 `CreateSilenceModal.tsx` 的 `Modal` 元件上添加 `className="silence-modal"`，以符合設計規範。

### [19-22] 編輯事件規則 (彈窗) (Edit Event Rule Modal) - ❌ 不符合 (Not Compliant)
*   **問題**: 未實作多步驟精靈 (Multi-step Wizard) 流程。
*   **位置**: `IncidentsPage.tsx` 中的 `handleRuleModalOpen` 觸發的彈窗。
*   **描述**: 稽核清單和 `prototype.html` 都明確指出編輯事件規則應為一個多步驟的流程（基本資訊 -> 觸發條件 -> 事件內容 -> 自動化）。然而，目前的實作是一個單頁的簡易表單，且觸發條件部分只是一個純文字輸入框，不符合「直觀易用」的要求。
*   **建議**:
    1.  **重構為多步驟流程**: 將彈窗重構為一個 `Steps` 元件引導的多步驟流程。
    2.  **實作條件產生器**: 將觸發條件的純文字輸入框改為一個互動式的條件產生器 UI，讓使用者可以透過下拉選單和輸入框來建立 `AND/OR` 條件。

### [23-25] 編輯靜音規則 (彈窗) (Edit Silence Rule Modal) - ❌ 不符合 (Not Compliant)
*   **問題**: 「設定範圍」未使用「智慧輸入系統 (Smart Input System)」。
*   **位置**: `IncidentsPage.tsx` 中的 `handleSilenceRuleModalOpen` 觸發的彈窗。
*   **描述**: 靜音範圍（scope）的設定目前是一個純文字輸入框，要求使用者手動輸入匹配條件，這既不直觀也容易出錯。稽核清單要求此功能應與「智慧輸入系統」保持一致。專案中存在一個 `SmartFilterBuilder.tsx` 元件，但並未在此處使用。
*   **建議**: 將靜音範圍的 `Input.TextArea` 替換為 `SmartFilterBuilder` 元件，提供一個更直觀、互動性更強的方式來建立標籤匹配規則。

---

## H. 身份與存取管理 (IAM)

### [60-63] 管理頁面 (Management Pages) - ✅ 符合 (Compliant)
*   **描述**: `UserPermissionsPage` 正確地使用了 `Tabs` 元件來組織四個管理功能，且每個 Tab 中的表格和工具列佈局一致。

### [65-67] 編輯與新增 (彈窗) (Edit & Add Modals) - ✅ 符合 (Compliant)
*   **描述**: `RoleFormModal` 中使用了自訂的 `PermissionTreeSelector` 元件，該元件基於 Ant Design 的 `Tree` 實作。其結構清晰，帶有圖示，易於理解和使用。雖然稽核清單提到的是 `TreeSelect`，但目前 `Tree` 的實作更適合此場景。

---

## F. 儀表板 (Dashboards)

### [40] 儀表板管理頁面 (Dashboard Management Page) - ⚠️ 部分符合 (Partially Compliant)
*   **問題**: 儀表板卡片未使用 `prototype.html` 中定義的 `.nav-item` 樣式。
*   **位置**: `frontend/src/pages/DashboardAdministrationPage.tsx`
*   **描述**: 頁面中的儀表板卡片使用了自訂的 `.glass-surface` class，而非 `prototype.html` 中為此類導航卡片設計的 `.nav-item` class。這導致卡片的視覺風格（如 hover 效果、邊框）與設計系統不一致。
*   **建議**: 將卡片的 class 從 `.glass-surface` 替換為 `.nav-item`，以符合設計規範。

### [41] 基礎設施洞察頁面 (Infrastructure Insights Page) - ❌ 不符合 (Not Compliant)
*   **問題**: 圖表未使用統一的深色主題，且顏色未使用設計系統變數。
*   **位置**: `frontend/src/pages/InfrastructureInsightsPage.tsx`
*   **描述**: 資源使用率的長條圖（ECharts）沒有應用 `prototype.html` 中定義的深色主題。此外，圖表中表示不同狀態（嚴重、警告、健康）的顏色是硬編碼的，而非使用 CSS 變數。
*   **建議**:
    1.  在初始化 ECharts 實例時，明確指定使用 `'dark'` 主題。
    2.  修改圖表選項，使其從 CSS 變數中讀取顏色，以確保與設計系統的視覺風格一致。

### [42] SRE 戰情室頁面 (SRE War Room Page) - ❌ 不符合 (Not Compliant)
*   **問題**: 缺少「服務健康度熱圖 (Service Health Heatmap)」。
*   **位置**: `frontend/src/pages/SREWarRoomPage.tsx`
*   **描述**: 稽核清單要求此頁面應包含一個服務健康度熱圖，但目前的實作中完全沒有這個元件。`prototype.html` 中的 `HomePage` 包含了熱圖的實作範例，但它並未被整合到 SRE 戰情室頁面中。
*   **建議**: 在 `SREWarRoomPage.tsx` 中新增服務健康度熱圖元件，並參考 `prototype.html` 中的 `serviceHealthHeatmapOption` 來實現其顏色和互動效果。

---

## J. 平台設定 (Platform Settings)

### [80-82] 設定頁面 (Settings Pages) - ✅ 符合 (Compliant)
*   **描述**: 標籤管理、郵件設定、身份驗證等頁面都實作在 `Tabs` 中，佈局清晰，符合預期。

### [83-85] 標籤管理彈窗 (Tag Management Modals) - ❌ 不符合 (Not Compliant)
*   **問題**: 缺少管理「標籤值」的功能。
*   **位置**: `frontend/src/pages/PlatformSettingsPage.tsx`
*   **描述**: 目前的實作只提供了新增/編輯「標籤規則（Tag Key）」的功能，但完全缺少管理每個標籤對應的「標籤值（Tag Value）」的介面。例如，無法為 `environment` 標籤新增 `production`、`staging` 等可選值。`prototype.html` 中有更完整的標籤值管理設計，包含顏色選擇等功能，但目前均未實作。
*   **建議**:
    1.  新增一個「管理標籤值」的彈窗或頁面。
    2.  在這個介面中，允許使用者為選定的標籤新增、編輯、刪除其對應的值。
    3.  為每個標籤值增加顏色選擇器，以符合 `prototype.html` 的設計。

---

## G. 自動化中心 (Automation Center)

### [51], [52], [53] - ✅ 符合 (Compliant)
*   **描述**: 腳本庫的面板樣式、排程管理的 CRON 可讀性轉換、以及執行日誌的狀態圖示都清晰且實作良好。

### [54-57] 編輯與詳情 (彈窗) (Edit & Details Modals) - ❌ 不符合 (Not Compliant)
*   **問題**: 腳本編輯器未包含語法高亮 (Syntax Highlighting)。
*   **位置**: `AutomationCenterPage.tsx` 中的 `openScriptModal` 觸發的彈窗。
*   **描述**: 編輯或新增腳本時，腳本內容區域是一個標準的 `TextArea`，沒有語法高亮功能。這使得編寫和閱讀腳本變得困難。`prototype.html` 中有一個 `.code-editor-like` 的 class，但並未被使用。
*   **建議**: 引入一個輕量級的程式碼編輯器元件（如 `react-simple-code-editor` 或 `CodeMirror` 的 React 封裝），並為其應用語法高亮功能。

---

## H. 身份與存取管理 (IAM)

### [60-63] 管理頁面 (Management Pages) - ✅ 符合 (Compliant)
*   **描述**: `UserPermissionsPage` 正確地使用了 `Tabs` 元件來組織四個管理功能，且每個 Tab 中的表格和工具列佈局一致。

### [65-67] 編輯與新增 (彈窗) (Edit & Add Modals) - ✅ 符合 (Compliant)
*   **描述**: `RoleFormModal` 中使用了自訂的 `PermissionTreeSelector` 元件，該元件基於 Ant Design 的 `Tree` 實作。其結構清晰，帶有圖示，易於理解和使用。雖然稽核清單提到的是 `TreeSelect`，但目前 `Tree` 的實作更適合此場景。

---

## I. 通知管理 (Notification Management)

### [70-72] 管理頁面 (Management Pages) - ✅ 符合 (Compliant)
*   **描述**: 三個管理頁面（策略、管道、歷史）都使用了 `Tabs` 來組織，並且每個頁面都包含了帶有工具列的 `DataTable`，佈局和操作邏輯一致。

### [73-76] 編輯與詳情 (彈窗/抽屜) (Edit & Details Modals) - ⚠️ 部分符合 (Partially Compliant)
*   **問題**: 通知策略編輯未使用多步驟精靈 (Wizard) 流程。
*   **位置**: `NotificationManagementPage.tsx` 中的 `NotificationStrategiesSection`。
*   **描述**: 稽核清單要求通知策略的編輯應為一個多步驟的精靈流程，但目前的實作是一個單頁的簡易表單彈窗。
*   **建議**: 將編輯通知策略的彈窗重構為一個多步驟的 `Steps` 或 `Tabs` 引導的流程，以更好地引導使用者完成複雜的設定。

---

## J. 平台設定 (Platform Settings)

### [80-82] 設定頁面 (Settings Pages) - ✅ 符合 (Compliant)
*   **描述**: 標籤管理、郵件設定、身份驗證等頁面都實作在 `Tabs` 中，佈局清晰，符合預期。

### [83-85] 標籤管理彈窗 (Tag Management Modals) - ❌ 不符合 (Not Compliant)
*   **問題**: 缺少管理「標籤值」的功能。
*   **位置**: `frontend/src/pages/PlatformSettingsPage.tsx`
*   **描述**: 目前的實作只提供了新增/編輯「標籤規則（Tag Key）」的功能，但完全缺少管理每個標籤對應的「標籤值（Tag Value）」的介面。例如，無法為 `environment` 標籤新增 `production`、`staging` 等可選值。`prototype.html` 中有更完整的標籤值管理設計，包含顏色選擇等功能，但目前均未實作。
*   **建議**:
    1.  新增一個「管理標籤值」的彈窗或頁面。
    2.  在這個介面中，允許使用者為選定的標籤新增、編輯、刪除其對應的值。
    3.  為每個標籤值增加顏色選擇器，以符合 `prototype.html` 的設計。

---

## K. 個人資料 (Profile)

### [90-92] 個人資料頁面 (Profile Pages) - ✅ 符合 (Compliant)
*   **描述**: 個人資訊、密碼安全、偏好設定三個頁面均已正確實作。個人資訊與密碼安全頁面正確地引導使用者到外部身份提供商進行管理，這符合安全最佳實踐。偏好設定頁面功能清晰，符合預期。

---

## I. 通知管理 (Notification Management)

### [70-72] 管理頁面 (Management Pages) - ✅ 符合 (Compliant)
*   **描述**: 三個管理頁面（策略、管道、歷史）都使用了 `Tabs` 來組織，並且每個頁面都包含了帶有工具列的 `DataTable`，佈局和操作邏輯一致。

### [73-76] 編輯與詳情 (彈窗/抽屜) (Edit & Details Modals) - ⚠️ 部分符合 (Partially Compliant)
*   **問題**: 通知策略編輯未使用多步驟精靈 (Wizard) 流程。
*   **位置**: `NotificationManagementPage.tsx` 中的 `NotificationStrategiesSection`。
*   **描述**: 稽核清單要求通知策略的編輯應為一個多步驟的精靈流程，但目前的實作是一個單頁的簡易表單彈窗。
*   **建議**: 將編輯通知策略的彈窗重構為一個多步驟的 `Steps` 或 `Tabs` 引導的流程，以更好地引導使用者完成複雜的設定。

---

## E. 資源管理 (Resource Management)

### [30] 資源列表頁面 (Resources List Page) - ⚠️ 部分符合 (Partially Compliant)
*   **問題**: 迷你趨勢圖 (Sparkline) 的顏色未使用設計系統變數。
*   **位置**: `frontend/src/pages/resources/ResourceOverviewTab.tsx`
*   **描述**: `MiniTrendChart` 元件中，CPU 和記憶體趨勢線的顏色是硬編碼的 (`#722ed1`, `#40a9ff`)，而沒有使用 `prototype.html` 中定義的 CSS 變數。
*   **建議**: 修改 `MiniTrendChart` 元件，使其從 CSS 變數（例如 `--brand-primary`, `--brand-info`）中讀取顏色，以確保與設計系統的視覺風格一致。

### [31] 資源群組頁面 (Resource Groups Page) - ❌ 不符合 (Not Compliant)
*   **問題**: 健康狀態圖表類型不符，且顏色未使用設計系統變數。
*   **位置**: `frontend/src/pages/resources/ResourceGroupsTab.tsx`
*   **描述**:
    1.  **圖表類型**: 稽核清單要求使用「長條圖 (bar chart)」來顯示群組健康狀態，但目前的實作是使用三個圓形的「進度圈 (Progress circle)」。
    2.  **顏色不一致**: 「警告」狀態的進度圈顏色是硬編碼的 (`#faad14`)，而沒有使用 `prototype.html` 中定義的 `--brand-warning` 變數。
*   **建議**:
    1.  將圓形進度圈替換為堆疊長條圖 (Stacked Bar Chart)，以更清晰地展示每個群組中不同健康狀態的資源分佈。
    2.  確保圖表中所有顏色都來自 `prototype.html` 中定義的 CSS 變數，例如 `var(--brand-success)`, `var(--brand-warning)`, `var(--brand-danger)`。

### [32] 拓撲視圖頁面 (Topology View Page) - ⚠️ 部分符合 (Partially Compliant)
*   **問題**: 節點和連線的顏色未使用設計系統變數。
*   **位置**: `frontend/src/pages/resources/ResourceTopologyTab.tsx`
*   **描述**: 拓撲圖中的節點和連線顏色是根據 `themeMode` 在 JavaScript 中硬編碼的，而非從 `prototype.html` 中定義的 CSS 變數讀取。這可能導致未來設計系統顏色更新時，此處的顏色不會同步變更。
*   **建議**: 修改 `ResourceTopologyTab.tsx`，使其能夠從 DOM 中讀取 CSS 變數，並將這些變數應用於 ECharts 的圖表選項中，以確保顏色與設計系統完全同步。

### [33] 編輯資源 (彈窗) (Edit Resource Modal) - ❌ 不符合 (Not Compliant)
*   **問題**: 標籤編輯器未使用 `SmartFilterBuilder`。
*   **位置**: `frontend/src/pages/resources/ResourceOverviewTab.tsx`
*   **描述**: 編輯資源彈窗中的標籤（tags）欄位使用了一個標準的 Ant Design `Select` 元件（`mode="tags"`），這只是一個基本的文字輸入。為了與「智慧輸入系統」保持一致，應使用 `SmartFilterBuilder` 元件。
*   **建議**: 將標籤欄位的 `Select` 元件替換為 `SmartFilterBuilder` 元件。

### [34] 編輯群組 (彈窗) (Edit Group Modal) - ❌ 不符合 (Not Compliant)
*   **問題**: 缺少用於選擇成員的雙欄選擇器 (`Transfer` component)。
*   **位置**: `frontend/src/pages/resources/ResourceGroupsTab.tsx`
*   **描述**: 編輯群組的彈窗中，沒有提供選擇群組成員的功能。稽核清單明確要求此處應有一個雙欄選擇器 (`Transfer`)，讓使用者可以方便地從資源列表中添加或移除成員。
*   **建議**: 在編輯群組的表單中，新增一個 Ant Design 的 `Transfer` 元件，並將其數據源設定為所有資源列表，讓使用者可以管理群組成員。

---

## Z. 最終稽核結論 (Final Audit Conclusion)

### 整體 UI/UX 品質評估
*   **基礎穩固**: 應用程式的整體架構良好，使用了 Ant Design 作為基礎元件庫，並建立了共享元件 (`PageHeader`, `DataTable`, `ContextualKPICard` 等)，這為介面的一致性打下了良好的基礎。
*   **互動流暢**: 大部分的互動操作（如按鈕點擊、表單提交、狀態切換）都有即時的視覺回饋 (`message`, `Modal.confirm`)，使用者體驗流暢。
*   **功能完整**: 核心功能頁面（事件、資源、自動化、權限管理等）都已實作，且業務邏輯清晰。

### 主要問題領域
1.  **設計系統遵循度不足**: 這是最主要的問題。許多頁面和元件沒有嚴格遵循 `prototype.html` 中定義的設計規範，導致視覺風格不統一。
    *   **本地樣式氾濫**: `LoginPage` 使用 `styled-components` 完全脫離了設計系統。
    *   **硬編碼顏色**: 多個圖表（資源列表的趨勢圖、基礎設施洞察的長條圖、拓撲圖）的顏色是硬編碼的，而非使用 CSS 變數。
    *   **自訂元件未被使用**: `prototype.html` 中定義的 `.incident-timeline`, `.nav-item` 等自訂樣式未被應用。
2.  **功能與 UI 元件不匹配**: 部分功能的 UI 實作與稽核清單的要求不符。
    *   **缺少 Wizard 流程**: 「編輯事件規則」和「編輯通知策略」應為多步驟的精靈流程，但目前是單頁表單。
    *   **未使用指定元件**: 「啟用/暫停事件規則」未使用 `Switch`，「編輯靜音規則」的範圍設定未使用 `SmartFilterBuilder`。
3.  **全域體驗不一致**:
    *   **頁面標題**: 大部分頁面缺少動態更新瀏覽器標籤頁標題的功能。
    *   **頁面級操作**: 如「重新整理」按鈕，並非在所有主要頁面都提供。

### 整體改進建議
1.  **成立設計系統遵循小組**: 指派專人或小組負責確保所有新的開發和重構都嚴格遵循 `prototype.html` 的規範。
2.  **重構關鍵違規頁面**:
    *   **優先處理 `LoginPage`**: 移除 `styled-components`，完全使用設計系統的 CSS class 和變數來重構。
    *   **統一圖表顏色**: 建立一個共用的圖表主題設定檔，從 CSS 變數中讀取顏色，並應用到所有 ECharts 實例。
3.  **實作缺失的 UI 模式**:
    *   將「編輯事件規則」和「編輯通知策略」的彈窗重構成多步驟精靈。
    *   將「編輯靜音規則」和「編輯資源」中的標籤/條件編輯器替換為 `SmartFilterBuilder` 元件。
4.  **提升全域體驗一致性**:
    *   建立一個共用的 `usePageTitle` hook，讓所有頁面都能輕鬆地更新文件標題。
    *   為所有主要的列表/儀表板頁面在 `PageHeader` 中提供一個標準的「重新整理」按鈕。
5.  **程式碼重構**:
    *   將所有通用的格式化函數 (`formatDateTime`, `formatRelative` 等) 和狀態顏色映射表 (`statusToneMap` 等) 提取到 `utils` 或 `constants` 目錄下的共用檔案中。
