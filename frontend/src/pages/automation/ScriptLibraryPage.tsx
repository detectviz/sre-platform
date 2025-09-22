import { Card, Space, Table, Tag, Typography } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useScripts } from '../../hooks';
import type { Script } from '../../hooks';

const SCRIPT_TYPE_COLOR: Record<string, string> = {
  shell: 'geekblue',
  python: 'cyan',
  ansible: 'orange',
  terraform: 'purple',
  powershell: 'magenta'
};

// 腳本庫頁面，方便 SRE 快速檢視自動化腳本狀態
export const ScriptLibraryPage = () => {
  const { data, loading } = useScripts();

  const columns: ColumnsType<Script> = [
    {
      title: '腳本名稱',
      dataIndex: 'name',
      key: 'name',
      render: (value: Script['name']) => value || '—'
    },
    {
      title: '腳本類型',
      dataIndex: 'type',
      key: 'type',
      render: (value: Script['type']) =>
        value ? <Tag color={SCRIPT_TYPE_COLOR[value] || 'blue'}>{value}</Tag> : '—'
    },
    {
      title: '版本',
      dataIndex: 'version',
      key: 'version',
      width: 120,
      render: (value: Script['version']) => value || '—'
    },
    {
      title: '標籤',
      dataIndex: 'tags',
      key: 'tags',
      render: (tags: Script['tags']) =>
        tags && tags.length > 0 ? (
          <Space size={[8, 8]} wrap>
            {tags.map((tag) => (
              <Tag key={tag}>{tag}</Tag>
            ))}
          </Space>
        ) : (
          '—'
        )
    },
    {
      title: '最後執行時間',
      dataIndex: 'last_executed_at',
      key: 'last_executed_at',
      width: 200,
      render: (value: Script['last_executed_at']) =>
        value ? new Date(value).toLocaleString() : '—'
    },
    {
      title: '啟用狀態',
      dataIndex: 'is_active',
      key: 'is_active',
      width: 120,
      render: (value: Script['is_active']) =>
        value ? <Tag color="green">啟用</Tag> : <Tag color="default">停用</Tag>
    }
  ];

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <Typography.Title level={4} className="page-header">
        腳本庫
      </Typography.Title>
      <Card bordered={false}>
        <Table<Script>
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
