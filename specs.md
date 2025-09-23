# **SRE 平台前端開發規格書 (SSOT)**

版本: 3.2
最後更新: 2025-09-23

## 📋 核心契約文件參考 (SSOT)

- **[openapi.yaml](openapi.yaml)** - API 規格唯一真實來源 (v3.0.0)
- **[db_schema.sql](db_schema.sql)** - 數據庫架構唯一真實來源 (v3.0)

---

## 1. 平台概述

### 1.1 系統架構

SRE 平台採用現代化的前端技術棧，提供完整的監控、事件管理、資源管理等功能。

**技術棧**:
- **前端**: React 18 + Ant Design 5.19.1 + ECharts 5.5.0
- **狀態管理**: Redux RTK + RTK Query
- **類型檢查**: TypeScript
- **樣式系統**: CSS-in-JS + 設計標記系統

### 1.4 目錄結構規範

**前端目錄結構**:
- `src/components`: 可重用的展示型元件
- `src/features`: 功能模組相關檔案
- `src/services`: API 客戶端 (RTK Query)
- `src/store`: Redux store
- `src/layouts`: 佈局元件
- `src/pages`: 頁面級元件

**組件設計原則**:
- 容器與展示元件分離
- 單一職責原則
- 可複用性優先

### 1.5 開發規範

**國際化規範**:
- 建立語言資源檔結構 (src/locales/zh-TW.json, src/locales/en-US.json)
- 所有 UI 靜態文字都必須使用 i18n key
- 提供語言切換器

**可訪問性規範**:
- 所有互動元件都必須可以透過 Tab 鍵聚焦
- 為非語意化元件提供正確的 ARIA 角色和屬性
- 為常用操作提供快捷鍵 (如 Ctrl+K 搜尋)

**效能優化規範**:
- 所有網路請求操作都必須有明確的 loading 狀態指示器
- 複雜表單應實作自動儲存草稿至 sessionStorage
- 所有大量數據列表都必須實作後端分頁

### 1.2 基礎設施 API 端點

**健康檢查端點**:
- `GET /api/v1/healthz` - 應用程式健康檢查
- `GET /api/v1/readyz` - 應用程式就緒檢查

**指標端點**:
- `GET /api/v1/metrics` - 系統指標數據
- `GET /api/v1/metrics/definitions` - 指標定義列表
- `POST /api/v1/metrics/query` - 多資源指標時序查詢

> **注意**：這些端點主要由監控系統調用，前端通常不會直接使用。

### 1.3 術語標準化

為了確保文檔的一致性，定義以下核心術語：

| 英文術語 | 標準中文譯名 | 說明 |
|:---|:---|:---|
| **Alert** | **告警** | 監控系統自動觸發的原始信號 |
| **Incident** | **事件** | 由告警觸發或人工建立的處理工單 |
| Resource | 資源 | 監控對象，如伺服器、服務 |
| Group | 群組 | 資源的邏輯分組 |
| Silence | 靜音規則 | 抑制告警/事件通知的規則 |

---

## 2. 登入與基本功能

**檔案對應**
- **前端實現**: `/frontend/src/pages/LoginPage.tsx` ✅ 已實現
- **路由配置**: `/frontend/src/config/routes.ts`

**界面元素**

- **平台標題**: `SRE Platform`
- **登入表單**:
  - 用戶名輸入框 (Input, name="username", 必填, placeholder="輸入用戶名")
  - 密碼輸入框 (Input.Password, name="password", 必填, placeholder="輸入密碼", 支援密碼顯示/隱藏切換)
  - 登入按鈕 (Button, type="primary", 載入狀態支援)

**主要功能**
1. **身份驗證**: 支援用戶名密碼登入
2. **錯誤處理**: 顯示登入失敗原因和提示訊息
3. **載入狀態**: 登入過程中顯示載入指示器
4. **安全提醒**: 密碼輸入框支援密碼強度提示

**操作流程**

1. 輸入有效用戶名和密碼
2. 點擊登入按鈕進入主系統
3. 若憑證錯誤，顯示具體錯誤提示訊息
4. 登入成功後跳轉至主頁面

---

### 1.2 使用者選單

#### 彈窗概述
用戶下拉選單提供個人資訊查看和系統操作功能。

**檔案對應**
- **前端實現**: `/frontend/src/components/UserMenu.tsx`
- **路由配置**: `/frontend/src/config/routes.ts`

**界面元素**

- **用戶資訊區**:
  - 用戶頭像 (Avatar, 顯示用戶照片或首字母)
  - 用戶名稱 (顯示真實姓名)
  - 角色 (Badge, 顯示用戶角色標籤)
- **選單項目**:
  - 個人資料 (跳轉至個人設定頁面的個人資訊標籤)
  - 通知中心 (打開通知中心彈窗)
  - 登出 (執行登出操作)

**主要功能**
1. **個人資訊展示**: 顯示用戶基本資訊和角色
2. **快速導航**: 提供常用功能的快速入口
3. **狀態指示**: 通過徽章顯示用戶狀態
4. **安全退出**: 安全的登出功能

**操作流程**

1. 點擊右上角用戶頭像下拉箭頭
2. 選擇所需功能項目
3. 執行相應操作或跳轉頁面

---

### 1.3 全局搜索欄

#### 頁面概述
全局搜索欄位於系統頂部工具列，提供跨模塊的統一搜索功能，支援資源、事件、腳本等多種類型的搜索。

**檔案對應**
- **前端實現**: `/frontend/src/components/GlobalSearch.tsx` ✅ 已實現
- **組件依賴**: `/frontend/src/layouts/AppLayout.tsx` ✅ 已整合

**界面元素**

- **搜索輸入框** (Input, prefix="SearchOutlined", placeholder="Search... (Ctrl+K)", readOnly, width="250"):
  - 搜索圖示 (SearchOutlined)
  - 占位提示文字 "Search... (Ctrl+K)"
  - 點擊觸發搜索模態框
- **全局搜索模態框** (Modal, width="600", top="50"):
  - 搜索輸入框 (Input, size="large", placeholder="搜尋資源、事件、腳本...", prefix="SearchOutlined")
  - 搜索結果列表 (List):
    - 資源類型分組 (List.Item.Group)
    - 事件類型分組 (List.Item.Group)
    - 自動化腳本類型分組 (List.Item.Group)
  - 結果項目支援點擊跳轉至對應頁面

**主要功能**
1. **多類型搜索**: 支援資源、事件、腳本的統一搜索
2. **實時過濾**: 輸入時即時過濾匹配結果
3. **快速導航**: 點擊結果可快速跳轉至相關頁面
4. **鍵盤快捷鍵**: 支援 Ctrl+K 快捷鍵打開搜索
5. **跨模塊搜索**: 搜索範圍涵蓋全平台所有功能模塊

**注意事項**
- 此全局搜索功能與各頁面工具列中的"搜索篩選按鈕"功能不同
- 全局搜索提供快速跳轉和全平台搜索功能
- 各頁面工具列的搜索篩選提供該頁面內的詳細篩選功能

**操作流程**

1. 點擊頂部搜索框或按 Ctrl+K 快捷鍵
2. 在搜索模態框中輸入關鍵字
3. 瀏覽按類型分組的搜索結果
4. 選擇匹配的結果項目
5. 點擊跳轉至詳細頁面

---

### 1.4 通知中心

#### 彈窗概述
通知中心提供系統通知和警報的集中管理，支援多種通知類型、實時狀態更新和快速操作。

**檔案對應**
- **前端實現**: `/frontend/src/components/NotificationCenter.tsx`
- **組件依賴**: `/frontend/src/layouts/AppLayout.tsx`

**主要功能**

1. **多類型通知支援**: 錯誤、警告、系統、成功四種通知類型
2. **讀取狀態管理**: 未讀通知自動標記為已讀，支援批量標為已讀
3. **嚴重程度標示**: 根據通知嚴重程度顯示不同顏色和圖示
4. **快速導航**: 點擊通知可跳轉至相關頁面或執行相關操作
5. **實時更新**: 通知中心內容會根據系統狀態實時更新

**界面元素**

- **通知列表** (List):
  - **通知類型圖示** (Avatar, 根據通知類型和嚴重程度顯示不同圖示和顏色)
    - 錯誤通知: ExclamationCircleOutlined (紅色)
    - 警告通知: AlertOutlined (橙色)
    - 系統通知: InfoCircleOutlined (藍色)
    - 成功通知: CheckCircleOutlined (綠色)
  - **通知標題** (dataIndex: 'title', 通知的主要內容，粗體顯示未讀)
  - **通知描述** (dataIndex: 'description', 通知的詳細說明)
  - **通知時間** (dataIndex: 'time', 相對時間顯示，如 "5分鐘前")
  - **通知狀態** (Badge, 未讀通知顯示紅色圓點標記)
  - **嚴重程度標籤** (Tag, Critical/Warning/Info/Success, 不同顏色標示)
  - **點擊操作** (支援點擊標記為已讀並跳轉相關頁面)
- **操作按鈕**:
  - **全部標為已讀** (Button, 標記所有通知為已讀狀態)
  - **查看詳情** (Button, 展開查看通知中心詳細內容)
  - **清除通知** (Button, 清除所有已讀通知)
  - **未讀數量標記** (Badge, 顯示未讀通知數量，紅色圓點)

---

## 2. 事件管理

#### 頁面概述  
集中管理事件、定義規則並設定靜音，建立完整的事件管理流程。

**頁籤子頁面**

1.  事件列表 (EventListPage)
2.  事件規則 (EventRulePage)
3.  靜音規則 (SilentRulePage)

**指標概覽卡片**

1.  活躍事件 (5件, 2件嚴重, 3件處理中)
2.  今日已解決 (12件, 7件自動解決, +8%)
3.  平均解決時間 (2.5小時, -15%)
4.  自動化處理率 (35.2%, 今日 4件自動解決)

---

### 2.1 事件列表頁面

#### 頁面概述  
事件列表頁面是 SRE 平台的中央事件監控中心，提供事件篩選、搜索、狀態查看和快速操作功能。

**檔案對應**
- **前端實現**: `/frontend/src/pages/IncidentsPage.tsx`
- **路由配置**: `/frontend/src/config/routes.ts`
- **組件依賴**:
  - `/frontend/src/components/ToolbarActions.tsx`
  - `/frontend/src/components/ContextualKPICard.tsx`

**界面元素**

- **頁面標題**: "事件列表"
- **工具列** (ToolbarActions):
  - 刷新按鈕 (ReloadOutlined, 重新載入)
  - 搜索篩選按鈕 (SearchOutlined, 統一的搜索和篩選入口)
  - 匯出按鈕 (DownloadOutlined, 匯出資料)
  - 批量操作按鈕 (Batch操作)
  - AI 分析按鈕 (觸發智能分析建議)
- **事件表格** (Table):
  - 事件 ID (dataIndex: 'event_id', 支援排序和搜索)
  - 摘要 (dataIndex: 'summary', 支援點擊查看詳情)
  - 資源名稱 (dataIndex: 'resource_name', 支援篩選)
  - 服務影響 (dataIndex: 'service_impact', 顯示影響等級)
  - 規則名稱 (dataIndex: 'rule_name', 觸發規則)
  - 觸發閾值 (dataIndex: 'trigger_threshold', 觸發條件)
  - 狀態 (dataIndex: 'status', 支援狀態變更)
  - 處理人 (dataIndex: 'assignee', 支援人員分配)
  - 觸發時間 (dataIndex: 'trigger_time', 支援時間排序)
  - 操作按鈕:
    - 查看詳情（打開事件詳情彈窗）
    - 編輯
    - 刪除
  - 批量操作
    - 靜音（快速進入靜音規則建立流程）

**主要功能**

1. **統一搜索篩選**: 整合事件搜索和篩選功能，提供統一的查詢入口
2. **狀態管理**: 快速更新事件狀態
3. **批量操作**: 選擇多個事件進行批量處理
4. **實時刷新**: 自動刷新最新事件狀態
5. **智能查詢**: 支援模糊搜索、條件篩選、時間範圍等多維度查詢

#### **統一搜索篩選功能詳情**

**搜索篩選彈窗** 提供以下查詢方式：

**1. 文本搜索**
- 事件 ID 搜索
- 事件摘要搜索
- 資源名稱搜索
- 描述內容搜索
- 支援模糊匹配和完全匹配

**2. 條件篩選**
- **狀態篩選**: new/ack/resolved/silence
- **嚴重程度篩選**: critical/warning/info
- **資源類型篩選**: server/database/cache/gateway/service
- **處理人篩選**: 按負責人篩選事件
- **時間範圍篩選**: 支援自定義時間範圍和快速選擇

**3. 組合查詢**
- 支援多條件 AND/OR 邏輯
- 支援一鍵清除所有篩選條件

**4. 查詢結果**
- 顯示匹配的事件數量
- 支援分頁查看
- 支援將查詢結果匯出為 CSV

**設計優點**
1. **統一入口**: 用戶不需要區分搜索和篩選
2. **靈活查詢**: 支援多種查詢方式的組合
3. **用戶友好**: 直觀的界面設計，降低學習成本
4. **高效率**: 快速查詢和過濾大量事件數據

#### **建立靜音彈窗**

靜音功能可暫時抑制指定事件的通知，避免重複干擾。

**進入方式**
- 使用者於事件列表頁操作列中點擊「靜音」按鈕，開啟建立靜音彈窗。

**彈窗內容**
- 事件資訊：摘要、資源、嚴重性。
- 靜音設定：
  - 可選擇靜音持續時間：1 / 2 / 4 / 8 / 12 / 24 小時。
  - 即時顯示靜音解除時間。
- 提示說明：
  - 彈窗下方提示使用者，可至「靜音」頁面檢視、延長或管理靜音。
- 操作按鈕：
  - 建立靜音 (藍色主按鈕)。
  - 取消 (次要按鈕)。

#### **事件詳情彈窗**

事件詳情以彈窗（抽屜/Modal）方式呈現，內容分為四個分頁（Tabs）：

1. **基本資訊**
2. **處理歷史**
3. **關聯事件**
4. **自動化**

**彈窗操作區：**
- 關閉
- 確認收到 (Ack)
- AI 分析

#### **AI 事件分析報告彈窗**
- 進入方式：在事件詳情彈窗的操作區，點擊「AI 分析」按鈕後開啟獨立彈窗。
- 顯示內容：
  - 分析事件 (名稱、嚴重性)。
  - 根本原因分析 (RCA, 含置信度百分比)。
  - 影響範圍評估：描述對使用者、系統的影響。
  - 建議操作：
    - 支援操作按鈕，例如重啟、回滾、查看日誌、擴展資源。
    - 不同操作可標註優先級 (如「緊急」)。

---

### 2.2 事件規則頁面

#### 頁面概述  
事件規則頁面管理自動化事件檢測和觸發規則。

**界面元素**

