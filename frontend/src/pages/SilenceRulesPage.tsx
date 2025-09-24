import React from 'react'
import { Table, Switch, Tag } from 'antd'
import { FilterOutlined, ReloadOutlined, PlusOutlined } from '@ant-design/icons'
import { TableLayout } from '../components/layouts'
import { ToolbarActions } from '../components/ToolbarActions'
import { DEFAULT_PAGINATION, createActionColumn, COMMON_ACTIONS } from '../components'


// 模擬靜音規則數據
const mockSilenceRulesData = [
  {
    id: '1',
    name: '週末維護靜音',
    description: '週末系統維護期間靜音所有告警',
    enabled: true,
    matchers: [
      { name: 'severity', value: 'warning', isRegex: false },
      { name: 'severity', value: 'critical', isRegex: false },
    ],
    schedule: '週末 00:00-06:00',
    duration: '6h',
    creator: 'admin',
    createdAt: '2024-01-10',
    lastTriggered: '2024-01-14 00:00:00',
  },
  {
    id: '2',
    name: '資料庫維護靜音',
    description: '資料庫維護期間靜音相關告警',
    enabled: true,
    matchers: [
      { name: 'instance', value: 'db-.*', isRegex: true },
      { name: 'job', value: 'mysql', isRegex: false },
    ],
    schedule: '每日 02:00-04:00',
    duration: '2h',
    creator: 'db-admin',
    createdAt: '2024-01-09',
    lastTriggered: '2024-01-15 02:00:00',
  },
  {
    id: '3',
    name: '應用程式升級靜音',
    description: '應用程式升級期間靜音應用程式相關告警',
    enabled: false,
    matchers: [
      { name: 'job', value: 'app-server', isRegex: false },
    ],
    schedule: '臨時',
    duration: '1h',
    creator: 'devops',
    createdAt: '2024-01-08',
    lastTriggered: null,
  },
]

// 表格列定義
const silenceRulesColumns = [
  {
    title: '規則名稱',
    dataIndex: 'name',
    key: 'name',
    ellipsis: true,
  },
  {
    title: '描述',
    dataIndex: 'description',
    key: 'description',
    ellipsis: true,
    width: 300,
  },
  {
    title: '狀態',
    dataIndex: 'enabled',
    key: 'enabled',
    width: 80,
    render: (enabled: boolean) => (
      <Switch
        checked={enabled}
        size="small"
        onChange={(checked) => {
          console.log('Toggle silence rule', checked)
        }}
      />
    ),
  },
  {
    title: '匹配條件',
    dataIndex: 'matchers',
    key: 'matchers',
    width: 250,
    render: (matchers: any[]) => (
      <div>
        {matchers.map((matcher, index) => (
          <div key={index} style={{ fontSize: '12px', marginBottom: 2 }}>
            <Tag color="blue">
              {matcher.name} {matcher.isRegex ? '~' : '='} {matcher.value}
            </Tag>
          </div>
        ))}
      </div>
    ),
  },
  {
    title: '排程',
    dataIndex: 'schedule',
    key: 'schedule',
    width: 150,
  },
  {
    title: '持續時間',
    dataIndex: 'duration',
    key: 'duration',
    width: 100,
  },
  {
    title: '建立者',
    dataIndex: 'creator',
    key: 'creator',
    width: 100,
  },
  {
    title: '最後執行',
    dataIndex: 'lastTriggered',
    key: 'lastTriggered',
    width: 150,
    render: (lastTriggered: string | null) => (
      <span style={{ color: lastTriggered ? 'inherit' : '#999' }}>
        {lastTriggered ? new Date(lastTriggered).toLocaleString() : '尚未執行'}
      </span>
    ),
  },
  createActionColumn([
    { ...COMMON_ACTIONS.VIEW, onClick: (record) => console.log('View silence rule', record) },
    { ...COMMON_ACTIONS.EDIT, onClick: (record) => console.log('Edit silence rule', record) },
    { ...COMMON_ACTIONS.DELETE, onClick: (record) => console.log('Delete silence rule', record) },
  ]),
]

// KPI 卡片數據

const SilenceRulesPage: React.FC = () => {
  // 工具列動作
  const toolbarActions = [
    {
      key: 'create',
      label: '新增靜音規則',
      icon: <PlusOutlined />,
      type: 'primary',
      onClick: () => {
        console.log('Create new silence rule')
      },
    },
    {
      key: 'refresh',
      label: '刷新',
      icon: <ReloadOutlined />,
      onClick: () => {
        console.log('Refresh silence rules')
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
      key: 'status',
      label: '狀態',
      options: [
        { value: 'enabled', label: '已啟用' },
        { value: 'disabled', label: '已禁用' }
      ]
    },
    {
      key: 'creator',
      label: '建立者',
      options: [
        { value: 'admin', label: 'Admin' },
        { value: 'db-admin', label: 'DB Admin' },
        { value: 'devops', label: 'DevOps' }
      ]
    }
  ]

  return (
    <TableLayout
      header={
        <div>
          <h1>靜音規則</h1>
          <p>管理告警靜音和抑制規則</p>
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
            searchPlaceholder="搜尋靜音規則"
            showSearch={true}
          />
        )
      }}
      content={
        <Table
          columns={silenceRulesColumns}
          dataSource={mockSilenceRulesData}
          rowKey="id"
          pagination={DEFAULT_PAGINATION}
          scroll={{ x: 1000 }}
          size="middle"
        />
      }
    />
  )
}

export default SilenceRulesPage
