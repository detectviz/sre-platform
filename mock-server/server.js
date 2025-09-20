const jsonServer = require('json-server');
const server = jsonServer.create();
const router = jsonServer.router('db.json');
const middlewares = jsonServer.defaults();

server.use(middlewares);

// 添加自定義路由和中間件
server.use(jsonServer.bodyParser);

// 統一路由註冊，確保 /api/v1 與根路徑都可使用
const registerRoute = (method, path, handler) => {
  server[method](path, handler);
  server[method](`/api/v1${path}`, handler);
};

const parsePageParam = (value, fallback) => {
  const num = parseInt(value, 10);
  return Number.isFinite(num) && num > 0 ? num : fallback;
};

const buildPagination = (page, pageSize, totalItems) => {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  return {
    page,
    page_size: pageSize,
    total: totalItems,
    total_pages: totalPages
  };
};

const withPagination = (items, page, pageSize) => {
  const total = items.length;
  const start = (page - 1) * pageSize;
  const end = start + pageSize;
  const pageItems = items.slice(start, end);
  return {
    items: pageItems,
    pagination: buildPagination(page, pageSize, total)
  };
};

const ensureArrayCollection = (db, key) => {
  const collection = db.get(key);
  const value = collection.value();
  if (!Array.isArray(value)) {
    db.set(key, []).write();
    return db.get(key);
  }
  return collection;
};

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

const tryParseNumber = (value) => {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === 'string' && value.trim() !== '') {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
};

const pickNumber = (...candidates) => {
  for (const candidate of candidates) {
    const parsed = tryParseNumber(candidate);
    if (parsed !== null) {
      return parsed;
    }
  }
  return null;
};

const hashString = (value) => {
  const input = typeof value === 'string' ? value : String(value ?? '');
  let hash = 2166136261;
  for (let index = 0; index < input.length; index += 1) {
    hash ^= input.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
};

const createSeededGenerator = (seedInput) => {
  let state = hashString(seedInput) >>> 0;
  if (!state) {
    state = 0x9e3779b9; // Fallback 非零種子，避免固定序列
  }
  return () => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    return state / 0xffffffff;
  };
};

const generateMetricHistory = (seedInput, cpuBase = 55, memoryBase = 60, points = 12, rangeMinutes = 60) => {
  const generator = createSeededGenerator(`${seedInput}:${points}:${rangeMinutes}`);
  const safePoints = clamp(Math.floor(points), 4, 60);
  const safeRangeMinutes = clamp(Math.floor(rangeMinutes), 15, 24 * 60);
  const totalDurationMs = safeRangeMinutes * 60 * 1000;
  const stepMs = Math.max(60 * 1000, Math.floor(totalDurationMs / safePoints));
  const timestamps = [];
  const cpuSeries = [];
  const memorySeries = [];
  const now = Date.now();
  const startTime = now - (safePoints - 1) * stepMs;

  for (let index = 0; index < safePoints; index += 1) {
    const timestamp = new Date(startTime + index * stepMs).toISOString();
    timestamps.push(timestamp);

    const cpuNoise = (generator() - 0.5) * 14;
    const memoryNoise = (generator() - 0.5) * 10;

    cpuSeries.push(clamp(Math.round(cpuBase + cpuNoise), 0, 100));
    memorySeries.push(clamp(Math.round(memoryBase + memoryNoise), 0, 100));
  }

  return {
    timestamps,
    cpuSeries,
    memorySeries,
    cpu_usage: cpuSeries,
    memory_usage: memorySeries,
  };
};

const statusPriority = {
  CRITICAL: 0,
  WARNING: 1,
  MAINTENANCE: 2,
  SILENCED: 3,
  HEALTHY: 4,
  UNKNOWN: 5,
};

const normalizeStatus = (value) => {
  if (typeof value !== 'string') {
    return 'UNKNOWN';
  }
  const normalized = value.trim().toUpperCase();
  return statusPriority.hasOwnProperty(normalized) ? normalized : 'UNKNOWN';
};

const RESOURCE_CACHE_TTL_MS = 60 * 1000;

const resourceCache = {
  items: [],
  groups: [],
  stats: null,
  generatedAt: null,
  expiresAt: 0,
};

const invalidateResourceCache = () => {
  resourceCache.expiresAt = 0;
};

const stripInternalFields = (entry) => {
  if (!entry || typeof entry !== 'object') {
    return entry;
  }
  return Object.fromEntries(Object.entries(entry).filter(([key]) => !key.startsWith('__')));
};

const computeHealthInsights = (resource, activeEvents, metricsHistory) => {
  const reasons = [];
  const metrics = resource.metrics || {};
  const cpuUsage = pickNumber(metrics.cpuUsage, metrics.cpu_usage) ?? 0;
  const memoryUsage = pickNumber(metrics.memoryUsage, metrics.memory_usage) ?? 0;
  const latencyMs = pickNumber(metrics.latencyMs, metrics.latency_ms);

  if (cpuUsage >= 90) {
    reasons.push('CPU 使用率於最近 15 分鐘平均高於 90%，可能存在資源飽和風險');
  } else if (cpuUsage >= 80) {
    reasons.push('CPU 使用率連續多個周期高於 80%');
  }

  if (memoryUsage >= 85) {
    reasons.push('記憶體使用率高於 85%，建議檢查應用程式記憶體配置');
  }

  if (typeof latencyMs === 'number' && latencyMs >= 180) {
    reasons.push(`平均延遲 ${latencyMs}ms，高於內部 SLO 門檻`);
  }

  if (metricsHistory && Array.isArray(metricsHistory.cpuSeries)) {
    const cpuSeries = metricsHistory.cpuSeries;
    if (cpuSeries.length >= 2) {
      const delta = cpuSeries[cpuSeries.length - 1] - cpuSeries[0];
      if (delta >= 15) {
        reasons.push('CPU 使用率在過去一小時內上升超過 15%');
      }
    }
  }

  if (activeEvents.length > 0) {
    const sample = activeEvents[0];
    const summary = sample.summary || sample.description || sample.id || '監控事件';
    const severity = (sample.severity || '').toUpperCase();
    const qualifier = severity === 'CRITICAL' ? '嚴重' : '活躍';
    reasons.push(`目前有 ${activeEvents.length} 個${qualifier}事件，例如「${summary}」`);
  }

  if (reasons.length === 0) {
    reasons.push('所有核心監控指標均在安全範圍內');
  }

  return {
    summary: reasons[0],
    reasons,
  };
};

const buildResourceActions = (resource) => {
  const actions = [];
  const actionMap = new Map();
  const type = String(resource.type || '').toLowerCase();
  const tags = Array.isArray(resource.tags) ? resource.tags : [];
  const hasProductionTag = tags.some((tag) =>
    typeof tag?.key === 'string' && tag.key.toLowerCase() === 'environment' && String(tag.value).toLowerCase() === 'production'
  );

  const pushAction = (action) => {
    if (!action || !action.key || actionMap.has(action.key)) {
      return;
    }
    actionMap.set(action.key, action);
    actions.push(action);
  };

  pushAction({
    key: 'view-dashboard',
    label: '查看 Grafana 儀表板',
    type: 'link',
    url: resource.observability?.grafana_url ?? `https://grafana.example.com/d/${resource.id}`,
    description: '開啟 Grafana 儀表板檢視資源即時指標',
  });

  if (type.includes('database')) {
    pushAction({
      key: 'run-backup',
      label: '執行備份',
      type: 'automation',
      description: '透過自動化流程觸發資料庫全量備份 (模擬)',
    });
    pushAction({
      key: 'analyze-slow-query',
      label: '慢查詢分析',
      type: 'link',
      url: `https://grafana.example.com/explore?resource=${resource.id}&view=slow-query`,
      description: '開啟查詢分析儀表板檢視慢查詢趨勢',
    });
  }

  if (type.includes('service') || type.includes('application')) {
    pushAction({
      key: 'tail-logs',
      label: '查看即時日誌',
      type: 'automation',
      description: '串接 Loki 查詢最近 10 分鐘日誌 (模擬)',
    });
    pushAction({
      key: 'trigger-scale-out',
      label: '啟動擴容',
      type: 'automation',
      description: '透過排程平台擴容服務節點 (模擬)',
    });
  }

  if (type.includes('cache')) {
    pushAction({
      key: 'flush-cache',
      label: '刷新快取',
      type: 'automation',
      description: '清空快取節點資料以釋放資源 (模擬)',
    });
  }

  if (hasProductionTag) {
    pushAction({
      key: 'create-incident',
      label: '建立事故',
      type: 'navigate',
      target: '/incidents/new',
      description: '以此資源為範圍建立事故並指派值班工程師',
    });
  }

  return actions.slice(0, 5);
};

const computeResourceStatistics = (resources, groups, generatedAt) => {
  const stats = {
    total: resources.length,
    healthy: 0,
    warning: 0,
    critical: 0,
    maintenance: 0,
    groups: groups.length,
    automationCoverage: 0,
    offline: 0,
    lastUpdatedAt: generatedAt,
  };

  let automationManaged = 0;
  let latestUpdatedAt = generatedAt;

  resources.forEach((resource) => {
    const status = normalizeStatus(resource.status);
    if (status === 'HEALTHY') stats.healthy += 1;
    if (status === 'WARNING') stats.warning += 1;
    if (status === 'CRITICAL') stats.critical += 1;
    if (status === 'MAINTENANCE') stats.maintenance += 1;
    if (status === 'UNKNOWN') stats.offline += 1;

    const hasAutomationTag = Array.isArray(resource.tags)
      ? resource.tags.some((tag) => /auto|automation|managed/i.test(`${tag.key}:${tag.value}`))
      : false;

    if (hasAutomationTag) {
      automationManaged += 1;
    }

    const updatedAt = resource.updated_at || resource.updatedAt || resource.last_checked_at || resource.lastCheckedAt;
    if (updatedAt && (!latestUpdatedAt || new Date(updatedAt).getTime() > new Date(latestUpdatedAt).getTime())) {
      latestUpdatedAt = updatedAt;
    }
  });

  stats.automationCoverage = stats.total > 0 ? Math.round((automationManaged / stats.total) * 100) : 0;
  stats.lastUpdatedAt = latestUpdatedAt || generatedAt;

  return stats;
};

const aggregateResourceGroups = (groupRecords, resources, generatedAt) => {
  const resourceMap = new Map(resources.map((resource) => [resource.id, resource]));

  return groupRecords.map((group) => {
    const memberIds = Array.isArray(group.resource_ids)
      ? group.resource_ids.filter((id) => resourceMap.has(id))
      : Array.isArray(group.member_ids)
        ? group.member_ids.filter((id) => resourceMap.has(id))
        : [];

    const tagsAccumulator = new Map();
    const healthBreakdown = { healthy: 0, warning: 0, critical: 0, maintenance: 0 };
    let recentChanges = 0;
    let automationManaged = 0;
    let groupStatus = 'UNKNOWN';

    memberIds.forEach((memberId) => {
      const resource = resourceMap.get(memberId);
      if (!resource) {
        return;
      }

      const status = normalizeStatus(resource.status);
      if (statusPriority[status] < statusPriority[groupStatus] || groupStatus === 'UNKNOWN') {
        groupStatus = status;
      }

      if (status === 'HEALTHY') healthBreakdown.healthy += 1;
      if (status === 'WARNING') healthBreakdown.warning += 1;
      if (status === 'CRITICAL') healthBreakdown.critical += 1;
      if (status === 'MAINTENANCE') healthBreakdown.maintenance += 1;

      const updatedAt = resource.updated_at || resource.updatedAt;
      if (updatedAt && Date.now() - new Date(updatedAt).getTime() < 24 * 60 * 60 * 1000) {
        recentChanges += 1;
      }

      if (Array.isArray(resource.tags)) {
        resource.tags.forEach((tag) => {
          if (!tag || !tag.key) {
            return;
          }
          const key = `${tag.key}:${tag.value}`;
          if (!tagsAccumulator.has(key)) {
            tagsAccumulator.set(key, { key: tag.key, value: tag.value, source: tag.source ?? 'derived' });
          }
          if (/auto|automation|managed/i.test(key)) {
            automationManaged += 1;
          }
        });
      }
    });

    const memberCount = memberIds.length;
    const automationCoverage = memberCount > 0 ? Math.round((automationManaged / memberCount) * 100) : 0;

    const payload = {
      id: group.id,
      name: group.name,
      description: group.description ?? null,
      responsible_team_id: group.owner_team_id ?? group.responsible_team_id ?? null,
      member_ids: memberIds,
      tags: Array.from(tagsAccumulator.values()),
      status: groupStatus,
      created_at: group.created_at ?? null,
      updated_at: group.updated_at ?? null,
      metadata: {
        member_count: memberCount,
        health_breakdown: healthBreakdown,
        recent_changes: recentChanges,
        automation_coverage: automationCoverage,
        generated_at: generatedAt,
      },
      __searchText: [group.id, group.name, group.description, groupStatus, ...(Array.from(tagsAccumulator.values()).map((tag) => `${tag.key}:${tag.value}`))]
        .filter(Boolean)
        .join(' ')
        .toLowerCase(),
    };

    return payload;
  });
};

