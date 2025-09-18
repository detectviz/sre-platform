const jsonServer = require('json-server');
const server = jsonServer.create();
const router = jsonServer.router('mock-server/db.json');
const middlewares = jsonServer.defaults();

server.use(middlewares);

// 添加自定義路由和中間件
server.use(jsonServer.bodyParser);

// 登入接口
server.post('/api/v1/auth/login', (req, res) => {
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
server.post('/api/v1/auth/logout', (req, res) => {
  res.jsonp({ message: '登出成功' });
});

// 儀表板統計數據接口
server.get('/api/v1/dashboard/stats', (req, res) => {
  const db = router.db;
  const stats = db.get('dashboard_stats').value();
  res.jsonp(stats);
});

// 資源列表接口 - 支持分頁和搜索
server.get('/api/v1/resources', (req, res) => {
  const db = router.db;
  const page = parseInt(req.query.page) || 1;
  const pageSize = parseInt(req.query.page_size) || 20;
  const search = req.query.search || '';
  const status = req.query.status || '';

  let resources = db.get('resources').value();

  // 搜索過濾
  if (search) {
    resources = resources.filter(resource =>
      resource.name.toLowerCase().includes(search.toLowerCase()) ||
      resource.ip_address.includes(search)
    );
  }

  // 狀態過濾
  if (status) {
    resources = resources.filter(resource => resource.status === status);
  }

  // 分頁
  const start = (page - 1) * pageSize;
  const end = start + pageSize;
  const paginatedResources = resources.slice(start, end);

  res.jsonp({
    items: paginatedResources,
    total: resources.length,
    page: page,
    page_size: pageSize
  });
});

// 事件列表接口 - 支持分頁和多維度篩選
server.get('/api/v1/events', (req, res) => {
  const db = router.db;
  const page = parseInt(req.query.page) || 1;
  const pageSize = parseInt(req.query.page_size) || 20;
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
    events = events.filter(event => event.resource.name.toLowerCase().includes(resource_name.toLowerCase()));
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

  // 分頁
  const start = (page - 1) * pageSize;
  const end = start + pageSize;
  const paginatedEvents = events.slice(start, end);

  res.jsonp({
    items: paginatedEvents,
    total: events.length,
    page: page,
    page_size: pageSize
  });
});

// 其他接口使用默認的 json-server 路由
server.use('/api/v1', router);

server.listen(8080, () => {
  console.log('Mock server is running on http://localhost:8080');
  console.log('API documentation available at http://localhost:8080/api/v1/docs');
});