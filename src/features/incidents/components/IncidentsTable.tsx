import React from 'react';
import { Table, Tag, Space, Button } from 'antd';
import type { TableProps } from 'antd';
import { Incident, Pagination } from '../../../services/api-client';

// 嚴重性與其對應的顏色
const severityMap: { [key: string]: { color: string; text: string } } = {
  critical: { color: 'red', text: '高' },
  error: { color: 'orange', text: '中' },
  warning: { color: 'gold', text: '低' },
  info: { color: 'blue', text: '資訊' },
};

// 狀態與其對應的顏色
const statusMap: { [key: string]: { color: string; text: string } } = {
  new: { color: '#f5222d', text: '新告警' },
  acknowledged: { color: '#faad14', text: '處理中' },
  resolved: { color: '#52c41a', text: '已解決' },
};

interface IncidentsTableProps {
  data?: Incident[];
  pagination?: Pagination;
  loading: boolean;
  selectedRowKeys: React.Key[];
  onTableChange: (pagination: any, filters: any, sorter: any) => void;
  onSelectionChange: (selectedKeys: React.Key[]) => void;
  onAcknowledge: (incidentId: string) => void;
  onShowDetails: (incident: Incident) => void;
}

/**
 * 用於展示告警紀錄列表的表格元件
 */
const IncidentsTable: React.FC<IncidentsTableProps> = ({
  data,
  pagination,
  loading,
  selectedRowKeys,
  onTableChange,
  onSelectionChange,
  onAcknowledge,
  onShowDetails,
}) => {
  const columns: TableProps<Incident>['columns'] = [
    {
      title: '狀態',
      dataIndex: 'status',
      key: 'status',
      render: (status: keyof typeof statusMap) => {
        const statusInfo = statusMap[status] || { color: 'default', text: '未知' };
        return <span style={{ color: statusInfo.color }}>{statusInfo.text}</span>;
      },
    },
    {
      title: '時間',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (text) => new Date(text).toLocaleString(),
    },
    {
      title: '等級',
      dataIndex: 'severity',
      key: 'severity',
      render: (severity: keyof typeof severityMap) => {
        const severityInfo = severityMap[severity] || { color: 'default', text: '未知' };
        return <Tag color={severityInfo.color}>{severityInfo.text}</Tag>;
      },
    },
    {
      title: '處理人員',
      dataIndex: 'assignee',
      key: 'assignee',
      render: (text) => text || '-',
    },
    {
      title: '資源名稱',
      dataIndex: ['affected_resources', 0], // 假設只顯示第一個受影響的資源
      key: 'resource_name',
    },
    {
      title: '說明',
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          {record.status === 'new' && (
            <a onClick={() => onAcknowledge(record.id!)}>Ack</a>
          )}
          <a onClick={() => onShowDetails(record)}>詳情</a>
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

export default IncidentsTable;
