import { Card, Space, Table, Tag, Typography } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useResources } from '../../hooks';
import type { Resource } from '../../hooks';

const STATUS_COLOR: Record<string, string> = {
  healthy: 'green',
  warning: 'orange',
  critical: 'red',
  offline: 'default'
};

const ENVIRONMENT_COLOR: Record<string, string> = {
  production: 'red',
  staging: 'geekblue',
  development: 'cyan',
  testing: 'purple'
};

// 資源列表頁面，呈現主要基礎架構資源狀態
export const ResourceListPage = () => {
  const { data, loading } = useResources();

  const columns: ColumnsType<Resource> = [
    {
      title: '資源名稱',
      dataIndex: 'name',
      key: 'name',
      render: (value: Resource['name']) => value || '—'
    },
    {
      title: '資源類型',
      dataIndex: 'type',
      key: 'type',
      render: (value: Resource['type']) =>
        value ? <Tag color="blue">{value}</Tag> : '—'
    },
    {
      title: '執行環境',
      dataIndex: 'environment',
      key: 'environment',
      render: (value: Resource['environment']) =>
        value ? <Tag color={ENVIRONMENT_COLOR[value] || 'default'}>{value}</Tag> : '—'
    },
    {
      title: '健康狀態',
      dataIndex: 'status',
      key: 'status',
      render: (value: Resource['status']) =>
        value ? <Tag color={STATUS_COLOR[value] || 'default'}>{value}</Tag> : '—'
    },
    {
      title: '擁有團隊',
      dataIndex: 'owner_team',
      key: 'owner_team',
      render: (value: Resource['owner_team']) => value || '—'
    },
    {
      title: '所在區域',
      dataIndex: 'region',
      key: 'region',
      render: (value: Resource['region']) => value || '—'
    },
    {
      title: '標籤',
      dataIndex: 'tags',
      key: 'tags',
      render: (tags: Resource['tags']) =>
        tags && tags.length > 0 ? (
          <Space size={[8, 8]} wrap>
            {tags.map((tag) => (
              <Tag key={tag}>{tag}</Tag>
            ))}
          </Space>
        ) : (
          '—'
        )
    }
  ];

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <Typography.Title level={4} className="page-header">
        資源列表
      </Typography.Title>
      <Card bordered={false}>
        <Table<Resource>
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