- **頁面標題**: "事件規則"
- **搜索篩選按鈕** (SearchOutlined, 統一的搜索和篩選入口)
- **規則列表表格** (Table):
  - 啟用開關 (dataIndex: 'enabled', 支援切換狀態)
  - 規則名稱 (dataIndex: 'rule_name', 支援排序)
  - 監控對象 (dataIndex: 'target', 監控目標)
  - 觸發條件 (dataIndex: 'conditions', 觸發邏輯)
  - 嚴重程度 (dataIndex: 'severity', critical/warning/info)
  - 自動化 (dataIndex: 'automation_enabled', 是否啟用自動化)
  - 創建者 (dataIndex: 'creator', 規則創建者)
  - 最後更新 (dataIndex: 'last_updated', 更新時間)
  - 操作按鈕 (編輯/刪除/複製/測試)
- **工具列** (ToolbarActions):
  - 刷新按鈕 (ReloadOutlined, 重新載入)
  - 篩選按鈕 (FilterOutlined, 資料篩選)
  - 匯出按鈕 (DownloadOutlined, 匯出資料)
  - 批量操作按鈕 (Batch操作)
  - 新增規則按鈕 (PlusOutlined, 新增事件規則)

**主要功能**
1. **規則管理**: 創建、編輯、刪除事件規則
2. **狀態控制**: 啟用/禁用規則
3. **規則測試**: 驗證規則有效性

### 事件規則編輯 (Incident Rule Editing)

事件規則編輯採用四步驟精靈 (Wizard) 彈窗，分為基本資訊、觸發條件、事件內容、與自動化。以下為完整規格：

**步驟 1：基本資訊**
- 提供快速套用範本 (CPU 使用率過高、記憶體使用率過高、磁碟空間不足、資料庫延遲、API 延遲)。
- 表單欄位：
  - 規則名稱 (必填，Input)。
  - 描述 (TextArea)。
- 監控資源標籤：
  - Tag 選擇器，可新增/刪除多個標籤 (例：`env: production`, `app: web`)。
  - 下拉式選單 (Select) 提供環境選項 (production / staging / development)。
  - 點擊「新增」將標籤加入。

**步驟 2：觸發條件**
- 支援多個條件群組。
  - 群組間支援 OR，群組內條件支援 AND。
- 條件欄位：
  - 指標下拉選單 (CPU 使用率%、記憶體使用率%、資料庫複製延遲等)。
  - 運算子 (>, <, ≥, ≤)。
  - 閾值 (數字 Input)。
  - 持續時間 (分鐘)。
  - 嚴重性等級 (INFO, WARNING, CRITICAL)。
- 操作：
  - 新增 AND 條件。
  - 新增 OR 條件群組。
  - 刪除條件。

**步驟 3：事件內容與通知**
- 事件標題模板：
  - 支援變數插入 (例：`{{resource.name}} - {{metric.name}} 異常`)。
- 事件內容模板：
  - 可輸入描述並插入變數 (資源名稱、指標名稱、數值、閾值、持續時間、嚴重性、時間戳)。
  - 範例：
    ```
    {{resource.name}} 的 {{metric.name}} 已持續 {{duration}} 分鐘超過閾值 {{threshold}}，
    目前數值為 {{metric.value}}！
    ```
- 可用變數清單顯示在表單下方，點擊即可插入。

**步驟 4：自動化**
- 可啟用/停用自動化響應 (Checkbox)。
- 選擇腳本 (Select)，如 `Auto-scaling for Web Servers`。
- 腳本參數 (Input)，例如實例數量 = 3。
- 操作：
  - 上一步：返回確認設定。
  - 完成：儲存規則。

**共通 UI 特性**
- 步驟導覽條 (Steps)：顯示進度並標記已完成步驟。
- 表單驗證：
  - 必填欄位標註「*」。
  - 未填寫會出現提示訊息。
- 底部操作按鈕：取消、上一步、下一步 / 完成。

**狀態管理**
- 使用者可於精靈最終步驟切換「啟用」或「停用」規則（`Switch`，預設為啟用）。
- 模式差異：
  - **新增模式**：允許輸入所有欄位，規則名稱欄位啟用。
  - **編輯模式**：規則名稱欄位以 `Input` 呈現但為 disabled 狀態（不可編輯），其餘欄位可更新。
- **操作提示**：
  - 儲存時若未啟用規則，顯示灰色提示：「規則已建立但未啟用，需手動啟用才會生效」。
  - 若啟用規則時有必填欄位未填寫，將阻止儲存並顯示驗證訊息。

---

### 2.3 靜音規則頁面

#### 頁面概述  
靜音規則頁面管理事件通知的靜音配置，避免重複警報。

**檔案對應**
- **前端實現**: `/frontend/src/pages/SilenceRulePage.tsx` ✅ 已實現
- **路由配置**: `/frontend/src/config/routes.ts` (路徑: `/incidents/silence`)

**界面元素**

- **頁面標題**: "靜音規則"
- **搜索篩選按鈕** (SearchOutlined, 統一的搜索和篩選入口)
- **靜音規則表格** (Table):
  - 啟用開關 (dataIndex: 'enabled', 支援切換狀態)
  - 規則名稱 (dataIndex: 'name', 支援排序)
  - 靜音類型 (dataIndex: 'silence_type', single/repeat/condition)
  - 靜音條件 (dataIndex: 'matchers', 匹配條件)
  - 靜音期間 (dataIndex: 'time_range', 時間範圍)
  - 靜音範圍 (dataIndex: 'scope', 全域/特定資源/特定團隊)
  - 創建者 (dataIndex: 'creator', 規則創建者)
  - 創建時間 (dataIndex: 'created_at', 支援排序)
  - 操作按鈕 (編輯/刪除/複製/立即啟用)

#### 靜音規則編輯彈窗

編輯靜音規則採用三步驟精靈：

**步驟 1：基本資訊**
- 可選擇快速套用範本 (週末維護窗口、月底批次作業、每日深夜維護)。
- 表單欄位：
  - 規則名稱 (必填)。
  - 描述 (選填)。

**步驟 2：設定排程**
- 靜音類型：
  - 單次靜音。
  - 週期性靜音。
- 週期性選項：
  - 重複模式：每日 / 每週 / 每月。
  - 執行日期：指定日期、星期、或每月最後一天。
  - 靜音時段：開始與結束時間。
  - 持續時間：小時數。
- 有效期限：
  - 永久有效。
  - 截止到指定日期。
  - 執行特定次數。

**步驟 3：設定範圍**
- 定義靜音範圍與條件：
  - 資源群組 (下拉選單)。
  - 資源標籤 (下拉選單)。
  - 支援新增多條件。
- 選項：
  - 立即啟用此靜音規則 (勾選)。
  - 靜音開始/結束時發送通知 (勾選)。

#### 共通操作
- 彈窗頂部顯示步驟導覽 (基本資訊 → 設定排程 → 設定範圍)。
- 底部操作按鈕：
  - 上一步。
  - 下一步 / 儲存規則。
  - 取消。

---

## 3. 資源管理

**頁面概述**
探索、組織與管理您的所有基礎設施資源。

**頁籤子頁面**
1. 資源列表 (ResourceListPage)
2. 資源群組 (ResourceGroupPage)
3. 拓撲視圖 (TopologyViewPage)

**指標概覽卡片**
1. 總資源數 (374個, 涵蓋所有業務系統)
2. 健康資源 (326個, 正常運行中)
3. 告警資源 (35個, 需要關注)
4. 資源群組 (12組, 業務邏輯分組)

---

### 3.1 資源列表頁面

**頁面概述**
資源列表頁面提供基礎設施資源的集中管理界面，顯示所有監控資源的健康狀態和性能指標。

**檔案對應**
- **前端實現**: `/frontend/src/pages/ResourcesPage.tsx`
- **路由配置**: `/frontend/src/config/routes.ts`
- **組件依賴**:
  - `/frontend/src/components/ToolbarActions.tsx`
  - `/frontend/src/components/ContextualKPICard.tsx`

**界面元素**

- **頁面標題**: "資源列表"
- **工具列** (ToolbarActions):
  - 刷新按鈕 (ReloadOutlined, 重新整理資源列表)
  - 搜索篩選按鈕 (SearchOutlined, 統一的搜索和篩選入口)
  - 掃描網路按鈕 (SearchOutlined, 掃描網路)
  - 匯出按鈕 (DownloadOutlined, 匯出資源列表)
  - 新增資源按鈕 (PlusOutlined, 新增資源)
- **資源表格** (Table):
  - 資源狀態 (dataIndex: 'status', 健康/警告/異常)
  - 資源名稱 (dataIndex: 'name', 支援排序和搜索)
  - IP 位址 (dataIndex: 'ip_address', 支援排序)
  - 位置 (dataIndex: 'location', 地理位置)
  - 類型 (dataIndex: 'type', Server/Database/Cache/Gateway/Service)
  - 作業系統 (dataIndex: 'os', 系統版本)
  - CPU 使用率 (dataIndex: 'cpu', 百分比顯示)
  - 記憶體使用率 (dataIndex: 'memory', 百分比顯示)
  - 磁碟使用率 (dataIndex: 'disk', 百分比顯示)
  - 網路流量 (dataIndex: 'network', 輸入/輸出流量)
  - 最後更新 (dataIndex: 'updated_at', 時間戳記)
  - 操作按鈕 (編輯/刪除/查看日誌/重新啟動)

**主要功能**
1. **資源監控**: 實時顯示資源性能指標
2. **健康檢查**: 自動檢測資源異常
3. **群組管理**: 將資源分組管理
4. **快速操作**: 重新啟動、查看日誌等

#### 資源列表頁
表格欄位：
- 資源狀態：正常 / 警告 / 嚴重，以顏色標籤顯示。
- 資源名稱
  - IP 位址
- 位置 (Region, Zone)
  - 所屬團隊
- 資源類型 (Server, Database, Cache, Gateway, Service)
- 標籤 (Tag 列表，如 production, web-server)
- 關聯事件：顯示數量並可點擊
- 指標：CPU 使用率、記憶體使用率，以進度條或百分比顯示
- 操作：查看詳情、編輯、刪除、重新整理

操作功能：
- 搜尋：資源名稱 / IP / 標籤
- 篩選：依狀態、類型、標籤
- 批次操作：匯出、匯入、重新整理
- 新增資源：開啟編輯資源彈窗

---

#### **編輯資源彈窗**
表單欄位：
- 資源名稱 (必填)
- IP 位址 (必填)
- 類型 (下拉選單：Server, Database, Cache, Gateway, Service)
- 所屬群組 (多選框)
- 標籤：可新增多個標籤
- 環境：下拉選單 (production, staging, development)，可新增

---

### 3.2 資源群組頁面

**頁面概述**
資源群組頁面提供邏輯分組的資源管理功能，便於批量操作和整體監控。

**界面元素**

- **頁面標題**: "資源群組"
- **工具列** (ToolbarActions):
  - 刷新按鈕 (ReloadOutlined, 重新整理)
  - 篩選按鈕 (FilterOutlined, 資料篩選)
  - 匯出按鈕 (DownloadOutlined, 匯出群組列表)
  - 批量操作按鈕 (Batch操作)
  - 新增群組按鈕 (PlusOutlined, 新增資源群組)
- **群組列表** (Table):
  - 群組名稱 (dataIndex: 'name', 支援排序和搜索)
  - 成員數 (dataIndex: 'members', 資源數量)
  - 訂閱者數 (dataIndex: 'subscribers', 關注者數量)
  - 負責人 (dataIndex: 'owner', 群組管理員)
  - 描述 (dataIndex: 'description', 群組說明)
  - 創建時間 (dataIndex: 'created_at', 支援排序)
  - 操作按鈕 (編輯/刪除/查看詳情/新增資源)

#### **資源群組頁**
表格欄位：
- 群組名稱
- 描述
- 負責團隊
- 成員數量
- 狀態：Healthy, Warning, Critical，並顯示數量
- 操作：編輯、刪除

操作功能：
- 搜尋與篩選群組
- 新增群組：開啟編輯群組彈窗

---

#### **編輯群組彈窗**
表單欄位：
- 群組名稱 (必填)
- 描述
- 負責團隊 (下拉選單)
- 群組資源：雙欄式選擇器，可將資源從可用列表分配到群組

---

### 3.3 拓撲視圖頁面

**頁面概述**
拓撲視圖提供基礎設施資源的視覺化展示，顯示資源之間的依賴關係和連接狀況。

**界面元素**

- **頁面標題**: "拓撲視圖"

**工具列** (ToolbarActions):
- 刷新按鈕 (ReloadOutlined, 重新載入拓撲數據)
- 縮放控制按鈕 (ZoomInOutlined/ZoomOutOutlined, 放大/縮小拓撲圖)
- 布局切換按鈕 (LayoutOutlined, 切換布局模式)
- 匯出按鈕 (DownloadOutlined, 匯出拓撲圖)
- 設定按鈕 (SettingOutlined, 拓撲圖設定)

**視圖控制面板**:
- **縮放控制** (Slider, 縮放級別控制)
- **布局切換** (Select, 選擇布局算法)
  - 力導向布局 (Force-directed)
  - 環形布局 (Circular)
  - 層次布局 (Hierarchical)
  - 網格布局 (Grid)
- **過濾器** (TreeSelect, 多層次資源篩選)
  - 資源類型篩選 (伺服器、資料庫、容器等)
  - 資源群組篩選 (支援多選)
  - 標籤篩選 (支援多標籤篩選)
  - 狀態篩選 (正常/警告/異常)

**拓撲圖** (ECharts Graph):
- **資源節點** (Node):
  - 伺服器節點 (dataIndex: 'server', 伺服器圖示)
  - 資料庫節點 (dataIndex: 'database', 資料庫圖示)
  - 服務節點 (dataIndex: 'service', 服務圖示)
  - 快取節點 (dataIndex: 'cache', 快取圖示)
  - 網關節點 (dataIndex: 'gateway', 網關圖示)
- **連接線** (Edge):
  - 依賴關係線 (dataIndex: 'dependency', 顯示依賴方向)
  - 流量線 (dataIndex: 'traffic', 粗細表示流量大小)
  - 狀態線 (dataIndex: 'status', 顏色表示連接狀態)
- **狀態指示器** (Node Label):
  - 顏色標示健康狀態 (綠色=正常, 黃色=警告, 紅色=異常)
  - 資源名稱顯示 (dataIndex: 'name')
  - 資源類型圖示 (dataIndex: 'icon')

**互動操作**:
- 節點點擊：查看資源詳細資訊
- 節點拖曳：重新排列拓撲結構
- 滑鼠懸停：顯示資源詳細狀態
- 連接線點擊：查看連接詳情
- 右鍵選單：資源操作選單

**操作按鈕**:
- **篩選顯示資源類型** (Button, 快速篩選按鈕)
- **更新拓撲** (Button, 重新載入拓撲數據)
- **全屏檢視** (Button, 進入全屏模式)
- **重置布局** (Button, 恢復預設布局)

---

#### **編輯資源彈窗**
表單欄位：
- 資源名稱* (Input)
- IP 位址* (Input)
- 類型 (Select：Server / Database / Cache / Gateway / Service)
- 所屬群組 (多選 Select)
- 標籤 (Tag Picker)
- 環境 (Select：Production / Staging / Development)

**互動規則**
- 名稱與 IP 為必填
- 編輯模式下名稱不可修改
- 即時驗證 IP 格式

---

#### **編輯群組彈窗**
表單欄位：
- 群組名稱* (Input)
- 描述 (TextArea)
- 負責團隊 (Select)
- 資源分配 (雙欄 Transfer 控制器)

