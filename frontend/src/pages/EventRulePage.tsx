import React from 'react';
import { Space, Spin } from 'antd';
import { PageHeader } from '../components/PageHeader';
import { ToolbarActions } from '../components/ToolbarActions';
import { DataTable } from '../components/DataTable';

const EventRulePage: React.FC<{ onNavigate?: () => void }> = ({ onNavigate: _ }) => {
  const [loading] = React.useState(false);

  if (loading) {
    return (
      <div style={{ width: '100%', display: 'flex', justifyContent: 'center', marginTop: 120 }}>
        <Spin tip="正在載入事件規則資料..." size="large" />
      </div>
    );
  }

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <PageHeader
        title="事件規則"
        subtitle="管理自動化事件檢測和觸發規則"
        description="創建、編輯、刪除事件規則，設定觸發條件和自動化響應。"
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
          { title: '監控對象', dataIndex: 'target', key: 'target' },
          { title: '觸發條件', dataIndex: 'conditions', key: 'conditions' },
          { title: '嚴重程度', dataIndex: 'severity', key: 'severity' },
          { title: '自動化', dataIndex: 'automation', key: 'automation' },
          { title: '創建者', dataIndex: 'creator', key: 'creator' },
          { title: '最後更新', dataIndex: 'updated', key: 'updated' },
        ]}
        dataSource={[]}
        loading={false}
        onRow={() => ({})}
      />
    </Space>
  );
};

export default EventRulePage;
