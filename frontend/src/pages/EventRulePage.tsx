import React from 'react'
import { Table, Tag, Space, Button, Tooltip, Switch } from 'antd'
import { PageHeader } from '../components/PageHeader'
import { ContextualKPICard } from '../components/ContextualKPICard'
import { ToolbarActions } from '../components/ToolbarActions'
import {
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  CopyOutlined,
  PlayCircleOutlined,
} from '@ant-design/icons'

const EventRulePage: React.FC = () => {
  const kpiData = [
    {
      title: '總規則數',
      value: '28',
      description: '包含告警和通知規則',
      status: 'info' as const,
    },
    {
      title: '啟用規則',
      value: '23',
      description: '當前生效的規則',
      trend: '+2',
      status: 'success' as const,
    },
    {
      title: '今日觸發',
      value: '156',
      description: '規則觸發次數',
      trend: '+12%',
      status: 'warning' as const,
    },
    {
      title: '平均響應時間',
      value: '1.2秒',
      description: '規則處理耗時',
      trend: '-0.3秒',
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
      title: '規則類型',
      dataIndex: 'type',
      key: 'type',
      render: (type: string) => (
        <Tag color={type === '告警' ? 'red' : type === '通知' ? 'blue' : 'green'}>
          {type}
        </Tag>
      ),
    },
    {
      title: '觸發條件',
      dataIndex: 'condition',
      key: 'condition',
      ellipsis: true,
    },
    {
      title: '嚴重程度',
      dataIndex: 'severity',
      key: 'severity',
      render: (severity: string) => {
        const color = severity === '嚴重' ? 'red' : severity === '警告' ? 'orange' : 'blue'
        return <Tag color={color}>{severity}</Tag>
      },
    },
    {
      title: '狀態',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Switch
          checked={status === '啟用'}
          checkedChildren="啟用"
          unCheckedChildren="禁用"
          size="small"
        />
      ),
    },
    {
      title: '今日觸發',
      dataIndex: 'triggerCount',
      key: 'triggerCount',
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
          <Tooltip title="複製">
            <Button type="text" size="small" icon={<CopyOutlined />} />
          </Tooltip>
          <Tooltip title="測試">
            <Button type="text" size="small" icon={<PlayCircleOutlined />} />
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
      name: 'CPU 使用率告警',
      type: '告警',
      condition: 'CPU > 80% 持續 5 分鐘',
      severity: '警告',
      status: '啟用',
      triggerCount: '23',
    },
    {
      key: '2',
      name: '記憶體不足通知',
      type: '通知',
      condition: '記憶體 < 10% 持續 2 分鐘',
      severity: '嚴重',
      status: '啟用',
      triggerCount: '5',
    },
    {
      key: '3',
      name: '磁碟空間告警',
      type: '告警',
      condition: '磁碟 > 90% 持續 10 分鐘',
      severity: '警告',
      status: '禁用',
      triggerCount: '0',
    },
  ]

  return (
    <div>
      <PageHeader
        title="事件規則"
        subtitle="配置系統監控和告警規則"
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
        onRefresh={() => console.log('刷新規則列表')}
        actions={[
          {
            key: 'test',
            label: '測試規則',
            icon: <PlayCircleOutlined />,
            tooltip: '測試選中的規則',
          },
          {
            key: 'batch',
            label: '批量操作',
            icon: <DeleteOutlined />,
            tooltip: '批量啟用/禁用規則',
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

export default EventRulePage
