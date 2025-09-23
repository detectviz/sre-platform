import React from 'react'
import { Table, Tag, Progress } from 'antd'
import { FilterOutlined, ReloadOutlined, SyncOutlined, PlusOutlined } from '@ant-design/icons'
import { TableLayout } from '../components/layouts'
import { ToolbarActions } from '../components/ToolbarActions'
import { DEFAULT_PAGINATION, createActionColumn, COMMON_ACTIONS } from '../components'


// 模擬資源數據
const mockResourceData = [
  {
    id: '1',
    name: 'web-server-01',
    type: 'server',
    status: 'healthy',
    ip: '192.168.1.101',
    cpuUsage: 65,
    memoryUsage: 78,
    diskUsage: 45,
    uptime: '30d 12h 45m',
    location: '機房-A',
    tags: ['web', 'production'],
    lastCheck: '2024-01-15 15:30:00',
  },
  {
    id: '2',
    name: 'db-server-01',
    type: 'database',
    status: 'warning',
    ip: '192.168.1.102',
    cpuUsage: 45,
    memoryUsage: 85,
    diskUsage: 92,
    uptime: '45d 8h 20m',
    location: '機房-B',
    tags: ['database', 'production', 'critical'],
    lastCheck: '2024-01-15 15:29:00',
  },
  {
    id: '3',
    name: 'cache-server-01',
    type: 'cache',
    status: 'healthy',
    ip: '192.168.1.103',
    cpuUsage: 23,
    memoryUsage: 34,
    diskUsage: 12,
    uptime: '15d 6h 30m',
    location: '機房-A',
    tags: ['cache', 'staging'],
    lastCheck: '2024-01-15 15:28:00',
  },
  {
    id: '4',
    name: 'api-server-01',
    type: 'server',
    status: 'critical',
    ip: '192.168.1.104',
    cpuUsage: 95,
    memoryUsage: 88,
    diskUsage: 76,
    uptime: '7d 18h 15m',
    location: '機房-C',
    tags: ['api', 'production', 'critical'],
    lastCheck: '2024-01-15 15:27:00',
  },
]

// 表格列定義
const resourceColumns = [
  {
    title: '資源名稱',
    dataIndex: 'name',
    key: 'name',
    ellipsis: true,
    width: 150,
  },
  {
    title: '類型',
    dataIndex: 'type',
    key: 'type',
    width: 100,
    render: (type: string) => {
      const colorMap = {
        server: 'blue',
        database: 'green',
        cache: 'orange',
        network: 'purple',
      }
      return (
        <Tag color={colorMap[type as keyof typeof colorMap] || 'default'}>
          {type.toUpperCase()}
        </Tag>
      )
    },
  },
  {
    title: '狀態',
    dataIndex: 'status',
    key: 'status',
    width: 100,
    render: (status: string) => {
      const colorMap = {
        healthy: 'green',
        warning: 'orange',
        critical: 'red',
        unknown: 'default',
      }
      const iconMap = {
        healthy: '✅',
        warning: '⚠️',
        critical: '❌',
        unknown: '❓',
      }
      return (
        <Tag color={colorMap[status as keyof typeof colorMap] || 'default'}>
          {iconMap[status as keyof typeof iconMap] || '❓'} {status.toUpperCase()}
        </Tag>
      )
    },
  },
  {
    title: 'IP 地址',
    dataIndex: 'ip',
    key: 'ip',
    width: 130,
  },
  {
    title: 'CPU 使用率',
    dataIndex: 'cpuUsage',
    key: 'cpuUsage',
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
    title: '記憶體使用率',
    dataIndex: 'memoryUsage',
    key: 'memoryUsage',
    width: 140,
    render: (usage: number) => (
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <Progress
          percent={usage}
          size="small"
          status={usage > 90 ? 'exception' : usage > 80 ? 'active' : 'normal'}
          strokeColor={usage > 90 ? '#ff4d4f' : usage > 80 ? '#faad14' : '#52c41a'}
          style={{ width: 60 }}
          showInfo={false}
        />
        <span>{usage}%</span>
      </div>
    ),
  },
  {
    title: '磁盤使用率',
    dataIndex: 'diskUsage',
    key: 'diskUsage',
    width: 120,
    render: (usage: number) => (
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <Progress
          percent={usage}
          size="small"
          status={usage > 90 ? 'exception' : usage > 80 ? 'active' : 'normal'}
          strokeColor={usage > 90 ? '#ff4d4f' : usage > 80 ? '#faad14' : '#52c41a'}
          style={{ width: 60 }}
          showInfo={false}
        />
        <span>{usage}%</span>
      </div>
    ),
  },
  {
    title: '運行時間',
    dataIndex: 'uptime',
    key: 'uptime',
    width: 120,
  },
  {
    title: '位置',
    dataIndex: 'location',
    key: 'location',
    width: 100,
  },
  {
    title: '標籤',
    dataIndex: 'tags',
    key: 'tags',
    width: 200,
    render: (tags: string[]) => (
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
        {tags.map((tag, index) => (
          <Tag key={index}>
            {tag}
          </Tag>
        ))}
      </div>
    ),
  },
  {
    title: '最後檢查',
    dataIndex: 'lastCheck',
    key: 'lastCheck',
    width: 150,
  },
  createActionColumn([
    { ...COMMON_ACTIONS.VIEW, onClick: (record) => console.log('View resource', record) },
    { ...COMMON_ACTIONS.EDIT, onClick: (record) => console.log('Edit resource', record) },
    { ...COMMON_ACTIONS.DELETE, onClick: (record) => console.log('Delete resource', record) },
  ]),
]


