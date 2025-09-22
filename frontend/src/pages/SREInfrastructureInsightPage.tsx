import React from 'react'
import { Typography, Card, Space, Table, Tag, Progress } from 'antd'

interface ResourceData {
  key: string
  name: string
  cpu: number
  memory: number
  status: string
  trend: string
}
import { PageHeader } from '../components/PageHeader'
import { ContextualKPICard } from '../components/ContextualKPICard'
import { ToolbarActions } from '../components/ToolbarActions'
import {
  DesktopOutlined,
  BarChartOutlined,
  EyeOutlined,
  AlertOutlined,
  ExclamationCircleOutlined,
  UpOutlined,
  DownOutlined,
} from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'

const { Title, Text } = Typography

const SREInfrastructureInsightPage: React.FC = () => {
  const handleSearch = (value: string) => {
    console.log('搜尋基礎設施:', value)
  }


  // 資源列表表格列定義
  const resourceColumns: ColumnsType<ResourceData> = [
    {
      title: '資源名稱',
      dataIndex: 'name',
      key: 'name',
      sorter: true,
      render: (text: string, record: ResourceData) => (
        <Space>
          <div style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            background: record.status === 'healthy' ? '#52c41a' :
              record.status === 'warning' ? '#faad14' : '#ff4d4f',
          }} />
          <Text style={{ color: 'var(--text-primary)' }}>{text}</Text>
        </Space>
      ),
    },
    {
      title: 'CPU 使用率',
      dataIndex: 'cpu',
      key: 'cpu',
      render: (cpu: number) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Progress
            percent={cpu}
            showInfo={false}
            strokeColor={cpu > 80 ? '#ff4d4f' : cpu > 50 ? '#faad14' : '#52c41a'}
            size="small"
            style={{ width: '60px' }}
          />
          <Text style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{cpu}%</Text>
        </div>
      ),
    },
    {
      title: '記憶體使用率',
      dataIndex: 'memory',
      key: 'memory',
      render: (memory: number) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Progress
            percent={memory}
            showInfo={false}
            strokeColor={memory > 80 ? '#ff4d4f' : memory > 50 ? '#faad14' : '#52c41a'}
            size="small"
            style={{ width: '60px' }}
          />
          <Text style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{memory}%</Text>
        </div>
      ),
    },
    {
      title: '趨勢',
      dataIndex: 'trend',
      key: 'trend',
      render: (trend: string) => (
        <Space>
          {trend === 'up' && <UpOutlined style={{ color: '#ff4d4f' }} />}
          {trend === 'down' && <DownOutlined style={{ color: '#52c41a' }} />}
          {trend === 'stable' && <div style={{ width: '12px' }} />}
        </Space>
      ),
    },
  ]

  // 資源列表數據
  const resourceData = [
    {
      key: '1',
      name: 'web-prod-1',
      cpu: 95,
      memory: 87,
      status: 'warning',
      trend: 'up',
    },
    {
      key: '2',
      name: 'web-prod-2',
      cpu: 93,
      memory: 89,
      status: 'warning',
      trend: 'up',
    },
    {
      key: '3',
      name: 'web-prod-3',
      cpu: 91,
      memory: 85,
      status: 'warning',
      trend: 'stable',
    },
    {
      key: '4',
      name: 'web-prod-4',
      cpu: 89,
      memory: 82,
      status: 'warning',
      trend: 'down',
    },
    {
      key: '5',
      name: 'web-prod-5',
      cpu: 87,
      memory: 80,
      status: 'warning',
      trend: 'down',
    },
    {
      key: '6',
      name: 'db-prod-1',
      cpu: 85,
      memory: 78,
      status: 'warning',
      trend: 'stable',
    },
    {
      key: '7',
      name: 'api-gateway-1',
      cpu: 83,
      memory: 75,
      status: 'healthy',
      trend: 'up',
    },
    {
      key: '8',
      name: 'cache-redis-1',
      cpu: 81,
      memory: 72,
      status: 'healthy',
      trend: 'down',
    },
  ]

  // AI風險預測數據
  const aiRiskData = [
    {
      key: '1',
      resource: 'web-prod-01',
      risk: '高風險',
      description: 'CPU 使用率持續上升，預計 2 小時內達 90%',
      severity: 'high',
    },
    {
      key: '2',
      resource: 'api-gateway-01',
      risk: '高風險',
      description: '錯誤記憶體緩衝區增加，錯誤率上升趨勢',
      severity: 'high',
    },
    {
      key: '3',
      resource: 'db-prod-02',
      risk: '中風險',
      description: '磁碟空間剩餘不足 15%，建議清理',
      severity: 'medium',
    },
  ]

  // 需關注的資源數據
  const alertResourceData = [
    {
      key: '1',
      resource: 'api-gateway-prod',
      status: 'CRITICAL',
      count: 2,
      severity: 'critical',
    },
    {
      key: '2',
      resource: 'web-prod-02',
      status: 'WARNING',
      count: 1,
      severity: 'warning',
    },
  ]

  const kpiData = [
    {
      title: '伺服器總數',
      value: '47 台',
      description: '實體與虛擬伺服器',
      trend: 'stable',
      status: 'info' as const,
    },
    {
      title: '資料庫',
      value: '12 個',
      description: '各類型資料庫實例',
      trend: 'stable',
      status: 'success' as const,
    },
    {
      title: '容器',
      value: '156 個',
      description: '運行中的容器實例',
      trend: 'up',
      status: 'info' as const,
    },
    {
      title: '服務',
      value: '23 個',
      description: '註冊的微服務',
      trend: 'stable',
      status: 'success' as const,
    },
  ]

  return (
    <div>
      <PageHeader
        title="基礎設施洞察"
        subtitle="深入分析基礎設施效能和資源利用狀況"
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
        onRefresh={() => console.log('刷新基礎設施洞察')}
        onSearch={handleSearch}
        searchPlaceholder="搜尋資源或指標..."
        actions={[
          {
            key: 'topology',
            label: '拓撲視圖',
            icon: <DesktopOutlined />,
            tooltip: '查看拓撲視圖',
          },
          {
            key: 'capacity',
            label: '容量規劃',
            icon: <BarChartOutlined />,
            tooltip: '容量規劃分析',
          },
          {
            key: 'detailed-search',
            label: '詳細搜尋',
            icon: <EyeOutlined />,
            tooltip: '詳細搜尋',
          },
        ]}
      />

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 'var(--spacing-xl)' }}>
        {/* 左側：資源列表總覽 */}
        <Card
          size="small"
          style={{
            background: 'var(--bg-elevated)',
            border: '1px solid var(--border-light)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-lg)' }}>
            <Title level={5} style={{ margin: 0, color: 'var(--text-primary)' }}>
              資源列表總覽
            </Title>
            <Text style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>
              3/4 個資源
            </Text>
          </div>
          <Table
            columns={resourceColumns}
            dataSource={resourceData}
            size="small"
            pagination={{
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) => `第 ${range[0]}-${range[1]} 項，共 ${total} 項`,
            }}
            style={{
              background: 'transparent',
            }}
          />
        </Card>

        {/* 右側：AI風險預測和需關注資源 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-lg)' }}>
          {/* AI風險預測 */}
          <Card
            size="small"
            style={{
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border-light)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-lg)' }}>
              <Title level={5} style={{ margin: 0, color: 'var(--text-primary)' }}>
                <AlertOutlined style={{ marginRight: '8px', color: 'var(--brand-warning)' }} />
                AI 風險預測
              </Title>
              <Text style={{
                color: 'var(--brand-danger)',
                fontSize: '12px',
                background: 'var(--bg-container)',
                padding: '2px 6px',
                borderRadius: '4px'
              }}>
                3
              </Text>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}>
              {aiRiskData.map((item) => (
                <div
                  key={item.key}
                  style={{
                    padding: 'var(--spacing-sm)',
                    background: 'var(--bg-container)',
                    border: '1px solid var(--border-light)',
                    borderRadius: 'var(--radius-lg)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
                    <Text style={{ color: 'var(--text-primary)', fontSize: '14px', fontWeight: 500 }}>
                      {item.resource}
                    </Text>
                    <Tag
                      color={item.severity === 'high' ? 'red' : 'orange'}
                      style={{ fontSize: '10px' }}
                    >
                      {item.risk}
                    </Tag>
                  </div>
                  <Text style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>
                    {item.description}
                  </Text>
                </div>
              ))}
            </div>
          </Card>

          {/* 需關注的資源列表 */}
          <Card
            size="small"
            style={{
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border-light)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-lg)' }}>
              <Title level={5} style={{ margin: 0, color: 'var(--text-primary)' }}>
                <ExclamationCircleOutlined style={{ marginRight: '8px', color: 'var(--brand-danger)' }} />
                需關注的資源列表
              </Title>
              <Text style={{
                color: 'var(--brand-danger)',
                fontSize: '12px',
                background: 'var(--bg-container)',
                padding: '2px 6px',
                borderRadius: '4px'
              }}>
                2
              </Text>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}>
              {alertResourceData.map((item) => (
                <div
                  key={item.key}
                  style={{
                    padding: 'var(--spacing-sm)',
                    background: 'var(--bg-container)',
                    border: '1px solid var(--border-light)',
                    borderRadius: 'var(--radius-lg)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text style={{ color: 'var(--text-primary)', fontSize: '14px' }}>
                      {item.resource}
                    </Text>
                    <Space>
                      <Tag
                        color={item.severity === 'critical' ? 'red' : 'orange'}
                        style={{ fontSize: '10px' }}
                      >
                        {item.status}
                      </Tag>
                      <Text style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>
                        {item.count} 則
                      </Text>
                    </Space>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default SREInfrastructureInsightPage