**互動規則**
- 名稱必填
- 新增模式可編輯所有欄位
- 編輯模式群組名稱不可修改

---

## 4. 儀表板管理

**頁面概述**
統一的系統監控與業務洞察儀表板入口，支援任一儀表板作為預設首頁。

#### 儀表板類型說明

SRE 平台支援兩種不同類型的儀表板：

**1. 內建儀表板 (Built-in Dashboards)**
- **技術實現**: 使用 React 組件實現，完全集成在平台內部
- **特色功能**:
  - 完整的互動性操作
  - 即時數據更新和動態圖表
  - 與平台其他功能的深度整合
  - 支援自訂佈局和組件配置
- **代表頁面**:
  - SRE 戰情室儀表板 (`/frontend/src/pages/SREWarRoomPage.tsx`)
  - 基礎設施洞察儀表板 (`/frontend/src/pages/SREInfrastructureInsightPage.tsx`)
- **使用場景**: 需要高度互動性和即時數據更新的監控場景

**2. Grafana 儀表板 (Grafana Dashboards)**
- **技術實現**: 通過 iframe 嵌入現有的 Grafana 儀表板
- **特色功能**:
  - 利用 Grafana 豐富的視覺化組件
  - 支援 Grafana 的完整功能集
  - 時間範圍選擇和儀表板控制
  - 深色/淺色主題切換
  - 即時面板自動調整
- **代表組件**:
  - GrafanaDashboard 組件 (`/frontend/src/components/GrafanaDashboard.tsx`)
  - DashboardViewPage 頁面 (`/frontend/src/pages/DashboardViewPage.tsx`)
- **使用場景**: 利用現有 Grafana 儀表板的組織或需要 Grafana 特有功能時

**兩種儀表板的整合**
- 在儀表板列表中，點擊儀表板名稱會根據類型自動導航：
  - 內建儀表板 → 直接跳轉到對應的 React 頁面
  - Grafana 儀表板 → 跳轉到 DashboardViewPage 並嵌入 Grafana 儀表板
- 支援將任一類型的儀表板設定為預設首頁
- 統一的權限管理和訪問統計

**頁籤子頁面**
1. 儀表板列表 (DashboardPage)
2. SRE 戰情室儀表板 (SREWarRoomPage)
3. 基礎設施洞察儀表板 (SREInfrastructureInsightPage)

**指標概覽卡片**
1. 總儀表板數 (25, 包含內建儀表板和 Grafana 儀表板, +4)
2. 活躍用戶 (156, 本月訪問儀表板的用戶, +12.5%)
3. SRE 戰情室 (4, 高優先級監控室, 內建儀表板, stable)
4. 基礎設施洞察 (10, 專注於基礎設施監控的儀表板, +2)

**分類按鈕**
- 全部 (25個儀表板)
- 基礎設施洞察 (2個儀表板)
  - 內建儀表板: 1個
  - Grafana 儀表板: 1個
- 業務與 SLA 指標 (2個儀表板)
  - 內建儀表板: 1個
  - Grafana 儀表板: 1個
- 營運與容量 (2個儀表板)
  - 內建儀表板: 1個
  - Grafana 儀表板: 1個
- 自動化與效率 (1個儀表板)
- 團隊自訂 (1個儀表板)

---

### 4.1 儀表板列表頁面

**頁面概述**
儀表板管理頁面提供監控儀表板的統一管理界面，支援多種類型儀表板的創建、發布和權限管理。

**檔案對應**
- **前端實現**: `/frontend/src/pages/DashboardPage.tsx`
- **路由配置**: `/frontend/src/config/routes.ts`
- **組件依賴**:
  - `/frontend/src/components/ToolbarActions.tsx`
  - `/frontend/src/components/ContextualKPICard.tsx`
  - `/frontend/src/components/CategoryFilter.tsx`
  - `/frontend/src/components/GrafanaDashboard.tsx`
  - `/frontend/src/hooks/useCategories.ts`

**相關頁面**:
  - `/frontend/src/pages/DashboardViewPage.tsx` (Grafana 儀表板顯示頁面)

**界面元素**
- **頁面標題**: "儀表板管理"

**KPI 統計卡片** (ContextualKPICard):
- **總儀表板數** (25, 來源 `GET /dashboards/summary.total`)
  - 內建儀表板: 15個（`built_in` 欄位）
  - Grafana 儀表板: 10個（`grafana` 欄位）
- **活躍用戶** (156, 本月訪問儀表板的用戶)
- **SRE 戰情室** (4, 高優先級監控室, 內建儀表板)
- **基礎設施洞察** (10, 專注於基礎設施監控的儀表板)
  - 內建儀表板: 8個
  - Grafana 儀表板: 2個

**頁面佈局**
- **標題區域**:
  - 頁面標題和副標題
  - 搜尋框 (右側對齊)
  - 新增儀表板按鈕 (右側對齊)
- **分類按鈕** (ToolbarActions):
  - 全部
  - 基礎設施洞察
  - 業務與 SLA 指標 (1個儀表板)
  - 營運與容量 (1個儀表板)
  - 自動化與效率 (1個儀表板)
  - 團隊自訂 (1個儀表板)
- **工具列** (ToolbarActions):
  - 欄位設定按鈕 (SettingOutlined, 表格欄位顯示設定)
- **儀表板列表** (Table):
- **名稱** (dataIndex: 'name', 儀表板名稱, 支援排序和搜索)
    - 左側顯示類型圖示：
      - 內建儀表板 → 平台 Logo Icon (`<PlatformLogoIcon />` 或 `DashboardOutlined`)、Tooltip 文案「內建儀表板」。
      - Grafana 儀表板 → Grafana SVG Icon、Tooltip 文案「Grafana 儀表板」。
    - 支援點擊跳轉至對應儀表板頁面。
      - 內建儀表板: 直接跳轉到 React 頁面，例如 `/warroom`、`/infrastructure`。
      - Grafana 儀表板: 導向 `/dashboard/:dashboardId`，在 DashboardViewPage 以 `<iframe>` 內嵌 Grafana。
- **類型** (dataIndex: 'dashboard_type', 使用統一 `Tag` 元件顯示)
    - 內建儀表板 → `Tag` 顏色 `cyan`，文字「內建」。
    - Grafana 儀表板 → `Tag` 顏色 `geekblue`，文字「Grafana」。
    - 支援依 `dashboard_type` 篩選，對應 API 查詢參數 `dashboard_type`。
- **類別** (dataIndex: 'category', 儀表板分類標籤)
- **擁有者** (dataIndex: 'owner', 儀表板創建者和負責人)
- **更新時間** (dataIndex: 'updated_at', 最後更新時間)
- **操作** (操作按鈕列，依類型差異化顯示)
  - 共用：`⭐ 設定為首頁`、`📤 分享`、`🗑️ 刪除` 會顯示在更多操作選單中。
  - 內建儀表板：
    - `✏️ 編輯版面` → 開啟內建小工具編輯器。
    - `⚙️ 設定` → 開啟儀表板基本資訊設定抽屜。
  - Grafana 儀表板：
    - `↗️ 在 Grafana 中編輯` → 以新分頁開啟 `grafana_url`，帶入 `grafana_dashboard_uid`。
    - `⚙️ 設定` → 編輯本平台內的顯示名稱、分類、別名。

**預設儀表板項目**
- **基礎設施洞察** (基礎設施洞察類別, 內建儀表板):
  - 描述: "整合多雲與多中心資源健康狀態"
  - 擁有者: "SRE 平台團隊"
  - 最後更新: "2025/09/18 16:30"
  - 訪問路徑: `/infrastructure`
- **SRE 戰情室** (業務與 SLA 指標類別, 內建儀表板):
  - 描述: "跨團隊即時戰情看板，聚焦重大事件與 SLA 指標"
  - 擁有者: "事件指揮中心"
  - 最後更新: "2025/09/18 17:15"
  - 訪問路徑: `/warroom`
- **API 服務狀態** (業務與 SLA 指標類別, Grafana 儀表板):
  - 描述: "API 響應時間、錯誤率、吞吐量等服務指標"
  - 擁有者: "SRE 平台團隊"
  - 最後更新: "2025/09/18 16:45"
  - 訪問路徑: `/dashboard/API服務狀態`
  - Grafana URL: `http://localhost:3000/d/aead3d54-423b-4a91-b91c-dbdf40d7fff5`
- **用戶體驗監控** (營運與容量類別, Grafana 儀表板):
  - 描述: "頁面載入時間、用戶行為分析、錯誤追蹤"
  - 擁有者: "前端團隊"
  - 最後更新: "2025/09/18 17:00"
  - 訪問路徑: `/dashboard/用戶體驗監控`


**新增儀表板流程**
1. 點擊 `+ 新增儀表板` 按鈕，彈出「選擇儀表板類型」對話框。
2. 對話框選項：
   - `建立內建儀表板`：說明文案「使用平台提供的小工具，拖拽組合出新的儀表板。」
   - `連結外部 Grafana 儀表板`：說明文案「貼上 Grafana URL 或 UID，統一在平台內管理。」
3. 選擇「建立內建」→ 導向內建拖拽編輯器，預載 KPI Widget 清單。
4. 選擇「連結 Grafana」→ 顯示表單（欄位：`grafana_dashboard_uid`, `grafana_folder_uid`, `grafana_url`）。提交後呼叫 `POST /dashboards` 並帶入 `dashboard_type=grafana`。

**儀表板檢視體驗**
- 內建儀表板：
  - 於本平台路由中渲染專屬 React 元件與小工具布局。
  - 支援平台原生的篩選器、時間區間控制與即時互動。
- Grafana 儀表板：
  - `/dashboard/:dashboardId` 頁面載入 `<iframe>` 指向 `/dashboards/{dashboard_id}/grafana-url` 回傳的 `embed_url`。
  - 頂部控制列與 `<iframe>` 透過 `postMessage` 溝通，更新時間範圍、變數；或以 URL 參數追加 `from`、`to`、`var-*`。
  - 若使用者點擊 `↗️ 在 Grafana 中編輯`，以新分頁開啟 Grafana 原生編輯介面。

**主要功能**
1. **儀表板管理**: 創建、編輯、刪除監控儀表板（依 `dashboard_type` 採用不同流程）
2. **分類管理**: 支援多種類型儀表板的分類組織
3. **首頁設定**: 支援任一儀表板設為預設首頁
4. **權限控制**: 設定儀表板的訪問和編輯權限
5. **發布管理**: 控制儀表板的發布狀態和範圍
6. **統計監控**: 追蹤儀表板的訪問和使用統計
7. **多類型儀表板支援**: 統一管理內建儀表板與 Grafana 儀表板，並清楚標示類型與操作差異
8. **智能導航**: 根據 `dashboard_type` 自動導航至 React 頁面或 Grafana 容器頁
9. **導航整合**: 點擊儀表板名稱直接跳轉對應頁面

**操作流程**
1. 選擇所需的分類標籤頁
2. 查看儀表板列表和統計資訊
3. 透過搜尋與 `dashboard_type` 篩選快速定位儀表板
4. 依儀表板類型使用對應操作：
   - 內建 → `✏️ 編輯版面`、`⚙️ 設定`
   - Grafana → `↗️ 在 Grafana 中編輯`、`⚙️ 設定`
5. 如需設定首頁或分享，展開更多操作選單進行。
6. 點擊儀表板名稱進入檢視頁面，遵循前述的內建/Grafana 體驗。

---

### 4.2 基礎設施洞察儀表板

**頁面概述**
基礎設施洞察儀表板提供多雲與多中心資源健康狀態整合展示，包含即時診斷與 AI 預測分析。

**界面元素**
- **頁面標題**: "基礎設施洞察儀表板"

**工具列** (ToolbarActions):
- 刷新按鈕 (ReloadOutlined, 重新整理儀表板數據)
- 時間範圍選擇器 (DateRangePicker, 選擇監控時間範圍)
- 匯出按鈕 (DownloadOutlined, 匯出儀表板報告)
- 全屏按鈕 (ExpandOutlined, 進入全屏模式)
- 設定按鈕 (SettingOutlined, 自訂儀表板配置)

**主要元件**
- **資源統計卡片** (ContextualKPICard):
  - 總資源數 (dataIndex: 'total_resources', 120個)
  - 運行中 (dataIndex: 'healthy', 115個, 95.8%)
  - 異常 (dataIndex: 'anomaly', 5個, 4.2%)
  - 離線 (dataIndex: 'offline', 0個, 0%)
- **資源健康地圖** (ECharts Heatmap):
  - 資源健康狀態熱力圖
  - 顏色區分健康/警告/異常狀態
  - 實時更新資源狀態
- **資源列表總覽** (Table):
  - 資源名稱 (dataIndex: 'name', 支援排序和搜索)
  - 類型 (dataIndex: 'type', 伺服器、容器、資料庫等)
  - 狀態 (dataIndex: 'status', 正常/警告/異常/離線, 顏色標籤)
  - CPU 使用率 (dataIndex: 'cpu_usage', 進度條顯示)
  - 記憶體使用率 (dataIndex: 'memory_usage', 進度條顯示)
  - 網路流量 (dataIndex: 'network_traffic', 輸入/輸出流量)
  - 最後檢查時間 (dataIndex: 'last_check_time', 支援排序)
  - 操作按鈕 (查看詳情/編輯/重啟)
- **AI 風險預測** (ECharts):
  - 預測未來 24 小時可能出現的問題 (Line Chart)
  - 風險等級分佈 (Pie Chart, 低/中/高風險)
  - 影響範圍估計 (Bar Chart)
- **關注資源** (List):
  - 快速訪問常用資源 (Card, 點擊快速跳轉)
  - 自訂關注清單 (Button, 管理關注資源)
  - 資源健康趨勢 (Mini Chart, 小型趨勢圖)

**主要功能**
1. **資源監控**: 即時監控資源健康狀態
2. **風險預測**: AI 預測潛在問題
3. **資源關注**: 設定關注資源清單
4. **狀態篩選**: 按狀態篩選資源
5. **詳細檢視**: 點擊資源查看詳細資訊

**操作流程**
1. 查看資源統計總覽
2. 選擇感興趣的資源類型
3. 查看 AI 預測風險
4. 設定關注資源
5. 點擊資源查看詳細狀態

---

### 4.3 SRE 戰情室儀表板

**頁面概述**
SRE 戰情室儀表板提供跨團隊即時戰情看板，聚焦重大事件與 SLA 指標，移除了工具列操作按鈕，可設定為預設首頁。

**檔案對應**
- **前端實現**: `/frontend/src/pages/SREWarRoomPage.tsx`
- **路由配置**: `/frontend/src/config/routes.ts`
- **組件依賴**:
  - `/frontend/src/components/PageHeader.tsx`
  - `/frontend/src/components/ContextualKPICard.tsx`

**界面元素**
- **頁面標題**: "SRE 戰情室"

**主要元件**
- **頂部狀態卡片** (ContextualKPICard):
  - 待處理事件 (5, 其中 2 嚴重)
  - 處理中 (3, ↓15% 較昨日)
  - 今日已解決 (12, ↑8% 較昨日)
  - AI 每日簡報 (1, 系統效能與風險預測)
