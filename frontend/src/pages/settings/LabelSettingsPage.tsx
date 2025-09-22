import { Card, Space, Table, Tag, Typography } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useLabels } from '../../hooks';
import type { Label } from '../../hooks';

export const LabelSettingsPage = () => {
  const { data, loading } = useLabels();

  const columns: ColumnsType<Label> = [
    {
      title: '標籤鍵',
      dataIndex: 'key',
      key: 'key'
    },
    {
      title: '標籤值',
      dataIndex: 'value',
      key: 'value'
    },
    {
      title: '分類',
      dataIndex: 'category',
      key: 'category',
      render: (value: Label['category']) => value || '—'
    },
    {
      title: '顏色',
      dataIndex: 'color',
      key: 'color',
      render: (value: Label['color']) =>
        value ? (
          <Tag color={value} style={{ color: '#fff' }}>
            {value}
          </Tag>
        ) : (
          '—'
        )
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
      render: (value: Label['description']) => value || '—'
    },
    {
      title: '標籤來源',
      dataIndex: 'is_system',
      key: 'is_system',
      render: (value: Label['is_system']) =>
        value ? <Tag color="purple">系統內建</Tag> : <Tag color="green">自訂</Tag>
    },
    {
      title: '建立者',
      dataIndex: 'created_by',
      key: 'created_by',
      render: (creator: Label['created_by']) =>
        creator?.display_name || creator?.username || '—'
    },
    {
      title: '更新者',
      dataIndex: 'updated_by',
      key: 'updated_by',
      render: (updater: Label['updated_by']) =>
        updater?.display_name || updater?.username || '—'
    },
    {
      title: '建立時間',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (value: Label['created_at']) =>
        value ? new Date(value).toLocaleString() : '—'
    },
    {
      title: '更新時間',
      dataIndex: 'updated_at',
      key: 'updated_at',
      render: (value: Label['updated_at']) =>
        value ? new Date(value).toLocaleString() : '—'
    }
  ];

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <Typography.Title level={4} className="page-header">
        標籤管理
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
