import React from 'react';
import { Table, Button, Space, Popconfirm, Tag } from 'antd';
import { User, Pagination } from '../../../services/api-client';

interface PersonnelTableProps {
  data?: User[];
  pagination?: Pagination;
  loading: boolean;
  selectedRowKeys: React.Key[];
  onSelectionChange: (selectedRowKeys: React.Key[]) => void;
  onTableChange: (pagination: any, filters: any, sorter: any) => void;
  onEdit: (user: User) => void;
  onDelete: (id: string) => void;
}

/**
 * 角色標籤顏色對應
 */
const roleColorMapping: { [key: string]: string } = {
  '超級管理員': 'gold',
  '團隊管理員': 'blue',
  '一般使用者': 'default',
};


/**
 * 人員管理表格元件
 */
const PersonnelTable: React.FC<PersonnelTableProps> = ({
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
      title: '姓名',
      dataIndex: 'name',
      key: 'name',
      sorter: true,
    },
    {
      title: '角色',
      dataIndex: 'role',
      key: 'role',
      render: (role: string) => <Tag color={roleColorMapping[role] || 'default'}>{role}</Tag>,
    },
    {
      title: '所屬團隊',
      dataIndex: 'teams',
      key: 'teams',
      render: (teams: { id: string, name: string }[]) => teams?.map(team => team.name).join(', '),
    },
    {
      title: '接收等級',
      dataIndex: 'notification_level',
      key: 'notification_level',
      render: (level: string[]) => level?.map(l => <Tag key={l}>{l.toUpperCase()}</Tag>),
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: User) => (
        <Space size="middle">
          <Button type="link" onClick={() => onEdit(record)}>編輯</Button>
          <Popconfirm
            title="確定要刪除此人員嗎？"
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

export default PersonnelTable;
