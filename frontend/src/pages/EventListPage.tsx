import React from 'react'
import { Table, Tag } from 'antd'
import { FilterOutlined, ReloadOutlined, PlusOutlined } from '@ant-design/icons'
import { TableLayout } from '../components/layouts'
import { ToolbarActions } from '../components/ToolbarActions'
import { DEFAULT_PAGINATION, createActionColumn, COMMON_ACTIONS } from '../components'


// 模擬事件數據
const mockEventData = [
  {
    id: '1',
    title: 'CPU 使用率異常',
    severity: 'critical',
    status: 'active',
    source: 'prometheus',
    affectedResources: ['server-01', 'server-02'],
    startTime: '2024-01-15 10:30:00',
    duration: '2h 30m',
  },
  {
    id: '2',
    title: '磁盤空間不足',
    severity: 'warning',
    status: 'active',
    source: 'node-exporter',
    affectedResources: ['server-03'],
    startTime: '2024-01-15 09:15:00',
    duration: '3h 45m',
  },
  {
    id: '3',
    title: '記憶體洩漏',
    severity: 'critical',
    status: 'resolved',
    source: 'application',
    affectedResources: ['app-server-01'],
    startTime: '2024-01-15 08:00:00',
    duration: '1h 15m',
  },
]

// 表格列定義
const eventColumns = [
  {
    title: '事件標題',
    dataIndex: 'title',
    key: 'title',
    ellipsis: true,
  },
  {
    title: '嚴重程度',
    dataIndex: 'severity',
    key: 'severity',
    width: 100,
    render: (severity: string) => {
      const colorMap = {
        critical: 'red',
        warning: 'orange',
        info: 'blue',
      }
      return (
        <Tag color={colorMap[severity as keyof typeof colorMap] || 'default'}>
          {severity.toUpperCase()}
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
        {status === 'active' ? '活躍' : '已解決'}
      </Tag>
    ),
  },
  {
    title: '來源',
    dataIndex: 'source',
    key: 'source',
    width: 120,
  },
  {
    title: '影響資源',
    dataIndex: 'affectedResources',
    key: 'affectedResources',
    width: 200,
    render: (resources: string[]) => (
      <div>
        {resources.map((resource, index) => (
          <Tag key={index} style={{ marginBottom: 2 }}>
            {resource}
          </Tag>
        ))}
      </div>
    ),
  },
  {
    title: '開始時間',
    dataIndex: 'startTime',
    key: 'startTime',
    width: 150,
  },
  {
    title: '持續時間',
    dataIndex: 'duration',
    key: 'duration',
    width: 100,
  },
  createActionColumn([
    { ...COMMON_ACTIONS.VIEW, onClick: (record) => console.log('View event', record) },
    { ...COMMON_ACTIONS.EDIT, onClick: (record) => console.log('Edit event', record) },
    { ...COMMON_ACTIONS.DELETE, onClick: (record) => console.log('Delete event', record) },
  ]),
]


const EventListPage: React.FC = () => {
  // 工具列動作
  const toolbarActions = [
    {
      key: 'create',
      label: '新增事件',
      icon: <PlusOutlined />,
      type: 'primary',
      onClick: () => {
        console.log('Create new event')
      },
    },
    {
      key: 'refresh',
      label: '刷新',
      icon: <ReloadOutlined />,
      onClick: () => {
        console.log('Refresh events')
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
      key: 'severity',
      label: '嚴重程度',
      options: [
        { value: 'critical', label: '嚴重' },
        { value: 'warning', label: '警告' },
        { value: 'info', label: '資訊' }
      ]
    },
    {
      key: 'status',
      label: '狀態',
      options: [
        { value: 'active', label: '活躍' },
        { value: 'resolved', label: '已解決' }
      ]
    },
    {
      key: 'source',
      label: '來源',
      options: [
        { value: 'prometheus', label: 'Prometheus' },
        { value: 'node-exporter', label: 'Node Exporter' },
        { value: 'application', label: '應用程式' }
      ]
    }
  ]

  return (
    <TableLayout
      header={
        <div>
          <h1>事件列表</h1>
          <p>監控和追蹤系統中的所有事件</p>
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
            searchPlaceholder="搜尋事件標題"
            showSearch={true}
          />
        )
      }}
      content={
        <Table
          columns={eventColumns}
          dataSource={mockEventData}
          rowKey="id"
          pagination={DEFAULT_PAGINATION}
          scroll={{ x: 1000 }}
          size="middle"
        />
      }
    />
  )
}

export default EventListPage
