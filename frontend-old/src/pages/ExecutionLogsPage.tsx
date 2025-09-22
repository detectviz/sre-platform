import React from 'react';
import { Space, Spin } from 'antd';
import { PageHeader } from '../components/PageHeader';
import { ToolbarActions } from '../components/ToolbarActions.tsx';
import { DataTable } from '../components/DataTable';

const ExecutionLogsPage: React.FC<{ onNavigate?: () => void }> = ({ onNavigate: _ }) => {
  const [loading] = React.useState(false);

  if (loading) {
    return (
      <div style={{ width: '100%', display: 'flex', justifyContent: 'center', marginTop: 120 }}>
        <Spin tip="正在載入執行日誌資料..." size="large" />
      </div>
    );
  }

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <PageHeader
        title="執行日誌"
        subtitle="自動化任務執行歷史的詳細追蹤"
        description="查看執行狀態、耗時和詳細日誌信息。"
      />

      <ToolbarActions
        onRefresh={() => { }}
        onSearch={() => { }}
        onExport={() => { }}
        onFilter={() => { }}
        searchPlaceholder="搜索執行 ID..."
        showRefresh={true}
        showSearch={true}
        showExport={true}
        showFilter={true}
      />

      <DataTable
        columns={[
          { title: '執行 ID', dataIndex: 'execution_id', key: 'execution_id' },
          { title: '腳本名稱', dataIndex: 'script_name', key: 'script_name' },
          { title: '觸發來源', dataIndex: 'trigger_source', key: 'trigger_source' },
          { title: '開始時間', dataIndex: 'start_time', key: 'start_time' },
          { title: '耗時', dataIndex: 'duration', key: 'duration' },
          { title: '狀態', dataIndex: 'status', key: 'status' },
        ]}
        dataSource={[]}
        loading={false}
        onRow={() => ({})}
      />
    </Space>
  );
};

export default ExecutionLogsPage;
