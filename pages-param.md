# SRE 平台前端每個頁面的完整清單

## 🔗 **導航結構**

```
SRE 平台
├── 事件管理 (Incidents) - Tab 管理 (事件列表 | 告警規則 | 靜音規則)
├── 資源管理 (Resources) - Tab 管理 (資源列表 | 資源群組 | 資源拓撲)
├── 儀表板 (Dashboards)
├── 分析中心 (Analysis) - Tab 管理 (容量規劃)
├── 自動化中心 (Automation) - Tab 管理 (腳本庫 | 排程管理 | 執行日誌)
└── 設定 (Settings) [父選單 - 預設展開]
    ├── 用戶與權限 - Tab 管理 (人員管理 | 團隊管理 | 角色管理 | 審計日誌)
    ├── 通知管理 - Tab 管理 (通知管道 | 通知策略)
    └── 平台設定 - Tab 管理 (標籤管理 | 郵件設定 | 身份驗證)

```

## **頁面盤點清單**

### ✅ **已實現頁面** (按導航順序)

#### 事件中心
- [x] 事件列表頁面 (IncidentsPage > IncidentListPage)
- [x] 告警規則子頁面 (IncidentsPage > AlertingRulesPage)
- [x] 靜音規則子頁面 (IncidentsPage > SilencesPage)

#### 資源管理
- [x] 資源列表頁面 (ResourcesPage > ResourceListPage)
- [x] 資源群組頁面 (ResourcesPage > ResourceGroupsPage)

#### 儀表板
- [x] 儀表板中心頁面 (DashboardAdministrationPage) - 卡片導航入口，支援設為預設首頁
- [x] 基礎設施洞察頁面 (AlertsInsightsPage) - 資源監控
- [x] SRE 戰情室頁面 (BusinessDashboardPage) - 業務監控儀表板
- [ ] 管理儀表板頁面 (executive-dashboard) - 待實現
- [ ] 自訂報告頁面 (custom-reports) - 待實現

#### 分析
- [x] 容量規劃頁面 (AnalysisPage > CapacityPlanningPage)

#### 自動化
- [x] 腳本庫子頁面 (AutomationPage > ScriptsPage)
- [x] 排程管理子頁面 (AutomationPage > SchedulesPage)
- [x] 執行記錄頁面 (AutomationPage > ExecutionsPage)

#### 設定
- [x] 用戶管理子頁面 (Settings > UserManagementPage)
- [x] 團隊管理子頁面 (Settings > TeamManagementPage)
- [x] 角色管理子頁面 (Settings > RoleManagementPage)
- [x] 通知策略頁面 (Settings > NotificationStrategiesPage)
- [x] 通知管道頁面 (Settings > NotificationChannelsPage)
- [x] 通知歷史頁面 (Settings > NotificationHistoryPage)
- [x] 郵件設定頁面 (Settings > EmailSettingsPage)
- [x] 身份驗證設定頁面 (Settings > AuthSettingsPage)
- [x] 標籤管理頁面 (Settings > TagKeyManagementPage)
- [x] 設定管理頁面 (Settings > SettingsAdministrationPage)

### ❌ **未實現頁面** (待開發)

#### 儀表板模組
- [ ] 管理儀表板頁面 (executive-dashboard)
- [ ] 自訂報告頁面 (custom-reports)

#### 用戶與權限模組
- [x] 個人信息頁面 (PersonalInfoPage)
- [x] 密碼安全頁面 (PasswordSecurityPage)
- [x] 偏好設定頁面 (PreferencesPage)
- [x] 個人資料頁面 (ProfilePage)

#### 其他實現頁面
- [x] 業務儀表板頁面 (BusinessDashboardPage)
- [x] 整合資源總覽頁面 (IntegratedResourceOverviewPage)
- [x] 資源群組詳情頁面 (ResourceGroupsDetailPage)
- [x] 資源拓撲詳情頁面 (ResourceTopologyDetailPage)
- [x] 告警洞察頁面 (AlertsInsightsPage)

---

## **導航結構覆蓋總結**

### **完整覆蓋統計**
- **導航頂層選單**: 7個 (100% 實現)
- **核心功能頁面**: 16個 (已實現 16/16 = 100%)
- **設定子選單**: 14個 (已實現 14/14 = 100%)
- **儀表板子頁面**: 5個 (已實現 4/5 = 80%)
- **額外實現頁面**: 5個
- **總頁面覆蓋率**: 35/37 = 95%

### **實現進度詳情**

#### ✅ **完全實現的模組**
- **事件中心**: 3/3頁面 ✓
- **資源管理**: 3/3頁面 ✓
- **儀表板**: 1/1頁面 ✓
- **分析**: 1/1頁面 ✓
- **自動化**: 3/3頁面 ✓

#### **部分實現的模組**
- **儀表板**: 4/6頁面 (67% 完成)
  - ✅ 儀表板中心頁面 (1/1頁面) - 卡片導航入口
  - ✅ 基礎設施洞察頁面 (1/1頁面) - 資源監控
  - ✅ 資源總覽頁面 (1/1頁面)
  - ✅ 業務儀表板頁面 (1/1頁面)
  - ✅ 整合資源總覽頁面 (1/1頁面)
  - ❌ 管理儀表板頁面 (0/1頁面)
  - ❌ 自訂報告頁面 (0/1頁面)

### **開發優先順序建議**
1. **高優先級**: 儀表板功能補全 (管理儀表板、自訂報告)
2. **中優先級**: 用戶體驗優化 (個人中心頁面整合)
3. **低優先級**: 其他增強功能 (如高級分析、客製化儀表板等)

### **技術實現統計**
- **總組件參數數**: 約155+個
- **總State變數數**: 約115+個
- **總API端點數**: 約60+個
- **總資料結構數**: 約30+個
- **總實現頁面數**: 35個
- **新增功能**: 預設首頁設定功能、資源拓撲視圖

## 參數命名規範

### 命名規範原則

#### **分層命名規範**
- **API/資料層**: 使用 `snake_case` (底線式) - 與後端 API 保持一致
- **JavaScript/React層**: 使用 `camelCase` (駝峰式) - 符合 JavaScript 慣例
- **組件名稱**: 使用 `PascalCase` (帕斯卡式) - React 組件慣例

#### **資料流轉命名轉換**
```javascript
// API 響應 (snake_case)
{
  "resource_name": "web-server-01",
  "ip_address": "192.168.1.1",
  "created_at": "2024-01-01T00:00:00Z"
}

// JavaScript 處理 (camelCase)
{
  resourceName: "web-server-01",
  ipAddress: "192.168.1.1",
  createdAt: "2024-01-01T00:00:00Z"
}
```

### 通用參數結構
- **頁面 Props**: `themeMode`, `setThemeMode` (主題切換)
- **路由參數**: `pageKey`, `pageParams` (頁面導航)
- **狀態管理**: `useState`, `useLocalStorageState` (狀態持久化)

### 資料結構規範

#### **API 資料結構** (snake_case)
- **資源物件**: `key`, `name`, `type`, `status`, `ip_address`, `groups`, `tags`, `cpu_usage`, `memory_usage`, `created_at`, `updated_at`
- **告警物件**: `id`, `severity`, `summary`, `resource_name`, `created_at`, `status`, `business_impact`
- **用戶物件**: `id`, `username`, `email`, `name`, `roles`, `teams`, `enabled`, `last_login`, `created_at`
- **腳本物件**: `id`, `name`, `type`, `content`, `creator`, `status`, `created_at`, `updated_at`

#### **JavaScript 物件** (camelCase)
- **資源物件**: `key`, `name`, `type`, `status`, `ipAddress`, `groups`, `tags`, `cpuUsage`, `memoryUsage`, `createdAt`, `updatedAt`
- **告警物件**: `id`, `severity`, `summary`, `resourceName`, `createdAt`, `status`, `businessImpact`
- **用戶物件**: `id`, `username`, `email`, `name`, `roles`, `teams`, `enabled`, `lastLogin`, `createdAt`
- **腳本物件**: `id`, `name`, `type`, `content`, `creator`, `status`, `createdAt`, `updatedAt`

---

## 🏠 首頁 (HomePage)

### 組件參數
**Props:**
- `themeMode: string` - 主題模式 ('dark' | 'light')
- `setThemeMode: (mode: string) => void` - 主題切換函數

**State:**
- `currentView: string` - 當前視圖 ('overview' | 'detailed')
- `selectedTimeRange: string` - 時間範圍 ('1h' | '24h' | '7d' | '30d')
- `refreshInterval: number` - 自動刷新間隔 (毫秒)

**頁面描述**: 系統首頁儀表板，展示系統整體健康狀態和關鍵指標

