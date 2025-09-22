const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const PORT = process.env.PORT || 8080;

// 預設靜態資料，模擬後端回傳內容
const store = {
  events: [
    {
      id: 'evt-1',
      event_key: 'INC-1001',
      summary: 'API 延遲超出閾值',
      description: '北部區域 API 延遲超出 2 秒，需要人工介入。',
      status: 'in_progress',
      severity: 'critical',
      service_impact: '使用者 API 請求延遲上升 250%',
      resource_id: 'res-1',
      resource_name: 'api-gateway-01',
      rule_id: 'rule-1',
      rule_name: 'API 延遲監控',
      metric: 'latency_p95',
      trigger_threshold: '2000ms',
      trigger_value: '3200ms',
      unit: 'ms',
      trigger_time: '2025-02-18T02:30:00Z',
      assignee: {
        id: 'user-1',
        username: 'sre.chen',
        display_name: '陳家豪',
        email: 'sre.chen@example.com'
      },
      acknowledged_at: '2025-02-18T02:32:00Z',
      resolved_at: null,
      tags: ['env:production', 'service:api'],
      detection_source: 'prometheus',
      timeline: [
        {
          timestamp: '2025-02-18T02:32:00Z',
          action: 'acknowledged',
          actor: {
            id: 'user-1',
            username: 'sre.chen',
            display_name: '陳家豪'
          },
          notes: '已通知應用團隊加速排查。'
        }
      ],
      related_events: [
        {
          event_id: 'evt-2',
          summary: 'API 錯誤率上升',
          severity: 'warning',
          status: 'new'
        }
      ],
      automation_actions: [
        {
          script_id: 'script-1',
          script_name: '重啟 API Gateway',
          status: 'success',
          started_at: '2025-02-18T02:35:00Z',
          completed_at: '2025-02-18T02:36:30Z',
          output_summary: '已重新啟動北部 API Gateway 節點。'
        }
      ],
      created_at: '2025-02-18T02:30:00Z',
      updated_at: '2025-02-18T02:40:00Z'
    }
  ],
  eventRules: [
    {
      id: 'rule-1',
      name: 'API 延遲監控',
      description: '監控 API P95 延遲是否超出 2 秒',
      enabled: true,
      severity: 'critical',
      target_type: 'service',
      label_selectors: [
        {
          key: 'service',
          operator: 'equals',
          value: 'api'
        }
      ],
      condition_groups: [
        {
          group_id: 'g1',
          logic: 'all',
          conditions: [
            {
              metric: 'latency_p95',
              comparison: '>',
              threshold: 2000,
              unit: 'ms',
              duration_minutes: 5,
              severity: 'critical'
            }
          ]
        }
      ],
      automation_enabled: true,
      script_id: 'script-1',
      script_name: '重啟 API Gateway',
      automation_parameters: {
        node: 'api-gateway-01'
      },
      created_by: {
        id: 'user-2',
        username: 'alice.lin',
        display_name: '林怡君'
      },
      created_at: '2024-12-01T06:00:00Z',
      updated_at: '2025-02-10T01:00:00Z'
    }
  ],
  silences: [
    {
      id: 'silence-1',
      name: '夜間資料庫備份',
      description: '避免備份期間觸發通知',
      silence_type: 'recurring',
      scope: 'resource_group',
      matchers: [
        {
          key: 'group',
          operator: 'equals',
          value: 'db-backup'
        }
      ],
      start_time: '2025-02-18T01:00:00Z',
      end_time: '2025-02-18T03:00:00Z',
      timezone: 'Asia/Taipei',
      repeat_pattern: {
        repeat_mode: 'daily',
        duration_hours: 2
      },
      is_enabled: true,
      notify_on_start: false,
      notify_on_end: true,
      created_by: {
        id: 'user-3',
        username: 'ops.huang',
        display_name: '黃建文'
      },
      created_at: '2025-01-05T00:00:00Z',
      updated_at: '2025-02-01T00:00:00Z'
    }
  ],
  resources: [
    {
      id: 'res-1',
      name: 'api-gateway-01',
      status: 'warning',
      type: 'gateway',
      ip_address: '10.10.1.11',
      location: 'taipei-1',
      environment: 'production',
      team: '核心平台組',
      os: 'Ubuntu 22.04',
      cpu_usage: 78.5,
      memory_usage: 69.3,
      disk_usage: 55.1,
      network_in_mbps: 320.4,
      network_out_mbps: 298.7,
      tags: ['env:production', 'service:api'],
      label_values: [
        {
          id: 'label-1',
          key: 'tier',
          value: 'frontend',
          category: '基礎設施'
        }
      ],
      group_ids: ['group-1'],
      last_event_count: 3,
      created_at: '2024-09-01T08:00:00Z',
      updated_at: '2025-02-18T02:40:00Z'
    }
  ],
  resourceGroups: [
    {
      id: 'group-1',
      name: '核心 API 服務',
      description: '提供對外 API 的主要節點',
      owner: {
        id: 'user-4',
        username: 'manager.wu',
        display_name: '吳怡廷'
      },
      owner_team: '核心平台組',
      member_count: 6,
      subscriber_count: 12,
      status_summary: {
        healthy: 5,
        warning: 1,
        critical: 0
      },
      resource_ids: ['res-1'],
      created_at: '2024-06-12T00:00:00Z',
      updated_at: '2025-02-15T10:00:00Z'
    }
  ],
  topologies: [
    {
      id: 'topo-1',
      name: '核心服務拓撲',
      description: '展示 API Gateway、應用服務與資料庫之間的關聯',
      layout: 'force_directed',
      nodes: [
        {
          id: 'node-api',
          resource_id: 'res-1',
          name: 'API Gateway',
          type: 'gateway',
          status: 'warning',
          environment: 'production',
          team: '核心平台組'
        },
        {
          id: 'node-app',
          resource_id: 'res-2',
          name: '應用服務',
          type: 'service',
          status: 'healthy',
          environment: 'production',
          team: '應用服務組'
        },
        {
          id: 'node-db',
          resource_id: 'res-3',
          name: '主資料庫',
          type: 'database',
          status: 'healthy',
          environment: 'production',
          team: '資料庫組'
        }
      ],
      edges: [
        {
          id: 'edge-api-app',
          source_id: 'node-api',
          target_id: 'node-app',
          connection_type: 'HTTP',
          latency_ms: 120,
          throughput_mbps: 280
        },
        {
          id: 'edge-app-db',
          source_id: 'node-app',
          target_id: 'node-db',
          connection_type: 'SQL',
          latency_ms: 35,
          throughput_mbps: 120
        }
      ],
      last_synced_at: '2025-02-17T12:00:00Z',
      created_at: '2024-07-01T00:00:00Z',
      updated_at: '2025-02-17T12:00:00Z'
    }
  ],
  dashboards: [
    {
      id: 'dash-1',
      name: 'SRE 戰情室',
      category: 'war_room',
      description: '提供跨團隊即時戰情資訊。',
      owner: {
        id: 'user-5',
        username: 'sre.lead',
        display_name: '張雅筑'
      },
      tags: ['war-room', 'priority'],
      is_published: true,
      is_default: true,
      published_at: '2024-12-30T00:00:00Z',
      kpi_summary: {
        active_incidents: 5,
        automation_rate: 0.35
      },
      widgets: [
        {
          type: 'chart',
          title: '重大事件趨勢'
        }
      ],
      created_at: '2024-09-15T00:00:00Z',
      updated_at: '2025-01-20T06:00:00Z'
    }
  ],
  insights: [
    {
      id: 'insight-1',
      title: '容量預測：API Gateway',
      category: 'capacity',
      summary: 'API Gateway 在高峰時段可能於 14 天後需要水平擴充。',
      status: 'published',
      chart_type: 'line',
      metrics: [
        {
          name: 'cpu_usage',
          current_value: 78,
          baseline_value: 60,
          trend: 'up'
        }
      ],
      recommendations: [
        {
          title: '增加節點數量',
          description: '建議新增 2 台 API Gateway 節點以確保容量。',
          priority: 'high'
        }
      ],
      generated_at: '2025-02-15T00:00:00Z',
      created_at: '2025-02-15T00:00:00Z',
      updated_at: '2025-02-15T00:00:00Z'
    }
  ],
  warRooms: [
    {
      id: 'war-1',
      title: 'API Gateway 延遲戰情',
      status: 'active',
      severity_focus: 'critical',
      facilitator: {
        id: 'user-1',
        username: 'sre.chen',
        display_name: '陳家豪'
      },
      participants: [
        {
          id: 'user-2',
          username: 'alice.lin',
          display_name: '林怡君'
        },
        {
          id: 'user-6',
          username: 'dev.liao',
          display_name: '廖冠廷'
        }
      ],
      incident_ids: ['evt-1'],
      timeline: [
        {
          timestamp: '2025-02-18T02:31:00Z',
          description: '建立戰情室並指派主持人。',
          actor: {
            id: 'user-5',
            username: 'sre.lead',
            display_name: '張雅筑'
          },
          event_id: 'evt-1'
        }
      ],
      notes: '持續監控 API 延遲與錯誤率。',
      started_at: '2025-02-18T02:30:00Z',
      ended_at: null,
      created_at: '2025-02-18T02:30:00Z',
      updated_at: '2025-02-18T02:40:00Z'
    }
  ],
  scripts: [
    {
      id: 'script-1',
      name: '重啟 API Gateway',
      type: 'shell',
      description: '透過 Ansible 重新啟動指定的 API Gateway 節點',
      version: 'v3.2.1',
      content: '#!/bin/bash\necho "restart"',
      tags: ['api', 'restart'],
      last_execution_status: 'success',
      last_execution_at: '2025-02-17T12:00:00Z',
      created_by: {
        id: 'user-3',
        username: 'ops.huang',
        display_name: '黃建文'
      },
      updated_by: {
        id: 'user-3',
        username: 'ops.huang',
        display_name: '黃建文'
      },
      created_at: '2024-08-10T00:00:00Z',
      updated_at: '2025-02-10T02:00:00Z'
    }
  ],
  schedules: [
    {
      id: 'sch-1',
      name: '資料庫備份排程',
      script_id: 'script-2',
      script_name: '夜間資料庫備份',
      type: 'recurring',
      cron_expression: '0 2 * * *',
      timezone: 'Asia/Taipei',
      next_run_time: '2025-02-19T02:00:00+08:00',
      last_run_time: '2025-02-18T02:00:00+08:00',
      status: 'enabled',
      concurrency_policy: 'forbid',
      retry_policy: {
        max_retries: 2,
        interval_seconds: 300
      },
      notify_on_success: false,
      notify_on_failure: true,
      created_by: {
        id: 'user-3',
        username: 'ops.huang',
        display_name: '黃建文'
      },
      updated_by: {
        id: 'user-3',
        username: 'ops.huang',
        display_name: '黃建文'
      },
      created_at: '2024-10-01T00:00:00Z',
      updated_at: '2025-02-18T02:00:00Z'
    }
  ],
  executions: [
    {
      id: 'exec-1',
      script_id: 'script-1',
      script_name: '重啟 API Gateway',
      schedule_id: null,
      trigger_source: 'manual',
      start_time: '2025-02-18T02:35:00Z',
      end_time: '2025-02-18T02:36:30Z',
      duration_ms: 90000,
      status: 'success',
      triggered_by: {
        id: 'user-1',
        username: 'sre.chen',
        display_name: '陳家豪'
      },
      parameters: {
        node: 'api-gateway-01'
      },
      stdout: 'restart success',
      stderr: '',
      error_message: null,
      related_event_ids: ['evt-1'],
      attempt_count: 1,
      created_at: '2025-02-18T02:36:30Z'
    }
  ],
  notificationPolicies: [
    {
      id: 'policy-1',
      name: '重大事件告警',
      description: '針對 critical 事件發送多管道通知',
      enabled: true,
      priority: 'high',
      severity_filters: ['critical'],
      channel_ids: ['channel-email', 'channel-slack'],
      recipients: [
        {
          id: 'user-1',
          display_name: '陳家豪',
          type: 'user'
        },
        {
          id: 'team-sre',
          display_name: 'SRE 值班群組',
          type: 'team'
        }
      ],
      escalation_delay_minutes: 10,
      repeat_frequency_minutes: 30,
      trigger_condition: {
        resource_type: 'service'
      },
      resource_filters: {
        environment: 'production'
      },
      silence_ids: ['silence-1'],
      created_by: {
        id: 'user-5',
        username: 'sre.lead',
        display_name: '張雅筑'
      },
      updated_by: {
        id: 'user-5',
        username: 'sre.lead',
        display_name: '張雅筑'
      },
      created_at: '2024-11-20T00:00:00Z',
      updated_at: '2025-01-10T00:00:00Z'
    }
  ],
  channels: [
    {
      id: 'channel-email',
      name: '主要郵件管道',
      type: 'email',
      description: '使用公司 SMTP 寄送通知',
      status: 'active',
      config: {
        sender: 'noreply@sre.example.com'
      },
      last_tested_at: '2025-02-10T10:00:00Z',
      created_by: {
        id: 'user-5',
        username: 'sre.lead',
        display_name: '張雅筑'
      },
      updated_by: {
        id: 'user-5',
        username: 'sre.lead',
        display_name: '張雅筑'
      },
      created_at: '2024-07-01T00:00:00Z',
      updated_at: '2025-01-05T00:00:00Z'
    },
    {
      id: 'channel-slack',
      name: 'Slack 戰情室',
      type: 'slack',
      description: '推送至 #sre-war-room 頻道',
      status: 'active',
      config: {
        webhook_url: 'https://hooks.slack.com/services/demo'
      },
      last_tested_at: '2025-02-12T09:00:00Z',
      created_by: {
        id: 'user-5',
        username: 'sre.lead',
        display_name: '張雅筑'
      },
      updated_by: {
        id: 'user-5',
        username: 'sre.lead',
        display_name: '張雅筑'
      },
      created_at: '2024-07-01T00:00:00Z',
      updated_at: '2025-01-05T00:00:00Z'
    }
  ],
  notifications: [
    {
      id: 'notify-1',
      policy_id: 'policy-1',
      policy_name: '重大事件告警',
      channel_id: 'channel-email',
      channel_type: 'email',
      status: 'success',
      recipients: [
        {
          id: 'user-1',
          display_name: '陳家豪'
        }
      ],
      sent_at: '2025-02-18T02:31:00Z',
      completed_at: '2025-02-18T02:31:02Z',
      retry_count: 0,
      duration_ms: 2200,
      error_message: null,
      payload_excerpt: 'API Gateway 延遲超標',
      attempts: [
        {
          attempt_at: '2025-02-18T02:31:00Z',
          status: 'success',
          response_code: 200
        }
      ],
      metadata: {
        message_id: 'email-20250218-01'
      },
      related_event_id: 'evt-1'
    }
  ],
  labels: [
    {
      id: 'label-1',
      key: 'tier',
      value: 'frontend',
      category: '基礎設施',
      color: '#2f54eb',
      description: '前端服務層',
      is_system: true,
      usage_count: 18,
      created_by: {
        id: 'user-5',
        username: 'sre.lead',
        display_name: '張雅筑'
      },
      updated_by: {
        id: 'user-5',
        username: 'sre.lead',
        display_name: '張雅筑'
      },
      created_at: '2024-05-10T00:00:00Z',
      updated_at: '2025-01-15T00:00:00Z'
    }
  ],
  mailSettings: [
    {
      id: 'mail-1',
      smtp_host: 'smtp.sre.example.com',
      smtp_port: 587,
      username: 'noreply@sre.example.com',
      sender_name: 'SRE 平台通知',
      sender_email: 'noreply@sre.example.com',
      reply_to: 'sre-team@example.com',
      encryption: 'tls',
      test_recipient: 'dev-team@example.com',
      is_enabled: true,
      last_tested_at: '2025-02-11T03:00:00Z',
      created_by: {
        id: 'user-5',
        username: 'sre.lead',
        display_name: '張雅筑'
      },
      updated_by: {
        id: 'user-5',
        username: 'sre.lead',
        display_name: '張雅筑'
      },
      created_at: '2024-03-01T00:00:00Z',
      updated_at: '2025-02-10T03:00:00Z'
    }
  ],
  authSettings: [
    {
      id: 'auth-1',
      provider: 'keycloak',
      oidc_enabled: true,
      realm: 'sre-platform',
      client_id: 'sre-portal',
      client_secret_hint: '•••••',
      auth_url: 'https://auth.example.com/realms/sre/protocol/openid-connect/auth',
      token_url: 'https://auth.example.com/realms/sre/protocol/openid-connect/token',
      userinfo_url: 'https://auth.example.com/realms/sre/protocol/openid-connect/userinfo',
      redirect_uri: 'https://portal.example.com/callback',
      logout_url: 'https://auth.example.com/realms/sre/protocol/openid-connect/logout',
      scopes: ['openid', 'profile', 'email'],
      user_sync: true,
      last_tested_at: '2025-02-12T05:00:00Z',
      created_by: {
        id: 'user-5',
        username: 'sre.lead',
        display_name: '張雅筑'
      },
      updated_by: {
        id: 'user-5',
        username: 'sre.lead',
        display_name: '張雅筑'
      },
      created_at: '2024-04-15T00:00:00Z',
      updated_at: '2025-01-25T00:00:00Z'
    }
  ],
  profiles: [
    {
      id: 'user-1',
      username: 'sre.chen',
      display_name: '陳家豪',
      email: 'sre.chen@example.com',
      role: 'sre',
      status: 'active',
      language: '繁體中文',
      timezone: 'Asia/Taipei',
      teams: [
        {
          id: 'team-core',
          name: '核心平台組'
        },
        {
          id: 'team-sre',
          name: 'SRE 值班群組'
        }
      ],
      last_login_at: '2025-02-18T01:55:00Z',
      created_at: '2023-08-01T00:00:00Z',
      updated_at: '2025-02-17T09:00:00Z'
    }
  ],
  preferences: [
    {
      id: 'pref-1',
      user_id: 'user-1',
      theme: 'dark',
      default_page: 'war_room',
      language: '繁體中文',
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
      created_at: '2024-01-10T00:00:00Z',
      updated_at: '2025-02-10T05:00:00Z'
    }
  ]
};

