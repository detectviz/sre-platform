const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 4000;
const toISO = (value) => new Date(value).toISOString();
const toCsv = (records, columns) => {
  const header = columns.map((col) => col.header || col.key).join(',');
  const rows = records.map((record) =>
    columns
      .map((col) => {
        const rawValue = typeof col.value === 'function' ? col.value(record) : record[col.key];
        if (rawValue === undefined || rawValue === null) {
          return '';
        }
        const cell = String(rawValue);
        const needsEscape = /[",\r\n]/.test(cell);
        return needsEscape ? `"${cell.replace(/"/g, '""')}"` : cell;
      })
      .join(',')
  );
  return [header, ...rows].join('\n');
};
const normalizeResourceFilters = (filters) => {
  if (!Array.isArray(filters)) return [];
  return filters
    .map((filter) => {
      if (!filter || typeof filter !== 'object') return null;
      const values = Array.isArray(filter.values)
        ? filter.values.filter((value) => value !== null && value !== undefined && value !== '')
        : [];
      return {
        type: filter.type || 'tag',
        key: filter.key || '',
        operator: filter.operator || 'equals',
        value: filter.value ?? null,
        values
      };
    })
    .filter(Boolean);
};
const deriveTargetSummary = (filters) => {
  if (!Array.isArray(filters) || filters.length === 0) {
    return '全部資源';
  }
  const summary = filters
    .map((filter) => {
      const joinedValues = filter.values && filter.values.length > 0 ? filter.values.join('、') : filter.value ?? '';
      if (filter.type === 'tag') {
        return joinedValues ? `${filter.key}:${joinedValues}` : filter.key;
      }
      if (filter.type === 'resource') {
        return `資源:${joinedValues || filter.key}`;
      }
      if (filter.type === 'resource_group') {
        return `資源群組:${joinedValues || filter.key}`;
      }
      if (filter.type === 'service') {
        return `服務:${joinedValues || filter.key}`;
      }
      return `${filter.key} ${filter.operator} ${joinedValues}`.trim();
    })
    .filter((token) => token && token.length > 0)
    .join('；');
  return summary || '全部資源';
};
const buildEventRule = (rule) => {
  const normalizedFilters = normalizeResourceFilters(rule.resource_filters || []);
  const automation =
    rule.automation && typeof rule.automation === 'object'
      ? {
        enabled: Boolean(rule.automation.enabled),
        script_id: rule.automation.script_id || null,
        parameters: rule.automation.parameters || {}
      }
      : { enabled: false, script_id: null, parameters: {} };
  const automationEnabled =
    typeof rule.automation_enabled === 'boolean' ? rule.automation_enabled : automation.enabled;
  return {
    ...rule,
    resource_filters: normalizedFilters,
    target: rule.target || deriveTargetSummary(normalizedFilters),
    automation,
    automation_enabled: automationEnabled
  };
};
const now = new Date();

const currentUser = {
  user_id: 'user-001',
  username: 'sre.lead',
  display_name: '林佳瑜',
  email: 'sre.lead@example.com',
  roles: [
    { role_id: 'role-sre', name: 'sre' },
    { role_id: 'role-incident-commander', name: 'incident-commander' }
  ],
  teams: [
    { team_id: 'team-sre', name: 'SRE 核心小組' }
  ],
  status: 'active',
  last_login_at: toISO(now),
  avatar_url: null
};

const userPreferences = {
  theme: 'auto',
  default_landing: {
    type: 'dashboard',
    dashboard_id: 'dash-001',
    dashboard_name: 'SRE 戰情室儀表板',
    dashboard_type: 'built_in'
  },
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
  },
  dashboard_preferences: {
    auto_refresh_interval_seconds: 300,
    auto_save_layout: true
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
    deleted_at: null,
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
    deleted_at: null,
    link_url: '/analysis/capacity',
    actions: ['open-report']
  }
];

const buildNotificationSummary = () => {
  const activeNotifications = notifications.filter((item) => !item.deleted_at);
  const total = activeNotifications.length;
  const unread = activeNotifications.filter((item) => item.status === 'unread').length;
  const bySeverity = activeNotifications.reduce((acc, item) => {
    acc[item.severity] = (acc[item.severity] || 0) + 1;
    return acc;
  }, {});
  return { total, unread, by_severity: bySeverity, last_updated_at: toISO(new Date()) };
};

const eventData = [
  {
    event_id: 'evt-001',
    event_key: 'INC-2025-001',
    summary: 'API 延遲飆高',
    description: '交易 API P95 延遲持續高於 500ms。',
    event_source: 'grafana_webhook',
    source: 'Grafana Alerting',
    severity: 'critical',
    status: 'in_progress',
    priority: 'P0',
    resource_id: 'res-001',
    resource_name: 'web-01',
    service_impact: '客戶交易延遲，SLA 風險升高',
    notes: '已請 DBA 團隊協助檢查資料庫連線瓶頸。',
    rule_uid: 'rule-001',
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
    event_source: 'grafana_webhook',
    source: 'Grafana Alerting',
    severity: 'warning',
    status: 'acknowledged',
    priority: 'P2',
    resource_id: 'res-002',
    resource_name: 'rds-read-1',
    service_impact: '延遲影響讀取性能',
    notes: '持續觀察，必要時安排離峰期間調整參數。',
    rule_uid: 'rule-002',
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

const eventRuleTemplates = [
  {
    template_key: 'cpu_high',
    name: 'CPU 使用率過高',
    description: '當 CPU 使用率持續高於 80% 時觸發告警。',
    severity: 'warning',
    default_priority: 'P1',
    labels: ['tier:compute'],
    environments: ['production'],
    default_target_summary: 'tier:compute',
    default_resource_filters: [
      { type: 'tag', key: 'tier', operator: 'equals', value: 'compute' }
    ],
    condition_groups: [
      {
        logic: 'AND',
        conditions: [
          { metric: 'cpu.utilization', operator: '>', threshold: 80, duration_minutes: 5, severity: 'warning' }
        ]
      }
    ],
    title_template: '{{resource.name}} CPU 使用率告警',
    content_template: '{{metric.name}} 已持續 {{duration}} 分鐘超過 {{threshold}}%。',
    suggested_script_id: 'script-002'
  },
  {
    template_key: 'memory_pressure',
    name: '記憶體使用率過高',
    description: '記憶體使用率超過 85% 以上並持續一段時間。',
    severity: 'warning',
    default_priority: 'P2',
    labels: ['tier:frontend'],
    environments: ['production', 'staging'],
    default_target_summary: 'tier:frontend',
    default_resource_filters: [
      { type: 'tag', key: 'tier', operator: 'equals', value: 'frontend' }
    ],
    condition_groups: [
      {
        logic: 'AND',
        conditions: [
          { metric: 'memory.utilization', operator: '>', threshold: 85, duration_minutes: 10, severity: 'warning' }
        ]
      }
    ],
    title_template: '{{resource.name}} 記憶體壓力升高',
    content_template: '記憶體使用率為 {{metric.value}}%，已超過 {{threshold}}% 門檻。'
  },
  {
    template_key: 'disk_capacity',
    name: '磁碟容量不足',
    description: '磁碟使用率超過 90% 時提醒容量不足。',
    severity: 'warning',
    default_priority: 'P1',
    labels: ['tier:storage'],
    environments: ['production'],
    default_target_summary: 'tier:storage',
    default_resource_filters: [
      { type: 'tag', key: 'tier', operator: 'equals', value: 'storage' }
    ],
    condition_groups: [
      {
        logic: 'AND',
        conditions: [
          { metric: 'disk.utilization', operator: '>', threshold: 90, duration_minutes: 15, severity: 'warning' }
        ]
      }
    ],
    title_template: '{{resource.name}} 磁碟容量警示',
    content_template: '磁碟使用率為 {{metric.value}}%，請評估擴容或清理。'
  },
  {
    template_key: 'db_latency',
    name: '資料庫延遲異常',
    description: '偵測資料庫讀寫延遲飆升的情境。',
    severity: 'critical',
    default_priority: 'P0',
    labels: ['tier:db'],
    environments: ['production'],
    default_target_summary: 'tier:db',
    default_resource_filters: [
      { type: 'tag', key: 'tier', operator: 'equals', value: 'db' }
    ],
    condition_groups: [
      {
        logic: 'AND',
        conditions: [
          { metric: 'db.read_latency', operator: '>', threshold: 200, duration_minutes: 5, severity: 'critical' }
        ]
      }
    ],
    title_template: '{{resource.name}} 延遲異常',
    content_template: '目前讀取延遲 {{metric.value}}ms，超過閾值 {{threshold}}ms。',
    suggested_script_id: 'script-001'
  },
  {
    template_key: 'api_latency',
    name: 'API 延遲異常',
    description: 'API 回應時間過長時通知應用團隊。',
    severity: 'critical',
    default_priority: 'P0',
    labels: ['app:web'],
    environments: ['production'],
    default_target_summary: 'app:web',
    default_resource_filters: [
      { type: 'tag', key: 'app', operator: 'equals', value: 'web' }
    ],
    condition_groups: [
      {
        logic: 'AND',
        conditions: [
          { metric: 'api.p95_latency', operator: '>', threshold: 500, duration_minutes: 5, severity: 'critical' }
        ]
      }
    ],
    title_template: '{{service.name}} 延遲異常',
    content_template: 'API 延遲 {{metric.value}}ms，超過 {{threshold}}ms 門檻。',
    suggested_script_id: 'script-001'
  }
];

const eventRules = [
  buildEventRule({
    rule_uid: 'rule-001',
    name: 'API 延遲監控',
    description: '監控交易 API 延遲，超過閾值即觸發事件。',
    severity: 'critical',
    default_priority: 'P0',
    enabled: true,
    automation_enabled: true,
    template_key: 'api_latency',
    creator: '林佳瑜',
    last_updated: toISO(new Date(now.getTime() - 86400000)),
    last_synced_at: toISO(new Date(now.getTime() - 600000)),
    sync_status: 'fresh',
    labels: ['app:web'],
    environments: ['production'],
    resource_filters: [
      { type: 'tag', key: 'app', operator: 'equals', value: 'web' },
      { type: 'tag', key: 'env', operator: 'equals', value: 'production' }
    ],
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
  }),
  buildEventRule({
    rule_uid: 'rule-002',
    name: '資料庫延遲監控',
    description: '觀察資料庫連線與查詢延遲。',
    severity: 'warning',
    default_priority: 'P2',
    enabled: true,
    automation_enabled: false,
    template_key: 'db_latency',
    creator: '林佳瑜',
    last_updated: toISO(new Date(now.getTime() - 172800000)),
    last_synced_at: toISO(new Date(now.getTime() - 3600000)),
    sync_status: 'stale',
    labels: ['tier:db'],
    environments: ['production'],
    resource_filters: [
      { type: 'tag', key: 'tier', operator: 'equals', value: 'db' },
      { type: 'tag', key: 'env', operator: 'equals', value: 'production' }
    ],
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
  })
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
      { tag_id: 'tag-001', tag_value_id: 'tag-001-v1', key: 'env', value: 'production', assigned_at: toISO(new Date(now.getTime() - 172800000)) },
      { tag_id: 'tag-002', tag_value_id: 'tag-002-v1', key: 'tier', value: 'frontend', assigned_at: toISO(new Date(now.getTime() - 86400000)) }
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
      { tag_id: 'tag-001', tag_value_id: 'tag-001-v1', key: 'env', value: 'production', assigned_at: toISO(new Date(now.getTime() - 604800000)) },
      { tag_id: 'tag-003', tag_value_id: 'tag-003-v1', key: 'role', value: 'read-replica', assigned_at: toISO(new Date(now.getTime() - 259200000)) }
    ],
    groups: ['grp-002'],
    created_at: toISO(new Date(now.getTime() - 2592000000)),
    updated_at: toISO(now)
  },
  {
    resource_id: 'res-003',
    name: 'redis-cache',
    status: 'healthy',
    type: 'cache',
    ip_address: '10.10.5.45',
    location: 'ap-southeast-1c',
    environment: 'staging',
    team_id: 'team-sre',
    team: 'SRE 核心小組',
    os: 'Debian 12',
    cpu_usage: 39.5,
    memory_usage: 54.2,
    disk_usage: 33.1,
    network_in_mbps: 45.3,
    network_out_mbps: 40.8,
    service_impact: '快取層',
    notes: '提供 Web 交易熱資料快取。',
    last_event_count: 1,
    tags: [
      { tag_id: 'tag-001', tag_value_id: 'tag-001-v2', key: 'env', value: 'staging', assigned_at: toISO(new Date(now.getTime() - 432000000)) },
      { tag_id: 'tag-003', tag_value_id: 'tag-003-v2', key: 'role', value: 'cache', assigned_at: toISO(new Date(now.getTime() - 216000000)) }
    ],
    groups: ['grp-001'],
    created_at: toISO(new Date(now.getTime() - 1209600000)),
    updated_at: toISO(new Date(now.getTime() - 1800000))
  }
];

const resourceGroups = [
  {
    group_id: 'grp-001',
    name: '交易前台集群',
    description: 'Web 與 API 節點',
    owner_team_id: 'team-sre',
    owner_team: 'SRE 核心小組',
    member_count: 2,
    subscriber_count: 4,
    status_summary: { healthy: 1, warning: 1, critical: 0 },
    created_at: toISO(new Date(now.getTime() - 777600000)),
    members: [
      { resource_id: 'res-001', name: 'web-01', type: 'service', status: 'warning' },
      { resource_id: 'res-003', name: 'redis-cache', type: 'cache', status: 'healthy' }
    ],
    subscribers: [
      { user_id: 'user-001', display_name: '林佳瑜', subscribed_at: toISO(new Date(now.getTime() - 604800000)) },
      { user_id: 'user-002', display_name: '張宥誠', subscribed_at: toISO(new Date(now.getTime() - 302400000)) },
      { user_id: 'user-003', display_name: '陳昱安', subscribed_at: toISO(new Date(now.getTime() - 86400000)) },
      { user_id: 'user-004', display_name: '游佩珊', subscribed_at: toISO(new Date(now.getTime() - 43200000)) }
    ]
  },
  {
    group_id: 'grp-002',
    name: '交易資料庫集群',
    description: '主從資料庫節點',
    owner_team_id: 'team-db',
    owner_team: '資料庫團隊',
    member_count: 1,
    subscriber_count: 2,
    status_summary: { healthy: 0, warning: 1, critical: 0 },
    created_at: toISO(new Date(now.getTime() - 1036800000)),
    members: [
      { resource_id: 'res-002', name: 'rds-read-1', type: 'database', status: 'warning' }
    ],
    subscribers: [
      { user_id: 'user-003', display_name: '陳昱安', subscribed_at: toISO(new Date(now.getTime() - 259200000)) },
      { user_id: 'user-001', display_name: '林佳瑜', subscribed_at: toISO(new Date(now.getTime() - 172800000)) }
    ]
  }
];

