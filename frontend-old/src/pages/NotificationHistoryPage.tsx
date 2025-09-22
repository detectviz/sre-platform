import React from 'react';
import { Space, Spin } from 'antd';
import { PageHeader } from '../components/PageHeader';
import { ToolbarActions } from '../components/ToolbarActions.tsx';
import { DataTable } from '../components/DataTable';

const NotificationHistoryPage: React.FC<{ onNavigate?: () => void }> = ({ onNavigate: _ }) => {
  const [loading] = React.useState(false);

  if (loading) {
    return (
      <div style={{ width: '100%', display: 'flex', justifyContent: 'center', marginTop: 120 }}>
        <Spin tip="正在載入通知歷史資料..." size="large" />
      </div>
    );
  }

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <PageHeader
        title="通知歷史"
        subtitle="所有通知發送記錄的查詢和詳情檢視"
        description="查詢通知發送記錄，分析發送失敗原因。"
      />

      <ToolbarActions
        onRefresh={() => { }}
        onSearch={() => { }}
        onExport={() => { }}
        onFilter={() => { }}
        searchPlaceholder="搜索通知記錄..."
        showRefresh={true}
        showSearch={true}
        showExport={true}
        showFilter={true}
      />

      <DataTable
        columns={[
          { title: '發送時間', dataIndex: 'sent_time', key: 'sent_time' },
          { title: '策略名稱', dataIndex: 'strategy_name', key: 'strategy_name' },
          { title: '管道類型', dataIndex: 'channel_type', key: 'channel_type' },
          { title: '接收者', dataIndex: 'recipients', key: 'recipients' },
          { title: '狀態', dataIndex: 'status', key: 'status' },
          { title: '耗時', dataIndex: 'duration', key: 'duration' },
        ]}
        dataSource={[]}
        loading={false}
        onRow={() => ({})}
      />
    </Space>
  );
};

export default NotificationHistoryPage;