const channelHealthState = new Map();

const recordChannelHealth = (db, result = {}, options = {}) => {
  if (!result || typeof result !== 'object') {
    return null;
  }
  const channelId = result.id || result.channel_id || result.channelId;
  if (!channelId) {
    return null;
  }

  const normalizedStatus = typeof result.status === 'string'
    ? result.status.toLowerCase()
    : 'unknown';
  const nowIso = typeof result.checkedAt === 'string'
    ? result.checkedAt
    : typeof result.checked_at === 'string'
      ? result.checked_at
      : new Date().toISOString();

  const entry = {
    id: options.id || `channel_health_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    channel_id: channelId,
    status: normalizedStatus,
    latency_ms: typeof result.latencyMs === 'number' ? Math.round(result.latencyMs) : null,
    attempts: typeof result.attempts === 'number' ? Math.round(result.attempts) : null,
    message: result.message ?? null,
    checked_at: nowIso,
    source: options.source || 'automatic_probe',
  };

  const existing = channelHealthState.get(channelId) || { history: [] };
  const history = [entry, ...existing.history].slice(0, 30);
  channelHealthState.set(channelId, {
    status: normalizedStatus,
    latency_ms: entry.latency_ms,
    attempts: entry.attempts,
    message: entry.message,
    checked_at: entry.checked_at,
    history,
  });

  const healthCollection = ensureArrayCollection(db, 'channel_health_checks');
  healthCollection.push(entry).write();
  return entry;
};

const loadChannelHealthFromDb = (db) => {
  const collection = ensureArrayCollection(db, 'channel_health_checks');
  const records = collection.value() || [];
  records.slice(-100).forEach((record) => {
    if (!record || typeof record !== 'object' || !record.channel_id) {
      return;
    }
    const normalizedStatus = typeof record.status === 'string' ? record.status.toLowerCase() : 'unknown';
    const entry = {
      status: normalizedStatus,
      latency_ms: record.latency_ms ?? null,
      attempts: record.attempts ?? null,
      message: record.message ?? null,
      checked_at: record.checked_at ?? null,
      history: [],
    };
    const existing = channelHealthState.get(record.channel_id);
    const history = existing ? existing.history : [];
    channelHealthState.set(record.channel_id, {
      ...entry,
      history: [
        {
          id: record.id,
          channel_id: record.channel_id,
          status: normalizedStatus,
          latency_ms: record.latency_ms ?? null,
          attempts: record.attempts ?? null,
          message: record.message ?? null,
          checked_at: record.checked_at ?? null,
          source: record.source ?? 'historical',
        },
        ...(history || []),
      ].slice(0, 30),
    });
  });
};

const getChannelHealthSnapshot = (channelId) => channelHealthState.get(channelId) || null;

const getChannelHealthHistory = (db, channelId) => {
  const snapshot = getChannelHealthSnapshot(channelId);
  if (snapshot && Array.isArray(snapshot.history)) {
    return snapshot.history;
  }
  const collection = ensureArrayCollection(db, 'channel_health_checks');
  return collection
    .filter({ channel_id: channelId })
    .orderBy(['checked_at'], ['desc'])
    .take(30)
    .value();
};

const serializeChannel = (channel, db, options = {}) => {
  const healthCollection = Array.isArray(options.healthCollection)
    ? options.healthCollection
    : ensureArrayCollection(db, 'channel_health_checks').value();
  const health = getChannelHealthSnapshot(channel.id);
  const historyCountFromCollection = Array.isArray(healthCollection)
    ? healthCollection.filter((record) => record && record.channel_id === channel.id).length
    : 0;
  return {
    id: channel.id,
    name: channel.name,
    type: channel.type,
    enabled: channel.enabled !== false,
    description: channel.description ?? null,
    endpoint: channel.endpoint ?? channel.webhook_url ?? null,
    default_recipients: Array.isArray(channel.default_recipients) ? channel.default_recipients : [],
    metadata: typeof channel.metadata === 'object' && channel.metadata !== null ? channel.metadata : null,
    created_at: channel.created_at ?? null,
    updated_at: channel.updated_at ?? null,
    health: health
      ? {
        status: health.status ?? 'unknown',
        latency_ms: health.latency_ms ?? null,
        attempts: health.attempts ?? null,
        message: health.message ?? null,
        checked_at: health.checked_at ?? null,
      }
      : null,
    history_count: Array.isArray(health?.history)
      ? health.history.length
      : historyCountFromCollection,
  };
};

const BACKGROUND_JOB_BLUEPRINTS = {
  resource_kpi_precompute: {
    name: '資源 KPI 預計算作業',
    description: '每分鐘聚合資源健康統計並更新快取，支援資源頁面即時載入。',
    intervalMinutes: 1,
    timezone: 'Asia/Taipei',
    tags: ['cmdb', 'metrics', 'redis-cache'],
    ownerTeam: 'team_observability',
    run: ({ context }) => {
      const stats = context?.stats ?? computeResourceStatistics(context?.resources ?? [], context?.groups ?? [], context?.generatedAt);
      const processedResources = context?.resources?.length ?? stats.total ?? 0;
      const staleThresholdMs = 5 * 60 * 1000;
      const staleResources = Array.isArray(context?.resources)
        ? context.resources.filter((resource) => {
          const updatedAt = resource.updated_at || resource.updatedAt || resource.last_checked_at || resource.lastCheckedAt;
          if (!updatedAt) {
            return true;
          }
          return Date.now() - new Date(updatedAt).getTime() > staleThresholdMs;
        }).length
        : 0;

      const durationMs = Math.round(40 + Math.random() * 50);
      const message = `已更新 ${processedResources} 筆資源指標快取`;
      return {
        success: true,
        durationMs,
        message,
        metrics: {
          processedResources,
          healthy: stats.healthy ?? 0,
          warning: stats.warning ?? 0,
          critical: stats.critical ?? 0,
          automationCoverage: stats.automationCoverage ?? 0,
          staleResources,
          generatedAt: context?.generatedAt,
        },
      };
    },
  },
  notification_channel_health_probe: {
    name: '通知管道健康檢查',
    description: '每 15 分鐘模擬呼叫 Grafana API 檢查通知管道路由健康度。',
    intervalMinutes: 15,
    timezone: 'Asia/Taipei',
    tags: ['grafana', 'notifications', 'health-check'],
    ownerTeam: 'team_notifications',
    run: ({ db }) => {
      const channels = db.get('notification_channels').value() || [];
      const enabledChannels = channels.filter((channel) => channel && channel.enabled !== false);
      const results = enabledChannels.map((channel) => {
        const generator = createSeededGenerator(`${channel.id}:${new Date().toISOString().slice(0, 16)}`);
        const latency = Math.round(80 + generator() * 240);
        const statusRoll = generator();
        let status = 'HEALTHY';
        let message = '響應正常';
        if (statusRoll > 0.89) {
          status = 'CRITICAL';
          message = '多次嘗試後仍無響應';
        } else if (statusRoll > 0.72) {
          status = 'WARNING';
          message = '延遲偏高，已通知值班人員';
        }
        return {
          id: channel.id,
          name: channel.name,
          type: channel.type,
          status,
          latencyMs: latency,
          attempts: Math.round(1 + generator() * 3),
          message,
        };
      });

      const checkedAt = new Date().toISOString();
      const recordedResults = results.map((result) => {
        recordChannelHealth(db, {
          ...result,
          checkedAt,
        }, { source: 'scheduled_probe' });
        return {
          ...result,
          checkedAt,
        };
      });

      const unhealthyChannels = recordedResults.filter((result) => result.status !== 'HEALTHY');
      const durationMs = Math.round(120 + Math.random() * 160);
      const message = unhealthyChannels.length
        ? `發現 ${unhealthyChannels.length} 個管道需要關注`
        : '所有通知管道回應正常';

      return {
        success: true,
        durationMs,
        message,
        metrics: {
          checkedChannels: recordedResults.length,
          unhealthyChannels: unhealthyChannels.length,
          healthyChannels: recordedResults.length - unhealthyChannels.length,
          details: recordedResults,
          checkedAt,
        },
      };
    },
  },
};

const backgroundJobState = new Map();

const ensureJobState = (jobId) => {
  const blueprint = BACKGROUND_JOB_BLUEPRINTS[jobId];
  if (!blueprint) {
    throw new Error(`Unknown job: ${jobId}`);
  }
  if (!backgroundJobState.has(jobId)) {
    const nowIso = new Date().toISOString();
    backgroundJobState.set(jobId, {
      id: jobId,
      name: blueprint.name,
      description: blueprint.description,
      intervalMinutes: blueprint.intervalMinutes ?? 5,
      timezone: blueprint.timezone ?? 'UTC',
      tags: Array.isArray(blueprint.tags) ? blueprint.tags : [],
      ownerTeam: blueprint.ownerTeam ?? null,
      cronExpression: blueprint.cronExpression ?? null,
      status: 'healthy',
      lastRunAt: null,
      nextRunAt: nowIso,
      lastDurationMs: null,
      successCount: 0,
      failureCount: 0,
      consecutiveFailures: 0,
      lastMessage: '尚未執行',
      metricsSummary: {},
      history: [],
      createdAt: nowIso,
      updatedAt: nowIso,
    });
  }
  return backgroundJobState.get(jobId);
};

const deriveJobStatus = (state) => {
  if (state.consecutiveFailures >= 3) {
    return 'critical';
  }
  if (state.consecutiveFailures >= 1) {
    return 'warning';
  }
  if (state.metricsSummary && typeof state.metricsSummary.unhealthyChannels === 'number' && state.metricsSummary.unhealthyChannels > 0) {
    return 'warning';
  }
  if (state.metricsSummary && typeof state.metricsSummary.staleResources === 'number' && state.metricsSummary.staleResources > 5) {
    return 'warning';
  }
  return 'healthy';
};

const recordJobRun = (state, runResult, startedAt, options = {}) => {
  const success = runResult?.success !== false;
  const durationMs = typeof runResult?.durationMs === 'number'
    ? Math.max(1, Math.round(runResult.durationMs))
    : Math.max(1, Date.now() - startedAt);
  const message = typeof runResult?.message === 'string'
    ? runResult.message
    : success
      ? '作業完成'
      : '作業執行失敗';

  state.lastRunAt = new Date(startedAt).toISOString();
  state.lastDurationMs = durationMs;
  state.updatedAt = new Date().toISOString();
  state.metricsSummary = runResult?.metrics ?? state.metricsSummary ?? {};
  state.lastMessage = message;

  if (success) {
    state.successCount += 1;
    state.consecutiveFailures = 0;
  } else {
    state.failureCount += 1;
    state.consecutiveFailures += 1;
  }

  const intervalMs = Math.max(1, (state.intervalMinutes ?? 5) * 60 * 1000);
  state.nextRunAt = new Date(startedAt + intervalMs).toISOString();

  const historyEntry = {
    id: `job_run_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    job_id: state.id,
    status: success ? 'success' : 'failure',
    started_at: state.lastRunAt,
    duration_ms: durationMs,
    message,
    automatic: options.automatic ?? false,
    metrics: runResult?.metrics ?? null,
  };
  state.history.push(historyEntry);
  if (state.history.length > 30) {
    state.history.splice(0, state.history.length - 30);
  }

  state.status = deriveJobStatus(state);

  return { state, historyEntry };
};

