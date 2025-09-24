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
// 修正: 統一 event-rules -> alert-rules
const buildAlertRule = (rule) => {
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
    triggered_at: toISO(new Date(now.getTime() - 15 * 60000)),
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
        triggered_at: toISO(new Date(now.getTime() - 40 * 60000))
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
    triggered_at: toISO(new Date(now.getTime() - 45 * 60000)),
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

const alertRuleTemplates = [
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

const alertRules = [
  buildAlertRule({
    rule_uid: 'rule-001',
    name: 'API 延遲監控',
    description: '監控交易 API 延遲，超過閾值即觸發事件。',
    severity: 'critical',
    default_priority: 'P0',
    enabled: true,
    automation_enabled: true,
    template_key: 'api_latency',
    creator: { user_id: 'user-001', display_name: '林佳瑜' },
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
  buildAlertRule({
    rule_uid: 'rule-002',
    name: '資料庫延遲監控',
    description: '觀察資料庫連線與查詢延遲。',
    severity: 'warning',
    default_priority: 'P2',
    enabled: true,
    automation_enabled: false,
    template_key: 'db_latency',
    creator: { user_id: 'user-001', display_name: '林佳瑜' },
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
    creator: { user_id: 'user-001', display_name: '林佳瑜' }
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
    service_impact: '交易 API',
    notes: '主要服務外部交易流量，需要高可用度。',
    last_event_count: 3,
    tags: [
      { tag_id: 'tag-001', tag_value_id: 'tag-001-v1', key: 'env', value: 'production', assigned_at: toISO(new Date(now.getTime() - 172800000)) },
      { tag_id: 'tag-002', tag_value_id: 'tag-002-v1', key: 'tier', value: 'frontend', assigned_at: toISO(new Date(now.getTime() - 86400000)) }
    ],
    groups: ['grp-001'],
    created_at: toISO(new Date(now.getTime() - 604800000)),
    updated_at: toISO(now),
    deleted_at: null
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
    service_impact: '讀取節點',
    notes: '供應交易資料庫的讀取節點，需監控延遲。',
    last_event_count: 2,
    tags: [
      { tag_id: 'tag-001', tag_value_id: 'tag-001-v1', key: 'env', value: 'production', assigned_at: toISO(new Date(now.getTime() - 604800000)) },
      { tag_id: 'tag-003', tag_value_id: 'tag-003-v1', key: 'role', value: 'read-replica', assigned_at: toISO(new Date(now.getTime() - 259200000)) }
    ],
    groups: ['grp-002'],
    created_at: toISO(new Date(now.getTime() - 2592000000)),
    updated_at: toISO(now),
    deleted_at: null
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
    service_impact: '快取層',
    notes: '提供 Web 交易熱資料快取。',
    last_event_count: 1,
    tags: [
      { tag_id: 'tag-001', tag_value_id: 'tag-001-v2', key: 'env', value: 'staging', assigned_at: toISO(new Date(now.getTime() - 432000000)) },
      { tag_id: 'tag-003', tag_value_id: 'tag-003-v2', key: 'role', value: 'cache', assigned_at: toISO(new Date(now.getTime() - 216000000)) }
    ],
    groups: ['grp-001'],
    created_at: toISO(new Date(now.getTime() - 1209600000)),
    updated_at: toISO(new Date(now.getTime() - 1800000)),
    deleted_at: null
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
    status_summary: { healthy: 1, warning: 1, critical: 0 },
    created_at: toISO(new Date(now.getTime() - 777600000)),
    members: [
      { resource_id: 'res-001', name: 'web-01', type: 'service', status: 'warning' },
      { resource_id: 'res-003', name: 'redis-cache', type: 'cache', status: 'healthy' }
    ],
    deleted_at: null
  },
  {
    group_id: 'grp-002',
    name: '交易資料庫集群',
    description: '主從資料庫節點',
    owner_team_id: 'team-db',
    owner_team: '資料庫團隊',
    member_count: 1,
    status_summary: { healthy: 0, warning: 1, critical: 0 },
    created_at: toISO(new Date(now.getTime() - 1036800000)),
    members: [
      { resource_id: 'res-002', name: 'rds-read-1', type: 'database', status: 'warning' }
    ],
    deleted_at: null
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
    dashboard_type: 'built_in',
    category: '戰情室',
    creator: { user_id: 'team-war-room', display_name: '事件指揮中心' },
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
    grafana_url: 'http://localhost:3000/d/sre-war-room',
    published_at: toISO(new Date(now.getTime() - 86400000)),
    updated_at: toISO(new Date(now.getTime() - 3600000)),
    deleted_at: null,
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
    creator: { user_id: 'user-001', display_name: '林佳瑜' },
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
    last_login_at: toISO(now),
    created_at: toISO(new Date(now.getTime() - 120 * 86400000)),
    updated_at: toISO(new Date(now.getTime() - 3600000)),
    deleted_at: null
  },
  {
    user_id: 'user-002',
    username: 'ops.chen',
    display_name: '陳昱安',
    email: 'ops.chen@example.com',
    status: 'active',
    teams: ['ops'],
    roles: ['ops'],
    last_login_at: toISO(new Date(now.getTime() - 7200000)),
    created_at: toISO(new Date(now.getTime() - 200 * 86400000)),
    updated_at: toISO(new Date(now.getTime() - 7200000)),
    deleted_at: null
  },
  {
    user_id: 'user-003',
    username: 'db.tsai',
    display_name: '蔡敏豪',
    email: 'db.tsai@example.com',
    status: 'active',
    teams: ['team-db'],
    roles: ['db-admin'],
    last_login_at: toISO(new Date(now.getTime() - 14400000)),
    created_at: toISO(new Date(now.getTime() - 220 * 86400000)),
    updated_at: toISO(new Date(now.getTime() - 14400000)),
    deleted_at: null
  }
];

const iamTeams = [
  {
    team_id: 'team-sre',
    name: 'SRE 核心小組',
    description: '負責平台可靠性維運',
    creator: { user_id: 'user-001', display_name: '林佳瑜' },
    created_at: toISO(new Date(now.getTime() - 2592000000)),
    members: ['user-001', 'user-002'],
    member_ids: ['user-001', 'user-002'],
    subscribers: ['user-003', 'chn-001'],
    subscriber_ids: ['user-003', 'chn-001'],
    subscriber_details: [
      { subscriber_id: 'user-003', subscriber_type: 'USER', display_name: '陳昱安' },
      { subscriber_id: 'chn-001', subscriber_type: 'SLACK_CHANNEL', display_name: '#sre-alert' }
    ],
    deleted_at: null
  },
  {
    team_id: 'team-db',
    name: '資料庫團隊',
    description: '管理資料庫平台與效能',
    creator: { user_id: 'user-003', display_name: '蔡敏豪' },
    created_at: toISO(new Date(now.getTime() - 3456000000)),
    members: ['user-003'],
    member_ids: ['user-003'],
    subscribers: [],
    subscriber_ids: [],
    subscriber_details: [],
    deleted_at: null
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
    updated_at: toISO(new Date(now.getTime() - 604800000)),
    deleted_at: null
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
    updated_at: toISO(new Date(now.getTime() - 432000000)),
    deleted_at: null
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
    last_tested_at: toISO(new Date(now.getTime() - 7200000)),
    deleted_at: null
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
    last_tested_at: toISO(new Date(now.getTime() - 86400000)),
    deleted_at: null
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
    updated_at: toISO(new Date(now.getTime() - 86400000)),
    deleted_at: null
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

// 修正: `trigger_time` -> `triggered_at`
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
  triggered_at: event.triggered_at,
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

// 修正: 移除即時指標欄位
const buildResourceDetail = (resource) => ({
  resource_id: resource.resource_id,
  name: resource.name,
  status: resource.status,
  type: resource.type,
  ip_address: resource.ip_address,
  location: resource.location,
  environment: resource.environment,
  team_id: resource.team_id,
  team: resource.team,
  os: resource.os,
  service_impact: resource.service_impact,
  notes: resource.notes,
  last_event_count: resource.last_event_count,
  tags: cloneTags(resource.tags),
  groups: buildResourceGroupRefs(resource.groups),
  silences: getSilencesForResource(resource.resource_id),
  created_at: resource.created_at,
  updated_at: resource.updated_at
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
    creator: team.creator,
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
    // 修正: 移除對已刪除欄位的依賴
    defaultValue = 60;
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
// 修正: event-rules -> alert-rules
const getAlertRuleByUid = (id) => alertRules.find((rule) => rule.rule_uid === id);
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
    // 修正: 移除對已刪除欄位的依賴
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

    const eventTime = parseDateSafe(event.triggered_at); // 修正: trigger_time -> triggered_at
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
      const rule = event.rule_uid ? getAlertRuleByUid(event.rule_uid) : null; // 修正: getEventRuleByUid -> getAlertRuleByUid
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
      allowedSortFields: ['triggered_at', 'severity', 'status', 'priority', 'summary'],
      defaultSortKey: 'triggered_at',
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
  const defaultPriority = alertRules.find((rule) => rule.rule_uid === payload.rule_uid)?.default_priority || 'P2'; // 修正: eventRules -> alertRules
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
    rule_name: alertRules.find((rule) => rule.rule_uid === payload.rule_uid)?.name || null, // 修正: eventRules -> alertRules
    trigger_threshold: payload.trigger_threshold || null,
    trigger_value: payload.trigger_value || null,
    unit: payload.unit || null,
    triggered_at: payload.triggered_at || toISO(new Date()), // 修正: trigger_time -> triggered_at
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

// 修正: 移除 /events/:event_id/silence 端點，其功能已合併到 POST /silence-rules

// 修正: /event-rules -> /alert-rules
app.get('/alert-rules/summary', (req, res) => {
  const enabled = alertRules.filter((rule) => rule.enabled).length;
  const automation = alertRules.filter((rule) => rule.automation?.enabled).length;
  res.json({ total: alertRules.length, enabled, automation_enabled: automation });
});

app.get('/alert-rules/templates', (req, res) => {
  const severityFilter = createLowercaseSet(parseListParam(req.query.severity));
  const keyword = (req.query.keyword || '').trim().toLowerCase();

  const templates = alertRuleTemplates.filter((tpl) => {
    if (!matchesEnumFilter(tpl.severity, severityFilter)) return false;
    if (keyword) {
      const text = `${tpl.name} ${tpl.description || ''}`.toLowerCase();
      if (!text.includes(keyword)) return false;
    }
    return true;
  });

  res.json(templates);
});

app.get('/alert-rules', (req, res) => {
  const severityFilter = createLowercaseSet(parseListParam(req.query.severity));
  const enabledFilter = parseBooleanParam(req.query.enabled);
  const keyword = (req.query.keyword || '').trim().toLowerCase();
  const automationEnabledFilter = parseBooleanParam(req.query.automation_enabled);
  const syncStatusFilter = createLowercaseSet(parseListParam(req.query.sync_status));
  const hasTemplateFilter = parseBooleanParam(req.query.has_template);

  const filtered = alertRules.filter((rule) => {
    if (!matchesEnumFilter(rule.severity, severityFilter)) return false;
    if (enabledFilter !== null && Boolean(rule.enabled) !== enabledFilter) return false;
    if (automationEnabledFilter !== null && Boolean(rule.automation_enabled) !== automationEnabledFilter) return false;
    if (!matchesEnumFilter(rule.sync_status, syncStatusFilter)) return false;
    if (hasTemplateFilter !== null) {
      if (hasTemplateFilter && !rule.template_key) return false;
      if (!hasTemplateFilter && rule.template_key) return false;
    }

    if (keyword) {
      const text = `${rule.name || ''} ${rule.description || ''} ${rule.rule_uid || ''} ${rule.target || ''}`.toLowerCase();
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
      allowedSortFields: ['name', 'severity', 'last_updated', 'default_priority', 'sync_status'],
      defaultSortKey: 'last_updated',
      defaultSortOrder: 'desc'
    })
  );
});

app.post('/alert-rules', (req, res) => {
  const payload = req.body || {};
  const template = payload.template_key
    ? alertRuleTemplates.find((item) => item.template_key === payload.template_key)
    : null;

  const clone = (value) => (value ? JSON.parse(JSON.stringify(value)) : value);

  const baseRule = buildAlertRule({
    rule_uid: `rule-${Date.now()}`,
    name: payload.name || template?.name || '新告警規則',
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
  alertRules.push(baseRule);
  res.status(201).json(baseRule);
});

app.get('/alert-rules/:rule_uid', (req, res) => {
  const rule = getAlertRuleByUid(req.params.rule_uid);
  if (!rule) return notFound(res, '找不到告警規則');
  res.json(rule);
});

app.put('/alert-rules/:rule_uid', (req, res) => {
  const rule = getAlertRuleByUid(req.params.rule_uid);
  if (!rule) return notFound(res, '找不到告警規則');
  const payload = req.body || {};
  const updated = buildAlertRule({
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

// 修正: 增加 PATCH 方法處理啟用/停用
app.patch('/alert-rules/:rule_uid', (req, res) => {
  const rule = getAlertRuleByUid(req.params.rule_uid);
  if (!rule) return notFound(res, '找不到告警規則');
  const payload = req.body || {};
  if (typeof payload.enabled === 'boolean') {
    rule.enabled = payload.enabled;
  }
  rule.last_updated = toISO(new Date());
  rule.last_synced_at = toISO(new Date());
  rule.sync_status = 'fresh';
  res.json(rule);
});

app.delete('/alert-rules/:rule_uid', (req, res) => {
  const rule = getAlertRuleByUid(req.params.rule_uid);
  if (!rule) return notFound(res, '找不到告警規則');
  res.status(204).end();
});

app.post('/alert-rules/:rule_uid/test', (req, res) => {
  const rule = getAlertRuleByUid(req.params.rule_uid);
  if (!rule) return notFound(res, '找不到告警規則');
  res.json({ matches: true, preview_event: mapEventSummary(eventData[0]), messages: ['條件符合範例資料'] });
});

app.listen(PORT, () => {
  console.log(`Mock server listening on http://localhost:${PORT}`);
});