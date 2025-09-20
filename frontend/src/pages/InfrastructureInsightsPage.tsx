import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  Button,
  Card,
  Col,
  Empty,
  List,
  Row,
  Space,
  Spin,
  Typography,
} from 'antd';
import {
  CloudServerOutlined,
  DatabaseOutlined,
  ExclamationCircleOutlined,
  NodeIndexOutlined,
  ThunderboltOutlined,
} from '@ant-design/icons';
import * as echarts from 'echarts';
import type { EChartsOption } from 'echarts';
import { ContextualKPICard, PageHeader } from '../components';
import type { ContextualKPICardProps, KPIStatus } from '../components/ContextualKPICard';
import { fetchJson } from '../utils/apiClient';
import { getChartTheme, getStatusColor } from '../utils/chartTheme';

const { Text } = Typography;

type InfrastructureStats = {
  serverCount: number;
  databaseCount: number;
  containerCount: number;
  serviceCount: number;
  serverTrend: number;
  databaseTrend: number;
  containerTrend: number;
  serviceTrend: number;
};

type ResourceUsage = {
  id: string;
  name: string;
  type: string;
  usage: number;
  status: 'healthy' | 'warning' | 'critical';
};

type RiskPrediction = {
  id: string;
  resourceName: string;
  riskLevel: 'high' | 'medium' | 'low';
  prediction: string;
  impact: string;
  recommendation: string;
};

type CriticalResource = {
  id: string;
  name: string;
  type: string;
  severity: 'critical' | 'high' | 'medium';
  issue: string;
  lastUpdate: string;
};

const fallbackInfraData = {
  stats: {
    serverCount: 127,
    databaseCount: 18,
    containerCount: 432,
    serviceCount: 89,
    serverTrend: 2,
    databaseTrend: 0,
    containerTrend: 12,
    serviceTrend: 3,
  },
  resourceUsage: [
    { id: '1', name: 'prod-web-01', type: 'Server', usage: 89, status: 'warning' as const },
    { id: '2', name: 'prod-db-master', type: 'Database', usage: 76, status: 'healthy' as const },
    { id: '3', name: 'redis-cluster-01', type: 'Cache', usage: 92, status: 'critical' as const },
    { id: '4', name: 'app-worker-pool', type: 'Service', usage: 67, status: 'healthy' as const },
    { id: '5', name: 'elasticsearch-01', type: 'Search', usage: 84, status: 'warning' as const },
    { id: '6', name: 'kafka-broker-01', type: 'Message Queue', usage: 71, status: 'healthy' as const },
  ],
  riskPredictions: [
    {
      id: 'risk-1',
      resourceName: 'prod-web-01',
      riskLevel: 'high' as const,
      prediction: 'CPU 使用率預計於 2 小時內突破 95%',
      impact: '可能導致請求回應時間增加 300%',
      recommendation: '建議立即啟動自動擴容或手動分流',
    },
    {
      id: 'risk-2',
      resourceName: 'redis-cluster-01',
      riskLevel: 'high' as const,
      prediction: '記憶體使用量將在 4 小時內達到上限',
      impact: '可能觸發 OOM 錯誤，影響快取服務',
      recommendation: '清理過期快取或增加記憶體配置',
    },
    {
      id: 'risk-3',
      resourceName: 'elasticsearch-01',
      riskLevel: 'medium' as const,
      prediction: '磁碟空間預計 24 小時內達到 90%',
      impact: '搜尋性能下降，索引寫入可能失敗',
      recommendation: '執行日誌清理或擴展儲存容量',
    },
  ],
  criticalResources: [
    {
      id: 'crit-1',
      name: 'payment-gateway',
      type: 'Service',
      severity: 'critical' as const,
      issue: '回應時間超過 5 秒',
      lastUpdate: '2025-09-19T10:30:00Z',
    },
    {
      id: 'crit-2',
      name: 'user-db-replica',
      type: 'Database',
      severity: 'high' as const,
      issue: '連線池已滿，拒絕新連線',
      lastUpdate: '2025-09-19T10:15:00Z',
    },
    {
      id: 'crit-3',
      name: 'notification-service',
      type: 'Service',
      severity: 'medium' as const,
      issue: '訊息佇列堆積超過 1000 筆',
      lastUpdate: '2025-09-19T09:45:00Z',
    },
  ],
};

