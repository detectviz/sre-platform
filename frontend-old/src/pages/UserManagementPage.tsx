import React from 'react';
import { Card, Table, Button, Space, Tag, Avatar, Badge } from 'antd';
import { UserOutlined, EditOutlined, DeleteOutlined, MailOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import PageHeader from '../components/PageHeader';
import { ToolbarActions } from '../components/ToolbarActions';
import { ContextualKPICard } from '../components/ContextualKPICard';

interface User {
  id: string;
  username: string;
  name: string;
  email: string;
  teams: string[];
  roles: string[];
  lastLogin: string;
  status: 'active' | 'inactive' | 'suspended';
  avatar?: string;
}

const mockUsers: User[] = [
  {
    id: '1',
    username: 'john.doe',
    name: 'John Doe',
    email: 'john.doe@company.com',
    teams: ['Frontend Team', 'DevOps Team'],
    roles: ['Developer', 'Admin'],
    lastLogin: '2025-09-22 14:30',
    status: 'active',
  },
  {
    id: '2',
    username: 'jane.smith',
    name: 'Jane Smith',
    email: 'jane.smith@company.com',
    teams: ['Backend Team'],
    roles: ['Senior Developer'],
    lastLogin: '2025-09-22 09:15',
    status: 'active',
  },
  {
    id: '3',
    username: 'mike.johnson',
    name: 'Mike Johnson',
    email: 'mike.johnson@company.com',
    teams: ['DevOps Team', 'Security Team'],
    roles: ['DevOps Engineer'],
    lastLogin: '2025-09-21 16:45',
    status: 'inactive',
  },
];

const UserManagementPage: React.FC<{ onNavigate: (path: string) => void }> = ({ onNavigate: _ }) => {
  const handleRefresh = () => {
    console.log('刷新人員列表');
  };

  const handleSearch = () => {
    console.log('搜索篩選人員');
  };

  const handleExport = () => {
    console.log('匯出人員列表');
  };

  const handleAdd = () => {
    console.log('新增人員');
  };

  const handleFilter = () => {
    console.log('篩選人員');
  };

  const handleBatchAction = () => {
    console.log('批量操作');
  };

  const columns: ColumnsType<User> = [
    {
      title: '人員',
      dataIndex: 'name',
      key: 'name',
      render: (_, _record) => (
        <Space>
          <Avatar icon={<UserOutlined />} src={_record.avatar} />
          <div>
            <div>{_record.name}</div>
            <div style={{ fontSize: '12px', color: '#999' }}>@{_record.username}</div>
          </div>
        </Space>
      ),
    },
    {
      title: '電子郵件',
      dataIndex: 'email',
      key: 'email',
      render: (email) => (
        <Space>
          <MailOutlined />
          {email}
        </Space>
      ),
    },
    {
      title: '團隊',
      dataIndex: 'teams',
      key: 'teams',
      render: (teams: string[]) => (
        <Space wrap>
          {teams.map(team => (
            <Tag key={team} color="blue">{team}</Tag>
          ))}
        </Space>
      ),
    },
    {
      title: '角色',
      dataIndex: 'roles',
      key: 'roles',
      render: (roles: string[]) => (
        <Space wrap>
          {roles.map(role => (
            <Tag key={role} color="green">{role}</Tag>
          ))}
        </Space>
      ),
    },
    {
      title: '最後登入',
      dataIndex: 'lastLogin',
      key: 'lastLogin',
      sorter: true,
    },
    {
      title: '狀態',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const statusMap = {
          active: { color: 'success', text: '啟用' },
          inactive: { color: 'default', text: '停用' },
          suspended: { color: 'warning', text: '暫停' },
        };
        const statusInfo = statusMap[status as keyof typeof statusMap] || { color: 'default', text: status };
        return <Badge status={statusInfo.color as any} text={statusInfo.text} />;
      },
    },
    {
      title: '操作',
      key: 'actions',
      render: (_, _record) => (
        <Space>
          <Button icon={<EditOutlined />} size="small">
            編輯
          </Button>
          <Button icon={<DeleteOutlined />} size="small" danger>
            刪除
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="人員管理"
        description="提供組織內所有人員的集中管理功能，包括人員資訊、角色分配和權限控制"
      />

      <div style={{ marginBottom: 16 }}>
        <ContextualKPICard
          title="總人員數"
          value="156人"
          description="142 個啟用中"
          trend="+5.2%"
          status="info"
        />
        <ContextualKPICard
          title="在線人員"
          value="89人"
          description="當前在線"
          trend="+12.1%"
          status="success"
        />
        <ContextualKPICard
          title="團隊數量"
          value="12個"
          description="組織結構"
          trend="0%"
          status="warning"
        />
        <ContextualKPICard
          title="待處理邀請"
          value="5個"
          description="邀請待確認"
          trend="+25%"
          status="danger"
        />
      </div>

      <Card>
        <ToolbarActions
          onRefresh={handleRefresh}
          onSearch={handleSearch}
          onExport={handleExport}
          onAdd={handleAdd}
          onFilter={handleFilter}
          onBatchAction={handleBatchAction}
          showRefresh={true}
          showSearch={true}
          showExport={true}
          showAdd={true}
          showBatchAction={true}
          showFilter={true}
        />

        <Table
          columns={columns}
          dataSource={mockUsers}
          rowKey="id"
          pagination={{
            showSizeChanger: true,
            showQuickJumper: true,
            pageSizeOptions: ['10', '20', '50'],
            showTotal: (total, range) =>
              `第 ${range[0]}-${range[1]} 筆，共 ${total} 筆`,
          }}
        />
      </Card>
    </div>
  );
};

export default UserManagementPage;
