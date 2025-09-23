const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 4000;
const toISO = (value) => new Date(value).toISOString();
const now = new Date();

const currentUser = {
  user_id: 'user-001',
  username: 'sre.lead',
  display_name: '林佳瑜',
  email: 'sre.lead@example.com',
  roles: ['sre', 'incident-commander'],
  teams: ['sre-core'],
  status: 'active',
  last_login_at: toISO(now),
  avatar_url: null
};

const userPreferences = {
  theme: 'auto',
  default_page: 'war_room',
  language: 'zh-TW',
  timezone: 'Asia/Taipei',
  notification_preferences: {
    email_notification: true,
    slack_notification: true,
    merge_notification: false
  },
  display_options: {
    animation: true,
    tooltips: true,
    compact_mode: false
  }
};

const securityLogins = [
  {
    login_time: toISO(now),
    ip_address: '203.0.113.8',
    device_info: 'Chrome on macOS',
    status: 'success',
    location: 'Taipei'
  },
  {
    login_time: toISO(new Date(now.getTime() - 3600 * 1000)),
    ip_address: '198.51.100.25',
    device_info: 'Safari on iOS',
    status: 'success',
    location: 'Kaohsiung'
  },
  {
    login_time: toISO(new Date(now.getTime() - 86400 * 1000)),
    ip_address: '192.0.2.11',
    device_info: 'Firefox on Windows',
    status: 'failed',
    location: 'Unknown'
  }
];

const notifications = [
  {
    notification_id: 'ntf-001',
    title: 'API 延遲超過閾值',
    description: '北區 Gateway API P95 延遲超過 500ms。',
    severity: 'critical',
    category: 'incident',
    status: 'unread',
    created_at: toISO(now),
    read_at: null,
    link_url: '/incidents/evt-001',
    actions: ['acknowledge', 'view']
  },
  {
    notification_id: 'ntf-002',
    title: '容量預測完成',
    description: 'AI 預測資料庫集群於 30 天後達 80% 使用率。',
    severity: 'warning',
    category: 'analysis',
    status: 'read',
    created_at: toISO(new Date(now.getTime() - 7200 * 1000)),
    read_at: toISO(new Date(now.getTime() - 3600 * 1000)),
    link_url: '/analysis/capacity',
    actions: ['open-report']
  }
];

const eventData = [
  {
    event_id: 'evt-001',
    event_key: 'INC-2025-001',
    summary: 'API 延遲飆高',
    description: '交易 API P95 延遲持續高於 500ms。',
    severity: 'critical',
    status: 'in_progress',
    priority: 'P0',
    resource_id: 'res-001',
    resource_name: 'web-01',
    service_impact: '客戶交易延遲，SLA 風險升高',
    rule_id: 'rule-001',
    rule_name: 'API 延遲監控',
    trigger_threshold: '> 500ms',
    trigger_value: '820ms',
    unit: 'ms',
    trigger_time: toISO(new Date(now.getTime() - 15 * 60000)),
    assignee_id: 'user-002',
    assignee: '張于庭',
    acknowledged_at: toISO(new Date(now.getTime() - 10 * 60000)),
    resolved_at: null,
    tags: ['production', 'api'],
    timeline: [
      {
        entry_id: 'evt-001-tl-001',
        event_id: 'evt-001',
        entry_type: 'status_change',
        message: '事件自動從 new 轉為 in_progress。',
        created_by: 'system',
        created_at: toISO(new Date(now.getTime() - 13 * 60000)),
        metadata: { status: 'in_progress' }
      },
      {
        entry_id: 'evt-001-tl-002',
        event_id: 'evt-001',
        entry_type: 'note',
        message: '已通知應用團隊檢查最近部署。',
        created_by: '張于庭',
        created_at: toISO(new Date(now.getTime() - 9 * 60000)),
        metadata: { channel: 'slack' }
      }
    ],
    related: [
      {
        event_id: 'evt-002',
        relationship: 'depends_on',
        summary: '資料庫連線延遲升高',
        severity: 'warning',
        status: 'acknowledged',
        trigger_time: toISO(new Date(now.getTime() - 40 * 60000))
      }
    ],
    analysis: {
      event_id: 'evt-001',
      generated_at: toISO(new Date(now.getTime() - 5 * 60000)),
      summary: '高延遲與資料庫連線峰值相關。',
      root_cause: '資料庫讀取延遲導致 API 回應時間上升。',
      confidence: 0.82,
      impact_analysis: '主要影響交易 API，估計 8% 請求超時。',
      recommendations: [
        {
          title: '增加資料庫連線池',
          priority: 'high',
          description: '暫時提高讀取節點的連線池上限。',
          action_url: '/automation/scripts/autoscale-db'
        },
        {
          title: '啟用查詢快取',
          priority: 'medium',
          description: '針對熱門查詢開啟快取降低負載。',
          action_url: null
        }
      ]
    }
  },
  {
    event_id: 'evt-002',
    event_key: 'INC-2025-002',
    summary: '資料庫連線延遲升高',
    description: 'RDS 叢集讀取延遲偶發飆升。',
    severity: 'warning',
    status: 'acknowledged',
    priority: 'P2',
    resource_id: 'res-002',
    resource_name: 'rds-read-1',
    service_impact: '延遲影響讀取性能',
    rule_id: 'rule-002',
    rule_name: '資料庫延遲監控',
    trigger_threshold: '> 120ms',
    trigger_value: '210ms',
    unit: 'ms',
    trigger_time: toISO(new Date(now.getTime() - 45 * 60000)),
    assignee_id: 'user-003',
    assignee: '蔡敏豪',
    acknowledged_at: toISO(new Date(now.getTime() - 35 * 60000)),
    resolved_at: null,
    tags: ['database', 'production'],
    timeline: [],
    related: [],
    analysis: null
  }
];

const eventRules = [
  {
    rule_id: 'rule-001',
    name: 'API 延遲監控',
    description: '監控交易 API 延遲，超過閾值即觸發事件。',
    severity: 'critical',
    default_priority: 'P0',
    enabled: true,
    automation_enabled: true,
    creator: '林佳瑜',
    last_updated: toISO(new Date(now.getTime() - 86400000)),
    labels: ['app:web'],
    environments: ['production'],
    condition_groups: [
      {
        logic: 'AND',
        conditions: [
          { metric: 'p95_latency', operator: '>', threshold: 500, duration_minutes: 5, severity: 'critical' }
        ]
      }
    ],
    title_template: '{{service.name}} 延遲異常',
    content_template: '{{metric.name}} 於 {{duration}} 分鐘內維持 {{metric.value}}ms。',
    automation: {
      enabled: true,
      script_id: 'script-001',
      parameters: { mode: 'scale-out', count: 2 }
    }
  },
  {
    rule_id: 'rule-002',
    name: '資料庫延遲監控',
    description: '觀察資料庫連線與查詢延遲。',
    severity: 'warning',
    default_priority: 'P2',
    enabled: true,
    automation_enabled: false,
    creator: '林佳瑜',
    last_updated: toISO(new Date(now.getTime() - 172800000)),
    labels: ['tier:db'],
    environments: ['production'],
    condition_groups: [
      {
        logic: 'AND',
        conditions: [
          { metric: 'read_latency', operator: '>', threshold: 120, duration_minutes: 10, severity: 'warning' }
        ]
      }
    ],
    title_template: '{{resource.name}} 延遲告警',
    content_template: '{{metric.name}} 超過 {{threshold}} ms。',
    automation: {
      enabled: false,
      script_id: null,
      parameters: {}
    }
  }
];

const silenceRules = [
  {
    silence_id: 'slc-001',
    name: '週末維運靜音',
    description: '每週六 02:00-04:00 維運期間靜音。',
    silence_type: 'repeat',
    scope: 'resource',
    enabled: true,
    created_at: toISO(new Date(now.getTime() - 86400000 * 5)),
    schedule: {
      silence_type: 'repeat',
      starts_at: toISO('2025-01-18T02:00:00Z'),
      ends_at: toISO('2025-01-18T04:00:00Z'),
      timezone: 'Asia/Taipei',
      repeat: { frequency: 'weekly', days: ['sat'], until: null, occurrences: null }
    },
    matchers: [
      { key: 'resource_id', operator: 'equals', value: 'res-001' }
    ],
    notify_on_start: true,
    notify_on_end: false,
    created_by: 'user-001'
  }
];

const resourceData = [
  {
    resource_id: 'res-001',
    name: 'web-01',
    status: 'warning',
    type: 'service',
    ip_address: '10.10.8.11',
    location: 'ap-southeast-1a',
    environment: 'production',
    team_id: 'team-sre',
    team: 'SRE 核心小組',
    os: 'Ubuntu 22.04',
    cpu_usage: 72.4,
    memory_usage: 68.1,
    disk_usage: 55.3,
    network_in_mbps: 125.4,
    network_out_mbps: 118.2,
    service_impact: '交易 API',
    notes: '主要服務外部交易流量，需要高可用度。',
    last_event_count: 3,
    tags: [
      { key: 'env', value: 'production' },
      { key: 'tier', value: 'frontend' }
    ],
    groups: ['grp-001'],
    created_at: toISO(new Date(now.getTime() - 604800000)),
    updated_at: toISO(now)
  },
  {
    resource_id: 'res-002',
    name: 'rds-read-1',
    status: 'warning',
    type: 'database',
    ip_address: '10.10.12.21',
    location: 'ap-southeast-1b',
    environment: 'production',
    team_id: 'team-db',
    team: '資料庫團隊',
    os: 'Amazon Linux 2023',
    cpu_usage: 64.8,
    memory_usage: 71.2,
    disk_usage: 62.7,
    network_in_mbps: 95.1,
    network_out_mbps: 90.4,
    service_impact: '讀取節點',
    notes: '供應交易資料庫的讀取節點，需監控延遲。',
    last_event_count: 2,
    tags: [
      { key: 'env', value: 'production' },
      { key: 'role', value: 'read-replica' }
    ],
    groups: ['grp-002'],
    created_at: toISO(new Date(now.getTime() - 2592000000)),
    updated_at: toISO(now)
  }
];

const resourceGroups = [
  {
    group_id: 'grp-001',
    name: '交易前台集群',
    description: 'Web 與 API 節點',
    owner_team_id: 'team-sre',
    owner_team: 'SRE 核心小組',
    member_count: 1,
    subscriber_count: 4,
    status_summary: { healthy: 2, warning: 1, critical: 0 },
    created_at: toISO(new Date(now.getTime() - 777600000)),
    members: [
      { resource_id: 'res-001', name: 'web-01', type: 'service', status: 'warning' }
    ],
    subscribers: [
      { user_id: 'user-001', display_name: '林佳瑜', subscribed_at: toISO(new Date(now.getTime() - 604800000)) }
    ]
  }
];

const topologyGraph = {
  nodes: [
    { id: 'res-001', name: 'web-01', type: 'service', status: 'warning', icon: 'service', metrics: { cpu: 72, latency: 820 } },
    { id: 'res-002', name: 'rds-read-1', type: 'database', status: 'warning', icon: 'database', metrics: { latency: 210 } },
    { id: 'res-003', name: 'redis-cache', type: 'cache', status: 'healthy', icon: 'cache', metrics: { hitRate: 0.98 } }
  ],
  edges: [
    { source: 'res-001', target: 'res-002', relation: 'reads-from', traffic_level: 320 },
    { source: 'res-001', target: 'res-003', relation: 'cache', traffic_level: 210 }
  ]
};

const metricDefinitions = [
  {
    metric_key: 'cpu_usage_percent',
    display_name: 'CPU 使用率',
    description: '節點 CPU 使用率平均值 (百分比)。',
    unit: '%',
    category: 'performance',
    resource_scope: 'resource',
    supported_aggregations: ['avg', 'p95', 'max'],
    default_aggregation: 'avg',
    warning_threshold: 70,
    critical_threshold: 85,
    tags: ['host', 'saturation'],
    metadata: { source: 'prometheus', recommended_panels: ['war_room', 'resources_overview'] },
    created_at: toISO(new Date(now.getTime() - 86400000 * 7)),
    updated_at: toISO(new Date(now.getTime() - 3600000))
  },
  {
    metric_key: 'memory_usage_percent',
    display_name: '記憶體使用率',
    description: '節點記憶體使用率平均值 (百分比)。',
    unit: '%',
    category: 'performance',
    resource_scope: 'resource',
    supported_aggregations: ['avg', 'p95', 'max'],
    default_aggregation: 'avg',
    warning_threshold: 75,
    critical_threshold: 90,
    tags: ['host', 'capacity'],
    metadata: { source: 'prometheus', recommended_panels: ['resources_overview'] },
    created_at: toISO(new Date(now.getTime() - 86400000 * 5)),
    updated_at: toISO(new Date(now.getTime() - 5400000))
  },
  {
    metric_key: 'http_error_rate_percent',
    display_name: 'HTTP 錯誤率',
    description: 'API 服務每分鐘錯誤率 (百分比)。',
    unit: '%',
    category: 'reliability',
    resource_scope: 'resource',
    supported_aggregations: ['avg', 'max', 'p95'],
    default_aggregation: 'avg',
    warning_threshold: 1,
    critical_threshold: 3,
    tags: ['service', 'availability'],
    metadata: { source: 'prometheus', recommended_panels: ['war_room', 'incidents_overview'] },
    created_at: toISO(new Date(now.getTime() - 86400000 * 3)),
    updated_at: toISO(new Date(now.getTime() - 1800000))
  }
];

const metricOverviewRecords = [
  {
    metric_key: 'cpu_usage_percent',
    latest_value: 68.3,
    status: 'warning',
    change_rate: -0.06,
    variance: 6,
    top_resources: [
      { resource_id: 'res-001', resource_name: 'web-01', resource_type: 'service', value: 82.1, status: 'warning', change_rate: 0.05 },
      { resource_id: 'res-002', resource_name: 'rds-read-1', resource_type: 'database', value: 69.8, status: 'warning', change_rate: -0.02 }
    ],
    metadata: { panel: 'war_room', insight: 'API 節點 CPU 仍偏高' }
  },
  {
    metric_key: 'memory_usage_percent',
    latest_value: 63.4,
    status: 'healthy',
    change_rate: -0.03,
    variance: 5,
    top_resources: [
      { resource_id: 'res-001', resource_name: 'web-01', resource_type: 'service', value: 66.9, status: 'healthy', change_rate: -0.04 },
      { resource_id: 'res-002', resource_name: 'rds-read-1', resource_type: 'database', value: 71.2, status: 'warning', change_rate: 0.01 }
    ],
    metadata: { panel: 'resources_overview' }
  },
  {
    metric_key: 'http_error_rate_percent',
    latest_value: 2.7,
    status: 'critical',
    change_rate: 0.18,
    variance: 1.2,
    top_resources: [
      { resource_id: 'svc-gateway', resource_name: '北區 Gateway', resource_type: 'service', value: 3.9, status: 'critical', change_rate: 0.22 },
      { resource_id: 'res-001', resource_name: 'web-01', resource_type: 'service', value: 2.4, status: 'warning', change_rate: 0.12 }
    ],
    metadata: { panel: 'war_room', alert: '需優先處理 API 錯誤率' }
  }
];

