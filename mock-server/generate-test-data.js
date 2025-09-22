#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// 讀取現有的 db.json
const dbPath = path.join(__dirname, 'db.json');
const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

// 生成隨機 ID
const generateId = (prefix, index) => `${prefix}_${Date.now()}_${index}`;

// 生成隨機時間戳
const randomTimestamp = (daysAgo = 7) => {
  const now = Date.now();
  const randomOffset = Math.random() * daysAgo * 24 * 60 * 60 * 1000;
  return new Date(now - randomOffset).toISOString();
};

// 資源類型和名稱
const resourceTypes = ['application', 'service', 'database', 'cache', 'queue', 'infrastructure'];
const resourceNames = [
  'checkout-api', 'payment-gateway', 'user-service', 'notification-service',
  'order-service', 'inventory-service', 'auth-service', 'file-service',
  'db-mysql-prod', 'db-postgres-staging', 'redis-cache', 'rabbitmq-queue',
  'web-nginx', 'load-balancer', 'cdn-cloudflare', 'monitoring-prometheus'
];

const environments = ['production', 'staging', 'testing', 'development'];
const locations = ['us-east-1', 'us-west-2', 'eu-west-1', 'ap-southeast-1'];
const severities = ['CRITICAL', 'WARNING', 'INFO'];
const statuses = ['FIRING', 'RESOLVED', 'PENDING'];
const incidentStatuses = ['new', 'investigating', 'acknowledged', 'resolved'];

// 生成資源
const generateResources = (count = 200) => {
  const resources = [];
  for (let i = 0; i < count; i++) {
    const type = resourceTypes[Math.floor(Math.random() * resourceTypes.length)];
    const baseName = resourceNames[Math.floor(Math.random() * resourceNames.length)];
    const env = environments[Math.floor(Math.random() * environments.length)];
    const name = `${baseName}-${env}-${String(i + 1).padStart(2, '0')}`;

    resources.push({
      id: generateId('res', i),
      name,
      type,
      status: Math.random() > 0.8 ? 'WARNING' : Math.random() > 0.95 ? 'CRITICAL' : 'HEALTHY',
      ip_address: `10.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
      location: locations[Math.floor(Math.random() * locations.length)],
      environment: env,
      provider: 'AWS',
      team_id: `team_${Math.floor(Math.random() * 5) + 1}`,
      groups: [`group_${Math.floor(Math.random() * 10) + 1}`],
      tags: [
        { key: 'environment', value: env },
        { key: 'team', value: `team-${Math.floor(Math.random() * 5) + 1}` },
        { key: 'service', value: type }
      ],
      metrics: {
        cpu_usage: Math.random() * 100,
        memory_usage: Math.random() * 100,
        disk_usage: Math.random() * 100,
        network_in: Math.random() * 1000,
        network_out: Math.random() * 1000
      },
      metrics_history: {
        timestamps: Array.from({ length: 24 }, (_, i) =>
          new Date(Date.now() - (23 - i) * 60 * 60 * 1000).toISOString()
        ),
        cpu_series: Array.from({ length: 24 }, () => Math.random() * 100),
        memory_series: Array.from({ length: 24 }, () => Math.random() * 100)
      },
      related_incidents: Math.floor(Math.random() * 5),
      health_summary: Math.random() > 0.8 ? 'CPU 使用率偏高' : null,
      actions: [
        {
          key: 'restart',
          label: '重啟服務',
          type: 'automation',
          description: '執行自動重啟腳本'
        }
      ],
      last_checked_at: randomTimestamp(1),
      created_at: randomTimestamp(30),
      updated_at: randomTimestamp(1)
    });
  }
  return resources;
};

// 生成事件
const generateEvents = (count = 500) => {
  const events = [];
  for (let i = 0; i < count; i++) {
    const severity = severities[Math.floor(Math.random() * severities.length)];
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const resourceName = resourceNames[Math.floor(Math.random() * resourceNames.length)];

    events.push({
      id: generateId('evt', i),
      incident_id: Math.random() > 0.7 ? generateId('inc', Math.floor(Math.random() * 50)) : null,
      summary: `${resourceName} ${severity.toLowerCase()} alert`,
      description: `Grafana Alert: ${resourceName} 出現 ${severity} 級別告警`,
      severity,
      status,
      source: Math.random() > 0.5 ? 'Prometheus' : 'Grafana',
      resource_id: generateId('res', Math.floor(Math.random() * 200)),
      rule_id: generateId('rule', Math.floor(Math.random() * 20)),
      starts_at: randomTimestamp(7),
      ends_at: status === 'RESOLVED' ? randomTimestamp(1) : null,
      labels: {
        alertname: `${resourceName}Alert`,
        severity: severity.toLowerCase(),
        service: resourceName,
        environment: environments[Math.floor(Math.random() * environments.length)]
      },
      annotations: {
        summary: `${resourceName} alert triggered`,
        description: `Alert for ${resourceName} service`
      },
      created_at: randomTimestamp(7),
      updated_at: randomTimestamp(1)
    });
  }
  return events;
};

// 生成事故
const generateIncidents = (count = 50) => {
  const incidents = [];
  for (let i = 0; i < count; i++) {
    const status = incidentStatuses[Math.floor(Math.random() * incidentStatuses.length)];
    const severity = ['low', 'medium', 'high', 'critical'][Math.floor(Math.random() * 4)];
    const service = resourceNames[Math.floor(Math.random() * resourceNames.length)];

    const createdAt = randomTimestamp(30);
    const acknowledgedAt = status !== 'new' ? randomTimestamp(29) : null;
    const resolvedAt = status === 'resolved' ? randomTimestamp(28) : null;

    incidents.push({
      id: generateId('inc', i),
      title: `${service} service disruption`,
      status,
      severity,
      assignee_id: `user_${Math.floor(Math.random() * 10) + 1}`,
      description: `Service disruption affecting ${service}`,
      tags: [
        { key: 'service', value: service },
        { key: 'severity', value: severity },
        { key: 'team', value: `team-${Math.floor(Math.random() * 5) + 1}` }
      ],
      created_at: createdAt,
      updated_at: resolvedAt || acknowledgedAt || createdAt,
      acknowledged_at: acknowledgedAt,
      resolved_at: resolvedAt
    });
  }
  return incidents;
};

// 生成事件規則
const generateEventRules = (count = 30) => {
  const rules = [];
  const ruleTypes = ['metric', 'log', 'uptime', 'performance'];

  for (let i = 0; i < count; i++) {
    const ruleType = ruleTypes[Math.floor(Math.random() * ruleTypes.length)];
    const service = resourceNames[Math.floor(Math.random() * resourceNames.length)];

    rules.push({
      id: generateId('rule', i),
      name: `${service} ${ruleType} alert`,
      description: `Alert rule for ${service} ${ruleType} monitoring`,
      expression: `${ruleType}_value > threshold`,
      severity: severities[Math.floor(Math.random() * severities.length)],
      threshold: Math.random() * 100,
      duration: '5m',
      labels: {
        service,
        type: ruleType,
        team: `team-${Math.floor(Math.random() * 5) + 1}`
      },
      annotations: {
        summary: `${service} ${ruleType} alert`,
        runbook: `http://runbook.example.com/${service}/${ruleType}`
      },
      enabled: Math.random() > 0.2,
      created_at: randomTimestamp(60),
      updated_at: randomTimestamp(30),
      created_by: `user_${Math.floor(Math.random() * 10) + 1}`
    });
  }
  return rules;
};

