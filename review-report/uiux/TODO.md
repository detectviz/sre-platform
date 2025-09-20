# SRE 平台 UI/UX 改善待辦清單

這是一份根據 UI/UX 稽核結果整理出的待辦事項，旨在修復與設計規範不符之處，並補全缺失的功能。

## 1. 未實作 (Not Implemented)

- [ ] **多步驟精靈流程**:
  - [ ] 將「編輯事件規則」的彈窗重構為多步驟精靈。
  - [ ] 將「編輯通知策略」的彈窗重構為多步驟精靈。
- [ ] **智慧輸入系統**:
  - [ ] 將「編輯靜音規則」的範圍設定替換為 `SmartFilterBuilder` 元件。
  - [ ] 將「編輯資源」的標籤編輯器替換為 `SmartFilterBuilder` 元件。
- [ ] **關鍵功能元件**:
  - [ ] 在 `SREWarRoomPage` 中新增「服務健康度熱圖」。
  - [ ] 在「編輯群組」彈窗中新增 `Transfer` 元件來管理成員。
  - [ ] 在 `PlatformSettingsPage` 中新增「標籤值管理」功能。
- [ ] **全域體驗**:
  - [ ] 為所有主要頁面（如 `IncidentsPage`, `AutomationCenterPage`）新增動態更新 `<title>` 的功能。
  - [ ] 為 `IncidentsPage` 在 `PageHeader` 中新增「重新整理」按鈕。
- [ ] **腳本編輯器**:
  - [ ] 為自動化中心的腳本編輯器引入語法高亮功能。

## 2. 未比照原型 (Not Following Prototype)

- [ ] **登入頁面重構**:
  - [ ] 移除 `LoginPage.tsx` 中的 `styled-components`，全面改用 `prototype.html` 中定義的 CSS class 和變數。
- [ ] **圖表顏色統一**:
  - [ ] 建立一個共用的圖表主題設定檔，從 CSS 變數讀取顏色。
  - [ ] 將資源列表趨勢圖、基礎設施洞察長條圖、拓撲圖的顏色改為使用此設定檔。
- [ ] **UI 元件替換**:
  - [ ] 將「啟用/暫停事件規則」的文字按鈕替換為 `Switch` 元件。
  - [ ] 將資源群組健康狀態的進度圈圖表替換為堆疊長條圖。
- [ ] **自訂樣式應用**:
  - [ ] 為 `UserMenu` 的下拉選單套用 `.user-dropdown-menu` 的玻璃效果樣式。
  - [ ] 為 `CreateSilenceModal` 套用 `.silence-modal` 的特殊背景樣式。
  - [ ] 為事件詳情彈窗中的時間軸套用 `.incident-timeline` 自訂樣式。
  - [ ] 為儀表板管理頁面的卡片套用 `.nav-item` 樣式。

## 3. 改善建議 (Suggestions)

- [ ] **程式碼重構**:
  - [ ] 將通用的格式化函數（如 `formatDateTime`, `formatRelative`）和狀態顏色映射表 (`statusToneMap`) 提取到 `utils` 或 `constants` 目錄下的共用檔案中。
