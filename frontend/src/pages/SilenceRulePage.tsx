import React from 'react'
import { Table, Tag, Space, Button, Tooltip, Switch, DatePicker } from 'antd'
import { PageHeader } from '../components/PageHeader'
import { ContextualKPICard } from '../components/ContextualKPICard'
import { ToolbarActions } from '../components/ToolbarActions'
import {
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  CopyOutlined,
  ClockCircleOutlined,
  PauseOutlined,
  PlayOutlined,
} from '@ant-design/icons'

const SilenceRulePage: React.FC = () => {
  const kpiData = [
    {
      title: '活躍靜音規則',
      value: '7',
      description: '當前生效的靜音規則',
      status: 'info' as const,
    },
    {
      title: '今日靜音事件',
      value: '124',
      description: '被靜音的事件數量',
      trend: '+8%',
      status: 'success' as const,
    },
    {
      title: '靜音時長',
      value: '2.4小時',
      description: '平均靜音持續時間',
      trend: '-0.3小時',
      status: 'info' as const,
    },
    {
      title: '靜音覆蓋率',
      value: '85%',
      description: '靜音規則覆蓋的事件比例',
      trend: '+3%',
      status: 'success' as const,
    },
  ]

  const columns = [
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

  const mockData = [
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

  return (
    <div>
      <PageHeader
        title="靜音規則"
        subtitle="配置事件靜音和抑制規則"
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
        onRefresh={() => console.log('刷新靜音規則列表')}
        actions={[
          {
            key: 'create',
            label: '新增靜音',
            icon: <PauseOutlined />,
            tooltip: '創建新的靜音規則',
          },
          {
            key: 'batch',
            label: '批量操作',
            icon: <DeleteOutlined />,
            tooltip: '批量啟用/禁用靜音規則',
          },
        ]}
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
}

export default SilenceRulePage
