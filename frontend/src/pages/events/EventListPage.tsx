import React, { useState } from 'react';
import { Table, Spin, Alert, Tag, Button, Space } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useEvents } from '../../hooks/useEvents';
import type { paths } from '../../types/api';
import EventFilterModal from './EventFilterModal';

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
  const { events, loading, error, filters, setFilters } = useEvents();
  const [isModalVisible, setIsModalVisible] = useState(false);

  if (error) {
    return <Alert message="錯誤" description={error.message} type="error" showIcon />;
  }

  return (
    <div style={{ padding: '24px' }}>
      <Space style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
        <h1>事件列表</h1>
        <Button icon={<SearchOutlined />} onClick={() => setIsModalVisible(true)}>
          搜索篩選
        </Button>
      </Space>

      <Spin spinning={loading}>
        <Table columns={columns} dataSource={events} rowKey="id" />
      </Spin>

      <EventFilterModal
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        onApplyFilters={setFilters}
        initialFilters={filters}
      />
    </div>
  );
};

export default EventListPage;
