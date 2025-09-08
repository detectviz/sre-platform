import React from 'react';
import { Table, Tag, Space, Popconfirm, Tooltip } from 'antd';
import type { TableProps } from 'antd';
import { Resource, Pagination } from '../../../services/api-client';

// 狀態與其對應的顏色和文字
const statusMap = {
  healthy: { color: 'green', text: '正常' },
  warning: { color: 'gold', text: '警告' },
  critical: { color: 'red', text: '異常' },
  unknown: { color: 'default', text: '未知' },
};

interface ResourceTableProps {
  data?: Resource[];
  pagination?: Pagination;
  loading: boolean;
  selectedRowKeys: React.Key[];
  onTableChange: (pagination: any, filters: any, sorter: any) => void;
  onSelectionChange: (selectedKeys: React.Key[]) => void;
  onDelete: (resourceId: string) => void;
  onEdit: (resource: Resource) => void;
}

/**
 * 用於展示資源列表的表格元件
 */
const ResourceTable: React.FC<ResourceTableProps> = ({
  data,
  pagination,
  loading,
  selectedRowKeys,
  onTableChange,
  onSelectionChange,
  onDelete,
  onEdit,
}) => {
  const columns: TableProps<Resource>['columns'] = [
    {
      title: '狀態',
      dataIndex: 'status',
      key: 'status',
      width: 80,
      render: (status: keyof typeof statusMap) => {
        const statusInfo = statusMap[status] || statusMap.unknown;
        return (
          <Tooltip title={statusInfo.text}>
            <Tag color={statusInfo.color} style={{ margin: 0 }}>
              {statusInfo.text}
            </Tag>
          </Tooltip>
        );
      },
    },
    {
      title: '資源名稱',
      dataIndex: 'name',
      key: 'name',
      sorter: true,
    },
    {
      title: 'IP 位址',
      dataIndex: 'ip_address',
      key: 'ip_address',
    },
    {
      title: '所屬群組',
      dataIndex: 'group_name',
      key: 'group_name',
      render: (group) => group || '無',
    },
    {
      title: '操作',
      key: 'action',
      width: 120,
      render: (_, record) => (
        <Space size="middle">
          <a onClick={() => onEdit(record)}>編輯</a>
          <Popconfirm
            title="確定要刪除這個資源嗎？"
            onConfirm={() => onDelete(record.id!)}
            okText="確定"
            cancelText="取消"
          >
            <a>刪除</a>
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
      loading={loading}
      rowSelection={rowSelection}
      pagination={{
        current: pagination?.page,
        pageSize: pagination?.page_size,
        total: pagination?.total,
        showSizeChanger: true,
      }}
      onChange={onTableChange}
    />
  );
};

export default ResourceTable;
