import React from 'react'
import { Table, Space, Select, Tag, Avatar, Input } from 'antd'
import { FilterOutlined, ReloadOutlined, EditOutlined, UserOutlined, PlusOutlined, SearchOutlined } from '@ant-design/icons'
import { TableLayout } from '../components/layouts'
import { ToolbarActions } from '../components/ToolbarActions'
import { DEFAULT_PAGINATION, createActionColumn, COMMON_ACTIONS } from '../components'

const { Option } = Select

// 模擬用戶數據
const mockUserData = [
  {
    id: '1',
    username: 'admin',
    email: 'admin@company.com',
    displayName: '系統管理員',
    role: 'admin',
    status: 'active',
    lastLogin: '2024-01-15 14:30:00',
    createdAt: '2024-01-01',
    department: 'IT 部門',
    phone: '0912345678',
  },
  {
    id: '2',
    username: 'john.doe',
    email: 'john.doe@company.com',
    displayName: 'John Doe',
    role: 'user',
    status: 'active',
    lastLogin: '2024-01-15 12:45:00',
    createdAt: '2024-01-05',
    department: '開發部門',
    phone: '0987654321',
  },
  {
    id: '3',
    username: 'jane.smith',
    email: 'jane.smith@company.com',
    displayName: 'Jane Smith',
    role: 'manager',
    status: 'active',
    lastLogin: '2024-01-14 16:20:00',
    createdAt: '2024-01-03',
    department: '營運部門',
    phone: '0955123456',
  },
  {
    id: '4',
    username: 'disabled.user',
    email: 'disabled.user@company.com',
    displayName: 'Disabled User',
    role: 'user',
    status: 'inactive',
    lastLogin: '2024-01-10 09:15:00',
    createdAt: '2024-01-02',
    department: '測試部門',
    phone: '0933456789',
  },
]

// 表格列定義
const userColumns = [
  {
    title: '用戶',
    dataIndex: 'username',
    key: 'username',
    width: 150,
    render: (username: string, record: any) => (
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <Avatar size="small" icon={<UserOutlined />} />
        <div>
          <div style={{ fontWeight: 'bold' }}>{record.displayName}</div>
          <div style={{ fontSize: '12px', color: '#666' }}>{username}</div>
        </div>
      </div>
    ),
  },
  {
    title: '電子郵件',
    dataIndex: 'email',
    key: 'email',
    width: 200,
    ellipsis: true,
  },
  {
    title: '角色',
    dataIndex: 'role',
    key: 'role',
    width: 100,
    render: (role: string) => {
      const colorMap = {
        admin: 'red',
        manager: 'blue',
        user: 'green',
        viewer: 'orange',
      }
      return (
        <Tag color={colorMap[role as keyof typeof colorMap] || 'default'}>
          {role.toUpperCase()}
        </Tag>
      )
    },
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
    title: '部門',
    dataIndex: 'department',
    key: 'department',
    width: 120,
  },
  {
    title: '電話',
    dataIndex: 'phone',
    key: 'phone',
    width: 130,
  },
  {
    title: '最後登入',
    dataIndex: 'lastLogin',
    key: 'lastLogin',
    width: 150,
  },
  {
    title: '建立時間',
    dataIndex: 'createdAt',
    key: 'createdAt',
    width: 120,
  },
  createActionColumn([
    { ...COMMON_ACTIONS.VIEW, onClick: (record) => console.log('View user', record) },
    { ...COMMON_ACTIONS.EDIT, onClick: (record) => console.log('Edit user', record) },
    { ...COMMON_ACTIONS.DELETE, onClick: (record) => console.log('Delete user', record) },
  ]),
]

// KPI 卡片數據
const kpiCardsData = [
  {
    title: '總用戶數',
    value: '156',
    change: '+8',
    changeType: 'increase' as const,
    icon: '👥',
  },
  {
    title: '活躍用戶',
    value: '142',
    change: '+5',
    changeType: 'increase' as const,
    icon: '✅',
  },
  {
    title: '管理員',
    value: '3',
    change: '0',
    changeType: 'neutral' as const,
    icon: '👑',
  },
  {
    title: '停用用戶',
    value: '14',
    change: '+2',
    changeType: 'increase' as const,
    icon: '❌',
  },
]

const UserManagementPage: React.FC = () => {
  // 工具列動作
  const toolbarActions = [
    {
      key: 'create',
      label: '新增用戶',
      icon: <PlusOutlined />,
      type: 'primary',
      onClick: () => {
        console.log('Create new user')
      },
    },
    {
      key: 'import',
      label: '匯入用戶',
      icon: <FilterOutlined />,
      onClick: () => {
        console.log('Import users')
      },
    },
    {
      key: 'export',
      label: '匯出用戶',
      icon: <FilterOutlined />,
      onClick: () => {
        console.log('Export users')
      },
    },
    {
      key: 'refresh',
      label: '刷新',
      icon: <ReloadOutlined />,
      onClick: () => {
        console.log('Refresh users')
      },
    },
  ]

  // 篩選條件
  const filters = (
    <Space wrap>
      <Input
        placeholder="搜尋用戶名稱或郵件"
        prefix={<SearchOutlined />}
        style={{ width: 250 }}
      />
      <Select placeholder="角色" style={{ width: 100 }}>
        <Option value="admin">管理員</Option>
        <Option value="manager">經理</Option>
        <Option value="user">用戶</Option>
        <Option value="viewer">檢視者</Option>
      </Select>
      <Select placeholder="狀態" style={{ width: 100 }}>
        <Option value="active">活躍</Option>
        <Option value="inactive">停用</Option>
      </Select>
      <Select placeholder="部門" style={{ width: 150 }}>
        <Option value="IT">IT 部門</Option>
        <Option value="開發">開發部門</Option>
        <Option value="營運">營運部門</Option>
        <Option value="測試">測試部門</Option>
      </Select>
    </Space>
  )

  return (
    <TableLayout
      header={
        <div>
          <h1>人員管理</h1>
          <p>管理系統用戶帳戶和權限</p>
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
            searchPlaceholder="搜尋用戶"
            showSearch={true}
          />
        )
      }}
      content={
        <Table
          columns={userColumns}
          dataSource={mockUserData}
          rowKey="id"
          pagination={DEFAULT_PAGINATION}
          scroll={{ x: 1200 }}
          size="middle"
        />
      }
    />
  )
}

export default UserManagementPage
