import { useEffect, useMemo, useState } from 'react';
import { App as AntdApp, Card, Col, List, Row, Space, Spin, Typography } from 'antd';
import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  FireOutlined,
  ThunderboltOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons';
import { ContextualKPICard, PageHeader, StatusBadge } from '../components';
import fallbackData from '../mocks/db.json';

const { Paragraph, Text } = Typography;

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '') || '/api/v1';

type DashboardStats = {
  open_incidents: number;
  open_events: number;
  automation_success_rate: number;
  mean_time_to_ack_minutes: number;
  mean_time_to_resolve_minutes: number;
  error_budget_burn_rate: number;
  top_services?: { service: string; availability: number }[];
};

type EventSummary = {
  id: string;
  summary: string;
  severity: string;
  status: string;
  created_at?: string;
  resource?: { id?: string; name?: string };
  rule?: { id?: string; name?: string };
};

type EventsResponse = { items?: EventSummary[] } | EventSummary[];

type HomePageProps = {
  themeMode?: 'light' | 'dark';
  onNavigate?: (key: string, params?: Record<string, unknown>) => void;
};

const HomePage = ({ onNavigate }: HomePageProps) => {
  const { message } = AntdApp.useApp();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [events, setEvents] = useState<EventSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFallback, setIsFallback] = useState(false);
  const [fallbackReason, setFallbackReason] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    const applyFallback = (reason: string) => {
      setStats(fallbackData.dashboard_stats as DashboardStats);
      const fallbackEvents = Array.isArray(fallbackData.events)
        ? (fallbackData.events as EventSummary[]).slice(0, 6)
        : [];
      setEvents(fallbackEvents);
      setIsFallback(true);
      setFallbackReason(reason);
      setError('目前顯示為內建模擬資料');
    };

    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        setIsFallback(false);

        const [statsRes, eventsRes] = await Promise.all([
          fetch(`${API_BASE_URL}/dashboard/stats`, { signal: controller.signal }),
          fetch(`${API_BASE_URL}/events?page_size=6`, { signal: controller.signal }),
        ]);

        if (!statsRes.ok) {
          throw new Error('無法取得儀表板統計資料');
        }
        if (!eventsRes.ok) {
          throw new Error('無法取得事件列表');
        }

        const statsContentType = statsRes.headers.get('content-type') || '';
        const eventsContentType = eventsRes.headers.get('content-type') || '';

        if (!statsContentType.includes('application/json')) {
          throw new Error('儀表板統計資料並非 JSON 格式');
        }
        if (!eventsContentType.includes('application/json')) {
          throw new Error('事件資料並非 JSON 格式');
        }

        const statsData = (await statsRes.json()) as DashboardStats;
        const eventsData = (await eventsRes.json()) as EventsResponse;

        if (!statsData || typeof statsData !== 'object' || statsData.open_incidents === undefined) {
          throw new Error('儀表板統計資料缺少必要欄位');
        }

        const eventItems = Array.isArray(eventsData)
          ? eventsData
          : Array.isArray(eventsData.items)
            ? eventsData.items
            : [];

        setStats(statsData);
        setEvents(eventItems);
      } catch (err) {
        if ((err as { name?: string }).name !== 'AbortError') {
          const msg = err instanceof Error ? err.message : '載入資料時發生未知錯誤';
          console.warn('[HomePage] 使用 fallback 資料原因：', msg);
          applyFallback(msg);
        }
      } finally {
        setLoading(false);
      }
    };

    load();
    return () => controller.abort();
  }, []);

  useEffect(() => {
    if (isFallback) {
      message.warning('已使用內建模擬資料顯示儀表板');
    }
  }, [isFallback]);

  const highlightCards = useMemo(() => {
    if (!stats) return [];

    return [
      {
        key: 'open-incidents',
        title: '待處理事件',
        value: stats.open_incidents,
        unit: '件',
        icon: <FireOutlined style={{ fontSize: 32, color: '#ff4d4f' }} />,
        description: '點擊查看事件列表',
        onClick: () => onNavigate?.('incident-list', { statusFilter: 'firing' }),
        status: 'danger' as const,
      },
      {
        key: 'time-to-ack',
        title: '平均確認時間',
        value: stats.mean_time_to_ack_minutes,
        unit: '分鐘',
        icon: <ClockCircleOutlined style={{ fontSize: 32, color: '#faad14' }} />,
        description: '過去 24 小時平均所需時間',
        onClick: () => onNavigate?.('incident-list', { timeFilter: 'today' }),
        status: 'warning' as const,
      },
      {
        key: 'time-to-resolve',
        title: '平均解決時間',
        value: stats.mean_time_to_resolve_minutes,
        unit: '分鐘',
        icon: <CheckCircleOutlined style={{ fontSize: 32, color: '#52c41a' }} />,
        description: '包含自動化與人工處理',
        onClick: () => onNavigate?.('incident-list', { statusFilter: 'resolved' }),
        status: 'success' as const,
      },
      {
        key: 'automation-rate',
        title: '自動化成功率',
        value: Math.round(stats.automation_success_rate * 100) / 100,
        unit: '%',
        icon: <ThunderboltOutlined style={{ fontSize: 32, color: '#9254de' }} />,
        description: '過去 24 小時自動化執行成功率',
        onClick: () => onNavigate?.('automation', { subTab: 'executions' }),
        status: 'info' as const,
      },
    ];
  }, [stats, onNavigate]);

  if (loading) {
    return (
      <div style={{ width: '100%', display: 'flex', justifyContent: 'center', marginTop: 120 }}>
        <Spin tip="正在載入儀表板..." size="large" />
      </div>
    );
  }

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <PageHeader
        title="作戰指揮中心"
        subtitle="快速掌握事件熱度、回應效率與自動化健康度"
      />

      {isFallback && (
        <div className="callout callout--warning">
          <div className="callout__icon">
            <ExclamationCircleOutlined />
          </div>
          <div className="callout__body">
            <div className="callout__title">目前顯示為內建模擬資料</div>
            <div className="callout__description">
              {fallbackReason ?? '暫時無法連線至 API，資料僅供展示用途。'}
            </div>
          </div>
        </div>
      )}

      <Row gutter={[16, 16]}>
        {highlightCards.map(card => (
          <Col key={card.key} xs={24} sm={12} xl={6}>
            <ContextualKPICard
              title={card.title}
              value={card.value}
              unit={card.unit}
              description={card.description}
              icon={card.icon}
              onClick={card.onClick}
              status={card.status}
            />
          </Col>
        ))}
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={14}>
          <Card
            title="最新事件"
            extra={
              <Text type="secondary" style={{ cursor: 'pointer' }} onClick={() => onNavigate?.('incident-list')}>
                查看全部
              </Text>
            }
          >
            <List
              dataSource={events}
              locale={{ emptyText: '目前沒有新事件' }}
              renderItem={(item) => {
                const severity = item.severity?.toLowerCase() || 'info';
                return (
                  <List.Item
                    key={item.id}
                    style={{ cursor: 'pointer' }}
                    onClick={() => onNavigate?.('incident-list', { search: item.summary })}
                  >
                    <Space direction="vertical" size={0} style={{ width: '100%' }}>
                      <Space size="middle" align="start">
                        <StatusBadge
                          label={severity.toUpperCase()}
                          tone={
                            severity === 'critical'
                              ? 'danger'
                              : severity === 'warning'
                                ? 'warning'
                                : 'info'
                          }
                        />
                        <Text strong>{item.summary}</Text>
                      </Space>
                      <Space size="middle">
                        {item.resource?.name && (
                          <Text type="secondary">資源：{item.resource.name}</Text>
                        )}
                        {item.rule?.name && (
                          <Text type="secondary">規則：{item.rule.name}</Text>
                        )}
                      </Space>
                    </Space>
                  </List.Item>
                );
              }}
            />
          </Card>
        </Col>

        <Col xs={24} lg={10}>
          <Space direction="vertical" size="middle" style={{ width: '100%' }}>
            <Card title="自動化健康度">
              <Row gutter={[16, 16]}>
                <Col span={12}>
                  <ContextualKPICard
                    title="自動化成功率"
                    value={stats?.automation_success_rate ?? 0}
                    unit="%"
                    status="info"
                    description="持續維持高成功率可降低人工壓力"
                    glass={false}
                  />
                </Col>
                <Col span={12}>
                  <ContextualKPICard
                    title="錯誤預算消耗"
                    value={stats?.error_budget_burn_rate ?? 0}
                    unit="%"
                    status="warning"
                    description="建議控制在 20% 以下"
                    glass={false}
                  />
                </Col>
              </Row>
            </Card>

            <Card title="服務可用性排行榜" bodyStyle={{ paddingBottom: 0 }}>
              <List
                dataSource={stats?.top_services || []}
                renderItem={(service) => (
                  <List.Item>
                    <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                      <Text>{service.service}</Text>
                      <StatusBadge
                        label={`${service.availability.toFixed(2)}%`}
                        tone={service.availability > 99.8 ? 'success' : 'info'}
                        bordered
                      />
                    </Space>
                  </List.Item>
                )}
                locale={{ emptyText: '暫無服務統計資料' }}
              />
            </Card>
          </Space>
        </Col>
      </Row>
    </Space>
  );
};

export default HomePage;
