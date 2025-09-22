import React, { useState } from 'react';
import { PageHeader } from '../components/PageHeader';
import { GrafanaDashboard } from '../components/GrafanaDashboard';
import { Card, Tabs, Divider, Typography } from 'antd';
import { InfoCircleOutlined } from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;

const GrafanaTestPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('demo');

  // 不同類型的Grafana dashboard示例
  const dashboardExamples = [
    {
      key: 'demo',
      label: '您的本地 Grafana 儀表板',
      url: 'http://localhost:3000/d/aead3d54-423b-4a91-b91c-dbdf40d7fff5',
      description: '您的本地 Grafana 儀表板'
    },
    {
      key: 'sre-war-room',
      label: 'SRE 戰情室模擬',
      url: 'http://localhost:3000/d/aead3d54-423b-4a91-b91c-dbdf40d7fff5',
      description: '模擬SRE戰情室儀表板，包含系統健康度、服務狀態等'
    },
    {
      key: 'infrastructure',
      label: '基礎設施洞察模擬',
      url: 'http://localhost:3000/d/aead3d54-423b-4a91-b91c-dbdf40d7fff5',
      description: '模擬基礎設施監控儀表板，包含CPU、內存、磁盤使用率'
    }
  ];

  return (
    <div>
      <PageHeader
        title="Grafana Dashboard 嵌入測試"
        subtitle="測試在SRE平台中嵌入Grafana儀表板的各種場景"
      />

      {/* 功能說明 */}
      <Card
        style={{ marginBottom: 'var(--spacing-2xl)' }}
        size="small"
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--spacing-md)' }}>
          <InfoCircleOutlined style={{ color: 'var(--brand-primary)', fontSize: '20px', marginTop: '2px' }} />
          <div>
            <Title level={4} style={{ margin: 0, marginBottom: 'var(--spacing-xs)' }}>
              Grafana 嵌入功能說明
            </Title>
            <Paragraph>
              此頁面用於測試SRE平台中嵌入Grafana儀表板的可行性，包括：
            </Paragraph>
            <ul style={{ margin: 0, paddingLeft: 'var(--spacing-lg)' }}>
              <li>iframe嵌入Grafana公開演示儀表板</li>
              <li>主題切換（淺色/深色模式）</li>
              <li>TV模式（kiosk）切換</li>
              <li>自動刷新間隔設定</li>
              <li>全螢幕顯示功能</li>
              <li>錯誤處理和載入狀態</li>
            </ul>
          </div>
        </div>
      </Card>

      <Tabs activeKey={activeTab} onChange={setActiveTab} type="card">
        {dashboardExamples.map((example) => (
          <TabPane tab={example.label} key={example.key}>
            <div style={{ marginBottom: 'var(--spacing-md)' }}>
              <Text type="secondary">{example.description}</Text>
              <Divider style={{ margin: 'var(--spacing-sm) 0 var(--spacing-lg) 0' }} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 'var(--spacing-lg)' }}>
              {/* 基本嵌入測試 */}
              <GrafanaDashboard
                dashboardUrl={example.url}
                title={`${example.label} - 基本模式`}
                height="600px"
              />

              {/* 高級配置測試 */}
              <GrafanaDashboard
                dashboardUrl={example.url}
                title={`${example.label} - 高級配置`}
                height="700px"
                showControls={true}
              />

              {/* TV模式測試 */}
              <GrafanaDashboard
                dashboardUrl={example.url}
                title={`${example.label} - TV模式`}
                height="500px"
                showControls={false}
              />
            </div>
          </TabPane>
        ))}
      </Tabs>

      {/* 安全提醒 */}
      <Card
        size="small"
        style={{
          marginTop: 'var(--spacing-2xl)',
          border: '1px solid var(--brand-warning)',
          backgroundColor: 'rgba(255, 193, 7, 0.1)'
        }}
      >
        <Title level={5} style={{ color: 'var(--brand-warning)', margin: 0 }}>
          🔒 安全提醒
        </Title>
        <Paragraph style={{ margin: 'var(--spacing-xs) 0 0 0', fontSize: '12px' }}>
          在生產環境中嵌入Grafana儀表板時，請確保：
        </Paragraph>
        <ul style={{ margin: 0, paddingLeft: 'var(--spacing-lg)', fontSize: '12px' }}>
          <li>使用有效的認證機制（如API Token或Service Account）</li>
          <li>設置適當的CORS策略</li>
          <li>配置安全的iframe嵌入政策</li>
          <li>定期更新和監控嵌入的儀表板</li>
          <li>考慮使用Grafana的嵌入分享功能而非直接iframe</li>
        </ul>
      </Card>
    </div>
  );
};

export default GrafanaTestPage;
