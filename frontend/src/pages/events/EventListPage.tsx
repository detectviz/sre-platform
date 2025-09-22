import React from 'react';
import { Table, Spin, Alert, Tag } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useEvents } from '../../hooks/useEvents';
import type { paths } from '../../types/api';

type Event = paths['/events']['get']['responses']['200']['content']['application/json']['items'][number];

const statusColorMap: { [key: string]: string } = {
  new: 'blue',
  ack: 'orange',
  resolved: 'green',
  silence: 'purple',
};

const columns: ColumnsType<Event> = [
  {
    title: '摘要',
    dataIndex: 'summary',
    key: 'summary',
    render: (text, record) => <a href={`/events/${record.id}`}>{text}</a>,
  },
  {
    title: '資源名稱',
    dataIndex: 'resource_name',
    key: 'resource_name',
  },
  {
    title: '狀態',
    dataIndex: 'status',
    key: 'status',
    render: (status: string) => (
      <Tag color={statusColorMap[status] || 'default'}>{status.toUpperCase()}</Tag>
    ),
  },
  {
    title: '處理人',
    dataIndex: 'assignee',
    key: 'assignee',
  },
  {
    title: '觸發時間',
    dataIndex: 'trigger_time',
    key: 'trigger_time',
    render: (text: string) => new Date(text).toLocaleString(),
  },
];

const EventListPage: React.FC = () => {
  const { events, loading, error } = useEvents();

  if (loading) {
    return <Spin size="large" style={{ display: 'block', marginTop: '50px' }} />;
  }

  if (error) {
    return <Alert message="錯誤" description={error.message} type="error" showIcon />;
  }

  return (
    <div style={{ padding: '24px' }}>
      <h1>事件列表</h1>
      <Table columns={columns} dataSource={events} rowKey="id" />
    </div>
  );
};

export default EventListPage;
