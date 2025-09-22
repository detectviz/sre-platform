import React from 'react'
import { Table, Tag, Progress, Space, Button, Tooltip, Card } from 'antd'
import { PageHeader } from '../components/PageHeader'
import { ContextualKPICard } from '../components/ContextualKPICard'
import { ToolbarActions } from '../components/ToolbarActions'
import {
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  GroupOutlined,
  PlusOutlined,
  AppstoreOutlined,
} from '@ant-design/icons'

const ResourceGroupPage: React.FC = () => {
  const kpiData = [
    {
      title: '總群組數',
      value: '12',
      description: '業務邏輯分組',
      status: 'info' as const,
    },
    {
      title: '健康群組',
      value: '10',
      description: '正常運行的群組',
      trend: '+1',
      status: 'success' as const,
    },
    {
      title: '告警群組',
      value: '2',
      description: '需要關注的群組',
      status: 'warning' as const,
    },
    {
      title: '平均資源數',
      value: '31',
      description: '每個群組的平均資源數量',
      trend: '+3',
      status: 'info' as const,
    },
  ]

  const columns = [
    {
      title: '群組名稱',
      dataIndex: 'name',
      key: 'name',
      sorter: true,
    },
    {
      title: '群組類型',
      dataIndex: 'type',
      key: 'type',
      render: (type: string) => (
        <Tag color={type === '業務群組' ? 'blue' : type === '環境群組' ? 'green' : 'orange'}>
          {type}
        </Tag>
      ),
    },
    {
      title: '資源數量',
      dataIndex: 'resourceCount',
      key: 'resourceCount',
      sorter: true,
    },
    {
      title: '健康狀態',
      dataIndex: 'healthStatus',
      key: 'healthStatus',
      render: (healthStatus: string) => {
        const color = healthStatus === '健康' ? 'green' : healthStatus === '警告' ? 'orange' : 'red'
        return <Tag color={color}>{healthStatus}</Tag>
      },
    },
    {
      title: 'CPU 使用率',
      dataIndex: 'cpuUsage',
      key: 'cpuUsage',
      render: (cpuUsage: number) => (
        <Progress
          percent={cpuUsage}
          size="small"
          status={cpuUsage > 80 ? 'exception' : cpuUsage > 60 ? 'normal' : 'success'}
          strokeColor={cpuUsage > 80 ? '#ff4d4f' : cpuUsage > 60 ? '#faad14' : '#52c41a'}
          style={{ width: 80 }}
        />
      ),
    },
    {
      title: '記憶體使用率',
      dataIndex: 'memoryUsage',
      key: 'memoryUsage',
      render: (memoryUsage: number) => (
        <Progress
          percent={memoryUsage}
          size="small"
          status={memoryUsage > 80 ? 'exception' : memoryUsage > 60 ? 'normal' : 'success'}
          strokeColor={memoryUsage > 80 ? '#ff4d4f' : memoryUsage > 60 ? '#faad14' : '#52c41a'}
          style={{ width: 80 }}
        />
      ),
    },
    {
      title: '創建時間',
      dataIndex: 'createTime',
      key: 'createTime',
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
          <Tooltip title="管理資源">
            <Button type="text" size="small" icon={<AppstoreOutlined />} />
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
      name: 'API 服務群組',
      type: '業務群組',
      resourceCount: 45,
      healthStatus: '健康',
      cpuUsage: 35,
      memoryUsage: 42,
      createTime: '2024-01-10 10:00:00',
    },
    {
      key: '2',
      name: '資料庫群組',
      type: '業務群組',
      resourceCount: 28,
      healthStatus: '警告',
      cpuUsage: 78,
      memoryUsage: 85,
      createTime: '2024-01-08 09:30:00',
    },
    {
      key: '3',
      name: '測試環境群組',
      type: '環境群組',
      resourceCount: 15,
      healthStatus: '健康',
      cpuUsage: 22,
      memoryUsage: 31,
      createTime: '2024-01-12 14:20:00',
    },
    {
      key: '4',
      name: '緩存服務群組',
      type: '業務群組',
      resourceCount: 8,
      healthStatus: '異常',
      cpuUsage: 95,
      memoryUsage: 88,
      createTime: '2024-01-05 16:45:00',
    },
  ]

  return (
    <div>
      <PageHeader
        title="資源群組"
        subtitle="管理業務邏輯和環境分組"
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
        onRefresh={() => console.log('刷新資源群組列表')}
        actions={[
          {
            key: 'create',
            label: '新增群組',
            icon: <GroupOutlined />,
            tooltip: '創建新的資源群組',
          },
          {
            key: 'batch',
            label: '批量操作',
            icon: <DeleteOutlined />,
            tooltip: '批量管理資源群組',
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

export default ResourceGroupPage
