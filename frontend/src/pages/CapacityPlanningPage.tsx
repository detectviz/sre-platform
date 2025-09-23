import React from 'react'
import { Table, Button, Progress, Card } from 'antd'
import { FilterOutlined, ReloadOutlined, EditOutlined, LineChartOutlined } from '@ant-design/icons'
import { StandardLayout } from '../components/layouts'
import { ToolbarActions } from '../components/ToolbarActions'
import { DEFAULT_PAGINATION, createActionColumn, COMMON_ACTIONS } from '../components'


// 模擬容量規劃數據
const mockCapacityData = [
  {
    id: '1',
    resource: 'CPU 核心',
    currentUsage: 68,
    predictedUsage: 85,
    growthRate: 15.2,
    recommendedCapacity: 100,
    timeframe: '3個月',
    confidence: 92,
    lastUpdated: '2024-01-15 10:00:00',
  },
  {
    id: '2',
    resource: '記憶體 (GB)',
    currentUsage: 45,
    predictedUsage: 78,
    growthRate: 25.8,
    recommendedCapacity: 128,
    timeframe: '6個月',
    confidence: 88,
    lastUpdated: '2024-01-15 09:30:00',
  },
  {
    id: '3',
    resource: '儲存空間 (TB)',
    currentUsage: 32,
    predictedUsage: 65,
    growthRate: 12.5,
    recommendedCapacity: 100,
    timeframe: '12個月',
    confidence: 95,
    lastUpdated: '2024-01-15 08:45:00',
  },
  {
    id: '4',
    resource: '網路頻寬 (Mbps)',
    currentUsage: 120,
    predictedUsage: 180,
    growthRate: 22.1,
    recommendedCapacity: 250,
    timeframe: '6個月',
    confidence: 78,
    lastUpdated: '2024-01-15 08:15:00',
  },
]

// 表格列定義
const capacityColumns = [
  {
    title: '資源類型',
    dataIndex: 'resource',
    key: 'resource',
    width: 150,
  },
  {
    title: '當前使用率',
    dataIndex: 'currentUsage',
    key: 'currentUsage',
    width: 120,
    render: (usage: number) => (
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <Progress
          percent={usage}
          size="small"
          status={usage > 90 ? 'exception' : usage > 70 ? 'active' : 'normal'}
          strokeColor={usage > 90 ? '#ff4d4f' : usage > 70 ? '#faad14' : '#52c41a'}
          style={{ width: 60 }}
          showInfo={false}
        />
        <span>{usage}%</span>
      </div>
    ),
  },
  {
    title: '預測使用率',
    dataIndex: 'predictedUsage',
    key: 'predictedUsage',
    width: 130,
    render: (usage: number) => (
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <Progress
          percent={usage}
          size="small"
          status={usage > 90 ? 'exception' : usage > 70 ? 'active' : 'normal'}
          strokeColor={usage > 90 ? '#ff4d4f' : usage > 70 ? '#faad14' : '#52c41a'}
          style={{ width: 60 }}
          showInfo={false}
        />
        <span>{usage}%</span>
      </div>
    ),
  },
  {
    title: '增長率',
    dataIndex: 'growthRate',
    key: 'growthRate',
    width: 100,
    render: (rate: number) => (
      <span style={{ color: rate > 20 ? '#ff4d4f' : rate > 10 ? '#faad14' : '#52c41a' }}>
        {rate > 0 ? '+' : ''}{rate}%
      </span>
    ),
  },
  {
    title: '建議容量',
    dataIndex: 'recommendedCapacity',
    key: 'recommendedCapacity',
    width: 120,
    render: (capacity: number, record: any) => (
      <div>
        <div style={{ fontWeight: 'bold' }}>{capacity}</div>
        <div style={{ fontSize: '12px', color: '#666' }}>
          {record.resource.includes('CPU') ? '核心' :
            record.resource.includes('記憶體') ? 'GB' :
              record.resource.includes('儲存') ? 'TB' : 'Mbps'}
        </div>
      </div>
    ),
  },
  {
    title: '預測時間範圍',
    dataIndex: 'timeframe',
    key: 'timeframe',
    width: 120,
  },
  {
    title: '信心指數',
    dataIndex: 'confidence',
    key: 'confidence',
    width: 100,
    render: (confidence: number) => (
      <span style={{
        color: confidence > 90 ? '#52c41a' : confidence > 80 ? '#faad14' : '#ff4d4f'
      }}>
        {confidence}%
      </span>
    ),
  },
  {
    title: '最後更新',
    dataIndex: 'lastUpdated',
    key: 'lastUpdated',
    width: 150,
  },
  createActionColumn([
    { ...COMMON_ACTIONS.VIEW, onClick: (record) => console.log('View capacity', record) },
    { ...COMMON_ACTIONS.EDIT, onClick: (record) => console.log('Edit capacity', record) },
    { ...COMMON_ACTIONS.DELETE, onClick: (record) => console.log('Delete capacity', record) },
  ]),
]


