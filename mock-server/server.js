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

// 資源列表接口 - 支持分頁和搜索
registerRoute('get', '/resources', (req, res) => {
  const db = router.db;
  const page = parsePageParam(req.query.page, 1);
  const pageSize = parsePageParam(req.query.page_size, 20);
  const search = (req.query.search || '').toLowerCase();
  const status = (req.query.status || '').toUpperCase();
  const teamId = req.query.team_id || '';

  let resources = db.get('resources').value();

  if (search) {
    resources = resources.filter(resource => {
      const matchName = resource.name.toLowerCase().includes(search);
      const matchIp = resource.ip_address ? resource.ip_address.includes(search) : false;
      return matchName || matchIp;
    });
  }

  if (status) {
    resources = resources.filter(resource => resource.status === status);
  }

  if (teamId) {
    resources = resources.filter(resource => resource.team_id === teamId);
  }

  res.jsonp(withPagination(resources, page, pageSize));
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
