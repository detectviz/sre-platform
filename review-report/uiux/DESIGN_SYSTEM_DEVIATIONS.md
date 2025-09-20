# 設計系統偏差報告 (Design System Deviations)

本報告詳細記錄了當前實作與 `prototype.html` 設計規範之間的所有偏差。

## 1. 嚴重偏差 (Critical Deviations)

### 1.1. `LoginPage.tsx` - 完全未使用設計系統
*   **偏差**: 整個登入頁面使用 `styled-components` 進行本地化樣式設計，完全忽略了 `prototype.html` 中定義的全域 CSS 變數和 class。
*   **影響**: 導致登入頁面的視覺風格（顏色、字體、佈局）與應用程式的其他部分完全脫節，嚴重破壞了品牌和使用者體驗的一致性。
*   **涉及的 `prototype.html` 樣式**:
    *   `--brand-primary`, `--bg-page` 等所有 CSS 變數。
    *   `.login-page .ant-input`
    *   `.login-submit-btn`

## 2. 主要偏差 (Major Deviations)

### 2.1. 圖表顏色硬編碼
*   **偏差**: 多個使用 ECharts 的圖表元件，其顏色是在 JavaScript 中硬編碼的，而非使用 CSS 變數。
*   **影響**: 當設計系統的顏色主題更新時，這些圖表的顏色不會同步變更。
*   **涉及的元件**:
    *   `ResourceOverviewTab.tsx` (`MiniTrendChart`): CPU 和記憶體趨勢線顏色。
    *   `InfrastructureInsightsPage.tsx`: 資源使用率長條圖的狀態顏色。
    *   `ResourceTopologyTab.tsx`: 拓撲圖的節點和連線顏色。
*   **涉及的 `prototype.html` 樣式**:
    *   `--brand-primary`, `--brand-info`, `--brand-success`, `--brand-warning`, `--brand-danger`

### 2.2. 未使用自訂元件樣式
*   **偏差**: `prototype.html` 中定義了一些自訂的元件樣式，但未在對應的元件中被應用。
*   **影響**: 導致這些元件的視覺效果不符合預期的精細設計。
*   **涉及的元件與樣式**:
    *   **`UserMenu.tsx`**: 未使用 `.user-dropdown-menu` 的玻璃效果樣式。
    *   **`CreateSilenceModal.tsx`**: 未使用 `.silence-modal` 的特殊背景樣式。
    *   **`IncidentsPage.tsx`**: 事件詳情彈窗中的時間軸未使用 `.incident-timeline` 樣式。
    *   **`DashboardAdministrationPage.tsx`**: 儀表板卡片未使用 `.nav-item` 樣式。

## 3. 次要偏差 (Minor Deviations)

### 3.1. 缺少 UI 元件實作
*   **偏差**: 部分功能的 UI 實作與稽核清單及 `prototype.html` 的要求不符。
*   **影響**: 使用者體驗不一致，或缺少預期的功能。
*   **涉及的元件**:
    *   **`IncidentsPage.tsx`**: 「編輯事件規則」和「編輯通知策略」未使用多步驟精靈；「啟用/暫停事件規則」未使用 `Switch`；「編輯靜音規則」未使用 `SmartFilterBuilder`。
    *   **`ResourceGroupsTab.tsx`**: 編輯群組彈窗缺少 `Transfer` 成員選擇器。
    *   **`AutomationCenterPage.tsx`**: 腳本編輯器未使用 `.code-editor-like` 樣式且缺少語法高亮。
    *   **`SREWarRoomPage.tsx`**: 缺少服務健康度熱圖。
    *   **`PlatformSettingsPage.tsx`**: 缺少標籤值管理功能。

### 3.2. 程式碼結構建議
*   **偏差**: 通用的格式化函數和狀態映射表散落在多個頁面元件中。
*   **影響**: 程式碼重複，難以維護，且可能導致未來的不一致。
*   **涉及的檔案**: `IncidentsPage.tsx`, `AutomationCenterPage.tsx` 等。
*   **建議**: 建立共用的 `utils` 和 `constants` 檔案來集中管理這些共用程式碼。
