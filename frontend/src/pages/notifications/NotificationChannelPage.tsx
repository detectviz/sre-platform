import { Card, Space, Table, Tag, Typography } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useNotificationChannels } from '../../hooks';
import type { NotificationChannel } from '../../hooks';

const CHANNEL_COLOR: Record<string, string> = {
  email: 'geekblue',
  slack: 'cyan',
  teams: 'purple',
  webhook: 'magenta',
  line: 'green',
  sms: 'orange'
};

const STATUS_COLOR: Record<string, string> = {
  active: 'green',
  inactive: 'default',
  error: 'red'
};

// 通知管道頁面，提供不同通知方式的狀態與測試資訊
export const NotificationChannelPage = () => {
  const { data, loading } = useNotificationChannels();

  const columns: ColumnsType<NotificationChannel> = [
    {
      title: '管道名稱',
      dataIndex: 'name',
      key: 'name',
      render: (value: NotificationChannel['name']) => value || '—'
    },
    {
      title: '管道類型',
      dataIndex: 'type',
      key: 'type',
      render: (value: NotificationChannel['type']) =>
        value ? <Tag color={CHANNEL_COLOR[value] || 'blue'}>{value}</Tag> : '—'
    },
    {
      title: '狀態',
      dataIndex: 'status',
      key: 'status',
      render: (value: NotificationChannel['status']) =>
        value ? <Tag color={STATUS_COLOR[value] || 'default'}>{value}</Tag> : '—'
    },
    {
      title: '最後測試時間',
      dataIndex: 'last_tested_at',
      key: 'last_tested_at',
      width: 200,
      render: (value: NotificationChannel['last_tested_at']) =>
        value ? new Date(value).toLocaleString() : '—'
    },
    {
      title: '建立者',
      key: 'created_by',
      render: (_: unknown, record: NotificationChannel) =>
        record.created_by?.display_name || record.created_by?.username || '—'
    }
  ];

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <Typography.Title level={4} className="page-header">
        通知管道
      </Typography.Title>
      <Card bordered={false}>
        <Table<NotificationChannel>
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
