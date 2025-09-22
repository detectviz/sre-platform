import React from 'react';
import { Card, Table, Button, Space, Tag, Typography } from 'antd';
import { SafetyCertificateOutlined, EditOutlined, DeleteOutlined, UserOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import PageHeader from '../components/PageHeader';
import { ToolbarActions } from '../components/ToolbarActions';
import { ContextualKPICard } from '../components/ContextualKPICard';

interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  userCount: number;
  createdAt: string;
  isBuiltIn: boolean;
}

const mockRoles: Role[] = [
  {
    id: '1',
    name: 'Admin',
    description: '系統管理員，擁有所有權限',
    permissions: ['所有權限', '系統設定', '用戶管理', '資料庫管理'],
    userCount: 3,
    createdAt: '2025-01-01',
    isBuiltIn: true,
  },
  {
    id: '2',
    name: 'Developer',
    description: '開發人員，負責應用開發和維護',
    permissions: ['資源檢視', '事件處理', '儀表板檢視', '腳本執行'],
    userCount: 45,
    createdAt: '2025-01-15',
    isBuiltIn: true,
  },
  {
    id: '3',
    name: 'DevOps Engineer',
    description: 'DevOps 工程師，負責 CI/CD 和系統維護',
    permissions: ['資源管理', '事件管理', '自動化管理', '通知設定'],
    userCount: 12,
    createdAt: '2025-01-20',
    isBuiltIn: true,
  },
  {
    id: '4',
    name: 'SRE Engineer',
    description: 'SRE 工程師，負責系統可靠性和效能監控',
    permissions: ['事件管理', '資源監控', '儀表板管理', '分析中心'],
    userCount: 8,
    createdAt: '2025-02-01',
    isBuiltIn: false,
  },
];

const RoleManagementPage: React.FC<{ onNavigate: (path: string) => void }> = ({ onNavigate: _ }) => {
  const handleRefresh = () => {
    console.log('刷新角色列表');
  };

  const handleSearch = () => {
    console.log('搜索篩選角色');
  };

  const handleExport = () => {
    console.log('匯出角色列表');
  };

  const handleAdd = () => {
    console.log('新增角色');
  };

  const handleFilter = () => {
    console.log('篩選角色');
  };

  const handleBatchAction = () => {
    console.log('批量操作');
  };

  const columns: ColumnsType<Role> = [
    {
      title: '角色',
      dataIndex: 'name',
      key: 'name',
      render: (name, record) => (
        <Space>
          <SafetyCertificateOutlined style={{ color: record.isBuiltIn ? '#1890ff' : '#52c41a' }} />
          <div>
            <div style={{ fontWeight: 'bold' }}>{name}</div>
            <div style={{ fontSize: '12px', color: '#999' }}>
              {record.description}
            </div>
          </div>
        </Space>
      ),
    },
    {
      title: '權限範圍',
      dataIndex: 'permissions',
      key: 'permissions',
      render: (permissions: string[]) => (
        <Space wrap>
          {permissions.slice(0, 3).map(permission => (
            <Tag key={permission} color="blue">{permission}</Tag>
          ))}
          {permissions.length > 3 && (
            <Tag color="blue">+{permissions.length - 3} 個</Tag>
          )}
        </Space>
      ),
    },
    {
      title: '人員數量',
      dataIndex: 'userCount',
      key: 'userCount',
      sorter: true,
      render: (userCount: number) => (
        <Space>
          <UserOutlined />
          {userCount} 人
        </Space>
      ),
    },
    {
      title: '類型',
      dataIndex: 'isBuiltIn',
      key: 'isBuiltIn',
      render: (isBuiltIn: boolean) => (
        <Tag color={isBuiltIn ? 'blue' : 'green'}>
          {isBuiltIn ? '內建角色' : '自訂角色'}
        </Tag>
      ),
    },
    {
      title: '創建時間',
      dataIndex: 'createdAt',
      key: 'createdAt',
      sorter: true,
    },
    {
      title: '操作',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button icon={<EditOutlined />} size="small">
            編輯
          </Button>
          {!record.isBuiltIn && (
            <Button icon={<DeleteOutlined />} size="small" danger>
              刪除
            </Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="角色管理"
        description="定義系統角色和對應的權限配置"
      />

      <div style={{ marginBottom: 16 }}>
        <ContextualKPICard
          title="角色總數"
          value="12個"
          description="包含內建和自訂"
          trend="+2.1%"
          status="info"
        />
        <ContextualKPICard
          title="內建角色"
          value="8個"
          description="系統預設角色"
          trend="0%"
          status="success"
        />
        <ContextualKPICard
          title="自訂角色"
          value="4個"
          description="團隊自訂角色"
          trend="+33.3%"
          status="warning"
        />
        <ContextualKPICard
          title="權限覆蓋"
          value="95%"
          description="用戶權限覆蓋率"
          trend="+1.2%"
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
          dataSource={mockRoles}
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

export default RoleManagementPage;