- **第二排：AI 每日簡報**
  - 整體系統穩定性分析
  - 關鍵資源使用率監控
  - 異常檢測和建議操作
- **第三排：服務健康度和資源群組狀態**
  - **服務健康度總覽** (Card):
    - 檔案儲存健康度 (85% 健康, 10% 警告, 5% 嚴重)
    - API 服務健康度 (92% 健康, 8% 警告, 0% 嚴重)
    - 資料庫健康度 (88% 健康, 12% 警告, 0% 嚴重)
    - 快取服務健康度 (90% 健康, 10% 警告, 0% 嚴重)
  - **資源群組狀態總覽** (Card):
    - Web 集群狀態 (12 健康, 3 警告, 1 嚴重)
    - 資料庫集群狀態 (8 健康, 2 警告, 0 嚴重)
    - 開發環境狀態 (15 健康, 1 警告, 2 嚴重)
    - 災備系統狀態 (9 健康, 4 警告, 0 嚴重)

**主要功能**
1. **即時監控**: 系統狀態與事件總覽
2. **AI 分析**: 異常趨勢與建議
3. **快速導航**: 跳轉至資源詳情 / 日誌
4. **視覺化**: 多維度狀態展示
5. **事件響應**: 快速篩選與處理

**操作流程**
1. 查看頂部狀態卡片
2. 選擇感興趣的監控面板
3. 查看 AI 分析與建議
4. 點擊篩選相關事件
5. 跳轉至詳細頁面處理

**ECharts Heatmap 範例**

```js
option = {
  tooltip: {},
  xAxis: { type: 'category', data: ['延遲','流量','錯誤','可用度'] },
  yAxis: { type: 'category', data: ['Service A','Service B','Service C'] },
  visualMap: { min: 0, max: 100, calculable: true },
  series: [{ type: 'heatmap', data: [[0,0,12],[1,0,32]], label: { show: true } }]
}
```

**ECharts 柱狀圖範例**

```js
option = {
  tooltip: {},
  legend: {},
  xAxis: { type: 'category', data: ['Web集群','資料庫','開發環境','災備系統'] },
  yAxis: { type: 'value' },
  series: [
    { name: 'Healthy', type: 'bar', data: [12,8,15,9] },
    { name: 'Warning', type: 'bar', data: [3,2,1,4] },
    { name: 'Critical', type: 'bar', data: [1,0,2,0] }
  ]
}
```

---

## 5. 分析中心

**頁面概述**
深入了解系統趨勢、效能瓶頸和運營數據，做出數據驅動的決策。

**頁籤子頁面**
1. 容量規劃 (CapacityPlanningPage)

**指標概覽卡片**
1. 數據點總數 (12,847個, 涵蓋所有監控指標)
2. 分析報告 (3份, 本月產生的報告數量)
3. 處理時間 (2.3秒, 平均分析處理時間)
4. 準確率 (97.8%, AI 分析準確率)

---

### 5.1 容量規劃頁面

**頁面概述**
容量規劃頁面提供系統資源使用趨勢分析，支援預測未來容量需求和優化建議。

**界面元素**
- **頁面標題**: "容量規劃"

**工具列** (ToolbarActions):
- 刷新按鈕 (ReloadOutlined, 重新分析容量數據)
- 時間範圍選擇器 (DateRangePicker, 選擇分析時間範圍)
- 匯出按鈕 (DownloadOutlined, 匯出容量報告)
- 預測模型選擇器 (Select, 選擇預測算法)
- AI 分析按鈕 (RobotOutlined, 觸發智能分析)

**主要元件**
- **資源使用趨勢** (ECharts Line Chart):
  - CPU 使用率趨勢 (dataIndex: 'cpu_usage', 歷史和預測數據)
  - 記憶體使用率趨勢 (dataIndex: 'memory_usage', 歷史和預測數據)
  - 儲存使用率趨勢 (dataIndex: 'storage_usage', 歷史和預測數據)
  - 預測未來 30 天容量需求 (虛線顯示預測數據)
- **容量預測模型** (ECharts Area Chart):
  - 不同場景下的容量預測 (最佳/平均/最壞情況)
  - 信心區間顯示 (陰影區域顯示置信度)
  - 預測準確度指標 (dataIndex: 'accuracy', 模型準確度)
- **優化建議面板** (Alert):
  - 基於 AI 分析的容量優化建議 (List, 具體建議項目)
  - 成本效益分析 (Table, 優化前後成本對比)
  - 資源分配建議 (Card, 資源重新分配建議)
- **詳細分析表格** (Table):
  - 資源名稱 (dataIndex: 'resource_name')
  - 當前使用率 (dataIndex: 'current_usage', 百分比)
  - 預測使用率 (dataIndex: 'predicted_usage', 百分比)
  - 建議容量 (dataIndex: 'recommended_capacity', 建議擴容數量)
  - 成本估算 (dataIndex: 'cost_estimate', 擴容成本估算)

**主要功能**
1. **趨勢分析**: 資源使用歷史趨勢
2. **容量預測**: AI 預測未來需求
3. **優化建議**: 智能容量優化建議
4. **成本分析**: 容量變更的成本效益

**操作流程**
1. 查看資源使用趨勢圖表
2. 選擇預測時間範圍
3. 查看 AI 容量預測結果
4. 參考優化建議進行調整

- 滑鼠懸停：顯示精確數據
- 點擊數據點：展開對應事件清單

---

### 5.2 資源負載分析頁面

**頁面概述**
資源負載分析頁面提供詳細的資源效能監控，包含 CPU、記憶體、磁碟 I/O、網路延遲分析。

**界面元素**
- **頁面標題**: "資源負載分析"

**工具列** (ToolbarActions):
- 刷新按鈕 (ReloadOutlined, 重新整理效能數據)
- 搜索篩選按鈕 (SearchOutlined, 統一的搜索和篩選入口)
- 匯出按鈕 (DownloadOutlined, 匯出效能報告)
- 批量操作按鈕 (Batch操作)
- 時間範圍選擇器 (DateRangePicker, 選擇分析時間範圍)

**主要元件**
- **效能指標圖表** (ECharts Line Chart):
  - CPU 使用率趨勢圖 (dataIndex: 'cpu_usage')
  - 記憶體使用率趨勢圖 (dataIndex: 'memory_usage')
  - 磁碟讀寫 IOPS 統計 (dataIndex: 'disk_io')
  - 網路流量統計 (dataIndex: 'network_traffic')
- **資源篩選器** (Select, TreeSelect):
  - 資源類型篩選 (伺服器、資料庫、容器等)
  - 資源群組篩選 (支援多選)
  - 標籤篩選 (支援多標籤篩選)
- **異常檢測面板** (Alert):
  - 異常閾值設定 (Input, 設定異常判定標準)
  - 預警通知設定 (Switch, 啟用異常預警)
  - 異常歷史記錄 (Table, 顯示歷史異常事件)
- **詳細分析表格** (Table):
  - 資源名稱 (dataIndex: 'resource_name')
  - 平均 CPU 使用率 (dataIndex: 'avg_cpu', 百分比)
  - 平均記憶體使用率 (dataIndex: 'avg_memory', 百分比)
  - 磁碟讀取速度 (dataIndex: 'disk_read', MB/s)
  - 磁碟寫入速度 (dataIndex: 'disk_write', MB/s)
  - 網路輸入流量 (dataIndex: 'net_in', Mbps)
  - 網路輸出流量 (dataIndex: 'net_out', Mbps)
  - 異常次數 (dataIndex: 'anomaly_count', 統計週期內異常次數)

**主要功能**
1. **效能監控**: 即時資源效能指標
2. **異常檢測**: AI 異常識別與預警
3. **資源篩選**: 多維度資源篩選
4. **數據匯出**: 支援圖表和數據匯出
5. **歷史回溯**: 查看歷史效能數據

**操作流程**
1. 選擇要分析的資源範圍
2. 查看效能指標圖表
3. 識別異常點和趨勢
4. 匯出分析報告

---

### 5.3 AI 洞察頁面

**頁面概述**
AI 洞察頁面提供智能化的系統分析，包含風險預測、異常檢測和優化建議。

**界面元素**
- **頁面標題**: "AI 洞察"

**工具列** (ToolbarActions):
- 刷新按鈕 (ReloadOutlined, 重新分析數據)
- 搜索篩選按鈕 (SearchOutlined, 統一的搜索和篩選入口)
- 匯出按鈕 (DownloadOutlined, 匯出分析報告)
- 批量操作按鈕 (Batch操作)
- 時間範圍選擇器 (DateRangePicker, 選擇分析時間範圍)
- AI 分析按鈕 (RobotOutlined, 觸發智能分析)

**主要元件**
- **AI 分析報告** (Card):
  - 預測事件數量 (dataIndex: 'predicted_events', 預測事件數量)
  - 影響範圍評估 (dataIndex: 'impact_range', 影響範圍描述)
  - 智能分析結果 (TextArea, 詳細分析結果)
  - 建議操作 (List, 具體建議操作項目)
  - 置信度 (Progress, 分析置信度百分比)
- **風險預測圖表** (ECharts Pie Chart):
  - 預測風險等級分佈 (高風險/中風險/低風險)
  - 不同風險類型的占比 (性能風險/可用性風險/安全風險)
  - 風險趨勢分析 (Line Chart, 風險變化趨勢)
- **事件趨勢預測** (ECharts Line Chart):
  - 未來事件發生趨勢預測 (7天/30天/90天預測)
  - 基於歷史數據的預測模型 (線性回歸/神經網絡)
  - 預測準確度 (dataIndex: 'accuracy', 模型準確度)
- **優化建議面板** (Alert):
  - 自動化建議 (List, 自動化改進建議)
  - 資源優化 (Card, 資源配置優化建議)
  - 成本效益分析 (Table, 優化前後對比)
- **分析歷史記錄** (Table):
  - 分析時間 (dataIndex: 'analysis_time')
  - 分析類型 (dataIndex: 'analysis_type', 風險預測/異常檢測/容量規劃)
  - 分析結果 (dataIndex: 'result_summary', 分析結果摘要)
  - 建議採納 (dataIndex: 'adopted_suggestions', 已採納建議數量)

**主要功能**
1. **風險預測**: AI 預測系統風險
2. **異常檢測**: 自動識別系統異常
3. **優化建議**: 基於分析的優化建議
4. **趨勢分析**: 長期趨勢預測分析
5. **報告生成**: 自動生成分析報告

**操作流程**
1. 查看 AI 分析報告
2. 分析風險預測圖表
3. 參考優化建議
4. 生成詳細報告

---

## 6. 自動化中心

**頁面概述**
提供自動化腳本管理、排程配置和執行追蹤功能，支援事件驅動和定時排程。

**頁籤子頁面**
1. 腳本庫 (ScriptLibraryPage)
2. 排程管理 (ScheduleManagementPage)
3. 執行日誌 (ExecutionLogsPage)

**指標概覽卡片**
1. 腳本總數 (45個, 涵蓋各類自動化任務)
2. 執行成功率 (92.5%, 本月執行成功率)
3. 24小時執行 (127次, 過去24小時執行次數)
4. 排程任務 (8個, 活躍的排程任務數量)

---

### 6.1 腳本庫頁面

**頁面概述**
腳本庫頁面提供自動化腳本的集中管理，支援多種類型腳本的創建、版本控制和執行。

**界面元素**
- **頁面標題**: "腳本庫"

**工具列** (ToolbarActions):
- 搜索篩選按鈕 (SearchOutlined, 統一的搜索和篩選入口)
- 匯出按鈕 (DownloadOutlined, 匯出腳本列表)
- 批量操作按鈕 (批量腳本操作)
- 新增腳本按鈕 (PlusOutlined, 新增腳本)

**腳本列表** (Table):
- **腳本名稱** (dataIndex: 'name', 腳本名稱, 支援排序和搜索)
- **類型** (dataIndex: 'type', Shell / Python / Ansible / Terraform)
- **描述** (dataIndex: 'description', 腳本功能描述)
- **版本** (dataIndex: 'version', 當前版本號)
- **最後更新時間** (dataIndex: 'updated_at', 最後更新時間)
- **最後執行狀態** (dataIndex: 'last_execution_status', 成功/失敗/執行中)
- **操作** (操作按鈕列):
  - 執行按鈕 (立即執行腳本)
  - 查看日誌按鈕 (查看執行歷史)
  - 編輯按鈕 (編輯腳本內容)
  - 刪除按鈕 (刪除腳本)

**編輯腳本彈窗** (Modal):
- **基本資訊表單** (Form):
  - 腳本名稱 (Input, name="name", 必填)
  - 類型 (Select, name="type", 必填)
  - 描述 (TextArea, name="description")
- **腳本內容編輯器** (Code Editor):
  - 語法高亮
  - 錯誤檢查
- **標籤管理** (Select, multiple):
  - 支援多個標籤
- **版本管理**:
  - 版本號自動生成
  - 支援回滾到指定版本

**主要功能**
1. **腳本管理**: 創建、編輯、刪除腳本
2. **版本控制**: 腳本版本追蹤和回滾
3. **標籤分類**: 腳本分類和組織
4. **即時執行**: 手動觸發腳本執行
5. **歷史追蹤**: 執行歷史和日誌查看

**操作流程**
1. 選擇腳本進行查看或編輯
2. 使用工具列功能進行批量操作
3. 點擊執行按鈕運行腳本
4. 查看執行日誌和結果

---

### 6.2 排程管理頁面

**頁面概述**
排程管理頁面提供自動化任務的定時配置，支援單次和週期性任務的創建與管理。

**界面元素**
- **頁面標題**: "排程管理"

**工具列** (ToolbarActions):
- 搜索篩選按鈕 (SearchOutlined, 統一的搜索和篩選入口)
- 匯出按鈕 (DownloadOutlined, 匯出排程列表)
- 批量操作按鈕 (批量排程操作)
- 新增排程按鈕 (PlusOutlined, 新增排程)

**排程列表** (Table):
- **排程名稱** (dataIndex: 'name', 排程任務名稱, 支援排序和搜索)
- **腳本名稱** (dataIndex: 'script_name', 關聯的腳本)
- **類型** (dataIndex: 'type', 單次 / 週期性)
- **Cron 表達式** (dataIndex: 'cron_expression', 定時表達式)
- **下一次執行時間** (dataIndex: 'next_run_time', 下次執行時間)
- **狀態** (dataIndex: 'status', 啟用/停用/執行中)
- **操作** (操作按鈕列):
  - 編輯按鈕 (編輯排程配置)
  - 刪除按鈕 (刪除排程)
  - 啟用/停用切換 (控制排程狀態)

**編輯排程彈窗** (Modal):
- **基本設定表單** (Form):
  - 排程名稱 (Input, name="name", 必填)
  - 關聯腳本 (Select, name="script_id", 必填)
  - 類型 (Select, name="type", 單次/週期性, 必填)
- **定時配置**:
  - Cron 表達式 (Input, name="cron", 必填, 支援驗證)
  - 執行時段 (TimeRange, 可選)
- **執行策略**:
  - 並發策略 (Select, 允許/禁止並發)
  - 重試策略 (Select, 不重試/重試次數)
- **通知設定** (Checkbox Group):
  - 成功通知 (通知管道選擇)
  - 失敗通知 (通知管道選擇)

