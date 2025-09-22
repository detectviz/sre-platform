import React from 'react';
import { Space, Spin } from 'antd';
import { PageHeader } from '../components/PageHeader';
import { ToolbarActions } from '../components/ToolbarActions';
import { DataTable } from '../components/DataTable';

const NotificationChannelPage: React.FC<{ onNavigate?: () => void }> = ({ onNavigate: _ }) => {
  const [loading] = React.useState(false);

  if (loading) {
    return (
      <div style={{ width: '100%', display: 'flex', justifyContent: 'center', marginTop: 120 }}>
        <Spin tip="正在載入通知管道資料..." size="large" />
      </div>
    );
  }

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <PageHeader
        title="通知管道"
        subtitle="多種通知管道的配置和管理"
        description="配置 Email、Slack、Webhook、LINE、SMS 等通知管道。"
      />

      <ToolbarActions
        onRefresh={() => { }}
        onSearch={() => { }}
        onExport={() => { }}
        onAdd={() => { }}
        onFilter={() => { }}
        searchPlaceholder="搜索管道名稱..."
        showRefresh={true}
        showSearch={true}
        showExport={true}
        showAdd={true}
        showBatchAction={true}
        showFilter={true}
      />

      <DataTable
        columns={[
          { title: '管道名稱', dataIndex: 'name', key: 'name' },
          { title: '類型', dataIndex: 'type', key: 'type' },
          { title: '狀態', dataIndex: 'status', key: 'status' },
          { title: '最後更新時間', dataIndex: 'updated_at', key: 'updated_at' },
        ]}
        dataSource={[]}
        loading={false}
        onRow={() => ({})}
      />
    </Space>
  );
};

export default NotificationChannelPage;