const topologyConfig = {
  nodes: [
    { resource_id: 'res-001', icon: 'service', metrics: { cpu: 72, latency_ms: 820 } },
    { resource_id: 'res-002', icon: 'database', metrics: { latency_ms: 210, connections: 342 } },
    { resource_id: 'res-003', icon: 'cache', metrics: { hit_rate: 0.98, memory_usage: 54 } }
  ],
  edges: [
    { source: 'res-001', target: 'res-002', relation: 'reads-from', traffic_level: 320, status: 'warning' },
    { source: 'res-001', target: 'res-003', relation: 'cache', traffic_level: 210, status: 'healthy' }
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
  avg_utilization: 68.2,
  peak_usage: 91.4,
  headroom: 18.6,
  forecast_horizon_days: 30,
  processing_time_ms: 2350,
  accuracy: 0.978
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

const buildCapacityAnalysisReport = ({ timeRange, model } = {}) => {
  const resolvedTimeRange = typeof timeRange === 'string' && timeRange.trim().length > 0 ? timeRange.trim() : '30d';
  const resolvedModel = typeof model === 'string' && model.trim().length > 0 ? model.trim() : 'prophet';
  return {
    report_id: `capacity-${resolvedTimeRange}-${resolvedModel}`,
    generated_at: toISO(new Date()),
    time_range: resolvedTimeRange,
    model: resolvedModel,
    summary: { ...capacitySummary },
    forecasts: capacityForecasts.map((forecast) => ({
      ...forecast,
      series: Array.isArray(forecast.series) ? forecast.series.map((point) => ({ ...point })) : [],
      best_case: Array.isArray(forecast.best_case) ? forecast.best_case.map((point) => ({ ...point })) : [],
      worst_case: Array.isArray(forecast.worst_case) ? forecast.worst_case.map((point) => ({ ...point })) : []
    })),
    suggestions: capacitySuggestions.map((item) => ({ ...item }))
  };
};

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
    tags: ['autoscale', 'web'],
    last_execution_status: 'success',
    last_execution_at: toISO(new Date(now.getTime() - 3600000)),
    created_at: toISO(new Date(now.getTime() - 86400000 * 14)),
    created_by: 'user-001',
    updated_at: toISO(new Date(now.getTime() - 3600000)),
    updated_by: 'user-001',
    versions: [
      {
        version_id: 'ver-001',
        version: 'v3',
        changelog: '新增區域容錯',
        created_at: toISO(new Date(now.getTime() - 86400000)),
        created_by: 'user-001',
        content: '#!/bin/bash\\necho "scale"'
      },
      {
        version_id: 'ver-002',
        version: 'v2',
        changelog: '最佳化重試機制',
        created_at: toISO(new Date(now.getTime() - 604800000)),
        created_by: 'user-001',
        content: '#!/bin/bash\\necho "scale --retry"'
      }
    ]
  }
];
automationScripts.forEach((script) => {
  // 以第一筆版本作為目前版本
  // 深拷貝以避免在後續更新時直接修改歷史版本內容
  if (Array.isArray(script.versions) && script.versions.length > 0) {
    const [latest] = script.versions;
    script.current_version = { ...latest };
  } else {
    script.current_version = null;
  }
});

const summarizeScriptVersion = (version, includeContent = false) => {
  if (!version) return null;
  const summary = {
    version_id: version.version_id,
    version: version.version,
    changelog: version.changelog || null,
    created_at: version.created_at,
    created_by: version.created_by || null
  };
  if (includeContent && Object.prototype.hasOwnProperty.call(version, 'content')) {
    summary.content = version.content;
  }
  return summary;
};

const toScriptSummary = (script) => ({
  script_id: script.script_id,
  name: script.name,
  type: script.type,
  description: script.description,
  tags: Array.isArray(script.tags) ? [...script.tags] : [],
  last_execution_status: script.last_execution_status,
  last_execution_at: script.last_execution_at,
  updated_at: script.updated_at || script.created_at,
  current_version: summarizeScriptVersion(script.current_version)
});

const toScriptDetail = (script) => ({
  ...toScriptSummary(script),
  versions: Array.isArray(script.versions)
    ? script.versions.map((version) => summarizeScriptVersion(version))
    : [],
  current_version: summarizeScriptVersion(script.current_version, true)
});

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
    display_name: '林佳瑜',
    email: 'sre.lead@example.com',
    status: 'active',
    teams: ['sre-core'],
    roles: ['sre', 'incident-commander'],
    last_login: toISO(now),
    created_at: toISO(new Date(now.getTime() - 120 * 86400000)),
    updated_at: toISO(new Date(now.getTime() - 3600000))
  },
  {
    user_id: 'user-002',
    username: 'ops.chen',
    display_name: '陳昱安',
    email: 'ops.chen@example.com',
    status: 'active',
    teams: ['ops'],
    roles: ['ops'],
    last_login: toISO(new Date(now.getTime() - 7200000)),
    created_at: toISO(new Date(now.getTime() - 200 * 86400000)),
    updated_at: toISO(new Date(now.getTime() - 7200000))
  },
  {
    user_id: 'user-003',
    username: 'db.tsai',
    display_name: '蔡敏豪',
    email: 'db.tsai@example.com',
    status: 'active',
    teams: ['team-db'],
    roles: ['db-admin'],
    last_login: toISO(new Date(now.getTime() - 14400000)),
    created_at: toISO(new Date(now.getTime() - 220 * 86400000)),
    updated_at: toISO(new Date(now.getTime() - 14400000))
  }
];

const iamInvitations = [
  {
    invitation_id: 'inv-001',
    email: 'new.engineer@example.com',
    name: '李佳蓉',
    status: 'invitation_sent',
    invited_by: 'user-001',
    invited_by_name: '林佳瑜',
    invited_at: toISO(new Date(now.getTime() - 2 * 86400000)),
    last_sent_at: toISO(new Date(now.getTime() - 2 * 86400000)),
    expires_at: toISO(new Date(now.getTime() + 5 * 86400000)),
    accepted_at: null
  },
  {
    invitation_id: 'inv-002',
    email: 'contractor@example.com',
    name: '周文俊',
    status: 'expired',
    invited_by: 'user-002',
    invited_by_name: '陳昱安',
    invited_at: toISO(new Date(now.getTime() - 14 * 86400000)),
    last_sent_at: toISO(new Date(now.getTime() - 13 * 86400000)),
    expires_at: toISO(new Date(now.getTime() - 7 * 86400000)),
    accepted_at: null
  },
  {
    invitation_id: 'inv-003',
    email: 'observer@example.com',
    name: '吳映潔',
    status: 'accepted',
    invited_by: 'user-001',
    invited_by_name: '林佳瑜',
    invited_at: toISO(new Date(now.getTime() - 30 * 86400000)),
    last_sent_at: toISO(new Date(now.getTime() - 30 * 86400000)),
    expires_at: toISO(new Date(now.getTime() - 23 * 86400000)),
    accepted_at: toISO(new Date(now.getTime() - 22 * 86400000))
  }
];

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
  },
  {
    role_id: 'role-incident-commander',
    name: 'incident-commander',
    description: '事件指揮官權限',
    status: 'active',
    user_count: 2,
    created_at: toISO(new Date(now.getTime() - 1296000000)),
    permissions: [
      { module: 'events', actions: ['read', 'update', 'acknowledge', 'resolve'] },
      { module: 'communications', actions: ['read'] }
    ],
    updated_at: toISO(new Date(now.getTime() - 432000000))
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

const defaultRetryPolicy = () => ({
  max_attempts: 1,
  interval_seconds: 300,
  escalation_channel_ids: [],
  backoff_factor: 1
});

const defaultDeliverySettings = () => ({
  enable_aggregation: false,
  aggregation_window_seconds: 0,
  enable_delay: false,
  delay_seconds: 0,
  enable_repeat_suppression: false,
  repeat_suppression_minutes: 0,
  webhook_headers: {},
  encrypt_payload: false,
  api_token_secret_id: null,
  custom_payload_template: null
});

const defaultSnoozeSettings = () => ({
  auto_snooze_minutes: 0,
  resume_on_resolve: true,
  schedule: null
});

const mergeSettings = (factory, incoming) => {
  const base = factory();
  if (!incoming || typeof incoming !== 'object') return base;
  return { ...base, ...incoming };
};

const notificationStrategies = [
  {
    strategy_id: 'str-001',
    name: 'Critical 事件通知',
    description: '針對 critical 事件通知核心人員。',
    trigger_condition: 'severity == critical',
    enabled: true,
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
    retry_policy: defaultRetryPolicy(),
    delivery_settings: {
      ...defaultDeliverySettings(),
      enable_repeat_suppression: true,
      repeat_suppression_minutes: 30
    },
    snooze_settings: {
      ...defaultSnoozeSettings(),
      auto_snooze_minutes: 15
    },
    linked_silence_ids: ['slc-001'],
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
    recipients: [
      {
        recipient_type: 'channel',
        identifier: 'chn-001',
        display_name: '#sre-alert',
        contact: '#sre-alert',
        delivery_status: 'delivered',
        delivery_status_message: null
      }
    ],
    status: 'SUCCESS',
    duration_ms: 1200,
    alert_title: 'API 延遲飆高',
    message: '事件 evt-001 已通知核心團隊',
    raw_payload: { event_id: 'evt-001', rule: 'API 延遲監控' },
    metadata: { provider: 'slack', request_id: 'req-123' },
    attempts: [
      {
        attempt_number: 1,
        status: 'SUCCESS',
        status_code: 200,
        sent_at: toISO(new Date(now.getTime() - 3600000)),
        completed_at: toISO(new Date(now.getTime() - 3598800)),
        duration_ms: 1200,
        error_message: null,
        request: {
          method: 'POST',
          url: 'https://hooks.slack.com/services/T000/B000/XXXXXXXX',
          headers: { 'content-type': 'application/json' },
          body: { text: 'API 延遲飆高 - 已通知核心團隊' }
        },
        response: {
          status_code: 200,
          status_text: 'OK',
          headers: { 'content-type': 'application/json' },
          body: { ok: true }
        }
      }
    ],
    error_message: null,
    error_stack: null,
    related_event_id: 'evt-001',
    resend_count: 1,
    resend_available: true,
    last_resend_at: toISO(new Date(now.getTime() - 1800000)),
    last_resend_by: {
      user_id: 'user-001',
      display_name: '林佳瑜',
      email: 'sre.lead@example.com'
    },
    actor: '林佳瑜'
  },
  {
    record_id: 'hist-002',
    sent_at: toISO(new Date(now.getTime() - 7200000)),
    strategy_id: 'str-001',
    strategy_name: 'Critical 事件通知',
    channel_type: 'Email',
    channel_label: 'ops@example.com',
    channel_id: 'chn-002',
    recipients: [
      {
        recipient_type: 'external',
        identifier: 'ops@example.com',
        display_name: 'ops@example.com',
        contact: 'ops@example.com',
        delivery_status: 'failed',
        delivery_status_message: 'SMTP timeout'
      }
    ],
    status: 'FAILED',
    duration_ms: 2480,
    alert_title: '資料庫連線逾時',
    message: '通知 Email 失敗，等待人工重試',
    raw_payload: { event_id: 'evt-004', rule: '資料庫健康檢查' },
    metadata: { provider: 'smtp', request_id: 'req-456' },
    attempts: [
      {
        attempt_number: 1,
        status: 'FAILED',
        status_code: 504,
        sent_at: toISO(new Date(now.getTime() - 7200000)),
        completed_at: toISO(new Date(now.getTime() - 7198200)),
        duration_ms: 1800,
        error_message: 'SMTP timeout',
        request: {
          method: 'POST',
          url: 'smtp://smtp.example.com:587',
          headers: { 'content-type': 'text/plain' },
          body: { subject: '資料庫連線逾時', to: ['ops@example.com'] }
        },
        response: {
          status_code: 504,
          status_text: 'Gateway Timeout',
          headers: {},
          body: {}
        }
      },
      {
        attempt_number: 2,
        status: 'RETRYING',
        status_code: 102,
        sent_at: toISO(new Date(now.getTime() - 7100000)),
        completed_at: null,
        duration_ms: 680,
        error_message: null,
        request: {
          method: 'POST',
          url: 'smtp://smtp.example.com:587',
          headers: { 'content-type': 'text/plain' },
          body: { subject: '資料庫連線逾時', to: ['ops@example.com'] }
        },
        response: {
          status_code: 102,
          status_text: 'Processing',
          headers: {},
          body: {}
        }
      }
    ],
    error_message: 'SMTP timeout',
    error_stack: 'SMTPConnectionTimeout: connect ETIMEDOUT smtp.example.com:587',
    related_event_id: 'evt-004',
    resend_count: 0,
    resend_available: true,
    last_resend_at: null,
    last_resend_by: null,
    actor: '系統'
  }
];

const notificationResendJobs = [
  {
    job_id: 'job-001',
    notification_history_id: 'hist-001',
    status: 'completed',
    requested_at: toISO(new Date(now.getTime() - 1800000)),
    requested_by: {
      user_id: 'user-001',
      display_name: '林佳瑜',
      email: 'sre.lead@example.com'
    },
    channel_id: 'chn-001',
    recipients: [
      {
        recipient_type: 'channel',
        identifier: 'chn-001',
        display_name: '#sre-alert',
        contact: '#sre-alert',
        delivery_status: 'delivered',
        delivery_status_message: null
      }
    ],
    dry_run: false,
    note: '手動確認通知已送達核心團隊',
    started_at: toISO(new Date(now.getTime() - 1750000)),
    completed_at: toISO(new Date(now.getTime() - 1700000)),
    result_message: '重新發送成功',
    error_message: null,
    metadata: {}
  },
  {
    job_id: 'job-002',
    notification_history_id: 'hist-002',
    status: 'failed',
    requested_at: toISO(new Date(now.getTime() - 3500000)),
    requested_by: {
      user_id: 'system',
      display_name: '系統',
      email: null
    },
    channel_id: 'chn-002',
    recipients: [
      {
        recipient_type: 'external',
        identifier: 'ops@example.com',
        display_name: 'ops@example.com',
        contact: 'ops@example.com',
        delivery_status: 'failed',
        delivery_status_message: 'SMTP timeout'
      }
    ],
    dry_run: false,
    note: '系統自動重試',
    started_at: toISO(new Date(now.getTime() - 3480000)),
    completed_at: toISO(new Date(now.getTime() - 3460000)),
    result_message: 'SMTP 服務無回應',
    error_message: '連線逾時',
    metadata: { attempt: 2 }
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
    key: 'env',
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
      },
      {
        value_id: 'tag-001-v3',
        value: 'development',
        description: '開發環境',
        is_default: false,
        usage_count: 8,
        last_synced_at: toISO(new Date(now.getTime() - 10800000))
      }
    ]
  },
  {
    tag_id: 'tag-002',
    key: 'tier',
    name: '層級',
    category: '應用服務',
    required: false,
    usage_count: 58,
    values: [
      {
        value_id: 'tag-002-v1',
        value: 'frontend',
        description: '前端層服務',
        is_default: false,
        usage_count: 28,
        last_synced_at: toISO(new Date(now.getTime() - 4200000))
      },
      {
        value_id: 'tag-002-v2',
        value: 'backend',
        description: '後端層服務',
        is_default: false,
        usage_count: 18,
        last_synced_at: toISO(new Date(now.getTime() - 5400000))
      }
    ]
  },
  {
    tag_id: 'tag-003',
    key: 'role',
    name: '角色',
    category: '資料平台',
    required: false,
    usage_count: 41,
    values: [
      {
        value_id: 'tag-003-v1',
        value: 'read-replica',
        description: '資料庫讀取節點',
        is_default: false,
        usage_count: 12,
        last_synced_at: toISO(new Date(now.getTime() - 3600000 * 4))
      },
      {
        value_id: 'tag-003-v2',
        value: 'cache',
        description: '快取節點',
        is_default: false,
        usage_count: 9,
        last_synced_at: toISO(new Date(now.getTime() - 3600000 * 5))
      }
    ]
  }
];