**主要內容區域**:
- **頁面標題**: "歡迎使用 SRE 平台"
- **統計卡片區域**: 4個關鍵指標卡片
  - 總資源數
  - 活躍告警數
  - 系統健康度
  - 今日事件數

**圖表區域**:
- **資源群組狀態總覽**: 堆疊長條圖，顯示各群組的健康/警告/嚴重資源數量
- **資源類型分佈**: 圓餅圖，顯示不同類型資源的數量分佈

**快速操作區域**:
- **常用功能卡片**: 資源管理、告警處理、自動化腳本、系統設定

---

## 儀表板頁面 - 資源總覽 (DashboardsPage > ResourceOverviewPage)

### 組件參數
**Props:**
- `themeMode: string` - 主題模式
- `setThemeMode: (mode: string) => void` - 主題切換函數

**State:**
- `selectedTimeRange: string` - 時間範圍篩選
- `resourceFilter: object` - 資源類型篩選 {type: string[], status: string[]}
- `sortBy: string` - 排序欄位 ('usage' | 'alarms' | 'name')
- `sortOrder: string` - 排序順序 ('asc' | 'desc')
- `expandedSections: string[]` - 展開的區域

**API 參數:**
- `GET /api/resources/overview` - 獲取資源總覽數據
  - Query: `{timeRange: string, filters: object}`

**資料結構:**
```javascript
{
  key: string,           // 資源唯一標識
  name: string,          // 資源名稱
  type: string,          // 資源類型 ('server' | 'database' | 'cache' | 'gateway')
  status: string,        // 健康狀態 ('healthy' | 'warning' | 'critical')
  // 註：以下為即時指標，應由 Metrics DB (如 Prometheus) 提供
  cpu_usage: number,     // CPU 使用率 (0-100)
  memory_usage: number,  // 記憶體使用率 (0-100)
  alarms: Alarm[],       // 活躍告警列表 (關聯至事件系統)
  trend: TrendData[],    // 趨勢數據 (來自 Metrics DB)
  last_updated: string   // 最後更新時間
}
```

**頁面描述**: 儀表板中的資源總覽子頁面，展示系統整體健康狀態和關鍵指標

**頁面標題**: "資源總覽"

**統計卡片區域**:
- **資源狀態統計**: 健康/警告/嚴重資源數量
- **資源類型統計**: 各類型資源數量
- **告警統計**: 活躍告警數量統計

**主要內容區域**:
- **Top N 資源使用列表**: 顯示CPU/記憶體使用率最高的資源
- **AI 風險預測**: 預測未來可能出現問題的資源
- **需關注的資源列表**: 當前處於警告或嚴重狀態的資源

**互動功能**:
- 點擊資源項目可跳轉到資源詳情頁面
- 支援資源狀態過濾

---

## 資源管理相關頁面

### 1. 資源列表頁面 (ResourceListPage)

### 組件參數
**Props:**
- `themeMode: string` - 主題模式
- `setThemeMode: (mode: string) => void` - 主題切換函數

**State:**
- `viewMode: string` - 查看模式 ('list' | 'dashboard')
- `searchValue: string` - 搜尋關鍵字
- `filters: object` - 篩選條件 {status: string[], type: string[], team: string[]}
- `sortInfo: object` - 排序信息 {field: string, order: 'asc'|'desc'}
- `selectedRowKeys: string[]` - 選中的行鍵
- `tableDensity: string` - 表格密度 ('compact' | 'standard' | 'comfortable')
- `currentPage: number` - 當前頁碼
- `pageSize: number` - 每頁大小
- `visibleColumns: string[]` - 可見欄位列表

**API 參數:**
- `GET /api/resources` - 獲取資源列表
  - Query: `{page: number, size: number, search: string, filters: object, sort: object}`
- `POST /api/resources` - 新增資源
  - Body: `ResourceCreateRequest`
- `PUT /api/resources/{id}` - 更新資源
  - Body: `ResourceUpdateRequest`
- `DELETE /api/resources/{id}` - 刪除資源

**資料結構:**
```javascript
// 資源完整結構
{
  key: string,              // 唯一標識
  name: string,             // 資源名稱
  type: string,             // 資源類型 ('server'|'database'|'cache'|'gateway')
  status: string,           // 健康狀態 ('healthy'|'warning'|'critical')
  ip_address: string,       // IP 位址
  location: string,         // 位置資訊
  team: string,             // 負責團隊
  groups: string[],         // 所屬群組 ID 列表
  tags: string[],           // 標籤列表
  // 註：以下為即時指標，應由 Metrics DB (如 Prometheus) 提供
  cpu_usage: number,        // CPU 使用率
  memory_usage: number,     // 記憶體使用率
  alarms: Alarm[],          // 活躍告警 (關聯至事件系統)
  trend: TrendData[],       // 趨勢數據 (來自 Metrics DB)
  last_updated: string,     // 最後更新時間
  created_at: string,       // 創建時間
  updated_at: string        // 更新時間
}

// 新增資源請求
ResourceCreateRequest: {
  name: string,             // 必填
  type: string,             // 必填
  ip_address: string,       // 必填
  groups: string[],         // 可選
  tags: string[],           // 可選
  description: string       // 可選
}
```

**頁面描述**: 資源的詳細列表管理頁面，支援列表和儀表板兩種查看模式

**工具列按鈕**:
- **搜尋框**: 搜尋資源名稱、IP或標籤
- **篩選按鈕**: 彈出篩選面板 (狀態、類型、資源名稱)
- **匯出按鈕**: 匯出資源列表
- **掃描網路按鈕**: 網路資源掃描
- **新增資源按鈕**: 開啟新增資源彈窗

**表格欄位**:
- **狀態** (`status`) - 顯示資源健康狀態 (HEALTHY/WARNING/CRITICAL)
- **資源名稱** (`name`) - 可點擊鏈接，顯示資源名稱
- **IP位址** (`ip_address`) - 資源IP地址
- **所屬團隊** (`team`) - 根據資源群組顯示負責團隊名稱
- **類型** (`type`) - 資源類型標籤 (Database/Server/Gateway/Cache)
- **標籤** (`tags`) - 多個標籤顯示，支援顏色區分
- **即時告警** (`alarms`) - 活躍告警統計，顯示告警數量和嚴重性

**操作按鈕**:
- **編輯** - 編輯資源信息
- **刪除** - 刪除資源

**儀表板模式**:
- 資源狀態統計圖表
- 資源類型分佈圖表
- 資源趨勢圖表

**新增資源彈窗**:
- **寬度**: 600px
- **表單欄位**:
  - **資源名稱** (`name`) - 必填
  - **IP位址** (`ip_address`) - 必填
  - **類型** (`type`) - 下拉選單 (Database/Server/Gateway/Cache)
  - **所屬群組** (`groups`) - 多選下拉
  - **標籤** (`tags`) - 標籤輸入
  - **描述** (`description`) - 文字域
- **操作按鈕**:
  - **取消** - 關閉彈窗
  - **儲存** - 新增資源

### 2. 資源群組頁面 (ResourceGroupsPage)

### 組件參數
**Props:**
- `themeMode: string` - 主題模式
- `setThemeMode: (mode: string) => void` - 主題切換函數

**State:**
- `searchValue: string` - 搜尋關鍵字
- `filters: object` - 篩選條件 {responsibleTeam: string[], memberCount: object}
- `selectedRowKeys: string[]` - 選中的行鍵
- `sortInfo: object` - 排序信息
- `isColumnSettingsOpen: boolean` - 欄位設定抽屜開啟狀態
- `visibleColumns: string[]` - 可見欄位列表

**API 參數:**
- `GET /api/resource-groups` - 獲取資源群組列表
  - Query: `{search: string, filters: object, sort: object}`
- `POST /api/resource-groups` - 新增資源群組
  - Body: `ResourceGroupCreateRequest`
- `PUT /api/resource-groups/{id}` - 更新資源群組
- `DELETE /api/resource-groups/{id}` - 刪除資源群組

**資料結構:**
```javascript
// 資源群組結構
{
  key: string,                    // 唯一標識
  name: string,                   // 群組名稱
  description: string,            // 群組描述
  responsibleTeam: string,        // 負責團隊
  members: string[],              // 成員資源 ID 列表
  memberDetails: Resource[],      // 成員資源詳情
  status: string,                 // 群組整體狀態
  created_at: string,             // 創建時間
  updated_at: string              // 更新時間
}

// 資源群組統計
ResourceGroupStats: {
  totalMembers: number,           // 總成員數
  healthyCount: number,           // 健康資源數
  warningCount: number,           // 警告資源數
  criticalCount: number           // 嚴重資源數
}
```

