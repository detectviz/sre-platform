import React from 'react'
import { Table, Tag, Avatar } from 'antd'
import { FilterOutlined, ReloadOutlined, UserOutlined, PlusOutlined } from '@ant-design/icons'
import { TableLayout } from '../components/layouts'
import { ToolbarActions } from '../components/ToolbarActions'
import { DEFAULT_PAGINATION, createActionColumn, COMMON_ACTIONS } from '../components'


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
  const filters = [
    {
      key: 'role',
      label: '角色',
      options: [
        { value: 'admin', label: '管理員' },
        { value: 'manager', label: '經理' },
        { value: 'user', label: '用戶' },
        { value: 'viewer', label: '檢視者' }
      ]
    },
    {
      key: 'status',
      label: '狀態',
      options: [
        { value: 'active', label: '活躍' },
        { value: 'inactive', label: '停用' }
      ]
    },
    {
      key: 'department',
      label: '部門',
      options: [
        { value: 'IT', label: 'IT 部門' },
        { value: '開發', label: '開發部門' },
        { value: '營運', label: '營運部門' },
        { value: '測試', label: '測試部門' }
      ]
    }
  ]

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
