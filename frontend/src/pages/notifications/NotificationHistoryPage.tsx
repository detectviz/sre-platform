import { HistoryOutlined } from '@ant-design/icons';
import { Input, Table, Tag } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useMemo, useState } from 'react';
import { KpiCard, PageContainer, PageHeader, SectionCard } from '../../components';
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
  const [keyword, setKeyword] = useState('');
  const history = data?.items ?? [];

  const stats = useMemo(() => {
    const success = history.filter((record) => record.status === 'success').length;
    return {
      total: history.length,
      success,
      successRate: history.length ? Math.round((success / history.length) * 100) : 0
    };
  }, [history]);

  const filteredHistory = useMemo(() => {
    if (!keyword) {
      return history;
    }
    return history.filter((record) =>
      `${record.policy_name ?? ''} ${record.channel_type ?? ''}`.toLowerCase().includes(keyword.toLowerCase())
    );
  }, [history, keyword]);

  const columns: ColumnsType<NotificationRecord> = [
    {
      title: '策略名稱',
      dataIndex: 'policy_name',
      key: 'policy_name'
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
      render: (value: NotificationRecord['sent_at']) => (value ? new Date(value).toLocaleString() : '—')
    },
    {
      title: '完成時間',
      dataIndex: 'completed_at',
      key: 'completed_at',
      render: (value: NotificationRecord['completed_at']) => (value ? new Date(value).toLocaleString() : '—')
    },
    {
      title: '重試次數',
      dataIndex: 'retry_count',
      key: 'retry_count',
      render: (value: NotificationRecord['retry_count']) => (typeof value === 'number' ? value : 0)
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
    <PageContainer>
      <PageHeader
        title="通知歷史"
        subtitle="檢視通知發送結果與耗時，追蹤各管道可靠度。"
        icon={<HistoryOutlined />}
      />

      <div className="kpi-grid">
        <KpiCard
          title="通知次數"
          value={stats.total}
          unit="則"
          status="normal"
          description={`成功率 ${stats.successRate}%`}
          icon={<HistoryOutlined />}
        />
      </div>

      <SectionCard
        title="通知紀錄"
        extra={
          <Input.Search
            allowClear
            placeholder="搜尋策略或管道"
            onSearch={(value) => setKeyword(value)}
            onChange={(event) => setKeyword(event.target.value)}
            style={{ width: 240 }}
          />
        }
      >
        <Table<NotificationRecord>
          rowKey="id"
          columns={columns}
          dataSource={filteredHistory}
          loading={loading}
          pagination={{ pageSize: 10 }}
        />
      </SectionCard>
    </PageContainer>
  );
};