**主要功能**
1. **排程創建**: 創建單次或週期性任務
2. **定時配置**: 靈活的 Cron 表達式設定
3. **狀態管理**: 啟用、停用、刪除排程
4. **執行控制**: 並發和重試策略設定
5. **通知整合**: 成功/失敗通知配置

**操作流程**
1. 選擇要管理的排程任務
2. 使用工具列進行批量操作
3. 編輯排程的定時和策略設定
4. 控制排程的啟用狀態

---

### 6.3 執行日誌頁面

**頁面概述**
執行日誌頁面提供自動化任務執行歷史的詳細追蹤，包含執行狀態、耗時和詳細日誌。

**界面元素**
- **頁面標題**: "執行日誌"

**工具列** (ToolbarActions):
- 搜索篩選按鈕 (SearchOutlined, 統一的搜索和篩選入口)
- 匯出按鈕 (DownloadOutlined, 匯出執行日誌)
- 批量操作按鈕 (批量日誌操作)
- 清理日誌按鈕 (清除舊日誌記錄)

**執行日誌列表** (Table):
- **執行 ID** (dataIndex: 'execution_id', 唯一執行標識)
- **腳本名稱** (dataIndex: 'script_name', 執行的腳本)
- **觸發來源** (dataIndex: 'trigger_source', 事件規則 / 排程 / 手動)
- **開始時間** (dataIndex: 'start_time', 執行開始時間)
- **耗時** (dataIndex: 'duration', 執行耗時)
- **狀態** (dataIndex: 'status', 成功 / 失敗 / 執行中)
- **操作** (操作按鈕列):
  - 查看詳情按鈕 (查看完整執行詳情)

**執行詳情抽屜** (Drawer):
- **基本資訊**:
  - 執行 ID、腳本名稱、觸發來源
  - 開始時間、結束時間、耗時
- **執行參數** (JSON):
  - 腳本執行時的參數配置
- **輸出摘要**:
  - 標準輸出 (stdout)
  - 錯誤輸出 (stderr)
- **錯誤訊息** (TextArea):
  - 詳細錯誤信息和堆疊追蹤
- **關聯事件** (List):
  - 觸發此執行的相關事件
- **操作按鈕**:
  - 重試執行 (Button)
  - 下載日誌 (Button)

**主要功能**
1. **日誌查詢**: 按多條件篩選執行日誌
2. **詳情檢視**: 查看完整的執行信息
3. **錯誤診斷**: 分析執行失敗原因
4. **重試機制**: 重新執行失敗的任務
5. **日誌清理**: 定期清理歷史日誌

**操作流程**
1. 選擇要查看的執行記錄
2. 篩選特定時間範圍或狀態
3. 點擊查看詳情了解執行過程
4. 分析錯誤信息進行故障排除
5. 執行重試或下載日誌

---

## 7. 設定

**頁面概述**
提供系統全域配置管理，包含身份與存取管理、通知管理、平台設定等功能模組。

**子模組**
1. 身份與存取管理 (人員管理、團隊管理、角色管理、審計日誌)
2. 通知管理 (通知策略、通知管道、通知歷史)
3. 平台設定 (標籤管理、郵件設定、身份驗證、版面管理)

## 7.1 身份與存取管理

**頁面概述**
統一管理身份認證、存取權限和組織架構配置。

**頁籤子頁面**
1. 人員管理 (UserManagementPage)
2. 團隊管理 (TeamManagementPage)
3. 角色管理 (RoleManagementPage)
4. 審計日誌 (AuditLogsPage)

**指標概覽卡片**
1. 總人員數 (156人, 142 個啟用中, +5.2%)
2. 在線人員 (89人, +12.1%)
3. 團隊數量 (12個, 0%)
4. 待處理邀請 (5個, +25%)

### 7.1.1 人員管理頁面

**頁面概述**
人員管理頁面提供組織內所有人員的集中管理功能，包括人員資訊、角色分配和權限控制。

**界面元素**
- **頁面標題**: "人員管理"
- **工具列** (ToolbarActions):
  - 刷新按鈕 (ReloadOutlined, 重新整理人員列表)
  - 搜索篩選按鈕 (SearchOutlined, 統一的搜索和篩選入口)
  - 匯出按鈕 (DownloadOutlined, 匯出人員列表)
  - 批量操作按鈕 (Batch操作)
  - 新增人員按鈕 (PlusOutlined, 新增人員)
- **人員表格** (Table):
  - 用戶名稱 (dataIndex: 'username', 支援排序和搜索)
  - 姓名 (dataIndex: 'name', 真實姓名)
  - 電子郵件 (dataIndex: 'email', 支援搜索)
  - 團隊 (dataIndex: 'teams', 所屬團隊列表)
  - 角色 (dataIndex: 'roles', 角色權限)
  - 最後登入 (dataIndex: 'last_login', 支援排序)
  - 操作按鈕 (編輯/禁用/重設密碼/查看日誌)

**主要功能**
1. **人員資訊管理**: 添加、編輯、禁用人員帳戶
2. **角色分配**: 為人員分配系統角色和權限
3. **批量操作**: 批量更新人員狀態和角色
4. **登入記錄**: 查看人員登入歷史

### 7.1.2 團隊管理頁面

**頁面概述**
團隊管理頁面提供團隊組織結構的管理功能，便於權限分配和協作管理。

**界面元素**
- **頁面標題**: "團隊管理"
- **工具列** (ToolbarActions):
  - 刷新按鈕 (ReloadOutlined, 重新整理團隊列表)
  - 搜索篩選按鈕 (SearchOutlined, 統一的搜索和篩選入口)
  - 匯出按鈕 (DownloadOutlined, 匯出團隊列表)
  - 批量操作按鈕 (Batch操作)
  - 新增團隊按鈕 (PlusOutlined, 新增團隊)
- **團隊列表** (Table):
  - 團隊名稱 (dataIndex: 'name', 支援排序和搜索)
  - 成員數 (dataIndex: 'members', 團隊人數)
  - 訂閱者數 (dataIndex: 'subscribers', 關注者數量)
  - 負責人 (dataIndex: 'owner', 團隊管理員)
  - 描述 (dataIndex: 'description', 團隊說明)
  - 創建時間 (dataIndex: 'created_at', 支援排序)
  - 操作按鈕 (編輯/刪除/查看詳情/新增成員)

### 7.1.3 角色管理頁面

**頁面概述**
角色管理頁面定義系統角色和對應的權限配置。

**界面元素**
- **頁面標題**: "角色管理"
- **工具列** (ToolbarActions):
  - 刷新按鈕 (ReloadOutlined, 重新整理角色列表)
  - 搜索篩選按鈕 (SearchOutlined, 統一的搜索和篩選入口)
  - 匯出按鈕 (DownloadOutlined, 匯出角色列表)
  - 批量操作按鈕 (Batch操作)
  - 新增角色按鈕 (PlusOutlined, 新增角色)
- **角色表格** (Table):
  - 角色名稱 (dataIndex: 'name', 支援排序和搜索)
  - 角色描述 (dataIndex: 'description', 角色功能說明)
  - 權限範圍 (dataIndex: 'permissions', 權限範圍描述)
  - 人員數量 (dataIndex: 'user_count', 分配給該角色的用戶數)
  - 創建時間 (dataIndex: 'created_at', 支援排序)
  - 最後更新 (dataIndex: 'updated_at', 最後更新時間)
  - 狀態 (dataIndex: 'status', 啟用/停用狀態)
  - 操作按鈕 (編輯/刪除/複製/權限配置)

### 7.1.4 審計日誌頁面

**頁面概述**
審計日誌頁面記錄系統中所有重要的操作行為，用於安全審計和問題排查。

**界面元素**
- **頁面標題**: "審計日誌"
- **工具列** (ToolbarActions):
  - 刷新按鈕 (ReloadOutlined, 重新整理日誌列表)
  - 搜索篩選按鈕 (SearchOutlined, 統一的搜索和篩選入口)
  - 匯出按鈕 (DownloadOutlined, 匯出日誌記錄)
  - 批量操作按鈕 (Batch操作)
  - 清除過期記錄按鈕 (清除指定天數前的記錄)
- **審計日誌表格** (Table):
  - 時間 (dataIndex: 'time', 支援排序)
  - 操作者 (dataIndex: 'user', 用戶名稱)
  - 動作 (dataIndex: 'action', 操作類型)
  - 資源類型 (dataIndex: 'type', 資源類型)
  - 腳本名稱 (dataIndex: 'script_id', 關聯腳本)
  - 資源名稱 (dataIndex: 'resource_id', 關聯資源)
  - 結果 (dataIndex: 'result', 成功/失敗)
  - IP地址 (dataIndex: 'ip', 來源IP)
  - 操作按鈕 (查看詳情/回滾)

---

## 7.2 通知管理

**頁面概述**
提供統一的通知策略配置、管道管理和歷史記錄查詢功能。

**頁籤子頁面**
1. 通知策略 (NotificationStrategyPage)
2. 通知管道 (NotificationChannelPage)
3. 通知歷史 (NotificationHistoryPage)

**指標概覽卡片**
1. 通知管道 (5個, 包含 Email、Slack、Webhook 等)
2. 今日通知量 (127條, 當天發送的通知數量)
3. 送達率 (98.5%, 成功送達的比例)

---

### 7.2.1 通知策略頁面

**頁面概述**
通知策略頁面提供事件觸發通知的規則配置，支援多管道和接收者管理。

**界面元素**
- **頁面標題**: "通知策略"

**工具列** (ToolbarActions):
- 搜索篩選按鈕 (SearchOutlined, 統一的搜索和篩選入口)
- 匯出按鈕 (DownloadOutlined, 匯出策略配置)
- 批量操作按鈕 (批量策略操作)
- 新增策略按鈕 (PlusOutlined, 新增通知策略)

**策略列表** (Table):
- **策略名稱** (dataIndex: 'name', 策略名稱, 支援排序和搜索)
- **觸發條件** (dataIndex: 'trigger_condition', 觸發規則描述)
- **通知管道數量** (dataIndex: 'channel_count', 關聯的管道數量)
- **接收者** (dataIndex: 'recipients', 接收者清單)
- **狀態** (dataIndex: 'status', 啟用/停用)
- **優先級** (dataIndex: 'priority', 高/中/低)
- **操作** (操作按鈕列):
  - 編輯按鈕 (編輯策略配置)
  - 刪除按鈕 (刪除策略)
  - 啟用/停用切換 (控制策略狀態)
  - 測試按鈕 (測試策略功能)

**通知策略編輯精靈** (Modal with Steps):
- **步驟 1：基本設定**
  - 策略名稱 (Input, name="name", 必填)
  - 描述 (TextArea, name="description")
  - 啟用開關 (Switch, name="enabled")
  - 觸發條件 (Select, 嚴重性、資源篩選、時間範圍)
- **步驟 2：接收者與管道**
  - 接收者 (Select, multiple, 人員/團隊/角色)
  - 管道 (Checkbox Group, Email/Slack/Teams/Webhook/LINE/SMS)
  - 模板 (Select, 預設/自訂)
  - 通知等級 (Select, 高/中/低)
  - 重試策略 (Select, 重試次數和間隔)
  - 預覽區塊 (接收者與管道對照表)
- **步驟 3：進階設定**
  - 靜音規則套用 (Select, 選擇靜音規則)
  - 靜音期間 (DateRange / Cron 表達式)
  - 優先級設定 (Select, 設定通知優先級)
  - 聚合 / 延遲 / 重複抑制 (Switch)
  - Webhook Headers (JSON 編輯器)
  - API Key / Token (Input.Password)
  - 加密開關 (Switch)

**主要功能**
1. **策略配置**: 創建和編輯通知策略
2. **多管道支援**: Email、Slack、Webhook 等
3. **接收者管理**: 人員、團隊、角色管理
4. **靜音控制**: 時間段和條件靜音
5. **測試功能**: 策略功能測試驗證

**操作流程**
1. 選擇要編輯的策略
2. 使用工具列進行批量操作
3. 編輯策略的觸發條件和接收者
4. 配置進階通知設定
5. 測試策略功能

---

### 7.2.2 通知管道頁面

**頁面概述**
通知管道頁面提供多種通知管道的配置和管理，支援 Email、Slack、Webhook、LINE、SMS 等。

**界面元素**
- **頁面標題**: "通知管道"

**工具列** (ToolbarActions):
- 搜索篩選按鈕 (SearchOutlined, 統一的搜索和篩選入口)
- 匯出按鈕 (DownloadOutlined, 匯出管道配置)
- 批量操作按鈕 (批量管道操作)
- 新增管道按鈕 (PlusOutlined, 新增通知管道)

**管道列表** (Table):
- **管道名稱** (dataIndex: 'name', 管道名稱, 支援排序和搜索)
- **類型** (dataIndex: 'type', Email/Slack/Webhook/LINE/SMS)
- **狀態** (dataIndex: 'status', 正常/異常/停用)
- **最後更新時間** (dataIndex: 'updated_at', 最後更新時間)
- **操作** (操作按鈕列):
  - 編輯按鈕 (編輯管道配置)
  - 刪除按鈕 (刪除管道)
  - 測試按鈕 (測試管道功能)

**編輯管道彈窗** (Modal):
- **基本設定表單** (Form):
  - 管道名稱 (Input, name="name", 必填)
  - 類型 (Select, name="type", Email/Slack/Webhook/LINE/SMS, 必填)
  - 描述 (TextArea, name="description")
- **Email 設定** (當類型為 Email 時):
  - SMTP 伺服器 (Input, name="smtp_host", 必填)
  - 埠號 (Input, name="smtp_port", 必填)
  - 加密方式 (Select, TLS/SSL)
  - 帳號 (Input, name="username", 必填)
  - 密碼 (Input.Password, name="password", 必填)
- **Slack/Teams 設定** (當類型為 Slack/Teams 時):
  - Webhook URL (Input, name="webhook_url", 必填)
  - 預設頻道 (Input, name="default_channel")
- **Webhook 設定** (當類型為 Webhook 時):
  - URL (Input, name="url", 必填)
  - HTTP 方法 (Select, GET/POST/PUT)
  - Headers (JSON 編輯器)
  - Body 模板 (TextArea)
- **LINE/SMS 設定** (當類型為 LINE/SMS 時):
  - Token (Input.Password, name="token", 必填)
- **測試功能**:
  - 即時發送測試通知 (Button)
  - 測試結果顯示 (Alert)

**主要功能**
1. **管道配置**: 多種類型管道設定
2. **連線測試**: 即時測試管道可用性
3. **狀態監控**: 管道健康狀態追蹤
4. **批量管理**: 多管道批量操作
5. **安全管理**: 敏感信息加密存儲

**操作流程**
1. 選擇要配置的管道
2. 編輯管道的連線參數
3. 測試管道連線功能
4. 保存並啟用管道
5. 監控管道運行狀態

---

### 7.2.3 通知歷史頁面

**頁面概述**
通知歷史頁面提供所有通知發送記錄的查詢和詳情檢視功能。

**界面元素**
- **頁面標題**: "通知歷史"

