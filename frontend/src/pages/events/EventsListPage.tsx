import { Card, Space, Table, Tag, Typography } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useEvents } from '../../hooks';
import type { Event } from '../../hooks';

const SEVERITY_COLOR: Record<string, string> = {
  critical: 'red',
  warning: 'orange',
  info: 'blue'
};

const STATUS_COLOR: Record<string, string> = {
  new: 'blue',
  acknowledged: 'gold',
  resolved: 'green',
  closed: 'purple',
  silenced: 'magenta'
};

// 事件列表頁面，呈現最新的事件狀態與重點資訊
export const EventsListPage = () => {
  const { data, loading } = useEvents();

  const columns: ColumnsType<Event> = [
    {
      title: '事件編號',
      dataIndex: 'event_number',
      key: 'event_number',
      width: 140,
      render: (value: Event['event_number']) => value || '—'
    },
    {
      title: '事件摘要',
      dataIndex: 'summary',
      key: 'summary',
      render: (value: Event['summary']) => value || '—'
    },
    {
      title: '嚴重性',
      dataIndex: 'severity',
      key: 'severity',
      width: 120,
      render: (value: Event['severity']) =>
        value ? <Tag color={SEVERITY_COLOR[value] || 'default'}>{value}</Tag> : '—'
    },
    {
      title: '狀態',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (value: Event['status']) =>
        value ? <Tag color={STATUS_COLOR[value] || 'default'}>{value}</Tag> : '—'
    },
    {
      title: '關聯資源',
      key: 'resource',
      dataIndex: ['resource', 'name'],
      render: (_: unknown, record: Event) => record.resource?.name || '—'
    },
    {
      title: '指派對象',
      key: 'assignee',
      render: (_: unknown, record: Event) =>
        record.assignee?.display_name || record.assignee?.username || '—'
    },
    {
      title: '觸發時間',
      dataIndex: 'triggered_at',
      key: 'triggered_at',
      width: 200,
      render: (value: Event['triggered_at']) =>
        value ? new Date(value).toLocaleString() : '—'
    }
  ];

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <Typography.Title level={4} className="page-header">
        事件列表
      </Typography.Title>
      <Card bordered={false}>
        <Table<Event>
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