const ResourceListPage: React.FC = () => {
  // 工具列動作
  const toolbarActions = [
    {
      key: 'create',
      label: '新增資源',
      icon: <PlusOutlined />,
      type: 'primary',
      onClick: () => {
        console.log('Create new resource')
      },
    },
    {
      key: 'refresh',
      label: '刷新',
      icon: <ReloadOutlined />,
      onClick: () => {
        console.log('Refresh resources')
      },
    },
    {
      key: 'sync',
      label: '同步',
      icon: <SyncOutlined />,
      onClick: () => {
        console.log('Sync resources')
      },
    },
    {
      key: 'bulk_actions',
      label: '批量操作',
      icon: <FilterOutlined />,
      type: 'default',
      onClick: () => {
        console.log('Bulk actions')
      },
    },
  ]

  // 篩選條件
  const filters = [
    {
      key: 'type',
      label: '類型',
      options: [
        { value: 'server', label: '伺服器' },
        { value: 'database', label: '資料庫' },
        { value: 'cache', label: '快取' },
        { value: 'network', label: '網路' }
      ]
    },
    {
      key: 'status',
      label: '狀態',
      options: [
        { value: 'healthy', label: '健康' },
        { value: 'warning', label: '警告' },
        { value: 'critical', label: '嚴重' },
        { value: 'unknown', label: '未知' }
      ]
    },
    {
      key: 'location',
      label: '位置',
      options: [
        { value: '機房-A', label: '機房-A' },
        { value: '機房-B', label: '機房-B' },
        { value: '機房-C', label: '機房-C' }
      ]
    }
  ]

  return (
    <TableLayout
      header={
        <div>
          <h1>資源列表</h1>
          <p>監控和追蹤所有系統資源</p>
        </div>
      }
      config={{
        mode: 'table',
        spacing: { content: '16px' },
        sidebar: { show: false },
        toolbar: (
          <ToolbarActions
            actions={toolbarActions}
            filters={filters}
            searchPlaceholder="搜尋資源"
            showSearch={true}
          />
        )
      }}
      content={
        <Table
          columns={resourceColumns}
          dataSource={mockResourceData}
          rowKey="id"
          pagination={DEFAULT_PAGINATION}
          scroll={{ x: 1500 }}
          size="middle"
        />
      }
    />
  )
}

export default ResourceListPage
