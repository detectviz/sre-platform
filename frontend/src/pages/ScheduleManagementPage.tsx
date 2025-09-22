import React from 'react';
import { Space, Spin } from 'antd';
import { PageHeader } from '../components/PageHeader';
import { ToolbarActions } from '../components/ToolbarActions';
import { DataTable } from '../components/DataTable';

const ScheduleManagementPage: React.FC<{ onNavigate?: () => void }> = ({ onNavigate: _ }) => {
  const [loading] = React.useState(false);

  if (loading) {
    return (
      <div style={{ width: '100%', display: 'flex', justifyContent: 'center', marginTop: 120 }}>
        <Spin tip="正在載入排程管理資料..." size="large" />
      </div>
    );
  }

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <PageHeader
        title="排程管理"
        subtitle="自動化任務的定時配置"
        description="創建和配置單次或週期性任務的執行排程。"
      />

      <ToolbarActions
        onRefresh={() => { }}
        onSearch={() => { }}
        onExport={() => { }}
        onAdd={() => { }}
        onFilter={() => { }}
        searchPlaceholder="搜索排程名稱..."
        showRefresh={true}
        showSearch={true}
        showExport={true}
        showAdd={true}
        showBatchAction={true}
        showFilter={true}
      />

      <DataTable
        columns={[
          { title: '排程名稱', dataIndex: 'name', key: 'name' },
          { title: '腳本名稱', dataIndex: 'script_name', key: 'script_name' },
          { title: '類型', dataIndex: 'type', key: 'type' },
          { title: 'Cron 表達式', dataIndex: 'cron_expression', key: 'cron_expression' },
          { title: '下一次執行時間', dataIndex: 'next_run_time', key: 'next_run_time' },
          { title: '狀態', dataIndex: 'status', key: 'status' },
        ]}
        dataSource={[]}
        loading={false}
        onRow={() => ({})}
      />
    </Space>
  );
};

export default ScheduleManagementPage;