**頁面描述**: 資源群組的管理頁面

**工具列按鈕**:
- **搜尋框**: 搜尋群組名稱或描述
- **篩選按鈕**: 彈出篩選面板
- **新增群組按鈕**: 開啟新增群組彈窗

**表格欄位**:
- **群組名稱** (`name`) - 群組名稱
- **描述** (`description`) - 群組描述
- **負責團隊** (`responsibleTeam`) - 負責團隊名稱
- **成員數量** (`members`) - 群組內資源數量
- **狀態** (`status`) - 成員資源狀態統計 (Healthy/Warning/Critical 標籤)

**操作按鈕**:
- **編輯** - 編輯群組信息
- **刪除** - 刪除群組

**新增群組彈窗**:
- **寬度**: 600px
- **表單欄位**:
  - **群組名稱** (`name`) - 必填
  - **描述** (`description`) - 必填
  - **負責團隊** (`responsibleTeam`) - 下拉選單
  - **成員** (`members`) - 多選下拉 (資源列表)
- **操作按鈕**:
  - **取消** - 關閉彈窗
  - **儲存** - 新增群組

### 3. 資源拓撲頁面 (ResourceTopologyTab)

### 組件參數
**Props:**
- `onNavigate: (pageKey: string, params?: object) => void` - 頁面導航函數

**State:**
- `selectedNode: object | null` - 當前選中的節點資訊
- `layoutType: string` - 圖表佈局類型 ('force' | 'circular')
- `chartRef: React.RefObject` - ECharts圖表容器引用
- `chartInstance: echarts.ECharts | null` - ECharts實例

### 技術實現
**前端框架:**
- **圖表庫**: ECharts 5.5.0 (Graph 圖表類型)
- **渲染器**: SVG (高清晰度圖形渲染)
- **互動支援**: 縮放、拖拽、點擊、懸停

**數據來源:**
- **節點數據**: 從現有資源數據轉換，包含實體資源和虛擬服務
- **連線數據**: 基於資源間依賴關係定義 (API調用、資料讀寫、服務依賴等)
- **即時更新**: 支援資源狀態變化時的即時視覺化更新

### 資料結構
```javascript
// 拓撲節點結構
TopologyNode: {
  id: string,              // 節點唯一標識
  name: string,            // 節點顯示名稱
  type: string,            // 資源類型 ('database'|'server'|'gateway'|'cache'|'service')
  status: string,          // 健康狀態 ('healthy'|'warning'|'critical')
  ip_address: string,      // IP位址
  category: number         // 視覺化分類 (0-5)
}

// 拓撲連線結構
TopologyLink: {
  source: string,          // 來源節點ID
  target: string,          // 目標節點ID
  label: string,           // 連線標籤 ('API調用'|'資料讀寫'|'流量路由'等)
  lineStyle: object        // 線條樣式配置
}

// 節點樣式配置
NodeStyle: {
  color: string,           // 節點顏色 (基於狀態和類型)
  borderColor: string,     // 邊框顏色
  shadowColor: string,     // 陰影顏色
  symbolSize: number       // 節點大小
}
```

