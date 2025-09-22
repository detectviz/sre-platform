import React from 'react';
import { Space, Spin } from 'antd';
import { PageHeader } from '../components/PageHeader';
import { ToolbarActions } from '../components/ToolbarActions.tsx';
import { DataTable } from '../components/DataTable';

const NotificationStrategyPage: React.FC<{ onNavigate?: () => void }> = ({ onNavigate: _ }) => {
  const [loading] = React.useState(false);

  if (loading) {
    return (
      <div style={{ width: '100%', display: 'flex', justifyContent: 'center', marginTop: 120 }}>
        <Spin tip="正在載入通知策略資料..." size="large" />
      </div>
    );
  }

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <PageHeader
        title="通知策略"
        subtitle="事件觸發通知的規則配置"
        description="設定多管道和接收者管理規則。"
      />

      <ToolbarActions
        onRefresh={() => { }}
        onSearch={() => { }}
        onExport={() => { }}
        onAdd={() => { }}
        onFilter={() => { }}
        searchPlaceholder="搜索策略名稱..."
        showRefresh={true}
        showSearch={true}
        showExport={true}
        showAdd={true}
        showBatchAction={true}
        showFilter={true}
      />

      <DataTable
        columns={[
          { title: '策略名稱', dataIndex: 'name', key: 'name' },
          { title: '觸發條件', dataIndex: 'trigger_condition', key: 'trigger_condition' },
          { title: '通知管道數量', dataIndex: 'channel_count', key: 'channel_count' },
          { title: '接收者', dataIndex: 'recipients', key: 'recipients' },
          { title: '狀態', dataIndex: 'status', key: 'status' },
          { title: '優先級', dataIndex: 'priority', key: 'priority' },
        ]}
        dataSource={[]}
        loading={false}
        onRow={() => ({})}
      />
    </Space>
  );
};

export default NotificationStrategyPage;
