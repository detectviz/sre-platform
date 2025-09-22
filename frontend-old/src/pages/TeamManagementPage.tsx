import React from 'react';
import { Card, Table, Button, Space, Tag, Avatar, Typography } from 'antd';
import { TeamOutlined, EditOutlined, DeleteOutlined, UserOutlined, EyeOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import PageHeader from '../components/PageHeader';
import { ToolbarActions } from '../components/ToolbarActions';
import { ContextualKPICard } from '../components/ContextualKPICard';

interface Team {
  id: string;
  name: string;
  description: string;
  members: number;
  owner: string;
  createdAt: string;
  status: 'active' | 'inactive';
}

const mockTeams: Team[] = [
  {
    id: '1',
    name: 'Frontend Team',
    description: '負責前端開發和用戶體驗',
    members: 8,
    owner: 'John Doe',
    createdAt: '2025-01-15',
    status: 'active',
  },
  {
    id: '2',
    name: 'Backend Team',
    description: '負責後端服務和 API 開發',
    members: 6,
    owner: 'Jane Smith',
    createdAt: '2025-02-01',
    status: 'active',
  },
  {
    id: '3',
    name: 'DevOps Team',
    description: '負責 CI/CD 和系統維護',
    members: 5,
    owner: 'Mike Johnson',
    createdAt: '2025-01-20',
    status: 'active',
  },
  {
    id: '4',
    name: 'Security Team',
    description: '負責安全審計和合規檢查',
    members: 3,
    owner: 'Sarah Wilson',
    createdAt: '2025-03-01',
    status: 'active',
  },
];

const TeamManagementPage: React.FC<{ onNavigate: (path: string) => void }> = ({ onNavigate: _ }) => {
  const handleRefresh = () => {
    console.log('刷新團隊列表');
  };

  const handleSearch = () => {
    console.log('搜索篩選團隊');
  };

  const handleExport = () => {
    console.log('匯出團隊列表');
  };

  const handleAdd = () => {
    console.log('新增團隊');
  };

  const handleFilter = () => {
    console.log('篩選團隊');
  };

  const handleBatchAction = () => {
    console.log('批量操作');
  };

  const columns: ColumnsType<Team> = [
    {
      title: '團隊',
      dataIndex: 'name',
      key: 'name',
      render: (name, record) => (
        <Space>
          <Avatar icon={<TeamOutlined />} />
          <div>
            <div style={{ fontWeight: 'bold' }}>{name}</div>
            <div style={{ fontSize: '12px', color: '#999' }}>
              負責人: {record.owner}
            </div>
          </div>
        </Space>
      ),
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
    },
    {
      title: '成員數',
      dataIndex: 'members',
      key: 'members',
      sorter: true,
      render: (members: number) => (
        <Space>
          <UserOutlined />
          {members} 人
        </Space>
      ),
    },
    {
      title: '創建時間',
      dataIndex: 'createdAt',
      key: 'createdAt',
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
        };
        const statusInfo = statusMap[status as keyof typeof statusMap] || { color: 'default', text: status };
        return <Tag color={statusInfo.color}>{statusInfo.text}</Tag>;
      },
    },
    {
      title: '操作',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button icon={<EyeOutlined />} size="small">
            查看詳情
          </Button>
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
        title="團隊管理"
        description="提供團隊組織結構的管理功能，便於權限分配和協作管理"
      />

      <div style={{ marginBottom: 16 }}>
        <ContextualKPICard
          title="團隊數量"
          value="12個"
          description="組織結構"
          trend="0%"
          status="info"
        />
        <ContextualKPICard
          title="總成員數"
          value="156人"
          description="所有團隊成員"
          trend="+5.2%"
          status="success"
        />
        <ContextualKPICard
          title="活躍團隊"
          value="12個"
          description="目前活躍團隊"
          trend="0%"
          status="warning"
        />
        <ContextualKPICard
          title="跨團隊成員"
          value="23人"
          description="參與多團隊"
          trend="+8.7%"
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
          dataSource={mockTeams}
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

export default TeamManagementPage;