const runBackgroundJob = (jobId, { db, context, automatic = false } = {}) => {
  const state = ensureJobState(jobId);
  const blueprint = BACKGROUND_JOB_BLUEPRINTS[jobId];
  const startedAt = Date.now();
  let result;
  try {
    result = blueprint.run({ db, context, state });
  } catch (error) {
    result = {
      success: false,
      durationMs: Date.now() - startedAt,
      message: error instanceof Error ? error.message : '未知錯誤',
    };
  }
  return recordJobRun(state, result, startedAt, { automatic });
};

const maybeRunScheduledJob = (jobId, db, context) => {
  const state = ensureJobState(jobId);
  if (!state.nextRunAt) {
    return;
  }
  const now = Date.now();
  const nextRunTime = new Date(state.nextRunAt).getTime();
  if (Number.isFinite(nextRunTime) && now >= nextRunTime) {
    runBackgroundJob(jobId, { db, context, automatic: true });
  }
};

const tickBackgroundJobs = (db, context) => {
  Object.keys(BACKGROUND_JOB_BLUEPRINTS).forEach((jobId) => {
    maybeRunScheduledJob(jobId, db, context);
  });
};

const serializeJobState = (state, options = {}) => ({
  id: state.id,
  name: state.name,
  description: state.description,
  status: state.status,
  interval_minutes: state.intervalMinutes,
  timezone: state.timezone,
  cron_expression: state.cronExpression,
  owner_team: state.ownerTeam,
  tags: state.tags,
  last_run_at: state.lastRunAt,
  next_run_at: state.nextRunAt,
  last_duration_ms: state.lastDurationMs,
  success_count: state.successCount,
  failure_count: state.failureCount,
  consecutive_failures: state.consecutiveFailures,
  last_message: state.lastMessage,
  metrics: state.metricsSummary,
  history: options.includeHistory ? state.history : undefined,
  created_at: state.createdAt,
  updated_at: state.updatedAt,
});

const listBackgroundJobs = (options = {}) => Array.from(backgroundJobState.values()).map((state) => serializeJobState(state, options));

loadChannelHealthFromDb(router.db);

const buildTagContext = (db, inventory) => {
  const tagKeys = db.get('tag_keys').value() || [];
  const allowedValuesRaw = db.get('tag_allowed_values').value() || [];
  const resourceTagRecords = db.get('resource_tags').value() || [];

  const tagKeyById = new Map();
  const tagKeyNameSet = new Set();
  tagKeys.forEach((tagKey) => {
    const keyName = typeof tagKey.key_name === 'string'
      ? tagKey.key_name
      : typeof tagKey.key === 'string'
        ? tagKey.key
        : typeof tagKey.name === 'string'
          ? tagKey.name
          : null;
    if (!keyName) {
      return;
    }
    tagKeyById.set(tagKey.id, { ...tagKey, key_name: keyName });
    tagKeyNameSet.add(keyName);
  });

  const allowedByKeyId = new Map();
  allowedValuesRaw.forEach((row) => {
    const keyId = row.tag_key_id || row.tagKeyId || row.key_id;
    if (!keyId) {
      return;
    }
    if (!allowedByKeyId.has(keyId)) {
      allowedByKeyId.set(keyId, []);
    }
    allowedByKeyId.get(keyId).push({
      id: row.id,
      value: row.value,
      label: row.label || row.value,
      color: row.color || null,
    });
  });

  const statsByKey = new Map();

  const ensureStatsEntry = (key) => {
    const normalizedKey = typeof key === 'string' ? key.trim() : '';
    if (!normalizedKey) {
      return null;
    }
    if (!statsByKey.has(normalizedKey)) {
      statsByKey.set(normalizedKey, {
        key: normalizedKey,
        counts: new Map(),
        totalCount: 0,
        allowed: [],
      });
    }
    return statsByKey.get(normalizedKey);
  };

  const registerTagValue = (key, value) => {
    const stats = ensureStatsEntry(key);
    if (!stats) {
      return;
    }
    const normalizedValue = typeof value === 'string'
      ? value.trim()
      : value === null || value === undefined
        ? ''
        : String(value).trim();
    if (!normalizedValue) {
      return;
    }
    const existing = stats.counts.get(normalizedValue) || { value: normalizedValue, count: 0 };
    existing.count += 1;
    stats.counts.set(normalizedValue, existing);
    stats.totalCount += 1;
  };

  (inventory.items || []).forEach((resource) => {
    const tagArray = Array.isArray(resource.tags) ? resource.tags : [];
    tagArray.forEach((tag) => {
      if (!tag || typeof tag !== 'object') {
        return;
      }
      registerTagValue(tag.key || tag.name, tag.value);
    });
  });

  resourceTagRecords.forEach((record) => {
    const tagKeyId = record.tag_key_id || record.tagKeyId;
    const derivedKey = tagKeyId && tagKeyById.has(tagKeyId)
      ? tagKeyById.get(tagKeyId).key_name
      : record.tag_key || record.key || record.name;
    registerTagValue(derivedKey, record.tag_value || record.value);
  });

  const metadataList = [];

  const createMetadataFromStats = (key, tagKeyDefinition) => {
    const stats = ensureStatsEntry(key);
    if (!stats) {
      return null;
    }
    const allowedRaw = tagKeyDefinition
      ? (allowedByKeyId.get(tagKeyDefinition.id) || allowedByKeyId.get(tagKeyDefinition.key_name) || [])
      : [];

    const allowedValues = allowedRaw.map((row) => ({
      id: row.id,
      value: row.value,
      label: row.label || row.value,
      color: row.color || null,
      usage_count: stats.counts.get(row.value)?.count ?? 0,
    }));

    stats.allowed = allowedValues;

    const sortedCounts = Array.from(stats.counts.values())
      .sort((a, b) => {
        const diff = (b.count || 0) - (a.count || 0);
        return diff !== 0 ? diff : String(a.value).localeCompare(String(b.value));
      });

    const sampleValues = (allowedValues.length > 0 ? allowedValues : sortedCounts.slice(0, 10)).map((entry) => ({
      value: entry.value,
      label: entry.label || entry.value,
      color: entry.color || null,
      usage_count: entry.usage_count ?? entry.count ?? 0,
    }));

    const distinctCount = stats.counts.size;
    const inferredMode = allowedValues.length > 0
      ? 'ENUM'
      : tagKeyDefinition?.validation_regex
        ? 'DYNAMIC'
        : distinctCount <= 40
          ? 'DYNAMIC'
          : 'FREEFORM';

    const metadata = {
      key,
      label: key,
      description: tagKeyDefinition?.description ?? null,
      category: tagKeyDefinition?.compliance_category ?? null,
      is_required: Boolean(tagKeyDefinition?.is_required),
      validation_regex: tagKeyDefinition?.validation_regex ?? null,
      value_mode: inferredMode,
      usage_count: typeof tagKeyDefinition?.usage_count === 'number'
        ? tagKeyDefinition.usage_count
        : stats.totalCount,
      distinct_count: distinctCount,
      allowed_values: allowedValues,
      sample_values: sampleValues,
    };

    stats.metadata = metadata;
    metadataList.push(metadata);
    return metadata;
  };

  tagKeys.forEach((tagKey) => {
    const keyName = tagKey?.key_name || tagKey?.key || tagKey?.name;
    if (!keyName) {
      return;
    }
    createMetadataFromStats(keyName, tagKey);
  });

  statsByKey.forEach((stats, key) => {
    if (!stats.metadata) {
      createMetadataFromStats(key, null);
    }
  });

  metadataList.sort((a, b) => {
    const usageDiff = (b.usage_count ?? 0) - (a.usage_count ?? 0);
    if (usageDiff !== 0) {
      return usageDiff;
    }
    return a.key.localeCompare(b.key);
  });

  return {
    metadataList,
    statsByKey,
  };
};

