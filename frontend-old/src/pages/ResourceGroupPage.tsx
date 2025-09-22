import React from 'react';
import { Space, Spin } from 'antd';
import { PageHeader } from '../components/PageHeader';
import { ToolbarActions } from '../components/ToolbarActions.tsx';
import { DataTable } from '../components/DataTable';

const ResourceGroupPage: React.FC<{ onNavigate?: () => void }> = ({ onNavigate: _ }) => {
  const [loading] = React.useState(false);

  if (loading) {
    return (
      <div style={{ width: '100%', display: 'flex', justifyContent: 'center', marginTop: 120 }}>
        <Spin tip="正在載入資源群組資料..." size="large" />
      </div>
    );
  }

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <PageHeader
        title="資源群組"
        subtitle="邏輯分組的資源管理"
        description="將資源按業務邏輯分組，便於批量操作和整體監控。"
      />

      <ToolbarActions
        onRefresh={() => { }}
        onSearch={() => { }}
        onExport={() => { }}
        onAdd={() => { }}
        onFilter={() => { }}
        searchPlaceholder="搜索群組名稱..."
        showRefresh={true}
        showSearch={true}
        showExport={true}
        showAdd={true}
        showBatchAction={true}
        showFilter={true}
      />

      <DataTable
        columns={[
          { title: '群組名稱', dataIndex: 'name', key: 'name' },
          { title: '成員數', dataIndex: 'members', key: 'members' },
          { title: '訂閱者數', dataIndex: 'subscribers', key: 'subscribers' },
          { title: '負責人', dataIndex: 'owner', key: 'owner' },
          { title: '描述', dataIndex: 'description', key: 'description' },
          { title: '創建時間', dataIndex: 'created_at', key: 'created_at' },
        ]}
        dataSource={[]}
        loading={false}
        onRow={() => ({})}
      />
    </Space>
  );
};

export default ResourceGroupPage;