const metricSeriesSeeds = {
  cpu_usage_percent: [
    { resource_id: 'res-001', baseValue: 82, variance: 5.5, status: 'warning' },
    { resource_id: 'res-002', baseValue: 68, variance: 4.2, status: 'warning' }
  ],
  memory_usage_percent: [
    { resource_id: 'res-001', baseValue: 66, variance: 4.3, status: 'healthy' },
    { resource_id: 'res-002', baseValue: 71, variance: 3.8, status: 'warning' }
  ],
  http_error_rate_percent: [
    {
      resource_id: 'svc-gateway',
      resource_name: '北區 Gateway',
      resource_type: 'service',
      team_id: 'team-sre',
      environment: 'production',
      baseValue: 3.8,
      variance: 1.4,
      status: 'critical'
    },
    {
      resource_id: 'svc-api',
      resource_name: '交易 API',
      resource_type: 'service',
      team_id: 'team-sre',
      environment: 'production',
      baseValue: 2.1,
      variance: 0.9,
      status: 'warning'
    }
  ]
};
metricSeriesSeeds.default = [
  { resource_id: 'res-001', baseValue: 60, variance: 4.5, status: 'healthy' }
];

const healthComponentsBase = [
  { name: 'postgresql', status: 'ok', message: '資料庫連線正常', latency_ms: 12 },
  { name: 'victoria-metrics', status: 'degraded', message: '查詢延遲 180ms，仍維持可用', latency_ms: 180 },
  { name: 'redis-cluster', status: 'ok', message: '快取與佇列服務正常', latency_ms: 7 },
  { name: 'grafana-webhook', status: 'ok', message: 'Grafana Webhook 轉發服務正常', latency_ms: 24 }
];

const readinessComponentsBase = [
  { name: 'postgresql', dependency: 'postgresql', status: 'ok', message: '主要資料庫節點連線正常', latency_ms: 18 },
  { name: 'victoria-metrics', dependency: 'victoria-metrics', status: 'degraded', message: '指標查詢延遲高於 SLA', latency_ms: 180 },
  { name: 'redis-cluster', dependency: 'redis', status: 'ok', message: 'Redis 叢集已就緒', latency_ms: 9 },
  { name: 'grafana-webhook', dependency: 'grafana', status: 'ok', message: '告警接收器 webhook 已完成啟動', latency_ms: 34 }
];

const dashboards = [
  {
    dashboard_id: 'dash-001',
    name: 'SRE 戰情室儀表板',
    category: '戰情室',
    owner: '事件指揮中心',
    owner_id: 'team-war-room',
    description: '跨團隊即時戰情看板，聚焦重大事件與 SLA 指標。',
    status: 'published',
    is_featured: true,
    is_default: true,
    viewer_count: 345,
    favorite_count: 58,
    panel_count: 12,
    tags: ['戰情室', 'SLA', 'AI 預測'],
    data_sources: ['prometheus', 'grafana', 'alertmanager'],
    target_page_key: 'war_room',
    published_at: toISO(new Date(now.getTime() - 86400000)),
    updated_at: toISO(new Date(now.getTime() - 3600000)),
    layout: [
      {
        widget_id: 'widget-001',
        type: 'heatmap',
        title: '系統狀態總覽',
        config: { metric: 'service_health' },
        position: { x: 0, y: 0, w: 12, h: 6 }
      },
      {
        widget_id: 'widget-002',
        type: 'list',
        title: '活躍事件',
        config: { severity: ['critical', 'warning'] },
        position: { x: 0, y: 6, w: 8, h: 6 }
      }
    ],
    kpis: [
      { label: '業務系統健康度', value: '95%', trend: -2.1 },
      { label: '關鍵事件監控', value: '3 件待處理', trend: 1 },
      { label: 'SLA 指標追蹤', value: '99.9%', trend: -0.05 }
    ]
  }
];

const capacitySummary = {
  total_datapoints: 12847,
  reports: 3,
  processing_time: 2.3,
  accuracy: 97.8
};

const capacityForecasts = [
  {
    metric: 'cpu_usage',
    current_usage: 68.2,
    forecast_usage: 82.5,
    series: [
      { timestamp: toISO(new Date(now.getTime() - 86400000 * 2)), value: 65 },
      { timestamp: toISO(new Date(now.getTime() - 86400000)), value: 67 },
      { timestamp: toISO(now), value: 68 },
      { timestamp: toISO(new Date(now.getTime() + 86400000)), value: 74 }
    ],
    best_case: [
      { timestamp: toISO(now), value: 68 },
      { timestamp: toISO(new Date(now.getTime() + 86400000)), value: 70 }
    ],
    worst_case: [
      { timestamp: toISO(now), value: 68 },
      { timestamp: toISO(new Date(now.getTime() + 86400000)), value: 85 }
    ]
  }
];

const capacitySuggestions = [
  {
    title: '調整資料庫資源配額',
    description: '預估 30 天後容量不足，建議調整節點規格。',
    impact: 'high',
    effort: 'medium',
    cost_saving: 1200
  }
];

const resourceLoadSummary = {
  avg_cpu: 58.4,
  avg_memory: 62.1,
  avg_disk: 48.2,
  avg_network: 95.4,
  anomalies_detected: 4
};

const resourceLoadItems = [
  {
    resource_id: 'res-001',
    resource_name: 'web-01',
    avg_cpu: 72.4,
    avg_memory: 68.1,
    disk_read: 85.2,
    disk_write: 40.1,
    net_in: 125.4,
    net_out: 118.2,
    anomaly_count: 2
  },
  {
    resource_id: 'res-002',
    resource_name: 'rds-read-1',
    avg_cpu: 64.8,
    avg_memory: 71.2,
    disk_read: 102.3,
    disk_write: 55.5,
    net_in: 95.1,
    net_out: 90.4,
    anomaly_count: 1
  }
];

const aiInsightReports = [
  {
    report_id: 'ai-001',
    analysis_type: 'risk_forecast',
    generated_at: toISO(now),
    predicted_events: 5,
    accuracy: 96.4,
    impact_range: 'API 可用度、資料庫延遲',
    summary: '未來 24 小時內 API 服務仍有高風險延遲。',
    suggestions: [
      {
        title: '預熱備援節點',
        priority: 'high',
        description: '在高峰前 30 分鐘啟用備援 Web 節點。',
        action_url: null
      }
    ]
  }
];

const automationScripts = [
  {
    script_id: 'script-001',
    name: 'Auto Scale Web',
    type: 'ansible',
    description: '自動擴充 Web 節點。',
    version: 'v3',
    tags: ['autoscale', 'web'],
    last_execution_status: 'success',
    last_execution_at: toISO(new Date(now.getTime() - 3600000)),
    content: '#!/bin/bash\\necho "scale"',
    versions: [
      {
        version_id: 'ver-001',
        version: 'v3',
        created_at: toISO(new Date(now.getTime() - 86400000)),
        created_by: 'user-001',
        changelog: '新增區域容錯'
      },
      {
        version_id: 'ver-002',
        version: 'v2',
        created_at: toISO(new Date(now.getTime() - 604800000)),
        created_by: 'user-001',
        changelog: '最佳化重試機制'
      }
    ]
  }
];

const automationSchedules = [
  {
    schedule_id: 'sch-001',
    name: '夜間健康檢查',
    type: 'recurring',
    status: 'enabled',
    cron_expression: '0 2 * * *',
    timezone: 'Asia/Taipei',
    next_run_time: toISO(new Date(now.getTime() + 3600000 * 6)),
    script_id: 'script-001',
    script_name: 'Auto Scale Web',
    concurrency_policy: 'allow',
    retry_policy: { max_retries: 1, interval_seconds: 300 },
    notify_on_success: false,
    notify_on_failure: true,
    channels: ['chn-001'],
    last_run_time: toISO(new Date(now.getTime() - 86400000))
  }
];

const automationExecutions = [
  {
    execution_id: 'exe-001',
    script_id: 'script-001',
    script_name: 'Auto Scale Web',
    status: 'success',
    trigger_source: 'event_rule',
    start_time: toISO(new Date(now.getTime() - 3600000)),
    end_time: toISO(new Date(now.getTime() - 3595000)),
    duration_ms: 5000,
    parameters: { mode: 'scale-out', count: 2 },
    stdout: 'scale out completed',
    stderr: '',
    error_message: null,
    related_event_ids: ['evt-001'],
    attempt_count: 1
  },
  {
    execution_id: 'exe-002',
    script_id: 'script-001',
    script_name: 'Auto Scale Web',
    status: 'failed',
    trigger_source: 'manual',
    start_time: toISO(new Date(now.getTime() - 1800000)),
    end_time: toISO(new Date(now.getTime() - 1794000)),
    duration_ms: 6000,
    parameters: { mode: 'scale-in', count: 1 },
    stdout: 'attempting to scale in web tier',
    stderr: 'timeout contacting node web-02',
    error_message: '節點 web-02 無法回應縮容命令',
    related_event_ids: ['evt-001'],
    attempt_count: 1
  }
];

const getAutomationExecutionsForEvent = (eventId) =>
  automationExecutions
    .filter(
      (execution) =>
        Array.isArray(execution.related_event_ids) &&
        execution.related_event_ids.includes(eventId)
    )
    .map(({ execution_id, script_id, script_name, status, trigger_source, start_time, duration_ms }) => ({
      execution_id,
      script_id,
      script_name,
      status,
      trigger_source,
      start_time,
      duration_ms
    }));

const iamUsers = [
  {
    user_id: 'user-001',
    username: 'sre.lead',
    name: '林佳瑜',
    email: 'sre.lead@example.com',
    status: 'active',
    teams: ['sre-core'],
    roles: ['sre', 'incident-commander'],
    last_login: toISO(now)
  },
  {
    user_id: 'user-002',
    username: 'ops.chen',
    name: '陳昱安',
    email: 'ops.chen@example.com',
    status: 'active',
    teams: ['ops'],
    roles: ['ops'],
    last_login: toISO(new Date(now.getTime() - 7200000))
  },
  {
    user_id: 'user-003',
    username: 'db.tsai',
    name: '蔡敏豪',
    email: 'db.tsai@example.com',
    status: 'active',
    teams: ['team-db'],
    roles: ['db-admin'],
    last_login: toISO(new Date(now.getTime() - 14400000))
  }
];

const iamInvitations = [];

const iamTeams = [
  {
    team_id: 'team-sre',
    name: 'SRE 核心小組',
    description: '負責平台可靠性維運',
    owner: 'user-001',
    created_at: toISO(new Date(now.getTime() - 2592000000)),
    members: ['user-001', 'user-002'],
    member_ids: ['user-001', 'user-002'],
    subscribers: ['user-003', 'chn-001'],
    subscriber_ids: ['user-003', 'chn-001'],
    subscriber_details: [
      { subscriber_id: 'user-003', subscriber_type: 'USER', display_name: '陳昱安' },
      { subscriber_id: 'chn-001', subscriber_type: 'SLACK_CHANNEL', display_name: '#sre-alert' }
    ]
  },
  {
    team_id: 'team-db',
    name: '資料庫團隊',
    description: '管理資料庫平台與效能',
    owner: 'user-003',
    created_at: toISO(new Date(now.getTime() - 3456000000)),
    members: ['user-003'],
    member_ids: ['user-003'],
    subscribers: [],
    subscriber_ids: [],
    subscriber_details: []
  }
];

const iamRoles = [
  {
    role_id: 'role-sre',
    name: 'sre',
    description: 'SRE 標準權限',
    status: 'active',
    user_count: 5,
    created_at: toISO(new Date(now.getTime() - 2592000000)),
    permissions: [
      { module: 'events', actions: ['read', 'update', 'acknowledge'] },
      { module: 'resources', actions: ['read'] }
    ],
    updated_at: toISO(new Date(now.getTime() - 604800000))
  }
];

const auditLogs = [
  {
    log_id: 'log-001',
    time: toISO(new Date(now.getTime() - 1800000)),
    user: '林佳瑜',
    action: 'event.update',
    target_type: 'event',
    target_id: 'evt-001',
    result: 'success',
    ip: '203.0.113.8',
    details: { status: 'in_progress' }
  },
  {
    log_id: 'log-002',
    time: toISO(new Date(now.getTime() - 7200000)),
    user: '陳昱安',
    action: 'script.execute',
    target_type: 'script',
    target_id: 'script-001',
    result: 'success',
    ip: '198.51.100.25',
    details: { execution_id: 'exe-001' }
  }
];

const notificationChannels = [
  {
    channel_id: 'chn-001',
    name: 'Slack #sre-alert',
    type: 'Slack',
    status: 'active',
    enabled: true,
    description: 'SRE 團隊 Slack 頻道',
    config: { webhook_url: 'https://hooks.slack.com/...', default_channel: '#sre-alert' },
    template_key: 'critical-alert',
    last_test_result: 'success',
    last_test_message: '測試訊息成功送達 Slack',
    updated_at: toISO(new Date(now.getTime() - 3600000)),
    last_tested_at: toISO(new Date(now.getTime() - 7200000))
  },
  {
    channel_id: 'chn-002',
    name: 'Email oncall',
    type: 'Email',
    status: 'active',
    enabled: true,
    description: 'On-call 信箱',
    config: { from: 'noreply@example.com' },
    template_key: 'default',
    last_test_result: 'failed',
    last_test_message: 'SMTP 認證失敗，請檢查憑證',
    updated_at: toISO(new Date(now.getTime() - 10800000)),
    last_tested_at: toISO(new Date(now.getTime() - 86400000))
  }
];

const notificationStrategies = [
  {
    strategy_id: 'str-001',
    name: 'Critical 事件通知',
    description: '針對 critical 事件通知核心人員。',
    trigger_condition: 'severity == critical',
    channel_count: 2,
    status: 'enabled',
    priority: 'high',
    severity_filters: ['critical'],
    recipients: [
      { type: 'team', id: 'team-sre' },
      { type: 'user', id: 'user-001' }
    ],
    channels: [
      { channel_id: 'chn-001', channel_type: 'Slack', template: 'critical-alert' },
      { channel_id: 'chn-002', channel_type: 'Email', template: 'default' }
    ],
    resource_filters: {},
    created_at: toISO(new Date(now.getTime() - 259200000)),
    updated_at: toISO(new Date(now.getTime() - 86400000))
  }
];

const notificationHistory = [
  {
    record_id: 'hist-001',
    sent_at: toISO(new Date(now.getTime() - 3600000)),
    strategy_id: 'str-001',
    strategy_name: 'Critical 事件通知',
    channel_type: 'Slack',
    channel_label: '#sre-alert',
    channel_id: 'chn-001',
    recipients: ['#sre-alert'],
    status: 'SUCCESS',
    duration_ms: 1200,
    alert_title: 'API 延遲飆高',
    message: '事件 evt-001 已通知核心團隊',
    raw_payload: { event_id: 'evt-001', rule: 'API 延遲監控' },
    metadata: { provider: 'slack', request_id: 'req-123' },
    attempts: [
      { sent_at: toISO(new Date(now.getTime() - 3600000)), status: 'SUCCESS', response: '200 OK' }
    ],
    error_message: null,
    related_event_id: 'evt-001',
    resend_count: 1,
    resend_available: true,
    last_resend_at: toISO(new Date(now.getTime() - 1800000)),
    actor: '林佳瑜'
  }
];

const notificationResendJobs = [
  {
    job_id: 'job-001',
    notification_history_id: 'hist-001',
    status: 'completed',
    requested_at: toISO(new Date(now.getTime() - 1800000)),
    requested_by: '林佳瑜',
    channel_id: 'chn-001',
    recipients: ['#sre-alert'],
    dry_run: false,
    note: '手動確認通知已送達核心團隊',
    started_at: toISO(new Date(now.getTime() - 1750000)),
    completed_at: toISO(new Date(now.getTime() - 1700000)),
    result_message: '重新發送成功',
    error_message: null,
    metadata: {}
  }
];

const emailTestHistory = [
  {
    id: 'email-test-001',
    status: 'success',
    recipient: 'ops@example.com',
    template_key: 'default',
    duration_ms: 420,
    response_message: '250 OK',
    error_message: null,
    metadata: { smtp_host: 'smtp.example.com' },
    executed_at: toISO(new Date(now.getTime() - 5400000))
  }
];

