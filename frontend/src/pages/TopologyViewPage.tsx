import React from 'react'
import { Card, Space, Select, Empty, Button } from 'antd'
import { ReloadOutlined, SettingOutlined, FullscreenOutlined, DownloadOutlined } from '@ant-design/icons'
import { StandardLayout } from '../components/layouts'
import { ToolbarActions } from '../components/ToolbarActions'
import { ContextualKPICard } from '../components/ContextualKPICard'

const { Option } = Select

// 模擬拓撲數據
const mockTopologyData = {
  nodes: [
    { id: '1', name: 'Load Balancer', type: 'loadbalancer', status: 'healthy', x: 100, y: 50 },
    { id: '2', name: 'Web Server 1', type: 'server', status: 'healthy', x: 200, y: 150 },
    { id: '3', name: 'Web Server 2', type: 'server', status: 'warning', x: 400, y: 150 },
    { id: '4', name: 'Database', type: 'database', status: 'healthy', x: 300, y: 300 },
    { id: '5', name: 'Cache Server', type: 'cache', status: 'critical', x: 500, y: 300 },
  ],
  edges: [
    { source: '1', target: '2' },
    { source: '1', target: '3' },
    { source: '2', target: '4' },
    { source: '3', target: '4' },
    { source: '4', target: '5' },
  ],
}

// KPI 卡片數據
const kpiCardsData = [
  {
    title: '總節點數',
    value: '42',
    change: '+3',
    changeType: 'increase' as const,
    icon: '🔗',
  },
  {
    title: '健康節點',
    value: '38',
    change: '+2',
    changeType: 'increase' as const,
    icon: '✅',
  },
  {
    title: '警告節點',
    value: '3',
    change: '+1',
    changeType: 'increase' as const,
    icon: '⚠️',
  },
  {
    title: '嚴重節點',
    value: '1',
    change: '0',
    changeType: 'neutral' as const,
    icon: '❌',
  },
]

// 模擬拓撲視圖組件
const TopologyView: React.FC = () => {
  return (
    <Card
      title="系統拓撲視圖"
      style={{ height: '600px', position: 'relative' }}
      extra={
        <Space>
          <Select defaultValue="layered" style={{ width: 120 }}>
            <Option value="layered">分層佈局</Option>
            <Option value="circular">環形佈局</Option>
            <Option value="force">力導向佈局</Option>
          </Select>
          <Button icon={<ReloadOutlined />}>刷新</Button>
          <Button icon={<SettingOutlined />}>設定</Button>
          <Button icon={<FullscreenOutlined />}>全螢幕</Button>
          <Button icon={<DownloadOutlined />}>匯出</Button>
        </Space>
      }
    >
      <div style={{
        width: '100%',
        height: '500px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        border: '2px dashed #d9d9d9',
        borderRadius: '8px',
        backgroundColor: '#fafafa',
        color: '#999'
      }}>
        <Empty
          description="拓撲視圖功能開發中"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
        <div style={{ marginTop: 16, textAlign: 'center' }}>
          <p>預計顯示：系統架構拓撲圖、節點狀態、連線關係</p>
          <p>包含：載入平衡器、應用伺服器、資料庫、快取等節點</p>
        </div>
      </div>
    </Card>
  )
}

// 節點狀態圖例
const Legend: React.FC = () => {
  return (
    <Card title="節點狀態圖例" size="small" style={{ width: 300 }}>
      <Space direction="vertical" style={{ width: '100%' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 16, height: 16, backgroundColor: '#52c41a', borderRadius: '50%' }}></div>
          <span>健康節點</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 16, height: 16, backgroundColor: '#faad14', borderRadius: '50%' }}></div>
          <span>警告節點</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 16, height: 16, backgroundColor: '#ff4d4f', borderRadius: '50%' }}></div>
          <span>嚴重節點</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 16, height: 16, backgroundColor: '#d9d9d9', borderRadius: '50%' }}></div>
          <span>未知節點</span>
        </div>
      </Space>
    </Card>
  )
}

const TopologyViewPage: React.FC = () => {
  // 工具列動作
  const toolbarActions = [
    {
      key: 'refresh',
      label: '刷新',
      icon: <ReloadOutlined />,
      onClick: () => {
        console.log('Refresh topology')
      },
    },
    {
      key: 'layout',
      label: '佈局',
      icon: <SettingOutlined />,
      onClick: () => {
        console.log('Change layout')
      },
    },
    {
      key: 'fullscreen',
      label: '全螢幕',
      icon: <FullscreenOutlined />,
      onClick: () => {
        console.log('Fullscreen mode')
      },
    },
    {
      key: 'export',
      label: '匯出',
      icon: <DownloadOutlined />,
      onClick: () => {
        console.log('Export topology')
      },
    },
  ]

  return (
    <StandardLayout
      header={
        <div>
          <h1>拓撲視圖</h1>
          <p>系統架構和資源關係的可視化檢視</p>
        </div>
      }
      config={{
        mode: 'default',
        spacing: { content: '16px' },
        sidebar: { show: false },
        toolbar: (
          <ToolbarActions
            actions={toolbarActions}
          />
        )
      }}
      content={
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 16, height: 'calc(100vh - 200px)' }}>
          <TopologyView />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <Legend />
            <Card title="節點詳情" size="small" style={{ flex: 1 }}>
              <Empty
                description="選擇節點查看詳情"
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
            </Card>
          </div>
        </div>
      }
    />
  )
}

export default TopologyViewPage
