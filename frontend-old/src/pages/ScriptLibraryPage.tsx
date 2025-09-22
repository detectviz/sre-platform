import React from 'react';
import { Space, Spin } from 'antd';
import { PageHeader } from '../components/PageHeader';
import { ToolbarActions } from '../components/ToolbarActions.tsx';
import { DataTable } from '../components/DataTable';

const ScriptLibraryPage: React.FC<{ onNavigate?: () => void }> = ({ onNavigate: _ }) => {
  const [loading] = React.useState(false);

  if (loading) {
    return (
      <div style={{ width: '100%', display: 'flex', justifyContent: 'center', marginTop: 120 }}>
        <Spin tip="正在載入腳本庫資料..." size="large" />
      </div>
    );
  }

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <PageHeader
        title="腳本庫"
        subtitle="自動化腳本的集中管理"
        description="創建、版本控制和執行自動化腳本。"
      />

      <ToolbarActions
        onRefresh={() => { }}
        onSearch={() => { }}
        onExport={() => { }}
        onAdd={() => { }}
        onFilter={() => { }}
        searchPlaceholder="搜索腳本名稱..."
        showRefresh={true}
        showSearch={true}
        showExport={true}
        showAdd={true}
        showBatchAction={true}
        showFilter={true}
      />

      <DataTable
        columns={[
          { title: '腳本名稱', dataIndex: 'name', key: 'name' },
          { title: '類型', dataIndex: 'type', key: 'type' },
          { title: '描述', dataIndex: 'description', key: 'description' },
          { title: '版本', dataIndex: 'version', key: 'version' },
          { title: '最後更新時間', dataIndex: 'updated_at', key: 'updated_at' },
          { title: '最後執行狀態', dataIndex: 'last_execution_status', key: 'last_execution_status' },
        ]}
        dataSource={[]}
        loading={false}
        onRow={() => ({})}
      />
    </Space>
  );
};

export default ScriptLibraryPage;
