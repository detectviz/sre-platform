import React from 'react';
import { Row, Col, Typography, Alert } from 'antd';
import { useGetDashboardSummaryQuery, useGetResourceDistributionQuery } from '../services/dashboardApi';

// 匯入我們建立的展示型元件
import SummaryCard from '../features/dashboard/components/SummaryCard';
import KpiCard from '../features/dashboard/components/KpiCard';
import ResourceGroupChart from '../features/dashboard/components/ResourceGroupChart';
import ResourceStatusChart from '../features/dashboard/components/ResourceStatusChart';

// 匯入圖示
import { CheckCircleOutlined, HddOutlined, FieldTimeOutlined } from '@ant-design/icons';

const { Title } = Typography;

/**
 * 總覽儀表板頁面
 * 這是使用者登入後看到的第一個頁面，用於展示系統的整體健康狀況。
 */
const DashboardPage: React.FC = () => {
  // 使用 RTK Query hooks 獲取數據
  const { data: summaryData, error: summaryError, isLoading: summaryLoading } = useGetDashboardSummaryQuery();
  const { data: distData, error: distError, isLoading: distLoading } = useGetResourceDistributionQuery();

  // 處理 API 錯誤
  if (summaryError || distError) {
    return <Alert message="錯誤" description="無法載入儀表板數據，請稍後再試。" type="error" showIcon />;
  }

  return (
    <div>
      <Title level={2} style={{ marginBottom: '24px' }}>總覽儀表板</Title>

      {/* 第一排：狀態趨勢卡片 */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={8}>
          <SummaryCard
            title="新告警 (New)"
            value={summaryData?.alerts?.new ?? 0}
            trend={11} // 暫時使用假數據，API spec 中沒有直接對應
            loading={summaryLoading}
          />
        </Col>
        <Col xs={24} sm={12} md={8}>
          <SummaryCard
            title="處理中 (In Progress)"
            value={summaryData?.alerts?.processing ?? 0}
            trend={6} // 暫時使用假數據
            loading={summaryLoading}
          />
        </Col>
        <Col xs={24} sm={12} md={8}>
          <SummaryCard
            title="今日已解決 (Resolved Today)"
            value={summaryData?.alerts?.resolved_today ?? 0}
            trend={0} // 暫時使用假數據
            loading={summaryLoading}
          />
        </Col>
      </Row>

      {/* 第二排：關鍵績效指標 */}
      <Row gutter={[16, 16]} style={{ marginTop: '24px' }}>
        <Col xs={24} sm={12} md={8}>
          <KpiCard
            icon={<CheckCircleOutlined />}
            title="資源妥善率"
            value={summaryData?.kpis?.availability ?? 0}
            unit="%"
            loading={summaryLoading}
          />
        </Col>
        <Col xs={24} sm={12} md={8}>
          <KpiCard
            icon={<HddOutlined />}
            title="總資源數"
            value={summaryData?.resources?.total ?? 0}
            loading={summaryLoading}
          />
        </Col>
        <Col xs={24} sm={12} md={8}>
          <KpiCard
            icon={<FieldTimeOutlined />}
            title="平均網路延遲"
            value={23} // 假數據，API spec 中沒有
            unit="ms"
            loading={summaryLoading}
          />
        </Col>
      </Row>

      {/* 第三排：圖表 */}
      <Row gutter={[16, 16]} style={{ marginTop: '24px' }}>
        <Col xs={24} lg={16}>
            <Title level={4}>資源群組狀態總覽</Title>
            <ResourceGroupChart chartData={distData?.by_group} loading={distLoading} />
        </Col>
        <Col xs={24} lg={8}>
            <Title level={4}>資源狀態分佈</Title>
            <ResourceStatusChart chartData={distData?.by_status} loading={distLoading} />
        </Col>
      </Row>
    </div>
  );
};

export default DashboardPage;
