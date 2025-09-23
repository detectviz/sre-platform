import React from 'react'
import { Table, Tag, Progress } from 'antd'
import { FilterOutlined, ReloadOutlined, FolderOutlined, PlusOutlined } from '@ant-design/icons'
import { TableLayout } from '../components/layouts'
import { ToolbarActions } from '../components/ToolbarActions'
import { DEFAULT_PAGINATION, createActionColumn, COMMON_ACTIONS } from '../components'


// 模擬資源群組數據
const mockResourceGroupData = [
  {
    id: '1',
    name: 'Web 伺服器群組',
    description: '所有 Web 伺服器資源',
    type: 'server',
    memberCount: 12,
    healthyCount: 10,
    warningCount: 2,
    criticalCount: 0,
    avgCpuUsage: 45,
    avgMemoryUsage: 65,
    location: '機房-A',
    tags: ['web', 'production'],
    createdAt: '2024-01-10',
    lastUpdated: '2024-01-15 10:30:00',
  },
  {
    id: '2',
    name: '資料庫群組',
    description: 'MySQL 和 PostgreSQL 資料庫伺服器',
    type: 'database',
    memberCount: 6,
    healthyCount: 5,
    warningCount: 1,
    criticalCount: 0,
    avgCpuUsage: 55,
    avgMemoryUsage: 78,
    location: '機房-B',
    tags: ['database', 'production', 'critical'],
    createdAt: '2024-01-09',
    lastUpdated: '2024-01-15 09:45:00',
  },
  {
    id: '3',
    name: '快取群組',
    description: 'Redis 快取伺服器群組',
    type: 'cache',
    memberCount: 4,
    healthyCount: 4,
    warningCount: 0,
    criticalCount: 0,
    avgCpuUsage: 23,
    avgMemoryUsage: 34,
    location: '機房-A',
    tags: ['cache', 'staging'],
    createdAt: '2024-01-08',
    lastUpdated: '2024-01-15 08:20:00',
  },
  {
    id: '4',
    name: 'API 伺服器群組',
    description: 'API 伺服器資源群組',
    type: 'server',
    memberCount: 8,
    healthyCount: 6,
    warningCount: 1,
    criticalCount: 1,
    avgCpuUsage: 72,
    avgMemoryUsage: 85,
    location: '機房-C',
    tags: ['api', 'production', 'critical'],
    createdAt: '2024-01-07',
    lastUpdated: '2024-01-15 11:15:00',
  },
]

// 表格列定義
const resourceGroupColumns = [
  {
    title: '群組名稱',
    dataIndex: 'name',
    key: 'name',
    ellipsis: true,
    width: 200,
  },
  {
    title: '描述',
    dataIndex: 'description',
    key: 'description',
    ellipsis: true,
    width: 300,
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
    title: '成員數量',
    dataIndex: 'memberCount',
    key: 'memberCount',
    width: 100,
    render: (count: number) => (
      <span style={{ fontWeight: 'bold' }}>{count}</span>
    ),
  },
  {
    title: '健康狀態',
    dataIndex: ['healthyCount', 'warningCount', 'criticalCount'],
    key: 'healthStatus',
    width: 250,
    render: (_: any, record: any) => (
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <span style={{ color: '#52c41a' }}>✅</span>
          <span>{record.healthyCount}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <span style={{ color: '#faad14' }}>⚠️</span>
          <span>{record.warningCount}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <span style={{ color: '#ff4d4f' }}>❌</span>
          <span>{record.criticalCount}</span>
        </div>
      </div>
    ),
  },
  {
    title: '平均 CPU',
    dataIndex: 'avgCpuUsage',
    key: 'avgCpuUsage',
    width: 120,
    render: (usage: number) => (
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <Progress
          percent={usage}
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
    title: '平均記憶體',
    dataIndex: 'avgMemoryUsage',
    key: 'avgMemoryUsage',
    width: 130,
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
    title: '最後更新',
    dataIndex: 'lastUpdated',
    key: 'lastUpdated',
    width: 150,
  },
  createActionColumn([
    { ...COMMON_ACTIONS.VIEW, onClick: (record) => console.log('View resource group', record) },
    { ...COMMON_ACTIONS.EDIT, onClick: (record) => console.log('Edit resource group', record) },
    { ...COMMON_ACTIONS.DELETE, onClick: (record) => console.log('Delete resource group', record) },
  ]),
]


const ResourceGroupsPage: React.FC = () => {
  // 工具列動作
  const toolbarActions = [
    {
      key: 'create',
      label: '新增群組',
      icon: <PlusOutlined />,
      type: 'primary',
      onClick: () => {
        console.log('Create new resource group')
      },
    },
    {
      key: 'refresh',
      label: '刷新',
      icon: <ReloadOutlined />,
      onClick: () => {
        console.log('Refresh resource groups')
      },
    },
    {
      key: 'auto_group',
      label: '自動分組',
      icon: <FolderOutlined />,
      onClick: () => {
        console.log('Auto group resources')
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
          <h1>資源群組</h1>
          <p>按邏輯分組管理系統資源</p>
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
            searchPlaceholder="搜尋資源群組"
            showSearch={true}
          />
        )
      }}
      content={
        <Table
          columns={resourceGroupColumns}
          dataSource={mockResourceGroupData}
          rowKey="id"
          pagination={DEFAULT_PAGINATION}
          scroll={{ x: 1400 }}
          size="middle"
        />
      }
    />
  )
}

export default ResourceGroupsPage
