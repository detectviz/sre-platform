import { useMemo } from 'react';
import {
  ApartmentOutlined,
  BarChartOutlined,
  DollarOutlined,
  FieldTimeOutlined,
  FileDoneOutlined,
  FileTextOutlined,
  LineChartOutlined,
  PieChartOutlined,
  ThunderboltOutlined,
} from '@ant-design/icons';
import { Alert, Col, Row, Space, Tabs } from 'antd';
import type { TabsProps } from 'antd';
import { ContextualKPICard, PageHeader } from '../components';

type AnalyzingPageProps = {
  onNavigate: (key: string) => void;
  pageKey: string;
  themeMode?: 'light' | 'dark';
};

const stats = {
  totalDataPoints: 15420,
  analysisReports: 28,
  avgProcessingTime: 3.2,
  accuracyRate: 96.8,
};

const placeholder = (title: string, subtitle: string, icon: JSX.Element) => (
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

const AnalyzingPage = ({ onNavigate, pageKey }: AnalyzingPageProps) => {
  const tabItems: TabsProps['items'] = useMemo(() => [
    {
      key: 'capacity-planning',
      label: (
        <span>
          <PieChartOutlined /> 容量規劃
        </span>
      ),
      children: placeholder('容量規劃', '評估資源容量與趨勢，提供調整建議。', <ApartmentOutlined />),
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

  const activeKey = tabItems.some((item) => item?.key === pageKey) ? pageKey : 'capacity-planning';

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

      <Tabs items={tabItems} activeKey={activeKey} onChange={(key) => onNavigate(key)} />
    </Space>
  );
};

export default AnalyzingPage;