const aggregateInventory = (db) => {
  const now = Date.now();
  if (resourceCache.expiresAt > now && resourceCache.generatedAt) {
    return resourceCache;
  }

  const generatedAt = new Date(now).toISOString();
  const baseResources = db.get('resources').value() || [];
  const resourceTags = db.get('resource_tags').value() || [];
  const groupRecords = db.get('resource_groups').value() || [];
  const events = db.get('events').value() || [];

  const tagMap = new Map();
  resourceTags.forEach((tag) => {
    const resourceId = tag.resource_id || tag.resourceId;
    if (!resourceId) {
      return;
    }
    const key = String(resourceId);
    const tagsForResource = tagMap.get(key) || [];
    tagsForResource.push({
      key: tag.tag_key || tag.key,
      value: tag.tag_value || tag.value,
      source: tag.source || 'cmdb',
    });
    tagMap.set(key, tagsForResource);
  });

  const groupMembership = new Map();
  const groupTeamMap = new Map();
  groupRecords.forEach((group) => {
    const memberIds = Array.isArray(group.resource_ids) ? group.resource_ids : [];
    memberIds.forEach((memberId) => {
      const key = String(memberId);
      const memberships = groupMembership.get(key) || [];
      memberships.push(group.id);
      groupMembership.set(key, memberships);
      if (group.owner_team_id && !groupTeamMap.has(key)) {
        groupTeamMap.set(key, group.owner_team_id);
      }
    });
  });

  const eventMap = new Map();
  events.forEach((event) => {
    const resourceId = event.resource_id || event.resource?.id;
    if (!resourceId) {
      return;
    }
    const key = String(resourceId);
    const list = eventMap.get(key) || [];
    list.push(event);
    eventMap.set(key, list);
  });

  const resources = baseResources.map((resourceRaw) => {
    const id = String(
      resourceRaw.id
      ?? resourceRaw.resource_id
      ?? resourceRaw.key
      ?? resourceRaw.name
      ?? `resource_${Date.now()}`
    );

    const generator = createSeededGenerator(id);
    const rawTags = Array.isArray(resourceRaw.tags) ? resourceRaw.tags : [];
    const composedTags = [];
    const tagSet = new Set();

    const pushTag = (tag) => {
      if (!tag) {
        return;
      }
      const key = typeof tag.key === 'string' ? tag.key : typeof tag.name === 'string' ? tag.name : null;
      const value = typeof tag.value === 'string' ? tag.value : typeof tag.label === 'string' ? tag.label : null;
      if (!key) {
        return;
      }
      const normalizedKey = key.trim();
      const normalizedValue = value?.trim() ?? normalizedKey;
      const composite = `${normalizedKey}:${normalizedValue}`;
      if (tagSet.has(composite)) {
        return;
      }
      tagSet.add(composite);
      composedTags.push({ key: normalizedKey, value: normalizedValue, source: tag.source || 'cmdb' });
    };

    rawTags.forEach((tag) => pushTag(tag));
    (tagMap.get(id) || []).forEach((tag) => pushTag(tag));

    const groupIds = groupMembership.get(id) || [];

    const cpuUsage = pickNumber(resourceRaw.cpu_usage, resourceRaw.cpuUsage, resourceRaw.metrics?.cpu_usage, resourceRaw.metrics?.cpuUsage)
      ?? clamp(Math.round(generator() * 70 + 20), 0, 100);
    const memoryUsage = pickNumber(resourceRaw.memory_usage, resourceRaw.memoryUsage, resourceRaw.metrics?.memory_usage, resourceRaw.metrics?.memoryUsage)
      ?? clamp(Math.round(generator() * 60 + 30), 0, 100);
    const diskUsage = pickNumber(resourceRaw.disk_usage, resourceRaw.diskUsage, resourceRaw.metrics?.disk_usage, resourceRaw.metrics?.diskUsage)
      ?? clamp(Math.round(generator() * 50 + 25), 0, 100);
    const networkIn = pickNumber(resourceRaw.network_in, resourceRaw.networkIn, resourceRaw.metrics?.network_in, resourceRaw.metrics?.networkIn)
      ?? Math.round(generator() * 400 + 50);
    const networkOut = pickNumber(resourceRaw.network_out, resourceRaw.networkOut, resourceRaw.metrics?.network_out, resourceRaw.metrics?.networkOut)
      ?? Math.round(generator() * 400 + 50);
    const latencyMs = pickNumber(resourceRaw.latency_ms, resourceRaw.latencyMs, resourceRaw.metrics?.latency_ms, resourceRaw.metrics?.latencyMs)
      ?? Math.round(generator() * 120 + 20);

    const metrics = {
      cpuUsage,
      memoryUsage,
      diskUsage,
      networkIn,
      networkOut,
      latencyMs,
      cpu_usage: cpuUsage,
      memory_usage: memoryUsage,
      disk_usage: diskUsage,
      network_in: networkIn,
      network_out: networkOut,
      latency_ms: latencyMs,
    };

    const metricsHistory = generateMetricHistory(id, cpuUsage, memoryUsage);

    const relatedEvents = eventMap.get(id) || [];
    const activeEvents = relatedEvents.filter((event) => {
      const status = (event.status || '').toUpperCase();
      return !['RESOLVED', 'CLOSED', 'OK'].includes(status);
    });

    let status = normalizeStatus(resourceRaw.status || resourceRaw.health_status || resourceRaw.state);
    const hasCriticalEvent = activeEvents.some((event) => (event.severity || '').toUpperCase() === 'CRITICAL');
    const hasWarningEvent = activeEvents.some((event) => (event.severity || '').toUpperCase() === 'WARNING');

    if (hasCriticalEvent) {
      status = 'CRITICAL';
    } else if (status !== 'CRITICAL' && hasWarningEvent) {
      status = 'WARNING';
    } else if (status === 'HEALTHY' && cpuUsage >= 85) {
      status = 'WARNING';
    }

    const healthInsights = computeHealthInsights({ metrics }, activeEvents, metricsHistory);

    const grafanaUrl = resourceRaw.grafana_url
      ?? resourceRaw.dashboard_url
      ?? `https://grafana.example.com/d/${id}`;
    const logsUrl = resourceRaw.logs_url
      ?? `https://logs.example.com/explore?resource=${id}`;
    const runbookUrl = resourceRaw.runbook_url
      ?? `https://runbook.example.com/${id}`;

    const observability = {
      grafana_url: grafanaUrl,
      logs_url: logsUrl,
      runbook_url: runbookUrl,
    };

    let teamId = resourceRaw.team_id || resourceRaw.teamId || null;
    if (!teamId && groupTeamMap.has(id)) {
      teamId = groupTeamMap.get(id);
    }

    const environmentTag = composedTags.find((tag) => tag.key && tag.key.toLowerCase() === 'environment');
    const providerTag = composedTags.find((tag) => tag.key && tag.key.toLowerCase() === 'provider');

    const environment = resourceRaw.environment || (environmentTag ? environmentTag.value : null);
    const provider = resourceRaw.provider || resourceRaw.cloud_provider || (providerTag ? providerTag.value : null);

    const lastCheckedAt = resourceRaw.last_checked_at || resourceRaw.updated_at || resourceRaw.lastCheckedAt || resourceRaw.updatedAt || generatedAt;

    const actions = buildResourceActions({
      id,
      type: resourceRaw.type,
      tags: composedTags,
      observability,
    });

    const resource = {
      id,
      name: resourceRaw.name || id,
      type: resourceRaw.type || resourceRaw.resource_type || 'unspecified',
      status,
      ip_address: resourceRaw.ip_address || resourceRaw.ipAddress || null,
      ipAddress: resourceRaw.ip_address || resourceRaw.ipAddress || null,
      team_id: teamId,
      teamId,
      provider,
      environment,
      location: resourceRaw.location || resourceRaw.region || null,
      tags: composedTags,
      groups: groupIds,
      metrics,
      metrics_history: metricsHistory,
      related_incidents: activeEvents.length,
      related_events: activeEvents.slice(0, 3).map((event) => ({
        id: event.id,
        summary: event.summary || event.description || event.id,
        severity: event.severity,
        status: event.status,
        updated_at: event.updated_at || event.updatedAt || event.starts_at || null,
      })),
      actions,
      last_checked_at: lastCheckedAt,
      created_at: resourceRaw.created_at || resourceRaw.createdAt || null,
      updated_at: resourceRaw.updated_at || resourceRaw.updatedAt || null,
      health_summary: healthInsights.summary,
      health_reasons: healthInsights.reasons,
      observability,
      __searchText: [
        id,
        resourceRaw.name,
        resourceRaw.type,
        teamId,
        provider,
        environment,
        resourceRaw.ip_address,
        resourceRaw.location,
        ...groupIds,
        ...composedTags.map((tag) => `${tag.key}:${tag.value}`),
        healthInsights.summary,
      ].filter(Boolean).join(' ').toLowerCase(),
      __tagTokens: composedTags.map((tag) => `${tag.key}:${tag.value}`.toLowerCase()),
      __statusPriority: statusPriority[status] ?? statusPriority.UNKNOWN,
    };

    return resource;
  });

  resources.sort((a, b) => {
    const diff = (a.__statusPriority ?? 99) - (b.__statusPriority ?? 99);
    if (diff !== 0) {
      return diff;
    }
    return String(a.name || '').localeCompare(String(b.name || ''));
  });

  const groups = aggregateResourceGroups(groupRecords, resources, generatedAt);
  const stats = computeResourceStatistics(resources, groups, generatedAt);

  tickBackgroundJobs(db, { resources, groups, stats, generatedAt });

  resourceCache.items = resources;
  resourceCache.groups = groups;
  resourceCache.stats = stats;
  resourceCache.generatedAt = generatedAt;
  resourceCache.expiresAt = now + RESOURCE_CACHE_TTL_MS;

  return resourceCache;
};

const filterResourcesByQuery = (resources, query) => {
  const statusFilter = typeof query.status === 'string' ? query.status.trim().toUpperCase() : '';
  const search = typeof query.search === 'string' ? query.search.trim().toLowerCase() : '';
  const teamId = typeof query.team_id === 'string' ? query.team_id.trim() : '';
  const groupId = typeof query.group_id === 'string' ? query.group_id.trim() : '';
  const environment = typeof query.environment === 'string' ? query.environment.trim().toLowerCase() : '';
  const tagsInput = query.tags;

  const tagFilters = [];
  if (Array.isArray(tagsInput)) {
    tagsInput.forEach((item) => {
      if (typeof item === 'string' && item.trim()) {
        tagFilters.push(item.toLowerCase());
      }
    });
  } else if (typeof tagsInput === 'string' && tagsInput.trim()) {
    tagFilters.push(tagsInput.toLowerCase());
  }

  return resources.filter((resource) => {
    if (statusFilter && statusFilter !== 'ALL' && resource.status !== statusFilter) {
      return false;
    }

    if (teamId && resource.team_id !== teamId) {
      return false;
    }

    if (groupId && !(resource.groups || []).includes(groupId)) {
      return false;
    }

    if (environment && String(resource.environment || '').toLowerCase() !== environment) {
      return false;
    }

    if (search) {
      const haystack = resource.__searchText || '';
      if (!haystack.includes(search)) {
        return false;
      }
    }

    if (tagFilters.length > 0) {
      const candidateTags = resource.__tagTokens || [];
      const matchesAll = tagFilters.every((filterTag) =>
        candidateTags.some((candidate) => candidate.includes(filterTag))
      );
      if (!matchesAll) {
        return false;
      }
    }

    return true;
  });
};

const buildTopologyGraph = (resources, groups) => {
  const nodes = resources.map((resource) => ({
    id: resource.id,
    name: resource.name,
    type: String(resource.type || 'unspecified').toLowerCase(),
    status: resource.status,
    groupIds: resource.groups || [],
    metric: resource.metrics,
    importance: resource.related_incidents || 0,
    region: resource.location || null,
  }));

  const nodeMap = new Map(nodes.map((node) => [node.id, node]));
  const edges = [];
  const seenEdges = new Set();

  const pushEdge = (source, target, relation) => {
    if (source === target || !nodeMap.has(source) || !nodeMap.has(target)) {
      return;
    }
    const key = `${source}|${target}|${relation}`;
    if (seenEdges.has(key)) {
      return;
    }
    seenEdges.add(key);

    const sourceNode = nodeMap.get(source);
    const targetNode = nodeMap.get(target);
    const statusOrder = (statusPriority[sourceNode.status] ?? 99) >= (statusPriority[targetNode.status] ?? 99)
      ? targetNode.status
      : sourceNode.status;

    edges.push({
      id: key,
      source,
      target,
      relation,
      status: statusOrder,
      bandwidthMbps: Math.round(((sourceNode.metric?.networkOut ?? 50) + (targetNode.metric?.networkIn ?? 50)) / 2),
      latencyMs: Math.max(sourceNode.metric?.latencyMs ?? 0, targetNode.metric?.latencyMs ?? 0) || undefined,
    });
  };

  groups.forEach((group) => {
    const memberIds = Array.isArray(group.member_ids) ? group.member_ids : [];
    if (memberIds.length < 2) {
      return;
    }
    const [anchor, ...rest] = memberIds;
    rest.forEach((member) => pushEdge(anchor, member, `group:${group.id}`));
  });

  const typeBuckets = new Map();
  nodes.forEach((node) => {
    const bucket = typeBuckets.get(node.type) || [];
    bucket.push(node);
    typeBuckets.set(node.type, bucket);
  });

  const applications = [...(typeBuckets.get('service') || []), ...(typeBuckets.get('application') || [])];
  const databases = typeBuckets.get('database') || [];
  const caches = typeBuckets.get('cache') || [];
  const messageQueues = typeBuckets.get('queue') || [];

  applications.forEach((appNode) => {
    databases.forEach((dbNode) => pushEdge(appNode.id, dbNode.id, 'depends_on:database'));
    caches.forEach((cacheNode) => pushEdge(appNode.id, cacheNode.id, 'uses:cache'));
    messageQueues.forEach((queueNode) => pushEdge(appNode.id, queueNode.id, 'publishes:queue'));
  });

  return { nodes, edges };
};

const parseTagFilters = (query) => {
  const raw = query.tag_filters || query.tagFilters;
  if (!raw) {
    return [];
  }
  let filters = [];
  if (typeof raw === 'string') {
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        filters = parsed;
      }
    } catch (_error) {
      const parts = raw.split(',');
      filters = parts
        .map((part) => {
          const [key, operator = 'eq', valueSegment = ''] = part.split(':');
          if (!key) {
            return null;
          }
          const values = valueSegment
            .split('|')
            .map((value) => value.trim())
            .filter(Boolean);
          return {
            key: key.trim(),
            operator: operator.trim(),
            values,
          };
        })
        .filter(Boolean);
    }
  } else if (Array.isArray(raw)) {
    filters = raw;
  }

  return filters
    .map((filter) => {
      if (!filter || typeof filter !== 'object') {
        return null;
      }
      const key = typeof filter.key === 'string' ? filter.key.trim() : '';
      if (!key) {
        return null;
      }
      const operator = typeof filter.operator === 'string'
        ? filter.operator.trim().toLowerCase()
        : 'eq';
      const values = Array.isArray(filter.values)
        ? filter.values.map((value) => (typeof value === 'string' ? value.trim() : String(value))).filter(Boolean)
        : [];
      return {
        key,
        operator,
        values,
      };
    })
    .filter(Boolean);
};

const safeCreateRegex = (pattern) => {
  try {
    return new RegExp(pattern);
  } catch (_error) {
    return null;
  }
};

const extractTagValues = (resource, key) => {
  if (!resource || !Array.isArray(resource.tags)) {
    return [];
  }
  return resource.tags
    .filter((tag) => tag && tag.key === key)
    .map((tag) => tag.value)
    .filter((value) => typeof value === 'string' && value.length > 0);
};

const matchesTagFilter = (resource, filter) => {
  const values = extractTagValues(resource, filter.key);
  const operator = (filter.operator || 'eq').toLowerCase();
  const filterValues = Array.isArray(filter.values) ? filter.values : [];
  const primary = filterValues[0];

  switch (operator) {
    case 'eq':
      return primary ? values.includes(primary) : true;
    case 'neq':
      return primary ? !values.includes(primary) : true;
    case 'in':
      return filterValues.length ? filterValues.some((candidate) => values.includes(candidate)) : true;
    case 'not_in':
      return filterValues.length ? filterValues.every((candidate) => !values.includes(candidate)) : true;
    case 'regex': {
      if (!primary) {
        return true;
      }
      const regex = safeCreateRegex(primary);
      if (!regex) {
        return false;
      }
      return values.some((candidate) => regex.test(candidate));
    }
    case 'not_regex': {
      if (!primary) {
        return true;
      }
      const regex = safeCreateRegex(primary);
      if (!regex) {
        return true;
      }
      return values.every((candidate) => !regex.test(candidate));
    }
    default:
      return true;
  }
};