**工具列** (ToolbarActions):
- 搜索篩選按鈕 (SearchOutlined, 統一的搜索和篩選入口)
- 匯出按鈕 (DownloadOutlined, 匯出通知記錄)
- 批量操作按鈕 (批量記錄操作)
- 清理記錄按鈕 (清除舊記錄)

**通知記錄列表** (Table):
- **發送時間** (dataIndex: 'sent_time', 通知發送時間)
- **策略名稱** (dataIndex: 'strategy_name', 觸發的策略)
- **管道類型** (dataIndex: 'channel_type', 使用的管道)
- **接收者** (dataIndex: 'recipients', 接收者清單)
- **狀態** (dataIndex: 'status', 成功/失敗/重試中)
- **耗時** (dataIndex: 'duration', 發送耗時)
- **操作** (操作按鈕列):
  - 查看詳情按鈕 (查看完整詳情)

**通知詳情抽屜** (Drawer):
- **基本資訊**:
  - 通知 ID、策略名稱、管道類型
  - 發送時間、接收者、狀態
- **通知內容**:
  - 渲染結果 (實際發送內容)
  - 模板使用的參數
- **發送紀錄**:
  - 發送嘗試次數
  - 每次嘗試的結果
  - 重試間隔和次數
- **技術詳情**:
  - HTTP 請求詳情 (Webhook)
  - 回應狀態和內容
  - 錯誤信息和堆疊追蹤
- **操作紀錄**:
  - 創建時間、更新時間
  - 操作人員和動作
- **關聯事件**:
  - 觸發此通知的事件
  - 事件詳情連結

**主要功能**
1. **記錄查詢**: 多條件篩選通知記錄
2. **詳情檢視**: 完整通知發送詳情
3. **故障診斷**: 分析發送失敗原因
4. **統計分析**: 通知成功率統計
5. **記錄管理**: 記錄清理和歸檔

**操作流程**
1. 選擇要查看的通知記錄
2. 篩選特定時間或狀態
3. 點擊查看詳情了解發送過程
4. 分析技術詳情進行故障排除
5. 匯出記錄或清理舊數據

---

## 7.3 平台設定

**頁面概述**
提供系統全域配置管理，包含標籤管理、郵件設定、身份驗證等功能。

**頁籤子頁面**
1. 標籤管理 (TagManagementPage)
2. 郵件設定 (EmailSettingsPage)
3. 身份驗證 (AuthSettingsPage)
4. 版面管理 (LayoutManagementPage) ✅ 已實現

**指標概覽卡片**
1. 標籤總數 (12個, 涵蓋各類資源標籤)
2. 活躍會話 (23個, 當前活躍用戶會話)
3. 配置異動 (5次, 本月配置變更次數)

---

### 7.3.1 標籤管理頁面

**頁面概述**
標籤管理頁面提供全平台標籤類型和標籤值的統一管理功能，支援標籤分類、搜索和批量操作。

**界面元素**
- **頁面標題**: "標籤管理"

**分類篩選** (Tabs):
- 全部 (5)
- 基礎設施 (1)
- 應用程序 (1)
- 組織結構 (1)
- 業務屬性 (1)
- 成本管理 (0)
- 安全合規 (1)

**搜索過濾器** (Input, placeholder="搜尋標籤名稱或值...")

**工具列** (ToolbarActions):
- 搜索篩選按鈕 (SearchOutlined, 統一的搜索和篩選入口)
- 匯出按鈕 (DownloadOutlined, 匯出標籤配置)
- 新增標籤按鈕 (PlusOutlined, 新增標籤類型)

**標籤類型表格** (Table):
- **標籤名稱** (dataIndex: 'name', 標籤類型名稱)
- **分類** (dataIndex: 'category', 標籤分類)
- **標籤值** (dataIndex: 'values', 該類型下的標籤值)
- **必填** (dataIndex: 'required', Switch, 是否為必填標籤)
- **使用次數** (dataIndex: 'usage_count', 被使用的次數)
- **操作** (操作按鈕列):
  - 編輯按鈕 (編輯標籤類型)
  - 刪除按鈕 (刪除標籤類型)
  - 管理標籤值按鈕 (管理該類型的標籤值)

**主要功能**
1. **標籤類型管理**: 創建、編輯、刪除標籤類型
2. **標籤值管理**: 為每個類型添加多個標籤值
3. **分類組織**: 按業務領域對標籤分類
4. **使用統計**: 追蹤標籤使用情況
5. **必填控制**: 設定某些標籤為必填項
6. **批量操作**: 批量匯入匯出標籤配置

**操作流程**
1. 選擇標籤分類進行篩選
2. 使用搜索功能查找特定標籤
3. 點擊新增按鈕創建新標籤類型
4. 編輯現有標籤類型或管理標籤值
5. 查看使用統計進行優化

---

### 7.3.2 郵件設定頁面

**頁面概述**
郵件設定頁面提供系統郵件服務的配置功能，包含 SMTP 伺服器設定和認證資訊。

**界面元素**
- **頁面標題**: "郵件設定"

**SMTP設定表單** (Form):
- **SMTP 伺服器** (Input, name="smtp_host", 必填, 占位提示: "例如: smtp.gmail.com")
- **埠號** (Input, name="smtp_port", 必填, 占位提示: "例如: 587")
- **使用者名稱** (Input, name="username", 必填, 占位提示: "輸入郵件帳號")
- **密碼** (Input.Password, name="password", 必填, 占位提示: "輸入郵件密碼", 支援密碼顯示/隱藏切換)
- **寄件人名稱** (Input, name="sender_name", 占位提示: "顯示在收件人郵箱的寄件人名稱")
- **寄件人地址** (Input, name="sender_email", 必填, 占位提示: "例如: noreply@company.com")
- **加密方式** (Select, name="encryption", 選項: "無", "TLS", "SSL")
- **測試收件人** (Input, name="test_recipient", 占位提示: "用於測試的收件人地址")

**操作按鈕**:
- **還原預設值** (Button, 恢復到系統預設配置)
- **儲存** (Button, 儲存當前設定)
- **測試寄送** (Button, 發送測試郵件到測試收件人)

**主要功能**
1. **SMTP 配置**: 設定郵件伺服器連線參數
2. **認證管理**: 帳號密碼安全存儲
3. **測試功能**: 即時測試郵件發送
4. **預設恢復**: 恢復到系統預設配置
5. **加密支援**: TLS/SSL 加密連線

**操作流程**
1. 填寫 SMTP 伺服器資訊
2. 配置認證帳號和密碼
3. 設定寄件人資訊
4. 選擇加密方式
5. 儲存配置並測試發送

---

### 7.3.3 身份驗證設定頁面

**頁面概述**
身份驗證頁面提供系統 OIDC (OpenID Connect) 認證配置功能。

**界面元素**
- **頁面標題**: "身份驗證"

**OIDC設定表單** (Form):
- **啟用 OIDC** (Select, name="oidc_enabled", 選擇是否啟用 OIDC 認證)
- **提供商** (Select, name="provider", 選項: "Keycloak", "Auth0", "Google", "Microsoft", "自訂")
- **Realm/Domain** (Input, name="realm", 必填, 占位提示: "例如: company")
- **客戶端 ID** (Input, name="client_id", 必填, 占位提示: "輸入客戶端 ID")
- **客戶端密鑰** (Input.Password, name="client_secret", 必填, 占位提示: "輸入客戶端密鑰", 支援密鑰顯示/隱藏切換)
- **授權端點** (Input, name="auth_url", 必填, 占位提示: "例如: https://auth.company.com/auth")
- **Token 端點** (Input, name="token_url", 必填, 占位提示: "例如: https://auth.company.com/token")
- **用戶資訊端點** (Input, name="userinfo_url", 必填, 占位提示: "例如: https://auth.company.com/userinfo")
- **Redirect URI** (Input, name="redirect_uri", 必填, 占位提示: "例如: https://sre.company.com/callback")
- **登出端點** (Input, name="logout_url", 占位提示: "可選的登出端點 URL")
- **使用者同步** (Switch, name="user_sync", 啟用時自動同步用戶資訊)

**操作按鈕**:
- **還原預設值** (Button, 恢復到系統預設配置)
- **儲存** (Button, 儲存當前設定)
- **測試連線** (Button, 測試 OIDC 連線和認證流程)

**主要功能**
1. **OIDC 配置**: 設定 OpenID Connect 認證參數
2. **多提供商支援**: Keycloak、Auth0、Google、Microsoft 等
3. **連線測試**: 驗證認證設定正確性
4. **用戶同步**: 自動同步用戶資訊
5. **預設恢復**: 恢復到系統預設配置

**操作流程**
1. 選擇要集成的 OIDC 提供商
2. 填寫提供商的連線資訊
3. 配置客戶端憑據和端點
4. 設定重定向 URI
5. 儲存配置並測試連線

### 7.3.4 版面管理頁面

**頁面概述**
提供中樞頁面頂部指標卡片的組成與排序管理，採用摺疊面板結合雙欄選擇器的設計，讓平台管理員以最少步驟完成配置。支援即時編輯和預覽，包含完整的狀態管理和錯誤處理。

**檔案對應**
- **前端實現**: `/frontend/src/pages/PlatformSettingsPage.tsx` (版面管理標籤) ✅ 已實現
- **路由配置**: `/frontend/src/config/routes.ts`
- **組件依賴**:
  - `/frontend/src/components/ContextualKPICard.tsx`
  - `/frontend/src/components/profile/PersonalInfoForm.tsx`
  - `/frontend/src/components/profile/PreferencesSettings.tsx`
  - `/frontend/src/components/profile/SecuritySettings.tsx`

**界面元素**
- **頁面標題**: "版面管理"
- **說明提示**: 置於頁首的 `Alert`，文案為「調整各中樞頁面的指標卡片與順序，變更立即生效。」
- **摺疊面板群組**: 每個可客製化頁面一個面板，預設全部收合，展開後顯示當前卡片順序與「編輯」按鈕。
- **操作記錄列**: 面板底部顯示「最後更新：{時間} · 由 {使用者}」資訊，無須額外操作。

**摺疊面板（Accordion）**
- **事件管理**
  - 面板標題: "事件管理"
  - 內文區塊標題: "當前顯示的卡片"
  - 列表: 以編號清單呈現每張卡片，例如「1. 待處理告警」、「2. 處理中事件」、「3. 今日已解決」。
  - 操作: 右上角的「✏️ 編輯」按鈕 (Button type="link" icon=EditOutlined)。
- **資源管理**
  - 面板標題: "資源管理"
  - 清單示例: 「1. 總資源數」、「2. 正常率」、「3. 異常資源」。
- **自動化中心**
  - 面板標題: "自動化中心"
  - 清單示例: 「1. 今日自動化執行」、「2. 成功率」、「3. 失敗告警轉自動化」。
- **儀表板管理**
  - 面板標題: "儀表板管理"
  - 清單示例: 「1. 總儀表板數」、「2. 活躍用戶」、「3. SRE 戰情室」、「4. 基礎設施洞察」。
- **分析中心**
  - 面板標題: "分析中心"
  - 清單示例: 「1. 待處理事件」、「2. 總資源數」、「3. 今日自動化執行」。
- **身份與存取管理**
  - 面板標題: "身份與存取管理"
  - 清單示例: 「1. 總人員數」、「2. 在線人員」、「3. 團隊數量」、「4. 待處理邀請」。
- **通知管理**
  - 面板標題: "通知管理"
  - 清單示例: 「1. 待處理事件」、「2. 今日自動化執行」、「3. 總人員數」。
- **平台設定**
  - 面板標題: "平台設定"
  - 清單示例: 「1. 總人員數」、「2. 在線人員」、「3. 團隊數量」。
- **個人設定**
  - 面板標題: "個人設定"
  - 清單示例: 「1. 總人員數」、「2. 在線人員」、「3. 待處理邀請」。

**操作流程**
1. 於摺疊面板中選擇要調整的頁面，點擊「✏️ 編輯」。
2. 彈出指標卡片編輯視窗，左側為「可用的小工具」，右側為「已顯示的小工具」。
3. 透過 `>` 按鈕將待加入卡片移至右側，透過 `<` 按鈕移除不需要的卡片。
4. 使用 `↑`、`↓` 按鈕調整右側卡片順序；順序即為頁面顯示順序。
5. 點擊「儲存」後呼叫 API 儲存配置；若取消則不更新。
6. 完成儲存後，面板清單同步更新，並提示「已成功更新版面配置」。

**編輯彈窗（Modal）**
- **標題格式**: `編輯「{頁面名稱}」的指標卡片`
- **寬度**: 720px，內含兩欄等寬的列表框。
- **頁尾按鈕**: `取消`、`儲存`，其中 `儲存` 為主色按鈕。
- **關閉方式**: 點擊右上角關閉或 `取消` 按鈕。

**雙欄選擇器（DualListSelector）**
- **左側標題**: "可用的小工具"
- **右側標題**: "已顯示的小工具"
- **中央操作按鈕**: `>`（新增）、`<`（移除）
- **右側列表項操作**: 每項顯示 `↑`、`↓` 的 IconButton，用於調整排序。
- **列表項內容**: 顯示卡片名稱與資料來源說明 tooltip。
- **視覺設計**: 雙欄使用統一的邊框、滾動、樣式設計。
- **狀態控制**: 按鈕根據可用 Widget 數量自動禁用。

**Widget 註冊表 (Layout Widgets Registry)**
| widget_id | 顯示名稱 | 適用頁面 (supported_pages) | 描述 |
| :--- | :--- | :--- | :--- |
| `incident_pending_count` | 待處理告警 | `["事件管理", "SRE 戰情室", "分析中心", "通知管理"]` | 顯示待處理事件數量 |
| `incident_in_progress` | 處理中事件 | `["事件管理"]` | 追蹤目前由工程師處理的事件數 |
| `incident_resolved_today` | 今日已解決 | `["事件管理", "SRE 戰情室", "儀表板管理"]` | 顯示今日已關閉事件數 |
| `resource_total_count` | 總資源數 | `["資源管理", "SRE 戰情室", "分析中心", "儀表板管理"]` | 顯示納管資源總量 |
| `resource_health_rate` | 正常率 | `["資源管理", "SRE 戰情室"]` | 顯示健康資源百分比 |
| `resource_alerting` | 異常資源 | `["資源管理", "儀表板管理"]` | 顯示異常或離線資源數 |
| `automation_runs_today` | 今日自動化執行 | `["自動化中心", "SRE 戰情室", "分析中心", "通知管理"]` | 顯示今日觸發自動化任務數量 |
| `automation_success_rate` | 成功率 | `["自動化中心"]` | 顯示自動化任務成功比例 |
| `automation_suppressed_alerts` | 已抑制告警 | `["自動化中心"]` | 顯示因自動化而抑制的告警數 |
| `user_total_count` | 總人員數 | `["身份與存取管理", "通知管理", "平台設定", "個人設定"]` | 顯示系統總用戶數量 |
| `user_online_count` | 在線人員 | `["身份與存取管理", "平台設定", "個人設定", "儀表板管理"]` | 顯示當前在線用戶數 |
| `user_team_count` | 團隊數量 | `["身份與存取管理", "平台設定"]` | 顯示系統中團隊總數 |
| `user_pending_invites` | 待處理邀請 | `["身份與存取管理", "個人設定"]` | 顯示待處理的用戶邀請 |

