# 模擬資料真實性提升方案

## 一、現況分析

### 1.1 現有命名模式問題

**現況：**
- 資源命名過於簡單：`host_1`, `db-prod-01`
- 缺乏業務語境：無法體現實際用途
- 編號無規律：隨意使用 01, 02 等
- 地域資訊缺失：無法識別部署區域

### 1.2 資料動態性不足

- 靜態數值：CPU、記憶體等指標固定不變
- 時間戳記單一：都是相對於 `dayjs()` 的固定偏移
- 狀態分布不真實：healthy/warning/critical 比例失真
- 缺乏關聯性：資源間無業務邏輯關係

## 二、真實環境命名規範

### 2.1 資源命名規範

```javascript
// 命名模式：{環境}-{服務}-{類型}-{區域}-{編號}
const namingConvention = {
  // 環境標識
  environment: {
    prod: '生產環境',
    stg: '預發環境', 
    dev: '開發環境',
    test: '測試環境'
  },
  
  // 服務類型
  service: {
    web: 'Web服務',
    api: 'API服務',
    db: '資料庫',
    cache: '快取',
    mq: '訊息佇列',
    storage: '儲存服務',
    gateway: '閘道器',
    auth: '認證服務',
    pay: '支付服務',
    order: '訂單服務'
  },
  
  // 資源類型
  resourceType: {
    app: '應用實例',
    mysql: 'MySQL',
    redis: 'Redis', 
    nginx: 'Nginx',
    k8s: 'Kubernetes',
    kafka: 'Kafka',
    es: 'ElasticSearch',
    mongo: 'MongoDB'
  },
  
  // 區域標識
  region: {
    'tw-tp': '台北',
    'cn-sh': '上海',
    'cn-sz': '深圳',
    'us-west': '美西',
    'eu-fr': '法蘭克福'
  }
};

// 範例：prod-order-mysql-tw-tp-01
// 解釋：生產環境-訂單服務-MySQL資料庫-台北機房-編號01
```

### 2.2 IP 地址分配規則

```javascript
// 根據環境和服務類型分配 IP 段
const ipAllocation = {
  prod: {
    web: '10.10.1.0/24',      // 10.10.1.1 - 10.10.1.254
    api: '10.10.2.0/24',      // 10.10.2.1 - 10.10.2.254
    db: '10.10.3.0/24',       // 10.10.3.1 - 10.10.3.254
    cache: '10.10.4.0/24',    // 10.10.4.1 - 10.10.4.254
    internal: '172.16.0.0/16' // 內部服務
  },
  stg: {
    web: '10.20.1.0/24',
    api: '10.20.2.0/24',
    db: '10.20.3.0/24',
    cache: '10.20.4.0/24'
  },
  dev: {
    all: '192.168.0.0/16'     // 開發環境統一使用
  }
};
```

### 2.3 標籤系統

```javascript
const tagSystem = {
  // 業務標籤
  business: [
    'core-business',      // 核心業務
    'payment-critical',   // 支付關鍵
    'user-facing',       // 面向用戶
    'backend-service',   // 後端服務
    'data-pipeline'      // 資料管道
  ],
  
  // 技術標籤
  technical: [
    'high-availability',  // 高可用
    'auto-scaling',      // 自動擴縮
    'load-balanced',     // 負載均衡
    'replicated',        // 已複製
    'containerized'      // 容器化
  ],
  
  // 管理標籤
  management: [
    'cost-center:tech',  // 成本中心
    'owner:platform',    // 負責團隊
    'sla:99.99',        // SLA 等級
    'compliance:pci',    // 合規要求
    'backup:daily'       // 備份策略
  ]
};
```

## 三、動態資料生成

### 3.1 效能指標波動

```javascript
// 生成真實的效能指標波動
const generateMetrics = (baseValue, variance = 0.1) => {
  const time = new Date().getTime();
  const hourOfDay = new Date().getHours();
  const dayOfWeek = new Date().getDay();
  
  // 基礎波動
  let value = baseValue * (1 + (Math.random() - 0.5) * variance);
  
  // 每日模式（工作時間較高）
  if (hourOfDay >= 9 && hourOfDay <= 18) {
    value *= 1.3;
  } else if (hourOfDay >= 0 && hourOfDay <= 6) {
    value *= 0.7;
  }
  
  // 每週模式（週末較低）
  if (dayOfWeek === 0 || dayOfWeek === 6) {
    value *= 0.6;
  }
  
  // 隨機尖峰（5% 機率）
  if (Math.random() < 0.05) {
    value *= 1.5;
  }
  
  return Math.round(value * 100) / 100;
};
```

### 3.2 時序資料生成

```javascript
// 生成具有趨勢性的時序資料
const generateTimeSeries = (hours = 24, interval = 1) => {
  const now = dayjs();
  const data = [];
  
  // 基礎值和趨勢
  let baseValue = 50;
  const trend = Math.random() > 0.5 ? 1 : -1; // 上升或下降趨勢
  const trendStrength = Math.random() * 0.5 + 0.1; // 0.1-0.6
  
  for (let i = hours; i >= 0; i -= interval) {
    const time = now.subtract(i, 'hour');
    
    // 應用趨勢
    baseValue += trend * trendStrength;
    
    // 限制範圍
    baseValue = Math.max(10, Math.min(90, baseValue));
    
    // 添加噪音
    const noise = (Math.random() - 0.5) * 10;
    const value = baseValue + noise;
    
    data.push({
      time: time.format('YYYY-MM-DD HH:mm:ss'),
      value: Math.round(value * 100) / 100
    });
  }
  
  return data;
};
```

### 3.3 事件相關性

