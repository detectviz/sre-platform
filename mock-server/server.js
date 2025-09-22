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
    silence_type: 'recurring',
    scope: 'resource',
    enabled: true,
    created_at: toISO(new Date(now.getTime() - 86400000 * 5)),
    schedule: {
      silence_type: 'recurring',
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
    team: 'sre-core',
    os: 'Ubuntu 22.04',
    cpu_usage: 72.4,
    memory_usage: 68.1,
    disk_usage: 55.3,
    network_in_mbps: 125.4,
    network_out_mbps: 118.2,
    service_impact: '交易 API',
    last_event_count: 3,
    tags: ['production', 'web'],
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
    team: 'db-team',
    os: 'Amazon Linux 2023',
    cpu_usage: 64.8,
    memory_usage: 71.2,
    disk_usage: 62.7,
    network_in_mbps: 95.1,
    network_out_mbps: 90.4,
    service_impact: '讀取節點',
    last_event_count: 2,
    tags: ['database', 'production'],
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
    owner_team: 'sre-core',
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

const dashboards = [
  {
    dashboard_id: 'dash-001',
    name: 'SRE 戰情室儀表板',
    category: '精選',
    owner: '事件指揮中心',
    owner_id: 'team-war-room',
    description: '跨團隊即時戰情看板，聚焦重大事件與 SLA 指標。',
    featured: true,
    published: true,
    views: 345,
    favorites: 58,
    is_default: true,
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
  }
];

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
  }
];

const iamTeams = [
  {
    team_id: 'team-sre',
    name: 'SRE 核心小組',
    description: '負責平台可靠性維運',
    owner: 'user-001',
    members: 8,
    subscribers: 12,
    created_at: toISO(new Date(now.getTime() - 2592000000)),
    member_ids: ['user-001', 'user-002'],
    subscriber_ids: ['user-003', 'user-004']
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
    type: 'slack',
    status: 'active',
    description: 'SRE 團隊 Slack 頻道',
    config: { webhook_url: 'https://hooks.slack.com/...', default_channel: '#sre-alert' },
    updated_at: toISO(new Date(now.getTime() - 3600000)),
    last_tested_at: toISO(new Date(now.getTime() - 7200000))
  },
  {
    channel_id: 'chn-002',
    name: 'Email oncall',
    type: 'email',
    status: 'active',
    description: 'On-call 信箱',
    config: { from: 'noreply@example.com' },
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
      { channel_id: 'chn-001', channel_type: 'slack', template: 'critical-alert' },
      { channel_id: 'chn-002', channel_type: 'email', template: 'default' }
    ],
    resource_filters: {},
    created_at: toISO(new Date(now.getTime() - 259200000)),
    updated_at: toISO(new Date(now.getTime() - 86400000))
  }
];

const notificationHistory = [
  {
    record_id: 'hist-001',
    sent_time: toISO(new Date(now.getTime() - 3600000)),
    strategy_name: 'Critical 事件通知',
    channel_type: 'slack',
    recipients: ['#sre-alert'],
    status: 'success',
    duration_ms: 1200,
    payload: { event_id: 'evt-001' },
    attempts: [
      { sent_at: toISO(new Date(now.getTime() - 3600000)), status: 'success', response: '200 OK' }
    ],
    error_message: null,
    related_event_id: 'evt-001'
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
      { value_id: 'tag-001-v1', value: 'production', description: '正式環境', is_default: true },
      { value_id: 'tag-001-v2', value: 'staging', description: '預備環境', is_default: false }
    ]
  }
];

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

const mapEventSummary = (event) => ({
  event_id: event.event_id,
  event_key: event.event_key,
  summary: event.summary,
  description: event.description,
  severity: event.severity,
  status: event.status,
  resource_id: event.resource_id,
  resource_name: event.resource_name,
  service_impact: event.service_impact,
  rule_name: event.rule_name,
  trigger_threshold: event.trigger_threshold,
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
  automation_actions: event.analysis ? ['scale-out'] : [],
  analysis: event.analysis
});

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

app.post('/events', (req, res) => {
  const payload = req.body || {};
  const newEvent = {
    event_id: `evt-${Date.now()}`,
    event_key: payload.event_key || `INC-${Date.now()}`,
    summary: payload.summary || '新事件',
    description: payload.description || '',
    severity: payload.severity || 'warning',
    status: payload.status || 'new',
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
    acknowledged_at: null,
    resolved_at: null,
    tags: payload.tags || [],
    timeline: [],
    related: [],
    analysis: null
  };
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
  res.json(toEventDetail(event));
});

app.delete('/events/:event_id', (req, res) => {
  const event = getEventById(req.params.event_id);
  if (!event) return notFound(res, '找不到事件');
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
  const entry = {
    entry_id: `evt-${req.params.event_id}-tl-${Date.now()}`,
    event_id: req.params.event_id,
    entry_type: req.body?.entry_type || 'note',
    message: req.body?.message || '更新備註',
    created_by: req.body?.created_by || currentUser.display_name,
    created_at: toISO(new Date()),
    metadata: req.body?.metadata || {}
  };
  event.timeline = event.timeline || [];
  event.timeline.push(entry);
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
  event.status = 'acknowledged';
  event.assignee_id = req.body?.assignee_id || currentUser.user_id;
  event.assignee = iamUsers.find((u) => u.user_id === event.assignee_id)?.name || currentUser.display_name;
  event.acknowledged_at = toISO(new Date());
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
    os: resItem.os,
    cpu_usage: resItem.cpu_usage,
    memory_usage: resItem.memory_usage,
    disk_usage: resItem.disk_usage,
    network_in_mbps: resItem.network_in_mbps,
    network_out_mbps: resItem.network_out_mbps,
    tags: resItem.tags,
    last_event_count: resItem.last_event_count
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
    team: payload.team || null,
    os: payload.os || 'Linux',
    cpu_usage: 0,
    memory_usage: 0,
    disk_usage: 0,
    network_in_mbps: 0,
    network_out_mbps: 0,
    service_impact: payload.service_impact || null,
    last_event_count: 0,
    tags: payload.labels || [],
    groups: [],
    created_at: toISO(new Date()),
    updated_at: toISO(new Date())
  };
  res.status(201).json(resource);
});