**預設版面配置 (Default Layout Configurations)**
| page_path | 頁面名稱 | 預設小工具 (依序) |
| :--- | :--- | :--- |
| `/incidents` | 事件管理 | 1. `incident_pending_count`（待處理告警）<br>2. `incident_in_progress`（處理中事件）<br>3. `incident_resolved_today`（今日已解決） |
| `/resources` | 資源管理 | 1. `resource_total_count`（總資源數）<br>2. `resource_health_rate`（正常率）<br>3. `resource_alerting`（異常資源） |
| `/automation` | 自動化中心 | 1. `automation_runs_today`（今日自動化執行）<br>2. `automation_success_rate`（成功率）<br>3. `automation_suppressed_alerts`（已抑制告警） |
| `/dashboards` | 儀表板管理 | 1. `resource_total_count`（總資源數）<br>2. `user_online_count`（在線人員）<br>3. `incident_resolved_today`（今日已解決）<br>4. `resource_alerting`（異常資源） |
| `/analyzing` | 分析中心 | 1. `incident_pending_count`（待處理事件）<br>2. `resource_total_count`（總資源數）<br>3. `automation_runs_today`（今日自動化執行） |
| `/settings/identity` | 身份與存取管理 | 1. `user_total_count`（總人員數）<br>2. `user_online_count`（在線人員）<br>3. `user_team_count`（團隊數量）<br>4. `user_pending_invites`（待處理邀請） |
| `/settings/notifications` | 通知管理 | 1. `incident_pending_count`（待處理事件）<br>2. `automation_runs_today`（今日自動化執行）<br>3. `user_total_count`（總人員數） |
| `/settings/platform` | 平台設定 | 1. `user_total_count`（總人員數）<br>2. `user_online_count`（在線人員）<br>3. `user_team_count`（團隊數量） |
| `/profile` | 個人設定 | 1. `user_total_count`（總人員數）<br>2. `user_online_count`（在線人員）<br>3. `user_pending_invites`（待處理邀請） |

**前端技術實現**

**狀態管理**
```typescript
const [editModalVisible, setEditModalVisible] = useState(false)
const [editingPage, setEditingPage] = useState('')
const [selectedWidgets, setSelectedWidgets] = useState<string[]>([])
const [availableWidgets, setAvailableWidgets] = useState<string[]>([])
```

**編輯處理函數**
```typescript
const handleEditClick = (pageName: string) => {
  // 根據頁面名稱設置初始數據
  const pageWidgetMap: Record<string, string[]> = {
    '事件管理': ['incident_pending_count', 'incident_in_progress', 'incident_resolved_today'],
    '資源管理': ['resource_total_count', 'resource_health_rate', 'resource_alerting'],
    '自動化中心': ['automation_runs_today', 'automation_success_rate', 'automation_suppressed_alerts'],
    // ... 其他頁面配置
  }
  const pageWidgets = pageWidgetMap[pageName] || []
  setSelectedWidgets(pageWidgets)
  setAvailableWidgets(allWidgets.filter(w => !pageWidgets.includes(w.key)).map(w => w.key))
  setEditModalVisible(true)
}
```

**Widget 排序實現**
```typescript
const handleMoveUp = (index: number) => {
  if (index > 0) {
    const newSelected: string[] = [...selectedWidgets]
    const temp = newSelected[index - 1]
    newSelected[index - 1] = newSelected[index]
    newSelected[index] = temp
    setSelectedWidgets(newSelected)
  }
}

const handleMoveDown = (index: number) => {
  if (index < selectedWidgets.length - 1) {
    const newSelected: string[] = [...selectedWidgets]
    const temp = newSelected[index]
    newSelected[index] = newSelected[index + 1]
    newSelected[index + 1] = temp
    setSelectedWidgets(newSelected)
  }
}
```

**儲存處理**
```typescript
const handleEditModalSave = () => {
  // 調用 API 儲存配置
  // POST /settings/layouts { page_path, widgets, scope_type, scope_id }
  setEditModalVisible(false)
  // 更新面板顯示
}
```

**JSON 結構定義**
```
widgets_config = [
  { "widget_id": "incident_pending_count", "order": 1 },
  { "widget_id": "incident_in_progress", "order": 2 },
  { "widget_id": "incident_resolved_today", "order": 3 }
]
```
- `order` 為整數且由 1 起算；後端儲存時需重新排序以避免間隔。
- 若 `widgets_config` 為空陣列，表示該頁面不顯示任何指標卡片。

**資料流程**
1. 進入頁面時載入所有可用 Widget 註冊表。
2. 根據展開的面板顯示當前頁面的 Widget 配置。
3. 編輯過程中即時更新狀態，無需服務器請求。
4. 儲存時調用 `POST /settings/layouts` API 儲存配置到後端資料庫。
5. 儲存成功後更新面板顯示並顯示成功提示。

---

## 8. 個人設定

**頁面概述**
提供用戶個人資訊管理、偏好設定和安全配置功能。

**頁籤子頁面**
1. 個人資訊 (PersonalInformationPage)
2. 安全設定 (SecuritySettingsPage)
3. 偏好設定 (PreferenceSettingsPage)

**KPI 統計卡片**
1. 最後更新 (3天前, 個人資料更新時間)
2. 關聯團隊 (2個, 所屬團隊數量)
3. 安全評分 (92分, 密碼和2FA 安全評估)
4. 總人員數 (156, 142 個啟用中)

---

### 8.1 個人資訊頁面

**頁面概述**
個人資訊頁面顯示用戶的基本資料，由 Keycloak 統一管理。

**檔案對應**
- **前端實現**: `/frontend/src/pages/ProfilePage.tsx` (個人資訊標籤)
- **路由配置**: `/frontend/src/config/routes.ts`
- **組件依賴**:
  - `/frontend/src/components/PageHeader.tsx`
  - `/frontend/src/components/ContextualKPICard.tsx`
  - `/frontend/src/components/profile/PersonalInfoForm.tsx`

**界面元素**
- **頁面標題**: "個人資訊"

**個人資訊表單** (Form, 唯讀):
- **使用者名稱** (Input, name="username", 唯讀, 由 Keycloak 管理)
- **顯示名稱** (Input, name="display_name", 唯讀, 由 Keycloak 管理)
- **電子郵件** (Input, name="email", 唯讀, 由 Keycloak 管理)
- **所屬團隊** (Text, 顯示用戶所屬團隊, 唯讀)
- **角色** (Text, 顯示用戶角色, 唯讀)

**操作按鈕**:
- **前往 Keycloak 管理** (Button, 跳轉到 Keycloak 進行詳細設定)

**主要功能**
1. **資訊展示**: 顯示用戶基本資料
2. **Keycloak 整合**: 與 Keycloak 統一身份管理
3. **唯讀模式**: 防止直接修改關鍵資訊
4. **快速導航**: 跳轉到 Keycloak 進行詳細設定

**操作流程**
1. 查看個人基本資訊
2. 確認所屬團隊和角色
3. 點擊前往 Keycloak 進行詳細設定

---

### 8.2 安全設定頁面

**頁面概述**
安全設定頁面提供密碼變更和安全設定功能，由 Keycloak 統一管理。

**檔案對應**
- **前端實現**: `/frontend/src/pages/ProfilePage.tsx` (安全設定標籤)
- **路由配置**: `/frontend/src/config/routes.ts`
- **組件依賴**:
  - `/frontend/src/components/PageHeader.tsx`
  - `/frontend/src/components/ContextualKPICard.tsx`
  - `/frontend/src/components/profile/SecuritySettings.tsx`

**界面元素**
- **頁面標題**: "安全設定"

**密碼變更表單** (Form, 唯讀):
- **舊密碼** (Input.Password, name="old_password", 占位提示: "輸入當前密碼")
- **新密碼** (Input.Password, name="new_password", 占位提示: "輸入新密碼")
- **確認新密碼** (Input.Password, name="confirm_password", 占位提示: "再次輸入新密碼")

**安全功能**:
- **兩步驟驗證** (Switch, name="two_factor", 由 Keycloak 管理)
- **最近登入記錄** (Table):
  - 登入時間 (dataIndex: 'login_time')
  - IP 地址 (dataIndex: 'ip_address')
  - 裝置資訊 (dataIndex: 'device_info')
  - 登入結果 (dataIndex: 'status')

**操作按鈕**:
- **前往 Keycloak 管理** (Button, 跳轉到 Keycloak 進行詳細設定)
- **變更密碼** (Button, 提交密碼變更請求)

**主要功能**
1. **密碼管理**: 變更用戶密碼
2. **2FA 設定**: 啟用兩步驟驗證
3. **登入記錄**: 查看最近登入歷史
4. **Keycloak 整合**: 與 Keycloak 統一安全管理

**操作流程**
1. 填寫舊密碼和新密碼
2. 確認密碼變更
3. 查看最近登入記錄
4. 設定兩步驟驗證
5. 點擊前往 Keycloak 進行高級安全設定

---

### 8.3 偏好設定頁面

**頁面概述**
偏好設定頁面提供用戶個性化操作體驗的配置選項。

**檔案對應**
- **前端實現**: `/frontend/src/pages/ProfilePage.tsx` (偏好設定標籤)
- **路由配置**: `/frontend/src/config/routes.ts`
- **組件依賴**:
  - `/frontend/src/components/PageHeader.tsx`
  - `/frontend/src/components/ContextualKPICard.tsx`
  - `/frontend/src/components/profile/PreferencesSettings.tsx`

**界面元素**
- **頁面標題**: "偏好設定"

**偏好設定表單** (Form):
- **介面主題** (Select, name="theme", 選項: "淺色", "深色", "自動")
- **預設頁面** (Select, name="default_page", 支援任一儀表板作為首頁):
  - SRE 戰情室
  - 基礎設施洞察
  - 容量規劃儀表板
  - 自動化效能總覽
  - 團隊自訂儀表板
  - 事件管理
  - 資源管理
  - 分析中心
  - 自動化中心
- **語言** (Select, name="language", 選項: "繁體中文", "English")
- **時區** (Select, name="timezone", 選項: "Asia/Taipei", "UTC", "America/New_York" 等)
- **通知偏好** (Checkbox Group):
  - 郵件通知 (name="email_notification")
  - Slack 通知 (name="slack_notification")
  - 合併通知 (name="merge_notification")
- **顯示設定** (Checkbox Group):
  - 顯示動畫效果 (name="animation")
  - 顯示工具提示 (name="tooltips")
  - 緊湊模式 (name="compact_mode")

**操作按鈕**:
- **儲存偏好設定** (Button, type="primary", 儲存所有設定)
- **重置為預設** (Button, 恢復到系統預設設定)
- **預覽變更** (Button, 即時預覽設定效果)

**主要功能**
1. **主題設定**: 選擇介面顏色主題
2. **預設首頁**: 支援任一儀表板作為預設首頁，包括自訂儀表板
3. **語言時區**: 配置地區和語言設定
4. **通知偏好**: 自訂通知接收方式
5. **顯示選項**: 調整介面顯示效果
6. **儀表板偏好**: 設定儀表板刷新間隔和自動保存佈局

**操作流程**
1. 選擇介面主題和語言
2. 設定預設首頁（可選擇任一儀表板）
3. 配置時區和通知偏好
4. 調整顯示設定和儀表板偏好
5. 儲存並預覽變更效果

---

## 9. 文檔總結

### 9.1 平台功能概覽

SRE 平台總共包含 **8 個核心功能模組**，每個模組都有明確的頁面結構和 KPI 統計卡片：

1. **登入與導航** - 系統入口與全局功能
2. **事件管理** - 事件監控、規則配置與靜音管理
3. **資源管理** - 資源清單、群組管理與拓撲視圖
4. **儀表板管理** - 系統監控與業務洞察儀表板入口
5. **分析中心** - 深入了解系統趨勢、效能瓶頸和運營數據
6. **自動化中心** - 提供自動化腳本管理、排程配置和執行追蹤功能
7. **設定** - 提供系統全域配置管理，包含身份與存取管理、通知管理、平台設定
8. **個人設定** - 提供用戶個人資訊管理、偏好設定和安全配置功能

**系統特性**
- **全局搜索** - 平台級搜索功能，支援跨模組快速檢索
- **靈活首頁設定** - 支援任一儀表板作為預設首頁，包括自訂儀表板
- **統一設計語言** - 基於 Ant Design 5.19.1 設計系統
- **響應式佈局** - 支援桌面和移動端訪問
- **深色主題** - 完整的深色模式支援
- **個性化配置** - 用戶可自訂預設頁面、主題和儀表板偏好

### 10.2 平台頁面統計

SRE 平台共實現了 **33 個功能頁面**：

**核心功能模組對應**
1. 登入與導航 (4個頁面)
   - 登入頁面 (LoginPage) - `/frontend/src/pages/LoginPage.tsx` ✅ 已實現
   - 使用者選單 (UserMenu) - `/frontend/src/components/UserMenu.tsx` ✅ 已實現
   - 全局搜索欄 (GlobalSearch) - `/frontend/src/components/GlobalSearch.tsx` ✅ 已實現
   - 通知中心 (NotificationCenter) - `/frontend/src/components/NotificationCenter.tsx` ✅ 已實現
2. 事件管理 (3個頁面)
   - 事件列表 (EventListPage) - `/frontend/src/pages/IncidentsPage.tsx` ✅ 已實現
   - 事件規則 (EventRulePage) - `/frontend/src/pages/EventRulePage.tsx` ✅ 已實現
   - 靜音規則 (SilenceRulePage) - `/frontend/src/pages/SilenceRulePage.tsx` ✅ 已實現
3. 資源管理 (3個頁面)
   - 資源列表 (ResourceListPage) - `/frontend/src/pages/ResourcesPage.tsx`
   - 資源群組 (ResourceGroupPage) - `/frontend/src/pages/ResourceGroupPage.tsx`
   - 拓撲視圖 (TopologyViewPage) - `/frontend/src/pages/ResourceTopologyPage.tsx`
4. 儀表板管理 (3個頁面)
   - 儀表板列表 (DashboardPage) - `/frontend/src/pages/DashboardPage.tsx`
   - 基礎設施洞察儀表板 (SREInfrastructureInsightPage) - `/frontend/src/pages/SREInfrastructureInsightPage.tsx`
   - SRE 戰情室儀表板 (SREWarRoomPage) - `/frontend/src/pages/SREWarRoomPage.tsx`
5. 分析中心 (3個頁面)
   - 容量規劃 (CapacityPlanningPage) - `/frontend/src/pages/AnalyzingPage.tsx`
   - 資源負載分析 (ResourceLoadAnalysisPage) - `/frontend/src/pages/AnalyzingPage.tsx` (待實現)
   - AI 洞察 (AICapabilityPage) - `/frontend/src/pages/AnalyzingPage.tsx` (待實現)
6. 自動化中心 (3個頁面)
   - 腳本庫 (ScriptLibraryPage) - `/frontend/src/pages/AutomationPage.tsx`
   - 排程管理 (ScheduleManagementPage) - `/frontend/src/pages/AutomationPage.tsx` (待實現)
   - 執行日誌 (ExecutionLogsPage) - `/frontend/src/pages/AutomationPage.tsx` (待實現)
