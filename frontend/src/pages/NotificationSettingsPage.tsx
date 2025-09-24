import React from 'react'
import { useTabs } from '../hooks'
import { Tabs, Table, Tag, Space } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { PageHeader } from '../components/PageHeader'
import { ContextualKPICard } from '../components/ContextualKPICard'
import { ToolbarActions } from '../components/ToolbarActions'
import { PageLayout } from '../components/PageLayout'
import { createActionColumn, COMMON_ACTIONS } from '../components/table'
import {
  BellOutlined,
  PlusOutlined,
} from '@ant-design/icons'


const NotificationSettingsPage: React.FC = () => {
  const { activeTab, handleTabChange } = useTabs('strategies', {}, {
    strategies: ['/settings/notifications/strategies', '/settings/notifications'],
    channels: ['/settings/notifications/channels', '/settings/notifications'],
    history: ['/settings/notifications/history', '/settings/notifications'],
  })

  // 處理函數
  const handleRefresh = () => {
    console.log('刷新數據')
  }

  const handleAdd = () => {
    console.log('新增記錄')
  }

  const handleEdit = (record: any) => {
    console.log('編輯記錄:', record)
  }

  const handleDelete = (record: any) => {
    console.log('刪除記錄:', record)
  }

  // 模擬數據
  const strategyData = [
    {
      key: '1',
      name: '嚴重告警',
      description: '系統嚴重錯誤和關鍵服務故障',
      enabled: true,
      channels: ['Email', 'Slack'],
      triggerCount: 15,
      lastTriggered: '2024-01-15 14:30',
    },
    {
      key: '2',
      name: '警告告警',
      description: '系統性能下降和資源不足',
      enabled: true,
      channels: ['Email'],
      triggerCount: 8,
      lastTriggered: '2024-01-15 12:15',
    },
    {
      key: '3',
      name: '資訊通知',
      description: '系統正常維護和更新通知',
      enabled: false,
      channels: ['Email'],
      triggerCount: 0,
      lastTriggered: '2024-01-14 09:00',
    },
  ]

  const channelData = [
    {
      key: '1',
      name: 'Email',
      type: '電子郵件',
      status: 'active',
      recipientCount: 12,
      successRate: '98.5%',
      lastTest: '2024-01-15 14:00',
    },
    {
      key: '2',
      name: 'Slack',
      type: '即時通訊',
      status: 'active',
      recipientCount: 8,
      successRate: '99.2%',
      lastTest: '2024-01-15 13:30',
    },
    {
      key: '3',
      name: 'Webhook',
      type: 'HTTP 回調',
      status: 'inactive',
      recipientCount: 3,
      successRate: '95.1%',
      lastTest: '2024-01-15 11:00',
    },
  ]

  const historyData = [
    {
      key: '1',
      timestamp: '2024-01-15 14:30:25',
      strategy: '嚴重告警',
      channel: 'Email',
      recipient: 'admin@company.com',
      status: 'success',
      responseTime: '1.2s',
    },
    {
      key: '2',
      timestamp: '2024-01-15 14:30:25',
      strategy: '嚴重告警',
      channel: 'Slack',
      recipient: '#alerts',
      status: 'success',
      responseTime: '0.8s',
    },
    {
      key: '3',
      timestamp: '2024-01-15 12:15:10',
      strategy: '警告告警',
      channel: 'Email',
      recipient: 'ops@company.com',
      status: 'failed',
      responseTime: 'N/A',
    },
  ]

  // 表格列定義
  const strategyColumns: ColumnsType = [
    {
      title: '策略名稱',
      dataIndex: 'name',
      key: 'name',
      width: 150,
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
    },
    {
      title: '狀態',
      dataIndex: 'enabled',
      key: 'enabled',
      width: 100,
      render: (enabled: boolean) => (
        <Tag color={enabled ? 'green' : 'red'}>
          {enabled ? '啟用' : '停用'}
        </Tag>
      ),
    },
    {
      title: '通知管道',
      dataIndex: 'channels',
      key: 'channels',
      width: 150,
      render: (channels: string[]) => (
        <Space wrap>
          {channels.map(channel => (
            <Tag key={channel} color="blue">{channel}</Tag>
          ))}
        </Space>
      ),
    },
    {
      title: '觸發次數',
      dataIndex: 'triggerCount',
      key: 'triggerCount',
      width: 100,
    },
    {
      title: '最後觸發',
      dataIndex: 'lastTriggered',
      key: 'lastTriggered',
      width: 150,
    },
    createActionColumn([
      { ...COMMON_ACTIONS.EDIT, onClick: handleEdit },
      { ...COMMON_ACTIONS.DELETE, onClick: handleDelete },
    ]),
  ]

  const channelColumns: ColumnsType = [
    {
      title: '管道名稱',
      dataIndex: 'name',
      key: 'name',
      width: 120,
    },
    {
      title: '類型',
      dataIndex: 'type',
      key: 'type',
      width: 120,
    },
    {
      title: '狀態',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: string) => (
        <Tag color={status === 'active' ? 'green' : 'red'}>
          {status === 'active' ? '活躍' : '停用'}
        </Tag>
      ),
    },
    {
      title: '收件人數',
      dataIndex: 'recipientCount',
      key: 'recipientCount',
      width: 100,
    },
    {
      title: '成功率',
      dataIndex: 'successRate',
      key: 'successRate',
      width: 100,
      render: (rate: string) => (
        <span style={{ color: rate.startsWith('9') ? '#52c41a' : '#faad14' }}>
          {rate}
        </span>
      ),
    },
    {
      title: '最後測試',
      dataIndex: 'lastTest',
      key: 'lastTest',
      width: 150,
    },
    createActionColumn([
      { ...COMMON_ACTIONS.EDIT, onClick: handleEdit },
      { ...COMMON_ACTIONS.DELETE, onClick: handleDelete },
    ]),
  ]

  const historyColumns: ColumnsType = [
    {
      title: '時間',
      dataIndex: 'timestamp',
      key: 'timestamp',
      width: 180,
    },
    {
      title: '策略',
      dataIndex: 'strategy',
      key: 'strategy',
      width: 120,
    },
    {
      title: '管道',
      dataIndex: 'channel',
      key: 'channel',
      width: 100,
    },
    {
      title: '收件人',
      dataIndex: 'recipient',
      key: 'recipient',
      width: 150,
    },
    {
      title: '狀態',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: string) => (
        <Tag color={status === 'success' ? 'green' : 'red'}>
          {status === 'success' ? '成功' : '失敗'}
        </Tag>
      ),
    },
    {
      title: '回應時間',
      dataIndex: 'responseTime',
      key: 'responseTime',
      width: 100,
    },
  ]

  const kpiData = [
    {
      title: '通知管道',
      value: '6/8',
      description: '已啟用的通知管道',
      trend: 'stable',
      status: 'info' as const,
    },
    {
      title: '今日通知量',
      value: '47',
      description: '2則發送失敗',
      trend: 'up',
      status: 'info' as const,
    },
    {
      title: '送達率',
      value: '97.3%',
      description: '平均回應時間1.2s',
      trend: 'up',
      status: 'success' as const,
    },
  ]

  const tabItems = [
    {
      key: 'strategies',
      label: '通知策略',
      icon: <BellOutlined />,
      children: (
        <div>
          <ToolbarActions
            onRefresh={handleRefresh}
            onExport={() => console.log('匯出策略')}
            showRefresh={true}
            showExport={true}
            actions={[{
              key: 'add',
              label: '新增策略',
              icon: <PlusOutlined />,
              onClick: handleAdd,
              tooltip: '新增通知策略',
            }]}
          />
          <Table
            columns={strategyColumns}
            dataSource={strategyData}
            size="middle"
            pagination={{
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total: number, range: [number, number]) => `第 ${range[0]}-${range[1]} 項，共 ${total} 項`,
            }}
          />
        </div>
      ),
    },
    {
      key: 'channels',
      label: '通知管道',
      icon: <BellOutlined />,
      children: (
        <div>
          <ToolbarActions
            onRefresh={handleRefresh}
            onExport={() => console.log('匯出管道')}
            showRefresh={true}
            showExport={true}
            actions={[{
              key: 'add',
              label: '新增管道',
              icon: <PlusOutlined />,
              onClick: handleAdd,
              tooltip: '新增通知管道',
            }]}
          />
          <Table
            columns={channelColumns}
            dataSource={channelData}
            size="middle"
            pagination={{
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total: number, range: [number, number]) => `第 ${range[0]}-${range[1]} 項，共 ${total} 項`,
            }}
          />
        </div>
      ),
    },
    {
      key: 'history',
      label: '通知歷史',
      icon: <BellOutlined />,
      children: (
        <div>
          <ToolbarActions
            onRefresh={handleRefresh}
            onExport={() => console.log('匯出歷史')}
            showRefresh={true}
            showExport={true}
          />
          <Table
            columns={historyColumns}
            dataSource={historyData}
            size="middle"
            pagination={{
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total: number, range: [number, number]) => `第 ${range[0]}-${range[1]} 項，共 ${total} 項`,
            }}
          />
        </div>
      ),
    },
  ]

  return (
    <PageLayout
      header={
        <PageHeader
          title="通知管理"
          subtitle="提供統一的通知策略配置、管道管理和歷史記錄查詢功能"
        />
      }
      kpiCards={
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: 'var(--spacing-lg)',
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
      }
      tabs={
        <Tabs
          activeKey={activeTab}
          onChange={handleTabChange}
          items={tabItems}
        />
      }
    />
  )
}

export default NotificationSettingsPage
