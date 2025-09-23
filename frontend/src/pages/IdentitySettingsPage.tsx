import React from 'react'
import { useTabs } from '../hooks'
import { Tabs, Table, Button, Tag, Badge, Space, Tooltip, Input } from 'antd'
import { PageHeader } from '../components/PageHeader'
import { ContextualKPICard } from '../components/ContextualKPICard'
import { ToolbarActions } from '../components/ToolbarActions'
import { PageLayout } from '../components/PageLayout'
import {
  UserOutlined,
  TeamOutlined,
  IdcardOutlined,
  AuditOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  PlusOutlined,
} from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'


// 數據接口定義
interface UserData {
  key: string
  username: string
  name: string
  email: string
  teams: string[]
  roles: string[]
  lastLogin: string
  status: string
}

interface TeamData {
  key: string
  name: string
  description: string
  owner: string
  members: number
  subscribers: number
  status: string
}

interface RoleData {
  key: string
  name: string
  description: string
  permissions: string
  userCount: number
  status: string
}

interface AuditData {
  key: string
  time: string
  user: string
  action: string
  targetType: string
  targetId: string
  result: string
  ip: string
}

const IdentitySettingsPage: React.FC = () => {
  const { activeTab, handleTabChange } = useTabs('users', {
    users: '/settings/identity/users',
    teams: '/settings/identity/teams',
    roles: '/settings/identity/roles',
    audit: '/settings/identity/audit',
  })

  // 狀態管理

  // 工具列操作處理
  const handleRefresh = () => {
    console.log('刷新身份管理數據')
  }

  const handleSearch = (searchText: string) => {
    console.log('搜尋:', searchText)
  }

  const handleExport = () => {
    console.log('導出身份管理報告')
  }

  // 新增操作處理
  const handleAddUser = () => {
    console.log('新增用戶')
  }

  const handleAddTeam = () => {
    console.log('新增團隊')
  }

  const handleAddRole = () => {
    console.log('新增角色')
  }

  // KPI 數據
  const kpiData = [
    {
      title: '總人員數',
      value: '156',
      description: '142 個啟用中',
      trend: '+5.2%',
      status: 'success' as const,
    },
    {
      title: '在線人員',
      value: '89',
      description: '目前活躍人員',
      trend: '+12.1%',
      status: 'success' as const,
    },
    {
      title: '團隊數量',
      value: '12',
      description: '組織架構構造',
      trend: '0%',
      status: 'info' as const,
    },
    {
      title: '待處理邀請',
      value: '5',
      description: '需要跟進處理',
      trend: '+25%',
      status: 'warning' as const,
    },
  ]

  // 人員管理表格配置
  const userColumns: ColumnsType<UserData> = [
    { title: '用戶名稱', dataIndex: 'username', key: 'username', sorter: true },
    { title: '姓名', dataIndex: 'name', key: 'name' },
    { title: '電子郵件', dataIndex: 'email', key: 'email' },
    {
      title: '團隊',
      dataIndex: 'teams',
      key: 'teams',
      render: (teams: string[]) => teams.map((team: string) => (
        <Badge key={team} size="small" style={{ marginRight: '4px' }}>
          {team}
        </Badge>
      ))
    },
    {
      title: '角色',
      dataIndex: 'roles',
      key: 'roles',
      render: (roles: string[]) => roles.map((role: string) => (
        <Badge key={role} size="small" style={{ marginRight: '4px' }}>
          {role}
        </Badge>
      ))
    },
    {
      title: '最後登入',
      dataIndex: 'lastLogin',
      key: 'lastLogin',
      render: (time: string) => new Date(time).toLocaleString('zh-TW')
    },
    {
      title: '狀態',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={status === 'active' ? 'green' : 'red'}>
          {status === 'active' ? '啟用' : '停用'}
        </Tag>
      )
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
        </Space>
      ),
    },
  ]

  const userData: UserData[] = [
    {
      key: '1',
      username: 'john.doe',
      name: 'John Doe',
      email: 'john.doe@company.com',
      teams: ['SRE 團隊', '開發團隊'],
      roles: ['SRE 工程師', '開發者'],
      lastLogin: '2025-09-23 15:30:00',
      status: 'active'
    },
    {
      key: '2',
      username: 'jane.smith',
      name: 'Jane Smith',
      email: 'jane.smith@company.com',
      teams: ['平台團隊'],
      roles: ['平台管理員'],
      lastLogin: '2025-09-23 14:20:00',
      status: 'active'
    },
    {
      key: '3',
      username: 'bob.wilson',
      name: 'Bob Wilson',
      email: 'bob.wilson@company.com',
      teams: ['SRE 團隊'],
      roles: ['SRE 工程師'],
      lastLogin: '2025-09-22 16:45:00',
      status: 'active'
    },
  ]

  // 團隊管理表格配置
  const teamColumns: ColumnsType<TeamData> = [
    { title: '團隊名稱', dataIndex: 'name', key: 'name', sorter: true },
    { title: '描述', dataIndex: 'description', key: 'description', ellipsis: true },
    { title: '負責人', dataIndex: 'owner', key: 'owner' },
    {
      title: '成員數',
      dataIndex: 'members',
      key: 'members',
      sorter: (a, b) => a.members - b.members
    },
    {
      title: '訂閱者',
      dataIndex: 'subscribers',
      key: 'subscribers',
      sorter: (a, b) => a.subscribers - b.subscribers
    },
    {
      title: '狀態',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={status === 'active' ? 'green' : 'red'}>
          {status === 'active' ? '啟用' : '停用'}
        </Tag>
      )
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
        </Space>
      ),
    },
  ]

  const teamData: TeamData[] = [
    {
      key: '1',
      name: 'SRE 團隊',
      description: '負責系統可靠性工程',
      owner: 'John Doe',
      members: 12,
      subscribers: 8,
      status: 'active'
    },
    {
      key: '2',
      name: '開發團隊',
      description: '負責應用程式開發',
      owner: 'Jane Smith',
      members: 15,
      subscribers: 5,
      status: 'active'
    },
    {
      key: '3',
      name: '平台團隊',
      description: '負責平台架構和維護',
      owner: 'Alice Johnson',
      members: 8,
      subscribers: 12,
      status: 'active'
    },
  ]

  // 角色管理表格配置
  const roleColumns: ColumnsType<RoleData> = [
    { title: '角色名稱', dataIndex: 'name', key: 'name', sorter: true },
    { title: '描述', dataIndex: 'description', key: 'description', ellipsis: true },
    { title: '權限範圍', dataIndex: 'permissions', key: 'permissions', ellipsis: true },
    {
      title: '人員數量',
      dataIndex: 'userCount',
      key: 'userCount',
      sorter: (a, b) => a.userCount - b.userCount
    },
    {
      title: '狀態',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={status === 'active' ? 'green' : 'red'}>
          {status === 'active' ? '啟用' : '停用'}
        </Tag>
      )
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
        </Space>
      ),
    },
  ]

  const roleData: RoleData[] = [
    {
      key: '1',
      name: 'SRE 工程師',
      description: '負責系統可靠性工程',
      permissions: '事件管理、資源管理、儀表板查看',
      userCount: 8,
      status: 'active'
    },
    {
      key: '2',
      name: '平台管理員',
      description: '負責平台配置和用戶管理',
      permissions: '系統設定、用戶管理、角色管理',
      userCount: 3,
      status: 'active'
    },
    {
      key: '3',
      name: '開發者',
      description: '負責應用程式開發',
      permissions: '資源查看、事件查看',
      userCount: 25,
      status: 'active'
    },
  ]

  // 審計日誌表格配置
  const auditColumns: ColumnsType<AuditData> = [
    {
      title: '時間',
      dataIndex: 'time',
      key: 'time',
      render: (time: string) => new Date(time).toLocaleString('zh-TW')
    },
    { title: '操作者', dataIndex: 'user', key: 'user' },
    { title: '動作', dataIndex: 'action', key: 'action' },
    { title: '資源類型', dataIndex: 'targetType', key: 'targetType' },
    { title: '資源 ID', dataIndex: 'targetId', key: 'targetId' },
    {
      title: '結果',
      dataIndex: 'result',
      key: 'result',
      render: (result: string) => (
        <Tag color={result === 'success' ? 'green' : 'red'}>
          {result === 'success' ? '成功' : '失敗'}
        </Tag>
      )
    },
    { title: 'IP 地址', dataIndex: 'ip', key: 'ip' },
    {
      title: '操作',
      key: 'action',
      render: () => (
        <Tooltip title="查看詳情">
          <Button type="text" size="small" icon={<EyeOutlined />} />
        </Tooltip>
      ),
    },
  ]

  const auditData: AuditData[] = [
    {
      key: '1',
      time: '2025-09-23 15:30:00',
      user: 'John Doe',
      action: '創建事件規則',
      targetType: '事件規則',
      targetId: 'rule-001',
      result: 'success',
      ip: '192.168.1.100'
    },
    {
      key: '2',
      time: '2025-09-23 14:20:00',
      user: 'Jane Smith',
      action: '更新用戶權限',
      targetType: '用戶',
      targetId: 'user-002',
      result: 'success',
      ip: '192.168.1.101'
    },
    {
      key: '3',
      time: '2025-09-23 13:45:00',
      user: 'Bob Wilson',
      action: '刪除資源',
      targetType: '資源',
      targetId: 'resource-003',
      result: 'failure',
      ip: '192.168.1.102'
    },
  ]

  // 創建各個標籤頁的配置
  const createUserManagementTab = () => ({
    key: 'users',
    label: '人員管理',
    icon: <UserOutlined />,
    children: (
      <div style={{ padding: '16px 0' }}>
        <ToolbarActions
          onRefresh={handleRefresh}
          onExport={handleExport}
          showRefresh={true}
          showExport={true}
          actions={[{
            key: 'add',
            label: '新增用戶',
            icon: <PlusOutlined />,
            type: 'primary',
            onClick: handleAddUser,
            tooltip: '新增用戶',
          }]}
        />
        <Table
          columns={userColumns}
          dataSource={userData}
          size="middle"
          pagination={{
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total: number, range: [number, number]) => `第 ${range[0]}-${range[1]} 項，共 ${total} 項`,
          }}
        />
      </div>
    ),
  })

  const createTeamManagementTab = () => ({
    key: 'teams',
    label: '團隊管理',
    icon: <TeamOutlined />,
    children: (
      <div style={{ padding: '16px 0' }}>
        <ToolbarActions
          onRefresh={handleRefresh}
          onExport={handleExport}
          showRefresh={true}
          showExport={true}
          actions={[{
            key: 'add',
            label: '新增團隊',
            icon: <PlusOutlined />,
            type: 'primary',
            onClick: handleAddTeam,
            tooltip: '新增團隊',
          }]}
        />
        <Table
          columns={teamColumns}
          dataSource={teamData}
          size="middle"
          pagination={{
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total: number, range: [number, number]) => `第 ${range[0]}-${range[1]} 項，共 ${total} 項`,
          }}
        />
      </div>
    ),
  })

  const createRoleManagementTab = () => ({
    key: 'roles',
    label: '角色管理',
    icon: <IdcardOutlined />,
    children: (
      <div style={{ padding: '16px 0' }}>
        <ToolbarActions
          onRefresh={handleRefresh}
          onExport={handleExport}
          showRefresh={true}
          showExport={true}
          actions={[{
            key: 'add',
            label: '新增角色',
            icon: <PlusOutlined />,
            type: 'primary',
            onClick: handleAddRole,
            tooltip: '新增角色',
          }]}
        />
        <Table
          columns={roleColumns}
          dataSource={roleData}
          size="middle"
          pagination={{
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total: number, range: [number, number]) => `第 ${range[0]}-${range[1]} 項，共 ${total} 項`,
          }}
        />
      </div>
    ),
  })

  const createAuditTab = () => ({
    key: 'audit',
    label: '審計日誌',
    icon: <AuditOutlined />,
    children: (
      <div style={{ padding: '16px 0' }}>
        <ToolbarActions
          onRefresh={handleRefresh}
          onExport={handleExport}
          showRefresh={true}
          showExport={true}
        />
        <Table
          columns={auditColumns}
          dataSource={auditData}
          size="middle"
          pagination={{
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total: number, range: [number, number]) => `第 ${range[0]}-${range[1]} 項，共 ${total} 項`,
          }}
        />
      </div>
    ),
  })

  const tabItems = [
    createUserManagementTab(),
    createTeamManagementTab(),
    createRoleManagementTab(),
    createAuditTab(),
  ]

  return (
    <PageLayout
      header={
        <PageHeader
          title="身份與存取管理"
          subtitle="統一管理身份認證、存取權限和組織架構配置"
          extra={
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)' }}>
              <Input.Search
                placeholder="搜尋儀表板名稱..."
                onSearch={handleSearch}
                style={{ width: 320 }}
                allowClear
              />
            </div>
          }
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
      config={{
        customSpacing: {
          kpiCards: 'var(--spacing-lg)', // 減少 KPI 卡片和 Tabs 之間的間距
        }
      }}
    />
  )
}

export default IdentitySettingsPage
