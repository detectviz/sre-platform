import React from 'react';
import { Space, Spin, Row, Col, Card } from 'antd';
import { PageHeader } from '../components/PageHeader';

const ResourceTopologyPage: React.FC<{ onNavigate?: () => void }> = ({ onNavigate: _ }) => {
  const [loading] = React.useState(false);

  if (loading) {
    return (
      <div style={{ width: '100%', display: 'flex', justifyContent: 'center', marginTop: 120 }}>
        <Spin tip="正在載入拓撲視圖資料..." size="large" />
      </div>
    );
  }

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <PageHeader
        title="拓撲視圖"
        subtitle="基礎設施資源的視覺化展示"
        description="顯示資源之間的依賴關係和連接狀況。"
      />

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card title="資源統計" size="small">
            <p>節點總數: 0</p>
            <p>連線數: 0</p>
            <p>異常節點: 0</p>
            <p>健康度: 100%</p>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card title="視圖控制" size="small">
            <p>縮放控制</p>
            <p>布局切換</p>
            <p>過濾器</p>
          </Card>
        </Col>
      </Row>

      <Card title="拓撲圖" style={{ height: '600px' }}>
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '500px',
          border: '2px dashed #d9d9d9',
          borderRadius: '6px'
        }}>
          <p>拓撲圖展示區域</p>
        </div>
      </Card>
    </Space>
  );
};

export default ResourceTopologyPage;