7. 設定 (14個頁面)
   - 身份與存取管理 (4個頁面)
     - 人員管理 (UserManagementPage) - `/frontend/src/pages/IdentitySettingsPage.tsx`
     - 團隊管理 (TeamManagementPage) - `/frontend/src/pages/IdentitySettingsPage.tsx` (待實現)
     - 角色管理 (RoleManagementPage) - `/frontend/src/pages/IdentitySettingsPage.tsx` (待實現)
     - 審計日誌 (AuditLogsPage) - `/frontend/src/pages/IdentitySettingsPage.tsx` (待實現)
   - 通知管理 (3個頁面)
     - 通知策略 (NotificationStrategyPage) - `/frontend/src/pages/NotificationSettingsPage.tsx`
     - 通知管道 (NotificationChannelPage) - `/frontend/src/pages/NotificationSettingsPage.tsx` (待實現)
     - 通知歷史 (NotificationHistoryPage) - `/frontend/src/pages/NotificationSettingsPage.tsx` (待實現)
   - 平台設定 (4個頁面)
     - 標籤管理 (TagManagementPage) - `/frontend/src/pages/PlatformSettingsPage.tsx` ✅ 已實現
     - 郵件設定 (EmailSettingsPage) - `/frontend/src/pages/PlatformSettingsPage.tsx` (待實現)
     - 身份驗證 (AuthSettingsPage) - `/frontend/src/pages/PlatformSettingsPage.tsx` (待實現)
     - 版面管理 (LayoutManagementPage) - `/frontend/src/pages/PlatformSettingsPage.tsx` ✅ 已實現
8. 個人設定 (3個頁面)
   - 個人資訊 (PersonalInformationPage) - `/frontend/src/pages/ProfilePage.tsx`
   - 安全設定 (SecuritySettingsPage) - `/frontend/src/pages/ProfilePage.tsx`
   - 偏好設定 (PreferenceSettingsPage) - `/frontend/src/pages/ProfilePage.tsx`


### 10.3 設計特點

**統一設計系統**
- 採用 Ant Design 5.19.1 作為基礎元件庫
- 實現完整的深色主題支援
- 統一的色彩系統和間距規範
- 響應式網格系統適配多螢幕尺寸

**檔案結構規範**
- **頁面組件**: `/frontend/src/pages/` - 包含所有主要功能頁面 (17個檔案)
- **共用組件**: `/frontend/src/components/` - 包含可重用的UI組件 (11個檔案)
  - 核心組件: `PageHeader.tsx`, `ToolbarActions.tsx`, `ContextualKPICard.tsx`
  - 個人設定: `profile/PersonalInfoForm.tsx`, `profile/PreferencesSettings.tsx`, `profile/SecuritySettings.tsx`
- **配置管理**: `/frontend/src/config/routes.ts` - 統一路由配置管理
- **工具函數**: `/frontend/src/utils/` - 共用工具函數和常量 (2個檔案)
- **佈局組件**: `/frontend/src/layouts/AppLayout.tsx` - 應用主佈局
- **樣式系統**: `/frontend/src/styles/` - 設計系統和變量定義 (2個檔案)

**元件化架構**
- 33個頁面使用 20+ 種 Ant Design 元件
- ECharts 用於數據視覺化展示
- 統一的 ToolbarActions 元件提供標準操作
- ContextualKPICard 元件用於指標展示

**交互體驗優化**
- 全局搜索支援模糊匹配和快速導航
- 統一的搜索篩選按鈕替代分離的搜索和篩選
- 即時預覽和測試功能
- 直觀的操作反饋和狀態顯示

### 10.4 使用指南

**不同角色訪問路徑**

**SRE 工程師**
- 主要使用事件管理、資源管理、儀表板管理
- 關注系統穩定性和效能監控
- 可將 SRE 戰情室或基礎設施洞察設為首頁
- 需要配置通知策略和自動化腳本

**開發團隊**
- 主要使用資源管理、分析中心
- 關注應用效能和容量規劃
- 可將容量規劃儀表板或資源監控設為首頁
- 需要查看系統健康度和錯誤趨勢

**管理層**
- 主要使用儀表板管理、分析中心
- 關注業務指標和整體系統健康度
- 可將業務儀表板或分析報告設為首頁
- 需要查看高層次的統計報告

**平台管理員**
- 主要使用設定、通知管理
- 負責系統配置和用戶權限管理
- 可將管理儀表板設為首頁
- 需要管理標籤系統和認證設定

**自訂儀表板用戶**
- 可創建個人化儀表板並設為預設首頁
- 支援團隊共享的自訂儀表板
- 可根據工作需求靈活調整首頁內容

---

### 10.5 完整頁面架構與 KPI 對應

**登入與導航**
- 登入頁面 (LoginPage)
- 使用者選單 (UserMenu)
- 全局搜索欄 (GlobalSearch)
- 通知中心 (NotificationCenter)

**事件管理**
- 事件列表頁面 (EventListPage)
  - 指標概覽卡片: 總事件數、待處理事件、今日解決事件、平均處理時間
- 事件規則頁面 (EventRulePage)
  - 指標概覽卡片: 規則總數、啟用規則、觸發次數、成功率
- 靜音規則頁面 (SilenceRulePage)
  - 指標概覽卡片: 靜音規則數、活躍靜音、今日靜音事件、覆蓋率

**資源管理**
- 資源列表頁面 (ResourceListPage)
  - 指標概覽卡片: 總資源數、正常資源、異常資源、離線資源
- 資源群組頁面 (ResourceGroupPage)
  - 指標概覽卡片: 群組總數、資源分佈、群組健康度、使用率
- 拓撲視圖頁面 (TopologyViewPage)
  - 指標概覽卡片: 節點總數、連線數、異常節點、健康度

**儀表板管理**
- 儀表板列表頁面 (DashboardListPage)
  - 指標概覽卡片: 儀表板總數、自訂儀表板、已發布、自動化覆蓋率
- SRE 戰情室儀表板 (SREWarRoomPage)
  - 指標概覽卡片: 業務系統健康度、關鍵事件監控、SLA 指標追蹤、資源使用概覽
- 基礎設施洞察儀表板 (SREInfrastructureInsightPage)
  - 指標概覽卡片: 總資源數、運行中、異常、離線

**分析中心**
- 容量規劃頁面 (CapacityPlanningPage)
  - 指標概覽卡片: 數據點總數、分析報告、處理時間、準確率

**身份與存取管理**
- 人員管理頁面 (UserManagementPage)
  - 指標概覽卡片: 總人員數、在線人員、團隊數量、待處理邀請
- 團隊管理頁面 (TeamManagementPage)
  - 指標概覽卡片: 團隊數量、總成員數、活躍團隊、跨團隊成員
- 角色管理頁面 (RoleManagementPage)
  - 指標概覽卡片: 角色總數、內建角色、自訂角色、權限覆蓋
- 審計日誌頁面 (AuditLogsPage)
  - 指標概覽卡片: 今日操作數、成功率、高風險操作、異常IP

**自動化中心**
- 腳本庫頁面 (ScriptLibraryPage)
  - 指標概覽卡片: 腳本總數、執行成功率、24小時執行、排程任務
- 排程管理頁面 (ScheduleManagementPage)
  - 指標概覽卡片: 排程總數、活躍排程、執行成功率、平均耗時
- 執行日誌頁面 (ExecutionLogsPage)
  - 指標概覽卡片: 今日執行數、成功率、失敗數、平均耗時

**通知管理**
- 通知策略頁面 (NotificationStrategyPage)
  - 指標概覽卡片: 策略總數、啟用策略、今日觸發、成功率
- 通知管道頁面 (NotificationChannelPage)
  - 指標概覽卡片: 管道總數、正常管道、測試成功率、今日發送量
- 通知歷史頁面 (NotificationHistoryPage)
  - 指標概覽卡片: 今日通知量、成功率、平均耗時、接收者數量

**設定**
- 身份與存取管理
  - 人員管理頁面 (UserManagementPage)
    - 指標概覽卡片: 總人員數、在線人員、團隊數量、待處理邀請
  - 團隊管理頁面 (TeamManagementPage)
    - 指標概覽卡片: 團隊數量、總成員數、活躍團隊、跨團隊成員
  - 角色管理頁面 (RoleManagementPage)
    - 指標概覽卡片: 角色總數、內建角色、自訂角色、權限覆蓋
  - 審計日誌頁面 (AuditLogsPage)
    - 指標概覽卡片: 今日操作數、成功率、高風險操作、異常IP
- 通知管理
  - 通知策略頁面 (NotificationStrategyPage)
    - 指標概覽卡片: 策略總數、啟用策略、今日觸發、成功率
  - 通知管道頁面 (NotificationChannelPage)
    - 指標概覽卡片: 管道總數、正常管道、測試成功率、今日發送量
  - 通知歷史頁面 (NotificationHistoryPage)
    - 指標概覽卡片: 今日通知量、成功率、平均耗時、接收者數量
- 平台設定
  - 標籤管理頁面 (TagManagementPage)
    - 指標概覽卡片: 標籤總數、活躍會話、配置異動
  - 郵件設定頁面 (EmailSettingsPage)
    - 指標概覽卡片: 郵件伺服器狀態、測試成功率、今日發送量、錯誤率
  - 身份驗證頁面 (AuthSettingsPage)
    - 指標概覽卡片: 認證提供商狀態、活躍會話數、登入成功率、失敗次數

**個人設定**
- 個人資訊頁面 (PersonalInformationPage)
  - 指標概覽卡片: 個人資料完整度、最後更新時間、關聯團隊數、角色數量
- 密碼安全頁面 (PasswordSecurityPage)
  - 指標概覽卡片: 密碼強度、2FA 狀態、最近登入、異常登入
- 偏好設定頁面 (PreferenceSettingsPage)
  - 指標概覽卡片: 設定完整度、最後更新、主題使用、語言設定

---

### 10.6 Ant Design 元件使用情况

**佈局元件 (Layout Components)**
- Layout: 全域佈局框架
- Sider: 側邊欄導航
- Header: 頂部導航欄
- Content: 主內容區域
- Footer: 頁面底部

**導航元件 (Navigation Components)**
- Menu: 側邊欄選單
- Breadcrumb: 麵包屑導航
- Dropdown: 下拉選單
- Pagination: 分頁控制

**資料展示元件 (Data Display Components)**
- Table: 資料表格，支援排序、分頁、篩選
- List: 清單展示
- Descriptions: 描述清單
- Timeline: 時間軸
- Tag: 標籤
- Badge: 徽章
- Avatar: 頭像
- Card: 卡片容器
- Tabs: 分頁標籤

**表單元件 (Form Components)**
- Form: 表單容器
- Input: 輸入框
- Input.Password: 密碼輸入
- TextArea: 多行文字輸入
- Select: 下拉選擇
- Checkbox: 多選框
- Radio: 單選框
- Switch: 開關
- DatePicker: 日期選擇器
- TimePicker: 時間選擇器
- RangePicker: 日期範圍選擇器

**反饋元件 (Feedback Components)**
- Modal: 對話框
- Drawer: 抽屜
- Message: 全域提示
- Notification: 通知提醒
- Alert: 警告提示
- Popconfirm: 確認對話框
- Tooltip: 文字提示
- Popover: 彈出框

**其他元件 (Other Components)**
- Button: 按鈕
- Icon: 圖示
- Steps: 步驟條
- Progress: 進度條
- Space: 間距容器
- Divider: 分割線

### 10.7 ECharts 圖表元件使用情况

**圖表類型**
- Line Chart: 折線圖，用於趨勢分析
- Bar Chart: 柱狀圖，用於數據對比
- Pie Chart: 圓餅圖，用於比例展示
- Heatmap: 熱力圖，用於密度展示
- Area Chart: 區域圖，用於趨勢填充
- Scatter Chart: 散點圖，用於關聯分析

**使用場景**
- 資源使用趨勢分析 (Line Chart)
- 事件統計對比 (Bar Chart)
- 風險等級分佈 (Pie Chart)
- 系統健康度監控 (Heatmap)
- 容量預測分析 (Area Chart)

### 10.8 頁面元件使用统计

**元件使用頻率統計**

| 元件類型 | 使用頁面數 | 使用頻率 | 主要用途 |
|---------|-----------|----------|----------|
| Table | 15 | 高 | 資料清單展示 |
| Form | 12 | 高 | 資料輸入表單 |
| Modal | 8 | 中 | 彈窗對話框 |
| Tabs | 6 | 中 | 頁面分頁 |
| ECharts | 5 | 中 | 數據視覺化 |

**Ant Design 元件統計**
- Layout 相關: 33頁面全部使用
- Table: 15個頁面
- Form: 12個頁面
- Modal/Drawer: 10個頁面
- Button: 20+ 個頁面
- Input/Select: 15個頁面

**ECharts 圖表統計**
- Line Chart: 5個頁面
- Bar Chart: 3個頁面
- Pie Chart: 2個頁面
- Heatmap: 2個頁面
- Area Chart: 1個頁面

### 10.9 UI 架構設計特點

**元件化設計**
- 採用統一的 ToolbarActions 元件
- ContextualKPICard 用於指標展示
- 模組化的表單和表格元件
- 可重用的彈窗和抽屜元件

**響應式佈局**
- 基於 Ant Design 網格系統
- 支援桌面和移動端適配
- 靈活的佈局調整能力
- 統一的間距和字體系統

**視覺化呈現**
- ECharts 提供豐富的圖表類型
- 統一的色彩和字體系統
- 深色主題完整支援
- 即時數據更新和動畫效果

**交互體驗**
- 統一的搜索和篩選入口
- 即時表單驗證和反饋
- 直觀的操作按鈕和狀態指示
- 快速的頁面導航和切換

### 10.10 技術棧總結

**前端技術棧**
- **React 18**: 主要的 UI 框架
- **Ant Design 5.19.1**: 企業級 UI 元件庫
- **ECharts 5.5.0**: 數據視覺化庫
- **Day.js**: 日期時間處理
- **Babel Standalone**: 瀏覽器內 JSX 轉換

**前端檔案結構**
- **主應用**: `/frontend/src/App.tsx` - 應用入口和路由配置
- **頁面組件**: `/frontend/src/pages/` - 功能頁面實現 (17個檔案)
- **共用組件**: `/frontend/src/components/` - UI組件 (11個檔案)
- **配置管理**: `/frontend/src/config/routes.ts` - 路由和選單配置
- **工具函數**: `/frontend/src/utils/` - 共用工具函數 (2個檔案)
- **樣式定義**: `/frontend/src/styles/` - 設計系統和變量 (2個檔案)
- **佈局系統**: `/frontend/src/layouts/AppLayout.tsx` - 主佈局組件

**設計系統特性**
- **Design Tokens**: 統一的設計標記系統
- **8px 網格系統**: 規範化的間距系統
- **語義化色彩**: 基於業務含義的色彩定義
- **統一圖標語言**: 一致的圖標使用規範
- **深色主題**: 完整的深色模式支援

**效能優化**
- **React.memo 用於元件記憶化** - `/frontend/src/components/` 組件
- **useCallback 和 useMemo 優化渲染** - 避免不必要的重渲染
- **圖表虛擬化渲染** - ECharts 組件效能優化
- **按需載入和代碼分割** - 路由級別的 lazy loading

---
