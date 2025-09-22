import React from 'react';
import { Space, Spin, Row, Col, Card } from 'antd';
import { PageHeader } from '../components/PageHeader';

const AnalyzingPage: React.FC<{ onNavigate?: () => void; pageKey?: string; themeMode?: string }> = ({ onNavigate: _ }) => {
  const [loading] = React.useState(false);

  if (loading) {
    return (
      <div style={{ width: '100%', display: 'flex', justifyContent: 'center', marginTop: 120 }}>
        <Spin tip="正在載入分析資料..." size="large" />
      </div>
    );
  }

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <PageHeader
        title="分析中心"
        subtitle="深入了解系統趨勢、效能瓶頸和運營數據"
        description="做出數據驅動的決策，優化系統效能。"
      />

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card title="統計指標" size="small">
            <p>數據點總數: 12,847</p>
            <p>分析報告: 3</p>
            <p>處理時間: 2.3秒</p>
            <p>準確率: 97.8%</p>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card title="分析工具" size="small">
            <p>容量規劃</p>
            <p>風險預測</p>
            <p>效能分析</p>
            <p>趨勢分析</p>
          </Card>
        </Col>
      </Row>

      <Card title="分析儀表板" style={{ height: '600px' }}>
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '500px',
          border: '2px dashed #d9d9d9',
          borderRadius: '6px'
        }}>
          <p>分析中心儀表板展示區域</p>
        </div>
      </Card>
    </Space>
  );
};

export default AnalyzingPage;
