import React from 'react'
import { Card, Row, Col, Typography, Space, Tag, Progress } from 'antd'
import { PageHeader } from '../components/PageHeader'
import { ContextualKPICard } from '../components/ContextualKPICard'
import { ToolbarActions } from '../components/ToolbarActions'
import {
  ShareAltOutlined,
  ZoomInOutlined,
  ZoomOutOutlined,
  RotateLeftOutlined,
  DownloadOutlined,
  FullscreenOutlined,
} from '@ant-design/icons'

const { Title, Text } = Typography

const ResourceTopologyPage: React.FC = () => {
  const handleSearch = (value: string) => {
    console.log('搜尋拓撲節點:', value)
  }
  const kpiData = [
    {
      title: '拓撲節點數',
      value: '156',
      description: '包含所有資源節點',
      status: 'info' as const,
    },
    {
      title: '連接數量',
      value: '324',
      description: '節點間連接關係',
      trend: '+12',
      status: 'success' as const,
    },
    {
      title: '異常連接',
      value: '3',
      description: '需要關注的連接',
      status: 'warning' as const,
    },
    {
      title: '拓撲深度',
      value: '6層',
      description: '最深依賴層級',
      status: 'info' as const,
    },
  ]

  const topologyNodes = [
    {
      id: 'web-01',
      name: 'Web Server 01',
      type: 'web',
      status: '正常',
      cpu: 45,
      memory: 62,
      connections: ['lb-01', 'api-01', 'cache-01'],
    },
    {
      id: 'web-02',
      name: 'Web Server 02',
      type: 'web',
      status: '正常',
      cpu: 38,
      memory: 55,
      connections: ['lb-01', 'api-01', 'cache-01'],
    },
    {
      id: 'lb-01',
      name: 'Load Balancer',
      type: 'loadbalancer',
      status: '正常',
      cpu: 22,
      memory: 34,
      connections: ['web-01', 'web-02', 'api-01'],
    },
    {
      id: 'api-01',
      name: 'API Gateway',
      type: 'api',
      status: '警告',
      cpu: 78,
      memory: 85,
      connections: ['web-01', 'web-02', 'db-01', 'cache-01'],
    },
    {
      id: 'db-01',
      name: 'Database Primary',
      type: 'database',
      status: '正常',
      cpu: 65,
      memory: 72,
      connections: ['api-01', 'cache-01'],
    },
    {
      id: 'cache-01',
      name: 'Redis Cache',
      type: 'cache',
      status: '正常',
      cpu: 32,
      memory: 45,
      connections: ['web-01', 'web-02', 'api-01', 'db-01'],
    },
  ]


  const getTypeColor = (type: string) => {
    switch (type) {
      case 'web':
        return '#1890ff'
      case 'loadbalancer':
        return '#52c41a'
      case 'api':
        return '#faad14'
      case 'database':
        return '#722ed1'
      case 'cache':
        return '#eb2f96'
      default:
        return '#8c8c8c'
    }
  }

  return (
    <div>
      <PageHeader
        title="拓撲視圖"
        subtitle="視覺化資源依賴關係和連接狀態"
      />

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 'var(--spacing-lg)',
          marginBottom: 'var(--spacing-2xl)',
        }}
      >
        {kpiData.map((item, index) => (
          <ContextualKPICard
            key={index}
            title={item.title}
            value={item.value}
            description={item.description}
            trend={item.trend}
            status={item.status}
          />
        ))}
      </div>

      <ToolbarActions
        onRefresh={() => console.log('刷新拓撲視圖')}
        onSearch={handleSearch}
        searchPlaceholder="搜尋節點名稱或IP..."
        actions={[
          {
            key: 'zoomIn',
            label: '放大',
            icon: <ZoomInOutlined />,
            tooltip: '放大拓撲視圖',
          },
          {
            key: 'zoomOut',
            label: '縮小',
            icon: <ZoomOutOutlined />,
            tooltip: '縮小拓撲視圖',
          },
          {
            key: 'reset',
            label: '重置',
            icon: <RotateLeftOutlined />,
            tooltip: '重置視圖位置',
          },
          {
            key: 'fullscreen',
            label: '全屏',
            icon: <FullscreenOutlined />,
            tooltip: '全屏顯示',
          },
          {
            key: 'topology-export',
            label: '匯出',
            icon: <DownloadOutlined />,
            tooltip: '匯出拓撲圖',
          },
          {
            key: 'share',
            label: '分享',
            icon: <ShareAltOutlined />,
            tooltip: '分享拓撲視圖',
          },
        ]}
      />

      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Card
            title="系統拓撲結構"
            size="small"
            style={{
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border-light)',
            }}
            extra={
              <Space>
                <Tag color="blue">自動佈局</Tag>
                <Tag color="green">即時更新</Tag>
              </Space>
            }
          >
            <div style={{ textAlign: 'center', padding: 'var(--spacing-3xl)' }}>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: 'var(--spacing-lg)',
                maxWidth: '800px',
                margin: '0 auto',
              }}>
                {topologyNodes.map((node) => (
                  <Card
                    key={node.id}
                    size="small"
                    style={{
                      background: 'var(--bg-container)',
                      border: '1px solid var(--border-light)',
                    }}
                  >
                    <Space direction="vertical" style={{ width: '100%' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{
                          width: '12px',
                          height: '12px',
                          borderRadius: '50%',
                          background: getTypeColor(node.type),
                        }} />
                        <Tag
                          color={node.status === '正常' ? 'success' : node.status === '警告' ? 'warning' : 'error'}
                        >
                          {node.status}
                        </Tag>
                      </div>
                      <Title level={5} style={{ margin: 0, color: 'var(--text-primary)' }}>
                        {node.name}
                      </Title>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-xs)' }}>
                        <div>
                          <Text style={{ fontSize: '10px', color: 'var(--text-tertiary)' }}>CPU</Text>
                          <Progress
                            percent={node.cpu}
                            size="small"
                            status={node.cpu > 80 ? 'exception' : node.cpu > 60 ? 'normal' : 'success'}
                            strokeColor={node.cpu > 80 ? '#ff4d4f' : node.cpu > 60 ? '#faad14' : '#52c41a'}
                            style={{ width: '100%' }}
                          />
                        </div>
                        <div>
                          <Text style={{ fontSize: '10px', color: 'var(--text-tertiary)' }}>記憶體</Text>
                          <Progress
                            percent={node.memory}
                            size="small"
                            status={node.memory > 80 ? 'exception' : node.memory > 60 ? 'normal' : 'success'}
                            strokeColor={node.memory > 80 ? '#ff4d4f' : node.memory > 60 ? '#faad14' : '#52c41a'}
                            style={{ width: '100%' }}
                          />
                        </div>
                      </div>
                      <Text style={{ fontSize: '10px', color: 'var(--text-tertiary)' }}>
                        連接: {node.connections.length} 個節點
                      </Text>
                    </Space>
                  </Card>
                ))}
              </div>
              <div style={{ marginTop: 'var(--spacing-xl)', padding: 'var(--spacing-lg)' }}>
                <Text style={{ color: 'var(--text-secondary)' }}>
                  🔗 拓撲視圖 (開發中)
                </Text>
                <br />
                <Text
                  type="secondary"
                  style={{ fontSize: '12px', marginTop: 'var(--spacing-sm)' }}
                >
                  此處將顯示互動式的拓撲視圖，包含節點狀態、連接關係和即時監控數據
                </Text>
              </div>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  )
}

export default ResourceTopologyPage