const tagDefinitions = [
  {
    tag_id: 'tag-001',
    name: '環境',
    category: '基礎設施',
    required: true,
    usage_count: 124,
    values: [
      {
        value_id: 'tag-001-v1',
        value: 'production',
        description: '正式環境',
        is_default: true,
        usage_count: 82,
        last_synced_at: toISO(new Date(now.getTime() - 3600000))
      },
      {
        value_id: 'tag-001-v2',
        value: 'staging',
        description: '預備環境',
        is_default: false,
        usage_count: 34,
        last_synced_at: toISO(new Date(now.getTime() - 7200000))
      }
    ]
  }
];

const tagSummary = {
  updated_at: toISO(now),
  totals: {
    total_keys: tagDefinitions.length,
    required_keys: tagDefinitions.filter((tag) => tag.required).length,
    optional_keys: tagDefinitions.filter((tag) => !tag.required).length,
    total_values: tagDefinitions.reduce((acc, tag) => acc + (tag.values?.length || 0), 0)
  },
  categories: [
    {
      category: '基礎設施',
      total_keys: 1,
      required_keys: 1,
      optional_keys: 0,
      total_values: tagDefinitions[0].values.length,
      last_updated_at: toISO(new Date(now.getTime() - 1800000)),
      top_keys: [
        { tag_key: 'env', description: '部署環境', usage_count: 124, required: true },
        { tag_key: 'cluster', description: '叢集名稱', usage_count: 48, required: false }
      ]
    }
  ]
};

const tagKeyOptions = [
  {
    tag_key: 'env',
    display_name: '環境',
    description: '服務部署環境',
    categories: ['基礎設施'],
    usage_count: 124,
    required: true,
    last_updated_at: toISO(new Date(now.getTime() - 3600000))
  },
  {
    tag_key: 'app',
    display_name: '應用',
    description: '應用系統名稱',
    categories: ['應用程序'],
    usage_count: 96,
    required: false,
    last_updated_at: toISO(new Date(now.getTime() - 5400000))
  },
  {
    tag_key: 'team',
    display_name: '團隊',
    description: '負責團隊識別',
    categories: ['組織結構'],
    usage_count: 54,
    required: false,
    last_updated_at: toISO(new Date(now.getTime() - 7200000))
  }
];

const tagValueCatalog = {
  env: [
    {
      value: 'production',
      description: '正式環境',
      usage_count: 82,
      is_default: true,
      last_seen_at: toISO(new Date(now.getTime() - 1200000))
    },
    {
      value: 'staging',
      description: '預備環境',
      usage_count: 34,
      is_default: false,
      last_seen_at: toISO(new Date(now.getTime() - 5400000))
    },
    {
      value: 'development',
      description: '開發環境',
      usage_count: 18,
      is_default: false,
      last_seen_at: toISO(new Date(now.getTime() - 86400000))
    }
  ],
  app: [
    {
      value: 'payment-api',
      description: '支付 API 服務',
      usage_count: 40,
      is_default: true,
      last_seen_at: toISO(new Date(now.getTime() - 1800000))
    },
    {
      value: 'checkout-web',
      description: '結帳前端',
      usage_count: 28,
      is_default: false,
      last_seen_at: toISO(new Date(now.getTime() - 2700000))
    }
  ],
  team: [
    {
      value: 'sre-core',
      description: 'SRE 核心團隊',
      usage_count: 21,
      is_default: true,
      last_seen_at: toISO(new Date(now.getTime() - 3600000))
    },
    {
      value: 'db-team',
      description: '資料庫團隊',
      usage_count: 17,
      is_default: false,
      last_seen_at: toISO(new Date(now.getTime() - 7200000))
    }
  ]
};

const emailSettings = {
  smtp_host: 'smtp.example.com',
  smtp_port: 587,
  username: 'noreply@example.com',
  sender_name: 'SRE Platform',
  sender_email: 'noreply@example.com',
  encryption: 'tls',
  test_recipient: 'ops@example.com',
  is_enabled: true,
  updated_at: toISO(new Date(now.getTime() - 3600000))
};

const authSettings = {
  provider: 'Keycloak',
  oidc_enabled: true,
  realm: 'sre-platform',
  client_id: 'sre-ui',
  client_secret_hint: '***',
  auth_url: 'https://auth.example.com/realms/sre/protocol/openid-connect/auth',
  token_url: 'https://auth.example.com/realms/sre/protocol/openid-connect/token',
  userinfo_url: 'https://auth.example.com/realms/sre/protocol/openid-connect/userinfo',
  redirect_uri: 'https://sre.example.com/callback',
  logout_url: 'https://auth.example.com/realms/sre/protocol/openid-connect/logout',
  scopes: ['openid', 'profile', 'email'],
  user_sync: true,
  updated_at: toISO(new Date(now.getTime() - 7200000))
};
const paginate = (items, req) => {
  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
  const pageSize = Math.min(Math.max(parseInt(req.query.page_size, 10) || 20, 1), 100);
  const start = (page - 1) * pageSize;
  const paged = items.slice(start, start + pageSize);
  return {
    page,
    page_size: pageSize,
    total: items.length,
    items: paged
  };
};

const parseListParam = (value) => {
  if (Array.isArray(value)) {
    return value.filter((item) => typeof item === 'string' && item.trim().length > 0).map((item) => item.trim());
  }
  if (typeof value !== 'string') return null;
  return value
    .split(',')
    .map((item) => item.trim())
    .filter((item) => item.length > 0);
};

const GRANULARITY_TO_MINUTES = {
  '1m': 1,
  '5m': 5,
  '15m': 15,
  '1h': 60,
  '6h': 360,
  '1d': 1440
};

const parseDurationToMinutes = (value, fallback = 5) => {
  if (typeof value !== 'string') return fallback;
  const trimmed = value.trim();
  if (GRANULARITY_TO_MINUTES[trimmed]) {
    return GRANULARITY_TO_MINUTES[trimmed];
  }
  const match = trimmed.match(/^([0-9]+)([mhd])$/i);
  if (!match) return fallback;
  const amount = parseInt(match[1], 10);
  if (!Number.isFinite(amount) || amount <= 0) return fallback;
  const unit = match[2].toLowerCase();
  switch (unit) {
    case 'm':
      return amount;
    case 'h':
      return amount * 60;
    case 'd':
      return amount * 1440;
    default:
      return fallback;
  }
};

const buildTimeSeriesPoints = (pointCount, stepMinutes, baseValue, variance = 5, endDate = new Date()) => {
  const baseTime = endDate instanceof Date && !Number.isNaN(endDate.getTime()) ? endDate.getTime() : Date.now();
  const effectiveCount = Math.max(1, pointCount);
  return Array.from({ length: effectiveCount }).map((_, index) => {
    const offset = Math.sin(index / 2) * variance;
    const value = Number(Math.max(0, baseValue + offset).toFixed(2));
    const timestamp = toISO(new Date(baseTime - (effectiveCount - 1 - index) * stepMinutes * 60000));
    return { timestamp, value };
  });
};

