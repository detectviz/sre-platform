const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 8080;

app.use(cors());
app.use(bodyParser.json());

const apiRouter = express.Router();

// --- Mock Data ---

const mockEvents = {
  items: [
    {
      id: "evt_1",
      summary: "CPU 使用率過高",
      resource_name: "server-prod-01",
      service_impact: "High",
      rule_name: "CPU > 90% for 5m",
      trigger_threshold: "90%",
      status: "new",
      assignee: "未分配",
      trigger_time: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    },
    {
      id: "evt_2",
      summary: "記憶體不足",
      resource_name: "db-main-cluster",
      service_impact: "Critical",
      rule_name: "Memory < 1GB",
      trigger_threshold: "1GB",
      status: "ack",
      assignee: "張三",
      trigger_time: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    },
    {
      id: "evt_3",
      summary: "API 延遲增加",
      resource_name: "api-gateway-us-east-1",
      service_impact: "Medium",
      rule_name: "P99 Latency > 500ms",
      trigger_threshold: "500ms",
      status: "resolved",
      assignee: "李四",
      trigger_time: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    }
  ],
  total: 3,
};

const mockEventDetail = {
    ...mockEvents.items[0],
    description: "生產環境伺服器 server-prod-01 的 CPU 使用率在過去 5 分鐘內持續高於 90%。",
    history: [
        { timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(), user: "系統", action: "事件觸發" }
    ],
    related_events: [],
    automation_logs: [],
};

const mockEventRules = [
    {
        id: "rule_1",
        enabled: true,
        name: "CPU > 90% for 5m",
        target: "env:production, type:server",
        conditions: "avg(cpu.usage) > 90 for 5m",
        severity: "critical",
        automation_enabled: true,
        creator: "Admin",
        last_updated: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
        id: "rule_2",
        enabled: true,
        name: "Memory < 1GB",
        target: "type:database",
        conditions: "avg(memory.available) < 1024 for 10m",
        severity: "warning",
        automation_enabled: false,
        creator: "Admin",
        last_updated: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
        id: "rule_3",
        enabled: false,
        name: "API P99 Latency > 500ms",
        target: "app:gateway",
        conditions: "p99(api.latency) > 500 for 1m",
        severity: "warning",
        automation_enabled: false,
        creator: "李四",
        last_updated: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    }
];


// --- API Endpoints ---

apiRouter.get('/events', (req, res) => {
  console.log('GET /api/v1/events');
  res.json(mockEvents);
});

apiRouter.get('/events/:id', (req, res) => {
    console.log(`GET /api/v1/events/${req.params.id}`);
    res.json(mockEventDetail);
});

apiRouter.get('/event-rules', (req, res) => {
    console.log('GET /api/v1/event-rules');
    res.json(mockEventRules);
});

apiRouter.get('/silences', (req, res) => {
    console.log('GET /api/v1/silences');
    res.json([]);
});

apiRouter.get('/resources', (req, res) => {
    console.log('GET /api/v1/resources');
    res.json([]);
});


app.use('/api/v1', apiRouter);

app.listen(port, () => {
  console.log(`SRE Platform Mock Server is running on http://localhost:${port}`);
});
