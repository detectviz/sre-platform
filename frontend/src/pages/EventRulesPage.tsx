import React from 'react'
import { Table, Switch, Tag } from 'antd'
import { FilterOutlined, ReloadOutlined, PlusOutlined } from '@ant-design/icons'
import { TableLayout } from '../components/layouts'
import { ToolbarActions } from '../components/ToolbarActions'
import { DEFAULT_PAGINATION, createActionColumn, COMMON_ACTIONS } from '../components'


// 模擬事件規則數據
const mockEventRulesData = [
  {
    id: '1',
    name: 'CPU 使用率高於 90%',
    description: '當 CPU 使用率持續 5 分鐘超過 90% 時觸發',
    severity: 'critical',
    enabled: true,
    source: 'prometheus',
    triggers: 'cpu_usage > 0.9',
    cooldown: '5m',
    channels: ['email', 'slack'],
    createdAt: '2024-01-10',
    lastTriggered: '2024-01-15 10:30:00',
  },
  {
    id: '2',
    name: '磁盤空間不足',
    description: '當磁盤使用率超過 85% 時觸發',
    severity: 'warning',
    enabled: true,
    source: 'node-exporter',
    triggers: 'disk_usage > 0.85',
    cooldown: '10m',
    channels: ['email'],
    createdAt: '2024-01-09',
    lastTriggered: '2024-01-15 09:15:00',
  },
  {
    id: '3',
    name: '記憶體洩漏檢測',
    description: '監控應用程式記憶體使用趨勢',
    severity: 'warning',
    enabled: false,
    source: 'application',
    triggers: 'memory_increase_rate > 0.1',
    cooldown: '15m',
    channels: ['slack', 'webhook'],
    createdAt: '2024-01-08',
    lastTriggered: '2024-01-14 18:00:00',
  },
]

// 表格列定義
const eventRulesColumns = [
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
    dataIndex: 'enabled',
    key: 'enabled',
    width: 80,
    render: (enabled: boolean) => (
      <Switch
        checked={enabled}
        size="small"
        onChange={(checked) => {
          console.log('Toggle rule', checked)
        }}
      />
    ),
  },
  {
    title: '觸發條件',
    dataIndex: 'triggers',
    key: 'triggers',
    width: 200,
    render: (triggers: string) => (
      <code style={{ fontSize: '12px', background: '#f5f5f5', padding: '2px 4px', borderRadius: '4px' }}>
        {triggers}
      </code>
    ),
  },
  {
    title: '冷卻時間',
    dataIndex: 'cooldown',
    key: 'cooldown',
    width: 100,
  },
  {
    title: '通知管道',
    dataIndex: 'channels',
    key: 'channels',
    width: 150,
    render: (channels: string[]) => (
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
        {channels.map((channel, index) => (
          <Tag key={index}>
            {channel}
          </Tag>
        ))}
      </div>
    ),
  },
  {
    title: '最後觸發',
    dataIndex: 'lastTriggered',
    key: 'lastTriggered',
    width: 150,
  },
  createActionColumn([
    { ...COMMON_ACTIONS.VIEW, onClick: (record) => console.log('View rule', record) },
    { ...COMMON_ACTIONS.EDIT, onClick: (record) => console.log('Edit rule', record) },
    { ...COMMON_ACTIONS.EXPORT, onClick: (record) => console.log('Export rule', record) },
    { ...COMMON_ACTIONS.DELETE, onClick: (record) => console.log('Delete rule', record) },
  ]),
]

const EventRulesPage: React.FC = () => {
  // 工具列動作
  const toolbarActions = [
    {
      key: 'create',
      label: '新增規則',
      icon: <PlusOutlined />,
      type: 'primary',
      onClick: () => {
        console.log('Create new rule')
      },
    },
    {
      key: 'refresh',
      label: '刷新',
      icon: <ReloadOutlined />,
      onClick: () => {
        console.log('Refresh rules')
      },
    },
    {
      key: 'import',
      label: '匯入規則',
      icon: <FilterOutlined />,
      type: 'default',
      onClick: () => {
        console.log('Import rules')
      },
    },
    {
      key: 'export',
      label: '匯出規則',
      icon: <FilterOutlined />,
      type: 'default',
      onClick: () => {
        console.log('Export rules')
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
        { value: 'enabled', label: '已啟用' },
        { value: 'disabled', label: '已禁用' }
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
          <h1>事件規則</h1>
          <p>管理系統監控和告警規則</p>
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
            searchPlaceholder="搜尋規則名稱"
            showSearch={true}
          />
        )
      }}
      content={
        <Table
          columns={eventRulesColumns}
          dataSource={mockEventRulesData}
          rowKey="id"
          pagination={DEFAULT_PAGINATION}
          scroll={{ x: 1200 }}
          size="middle"
        />
      }
    />
  )
}

export default EventRulesPage