const summarizePoints = (points) => {
  if (!Array.isArray(points) || points.length === 0) {
    const nowIso = toISO(new Date());
    return { min: 0, max: 0, avg: 0, last: 0, last_timestamp: nowIso };
  }
  const values = points.map((point) => point.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const sum = values.reduce((acc, val) => acc + val, 0);
  const avg = Number((sum / values.length).toFixed(2));
  const lastPoint = points[points.length - 1];
  return { min, max, avg, last: lastPoint.value, last_timestamp: lastPoint.timestamp };
};

const parseDateOrDefault = (value, fallback) => {
  const fallbackDate = fallback instanceof Date ? fallback : new Date(fallback);
  if (!value) return new Date(fallbackDate);
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? new Date(fallbackDate) : parsed;
};

const normalizeTags = (tags) => {
  if (!Array.isArray(tags)) return [];
  return tags
    .map((tag) => {
      if (!tag) return null;
      if (typeof tag === 'string') {
        const [rawKey, ...rawValue] = tag.split('=');
        const key = rawKey ? rawKey.trim() : '';
        if (!key) return null;
        const value = rawValue.join('=').trim();
        return { key, value };
      }
      if (typeof tag === 'object') {
        const key = typeof tag.key === 'string' ? tag.key.trim() : '';
        if (!key) return null;
        const value =
          tag.value === undefined || tag.value === null ? '' : String(tag.value).trim();
        return { key, value };
      }
      return null;
    })
    .filter((tag) => tag && tag.key);
};

const cloneTags = (tags) => normalizeTags(tags).map(({ key, value }) => ({ key, value }));

const normalizeGroupIds = (value) => {
  if (!value) return [];
  if (Array.isArray(value)) {
    return value
      .map((item) => (typeof item === 'string' ? item.trim() : ''))
      .filter((item) => item.length > 0);
  }
  if (typeof value === 'string') {
    return value
      .split(',')
      .map((item) => item.trim())
      .filter((item) => item.length > 0);
  }
  return [];
};

const buildResourceGroupRefs = (groupIds) =>
  normalizeGroupIds(groupIds).map((groupId) => {
    const group = getResourceGroupById(groupId);
    return {
      group_id: groupId,
      group_name: group?.name || groupId
    };
  });

const mapEventSummary = (event) => ({
  event_id: event.event_id,
  event_key: event.event_key,
  summary: event.summary,
  description: event.description,
  severity: event.severity,
  status: event.status,
  priority: event.priority || 'P2',
  resource_id: event.resource_id,
  resource_name: event.resource_name,
  service_impact: event.service_impact,
  rule_id: event.rule_id,
  rule_name: event.rule_name,
  trigger_threshold: event.trigger_threshold,
  assignee_id: event.assignee_id || null,
  assignee: event.assignee,
  trigger_time: event.trigger_time,
  tags: event.tags || []
});

const toEventDetail = (event) => ({
  ...mapEventSummary(event),
  trigger_value: event.trigger_value,
  unit: event.unit,
  acknowledged_at: event.acknowledged_at,
  resolved_at: event.resolved_at,
  timeline: event.timeline || [],
  related_events: event.related || [],
  automation_executions: getAutomationExecutionsForEvent(event.event_id),
  analysis: event.analysis
});

const appendTimelineEntry = (event, entry) => {
  if (!event) return null;
  event.timeline = Array.isArray(event.timeline) ? event.timeline : [];
  const uniqueSuffix = Math.random().toString(36).slice(2, 8);
  const timestamp = Date.now();
  const finalEntry = {
    entry_id: entry.entry_id || `evt-${event.event_id}-tl-${timestamp}-${uniqueSuffix}`,
    event_id: event.event_id,
    entry_type: entry.entry_type || 'note',
    message: entry.message,
    created_by: entry.created_by || currentUser.display_name,
    created_at: entry.created_at || toISO(new Date()),
    metadata: entry.metadata || {}
  };
  event.timeline.push(finalEntry);
  return finalEntry;
};

const getSilencesForResource = (resourceId) =>
  silenceRules.filter((rule) =>
    (rule.matchers || []).some((matcher) => matcher.key === 'resource_id' && matcher.value === resourceId)
  );

const buildResourceDetail = (resource) => ({
  ...resource,
  tags: cloneTags(resource.tags),
  groups: buildResourceGroupRefs(resource.groups),
  silences: getSilencesForResource(resource.resource_id)
});

const buildTeamDetail = (team) => {
  if (!team) return null;
  const subscriberDetails = Array.isArray(team.subscriber_details) ? team.subscriber_details : [];
  const subscriberIds = Array.isArray(team.subscriber_ids)
    ? team.subscriber_ids
    : subscriberDetails.map((item) => item.subscriber_id);
  const members = Array.isArray(team.members) ? team.members : [];
  const memberIds = Array.isArray(team.member_ids) ? team.member_ids : members;

  return {
    team_id: team.team_id,
    name: team.name,
    description: team.description,
    owner: team.owner,
    members,
    member_ids: memberIds,
    subscriber_ids: subscriberIds,
    subscribers: subscriberDetails,
    subscriber_details: subscriberDetails,
    created_at: team.created_at
  };
};

const mapNotificationHistorySummary = (record) => ({
  record_id: record.record_id,
  sent_at: record.sent_at,
  status: record.status,
  channel_type: record.channel_type,
  channel_label: record.channel_label,
  strategy_name: record.strategy_name,
  strategy_id: record.strategy_id,
  alert_title: record.alert_title,
  message: record.message,
  error_message: record.error_message,
  recipients: record.recipients,
  metadata: record.metadata || {},
  retry_count: record.retry_count ?? Math.max((record.attempts?.length || 1) - 1, 0),
  duration_ms: record.duration_ms,
  resend_available: record.resend_available ?? false,
  resend_count: record.resend_count ?? 0,
  last_resend_at: record.last_resend_at ?? null,
  actor: record.actor ?? null
});

const mapNotificationResendJob = (job) => ({
  job_id: job.job_id,
  status: job.status,
  requested_at: job.requested_at,
  requested_by: job.requested_by,
  channel_id: job.channel_id,
  recipients: job.recipients,
  dry_run: job.dry_run,
  note: job.note || null,
  started_at: job.started_at || null,
  completed_at: job.completed_at || null,
  result_message: job.result_message || null,
  error_message: job.error_message || null,
  metadata: job.metadata || {}
});

const buildSeedFromResource = (seed, index, metricKey) => {
  const baseResource = resourceData.find((res) => res.resource_id === seed.resource_id);
  let defaultValue = 60 + index * 5;
  if (baseResource) {
    if (metricKey === 'memory_usage_percent' && typeof baseResource.memory_usage === 'number') {
      defaultValue = baseResource.memory_usage;
    } else if (metricKey === 'cpu_usage_percent' && typeof baseResource.cpu_usage === 'number') {
      defaultValue = baseResource.cpu_usage;
    } else if (typeof baseResource.cpu_usage === 'number') {
      defaultValue = baseResource.cpu_usage;
    }
  }
  return {
    resource_id: seed.resource_id,
    resource_name: seed.resource_name || baseResource?.name || seed.resource_id,
    resource_type: seed.resource_type || baseResource?.type || 'service',
    team_id: seed.team_id || baseResource?.team_id || null,
    environment: seed.environment || baseResource?.environment || null,
    baseValue: seed.baseValue ?? defaultValue,
    variance: seed.variance ?? 4 + index * 1.2,
    status: seed.status || baseResource?.status || 'healthy'
  };
};

const getMetricSeriesSeeds = (metricKey, resourceIds = []) => {
  if (Array.isArray(resourceIds) && resourceIds.length > 0) {
    return resourceIds.map((id, index) => buildSeedFromResource({ resource_id: id }, index, metricKey));
  }
  const seeds = metricSeriesSeeds[metricKey] || metricSeriesSeeds.default || [];
  return seeds.map((seed, index) => buildSeedFromResource(seed, index, metricKey));
};

const getEventById = (id) => eventData.find((evt) => evt.event_id === id);
const getEventRuleById = (id) => eventRules.find((rule) => rule.rule_id === id);
const getSilenceRuleById = (id) => silenceRules.find((rule) => rule.silence_id === id);
const getResourceById = (id) => resourceData.find((res) => res.resource_id === id);
const getResourceGroupById = (id) => resourceGroups.find((grp) => grp.group_id === id);
const getDashboardById = (id) => dashboards.find((db) => db.dashboard_id === id);
const getScriptById = (id) => automationScripts.find((sc) => sc.script_id === id);
const getScheduleById = (id) => automationSchedules.find((sch) => sch.schedule_id === id);
const getExecutionById = (id) => automationExecutions.find((exe) => exe.execution_id === id);
const getIamUserById = (id) => iamUsers.find((u) => u.user_id === id);
const getTeamById = (id) => iamTeams.find((t) => t.team_id === id);
const getRoleById = (id) => iamRoles.find((r) => r.role_id === id);
const getNotificationStrategyById = (id) => notificationStrategies.find((s) => s.strategy_id === id);
const getNotificationChannelById = (id) => notificationChannels.find((c) => c.channel_id === id);
const getHistoryById = (id) => notificationHistory.find((h) => h.record_id === id);
const getTagById = (id) => tagDefinitions.find((tag) => tag.tag_id === id);

const notFound = (res, message = '查無資料') => res.status(404).json({ code: 'NOT_FOUND', message });

app.post('/auth/login', (req, res) => {
  const { username } = req.body || {};
  res.json({
    access_token: 'mock-access-token',
    refresh_token: 'mock-refresh-token',
    token_type: 'Bearer',
    expires_in: 3600,
    username: username || currentUser.username
  });
});

app.post('/auth/logout', (req, res) => res.status(204).end());

app.post('/auth/refresh', (req, res) => {
  res.json({
    access_token: 'mock-access-token-refreshed',
    refresh_token: 'mock-refresh-token',
    token_type: 'Bearer',
    expires_in: 3600
  });
});

app.get('/me', (req, res) => res.json(currentUser));

app.get('/me/preferences', (req, res) => res.json(userPreferences));

app.put('/me/preferences', (req, res) => {
  Object.assign(userPreferences, req.body || {});
  res.json(userPreferences);
});

app.get('/me/security/logins', (req, res) => {
  res.json(paginate(securityLogins, req));
});

app.get('/search', (req, res) => {
  const keyword = (req.query.keyword || '').toLowerCase();
  const eventResults = eventData
    .filter((evt) => !keyword || evt.summary.toLowerCase().includes(keyword))
    .map((evt) => ({
      id: evt.event_id,
      title: evt.summary,
      description: evt.description,
      url: `/incidents/${evt.event_id}`,
      icon: 'alert'
    }));
  const resourceResults = resourceData
    .filter((res) => !keyword || res.name.toLowerCase().includes(keyword))
    .map((res) => ({
      id: res.resource_id,
      title: res.name,
      description: `${res.type} · ${res.environment}`,
      url: `/resources/${res.resource_id}`,
      icon: 'database'
    }));
  const dashboardResults = dashboards
    .filter((dash) => !keyword || dash.name.toLowerCase().includes(keyword))
    .map((dash) => ({
      id: dash.dashboard_id,
      title: dash.name,
      description: dash.description,
      url: `/dashboards/${dash.dashboard_id}`,
      icon: 'dashboard'
    }));

  res.json({
    query: keyword,
    groups: [
      { type: 'event', label: '事件', results: eventResults },
      { type: 'resource', label: '資源', results: resourceResults },
      { type: 'dashboard', label: '儀表板', results: dashboardResults }
    ]
  });
});

app.get('/healthz', (req, res) => {
  const nowTime = new Date();
  const components = healthComponentsBase.map((component) => ({
    ...component,
    last_checked_at: toISO(nowTime)
  }));
  const status = components.some((component) => component.status === 'down')
    ? 'down'
    : components.some((component) => component.status === 'degraded')
    ? 'degraded'
    : 'ok';
  res.json({
    status,
    checked_at: toISO(nowTime),
    version: '3.0.0',
    components,
    notes: ['最近 15 分鐘內未觀察到新的系統錯誤。']
  });
});

app.get('/readyz', (req, res) => {
  const nowTime = new Date();
  const components = readinessComponentsBase.map((component) => ({
    ...component,
    last_checked_at: toISO(nowTime)
  }));
  const pending = components.filter((component) => component.status !== 'ok').map((component) => component.name);
  const status = components.some((component) => component.status === 'down')
    ? 'down'
    : pending.length > 0
    ? 'degraded'
    : 'ok';
  res.json({
    status,
    checked_at: toISO(nowTime),
    version: '3.0.0',
    components,
    pending_dependencies: pending,
    notes:
      pending.length > 0
        ? ['部分依賴目前處於 degraded 狀態，請持續觀察。']
        : ['所有依賴均已完成就緒檢查。']
  });
});

app.get('/metrics', (req, res) => {
  const requestedKeys = parseListParam(req.query.metric_keys);
  const resourceType = typeof req.query.resource_type === 'string' ? req.query.resource_type.trim() : '';
  const groupBy = parseListParam(req.query.group_by) || [];
  const granularity = typeof req.query.granularity === 'string' && req.query.granularity.trim().length > 0
    ? req.query.granularity.trim()
    : '5m';
  const stepMinutes = parseDurationToMinutes(granularity, 5);
  const endTime = parseDateOrDefault(req.query.end_time, new Date());
  let startTime = parseDateOrDefault(req.query.start_time, new Date(endTime.getTime() - stepMinutes * 60000 * 11));
  if (startTime > endTime) {
    startTime = new Date(endTime.getTime() - stepMinutes * 60000 * 11);
  }
  const totalMinutes = Math.max(stepMinutes, Math.round((endTime.getTime() - startTime.getTime()) / 60000));
  const pointCount = Math.min(48, Math.max(6, Math.floor(totalMinutes / stepMinutes) || 12));

  const filteredRecords = metricOverviewRecords.filter((record) => {
    if (requestedKeys && requestedKeys.length > 0 && !requestedKeys.includes(record.metric_key)) {
      return false;
    }
    if (resourceType) {
      return record.top_resources.some((item) => item.resource_type === resourceType);
    }
    return true;
  });

  const metrics = filteredRecords.map((record) => {
    const definition = metricDefinitions.find((def) => def.metric_key === record.metric_key);
    const thresholds = definition
      ? { warning: definition.warning_threshold ?? null, critical: definition.critical_threshold ?? null }
      : { warning: null, critical: null };
    const trend = buildTimeSeriesPoints(pointCount, stepMinutes, record.latest_value, record.variance, endTime);
    return {
      metric_key: record.metric_key,
      display_name: definition?.display_name || record.metric_key,
      unit: definition?.unit || '',
      latest_value: Number(record.latest_value.toFixed(2)),
      status: record.status,
      change_rate: record.change_rate,
      thresholds,
      last_updated_at: toISO(endTime),
      trend,
      top_resources: record.top_resources.map((item) => ({ ...item })),
      metadata: {
        ...(definition?.metadata || {}),
        ...(record.metadata || {}),
        time_range: { start: toISO(startTime), end: toISO(endTime) },
        group_by: groupBy
      }
    };
  });

  res.json({
    generated_at: toISO(new Date()),
    granularity,
    metrics
  });
});

app.get('/metrics/definitions', (req, res) => {
  const { category, resource_scope: resourceScope } = req.query;
  const keyword = typeof req.query.keyword === 'string' ? req.query.keyword.trim().toLowerCase() : '';
  let definitions = metricDefinitions;
  if (category) {
    definitions = definitions.filter((definition) => definition.category === category);
  }
  if (resourceScope) {
    definitions = definitions.filter((definition) => definition.resource_scope === resourceScope);
  }
  if (keyword) {
    definitions = definitions.filter((definition) => {
      const desc = (definition.description || '').toLowerCase();
      return (
        definition.metric_key.toLowerCase().includes(keyword) ||
        definition.display_name.toLowerCase().includes(keyword) ||
        desc.includes(keyword)
      );
    });
  }
  res.json(paginate(definitions, req));
});

app.post('/metrics/query', (req, res) => {
  const payload = req.body || {};
  const definition = metricDefinitions.find((def) => def.metric_key === payload.metric_key);
  if (!definition) {
    return res.status(400).json({ code: 'INVALID_REQUEST', message: '未知的指標鍵。' });
  }

  const requestedAggregations = Array.isArray(payload.aggregations)
    ? payload.aggregations.filter((agg) => definition.supported_aggregations.includes(agg))
    : [];
  if (requestedAggregations.length === 0) {
    requestedAggregations.push(definition.default_aggregation);
  }

  const rangePayload = payload.time_range || {};
  const stepLabel = rangePayload.step || '5m';
  const stepMinutes = parseDurationToMinutes(stepLabel, 5);
  const endTime = parseDateOrDefault(rangePayload.end, new Date());
  let startTime = parseDateOrDefault(rangePayload.start, new Date(endTime.getTime() - stepMinutes * 60000 * 23));
  if (startTime > endTime) {
    startTime = new Date(endTime.getTime() - stepMinutes * 60000 * 23);
  }
  const totalMinutes = Math.max(stepMinutes, Math.round((endTime.getTime() - startTime.getTime()) / 60000));
  const pointCount = Math.min(96, Math.max(12, Math.floor(totalMinutes / stepMinutes) || 24));

  const seeds = getMetricSeriesSeeds(definition.metric_key, payload.resource_ids);
  const series = seeds.map((seed, index) => {
    const datapoints = buildTimeSeriesPoints(pointCount, stepMinutes, seed.baseValue, seed.variance, endTime);
    const summary = summarizePoints(datapoints);
    const group = {};
    if (seed.resource_type) group.resource_type = seed.resource_type;
    if (seed.team_id) group.team_id = seed.team_id;
    if (seed.environment) group.environment = seed.environment;
    return {
      series_id: `${definition.metric_key}-series-${index + 1}`,
      metric_key: definition.metric_key,
      resource_id: seed.resource_id,
      resource_name: seed.resource_name,
      group,
      aggregation: requestedAggregations[0],
      status: seed.status,
      datapoints,
      summary
    };
  });

  const annotations =
    definition.metric_key === 'http_error_rate_percent'
      ? [
          {
            timestamp: toISO(new Date(endTime.getTime() - stepMinutes * 60000 * Math.min(pointCount - 1, 6))),
            level: 'critical',
            message: 'AI 建議：檢查 Gateway 節點錯誤率峰值',
            source: 'ai-insight'
          }
        ]
      : [
          {
            timestamp: toISO(new Date(endTime.getTime() - stepMinutes * 60000 * Math.min(pointCount - 1, 3))),
            level: 'info',
            message: '自動化調整完成：容量檢查通過',
            source: 'automation'
          }
        ];

  const requestedRange = {
    start: toISO(startTime),
    end: toISO(endTime),
    step: stepLabel,
    timezone: rangePayload.timezone || 'UTC'
  };

  let compareRange;
  if (payload.compare_range) {
    const comparePayload = payload.compare_range;
    const compareEnd = parseDateOrDefault(comparePayload.end, new Date(startTime));
    let compareStart = parseDateOrDefault(comparePayload.start, new Date(compareEnd.getTime() - stepMinutes * 60000 * pointCount));
    if (compareStart > compareEnd) {
      compareStart = new Date(compareEnd.getTime() - stepMinutes * 60000 * pointCount);
    }
    compareRange = {
      start: toISO(compareStart),
      end: toISO(compareEnd),
      step: comparePayload.step || requestedRange.step,
      timezone: comparePayload.timezone || requestedRange.timezone
    };
  }

  res.json({
    query_id: `metric-query-${Date.now()}`,
    metric_key: definition.metric_key,
    unit: definition.unit,
    requested_range: requestedRange,
    compare_range: compareRange,
    aggregations: requestedAggregations,
    generated_at: toISO(new Date()),
    series,
    annotations
  });
});

app.get('/notifications/summary', (req, res) => {
  const total = notifications.length;
  const unread = notifications.filter((item) => item.status === 'unread').length;
  const bySeverity = notifications.reduce((acc, item) => {
    acc[item.severity] = (acc[item.severity] || 0) + 1;
    return acc;
  }, {});
  res.json({ total, unread, by_severity: bySeverity, last_updated_at: toISO(now) });
});

app.get('/notifications', (req, res) => {
  res.json(paginate(notifications, req));
});

app.post('/notifications/:notification_id/read', (req, res) => {
  const notification = notifications.find((item) => item.notification_id === req.params.notification_id);
  if (!notification) {
    return notFound(res, '找不到通知');
  }
  notification.status = 'read';
  notification.read_at = req.body?.read_at || toISO(new Date());
  res.json(notification);
});

app.post('/notifications/mark-all-read', (req, res) => {
  notifications.forEach((item) => {
    item.status = 'read';
    item.read_at = toISO(new Date());
  });
  res.json({
    total: notifications.length,
    unread: 0,
    by_severity: notifications.reduce((acc, item) => {
      acc[item.severity] = (acc[item.severity] || 0) + 1;
      return acc;
    }, {}),
    last_updated_at: toISO(new Date())
  });
});

app.get('/events/summary', (req, res) => {
  const critical = eventData.filter((evt) => evt.severity === 'critical').length;
  const acknowledged = eventData.filter((evt) => ['acknowledged', 'in_progress'].includes(evt.status)).length;
  res.json({
    active_events: { total: eventData.length, critical, acknowledged },
    resolved_today: { total: 12, automated: 7, trend: 8 },
    mean_time_to_resolve: { hours: 2.5, trend: -15 },
    automation_rate: { percentage: 35.2, automated_count: 4 }
  });
});

app.get('/events', (req, res) => {
  const items = eventData.map(mapEventSummary);
  res.json(paginate(items, req));
});

app.post('/events/batch', (req, res) => {
  const {
    action,
    event_ids: eventIds,
    assignee_id: assigneeId,
    comment,
    resolved_at: resolvedAt,
    visibility
  } = req.body || {};
  const allowedActions = new Set(['acknowledge', 'resolve', 'assign', 'add_comment']);
  if (!allowedActions.has(action)) {
    return res.status(400).json({ code: 'INVALID_REQUEST', message: 'action 參數無效。' });
  }
  if (!Array.isArray(eventIds) || eventIds.length === 0) {
    return res.status(400).json({ code: 'INVALID_REQUEST', message: 'event_ids 至少需要一筆事件。' });
  }
  if (action === 'assign' && !assigneeId) {
    return res.status(400).json({ code: 'INVALID_REQUEST', message: 'assign 操作需提供 assignee_id。' });
  }
  if (action === 'add_comment' && !comment) {
    return res.status(400).json({ code: 'INVALID_REQUEST', message: 'add_comment 操作需提供 comment 內容。' });
  }

  const batchId = `evt-batch-${Date.now()}`;
  const createdAt = toISO(new Date());
  const requestedBy = currentUser.user_id;
  const commentVisibility = visibility === 'public' ? 'public' : 'internal';
  const requestPayload = {
    action,
    event_ids: eventIds,
    ...(assigneeId ? { assignee_id: assigneeId } : {}),
    ...(comment ? { comment } : {}),
    ...(resolvedAt ? { resolved_at: resolvedAt } : {})
  };
  if (visibility || action === 'add_comment') {
    requestPayload.visibility = commentVisibility;
  }
  const operation = {
    batch_id: batchId,
    status: 'pending',
    action,
    requested_by: requestedBy,
    assignee_id: assigneeId || null,
    comment: comment || null,
    request_payload: requestPayload,
    total_count: eventIds.length,
    processed_count: 0,
    success_count: 0,
    failed_count: 0,
    created_at: createdAt,
    completed_at: null,
    results: []
  };
  eventBatchOperations.set(batchId, operation);

  setTimeout(() => {
    const current = eventBatchOperations.get(batchId);
    if (!current) return;
    current.status = 'running';
    eventBatchOperations.set(batchId, current);

    const results = eventIds.map((id) => {
      const event = getEventById(id);
      if (!event) {
        return { event_id: id, success: false, message: '找不到事件', error: 'NOT_FOUND' };
      }
      try {
        if (action === 'acknowledge') {
          event.status = 'acknowledged';
          event.acknowledged_at = toISO(new Date());
          event.updated_at = event.acknowledged_at;
          appendTimelineEntry(event, {
            entry_type: 'status_change',
            message: '事件已確認處理',
            metadata: { action: 'acknowledge' }
          });
        } else if (action === 'resolve') {
          const resolvedTime = resolvedAt ? toISO(new Date(resolvedAt)) : toISO(new Date());
          event.status = 'resolved';
          event.resolved_at = resolvedTime;
          event.updated_at = resolvedTime;
          if (!event.acknowledged_at) {
            event.acknowledged_at = resolvedTime;
          }
          appendTimelineEntry(event, {
            entry_type: 'status_change',
            message: '事件標記為已解決',
            metadata: { action: 'resolve' }
          });
        } else if (action === 'assign') {
          event.assignee_id = assigneeId;
          event.assignee = iamUsers.find((user) => user.user_id === assigneeId)?.name || assigneeId;
          if (event.status === 'new' || event.status === 'acknowledged') {
            event.status = 'in_progress';
          }
          const updatedAt = toISO(new Date());
          event.updated_at = updatedAt;
          if (!event.acknowledged_at) {
            event.acknowledged_at = updatedAt;
          }
          appendTimelineEntry(event, {
            entry_type: 'status_change',
            message: `事件指派給 ${event.assignee}`,
            metadata: { action: 'assign' }
          });
          if (comment) {
            appendTimelineEntry(event, {
              entry_type: 'note',
              message: comment,
              metadata: { action: 'assign' }
            });
          }
        } else if (action === 'add_comment') {
          appendTimelineEntry(event, {
            entry_type: 'note',
            message: comment,
            metadata: { action: 'add_comment', visibility: commentVisibility }
          });
          event.updated_at = toISO(new Date());
        }
        return { event_id: id, success: true, message: '操作完成' };
      } catch (error) {
        return { event_id: id, success: false, message: '操作失敗', error: 'INTERNAL_ERROR' };
      }
    });

    current.results = results;
    current.processed_count = results.length;
    current.success_count = results.filter((result) => result.success).length;
    current.failed_count = results.filter((result) => !result.success).length;
    current.status = current.success_count === 0 ? 'failed' : 'completed';
    current.completed_at = toISO(new Date());
    eventBatchOperations.set(batchId, current);
  }, 300);

  res.status(202).json(operation);
});

app.get('/events/batch/:batch_id', (req, res) => {
  const operation = eventBatchOperations.get(req.params.batch_id);
  if (!operation) {
    return notFound(res, '找不到批次處理作業');
  }
  res.json(operation);
});

app.post('/events', (req, res) => {
  const payload = req.body || {};
  const nowIso = toISO(new Date());
  const defaultPriority = eventRules.find((rule) => rule.rule_id === payload.rule_id)?.default_priority || 'P2';
  const initialStatus = payload.status || 'new';
  const acknowledgedAt =
    typeof payload.acknowledged_at === 'string'
      ? payload.acknowledged_at
      : ['acknowledged', 'in_progress', 'resolved'].includes(initialStatus)
        ? nowIso
        : null;
  const resolvedAt =
    typeof payload.resolved_at === 'string'
      ? payload.resolved_at
      : initialStatus === 'resolved'
        ? nowIso
        : null;
  const updatedAt = resolvedAt || acknowledgedAt || nowIso;
  const newEvent = {
    event_id: `evt-${Date.now()}`,
    event_key: payload.event_key || `INC-${Date.now()}`,
    summary: payload.summary || '新事件',
    description: payload.description || '',
    severity: payload.severity || 'warning',
    status: initialStatus,
    priority: payload.priority || defaultPriority,
    resource_id: payload.resource_id || null,
    resource_name: resourceData.find((r) => r.resource_id === payload.resource_id)?.name || null,
    service_impact: payload.service_impact || null,
    rule_id: payload.rule_id || null,
    rule_name: eventRules.find((rule) => rule.rule_id === payload.rule_id)?.name || null,
    trigger_threshold: payload.trigger_threshold || null,
    trigger_value: payload.trigger_value || null,
    unit: payload.unit || null,
    trigger_time: payload.trigger_time || toISO(new Date()),
    assignee_id: payload.assignee_id || null,
    assignee: iamUsers.find((user) => user.user_id === payload.assignee_id)?.name || null,
    acknowledged_at: acknowledgedAt,
    resolved_at: resolvedAt,
    tags: payload.tags || [],
    timeline: [],
    related: [],
    analysis: null,
    created_at: nowIso,
    updated_at: updatedAt
  };
  eventData.unshift(newEvent);
  res.status(201).json(toEventDetail(newEvent));
});

app.get('/events/:event_id', (req, res) => {
  const event = getEventById(req.params.event_id);
  if (!event) return notFound(res, '找不到事件');
  res.json(toEventDetail(event));
});

app.patch('/events/:event_id', (req, res) => {
  const event = getEventById(req.params.event_id);
  if (!event) return notFound(res, '找不到事件');
  Object.assign(event, req.body || {});
  event.updated_at = toISO(new Date());
  res.json(toEventDetail(event));
});

app.delete('/events/:event_id', (req, res) => {
  const index = eventData.findIndex((evt) => evt.event_id === req.params.event_id);
  if (index === -1) return notFound(res, '找不到事件');
  eventData.splice(index, 1);
  res.status(204).end();
});

app.get('/events/:event_id/timeline', (req, res) => {
  const event = getEventById(req.params.event_id);
  if (!event) return notFound(res, '找不到事件');
  res.json({ items: event.timeline || [] });
});

app.post('/events/:event_id/timeline', (req, res) => {
  const event = getEventById(req.params.event_id);
  if (!event) return notFound(res, '找不到事件');
  const entry = appendTimelineEntry(event, {
    entry_type: req.body?.entry_type || 'note',
    message: req.body?.message || '更新備註',
    created_by: req.body?.created_by,
    metadata: req.body?.metadata || {}
  });
  event.updated_at = toISO(new Date());
  res.status(201).json(entry);
});

app.post('/events/:event_id/comments', (req, res) => {
  const event = getEventById(req.params.event_id);
  if (!event) return notFound(res, '找不到事件');
  const comment = typeof req.body?.comment === 'string' ? req.body.comment.trim() : '';
  if (!comment) {
    return res.status(400).json({ code: 'INVALID_REQUEST', message: 'comment 欄位為必填。' });
  }
  const entry = appendTimelineEntry(event, {
    entry_type: 'note',
    message: comment,
    created_by: req.body?.created_by,
    metadata: {
      visibility: req.body?.visibility || 'internal',
      ...(req.body?.metadata || {})
    }
  });
  event.updated_at = toISO(new Date());
  res.status(201).json(entry);
});

app.get('/events/:event_id/related', (req, res) => {
  const event = getEventById(req.params.event_id);
  if (!event) return notFound(res, '找不到事件');
  res.json({ items: event.related || [] });
});

app.post('/events/:event_id/acknowledge', (req, res) => {
  const event = getEventById(req.params.event_id);
  if (!event) return notFound(res, '找不到事件');
  const assigneeId = req.body?.assignee_id || currentUser.user_id;
  const note = typeof req.body?.note === 'string' ? req.body.note.trim() : '';
  const acknowledgedAt = toISO(new Date());
  event.status = 'acknowledged';
  event.assignee_id = assigneeId;
  event.assignee = iamUsers.find((u) => u.user_id === assigneeId)?.name || currentUser.display_name;
  event.acknowledged_at = acknowledgedAt;
  event.updated_at = acknowledgedAt;
  appendTimelineEntry(event, {
    entry_type: 'status_change',
    message: '事件已確認處理',
    metadata: { action: 'acknowledge' }
  });
  if (note) {
    appendTimelineEntry(event, {
      entry_type: 'note',
      message: note,
      metadata: { action: 'acknowledge' }
    });
  }
  res.json(toEventDetail(event));
});

app.post('/events/:event_id/assign', (req, res) => {
  const event = getEventById(req.params.event_id);
  if (!event) return notFound(res, '找不到事件');
  const assigneeId = req.body?.assignee_id;
  if (!assigneeId) {
    return res.status(400).json({ code: 'INVALID_REQUEST', message: 'assignee_id 欄位為必填。' });
  }
  event.assignee_id = assigneeId;
  event.assignee = iamUsers.find((user) => user.user_id === assigneeId)?.name || assigneeId;
  if (event.status === 'new' || event.status === 'acknowledged') {
    event.status = 'in_progress';
  }
  const nowIso = toISO(new Date());
  event.updated_at = nowIso;
  appendTimelineEntry(event, {
    entry_type: 'status_change',
    message: `事件指派給 ${event.assignee}`,
    metadata: { action: 'assign' }
  });
  if (req.body?.note) {
    appendTimelineEntry(event, {
      entry_type: 'note',
      message: req.body.note,
      metadata: { action: 'assign' }
    });
  }
  res.json(toEventDetail(event));
});

app.post('/events/:event_id/resolve', (req, res) => {
  const event = getEventById(req.params.event_id);
  if (!event) return notFound(res, '找不到事件');
  const resolvedAt = req.body?.resolved_at ? toISO(new Date(req.body.resolved_at)) : toISO(new Date());
  event.status = 'resolved';
  event.resolved_at = resolvedAt;
  event.updated_at = resolvedAt;
  if (req.body?.resolution_note) {
    appendTimelineEntry(event, {
      entry_type: 'note',
      message: req.body.resolution_note,
      metadata: { action: 'resolve' }
    });
  }
  appendTimelineEntry(event, {
    entry_type: 'status_change',
    message: '事件標記為已解決',
    metadata: { action: 'resolve' }
  });
  res.json(toEventDetail(event));
});

app.get('/events/:event_id/analysis', (req, res) => {
  const event = getEventById(req.params.event_id);
  if (!event) return notFound(res, '找不到事件');
  res.json(event.analysis || {
    event_id: event.event_id,
    generated_at: toISO(new Date()),
    summary: '尚未產生分析',
    root_cause: null,
    confidence: 0,
    impact_analysis: null,
    recommendations: []
  });
});

app.post('/events/:event_id/analysis', (req, res) => {
  const event = getEventById(req.params.event_id);
  if (!event) return notFound(res, '找不到事件');
  event.analysis = event.analysis || {
    event_id: event.event_id,
    generated_at: toISO(new Date()),
    summary: 'AI 分析已啟動',
    root_cause: '預估為資料庫瓶頸',
    confidence: 0.7,
    impact_analysis: '影響交易 API 的 12% 需求',
    recommendations: aiInsightReports[0].suggestions
  };
  res.status(202).json(event.analysis);
});

app.post('/events/:event_id/silence', (req, res) => {
  const event = getEventById(req.params.event_id);
  if (!event) return notFound(res, '找不到事件');
  const durationHours = req.body?.duration_hours || 2;
  const start = new Date();
  const silence = {
    silence_id: `slc-${Date.now()}`,
    name: `${event.summary} 靜音`,
    description: req.body?.reason || '快速靜音',
    silence_type: 'single',
    scope: 'resource',
    enabled: true,
    created_at: toISO(start),
    schedule: {
      silence_type: 'single',
      starts_at: toISO(start),
      ends_at: toISO(new Date(start.getTime() + durationHours * 3600000)),
      timezone: 'UTC',
      repeat: null
    },
    matchers: [
      { key: 'resource_id', operator: 'equals', value: event.resource_id }
    ],
    notify_on_start: false,
    notify_on_end: req.body?.notify_on_end ?? false,
    created_by: currentUser.user_id
  };
  res.status(201).json(silence);
});

app.post('/events/report', (req, res) => {
  const { event_ids: eventIds, include_timeline: includeTimeline, title } = req.body || {};
  if (!Array.isArray(eventIds) || eventIds.length === 0) {
    return res.status(400).json({ code: 'INVALID_REQUEST', message: 'event_ids 至少需要一筆事件。' });
  }

  const selectedEvents = eventIds
    .map((id) => getEventById(id))
    .filter((event) => Boolean(event));

  if (selectedEvents.length === 0) {
    return res.status(404).json({ code: 'NOT_FOUND', message: '找不到指定的事件。' });
  }

  const severityBreakdown = selectedEvents.reduce((acc, event) => {
    acc[event.severity] = (acc[event.severity] || 0) + 1;
    return acc;
  }, {});

  const priorityBreakdown = selectedEvents.reduce((acc, event) => {
    const priority = event.priority || 'P2';
    acc[priority] = (acc[priority] || 0) + 1;
    return acc;
  }, {});

  const rootCauses = new Set();
  const impacts = new Set();
  const recommendations = [];
  const timelineHighlights = includeTimeline
    ? selectedEvents.map((event) => ({
        event_id: event.event_id,
        event_summary: event.summary,
        items: (event.timeline || []).map((entry) => ({
          entry_id: entry.entry_id,
          event_id: entry.event_id,
          entry_type: entry.entry_type,
          message: entry.message,
          created_by: entry.created_by,
          created_at: entry.created_at,
          metadata: entry.metadata || {}
        }))
      }))
    : undefined;

  selectedEvents.forEach((event) => {
    if (event.analysis?.root_cause) {
      rootCauses.add(event.analysis.root_cause);
    }
    if (event.analysis?.impact_analysis) {
      impacts.add(event.analysis.impact_analysis);
    }
    if (Array.isArray(event.analysis?.recommendations)) {
      recommendations.push(...event.analysis.recommendations);
    }
  });

  const summary = `共 ${selectedEvents.length} 件事件，Critical ${severityBreakdown.critical || 0} 件、` +
    `Warning ${severityBreakdown.warning || 0} 件，已完成彙總分析。`;

  const report = {
    report_id: `evt-report-${Date.now()}`,
    generated_at: toISO(new Date()),
    title: title || '事件彙總報告',
    event_ids: eventIds,
    severity_breakdown: severityBreakdown,
    priority_breakdown: priorityBreakdown,
    summary,
    root_causes: Array.from(rootCauses),
    impacts: Array.from(impacts),
    recommendations,
    ...(includeTimeline ? { timeline_highlights: timelineHighlights } : {})
  };

  res.json(report);
});
app.get('/event-rules/summary', (req, res) => {
  const enabled = eventRules.filter((rule) => rule.enabled).length;
  const automation = eventRules.filter((rule) => rule.automation?.enabled).length;
  res.json({ total: eventRules.length, enabled, automation_enabled: automation });
});

app.get('/event-rules', (req, res) => {
  res.json(paginate(eventRules.map((rule) => ({
    rule_id: rule.rule_id,
    name: rule.name,
    description: rule.description,
    severity: rule.severity,
    enabled: rule.enabled,
    automation_enabled: rule.automation_enabled,
    default_priority: rule.default_priority || 'P2',
    creator: rule.creator,
    last_updated: rule.last_updated
  })), req));
});

app.post('/event-rules', (req, res) => {
  const payload = req.body || {};
  const rule = {
    rule_id: `rule-${Date.now()}`,
    name: payload.name || '新事件規則',
    description: payload.description || '',
    severity: payload.severity || 'warning',
    default_priority: payload.default_priority || 'P2',
    enabled: payload.enabled ?? true,
    automation_enabled: payload.automation?.enabled ?? false,
    creator: currentUser.display_name,
    last_updated: toISO(new Date()),
    labels: payload.labels || [],
    environments: payload.environments || [],
    condition_groups: payload.condition_groups || [],
    title_template: payload.title_template || '',
    content_template: payload.content_template || '',
    automation: payload.automation || { enabled: false, script_id: null, parameters: {} }
  };
  eventRules.push(rule);
  res.status(201).json(rule);
});

app.get('/event-rules/:rule_id', (req, res) => {
  const rule = getEventRuleById(req.params.rule_id);
  if (!rule) return notFound(res, '找不到事件規則');
  res.json(rule);
});

app.put('/event-rules/:rule_id', (req, res) => {
  const rule = getEventRuleById(req.params.rule_id);
  if (!rule) return notFound(res, '找不到事件規則');
  Object.assign(rule, req.body || {}, { last_updated: toISO(new Date()) });
  res.json(rule);
});

app.delete('/event-rules/:rule_id', (req, res) => {
  const rule = getEventRuleById(req.params.rule_id);
  if (!rule) return notFound(res, '找不到事件規則');
  res.status(204).end();
});

app.post('/event-rules/:rule_id/toggle', (req, res) => {
  const rule = getEventRuleById(req.params.rule_id);
  if (!rule) return notFound(res, '找不到事件規則');
  rule.enabled = !rule.enabled;
  res.json(rule);
});

app.post('/event-rules/:rule_id/test', (req, res) => {
  const rule = getEventRuleById(req.params.rule_id);
  if (!rule) return notFound(res, '找不到事件規則');
  res.json({ matches: true, preview_event: mapEventSummary(eventData[0]), messages: ['條件符合範例資料'] });
});

app.get('/silence-rules', (req, res) => {
  res.json(paginate(silenceRules.map((rule) => ({
    silence_id: rule.silence_id,
    name: rule.name,
    description: rule.description,
    silence_type: rule.silence_type,
    scope: rule.scope,
    enabled: rule.enabled,
    created_at: rule.created_at
  })), req));
});

app.post('/silence-rules', (req, res) => {
  const payload = req.body || {};
  const rule = {
    silence_id: `slc-${Date.now()}`,
    name: payload.name || '新靜音規則',
    description: payload.description || '',
    silence_type: payload.silence_type || 'single',
    scope: payload.scope || 'global',
    enabled: payload.enabled ?? true,
    created_at: toISO(new Date()),
    schedule: payload.schedule || null,
    matchers: payload.matchers || [],
    notify_on_start: payload.notify_on_start ?? false,
    notify_on_end: payload.notify_on_end ?? false,
    created_by: currentUser.user_id
  };
  res.status(201).json(rule);
});

app.get('/silence-rules/:silence_id', (req, res) => {
  const rule = getSilenceRuleById(req.params.silence_id);
  if (!rule) return notFound(res, '找不到靜音規則');
  res.json(rule);
});

app.put('/silence-rules/:silence_id', (req, res) => {
  const rule = getSilenceRuleById(req.params.silence_id);
  if (!rule) return notFound(res, '找不到靜音規則');
  Object.assign(rule, req.body || {}, { updated_at: toISO(new Date()) });
  res.json(rule);
});

app.delete('/silence-rules/:silence_id', (req, res) => {
  const rule = getSilenceRuleById(req.params.silence_id);
  if (!rule) return notFound(res, '找不到靜音規則');
  res.status(204).end();
});

app.post('/silence-rules/:silence_id/toggle', (req, res) => {
  const rule = getSilenceRuleById(req.params.silence_id);
  if (!rule) return notFound(res, '找不到靜音規則');
  rule.enabled = !rule.enabled;
  res.json(rule);
});

app.get('/resources/summary', (req, res) => {
  const healthy = resourceData.filter((resItem) => resItem.status === 'healthy').length;
  const warning = resourceData.filter((resItem) => resItem.status === 'warning').length;
  const critical = resourceData.filter((resItem) => resItem.status === 'critical').length;
  res.json({ total_resources: resourceData.length, healthy, warning, critical, groups: resourceGroups.length });
});

app.get('/resources', (req, res) => {
  res.json(paginate(resourceData.map((resItem) => ({
    resource_id: resItem.resource_id,
    name: resItem.name,
    status: resItem.status,
    type: resItem.type,
    ip_address: resItem.ip_address,
    location: resItem.location,
    environment: resItem.environment,
    team: resItem.team,
    team_id: resItem.team_id || null,
    os: resItem.os,
    cpu_usage: resItem.cpu_usage,
    memory_usage: resItem.memory_usage,
    disk_usage: resItem.disk_usage,
    network_in_mbps: resItem.network_in_mbps,
    network_out_mbps: resItem.network_out_mbps,
    service_impact: resItem.service_impact,
    tags: cloneTags(resItem.tags),
    last_event_count: resItem.last_event_count,
    updated_at: resItem.updated_at,
    groups: buildResourceGroupRefs(resItem.groups)
  })), req));
});

app.post('/resources', (req, res) => {
  const payload = req.body || {};
  const resource = {
    resource_id: `res-${Date.now()}`,
    name: payload.name || '新資源',
    status: payload.status || 'healthy',
    type: payload.type || 'server',
    ip_address: payload.ip_address || '10.0.0.1',
    location: payload.location || 'ap-southeast-1a',
    environment: payload.environment || 'production',
    team_id: payload.team_id || null,
    team:
      payload.team ||
      (payload.team_id ? getTeamById(payload.team_id)?.name || null : null),
    os: payload.os || 'Linux',
    cpu_usage: 0,
    memory_usage: 0,
    disk_usage: 0,
    network_in_mbps: 0,
    network_out_mbps: 0,
    service_impact: payload.service_impact || null,
    tags: normalizeTags(payload.tags ?? payload.labels),
    notes: payload.notes || null,
    last_event_count: 0,
    groups: normalizeGroupIds(payload.group_ids),
    created_at: toISO(new Date()),
    updated_at: toISO(new Date())
  };
  resourceData.push(resource);
  res.status(201).json(buildResourceDetail(resource));
});

app.get('/resources/:resource_id', (req, res) => {
  const resource = getResourceById(req.params.resource_id);
  if (!resource) return notFound(res, '找不到資源');
  res.json(buildResourceDetail(resource));
});

app.patch('/resources/:resource_id', (req, res) => {
  const resource = getResourceById(req.params.resource_id);
  if (!resource) return notFound(res, '找不到資源');
  const updates = { ...(req.body || {}) };
  if (Object.prototype.hasOwnProperty.call(updates, 'tags') || Object.prototype.hasOwnProperty.call(updates, 'labels')) {
    resource.tags = normalizeTags(updates.tags ?? updates.labels);
    delete updates.tags;
    delete updates.labels;
  }
  if (Object.prototype.hasOwnProperty.call(updates, 'group_ids')) {
    resource.groups = normalizeGroupIds(updates.group_ids);
    delete updates.group_ids;
  }
  if (Object.prototype.hasOwnProperty.call(updates, 'team_id')) {
    resource.team_id = updates.team_id;
    if (!Object.prototype.hasOwnProperty.call(updates, 'team')) {
      resource.team = updates.team_id
        ? getTeamById(updates.team_id)?.name || resource.team
        : null;
    }
    delete updates.team_id;
  }
  if (Object.prototype.hasOwnProperty.call(updates, 'team')) {
    resource.team = updates.team;
    delete updates.team;
  }
  Object.assign(resource, updates, { updated_at: toISO(new Date()) });
  res.json(buildResourceDetail(resource));
});

app.delete('/resources/:resource_id', (req, res) => {
  const resource = getResourceById(req.params.resource_id);
  if (!resource) return notFound(res, '找不到資源');
  res.status(204).end();
});

app.get('/resources/:resource_id/metrics', (req, res) => {
  const resource = getResourceById(req.params.resource_id);
  if (!resource) return notFound(res, '找不到資源');
  res.json({
    metrics: [
      {
        metric: 'cpu_usage',
        unit: '%',
        points: [
          { timestamp: toISO(new Date(now.getTime() - 3600000 * 2)), value: 55 },
          { timestamp: toISO(new Date(now.getTime() - 3600000)), value: 60 },
          { timestamp: toISO(now), value: resource.cpu_usage }
        ]
      },
      {
        metric: 'memory_usage',
        unit: '%',
        points: [
          { timestamp: toISO(new Date(now.getTime() - 3600000 * 2)), value: 50 },
          { timestamp: toISO(new Date(now.getTime() - 3600000)), value: 64 },
          { timestamp: toISO(now), value: resource.memory_usage }
        ]
      }
    ]
  });
});

app.get('/resources/:resource_id/events', (req, res) => {
  const resource = getResourceById(req.params.resource_id);
  if (!resource) return notFound(res, '找不到資源');
  const relatedEvents = eventData.filter((evt) => evt.resource_id === resource.resource_id).map(mapEventSummary);
  res.json(paginate(relatedEvents, req));
});

app.get('/resource-groups', (req, res) => {
  res.json(paginate(resourceGroups.map((grp) => ({
    group_id: grp.group_id,
    name: grp.name,
    description: grp.description,
    owner_team_id: grp.owner_team_id || null,
    owner_team: grp.owner_team,
    member_count: grp.member_count,
    subscriber_count: grp.subscriber_count,
    status_summary: grp.status_summary,
    created_at: grp.created_at
  })), req));
});

app.post('/resource-groups', (req, res) => {
  const payload = req.body || {};
  const group = {
    group_id: `grp-${Date.now()}`,
    name: payload.name || '新資源群組',
    description: payload.description || '',
    owner_team_id: payload.owner_team_id || null,
    owner_team:
      payload.owner_team ||
      (payload.owner_team_id ? getTeamById(payload.owner_team_id)?.name || null : null),
    member_count: payload.resource_ids ? payload.resource_ids.length : 0,
    subscriber_count: payload.subscriber_ids ? payload.subscriber_ids.length : 0,
    status_summary: { healthy: 0, warning: 0, critical: 0 },
    created_at: toISO(new Date()),
    members: (payload.resource_ids || []).map((id) => ({ resource_id: id, name: id, type: 'unknown', status: 'healthy' })),
    subscribers: (payload.subscriber_ids || []).map((id) => ({ user_id: id, display_name: id, subscribed_at: toISO(new Date()) }))
  };
  res.status(201).json(group);
});

app.get('/resource-groups/:group_id', (req, res) => {
  const group = getResourceGroupById(req.params.group_id);
  if (!group) return notFound(res, '找不到資源群組');
  res.json(group);
});

app.put('/resource-groups/:group_id', (req, res) => {
  const group = getResourceGroupById(req.params.group_id);
  if (!group) return notFound(res, '找不到資源群組');
  const payload = req.body || {};
  if (Object.prototype.hasOwnProperty.call(payload, 'owner_team_id')) {
    group.owner_team_id = payload.owner_team_id;
    if (!Object.prototype.hasOwnProperty.call(payload, 'owner_team')) {
      group.owner_team = payload.owner_team_id
        ? getTeamById(payload.owner_team_id)?.name || group.owner_team
        : null;
    }
    delete payload.owner_team_id;
  }
  if (Object.prototype.hasOwnProperty.call(payload, 'owner_team')) {
    group.owner_team = payload.owner_team;
    delete payload.owner_team;
  }
  Object.assign(group, payload, { updated_at: toISO(new Date()) });
  res.json(group);
});

app.delete('/resource-groups/:group_id', (req, res) => {
  const group = getResourceGroupById(req.params.group_id);
  if (!group) return notFound(res, '找不到資源群組');
  res.status(204).end();
});

app.get('/topology', (req, res) => {
  res.json(topologyGraph);
});

app.get('/dashboards/summary', (req, res) => {
  const published = dashboards.filter((dash) => dash.status === 'published').length;
  const featured = dashboards.filter((dash) => dash.is_featured).length;
  const automated = 1;
  res.json({ total: dashboards.length, published, featured, automated });
});

app.get('/dashboards', (req, res) => {
  res.json(paginate(dashboards.map((dash) => ({
    dashboard_id: dash.dashboard_id,
    name: dash.name,
    category: dash.category,
    owner: dash.owner,
    status: dash.status,
    is_featured: dash.is_featured,
    is_default: dash.is_default,
    viewer_count: dash.viewer_count,
    favorite_count: dash.favorite_count,
    panel_count: dash.panel_count,
    tags: dash.tags,
    data_sources: dash.data_sources,
    target_page_key: dash.target_page_key,
    updated_at: dash.updated_at
  })), req));
});

app.post('/dashboards', (req, res) => {
  const payload = req.body || {};
  const dash = {
    dashboard_id: `dash-${Date.now()}`,
    name: payload.name || '新儀表板',
    category: payload.category || '自訂',
    owner: currentUser.display_name,
    owner_id: currentUser.user_id,
    description: payload.description || '',
    status: 'draft',
    is_featured: false,
    is_default: false,
    viewer_count: 0,
    favorite_count: 0,
    panel_count: (payload.layout || []).length,
    tags: payload.tags || [],
    data_sources: payload.data_sources || [],
    target_page_key: payload.target_page_key || null,
    published_at: null,
    updated_at: toISO(new Date()),
    layout: payload.layout || [],
    kpis: payload.kpis || []
  };
  dashboards.push(dash);
  res.status(201).json(dash);
});

app.get('/dashboards/:dashboard_id', (req, res) => {
  const dash = getDashboardById(req.params.dashboard_id);
  if (!dash) return notFound(res, '找不到儀表板');
  res.json(dash);
});

app.patch('/dashboards/:dashboard_id', (req, res) => {
  const dash = getDashboardById(req.params.dashboard_id);
  if (!dash) return notFound(res, '找不到儀表板');
  Object.assign(dash, req.body || {}, { updated_at: toISO(new Date()) });
  dash.panel_count = Array.isArray(dash.layout) ? dash.layout.length : dash.panel_count;
  res.json(dash);
});

app.delete('/dashboards/:dashboard_id', (req, res) => {
  const dash = getDashboardById(req.params.dashboard_id);
  if (!dash) return notFound(res, '找不到儀表板');
  res.status(204).end();
});

app.post('/dashboards/:dashboard_id/publish', (req, res) => {
  const dash = getDashboardById(req.params.dashboard_id);
  if (!dash) return notFound(res, '找不到儀表板');
  const shouldPublish = req.body?.published ?? dash.status !== 'published';
  dash.status = shouldPublish ? 'published' : 'draft';
  dash.published_at = shouldPublish ? toISO(new Date()) : null;
  res.json(dash);
});

app.post('/dashboards/:dashboard_id/default', (req, res) => {
  const dash = getDashboardById(req.params.dashboard_id);
  if (!dash) return notFound(res, '找不到儀表板');
  dashboards.forEach((item) => {
    item.is_default = item.dashboard_id === dash.dashboard_id;
  });
  dash.is_default = true;
  res.json(dash);
});
app.get('/analysis/capacity/summary', (req, res) => {
  res.json(capacitySummary);
});

app.get('/analysis/capacity/forecasts', (req, res) => {
  res.json({ forecasts: capacityForecasts, suggestions: capacitySuggestions });
});

app.get('/analysis/resource-load', (req, res) => {
  res.json({ summary: resourceLoadSummary, items: resourceLoadItems });
});

app.get('/analysis/ai-insights', (req, res) => {
  res.json(paginate(aiInsightReports, req));
});

app.get('/analysis/ai-insights/:report_id', (req, res) => {
  const report = aiInsightReports.find((item) => item.report_id === req.params.report_id);
  if (!report) return notFound(res, '找不到 AI 洞察報告');
  res.json(report);
});

app.get('/automation/scripts', (req, res) => {
  res.json(paginate(automationScripts.map((script) => ({
    script_id: script.script_id,
    name: script.name,
    type: script.type,
    description: script.description,
    version: script.version,
    tags: script.tags,
    last_execution_status: script.last_execution_status,
    last_execution_at: script.last_execution_at
  })), req));
});

app.post('/automation/scripts', (req, res) => {
  const payload = req.body || {};
  const script = {
    script_id: `script-${Date.now()}`,
    name: payload.name || '新腳本',
    type: payload.type || 'shell',
    description: payload.description || '',
    version: 'v1',
    tags: payload.tags || [],
    last_execution_status: 'never',
    last_execution_at: null,
    content: payload.content || ''
  };
  res.status(201).json(script);
});

app.get('/automation/scripts/:script_id', (req, res) => {
  const script = getScriptById(req.params.script_id);
  if (!script) return notFound(res, '找不到腳本');
  res.json(script);
});

app.patch('/automation/scripts/:script_id', (req, res) => {
  const script = getScriptById(req.params.script_id);
  if (!script) return notFound(res, '找不到腳本');
  Object.assign(script, req.body || {}, { updated_at: toISO(new Date()) });
  res.json(script);
});

app.delete('/automation/scripts/:script_id', (req, res) => {
  const script = getScriptById(req.params.script_id);
  if (!script) return notFound(res, '找不到腳本');
  res.status(204).end();
});

app.post('/automation/scripts/:script_id/execute', (req, res) => {
  const script = getScriptById(req.params.script_id);
  if (!script) return notFound(res, '找不到腳本');
  res.status(202).json({ execution_id: `exe-${Date.now()}`, status: 'pending', queued_at: toISO(new Date()) });
});

app.get('/automation/scripts/:script_id/versions', (req, res) => {
  const script = getScriptById(req.params.script_id);
  if (!script) return notFound(res, '找不到腳本');
  res.json(paginate(script.versions || [], req));
});

app.get('/automation/schedules', (req, res) => {
  res.json(paginate(automationSchedules.map((sch) => ({
    schedule_id: sch.schedule_id,
    name: sch.name,
    type: sch.type,
    status: sch.status,
    cron_expression: sch.cron_expression,
    next_run_time: sch.next_run_time,
    script_id: sch.script_id,
    script_name: sch.script_name
  })), req));
});

app.post('/automation/schedules', (req, res) => {
  const payload = req.body || {};
  const schedule = {
    schedule_id: `sch-${Date.now()}`,
    name: payload.name || '新排程',
    type: payload.type || 'recurring',
    status: payload.status || 'enabled',
    cron_expression: payload.cron_expression || '0 * * * *',
    timezone: payload.timezone || 'UTC',
    next_run_time: toISO(new Date(now.getTime() + 3600000)),
    script_id: payload.script_id || null,
    script_name: automationScripts.find((s) => s.script_id === payload.script_id)?.name || null,
    concurrency_policy: payload.concurrency_policy || 'allow',
    retry_policy: payload.retry_policy || { max_retries: 0, interval_seconds: 0 },
    notify_on_success: payload.notify_on_success ?? false,
    notify_on_failure: payload.notify_on_failure ?? true,
    channels: payload.channels || []
  };
  res.status(201).json(schedule);
});

app.get('/automation/schedules/:schedule_id', (req, res) => {
  const schedule = getScheduleById(req.params.schedule_id);
  if (!schedule) return notFound(res, '找不到排程');
  res.json(schedule);
});

app.patch('/automation/schedules/:schedule_id', (req, res) => {
  const schedule = getScheduleById(req.params.schedule_id);
  if (!schedule) return notFound(res, '找不到排程');
  Object.assign(schedule, req.body || {}, { updated_at: toISO(new Date()) });
  res.json(schedule);
});

app.delete('/automation/schedules/:schedule_id', (req, res) => {
  const schedule = getScheduleById(req.params.schedule_id);
  if (!schedule) return notFound(res, '找不到排程');
  res.status(204).end();
});

app.post('/automation/schedules/:schedule_id/toggle', (req, res) => {
  const schedule = getScheduleById(req.params.schedule_id);
  if (!schedule) return notFound(res, '找不到排程');
  schedule.status = schedule.status === 'enabled' ? 'disabled' : 'enabled';
  res.json(schedule);
});

app.get('/automation/executions', (req, res) => {
  res.json(paginate(automationExecutions, req));
});

app.get('/automation/executions/:execution_id', (req, res) => {
  const execution = getExecutionById(req.params.execution_id);
  if (!execution) return notFound(res, '找不到執行紀錄');
  res.json(execution);
});

app.post('/automation/executions/:execution_id/retry', (req, res) => {
  const execution = getExecutionById(req.params.execution_id);
  if (!execution) return notFound(res, '找不到執行紀錄');
  res.status(202).json({ ...execution, status: 'pending', start_time: toISO(new Date()), end_time: null });
});

app.post('/iam/invitations', (req, res) => {
  const payload = req.body || {};
  const email = typeof payload.email === 'string' ? payload.email.trim() : '';
  if (!email) {
    return res.status(400).json({ code: 'invalid_request', message: '請提供邀請 Email。' });
  }
  const invitation = {
    invitation_id: `inv-${Date.now()}`,
    email,
    name: typeof payload.name === 'string' ? payload.name.trim() : null,
    status: 'invitation_sent',
    sent_at: toISO(new Date())
  };
  iamInvitations.push(invitation);
  res.status(201).json({
    invitation_id: invitation.invitation_id,
    status: invitation.status,
    email: invitation.email,
    name: invitation.name,
    sent_at: invitation.sent_at
  });
});

app.get('/iam/users', (req, res) => {
  res.json(paginate(iamUsers, req));
});

app.get('/iam/users/:user_id', (req, res) => {
  const user = getIamUserById(req.params.user_id);
  if (!user) return notFound(res, '找不到人員');
  res.json(user);
});

app.patch('/iam/users/:user_id', (req, res) => {
  const user = getIamUserById(req.params.user_id);
  if (!user) return notFound(res, '找不到人員');
  const payload = req.body || {};
  if (Array.isArray(payload.role_ids)) {
    user.roles = payload.role_ids;
  }
  if (Array.isArray(payload.team_ids)) {
    user.teams = payload.team_ids;
  }
  if (typeof payload.status === 'string') {
    user.status = payload.status;
  }
  res.json(user);
});

app.delete('/iam/users/:user_id', (req, res) => {
  const user = getIamUserById(req.params.user_id);
  if (!user) return notFound(res, '找不到人員');
  res.status(204).end();
});

app.get('/iam/teams', (req, res) => {
  res.json(paginate(iamTeams.map((team) => ({
    team_id: team.team_id,
    name: team.name,
    description: team.description,
    owner: team.owner,
    members: team.members,
    subscribers: team.subscribers,
    created_at: team.created_at
  })), req));
});

app.post('/iam/teams', (req, res) => {
  const payload = req.body || {};
  const memberIds = Array.isArray(payload.member_ids) ? payload.member_ids : [];
  const subscriberDetails = Array.isArray(payload.subscribers) && payload.subscribers.every((item) => typeof item === 'object')
    ? payload.subscribers
    : [];
  const subscriberIds = Array.isArray(payload.subscriber_ids) ? payload.subscriber_ids : subscriberDetails.map((item) => item.subscriber_id);
  const team = {
    team_id: `team-${Date.now()}`,
    name: payload.name || '新團隊',
    description: payload.description || '',
    owner: payload.owner_id || currentUser.user_id,
    created_at: toISO(new Date()),
    member_ids: memberIds,
    members: memberIds,
    subscriber_ids: subscriberIds,
    subscribers: subscriberIds,
    subscriber_details: subscriberDetails
  };
  iamTeams.push(team);
  res.status(201).json(buildTeamDetail(team));
});

app.get('/iam/teams/:team_id', (req, res) => {
  const team = getTeamById(req.params.team_id);
  if (!team) return notFound(res, '找不到團隊');
  res.json(buildTeamDetail(team));
});

app.patch('/iam/teams/:team_id', (req, res) => {
  const team = getTeamById(req.params.team_id);
  if (!team) return notFound(res, '找不到團隊');
  const payload = req.body || {};
  Object.assign(team, payload);

  let subscriberDetails;
  if (Array.isArray(payload.subscribers) && payload.subscribers.every((item) => typeof item === 'object')) {
    subscriberDetails = payload.subscribers;
  } else if (Array.isArray(payload.subscriber_details) && payload.subscriber_details.every((item) => typeof item === 'object')) {
    subscriberDetails = payload.subscriber_details;
  }

  if (subscriberDetails) {
    team.subscriber_details = subscriberDetails;
    team.subscriber_ids = subscriberDetails.map((item) => item.subscriber_id);
    team.subscribers = team.subscriber_ids;
  } else if (Array.isArray(payload.subscriber_ids)) {
    team.subscriber_ids = payload.subscriber_ids;
    team.subscribers = payload.subscriber_ids;
  }

  if (Array.isArray(payload.member_ids)) {
    team.member_ids = payload.member_ids;
    team.members = payload.member_ids;
  }

  res.json(buildTeamDetail(team));
});

app.delete('/iam/teams/:team_id', (req, res) => {
  const team = getTeamById(req.params.team_id);
  if (!team) return notFound(res, '找不到團隊');
  res.status(204).end();
});

app.get('/iam/roles', (req, res) => {
  res.json(iamRoles.map((role) => ({
    role_id: role.role_id,
    name: role.name,
    description: role.description,
    status: role.status,
    user_count: role.user_count,
    created_at: role.created_at
  })));
});

app.post('/iam/roles', (req, res) => {
  const payload = req.body || {};
  const role = {
    role_id: `role-${Date.now()}`,
    name: payload.name || 'new-role',
    description: payload.description || '',
    status: payload.status || 'active',
    permissions: payload.permissions || []
  };
  res.status(201).json(role);
});

app.get('/iam/roles/:role_id', (req, res) => {
  const role = getRoleById(req.params.role_id);
  if (!role) return notFound(res, '找不到角色');
  res.json(role);
});

app.patch('/iam/roles/:role_id', (req, res) => {
  const role = getRoleById(req.params.role_id);
  if (!role) return notFound(res, '找不到角色');
  Object.assign(role, req.body || {});
  res.json(role);
});

app.delete('/iam/roles/:role_id', (req, res) => {
  const role = getRoleById(req.params.role_id);
  if (!role) return notFound(res, '找不到角色');
  res.status(204).end();
});

app.get('/iam/audit-logs', (req, res) => {
  res.json(paginate(auditLogs, req));
});

app.get('/notification/strategies', (req, res) => {
  res.json(paginate(notificationStrategies.map((strategy) => ({
    strategy_id: strategy.strategy_id,
    name: strategy.name,
    trigger_condition: strategy.trigger_condition,
    channel_count: strategy.channel_count,
    status: strategy.status,
    priority: strategy.priority
  })), req));
});

app.post('/notification/strategies', (req, res) => {
  const payload = req.body || {};
  const strategy = {
    strategy_id: `str-${Date.now()}`,
    name: payload.name || '新策略',
    description: payload.description || '',
    trigger_condition: payload.trigger_condition || 'true',
    channel_count: payload.channels ? payload.channels.length : 0,
    status: payload.enabled ? 'enabled' : 'disabled',
    priority: payload.priority || 'medium',
    severity_filters: payload.severity_filters || [],
    recipients: payload.recipients || [],
    channels: payload.channels || [],
    resource_filters: payload.resource_filters || {}
  };
  res.status(201).json(strategy);
});

app.get('/notification/strategies/:strategy_id', (req, res) => {
  const strategy = getNotificationStrategyById(req.params.strategy_id);
  if (!strategy) return notFound(res, '找不到通知策略');
  res.json(strategy);
});

app.patch('/notification/strategies/:strategy_id', (req, res) => {
  const strategy = getNotificationStrategyById(req.params.strategy_id);
  if (!strategy) return notFound(res, '找不到通知策略');
  Object.assign(strategy, req.body || {});
  res.json(strategy);
});

app.delete('/notification/strategies/:strategy_id', (req, res) => {
  const strategy = getNotificationStrategyById(req.params.strategy_id);
  if (!strategy) return notFound(res, '找不到通知策略');
  res.status(204).end();
});

app.post('/notification/strategies/:strategy_id/test', (req, res) => {
  const strategy = getNotificationStrategyById(req.params.strategy_id);
  if (!strategy) return notFound(res, '找不到通知策略');
  res.json({ status: 'success', message: '已發送測試通知', details: { recipients: strategy.recipients } });
});

app.get('/notification/channels', (req, res) => {
  res.json(notificationChannels.map((channel) => ({
    channel_id: channel.channel_id,
    name: channel.name,
    type: channel.type,
    enabled: channel.enabled,
    status: channel.status,
    template_key: channel.template_key,
    last_test_result: channel.last_test_result || 'pending',
    last_test_message: channel.last_test_message || null,
    last_tested_at: channel.last_tested_at || null,
    updated_at: channel.updated_at
  })));
});

app.post('/notification/channels', (req, res) => {
  const payload = req.body || {};
  const channel = {
    channel_id: `chn-${Date.now()}`,
    name: payload.name || '新管道',
    type: payload.type || 'Email',
    status: payload.status || 'active',
    enabled: payload.enabled ?? true,
    description: payload.description || '',
    config: payload.config || {},
    template_key: payload.template_key || null,
    last_test_result: null,
    last_test_message: null,
    updated_at: toISO(new Date()),
    last_tested_at: null
  };
  notificationChannels.push(channel);
  res.status(201).json(channel);
});

app.post('/notification/channels/:channel_id/test', (req, res) => {
  const channel = getNotificationChannelById(req.params.channel_id);
  if (!channel) return notFound(res, '找不到通知管道');
  channel.last_tested_at = toISO(new Date());
  channel.last_test_result = 'success';
  channel.last_test_message = '測試通知已發送';
  res.json({ status: 'success', message: '測試通知已發送' });
});

app.get('/notification/channels/:channel_id', (req, res) => {
  const channel = getNotificationChannelById(req.params.channel_id);
  if (!channel) return notFound(res, '找不到通知管道');
  res.json(channel);
});

app.patch('/notification/channels/:channel_id', (req, res) => {
  const channel = getNotificationChannelById(req.params.channel_id);
  if (!channel) return notFound(res, '找不到通知管道');
  Object.assign(channel, req.body || {}, { updated_at: toISO(new Date()) });
  res.json(channel);
});

app.delete('/notification/channels/:channel_id', (req, res) => {
  const channel = getNotificationChannelById(req.params.channel_id);
  if (!channel) return notFound(res, '找不到通知管道');
  res.status(204).end();
});

app.get('/notification/history', (req, res) => {
  const items = notificationHistory.map(mapNotificationHistorySummary);
  res.json(paginate(items, req));
});

app.get('/notification/history/:record_id', (req, res) => {
  const record = getHistoryById(req.params.record_id);
  if (!record) return notFound(res, '找不到通知紀錄');
  const resendJobs = notificationResendJobs
    .filter((job) => job.notification_history_id === record.record_id)
    .map(mapNotificationResendJob);
  res.json({ ...record, resend_jobs: resendJobs });
});

app.post('/notification/history/:record_id/resend', (req, res) => {
  const record = getHistoryById(req.params.record_id);
  if (!record) return notFound(res, '找不到通知紀錄');
  const jobId = `job-${Date.now()}`;
  const enqueuedAt = toISO(new Date());
  const job = {
    job_id: jobId,
    notification_history_id: record.record_id,
    status: 'queued',
    requested_at: enqueuedAt,
    requested_by: currentUser.display_name,
    channel_id: req.body?.channel_id || record.channel_id || null,
    recipients: req.body?.recipients || record.recipients,
    dry_run: Boolean(req.body?.dry_run),
    note: req.body?.note || null,
    result_message: null,
    error_message: null,
    metadata: req.body?.metadata && typeof req.body.metadata === 'object' ? req.body.metadata : {}
  };
  notificationResendJobs.push(job);
  record.resend_count = (record.resend_count || 0) + 1;
  record.last_resend_at = enqueuedAt;
  record.resend_available = true;
  res.status(202).json({
    record_id: record.record_id,
    status: 'queued',
    enqueued_at: enqueuedAt,
    job_id: jobId,
    message: '重新發送已排入佇列'
  });
});

app.post('/notification/history/resend', (req, res) => {
  const recordIds = Array.isArray(req.body?.record_ids) ? req.body.record_ids : [];
  if (!recordIds.length) {
    return res.status(400).json({ code: 'INVALID_REQUEST', message: 'record_ids 至少需要一筆資料' });
  }
  let accepted = 0;
  const rejected = [];
  const enqueuedAt = toISO(new Date());
  recordIds.forEach((id) => {
    const record = getHistoryById(id);
    if (!record) {
      rejected.push({ record_id: id, reason: 'NOT_FOUND' });
      return;
    }
    const jobId = `job-${Date.now()}-${Math.random().toString(16).slice(2, 6)}`;
    notificationResendJobs.push({
      job_id: jobId,
      notification_history_id: record.record_id,
      status: 'queued',
      requested_at: enqueuedAt,
      requested_by: currentUser.display_name,
      channel_id: req.body?.channel_id || record.channel_id || null,
      recipients: record.recipients,
      dry_run: Boolean(req.body?.dry_run),
      note: req.body?.note || null,
      result_message: null,
      error_message: null,
      metadata: req.body?.metadata && typeof req.body.metadata === 'object' ? req.body.metadata : {}
    });
    record.resend_count = (record.resend_count || 0) + 1;
    record.last_resend_at = enqueuedAt;
    record.resend_available = true;
    accepted += 1;
  });

  res.status(202).json({
    requested_count: recordIds.length,
    accepted_count: accepted,
    rejected_count: rejected.length,
    rejected_records: rejected,
    batch_id: `batch-${Date.now()}`
  });
});

app.get('/settings/tags', (req, res) => {
  res.json(tagDefinitions);
});

app.get('/settings/tags/summary', (req, res) => {
  res.json(tagSummary);
});

app.post('/settings/tags', (req, res) => {
  const payload = req.body || {};
  const tag = {
    tag_id: `tag-${Date.now()}`,
    name: payload.name || '新標籤',
    category: payload.category || '自訂',
    required: payload.required ?? false,
    usage_count: 0,
    values: []
  };
  res.status(201).json(tag);
});

app.get('/settings/tags/:tag_id', (req, res) => {
  const tag = getTagById(req.params.tag_id);
  if (!tag) return notFound(res, '找不到標籤');
  res.json(tag);
});

app.patch('/settings/tags/:tag_id', (req, res) => {
  const tag = getTagById(req.params.tag_id);
  if (!tag) return notFound(res, '找不到標籤');
  Object.assign(tag, req.body || {});
  res.json(tag);
});

app.delete('/settings/tags/:tag_id', (req, res) => {
  const tag = getTagById(req.params.tag_id);
  if (!tag) return notFound(res, '找不到標籤');
  res.status(204).end();
});

app.get('/settings/tags/:tag_id/values', (req, res) => {
  const tag = getTagById(req.params.tag_id);
  if (!tag) return notFound(res, '找不到標籤');
  res.json(tag.values);
});

app.post('/settings/tags/:tag_id/values', (req, res) => {
  const tag = getTagById(req.params.tag_id);
  if (!tag) return notFound(res, '找不到標籤');
  const value = {
    value_id: `tag-value-${Date.now()}`,
    value: req.body?.value || 'new-value',
    description: req.body?.description || '',
    is_default: req.body?.is_default ?? false,
    usage_count: 0,
    last_synced_at: null
  };
  tag.values.push(value);
  res.status(201).json(value);
});

app.patch('/settings/tags/:tag_id/values/:value_id', (req, res) => {
  const tag = getTagById(req.params.tag_id);
  if (!tag) return notFound(res, '找不到標籤');
  const value = tag.values.find((item) => item.value_id === req.params.value_id);
  if (!value) return notFound(res, '找不到標籤值');
  Object.assign(value, req.body || {});
  res.json(value);
});

app.delete('/settings/tags/:tag_id/values/:value_id', (req, res) => {
  const tag = getTagById(req.params.tag_id);
  if (!tag) return notFound(res, '找不到標籤');
  const value = tag.values.find((item) => item.value_id === req.params.value_id);
  if (!value) return notFound(res, '找不到標籤值');
  res.status(204).end();
});

app.get('/tags/keys', (req, res) => {
  const keyword = (req.query.keyword || '').toLowerCase();
  const category = req.query.category;
  let items = tagKeyOptions;
  if (category) {
    items = items.filter((item) => item.categories.includes(category));
  }
  if (keyword) {
    items = items.filter(
      (item) =>
        item.tag_key.toLowerCase().includes(keyword) ||
        (item.display_name || '').toLowerCase().includes(keyword) ||
        (item.description || '').toLowerCase().includes(keyword)
    );
  }
  res.json({ total: items.length, items });
});

app.get('/tags/:tag_key/values', (req, res) => {
  const tagKey = req.params.tag_key;
  const values = tagValueCatalog[tagKey];
  if (!values) {
    return notFound(res, '找不到標籤鍵');
  }
  const limit = Math.min(
    Math.max(parseInt(req.query.limit, 10) || values.length, 1),
    values.length
  );
  res.json({ tag_key: tagKey, total: values.length, items: values.slice(0, limit) });
});

app.get('/settings/email', (req, res) => res.json(emailSettings));

app.put('/settings/email', (req, res) => {
  Object.assign(emailSettings, req.body || {}, { updated_at: toISO(new Date()) });
  res.json(emailSettings);
});

app.post('/settings/email/test', (req, res) => {
  const recipient = req.body?.recipient || emailSettings.test_recipient || emailSettings.sender_email;
  const executedAt = toISO(new Date());
  const result = {
    status: 'success',
    executed_at: executedAt,
    duration_ms: 380,
    recipient,
    message: '測試郵件已送出',
    error: null,
    logs: ['已成功連線 SMTP 伺服器', '測試郵件已送出'],
    preview_url: null
  };
  emailTestHistory.unshift({
    id: `email-test-${Date.now()}`,
    status: result.status,
    recipient,
    template_key: req.body?.template_key || 'default',
    duration_ms: result.duration_ms,
    response_message: result.message,
    error_message: result.error,
    metadata: { variables: req.body?.variables || {} },
    executed_at: executedAt
  });
  res.json(result);
});

app.get('/settings/auth', (req, res) => res.json(authSettings));

app.put('/settings/auth', (req, res) => {
  Object.assign(authSettings, req.body || {}, { updated_at: toISO(new Date()) });
  res.json(authSettings);
});

// Admin endpoints
const systemSettings = {
  maintenance_mode: false,
  max_concurrent_scans: 10,
  auto_discovery_enabled: true,
  alert_integration_enabled: true,
  retention_events_days: 90,
  retention_logs_days: 30,
  retention_metrics_days: 365,
  updated_by: currentUser.user_id,
  updated_at: toISO(now)
};

const systemDiagnostics = {
  platform: {
    version: '3.0.0',
    uptime: '7 days 4 hours',
    memory_usage: 68.5,
    cpu_usage: 23.1,
    disk_usage: 45.2
  },
  database: {
    connection_status: 'healthy',
    pool_size: 20,
    active_connections: 8,
    query_time: 12.5
  },
  cache: {
    status: 'healthy',
    memory_used: 256,
    hit_rate: 97.8
  },
  services: {
    notification_service: 'running',
    automation_service: 'running',
    ai_service: 'running'
  },
  external_integrations: {
    grafana: 'connected',
    keycloak: 'connected'
  },
  generated_at: toISO(now)
};

const systemHealth = {
  overall_status: 'healthy',
  checks: [
    {
      name: 'Database Connection',
      status: 'pass',
      message: 'All database connections are healthy',
      duration_ms: 8,
      last_checked: toISO(new Date(now.getTime() - 30000))
    },
    {
      name: 'Cache Service',
      status: 'pass',
      message: 'Redis cluster is responding normally',
      duration_ms: 5,
      last_checked: toISO(new Date(now.getTime() - 15000))
    },
    {
      name: 'External Integrations',
      status: 'pass',
      message: 'Grafana and Keycloak are reachable',
      duration_ms: 120,
      last_checked: toISO(new Date(now.getTime() - 60000))
    }
  ],
  generated_at: toISO(now)
};

// Batch operations
const eventBatchOperations = new Map();
const batchOperations = new Map();
const scanTasks = new Map();

// Admin endpoints
app.get('/admin/settings', (req, res) => {
  res.json(systemSettings);
});

app.post('/admin/settings', (req, res) => {
  const payload = req.body || {};
  const flattened = { ...payload };

  if (payload.retention_policy && typeof payload.retention_policy === 'object') {
    const { events_days, logs_days, metrics_days } = payload.retention_policy;
    if (events_days !== undefined) flattened.retention_events_days = events_days;
    if (logs_days !== undefined) flattened.retention_logs_days = logs_days;
    if (metrics_days !== undefined) flattened.retention_metrics_days = metrics_days;
  }

  [
    'maintenance_mode',
    'max_concurrent_scans',
    'auto_discovery_enabled',
    'alert_integration_enabled',
    'retention_events_days',
    'retention_logs_days',
    'retention_metrics_days'
  ].forEach((key) => {
    if (flattened[key] !== undefined) {
      systemSettings[key] = flattened[key];
    }
  });

  systemSettings.updated_by = currentUser.user_id;
  systemSettings.updated_at = toISO(new Date());
  res.json(systemSettings);
});

app.get('/admin/diagnostics', (req, res) => {
  res.json(systemDiagnostics);
});

app.get('/admin/diagnostics/health', (req, res) => {
  res.json(systemHealth);
});

// Resource batch operations
app.post('/resources/batch', (req, res) => {
  const { action, resource_ids, status, team_id, tags, reason } = req.body;
  const batchId = `batch-${Date.now()}`;

  batchOperations.set(batchId, {
    batch_id: batchId,
    status: 'pending',
    total_count: resource_ids.length,
    processed_count: 0,
    success_count: 0,
    failed_count: 0,
    results: [],
    created_at: toISO(new Date()),
    completed_at: null
  });

  // Simulate async processing
  setTimeout(() => {
    const operation = batchOperations.get(batchId);
    if (operation) {
      operation.status = 'completed';
      operation.completed_at = toISO(new Date());

      // Mock results
      operation.results = resource_ids.map((id) => {
        const success = Math.random() > 0.1;
        return {
          resource_id: id,
          success,
          message: success ? '操作已完成' : '操作失敗，請檢查資源狀態',
          error: success ? null : 'Resource not found'
        };
      });

      operation.processed_count = operation.results.length;
      operation.success_count = operation.results.filter((result) => result.success).length;
      operation.failed_count = operation.results.filter((result) => !result.success).length;

      batchOperations.set(batchId, operation);
    }
  }, 2000);

  res.status(202).json({
    batch_id: batchId,
    status: 'pending',
    total_count: resource_ids.length,
    processed_count: 0,
    success_count: 0,
    failed_count: 0,
    results: [],
    created_at: toISO(new Date())
  });
});

// Resource scanning
app.post('/resources/scan', (req, res) => {
  const { scan_type, target, options = {} } = req.body;
  const taskId = `scan-${Date.now()}`;

  scanTasks.set(taskId, {
    task_id: taskId,
    status: 'pending',
    scan_type,
    target,
    progress: 0,
    results_count: 0,
    created_at: toISO(new Date()),
    started_at: null,
    completed_at: null,
    results: []
  });

  // Simulate async scanning
  setTimeout(() => {
    const task = scanTasks.get(taskId);
    if (task) {
      task.status = 'running';
      task.started_at = toISO(new Date());
      scanTasks.set(taskId, task);
    }
  }, 1000);

  setTimeout(() => {
    const task = scanTasks.get(taskId);
    if (task) {
      task.status = 'completed';
      task.progress = 100;
      task.completed_at = toISO(new Date());
      task.results = [
        {
          resource_id: `res-${Date.now()}`,
          name: 'Discovered Server',
          type: 'server',
          status: 'healthy',
          ip_address: '192.168.1.100',
          location: 'Data Center A',
          discovered_at: toISO(new Date()),
          services: [
            {
              port: 22,
              protocol: 'tcp',
              service: 'ssh',
              version: 'OpenSSH 8.9'
            },
            {
              port: 80,
              protocol: 'tcp',
              service: 'http',
              version: 'nginx/1.21.6'
            }
          ]
        }
      ];
      task.results_count = task.results.length;
      scanTasks.set(taskId, task);
    }
  }, 5000);

  res.status(202).json({
    task_id: taskId,
    status: 'pending',
    scan_type,
    target,
    created_at: toISO(new Date())
  });
});

app.get('/resources/scan/:task_id', (req, res) => {
  const task = scanTasks.get(req.params.task_id);
  if (!task) {
    return notFound(res, 'Scan task not found');
  }
  res.json(task);
});

// Grafana Dashboard URL generation
const grafanaBaseUrl = process.env.GRAFANA_URL || 'http://localhost:3000';
const grafanaServiceAccountToken = process.env.GRAFANA_SERVICE_ACCOUNT_TOKEN || 'eyJrIjoiM2R6MzB5VzF5ZGdZWnR3Z3h5dE5oRmJ6d1h5V1VnT2t2MnciLCJuIjoiU1JFUGxhdGZvcm0iLCJpZCI6MX0=';

app.get('/dashboards/:dashboard_id/grafana-url', (req, res) => {
  const { dashboard_id } = req.params;
  const { theme, kiosk, refresh } = req.query;

  // Mock dashboard mapping (in real implementation, this would be stored in database)
  const grafanaDashboardMap = {
    'dash-001': 'sre-war-room', // SRE 戰情室
    'dash-002': 'infrastructure-insight', // 基礎設施洞察
    'dash-003': 'capacity-planning' // 容量規劃
  };

  const grafanaDashboardId = grafanaDashboardMap[dashboard_id];
  if (!grafanaDashboardId) {
    return notFound(res, 'Dashboard not found or not configured for Grafana embedding');
  }

  // Generate temporary access token (mock implementation)
  const now = new Date();
  const expiresAt = new Date(now.getTime() + 60 * 60 * 1000); // 1 hour from now
  const tempToken = `temp-token-${Date.now()}`;

  // Build Grafana URL with parameters
  let embedUrl = `${grafanaBaseUrl}/d/${grafanaDashboardId}?orgId=1`;

  if (theme) embedUrl += `&theme=${theme}`;
  if (kiosk) embedUrl += '&kiosk=true';
  if (refresh) embedUrl += `&refresh=${refresh}s`;

  // Add authentication token
  embedUrl += `&authToken=${grafanaServiceAccountToken}`;

  const response = {
    url: `${grafanaBaseUrl}/d/${grafanaDashboardId}`,
    embed_url: embedUrl,
    expires_at: toISO(expiresAt),
    parameters: {
      theme: theme || 'light',
      kiosk: Boolean(kiosk),
      refresh: parseInt(refresh, 10) || null
    }
  };

  res.json(response);
});

app.post('/settings/auth/test', (req, res) => {
  const executedAt = toISO(new Date());
  const asyncMode = Boolean(req.body?.async);
  const warnings = [];
  if (!req.body?.test_username) {
    warnings.push('未提供測試帳號，僅驗證 OIDC 端點可用性。');
  }
  const payload = {
    status: asyncMode ? 'queued' : 'success',
    executed_at: executedAt,
    latency_ms: 128,
    message: asyncMode
      ? '已排入背景測試工作，完成後將以通知告知結果。'
      : '身份驗證設定測試成功，能夠取得 access token。',
    warnings,
    trace_id: `oidc-test-${Date.now()}`
  };
  res.status(asyncMode ? 202 : 200).json(payload);
});
app.listen(PORT, () => {
  console.log(`Mock server listening on http://localhost:${PORT}`);
});
