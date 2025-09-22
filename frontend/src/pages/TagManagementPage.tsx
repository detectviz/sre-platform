import React from 'react';
import { Space, Spin } from 'antd';
import { PageHeader } from '../components/PageHeader';
import { ToolbarActions } from '../components/ToolbarActions';
import { DataTable } from '../components/DataTable';

const TagManagementPage: React.FC<{ onNavigate?: () => void }> = ({ onNavigate }) => {
  const [loading] = React.useState(false);

  if (loading) {
    return (
      <div style={{ width: '100%', display: 'flex', justifyContent: 'center', marginTop: 120 }}>
        <Spin tip="正在載入標籤管理資料..." size="large" />
      </div>
    );
  }

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <PageHeader
        title="標籤管理"
        subtitle="全平台標籤類型和標籤值的統一管理"
        description="支援標籤分類、搜索和批量操作。"
      />

      <ToolbarActions
        onRefresh={() => { }}
        onSearch={() => { }}
        onExport={() => { }}
        onAdd={() => { }}
        onFilter={() => { }}
        searchPlaceholder="搜索標籤名稱..."
        showRefresh={true}
        showSearch={true}
        showExport={true}
        showAdd={true}
        showBatchAction={true}
        showFilter={true}
      />

      <DataTable
        columns={[
          { title: '標籤名稱', dataIndex: 'name', key: 'name' },
          { title: '分類', dataIndex: 'category', key: 'category' },
          { title: '標籤值', dataIndex: 'values', key: 'values' },
          { title: '必填', dataIndex: 'required', key: 'required' },
          { title: '使用次數', dataIndex: 'usage_count', key: 'usage_count' },
        ]}
        dataSource={[]}
        loading={false}
        onRow={() => ({})}
      />
    </Space>
  );
};

export default TagManagementPage;