// 生成靜音規則
const generateSilenceRules = (count = 20) => {
  const rules = [];

  for (let i = 0; i < count; i++) {
    const startsAt = randomTimestamp(7);
    const endsAt = new Date(Date.parse(startsAt) + Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString();
    const isActive = Date.now() >= Date.parse(startsAt) && Date.now() <= Date.parse(endsAt);

    rules.push({
      id: generateId('silence', i),
      matchers: [
        {
          name: 'service',
          value: resourceNames[Math.floor(Math.random() * resourceNames.length)],
          operator: '='
        }
      ],
      starts_at: startsAt,
      ends_at: endsAt,
      comment: `Maintenance window for service upgrade`,
      created_by: `user_${Math.floor(Math.random() * 10) + 1}`,
      status: isActive ? 'active' : Math.random() > 0.5 ? 'expired' : 'pending',
      created_at: randomTimestamp(8),
      updated_at: randomTimestamp(1)
    });
  }
  return rules;
};

// 生成告警風暴群組
const generateStormGroups = (eventIds, count = 10) => {
  const groups = [];

  for (let i = 0; i < count; i++) {
    const groupEventIds = eventIds
      .sort(() => 0.5 - Math.random())
      .slice(0, Math.floor(Math.random() * 20) + 5);

    groups.push({
      id: generateId('storm', i),
      name: `Storm Group ${i + 1}`,
      description: `告警風暴群組 - 批次告警事件`,
      event_ids: groupEventIds,
      severity: 'CRITICAL',
      status: 'active',
      created_at: randomTimestamp(1),
      updated_at: randomTimestamp(1),
      event_count: groupEventIds.length
    });
  }
  return groups;
};

// 主要生成邏輯
console.log('正在生成測試資料...');

// 生成新資料
const newResources = generateResources(200);
const newEvents = generateEvents(500);
const newIncidents = generateIncidents(50);
const newEventRules = generateEventRules(30);
const newSilenceRules = generateSilenceRules(20);

// 生成告警風暴群組（使用事件 ID）
const eventIds = newEvents.map(e => e.id);
const stormGroups = generateStormGroups(eventIds, 10);

// 合併到現有資料庫
db.resources = [...(db.resources || []), ...newResources];
db.events = [...(db.events || []), ...newEvents];
db.incidents = [...(db.incidents || []), ...newIncidents];
db.event_rules = [...(db.event_rules || []), ...newEventRules];
db.silence_rules = [...(db.silence_rules || []), ...newSilenceRules];
db.storm_groups = [...(db.storm_groups || []), ...stormGroups];

// 確保有審計日誌集合
if (!db.audit_logs) {
  db.audit_logs = [];
}

// 寫入檔案
fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));

console.log('測試資料生成完成！');
console.log(`生成統計：
- 資源: ${newResources.length} 筆 (總計: ${db.resources.length})
- 事件: ${newEvents.length} 筆 (總計: ${db.events.length})
- 事故: ${newIncidents.length} 筆 (總計: ${db.incidents.length})
- 事件規則: ${newEventRules.length} 筆 (總計: ${db.event_rules.length})
- 靜音規則: ${newSilenceRules.length} 筆 (總計: ${db.silence_rules.length})
- 告警風暴群組: ${stormGroups.length} 筆 (總計: ${db.storm_groups.length})
`);