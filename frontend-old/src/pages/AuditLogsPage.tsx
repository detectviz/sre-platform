import React from 'react';
import { Card, Table, Button, Space, Tag, Avatar, Typography } from 'antd';
import { AuditOutlined, EyeOutlined, ReloadOutlined, DownloadOutlined, FilterOutlined, DeleteOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import PageHeader from '../components/PageHeader';
import { ToolbarActions } from '../components/ToolbarActions';
import { ContextualKPICard } from '../components/ContextualKPICard';

interface AuditLog {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  resourceType: string;
  resourceId: string;
  result: 'success' | 'failure' | 'partial';
  ipAddress: string;
  details?: string;
}

const mockAuditLogs: AuditLog[] = [
  {
    id: '1',
    timestamp: '2025-09-22 14:30:15',
    user: 'John Doe',
    action: '登入系統',
    resourceType: 'Authentication',
    resourceId: 'auth-001',
    result: 'success',
    ipAddress: '192.168.1.100',
    details: '成功登入系統',
  },
  {
    id: '2',
    timestamp: '2025-09-22 14:25:10',
    user: 'Jane Smith',
    action: '修改事件規則',
    resourceType: 'Event Rule',
    resourceId: 'rule-002',
    result: 'success',
    ipAddress: '192.168.1.101',
    details: '修改了事件觸發條件',
  },
  {
    id: '3',
    timestamp: '2025-09-22 14:20:05',
    user: 'Mike Johnson',
    action: '刪除資源',
    resourceType: 'Resource',
    resourceId: 'server-003',
    result: 'failure',
    ipAddress: '192.168.1.102',
    details: '權限不足，操作失敗',
  },
  {
    id: '4',
    timestamp: '2025-09-22 14:15:30',
    user: 'Sarah Wilson',
    action: '匯出報表',
    resourceType: 'Report',
    resourceId: 'report-004',
    result: 'success',
    ipAddress: '192.168.1.103',
    details: '匯出系統監控報表',
  },
];

const AuditLogsPage: React.FC<{ onNavigate: (path: string) => void }> = ({ onNavigate: _ }) => {
  const handleRefresh = () => {
    console.log('刷新審計日誌');
  };

  const handleSearch = () => {
    console.log('搜索篩選日誌');
  };

  const handleExport = () => {
    console.log('匯出審計日誌');
  };

  const handleFilter = () => {
    console.log('篩選日誌');
  };

  const handleBatchAction = () => {
    console.log('批量操作');
  };

  const handleClearLogs = () => {
    console.log('清除過期記錄');
  };

  const columns: ColumnsType<AuditLog> = [
    {
      title: '時間',
      dataIndex: 'timestamp',
      key: 'timestamp',
      sorter: true,
      width: 180,
    },
    {
      title: '操作者',
      dataIndex: 'user',
      key: 'user',
      render: (user) => (
        <Space>
          <Avatar icon={<AuditOutlined />} />
          {user}
        </Space>
      ),
    },
    {
      title: '動作',
      dataIndex: 'action',
      key: 'action',
      render: (action) => (
        <Tag color="blue">{action}</Tag>
      ),
    },
    {
      title: '資源類型',
      dataIndex: 'resourceType',
      key: 'resourceType',
      render: (resourceType) => (
        <Tag color="orange">{resourceType}</Tag>
      ),
    },
    {
      title: '資源ID',
      dataIndex: 'resourceId',
      key: 'resourceId',
      render: (resourceId) => (
        <Typography.Text copyable style={{ fontFamily: 'monospace' }}>
          {resourceId}
        </Typography.Text>
      ),
    },
    {
      title: '結果',
      dataIndex: 'result',
      key: 'result',
      render: (result: string) => {
        const resultMap = {
          success: { color: 'success', text: '成功' },
          failure: { color: 'error', text: '失敗' },
          partial: { color: 'warning', text: '部分' },
        };
        const resultInfo = resultMap[result as keyof typeof resultMap] || { color: 'default', text: result };
        return <Tag color={resultInfo.color}>{resultInfo.text}</Tag>;
      },
    },
    {
      title: 'IP地址',
      dataIndex: 'ipAddress',
      key: 'ipAddress',
      render: (ipAddress) => (
        <Typography.Text copyable style={{ fontFamily: 'monospace' }}>
          {ipAddress}
        </Typography.Text>
      ),
    },
    {
      title: '操作',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button icon={<EyeOutlined />} size="small">
            查看詳情
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="審計日誌"
        description="記錄系統中所有重要的操作行為，用於安全審計和問題排查"
      />

      <div style={{ marginBottom: 16 }}>
        <ContextualKPICard
          title="今日操作數"
          value="1,247次"
          description="24小時操作記錄"
          trend="+8.3%"
          status="info"
        />
        <ContextualKPICard
          title="成功率"
          value="98.5%"
          description="操作成功率"
          trend="+0.2%"
          status="success"
        />
        <ContextualKPICard
          title="高風險操作"
          value="12次"
          description="需要關注的操作"
          trend="-15.4%"
          status="warning"
        />
        <ContextualKPICard
          title="異常IP"
          value="3個"
          description="異常來源IP"
          trend="+50%"
          status="danger"
        />
      </div>

      <Card>
        <ToolbarActions
          onRefresh={handleRefresh}
          onSearch={handleSearch}
          onExport={handleExport}
          onFilter={handleFilter}
          onBatchAction={handleBatchAction}
          customActions={[
            <Button
              key="clear"
              icon={<DeleteOutlined />}
              onClick={handleClearLogs}
              danger
            >
              清除過期記錄
            </Button>
          ]}
          showRefresh={true}
          showSearch={true}
          showExport={true}
          showBatchAction={true}
          showFilter={true}
        />

        <Table
          columns={columns}
          dataSource={mockAuditLogs}
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

export default AuditLogsPage;
