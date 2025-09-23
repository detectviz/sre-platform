import React from 'react'
import { Table, Space, Select, Tag, Input } from 'antd'
import { ReloadOutlined, SafetyOutlined, PlusOutlined } from '@ant-design/icons'
import { TableLayout } from '../components/layouts'
import { ToolbarActions } from '../components/ToolbarActions'
import { DEFAULT_PAGINATION, createActionColumn, COMMON_ACTIONS } from '../components'

const { Option } = Select

// 模擬角色數據
const mockRoleData = [
  {
    id: '1',
    name: '系統管理員',
    description: '擁有系統完整管理權限',
    permissions: ['all'],
    userCount: 3,
    status: 'active',
    createdAt: '2024-01-01',
    lastUpdated: '2024-01-15 10:30:00',
  },
  {
    id: '2',
    name: 'SRE 工程師',
    description: '負責系統監控和自動化',
    permissions: ['monitoring', 'alerting', 'automation', 'resources:read'],
    userCount: 8,
    status: 'active',
    createdAt: '2024-01-02',
    lastUpdated: '2024-01-14 16:20:00',
  },
  {
    id: '3',
    name: '開發工程師',
    description: '負責應用程式開發',
    permissions: ['deployment', 'code-review', 'dashboard:write'],
    userCount: 15,
    status: 'active',
    createdAt: '2024-01-03',
    lastUpdated: '2024-01-13 09:15:00',
  },
  {
    id: '4',
    name: '檢視者',
    description: '僅能檢視資料，無法修改',
    permissions: ['monitoring:read', 'dashboard:read'],
    userCount: 25,
    status: 'active',
    createdAt: '2024-01-04',
    lastUpdated: '2024-01-12 14:45:00',
  },
  {
    id: '5',
    name: '已停用角色',
    description: '已停用的角色',
    permissions: [],
    userCount: 0,
    status: 'inactive',
    createdAt: '2024-01-05',
    lastUpdated: '2024-01-10 11:30:00',
  },
]

const roleColumns = [
  {
    title: '角色名稱',
    dataIndex: 'name',
    key: 'name',
    width: 150,
    render: (name: string) => (
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <SafetyOutlined style={{ color: '#1890ff' }} />
        <span style={{ fontWeight: 'bold' }}>{name}</span>
      </div>
    ),
  },
  {
    title: '描述',
    dataIndex: 'description',
    key: 'description',
    ellipsis: true,
    width: 300,
  },
  {
    title: '權限',
    dataIndex: 'permissions',
    key: 'permissions',
    width: 300,
    render: (permissions: string[]) => (
      <Space wrap>
        {permissions.slice(0, 3).map((permission, index) => (
          <Tag key={index} color="blue">
            {permission}
          </Tag>
        ))}
        {permissions.length > 3 && (
          <Tag>+{permissions.length - 3}</Tag>
        )}
        {permissions.length === 0 && (
          <span style={{ color: '#999', fontSize: '12px' }}>無權限</span>
        )}
      </Space>
    ),
  },
  {
    title: '用戶數量',
    dataIndex: 'userCount',
    key: 'userCount',
    width: 100,
    render: (count: number) => (
      <Tag color={count > 0 ? 'green' : 'default'}>{count} 人</Tag>
    ),
  },
  {
    title: '狀態',
    dataIndex: 'status',
    key: 'status',
    width: 100,
    render: (status: string) => (
      <Tag color={status === 'active' ? 'green' : 'default'}>
        {status === 'active' ? '活躍' : '停用'}
      </Tag>
    ),
  },
  {
    title: '最後更新',
    dataIndex: 'lastUpdated',
    key: 'lastUpdated',
    width: 150,
  },
  createActionColumn([
    { ...COMMON_ACTIONS.VIEW, onClick: (record) => console.log('View role', record) },
    { ...COMMON_ACTIONS.EDIT, onClick: (record) => console.log('Edit role', record) },
    { ...COMMON_ACTIONS.DELETE, onClick: (record) => console.log('Delete role', record) },
  ]),
]

const kpiCardsData = [
  {
    title: '總角色數',
    value: '8',
    change: '+1',
    changeType: 'increase' as const,
    icon: '🔐',
  },
  {
    title: '活躍角色',
    value: '7',
    change: '+1',
    changeType: 'increase' as const,
    icon: '✅',
  },
  {
    title: '系統權限',
    value: '24',
    change: '+2',
    changeType: 'increase' as const,
    icon: '🛡️',
  },
  {
    title: '停用角色',
    value: '1',
    change: '0',
    changeType: 'neutral' as const,
    icon: '❌',
  },
]

const RoleManagementPage: React.FC = () => {
  const toolbarActions = [
    {
      key: 'create',
      label: '新增角色',
      icon: <PlusOutlined />,
      type: 'primary',
      onClick: () => console.log('Create new role'),
    },
    {
      key: 'refresh',
      label: '刷新',
      icon: <ReloadOutlined />,
      onClick: () => console.log('Refresh roles'),
    },
  ]

  const filters = (
    <Space wrap>
      <Input placeholder="搜尋角色名稱" prefix={<SearchOutlined />} style={{ width: 200 }} />
      <Select placeholder="狀態" style={{ width: 100 }}>
        <Option value="active">活躍</Option>
        <Option value="inactive">停用</Option>
      </Select>
    </Space>
  )

  return (
    <TableLayout
      header={<div><h1>角色管理</h1><p>管理系統角色和權限</p></div>}
      config={{
        mode: 'table',
        spacing: { content: '16px' },
        sidebar: { show: false },
        toolbar: (
          <ToolbarActions
            actions={toolbarActions}
            filters={filters}
            searchPlaceholder="搜尋角色"
            showSearch={true}
          />
        )
      }}
      content={
        <Table
          columns={roleColumns}
          dataSource={mockRoleData}
          rowKey="id"
          pagination={DEFAULT_PAGINATION}
          scroll={{ x: 1200 }}
          size="middle"
        />
      }
    />
  )
}

export default RoleManagementPage
