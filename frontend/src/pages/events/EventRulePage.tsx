import React from 'react';
import { Table, Spin, Alert, Tag, Switch } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useEventRules } from '../../hooks/useEventRules';
import type { paths } from '../../types/api';

type EventRule = paths['/event-rules']['get']['responses']['200']['content']['application/json'][number];

const severityColorMap: { [key: string]: string } = {
  critical: 'red',
  warning: 'orange',
  info: 'blue',
};

const columns: ColumnsType<EventRule> = [
  {
    title: '啟用',
    dataIndex: 'enabled',
    key: 'enabled',
    render: (enabled: boolean) => <Switch checked={enabled} disabled />,
  },
  {
    title: '規則名稱',
    dataIndex: 'name',
    key: 'name',
  },
  {
    title: '監控對象',
    dataIndex: 'target',
    key: 'target',
    render: (target: string) => <Tag>{target}</Tag>,
  },
  {
    title: '嚴重程度',
    dataIndex: 'severity',
    key: 'severity',
    render: (severity: string) => (
        <Tag color={severityColorMap[severity] || 'default'}>{severity.toUpperCase()}</Tag>
    ),
  },
  {
    title: '創建者',
    dataIndex: 'creator',
    key: 'creator',
  },
  {
    title: '最後更新',
    dataIndex: 'last_updated',
    key: 'last_updated',
    render: (text: string) => new Date(text).toLocaleString(),
  },
];

const EventRulePage: React.FC = () => {
  const { rules, loading, error } = useEventRules();

  if (loading) {
    return <Spin size="large" style={{ display: 'block', marginTop: '50px' }} />;
  }

  if (error) {
    return <Alert message="錯誤" description={error.message} type="error" showIcon />;
  }

  return (
    <div style={{ padding: '24px' }}>
      <h1>事件規則</h1>
      <Table columns={columns} dataSource={rules} rowKey="id" />
    </div>
  );
};

export default EventRulePage;