### 視覺化特點
**顏色編碼系統:**
- **狀態顏色**: 健康(綠#52c41a) / 警告(黃#faad14) / 嚴重(紅#ff4d4f)
- **類型顏色**: 資料庫(藍#1890ff) / 伺服器(紫#722ed1) / 網關(青#13c2c2) / 快取(粉#eb2f96) / 服務(綠#52c41a) / 監控(橙#fa8c16)
- **優先級**: 狀態顏色覆蓋類型顏色，確保健康狀態的可見性

**佈局算法:**
- **力引導佈局**: 模擬物理力學，自動優化節點位置
- **環形佈局**: 將節點排列在圓形軌道上，便於比較
- **動態切換**: 使用者可即時在不同佈局間切換

### 互動功能
**基礎互動:**
- **節點點擊**: 顯示資源詳細資訊面板，包含完整屬性
- **節點懸停**: 顯示工具提示 (Tooltip)，包含關鍵資訊摘要
- **圖表拖拽**: 支援整個圖表的平移和縮放
- **節點拖拽**: 可手動調整個別節點位置

**進階互動:**
- **相鄰高亮**: 點擊節點時自動高亮所有相關連線和相鄰節點
- **狀態視覺化**: 即時反映資源健康狀態變化
- **下鑽導航**: 從拓撲圖直接跳轉到資源詳情頁面

### 工具列控制
**佈局選擇器:**
- **類型**: Select 下拉選單
- **選項**: 力引導佈局 / 環形佈局
- **功能**: 即時切換圖表佈局算法

**重新整理按鈕:**
- **圖示**: ReloadOutlined
- **功能**: 重新載入拓撲數據並重繪圖表
- **回饋**: 成功訊息提示

### 詳細資訊面板
**觸發條件:** 點擊任意節點時顯示
**位置:** 圖表區域右側，300px寬度
**內容:**
- **資源名稱** (`name`) - 完整資源名稱
- **資源類型** (`type`) - 資源類型標籤
- **健康狀態** (`status`) - 彩色狀態指示器
- **IP位址** (`ip_address`) - 網路位址資訊

**操作按鈕:**
- **查看資源詳情** - 導航到資源列表頁面並篩選該資源

### 操作說明
**說明區域:**
- **位置**: 圖表底部
- **內容**: 簡潔的互動操作指南
- **樣式**: 淺色背景，適當內邊距

### API整合
**數據端點:**
- `GET /api/resources/topology` - 獲取拓撲圖數據
  - Response: `{ nodes: TopologyNode[], links: TopologyLink[] }`
- `GET /api/resources/{id}/topology` - 獲取單個資源的拓撲上下文
- `WebSocket /ws/resources/topology` - 即時拓撲狀態更新

**即時更新:**
- **健康狀態變化**: 節點顏色即時更新
- **新增/刪除資源**: 拓撲圖動態重新計算
- **依賴關係變化**: 連線動態增減

### 性能優化
**渲染優化:**
- **SVG渲染器**: 高品質圖形輸出
- **虛擬化**: 大規模拓撲圖的效能優化
- **增量更新**: 只重新渲染變化的部分

**數據優化:**
- **快取策略**: 本地快取拓撲數據
- **分頁載入**: 大型拓撲圖的分段載入
- **懶載入**: 按需載入節點詳細資訊

### 故障處理
**錯誤狀態:**
- **數據載入失敗**: 顯示友好的錯誤提示
- **圖表渲染異常**: 提供重新載入選項
- **網路中斷**: 本地快取數據降級顯示

**降級方案:**
- **離線模式**: 使用快取數據繼續顯示
- **簡化模式**: 減少互動功能，專注於基本顯示
- **靜態備份**: 提供靜態拓撲圖作為備用

## 標籤管理頁面

### 3. 標籤管理頁面 (TagKeyManagementPage)

### 組件參數
**Props:**
- `themeMode: string` - 主題模式
- `setThemeMode: (mode: string) => void` - 主題切換函數

**State:**
- `searchValue: string` - 搜尋關鍵字
- `filters: object` - 篩選條件 {type: string[], required: boolean}
- `selectedRowKeys: string[]` - 選中的行鍵
- `tagDrawerVisible: boolean` - 標籤值管理抽屜顯示狀態
- `currentTagKey: object` - 當前編輯的標籤鍵
- `modalVisible: boolean` - 新增/編輯模態框顯示狀態

**API 參數:**
- `GET /api/tag-keys` - 獲取標籤鍵列表
  - Query: `{search: string, filters: object}`
- `POST /api/tag-keys` - 新增標籤鍵
  - Body: `TagKeyCreateRequest`
- `PUT /api/tag-keys/{id}` - 更新標籤鍵
  - Body: `TagKeyUpdateRequest`
- `DELETE /api/tag-keys/{id}` - 刪除標籤鍵
- `GET /api/tag-keys/{id}/values` - 獲取標籤值列表
- `POST /api/tag-keys/{id}/values` - 新增標籤值

**資料結構:**
```javascript
// 標籤鍵結構
TagKey: {
  id: string,                    // 唯一標識
  name: string,                  // 標籤鍵名稱 (英文)
  displayName: string,           // 顯示名稱 (中文)
  type: string,                  // 數據類型 ('string'|'number'|'boolean'|'select')
  required: boolean,             // 是否必填
  totalUsage: number,            // 使用總次數
  enabled: boolean,              // 是否啟用
  description: string,           // 描述
  created_at: string,            // 創建時間
  updated_at: string             // 更新時間
}

// 標籤值結構
TagValue: {
  id: string,                    // 唯一標識
  tagKeyId: string,              // 所屬標籤鍵 ID
  value: string,                 // 標籤值
  displayName: string,           // 顯示名稱
  description: string,           // 描述
  usageCount: number,            // 使用次數
  enabled: boolean,              // 是否啟用
  created_at: string             // 創建時間
}
```

**頁面描述**: 標籤鍵和標籤值的統一管理頁面

**工具列按鈕**:
- **搜尋框**: 搜尋標籤鍵或顯示名稱
- **新增標籤鍵按鈕**: 開啟新增標籤鍵彈窗

**統計卡片區域**:
- **總標籤鍵數**
- **活躍標籤鍵數**
- **總標籤值數**
- **標籤使用統計**

**表格欄位**:
- **啟用** (`enabled`) - 切換開關
- **標籤鍵** (`name`) - 標籤鍵名稱
- **顯示名稱** (`displayName`) - 標籤顯示名稱
- **類型** (`type`) - 標籤類型
- **數量** (`totalUsage`) - 使用次數統計
- **必填** (`required`) - 是否必填標籤

**操作按鈕**:
- **管理值** - 開啟標籤值管理抽屜
- **編輯** - 編輯標籤定義
- **刪除** - 刪除標籤鍵

**新增標籤鍵彈窗**:
- **寬度**: 500px
- **表單欄位**:
  - **標籤鍵** (`name`) - 必填，英文標識
  - **顯示名稱** (`displayName`) - 必填，中文顯示名稱
  - **類型** (`type`) - 下拉選單 (string/number/boolean/select)
  - **必填** (`required`) - 開關
  - **描述** (`description`) - 文字域
- **操作按鈕**:
  - **取消** - 關閉彈窗
  - **儲存** - 新增標籤鍵

**標籤值管理抽屜**:
- **寬度**: 600px
- **標題**: "管理標籤值: {標籤顯示名稱}"
- **工具列按鈕**:
  - **新增值按鈕** ➕ - 開啟新增標籤值彈窗
- **表格欄位**:
  - **值** (`value`) - 標籤值
  - **顯示名稱** (`displayName`) - 值顯示名稱
  - **描述** (`description`) - 值描述
- **操作按鈕**:
  - **編輯** - 編輯標籤值
  - **刪除** - 刪除標籤值

**新增標籤值彈窗**:
- **寬度**: 400px
- **表單欄位**:
  - **值** (`value`) - 必填
  - **顯示名稱** (`displayName`) - 必填
  - **描述** (`description`) - 文字域
- **操作按鈕**:
  - **取消** - 關閉彈窗
  - **儲存** - 新增標籤值

## 自動化中心頁面 (AutomationCenterPage)

### 組件參數
**Props:**
- `themeMode: string` - 主題模式
- `setThemeMode: (mode: string) => void` - 主題切換函數

**State:**
- `activeTab: string` - 當前活躍標籤頁 ('scripts' | 'schedules')
- `searchValue: string` - 搜尋關鍵字
- `filters: object` - 篩選條件 {type: string[], creator: string[], status: string[]}
- `modalVisible: boolean` - 新增/編輯模態框顯示狀態
- `currentScript: object` - 當前編輯的腳本

**頁面描述**: 腳本和排程任務的統一管理中心

**頁面標籤頁**:
- **腳本庫** - 腳本管理
- **排程管理** - 排程任務管理

### 腳本庫子頁面 (ScriptsPage)

### 組件參數
**Props:**
- `themeMode: string` - 主題模式

**State:**
- `scripts: Script[]` - 腳本列表
- `loading: boolean` - 載入狀態
- `searchValue: string` - 搜尋關鍵字
- `selectedCategory: string` - 選中的分類
- `sortBy: string` - 排序欄位
- `modalVisible: boolean` - 腳本編輯模態框
- `currentScript: Script` - 當前編輯腳本

**API 參數:**
- `GET /api/scripts` - 獲取腳本列表
  - Query: `{search: string, category: string, creator: string}`
- `POST /api/scripts` - 新增腳本
  - Body: `ScriptCreateRequest`
- `PUT /api/scripts/{id}` - 更新腳本
- `DELETE /api/scripts/{id}` - 刪除腳本
- `POST /api/scripts/{id}/execute` - 執行腳本

**資料結構:**
```javascript
// 腳本結構
Script: {
  id: string,                    // 唯一標識
  name: string,                  // 腳本名稱
  type: string,                  // 腳本類型 ('python'|'bash'|'powershell')
  description: string,           // 描述
  content: string,               // 腳本內容
  creator: string,               // 創建者
  category: string,              // 分類 ('deployment'|'maintenance'|'monitoring')
  params: ScriptParameter[],     // 參數定義
  status: string,                // 狀態 ('active'|'inactive')
  executionCount: number,        // 執行次數
  lastExecuted: string,          // 最後執行時間
  created_at: string,            // 創建時間
  updated_at: string             // 更新時間
}

// 腳本參數結構
ScriptParameter: {
  name: string,                  // 參數名稱
  type: string,                  // 參數類型 ('string'|'number'|'boolean'|'select')
  label: string,                 // 顯示標籤
  required: boolean,             // 是否必填
  defaultValue: any,             // 默認值
  options: string[],             // 選項列表 (select 類型)
  description: string            // 參數描述
}
```

**頁面描述**: 自動化腳本的版本管理和執行控制

**工具列按鈕**:
- **搜尋框**: 搜尋腳本名稱或描述
- **篩選按鈕**: 彈出篩選面板 (類型、創建者)
- **新增腳本按鈕**: 開啟新增腳本彈窗

**統計卡片區域**:
- **總腳本數**
- **活躍腳本數**
- **今日執行次數**
- **腳本類型分佈**

**表格欄位**:
- **腳本名稱** (`name`) - 腳本名稱
- **類型** (`type`) - 腳本類型標籤
- **創建者** (`creator`) - 腳本創建者
- **排程引用** (`scheduleCount`) - 被排程使用的次數 (可點擊查看詳情)
- **描述** (`description`) - 腳本描述

**操作按鈕**:
- **運行** - 執行腳本
- **編輯** - 編輯腳本
- **刪除** - 刪除腳本

**新增腳本彈窗**:
- **寬度**: 800px
- **標籤頁**:
  - **基本信息**
  - **腳本內容**
  - **參數設定**
- **表單欄位**:
  - **腳本名稱** (`name`) - 必填
  - **類型** (`type`) - 下拉選單 (Python/Bash/PowerShell)
  - **描述** (`description`) - 文字域
  - **腳本內容** (`content`) - 代碼編輯器 (帶語法高亮)
  - **參數定義** (`parameters`) - 動態參數列表編輯器
- **操作按鈕**:
  - **取消** - 關閉彈窗
  - **儲存** - 新增腳本

### 排程管理子頁面 (SchedulesPage)

### 組件參數
**Props:**
- `themeMode: string` - 主題模式

**State:**
- `schedules: Schedule[]` - 排程任務列表
- `loading: boolean` - 載入狀態
- `searchValue: string` - 搜尋關鍵字
- `filters: object` - 篩選條件 {status: string[], scriptType: string[]}
- `modalVisible: boolean` - 排程編輯模態框
- `currentSchedule: Schedule` - 當前編輯排程

**API 參數:**
- `GET /api/schedules` - 獲取排程任務列表
  - Query: `{search: string, status: string[], scriptType: string[]}`
- `POST /api/schedules` - 新增排程任務
  - Body: `ScheduleCreateRequest`
- `PUT /api/schedules/{id}` - 更新排程任務
- `DELETE /api/schedules/{id}` - 刪除排程任務
- `POST /api/schedules/{id}/execute` - 手動執行排程任務

**資料結構:**
```javascript
// 排程任務結構
Schedule: {
  id: string,                    // 唯一標識
  name: string,                  // 任務名稱
  description: string,           // 描述
  scriptId: string,              // 執行的腳本 ID
  scriptName: string,            // 腳本名稱
  cron: string,                  // CRON 表達式
  scheduleMode: string,          // 排程模式 ('simple'|'advanced')
  frequency: string,             // 執行頻率 ('hourly'|'daily'|'weekly'|'monthly')
  enabled: boolean,              // 是否啟用
  status: string,                // 狀態 ('active'|'inactive'|'error')
  lastStatus: string,            // 最後執行狀態 ('success'|'failed'|'pending')
  lastRun: string,               // 最後執行時間
  nextRun: string,               // 下次執行時間
  creator: string,               // 創建者
  created_at: string,            // 創建時間
  updated_at: string             // 更新時間
}

// 排程執行記錄
ScheduleExecution: {
  id: string,                    // 唯一標識
  scheduleId: string,            // 排程任務 ID
  status: string,                // 執行狀態 ('success'|'failed'|'running')
  startTime: string,             // 開始時間
  endTime: string,               // 結束時間
  duration: number,              // 執行時間 (毫秒)
  output: string,                // 執行輸出
  error: string,                 // 錯誤信息
  executed_at: string            // 執行時間
}
```

**頁面描述**: 排程任務的生命週期管理

**工具列按鈕**:
- **搜尋框**: 搜尋任務名稱或描述
- **篩選按鈕**: 彈出篩選面板 (狀態、腳本類型)
- **新增排程按鈕**: 開啟新增排程彈窗

**統計卡片區域**:
- **總任務數**
- **運行中任務數**
- **今日執行次數**
- **成功率統計**

**表格欄位**:
- **啟用** (`enabled`) - 切換開關
- **任務名稱** (`name`) - 排程任務名稱
- **腳本名稱** (`scriptId`) - 執行的腳本名稱 (可點擊超連結，跳轉到腳本庫)
- **CRON 條件** (`cron`) - 可讀的CRON表達式
- **上次狀態** (`lastStatus`) - 執行狀態標籤 (SUCCESS/FAILED/PENDING)
- **上次執行時間** (`lastRun`) - 最後執行時間
- **下次執行** (`nextRun`) - 下次計劃執行時間

**操作按鈕**:
- **查看歷史** - 查看執行歷史
- **編輯** - 編輯排程設定
- **刪除** - 刪除排程任務

**新增排程彈窗**:
- **寬度**: 700px
- **表單欄位**:
  - **任務名稱** (`name`) - 必填
  - **選擇腳本** (`scriptId`) - 下拉選單
  - **排程模式** (`scheduleMode`) - 單選 (簡單/進階)
  - **執行頻率** (`frequency`) - 下拉選單 (每小時/每日/每週/每月)
  - **CRON表達式** (`cron`) - 文字輸入 (進階模式)
  - **描述** (`description`) - 文字域
- **操作按鈕**:
  - **取消** - 關閉彈窗
  - **儲存** - 新增排程

## 事件中心頁面 (IncidentsPage)

### 組件參數
**Props:**
- `themeMode: string` - 主題模式
- `setThemeMode: (mode: string) => void` - 主題切換函數

**State:**
- `activeTab: string` - 當前活躍標籤頁 ('incidents' | 'rules' | 'silences')
- `searchValue: string` - 搜尋關鍵字
- `filters: object` - 篩選條件
- `modalVisible: boolean` - 各種模態框顯示狀態
- `drawerVisible: boolean` - 抽屜顯示狀態

**頁面描述**: 告警事件和規則的統一管理中心

**頁面標籤頁**:
- **事件列表** - 告警事件管理
- **告警規則** - 告警規則配置
- **靜音規則** - 靜音規則管理

### 事件列表子頁面 (IncidentListPage)

### 組件參數
**Props:**
- `themeMode: string` - 主題模式

**State:**
- `incidents: Incident[]` - 告警事件列表
- `loading: boolean` - 載入狀態
- `searchValue: string` - 搜尋關鍵字
- `filters: object` - 篩選條件 {severity: string[], status: string[], timeRange: object}
- `selectedRowKeys: string[]` - 選中的行鍵
- `sortInfo: object` - 排序信息
- `modalVisible: boolean` - 事件詳情模態框
- `silenceModalVisible: boolean` - 靜音設定模態框
- `currentIncident: Incident` - 當前查看的事件

**API 參數:**
- `GET /api/incidents` - 獲取告警事件列表
  - Query: `{page: number, size: number, search: string, filters: object, sort: object}`
- `POST /api/incidents/{id}/acknowledge` - 確認告警事件
- `POST /api/incidents/{id}/silence` - 靜音告警事件
- `POST /api/incidents/{id}/resolve` - 解決告警事件

**資料結構:**
```javascript
// 告警事件結構
Incident: {
  id: string,                    // 唯一標識
  summary: string,               // 事件摘要
  description: string,           // 詳細描述
  severity: string,              // 嚴重性 ('critical'|'warning'|'info')
  status: string,                // 狀態 ('new'|'acknowledged'|'resolved'|'silenced')
  resource_id: string,           // 相關資源 ID
  resource_name: string,         // 資源名稱
  rule_id: string,               // 觸發規則 ID
  rule_name: string,             // 規則名稱
  labels: object,                // 標籤對象
  annotations: object,           // 註解信息
  value: number,                 // 觸發值
  threshold: number,             // 閾值
  business_impact: string,       // 業務影響 ('high'|'medium'|'low')
  assignee: string,              // 處理人
  created_at: string,            // 創建時間
  updated_at: string,            // 更新時間
  acknowledged_at: string,       // 確認時間
  resolved_at: string            // 解決時間
}

// 告警統計
IncidentStats: {
  total: number,                 // 總事件數
  new: number,                   // 新事件數
  acknowledged: number,          // 已確認數
  resolved: number,              // 已解決數
  silenced: number               // 已靜音數
}
```

**頁面描述**: 告警事件的即時監控和處理中心

**工具列按鈕**:
- **搜尋框**: 搜尋事件摘要、資源或處理人
- **進階篩選按鈕**: 彈出篩選面板 (時間範圍、嚴重性、狀態、資源名稱)
- **欄位設定按鈕**: 自訂顯示欄位
- **AI分析按鈕**: 批量AI分析
- **快速篩選標籤**: NEW、今日、關鍵事件等

**統計卡片區域**:
- **總事件數**
- **新事件數**
- **已確認事件數**
- **已解決事件數**

**可自訂欄位 (動態顯示)**:
- **嚴重性** (`severity`) - CRITICAL/WARNING 狀態標籤
- **摘要** (`summary`) - 事件摘要 (可點擊鏈接，藍色+懸停下劃線)
- **資源名稱** (`resource_name`) - 受影響資源名稱
- **業務影響** (`business_impact`) - 高/中/低 影響程度標籤
- **規則名稱** (`ruleName`) - 觸發規則名稱 (預設隱藏)
- **觸發閾值** (`triggerThreshold`) - 告警觸發條件 (預設隱藏)
- **狀態** (`status`) - NEW/ACK/RESOLVED/SILENCED 狀態
- **處理人** (`assignee`) - 事件負責人
- **觸發時間** (`created_at`) - 事件發生時間

**操作按鈕**:
- **確認事件** - 確認收到事件 (僅NEW狀態可用)
- **設置靜音** - 靜音告警 (已解決狀態不可用)

**事件詳情彈窗**:
- **寬度**: 800px
- **標籤頁**:
  - **基本資訊** - 事件基本信息和狀態
  - **相關資源** - 受影響資源的詳細信息
  - **處理記錄** - 事件處理的時間線
  - **AI分析** - AI生成的根本原因分析
- **操作按鈕**:
  - **確認收到 (Ack)** - 確認收到事件
  - **AI分析** - 請求AI分析
  - **關閉** - 關閉彈窗

**靜音設定彈窗**:
- **寬度**: 500px
- **表單欄位**:
  - **靜音持續時間** (`duration`) - 下拉選單 (1小時/4小時/12小時/24小時/自訂)
  - **自訂持續時間** (`customDuration`) - 數值輸入 (小時)
  - **靜音原因** (`reason`) - 文字輸入
- **操作按鈕**:
  - **取消** - 關閉彈窗
  - **設定靜音** - 應用靜音規則

### 告警規則子頁面 (AlertingRulesPage)

### 組件參數
**Props:**
- `themeMode: string` - 主題模式

**State:**
- `rules: AlertRule[]` - 告警規則列表
- `loading: boolean` - 載入狀態
- `searchValue: string` - 搜尋關鍵字
- `filters: object` - 篩選條件 {enabled: boolean, severity: string[]}
- `isColumnSettingsOpen: boolean` - 欄位設定抽屜開啟狀態
- `visibleColumns: string[]` - 可見欄位列表
- `modalVisible: boolean` - 規則編輯模態框
- `currentRule: AlertRule` - 當前編輯規則
- `currentStep: number` - 規則創建步驟

**API 參數:**
- `GET /api/alert-rules` - 獲取告警規則列表
  - Query: `{search: string, filters: object}`
- `POST /api/alert-rules` - 新增告警規則
  - Body: `AlertRuleCreateRequest`
- `PUT /api/alert-rules/{id}` - 更新告警規則
- `DELETE /api/alert-rules/{id}` - 刪除告警規則
- `POST /api/alert-rules/{id}/test` - 測試告警規則

**資料結構:**
```javascript
// 告警規則結構
AlertRule: {
  id: string,                    // 唯一標識
  name: string,                  // 規則名稱
  description: string,           // 描述
  target: string,                // 監控目標
  resource_tags: object,         // 資源標籤匹配條件
  conditions: AlertCondition[],  // 觸發條件
  notifications: Notification[], // 通知配置
  enabled: boolean,              // 是否啟用
  severity: string,              // 默認嚴重性 ('critical'|'warning'|'info')
  group_by: string[],            // 分組字段
  labels: object,                // 自定義標籤
  annotations: object,           // 自定義註解
  creator: string,               // 創建者
  created_at: string,            // 創建時間
  updated_at: string             // 更新時間
}

// 告警條件結構
AlertCondition: {
  type: string,                  // 條件類型 ('threshold'|'comparison'|'absent')
  operator: string,              // 操作符 ('gt'|'lt'|'eq'|'ne')
  threshold: number,             // 閾值
  for: string,                   // 持續時間 (Prometheus 格式)
  description: string            // 條件描述
}

// 通知配置結構
Notification: {
  type: string,                  // 通知類型 ('email'|'slack'|'webhook')
  target: string,                // 通知目標
  template: string,              // 通知模板
  enabled: boolean               // 是否啟用
}
```

**頁面描述**: 告警規則的配置和管理

**工具列按鈕**:
- **搜尋框**: 搜尋規則名稱或目標
- **欄位設定按鈕**: 自訂顯示欄位
- **新增規則按鈕**: 開啟新增告警規則彈窗

**統計卡片區域**:
- **總規則數**
- **活躍規則數**
- **今日觸發次數**
- **規則類型分佈**

**表格欄位**:
- **啟用** (`enabled`) - 規則啟用狀態切換
- **規則名稱** (`name`) - 告警規則名稱
- **監控對象** (`target`) - 監控目標描述
- **資源標籤** (`resource_tags`) - 規則匹配的資源標籤
- **觸發條件** (`conditions`) - 觸發條件數量
- **通知對象** (`notifications`) - 通知管道統計

**可自訂欄位 (動態顯示)**:
- **啟用** (`enabled`) - 規則啟用狀態切換
- **規則名稱** (`name`) - 告警規則名稱 (可點擊鏈接，藍色+懸停下劃線)
- **監控對象** (`target`) - 監控目標描述
- **資源標籤** (`resource_tags`) - 規則匹配的資源標籤
- **觸發條件** (`conditions`) - 觸發條件數量
- **通知對象** (`notifications`) - 通知管道統計

**操作按鈕**:
- **編輯**
- **刪除**
- **測試**

**新增告警規則彈窗**:
- **寬度**: 900px
- **步驟導航**: 4步驟 (基本資訊/觸發條件/通知設定/確認)
- **表單欄位**:
  - **規則名稱** (`name`) - 必填
  - **監控對象** (`target`) - 必填
  - **資源標籤** (`resource_tags`) - 多選標籤
  - **觸發條件** (`conditions`) - 動態條件編輯器
  - **通知設定** (`notifications`) - 通知管道選擇
- **操作按鈕**:
  - **上一步** - 返回上一步
  - **下一步** - 進入下一步
  - **取消** - 關閉彈窗
  - **儲存** - 新增規則

### 靜音規則子頁面 (SilencesPage)

### 組件參數
**Props:**
- `themeMode: string` - 主題模式

**State:**
- `silences: Silence[]` - 靜音規則列表
- `loading: boolean` - 載入狀態
- `searchValue: string` - 搜尋關鍵字
- `filters: object` - 篩選條件 {status: string[], type: string[]}
- `modalVisible: boolean` - 靜音規則編輯模態框
- `currentSilence: Silence` - 當前編輯靜音規則

**API 參數:**
- `GET /api/silences` - 獲取靜音規則列表
  - Query: `{search: string, filters: object}`
- `POST /api/silences` - 新增靜音規則
  - Body: `SilenceCreateRequest`
- `PUT /api/silences/{id}` - 更新靜音規則
- `DELETE /api/silences/{id}` - 刪除靜音規則

**資料結構:**
```javascript
// 靜音規則結構
Silence: {
  id: string,                    // 唯一標識
  name: string,                  // 規則名稱
  description: string,           // 描述
  type: string,                  // 類型 ('single'|'recurring')
  matchers: Matcher[],           // 匹配條件
  startsAt: string,              // 開始時間
  endsAt: string,                // 結束時間
  createdBy: string,             // 創建者
  comment: string,               // 註釋
  status: string,                // 狀態 ('active'|'expired'|'pending')
  created_at: string,            // 創建時間
  updated_at: string             // 更新時間
}

// 匹配器結構
Matcher: {
  name: string,                  // 標籤名稱
  value: string,                 // 標籤值
  isRegex: boolean,              // 是否正則匹配
  isEqual: boolean               // 是否相等匹配
}

// 靜音統計
SilenceStats: {
  active: number,                // 活躍靜音數
  expired: number,               // 已過期數
  pending: number,               // 待生效數
  totalSilencedAlerts: number    // 靜音的告警總數
}
```

**頁面描述**: 告警靜音規則的管理

**工具列按鈕**:
- **搜尋框**: 搜尋規則名稱或創建者
- **新增靜音按鈕**: 開啟新增靜音規則彈窗

**統計卡片區域**:
- **活躍靜音數**
- **即將過期數**
- **總靜音次數**
- **平均靜音時長**

**表格欄位**:
- **啟用** (`enabled`) - 靜音規則狀態
- **名稱** (`name`) - 靜音規則名稱
- **狀態** (`status`) - 靜音狀態標籤
- **類型** (`type`) - 單次/週期 標籤
- **匹配條件** (`matchers`) - 靜音匹配的標籤條件
- **創建者** (`creator`) - 規則創建者
- **開始時間** (`startsAt`) - 靜音開始時間
- **結束時間** (`endsAt`) - 靜音結束時間
- **剩餘時間** (`remaining`) - 靜音剩餘時間

**操作按鈕**:
- **編輯** - 編輯靜音規則
- **刪除** - 刪除靜音規則

**新增靜音規則彈窗**:
- **寬度**: 700px
- **表單欄位**:
  - **規則名稱** (`name`) - 必填
  - **類型** (`type`) - 單選 (單次/週期)
  - **匹配條件** (`matchers`) - 動態標籤匹配器
  - **開始時間** (`startsAt`) - 日期時間選擇器
  - **結束時間** (`endsAt`) - 日期時間選擇器
  - **創建者** (`creator`) - 自動填入
- **操作按鈕**:
  - **取消** - 關閉彈窗
  - **儲存** - 新增靜音規則

## 設定 - 用戶與權限 (Settings > UserManagementPage)

### 組件參數
**Props:**
- `themeMode: string` - 主題模式
- `setThemeMode: (mode: string) => void` - 主題切換函數

**State:**
- `activeTab: string` - 當前活躍標籤頁 ('users' | 'teams')
- `searchValue: string` - 搜尋關鍵字
- `filters: object` - 篩選條件
- `modalVisible: boolean` - 用戶/團隊編輯模態框
- `currentUser: User` - 當前編輯用戶
- `currentTeam: Team` - 當前編輯團隊

**頁面描述**: 用戶和團隊的統一管理中心

**頁面標籤頁**:
- **用戶管理** - 用戶帳號管理
- **團隊管理** - 團隊組織管理

### 用戶管理子頁面

### 組件參數
**Props:**
- `themeMode: string` - 主題模式

**State:**
- `users: User[]` - 用戶列表
- `loading: boolean` - 載入狀態
- `searchValue: string` - 搜尋關鍵字
- `filters: object` - 篩選條件 {status: string[], roles: string[], teams: string[]}
- `selectedRowKeys: string[]` - 選中的行鍵
- `modalVisible: boolean` - 用戶編輯模態框
- `currentUser: User` - 當前編輯用戶

**API 參數:**
- `GET /api/users` - 獲取用戶列表
  - Query: `{search: string, filters: object, sort: object}`
- `POST /api/users` - 新增用戶
  - Body: `UserCreateRequest`
- `PUT /api/users/{id}` - 更新用戶
- `DELETE /api/users/{id}` - 刪除用戶
- `POST /api/users/{id}/reset-password` - 重置密碼

**資料結構:**
```javascript
// 用戶結構
User: {
  id: string,                    // 唯一標識
  username: string,              // 用戶名
  email: string,                 // 電子郵件
  name: string,                  // 顯示名稱
  avatar: string,                // 頭像 URL
  roles: string[],               // 角色列表
  teams: string[],               // 所屬團隊 ID 列表
  teamNames: string[],           // 團隊名稱列表
  status: string,                // 狀態 ('active'|'inactive'|'pending')
  lastLogin: string,             // 最後登入時間
  loginCount: number,            // 登入次數
  preferences: object,           // 用戶偏好設定
  enabled: boolean,              // 是否啟用
  created_at: string,            // 創建時間
  updated_at: string             // 更新時間
}

// 用戶統計
UserStats: {
  total: number,                 // 總用戶數
  active: number,                // 活躍用戶數
  inactive: number,              // 非活躍用戶數
  pending: number                // 待激活用戶數
}
```

**頁面描述**: 系統用戶帳號的生命週期管理

**工具列按鈕**:
- **搜尋框**: 搜尋用戶姓名或電子郵件
- **篩選按鈕**: 彈出篩選面板 (狀態、角色、團隊)
- **新增用戶按鈕**: 開啟新增用戶彈窗

**統計卡片區域**:
- **總用戶數**
- **活躍用戶數**
- **今日登入用戶數**
- **角色分佈統計**

**表格欄位**:
- **啟用** (`enabled`) - 用戶啟用狀態切換
- **姓名** (`name`) - 用戶姓名
- **電子郵件** (`email`) - 用戶郵箱
- **團隊** (`teams`) - 所屬團隊名稱
- **角色** (`roles`) - 角色標籤 (多個角色)
- **最後登入** (`lastLogin`) - 最後登入時間

**操作按鈕**:
- **編輯** - 編輯用戶信息
- **刪除** - 刪除用戶

**新增用戶彈窗**:
- **寬度**: 600px
- **表單欄位**:
  - **姓名** (`name`) - 必填
  - **電子郵件** (`email`) - 必填，唯一
  - **密碼** (`password`) - 必填 (新增時)
  - **確認密碼** (`confirmPassword`) - 必填 (新增時)
  - **團隊** (`teams`) - 多選下拉
  - **角色** (`roles`) - 多選下拉
  - **狀態** (`status`) - 下拉選單 (active/inactive/pending)
- **操作按鈕**:
  - **取消** - 關閉彈窗
  - **儲存** - 新增用戶

### 團隊管理子頁面 (TeamManagementPage)

### 組件參數
**Props:**
- `themeMode: string` - 主題模式

**State:**
- `teams: Team[]` - 團隊列表
- `loading: boolean` - 載入狀態
- `searchValue: string` - 搜尋關鍵字
- `modalVisible: boolean` - 團隊編輯模態框
- `currentTeam: Team` - 當前編輯團隊

**API 參數:**
- `GET /api/teams` - 獲取團隊列表
  - Query: `{search: string, filters: object}`
- `POST /api/teams` - 新增團隊
  - Body: `TeamCreateRequest`
- `PUT /api/teams/{id}` - 更新團隊
- `DELETE /api/teams/{id}` - 刪除團隊

**資料結構:**
```javascript
// 團隊結構
Team: {
  id: string,                    // 唯一標識
  name: string,                  // 團隊名稱
  description: string,           // 團隊描述
  owner: string,                 // 團隊負責人 ID
  ownerName: string,             // 負責人姓名
  members: string[],             // 成員 ID 列表
  memberDetails: User[],         // 成員詳情
  subscribers: string[],         // 通知訂閱者 ID 列表
  subscriberDetails: User[],     // 訂閱者詳情
  created_at: string,            // 創建時間
  updated_at: string             // 更新時間
}

// 團隊統計
TeamStats: {
  totalTeams: number,            // 總團隊數
  totalMembers: number,          // 總成員數
  averageTeamSize: number,       // 平均團隊規模
  teamsWithOwners: number        // 有負責人的團隊數
}
```

**頁面描述**: 團隊組織架構的管理

**工具列按鈕**:
- **搜尋框**: 搜尋團隊名稱或描述
- **新增團隊按鈕**: 開啟新增團隊彈窗

**統計卡片區域**:
- **總團隊數**
- **活躍團隊數**
- **平均團隊規模**
- **團隊負責人分佈**

**表格欄位**:
- **團隊名稱** (`name`) - 團隊名稱
- **成員數** (`members`) - 團隊成員數量
- **訂閱者數** (`subscribers`) - 通知訂閱者數量
- **負責人** (`owner`) - 團隊負責人
- **描述** (`description`) - 團隊描述
- **創建時間** (`createdAt`) - 團隊創建時間

**操作按鈕**:
- **編輯** - 編輯團隊信息
- **刪除** - 刪除團隊

**新增團隊彈窗**:
- **寬度**: 600px
- **表單欄位**:
  - **團隊名稱** (`name`) - 必填
  - **負責人** (`owner`) - 下拉選單 (用戶列表)
  - **成員** (`members`) - 多選下拉 (用戶列表)
  - **訂閱者** (`subscribers`) - 多選下拉 (用戶+通知管道)
  - **描述** (`description`) - 文字域
- **操作按鈕**:
  - **取消** - 關閉彈窗
  - **儲存** - 新增團隊

## 設定 - 平台設定 (Settings > SettingsAdministrationPage)

### 組件參數
**Props:**
- `themeMode: string` - 主題模式
- `setThemeMode: (mode: string) => void` - 主題切換函數

**State:**
- `activeTab: string` - 當前活躍設定標籤頁 ('notifications' | 'auth' | 'system')
- `settings: object` - 當前設定值
- `loading: boolean` - 載入狀態
- `saving: boolean` - 保存狀態

**API 參數:**
- `GET /api/settings` - 獲取系統設定
- `PUT /api/settings` - 更新系統設定
- `POST /api/settings/test-email` - 測試郵件設定
- `POST /api/settings/test-notification` - 測試通知設定

**頁面描述**: 系統級別的配置和管理中心

**設定分類標籤頁**:
- **通知設定** - 郵件和通知配置
- **身份驗證** - 用戶驗證和權限設定
- **系統設定** - 通用系統配置

#### 通知設定子頁面

**頁面描述**: 郵件伺服器和通知管道的配置

**設定區域**:
- **SMTP設定**: 郵件伺服器配置表單
- **測試郵件**: 發送測試郵件功能

**表單欄位**:
- **SMTP伺服器** (`smtpHost`) - 必填
- **埠號** (`smtpPort`) - 必填
- **使用者名稱** (`smtpUsername`) - 必填
- **密碼** (`smtpPassword`) - 必填
- **寄件者郵箱** (`fromEmail`) - 必填
- **啟用SSL** (`smtpSSL`) - 開關

**操作按鈕**:
- **儲存** - 保存SMTP設定
- **測試連接** - 測試郵件伺服器連接
- **發送測試郵件** - 發送測試郵件

#### 身份驗證設定子頁面

**頁面描述**: 用戶驗證和權限管理設定

**設定區域**:
- **會話設定**: 登入會話超時配置
- **密碼策略**: 密碼強度要求設定
- **雙因素驗證**: 2FA設定

**表單欄位**:
- **會話超時時間** (`sessionTimeout`) - 數值輸入 (分鐘)
- **密碼最小長度** (`passwordMinLength`) - 數值輸入
- **要求特殊字元** (`passwordRequireSpecial`) - 開關
- **啟用雙因素驗證** (`enable2FA`) - 開關

**操作按鈕**:
- **儲存** - 保存身份驗證設定

## 設定 - 通知管理 (Settings > NotificationHistoryPage)

### 組件參數
**Props:**
- `themeMode: string` - 主題模式

**State:**
- `notifications: Notification[]` - 通知歷史列表
- `loading: boolean` - 載入狀態
- `searchValue: string` - 搜尋關鍵字
- `filters: object` - 篩選條件 {status: string[], channel: string[], timeRange: object}
- `sortInfo: object` - 排序信息
- `drawerVisible: boolean` - 詳情抽屜顯示狀態
- `currentNotification: Notification` - 當前查看通知

**API 參數:**
- `GET /api/notifications` - 獲取通知歷史
  - Query: `{page: number, size: number, search: string, filters: object, sort: object}`
- `POST /api/notifications/{id}/resend` - 重新發送通知

**資料結構:**
```javascript
// 通知歷史結構
Notification: {
  id: string,                    // 唯一標識
  timestamp: string,             // 發送時間
  status: string,                // 狀態 ('success'|'failed')
  channel: string,               // 管道 ('email'|'slack'|'webhook')
  alert_id: string,              // 相關告警 ID
  alert_summary: string,         // 告警摘要
  resource_name: string,         // 資源名稱
  recipient: string,             // 接收者
  message: string,               // 通知訊息
  error_message: string,         // 錯誤信息
  payload: object,               // 原始載荷
  retry_count: number,           // 重試次數
  actor: string                  // 觸發者
}
```

**頁面描述**: 通知發送歷史記錄的查詢和追蹤頁面

**工具列按鈕**:
- **時間範圍篩選**: 日期時間範圍選擇器，支援精確時間篩選
- **搜尋框**: 搜尋告警摘要、資源名稱、通知管道
- **狀態篩選**: 成功/失敗狀態過濾
- **管道篩選**: 按通知管道類型過濾 (Slack/Email/Webhook等)
- **匯出按鈕**: 匯出通知歷史記錄

**統計卡片區域**:
- **總通知數**
- **成功率**
- **今日通知數**
- **失敗通知數**

**表格欄位**:
- **時間戳記** (`timestamp`) - 通知發送時間
- **狀態** (`status`) - 發送狀態標籤 (SUCCESS/FAILED)
- **通知管道** (`channel`) - 目標管道 (Slack/Email/Webhook等)
- **告警摘要** (`alert`) - 觸發告警的簡要描述
- **發送者** (`actor`) - 觸發通知的系統或用戶
- **訊息內容** (`message`) - 通知訊息的摘要
- **錯誤訊息** (`errorMessage`) - 發送失敗時的錯誤信息

**操作按鈕**:
- **查看詳情** - 查看完整通知詳情和載荷

**通知詳情抽屜**:
- **寬度**: 600px
- **內容區域**:
  - **基本信息**: 通知狀態、時間、管道等
  - **訊息內容**: 完整通知訊息
  - **錯誤詳情**: 如果發送失敗的錯誤信息
  - **載荷數據**: JSON格式的原始載荷
- **操作按鈕**:
  - **複製載荷** - 複製JSON載荷
  - **重新發送** - 重新發送通知 (失敗的通知)
  - **關閉** - 關閉抽屜




## 分析頁面 - 容量規劃 (AnalysisPage > CapacityPlanningPage)

### 組件參數
**Props:**
- `themeMode: string` - 主題模式

**State:**
- `activeTab: string` - 當前活躍分析標籤頁 ('resources' | 'performance' | 'alerts')
- `timeRange: object` - 時間範圍 {start: string, end: string}
- `analysisData: object` - 分析數據
- `loading: boolean` - 載入狀態

**API 參數:**
- `GET /api/analysis/resources` - 資源使用分析
  - Query: `{timeRange: object, filters: object}`
- `GET /api/analysis/performance` - 效能指標分析
- `GET /api/analysis/alerts` - 告警趨勢分析

**頁面描述**: 系統數據分析和報告中心

**分析類型標籤頁**:
- **資源分析** - 資源使用趨勢分析
- **效能分析** - 系統效能分析
- **告警分析** - 告警趨勢和模式分析

### 資源分析子頁面

**頁面描述**: 資源使用情況的深度分析

**時間範圍選擇器**:
- **快速選擇**: 最近1小時/24小時/7天/30天
- **自訂範圍**: 日期時間選擇器

**圖表區域**:
- **資源使用趨勢圖**: CPU/記憶體使用率趨勢
- **資源類型分佈**: 圓餅圖顯示各類型資源佔比
- **Top N 資源**: 最高使用率的資源排名

**分析報告區域**:
- **自動生成見解**: AI分析的關鍵發現
- **建議動作**: 系統優化建議

## 執行記錄頁面 (ExecutionsPage)

### 組件參數
**Props:**
- `themeMode: string` - 主題模式

**State:**
- `executions: Execution[]` - 執行記錄列表
- `loading: boolean` - 載入狀態
- `searchValue: string` - 搜尋關鍵字
- `filters: object` - 篩選條件 {status: string[], taskType: string[], timeRange: object}
- `sortInfo: object` - 排序信息
- `drawerVisible: boolean` - 詳情抽屜顯示狀態
- `currentExecution: Execution` - 當前查看執行記錄

**API 參數:**
- `GET /api/executions` - 獲取執行記錄列表
  - Query: `{page: number, size: number, search: string, filters: object, sort: object}`
- `GET /api/executions/{id}` - 獲取執行詳情
- `POST /api/executions/{id}/rerun` - 重新執行任務

**資料結構:**
```javascript
// 執行記錄結構
Execution: {
  id: string,                    // 唯一標識
  taskId: string,                // 任務 ID
  taskName: string,              // 任務名稱
  taskType: string,              // 任務類型 ('script'|'schedule')
  status: string,                // 執行狀態 ('success'|'failed'|'running')
  startTime: string,             // 開始時間
  endTime: string,               // 結束時間
  duration: number,              // 執行時間 (毫秒)
  executor: string,              // 執行者
  parameters: object,            // 執行參數
  output: string,                // 執行輸出
  error: string,                 // 錯誤信息
  logs: string[],                // 日誌列表
  created_at: string             // 創建時間
}
```

**頁面描述**: 腳本和排程任務的執行歷史記錄

**工具列按鈕**:
- **搜尋框**: 搜尋任務名稱或腳本名稱
- **狀態篩選**: 成功/失敗/進行中
- **時間範圍篩選**: 執行時間篩選

**統計卡片區域**:
- **總執行次數**
- **成功率**
- **平均執行時間**
- **今日執行次數**

**表格欄位**:
- **任務名稱** (`taskName`) - 腳本或排程任務名稱
- **狀態** (`status`) - 執行狀態 (成功/失敗/進行中)
- **開始時間** (`startTime`) - 執行開始時間
- **結束時間** (`endTime`) - 執行結束時間
- **執行時間** (`duration`) - 執行耗時
- **執行人** (`executor`) - 觸發執行的用戶
- **輸出日誌** (`logs`) - 執行日誌摘要

**操作按鈕**:
- **查看詳情** - 查看完整執行日誌
- **重新執行** - 重新執行任務

**執行詳情抽屜**:
- **寬度**: 800px
- **內容區域**:
  - **基本信息**: 任務名稱、狀態、時間等
  - **執行日誌**: 完整輸出日誌
  - **錯誤信息**: 如果執行失敗的錯誤詳情
- **操作按鈕**:
  - **複製日誌** - 複製執行日誌
  - **重新執行** - 重新執行此任務
  - **關閉** - 關閉抽屜

## 容量規劃頁面 (CapacityPlanningPage)

### 組件參數
**Props:**
- `themeMode: string` - 主題模式

**State:**
- `activeTab: string` - 當前活躍規劃標籤頁 ('forecast' | 'recommendations' | 'cost')
- `forecastPeriod: string` - 預測期間 ('1M' | '3M' | '6M' | '1Y')
- `forecastModel: string` - 預測模型 ('linear' | 'exponential' | 'ml')
- `confidenceLevel: number` - 置信區間 (80 | 90 | 95)
- `planningData: object` - 規劃數據
- `loading: boolean` - 載入狀態

**API 參數:**
- `GET /api/capacity/forecast` - 獲取容量預測
  - Query: `{period: string, model: string, confidence: number}`
- `GET /api/capacity/recommendations` - 獲取容量建議
- `GET /api/capacity/cost-analysis` - 獲取成本分析

**資料結構:**
```javascript
// 容量預測結構
CapacityForecast: {
  resourceType: string,          // 資源類型
  currentUsage: number,          // 當前使用率
  predictedUsage: number[],      // 預測使用率數組
  confidenceInterval: number[],  // 置信區間
  trend: string,                 // 趨勢 ('increasing'|'decreasing'|'stable')
  recommendations: string[],     // 建議行動
  timePoints: string[]           // 時間點
}

// 容量建議結構
CapacityRecommendation: {
  resourceId: string,            // 資源 ID
  resourceName: string,          // 資源名稱
  action: string,                // 建議行動 ('scale_up'|'scale_down'|'monitor')
  priority: string,              // 優先級 ('high'|'medium'|'low')
  timeframe: string,             // 建議時間 ('immediate'|'1M'|'3M')
  cost: number,                  // 預估成本
  risk: string,                  // 風險評估
  justification: string          // 建議理由
}
```

**頁面描述**: 系統容量規劃和資源預測

**規劃類型標籤頁**:
- **資源預測** - 資源使用趨勢預測
- **容量建議** - 容量擴展建議
- **成本分析** - 資源成本效益分析

### 資源預測子頁面

**頁面描述**: 基於歷史數據的資源使用預測

**預測參數設定**:
- **預測期間**: 1個月/3個月/6個月/1年
- **預測模型**: 線性回歸/指數平滑/機器學習
- **信心區間**: 80%/90%/95%

**預測圖表**:
- **CPU使用率預測**: 未來CPU使用趨勢
- **記憶體使用率預測**: 未來記憶體使用趨勢
- **儲存使用預測**: 儲存空間使用趨勢

**預測報告**:
- **容量警告**: 需要擴容的資源
- **最佳化建議**: 資源使用優化建議
- **成本影響**: 容量變更的成本估算

