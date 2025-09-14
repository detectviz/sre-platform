# SRE 平台前端組件設計規範文件

## 1. 登入頁面 (LoginPage)

### 1.1 彈窗
- 無專屬彈窗

### 1.2 按鈕
- 登入按鈕：`.login-submit-btn`
  - 高度：52px
  - 字體大小：16px
  - 背景：linear-gradient(135deg, #6c757d 0%, #495057 100%)
  - 圓角：var(--radius-lg)
  - 懸停效果：transform translateY(-2px) 和 box-shadow

### 1.3 工具列
- 無專屬工具列

### 1.4 表格欄位
- 無表格

## 2. 儀表板頁面 (DashboardPage)

### 2.1 彈窗
- 無專屬彈窗

### 2.2 按鈕
- 無專屬按鈕

### 2.3 工具列
- 無專屬工具列

### 2.4 表格欄位
- 無表格

## 3. 資源管理頁面 (ResourcesPage)

### 3.1 彈窗
- 無專屬彈窗

### 3.2 按鈕
- 導航卡片按鈕：
  - 啟用狀態：正常樣式
  - 禁用狀態：.disabled-card 樣式，opacity 0.5

### 3.3 工具列
- 無專屬工具列

### 3.4 表格欄位
- 無表格

## 4. 資源列表頁面 (ResourceListPage)

### 4.1 彈窗
- 新增/編輯資源彈窗：
  - 標題：新增資源/編輯資源
  - 表單欄位：名稱、描述、IP、類型、標籤
  - 底部按鈕：取消、儲存資源

### 4.2 按鈕
- 工具列按鈕：
  - 搜索框：`.search-input` (寬度 300px)
  - 篩選按鈕：`.toolbar-btn` 帶 FilterOutlined 圖標
  - 重新載入按鈕：`.toolbar-btn-icon-only` 帶 ReloadOutlined 圖標
  - 匯出按鈕：`.toolbar-btn` 帶 DownloadOutlined 圖標
  - 新增資源按鈕：primary 按鈕帶 PlusOutlined 圖標
- 表格操作按鈕：
  - 編輯按鈕：link 按鈕
  - 刪除按鈕：danger 按鈕

### 4.3 工具列
- 主工具列：`.table-toolbar`
  - 左側：搜索框 + 篩選按鈕
  - 右側：重新載入 + 匯出 + 新增資源

### 4.4 表格欄位
- 資源列表表格：
  - 名稱 (name)
  - IP 地址 (ip)
  - 類型 (type)
  - 狀態 (status)：使用 .status-badge 樣式
  - 創建時間 (created_at)
  - 操作 (action)：編輯、刪除按鈕

## 5. 資源群組頁面 (ResourceGroupsPage)

### 5.1 彈窗
- 新增/編輯群組彈窗：
  - 標題：新增群組/編輯群組
  - 表單欄位：名稱、描述
  - 資源轉移組件：Transfer 組件選擇群組成員
  - 底部按鈕：取消、創建群組/更新群組

### 5.2 按鈕
- 工具列按鈕：
  - 搜索框：`.search-input` (寬度 300px)
  - 篩選按鈕：`.toolbar-btn` 帶 FilterOutlined 圖標
  - 重新載入按鈕：`.toolbar-btn-icon-only` 帶 ReloadOutlined 圖標
  - 匯出按鈕：`.toolbar-btn` 帶 DownloadOutlined 圖標
  - 新增群組按鈕：primary 按鈕帶 PlusOutlined 圖標
- 表格操作按鈕：
  - 編輯按鈕：link 按鈕
  - 刪除按鈕：danger 按鈕

### 5.3 工具列
- 主工具列：`.table-toolbar`
  - 左側：搜索框 + 篩選按鈕
  - 右側：重新載入 + 匯出 + 新增群組

### 5.4 表格欄位
- 群組列表表格：
  - 名稱 (name)
  - 成員數 (members)
  - 描述 (description)
  - 創建時間 (created_at)
  - 操作 (action)：編輯、刪除按鈕

## 6. 事件列表頁面 (IncidentListPage)

### 6.1 彈窗
- 無專屬彈窗

### 6.2 按鈕
- 工具列按鈕：
  - 搜索框：`.search-input` (寬度 300px)
  - 篩選按鈕：`.toolbar-btn` 帶 FilterOutlined 圖標
  - 重新載入按鈕：`.toolbar-btn-icon-only` 帶 ReloadOutlined 圖標
  - 匯出按鈕：`.toolbar-btn` 帶 DownloadOutlined 圖標
- 表格操作按鈕：
  - 確認按鈕：primary 按鈕帶 CheckCircleOutlined 圖標
  - 靜音按鈕：secondary 按鈕帶 PauseCircleOutlined 圖標
  - 查看詳情按鈕：link 按鈕

### 6.3 工具列
- 主工具列：`.table-toolbar`
  - 左側：搜索框 + 篩選按鈕
  - 右側：重新載入 + 匯出

### 6.4 表格欄位
- 事件列表表格：
  - 嚴重程度 (severity)：使用 .status-badge 樣式
  - 事件摘要 (summary)
  - 狀態 (status)：使用 .status-badge 樣式
  - 來源 (source)
  - 創建時間 (created_at)
  - 自動化 (automation_id)
  - 處理者 (assignee)
  - 資源名稱 (resource_name)
  - 操作 (action)：確認、靜音、查看詳情按鈕

## 7. 告警規則頁面 (AlertingRulesPage)

### 7.1 彈窗
- 新增/編輯規則彈窗 (多步驟)：
  - 步驟1：基本資訊
    - 表單欄位：規則名稱、描述
  - 步驟2：觸發條件
    - 條件群組：Form.List 組件
    - 條件：指標選擇、運算子、閾值、持續時間
  - 步驟3：事件內容與通知
    - 事件標題樣板、事件內容樣板
    - 變數標籤：可點擊插入變數
  - 步驟4：自動化響應
    - 啟用自動化響應 checkbox
    - 腳本選擇下拉框
    - 腳本參數設定區域
  - 底部按鈕：上一步、取消、下一步/儲存規則

### 7.2 按鈕
- 工具列按鈕：
  - 搜索框：`.search-input` (寬度 300px)
  - 篩選按鈕：`.toolbar-btn` 帶 FilterOutlined 圖標
  - 重新載入按鈕：`.toolbar-btn-icon-only` 帶 ReloadOutlined 圖標
  - 匯出按鈕：`.toolbar-btn` 帶 DownloadOutlined 圖標
  - 新增規則按鈕：primary 按鈕帶 PlusOutlined 圖標
- 表格操作按鈕：
  - 編輯按鈕：link 按鈕
  - 刪除按鈕：danger 按鈕
- 步驟彈窗按鈕：
  - 上一步按鈕
  - 取消按鈕
  - 下一步按鈟
  - 儲存規則按鈕

### 7.3 工具列
- 主工具列：`.table-toolbar`
  - 左側：搜索框 + 篩選按鈕
  - 右側：重新載入 + 匯出 + 新增規則

### 7.4 表格欄位
- 告警規則表格：
  - 啟用 (enabled)：Switch 組件
  - 名稱 (name)
  - 嚴重程度 (severity)：使用 .status-badge 樣式
  - 資源群組 (resource_group)
  - 最後更新 (last_updated)
  - 創建者 (creator)
  - 操作 (action)：編輯、刪除按鈕

## 8. 靜音規則頁面 (SilencesPage)

### 8.1 彈窗
- 新增/編輯靜音規則彈窗 (多步驟)：
  - 步驟1：基本資訊
    - 表單欄位：靜音規則名稱、描述、啟用狀態
  - 步驟2：維護條件
    - 標籤匹配條件：Form.List 組件
    - 標籤鍵、運算子、標籤值輸入框
  - 步驟3：時間設定
    - 開始時間、結束時間選擇器
    - 持續時間設定
  - 步驟4：通知設定
    - 通知訂閱者選擇
  - 底部按鈕：上一步、取消、下一步/儲存規則

### 8.2 按鈕
- 工具列按鈕：
  - 搜索框：`.search-input` (寬度 300px)
  - 篩選按鈕：`.toolbar-btn` 帶 FilterOutlined 圖標
  - 重新載入按鈕：`.toolbar-btn-icon-only` 帶 ReloadOutlined 圖標
  - 匯出按鈕：`.toolbar-btn` 帶 DownloadOutlined 圖標
  - 新增靜音規則按鈕：primary 按鈕帶 PlusOutlined 圖標
  - 快速維護按鈕：secondary 按鈕帶 PauseCircleOutlined 圖標
- 表格操作按鈕：
  - 編輯按鈕：link 按鈕
  - 刪除按鈕：danger 按鈕
  - 啟用/停用按鈕：Switch 組件
- 步驟彈窗按鈕：
  - 上一步按鈕
  - 取消按鈕
  - 下一步按鈕
  - 儲存規則按鈕

### 8.3 工具列
- 主工具列：`.table-toolbar`
  - 左側：搜索框 + 篩選按鈕
  - 右側：重新載入 + 匯出 + 新增靜音規則 + 快速維護

### 8.4 表格欄位
- 靜音規則表格：
  - 啟用 (enabled)：Switch 組件
  - 名稱 (name)
  - 狀態 (status)：使用 .status-badge 樣式
  - 匹配標籤 (matchers)
  - 開始時間 (start_time)
  - 結束時間 (end_time)
  - 創建者 (creator)
  - 操作 (action)：編輯、刪除按鈕

## 9. 腳本頁面 (ScriptsPage)

### 9.1 彈窗
- 新增/編輯腳本彈窗：
  - 表單欄位：腳本名稱、描述、腳本類型、腳本內容
  - 腳本參數設定區域
  - 底部按鈕：取消、儲存腳本

### 9.2 按鈕
- 工具列按鈕：
  - 搜索框：`.search-input` (寬度 300px)
  - 篩選按鈕：`.toolbar-btn` 帶 FilterOutlined 圖標
  - 重新載入按鈕：`.toolbar-btn-icon-only` 帶 ReloadOutlined 圖標
  - 匯出按鈕：`.toolbar-btn` 帶 DownloadOutlined 圖標
  - 新增腳本按鈕：primary 按鈕帶 PlusOutlined 圖標
- 表格操作按鈕：
  - 編輯按鈕：link 按鈕
  - 刪除按鈕：danger 按鈕
  - 執行按鈕：primary 按鈕帶 PlayCircleOutlined 圖標
  - 歷史按鈕：link 按鈕帶 HistoryOutlined 圖標

### 9.3 工具列
- 主工具列：`.table-toolbar`
  - 左側：搜索框 + 篩選按鈕
  - 右側：重新載入 + 匯出 + 新增腳本

### 9.4 表格欄位
- 腳本列表表格：
  - 名稱 (name)
  - 類型 (type)
  - 最後更新 (last_updated)
  - 創建者 (creator)
  - 操作 (action)：編輯、刪除、執行、歷史按鈕

## 10. 排程頁面 (SchedulesPage)

### 10.1 彈窗
- 新增/編輯排程彈窗：
  - 表單欄位：任務名稱、描述、執行腳本、目標資源
  - 排程設定區域：
    - 簡易模式：頻率選擇、時間設定
    - 進階模式：CRON 表達式輸入
  - 腳本參數設定區域
  - 底部按鈕：取消、儲存

### 10.2 按鈕
- 工具列按鈕：
  - 搜索框：`.search-input` (寬度 300px)
  - 篩選按鈕：`.toolbar-btn` 帶 FilterOutlined 圖標
  - 重新載入按鈕：`.toolbar-btn-icon-only` 帶 ReloadOutlined 圖標
  - 匯出按鈕：`.toolbar-btn` 帶 DownloadOutlined 圖標
  - 新增排程按鈕：primary 按鈕帶 PlusOutlined 圖標
- 表格操作按鈕：
  - 執行按鈕：primary 按鈕帶 PlayCircleOutlined 圖標
  - 歷史按鈕：link 按鈕帶 HistoryOutlined 圖標
  - 編輯按鈕：link 按鈕
  - 刪除按鈕：danger 按鈕

### 10.3 工具列
- 主工具列：`.table-toolbar`
  - 左側：搜索框 + 篩選按鈕
  - 右側：重新載入 + 匯出 + 新增排程

### 10.4 表格欄位
- 排程列表表格：
  - 啟用 (enabled)：Switch 組件
  - 任務名稱 (name)
  - 執行腳本 (scriptId)
  - CRON 條件 (cron)
  - 上次狀態 (lastStatus)：Tag 組件顯示狀態
  - 上次執行時間 (lastRun)
  - 下次執行 (cron)
  - 創建者 (creator)
  - 操作 (action)：執行、歷史、編輯、刪除按鈕

## 11. 執行日誌頁面 (ExecutionsPage)

### 11.1 彈窗
- 執行日誌詳情彈窗：
  - 標題：執行日誌詳情
  - 結構化日誌顯示區域
  - 底部按鈕：複製日誌

### 11.2 按鈕
- 表格操作按鈕：
  - 查看日誌按鈕：`.table-action-btn`

### 11.3 工具列
- 無專屬工具列

### 11.4 表格欄位
- 執行日誌表格：
  - 狀態 (status)：Tag 組件顯示狀態
  - 腳本名稱 (scriptName)
  - 觸發方式 (trigger)
  - 開始時間 (startTime)
  - 執行耗時 (duration)
  - 操作 (action)：查看日誌按鈕

## 12. 人員管理頁面 (UserManagementPage)

### 12.1 彈窗
- 新增/編輯用戶彈窗：
  - 表單欄位：用戶姓名、電子郵件
  - 權限設定區域：所屬團隊、角色選擇
  - 底部按鈕：取消、新增用戶/更新用戶

### 12.2 按鈕
- 工具列按鈕：
  - 搜索框：`.search-input` (寬度 300px)
  - 篩選按鈕：`.toolbar-btn` 帶 FilterOutlined 圖標
  - 重新載入按鈕：`.toolbar-btn-icon-only` 帶 ReloadOutlined 圖標
  - 匯出按鈕：`.toolbar-btn` 帶 DownloadOutlined 圖標
  - 新增用戶按鈕：primary 按鈕帶 PlusOutlined 圖標
- 表格操作按鈕：
  - 編輯按鈕：link 按鈕
  - 刪除按鈕：danger 按鈕
- 用戶狀態切換按鈕：
  - Switch 組件用於啟用/停用用戶

### 12.3 工具列
- 主工具列：`.table-toolbar`
  - 左側：搜索框 + 篩選按鈕
  - 右側：重新載入 + 匯出 + 新增用戶

### 12.4 表格欄位
- 用戶列表表格：
  - 啟用 (enable)：Switch 組件
  - 姓名 (name)
  - 電子郵件 (email)
  - 團隊 (teams)
  - 角色 (roles)：Tag 組件顯示角色
  - 最後登入 (lastLogin)
  - 操作 (action)：編輯、刪除按鈕

## 13. 團隊管理頁面 (TeamManagementPage)

### 13.1 彈窗
- 新增/編輯團隊彈窗：
  - 表單欄位：團隊名稱、負責人、團隊描述
  - 團隊成員設定區域：Transfer 組件
  - 通知訂閱者設定區域：標籤選擇
  - 底部按鈕：取消、創建團隊/更新團隊

### 13.2 按鈕
- 工具列按鈕：
  - 搜索框：`.search-input` (寬度 300px)
  - 篩選按鈕：`.toolbar-btn` 帶 FilterOutlined 圖標
  - 重新載入按鈕：`.toolbar-btn-icon-only` 帶 ReloadOutlined 圖標
  - 匯出按鈕：`.toolbar-btn` 帶 DownloadOutlined 圖標
  - 新增團隊按鈕：primary 按鈕帶 PlusOutlined 圖標
- 表格操作按鈕：
  - 編輯按鈕：link 按鈕
  - 刪除按鈕：danger 按鈕

### 13.3 工具列
- 主工具列：`.table-toolbar`
  - 左側：搜索框 + 篩選按鈕
  - 右側：重新載入 + 匯出 + 新增團隊

### 13.4 表格欄位
- 團隊列表表格：
  - 團隊名稱 (name)
  - 成員數 (members)
  - 訂閱者數 (subscribers)
  - 負責人 (owner)
  - 描述 (description)
  - 創建時間 (createdAt)
  - 操作 (action)：編輯、刪除按鈕

## 14. 角色管理頁面 (RoleManagementPage)

### 14.1 彈窗
- 新增角色彈窗：
  - 表單欄位：角色名稱
  - 權限設定區域：Tree 組件顯示權限樹
  - 底部按鈕：取消、建立角色

### 14.2 按鈕
- 角色列表按鈕：
  - 新增角色按鈕：primary 按鈕帶 PlusOutlined 圖標
- 角色權限按鈕：
  - 儲存變更按鈕：primary 按鈕
- 新增角色彈窗按鈕：
  - 取消按鈕
  - 建立角色按鈕：primary 按鈕

### 14.3 工具列
- 無專屬工具列

### 14.4 表格欄位
- 無傳統表格，使用 List 組件顯示角色列表：
  - 角色名稱 (name)
  - 角色類型標籤 (isBuiltIn)：內建/自定義標籤