```javascript
// 生成相關聯的事件
const generateCorrelatedIncidents = () => {
  const scenarios = [
    {
      name: '資料庫故障級聯',
      root: {
        resource: 'prod-order-mysql-tw-tp-01',
        issue: 'Connection pool exhausted',
        severity: 'critical'
      },
      cascades: [
        { resource: 'prod-order-api-tw-tp-01', issue: 'Database timeout', delay: 30 },
        { resource: 'prod-web-nginx-tw-tp-01', issue: '502 Bad Gateway', delay: 60 },
        { resource: 'prod-pay-api-tw-tp-02', issue: 'Order service unavailable', delay: 90 }
      ]
    },
    {
      name: '快取服務異常',
      root: {
        resource: 'prod-cache-redis-tw-tp-01',
        issue: 'Memory usage > 95%',
        severity: 'warning'
      },
      cascades: [
        { resource: 'prod-api-app-tw-tp-03', issue: 'Cache miss rate high', delay: 15 },
        { resource: 'prod-web-app-tw-tp-02', issue: 'Response time increased', delay: 30 }
      ]
    }
  ];
  
  // 隨機選擇場景
  const scenario = scenarios[Math.floor(Math.random() * scenarios.length)];
  const incidents = [];
  const baseTime = dayjs();
  
  // 生成根事件
  incidents.push({
    key: `inc_${Date.now()}`,
    summary: `${scenario.root.issue} on ${scenario.root.resource}`,
    severity: scenario.root.severity,
    resource_name: scenario.root.resource,
    created_at: baseTime,
    storm_group: `storm_${Date.now()}`
  });
  
  // 生成級聯事件
  scenario.cascades.forEach((cascade, index) => {
    incidents.push({
      key: `inc_${Date.now()}_${index}`,
      summary: `${cascade.issue} on ${cascade.resource}`,
      severity: 'warning',
      resource_name: cascade.resource,
      created_at: baseTime.add(cascade.delay, 'second'),
      storm_group: incidents[0].storm_group
    });
  });
  
  return incidents;
};
```

## 四、實施建議

### 4.1 資源池配置

```javascript
// 真實環境資源池
const resourcePool = {
  production: {
    web: [
      { name: 'prod-web-nginx-tw-tp-01', ip: '10.10.1.10', cpu: 45, memory: 62, tags: ['user-facing', 'load-balanced'] },
      { name: 'prod-web-nginx-tw-tp-02', ip: '10.10.1.11', cpu: 48, memory: 65, tags: ['user-facing', 'load-balanced'] },
      { name: 'prod-web-app-tw-tp-01', ip: '10.10.1.20', cpu: 72, memory: 78, tags: ['user-facing', 'auto-scaling'] },
      { name: 'prod-web-app-tw-tp-02', ip: '10.10.1.21', cpu: 68, memory: 75, tags: ['user-facing', 'auto-scaling'] }
    ],
    api: [
      { name: 'prod-order-api-tw-tp-01', ip: '10.10.2.10', cpu: 56, memory: 71, tags: ['core-business', 'high-availability'] },
      { name: 'prod-pay-api-tw-tp-01', ip: '10.10.2.20', cpu: 62, memory: 74, tags: ['payment-critical', 'high-availability'] },
      { name: 'prod-user-api-tw-tp-01', ip: '10.10.2.30', cpu: 51, memory: 68, tags: ['core-business', 'containerized'] }
    ],
    database: [
      { name: 'prod-order-mysql-tw-tp-01', ip: '10.10.3.10', cpu: 78, memory: 85, tags: ['core-business', 'replicated', 'backup:hourly'] },
      { name: 'prod-user-mysql-tw-tp-01', ip: '10.10.3.20', cpu: 71, memory: 82, tags: ['core-business', 'replicated', 'backup:daily'] },
      { name: 'prod-analytics-mongo-tw-tp-01', ip: '10.10.3.30', cpu: 65, memory: 88, tags: ['data-pipeline', 'backup:daily'] }
    ]
  },
  staging: {
    // 預發環境資源（規模較小）
    web: [
      { name: 'stg-web-nginx-tw-tp-01', ip: '10.20.1.10', cpu: 35, memory: 45, tags: ['staging', 'testing'] }
    ]
  }
};
```

### 4.2 事件場景庫

```javascript
// 常見故障場景
const incidentScenarios = {
  // 早高峰場景
  morningPeak: {
    time: { hour: 9, minute: 0 },
    incidents: [
      'Login service timeout due to high traffic',
      'Database connection pool exhausted',
      'CDN cache miss rate increased'
    ]
  },
  
  // 促銷活動場景
  promotion: {
    incidents: [
      'Payment gateway response time degradation',
      'Order service queue backlog',
      'Inventory service under pressure'
    ]
  },
  
  // 基礎設施故障
  infrastructure: {
    incidents: [
      'Network switch failure in rack A-12',
      'Storage array IOPS limit reached',
      'Kubernetes node NotReady'
    ]
  }
};
```

## 五、預期效果

### 5.1 提升的真實性
- 資源命名符合企業實際規範
- IP 分配遵循網路架構設計
- 效能資料呈現真實波動模式
- 事件具有業務關聯性

### 5.2 增強的可用性
- 易於理解的命名體系
- 可預測的資料變化模式
- 貼近實際的故障場景
- 有助於功能測試和演示

### 5.3 改進的展示效果
- 更專業的資料呈現
- 更真實的使用場景
- 更好的用戶體驗
- 更強的說服力

## 六、實施步驟

1. **第一階段**：更新所有靜態資源命名（1天）
2. **第二階段**：實現動態指標生成（2天）
3. **第三階段**：建立事件關聯機制（2天）
4. **第四階段**：整合時序資料生成（1天）
5. **第五階段**：測試和調優（1天）