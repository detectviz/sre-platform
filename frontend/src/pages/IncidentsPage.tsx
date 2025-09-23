import React, { useState } from 'react'
import { useLocation } from 'react-router-dom'
import { useTabs } from '../hooks'
import { Table, Tag, Space, Button, Tooltip, Tabs, Switch } from 'antd'
import { PageHeader } from '../components/PageHeader'
import { ContextualKPICard } from '../components/ContextualKPICard'
import { ToolbarActions } from '../components/ToolbarActions'
import {
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  SoundOutlined,
  RobotOutlined,
  FileTextOutlined,
  SettingOutlined,
  MutedOutlined,
  ClockCircleOutlined,
  CopyOutlined,
  PauseOutlined,
} from '@ant-design/icons'

const IncidentsPage: React.FC = () => {
  const location = useLocation()

  // 根據路由決定默認標籤
  const getDefaultTab = () => {
    if (location.pathname.includes('/silence')) return 'silences'
    if (location.pathname.includes('/rules')) return 'rules'
    return 'list'
  }

  const { activeTab, handleTabChange } = useTabs(getDefaultTab(), {
    list: '/incidents/list',
    rules: '/incidents/rules',
    silences: '/incidents/silence',
  })
  const kpiData = [
    {
      title: '活躍事件',
      value: '5',
      description: '2件嚴重, 3件處理中',
      status: 'warning' as const,
    },
    {
      title: '今日已解決',
      value: '12',
      description: '7件自動解決',
      trend: '+8%',
      status: 'success' as const,
    },
    {
      title: '平均解決時間',
      value: '2.5小時',
      description: '處理週期',
      trend: '-15%',
      status: 'info' as const,
    },
    {
      title: '自動化處理率',
      value: '35.2%',
      description: '今日4件自動解決',
      status: 'info' as const,
    },
  ]

  const columns = [
    {
      title: '事件 ID',
      dataIndex: 'id',
      key: 'id',
      sorter: true,
    },
    {
      title: '摘要',
      dataIndex: 'summary',
      key: 'summary',
    },
    {
      title: '資源名稱',
      dataIndex: 'resource',
      key: 'resource',
    },
    {
      title: '服務影響',
      dataIndex: 'impact',
      key: 'impact',
      render: (impact: string) => (
        <Tag color={impact === 'critical' ? 'red' : impact === 'warning' ? 'orange' : 'blue'}>
          {impact.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: '規則名稱',
      dataIndex: 'rule',
      key: 'rule',
    },
    {
      title: '狀態',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={status === 'resolved' ? 'green' : status === 'acknowledged' ? 'blue' : 'orange'}>
          {status.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: '處理人',
      dataIndex: 'assignee',
      key: 'assignee',
    },
    {
      title: '觸發時間',
      dataIndex: 'triggerTime',
      key: 'triggerTime',
      sorter: true,
    },
    {
      title: '操作',
      key: 'action',
      render: () => (
        <Space size="small">
          <Tooltip title="查看詳情">
            <Button type="text" size="small" icon={<EyeOutlined />} />
          </Tooltip>
          <Tooltip title="編輯">
            <Button type="text" size="small" icon={<EditOutlined />} />
          </Tooltip>
          <Tooltip title="靜音">
            <Button type="text" size="small" icon={<SoundOutlined />} />
          </Tooltip>
          <Tooltip title="AI 分析">
            <Button type="text" size="small" icon={<RobotOutlined />} />
          </Tooltip>
        </Space>
      ),
    },
  ]

  const columnOptions = [
    { key: 'id', label: '事件 ID' },
    { key: 'summary', label: '摘要' },
    { key: 'resource', label: '資源名稱' },
    { key: 'impact', label: '服務影響' },
    { key: 'rule', label: '規則名稱' },
    { key: 'status', label: '狀態' },
    { key: 'assignee', label: '負責人' },
    { key: 'triggerTime', label: '觸發時間' },
  ]

  const mockData = [
    {
      key: '1',
      id: 'INC-001',
      summary: 'API 延遲超過閾值',
      resource: 'api-server-01',
      impact: 'warning',
      rule: 'API 延遲規則',
      status: 'new',
      assignee: '張三',
      triggerTime: '2024-01-15 10:30:00',
    },
    {
      key: '2',
      id: 'INC-002',
      summary: '資料庫連接超時',
      resource: 'db-primary',
      impact: 'critical',
      rule: '資料庫連接規則',
      status: 'acknowledged',
      assignee: '李四',
      triggerTime: '2024-01-15 10:15:00',
    },
    {
      key: '3',
      id: 'INC-003',
      summary: 'CPU 使用率異常',
      resource: 'web-server-02',
      impact: 'warning',
      rule: 'CPU 使用率規則',
      status: 'resolved',
      assignee: '王五',
      triggerTime: '2024-01-15 09:45:00',
    },
  ]

  // 靜音規則表格配置
  const silenceColumns = [
    {
      title: '規則名稱',
      dataIndex: 'name',
      key: 'name',
      sorter: true,
    },
    {
      title: '匹配條件',
      dataIndex: 'matchers',
      key: 'matchers',
      ellipsis: true,
    },
    {
      title: '靜音類型',
      dataIndex: 'type',
      key: 'type',
      render: (type: string) => (
        <Tag color={type === '完全靜音' ? 'red' : type === '部分靜音' ? 'orange' : 'blue'}>
          {type}
        </Tag>
      ),
    },
    {
      title: '持續時間',
      dataIndex: 'duration',
      key: 'duration',
      render: (duration: string) => (
        <Space>
          <ClockCircleOutlined style={{ color: 'var(--text-tertiary)' }} />
          {duration}
        </Space>
      ),
    },
    {
      title: '開始時間',
      dataIndex: 'startTime',
      key: 'startTime',
      sorter: true,
    },
    {
      title: '結束時間',
      dataIndex: 'endTime',
      key: 'endTime',
      sorter: true,
    },
    {
      title: '狀態',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Space>
          <Switch
            checked={status === '活躍'}
            checkedChildren="活躍"
            unCheckedChildren="暫停"
            size="small"
          />
        </Space>
      ),
    },
    {
      title: '操作',
      key: 'action',
      render: () => (
        <Space size="small">
          <Tooltip title="查看詳情">
            <Button type="text" size="small" icon={<EyeOutlined />} />
          </Tooltip>
          <Tooltip title="編輯">
            <Button type="text" size="small" icon={<EditOutlined />} />
          </Tooltip>
          <Tooltip title="複製">
            <Button type="text" size="small" icon={<CopyOutlined />} />
          </Tooltip>
          <Tooltip title="暫停/恢復">
            <Button type="text" size="small" icon={<PauseOutlined />} />
          </Tooltip>
          <Tooltip title="刪除">
            <Button type="text" size="small" icon={<DeleteOutlined />} />
          </Tooltip>
        </Space>
      ),
    },
  ]

  const silenceData = [
    {
      key: '1',
      name: '週末維護靜音',
      matchers: 'service="api" OR service="web"',
      type: '完全靜音',
      duration: '48小時',
      startTime: '2024-01-20 09:00:00',
      endTime: '2024-01-22 09:00:00',
      status: '活躍',
    },
    {
      key: '2',
      name: '資料庫升級靜音',
      matchers: 'instance="db-primary"',
      type: '部分靜音',
      duration: '4小時',
      startTime: '2024-01-15 02:00:00',
      endTime: '2024-01-15 06:00:00',
      status: '活躍',
    },
    {
      key: '3',
      name: '測試環境靜音',
      matchers: 'environment="test"',
      type: '完全靜音',
      duration: '永久',
      startTime: '2024-01-10 00:00:00',
      endTime: '無限期',
      status: '暫停',
    },
  ]

  const [severityFilter, setSeverityFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [resourceFilter, setResourceFilter] = useState<string>('all')



  const handleColumnChange = (key: string, visible: boolean) => {
    console.log('欄位設定:', key, visible)
  }

  const severityOptions = [
    { value: 'all', label: '所有嚴重性' },
    { value: 'critical', label: '嚴重' },
    { value: 'warning', label: '警告' },
    { value: 'info', label: '資訊' },
  ]

  const statusOptions = [
    { value: 'all', label: '所有狀態' },
    { value: 'new', label: '新事件' },
    { value: 'acknowledged', label: '已確認' },
    { value: 'resolved', label: '已解決' },
    { value: 'silenced', label: '已靜音' },
  ]

  const resourceOptions = [
    { value: 'all', label: '所有資源' },
    { value: 'api-server-01', label: 'API 伺服器' },
    { value: 'db-primary', label: '資料庫主機' },
    { value: 'web-server-02', label: 'Web 伺服器' },
    { value: 'cache-server-01', label: '快取伺服器' },
  ]

  const activeFiltersCount = [
    severityFilter !== 'all',
    statusFilter !== 'all',
    resourceFilter !== 'all'
  ].filter(Boolean).length

  const handleSearch = (value: string) => {
    console.log('搜尋事件:', value)
  }

  const filters = [
    {
      key: 'severity',
      label: '嚴重性',
      options: severityOptions,
      value: severityFilter,
      onChange: setSeverityFilter,
    },
    {
      key: 'status',
      label: '狀態',
      options: statusOptions,
      value: statusFilter,
      onChange: setStatusFilter,
    },
    {
      key: 'resource',
      label: '資源名稱',
      options: resourceOptions,
      value: resourceFilter,
      onChange: setResourceFilter,
    },
  ]

  const renderTabContent = () => {
    switch (activeTab) {
      case 'list':
        return (
          <div>
            <ToolbarActions
              onRefresh={() => console.log('刷新事件列表')}
              onSearch={handleSearch}
              searchPlaceholder="搜尋事件摘要、資源或處理人..."
              actions={[
                {
                  key: 'batch',
                  label: '批量操作',
                  icon: <DeleteOutlined />,
                  tooltip: '批量處理選中的事件',
                },
                {
                  key: 'ai-analysis',
                  label: 'AI 分析',
                  icon: <RobotOutlined />,
                  tooltip: 'AI 智能分析建議',
                },
              ]}
              filters={filters}
              showFilters={true}
              filterCount={activeFiltersCount}
              columns={columnOptions}
              onColumnChange={handleColumnChange}
              showColumnSettings={true}
            />
            <Table
              columns={columns}
              dataSource={mockData}
              size="small"
              style={{
                background: 'var(--bg-elevated)',
                border: '1px solid var(--border-light)',
                borderRadius: 'var(--radius-lg)',
              }}
              pagination={{
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total, range) => `第 ${range[0]}-${range[1]} 項，共 ${total} 項`,
              }}
            />
          </div>
        )
      case 'rules':
        return (
          <div>
            <ToolbarActions
              onRefresh={() => console.log('刷新事件規則')}
              searchPlaceholder="搜尋規則名稱或描述..."
              actions={[
                {
                  key: 'create-rule',
                  label: '新增規則',
                  icon: <EditOutlined />,
                  tooltip: '創建新的事件規則',
                },
                {
                  key: 'test-rule',
                  label: '測試規則',
                  icon: <RobotOutlined />,
                  tooltip: '測試規則的有效性',
                },
              ]}
            />
            <div style={{ padding: '16px' }}>
              <p>事件規則管理功能開發中...</p>
            </div>
          </div>
        )
      case 'silences':
        return (
          <div>
            <ToolbarActions
              onRefresh={() => console.log('刷新靜音規則')}
              onSearch={handleSearch}
              searchPlaceholder="搜尋靜音規則名稱或資源..."
              actions={[
                {
                  key: 'create-silence',
                  label: '新增靜音',
                  icon: <MutedOutlined />,
                  tooltip: '創建新的靜音規則',
                },
                {
                  key: 'batch-silence',
                  label: '批量操作',
                  icon: <DeleteOutlined />,
                  tooltip: '批量管理靜音規則',
                },
              ]}
            />
            <Table
              columns={silenceColumns}
              dataSource={silenceData}
              size="small"
              style={{
                background: 'var(--bg-elevated)',
                border: '1px solid var(--border-light)',
                borderRadius: 'var(--radius-lg)',
              }}
              pagination={{
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total, range) => `第 ${range[0]}-${range[1]} 項，共 ${total} 項`,
              }}
            />
          </div>
        )
      default:
        return null
    }
  }

  const tabItems = [
    {
      key: 'list',
      label: '事件列表',
      icon: <FileTextOutlined />,
      children: renderTabContent(),
    },
    {
      key: 'rules',
      label: '事件規則',
      icon: <SettingOutlined />,
      children: renderTabContent(),
    },
    {
      key: 'silences',
      label: '靜音規則',
      icon: <MutedOutlined />,
      children: renderTabContent(),
    },
  ]

  return (
    <div>
      <PageHeader
        title="事件管理"
        subtitle="監控和處理系統異常事件"
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

      <Tabs
        activeKey={activeTab}
        onChange={handleTabChange}
        items={tabItems}
      />
    </div>
  )
}

export default IncidentsPage
