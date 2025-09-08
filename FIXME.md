# 缺少的元件與功能

> 參考最新截圖目錄 `screenshot/`

### **1. Header**

1.  **全局搜索框 (`Input.Search`)**:
    * **現狀**: 目前 Header 右側區域還沒有實作搜索框。
    * **缺少**:
        * 一個 `Ant Design` 的 `Input.Search` 元件。
        * 綁定 `Ctrl+K` 快捷鍵來聚焦到搜索框的功能。
        * 整合 `GET /api/v1/search` API [cite: detectviz/sre-platform-frontend/sre-platform-frontend-d9378a6d540663f37573262a8d71fcbcaa6aaa12/openapi.yaml]，當使用者輸入時，可以彈出一個下拉列表顯示跨模組的搜尋結果（例如相關的資源、告警等）。

2.  **通知中心 (`Notification Center`)**:
    * **現狀**: 截圖中有一個鈴鐺圖標 (`BellOutlined`)，但它目前是靜態的。
    * **缺少**:
        * **未讀計數 (`Badge`)**: 鈴鐺圖標上需要疊加一個紅色的 `Badge` 元件，其數字應來自 `GET /api/v1/notifications/summary` API [cite: detectviz/sre-platform-frontend/sre-platform-frontend-d9378a6d540663f37573262a8d71fcbcaa6aaa12/openapi.yaml] 的 `unread_count`。
        * **通知列表彈窗 (`Popover` or `Drawer`)**: 點擊鈴鐺圖標後，需要彈出一個 `Popover` 或 `Drawer` [cite: design.md]，列表中的內容應來自 `GET /api/v1/notifications` API [cite: detectviz/sre-platform-frontend/sre-platform-frontend-d9378a6d540663f37573262a8d71fcbcaa6aaa12/openapi.yaml]。
        * **標記已讀**: 在彈出的通知列表中，需要有將通知標記為已讀的互動功能。

3.  **用戶菜單 (`User Menu`)**:
    * **現狀**: 截圖中顯示了用戶頭像 (`Avatar`) 和名稱 "Admin"。
    * **缺少**:
        * **下拉菜單 (`Dropdown`)**: 點擊頭像或名稱後，應彈出一個包含「個人資料」、「系統設定」、「登出」等選項的 `Dropdown.Menu` 元件 [cite: design.md]。
        * **動態用戶資訊**: "Admin" 這個名稱目前是寫死的，它應該從 Redux store 中的用戶認證狀態動態獲取。


### **2. 總覽儀表板 (Dashboard)**

* **現狀**: `dashboard.jpg` 顯示 API 錯誤提示。
* **缺少元件**:
    * **KPI 數據卡片**: 缺少用於顯示「新告警」、「處理中」、「今日已解決」等關鍵指標的 `Statistic` 元件卡片。
    * **數據圖表**: 缺少用於「資源群組狀態總覽」的 `ECharts` **長條圖**和用於「資源狀態分佈」的 `ECharts` **圓餅圖**。
    * **數據本身**: 整個頁面都需要透過 `DashboardApi` 來獲取並填充真實數據。

### **3. 資源管理 (Resource Management)**

* **現狀**: `resources.jpg` 顯示了一個空的表格。
* **缺少元件**:
    * **表格數據 (`Table Data`)**: 缺少從 `GET /api/v1/resources` 獲取的實際資源列表。
    * **狀態標籤 (`Tag`)**: 表格中的「狀態」欄位，需要根據資源的健康度（healthy, warning, critical）顯示不同顏色的 `Tag` 元件。
    * **批次操作工具列**: 缺少當使用者勾選表格項目後，才會動態出現的批次操作按鈕（批次刪除、批次加入群組等）。
    * **互動彈窗 (`Modal`)**: 缺少點擊「新增資源」或「掃描網路」後彈出的表單視窗。

### **4. 告警紀錄 (Incidents / Logs)**

* **現狀**: `log.jpg` 顯示了篩選條件和一個空的表格。
* **缺少元件**:
    * **表格數據**: 缺少從 `GET /api/v1/incidents` 獲取的告警事件列表。
    * **狀態與等級標籤**: 「狀態」和「等級」欄位都需要使用不同顏色的 `Tag` 來突顯資訊。
    * **互動彈窗**: 缺少點擊「詳情」後展示告警所有細節的 `Modal`，以及「生成事件報告」的 `Modal`。
    * **批次操作**: 缺少選中告警後的「批次確認」、「批次解決」等按鈕。

### **5. 組織管理 (Personnel & Teams)**

* **現狀**: `personnel.jpg` 和 `teams.jpg` 都是空的表格。
* **缺少元件**:
    * **表格數據**: 缺少從 `GET /api/v1/users` 和 `GET /api/v1/teams` 獲取的數據。
    * **新增/編輯彈窗**: 缺少用於新增和編輯人員/團隊的 `Modal` 表單。
    * **自動完成/穿梭框**: 特別是在編輯團隊時，缺少用於高效選擇成員的 `Autocomplete` 或 `Transfer` 元件。

這些「缺少」的元件正是我們下一步的開發重點。現在骨架已經搭好，接下來的工作就是專注於數據的串接與互動元件的開發，將這些頁面填充完整。