const tagSummary = (() => {
  const totals = {
    total_keys: tagDefinitions.length,
    required_keys: tagDefinitions.filter((tag) => tag.required).length,
    optional_keys: tagDefinitions.filter((tag) => !tag.required).length,
    total_values: tagDefinitions.reduce((acc, tag) => acc + (tag.values?.length || 0), 0)
  };

  const categoryMap = new Map();
  tagDefinitions.forEach((tag) => {
    const existing = categoryMap.get(tag.category) || {
      category: tag.category,
      total_keys: 0,
      required_keys: 0,
      optional_keys: 0,
      total_values: 0,
      lastSyncedAt: 0,
      topCandidates: []
    };

    existing.total_keys += 1;
    existing.total_values += tag.values?.length || 0;
    if (tag.required) {
      existing.required_keys += 1;
    } else {
      existing.optional_keys += 1;
    }

    const latestValueTime = Math.max(
      0,
      ...(tag.values || [])
        .map((value) => new Date(value.last_synced_at || now).getTime())
        .filter((timestamp) => !Number.isNaN(timestamp))
    );
    existing.lastSyncedAt = Math.max(existing.lastSyncedAt, latestValueTime);
    existing.topCandidates.push({
      tag_key: tag.key,
      description: tag.name,
      usage_count: tag.usage_count,
      required: Boolean(tag.required)
    });

    categoryMap.set(tag.category, existing);
  });

  const categories = Array.from(categoryMap.values()).map((entry) => ({
    category: entry.category,
    total_keys: entry.total_keys,
    required_keys: entry.required_keys,
    optional_keys: entry.optional_keys,
    total_values: entry.total_values,
    last_updated_at: entry.lastSyncedAt ? toISO(new Date(entry.lastSyncedAt)) : null,
    top_keys: entry.topCandidates
      .sort((a, b) => b.usage_count - a.usage_count)
      .slice(0, 3)
  }));

  return {
    updated_at: toISO(now),
    totals,
    categories
  };
})();

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
  channel_id: 'channel-email-default',
  channel_name: '預設郵件通道',
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
  managed_by: 'keycloak',
  read_only: true,
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

const layoutWidgets = [
  {
    widget_id: 'widget-incidents-summary',
    name: '事件指標概覽',
    description: '統整活躍事件、確認率與自動化處理成效。',
    supported_pages: ['/events', '/war-room'],
    data_api_endpoint: '/events/summary',
    updated_at: toISO(new Date(now.getTime() - 15 * 60000))
  },
  {
    widget_id: 'widget-resource-health',
    name: '資源健康度',
    description: '顯示近 24 小時內資源狀態與健康分佈。',
    supported_pages: ['/resources', '/events'],
    data_api_endpoint: '/resources/summary',
    updated_at: toISO(new Date(now.getTime() - 30 * 60000))
  },
  {
    widget_id: 'widget-automation-progress',
    name: '自動化執行狀態',
    description: '追蹤最近的自動化排程與腳本執行情況。',
    supported_pages: ['/automation', '/war-room'],
    data_api_endpoint: '/automation/executions',
    updated_at: toISO(new Date(now.getTime() - 45 * 60000))
  },
  {
    widget_id: 'widget-ai-insights',
    name: 'AI 洞察摘要',
    description: '呈現最新的 AI 風險預測與建議摘要。',
    supported_pages: ['/analysis', '/war-room'],
    data_api_endpoint: '/analysis/ai-insights',
    updated_at: toISO(new Date(now.getTime() - 20 * 60000))
  }
];

const pageLayouts = [
  {
    layout_id: 'layout-global-events',
    page_path: '/events',
    scope_type: 'global',
    scope_id: null,
    widgets: [
      { widget_id: 'widget-incidents-summary', order: 1 },
      { widget_id: 'widget-resource-health', order: 2 }
    ],
    created_at: toISO(new Date(now.getTime() - 86400000)),
    updated_at: toISO(new Date(now.getTime() - 3600000)),
    updated_by: 'user-001'
  },
  {
    layout_id: 'layout-role-war-room',
    page_path: '/war-room',
    scope_type: 'role',
    scope_id: 'role-sre',
    widgets: [
      { widget_id: 'widget-incidents-summary', order: 1 },
      { widget_id: 'widget-automation-progress', order: 2 }
    ],
    created_at: toISO(new Date(now.getTime() - 172800000)),
    updated_at: toISO(new Date(now.getTime() - 7200000)),
    updated_by: 'user-001'
  },
  {
    layout_id: 'layout-user-war-room',
    page_path: '/war-room',
    scope_type: 'user',
    scope_id: currentUser.user_id,
    widgets: [
      { widget_id: 'widget-incidents-summary', order: 1 },
      { widget_id: 'widget-ai-insights', order: 2 }
    ],
    created_at: toISO(new Date(now.getTime() - 6048000)),
    updated_at: toISO(now),
    updated_by: currentUser.user_id
  }
];

const getCurrentUserRoleIds = () => {
  const roles = Array.isArray(currentUser.roles) ? currentUser.roles : [];
  const roleIds = new Set();

  roles.forEach((entry) => {
    if (!entry) {
      return;
    }

    const value = typeof entry === 'string' ? entry : entry.role_id;
    if (!value) {
      return;
    }

    const trimmed = String(value).trim();
    if (!trimmed) {
      return;
    }

    roleIds.add(trimmed);
    if (trimmed.startsWith('role-')) {
      const alias = trimmed.slice(5);
      if (alias) {
        roleIds.add(alias);
      }
    } else {
      roleIds.add(`role-${trimmed}`);
    }
  });

  return Array.from(roleIds);
};

const allowedLayoutScopeTypes = new Set(['global', 'role', 'user']);

const mapLayoutWidgetDefinition = (widget) => ({
  widget_id: widget.widget_id,
  name: widget.name,
  description: widget.description || '',
  supported_pages: Array.isArray(widget.supported_pages) ? [...widget.supported_pages] : [],
  data_api_endpoint: widget.data_api_endpoint,
  updated_at: widget.updated_at
});

const getRoleScopeCandidates = (pagePath, preferredScopeId) => {
  const candidates = new Set();
  if (preferredScopeId) {
    candidates.add(preferredScopeId);
  }
  getCurrentUserRoleIds().forEach((roleId) => candidates.add(roleId));
  pageLayouts
    .filter((layout) => layout.page_path === pagePath && layout.scope_type === 'role')
    .forEach((layout) => {
      if (layout.scope_id) {
        candidates.add(layout.scope_id);
      }
    });
  return Array.from(candidates);
};

const findLayoutRecord = (pagePath, scopeType, scopeId) =>
  pageLayouts.find((layout) => {
    if (layout.page_path !== pagePath) return false;
    if (layout.scope_type !== scopeType) return false;
    if (scopeType === 'global') return true;
    return layout.scope_id === scopeId;
  }) || null;

const buildLayoutSearchOrder = (pagePath, { scopeType, scopeId } = {}) => {
  const candidates = [];
  const seen = new Set();
  const addCandidate = (type, id) => {
    const normalizedId = type === 'global' ? null : id;
    const key = `${type}:${normalizedId ?? 'null'}`;
    if (seen.has(key)) return;
    seen.add(key);
    candidates.push({ scope_type: type, scope_id: normalizedId });
  };

  if (scopeType === 'user') {
    addCandidate('user', scopeId || currentUser.user_id);
    getRoleScopeCandidates(pagePath).forEach((roleId) => addCandidate('role', roleId));
    addCandidate('global', null);
    return candidates;
  }

  if (scopeType === 'role') {
    const roles = getRoleScopeCandidates(pagePath, scopeId);
    roles.forEach((roleId) => addCandidate('role', roleId));
    addCandidate('global', null);
    return candidates;
  }

  if (scopeType === 'global') {
    addCandidate('global', null);
    return candidates;
  }

  const defaultUserId = scopeId || currentUser.user_id;
  addCandidate('user', defaultUserId);
  getRoleScopeCandidates(pagePath).forEach((roleId) => addCandidate('role', roleId));
  addCandidate('global', null);
  return candidates;
};

const resolveLayoutForRequest = (pagePath, { scopeType, scopeId } = {}) => {
  const searchOrder = buildLayoutSearchOrder(pagePath, { scopeType, scopeId });
  let matchedRecord = null;
  const fallbackChain = searchOrder.map(({ scope_type, scope_id }) => {
    const record = findLayoutRecord(pagePath, scope_type, scope_id);
    if (!matchedRecord && record) {
      matchedRecord = record;
    }
    return {
      scope_type,
      scope_id: scope_type === 'global' ? null : scope_id,
      matched: Boolean(record),
      updated_at: record?.updated_at ?? null
    };
  });

  if (!fallbackChain.some((entry) => entry.scope_type === 'global')) {
    fallbackChain.push({ scope_type: 'global', scope_id: null, matched: false, updated_at: null });
  }

  return { record: matchedRecord, fallback_chain: fallbackChain };
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

const parseBooleanParam = (value) => {
  if (value === undefined || value === null) return null;
  const normalized = String(value).trim().toLowerCase();
  if (['true', '1', 'yes', 'y'].includes(normalized)) return true;
  if (['false', '0', 'no', 'n'].includes(normalized)) return false;
  return null;
};

const createLowercaseSet = (input) => {
  if (!input || (Array.isArray(input) && input.length === 0)) return null;
  const values = Array.isArray(input) ? input : [input];
  const normalized = values
    .map((value) => (value === undefined || value === null ? '' : String(value).trim()))
    .filter((value) => value.length > 0)
    .map((value) => value.toLowerCase());
  return normalized.length > 0 ? new Set(normalized) : null;
};

const matchesEnumFilter = (value, filterSet) => {
  if (!filterSet) return true;
  if (value === undefined || value === null) return false;
  return filterSet.has(String(value).toLowerCase());
};

const parseDateSafe = (value) => {
  if (!value) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const toComparable = (value) => {
  if (value === null || value === undefined) return null;
  if (value instanceof Date) return value.getTime();
  if (typeof value === 'number') return value;
  if (typeof value === 'boolean') return value ? 1 : 0;
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) return null;
    const isoMatch = Date.parse(trimmed);
    if (!Number.isNaN(isoMatch) && trimmed.includes('-')) {
      return isoMatch;
    }
    const numeric = Number(trimmed);
    if (!Number.isNaN(numeric)) {
      return numeric;
    }
    return trimmed.toLowerCase();
  }
  return value;
};

const defaultSortComparator = (a, b, sortBy, sortOrder) => {
  const valA = toComparable(a?.[sortBy]);
  const valB = toComparable(b?.[sortBy]);
  if (valA === null && valB === null) return 0;
  if (valA === null) return sortOrder === 'desc' ? -1 : 1;
  if (valB === null) return sortOrder === 'desc' ? 1 : -1;
  if (valA < valB) return sortOrder === 'desc' ? 1 : -1;
  if (valA > valB) return sortOrder === 'desc' ? -1 : 1;
  return 0;
};

const paginate = (items, req, options = {}) => {
  const data = Array.isArray(items) ? [...items] : [];
  const sortByParam =
    typeof req.query.sort_by === 'string' && req.query.sort_by.trim().length > 0
      ? req.query.sort_by.trim()
      : options.defaultSortKey || null;
  const rawSortOrder =
    typeof req.query.sort_order === 'string' && req.query.sort_order.trim().length > 0
      ? req.query.sort_order.trim().toLowerCase()
      : options.defaultSortOrder || 'asc';
  const sortOrder = rawSortOrder === 'desc' ? 'desc' : 'asc';
  const allowedSortFields = options.allowedSortFields;

  if (
    sortByParam &&
    (!Array.isArray(allowedSortFields) || allowedSortFields.length === 0 || allowedSortFields.includes(sortByParam))
  ) {
    const sorter = typeof options.customSort === 'function' ? options.customSort : defaultSortComparator;
    data.sort((a, b) => sorter(a, b, sortByParam, sortOrder));
  }

  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
  const pageSize = Math.min(Math.max(parseInt(req.query.page_size, 10) || 20, 1), options.maxPageSize || 100);
  const start = (page - 1) * pageSize;
  const paged = data.slice(start, start + pageSize);
  return {
    page,
    page_size: pageSize,
    total: data.length,
    items: paged
  };
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
        return { key, value, tag_id: null, tag_value_id: null, assigned_at: null };
      }
      if (typeof tag === 'object') {
        const key = typeof tag.key === 'string' ? tag.key.trim() : '';
        if (!key) return null;
        const value =
          tag.value === undefined || tag.value === null ? '' : String(tag.value).trim();
        const tagId = tag.tag_id || tag.tagId || null;
        const tagValueId = tag.tag_value_id || tag.value_id || null;
        const assignedAt = tag.assigned_at ? toISO(tag.assigned_at) : null;
        return { key, value, tag_id: tagId, tag_value_id: tagValueId, assigned_at: assignedAt };
      }
      return null;
    })
    .filter((tag) => tag && tag.key);
};

const cloneTags = (tags) =>
  normalizeTags(tags).map(({ key, value, tag_id, tag_value_id, assigned_at }) => ({
    tag_id: tag_id || null,
    tag_value_id: tag_value_id || `${key}:${value}`.toLowerCase(),
    key,
    value,
    assigned_at: assigned_at || null
  }));

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
  event_source: event.event_source || 'platform_internal',
  source: event.source || null,
  severity: event.severity,
  status: event.status,
  priority: event.priority || 'P2',
  resource_id: event.resource_id,
  resource_name: event.resource_name,
  service_impact: event.service_impact,
  rule_uid: event.rule_uid,
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
  notes: event.notes ?? null,
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
  channel_id: record.channel_id || null,
  strategy_name: record.strategy_name,
  strategy_id: record.strategy_id,
  alert_title: record.alert_title,
  message: record.message,
  error_message: record.error_message,
  recipients: Array.isArray(record.recipients) ? record.recipients : [],
  metadata: record.metadata || {},
  retry_count: record.retry_count ?? Math.max((record.attempts?.length || 1) - 1, 0),
  duration_ms: record.duration_ms,
  resend_available: record.resend_available ?? false,
  resend_count: record.resend_count ?? 0,
  last_resend_at: record.last_resend_at ?? null,
  last_resend_by: record.last_resend_by || null,
  actor: record.actor ?? null,
  related_event_id: record.related_event_id || null
});

