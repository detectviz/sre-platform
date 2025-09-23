import React, { useState } from 'react'
import { useTabs } from '../hooks'
import { Table, Tag, Progress, Space, Button, Tooltip, Tabs } from 'antd'
import { PageHeader } from '../components/PageHeader'
import { ContextualKPICard } from '../components/ContextualKPICard'
import { ToolbarActions } from '../components/ToolbarActions'
import {
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  ReloadOutlined,
  ScanOutlined,
  AppstoreOutlined,
  ClusterOutlined,
  ShareAltOutlined,
} from '@ant-design/icons'

const ResourcesPage: React.FC = () => {
  const { activeTab, handleTabChange } = useTabs('list', {
    list: '/resources/list',
    groups: '/resources/groups',
    topology: '/resources/topology',
  })
  const kpiData = [
    {
      title: '總資源數',
      value: '374',
      description: '涵蓋所有業務系統',
      status: 'info' as const,
    },
    {
      title: '健康資源',
      value: '326',
      description: '正常運行中',
      trend: '+2.1%',
      status: 'success' as const,
    },
    {
      title: '告警資源',
      value: '35',
      description: '需要關注',
      trend: '+3',
      status: 'warning' as const,
    },
    {
      title: '資源群組',
      value: '12',
      description: '業務邏輯分組',
      status: 'info' as const,
    },
  ]

  const columns = [
    {
      title: '資源狀態',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const color = status === '正常' ? 'green' : status === '警告' ? 'orange' : 'red'
        return <Tag color={color}>{status}</Tag>
      },
    },
    {
      title: '資源名稱',
      dataIndex: 'name',
      key: 'name',
      sorter: true,
    },
    {
      title: 'IP 位址',
      dataIndex: 'ip',
      key: 'ip',
      sorter: true,
    },
    {
      title: '位置',
      dataIndex: 'location',
      key: 'location',
    },
    {
      title: '類型',
      dataIndex: 'type',
      key: 'type',
      render: (type: string) => (
        <Tag color="blue">{type}</Tag>
      ),
    },
    {
      title: 'CPU 使用率',
      dataIndex: 'cpu',
      key: 'cpu',
      render: (cpu: number) => (
        <Progress
          percent={cpu}
          size="small"
          status={cpu > 80 ? 'exception' : cpu > 60 ? 'normal' : 'success'}
          strokeColor={cpu > 80 ? '#ff4d4f' : cpu > 60 ? '#faad14' : '#52c41a'}
          style={{ width: 80 }}
        />
      ),
    },
    {
      title: '記憶體使用率',
      dataIndex: 'memory',
      key: 'memory',
      render: (memory: number) => (
        <Progress
          percent={memory}
          size="small"
          status={memory > 80 ? 'exception' : memory > 60 ? 'normal' : 'success'}
          strokeColor={memory > 80 ? '#ff4d4f' : memory > 60 ? '#faad14' : '#52c41a'}
          style={{ width: 80 }}
        />
      ),
    },
    {
      title: '磁碟使用率',
      dataIndex: 'disk',
      key: 'disk',
      render: (disk: number) => (
        <Progress
          percent={disk}
          size="small"
          status={disk > 80 ? 'exception' : disk > 60 ? 'normal' : 'success'}
          strokeColor={disk > 80 ? '#ff4d4f' : disk > 60 ? '#faad14' : '#52c41a'}
          style={{ width: 80 }}
        />
      ),
    },
    {
      title: '網路流量',
      dataIndex: 'network',
      key: 'network',
    },
    {
      title: '最後更新',
      dataIndex: 'lastUpdate',
      key: 'lastUpdate',
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
          <Tooltip title="刪除">
            <Button type="text" size="small" icon={<DeleteOutlined />} />
          </Tooltip>
          <Tooltip title="重新整理">
            <Button type="text" size="small" icon={<ReloadOutlined />} />
          </Tooltip>
        </Space>
      ),
    },
  ]

  const mockData = [
    {
      key: '1',
      status: '正常',
      name: 'api-server-01',
      ip: '192.168.1.100',
      location: 'us-east-1',
      type: '伺服器',
      cpu: 45,
      memory: 62,
      disk: 34,
      network: '1.2Gbps / 800Mbps',
      lastUpdate: '2024-01-15 10:30:00',
    },
    {
      key: '2',
      status: '警告',
      name: 'db-primary',
      ip: '192.168.1.101',
      location: 'us-east-1',
      type: '資料庫',
      cpu: 78,
      memory: 85,
      disk: 45,
      network: '2.1Gbps / 1.8Gbps',
      lastUpdate: '2024-01-15 10:25:00',
    },
    {
      key: '3',
      status: '正常',
      name: 'web-server-02',
      ip: '192.168.1.102',
      location: 'us-west-2',
      type: '伺服器',
      cpu: 32,
      memory: 45,
      disk: 28,
      network: '800Mbps / 600Mbps',
      lastUpdate: '2024-01-15 10:28:00',
    },
    {
      key: '4',
      status: '異常',
      name: 'cache-server-01',
      ip: '192.168.1.103',
      location: 'eu-west-1',
      type: '快取',
      cpu: 95,
      memory: 88,
      disk: 76,
      network: '3.2Gbps / 2.8Gbps',
      lastUpdate: '2024-01-15 10:15:00',
    },
  ]

  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [locationFilter, setLocationFilter] = useState<string>('all')



  const handleResourceColumnChange = (key: string, visible: boolean) => {
    console.log('資源欄位設定:', key, visible)
  }

  const statusOptions = [
    { value: 'all', label: '所有狀態' },
    { value: '正常', label: '正常' },
    { value: '警告', label: '警告' },
    { value: '異常', label: '異常' },
  ]

  const typeOptions = [
    { value: 'all', label: '所有類型' },
    { value: '伺服器', label: '伺服器' },
    { value: '資料庫', label: '資料庫' },
    { value: '快取', label: '快取' },
    { value: '網路設備', label: '網路設備' },
  ]

  const locationOptions = [
    { value: 'all', label: '所有位置' },
    { value: 'us-east-1', label: 'US East 1' },
    { value: 'us-west-2', label: 'US West 2' },
    { value: 'eu-west-1', label: 'EU West 1' },
    { value: 'ap-southeast-1', label: 'Asia Pacific SE 1' },
  ]

  const activeResourceFiltersCount = [
    statusFilter !== 'all',
    typeFilter !== 'all',
    locationFilter !== 'all'
  ].filter(Boolean).length

  const handleSearch = (value: string) => {
    console.log('搜尋資源:', value)
  }

  const resourceColumnOptions = [
    { key: 'status', label: '資源狀態' },
    { key: 'name', label: '資源名稱' },
    { key: 'ip', label: 'IP 地址' },
    { key: 'location', label: '位置' },
    { key: 'type', label: '類型' },
    { key: 'cpu', label: 'CPU 使用率' },
    { key: 'memory', label: '記憶體使用率' },
    { key: 'disk', label: '磁碟使用率' },
    { key: 'network', label: '網路流量' },
    { key: 'lastUpdate', label: '最後更新' },
  ]

  const filters = [
    {
      key: 'status',
      label: '資源狀態',
      options: statusOptions,
      value: statusFilter,
      onChange: setStatusFilter,
    },
    {
      key: 'type',
      label: '資源類型',
      options: typeOptions,
      value: typeFilter,
      onChange: setTypeFilter,
    },
    {
      key: 'location',
      label: '位置',
      options: locationOptions,
      value: locationFilter,
      onChange: setLocationFilter,
    },
  ]

  const renderTabContent = () => {
    switch (activeTab) {
      case 'list':
        return (
          <div>
            <ToolbarActions
              onRefresh={() => console.log('刷新資源列表')}
              onSearch={handleSearch}
              searchPlaceholder="搜尋資源名稱、IP 或位置..."
              actions={[
                {
                  key: 'scan',
                  label: '掃描網路',
                  icon: <ScanOutlined />,
                  tooltip: '掃描網路資源',
                },
                {
                  key: 'resource-export',
                  label: '匯出',
                  icon: <DeleteOutlined />,
                  tooltip: '匯出資源列表',
                },
              ]}
              filters={filters}
              showFilters={true}
              filterCount={activeResourceFiltersCount}
              columns={resourceColumnOptions}
              onColumnChange={handleResourceColumnChange}
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
      case 'groups':
        return (
          <div>
            <ToolbarActions
              onRefresh={() => console.log('刷新資源群組')}
              onSearch={handleSearch}
              searchPlaceholder="搜尋群組名稱..."
              actions={[
                {
                  key: 'create-group',
                  label: '新增群組',
                  icon: <EditOutlined />,
                  tooltip: '創建新的資源群組',
                },
                {
                  key: 'batch-group',
                  label: '批量操作',
                  icon: <DeleteOutlined />,
                  tooltip: '批量管理資源群組',
                },
              ]}
            />
            <div style={{ padding: '16px' }}>
              <p>資源群組管理功能開發中...</p>
            </div>
          </div>
        )
      case 'topology':
        return (
          <div>
            <ToolbarActions
              onRefresh={() => console.log('刷新拓撲視圖')}
              onSearch={handleSearch}
              searchPlaceholder="搜尋拓撲節點..."
              actions={[
                {
                  key: 'fullscreen',
                  label: '全屏',
                  icon: <AppstoreOutlined />,
                  tooltip: '全屏顯示',
                },
                {
                  key: 'topology-export',
                  label: '匯出',
                  icon: <DeleteOutlined />,
                  tooltip: '匯出拓撲圖',
                },
              ]}
            />
            <div style={{ padding: '16px' }}>
              <p>拓撲視圖功能開發中...</p>
            </div>
          </div>
        )
      default:
        return null
    }
  }

  const tabItems = [
    {
      key: 'list',
      label: '資源列表',
      icon: <AppstoreOutlined />,
      children: renderTabContent(),
    },
    {
      key: 'groups',
      label: '資源群組',
      icon: <ClusterOutlined />,
      children: renderTabContent(),
    },
    {
      key: 'topology',
      label: '拓撲視圖',
      icon: <ShareAltOutlined />,
      children: renderTabContent(),
    },
  ]

  return (
    <div>
      <PageHeader
        title="資源管理"
        subtitle="監控和管理所有基礎設施資源"
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

export default ResourcesPage
