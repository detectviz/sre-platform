# SRE 平台頁面邏輯與 API 設計詳細記錄

本文檔詳細記錄 prototype.html 中所有頁面的業務邏輯、功能特性、數據流程、用戶交互設計以及對應的 API 設計參考。

## 目錄

### 📋 核心業務頁面
1. [登錄頁面 (LoginPage)](#loginpage)
2. [儀表板頁面 (DashboardPage)](#dashboardpage)
3. [資源列表頁面 (ResourceListPage)](#resourcelistpage)
4. [資源群組頁面 (ResourceGroupsPage)](#resourcegroupspage)
5. [事件紀錄頁面 (IncidentListPage)](#incidentlistpage)
6. [告警規則頁面 (AlertingRulesPage)](#alertingrulespage)
7. [通知策略頁面 (NotificationStrategiesPage)](#notificationstrategiespage)
8. [靜音規則頁面 (SilencesPage)](#silencespage)

### 🔧 自動化與分析頁面
9. [腳本庫頁面 (ScriptsPage)](#scriptspage)
10. [排程管理頁面 (SchedulesPage)](#schedulespage)
11. [執行日誌頁面 (ExecutionsPage)](#executionspage)
12. [容量規劃頁面 (CapacityPlanningPage)](#capacityplanningpage)

### 👥 用戶與權限管理頁面
13. [用戶管理頁面 (UserManagementPage)](#usermanagementpage)
14. [團隊管理頁面 (TeamManagementPage)](#teammanagementpage)
15. [角色管理頁面 (RoleManagementPage)](#rolemanagementpage)

### ⚙️ 系統管理頁面
16. [管理頁面 (AdministrationPage)](#administrationpage)
17. [通知管道頁面 (NotificationChannelsPage)](#notificationchannels)
18. [系統設定頁面 (SystemSettingsPage)](#systemsettings)
19. [平台診斷頁面 (PlatformDiagnosticsPage)](#platformdiagnostics)
20. [審計日誌頁面 (AuditLogsPage)](#auditlogs)
21. [個人資料頁面 (ProfilePage)](#profilepage)

### 🧭 導航頁面
22. [導航頁面](#navigation-pages)

### 🏗️ 架構設計原則
23. [整體架構設計原則](#architecture-principles)

---

## LoginPage

### 🎯 頁面目的
用戶身份驗證入口，提供安全的登錄體驗。

### ⚙️ 核心功能
- **賬號密碼驗證**：支持用戶名/密碼登錄
- **即時反饋**：登錄成功/失敗的視覺回饋
- **狀態保持**：成功登錄後跳轉到主應用

### 🔄 業務邏輯
```javascript
// 登錄流程
1. 用戶輸入賬號密碼
2. 點擊登錄按鈕
3. 驗證憑證
4. 成功：設置認證狀態，跳轉到儀表板
5. 失敗：顯示錯誤訊息，允許重試
```

### 🎨 UI 特性
- **玻璃質感設計**：半透明背景 + 模糊效果
- **響應式佈局**：適配不同螢幕尺寸
- **品牌色彩**：使用平台主題色 (#8a2be2)
- **載入狀態**：登錄過程顯示載入指示器

---

## DashboardPage

### 🎯 頁面目的
提供平台整體狀態的概覽視圖，讓用戶快速了解系統健康狀況。

### ⚙️ 核心功能
- **系統健康指標**：關鍵資源的健康狀態統計
- **告警總覽**：當前活躍告警的數量和趨勢
- **資源狀態卡片**：各資源類型的狀態總覽
- **快速操作入口**：常用功能的快捷訪問

### 🔄 業務邏輯
```javascript
// 數據聚合邏輯
1. 從各資源收集健康狀態數據
2. 計算各類型資源的健康比例
3. 聚合當前活躍告警數量
4. 生成趨勢圖表數據
5. 實時更新關鍵指標
```

### 📊 數據來源
- 資源列表：健康狀態、健康比例
- 事件記錄：告警數量、告警趨勢
- 系統監控：性能指標、容量使用率

---

## ResourceListPage

### 🎯 頁面目的
集中管理所有監控資源，提供資源的增刪改查功能。

### ⚙️ 核心功能
- **資源列表展示**：分頁表格展示所有資源
- **資源狀態監控**：實時顯示資源健康狀態
- **團隊歸屬顯示**：顯示每個資源所屬的負責團隊
- **資源管理操作**：新增、編輯、刪除資源
- **批量操作支持**：支持批量刪除資源

### 🔄 業務邏輯
```javascript
// 團隊歸屬計算邏輯
const getResourceTeam = (resource) => {
  // 1. 找到包含此資源的所有資源群組
  const groups = allGroups.filter(g => g.members.includes(resource.key));

  // 2. 從資源群組獲取負責團隊
  const responsibleTeams = groups
    .filter(g => g.responsibleTeam)
    .map(g => g.responsibleTeam);

  // 3. 返回主要負責團隊（第一個）
  return responsibleTeams.length > 0 ? responsibleTeams[0] : null;
};
```

### 🎨 UI 特性
- **狀態標記**：Healthy/Warning/Critical 三色標記
- **類型篩選**：按資源類型篩選（Server、Database、Gateway等）
- **團隊關聯**：資源名稱旁顯示負責團隊
- **操作按鈕**：編輯、刪除按鈕（危險操作有確認對話框）

### 🔗 API 設計參考

#### 資源數據結構
```javascript
{
  "id": "resource_1",
  "name": "web-prod-01",
  "type": "server", // "server" | "database" | "gateway" | "cache" | "network" | "monitoring" | "ci_cd" | "development"
  "ip_address": "10.0.0.21",
  "status": "healthy", // "healthy" | "warning" | "critical"
  "group_ids": ["group_prod_web"], // 所屬資源群組
  "team_id": "team_devops", // 負責團隊
  "labels": {
    "environment": "production",
    "region": "us-west-1"
  }
}
```

#### 關鍵 API 端點
- **獲取資源列表**：`GET /api/resources?page=1&size=20&type=server`
- **創建資源**：`POST /api/resources`
- **更新資源**：`PUT /api/resources/{id}`
- **刪除資源**：`DELETE /api/resources/{id}`
- **批量刪除**：`DELETE /api/resources/batch`

#### 業務驗證規則
- 資源必須屬於至少一個資源群組
- 資源群組必須有負責團隊

---

## ResourceGroupsPage

### 🎯 頁面目的
管理資源的分群和負責團隊的分配，建立清晰的責任歸屬。

### ⚙️ 核心功能
- **資源群組管理**：創建、編輯、刪除資源群組
- **負責團隊綁定**：為每個資源群組指定唯一的負責團隊
- **資源分配**：將資源分配到不同的群組
- **狀態匯總**：顯示群組內資源的整體健康狀態

### 🔄 業務邏輯
```javascript
// 負責團隊綁定邏輯
const handleGroupFinish = (values) => {
  const newGroup = {
    ...values,
    key: editingGroup ? editingGroup.key : `g_${Date.now()}`,
    members: selectedResources, // Transfer 組件選中的資源
    responsibleTeam: values.responsibleTeam // 負責團隊
  };

  // 更新資源群組列表
  setGroups(prevGroups => {
    if (editingGroup) {
      return prevGroups.map(g => g.key === editingGroup.key ? newGroup : g);
    } else {
      return [newGroup, ...prevGroups];
    }
  });
};
```

### 🎨 UI 特性
- **Transfer 組件**：雙列表資源分配界面
- **團隊下拉選單**：單選負責團隊
- **狀態摘要**：群組內資源的健康狀態統計
- **成員數量顯示**：顯示群組包含的資源數量

### 🔗 API 設計參考

#### 資源群組數據結構
```javascript
{
  "id": "group_prod_web",
  "name": "Production Web Servers",
  "description": "生產環境 Web 服務器群組",
  "resource_ids": ["resource_1", "resource_2"],
  "responsible_team": "team_devops",
  "created_by": "admin"
}
```

#### 關鍵 API 端點
- **獲取群組列表**：`GET /api/resource-groups?page=1&size=20`
- **創建資源群組**：`POST /api/resource-groups`
- **更新資源群組**：`PUT /api/resource-groups/{id}`
- **刪除資源群組**：`DELETE /api/resource-groups/{id}`
- **獲取群組資源**：`GET /api/resource-groups/{id}/resources`

#### 業務驗證規則
- 資源群組必須有負責團隊
- 負責團隊必須存在且有效

---

## IncidentListPage

### 🎯 頁面目的
提供完整的事件處理中心，支持告警的確認、靜音、詳情查看等操作。

### ⚙️ 核心功能
- **事件列表展示**：分頁表格展示所有告警事件
- **狀態管理**：NEW → ACKNOWLEDGED → RESOLVED 狀態流轉
- **靜音功能**：為特定事件創建臨時靜音規則
- **批量操作**：支持批量確認和解決事件
- **AI 分析**：集成 AI 分析功能
- **詳情查看**：完整的事件詳情和處理歷史

### 🔄 業務邏輯
```javascript
// 事件狀態流轉邏輯
const handleStatusChange = (incidentIds, newStatus) => {
  const statusText = {
    'acknowledged': '確認',
    'resolved': '解決'
  }[newStatus];

  setIncidents(prevIncidents =>
    prevIncidents.map(incident =>
      incidentIds.includes(incident.key)
        ? { ...incident, status: newStatus }
        : incident
    )
  );

  message.success(`事件狀態已更新為${statusText}`);
};

// 靜音規則創建邏輯
const handleSilence = (incident, duration) => {
  const silenceRule = {
    id: `silence_${Date.now()}`,
    name: `臨時靜音 - ${incident.summary}`,
    type: 'once',
    timeRange: [dayjs(), dayjs().add(duration, 'hour')],
    matchers: [{ key: 'resource_name', op: '=', value: incident.resource_name }],
    created_by: 'admin'
  };

  // 保存靜音規則並更新事件狀態
  const existingSilences = JSON.parse(localStorage.getItem('sre-silences-v2') || '[]');
  existingSilences.push(silenceRule);
  localStorage.setItem('sre-silences-v2', JSON.stringify(existingSilences));

  setIncidents(prevIncidents =>
    prevIncidents.map(inc =>
      inc.key === incident.key
        ? { ...inc, status: 'silenced', silencedUntil: dayjs().add(duration, 'hour') }
        : inc
    )
  );
};
```

### 🎨 UI 特性
- **狀態標記**：New/Acknowledged/Resolved/Silenced 四色標記
- **操作按鈕**：確認、靜音、詳情按鈕（不同狀態顯示不同按鈕）
- **批量操作**：勾選後的批量確認和解決
- **搜尋篩選**：按摘要、狀態、處理人等條件搜尋
- **詳情彈窗**：分區塊展示事件資訊、處理歷史、關聯事件

### 🔗 API 設計參考

#### 事件數據結構
```javascript
{
  "id": "incident_1",
  "summary": "Web 服務器 CPU 使用率過高",
  "severity": "critical", // "info" | "warning" | "critical"
  "status": "new", // "new" | "acknowledged" | "resolved" | "silenced"
  "source": "Prometheus", // 告警來源
  "resource_name": "web-prod-01",
  "resource_group": "Production Web Servers",
  "alert_rule_id": "rule_1", // 觸發的告警規則 ID
  "automation_id": "exec_1", // 自動化執行 ID（可選）
  "assignee": "user_1", // 處理人 ID（可選）
  "created_at": "2024-01-01T10:00:00Z",
  "updated_at": "2024-01-01T10:00:00Z",
  "acknowledged_at": null,
  "resolved_at": null,
  "silenced_until": null,
  "labels": {
    "team": "devops",
    "environment": "production",
    "service": "web"
  }
}
```

#### 事件狀態流轉
```
NEW → ACKNOWLEDGED → RESOLVED
  ↓
SILENCED (可從任何狀態進入)
```

#### 關鍵 API 端點
- **創建事件**：`POST /api/incidents`
- **批量更新狀態**：`PATCH /api/incidents/batch-status`
- **添加處理記錄**：`POST /api/incidents/{id}/comments`
- **獲取事件詳情**：`GET /api/incidents/{id}`

#### 業務驗證規則
- 事件必須參考有效的資源
- 事件狀態必須按照定義的流轉規則

---

## AlertingRulesPage

### 🎯 頁面目的
提供複雜的告警規則配置，支持多條件、多等級的告警邏輯。

### ⚙️ 核心功能
- **條件群組**：支持 AND/OR 邏輯的條件組合
- **多等級告警**：不同條件觸發不同嚴重性等級
- **通知管道**：配置告警發送的管道
- **自動化響應**：配置觸發告警時的自動化腳本
- **快速範本**：提供常用告警規則範本

### 🔄 業務邏輯
```javascript
// 多條件告警邏輯
const conditionGroups = [
  {
    id: 'group_1',
    operator: 'AND', // 'AND' | 'OR'
    severity: 'critical', // 'info' | 'warning' | 'critical'
    conditions: [
      {
        metric: 'cpu_utilization',
        operator: '>', // '>' | '<' | '=' | '>=' | '<='
        value: 90,
        duration: 5,
        durationUnit: 'minutes'
      },
      {
        metric: 'memory_usage',
        operator: '>',
        value: 85,
        duration: 3,
        durationUnit: 'minutes'
      }
    ]
  }
];

// 告警觸發邏輯
const evaluateAlertRule = (rule, metrics) => {
  return rule.condition_groups.some(group => {
    if (group.operator === 'AND') {
      return group.conditions.every(condition =>
        evaluateCondition(condition, metrics)
      );
    } else { // OR
      return group.conditions.some(condition =>
        evaluateCondition(condition, metrics)
      );
    }
  });
};
```

### 🎨 UI 特性
- **分區塊設計**：快速範本、基本資訊、觸發條件、事件內容、自動化響應
- **條件構建器**：視覺化的條件編輯界面
- **範本系統**：一鍵應用常用告警規則
- **實時預覽**：條件配置的實時驗證

### 🔗 API 設計參考

#### 告警規則數據結構
```javascript
{
  "id": "rule_1",
  "name": "多等級 CPU 告警",
  "description": "根據 CPU 使用率設定不同等級的告警",
  "target": "Production Web Servers", // 目標資源群組
  "enabled": true,
  "condition_groups": [
    {
      "id": "group_1",
      "operator": "AND",
      "severity": "critical",
      "conditions": [
        {
          "metric": "cpu_utilization",
          "operator": ">",
          "value": 90,
          "duration": 5,
          "durationUnit": "minutes"
        }
      ]
    }
  ],
  "notifications": [
    {
      "channel_id": "slack_ops",
      "channel_type": "slack",
      "template": "CPU 使用率過高告警"
    }
  ],
  "automation": {
    "enabled": true,
    "script_id": "s_1",
    "params": { "instance_count": 2 }
  },
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-01T00:00:00Z",
  "created_by": "admin"
}
```

#### 關鍵 API 端點
- **創建規則**：`POST /api/alert-rules`
- **更新規則**：`PUT /api/alert-rules/{id}`
- **獲取列表**：`GET /api/alert-rules?page=1&size=20&search=CPU`
- **啟用/停用**：`PATCH /api/alert-rules/{id}/status`
- **刪除規則**：`DELETE /api/alert-rules/{id}`

#### 業務驗證規則
- 至少要有一個條件群組
- 每個條件群組至少要有一個條件
- target 必須指向有效的資源群組

---

## NotificationStrategiesPage

### 🎯 頁面目的
配置告警的通知路由策略，決定告警應該發送給哪些團隊和管道。

### ⚙️ 核心功能
- **三步驟配置**：資源群組 → 通知管道 → 匹配條件
- **智慧建議**：根據資源群組自動建議負責團隊
- **多管道支持**：Slack、Email、PagerDuty 等多種通知管道
- **條件匹配**：基於告警屬性進行路由決策

### 🔄 業務邏輯
```javascript
// 三步驟配置流程
const steps = [
  {
    title: '選擇資源群組',
    content: '選擇要配置通知策略的資源群組'
  },
  {
    title: '設定通知管道',
    content: '選擇負責團隊和通知管道'
  },
  {
    title: '新增匹配條件',
    content: '設定告警匹配和路由條件'
  }
];

// 智慧團隊建議邏輯
const suggestTeam = (resourceGroup) => {
  const group = mockResourceGroups.find(rg => rg.key === resourceGroup.key);
  if (group && group.responsibleTeam) {
    return mockTeams.find(t => t.key === group.responsibleTeam);
  }
  return null;
};
```

### 🎨 UI 特性
- **步驟指示器**：清晰的三步驟進度顯示
- **智慧建議**：系統自動推薦的配置選項
- **管道選擇**：多選的通知管道配置
- **條件編輯器**：鍵值對的匹配條件設定

### 🔗 API 設計參考

#### 通知策略數據結構
```javascript
{
  "id": "policy_1",
  "name": "生產環境告警策略",
  "description": "生產環境的告警路由和處理策略",
  "resource_group": "Production Web Servers",
  "notification_channels": [
    {
      "channel_id": "slack_ops",
      "channel_type": "slack",
      "priority": "high",
      "escalation_time": 300
    },
    {
      "channel_id": "pagerduty_ops",
      "channel_type": "pagerduty",
      "priority": "critical",
      "escalation_time": 600
    }
  ],
  "match_conditions": [
    {
      "key": "severity",
      "operator": "=",
      "value": "critical"
    }
  ],
  "escalation_rules": [
    {
      "level": 1,
      "delay": 300,
      "channels": ["slack_ops"]
    },
    {
      "level": 2,
      "delay": 600,
      "channels": ["pagerduty_ops"]
    }
  ],
  "enabled": true,
  "created_by": "admin"
}
```

#### 關鍵 API 端點
- **創建策略**：`POST /api/notification-policies`
- **更新策略**：`PUT /api/notification-policies/{id}`
- **獲取列表**：`GET /api/notification-policies?page=1&size=20`
- **刪除策略**：`DELETE /api/notification-policies/{id}`

#### 業務驗證規則
- 至少要有一個通知管道
- 資源群組必須存在
- 升級規則的時間必須遞增

---

## SilencesPage

### 🎯 頁面目的
管理靜音規則，控制告警的通知行為。

### ⚙️ 核心功能
- **靜音規則管理**：創建、編輯、刪除靜音規則
- **多種類型**：一次性靜音、週期性靜音
- **匹配條件**：精確的告警匹配規則
- **狀態監控**：靜音規則的生效狀態

### 🔄 業務邏輯
```javascript
// 靜音規則類型
const silenceTypes = {
  once: {
    // 一次性靜音
    timeRange: [startTime, endTime],
    description: '臨時維護期間靜音'
  },
  recurring: {
    // 週期性靜音
    pattern: 'weekly', // 'daily' | 'weekly' | 'monthly'
    weekdays: [6, 0], // 週六、日
    timeSlot: ['02:00', '04:00'],
    validUntil: endDate
  }
};

// 靜音匹配邏輯
const isSilenced = (alert, silences) => {
  return silences.some(silence => {
    // 檢查時間範圍
    const inTimeRange = checkTimeRange(alert.timestamp, silence);

    // 檢查匹配條件
    const matches = silence.matchers.every(matcher =>
      evaluateMatcher(matcher, alert)
    );

    return inTimeRange && matches && silence.enabled;
  });
};
```

### 🎨 UI 特性
- **規則列表**：清晰的靜音規則表格
- **狀態指示**：生效中/待生效/已過期狀態
- **快速範本**：常用靜音規則範本
- **排程顯示**：人性化的時間排程展示

### 🔗 API 設計參考

#### 靜音規則數據結構

**一次性靜音**：
```javascript
{
  "id": "silence_1",
  "name": "緊急維護靜音",
  "type": "once",
  "description": "系統緊急維護期間靜音所有告警",
  "timeRange": {
    "start": "2024-01-01T02:00:00Z",
    "end": "2024-01-01T04:00:00Z"
  },
  "matchers": [
    {
      "key": "resource_group",
      "operator": "=",
      "value": "Production Database"
    }
  ],
  "created_by": "admin",
  "enabled": true
}
```

**週期性靜音**：
```javascript
{
  "id": "silence_2",
  "name": "週末例行維護",
  "type": "recurring",
  "description": "每週六日例行維護期間靜音",
  "recurringPattern": "weekly",
  "weekdays": [6, 0], // 週六、日
  "timeSlot": {
    "start": "02:00",
    "end": "04:00"
  },
  "validUntil": "2024-12-31T23:59:59Z",
  "matchers": [...],
  "created_by": "admin",
  "enabled": true
}
```

#### 關鍵 API 端點
- **創建靜音規則**：`POST /api/silences`
- **獲取靜音列表**：`GET /api/silences?status=active&page=1&size=20`
- **更新靜音規則**：`PUT /api/silences/{id}`
- **啟用/停用**：`PATCH /api/silences/{id}/status`
- **刪除規則**：`DELETE /api/silences/{id}`
- **檢查靜音狀態**：`GET /api/silences/check?resource=web-prod-01&alert_name=CPU high`

#### 業務驗證規則
- 一次性靜音必須有有效的時間範圍
- 週期性靜音必須有有效的排程配置
- 至少要有一個匹配條件

---

## ScriptsPage

### 🎯 頁面目的
管理自動化腳本，提供腳本的開發、編輯和測試功能。

### ⚙️ 核心功能
- **腳本管理**：創建、編輯、刪除腳本
- **代碼編輯器**：支持多種程式語言
- **參數配置**：腳本執行參數設定
- **運行記錄**：腳本執行歷史和結果

### 🔄 業務邏輯
```javascript
// 腳本執行邏輯
const executeScript = async (script, params) => {
  const execution = {
    id: `exec_${Date.now()}`,
    scriptId: script.id,
    scriptName: script.name,
    status: 'running',
    startTime: dayjs(),
    params: params,
    trigger: {
      type: 'manual', // 'manual' | 'schedule' | 'alert'
      user: currentUser?.name
    }
  };

  // 記錄執行開始
  setExecutions(prev => [execution, ...prev]);

  try {
    // 執行腳本邏輯
    const result = await runScript(script.code, params);

    // 更新執行狀態
    updateExecution(execution.id, {
      status: 'success',
      endTime: dayjs(),
      duration: dayjs().diff(execution.startTime),
      result: result
    });

  } catch (error) {
    // 處理執行錯誤
    updateExecution(execution.id, {
      status: 'failed',
      endTime: dayjs(),
      duration: dayjs().diff(execution.startTime),
      error: error.message
    });
  }
};
```

---

## SchedulesPage

### 🎯 頁面目的
管理定時任務的排程配置。

### ⚙️ 核心功能
- **排程管理**：創建、編輯、刪除排程任務
- **CRON 表達式**：支持複雜的時間排程配置
- **腳本關聯**：將排程綁定到具體的腳本
- **執行歷史**：排程任務的執行記錄

### 🔄 業務邏輯
```javascript
// CRON 解析和下次執行計算
const parseCronAndGetNext = (cronExpression) => {
  // 解析 CRON 表達式
  const schedule = cron.parse(cronExpression);

  // 計算下次執行時間
  const nextExecution = schedule.next();

  return {
    schedule: schedule,
    nextExecution: nextExecution,
    humanReadable: getHumanReadable(cronExpression)
  };
};

// 排程任務結構
const scheduleTask = {
  id: 'schedule_1',
  name: '每日資料庫備份',
  cron: '0 2 * * *', // 每天凌晨2點
  scriptId: 'script_backup',
  enabled: true,
  lastExecution: '2024-01-01T02:00:00Z',
  nextExecution: '2024-01-02T02:00:00Z',
  createdBy: 'admin'
};
```

---

## ExecutionsPage

### 🎯 頁面目的
查看所有腳本和排程任務的執行歷史記錄。

### ⚙️ 核心功能
- **執行記錄查看**：所有腳本執行的詳細記錄
- **狀態監控**：執行狀態（成功/失敗/運行中）
- **性能指標**：執行時間、資源消耗
- **日誌查看**：詳細的執行日誌和錯誤信息

---

## CapacityPlanningPage

### 🎯 頁面目的
提供容量規劃分析，幫助預測資源需求和規劃擴容。

### ⚙️ 核心功能
- **趨勢分析**：資源使用率的歷史趨勢
- **預測模型**：基於歷史數據的容量預測
- **擴容建議**：自動化的擴容建議
- **成本分析**：容量變化的成本影響

### 🔄 業務邏輯
```javascript
// 容量預測邏輯
const predictCapacity = (historicalData, predictionDays) => {
  const trend = calculateTrend(historicalData);
  const seasonal = analyzeSeasonal(historicalData);
  const predictedUsage = [];

  for (let i = 1; i <= predictionDays; i++) {
    const date = dayjs().add(i, 'day');
    const baseUsage = trend.slope * i + trend.intercept;
    const seasonalFactor = getSeasonalFactor(seasonal, date);
    const predictedValue = baseUsage * seasonalFactor;

    predictedUsage.push({
      date: date,
      predicted: predictedValue,
      confidence: calculateConfidence(historicalData, predictedValue)
    });
  }

  return predictedUsage;
};
```

---

## UserManagementPage

### 🎯 頁面目的
管理平台用戶，提供用戶的增刪改查和權限分配功能。

### ⚙️ 核心功能
- **用戶管理**：創建、編輯、刪除用戶
- **權限分配**：為用戶分配角色和團隊
- **狀態管理**：用戶的活躍/停用狀態
- **登入記錄**：用戶的登入歷史

---

## TeamManagementPage

### 🎯 頁面目的
管理團隊結構和成員配置。

### ⚙️ 核心功能
- **團隊管理**：創建、編輯、刪除團隊
- **成員管理**：添加/移除團隊成員
- **通知訂閱**：管理團隊的通知訂閱設定
- **權限委派**：團隊內部的權限分配

### 🔗 API 設計參考

#### 團隊數據結構
```javascript
{
  "id": "team_devops",
  "name": "DevOps Team",
  "description": "負責 CI/CD 和基礎設施自動化的團隊",
  "members": [
    {
      "user_id": "user_1",
      "role": "team_manager", // "team_manager" | "team_member"
      "joined_at": "2024-01-01T00:00:00Z"
    }
  ],
  "subscribers": [
    {
      "type": "slack_channel", // "user" | "slack_channel" | "email_group" | "pagerduty_schedule"
      "id": "slack_devops",
      "name": "#devops-alerts"
    }
  ],
  "owner": "user_1",
  "created_at": "2024-01-01T00:00:00Z"
}
```

#### 關鍵 API 端點
- **獲取團隊列表**：`GET /api/teams?page=1&size=20`
- **創建團隊**：`POST /api/teams`
- **更新團隊**：`PUT /api/teams/{id}`
- **刪除團隊**：`DELETE /api/teams/{id}`
- **管理團隊成員**：`PUT /api/teams/{id}/members`

#### 業務驗證規則
- 團隊必須有至少一個成員
- 團隊成員的角色必須有效

---

## RoleManagementPage

### 🎯 頁面目的
管理系統角色和權限配置。

### ⚙️ 核心功能
- **角色定義**：創建自定義角色
- **權限樹**：樹狀結構的權限配置
- **角色分配**：將角色分配給用戶
- **權限繼承**：支持權限的層次結構

---

## 導航頁面

### ResourcesPage, IncidentsPage, AnalyzingPage, AutomationPage

這些是導航頁面，提供各功能模組的入口和概覽。

#### 🎯 共同特性
- **卡片式導航**：功能模組的卡片式展示
- **狀態概覽**：各模組的關鍵指標
- **快速入口**：直接跳轉到具體功能頁面

---

## AdministrationPage

### 🎯 頁面目的
管理模組的入口頁面，提供所有管理功能的導航和概覽。

### ⚙️ 核心功能
- **功能卡片導航**：各管理模組的卡片式展示
- **權限檢查**：根據用戶權限顯示可用的管理功能
- **快速入口**：直接跳轉到具體的管理頁面

### 🔄 業務邏輯
```javascript
// 管理模組權限檢查邏輯
const getAvailableModules = (userPermissions) => {
  const allModules = [
    { key: 'user-management', name: '用戶管理', icon: 'UserOutlined' },
    { key: 'team-management', name: '團隊管理', icon: 'TeamOutlined' },
    { key: 'role-management', name: '角色管理', icon: 'SafetyOutlined' },
    { key: 'notification-strategies', name: '通知策略', icon: 'NotificationOutlined' },
    { key: 'notification-channels', name: '通知管道', icon: 'MessageOutlined' },
    { key: 'system-settings', name: '系統設定', icon: 'SettingOutlined' }
  ];

  return allModules.filter(module =>
    userPermissions.includes(module.key) ||
    userPermissions.includes('admin')
  );
};
```

---

## NotificationChannelsPage

### 🎯 頁面目的
管理各種通知管道的配置，包括 Slack、Email、PagerDuty 等。

### ⚙️ 核心功能
- **管道配置**：各類通知管道的詳細配置
- **連線測試**：測試通知管道的連線狀態
- **模板管理**：管理不同管道的通知模板
- **狀態監控**：監控管道的可用性和使用統計

### 🔗 API 設計參考

#### 通知管道數據結構
```javascript
{
  "id": "slack_ops",
  "name": "Operations Slack Channel",
  "type": "slack", // "slack" | "email" | "pagerduty" | "webhook"
  "config": {
    "webhook_url": "https://hooks.slack.com/services/...",
    "channel": "#ops-alerts",
    "username": "SRE Platform"
  },
  "templates": {
    "critical": ":fire: *CRITICAL ALERT* {{alert.summary}}",
    "warning": ":warning: *WARNING* {{alert.summary}}",
    "info": ":information_source: *INFO* {{alert.summary}}"
  },
  "enabled": true,
  "last_tested": "2024-01-01T10:00:00Z",
  "test_status": "success"
}
```

#### 關鍵 API 端點
- **獲取管道列表**：`GET /api/notification-channels?page=1&size=20`
- **創建通知管道**：`POST /api/notification-channels`
- **更新管道配置**：`PUT /api/notification-channels/{id}`
- **刪除管道**：`DELETE /api/notification-channels/{id}`
- **測試管道連線**：`POST /api/notification-channels/{id}/test`

#### 業務驗證規則
- 管道配置必須包含必要的連線參數
- Webhook URL 必須有效
- 模板必須包含必要的變數

---

## SystemSettingsPage

### 🎯 頁面目的
管理系統級別的配置和設定。

### ⚙️ 核心功能
- **系統參數**：全局系統參數配置
- **安全性設定**：密碼策略、安全策略等
- **效能調優**：系統效能相關設定
- **維護模式**：系統維護模式的開啟/關閉

---

## PlatformDiagnosticsPage

### 🎯 頁面目的
提供平台診斷和健康檢查功能。

### ⚙️ 核心功能
- **健康檢查**：各系統組件的健康狀態檢查
- **性能指標**：實時性能指標監控
- **日誌分析**：系統日誌的分析和報表
- **問題診斷**：自動化的問題檢測和建議

---

## AuditLogsPage

### 🎯 頁面目的
記錄和展示系統的所有操作審計日誌。

### ⚙️ 核心功能
- **操作日誌**：所有用戶操作的詳細記錄
- **篩選搜尋**：按用戶、操作類型、時間等條件篩選
- **詳細查看**：操作詳情的展開查看
- **報表導出**：審計日誌的導出功能

---

## ProfilePage

### 🎯 頁面目的
用戶個人資料和偏好設定的管理頁面。

### ⚙️ 核心功能
- **個人資訊**：用戶基本資訊的管理
- **安全設定**：密碼修改、安全偏好
- **通知偏好**：個人通知設定
- **主題設定**：界面主題的選擇

---

## 整體架構設計原則

### 🎯 自訂管理層 + 開源執行引擎

這是整個平台的基石，一個「不要重複造輪子」的現代化架構。

* **核心思想**：您的 SRE 平台扮演**「統一的管理層 (Unified Management Plane)」**，專注於提供最佳的、整合的、客製化的使用者體驗 (UI/UX)。

* **後端引擎**：平台底層利用強大而穩定的開源工具作為**「執行引擎 (Execution Engine)」**。我們確認了：
    * **告警規則與路由**：由 **Grafana Alerting** 負責。
    * **On-Call 排程**：由 **Grafana OnCall** (自行部署的開源版本) 負責。

* **整合方式**：您的平台後端，透過呼叫 Grafana 各個模組的 **API** 來進行配置和管理，而不是自己從頭實作這些複雜的引擎。

* **智慧中樞**：所有從 Grafana 發出的告警通知，都先發送到您**唯一的 Webhook 服務**。這讓您的平台成為一個攔截點，為整合 **AI Agent**、進行事件擴充和自動化處理提供了無限可能，是平台邁向 AIOps 的關鍵。

### 🎨 資訊模型原則：權責分離與明確歸屬

為了避免混亂並確保可擴展性，我們為平台的核心物件定義了清晰的職責。

1.  **「權限群組」 vs. 「通知團隊」的分離**：
    * **權限群組** (`管理 -> 團隊/群組管理`)：只負責**權限 (RBAC)**，定義「誰能在平台上做什麼」。
    * **通知團隊/聯絡點** (`管理 -> 通知設定`)：只負責**通知**，定義「告警要發給誰」，是一個包含使用者、頻道、值班表的「通訊錄」。

2.  **「資源群組」擁有唯一的「負責團隊」**：
    * **核心目的**：建立**明確的責任歸屬 (Clear Ownership)**。任何資源問題，都有一個主要的、不模糊的負責團隊。
    * **UI 實現**：在「資源群組管理」頁面，透過**單選**下拉選單來綁定唯一的負責團隊。

3.  **「告警規則」與「通知策略」的解耦**：
    * **告警規則**：只定義**「什麼是問題」**，並為問題貼上描述性的**標籤**（例如 `severity="critical"`）。
    * **通知策略**：獨立的路由引擎，它根據告警的**標籤**，來決定**「應該將這個問題通知給誰」**。

### 🎯 使用者體驗 (UX) 策略：引導式配置 (Guided Configuration)

我們不希望使用者面對複雜的表單，而是要智慧地引導他們完成設定。這個策略在「通知策略」的設計中體現得最為完整。

1.  **從「範圍」開始**：流程總是從一個最簡單的問題開始：「您關心哪個**資源群組**？」
2.  **系統自動建議**：利用預先建立的「資源群組 → 負責團隊」的綁定關係，系統會**自動建議**最有可能的通知對象。
3.  **提供透明反饋**：UI 會明確告知使用者系統做了什麼自動化處理（例如，「系統建議此資源群組由 DBA-Team 負責」）。
4.  **保留「逃生口」**：在提供智慧建議的同時，始終為進階使用者或例外情況，保留**手動覆寫**的彈性。
5.  **資訊架構分層**：在主選單的設計上，我們區分了**「操作視圖」**（`資源`、`事件`，高頻使用）和**「管理配置」**（`管理`，低頻使用），讓 SRE 的日常工作流程更順暢。

**總結來說**，我們設計的不是一個孤立的工具集合，而是一個**高度整合、權責分明、流程自動化、智慧驅動**的 SRE 平台。這個設計邏輯為您的平台奠定了一個非常穩固且具備高度擴展性的基礎。

本文檔為前端開發提供了完整的頁面邏輯參考，確保了功能的完整實現和用戶體驗的一致性。

## 📋 文檔價值

### 對於開發團隊：
- ✅ **前端開發**：完整的功能實現參考
- ✅ **後端開發**：API 設計依據和數據結構參考
- ✅ **測試團隊**：功能驗證標準
- ✅ **產品團隊**：功能完整性確認

### 對於業務邏輯理解：
- ✅ **數據流程**：從資源到事件的完整鏈路
- ✅ **狀態管理**：事件生命周期管理
- ✅ **權限控制**：基於角色的訪問控制
- ✅ **自動化流程**：腳本執行和排程邏輯

### 📁 文件位置
**`/Users/zoe/Documents/sre-platform-frontend/pages.md`**