const applyTagFilters = (resources, filters = []) => {
  if (!Array.isArray(filters) || filters.length === 0) {
    return resources;
  }
  return resources.filter((resource) => filters.every((filter) => matchesTagFilter(resource, filter)));
};

// 登入接口
registerRoute('post', '/auth/login', (req, res) => {
  const { username, password } = req.body;

  // 簡單的認證邏輯
  if (username === 'admin' && password === 'password123') {
    res.jsonp({
      token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImFkbWluIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c',
      user: {
        id: 'user_1',
        username: 'admin',
        email: 'admin@sre-platform.com',
        full_name: '系統管理員',
        role: 'admin',
        team_id: 'team_1'
      }
    });
  } else {
    res.status(401).jsonp({
      code: 'INVALID_CREDENTIALS',
      message: '人員名或密碼錯誤'
    });
  }
});

// 登出接口
registerRoute('post', '/auth/logout', (req, res) => {
  res.jsonp({ message: '登出成功' });
});

// 儀表板統計數據接口
registerRoute('get', '/dashboard/stats', (req, res) => {
  const db = router.db;
  const stats = db.get('dashboard_stats').value();
  res.jsonp(stats);
});

// 儀表板統計數據接口（複數形式）
registerRoute('get', '/dashboards/stats', (req, res) => {
  const db = router.db;
  const stats = db.get('dashboard_stats').value();
  res.jsonp(stats);
});

registerRoute('get', '/dashboards', (req, res) => {
  const db = router.db;
  const page = parsePageParam(req.query.page, 1);
  const pageSize = parsePageParam(req.query.page_size, 20);
  const category = req.query.category ? String(req.query.category).toLowerCase() : '';
  const search = (req.query.search || '').toLowerCase();

  let dashboards = db.get('dashboards').value() || [];

  if (category) {
    dashboards = dashboards.filter((item) => String(item.category || '').toLowerCase() === category);
  }

  if (search) {
    dashboards = dashboards.filter((item) => {
      const name = String(item.name || '').toLowerCase();
      const description = String(item.description || '').toLowerCase();
      return name.includes(search) || description.includes(search);
    });
  }

  res.jsonp(withPagination(dashboards, page, pageSize));
});

registerRoute('post', '/dashboards', (req, res) => {
  const db = router.db;
  const payload = req.body || {};
  const now = new Date().toISOString();
  const id = payload.id || `dash_${Date.now()}`;

  const record = {
    id,
    name: payload.name || '未命名儀表板',
    description: payload.description || '',
    category: payload.category || 'custom',
    owner: payload.owner || null,
    is_default: Boolean(payload.is_default),
    is_featured: Boolean(payload.is_featured),
    viewers_count: payload.viewers_count || 0,
    favorites_count: payload.favorites_count || 0,
    panel_count: payload.panel_count || 0,
    data_sources: payload.data_sources || [],
    thumbnail_url: payload.thumbnail_url || null,
    target_page_key: payload.target_page_key || null,
    created_at: now,
    updated_at: now,
    deleted_at: null
  };

  db.get('dashboards').push(record).write();
  res.status(201).jsonp(record);
});

registerRoute('get', '/dashboards/:dashboardId', (req, res) => {
  const record = router.db.get('dashboards').find({ id: req.params.dashboardId }).value();
  if (!record) {
    return res.status(404).jsonp({ code: 'DASHBOARD_NOT_FOUND', message: '儀表板不存在' });
  }
  res.jsonp(record);
});

registerRoute('put', '/dashboards/:dashboardId', (req, res) => {
  const db = router.db;
  const query = db.get('dashboards').find({ id: req.params.dashboardId });
  if (!query.value()) {
    return res.status(404).jsonp({ code: 'DASHBOARD_NOT_FOUND', message: '儀表板不存在' });
  }

  const now = new Date().toISOString();
  query.assign({ ...req.body, id: req.params.dashboardId, updated_at: now }).write();
  res.jsonp(query.value());
});

registerRoute('delete', '/dashboards/:dashboardId', (req, res) => {
  const db = router.db;
  const removed = db.get('dashboards').remove({ id: req.params.dashboardId }).write();
  if (!removed || removed.length === 0) {
    return res.status(404).jsonp({ code: 'DASHBOARD_NOT_FOUND', message: '儀表板不存在' });
  }
  res.status(204).end();
});

registerRoute('get', '/dashboards/stats', (req, res) => {
  const stats = router.db.get('dashboard_stats').value();
  res.jsonp(stats || {});
});

registerRoute('get', '/infrastructure/stats', (req, res) => {
  const stats = router.db.get('infrastructure_stats').value();
  if (!stats) {
    return res.status(404).jsonp({ code: 'INFRA_STATS_NOT_FOUND', message: '尚無基礎設施統計資料' });
  }
  res.jsonp(stats);
});

registerRoute('get', '/infrastructure/resource-usage', (req, res) => {
  const db = router.db;
  const page = parsePageParam(req.query.page, 1);
  const pageSize = parsePageParam(req.query.page_size, 20);
  const usage = db.get('infrastructure_resource_usage').value() || [];
  res.jsonp(withPagination(usage, page, pageSize));
});

registerRoute('get', '/ai/risk-predictions', (req, res) => {
  const predictions = router.db.get('ai_risk_predictions').value() || [];
  res.jsonp({ predictions });
});

registerRoute('get', '/notification-channels', (req, res) => {
  const inventory = aggregateInventory(router.db);
  const channelsCollection = ensureArrayCollection(router.db, 'notification_channels');
  const healthCollection = ensureArrayCollection(router.db, 'channel_health_checks').value();

  const search = typeof req.query.search === 'string' ? req.query.search.trim().toLowerCase() : '';
  const typeFilter = typeof req.query.type === 'string' ? req.query.type.trim().toLowerCase() : '';
  const enabledFilterRaw = req.query.enabled;
  const enabledFilter = typeof enabledFilterRaw === 'string'
    ? enabledFilterRaw.toLowerCase()
    : typeof enabledFilterRaw === 'boolean'
      ? enabledFilterRaw
      : null;

  const channels = channelsCollection.value() || [];
  const filtered = channels.filter((channel) => {
    if (typeFilter && String(channel.type || '').toLowerCase() !== typeFilter) {
      return false;
    }
    if (enabledFilter !== null) {
      const isEnabled = channel.enabled !== false;
      const expected = typeof enabledFilter === 'boolean'
        ? enabledFilter
        : enabledFilter === 'true';
      if (isEnabled !== expected) {
        return false;
      }
    }
    if (search) {
      const haystack = [channel.name, channel.type, channel.description, channel.endpoint]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      if (!haystack.includes(search)) {
        return false;
      }
    }
    return true;
  });

  const items = filtered.map((channel) => serializeChannel(channel, router.db, { healthCollection }));

  res.jsonp({
    items,
    meta: {
      total: items.length,
      generated_at: inventory.generatedAt,
    },
  });
});

registerRoute('get', '/notification-channels/:channelId', (req, res) => {
  const collection = ensureArrayCollection(router.db, 'notification_channels');
  const channel = collection.find({ id: req.params.channelId }).value();
  if (!channel) {
    return res.status(404).jsonp({ code: 'CHANNEL_NOT_FOUND', message: '通知管道不存在' });
  }
  res.jsonp(serializeChannel(channel, router.db));
});

registerRoute('post', '/notification-channels', (req, res) => {
  const collection = ensureArrayCollection(router.db, 'notification_channels');
  const payload = req.body || {};
  const now = new Date().toISOString();
  const id = typeof payload.id === 'string' && payload.id.trim()
    ? payload.id.trim()
    : `channel_${Date.now()}`;

  const channel = {
    id,
    name: typeof payload.name === 'string' && payload.name.trim() ? payload.name.trim() : '未命名通知管道',
    type: typeof payload.type === 'string' ? payload.type.trim().toLowerCase() : 'email',
    description: typeof payload.description === 'string' ? payload.description : null,
    endpoint: typeof payload.endpoint === 'string' ? payload.endpoint : payload.webhook_url ?? null,
    default_recipients: Array.isArray(payload.default_recipients)
      ? payload.default_recipients.map((recipient) => String(recipient))
      : [],
    metadata: typeof payload.metadata === 'object' && payload.metadata !== null ? payload.metadata : {},
    enabled: payload.enabled !== false,
    created_at: now,
    updated_at: now,
  };

  collection.push(channel).write();
  recordChannelHealth(router.db, {
    id: channel.id,
    status: 'healthy',
    latencyMs: 120,
    attempts: 1,
    message: '建立後尚未檢查',
    checkedAt: now,
  }, { source: 'bootstrap' });

  res.status(201).jsonp(serializeChannel(channel, router.db));
});

registerRoute('put', '/notification-channels/:channelId', (req, res) => {
  const collection = ensureArrayCollection(router.db, 'notification_channels');
  const query = collection.find({ id: req.params.channelId });
  const existing = query.value();
  if (!existing) {
    return res.status(404).jsonp({ code: 'CHANNEL_NOT_FOUND', message: '通知管道不存在' });
  }

  const payload = req.body || {};
  const updates = {};
  if (typeof payload.name === 'string' && payload.name.trim()) updates.name = payload.name.trim();
  if (typeof payload.type === 'string' && payload.type.trim()) updates.type = payload.type.trim().toLowerCase();
  if (typeof payload.description === 'string') updates.description = payload.description;
  if (payload.endpoint !== undefined) {
    updates.endpoint = payload.endpoint === null ? null : String(payload.endpoint);
  }
  if (Array.isArray(payload.default_recipients)) {
    updates.default_recipients = payload.default_recipients.map((recipient) => String(recipient));
  }
  if (typeof payload.metadata === 'object' && payload.metadata !== null) {
    updates.metadata = payload.metadata;
  }
  if (typeof payload.enabled === 'boolean') {
    updates.enabled = payload.enabled;
  }
  updates.updated_at = new Date().toISOString();

  query.assign({ ...existing, ...updates }).write();
  const updated = query.value();
  res.jsonp(serializeChannel(updated, router.db));
});

registerRoute('delete', '/notification-channels/:channelId', (req, res) => {
  const collection = ensureArrayCollection(router.db, 'notification_channels');
  const target = collection.find({ id: req.params.channelId }).value();
  if (!target) {
    return res.status(404).jsonp({ code: 'CHANNEL_NOT_FOUND', message: '通知管道不存在' });
  }
  collection.remove({ id: req.params.channelId }).write();
  channelHealthState.delete(req.params.channelId);
  res.status(204).end();
});

registerRoute('post', '/notification-channels/:channelId/test', (req, res) => {
  const collection = ensureArrayCollection(router.db, 'notification_channels');
  const channel = collection.find({ id: req.params.channelId }).value();
  if (!channel) {
    return res.status(404).jsonp({ code: 'CHANNEL_NOT_FOUND', message: '通知管道不存在' });
  }

  const generator = createSeededGenerator(`${channel.id}:manual_test:${Date.now()}`);
  const latency = Math.round(100 + generator() * 200);
  const statusRoll = generator();
  let status = 'healthy';
  let message = '測試通知發送成功';
  if (statusRoll > 0.88) {
    status = 'critical';
    message = '測試失敗：模擬超時';
  } else if (statusRoll > 0.7) {
    status = 'warning';
    message = '測試回應延遲偏高';
  }

  const entry = recordChannelHealth(router.db, {
    id: channel.id,
    status,
    latencyMs: latency,
    attempts: Math.round(1 + generator() * 2),
    message,
    checkedAt: new Date().toISOString(),
  }, { source: 'manual_test' });

  res.jsonp({
    message,
    result: entry,
    channel: serializeChannel(channel, router.db),
  });
});