const getRecipientSearchTokens = (recipients) => {
  if (!Array.isArray(recipients)) return [];
  return recipients
    .flatMap((recipient) => [recipient.display_name, recipient.contact, recipient.identifier])
    .filter((value) => typeof value === 'string' && value.trim().length > 0);
};

const mapNotificationResendJob = (job) => ({
  job_id: job.job_id,
  status: job.status,
  requested_at: job.requested_at,
  requested_by: job.requested_by,
  channel_id: job.channel_id,
  recipients: Array.isArray(job.recipients) ? job.recipients : [],
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
const getEventRuleByUid = (id) => eventRules.find((rule) => rule.rule_uid === id);
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

const buildTopologyNode = (nodeConfig = {}, index = 0) => {
  const resourceId = nodeConfig.resource_id || nodeConfig.id;
  const resource = resourceId ? getResourceById(resourceId) : null;
  const fallbackId =
    resourceId ||
    nodeConfig.id ||
    (nodeConfig.name ? nodeConfig.name.toLowerCase().replace(/[^a-z0-9]+/gi, '-') : null) ||
    `node-${index + 1}`;

  const metrics = {};
  if (resource) {
    const metricCandidates = [
      ['cpu_usage', resource.cpu_usage],
      ['memory_usage', resource.memory_usage],
      ['disk_usage', resource.disk_usage],
      ['network_in_mbps', resource.network_in_mbps],
      ['network_out_mbps', resource.network_out_mbps]
    ];
    metricCandidates.forEach(([key, value]) => {
      if (typeof value === 'number' && !Number.isNaN(value)) {
        metrics[key] = value;
      }
    });
  }
  if (nodeConfig.metrics && typeof nodeConfig.metrics === 'object') {
    Object.entries(nodeConfig.metrics).forEach(([key, value]) => {
      metrics[key] = value;
    });
  }

  const groupIds = normalizeGroupIds(nodeConfig.group_ids || (resource ? resource.groups : []));
  const environment = nodeConfig.environment || resource?.environment;
  const teamId = nodeConfig.team_id || resource?.team_id || null;
  const teamName =
    nodeConfig.team || resource?.team || (teamId ? getTeamById(teamId)?.name || null : null);

  const node = {
    id: fallbackId,
    name: nodeConfig.name || resource?.name || fallbackId,
    type: nodeConfig.type || resource?.type || 'service',
    status: nodeConfig.status || resource?.status || 'healthy',
    icon: nodeConfig.icon || resource?.type || 'service',
    metrics,
    group_ids: groupIds,
    groups: buildResourceGroupRefs(groupIds),
    tags: cloneTags(nodeConfig.tags || (resource ? resource.tags : [])),
    team_id: teamId,
    team: teamName
  };

  if (environment) {
    node.environment = environment;
  }

  return node;
};

const buildTopologyEdge = (edgeConfig = {}) => {
  if (!edgeConfig) return null;
  const source = edgeConfig.source || edgeConfig.from || null;
  const target = edgeConfig.target || edgeConfig.to || null;
  if (!source || !target) return null;
  const edge = {
    source,
    target,
    status: edgeConfig.status || 'healthy',
    metadata:
      edgeConfig.metadata && typeof edgeConfig.metadata === 'object'
        ? { ...edgeConfig.metadata }
        : {}
  };
  if (edgeConfig.relation) {
    edge.relation = edgeConfig.relation;
  }
  if (typeof edgeConfig.traffic_level === 'number' && !Number.isNaN(edgeConfig.traffic_level)) {
    edge.traffic_level = edgeConfig.traffic_level;
  }
  return edge;
};

const buildTopologyGraph = ({
  statusFilter,
  typeFilter,
  groupFilter,
  tagFilter,
  teamFilter
} = {}) => {
  const nodes = Array.isArray(topologyConfig.nodes)
    ? topologyConfig.nodes.map((nodeConfig, index) => buildTopologyNode(nodeConfig, index))
    : [];

  const filteredNodes = nodes.filter((node) => {
    if (!matchesEnumFilter(node.status, statusFilter)) return false;
    if (!matchesEnumFilter(node.type, typeFilter)) return false;
    if (!matchesEnumFilter(node.team_id, teamFilter)) return false;

    if (groupFilter) {
      const nodeGroupIds = Array.isArray(node.group_ids)
        ? node.group_ids
          .map((value) => (value === undefined || value === null ? '' : String(value).trim().toLowerCase()))
          .filter((value) => value.length > 0)
        : [];
      if (!nodeGroupIds.some((value) => groupFilter.has(value))) return false;
    }

    if (tagFilter) {
      const nodeTagIds = Array.isArray(node.tags)
        ? node.tags
          .map((tag) => {
            if (!tag) return null;
            const rawValue =
              tag.tag_value_id || (tag.key ? `${tag.key}:${tag.value ?? ''}` : null);
            return rawValue ? String(rawValue).toLowerCase() : null;
          })
          .filter((value) => value && value.length > 0)
        : [];
      if (!nodeTagIds.some((value) => tagFilter.has(value))) return false;
    }

    return true;
  });

  const includedNodeIds = new Set(filteredNodes.map((node) => node.id));
  const edges = Array.isArray(topologyConfig.edges)
    ? topologyConfig.edges
      .map((edgeConfig) => buildTopologyEdge(edgeConfig))
      .filter(
        (edge) =>
          edge &&
          includedNodeIds.has(edge.source) &&
          includedNodeIds.has(edge.target)
      )
    : [];

  return { nodes: filteredNodes, edges };
};

const resolveRecipientDisplayName = (recipient) => {
  if (!recipient || !recipient.type || !recipient.id) {
    return null;
  }
  if (recipient.type === 'user') {
    const user = getIamUserById(recipient.id);
    return user?.display_name || null;
  }
  if (recipient.type === 'team') {
    return getTeamById(recipient.id)?.name || null;
  }
  if (recipient.type === 'role') {
    return getRoleById(recipient.id)?.name || null;
  }
  return null;
};

const enrichNotificationRecipient = (recipient) => {
  if (!recipient || !recipient.type || !recipient.id) {
    return null;
  }
  const displayName = recipient.display_name || resolveRecipientDisplayName(recipient) || recipient.id;
  return {
    type: recipient.type,
    id: recipient.id,
    display_name: displayName
  };
};

const enrichNotificationChannelRef = (channelRef) => {
  if (!channelRef || !channelRef.channel_id) {
    return null;
  }
  const channel = getNotificationChannelById(channelRef.channel_id);
  const channelType = channelRef.channel_type || channel?.type || 'Email';
  const template = channelRef.template || channel?.template_key || null;
  const channelName = channelRef.channel_name || channel?.name || channelRef.channel_id;
  return {
    channel_id: channelRef.channel_id,
    channel_type: channelType,
    template,
    channel_name: channelName
  };
};

const mapNotificationStrategyDetail = (strategy) => {
  if (!strategy) {
    return null;
  }
  const recipients = (strategy.recipients || [])
    .map(enrichNotificationRecipient)
    .filter((recipient) => recipient);
  const channels = (strategy.channels || [])
    .map(enrichNotificationChannelRef)
    .filter((channel) => channel);
  return {
    strategy_id: strategy.strategy_id,
    name: strategy.name,
    description: strategy.description || '',
    trigger_condition: strategy.trigger_condition || '',
    channel_count: channels.length,
    enabled: Boolean(strategy.enabled),
    priority: strategy.priority || 'medium',
    severity_filters: strategy.severity_filters || [],
    recipients,
    channels,
    resource_filters: strategy.resource_filters || {},
    retry_policy: mergeSettings(defaultRetryPolicy, strategy.retry_policy),
    delivery_settings: mergeSettings(defaultDeliverySettings, strategy.delivery_settings),
    snooze_settings: mergeSettings(defaultSnoozeSettings, strategy.snooze_settings),
    linked_silence_ids: Array.isArray(strategy.linked_silence_ids)
      ? [...strategy.linked_silence_ids]
      : []
  };
};

const normalizeEventActionPayload = (payload = {}) => {
  const normalized = { ...payload };

  if (typeof normalized.note === 'string') {
    const trimmedNote = normalized.note.trim();
    if (trimmedNote) {
      normalized.note = trimmedNote;
      if (!normalized.comment) {
        normalized.comment = trimmedNote;
      }
    } else {
      delete normalized.note;
    }
  }

  if (typeof normalized.comment === 'string') {
    const trimmedComment = normalized.comment.trim();
    if (trimmedComment) {
      normalized.comment = trimmedComment;
    } else {
      delete normalized.comment;
    }
  }

  if (typeof normalized.resolution_note === 'string') {
    const trimmedResolution = normalized.resolution_note.trim();
    if (trimmedResolution) {
      normalized.resolution_note = trimmedResolution;
    } else {
      delete normalized.resolution_note;
    }
  }

  if (typeof normalized.assignee_id === 'string') {
    const trimmedAssignee = normalized.assignee_id.trim();
    normalized.assignee_id = trimmedAssignee || normalized.assignee_id;
  }

  return normalized;
};

const validateBatchAction = (targetType, action, payload) => {
  if (targetType === 'event') {
    const allowed = new Set(['acknowledge', 'resolve', 'assign', 'add_comment']);
    if (!allowed.has(action)) {
      return 'action 參數無效。';
    }
    if (action === 'assign' && !payload.assignee_id) {
      return 'assign 操作需提供 assignee_id。';
    }
    if (action === 'resolve' && payload.resolved_at && Number.isNaN(Date.parse(payload.resolved_at))) {
      return 'resolved_at 時間格式不正確。';
    }
    if (action === 'add_comment' && (!payload.comment || !String(payload.comment).trim())) {
      return 'add_comment 操作需提供 comment。';
    }
  } else {
    const allowed = new Set(['delete', 'update_status', 'assign_team', 'add_tags', 'remove_tags']);
    if (!allowed.has(action)) {
      return 'action 參數無效。';
    }
    if (action === 'update_status' && !payload.target_status) {
      return 'update_status 操作需提供 target_status。';
    }
    if (action === 'assign_team' && !payload.target_team_id) {
      return 'assign_team 操作需提供 target_team_id。';
    }
    if ((action === 'add_tags' || action === 'remove_tags') && (!Array.isArray(payload.tags) || payload.tags.length === 0)) {
      return '需提供 tags 列表。';
    }
  }
  return null;
};

const buildBatchContext = (targetType, payload) => {
  const context = {};
  if (targetType === 'event') {
    const normalized = normalizeEventActionPayload(payload);
    if (normalized.assignee_id) context.assignee_id = normalized.assignee_id;
    if (normalized.comment) context.comment = normalized.comment;
    if (normalized.note) context.note = normalized.note;
    if (normalized.resolved_at) context.resolved_at = normalized.resolved_at;
    if (normalized.resolution_note) context.resolution_note = normalized.resolution_note;
  } else {
    if (payload.target_status) context.target_status = payload.target_status;
    if (payload.target_team_id) context.target_team_id = payload.target_team_id;
    if (Array.isArray(payload.tags)) context.tags = payload.tags;
    if (payload.reason) context.reason = payload.reason;
  }
  return context;
};

const parseTagString = (tag) => {
  if (typeof tag !== 'string') return null;
  const [key, ...rest] = tag.split(':');
  const normalizedKey = key?.trim();
  if (!normalizedKey) {
    return null;
  }
  const value = rest.join(':').trim();
  return { key: normalizedKey, value };
};

const applyEventBatchAction = (event, action, payload) => {
  const nowIso = toISO(new Date());
  if (action === 'acknowledge') {
    event.status = 'acknowledged';
    const assigneeId = payload.assignee_id || event.assignee_id || currentUser.user_id;
    event.assignee_id = assigneeId;
    event.assignee = getIamUserById(assigneeId)?.display_name || event.assignee || currentUser.display_name;
    event.acknowledged_at = nowIso;
    event.updated_at = nowIso;
    appendTimelineEntry(event, {
      entry_type: 'status_change',
      message: '事件已確認處理',
      metadata: { action: 'acknowledge' }
    });
    if (payload.comment) {
      appendTimelineEntry(event, {
        entry_type: 'note',
        message: payload.comment,
        metadata: { action: 'acknowledge' }
      });
    }
    return { success: true, message: '事件已確認' };
  }

  if (action === 'assign') {
    const assigneeId = payload.assignee_id;
    event.assignee_id = assigneeId;
    event.assignee = getIamUserById(assigneeId)?.display_name || assigneeId;
    if (event.status === 'new' || event.status === 'acknowledged') {
      event.status = 'in_progress';
    }
    event.updated_at = nowIso;
    if (!event.acknowledged_at) {
      event.acknowledged_at = nowIso;
    }
    appendTimelineEntry(event, {
      entry_type: 'status_change',
      message: `事件指派給 ${event.assignee}`,
      metadata: { action: 'assign' }
    });
    if (payload.comment) {
      appendTimelineEntry(event, {
        entry_type: 'note',
        message: payload.comment,
        metadata: { action: 'assign' }
      });
    }
    return { success: true, message: '事件已指派' };
  }

  if (action === 'resolve') {
    const resolvedAt = payload.resolved_at ? toISO(new Date(payload.resolved_at)) : nowIso;
    event.status = 'resolved';
    event.resolved_at = resolvedAt;
    event.updated_at = resolvedAt;
    if (!event.acknowledged_at) {
      event.acknowledged_at = resolvedAt;
    }
    appendTimelineEntry(event, {
      entry_type: 'status_change',
      message: '事件標記為已解決',
      metadata: { action: 'resolve' }
    });
    if (payload.resolution_note) {
      appendTimelineEntry(event, {
        entry_type: 'note',
        message: payload.resolution_note,
        metadata: { action: 'resolve' }
      });
    }
    return { success: true, message: '事件已解決' };
  }

  if (action === 'add_comment') {
    appendTimelineEntry(event, {
      entry_type: 'note',
      message: payload.comment,
      metadata: { action: 'add_comment' }
    });
    event.updated_at = nowIso;
    return { success: true, message: '已新增備註' };
  }

  return { success: false, message: '不支援的操作', error_code: 'INVALID_ACTION' };
};

const applyResourceBatchAction = (resourceId, action, payload) => {
  const index = resourceData.findIndex((item) => item.resource_id === resourceId);
  if (index === -1) {
    return { success: false, message: '找不到資源', error_code: 'NOT_FOUND' };
  }
  const resource = resourceData[index];
  const nowIso = toISO(new Date());

  if (action === 'delete') {
    resourceData.splice(index, 1);
    return { success: true, message: '資源已刪除' };
  }

  if (action === 'update_status') {
    resource.status = payload.target_status;
    resource.updated_at = nowIso;
    return { success: true, message: `資源狀態更新為 ${payload.target_status}` };
  }

  if (action === 'assign_team') {
    resource.team_id = payload.target_team_id;
    resource.team = getTeamById(payload.target_team_id)?.name || resource.team || payload.target_team_id;
    resource.updated_at = nowIso;
    return { success: true, message: '資源已重新指派團隊' };
  }

  if (action === 'add_tags') {
    const existing = Array.isArray(resource.tags) ? resource.tags : [];
    const additions = payload.tags.map(parseTagString).filter((tag) => tag && tag.key);
    additions.forEach((tag) => {
      if (!existing.some((item) => item.key === tag.key && item.value === tag.value)) {
        existing.push(tag);
      }
    });
    resource.tags = existing;
    resource.updated_at = nowIso;
    return { success: true, message: '標籤已新增' };
  }

  if (action === 'remove_tags') {
    const removals = payload.tags.map(parseTagString).filter((tag) => tag && tag.key);
    const before = resource.tags?.length || 0;
    resource.tags = (resource.tags || []).filter(
      (tag) => !removals.some((remove) => remove.key === tag.key && remove.value === tag.value)
    );
    const removed = before - (resource.tags?.length || 0);
    resource.updated_at = nowIso;
    return { success: true, message: `已移除 ${removed} 個標籤` };
  }

  return { success: false, message: '不支援的操作', error_code: 'INVALID_ACTION' };
};

const processBatchOperation = (operationId, payload, ids) => {
  const operation = batchOperations.get(operationId);
  if (!operation) {
    return;
  }
  operation.status = 'running';
  batchOperations.set(operationId, operation);

  const actionPayload =
    operation.target_type === 'event' ? normalizeEventActionPayload(payload) : payload;

  const results = ids.map((id) => {
    if (operation.target_type === 'event') {
      const event = getEventById(id);
      if (!event) {
        return { target_id: id, success: false, message: '找不到事件', error_code: 'NOT_FOUND' };
      }
      const result = applyEventBatchAction(event, operation.action, actionPayload);
      return {
        target_id: id,
        success: result.success,
        message: result.message,
        error_code: result.error_code || null,
        processed_at: toISO(new Date())
      };
    }

    const resourceResult = applyResourceBatchAction(id, operation.action, payload);
    return {
      target_id: id,
      success: resourceResult.success,
      message: resourceResult.message,
      error_code: resourceResult.error_code || null,
      processed_at: toISO(new Date())
    };
  });

  operation.items = results;
  operation.processed_count = results.length;
  operation.success_count = results.filter((item) => item.success).length;
  operation.failed_count = results.filter((item) => !item.success).length;
  operation.status = operation.success_count === results.length ? 'completed' : operation.success_count === 0 ? 'failed' : 'completed';
  operation.completed_at = toISO(new Date());
  batchOperations.set(operationId, operation);
};

const notFound = (res, message = '查無資料') => res.status(404).json({ code: 'NOT_FOUND', message });

app.get('/me', (req, res) => res.json(currentUser));

app.get('/me/preferences', (req, res) => res.json(userPreferences));

app.put('/me/preferences', (req, res) => {
  const payload = req.body || {};

  ['theme', 'language', 'timezone', 'default_page'].forEach((key) => {
    if (Object.prototype.hasOwnProperty.call(payload, key)) {
      userPreferences[key] = payload[key];
    }
  });

  if (payload.default_landing && typeof payload.default_landing === 'object') {
    userPreferences.default_landing = {
      ...userPreferences.default_landing,
      ...payload.default_landing
    };

    if (userPreferences.default_landing.type === 'system_page' && userPreferences.default_landing.page_key) {
      userPreferences.default_page = userPreferences.default_landing.page_key;
    } else if (userPreferences.default_landing.type === 'dashboard') {
      userPreferences.default_page = 'dashboards';
    }
  }

  if (payload.notification_preferences && typeof payload.notification_preferences === 'object') {
    userPreferences.notification_preferences = {
      ...userPreferences.notification_preferences,
      ...payload.notification_preferences
    };
  }

  if (payload.display_options && typeof payload.display_options === 'object') {
    userPreferences.display_options = {
      ...userPreferences.display_options,
      ...payload.display_options
    };
  }

  if (payload.dashboard_preferences && typeof payload.dashboard_preferences === 'object') {
    userPreferences.dashboard_preferences = {
      ...userPreferences.dashboard_preferences,
      ...payload.dashboard_preferences
    };
  }

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
  res.json(buildNotificationSummary());
});

app.get('/notifications', (req, res) => {
  const statusFilter = createLowercaseSet(parseListParam(req.query.status));
  const severityFilter = createLowercaseSet(parseListParam(req.query.severity));
  const filtered = notifications.filter(
    (item) =>
      !item.deleted_at &&
      matchesEnumFilter(item.status, statusFilter) &&
      matchesEnumFilter(item.severity, severityFilter)
  );
  res.json(
    paginate(filtered, req, {
      allowedSortFields: ['created_at', 'severity', 'title'],
      defaultSortKey: 'created_at',
      defaultSortOrder: 'desc'
    })
  );
});

app.post('/notifications/bulk', (req, res) => {
  const { action, target = 'selected', notification_ids: notificationIds, effective_at: effectiveAt } = req.body || {};

  const normalizedAction = typeof action === 'string' ? action.trim().toLowerCase() : '';
  if (!['mark_read', 'clear'].includes(normalizedAction)) {
    return res.status(400).json({ code: 'INVALID_REQUEST', message: 'action 必須為 mark_read 或 clear。' });
  }

  const rawTarget = typeof target === 'string' ? target.trim().toLowerCase() : '';
  const normalizedTarget = rawTarget || 'selected';
  if (!['selected', 'all', 'read'].includes(normalizedTarget)) {
    return res.status(400).json({ code: 'INVALID_REQUEST', message: 'target 必須為 selected、all 或 read。' });
  }

  let idSet = null;
  if (normalizedTarget === 'selected') {
    if (!Array.isArray(notificationIds) || notificationIds.length === 0) {
      return res.status(400).json({ code: 'INVALID_REQUEST', message: 'notification_ids 至少需要一筆識別碼。' });
    }
    const normalizedIds = notificationIds
      .map((value) => (value === undefined || value === null ? '' : String(value).trim()))
      .filter((value) => value.length > 0);
    if (normalizedIds.length === 0) {
      return res.status(400).json({ code: 'INVALID_REQUEST', message: 'notification_ids 至少需要一筆識別碼。' });
    }
    idSet = new Set(normalizedIds);
  }

  const shouldAffect = (item) => {
    if (!item || item.deleted_at) {
      return false;
    }
    if (normalizedTarget === 'all') {
      return true;
    }
    if (normalizedTarget === 'read') {
      return item.status === 'read';
    }
    return idSet ? idSet.has(item.notification_id) : false;
  };

  if (normalizedAction === 'mark_read') {
    const timestamp =
      effectiveAt && !Number.isNaN(Date.parse(effectiveAt)) ? toISO(new Date(effectiveAt)) : toISO(new Date());
    const updatedItems = [];

    notifications.forEach((item) => {
      if (shouldAffect(item) && item.status !== 'read') {
        item.status = 'read';
        item.read_at = timestamp;
        updatedItems.push({ ...item });
      }
    });

    const response = { summary: buildNotificationSummary() };
    if (updatedItems.length > 0) {
      response.updated_items = updatedItems;
    }
    return res.json(response);
  }

  const clearedIds = [];
  const clearedTimestamp = toISO(new Date());
  notifications.forEach((item) => {
    if (shouldAffect(item)) {
      item.deleted_at = clearedTimestamp;
      clearedIds.push(item.notification_id);
    }
  });

  return res.json({
    cleared_ids: clearedIds,
    cleared_count: clearedIds.length,
    summary: buildNotificationSummary()
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
  const statusFilter = createLowercaseSet(parseListParam(req.query.status));
  const severityFilter = createLowercaseSet(parseListParam(req.query.severity));
  const resourceIds = parseListParam(req.query.resource_id);
  const ruleUids = parseListParam(req.query.rule_uid);
  const assigneeIds = parseListParam(req.query.assignee_id);
  const tagFiltersRaw = parseListParam(req.query.tags);
  const tagFilters = Array.isArray(tagFiltersRaw)
    ? tagFiltersRaw.map((tag) => tag.toLowerCase())
    : null;
  const keyword = (req.query.keyword || '').trim().toLowerCase();
  const resourceNameKeyword = (req.query.resource_name || '').trim().toLowerCase();
  const ruleNameKeyword = (req.query.rule_name || '').trim().toLowerCase();
  const resourceTypeFilter = (req.query.resource_type || '').trim().toLowerCase();
  const startTime = parseDateSafe(req.query.start_time);
  const endTime = parseDateSafe(req.query.end_time);

  const filtered = eventData.filter((event) => {
    if (!matchesEnumFilter(event.status, statusFilter)) return false;
    if (!matchesEnumFilter(event.severity, severityFilter)) return false;
    if (resourceIds && resourceIds.length > 0 && !resourceIds.includes(event.resource_id)) return false;
    if (ruleUids && ruleUids.length > 0 && !ruleUids.includes(event.rule_uid)) return false;
    if (assigneeIds && assigneeIds.length > 0 && !assigneeIds.includes(event.assignee_id)) return false;

    const eventTime = parseDateSafe(event.trigger_time);
    if (startTime && !eventTime) return false;
    if (endTime && !eventTime) return false;
    if (startTime && eventTime && eventTime < startTime) return false;
    if (endTime && eventTime && eventTime > endTime) return false;

    if (keyword) {
      const combinedText = `${event.event_id || ''} ${event.event_key || ''} ${event.summary || ''} ${event.description || ''
        }`.toLowerCase();
      if (!combinedText.includes(keyword)) return false;
    }

    if (resourceNameKeyword) {
      const resourceName = (event.resource_name || '').toLowerCase();
      if (!resourceName.includes(resourceNameKeyword)) return false;
    }

    if (resourceTypeFilter) {
      const resource = event.resource_id ? getResourceById(event.resource_id) : null;
      if (!resource || String(resource.type || '').toLowerCase() !== resourceTypeFilter) return false;
    }

    if (ruleNameKeyword) {
      const rule = event.rule_uid ? getEventRuleByUid(event.rule_uid) : null;
      const ruleText = `${event.rule_name || ''} ${rule?.name || ''}`.toLowerCase();
      if (!ruleText.includes(ruleNameKeyword)) return false;
    }

    if (tagFilters && tagFilters.length > 0) {
      const eventTags = Array.isArray(event.tags) ? event.tags.map((tag) => String(tag).toLowerCase()) : [];
      const hasAllTags = tagFilters.every((tag) => eventTags.includes(tag));
      if (!hasAllTags) return false;
    }

    return true;
  });

  const items = filtered.map(mapEventSummary);
  res.json(
    paginate(items, req, {
      allowedSortFields: ['trigger_time', 'severity', 'status', 'priority', 'summary'],
      defaultSortKey: 'trigger_time',
      defaultSortOrder: 'desc'
    })
  );
});

app.post('/batch-operations', (req, res) => {
  const payload = req.body || {};
  const targetType = payload.target_type;
  const action = payload.action;
  const normalizedPayload = targetType === 'event' ? normalizeEventActionPayload(payload) : payload;
  if (!['event', 'resource'].includes(targetType)) {
    return res.status(400).json({ code: 'INVALID_REQUEST', message: 'target_type 參數無效。' });
  }

  const ids = targetType === 'event' ? payload.event_ids : payload.resource_ids;
  if (!Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ code: 'INVALID_REQUEST', message: '缺少批次處理目標識別碼。' });
  }

  const validationError = validateBatchAction(targetType, action, normalizedPayload);
  if (validationError) {
    return res.status(400).json({ code: 'INVALID_REQUEST', message: validationError });
  }

  const operationId = `batch-${Date.now()}`;
  const createdAt = toISO(new Date());
  const operation = {
    operation_id: operationId,
    target_type: targetType,
    action,
    status: 'pending',
    requested_by: currentUser.user_id,
    total_count: ids.length,
    processed_count: 0,
    success_count: 0,
    failed_count: 0,
    created_at: createdAt,
    completed_at: null,
    context: buildBatchContext(targetType, normalizedPayload),
    items: []
  };

  batchOperations.set(operationId, operation);

  setTimeout(() => processBatchOperation(operationId, normalizedPayload, ids), 200);

  res.status(202).json(operation);
});

app.get('/batch-operations/:operation_id', (req, res) => {
  const operation = batchOperations.get(req.params.operation_id);
  if (!operation) {
    return notFound(res, '找不到批次處理作業');
  }
  res.json(operation);
});

app.post('/events', (req, res) => {
  const payload = req.body || {};
  const nowIso = toISO(new Date());
  const defaultPriority = eventRules.find((rule) => rule.rule_uid === payload.rule_uid)?.default_priority || 'P2';
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
  const normalizedNotes =
    typeof payload.notes === 'string' && payload.notes.trim().length > 0 ? payload.notes.trim() : null;
  const updatedAt = resolvedAt || acknowledgedAt || nowIso;
  const newEvent = {
    event_id: `evt-${Date.now()}`,
    event_key: payload.event_key || `INC-${Date.now()}`,
    summary: payload.summary || '新事件',
    description: payload.description || '',
    event_source:
      payload.event_source && ['grafana_webhook', 'platform_internal', 'manual_created'].includes(payload.event_source)
        ? payload.event_source
        : payload.rule_uid
          ? 'grafana_webhook'
          : 'platform_internal',
    source: payload.source || (payload.rule_uid ? 'Grafana Alerting' : 'SRE 平台'),
    severity: payload.severity || 'warning',
    status: initialStatus,
    priority: payload.priority || defaultPriority,
    resource_id: payload.resource_id || null,
    resource_name: resourceData.find((r) => r.resource_id === payload.resource_id)?.name || null,
    service_impact: payload.service_impact || null,
    rule_uid: payload.rule_uid || null,
    rule_name: eventRules.find((rule) => rule.rule_uid === payload.rule_uid)?.name || null,
    trigger_threshold: payload.trigger_threshold || null,
    trigger_value: payload.trigger_value || null,
    unit: payload.unit || null,
    trigger_time: payload.trigger_time || toISO(new Date()),
    assignee_id: payload.assignee_id || null,
    assignee: iamUsers.find((user) => user.user_id === payload.assignee_id)?.display_name || null,
    acknowledged_at: acknowledgedAt,
    resolved_at: resolvedAt,
    notes: normalizedNotes,
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
  const updates = { ...(req.body || {}) };
  if (Object.prototype.hasOwnProperty.call(updates, 'notes')) {
    const rawNote = updates.notes;
    const trimmedNote = typeof rawNote === 'string' ? rawNote.trim() : '';
    event.notes = trimmedNote.length > 0 ? trimmedNote : null;
    delete updates.notes;
  }
  Object.assign(event, updates);
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

app.post('/events/:event_id/actions', (req, res) => {
  const event = getEventById(req.params.event_id);
  if (!event) return notFound(res, '找不到事件');

  const payload = normalizeEventActionPayload(req.body || {});
  const action = typeof payload.action === 'string' ? payload.action.trim() : payload.action;
  const allowedActions = new Set(['acknowledge', 'assign', 'resolve']);
  if (!allowedActions.has(action)) {
    return res.status(400).json({ code: 'INVALID_REQUEST', message: 'action 參數無效。' });
  }

  payload.action = action;
  const validationError = validateBatchAction('event', action, payload);
  if (validationError) {
    return res.status(400).json({ code: 'INVALID_REQUEST', message: validationError });
  }

  const result = applyEventBatchAction(event, action, payload);
  if (!result.success) {
    return res.status(400).json({ code: 'INVALID_REQUEST', message: result.message, error_code: result.error_code });
  }

  res.json(toEventDetail(event));
});

app.get('/events/:event_id/related', (req, res) => {
  const event = getEventById(req.params.event_id);
  if (!event) return notFound(res, '找不到事件');
  res.json({ items: event.related || [] });
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

app.get('/event-rules/templates', (req, res) => {
  const severityFilter = createLowercaseSet(parseListParam(req.query.severity));
  const keyword = (req.query.keyword || '').trim().toLowerCase();

  const templates = eventRuleTemplates.filter((tpl) => {
    if (!matchesEnumFilter(tpl.severity, severityFilter)) return false;
    if (keyword) {
      const text = `${tpl.name} ${tpl.description || ''}`.toLowerCase();
      if (!text.includes(keyword)) return false;
    }
    return true;
  });

  res.json(templates);
});

app.get('/event-rules', (req, res) => {
  const severityFilter = createLowercaseSet(parseListParam(req.query.severity));
  const enabledFilter = parseBooleanParam(req.query.enabled);
  const keyword = (req.query.keyword || '').trim().toLowerCase();

  const filtered = eventRules.filter((rule) => {
    if (!matchesEnumFilter(rule.severity, severityFilter)) return false;
    if (enabledFilter !== null && Boolean(rule.enabled) !== enabledFilter) return false;
    if (keyword) {
      const text = `${rule.name || ''} ${rule.description || ''}`.toLowerCase();
      if (!text.includes(keyword)) return false;
    }
    return true;
  });

  const items = filtered.map((rule) => ({
    rule_uid: rule.rule_uid,
    name: rule.name,
    description: rule.description,
    severity: rule.severity,
    enabled: rule.enabled,
    automation_enabled: rule.automation_enabled,
    default_priority: rule.default_priority || 'P2',
    template_key: rule.template_key || null,
    target: rule.target || deriveTargetSummary(rule.resource_filters),
    creator: rule.creator,
    last_updated: rule.last_updated,
    last_synced_at: rule.last_synced_at || null,
    sync_status: rule.sync_status || 'fresh'
  }));

  if ((req.query.format || 'json').toLowerCase() === 'csv') {
    const csv = toCsv(items, [
      { key: 'rule_uid' },
      { key: 'name' },
      { key: 'target' },
      { key: 'severity' },
      { key: 'enabled', value: (row) => (row.enabled ? 'true' : 'false') },
      { key: 'automation_enabled', value: (row) => (row.automation_enabled ? 'true' : 'false') },
      { key: 'default_priority' },
      { key: 'sync_status' },
      { key: 'last_synced_at', value: (row) => row.last_synced_at || '' },
      { key: 'last_updated' },
      { key: 'creator' }
    ]);
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    return res.send(csv);
  }

  res.json(
    paginate(items, req, {
      allowedSortFields: ['name', 'severity', 'last_updated', 'default_priority'],
      defaultSortKey: 'last_updated',
      defaultSortOrder: 'desc'
    })
  );
});

app.post('/event-rules', (req, res) => {
  const payload = req.body || {};
  const template = payload.template_key
    ? eventRuleTemplates.find((item) => item.template_key === payload.template_key)
    : null;

  const clone = (value) => (value ? JSON.parse(JSON.stringify(value)) : value);

  const baseRule = buildEventRule({
    rule_uid: `rule-${Date.now()}`,
    name: payload.name || template?.name || '新事件規則',
    description: payload.description || template?.description || '',
    severity: payload.severity || template?.severity || 'warning',
    default_priority: payload.default_priority || template?.default_priority || 'P2',
    enabled: payload.enabled ?? true,
    automation_enabled: payload.automation?.enabled ?? false,
    template_key: payload.template_key || template?.template_key || null,
    labels: payload.labels || clone(template?.labels) || [],
    environments: payload.environments || clone(template?.environments) || [],
    resource_filters:
      clone(payload.resource_filters) || clone(template?.default_resource_filters) || [],
    target: payload.target || template?.default_target_summary || undefined,
    condition_groups: payload.condition_groups || clone(template?.condition_groups) || [],
    title_template: payload.title_template || template?.title_template || '',
    content_template: payload.content_template || template?.content_template || '',
    automation:
      payload.automation || {
        enabled: false,
        script_id: template?.suggested_script_id || null,
        parameters: {}
      }
  });
  const timestamp = toISO(new Date());
  Object.assign(baseRule, {
    creator: currentUser.display_name,
    last_updated: timestamp,
    last_synced_at: timestamp,
    sync_status: 'fresh'
  });
  eventRules.push(baseRule);
  res.status(201).json(baseRule);
});

app.get('/event-rules/:rule_uid', (req, res) => {
  const rule = getEventRuleByUid(req.params.rule_uid);
  if (!rule) return notFound(res, '找不到事件規則');
  res.json(rule);
});

app.put('/event-rules/:rule_uid', (req, res) => {
  const rule = getEventRuleByUid(req.params.rule_uid);
  if (!rule) return notFound(res, '找不到事件規則');
  const payload = req.body || {};
  const updated = buildEventRule({
    ...rule,
    ...payload,
    resource_filters: payload.resource_filters ?? rule.resource_filters,
    target: payload.target || rule.target
  });
  Object.assign(rule, updated, {
    last_updated: toISO(new Date()),
    last_synced_at: toISO(new Date()),
    sync_status: 'fresh'
  });
  res.json(rule);
});

app.delete('/event-rules/:rule_uid', (req, res) => {
  const rule = getEventRuleByUid(req.params.rule_uid);
  if (!rule) return notFound(res, '找不到事件規則');
  res.status(204).end();
});

app.post('/event-rules/:rule_uid/toggle', (req, res) => {
  const rule = getEventRuleByUid(req.params.rule_uid);
  if (!rule) return notFound(res, '找不到事件規則');
  const payload = req.body || {};
  if (typeof payload.enabled === 'boolean') {
    rule.enabled = payload.enabled;
  } else if (typeof payload.status === 'string') {
    rule.enabled = payload.status.toLowerCase() === 'enabled';
  } else {
    rule.enabled = !rule.enabled;
  }
  rule.last_updated = toISO(new Date());
  rule.last_synced_at = toISO(new Date());
  rule.sync_status = 'fresh';
  res.json(rule);
});

app.post('/event-rules/:rule_uid/test', (req, res) => {
  const rule = getEventRuleByUid(req.params.rule_uid);
  if (!rule) return notFound(res, '找不到事件規則');
  res.json({ matches: true, preview_event: mapEventSummary(eventData[0]), messages: ['條件符合範例資料'] });
});

app.get('/silence-rules', (req, res) => {
  const typeFilter = createLowercaseSet(parseListParam(req.query.silence_type));
  const enabledFilter = parseBooleanParam(req.query.enabled);
  const filtered = silenceRules.filter((rule) => {
    if (!matchesEnumFilter(rule.silence_type, typeFilter)) return false;
    if (enabledFilter !== null && Boolean(rule.enabled) !== enabledFilter) return false;
    return true;
  });

  const items = filtered.map((rule) => ({
    silence_id: rule.silence_id,
    name: rule.name,
    description: rule.description,
    silence_type: rule.silence_type,
    scope: rule.scope,
    enabled: rule.enabled,
    created_at: rule.created_at
  }));

  if ((req.query.format || 'json').toLowerCase() === 'csv') {
    const csv = toCsv(filtered, [
      { key: 'silence_id' },
      { key: 'name' },
      { key: 'silence_type' },
      { key: 'scope' },
      { key: 'enabled', value: (row) => (row.enabled ? 'true' : 'false') },
      { key: 'created_at' },
      { header: 'starts_at', value: (row) => row.schedule?.starts_at || '' },
      { header: 'ends_at', value: (row) => row.schedule?.ends_at || '' },
      { header: 'timezone', value: (row) => row.schedule?.timezone || '' },
      { header: 'repeat_frequency', value: (row) => row.schedule?.repeat?.frequency || '' }
    ]);
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    return res.send(csv);
  }

  res.json(
    paginate(items, req, {
      allowedSortFields: ['name', 'silence_type', 'created_at'],
      defaultSortKey: 'created_at',
      defaultSortOrder: 'desc'
    })
  );
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

app.get('/resources/summary', (req, res) => {
  const healthy = resourceData.filter((resItem) => resItem.status === 'healthy').length;
  const warning = resourceData.filter((resItem) => resItem.status === 'warning').length;
  const critical = resourceData.filter((resItem) => resItem.status === 'critical').length;
  res.json({ total_resources: resourceData.length, healthy, warning, critical, groups: resourceGroups.length });
});

app.get('/resources', (req, res) => {
  const statusFilter = createLowercaseSet(parseListParam(req.query.status));
  const typeFilter = createLowercaseSet(parseListParam(req.query.type));
  const environmentFilter = createLowercaseSet(parseListParam(req.query.environment));
  const tagFilter = createLowercaseSet(parseListParam(req.query.tag_value_ids));
  const keyword = (req.query.keyword || '').trim().toLowerCase();

  const filtered = resourceData.filter((resource) => {
    if (!matchesEnumFilter(resource.status, statusFilter)) return false;
    if (!matchesEnumFilter(resource.type, typeFilter)) return false;
    if (!matchesEnumFilter(resource.environment, environmentFilter)) return false;
    if (tagFilter) {
      const tagIds = normalizeTags(resource.tags)
        .map((tag) => (tag.tag_value_id || `${tag.key}:${tag.value}`))
        .map((id) => id.toLowerCase());
      if (!tagIds.some((id) => tagFilter.has(id))) return false;
    }
    if (keyword) {
      const tagTexts = normalizeTags(resource.tags).map((tag) => `${tag.key}:${tag.value}`.toLowerCase());
      const searchFields = [
        resource.resource_id,
        resource.name,
        resource.ip_address,
        resource.location,
        resource.environment,
        resource.team,
        resource.service_impact,
        ...(tagTexts || [])
      ]
        .filter((value) => typeof value === 'string' && value.length > 0)
        .map((value) => value.toLowerCase());
      const match = searchFields.some((text) => text.includes(keyword));
      if (!match) return false;
    }
    return true;
  });

  const items = filtered.map((resItem) => ({
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
  }));

  res.json(
    paginate(items, req, {
      allowedSortFields: ['updated_at', 'cpu_usage', 'memory_usage', 'name', 'status'],
      defaultSortKey: 'updated_at',
      defaultSortOrder: 'desc'
    })
  );
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
  const keyword = (req.query.keyword || '').trim().toLowerCase();
  const filtered = resourceGroups.filter((group) => {
    if (!keyword) return true;
    const text = `${group.name || ''} ${group.description || ''}`.toLowerCase();
    return text.includes(keyword);
  });

  const items = filtered.map((grp) => ({
    group_id: grp.group_id,
    name: grp.name,
    description: grp.description,
    owner_team_id: grp.owner_team_id || null,
    owner_team: grp.owner_team,
    member_count: grp.member_count,
    subscriber_count: grp.subscriber_count,
    status_summary: grp.status_summary,
    created_at: grp.created_at
  }));

  res.json(
    paginate(items, req, {
      allowedSortFields: ['name', 'created_at', 'member_count', 'subscriber_count'],
      defaultSortKey: 'name',
      defaultSortOrder: 'asc'
    })
  );
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
  const statusFilter = createLowercaseSet(parseListParam(req.query.status));
  const typeFilter = createLowercaseSet(
    parseListParam(req.query.resource_types ?? req.query.type)
  );
  const groupFilter = createLowercaseSet(
    parseListParam(req.query.resource_group_ids ?? req.query.group_ids)
  );
  const tagFilter = createLowercaseSet(
    parseListParam(req.query.tag_value_ids ?? req.query.tags)
  );
  const teamFilter = createLowercaseSet(parseListParam(req.query.team_ids ?? req.query.team_id));

  const graph = buildTopologyGraph({
    statusFilter,
    typeFilter,
    groupFilter,
    tagFilter,
    teamFilter
  });

  res.json(graph);
});

app.get('/dashboards/summary', (req, res) => {
  const published = dashboards.filter((dash) => dash.status === 'published').length;
  const featured = dashboards.filter((dash) => dash.is_featured).length;
  const automated = 1;
  res.json({ total: dashboards.length, published, featured, automated });
});

app.get('/dashboards', (req, res) => {
  const category = (req.query.category || '').trim().toLowerCase();
  const ownerId = (req.query.owner_id || '').trim().toLowerCase();
  const filtered = dashboards.filter((dash) => {
    if (category && String(dash.category || '').toLowerCase() !== category) return false;
    if (ownerId && String(dash.owner_id || '').toLowerCase() !== ownerId) return false;
    return true;
  });

  const items = filtered.map((dash) => ({
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
  }));

  res.json(
    paginate(items, req, {
      allowedSortFields: ['updated_at', 'viewer_count', 'favorite_count', 'name'],
      defaultSortKey: 'updated_at',
      defaultSortOrder: 'desc'
    })
  );
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

app.get('/analysis/capacity', (req, res) => {
  const report = buildCapacityAnalysisReport({ timeRange: req.query?.time_range, model: req.query?.model });
  res.json(report);
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
  const typeFilter = createLowercaseSet(parseListParam(req.query.type));
  const keyword = (req.query.keyword || '').trim().toLowerCase();
  const filtered = automationScripts.filter((script) => {
    if (!matchesEnumFilter(script.type, typeFilter)) return false;
    if (keyword) {
      const text = `${script.name || ''} ${script.description || ''}`.toLowerCase();
      if (!text.includes(keyword)) return false;
    }
    return true;
  });

  const items = filtered.map((script) => toScriptSummary(script));

  res.json(
    paginate(items, req, {
      allowedSortFields: ['updated_at', 'last_execution_at', 'name', 'type', 'last_execution_status'],
      defaultSortKey: 'updated_at',
      defaultSortOrder: 'desc'
    })
  );
});

app.post('/automation/scripts', (req, res) => {
  const payload = req.body || {};
  const nowIso = toISO(new Date());
  const scriptId = `script-${Date.now()}`;
  const versionId = `ver-${Date.now()}`;
  const versionLabel = payload.version || 'v1';
  const versionEntry = {
    version_id: versionId,
    version: versionLabel,
    changelog: payload.changelog || '建立初始版本',
    created_at: nowIso,
    created_by: payload.created_by || currentUser.user_id,
    content: payload.content || ''
  };
  const script = {
    script_id: scriptId,
    name: payload.name || '新腳本',
    type: payload.type || 'shell',
    description: payload.description || '',
    tags: Array.isArray(payload.tags) ? [...payload.tags] : [],
    last_execution_status: 'never',
    last_execution_at: null,
    created_at: nowIso,
    created_by: payload.created_by || currentUser.user_id,
    updated_at: nowIso,
    updated_by: payload.updated_by || currentUser.user_id,
    versions: [versionEntry],
    current_version: { ...versionEntry }
  };
  automationScripts.unshift(script);
  res.status(201).json(toScriptDetail(script));
});

app.get('/automation/scripts/:script_id', (req, res) => {
  const script = getScriptById(req.params.script_id);
  if (!script) return notFound(res, '找不到腳本');
  res.json(toScriptDetail(script));
});

app.patch('/automation/scripts/:script_id', (req, res) => {
  const script = getScriptById(req.params.script_id);
  if (!script) return notFound(res, '找不到腳本');
  const payload = req.body || {};
  const nowIso = toISO(new Date());

  if (Object.prototype.hasOwnProperty.call(payload, 'name')) {
    script.name = payload.name;
  }
  if (Object.prototype.hasOwnProperty.call(payload, 'type') && payload.type) {
    script.type = payload.type;
  }
  if (Object.prototype.hasOwnProperty.call(payload, 'description')) {
    script.description = payload.description;
  }
  if (Array.isArray(payload.tags)) {
    script.tags = [...payload.tags];
  }

  if (
    Object.prototype.hasOwnProperty.call(payload, 'content') ||
    Object.prototype.hasOwnProperty.call(payload, 'version') ||
    Object.prototype.hasOwnProperty.call(payload, 'changelog')
  ) {
    const versionEntry = {
      version_id: `ver-${Date.now()}`,
      version: payload.version || script.current_version?.version || 'v1',
      changelog: payload.changelog || '更新腳本內容',
      created_at: nowIso,
      created_by: payload.updated_by || currentUser.user_id,
      content:
        Object.prototype.hasOwnProperty.call(payload, 'content')
          ? payload.content
          : script.current_version?.content || ''
    };
    script.current_version = { ...versionEntry };
    script.versions = [versionEntry, ...script.versions];
  }

  script.updated_at = nowIso;
  script.updated_by = payload.updated_by || currentUser.user_id;

  res.json(toScriptDetail(script));
});

app.delete('/automation/scripts/:script_id', (req, res) => {
  const index = automationScripts.findIndex((sc) => sc.script_id === req.params.script_id);
  if (index === -1) return notFound(res, '找不到腳本');
  automationScripts.splice(index, 1);
  res.status(204).end();
});

app.post('/automation/scripts/:script_id/execute', (req, res) => {
  const script = getScriptById(req.params.script_id);
  if (!script) return notFound(res, '找不到腳本');
  res.status(202).json({
    execution_id: `exe-${Date.now()}`,
    status: 'pending',
    queued_at: toISO(new Date()),
    script_id: script.script_id,
    script_version: script.current_version?.version || null
  });
});

app.get('/automation/scripts/:script_id/versions', (req, res) => {
  const script = getScriptById(req.params.script_id);
  if (!script) return notFound(res, '找不到腳本');
  const versions = Array.isArray(script.versions)
    ? script.versions.map((version) => summarizeScriptVersion(version))
    : [];
  res.json(
    paginate(versions, req, {
      allowedSortFields: ['created_at', 'version'],
      defaultSortKey: 'created_at',
      defaultSortOrder: 'desc'
    })
  );
});

app.get('/automation/schedules', (req, res) => {
  const statusFilter = createLowercaseSet(parseListParam(req.query.status));
  const filtered = automationSchedules.filter((sch) => matchesEnumFilter(sch.status, statusFilter));
  const items = filtered.map((sch) => ({
    schedule_id: sch.schedule_id,
    name: sch.name,
    type: sch.type,
    status: sch.status,
    cron_expression: sch.cron_expression,
    next_run_time: sch.next_run_time,
    script_id: sch.script_id,
    script_name: sch.script_name
  }));

  res.json(
    paginate(items, req, {
      allowedSortFields: ['next_run_time', 'name', 'status', 'cron_expression'],
      defaultSortKey: 'next_run_time',
      defaultSortOrder: 'asc'
    })
  );
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
  const payload = req.body || {};
  if (typeof payload.enabled === 'boolean') {
    schedule.status = payload.enabled ? 'enabled' : 'disabled';
  } else if (typeof payload.status === 'string') {
    schedule.status = payload.status.toLowerCase() === 'disabled' ? 'disabled' : 'enabled';
  } else {
    schedule.status = schedule.status === 'enabled' ? 'disabled' : 'enabled';
  }
  schedule.updated_at = toISO(new Date());
  res.json(schedule);
});

app.get('/automation/executions', (req, res) => {
  const statusFilter = createLowercaseSet(parseListParam(req.query.status));
  const scriptIds = parseListParam(req.query.script_id);
  const filtered = automationExecutions.filter((execution) => {
    if (!matchesEnumFilter(execution.status, statusFilter)) return false;
    if (scriptIds && scriptIds.length > 0 && !scriptIds.includes(execution.script_id)) return false;
    return true;
  });

  res.json(
    paginate(filtered, req, {
      allowedSortFields: ['start_time', 'status', 'duration_ms'],
      defaultSortKey: 'start_time',
      defaultSortOrder: 'desc'
    })
  );
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

app.get('/iam/invitations', (req, res) => {
  const statusFilter = createLowercaseSet(parseListParam(req.query.status));
  const keyword = (req.query.keyword || '').trim().toLowerCase();

  const filtered = iamInvitations.filter((invitation) => {
    if (!matchesEnumFilter(invitation.status, statusFilter)) return false;
    if (keyword) {
      const text = `${invitation.email || ''} ${invitation.name || ''}`.toLowerCase();
      if (!text.includes(keyword)) return false;
    }
    return true;
  });

  res.json(
    paginate(filtered, req, {
      allowedSortFields: ['email', 'status', 'invited_at', 'expires_at', 'last_sent_at'],
      defaultSortKey: 'invited_at',
      defaultSortOrder: 'desc'
    })
  );
});

app.post('/iam/invitations', (req, res) => {
  const payload = req.body || {};
  const email = typeof payload.email === 'string' ? payload.email.trim() : '';
  if (!email) {
    return res.status(400).json({ code: 'invalid_request', message: '請提供邀請 Email。' });
  }
  const expiresAtDate = parseDateSafe(payload.expires_at) || new Date(Date.now() + 7 * 86400000);
  const nowIso = toISO(new Date());
  const invitation = {
    invitation_id: `inv-${Date.now()}`,
    email,
    name: typeof payload.name === 'string' && payload.name.trim().length > 0 ? payload.name.trim() : null,
    status: 'invitation_sent',
    invited_by: currentUser.user_id,
    invited_by_name: currentUser.display_name,
    invited_at: nowIso,
    last_sent_at: nowIso,
    expires_at: toISO(expiresAtDate),
    accepted_at: null
  };
  iamInvitations.unshift(invitation);
  res.status(201).json(invitation);
});

app.get('/iam/users', (req, res) => {
  const statusFilter = createLowercaseSet(parseListParam(req.query.status));
  const keyword = (req.query.keyword || '').trim().toLowerCase();
  const filtered = iamUsers.filter((user) => {
    if (!matchesEnumFilter(user.status, statusFilter)) return false;
    if (keyword) {
      const text = `${user.display_name || ''} ${user.username || ''} ${user.email || ''}`.toLowerCase();
      if (!text.includes(keyword)) return false;
    }
    return true;
  });

  res.json(
    paginate(filtered, req, {
      allowedSortFields: ['display_name', 'username', 'status', 'last_login'],
      defaultSortKey: 'display_name',
      defaultSortOrder: 'asc'
    })
  );
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
  const keyword = (req.query.keyword || '').trim().toLowerCase();
  const filtered = iamTeams.filter((team) => {
    if (!keyword) return true;
    const text = `${team.name || ''} ${team.description || ''}`.toLowerCase();
    return text.includes(keyword);
  });

  const items = filtered.map((team) => ({
    team_id: team.team_id,
    name: team.name,
    description: team.description,
    owner: team.owner,
    members: team.members,
    subscribers: team.subscribers,
    created_at: team.created_at
  }));

  res.json(
    paginate(items, req, {
      allowedSortFields: ['name', 'created_at', 'team_id'],
      defaultSortKey: 'name',
      defaultSortOrder: 'asc'
    })
  );
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

app.get('/notification-config/strategies', (req, res) => {
  const statusFilter = createLowercaseSet(parseListParam(req.query.status));
  const priorityFilter = createLowercaseSet(parseListParam(req.query.priority));
  const channelTypeFilter = createLowercaseSet(parseListParam(req.query.channel_types ?? req.query.channel_type));
  const channelIdFilter = createLowercaseSet(parseListParam(req.query.channel_ids ?? req.query.channel_id));
  const severityFilter = createLowercaseSet(parseListParam(req.query.severity));
  const recipientTypeFilter = createLowercaseSet(
    parseListParam(req.query.recipient_types ?? req.query.recipient_type)
  );
  const keyword = typeof req.query.keyword === 'string' ? req.query.keyword.trim().toLowerCase() : '';

  const filtered = notificationStrategies.filter((strategy) => {
    const statusValue = strategy.enabled ? 'enabled' : 'disabled';
    if (!matchesEnumFilter(statusValue, statusFilter)) return false;

    const priorityValue = strategy.priority || 'medium';
    if (!matchesEnumFilter(priorityValue, priorityFilter)) return false;

    const channels = Array.isArray(strategy.channels) ? strategy.channels : [];
    if (channelTypeFilter) {
      const hasChannelType = channels.some((channel) => matchesEnumFilter(channel.channel_type, channelTypeFilter));
      if (!hasChannelType) return false;
    }

    if (channelIdFilter) {
      const hasChannelId = channels.some((channel) => matchesEnumFilter(channel.channel_id, channelIdFilter));
      if (!hasChannelId) return false;
    }

    if (severityFilter) {
      const severities = Array.isArray(strategy.severity_filters) ? strategy.severity_filters : [];
      const hasSeverity = severities.some((severity) => matchesEnumFilter(severity, severityFilter));
      if (!hasSeverity) return false;
    }

    if (recipientTypeFilter) {
      const recipients = Array.isArray(strategy.recipients) ? strategy.recipients : [];
      const hasRecipient = recipients.some((recipient) => matchesEnumFilter(recipient.type, recipientTypeFilter));
      if (!hasRecipient) return false;
    }

    if (keyword) {
      const haystack = [strategy.name, strategy.description, strategy.trigger_condition]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      if (!haystack.includes(keyword)) return false;
    }

    return true;
  });

  const items = filtered.map((strategy) => {
    const channels = Array.isArray(strategy.channels) ? strategy.channels : [];
    return {
      strategy_id: strategy.strategy_id,
      name: strategy.name,
      trigger_condition: strategy.trigger_condition,
      channel_count: channels.length,
      enabled: Boolean(strategy.enabled),
      priority: strategy.priority || 'medium'
    };
  });

  if ((req.query.format || 'json').toLowerCase() === 'csv') {
    const csv = toCsv(filtered, [
      { key: 'strategy_id' },
      { key: 'name' },
      { header: 'enabled', value: (row) => (row.enabled ? 'true' : 'false') },
      { key: 'priority', value: (row) => row.priority || 'medium' },
      {
        header: 'channel_count',
        value: (row) => (Array.isArray(row.channels) ? row.channels.length : 0)
      },
      { key: 'trigger_condition' },
      {
        header: 'severity_filters',
        value: (row) => (Array.isArray(row.severity_filters) ? row.severity_filters.join(';') : '')
      },
      {
        header: 'linked_silence_ids',
        value: (row) => (Array.isArray(row.linked_silence_ids) ? row.linked_silence_ids.join(';') : '')
      }
    ]);
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    return res.send(csv);
  }

  res.json(
    paginate(items, req, {
      allowedSortFields: ['name', 'enabled', 'priority', 'channel_count'],
      defaultSortKey: 'name',
      defaultSortOrder: 'asc'
    })
  );
});

app.post('/notification-config/strategies', (req, res) => {
  const payload = req.body || {};
  const strategy = {
    strategy_id: `str-${Date.now()}`,
    name: payload.name || '新策略',
    description: payload.description || '',
    trigger_condition: payload.trigger_condition || 'true',
    enabled: payload.enabled ?? true,
    priority: payload.priority || 'medium',
    severity_filters: payload.severity_filters || [],
    recipients: payload.recipients || [],
    channels: payload.channels || [],
    resource_filters: payload.resource_filters || {},
    retry_policy: mergeSettings(defaultRetryPolicy, payload.retry_policy),
    delivery_settings: mergeSettings(defaultDeliverySettings, payload.delivery_settings),
    snooze_settings: mergeSettings(defaultSnoozeSettings, payload.snooze_settings),
    linked_silence_ids: Array.isArray(payload.linked_silence_ids)
      ? [...payload.linked_silence_ids]
      : [],
    created_at: toISO(new Date()),
    updated_at: toISO(new Date())
  };
  notificationStrategies.push(strategy);
  res.status(201).json(mapNotificationStrategyDetail(strategy));
});

app.get('/notification-config/strategies/:strategy_id', (req, res) => {
  const strategy = getNotificationStrategyById(req.params.strategy_id);
  if (!strategy) return notFound(res, '找不到通知策略');
  res.json(mapNotificationStrategyDetail(strategy));
});

app.patch('/notification-config/strategies/:strategy_id', (req, res) => {
  const strategy = getNotificationStrategyById(req.params.strategy_id);
  if (!strategy) return notFound(res, '找不到通知策略');
  const payload = req.body || {};
  if (payload.name !== undefined) strategy.name = payload.name;
  if (payload.description !== undefined) strategy.description = payload.description;
  if (payload.trigger_condition !== undefined) strategy.trigger_condition = payload.trigger_condition;
  if (payload.priority !== undefined) strategy.priority = payload.priority;
  if (payload.severity_filters !== undefined) strategy.severity_filters = payload.severity_filters;
  if (payload.recipients !== undefined) strategy.recipients = payload.recipients;
  if (payload.channels !== undefined) strategy.channels = payload.channels;
  if (payload.resource_filters !== undefined) strategy.resource_filters = payload.resource_filters;
  if (payload.enabled !== undefined) strategy.enabled = payload.enabled;
  if (payload.retry_policy !== undefined) {
    strategy.retry_policy = mergeSettings(defaultRetryPolicy, payload.retry_policy);
  }
  if (payload.delivery_settings !== undefined) {
    strategy.delivery_settings = mergeSettings(defaultDeliverySettings, payload.delivery_settings);
  }
  if (payload.snooze_settings !== undefined) {
    strategy.snooze_settings = mergeSettings(defaultSnoozeSettings, payload.snooze_settings);
  }
  if (payload.linked_silence_ids !== undefined) {
    strategy.linked_silence_ids = Array.isArray(payload.linked_silence_ids)
      ? [...payload.linked_silence_ids]
      : [];
  }
  strategy.updated_at = toISO(new Date());
  res.json(mapNotificationStrategyDetail(strategy));
});

app.delete('/notification-config/strategies/:strategy_id', (req, res) => {
  const strategy = getNotificationStrategyById(req.params.strategy_id);
  if (!strategy) return notFound(res, '找不到通知策略');
  res.status(204).end();
});

app.post('/notification-config/strategies/:strategy_id/test', (req, res) => {
  const strategy = getNotificationStrategyById(req.params.strategy_id);
  if (!strategy) return notFound(res, '找不到通知策略');
  const detail = mapNotificationStrategyDetail(strategy);
  res.json({
    status: 'success',
    message: '已發送測試通知',
    details: { recipients: detail.recipients, channels: detail.channels }
  });
});

app.get('/notification-config/channels', (req, res) => {
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

app.post('/notification-config/channels', (req, res) => {
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

app.post('/notification-config/channels/:channel_id/test', (req, res) => {
  const channel = getNotificationChannelById(req.params.channel_id);
  if (!channel) return notFound(res, '找不到通知管道');
  channel.last_tested_at = toISO(new Date());
  channel.last_test_result = 'success';
  channel.last_test_message = '測試通知已發送';
  res.json({ status: 'success', message: '測試通知已發送' });
});

app.get('/notification-config/channels/:channel_id', (req, res) => {
  const channel = getNotificationChannelById(req.params.channel_id);
  if (!channel) return notFound(res, '找不到通知管道');
  res.json(channel);
});

app.patch('/notification-config/channels/:channel_id', (req, res) => {
  const channel = getNotificationChannelById(req.params.channel_id);
  if (!channel) return notFound(res, '找不到通知管道');
  Object.assign(channel, req.body || {}, { updated_at: toISO(new Date()) });
  res.json(channel);
});

app.delete('/notification-config/channels/:channel_id', (req, res) => {
  const channel = getNotificationChannelById(req.params.channel_id);
  if (!channel) return notFound(res, '找不到通知管道');
  res.status(204).end();
});

app.get('/notification-config/history', (req, res) => {
  const statusFilter = createLowercaseSet(parseListParam(req.query.status));
  const channelTypeFilter = createLowercaseSet(parseListParam(req.query.channel_types ?? req.query.channel_type));
  const channelIdFilter = createLowercaseSet(parseListParam(req.query.channel_ids ?? req.query.channel_id));
  const strategyIdFilter = createLowercaseSet(parseListParam(req.query.strategy_ids ?? req.query.strategy_id));
  const eventIdFilter = createLowercaseSet(parseListParam(req.query.event_ids ?? req.query.event_id));
  const resendAvailableFilter = parseBooleanParam(req.query.resend_available);
  const hasErrorFilter = parseBooleanParam(req.query.has_error);
  const keyword = typeof req.query.keyword === 'string' ? req.query.keyword.trim().toLowerCase() : '';
  const startTime = parseDateSafe(req.query.start_time);
  const endTime = parseDateSafe(req.query.end_time);

  const items = notificationHistory
    .filter((record) => {
      if (!matchesEnumFilter(record.status, statusFilter)) return false;
      if (!matchesEnumFilter(record.channel_type, channelTypeFilter)) return false;
      if (!matchesEnumFilter(record.channel_id, channelIdFilter)) return false;
      if (!matchesEnumFilter(record.strategy_id, strategyIdFilter)) return false;
      if (!matchesEnumFilter(record.related_event_id, eventIdFilter)) return false;

      if (resendAvailableFilter !== null) {
        const available = Boolean(record.resend_available);
        if (available !== resendAvailableFilter) return false;
      }

      if (hasErrorFilter !== null) {
        const hasError = Boolean(record.error_message);
        if (hasError !== hasErrorFilter) return false;
      }

      const sentAt = parseDateSafe(record.sent_at);
      if (startTime && (!sentAt || sentAt < startTime)) return false;
      if (endTime && (!sentAt || sentAt > endTime)) return false;

      if (keyword) {
        const recipientTokens = getRecipientSearchTokens(record.recipients);
        const actorTokens = record.last_resend_by?.display_name
          ? [record.last_resend_by.display_name]
          : [];
        const haystack = [
          record.strategy_name,
          record.strategy_id,
          record.channel_label,
          record.channel_type,
          record.alert_title,
          record.message,
          ...recipientTokens,
          ...actorTokens
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();
        if (!haystack.includes(keyword)) return false;
      }

      return true;
    })
    .map(mapNotificationHistorySummary);

  res.json(
    paginate(items, req, {
      allowedSortFields: ['sent_at', 'status', 'channel_type', 'duration_ms', 'resend_count'],
      defaultSortKey: 'sent_at',
      defaultSortOrder: 'desc'
    })
  );
});

app.get('/notification-config/history/:record_id', (req, res) => {
  const record = getHistoryById(req.params.record_id);
  if (!record) return notFound(res, '找不到通知紀錄');
  const resendJobs = notificationResendJobs
    .filter((job) => job.notification_history_id === record.record_id)
    .map(mapNotificationResendJob);
  res.json({ ...record, resend_jobs: resendJobs });
});

app.post('/notification-config/history/purge', (req, res) => {
  const payload = req.body || {};
  const before = parseDateSafe(payload.before);
  if (!before) {
    return res
      .status(400)
      .json({ code: 'INVALID_REQUEST', message: 'before 必須為有效的 ISO 8601 時間字串' });
  }

  const statusFilter = createLowercaseSet(parseListParam(payload.status));
  const channelTypeFilter = createLowercaseSet(parseListParam(payload.channel_types));
  const strategyIdFilter = createLowercaseSet(parseListParam(payload.strategy_ids));
  const channelIdFilter = createLowercaseSet(parseListParam(payload.channel_ids));
  const dryRunFlag = parseBooleanParam(payload.dry_run);
  const isDryRun = dryRunFlag === null ? false : dryRunFlag;
  const maxRecordsInput = Number(payload.max_records);
  const maxRecords = Number.isFinite(maxRecordsInput) && maxRecordsInput > 0 ? Math.floor(maxRecordsInput) : null;

  const matchedRecords = notificationHistory
    .filter((record) => {
      const sentAt = parseDateSafe(record.sent_at);
      if (!sentAt || !(sentAt < before)) return false;
      if (!matchesEnumFilter(record.status, statusFilter)) return false;
      if (!matchesEnumFilter(record.channel_type, channelTypeFilter)) return false;
      if (!matchesEnumFilter(record.strategy_id, strategyIdFilter)) return false;
      if (!matchesEnumFilter(record.channel_id, channelIdFilter)) return false;
      return true;
    })
    .sort((a, b) => {
      const left = parseDateSafe(a.sent_at)?.getTime() ?? 0;
      const right = parseDateSafe(b.sent_at)?.getTime() ?? 0;
      return left - right;
    });

  const limitedRecords = maxRecords ? matchedRecords.slice(0, maxRecords) : matchedRecords;
  const matchedIds = new Set(limitedRecords.map((item) => item.record_id));

  if (!isDryRun && matchedIds.size > 0) {
    for (let i = notificationHistory.length - 1; i >= 0; i -= 1) {
      if (matchedIds.has(notificationHistory[i].record_id)) {
        notificationHistory.splice(i, 1);
      }
    }
    for (let i = notificationResendJobs.length - 1; i >= 0; i -= 1) {
      if (matchedIds.has(notificationResendJobs[i].notification_history_id)) {
        notificationResendJobs.splice(i, 1);
      }
    }
  }

  res.json({
    matched_count: matchedRecords.length,
    deleted_count: isDryRun ? 0 : matchedIds.size,
    dry_run: isDryRun,
    message: isDryRun
      ? 'Dry run 完成，未刪除任何通知紀錄'
      : `已刪除 ${matchedIds.size} 筆通知紀錄`
  });
});

app.get('/settings/widgets', (req, res) => {
  const pagePath = typeof req.query.page_path === 'string' ? req.query.page_path.trim() : '';
  const items = layoutWidgets.filter((widget) => {
    if (!pagePath) return true;
    const supported = Array.isArray(widget.supported_pages) ? widget.supported_pages : [];
    return supported.includes(pagePath);
  });
  res.json(items.map(mapLayoutWidgetDefinition));
});

app.get('/settings/layouts', (req, res) => {
  const pagePath = typeof req.query.page_path === 'string' ? req.query.page_path.trim() : '';
  if (!pagePath) {
    return res.status(400).json({ code: 'INVALID_REQUEST', message: 'page_path 參數為必填。' });
  }

  const scopeTypeRaw = typeof req.query.scope_type === 'string' ? req.query.scope_type.trim().toLowerCase() : null;
  const scopeType = scopeTypeRaw && scopeTypeRaw.length > 0 ? scopeTypeRaw : null;
  if (scopeType && !allowedLayoutScopeTypes.has(scopeType)) {
    return res.status(400).json({ code: 'INVALID_REQUEST', message: 'scope_type 參數無效。' });
  }

  const scopeIdRaw = typeof req.query.scope_id === 'string' ? req.query.scope_id.trim() : null;
  if ((scopeType === 'user' || scopeType === 'role') && (!scopeIdRaw || scopeIdRaw.length === 0)) {
    return res.status(400).json({ code: 'INVALID_REQUEST', message: 'scope_id 參數為必填。' });
  }

  const resolution = resolveLayoutForRequest(pagePath, {
    scopeType,
    scopeId: scopeType === 'global' ? null : scopeIdRaw
  });

  const matchedEntry = resolution.fallback_chain.find((entry) => entry.matched) || null;
  const matchedRecord = resolution.record;
  const layoutRecord =
    matchedRecord === null
      ? null
      : {
        ...matchedRecord,
        widgets: matchedRecord.widgets.map((widget) => ({ ...widget }))
      };

  res.json({
    page_path: pagePath,
    resolved_scope_type: matchedEntry?.scope_type ?? 'global',
    resolved_scope_id: matchedEntry?.scope_id ?? null,
    widgets: matchedRecord ? matchedRecord.widgets.map((widget) => ({ ...widget })) : [],
    layout_record: layoutRecord,
    fallback_chain: resolution.fallback_chain,
    updated_at: matchedRecord?.updated_at ?? null
  });
});

app.put('/settings/layouts', (req, res) => {
  const payload = req.body || {};
  const pagePath = typeof payload.page_path === 'string' ? payload.page_path.trim() : '';
  const scopeTypeRaw = typeof payload.scope_type === 'string' ? payload.scope_type.trim().toLowerCase() : '';
  if (!pagePath) {
    return res.status(400).json({ code: 'INVALID_REQUEST', message: 'page_path 參數為必填。' });
  }
  if (!allowedLayoutScopeTypes.has(scopeTypeRaw)) {
    return res.status(400).json({ code: 'INVALID_REQUEST', message: 'scope_type 參數無效。' });
  }

  let scopeId = null;
  if (scopeTypeRaw === 'user' || scopeTypeRaw === 'role') {
    if (typeof payload.scope_id !== 'string' || payload.scope_id.trim().length === 0) {
      return res.status(400).json({ code: 'INVALID_REQUEST', message: 'scope_id 參數為必填。' });
    }
    scopeId = payload.scope_id.trim();
  }

  if (!Array.isArray(payload.widgets)) {
    return res.status(400).json({ code: 'INVALID_REQUEST', message: 'widgets 參數必須為陣列。' });
  }

  const catalog = new Set(layoutWidgets.map((widget) => widget.widget_id));
  const widgetIdSet = new Set();
  const sanitizedWidgets = [];
  for (const item of payload.widgets) {
    if (!item || typeof item.widget_id !== 'string' || item.widget_id.trim().length === 0) {
      return res.status(400).json({ code: 'INVALID_REQUEST', message: 'widget_id 為必填欄位。' });
    }
    const widgetId = item.widget_id.trim();
    if (!catalog.has(widgetId)) {
      return res.status(400).json({ code: 'INVALID_REQUEST', message: `未知的 widget_id: ${widgetId}` });
    }
    if (widgetIdSet.has(widgetId)) {
      return res.status(400).json({ code: 'INVALID_REQUEST', message: 'widgets 不可包含重複的 widget_id。' });
    }
    const order = Number(item.order);
    if (!Number.isInteger(order) || order < 1) {
      return res.status(400).json({ code: 'INVALID_REQUEST', message: 'order 必須為大於 0 的整數。' });
    }
    widgetIdSet.add(widgetId);
    sanitizedWidgets.push({ widget_id: widgetId, order });
  }

  sanitizedWidgets.sort((a, b) => a.order - b.order);

  let record = findLayoutRecord(pagePath, scopeTypeRaw, scopeId);
  const timestamp = toISO(new Date());
  if (record) {
    record.widgets = sanitizedWidgets;
    record.updated_at = timestamp;
    record.updated_by = currentUser.user_id;
  } else {
    record = {
      layout_id: `layout-${Date.now().toString(16)}-${Math.random().toString(16).slice(2, 6)}`,
      page_path: pagePath,
      scope_type: scopeTypeRaw,
      scope_id: scopeTypeRaw === 'global' ? null : scopeId,
      widgets: sanitizedWidgets,
      created_at: timestamp,
      updated_at: timestamp,
      updated_by: currentUser.user_id
    };
    pageLayouts.push(record);
  }

  res.json({ ...record, widgets: record.widgets.map((widget) => ({ ...widget })) });
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

app.get('/settings/email', (req, res) => res.json(emailSettings));

app.put('/settings/email', (req, res) => {
  const { channel_id, channel_name } = emailSettings;
  Object.assign(emailSettings, req.body || {}, {
    channel_id,
    channel_name,
    updated_at: toISO(new Date())
  });
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
  const payload = req.body || {};
  if (authSettings.read_only && payload.managed_by !== 'custom') {
    return res.status(400).json({
      code: 'READ_ONLY_SETTING',
      message: '身份驗證設定由外部系統管理，請改為 managed_by="custom" 後再修改。',
      details: { managed_by: authSettings.managed_by }
    });
  }

  if (typeof payload.oidc_enabled === 'boolean') {
    authSettings.oidc_enabled = payload.oidc_enabled;
  }
  if (payload.provider) {
    authSettings.provider = payload.provider;
  }

  const nextManagedBy = payload.managed_by || authSettings.managed_by;
  authSettings.managed_by = nextManagedBy;
  authSettings.read_only = nextManagedBy !== 'custom';

  ['realm', 'client_id', 'auth_url', 'token_url', 'userinfo_url', 'redirect_uri', 'logout_url'].forEach((field) => {
    if (Object.prototype.hasOwnProperty.call(payload, field)) {
      authSettings[field] = payload[field] || null;
    }
  });

  if (Array.isArray(payload.scopes)) {
    authSettings.scopes = payload.scopes;
  }
  if (typeof payload.user_sync === 'boolean') {
    authSettings.user_sync = payload.user_sync;
  }
  if (payload.client_secret) {
    const secret = String(payload.client_secret);
    const maskLength = Math.max(secret.length - 2, 2);
    authSettings.client_secret_hint = `${secret[0]}${'*'.repeat(maskLength)}${secret[secret.length - 1]}`;
  }

  authSettings.updated_at = toISO(new Date());
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
const batchOperations = new Map();
const scanTasks = new Map();

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
