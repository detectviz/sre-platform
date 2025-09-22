import React from 'react';
import { Space, Spin } from 'antd';
import { PageHeader } from '../components/PageHeader';
import { ToolbarActions } from '../components/ToolbarActions';
import { DataTable } from '../components/DataTable';

const SilenceRulePage: React.FC<{ onNavigate?: () => void }> = ({ onNavigate }) => {
  const [loading] = React.useState(false);

  if (loading) {
    return (
      <div style={{ width: '100%', display: 'flex', justifyContent: 'center', marginTop: 120 }}>
        <Spin tip="正在載入靜音規則資料..." size="large" />
      </div>
    );
  }

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <PageHeader
        title="靜音規則"
        subtitle="管理事件通知的靜音配置"
        description="創建、編輯、刪除靜音規則，避免重複警報干擾。"
      />

      <ToolbarActions
        onRefresh={() => { }}
        onSearch={() => { }}
        onExport={() => { }}
        onAdd={() => { }}
        onFilter={() => { }}
        searchPlaceholder="搜索規則名稱..."
        showRefresh={true}
        showSearch={true}
        showExport={true}
        showAdd={true}
        showBatchAction={true}
        showFilter={true}
      />

      <DataTable
        columns={[
          { title: '啟用', dataIndex: 'enabled', key: 'enabled' },
          { title: '規則名稱', dataIndex: 'name', key: 'name' },
          { title: '靜音類型', dataIndex: 'type', key: 'type' },
          { title: '靜音條件', dataIndex: 'conditions', key: 'conditions' },
          { title: '靜音期間', dataIndex: 'time_range', key: 'time_range' },
          { title: '靜音範圍', dataIndex: 'scope', key: 'scope' },
          { title: '創建者', dataIndex: 'creator', key: 'creator' },
          { title: '創建時間', dataIndex: 'created_at', key: 'created_at' },
        ]}
        dataSource={[]}
        loading={false}
        onRow={() => ({})}
      />
    </Space>
  );
};

export default SilenceRulePage;