export type InfrastructureInsightsPageProps = {
  onNavigate?: (key: string, params?: Record<string, unknown>) => void;
};

type InfrastructureKpiCard = {
  key: string;
} & Pick<ContextualKPICardProps, 'title' | 'value' | 'unit' | 'status' | 'description' | 'icon' | 'trendValue' | 'trendLabel' | 'onClick'>;

const InfrastructureInsightsPage = ({ onNavigate }: InfrastructureInsightsPageProps) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFallback, setIsFallback] = useState(false);
  const [stats, setStats] = useState<InfrastructureStats>(fallbackInfraData.stats);
  const [resourceUsage, setResourceUsage] = useState<ResourceUsage[]>(fallbackInfraData.resourceUsage);
  const [riskPredictions, setRiskPredictions] = useState<RiskPrediction[]>(fallbackInfraData.riskPredictions);
  const [criticalResources, setCriticalResources] = useState<CriticalResource[]>(fallbackInfraData.criticalResources);
  const usageChartRef = useRef<HTMLDivElement | null>(null);
  const chartTheme = getChartTheme();

  useEffect(() => {
    const controller = new AbortController();

    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        setIsFallback(false);

        const [statsPayload, resourcesPayload, predictionsPayload] = await Promise.all([
          fetchJson('infrastructure/stats', { signal: controller.signal }) as Promise<Record<string, unknown>>,
          fetchJson('resources?page_size=500&include_usage=true', { signal: controller.signal }) as Promise<unknown>,
          fetchJson('ai/risk-predictions', { signal: controller.signal }) as Promise<unknown>,
        ]);

        setStats({
          serverCount: Number(statsPayload?.server_count ?? fallbackInfraData.stats.serverCount),
          databaseCount: Number(statsPayload?.database_count ?? fallbackInfraData.stats.databaseCount),
          containerCount: Number(statsPayload?.container_count ?? fallbackInfraData.stats.containerCount),
          serviceCount: Number(statsPayload?.service_count ?? fallbackInfraData.stats.serviceCount),
          serverTrend: Number(statsPayload?.server_trend ?? fallbackInfraData.stats.serverTrend),
          databaseTrend: Number(statsPayload?.database_trend ?? fallbackInfraData.stats.databaseTrend),
          containerTrend: Number(statsPayload?.container_trend ?? fallbackInfraData.stats.containerTrend),
          serviceTrend: Number(statsPayload?.service_trend ?? fallbackInfraData.stats.serviceTrend),
        });

        // 處理資源使用率資料
        const resourcesContainer = (resourcesPayload && typeof resourcesPayload === 'object')
          ? (resourcesPayload as Record<string, unknown>)
          : {};
        const rawResources = Array.isArray(resourcesContainer.items)
          ? resourcesContainer.items
          : Array.isArray(resourcesContainer.data)
            ? resourcesContainer.data
            : Array.isArray(resourcesContainer.resources)
              ? resourcesContainer.resources
              : [];
        const usageData = rawResources
          .filter((item: any) => typeof item?.usage === 'number')
          .map((item: any) => {
            const usageValue = Number(item.usage ?? 0);
            const status: ResourceUsage['status'] = usageValue > 90
              ? 'critical'
              : usageValue > 75
                ? 'warning'
                : 'healthy';
            return {
              id: String(item.id ?? Math.random()),
              name: String(item.name ?? '未命名資源'),
              type: String(item.type ?? '未知類型'),
              usage: usageValue,
              status,
            } satisfies ResourceUsage;
          })
          .sort((a, b) => b.usage - a.usage)
          .slice(0, 6);

        setResourceUsage(usageData.length ? usageData : fallbackInfraData.resourceUsage);

        // 處理風險預測
        const predictionsContainer = (predictionsPayload && typeof predictionsPayload === 'object')
          ? (predictionsPayload as Record<string, unknown>)
          : {};
        const rawPredictions = Array.isArray(predictionsContainer.predictions)
          ? predictionsContainer.predictions
          : fallbackInfraData.riskPredictions;
        const normalizedPredictions = (Array.isArray(rawPredictions) ? rawPredictions : [])
          .map((item: any) => {
            const level = String(item?.riskLevel ?? item?.risk_level ?? 'medium').toLowerCase();
            const safeLevel: RiskPrediction['riskLevel'] = level === 'high' ? 'high' : level === 'low' ? 'low' : 'medium';
            return {
              id: String(item?.id ?? Math.random()),
              resourceName: String(item?.resourceName ?? item?.resource_name ?? '未知資源'),
              riskLevel: safeLevel,
              prediction: String(item?.prediction ?? item?.summary ?? '暫無預測'),
              impact: String(item?.impact ?? item?.impact_summary ?? '影響資料未提供'),
              recommendation: String(item?.recommendation ?? item?.suggestion ?? '建議稍後檢視詳細報告'),
            } satisfies RiskPrediction;
          });
        setRiskPredictions(normalizedPredictions.length ? normalizedPredictions : fallbackInfraData.riskPredictions);

        // 處理需關注資源
        const criticalData = rawResources
          .filter((item: any) => item?.status && ['critical', 'high', 'medium'].includes(String(item.status).toLowerCase()))
          .map((item: any) => {
            const severityRaw = String(item.status ?? 'medium').toLowerCase();
            const severity: CriticalResource['severity'] = severityRaw === 'critical'
              ? 'critical'
              : severityRaw === 'high'
                ? 'high'
                : 'medium';
            return {
              id: String(item.id ?? Math.random()),
              name: String(item.name ?? '未命名資源'),
              type: String(item.type ?? '未知類型'),
              severity,
              issue: String(item.issue ?? item.description ?? '需要關注'),
              lastUpdate: String(item.updated_at ?? new Date().toISOString()),
            } satisfies CriticalResource;
          })
          .slice(0, 5);

        setCriticalResources(criticalData.length ? criticalData : fallbackInfraData.criticalResources);

      } catch (err) {
        if ((err as { name?: string }).name !== 'AbortError') {
          console.warn('[InfrastructureInsights] 使用 fallback 資料', err);
          setStats(fallbackInfraData.stats);
          setResourceUsage(fallbackInfraData.resourceUsage);
          setRiskPredictions(fallbackInfraData.riskPredictions);
          setCriticalResources(fallbackInfraData.criticalResources);
          setIsFallback(true);
          setError('目前顯示為內建模擬資料');
        }
      } finally {
        setLoading(false);
      }
    };

    load();
    return () => controller.abort();
  }, []);

  const kpiCards = useMemo<InfrastructureKpiCard[]>(() => {
    const infoStatus: KPIStatus = 'info';
    const successStatus: KPIStatus = 'success';
    const containerStatus: KPIStatus = stats.containerTrend > 10 ? 'warning' : 'info';
    return [
      {
        key: 'servers',
        title: '伺服器總數',
        value: stats.serverCount,
        unit: '台',
        status: infoStatus,
        description: `實體與虛擬伺服器總計`,
        icon: <CloudServerOutlined style={{ fontSize: 28, color: chartTheme.palette.primary }} />,
        trendValue: stats.serverTrend,
        trendLabel: '較上週',
        onClick: () => onNavigate?.('resources', { type: 'server' }),
      },
      {
        key: 'databases',
        title: '資料庫數量',
        value: stats.databaseCount,
        unit: '個',
        status: successStatus,
        description: '包含主從與叢集配置',
        icon: <DatabaseOutlined style={{ fontSize: 28, color: chartTheme.palette.success }} />,
        trendValue: stats.databaseTrend,
        trendLabel: '較上週',
        onClick: () => onNavigate?.('resources', { type: 'database' }),
      },
      {
        key: 'containers',
        title: '容器數量',
        value: stats.containerCount,
        unit: '個',
        status: containerStatus,
        description: 'Docker 與 Kubernetes 容器',
        icon: <NodeIndexOutlined style={{ fontSize: 28, color: chartTheme.palette.warning }} />,
        trendValue: stats.containerTrend,
        trendLabel: '較上週',
        onClick: () => onNavigate?.('resources', { type: 'container' }),
      },
      {
        key: 'services',
        title: '服務數量',
        value: stats.serviceCount,
        unit: '個',
        status: infoStatus,
        description: '微服務與 API 端點',
        icon: <ThunderboltOutlined style={{ fontSize: 28, color: chartTheme.palette.info }} />,
        trendValue: stats.serviceTrend,
        trendLabel: '較上週',
        onClick: () => onNavigate?.('resources', { type: 'service' }),
      },
    ];
  }, [stats, onNavigate]);

  useEffect(() => {
    if (!usageChartRef.current || !resourceUsage.length) return;
    const theme = getChartTheme();
    const chart = echarts.init(usageChartRef.current);

    const option: EChartsOption = {
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
        backgroundColor: theme.tooltipBackground,
        textStyle: { color: theme.textPrimary },
        borderColor: theme.axisLine,
      },
      grid: { left: 120, right: 24, top: 20, bottom: 40 },
      xAxis: {
        type: 'value',
        max: 100,
        axisLabel: {
          formatter: '{value}%',
          color: theme.textSecondary,
        },
        splitLine: { lineStyle: { color: theme.gridLine } },
      },
      yAxis: {
        type: 'category',
        data: resourceUsage.map((resource) => resource.name),
        axisLabel: { color: theme.textPrimary },
      },
      series: [
        {
          name: '使用率',
          type: 'bar',
          data: resourceUsage.map((resource) => ({
            value: resource.usage,
            itemStyle: {
              color: resource.status === 'critical'
                ? getStatusColor('danger', theme)
                : resource.status === 'warning'
                  ? getStatusColor('warning', theme)
                  : getStatusColor('success', theme),
            },
          })),
          barWidth: '60%',
          itemStyle: {
            borderRadius: [0, 4, 4, 0],
          },
        },
      ],
    };

    chart.setOption(option);
    const handleResize = () => chart.resize();
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      chart.dispose();
    };
  }, [resourceUsage]);

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'high': return '#ff4d4f';
      case 'medium': return '#faad14';
      case 'low': return '#52c41a';
      default: return '#8c8c8c';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return '#ff4d4f';
      case 'high': return '#ff7875';
      case 'medium': return '#faad14';
      default: return '#8c8c8c';
    }
  };

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <PageHeader
        title="基礎設施洞察"
        subtitle="全面監控基礎設施狀態與風險預測"
        description="追蹤關鍵資源指標、識別潛在風險並優化資源配置。"
      />

      {isFallback && (
        <Alert
          type="info"
          showIcon
          message="目前顯示為內建模擬資料"
          description="無法取得即時基礎設施資料，以下內容為靜態樣本。"
        />
      )}

      {loading ? (
        <div style={{ width: '100%', display: 'flex', justifyContent: 'center', marginTop: 120 }}>
          <Spin tip="正在載入基礎設施洞察..." size="large" />
        </div>
      ) : (
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          {error && !isFallback && (
            <Alert showIcon type="error" message="無法載入基礎設施資料" description={error} />
          )}

          {/* KPI 指標卡片 */}
          <Row gutter={[16, 16]}>
            {kpiCards.map((card) => {
              const { key, ...cardProps } = card;
              return (
                <Col key={key} xs={24} sm={12} xl={6}>
                  <ContextualKPICard {...cardProps} />
                </Col>
              );
            })}
          </Row>

          <Row gutter={[16, 16]}>
            {/* 資源使用率排行 */}
            <Col xs={24} xl={14}>
              <Card className="glass-surface" title="資源使用率排行">
                {resourceUsage.length === 0 ? (
                  <Empty description="暫無資源使用率資料" />
                ) : (
                  <>
                    <div ref={usageChartRef} style={{ width: '100%', height: 280 }} />
                    <Space direction="vertical" size={8} style={{ width: '100%', marginTop: 16 }}>
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        顯示使用率最高的 {resourceUsage.length} 個資源
                      </Text>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          <div style={{ width: 12, height: 12, backgroundColor: '#52c41a', borderRadius: 2 }} />
                          <Text type="secondary">健康 (&lt;75%)</Text>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          <div style={{ width: 12, height: 12, backgroundColor: '#faad14', borderRadius: 2 }} />
                          <Text type="secondary">警告 (75-90%)</Text>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          <div style={{ width: 12, height: 12, backgroundColor: '#ff4d4f', borderRadius: 2 }} />
                          <Text type="secondary">嚴重 (&gt;90%)</Text>
                        </div>
                      </div>
                    </Space>
                  </>
                )}
              </Card>
            </Col>

            {/* AI 風險預測 */}
            <Col xs={24} xl={10}>
              <Card className="glass-surface" title="AI 風險預測">
                {riskPredictions.length === 0 ? (
                  <Empty description="暫無風險預測資料" />
                ) : (
                  <List
                    dataSource={riskPredictions}
                    renderItem={(risk) => (
                      <List.Item>
                        <Space direction="vertical" size={8} style={{ width: '100%' }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                            <Text strong>{risk.resourceName}</Text>
                            <div
                              style={{
                                padding: '2px 8px',
                                borderRadius: 12,
                                backgroundColor: `${getRiskColor(risk.riskLevel)}20`,
                                color: getRiskColor(risk.riskLevel),
                                fontSize: 12,
                                fontWeight: 500,
                              }}
                            >
                              {risk.riskLevel === 'high' ? '高風險' :
                                risk.riskLevel === 'medium' ? '中風險' : '低風險'}
                            </div>
                          </div>
                          <Text type="secondary" style={{ fontSize: 13 }}>
                            {risk.prediction}
                          </Text>
                          <Text type="secondary" style={{ fontSize: 12 }}>
                            建議：{risk.recommendation}
                          </Text>
                        </Space>
                      </List.Item>
                    )}
                  />
                )}
              </Card>
            </Col>
          </Row>

          {/* 需關注的資源 */}
          <Card
            className="glass-surface"
            title="需關注的資源"
            extra={
              <Button type="link" onClick={() => onNavigate?.('resources', { status: 'critical' })}>
                查看全部
              </Button>
            }
          >
            {criticalResources.length === 0 ? (
              <Empty description="目前沒有需要關注的資源" />
            ) : (
              <List
                itemLayout="horizontal"
                dataSource={criticalResources}
                renderItem={(resource) => (
                  <List.Item
                    actions={[
                      <Button key="detail" type="link" onClick={() => onNavigate?.('resources', { focus: resource.id })}>
                        檢視詳情
                      </Button>,
                    ]}
                  >
                    <List.Item.Meta
                      avatar={
                        <ExclamationCircleOutlined
                          style={{
                            fontSize: 20,
                            color: getSeverityColor(resource.severity)
                          }}
                        />
                      }
                      title={
                        <Space size={8}>
                          <Text strong>{resource.name}</Text>
                          <Text type="secondary" style={{ fontSize: 12 }}>
                            ({resource.type})
                          </Text>
                        </Space>
                      }
                      description={
                        <Space direction="vertical" size={4}>
                          <Text type="secondary">{resource.issue}</Text>
                          <Text type="secondary" style={{ fontSize: 12 }}>
                            最後更新：{new Date(resource.lastUpdate).toLocaleString()}
                          </Text>
                        </Space>
                      }
                    />
                  </List.Item>
                )}
              />
            )}
          </Card>
        </Space>
      )}
    </Space>
  );
};

export default InfrastructureInsightsPage;
