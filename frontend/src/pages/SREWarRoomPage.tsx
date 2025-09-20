import { Fragment, useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, Button, Card, Col, Empty, List, Row, Space, Spin, Tooltip, Typography } from 'antd';
import { ArrowRightOutlined, CheckCircleOutlined, FireOutlined, HistoryOutlined, ReloadOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { ContextualKPICard, PageHeader } from '../components';
import type { ContextualKPICardProps, KPIStatus } from '../components/ContextualKPICard';
import { fetchJson } from '../utils/apiClient';

const { Text } = Typography;

type ApiEventItem = {
  id?: string | number;
  summary?: string;
  severity?: string;
  status?: string;
  resource?: { name?: string };
  labels?: Record<string, string>;
  updated_at?: string;
  created_at?: string;
  ends_at?: string;
};

type ApiAutomationStat = {
  success_rate?: number;
  error_budget_burn_rate?: number;
  mean_time_to_resolve_minutes?: number;
};

type AutomationHealthTile = {
  key: string;
  label: string;
  value: number;
  description: string;
};

type RiskPrediction = {
  id: string;
  title: string;
  description: string;
  severity: 'high' | 'medium' | 'low';
};

type ServiceHealthSeverity = 'healthy' | 'warning' | 'critical' | 'maintenance' | 'info';

type ServiceHealthCell = {
  timeKey: string;
  label: string;
  severity: ServiceHealthSeverity;
  value?: string;
  tooltip?: string;
};

type ServiceHealthRow = {
  key: string;
  serviceName: string;
  owner?: string;
  cells: ServiceHealthCell[];
};

type WarRoomKpiCard = {
  key: string;
} & Pick<ContextualKPICardProps, 'title' | 'value' | 'unit' | 'status' | 'description' | 'icon' | 'onClick' | 'trendValue' | 'trendLabel'>;

const SERVICE_HEATMAP_BUCKETS = [
  { key: 'now', label: '目前' },
  { key: '1h', label: '-1 小時' },
  { key: '3h', label: '-3 小時' },
  { key: '6h', label: '-6 小時' },
  { key: '12h', label: '-12 小時' },
  { key: '24h', label: '-24 小時' },
] as const;

const SERVICE_HEATMAP_LEGEND: Record<ServiceHealthSeverity, { label: string; color: string }> = {
  healthy: { label: '穩定', color: 'rgba(82, 196, 26, 0.28)' },
  warning: { label: '警示', color: 'rgba(250, 173, 20, 0.32)' },
  critical: { label: '嚴重', color: 'rgba(245, 34, 45, 0.35)' },
  maintenance: { label: '維護', color: 'rgba(24, 144, 255, 0.28)' },
  info: { label: '資訊', color: 'rgba(255, 255, 255, 0.12)' },
};

const INCIDENT_SEVERITY_TO_HEATMAP: Record<string, ServiceHealthSeverity> = {
  critical: 'critical',
  error: 'critical',
  warning: 'warning',
  info: 'info',
  major: 'critical',
  minor: 'warning',
};

const getHeatmapColor = (severity: ServiceHealthSeverity) => SERVICE_HEATMAP_LEGEND[severity].color;

const getHeatmapLabel = (severity: ServiceHealthSeverity) => SERVICE_HEATMAP_LEGEND[severity].label;

const fallbackServiceHealth: ServiceHealthRow[] = [
  {
    key: 'payment-api',
    serviceName: '支付核心 API',
    owner: '支付可靠性小組',
    cells: [
      { timeKey: 'now', label: '目前', severity: 'critical', value: 'P1', tooltip: '錯誤率 2.1%，出現支付超時' },
      { timeKey: '1h', label: '-1 小時', severity: 'warning', value: '延遲 ↑' },
      { timeKey: '3h', label: '-3 小時', severity: 'warning', value: '延遲 ↑' },
      { timeKey: '6h', label: '-6 小時', severity: 'healthy', value: '99.2%' },
      { timeKey: '12h', label: '-12 小時', severity: 'healthy', value: '99.9%' },
      { timeKey: '24h', label: '-24 小時', severity: 'healthy', value: '99.9%' },
    ],
  },
  {
    key: 'checkout-web',
    serviceName: '結帳前端服務',
    owner: '電商體驗小組',
    cells: [
      { timeKey: 'now', label: '目前', severity: 'warning', value: '95% 可用', tooltip: '部分地區延遲升高' },
      { timeKey: '1h', label: '-1 小時', severity: 'healthy', value: '99%' },
      { timeKey: '3h', label: '-3 小時', severity: 'healthy', value: '99%' },
      { timeKey: '6h', label: '-6 小時', severity: 'healthy', value: '99.5%' },
      { timeKey: '12h', label: '-12 小時', severity: 'healthy', value: '99.8%' },
      { timeKey: '24h', label: '-24 小時', severity: 'healthy', value: '99.9%' },
    ],
  },
  {
    key: 'identity-sso',
    serviceName: '身份驗證 SSO',
    owner: '平台安全小組',
    cells: [
      { timeKey: 'now', label: '目前', severity: 'maintenance', value: '維護', tooltip: '進行例行更新 (20 分鐘)' },
      { timeKey: '1h', label: '-1 小時', severity: 'maintenance', value: '維護', tooltip: '維護準備階段' },
      { timeKey: '3h', label: '-3 小時', severity: 'healthy', value: '99.9%' },
      { timeKey: '6h', label: '-6 小時', severity: 'healthy', value: '100%' },
      { timeKey: '12h', label: '-12 小時', severity: 'healthy', value: '100%' },
      { timeKey: '24h', label: '-24 小時', severity: 'healthy', value: '100%' },
    ],
  },
  {
    key: 'notification-service',
    serviceName: '通知廣播服務',
    owner: '通訊整合小組',
    cells: [
      { timeKey: 'now', label: '目前', severity: 'info', value: '排程中' },
      { timeKey: '1h', label: '-1 小時', severity: 'info', value: '排程中' },
      { timeKey: '3h', label: '-3 小時', severity: 'healthy', value: '99.9%' },
      { timeKey: '6h', label: '-6 小時', severity: 'healthy', value: '99.9%' },
      { timeKey: '12h', label: '-12 小時', severity: 'healthy', value: '99.9%' },
      { timeKey: '24h', label: '-24 小時', severity: 'healthy', value: '99.9%' },
    ],
  },
  {
    key: 'ml-batch',
    serviceName: 'ML 批次預測',
    owner: '智慧營運小組',
    cells: [
      { timeKey: 'now', label: '目前', severity: 'healthy', value: '準備就緒' },
      { timeKey: '1h', label: '-1 小時', severity: 'healthy', value: '100%' },
      { timeKey: '3h', label: '-3 小時', severity: 'info', value: '待排程' },
      { timeKey: '6h', label: '-6 小時', severity: 'info', value: '待排程' },
      { timeKey: '12h', label: '-12 小時', severity: 'info', value: '待排程' },
      { timeKey: '24h', label: '-24 小時', severity: 'healthy', value: '100%' },
    ],
  },
];

const fallbackWarRoom = {
  stats: {
    openIncidents: 5,
    inProgress: 3,
    resolvedToday: 12,
    automationSuccessRate: 62,
    meanTimeToResolve: 2.4,
    errorBudgetBurn: 18,
    openTrend: 12,
    inProgressTrend: -2,
    resolvedTodayTrend: 4,
    mttrTrend: -0.8,
  },
  aiReport: {
    title: 'AI 簡報摘要 (模擬資料)',
    generatedAt: '2025-09-18T09:00:00Z',
    highlights: [
      '⚠️ <strong>資料庫服務</strong> 的錯誤率在 30 分鐘內攀升至 1.8%，請儘速檢查慢查詢與索引。',
      '🤖 自動化腳本 <em>Auto-scaling for Web Servers</em> 在過去 4 小時內成功擴容兩次，CPU 壓力已緩解。',
      '📈 <strong>Payment API</strong> 在高峰時段仍有 25% 的資源閒置，可考慮調整資源配置。',
    ],
  },
  latestIncidents: [
    {
      id: 'i_1',
      summary: 'CPU high on db-mysql-prod-02',
      severity: 'critical',
      service: '資料庫服務',
      updatedAt: '2025-09-18T02:25:00Z',
    },
    {
      id: 'i_2',
      summary: 'Disk space low on srv-web-prod-02',
      severity: 'warning',
      service: 'Web應用',
      updatedAt: '2025-09-18T00:30:00Z',
    },
  ],
  automationTiles: [
    {
      key: 'successRate',
      label: '自動化成功率',
      value: 62,
      description: '過去 24 小時自動化執行成功率',
    },
    {
      key: 'errorBudget',
      label: '錯誤預算消耗',
      value: 18,
      description: '建議控制在 20% 以下',
    },
  ] satisfies AutomationHealthTile[],
  riskPredictions: [
    {
      id: 'risk-1',
      title: 'web-prod-01',
      description: 'CPU 使用率預計於 2 小時內突破 90%，建議啟動擴容動作。',
      severity: 'high',
    },
    {
      id: 'risk-2',
      title: 'payment-api',
      description: '錯誤率在高峰時段攀升，建議檢查 API Gateway。',
      severity: 'medium',
    },
    {
      id: 'risk-3',
      title: 'analytics-worker',
      description: '記憶體使用率高於 80%，預測 6 小時後可能觸發 OOM。',
      severity: 'medium',
    },
  ] satisfies RiskPrediction[],
};

const buildKpiCards = (stats: typeof fallbackWarRoom.stats, onNavigate?: SREWarRoomPageProps['onNavigate']): WarRoomKpiCard[] => {
  const openTone: KPIStatus = stats.openIncidents > 4 ? 'danger' : stats.openIncidents > 0 ? 'warning' : 'success';
  const inProgressTone: KPIStatus = stats.inProgress > 5 ? 'warning' : 'info';
  const resolvedTone: KPIStatus = 'success';

  return [
    {
      key: 'open-incidents',
      title: '待處理事件',
      value: stats.openIncidents,
      unit: '件',
      status: openTone,
      description: '尚未確認的事件',
      icon: <FireOutlined style={{ fontSize: 28, color: '#ff7875' }} />,
      onClick: () => onNavigate?.('incident-list', { statusFilter: 'open' }),
      trendValue: stats.openTrend,
      trendLabel: '較昨日',
    },
    {
      key: 'in-progress',
      title: '處理中',
      value: stats.inProgress,
      unit: '件',
      status: inProgressTone,
      description: '已確認待解決的事件',
      icon: <HistoryOutlined style={{ fontSize: 28, color: '#faad14' }} />,
      onClick: () => onNavigate?.('incident-list', { statusFilter: 'acknowledged' }),
      trendValue: stats.inProgressTrend,
      trendLabel: '較 1 小時前',
    },
    {
      key: 'resolved-today',
      title: '今日已解決',
      value: stats.resolvedToday,
      unit: '件',
      status: resolvedTone,
      description: '包含自動化與人工處理',
      icon: <CheckCircleOutlined style={{ fontSize: 28, color: '#52c41a' }} />,
      onClick: () => onNavigate?.('incident-list', { resolved: 'today' }),
      trendValue: stats.resolvedTodayTrend,
      trendLabel: '較昨日',
    },
  ];
};

export type SREWarRoomPageProps = {
  onNavigate?: (key: string, params?: Record<string, unknown>) => void;
};

const SREWarRoomPage = ({ onNavigate }: SREWarRoomPageProps) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFallback, setIsFallback] = useState(false);
  const [stats, setStats] = useState(fallbackWarRoom.stats);
  const [aiReport, setAiReport] = useState(fallbackWarRoom.aiReport);
  const [latestIncidents, setLatestIncidents] = useState(fallbackWarRoom.latestIncidents);
  const [automationTiles, setAutomationTiles] = useState<AutomationHealthTile[]>(fallbackWarRoom.automationTiles);
  const [riskPredictions, setRiskPredictions] = useState<RiskPrediction[]>(fallbackWarRoom.riskPredictions);
  const [serviceHealth, setServiceHealth] = useState<ServiceHealthRow[]>(fallbackServiceHealth);
  const [refreshCounter, setRefreshCounter] = useState(0);
  const heatmapLegendEntries = useMemo(
    () => Object.entries(SERVICE_HEATMAP_LEGEND) as Array<[ServiceHealthSeverity, { label: string; color: string }]>,
    [],
  );

  useEffect(() => {
    document.title = '作戰指揮中心 - SRE 平台';
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    const load = async () => {
      try {
        setLoading(true);
        setIsFallback(false);
        setError(null);

        const [statsPayload, eventsPayload, reportPayload] = await Promise.all([
          fetchJson<ApiAutomationStat>('dashboard/stats', { signal: controller.signal }).catch(() => ({}) as ApiAutomationStat),
          fetchJson('events?page_size=6&sort_by=created_at&sort_order=desc', { signal: controller.signal }).catch(() => ({ items: [] })),
          fetchJson('ai/daily-report', { signal: controller.signal }).catch(() => ({})),
        ]);

        const automationRate = typeof statsPayload?.success_rate === 'number'
          ? Math.round(statsPayload.success_rate * 100)
          : fallbackWarRoom.stats.automationSuccessRate;
        const errorBudgetBurn = typeof statsPayload?.error_budget_burn_rate === 'number'
          ? Math.round(statsPayload.error_budget_burn_rate * 100)
          : fallbackWarRoom.stats.errorBudgetBurn;
        const meanTimeToResolve = typeof statsPayload?.mean_time_to_resolve_minutes === 'number'
          ? Number((statsPayload.mean_time_to_resolve_minutes / 60).toFixed(1))
          : fallbackWarRoom.stats.meanTimeToResolve;

        const eventsContainer = (eventsPayload && typeof eventsPayload === 'object')
          ? (eventsPayload as Record<string, unknown>)
          : {};
        const rawEvents = Array.isArray(eventsContainer.items)
          ? eventsContainer.items
          : Array.isArray(eventsContainer.data)
            ? eventsContainer.data
            : Array.isArray(eventsPayload)
              ? eventsPayload
              : [];
        const eventItems = rawEvents.filter((item): item is ApiEventItem => !!item && typeof item === 'object');

        const resolvedToday = eventItems.filter((event) => {
          const status = (event.status ?? '').toLowerCase();
          const timestamp = event.updated_at ?? event.ends_at ?? event.created_at;
          return status === 'resolved' && timestamp && dayjs(timestamp).isSame(dayjs(), 'day');
        }).length;

        setStats({
          openIncidents: fallbackWarRoom.stats.openIncidents,
          inProgress: fallbackWarRoom.stats.inProgress,
          resolvedToday: resolvedToday || fallbackWarRoom.stats.resolvedToday,
          automationSuccessRate: automationRate,
          meanTimeToResolve,
          errorBudgetBurn,
          openTrend: fallbackWarRoom.stats.openTrend,
          inProgressTrend: fallbackWarRoom.stats.inProgressTrend,
          resolvedTodayTrend: fallbackWarRoom.stats.resolvedTodayTrend,
          mttrTrend: fallbackWarRoom.stats.mttrTrend,
        });

        setLatestIncidents(
          eventItems.slice(0, 6).map((item, index) => ({
            id: String(item.id ?? index),
            summary: item.summary ?? '未命名事件',
            severity: (item.severity ?? 'info').toLowerCase(),
            service: item.resource?.name ?? item.labels?.service ?? '未知服務',
            updatedAt: item.updated_at ?? item.created_at ?? new Date().toISOString(),
          })),
        );

        setAutomationTiles([
          {
            key: 'successRate',
            label: '自動化成功率',
            value: automationRate,
            description: '過去 24 小時自動化執行成功率',
          },
          {
            key: 'errorBudget',
            label: '錯誤預算消耗',
            value: errorBudgetBurn,
            description: '建議控制在 20% 以下',
          },
        ]);

        const updatedHeatmap = fallbackServiceHealth.map((row) => {
          const cells = row.cells.map((cell) => ({ ...cell }));
          const normalizedKey = row.key.toLowerCase();
          const normalizedName = row.serviceName.toLowerCase();
          const matchedIncident = eventItems.find((event) => {
            const serviceName = (event.resource?.name ?? event.labels?.service ?? '').toLowerCase();
            const summary = (event.summary ?? '').toLowerCase();
            return serviceName.includes(normalizedKey)
              || serviceName.includes(normalizedName)
              || summary.includes(normalizedKey);
          });
          if (matchedIncident) {
            const mappedSeverity = INCIDENT_SEVERITY_TO_HEATMAP[(matchedIncident.severity ?? '').toLowerCase()] ?? 'warning';
            const nowIndex = cells.findIndex((cell) => cell.timeKey === 'now');
            if (nowIndex >= 0) {
              cells[nowIndex] = {
                ...cells[nowIndex],
                severity: mappedSeverity,
                value: (matchedIncident.severity ?? '').toUpperCase() || cells[nowIndex].value,
                tooltip: matchedIncident.summary ?? cells[nowIndex].tooltip,
              };
            }
          }
          return {
            ...row,
            cells,
          };
        });
        setServiceHealth(updatedHeatmap);

        const highlights = Array.isArray((reportPayload as { highlights?: string[] })?.highlights)
          ? (reportPayload as { highlights?: string[] }).highlights!
          : fallbackWarRoom.aiReport.highlights;

        setAiReport({
          title: (reportPayload as { title?: string })?.title ?? fallbackWarRoom.aiReport.title,
          generatedAt: (reportPayload as { generated_at?: string })?.generated_at ?? fallbackWarRoom.aiReport.generatedAt,
          highlights,
        });

        setRiskPredictions(fallbackWarRoom.riskPredictions);
      } catch (err) {
        if ((err as { name?: string }).name !== 'AbortError') {
          setStats(fallbackWarRoom.stats);
          setAiReport(fallbackWarRoom.aiReport);
          setLatestIncidents(fallbackWarRoom.latestIncidents);
        setAutomationTiles(fallbackWarRoom.automationTiles);
        setRiskPredictions(fallbackWarRoom.riskPredictions);
        setServiceHealth(fallbackServiceHealth);
        setIsFallback(true);
        setError('目前顯示為內建模擬資料');
      }
    } finally {
      setLoading(false);
    }
    };

    load();
    return () => controller.abort();
  }, [refreshCounter]);

  const handleRefreshAll = useCallback(() => {
    setRefreshCounter((prev) => prev + 1);
  }, []);

  const kpiCards = useMemo(() => buildKpiCards(stats, onNavigate), [stats, onNavigate]);

  const severityTagColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'var(--brand-danger)';
      case 'warning':
        return 'var(--brand-warning)';
      default:
        return 'var(--brand-info)';
    }
  };

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <PageHeader
        title="作戰指揮中心"
        subtitle="快速掌握事件熱度、回應效率與自動化健康度"
        extra={(
          <Button icon={<ReloadOutlined />} onClick={handleRefreshAll}>
            全部重新整理
          </Button>
        )}
      />

      {isFallback && (
        <Alert
          type="info"
          showIcon
          message="目前顯示為內建模擬資料"
          description="尚未連接 /dashboard 相關 API，以下內容為示範資料。"
        />
      )}

      {error && !isFallback && (
        <Alert type="error" showIcon message="載入戰情資料失敗" description={error} />
      )}

      {loading ? (
        <div style={{ width: '100%', display: 'flex', justifyContent: 'center', marginTop: 160 }}>
          <Spin tip="正在載入 SRE 戰情室..." size="large" />
        </div>
      ) : (
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <Row gutter={[16, 16]}>
            {kpiCards.map(({ key, ...card }) => (
              <Col key={key} xs={24} sm={12} md={8}>
                <ContextualKPICard {...card} glass={false} />
              </Col>
            ))}
          </Row>

          <Card className="glass-surface" title="服務健康熱度">
            {serviceHealth.length === 0 ? (
              <Empty description="暫無服務健康資料" />
            ) : (
              <Space direction="vertical" size={12} style={{ width: '100%' }}>
                <div className="warroom-heatmap">
                  <div
                    className="warroom-heatmap__cell"
                    style={{ fontWeight: 600, justifyContent: 'flex-start', paddingLeft: 12 }}
                  >
                    服務 / 時間
                  </div>
                  {SERVICE_HEATMAP_BUCKETS.map((bucket) => (
                    <div key={`heatmap-header-${bucket.key}`} className="warroom-heatmap__cell" style={{ fontWeight: 600 }}>
                      {bucket.label}
                    </div>
                  ))}
                  {serviceHealth.map((row) => (
                    <Fragment key={row.key}>
                      <div
                        className="warroom-heatmap__cell"
                        style={{ justifyContent: 'flex-start', paddingLeft: 12 }}
                      >
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <span style={{ fontWeight: 600 }}>{row.serviceName}</span>
                          {row.owner ? (
                            <span style={{ fontSize: 11, color: 'var(--text-secondary, rgba(255, 255, 255, 0.65))' }}>
                              {row.owner}
                            </span>
                          ) : null}
                        </div>
                      </div>
                      {SERVICE_HEATMAP_BUCKETS.map((bucket) => {
                        const cell = row.cells.find((item) => item.timeKey === bucket.key) ?? {
                          timeKey: bucket.key,
                          label: bucket.label,
                          severity: 'info' as ServiceHealthSeverity,
                        };
                        const displayText = cell.value ?? getHeatmapLabel(cell.severity);
                        const tooltipText = cell.tooltip ?? `${row.serviceName} · ${bucket.label}：${displayText}`;
                        return (
                          <Tooltip key={`${row.key}-${bucket.key}`} title={tooltipText}>
                            <div
                              className="warroom-heatmap__cell"
                              style={{
                                background: getHeatmapColor(cell.severity),
                                border: '1px solid rgba(255, 255, 255, 0.08)',
                              }}
                            >
                              {displayText}
                            </div>
                          </Tooltip>
                        );
                      })}
                    </Fragment>
                  ))}
                </div>
                <Space size={[12, 6]} wrap style={{ fontSize: 12, color: 'var(--text-secondary, rgba(255, 255, 255, 0.65))' }}>
                  {heatmapLegendEntries.map(([key, meta]) => (
                    <span key={key} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                      <span
                        style={{
                          width: 10,
                          height: 10,
                          borderRadius: 4,
                          background: meta.color,
                          display: 'inline-block',
                        }}
                      />
                      {meta.label}
                    </span>
                  ))}
                </Space>
              </Space>
            )}
          </Card>

          <Card className="glass-surface" title={aiReport.title} extra={dayjs(aiReport.generatedAt).format('YYYY/MM/DD HH:mm')}>
            <List
              dataSource={aiReport.highlights}
              renderItem={(item, index) => (
                <List.Item>
                  <span dangerouslySetInnerHTML={{ __html: `${index + 1}. ${item}` }} />
                </List.Item>
              )}
            />
          </Card>

          <Row gutter={[16, 16]}>
            <Col xs={24} md={12}>
              <Card className="glass-surface" title="近期事件">
                {latestIncidents.length === 0 ? (
                  <Empty description="暫無事件" />
                ) : (
                  <List
                    dataSource={latestIncidents}
                    renderItem={(item) => (
                      <List.Item>
                        <Space direction="vertical" size={4} style={{ width: '100%' }}>
                          <Space style={{ justifyContent: 'space-between', width: '100%' }}>
                            <Text strong>{item.summary}</Text>
                            <span style={{ color: severityTagColor(item.severity) }}>{item.severity.toUpperCase()}</span>
                          </Space>
                          <Text type="secondary" style={{ fontSize: 12 }}>
                            服務：{item.service} · 更新於 {dayjs(item.updatedAt).fromNow()}
                          </Text>
                        </Space>
                      </List.Item>
                    )}
                  />
                )}
              </Card>
            </Col>

            <Col xs={24} md={12}>
              <Card className="glass-surface" title="自動化健康度">
                <Row gutter={[12, 12]}>
                  {automationTiles.map((tile) => (
                    <Col key={tile.key} xs={12}>
                      <Card
                        bordered={false}
                        style={{
                          background: 'rgba(255, 255, 255, 0.06)',
                          borderRadius: 'var(--radius-md)',
                          minHeight: 120,
                        }}
                      >
                        <Space direction="vertical" size={6}>
                          <Text strong>{tile.label}</Text>
                          <Text style={{ fontSize: 24, fontWeight: 600 }}>{tile.value}</Text>
                          <Text type="secondary" style={{ fontSize: 12 }}>
                            {tile.description}
                          </Text>
                        </Space>
                      </Card>
                    </Col>
                  ))}
                </Row>
              </Card>
            </Col>
          </Row>

          <Card className="glass-surface" title="AI 風險預測">
            {riskPredictions.length === 0 ? (
              <Empty description="目前沒有 AI 風險預測" />
            ) : (
              <List
                dataSource={riskPredictions}
                renderItem={(risk) => (
                  <List.Item>
                    <Space direction="vertical" size={4} style={{ width: '100%' }}>
                      <Space style={{ justifyContent: 'space-between', width: '100%' }}>
                        <Text strong>{risk.title}</Text>
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          風險等級：{risk.severity === 'high' ? '高' : risk.severity === 'medium' ? '中' : '低'}
                        </Text>
                      </Space>
                      <Text type="secondary" style={{ fontSize: 13 }}>{risk.description}</Text>
                    </Space>
                  </List.Item>
                )}
              />
            )}
          </Card>

          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button type="link" icon={<ArrowRightOutlined />} onClick={() => onNavigate?.('automation-center')}>
              查看自動化詳情
            </Button>
          </div>
        </Space>
      )}
    </Space>
  );
};

export default SREWarRoomPage;
