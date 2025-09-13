# 所有頁面操作按鈕優化指令

### 1. 核心目標
將所有列表的「操作」欄位中，帶有文字的按鈕，重構為**「僅圖示」按鈕**，並為每個圖示按鈕增加**滑鼠懸停時的文字提示**，以達到節省空間、提升介面簡潔性的目的。

---

### 2. 詳細修改指令

#### 2.1. 引入必要元件
* **指令**：在檔案的元件引入區域，確保從 `antd` 引入 `Tooltip` 元件。
* **程式碼參考**：
    ```jsx
    import { Table, Button, Tooltip, Space } from 'antd';
    ```

#### 2.2. 修改表格「操作」欄位的 `render` 函數
* **指令**：定位到定義表格欄位的 `columns` 陣列，找到 `key` 為 `'操作'` 的物件，並將其 `render` 函數的內容，從「圖示+文字按鈕」的形式，替換為「Tooltip 包裹的純圖示按鈕」形式。

* **修改前的程式碼範例 (示意)**：
    ```jsx
    <Space>
        <Button icon={<PlayCircleOutlined />}>執行</Button>
        <Button icon={<HistoryOutlined />}>歷史</Button>
        <Button icon={<EditOutlined />}>編輯</Button>
        <Button icon={<DeleteOutlined />} danger>刪除</Button>
    </Space>
    ```

* **修改後的程式碼範例 (請直接替換)**：
    ```jsx
    <Space size="small">
        <Tooltip title="執行" placement="top">
            <Button type="text" icon={<PlayCircleOutlined style={{ color: '#52c41a' }} />} />
        </Tooltip>
        <Tooltip title="查看歷史" placement="top">
            <Button type="text" icon={<HistoryOutlined />} />
        </Tooltip>
        <Tooltip title="編輯" placement="top">
            <Button type="text" icon={<EditOutlined />} />
        </Tooltip>
        <Tooltip title="刪除" placement="top">
            <Button type="text" icon={<DeleteOutlined />} danger />
        </Tooltip>
    </Space>
    ```

---
### 3. 設計細節與圖示建議

為了達到最佳視覺效果，建議採用以下細節：

| 操作 | 建議圖示 (from `@ant-design/icons`) | 樣式建議 |
| :--- | :--- | :--- |
| **執行** | `PlayCircleOutlined` | 賦予圖示成功狀態的顏色 (如綠色)，以示突出 |
| **歷史** | `HistoryOutlined` | 使用預設顏色 |
| **編輯** | `EditOutlined` | 使用預設顏色 |
| **刪除** | `DeleteOutlined` | 使用 `danger` 屬性，使其呈現警告的紅色 |

* **按鈕類型**：建議將 `<Button>` 的 `type` 屬性設定為 `text`，這會移除按鈕的背景和邊框，使其在表格中顯得更輕量、更融合。

### 4. 總結
完成以上修改後，所有頁面的表格將會變得更加精緻和高效。**在不犧牲任何功能清晰度的前提下，成功地回收了寶貴的水平空間**，為將來可能增加的其他欄位預留了位置，也讓整個平台的視覺一致性更高。

「容量規劃」頁面，在「開始分析」按鈕右邊，新增一個「匯出」按鈕，樣式參考「資源群組」頁面的「匯出」按鈕。