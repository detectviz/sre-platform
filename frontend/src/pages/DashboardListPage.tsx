import React from 'react'
import { Table, Space, Tag } from 'antd'
import { FilterOutlined, ReloadOutlined, DashboardOutlined, PlusOutlined } from '@ant-design/icons'
import { TableLayout } from '../components/layouts'
import { ToolbarActions } from '../components/ToolbarActions'
import { DEFAULT_PAGINATION, createActionColumn, COMMON_ACTIONS } from '../components'


// 模擬儀表板數據
const mockDashboardData = [
  {
    id: '1',
    name: 'SRE 戰情室儀表板',
    description: '主要監控和事件響應儀表板',
    type: 'monitoring',
    status: 'active',
    refreshInterval: '30s',
    dataSource: 'Prometheus',
    createdBy: 'admin',
    createdAt: '2024-01-01',
    lastUpdated: '2024-01-15 10:30:00',
    tags: ['主儀表板', 'SRE', '關鍵'],
  },
  {
    id: '2',
    name: '基礎設施洞察',
    description: '基礎設施資源使用情況和效能',
    type: 'infrastructure',
    status: 'active',
    refreshInterval: '60s',
    dataSource: 'Node Exporter',
    createdBy: 'infrastructure-team',
    createdAt: '2024-01-02',
    lastUpdated: '2024-01-14 16:20:00',
    tags: ['基礎設施', '資源', '效能'],
  },
  {
    id: '3',
    name: '應用程式效能',
    description: '應用程式關鍵指標和健康狀態',
    type: 'application',
    status: 'active',
    refreshInterval: '15s',
    dataSource: 'Application Metrics',
    createdBy: 'dev-team',
    createdAt: '2024-01-03',
    lastUpdated: '2024-01-13 09:15:00',
    tags: ['應用程式', '效能', '開發'],
  },
  {
    id: '4',
    name: '業務指標',
    description: '業務相關的關鍵指標',
    type: 'business',
    status: 'draft',
    refreshInterval: '300s',
    dataSource: 'Business Metrics',
    createdBy: 'business-team',
    createdAt: '2024-01-04',
    lastUpdated: '2024-01-12 14:45:00',
    tags: ['業務', 'KPI'],
  },
]

const dashboardColumns = [
  {
    title: '儀表板名稱',
    dataIndex: 'name',
    key: 'name',
    width: 200,
    render: (name: string) => (
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <DashboardOutlined style={{ color: '#1890ff' }} />
        <span style={{ fontWeight: 'bold' }}>{name}</span>
      </div>
    ),
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
    width: 120,
    render: (type: string) => {
      const colorMap = {
        monitoring: 'blue',
        infrastructure: 'green',
        application: 'orange',
        business: 'purple',
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
    render: (status: string) => (
      <Tag color={status === 'active' ? 'green' : 'default'}>
        {status === 'active' ? '活躍' : '草稿'}
      </Tag>
    ),
  },
  {
    title: '刷新間隔',
    dataIndex: 'refreshInterval',
    key: 'refreshInterval',
    width: 100,
  },
  {
    title: '資料來源',
    dataIndex: 'dataSource',
    key: 'dataSource',
    width: 150,
  },
  {
    title: '標籤',
    dataIndex: 'tags',
    key: 'tags',
    width: 200,
    render: (tags: string[]) => (
      <Space wrap>
        {tags.slice(0, 2).map((tag, index) => (
          <Tag key={index}>
            {tag}
          </Tag>
        ))}
        {tags.length > 2 && (
          <Tag>+{tags.length - 2}</Tag>
        )}
      </Space>
    ),
  },
  {
    title: '最後更新',
    dataIndex: 'lastUpdated',
    key: 'lastUpdated',
    width: 150,
  },
  createActionColumn([
    { ...COMMON_ACTIONS.VIEW, onClick: () => console.log('View dashboard') },
    { ...COMMON_ACTIONS.EDIT, onClick: () => console.log('Edit dashboard') },
    { ...COMMON_ACTIONS.DELETE, onClick: () => console.log('Delete dashboard') },
  ]),
]


const DashboardListPage: React.FC = () => {
  const toolbarActions = [
    {
      key: 'create',
      label: '新增儀表板',
      icon: <PlusOutlined />,
      type: 'primary',
      onClick: () => console.log('Create new dashboard'),
    },
    {
      key: 'refresh',
      label: '刷新',
      icon: <ReloadOutlined />,
      onClick: () => console.log('Refresh dashboards'),
    },
    {
      key: 'import',
      label: '匯入儀表板',
      icon: <FilterOutlined />,
      onClick: () => console.log('Import dashboards'),
    },
  ]

  const filters = [
    {
      key: 'type',
      label: '類型',
      options: [
        { value: 'monitoring', label: '監控' },
        { value: 'infrastructure', label: '基礎設施' },
        { value: 'application', label: '應用程式' },
        { value: 'business', label: '業務' }
      ]
    },
    {
      key: 'status',
      label: '狀態',
      options: [
        { value: 'active', label: '活躍' },
        { value: 'draft', label: '草稿' }
      ]
    }
  ]

  return (
    <TableLayout
      header={<div><h1>儀表板列表</h1><p>管理所有儀表板和監控視圖</p></div>}
      config={{
        mode: 'table',
        spacing: { content: '16px' },
        sidebar: { show: false },
        toolbar: (
          <ToolbarActions
            actions={toolbarActions}
            filters={filters}
            searchPlaceholder="搜尋儀表板名稱"
            showSearch={true}
          />
        )
      }}
      content={
        <Table
          columns={dashboardColumns}
          dataSource={mockDashboardData}
          rowKey="id"
          pagination={DEFAULT_PAGINATION}
          scroll={{ x: 1200 }}
          size="middle"
        />
      }
    />
  )
}

export default DashboardListPage
