import { Card, Space, Table, Tag, Typography } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useExecutions } from '../../hooks';
import type { Execution } from '../../hooks';

const STATUS_COLOR: Record<string, string> = {
  pending: 'default',
  running: 'blue',
  success: 'green',
  failed: 'red',
  cancelled: 'magenta',
  timeout: 'orange'
};

const TRIGGER_COLOR: Record<string, string> = {
  manual: 'geekblue',
  schedule: 'cyan',
  event: 'purple',
  api: 'gold'
};

// 執行日誌頁面，協助追蹤腳本執行狀態與耗時
export const ExecutionLogPage = () => {
  const { data, loading } = useExecutions();

  const columns: ColumnsType<Execution> = [
    {
      title: '執行識別碼',
      dataIndex: 'id',
      key: 'id',
      width: 200,
      render: (value: Execution['id']) => value || '—'
    },
    {
      title: '觸發來源',
      dataIndex: 'trigger_type',
      key: 'trigger_type',
      render: (value: Execution['trigger_type']) =>
        value ? <Tag color={TRIGGER_COLOR[value] || 'blue'}>{value}</Tag> : '—'
    },
    {
      title: '狀態',
      dataIndex: 'status',
      key: 'status',
      render: (value: Execution['status']) =>
        value ? <Tag color={STATUS_COLOR[value] || 'default'}>{value}</Tag> : '—'
    },
    {
      title: '開始時間',
      dataIndex: 'started_at',
      key: 'started_at',
      width: 200,
      render: (value: Execution['started_at']) =>
        value ? new Date(value).toLocaleString() : '—'
    },
    {
      title: '結束時間',
      dataIndex: 'finished_at',
      key: 'finished_at',
      width: 200,
      render: (value: Execution['finished_at']) =>
        value ? new Date(value).toLocaleString() : '—'
    },
    {
      title: '耗時 (毫秒)',
      dataIndex: 'duration_ms',
      key: 'duration_ms',
      render: (value: Execution['duration_ms']) =>
        typeof value === 'number' ? value.toLocaleString() : '—'
    },
    {
      title: '觸發人員',
      key: 'triggered_by',
      render: (_: unknown, record: Execution) =>
        record.triggered_by?.display_name || record.triggered_by?.username || '—'
    }
  ];

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <Typography.Title level={4} className="page-header">
        執行日誌
      </Typography.Title>
      <Card bordered={false}>
        <Table<Execution>
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
