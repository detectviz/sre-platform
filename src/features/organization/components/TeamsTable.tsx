import React from 'react';
import { Table, Button, Space, Popconfirm, Tag } from 'antd';
import { Team, Pagination, Subscriber } from '../../../services/api-client';

interface TeamsTableProps {
  data?: Team[];
  pagination?: Pagination;
  loading: boolean;
  selectedRowKeys: React.Key[];
  onSelectionChange: (selectedRowKeys: React.Key[]) => void;
  onTableChange: (pagination: any, filters: any, sorter: any) => void;
  onEdit: (team: Team) => void;
  onDelete: (id: string) => void;
}

/**
 * 渲染訂閱者標籤
 */
const renderSubscribers = (subscribers?: Subscriber[]) => {
  if (!subscribers) return null;
  return (
    <Space wrap>
      {subscribers.map(sub => (
        <Tag key={`${sub.type}:${sub.id}`} color={sub.type === 'user' ? 'blue' : 'green'}>
          {sub.name}
        </Tag>
      ))}
    </Space>
  );
};

/**
 * 團隊管理表格元件
 */
const TeamsTable: React.FC<TeamsTableProps> = ({
  data,
  pagination,
  loading,
  selectedRowKeys,
  onSelectionChange,
  onTableChange,
  onEdit,
  onDelete,
}) => {
  const columns = [
    {
      title: '團隊名稱',
      dataIndex: 'name',
      key: 'name',
      sorter: true,
    },
    {
      title: '團隊管理員',
      dataIndex: 'manager',
      key: 'manager',
      render: (manager?: { id: string, name: string }) => manager?.name || '未指定',
    },
    {
      title: '成員數量',
      dataIndex: 'member_count',
      key: 'member_count',
    },
    {
      title: '通知訂閱者',
      dataIndex: 'subscribers',
      key: 'subscribers',
      render: renderSubscribers,
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: Team) => (
        <Space size="middle">
          <Button type="link" onClick={() => onEdit(record)}>編輯</Button>
          <Popconfirm
            title="確定要刪除此團隊嗎？"
            onConfirm={() => onDelete(record.id!)}
            okText="確定"
            cancelText="取消"
          >
            <Button type="link" danger>刪除</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const rowSelection = {
    selectedRowKeys,
    onChange: onSelectionChange,
  };

  return (
    <Table
      rowKey="id"
      columns={columns}
      dataSource={data}
      pagination={{
        current: pagination?.page,
        pageSize: pagination?.page_size,
        total: pagination?.total,
      }}
      loading={loading}
      rowSelection={rowSelection}
      onChange={onTableChange}
      style={{ marginTop: 16 }}
    />
  );
};

export default TeamsTable;
