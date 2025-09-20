import React, { useMemo, useState } from 'react';
import { Button, Card, DatePicker, Drawer, Input, Select, Space, Table, Tag, Typography } from 'antd';
import { EyeOutlined, SearchOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { PageHeader } from '../components';
import useAuditLogs from '../hooks/useAuditLogs';

const { RangePicker } = DatePicker;
const { Title, Text } = Typography;

type AuditLog = {
  id: string;
  timestamp: string;
  user: { id: string; name: string };
  action: string;
  resource_type: string;
  resource_id: string;
  status: 'success' | 'failure';
  details: any;
};

const AuditLogPage: React.FC = () => {
  const { logs, loading } = useAuditLogs();
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const handleViewDetails = (log: AuditLog) => {
    setSelectedLog(log);
    setIsDrawerOpen(true);
  };

  const columns = useMemo(() => [
    {
      title: '時間',
      dataIndex: 'timestamp',
      key: 'timestamp',
      render: (text: string) => dayjs(text).format('YYYY-MM-DD HH:mm:ss'),
    },
    {
      title: '操作人員',
      dataIndex: 'user',
      key: 'user',
      render: (user: { name: string }) => user.name,
    },
    {
      title: '動作',
      dataIndex: 'action',
      key: 'action',
      render: (action: string) => <Tag>{action.toUpperCase()}</Tag>,
    },
    {
      title: '資源類型',
      dataIndex: 'resource_type',
      key: 'resource_type',
    },
    {
      title: '狀態',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => <Tag color={status === 'success' ? 'success' : 'error'}>{status}</Tag>,
    },
    {
      title: '詳情',
      key: 'details',
      render: (_: any, record: AuditLog) => (
        <Button icon={<EyeOutlined />} onClick={() => handleViewDetails(record)}>
          查看
        </Button>
      ),
    },
  ], []);

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <PageHeader
        title="審計日誌"
        subtitle="追蹤平台中的所有重要操作與系統事件"
      />
      <Card>
        <Space direction="vertical" style={{ width: '100%' }}>
          <Space>
            <Input prefix={<SearchOutlined />} placeholder="搜尋使用者或資源" />
            <Select placeholder="篩選動作" style={{ width: 120 }}>
              {/* Add options here */}
            </Select>
            <RangePicker />
          </Space>
          <Table
            loading={loading}
            dataSource={logs}
            columns={columns}
            rowKey="id"
          />
        </Space>
      </Card>
      <Drawer
        title="日誌詳情"
        width={500}
        onClose={() => setIsDrawerOpen(false)}
        open={isDrawerOpen}
      >
        {selectedLog && (
          <pre>{JSON.stringify(selectedLog.details, null, 2)}</pre>
        )}
      </Drawer>
    </Space>
  );
};

export default AuditLogPage;
