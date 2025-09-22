import { MailOutlined } from '@ant-design/icons';
import { Input, Space, Table, Tag, Typography } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useMemo, useState } from 'react';
import { KpiCard, PageContainer, PageHeader, SectionCard } from '../../components';
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
  const [keyword, setKeyword] = useState('');
  const channels = data?.items ?? [];

  const stats = useMemo(() => {
    const active = channels.filter((channel) => channel.status === 'active').length;
    return {
      total: channels.length,
      active
    };
  }, [channels]);

  const filteredChannels = useMemo(() => {
    if (!keyword) {
      return channels;
    }
    return channels.filter((channel) =>
      `${channel.name ?? ''} ${channel.type ?? ''}`.toLowerCase().includes(keyword.toLowerCase())
    );
  }, [channels, keyword]);

  const columns: ColumnsType<NotificationChannel> = [
    {
      title: '管道名稱',
      dataIndex: 'name',
      key: 'name'
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
    <PageContainer>
      <PageHeader
        title="通知管道"
        subtitle="管理郵件、Slack 等通知方式，維持管道可用性。"
        icon={<MailOutlined />}
      />

      <div className="kpi-grid">
        <KpiCard
          title="管道總數"
          value={stats.total}
          unit="條"
          status="normal"
          description={`啟用 ${stats.active} 條`}
          icon={<MailOutlined />}
        />
      </div>

      <SectionCard
        title="管道列表"
        extra={
          <Input.Search
            allowClear
            placeholder="搜尋管道名稱或類型"
            onSearch={(value) => setKeyword(value)}
            onChange={(event) => setKeyword(event.target.value)}
            style={{ width: 260 }}
          />
        }
      >
        <Table<NotificationChannel>
          rowKey="id"
          columns={columns}
          dataSource={filteredChannels}
          loading={loading}
          pagination={{ pageSize: 10 }}
        />
      </SectionCard>
    </PageContainer>
  );
};
