import { Card, Space, Table, Tag, Typography } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useSchedules } from '../../hooks';
import type { Schedule } from '../../hooks';

const STATUS_COLOR: Record<string, string> = {
  enabled: 'green',
  disabled: 'default',
  paused: 'orange'
};

const TYPE_COLOR: Record<string, string> = {
  one_time: 'geekblue',
  recurring: 'purple',
  event_driven: 'cyan'
};

// 排程管理頁面，顯示自動化腳本的排程與觸發資訊
export const SchedulePage = () => {
  const { data, loading } = useSchedules();

  const columns: ColumnsType<Schedule> = [
    {
      title: '排程名稱',
      dataIndex: 'name',
      key: 'name',
      render: (value: Schedule['name']) => value || '—'
    },
    {
      title: '腳本識別碼',
      dataIndex: 'script_id',
      key: 'script_id',
      width: 200,
      render: (value: Schedule['script_id']) => value || '—'
    },
    {
      title: '排程類型',
      dataIndex: 'type',
      key: 'type',
      render: (value: Schedule['type']) =>
        value ? <Tag color={TYPE_COLOR[value] || 'blue'}>{value}</Tag> : '—'
    },
    {
      title: '下一次執行',
      dataIndex: 'next_run_at',
      key: 'next_run_at',
      width: 200,
      render: (value: Schedule['next_run_at']) =>
        value ? new Date(value).toLocaleString() : '—'
    },
    {
      title: '最後執行',
      dataIndex: 'last_run_at',
      key: 'last_run_at',
      width: 200,
      render: (value: Schedule['last_run_at']) =>
        value ? new Date(value).toLocaleString() : '—'
    },
    {
      title: '狀態',
      dataIndex: 'status',
      key: 'status',
      render: (value: Schedule['status']) =>
        value ? <Tag color={STATUS_COLOR[value] || 'default'}>{value}</Tag> : '—'
    },
    {
      title: '併發策略',
      dataIndex: 'concurrency_policy',
      key: 'concurrency_policy',
      render: (value: Schedule['concurrency_policy']) => value || '—'
    }
  ];

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <Typography.Title level={4} className="page-header">
        排程管理
      </Typography.Title>
      <Card bordered={false}>
        <Table<Schedule>
          rowKey="id"
          columns={columns}
          dataSource={data?.items || []}
          loading={loading}
          pagination={false}
        />
      </Card>
    </Space>
  );
};
