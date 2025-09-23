import React from 'react'
import { Table, Space, Select, Tag, Avatar, Input } from 'antd'
import { FilterOutlined, ReloadOutlined, EditOutlined, TeamOutlined, UserOutlined, PlusOutlined, SearchOutlined } from '@ant-design/icons'
import { TableLayout } from '../components/layouts'
import { ToolbarActions } from '../components/ToolbarActions'
import { DEFAULT_PAGINATION, createActionColumn, COMMON_ACTIONS } from '../components'

const { Option } = Select

// 模擬團隊數據
const mockTeamData = [
  {
    id: '1',
    name: 'SRE 團隊',
    description: '負責系統可靠性和效能優化',
    memberCount: 8,
    leader: 'john.smith',
    members: [
      { username: 'john.smith', displayName: 'John Smith', role: 'leader' },
      { username: 'alice.wong', displayName: 'Alice Wong', role: 'member' },
      { username: 'bob.chen', displayName: 'Bob Chen', role: 'member' },
    ],
    status: 'active',
    permissions: ['monitoring', 'alerting', 'automation'],
    createdAt: '2024-01-01',
    lastUpdated: '2024-01-15 10:30:00',
  },
  {
    id: '2',
    name: '開發團隊',
    description: '負責應用程式開發和維護',
    memberCount: 15,
    leader: 'sarah.johnson',
    members: [
      { username: 'sarah.johnson', displayName: 'Sarah Johnson', role: 'leader' },
      { username: 'mike.brown', displayName: 'Mike Brown', role: 'member' },
      { username: 'lisa.davis', displayName: 'Lisa Davis', role: 'member' },
    ],
    status: 'active',
    permissions: ['deployment', 'code-review'],
    createdAt: '2024-01-02',
    lastUpdated: '2024-01-14 16:20:00',
  },
  {
    id: '3',
    name: '資料庫團隊',
    description: '負責資料庫設計和優化',
    memberCount: 5,
    leader: 'david.wilson',
    members: [
      { username: 'david.wilson', displayName: 'David Wilson', role: 'leader' },
      { username: 'emma.taylor', displayName: 'Emma Taylor', role: 'member' },
    ],
    status: 'active',
    permissions: ['database', 'backup', 'migration'],
    createdAt: '2024-01-03',
    lastUpdated: '2024-01-13 09:15:00',
  },
  {
    id: '4',
    name: '測試團隊',
    description: '負責品質保證和測試',
    memberCount: 6,
    leader: 'amy.martinez',
    members: [
      { username: 'amy.martinez', displayName: 'Amy Martinez', role: 'leader' },
      { username: 'kevin.lee', displayName: 'Kevin Lee', role: 'member' },
    ],
    status: 'inactive',
    permissions: ['testing', 'qa'],
    createdAt: '2024-01-04',
    lastUpdated: '2024-01-10 14:45:00',
  },
]

// 表格列定義
const teamColumns = [
  {
    title: '團隊名稱',
    dataIndex: 'name',
    key: 'name',
    width: 150,
    render: (name: string) => (
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <Avatar size="small" icon={<TeamOutlined />} style={{ backgroundColor: '#1890ff' }} />
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
    title: '團隊領導',
    dataIndex: 'leader',
    key: 'leader',
    width: 150,
    render: (leader: string, record: any) => {
      const leaderInfo = record.members.find((m: any) => m.username === leader)
      return (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Avatar size="small" icon={<UserOutlined />} />
          <div>
            <div style={{ fontWeight: 'bold' }}>{leaderInfo?.displayName || 'Unknown'}</div>
            <div style={{ fontSize: '12px', color: '#666' }}>{leader}</div>
          </div>
        </div>
      )
    },
  },
  {
    title: '成員數量',
    dataIndex: 'memberCount',
    key: 'memberCount',
    width: 100,
    render: (count: number) => (
      <Tag color="blue">{count} 人</Tag>
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
    title: '權限',
    dataIndex: 'permissions',
    key: 'permissions',
    width: 200,
    render: (permissions: string[]) => (
      <Space wrap>
        {permissions.slice(0, 2).map((permission, index) => (
          <Tag key={index} color="purple">
            {permission}
          </Tag>
        ))}
        {permissions.length > 2 && (
          <Tag>+{permissions.length - 2}</Tag>
        )}
      </Space>
    ),
  },
  {
    title: '最後更新',
    dataIndex: 'lastUpdated',
    key: 'lastUpdated',
    width: 150,
  },
  createActionColumn([
    { ...COMMON_ACTIONS.VIEW, onClick: (record) => console.log('View team', record) },
    { ...COMMON_ACTIONS.EDIT, onClick: (record) => console.log('Edit team', record) },
    { ...COMMON_ACTIONS.DELETE, onClick: (record) => console.log('Delete team', record) },
  ]),
]

// KPI 卡片數據
const kpiCardsData = [
  {
    title: '總團隊數',
    value: '12',
    change: '+1',
    changeType: 'increase' as const,
    icon: '👥',
  },
  {
    title: '活躍團隊',
    value: '10',
    change: '+1',
    changeType: 'increase' as const,
    icon: '✅',
  },
  {
    title: '總成員數',
    value: '89',
    change: '+3',
    changeType: 'increase' as const,
    icon: '👤',
  },
  {
    title: '停用團隊',
    value: '2',
    change: '0',
    changeType: 'neutral' as const,
    icon: '❌',
  },
]

const TeamManagementPage: React.FC = () => {
  // 工具列動作
  const toolbarActions = [
    {
      key: 'create',
      label: '新增團隊',
      icon: <PlusOutlined />,
      type: 'primary',
      onClick: () => {
        console.log('Create new team')
      },
    },
    {
      key: 'refresh',
      label: '刷新',
      icon: <ReloadOutlined />,
      onClick: () => {
        console.log('Refresh teams')
      },
    },
    {
      key: 'bulk_actions',
      label: '批量操作',
      icon: <FilterOutlined />,
      onClick: () => {
        console.log('Bulk actions')
      },
    },
  ]

  // 篩選條件
  const filters = (
    <Space wrap>
      <Input
        placeholder="搜尋團隊名稱"
        prefix={<SearchOutlined />}
        style={{ width: 200 }}
      />
      <Select placeholder="狀態" style={{ width: 100 }}>
        <Option value="active">活躍</Option>
        <Option value="inactive">停用</Option>
      </Select>
      <Select placeholder="團隊領導" style={{ width: 150 }}>
        <Option value="john.smith">John Smith</Option>
        <Option value="sarah.johnson">Sarah Johnson</Option>
        <Option value="david.wilson">David Wilson</Option>
        <Option value="amy.martinez">Amy Martinez</Option>
      </Select>
    </Space>
  )

  return (
    <TableLayout
      header={
        <div>
          <h1>團隊管理</h1>
          <p>管理組織團隊結構和成員</p>
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
            searchPlaceholder="搜尋團隊"
            showSearch={true}
          />
        )
      }}
      content={
        <Table
          columns={teamColumns}
          dataSource={mockTeamData}
          rowKey="id"
          pagination={DEFAULT_PAGINATION}
          scroll={{ x: 1200 }}
          size="middle"
        />
      }
    />
  )
}

export default TeamManagementPage
