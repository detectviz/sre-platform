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
        },
        {
          timestamp: '2025-02-18T02:35:00Z',
          action: 'automation_triggered',
          actor: {
            id: 'user-1',
            username: 'sre.chen',
            display_name: '陳家豪'
          },
          notes: '觸發自動化腳本重新啟動 API Gateway。'
        },
        {
          timestamp: '2025-02-18T02:42:00Z',
          action: 'analysis',
          actor: {
            id: 'user-6',
            username: 'dev.liao',
            display_name: '廖冠廷'
          },
          notes: '應用團隊確認異常來源為批次部署，安排回滾。'
        }
      ],
      related_events: [
        {
          event_id: 'evt-2',
          summary: '資料庫連線數突增',
          severity: 'warning',
          status: 'resolved'
        },
        {
          event_id: 'evt-4',
          summary: '北部 CDN 錯誤率上升',
          severity: 'critical',
          status: 'acknowledged'
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
      updated_at: '2025-02-18T02:45:00Z'
    },
    {
      id: 'evt-2',
      event_key: 'INC-1002',
      summary: '資料庫連線數突增',
      description: '東部資料庫叢集連線數於尖峰時間暴增，造成短暫延遲。',
      status: 'resolved',
      severity: 'warning',
      service_impact: '查詢響應時間短暫增加 80%',
      resource_id: 'res-2',
      resource_name: 'db-cluster-02',
      rule_id: 'rule-2',
      rule_name: '資料庫連線監控',
      metric: 'active_connections',
      trigger_threshold: '450',
      trigger_value: '520',
      unit: 'connections',
      trigger_time: '2025-02-17T22:15:00Z',
      assignee: {
        id: 'user-7',
        username: 'dba.wang',
        display_name: '王怡萱',
        email: 'dba.wang@example.com'
      },
      acknowledged_at: '2025-02-17T22:17:00Z',
      resolved_at: '2025-02-17T22:35:00Z',
      tags: ['env:production', 'tier:database'],
      detection_source: 'prometheus',
      timeline: [
        {
          timestamp: '2025-02-17T22:17:00Z',
          action: 'acknowledged',
          actor: {
            id: 'user-7',
            username: 'dba.wang',
            display_name: '王怡萱'
          },
          notes: '資料庫值班工程師接手處理。'
        },
        {
          timestamp: '2025-02-17T22:28:00Z',
          action: 'mitigation',
          actor: {
            id: 'user-7',
            username: 'dba.wang',
            display_name: '王怡萱'
          },
          notes: '新增讀寫節點並調整連線池上限。'
        },
        {
          timestamp: '2025-02-17T22:35:00Z',
          action: 'resolved',
          actor: {
            id: 'user-7',
            username: 'dba.wang',
            display_name: '王怡萱'
          },
          notes: '連線數回落至穩定範圍，事件關閉。'
        }
      ],
      related_events: [
        {
          event_id: 'evt-1',
          summary: 'API 延遲超出閾值',
          severity: 'critical',
          status: 'in_progress'
        }
      ],
      automation_actions: [
        {
          script_id: 'script-2',
          script_name: '資料庫節點擴充',
          status: 'success',
          started_at: '2025-02-17T22:20:00Z',
          completed_at: '2025-02-17T22:26:00Z',
          output_summary: '已動態新增一個讀節點並同步資料。'
        }
      ],
      created_at: '2025-02-17T22:15:00Z',
      updated_at: '2025-02-17T22:36:00Z'
    },
    {
      id: 'evt-3',
      event_key: 'INC-1003',
      summary: 'Kubernetes 節點資源不足',
      description: '工作節點 CPU 使用率逼近 90%，觸發自動擴充流程。',
      status: 'silenced',
      severity: 'info',
      service_impact: '節點自動擴充進行中，服務維持可用。',
      resource_id: 'res-3',
      resource_name: 'k8s-node-09',
      rule_id: 'rule-3',
      rule_name: 'K8s 節點資源監控',
      metric: 'cpu_usage',
      trigger_threshold: '85%',
      trigger_value: '89%',
      unit: '%',
      trigger_time: '2025-02-18T01:20:00Z',
      assignee: null,
      acknowledged_at: null,
      resolved_at: null,
      tags: ['env:staging', 'cluster:k8s'],
      detection_source: 'grafana',
      timeline: [
        {
          timestamp: '2025-02-18T01:22:00Z',
          action: 'auto_scaling',
          actor: {
            id: 'system',
            username: 'autoscaler',
            display_name: '自動擴充服務'
          },
          notes: '已建立新節點並開始調整工作負載。'
        },
        {
          timestamp: '2025-02-18T01:30:00Z',
          action: 'silenced',
          actor: {
            id: 'user-3',
            username: 'ops.huang',
            display_name: '黃建文'
          },
          notes: '與維護窗口重疊，暫時靜音事件。'
        }
      ],
      related_events: [
        {
          event_id: 'evt-1',
          summary: 'API 延遲超出閾值',
          severity: 'critical',
          status: 'in_progress'
        }
      ],
      automation_actions: [],
      created_at: '2025-02-18T01:20:00Z',
      updated_at: '2025-02-18T01:45:00Z'
    },
    {
      id: 'evt-4',
      event_key: 'INC-1004',
      summary: '北部 CDN 錯誤率上升',
      description: 'CDN 節點回應 5xx 比例提升，疑似快取部署失敗。',
      status: 'acknowledged',
      severity: 'critical',
      service_impact: '北部 15% 使用者回報載入失敗。',
      resource_id: 'res-4',
      resource_name: 'cdn-edge-tpe',
      rule_id: 'rule-4',
      rule_name: 'CDN 錯誤率監控',
      metric: 'error_rate',
      trigger_threshold: '5%',
      trigger_value: '9.5%',
      unit: '%',
      trigger_time: '2025-02-18T03:10:00Z',
      assignee: {
        id: 'user-8',
        username: 'ops.lee',
        display_name: '李建中',
        email: 'ops.lee@example.com'
      },
      acknowledged_at: '2025-02-18T03:12:00Z',
      resolved_at: null,
      tags: ['env:production', 'service:cdn'],
      detection_source: 'cloudwatch',
      timeline: [
        {
          timestamp: '2025-02-18T03:12:00Z',
          action: 'acknowledged',
          actor: {
            id: 'user-8',
            username: 'ops.lee',
            display_name: '李建中'
          },
          notes: '網路維運值班已接手。'
        },
        {
          timestamp: '2025-02-18T03:16:00Z',
          action: 'mitigation',
          actor: {
            id: 'user-8',
            username: 'ops.lee',
            display_name: '李建中'
          },
          notes: '調整快取規則並清除異常節點快取。'
        }
      ],
      related_events: [
        {
          event_id: 'evt-1',
          summary: 'API 延遲超出閾值',
          severity: 'critical',
          status: 'in_progress'
        }
      ],
      automation_actions: [
        {
          script_id: 'script-3',
          script_name: 'CDN 節點同步',
          status: 'running',
          started_at: '2025-02-18T03:15:30Z',
          completed_at: null,
          output_summary: '重新同步北部節點設定中。'
        }
      ],
      created_at: '2025-02-18T03:10:00Z',
      updated_at: '2025-02-18T03:18:00Z'
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
    },
    {
      id: 'rule-2',
      name: '資料庫連線監控',
      description: '監控資料庫連線數長時間高於安全值。',
      enabled: true,
      severity: 'warning',
      target_type: 'resource_group',
      label_selectors: [
        {
          key: 'tier',
          operator: 'equals',
          value: 'database'
        }
      ],
      condition_groups: [
        {
          group_id: 'g1',
          logic: 'all',
          conditions: [
            {
              metric: 'active_connections',
              comparison: '>=',
              threshold: 450,
              unit: 'count',
              duration_minutes: 10,
              severity: 'warning'
            },
            {
              metric: 'connection_errors',
              comparison: '>=',
              threshold: 5,
              unit: 'count',
              duration_minutes: 5,
              severity: 'warning'
            }
          ]
        }
      ],
      automation_enabled: false,
      script_id: null,
      script_name: null,
      automation_parameters: {},
      created_by: {
        id: 'user-7',
        username: 'dba.wang',
        display_name: '王怡萱'
      },
      created_at: '2024-11-02T09:00:00Z',
      updated_at: '2025-02-12T05:30:00Z'
    },
    {
      id: 'rule-3',
      name: 'K8s 節點資源監控',
      description: '偵測節點 CPU 與記憶體高於閾值，並觸發自動擴充。',
      enabled: true,
      severity: 'info',
      target_type: 'resource',
      label_selectors: [
        {
          key: 'cluster',
          operator: 'equals',
          value: 'k8s'
        }
      ],
      condition_groups: [
        {
          group_id: 'g1',
          logic: 'any',
          conditions: [
            {
              metric: 'cpu_usage',
              comparison: '>=',
              threshold: 85,
              unit: '%',
              duration_minutes: 5,
              severity: 'warning'
            },
            {
              metric: 'memory_usage',
              comparison: '>=',
              threshold: 80,
              unit: '%',
              duration_minutes: 5,
              severity: 'warning'
            }
          ]
        }
      ],
      automation_enabled: true,
      script_id: 'script-2',
      script_name: '資料庫節點擴充',
      automation_parameters: {
        cluster: 'k8s-prod'
      },
      created_by: {
        id: 'user-3',
        username: 'ops.huang',
        display_name: '黃建文'
      },
      created_at: '2024-09-15T00:00:00Z',
      updated_at: '2025-02-05T08:00:00Z'
    },
    {
      id: 'rule-4',
      name: 'CDN 錯誤率監控',
      description: '監控 CDN 節點 5xx 錯誤比例是否超出設定閾值。',
      enabled: true,
      severity: 'critical',
      target_type: 'service',
      label_selectors: [
        {
          key: 'service',
          operator: 'equals',
          value: 'cdn'
        }
      ],
      condition_groups: [
        {
          group_id: 'g1',
          logic: 'all',
          conditions: [
            {
              metric: 'error_rate',
              comparison: '>=',
              threshold: 5,
              unit: '%',
              duration_minutes: 3,
              severity: 'critical'
            }
          ]
        }
      ],
      automation_enabled: true,
      script_id: 'script-3',
      script_name: 'CDN 節點同步',
      automation_parameters: {
        region: 'tpe'
      },
      created_by: {
        id: 'user-8',
        username: 'ops.lee',
        display_name: '李建中'
      },
      created_at: '2024-10-20T00:00:00Z',
      updated_at: '2025-02-14T02:30:00Z'
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
      updated_at: '2025-02-15T00:00:00Z'
    },
    {
      id: 'silence-2',
      name: 'API 部署窗口',
      description: 'API 服務每週部署時段，暫停告警避免干擾。',
      silence_type: 'maintenance',
      scope: 'resource',
      matchers: [
        {
          key: 'service',
          operator: 'equals',
          value: 'api'
        },
        {
          key: 'environment',
          operator: 'equals',
          value: 'staging'
        }
      ],
      start_time: '2025-02-19T04:00:00Z',
      end_time: '2025-02-19T06:30:00Z',
      timezone: 'Asia/Taipei',
      repeat_pattern: {
        repeat_mode: 'weekly',
        weekdays: ['Wed'],
        duration_hours: 2.5
      },
      is_enabled: true,
      notify_on_start: true,
      notify_on_end: true,
      created_by: {
        id: 'user-2',
        username: 'alice.lin',
        display_name: '林怡君'
      },
      created_at: '2024-12-20T00:00:00Z',
      updated_at: '2025-02-10T12:00:00Z'
    },
    {
      id: 'silence-3',
      name: '網路設備維護',
      description: '網路團隊定期維護北區網路交換器。',
      silence_type: 'one_time',
      scope: 'resource_group',
      matchers: [
        {
          key: 'group',
          operator: 'equals',
          value: 'network-tpe'
        }
      ],
      start_time: '2025-02-16T13:00:00Z',
      end_time: '2025-02-16T15:00:00Z',
      timezone: 'Asia/Taipei',
      repeat_pattern: null,
      is_enabled: false,
      notify_on_start: true,
      notify_on_end: false,
      created_by: {
        id: 'user-8',
        username: 'ops.lee',
        display_name: '李建中'
      },
      created_at: '2025-01-25T00:00:00Z',
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
      updated_at: '2025-02-18T02:45:00Z'
    },
    {
      id: 'res-2',
      name: 'db-cluster-02',
      status: 'healthy',
      type: 'database',
      ip_address: '10.20.5.23',
      location: 'taichung-2',
      environment: 'production',
      team: '資料庫組',
      os: 'Rocky Linux 9',
      cpu_usage: 52.2,
      memory_usage: 48.5,
      disk_usage: 61.3,
      network_in_mbps: 180.5,
      network_out_mbps: 172.9,
      tags: ['env:production', 'tier:database'],
      label_values: [
        {
          id: 'label-2',
          key: 'tier',
          value: 'database',
          category: '基礎設施'
        }
      ],
      group_ids: ['group-2'],
      last_event_count: 1,
      created_at: '2024-07-12T10:00:00Z',
      updated_at: '2025-02-17T22:36:00Z'
    },
    {
      id: 'res-3',
      name: 'k8s-node-09',
      status: 'warning',
      type: 'kubernetes_node',
      ip_address: '10.30.2.45',
      location: 'hsinchu-1',
      environment: 'staging',
      team: '平台工程組',
      os: 'Flatcar Linux',
      cpu_usage: 88.1,
      memory_usage: 81.2,
      disk_usage: 47.6,
      network_in_mbps: 145.3,
      network_out_mbps: 133.8,
      tags: ['env:staging', 'cluster:k8s'],
      label_values: [
        {
          id: 'label-3',
          key: 'cluster',
          value: 'k8s-prod',
          category: '平台'
        }
      ],
      group_ids: ['group-3'],
      last_event_count: 2,
      created_at: '2024-10-05T04:00:00Z',
      updated_at: '2025-02-18T01:45:00Z'
    },
    {
      id: 'res-4',
      name: 'cdn-edge-tpe',
      status: 'critical',
      type: 'cdn_edge',
      ip_address: '172.16.9.14',
      location: 'taipei-2',
      environment: 'production',
      team: '網路維運組',
      os: 'Debian 12',
      cpu_usage: 64.4,
      memory_usage: 72.1,
      disk_usage: 49.2,
      network_in_mbps: 520.8,
      network_out_mbps: 612.4,
      tags: ['env:production', 'service:cdn'],
      label_values: [
        {
          id: 'label-4',
          key: 'region',
          value: 'north',
          category: '地區'
        }
      ],
      group_ids: ['group-1'],
      last_event_count: 2,
      created_at: '2024-08-18T07:30:00Z',
      updated_at: '2025-02-18T03:18:00Z'
    },
    {
      id: 'res-5',
      name: 'app-service-01',
      status: 'healthy',
      type: 'application',
      ip_address: '10.15.4.21',
      location: 'taipei-1',
      environment: 'production',
      team: '應用服務組',
      os: 'Ubuntu 22.04',
      cpu_usage: 48.7,
      memory_usage: 55.6,
      disk_usage: 38.2,
      network_in_mbps: 210.3,
      network_out_mbps: 205.7,
      tags: ['env:production', 'service:app'],
      label_values: [
        {
          id: 'label-1',
          key: 'tier',
          value: 'frontend',
          category: '基礎設施'
        }
      ],
      group_ids: ['group-1'],
      last_event_count: 0,
      created_at: '2024-09-22T05:00:00Z',
      updated_at: '2025-02-16T09:15:00Z'
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
        healthy: 4,
        warning: 1,
        critical: 1
      },
      resource_ids: ['res-1', 'res-4'],
      created_at: '2024-06-12T00:00:00Z',
      updated_at: '2025-02-15T10:00:00Z'
    },
    {
      id: 'group-2',
      name: '資料庫叢集',
      description: '維護核心交易資料庫與備援節點。',
      owner: {
        id: 'user-7',
        username: 'dba.wang',
        display_name: '王怡萱'
      },
      owner_team: '資料庫組',
      member_count: 5,
      subscriber_count: 9,
      status_summary: {
        healthy: 3,
        warning: 0,
        critical: 0
      },
      resource_ids: ['res-2'],
      created_at: '2024-05-20T00:00:00Z',
      updated_at: '2025-02-12T08:20:00Z'
    },
    {
      id: 'group-3',
      name: 'Kubernetes 平台',
      description: '提供微服務部署與維運的基礎設施。',
      owner: {
        id: 'user-3',
        username: 'ops.huang',
        display_name: '黃建文'
      },
      owner_team: '平台工程組',
      member_count: 7,
      subscriber_count: 15,
      status_summary: {
        healthy: 5,
        warning: 2,
        critical: 0
      },
      resource_ids: ['res-3'],
      created_at: '2024-07-08T00:00:00Z',
      updated_at: '2025-02-16T11:00:00Z'
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
          resource_id: 'res-5',
          name: '應用服務',
          type: 'service',
          status: 'healthy',
          environment: 'production',
          team: '應用服務組'
        },
        {
          id: 'node-db',
          resource_id: 'res-2',
          name: '主資料庫',
          type: 'database',
          status: 'healthy',
          environment: 'production',
          team: '資料庫組'
        },
        {
          id: 'node-cdn',
          resource_id: 'res-4',
          name: 'CDN 節點',
          type: 'cdn_edge',
          status: 'critical',
          environment: 'production',
          team: '網路維運組'
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
        },
        {
          id: 'edge-cdn-api',
          source_id: 'node-cdn',
          target_id: 'node-api',
          connection_type: 'HTTPS',
          latency_ms: 45,
          throughput_mbps: 420
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
    },
    {
      id: 'dash-2',
      name: '資源健康儀表板',
      category: 'operations',
      description: '即時掌握各環境資源使用率與容量預測。',
      owner: {
        id: 'user-4',
        username: 'manager.wu',
        display_name: '吳怡廷'
      },
      tags: ['capacity', 'health'],
      is_published: true,
      is_default: false,
      published_at: '2025-01-12T00:00:00Z',
      kpi_summary: {
        active_incidents: 2,
        automation_rate: 0.28
      },
      widgets: [
        {
          type: 'table',
          title: '資源告警佇列'
        }
      ],
      created_at: '2024-11-01T00:00:00Z',
      updated_at: '2025-02-10T04:00:00Z'
    },
    {
      id: 'dash-3',
      name: '自動化效率儀表板',
      category: 'automation',
      description: '評估腳本執行成效與排程可靠度。',
      owner: {
        id: 'user-3',
        username: 'ops.huang',
        display_name: '黃建文'
      },
      tags: ['automation', 'metrics'],
      is_published: false,
      is_default: false,
      published_at: null,
      kpi_summary: {
        active_incidents: 1,
        automation_rate: 0.62
      },
      widgets: [
        {
          type: 'chart',
          title: '腳本成功率'
        }
      ],
      created_at: '2024-12-08T00:00:00Z',
      updated_at: '2025-02-14T09:00:00Z'
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
    },
    {
      id: 'insight-2',
      title: '事件噪音趨勢分析',
      category: 'incident',
      summary: '近期 warning 級別事件增加 12%，建議檢討靜音策略。',
      status: 'draft',
      chart_type: 'bar',
      metrics: [
        {
          name: 'warning_incidents',
          current_value: 18,
          baseline_value: 16,
          trend: 'up'
        }
      ],
      recommendations: [
        {
          title: '調整通知策略',
          description: '針對 staging 環境啟用自動分級與靜音。',
          priority: 'medium'
        }
      ],
      generated_at: '2025-02-16T08:00:00Z',
      created_at: '2025-02-16T08:00:00Z',
      updated_at: '2025-02-16T09:30:00Z'
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
      incident_ids: ['evt-1', 'evt-4'],
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
        },
        {
          timestamp: '2025-02-18T02:45:00Z',
          description: '邀請網路團隊加入排查 CDN 錯誤率。',
          actor: {
            id: 'user-8',
            username: 'ops.lee',
            display_name: '李建中'
          },
          event_id: 'evt-4'
        }
      ],
      notes: '持續監控 API 延遲與錯誤率。',
      started_at: '2025-02-18T02:30:00Z',
      ended_at: null,
      created_at: '2025-02-18T02:30:00Z',
      updated_at: '2025-02-18T03:20:00Z'
    },
    {
      id: 'war-2',
      title: '資料庫連線戰情回顧',
      status: 'resolved',
      severity_focus: 'warning',
      facilitator: {
        id: 'user-7',
        username: 'dba.wang',
        display_name: '王怡萱'
      },
      participants: [
        {
          id: 'user-4',
          username: 'manager.wu',
          display_name: '吳怡廷'
        },
        {
          id: 'user-5',
          username: 'sre.lead',
          display_name: '張雅筑'
        }
      ],
      incident_ids: ['evt-2'],
      timeline: [
        {
          timestamp: '2025-02-17T22:20:00Z',
          description: '建立戰情室並通報業務單位。',
          actor: {
            id: 'user-7',
            username: 'dba.wang',
            display_name: '王怡萱'
          },
          event_id: 'evt-2'
        },
        {
          timestamp: '2025-02-17T22:40:00Z',
          description: '紀錄回復步驟與改善方案。',
          actor: {
            id: 'user-7',
            username: 'dba.wang',
            display_name: '王怡萱'
          },
          event_id: 'evt-2'
        }
      ],
      notes: '建議後續擴充資料庫節點容量並優化連線池。',
      started_at: '2025-02-17T22:18:00Z',
      ended_at: '2025-02-17T23:00:00Z',
      created_at: '2025-02-17T22:18:00Z',
      updated_at: '2025-02-17T23:05:00Z'
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
    },
    {
      id: 'script-2',
      name: '資料庫節點擴充',
      type: 'python',
      description: '自動擴充資料庫讀節點並同步資料。',
      version: 'v1.4.0',
      content: 'print("scale out")',
      tags: ['database', 'scaling'],
      last_execution_status: 'success',
      last_execution_at: '2025-02-17T22:26:00Z',
      created_by: {
        id: 'user-7',
        username: 'dba.wang',
        display_name: '王怡萱'
      },
      updated_by: {
        id: 'user-7',
        username: 'dba.wang',
        display_name: '王怡萱'
      },
      created_at: '2024-10-12T00:00:00Z',
      updated_at: '2025-02-12T05:00:00Z'
    },
    {
      id: 'script-3',
      name: 'CDN 節點同步',
      type: 'shell',
      description: '同步 CDN 節點設定並重新載入服務。',
      version: 'v2.1.3',
      content: '#!/bin/bash\necho "sync"',
      tags: ['cdn', 'network'],
      last_execution_status: 'running',
      last_execution_at: '2025-02-18T03:15:30Z',
      created_by: {
        id: 'user-8',
        username: 'ops.lee',
        display_name: '李建中'
      },
      updated_by: {
        id: 'user-8',
        username: 'ops.lee',
        display_name: '李建中'
      },
      created_at: '2024-11-05T00:00:00Z',
      updated_at: '2025-02-14T03:30:00Z'
    }
  ],
  schedules: [
    {
      id: 'sch-1',
      name: '資料庫備份排程',
      script_id: 'script-2',
      script_name: '資料庫節點擴充',
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
    },
    {
      id: 'sch-2',
      name: 'CDN 節點同步排程',
      script_id: 'script-3',
      script_name: 'CDN 節點同步',
      type: 'recurring',
      cron_expression: '*/30 * * * *',
      timezone: 'Asia/Taipei',
      next_run_time: '2025-02-18T03:30:00+08:00',
      last_run_time: '2025-02-18T03:00:00+08:00',
      status: 'paused',
      concurrency_policy: 'replace',
      retry_policy: {
        max_retries: 1,
        interval_seconds: 120
      },
      notify_on_success: true,
      notify_on_failure: true,
      created_by: {
        id: 'user-8',
        username: 'ops.lee',
        display_name: '李建中'
      },
      updated_by: {
        id: 'user-8',
        username: 'ops.lee',
        display_name: '李建中'
      },
      created_at: '2024-12-18T00:00:00Z',
      updated_at: '2025-02-18T03:05:00Z'
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
    },
    {
      id: 'exec-2',
      script_id: 'script-2',
      script_name: '資料庫節點擴充',
      schedule_id: 'sch-1',
      trigger_source: 'schedule',
      start_time: '2025-02-18T02:00:00Z',
      end_time: '2025-02-18T02:05:40Z',
      duration_ms: 340000,
      status: 'success',
      triggered_by: {
        id: 'sch-1',
        username: 'scheduler',
        display_name: '排程服務'
      },
      parameters: {
        cluster: 'db-core'
      },
      stdout: 'scale completed',
      stderr: '',
      error_message: null,
      related_event_ids: ['evt-2'],
      attempt_count: 1,
      created_at: '2025-02-18T02:05:40Z'
    },
    {
      id: 'exec-3',
      script_id: 'script-3',
      script_name: 'CDN 節點同步',
      schedule_id: 'sch-2',
      trigger_source: 'schedule',
      start_time: '2025-02-18T03:00:00Z',
      end_time: null,
      duration_ms: null,
      status: 'running',
      triggered_by: {
        id: 'sch-2',
        username: 'scheduler',
        display_name: '排程服務'
      },
      parameters: {
        region: 'tpe'
      },
      stdout: 'syncing...',
      stderr: '',
      error_message: null,
      related_event_ids: ['evt-4'],
      attempt_count: 1,
      created_at: '2025-02-18T03:00:00Z'
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
    },
    {
      id: 'policy-2',
      name: '資料庫容量提醒',
      description: '監控資料庫容量逼近 80% 時發送預警通知。',
      enabled: true,
      priority: 'medium',
      severity_filters: ['warning'],
      channel_ids: ['channel-email', 'channel-sms'],
      recipients: [
        {
          id: 'user-7',
          display_name: '王怡萱',
          type: 'user'
        }
      ],
      escalation_delay_minutes: 30,
      repeat_frequency_minutes: 120,
      trigger_condition: {
        resource_type: 'database'
      },
      resource_filters: {
        environment: 'production'
      },
      silence_ids: [],
      created_by: {
        id: 'user-7',
        username: 'dba.wang',
        display_name: '王怡萱'
      },
      updated_by: {
        id: 'user-7',
        username: 'dba.wang',
        display_name: '王怡萱'
      },
      created_at: '2024-12-05T00:00:00Z',
      updated_at: '2025-02-11T06:00:00Z'
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
    },
    {
      id: 'channel-sms',
      name: '值班簡訊',
      type: 'sms',
      description: '透過簡訊服務傳送告警摘要',
      status: 'testing',
      config: {
        provider: 'twilio',
        sender: '+886900000000'
      },
      last_tested_at: '2025-02-14T07:00:00Z',
      created_by: {
        id: 'user-1',
        username: 'sre.chen',
        display_name: '陳家豪'
      },
      updated_by: {
        id: 'user-1',
        username: 'sre.chen',
        display_name: '陳家豪'
      },
      created_at: '2024-12-28T00:00:00Z',
      updated_at: '2025-02-14T07:00:00Z'
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
    },
    {
      id: 'notify-2',
      policy_id: 'policy-1',
      policy_name: '重大事件告警',
      channel_id: 'channel-slack',
      channel_type: 'slack',
      status: 'success',
      recipients: [
        {
          id: 'team-sre',
          display_name: 'SRE 值班群組'
        }
      ],
      sent_at: '2025-02-18T02:31:30Z',
      completed_at: '2025-02-18T02:31:31Z',
      retry_count: 0,
      duration_ms: 900,
      error_message: null,
      payload_excerpt: 'Slack 推播：INC-1001',
      attempts: [
        {
          attempt_at: '2025-02-18T02:31:30Z',
          status: 'success',
          response_code: 200
        }
      ],
      metadata: {
        message_id: 'slack-20250218-01'
      },
      related_event_id: 'evt-1'
    },
    {
      id: 'notify-3',
      policy_id: 'policy-2',
      policy_name: '資料庫容量提醒',
      channel_id: 'channel-sms',
      channel_type: 'sms',
      status: 'failed',
      recipients: [
        {
          id: 'user-7',
          display_name: '王怡萱'
        }
      ],
      sent_at: '2025-02-17T22:20:00Z',
      completed_at: '2025-02-17T22:20:05Z',
      retry_count: 1,
      duration_ms: 5000,
      error_message: '簡訊供應商逾時',
      payload_excerpt: '連線數逼近 520',
      attempts: [
        {
          attempt_at: '2025-02-17T22:20:00Z',
          status: 'failed',
          response_code: 504
        },
        {
          attempt_at: '2025-02-17T22:20:04Z',
          status: 'failed',
          response_code: 504
        }
      ],
      metadata: {
        message_id: 'sms-20250217-02'
      },
      related_event_id: 'evt-2'
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
    },
    {
      id: 'label-2',
      key: 'tier',
      value: 'database',
      category: '基礎設施',
      color: '#a0d911',
      description: '資料庫服務層',
      is_system: false,
      usage_count: 9,
      created_by: {
        id: 'user-7',
        username: 'dba.wang',
        display_name: '王怡萱'
      },
      updated_by: {
        id: 'user-7',
        username: 'dba.wang',
        display_name: '王怡萱'
      },
      created_at: '2024-06-18T00:00:00Z',
      updated_at: '2025-02-12T00:00:00Z'
    },
    {
      id: 'label-3',
      key: 'region',
      value: 'north',
      category: '地區',
      color: '#13c2c2',
      description: '北區機房或節點',
      is_system: false,
      usage_count: 6,
      created_by: {
        id: 'user-8',
        username: 'ops.lee',
        display_name: '李建中'
      },
      updated_by: {
        id: 'user-8',
        username: 'ops.lee',
        display_name: '李建中'
      },
      created_at: '2024-09-05T00:00:00Z',
      updated_at: '2025-02-14T00:00:00Z'
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
    },
    {
      id: 'mail-2',
      smtp_host: 'smtp.backup.example.com',
      smtp_port: 465,
      username: 'alerts@example.com',
      sender_name: '備援通知信箱',
      sender_email: 'alerts@example.com',
      reply_to: 'ops@example.com',
      encryption: 'ssl',
      test_recipient: 'ops@example.com',
      is_enabled: false,
      last_tested_at: '2025-01-28T06:20:00Z',
      created_by: {
        id: 'user-4',
        username: 'manager.wu',
        display_name: '吳怡廷'
      },
      updated_by: {
        id: 'user-4',
        username: 'manager.wu',
        display_name: '吳怡廷'
      },
      created_at: '2024-10-15T00:00:00Z',
      updated_at: '2025-01-28T06:20:00Z'
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
    },
    {
      id: 'auth-2',
      provider: 'saml',
      oidc_enabled: false,
      realm: 'corp-sso',
      client_id: 'sre-saml',
      client_secret_hint: null,
      auth_url: 'https://sso.example.com/login',
      token_url: null,
      userinfo_url: null,
      redirect_uri: 'https://portal.example.com/saml/callback',
      logout_url: 'https://sso.example.com/logout',
      scopes: ['profile', 'email'],
      user_sync: false,
      last_tested_at: '2025-01-30T07:45:00Z',
      created_by: {
        id: 'user-4',
        username: 'manager.wu',
        display_name: '吳怡廷'
      },
      updated_by: {
        id: 'user-4',
        username: 'manager.wu',
        display_name: '吳怡廷'
      },
      created_at: '2024-11-25T00:00:00Z',
      updated_at: '2025-01-30T07:45:00Z'
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
    },
    {
      id: 'user-2',
      username: 'alice.lin',
      display_name: '林怡君',
      email: 'alice.lin@example.com',
      role: 'product_owner',
      status: 'active',
      language: '繁體中文',
      timezone: 'Asia/Taipei',
      teams: [
        {
          id: 'team-product',
          name: '產品管理組'
        }
      ],
      last_login_at: '2025-02-17T14:20:00Z',
      created_at: '2023-09-15T00:00:00Z',
      updated_at: '2025-02-15T08:10:00Z'
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
    },
    {
      id: 'pref-2',
      user_id: 'user-2',
      theme: 'light',
      default_page: 'events',
      language: '繁體中文',
      timezone: 'Asia/Taipei',
      notification_preferences: {
        email_notification: true,
        slack_notification: false,
        merge_notification: true
      },
      display_options: {
        animation: false,
        tooltips: true,
        compact_mode: true
      },
      created_at: '2024-02-20T00:00:00Z',
      updated_at: '2025-02-12T04:20:00Z'
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

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Mock server is running on port ${PORT}`);
  });
}

module.exports = { app, store };