// 趨勢圖表組件
const TrendChart: React.FC = () => {
  return (
    <Card title="容量趨勢預測" extra={<Button size="small" icon={<LineChartOutlined />}>查看詳情</Button>}>
      <div style={{
        height: '300px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        border: '2px dashed #d9d9d9',
        borderRadius: '8px',
        backgroundColor: '#fafafa',
        color: '#999'
      }}>
        <div style={{ textAlign: 'center' }}>
          <LineChartOutlined style={{ fontSize: '48px', marginBottom: '16px' }} />
          <p>容量趨勢預測圖表</p>
          <p>顯示各資源類型的歷史使用趨勢和預測曲線</p>
        </div>
      </div>
    </Card>
  )
}

const CapacityPlanningPage: React.FC = () => {
  // 工具列動作
  const toolbarActions = [
    {
      key: 'refresh',
      label: '刷新',
      icon: <ReloadOutlined />,
      onClick: () => {
        console.log('Refresh capacity planning')
      },
    },
    {
      key: 'export',
      label: '匯出報告',
      icon: <FilterOutlined />,
      onClick: () => {
        console.log('Export capacity report')
      },
    },
    {
      key: 'settings',
      label: '預測設定',
      icon: <EditOutlined />,
      onClick: () => {
        console.log('Open prediction settings')
      },
    },
  ]

  // 篩選條件
  const filters = [
    {
      key: 'resourceType',
      label: '資源類型',
      options: [
        { value: 'cpu', label: 'CPU' },
        { value: 'memory', label: '記憶體' },
        { value: 'storage', label: '儲存' },
        { value: 'network', label: '網路' }
      ]
    },
    {
      key: 'period',
      label: '預測時間範圍',
      options: [
        { value: '3months', label: '3個月' },
        { value: '6months', label: '6個月' },
        { value: '12months', label: '12個月' }
      ]
    },
    {
      key: 'confidence',
      label: '信心等級',
      options: [
        { value: 'high', label: '高 (>90%)' },
        { value: 'medium', label: '中 (70-90%)' },
        { value: 'low', label: '低 (<70%)' }
      ]
    }
  ]

  return (
    <StandardLayout
      header={
        <div>
          <h1>容量規劃</h1>
          <p>基於歷史數據和趨勢分析的資源容量預測</p>
        </div>
      }
      config={{
        mode: 'default',
        spacing: { content: '16px' },
        sidebar: { show: false },
        toolbar: (
          <ToolbarActions
            actions={toolbarActions}
            filters={filters}
          />
        )
      }}
      content={
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16 }}>
          <Table
            columns={capacityColumns}
            dataSource={mockCapacityData}
            rowKey="id"
            pagination={DEFAULT_PAGINATION}
            scroll={{ x: 1200 }}
            size="middle"
          />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <TrendChart />
            <Card title="預測說明" size="small">
              <div style={{ fontSize: '12px', lineHeight: '1.6' }}>
                <p>• 預測基於過去 30 天數據</p>
                <p>• 信心指數表示預測準確性</p>
                <p>• 建議在達到 80% 時考慮擴容</p>
                <p>• 紅色標記表示需要立即處理</p>
              </div>
            </Card>
          </div>
        </div>
      }
    />
  )
}

export default CapacityPlanningPage
