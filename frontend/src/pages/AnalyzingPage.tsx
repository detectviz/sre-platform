import { useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import {
  BarChartOutlined,
  DollarOutlined,
  FieldTimeOutlined,
  FileDoneOutlined,
  FileTextOutlined,
  LineChartOutlined,
  PieChartOutlined,
  ThunderboltOutlined,
  SaveOutlined,
} from '@ant-design/icons';
import { Alert, Col, Row, Space, Tabs, Select as AntdSelect, Card, Empty, Button, Progress, Typography } from 'antd';
import type { TabsProps } from 'antd';
import { ContextualKPICard, PageHeader } from '../components';
import { useCapacityPlanning } from '../hooks/useCapacityPlanning';
import { ForecastChart } from './capacity-planning/ForecastChart';

const { Title, Text } = Typography;

type AnalyzingPageProps = {
  onNavigate?: (key: string) => void;
  pageKey: string;
  themeMode?: 'light' | 'dark';
};

const stats = {
  totalDataPoints: 15420,
  analysisReports: 28,
  avgProcessingTime: 3.2,
  accuracyRate: 96.8,
};

const placeholder = (title: string, subtitle: string, icon: ReactNode) => (
  <Alert
    type="info"
    showIcon
    message={
      <Space>
        {icon}
        <span>{title}</span>
      </Space>
    }
    description={subtitle}
  />
);

// 容量規劃內容組件
const CapacityPlanningContent = () => {
  const [selectedService, setSelectedService] = useState<string | null>('service-a');
  const { data, loading, error, services } = useCapacityPlanning(selectedService);

  const handleServiceChange = (value: string) => {
    setSelectedService(value);
  };

  const renderContent = () => {
    if (loading) {
      return null; // Charts have their own loading spinners
    }

    if (error) {
      return <Alert message="讀取容量規劃資料時發生錯誤" description={error.message} type="error" showIcon />;
    }

    if (!selectedService) {
      return (
        <Empty
          image={<PieChartOutlined style={{ fontSize: 60, color: 'var(--sre-text-color-secondary)' }} />}
          description={
            <Space direction="vertical" align="center">
              <Title level={5}>請選擇一個服務以開始</Title>
              <Text>選擇一個服務以查看其資源使用趨勢與容量預測。</Text>
            </Space>
          }
        />
      );
    }

    if (!data) {
      return <Empty description="找不到所選服務的資料" />;
    }

    return (
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <Row gutter={[24, 24]}>
          <Col xs={24} md={8}>
            <Card>
              <ForecastChart title="CPU 使用率預測" data={data.cpu} loading={loading} />
              <Alert message={data.cpu.recommendation} type="warning" showIcon style={{ marginTop: 16 }} />
            </Card>
          </Col>
          <Col xs={24} md={8}>
            <Card>
              <ForecastChart title="記憶體使用率預測" data={data.memory} loading={loading} />
              <Alert message={data.memory.recommendation} type="info" showIcon style={{ marginTop: 16 }} />
            </Card>
          </Col>
          <Col xs={24} md={8}>
            <Card>
              <ForecastChart title="磁碟使用率預測" data={data.disk} loading={loading} />
              <Alert message={data.disk.recommendation} type="error" showIcon style={{ marginTop: 16 }} />
            </Card>
          </Col>
        </Row>

        <Row gutter={[24, 24]}>
          <Col xs={24} md={12}>
            <Card title="資源使用統計">
              <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                <div>
                  <Text strong>CPU 使用率</Text>
                  <Progress percent={data.cpu.usage[data.cpu.usage.length - 1]} status={data.cpu.usage[data.cpu.usage.length - 1] > data.cpu.limit ? 'exception' : 'active'} />
                </div>
                <div>
                  <Text strong>記憶體使用率</Text>
                  <Progress percent={data.memory.usage[data.memory.usage.length - 1]} status={data.memory.usage[data.memory.usage.length - 1] > data.memory.limit ? 'exception' : 'active'} />
                </div>
                <div>
                  <Text strong>磁碟使用率</Text>
                  <Progress percent={data.disk.usage[data.disk.usage.length - 1]} status={data.disk.usage[data.disk.usage.length - 1] > data.disk.limit ? 'exception' : 'active'} />
                </div>
              </Space>
            </Card>
          </Col>
          <Col xs={24} md={12}>
            <Card title="容量建議">
              <Space direction="vertical" size="middle">
                <Alert
                  message="服務容量分析"
                  description={`目前負載: ${data.capacityAnalysis.currentLoad} RPS / 容量上限: ${data.capacityAnalysis.capacityLimit} RPS。瓶頸: ${data.capacityAnalysis.bottleneck}`}
                  type="warning"
                  showIcon
                />
                <div>
                  <Text strong>擴容建議：</Text>
                  <ul>
                    {data.capacityAnalysis.suggestions.map((suggestion: string, i: number) => (
                      <li key={i}>{suggestion}</li>
                    ))}
                  </ul>
                </div>
                <Button type="primary" icon={<SaveOutlined />}>
                  生成擴展計劃
                </Button>
              </Space>
            </Card>
          </Col>
        </Row>
      </Space>
    );
  };

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <div>
        <Title level={4}>服務選擇</Title>
        <AntdSelect
          value={selectedService}
          onChange={handleServiceChange}
          style={{ width: 300 }}
          placeholder="選擇要分析的服務"
        >
          {services.map((service) => (
            <AntdSelect.Option key={service.id} value={service.id}>
              {service.name}
            </AntdSelect.Option>
          ))}
        </AntdSelect>
      </div>
      {renderContent()}
    </Space>
  );
};

