import { Card, Space, Table, Tag, Typography } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useNotificationHistory } from '../../hooks';
import type { NotificationRecord } from '../../hooks';

const STATUS_COLOR: Record<string, string> = {
  success: 'green',
  failed: 'red',
  retrying: 'gold',
  cancelled: 'default'
};

export const NotificationHistoryPage = () => {
  const { data, loading } = useNotificationHistory();

  const columns: ColumnsType<NotificationRecord> = [
    {
      title: '策略名稱',
      dataIndex: 'policy_name',
      key: 'policy_name',
      render: (value: NotificationRecord['policy_name']) => value || '—'
    },
    {
      title: '通知管道',
      dataIndex: 'channel_type',
      key: 'channel_type',
      render: (value: NotificationRecord['channel_type']) =>
        value ? <Tag color="blue">{value}</Tag> : '—'
    },
    {
      title: '狀態',
      dataIndex: 'status',
      key: 'status',
      render: (value: NotificationRecord['status']) =>
        value ? <Tag color={STATUS_COLOR[value] || 'default'}>{value}</Tag> : '—'
    },
    {
      title: '接收者',
      dataIndex: 'recipients',
      key: 'recipients',
      render: (recipients: NotificationRecord['recipients']) =>
        recipients && recipients.length > 0
          ? recipients.map((item) => item.display_name || item.id).join('、')
          : '—'
    },
    {
      title: '傳送時間',
      dataIndex: 'sent_at',
      key: 'sent_at',
      render: (value: NotificationRecord['sent_at']) =>
        value ? new Date(value).toLocaleString() : '—'
    },
    {
      title: '完成時間',
      dataIndex: 'completed_at',
      key: 'completed_at',
      render: (value: NotificationRecord['completed_at']) =>
        value ? new Date(value).toLocaleString() : '—'
    },
    {
      title: '重試次數',
      dataIndex: 'retry_count',
      key: 'retry_count',
      render: (value: NotificationRecord['retry_count']) =>
        typeof value === 'number' ? value : 0
    },
    {
      title: '耗時 (毫秒)',
      dataIndex: 'duration_ms',
      key: 'duration_ms',
      render: (value: NotificationRecord['duration_ms']) =>
        typeof value === 'number' ? value.toLocaleString() : '—'
    }
  ];

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <Typography.Title level={4} className="page-header">
        通知歷史
      </Typography.Title>
      <Card bordered={false} loading={loading}>
        <Table
          rowKey="id"
          columns={columns}
          dataSource={data?.items || []}
          pagination={false}
        />
      </Card>
    </Space>
  );
};