app.get('/resources/:resource_id', (req, res) => {
  const resource = getResourceById(req.params.resource_id);
  if (!resource) return notFound(res, '找不到資源');
  res.json(resource);
});

app.patch('/resources/:resource_id', (req, res) => {
  const resource = getResourceById(req.params.resource_id);
  if (!resource) return notFound(res, '找不到資源');
  Object.assign(resource, req.body || {}, { updated_at: toISO(new Date()) });
  res.json(resource);
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
    owner_team: payload.owner_team || null,
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
  Object.assign(group, req.body || {}, { updated_at: toISO(new Date()) });
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
  const published = dashboards.filter((dash) => dash.published).length;
  const featured = dashboards.filter((dash) => dash.featured).length;
  const automated = 1;
  res.json({ total: dashboards.length, published, featured, automated });
});

app.get('/dashboards', (req, res) => {
  res.json(paginate(dashboards.map((dash) => ({
    dashboard_id: dash.dashboard_id,
    name: dash.name,
    category: dash.category,
    owner: dash.owner,
    featured: dash.featured,
    published: dash.published,
    views: dash.views,
    favorites: dash.favorites,
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
    featured: false,
    published: false,
    views: 0,
    favorites: 0,
    is_default: false,
    published_at: null,
    updated_at: toISO(new Date()),
    layout: payload.layout || [],
    kpis: payload.kpis || []
  };
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
  dash.published = req.body?.published ?? !dash.published;
  dash.published_at = dash.published ? toISO(new Date()) : null;
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

app.get('/iam/users', (req, res) => {
  res.json(paginate(iamUsers, req));
});

app.post('/iam/users', (req, res) => {
  const payload = req.body || {};
  const user = {
    user_id: `user-${Date.now()}`,
    username: payload.username || 'new.user',
    name: payload.name || '新成員',
    email: payload.email || 'new.user@example.com',
    status: payload.status || 'active',
    teams: payload.team_ids || [],
    roles: payload.role_ids || [],
    last_login: null
  };
  res.status(201).json(user);
});

app.get('/iam/users/:user_id', (req, res) => {
  const user = getIamUserById(req.params.user_id);
  if (!user) return notFound(res, '找不到人員');
  res.json(user);
});

app.patch('/iam/users/:user_id', (req, res) => {
  const user = getIamUserById(req.params.user_id);
  if (!user) return notFound(res, '找不到人員');
  Object.assign(user, req.body || {});
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
  const team = {
    team_id: `team-${Date.now()}`,
    name: payload.name || '新團隊',
    description: payload.description || '',
    owner: payload.owner_id || currentUser.user_id,
    members: payload.member_ids ? payload.member_ids.length : 0,
    subscribers: payload.subscriber_ids ? payload.subscriber_ids.length : 0,
    created_at: toISO(new Date()),
    member_ids: payload.member_ids || [],
    subscriber_ids: payload.subscriber_ids || []
  };
  res.status(201).json(team);
});

app.get('/iam/teams/:team_id', (req, res) => {
  const team = getTeamById(req.params.team_id);
  if (!team) return notFound(res, '找不到團隊');
  res.json(team);
});

app.patch('/iam/teams/:team_id', (req, res) => {
  const team = getTeamById(req.params.team_id);
  if (!team) return notFound(res, '找不到團隊');
  Object.assign(team, req.body || {});
  res.json(team);
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
    status: channel.status,
    updated_at: channel.updated_at
  })));
});

app.post('/notification/channels', (req, res) => {
  const payload = req.body || {};
  const channel = {
    channel_id: `chn-${Date.now()}`,
    name: payload.name || '新管道',
    type: payload.type || 'email',
    status: payload.status || 'active',
    description: payload.description || '',
    config: payload.config || {},
    updated_at: toISO(new Date()),
    last_tested_at: null
  };
  res.status(201).json(channel);
});

app.post('/notification/channels/:channel_id/test', (req, res) => {
  const channel = getNotificationChannelById(req.params.channel_id);
  if (!channel) return notFound(res, '找不到通知管道');
  channel.last_tested_at = toISO(new Date());
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
  res.json(paginate(notificationHistory, req));
});

app.get('/notification/history/:record_id', (req, res) => {
  const record = getHistoryById(req.params.record_id);
  if (!record) return notFound(res, '找不到通知紀錄');
  res.json(record);
});

app.get('/settings/tags', (req, res) => {
  res.json(tagDefinitions.map((tag) => ({
    tag_id: tag.tag_id,
    name: tag.name,
    category: tag.category,
    required: tag.required,
    usage_count: tag.usage_count
  })));
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
    is_default: req.body?.is_default ?? false
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

app.get('/settings/email', (req, res) => res.json(emailSettings));

app.put('/settings/email', (req, res) => {
  Object.assign(emailSettings, req.body || {}, { updated_at: toISO(new Date()) });
  res.json(emailSettings);
});

app.get('/settings/auth', (req, res) => res.json(authSettings));

app.put('/settings/auth', (req, res) => {
  Object.assign(authSettings, req.body || {}, { updated_at: toISO(new Date()) });
  res.json(authSettings);
});
app.listen(PORT, () => {
  console.log(`Mock server listening on http://localhost:${PORT}`);
});