registerRoute('get', '/notification-channels/:channelId/health-checks', (req, res) => {
  const collection = ensureArrayCollection(router.db, 'notification_channels');
  const channel = collection.find({ id: req.params.channelId }).value();
  if (!channel) {
    return res.status(404).jsonp({ code: 'CHANNEL_NOT_FOUND', message: '通知管道不存在' });
  }

  const history = getChannelHealthHistory(router.db, channel.id) || [];
  res.jsonp({
    channel_id: channel.id,
    items: history,
  });
});

registerRoute('get', '/tags', (req, res) => {
  const search = typeof req.query.search === 'string' ? req.query.search.trim().toLowerCase() : '';
  const inventory = aggregateInventory(router.db);
  const { metadataList } = buildTagContext(router.db, inventory);

  const filtered = search
    ? metadataList.filter((item) => {
      const haystack = [item.key, item.description, item.category]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return haystack.includes(search);
    })
    : metadataList;

  res.jsonp({
    tags: filtered,
    total: filtered.length,
    generated_at: inventory.generatedAt,
  });
});

registerRoute('get', '/tags/:tagKey/values', (req, res) => {
  const tagKeyParam = req.params.tagKey;
  const inventory = aggregateInventory(router.db);
  const { metadataList, statsByKey } = buildTagContext(router.db, inventory);
  const normalizedKey = decodeURIComponent(tagKeyParam);
  const metadata = metadataList.find((item) => item.key === normalizedKey);
  const stats = statsByKey.get(normalizedKey);

  if (!metadata && !stats) {
    return res.status(404).jsonp({ code: 'TAG_NOT_FOUND', message: '指定的標籤鍵不存在' });
  }

  const search = typeof req.query.q === 'string' ? req.query.q.trim().toLowerCase() : '';
  const limit = parsePageParam(req.query.limit, 50);

  const collectFromStats = () => {
    if (!stats) {
      return [];
    }
    return Array.from(stats.counts.values()).map((entry) => ({
      value: entry.value,
      label: entry.value,
      color: null,
      usage_count: entry.count ?? 0,
    }));
  };

  let candidates = metadata?.allowed_values && metadata.allowed_values.length > 0
    ? metadata.allowed_values.map((entry) => ({
      value: entry.value,
      label: entry.label || entry.value,
      color: entry.color || null,
      usage_count: entry.usage_count ?? stats?.counts.get(entry.value)?.count ?? 0,
    }))
    : collectFromStats();

  if (search) {
    candidates = candidates.filter((item) => item.value.toLowerCase().includes(search));
  }

  candidates.sort((a, b) => {
    const diff = (b.usage_count ?? 0) - (a.usage_count ?? 0);
    return diff !== 0 ? diff : a.value.localeCompare(b.value);
  });

  const limited = candidates.slice(0, limit);

  res.jsonp({
    key: normalizedKey,
    mode: metadata?.value_mode ?? (metadata?.allowed_values?.length ? 'ENUM' : candidates.length <= 40 ? 'DYNAMIC' : 'FREEFORM'),
    total: candidates.length,
    items: limited,
    generated_at: inventory.generatedAt,
  });
});

registerRoute('get', '/background-jobs', (req, res) => {
  const inventory = aggregateInventory(router.db);
  tickBackgroundJobs(router.db, {
    resources: inventory.items,
    groups: inventory.groups,
    stats: inventory.stats,
    generatedAt: inventory.generatedAt,
  });
  res.jsonp({ jobs: listBackgroundJobs() });
});

registerRoute('get', '/background-jobs/:jobId', (req, res) => {
  const jobId = req.params.jobId;
  try {
    const inventory = aggregateInventory(router.db);
    tickBackgroundJobs(router.db, {
      resources: inventory.items,
      groups: inventory.groups,
      stats: inventory.stats,
      generatedAt: inventory.generatedAt,
    });
    const state = ensureJobState(jobId);
    res.jsonp(serializeJobState(state, { includeHistory: true }));
  } catch (error) {
    res.status(404).jsonp({ code: 'JOB_NOT_FOUND', message: error instanceof Error ? error.message : '背景作業不存在' });
  }
});

registerRoute('post', '/background-jobs/:jobId/run', (req, res) => {
  const jobId = req.params.jobId;
  try {
    const inventory = aggregateInventory(router.db);
    const { state } = runBackgroundJob(jobId, {
      db: router.db,
      context: {
        resources: inventory.items,
        groups: inventory.groups,
        stats: inventory.stats,
        generatedAt: inventory.generatedAt,
      },
      automatic: false,
    });
    res.jsonp({
      job: serializeJobState(state, { includeHistory: true }),
      triggered_at: new Date().toISOString(),
    });
  } catch (error) {
    res.status(404).jsonp({ code: 'JOB_NOT_FOUND', message: error instanceof Error ? error.message : '背景作業不存在' });
  }
});

registerRoute('get', '/background-jobs/:jobId/history', (req, res) => {
  const jobId = req.params.jobId;
  try {
    const state = ensureJobState(jobId);
    res.jsonp({ job_id: jobId, items: state.history });
  } catch (error) {
    res.status(404).jsonp({ code: 'JOB_NOT_FOUND', message: error instanceof Error ? error.message : '背景作業不存在' });
  }
});

// 動態 CMDB 資源列表聚合端點
registerRoute('get', '/resources', (req, res) => {
  const refreshRequested = String(req.query.refresh ?? '').toLowerCase() === 'true';
  if (refreshRequested) {
    invalidateResourceCache();
  }

  const inventory = aggregateInventory(router.db);
  const page = parsePageParam(req.query.page, 1);
  const pageSize = parsePageParam(req.query.page_size, 20);

  const tagFilters = parseTagFilters(req.query);
  const filteredResources = applyTagFilters(filterResourcesByQuery(inventory.items, req.query), tagFilters);
  const { items, pagination } = withPagination(filteredResources, page, pageSize);
  const sanitizedItems = items.map(stripInternalFields);

  res.jsonp({
    items: sanitizedItems,
    pagination,
    meta: {
      total_filtered: filteredResources.length,
      generated_at: inventory.generatedAt,
      cached_until: new Date(inventory.expiresAt).toISOString(),
      filters: {
        search: req.query.search ?? null,
        status: req.query.status ?? null,
        team_id: req.query.team_id ?? null,
        group_id: req.query.group_id ?? null,
        environment: req.query.environment ?? null,
        tags: Array.isArray(req.query.tags)
          ? req.query.tags
          : req.query.tags
            ? [req.query.tags]
            : [],
        tag_filters: tagFilters,
      },
      refreshed: refreshRequested,
    },
  });
});

registerRoute('get', '/resources/statistics', (req, res) => {
  const refreshRequested = String(req.query.refresh ?? '').toLowerCase() === 'true';
  if (refreshRequested) {
    invalidateResourceCache();
  }

  const inventory = aggregateInventory(router.db);
  const stats = inventory.stats || {};

  res.jsonp({
    ...stats,
    groups: inventory.groups.length,
    generatedAt: inventory.generatedAt,
    cachedUntil: new Date(inventory.expiresAt).toISOString(),
    refreshed: refreshRequested,
  });
});

const registerResourceGroupRoute = (path) => {
  registerRoute('get', path, (req, res) => {
    const inventory = aggregateInventory(router.db);
    const page = parsePageParam(req.query.page, 1);
    const pageSize = parsePageParam(req.query.page_size, 20);
    const search = typeof req.query.search === 'string' ? req.query.search.trim().toLowerCase() : '';

    const filteredGroups = search
      ? inventory.groups.filter((group) => (group.__searchText || '').includes(search))
      : inventory.groups;

    const { items, pagination } = withPagination(filteredGroups, page, pageSize);
    const sanitizedItems = items.map(stripInternalFields);

    res.jsonp({
      items: sanitizedItems,
      pagination,
      meta: {
        total_filtered: filteredGroups.length,
        generated_at: inventory.generatedAt,
        cached_until: new Date(inventory.expiresAt).toISOString(),
        search,
      },
    });
  });
};

registerResourceGroupRoute('/resource-groups');
registerResourceGroupRoute('/resource_groups');

registerRoute('get', '/resources/:resourceId', (req, res) => {
  const inventory = aggregateInventory(router.db);
  const resource = inventory.items.find((item) => item.id === req.params.resourceId);
  if (!resource) {
    return res.status(404).jsonp({ code: 'RESOURCE_NOT_FOUND', message: '找不到指定資源' });
  }
  res.jsonp(stripInternalFields(resource));
});

registerRoute('get', '/resources/:resourceId/metrics', (req, res) => {
  const inventory = aggregateInventory(router.db);
  const resource = inventory.items.find((item) => item.id === req.params.resourceId);
  if (!resource) {
    return res.status(404).jsonp({ code: 'RESOURCE_NOT_FOUND', message: '找不到指定資源' });
  }

  const rangeMinutes = parsePageParam(req.query.range_minutes ?? req.query.range ?? 60, 60);
  const points = parsePageParam(req.query.points ?? 12, 12);
  const history = generateMetricHistory(
    `${resource.id}:${rangeMinutes}:${points}`,
    pickNumber(resource.metrics?.cpuUsage, resource.metrics?.cpu_usage) ?? 55,
    pickNumber(resource.metrics?.memoryUsage, resource.metrics?.memory_usage) ?? 60,
    points,
    rangeMinutes,
  );

  res.jsonp({
    resource_id: resource.id,
    range_minutes: rangeMinutes,
    timestamps: history.timestamps,
    cpu_usage: history.cpu_usage,
    memory_usage: history.memory_usage,
    generated_at: inventory.generatedAt,
    cached_until: new Date(inventory.expiresAt).toISOString(),
  });
});

registerRoute('get', '/topology', (req, res) => {
  const inventory = aggregateInventory(router.db);
  const groupId = typeof req.query.group_id === 'string' ? req.query.group_id : null;
  const layout = typeof req.query.layout === 'string' ? req.query.layout : 'force';

  let resources = inventory.items;
  let groups = inventory.groups;

  if (groupId) {
    groups = inventory.groups.filter((group) => group.id === groupId);
    const memberSet = new Set(groups.flatMap((group) => group.member_ids || []));
    resources = resources.filter((resource) => memberSet.has(resource.id));
  }

  const graph = buildTopologyGraph(resources, groups.map(stripInternalFields));

  res.jsonp({
    nodes: graph.nodes,
    edges: graph.edges,
    layout,
    updatedAt: inventory.generatedAt,
    meta: {
      resource_count: resources.length,
      group_count: groups.length,
      generated_at: inventory.generatedAt,
      cached_until: new Date(inventory.expiresAt).toISOString(),
    },
  });
});

// 事件列表接口 - 支持分頁和多維度篩選
registerRoute('get', '/events', (req, res) => {
  const db = router.db;
  const page = parsePageParam(req.query.page, 1);
  const pageSize = parsePageParam(req.query.page_size, 20);
  const { status, severity, resource_name, source, sort_by, sort_order } = req.query;

  let events = db.get('events').value();

  // 狀態過濾
  if (status) {
    events = events.filter(event => event.status.toLowerCase() === status.toLowerCase());
  }

  // 嚴重性過濾
  if (severity) {
    events = events.filter(event => event.severity.toLowerCase() === severity.toLowerCase());
  }

  // 資源名稱過濾
  if (resource_name) {
    const keyword = resource_name.toLowerCase();
    events = events.filter(event => {
      const resourceName = event.resource && event.resource.name ? event.resource.name.toLowerCase() : '';
      return resourceName.includes(keyword);
    });
  }

  // 來源過濾
  if (source) {
    events = events.filter(event => event.source.toLowerCase() === source.toLowerCase());
  }

  // 排序
  if (sort_by) {
    const order = sort_order === 'desc' ? -1 : 1;
    events.sort((a, b) => {
      const fieldA = a[sort_by];
      const fieldB = b[sort_by];
      if (fieldA < fieldB) return -1 * order;
      if (fieldA > fieldB) return 1 * order;
      return 0;
    });
  }

  res.jsonp(withPagination(events, page, pageSize));
});

// 事件詳情
registerRoute('get', '/events/:eventId', (req, res) => {
  const event = router.db.get('events').find({ id: req.params.eventId }).value();
  if (!event) {
    return res.status(404).jsonp({ code: 'EVENT_NOT_FOUND', message: '找不到指定事件' });
  }
  res.jsonp(event);
});

