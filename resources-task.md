# 「資源列表」頁面整合規劃方案

### 1. 總體目標
將「資源列表」頁面重構為一個**單一、無滾動的頁面**。此頁面需內建兩種可切換的模式：「儀表板模式」用於宏觀監控，「列表管理模式」用於詳細操作，並確保兩種模式之間的工作流程無縫銜接。

---

### 2. 頁面結構重構指令

#### 2.1. 引入視圖狀態管理
在「資源列表」頁面的主 React 元件中，建立一個名為 `viewMode` 的 state，用於控制當前顯示的模式。
* **指令**：`const [viewMode, setViewMode] = useState('dashboard');`
* **預設值**：`'dashboard'`，讓使用者預設進入儀表板模式。

#### 2.2. 建立視圖切換器 (View Toggle)
在頁面標題「資源列表」的右側，建立一個視圖切換元件。
* **指令**：使用 Ant Design 的 `<Radio.Group>` 元件。
* **屬性**：
    * `value`: 綁定到 `viewMode` state。
    * `onChange`: 綁定到 `setViewMode` 函數。
* **選項**：
    * `<Radio.Button value="dashboard">📊 儀表板</Radio.Button>`
    * `<Radio.Button value="list">📄 列表管理</Radio.Button>`

#### 2.3. 實現條件渲染 (Conditional Rendering)
在頁面的主內容區域，根據 `viewMode` state 的值，條件渲染對應的視圖元件。
* **指令**：
    ```jsx
    {viewMode === 'dashboard' ? <DashboardView /> : <ListView />}
    ```

---

### 3. 組件詳細規劃

#### 3.1. 統一工具列組件 (`<SharedToolbar />`)
為了保持操作的一致性，將兩個視圖共享的工具列提取為一個獨立元件。此工具列應位於**視圖切換器的下方**，但在主要內容（儀表板或列表）的上方。
* **指令**：建立一個名為 `SharedToolbar` 的新元件。
* **包含元素**：
    1.  Ant Design `<Input.Search>` 元件，`placeholder` 為「搜尋資源名稱、IP 或標籤...」。
    2.  Ant Design `<Button>`，`icon` 為 `<FilterOutlined />`，文字為「篩選」。
    3.  Ant Design `<Button>`，`icon` 為 `<ReloadOutlined />` (重新整理)。
    4.  Ant Design `<Button>`, `icon` 為 `<DownloadOutlined />` (匯出)。
    5.  Ant Design `<Button>`，`type="primary"`，文字為「+ 新增資源」。

#### 3.2. 儀表板模式組件 (`<DashboardView />`)
此元件負責渲染 `image_65e8d6.jpg` 中展示的儀表板佈局。
* **指令**：建立一個名為 `DashboardView` 的新元件，其根元素應為一個 `2x2` 的 Ant Design `<Row>` 和 `<Col>` 網格佈局。
* **網格內容**：
    1.  **左上 (`Col span={12}`)**：渲染「資源總覽」卡片，整合以下 KPI：
        * 總資源數 (主指標)
        * 健康狀態 (次指標，格式：`138 健康 / 143 警告 / 93 嚴重`)
        * 作業系統分佈 (次指標)
    2.  **右上 (`Col span={12}`)**：渲染「Top N 資源使用列表」卡片。
    3.  **左下 (`Col span={12}`)**：渲染「資源健康度熱力圖」卡片。
    4.  **右下 (`Col span={12}`)**：渲染「需關注的資源列表」卡片，此為一個只顯示 `Critical` 和 `Warning` 狀態資源的迷你表格。

#### 3.3. 列表管理模式組件 (`<ListView />`)
此元件負責渲染 `image_66d0fa.jpg` 中展示的傳統表格。
* **指令**：建立一個名為 `ListView` 的新元件，其核心是一個 Ant Design `<Table>`。
* **表格規格**：
    * **欄位 (Columns)**：嚴格按照 `image_66d0fa.jpg` 的順序和名稱建立欄位，包括 `狀態`、`資源名稱`、`資源趨勢 (24H)`、`IP位址`、`所屬團隊`、`類型`、`標籤`、`即時告警`、`操作`。
    * **功能**：確保表格具備完整的**排序**、**篩選**和**分頁**功能。

---

### 4. 互動流程優化指令
為了實現無縫的工作流程，需要增加從儀表板到列表的下鑽功能。
* **指令**：為 `<DashboardView />` 中的可點擊元件（例如「需關注的資源列表」中的主機名稱）增加 `onClick` 事件。
* **觸發行為**：
    1.  調用 `setViewMode('list')`，將視圖切換到列表管理模式。
    2.  (進階) 將被點擊的資源資訊（如主機名稱）作為參數傳遞，並觸發 `<ListView />` 中表格的篩選功能，使其自動篩選並高亮顯示該資源。

---

### 5. 總結
依照此規劃方案進行修改，AI 或開發者可以將現有的兩個獨立視圖概念，完美地整合到一個單一、動態、無滾動的「資源」頁面中，實現**監控與管理一體化**的頂級 SRE 平台體驗。