const AnalyzingPage = ({ onNavigate: _onNavigate, pageKey }: AnalyzingPageProps) => {
  const [activeTab, setActiveTab] = useState(pageKey || 'capacity-planning');

  const handleTabChange = (key: string) => {
    setActiveTab(key);
  };
  const tabItems: TabsProps['items'] = useMemo(() => [
    {
      key: 'capacity-planning',
      label: (
        <span>
          <PieChartOutlined /> 容量規劃
        </span>
      ),
      children: <CapacityPlanningContent />,
    },
    {
      key: 'performance-insights',
      label: (
        <span>
          <ThunderboltOutlined /> 性能洞察
        </span>
      ),
      children: placeholder('性能洞察', '深入分析系統性能瓶頸，提供智能優化建議。', <ThunderboltOutlined />),
    },
    {
      key: 'incident-trends',
      label: (
        <span>
          <LineChartOutlined /> 事件趨勢
        </span>
      ),
      children: placeholder('事件趨勢分析', '分析事件發生模式，識別重複問題和根本原因。', <LineChartOutlined />),
    },
    {
      key: 'cost-analysis',
      label: (
        <span>
          <DollarOutlined /> 成本分析
        </span>
      ),
      children: placeholder('成本分析', '追蹤資源使用成本，識別成本節約機會。', <DollarOutlined />),
    },
    {
      key: 'mttr-analysis',
      label: (
        <span>
          <FieldTimeOutlined /> MTTR 分析
        </span>
      ),
      children: placeholder('MTTR 分析', '追蹤平均修復時間，找出效率改善機會。', <FieldTimeOutlined />),
    },
    {
      key: 'sla-reports',
      label: (
        <span>
          <FileDoneOutlined /> SLA 報告
        </span>
      ),
      children: placeholder('SLA 報告', '追蹤服務級別協議的達成情況和趨勢分析。', <FileDoneOutlined />),
    },
  ], []);

  const activeKey = activeTab;

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <PageHeader
        title="分析中心"
        subtitle="深入了解系統趨勢、效能瓶頸與運營數據，做出數據驅動的決策"
      />

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={6}>
          <ContextualKPICard
            title="數據點總數"
            value={stats.totalDataPoints.toLocaleString()}
            unit="個"
            status="info"
            description="過去 24 小時收集"
            icon={<LineChartOutlined />}
          />
        </Col>
        <Col xs={24} sm={12} md={6}>
          <ContextualKPICard
            title="分析報告"
            value={stats.analysisReports}
            unit="份"
            status="info"
            description="本月生成報告"
            icon={<FileTextOutlined />}
          />
        </Col>
        <Col xs={24} sm={12} md={6}>
          <ContextualKPICard
            title="處理時間"
            value={stats.avgProcessingTime}
            unit="秒"
            status="success"
            description="平均分析處理時間"
            icon={<FieldTimeOutlined />}
          />
        </Col>
        <Col xs={24} sm={12} md={6}>
          <ContextualKPICard
            title="準確率"
            value={stats.accuracyRate}
            unit="%"
            status="success"
            description="AI 預測準確率"
            icon={<BarChartOutlined />}
          />
        </Col>
      </Row>

      <Tabs items={tabItems} activeKey={activeKey} onChange={handleTabChange} />
    </Space>
  );
};

export default AnalyzingPage;