// 為事件新增註記
registerRoute('post', '/events/:eventId/comments', (req, res) => {
  const db = router.db;
  const content = (req.body && req.body.content) || '';

  if (!content.trim()) {
    return res.status(400).jsonp({ code: 'INVALID_PAYLOAD', message: 'content 為必填欄位' });
  }

  const eventQuery = db.get('events').find({ id: req.params.eventId });
  const event = eventQuery.value();

  if (!event) {
    return res.status(404).jsonp({ code: 'EVENT_NOT_FOUND', message: '找不到指定事件' });
  }

  const now = new Date().toISOString();
  const actorId = req.body.actor_id || 'user_ops_lead';
  const actorName = req.body.actor_name || 'SRE Engineer';

  const historyEntry = {
    id: `hist_${Date.now()}`,
    type: 'USER_COMMENT',
    actor: {
      type: 'user',
      id: actorId,
      name: actorName
    },
    content,
    metadata: {},
    created_at: now
  };

  const updatedHistory = Array.isArray(event.history_logs) ? [...event.history_logs, historyEntry] : [historyEntry];

  eventQuery.assign({
    history_logs: updatedHistory,
    updated_at: now
  }).write();

  db.get('event_histories').push({
    id: historyEntry.id,
    event_id: req.params.eventId,
    type: 'USER_COMMENT',
    actor: `user:${actorId}`,
    content,
    metadata: {},
    created_at: now
  }).write();

  res.status(201).jsonp(historyEntry);
});

// 合併事件建立事故
registerRoute('post', '/incidents', (req, res) => {
  const db = router.db;
  const { title, severity, assignee_id, event_ids = [] } = req.body || {};

  if (!title || !severity) {
    return res.status(400).jsonp({ code: 'INVALID_PAYLOAD', message: 'title 與 severity 為必填欄位' });
  }

  const id = `inc_${Date.now()}`;
  const now = new Date().toISOString();

  const incident = {
    id,
    title,
    status: 'investigating',
    severity: severity.toLowerCase(),
    assignee_id: assignee_id || null,
    created_at: now,
    updated_at: now
  };

  db.get('incidents').push(incident).write();

  if (Array.isArray(event_ids) && event_ids.length > 0) {
    event_ids.forEach(eventId => {
      db.get('events').find({ id: eventId }).assign({ incident_id: id, status: 'MERGED', updated_at: now }).write();
    });
  }

  res.status(201).jsonp(incident);
});

// 週期性靜音規則接口
registerRoute('get', '/recurring-silence-rules', (req, res) => {
  const db = router.db;
  const page = parsePageParam(req.query.page, 1);
  const pageSize = parsePageParam(req.query.page_size, 20);
  const { is_enabled, created_by, search } = req.query;

  let rules = db.get('recurring_silence_rules').value() || [];

  // 啟用狀態過濾
  if (is_enabled !== undefined) {
    const enabled = is_enabled === 'true';
    rules = rules.filter(rule => rule.is_enabled === enabled);
  }

  // 創建者過濾
  if (created_by) {
    rules = rules.filter(rule => rule.created_by === created_by);
  }

  // 搜索過濾
  if (search) {
    rules = rules.filter(rule =>
      rule.name.toLowerCase().includes(search.toLowerCase()) ||
      rule.description.toLowerCase().includes(search.toLowerCase())
    );
  }

  res.jsonp(withPagination(rules, page, pageSize));
});

// 單個週期性靜音規則
registerRoute('get', '/recurring-silence-rules/:ruleId', (req, res) => {
  const db = router.db;
  const rule = db.get('recurring_silence_rules').find({ id: req.params.ruleId }).value();

  if (rule) {
    res.jsonp(rule);
  } else {
    res.status(404).jsonp({
      code: 'RULE_NOT_FOUND',
      message: '週期性靜音規則不存在'
    });
  }
});

// 創建週期性靜音規則
registerRoute('post', '/recurring-silence-rules', (req, res) => {
  const db = router.db;
  const newRule = {
    id: `rsr_${Date.now()}`,
    ...req.body,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    execution_count: 0,
    last_execution: null,
    next_execution: null // 這裡應該根據 cron_expression 計算
  };

  db.get('recurring_silence_rules').push(newRule).write();
  res.status(201).jsonp(newRule);
});

// 事件規則列表
registerRoute('get', '/incident-rules', (req, res) => {
  const db = router.db;
  const page = parsePageParam(req.query.page, 1);
  const pageSize = parsePageParam(req.query.page_size, 20);
  const { severity, status, search } = req.query;

  let rules = db.get('incident_rules').value() || [];

  if (severity) {
    rules = rules.filter((rule) => String(rule.severity ?? '').toLowerCase() === String(severity).toLowerCase());
  }

  if (status) {
    rules = rules.filter((rule) => String(rule.status ?? '').toLowerCase() === String(status).toLowerCase());
  }

  if (search) {
    const keyword = String(search).toLowerCase();
    rules = rules.filter((rule) => {
      const fields = [rule.name, rule.description, rule.owner];
      return fields.some((field) => field && String(field).toLowerCase().includes(keyword));
    });
  }

  res.jsonp(withPagination(rules, page, pageSize));
});

registerRoute('get', '/incident-rules/:ruleId', (req, res) => {
  const rule = router.db.get('incident_rules').find({ id: req.params.ruleId }).value();
  if (!rule) {
    return res.status(404).jsonp({ code: 'INCIDENT_RULE_NOT_FOUND', message: '找不到指定事件規則' });
  }
  res.jsonp(rule);
});

// AI 日報
registerRoute('get', '/ai/daily-report', (req, res) => {
  const report = router.db.get('ai_daily_report').value();
  if (!report) {
    return res.status(404).jsonp({ code: 'REPORT_NOT_FOUND', message: '目前沒有可用的 AI 報告' });
  }
  res.jsonp(report);
});

// 通知歷史接口
registerRoute('get', '/notification-history', (req, res) => {
  const db = router.db;
  const page = parsePageParam(req.query.page, 1);
  const pageSize = parsePageParam(req.query.page_size, 20);
  const { channel_type, channel_name, status, event_id, start_date, end_date } = req.query;

  let history = db.get('notification_history').value() || [];

  // 渠道類型過濾
  if (channel_type) {
    const targetNames = db
      .get('notification_channels')
      .filter({ type: channel_type })
      .map('name')
      .value();
    history = history.filter(h => targetNames.includes(h.channel_name));
  }

  if (channel_name) {
    history = history.filter(h => h.channel_name === channel_name);
  }

  // 狀態過濾
  if (status) {
    history = history.filter(h => h.status === status);
  }

  // 事件ID過濾
  if (event_id) {
    history = history.filter(h => h.event_id === event_id);
  }

  // 日期範圍過濾
  if (start_date || end_date) {
    history = history.filter(h => {
      const sentAt = new Date(h.sent_at || h.created_at);
      if (start_date && sentAt < new Date(start_date)) return false;
      if (end_date && sentAt > new Date(end_date)) return false;
      return true;
    });
  }

  // 按發送時間倒序排序
  history.sort((a, b) => new Date(b.sent_at || b.created_at) - new Date(a.sent_at || a.created_at));

  // 分頁
  res.jsonp(withPagination(history, page, pageSize));
});

// 單個通知歷史詳情
registerRoute('get', '/notification-history/:historyId', (req, res) => {
  const db = router.db;
  const history = db.get('notification_history').find({ id: req.params.historyId }).value();

  if (history) {
    res.jsonp(history);
  } else {
    res.status(404).jsonp({
      code: 'HISTORY_NOT_FOUND',
      message: '通知歷史記錄不存在'
    });
  }
});

// 重發通知
registerRoute('post', '/notification-history/:historyId/resend', (req, res) => {
  const db = router.db;
  const history = db.get('notification_history').find({ id: req.params.historyId }).value();

  if (!history) {
    return res.status(404).jsonp({
      code: 'HISTORY_NOT_FOUND',
      message: '通知歷史記錄不存在'
    });
  }

  // 創建新的重發記錄
  const now = new Date().toISOString();
  const newHistory = {
    id: `notif_${Date.now()}`,
    event_id: history.event_id,
    policy_id: history.policy_id,
    channel_name: history.channel_name,
    recipient: history.recipient,
    status: 'sent',
    error_message: null,
    raw_payload: history.raw_payload,
    sent_at: now,
    created_at: now
  };

  db.get('notification_history').push(newHistory).write();
  res.status(201).jsonp(newHistory);
});

// 標籤鍵管理接口
registerRoute('get', '/tag-keys', (req, res) => {
  const db = router.db;
  const page = parsePageParam(req.query.page, 1);
  const pageSize = parsePageParam(req.query.page_size, 20);
  const { category, is_required, is_system, search } = req.query;

  let tagKeys = db.get('tag_keys').value() || [];

  // 分類過濾
  if (category) {
    tagKeys = tagKeys.filter(tk => (tk.compliance_category || '').toLowerCase() === category.toLowerCase());
  }

  // 必填狀態過濾
  if (is_required !== undefined) {
    const required = is_required === 'true';
    tagKeys = tagKeys.filter(tk => tk.is_required === required);
  }

  // 系統標籤過濾
  if (is_system !== undefined) {
    const system = is_system === 'true';
    tagKeys = tagKeys.filter(tk => (
      system ? tk.enforcement_level === 'blocking' : tk.enforcement_level !== 'blocking'
    ));
  }

  // 搜索過濾
  if (search) {
    tagKeys = tagKeys.filter(tk =>
      tk.key_name.toLowerCase().includes(search.toLowerCase()) ||
      (tk.description || '').toLowerCase().includes(search.toLowerCase())
    );
  }

  // 按使用次數排序
  tagKeys.sort((a, b) => b.usage_count - a.usage_count);

  const allowedValues = db.get('tag_allowed_values').value() || [];
  const enriched = tagKeys.map(tagKey => ({
    ...tagKey,
    allowed_values: allowedValues.filter(val => val.tag_key_id === tagKey.id)
  }));

  res.jsonp(withPagination(enriched, page, pageSize));
});

// 標籤鍵自動補全
registerRoute('get', '/tag-keys/autocomplete', (req, res) => {
  const db = router.db;
  const { q, category, limit = 10 } = req.query;

  let tagKeys = db.get('tag_keys').value() || [];

  if (q) {
    tagKeys = tagKeys.filter(tk =>
      tk.key_name.toLowerCase().includes(q.toLowerCase())
    );
  }

  if (category) {
    tagKeys = tagKeys.filter(tk => (tk.compliance_category || '').toLowerCase() === category.toLowerCase());
  }

  const suggestions = tagKeys
    .slice(0, parseInt(limit, 10))
    .map(tk => ({
      id: tk.id,
      key_name: tk.key_name,
      description: tk.description,
      enforcement_level: tk.enforcement_level
    }));

  res.jsonp({
    suggestions,
    total: tagKeys.length
  });
});

// 標籤值建議
registerRoute('get', '/tag-keys/:keyId/values/suggestions', (req, res) => {
  const db = router.db;
  const { q, limit = 10 } = req.query;
  const tagKey = db.get('tag_keys').find({ id: req.params.keyId }).value();

  if (!tagKey) {
    return res.status(404).jsonp({
      code: 'TAG_KEY_NOT_FOUND',
      message: '標籤鍵不存在'
    });
  }

  const allowedValues = db
    .get('tag_allowed_values')
    .filter({ tag_key_id: tagKey.id })
    .map('value')
    .value();

  const suggestions = allowedValues.filter(value => !q || value.toLowerCase().includes(q.toLowerCase()));

  res.jsonp({
    suggestions: suggestions.slice(0, parseInt(limit, 10)),
    total: suggestions.length
  });
});