const app = express();
app.use(cors());
app.use(bodyParser.json());

// 建立統一的分頁回應
function toListResponse(items) {
  return {
    items,
    page: 1,
    page_size: items.length,
    total: items.length,
    has_more: false
  };
}

// 依資源類型註冊 CRUD 路由
function registerCollection(path, key) {
  app.get(path, (req, res) => {
    res.json(toListResponse(store[key]));
  });

  app.post(path, (req, res) => {
    const payload = req.body || {};
    const now = new Date().toISOString();
    const newItem = {
      id: payload.id || `${key}-${Date.now()}`,
      created_at: now,
      updated_at: now,
      ...payload
    };
    store[key].push(newItem);
    res.status(201).json(newItem);
  });

  app.get(`${path}/:id`, (req, res) => {
    const item = store[key].find((entry) => String(entry.id) === req.params.id);
    if (!item) {
      return res.status(404).json({ code: 'NOT_FOUND', message: '找不到指定資料' });
    }
    res.json(item);
  });

  app.put(`${path}/:id`, (req, res) => {
    const index = store[key].findIndex((entry) => String(entry.id) === req.params.id);
    if (index === -1) {
      return res.status(404).json({ code: 'NOT_FOUND', message: '找不到指定資料' });
    }
    const now = new Date().toISOString();
    store[key][index] = { ...store[key][index], ...req.body, updated_at: now };
    res.json(store[key][index]);
  });

  app.patch(`${path}/:id`, (req, res) => {
    const index = store[key].findIndex((entry) => String(entry.id) === req.params.id);
    if (index === -1) {
      return res.status(404).json({ code: 'NOT_FOUND', message: '找不到指定資料' });
    }
    const now = new Date().toISOString();
    store[key][index] = { ...store[key][index], ...req.body, updated_at: now };
    res.json(store[key][index]);
  });

  app.delete(`${path}/:id`, (req, res) => {
    const index = store[key].findIndex((entry) => String(entry.id) === req.params.id);
    if (index === -1) {
      return res.status(404).json({ code: 'NOT_FOUND', message: '找不到指定資料' });
    }
    store[key].splice(index, 1);
    res.status(204).send();
  });
}

registerCollection('/events', 'events');
registerCollection('/event-rules', 'eventRules');
registerCollection('/silences', 'silences');
registerCollection('/resources', 'resources');
registerCollection('/resource-groups', 'resourceGroups');
registerCollection('/topology', 'topologies');
registerCollection('/dashboards', 'dashboards');
registerCollection('/insights', 'insights');
registerCollection('/war-room', 'warRooms');
registerCollection('/scripts', 'scripts');
registerCollection('/schedules', 'schedules');
registerCollection('/executions', 'executions');
registerCollection('/notification-policies', 'notificationPolicies');
registerCollection('/channels', 'channels');
registerCollection('/notifications', 'notifications');
registerCollection('/labels', 'labels');
registerCollection('/mail-settings', 'mailSettings');
registerCollection('/auth-settings', 'authSettings');
registerCollection('/profile', 'profiles');
registerCollection('/preferences', 'preferences');

app.listen(PORT, () => {
  console.log(`Mock server is running on port ${PORT}`);
});
