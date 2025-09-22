import React from 'react'
import { Table, Tag, Space, Button, Tooltip } from 'antd'
import { PageHeader } from '../components/PageHeader'
import { ContextualKPICard } from '../components/ContextualKPICard'
import { ToolbarActions } from '../components/ToolbarActions'
import {
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  SoundOutlined,
  RobotOutlined,
} from '@ant-design/icons'

const IncidentsPage: React.FC = () => {
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

  return (
    <div>
      <PageHeader
        title="事件列表"
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

      <ToolbarActions
        onRefresh={() => console.log('刷新事件列表')}
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

export default IncidentsPage