// 通知歷史統計
registerRoute('get', '/notification-history/stats', (req, res) => {
  const db = router.db;
  const { start_date, end_date, channel_type, channel_name } = req.query;

  let history = db.get('notification_history').value() || [];

  // 日期範圍過濾
  if (start_date || end_date) {
    history = history.filter(h => {
      const sentAt = new Date(h.sent_at || h.created_at);
      if (start_date && sentAt < new Date(start_date)) return false;
      if (end_date && sentAt > new Date(end_date)) return false;
      return true;
    });
  }

  // 渠道類型過濾
  if (channel_type) {
    const targetNames = db
      .get('notification_channels')
      .filter({ type: channel_type })
      .map('name')
      .value();
    history = history.filter(h => targetNames.includes(h.channel_name));
  }

  if (channel_name) {
    history = history.filter(h => h.channel_name === channel_name);
  }

  // 計算統計數據
  const total = history.length;
  const byStatus = history.reduce((acc, h) => {
    acc[h.status] = (acc[h.status] || 0) + 1;
    return acc;
  }, {});

  const byChannel = history.reduce((acc, h) => {
    const name = h.channel_name || 'unknown';
    acc[name] = (acc[name] || 0) + 1;
    return acc;
  }, {});

  const avgResponseTime = history
    .filter(h => h.response_time_ms)
    .reduce((sum, h, _, arr) => sum + h.response_time_ms / arr.length, 0);

  const failureRate = total > 0 ? (byStatus.failed || 0) / total : 0;

  res.jsonp({
    total,
    by_status: byStatus,
    by_channel: byChannel,
    avg_response_time_ms: Math.round(avgResponseTime),
    failure_rate: Math.round(failureRate * 100) / 100,
    success_rate: Math.round((1 - failureRate) * 100) / 100
  });
});

// 自動化腳本與排程
registerRoute('get', '/scripts', (req, res) => {
  const db = router.db;
  const page = parsePageParam(req.query.page, 1);
  const pageSize = parsePageParam(req.query.page_size, 20);
  const category = req.query.category ? String(req.query.category).toLowerCase() : '';
  const search = (req.query.search || '').toLowerCase();
  const isEnabled = typeof req.query.is_enabled !== 'undefined' ? req.query.is_enabled === 'true' : null;

  let scripts = db.get('automation_scripts').value() || [];

  if (category) {
    scripts = scripts.filter((item) => String(item.category || '').toLowerCase() === category);
  }

  if (isEnabled !== null) {
    scripts = scripts.filter((item) => Boolean(item.is_enabled) === isEnabled);
  }

  if (search) {
    scripts = scripts.filter((item) => {
      const name = String(item.name || '').toLowerCase();
      const description = String(item.description || '').toLowerCase();
      return name.includes(search) || description.includes(search);
    });
  }

  res.jsonp(withPagination(scripts, page, pageSize));
});

registerRoute('post', '/scripts', (req, res) => {
  const db = router.db;
  const payload = req.body || {};
  const now = new Date().toISOString();
  const id = payload.id || `script_${Date.now()}`;

  const record = {
    id,
    name: payload.name || '未命名腳本',
    description: payload.description || '',
    type: payload.type || payload.language || 'python',
    creator_id: payload.creator_id || 'user_ops_lead',
    category: payload.category || 'maintenance',
    parameters_definition: payload.parameters_definition || {},
    git_repo_url: payload.git_repo_url || '',
    commit_hash: payload.commit_hash || '',
    version: payload.version || '1.0.0',
    is_enabled: typeof payload.is_enabled === 'boolean' ? payload.is_enabled : true,
    created_at: now,
    updated_at: now,
    deleted_at: null
  };

  db.get('automation_scripts').push(record).write();
  res.status(201).jsonp(record);
});

registerRoute('get', '/scripts/:scriptId', (req, res) => {
  const script = router.db.get('automation_scripts').find({ id: req.params.scriptId }).value();
  if (!script) {
    return res.status(404).jsonp({ code: 'SCRIPT_NOT_FOUND', message: '腳本不存在' });
  }
  res.jsonp(script);
});

registerRoute('put', '/scripts/:scriptId', (req, res) => {
  const db = router.db;
  const query = db.get('automation_scripts').find({ id: req.params.scriptId });
  if (!query.value()) {
    return res.status(404).jsonp({ code: 'SCRIPT_NOT_FOUND', message: '腳本不存在' });
  }

  const now = new Date().toISOString();
  query.assign({ ...req.body, id: req.params.scriptId, updated_at: now }).write();
  res.jsonp(query.value());
});

registerRoute('delete', '/scripts/:scriptId', (req, res) => {
  const removed = router.db.get('automation_scripts').remove({ id: req.params.scriptId }).write();
  if (!removed || removed.length === 0) {
    return res.status(404).jsonp({ code: 'SCRIPT_NOT_FOUND', message: '腳本不存在' });
  }
  res.status(204).end();
});

registerRoute('post', '/scripts/:scriptId/execute', (req, res) => {
  const db = router.db;
  const script = db.get('automation_scripts').find({ id: req.params.scriptId }).value();
  if (!script) {
    return res.status(404).jsonp({ code: 'SCRIPT_NOT_FOUND', message: '腳本不存在' });
  }

  const now = new Date();
  const run = {
    id: `run_${now.getTime()}`,
    script_id: script.id,
    schedule_id: null,
    status: 'running',
    trigger_type: req.body?.trigger || 'manual',
    trigger_metadata: req.body?.trigger_metadata || {},
    started_at: now.toISOString(),
    finished_at: null,
    duration_ms: null,
    output: null,
    operator: req.body?.operator || '模擬使用者'
  };

  db.get('automation_runs').unshift(run).write();
  res.status(202).jsonp(run);
});

registerRoute('get', '/schedules', (req, res) => {
  const db = router.db;
  const page = parsePageParam(req.query.page, 1);
  const pageSize = parsePageParam(req.query.page_size, 20);
  const isEnabled = typeof req.query.is_enabled !== 'undefined' ? req.query.is_enabled === 'true' : null;

  let schedules = db.get('schedules').value() || [];
  if (isEnabled !== null) {
    schedules = schedules.filter((item) => Boolean(item.is_enabled) === isEnabled);
  }

  res.jsonp(withPagination(schedules, page, pageSize));
});

registerRoute('post', '/schedules', (req, res) => {
  const db = router.db;
  const payload = req.body || {};
  const now = new Date().toISOString();
  const id = payload.id || `sch_${Date.now()}`;

  const record = {
    id,
    name: payload.name || '未命名排程',
    description: payload.description || '',
    script_id: payload.script_id,
    cron_expression: payload.cron_expression || '* * * * *',
    parameters: payload.parameters || {},
    mode: payload.mode || 'simple',
    frequency: payload.frequency || null,
    timezone: payload.timezone || 'UTC',
    is_enabled: typeof payload.is_enabled === 'boolean' ? payload.is_enabled : true,
    last_status: payload.last_status || 'pending',
    last_run_at: payload.last_run_at || null,
    next_run_at: payload.next_run_at || null,
    creator_id: payload.creator_id || 'user_ops_lead',
    created_at: now,
    updated_at: now,
    deleted_at: null
  };

  db.get('schedules').push(record).write();
  res.status(201).jsonp(record);
});

registerRoute('get', '/schedules/:scheduleId', (req, res) => {
  const schedule = router.db.get('schedules').find({ id: req.params.scheduleId }).value();
  if (!schedule) {
    return res.status(404).jsonp({ code: 'SCHEDULE_NOT_FOUND', message: '排程不存在' });
  }
  res.jsonp(schedule);
});

registerRoute('put', '/schedules/:scheduleId', (req, res) => {
  const db = router.db;
  const query = db.get('schedules').find({ id: req.params.scheduleId });
  if (!query.value()) {
    return res.status(404).jsonp({ code: 'SCHEDULE_NOT_FOUND', message: '排程不存在' });
  }

  const now = new Date().toISOString();
  query.assign({ ...req.body, id: req.params.scheduleId, updated_at: now }).write();
  res.jsonp(query.value());
});

registerRoute('delete', '/schedules/:scheduleId', (req, res) => {
  const removed = router.db.get('schedules').remove({ id: req.params.scheduleId }).write();
  if (!removed || removed.length === 0) {
    return res.status(404).jsonp({ code: 'SCHEDULE_NOT_FOUND', message: '排程不存在' });
  }
  res.status(204).end();
});

registerRoute('get', '/automation-runs', (req, res) => {
  const db = router.db;
  const page = parsePageParam(req.query.page, 1);
  const pageSize = parsePageParam(req.query.page_size, 20);
  const status = req.query.status ? String(req.query.status).toLowerCase() : '';
  const scriptId = req.query.script_id ? String(req.query.script_id) : '';

  let runs = db.get('automation_runs').value() || [];
  if (status) {
    runs = runs.filter((run) => String(run.status || '').toLowerCase() === status);
  }
  if (scriptId) {
    runs = runs.filter((run) => run.script_id === scriptId);
  }

  res.jsonp(withPagination(runs, page, pageSize));
});

registerRoute('get', '/automation-runs/:runId', (req, res) => {
  const run = router.db.get('automation_runs').find({ id: req.params.runId }).value();
  if (!run) {
    return res.status(404).jsonp({ code: 'AUTOMATION_RUN_NOT_FOUND', message: '找不到指定的執行紀錄' });
  }
  res.jsonp(run);
});

// 根據事件建立一次性靜音規則
registerRoute('post', '/silence-rules', (req, res) => {
  const db = router.db;
  const { event_id, duration, comment } = req.body;

  if (!event_id || !duration || !comment) {
    return res.status(400).jsonp({
      code: 'INVALID_PAYLOAD',
      message: 'event_id, duration, and comment are required fields.'
    });
  }

  const event = db.get('events').find({ id: event_id }).value();
  if (!event) {
    return res.status(404).jsonp({ code: 'EVENT_NOT_FOUND', message: '指定的事件不存在' });
  }

  const matchers = (event.tags || []).map(tag => ({
    name: tag.key,
    value: tag.value,
    isEqual: true,
    isRegex: false
  }));

  // 確保至少有一個 matcher，通常是 alertname
  if (!matchers.some(m => m.name === 'alertname') && event.summary) {
    matchers.push({ name: 'alertname', value: event.summary, isEqual: true, isRegex: false });
  }

  const now = new Date();
  const startsAt = now.toISOString();
  let endsAt;

  try {
    const durationRegex = /(\d+)(h|m|d)/g;
    let totalMs = 0;
    let match;
    while ((match = durationRegex.exec(duration)) !== null) {
      const value = parseInt(match[1], 10);
      const unit = match[2];
      if (unit === 'h') totalMs += value * 60 * 60 * 1000;
      if (unit === 'm') totalMs += value * 60 * 1000;
      if (unit === 'd') totalMs += value * 24 * 60 * 60 * 1000;
    }
    if (totalMs === 0) throw new Error('Invalid duration format');
    endsAt = new Date(now.getTime() + totalMs).toISOString();
  } catch (e) {
    return res.status(400).jsonp({ code: 'INVALID_DURATION', message: '無效的 duration 格式，請使用例如 "1h", "30m", "2d"。' });
  }

  const newSilence = {
    id: `silence_${Date.now()}`,
    matchers,
    startsAt,
    endsAt,
    createdBy: 'mock-user',
    comment,
    status: {
      state: 'active'
    }
  };

  const silencesCollection = ensureArrayCollection(db, 'silences');
  silencesCollection.push(newSilence).write();

  res.status(201).jsonp(newSilence);
});

// 其他接口使用默認的 json-server 路由
server.use('/', router);
server.use('/api/v1', router);

const PORT = process.env.PORT || 8080;

server.listen(PORT, () => {
  console.log(`Mock server is running on http://localhost:${PORT}`);
  console.log(`API documentation available at http://localhost:${PORT}/api/v1/docs`);
  console.log('\n🎯 Available endpoints:');
  console.log(`  - GET  /api/v1/dashboards`);
  console.log(`  - GET  /api/v1/dashboards/stats`);
  console.log(`  - GET  /api/v1/infrastructure/stats`);
  console.log(`  - GET  /api/v1/ai/risk-predictions`);
  console.log(`  - GET  /api/v1/scripts`);
  console.log(`  - GET  /api/v1/schedules`);
  console.log(`  - GET  /api/v1/automation-runs`);
  console.log(`  - GET  /api/v1/recurring-silence-rules`);
  console.log(`  - GET  /api/v1/notification-history`);
  console.log(`  - GET  /api/v1/tag-keys`);
  console.log(`  - GET  /api/v1/tag-keys/autocomplete`);
  console.log(`  - POST /api/v1/auth/login`);
});
