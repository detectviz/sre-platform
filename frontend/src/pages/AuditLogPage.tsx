import React, { useMemo, useState, useCallback } from 'react';
import { Button, Card, DatePicker, Drawer, Input, Select, Space, Table, Tag, Typography, Row, Col } from 'antd';
import { EyeOutlined, SearchOutlined, DownloadOutlined, FilterOutlined } from '@ant-design/icons';
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

// 動作類型選項
const ACTION_OPTIONS = [
  { label: '登入', value: 'LOGIN' },
  { label: '登出', value: 'LOGOUT' },
  { label: '建立', value: 'CREATE' },
  { label: '更新', value: 'UPDATE' },
  { label: '刪除', value: 'DELETE' },
  { label: '查看', value: 'VIEW' },
  { label: '匯出', value: 'EXPORT' },
];

// 資源類型選項
const RESOURCE_TYPE_OPTIONS = [
  { label: '使用者', value: 'user' },
  { label: '團隊', value: 'team' },
  { label: '角色', value: 'role' },
  { label: '事件', value: 'incident' },
  { label: '資源', value: 'resource' },
  { label: '儀表板', value: 'dashboard' },
  { label: '通知策略', value: 'notification_policy' },
  { label: '系統設定', value: 'system_setting' },
];

const AuditLogPage: React.FC = () => {
  const { logs, loading } = useAuditLogs();
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // 篩選狀態
  const [searchText, setSearchText] = useState('');
  const [actionFilter, setActionFilter] = useState<string | undefined>();
  const [resourceTypeFilter, setResourceTypeFilter] = useState<string | undefined>();
  const [statusFilter, setStatusFilter] = useState<string | undefined>();
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs] | null>(null);

  const handleViewDetails = (log: AuditLog) => {
    setSelectedLog(log);
    setIsDrawerOpen(true);
  };

  // 篩選邏輯
  const filteredLogs = useMemo(() => {
    return logs.filter((log: AuditLog) => {
      // 搜尋文字篩選
      if (searchText) {
        const searchLower = searchText.toLowerCase();
        const matchesSearch =
          log.user.name.toLowerCase().includes(searchLower) ||
          log.action.toLowerCase().includes(searchLower) ||
          log.resource_type.toLowerCase().includes(searchLower) ||
          (log.resource_id && log.resource_id.toLowerCase().includes(searchLower));

        if (!matchesSearch) return false;
      }

      // 動作篩選
      if (actionFilter && log.action !== actionFilter) return false;

      // 資源類型篩選
      if (resourceTypeFilter && log.resource_type !== resourceTypeFilter) return false;

      // 狀態篩選
      if (statusFilter && log.status !== statusFilter) return false;

      // 日期範圍篩選
      if (dateRange) {
        const logDate = dayjs(log.timestamp);
        if (!logDate.isBetween(dateRange[0], dateRange[1], 'day', '[]')) return false;
      }

      return true;
    });
  }, [logs, searchText, actionFilter, resourceTypeFilter, statusFilter, dateRange]);

  // 重置篩選
  const handleResetFilters = useCallback(() => {
    setSearchText('');
    setActionFilter(undefined);
    setResourceTypeFilter(undefined);
    setStatusFilter(undefined);
    setDateRange(null);
  }, []);

  // 匯出日誌
  const handleExportLogs = useCallback(() => {
    const csvContent = [
      // CSV 標題
      '時間,操作人員,動作,資源類型,資源ID,狀態',
      // CSV 資料
      ...filteredLogs.map((log: AuditLog) =>
        [
          dayjs(log.timestamp).format('YYYY-MM-DD HH:mm:ss'),
          log.user.name,
          log.action,
          log.resource_type,
          log.resource_id || '',
          log.status
        ].join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `audit_logs_${dayjs().format('YYYY-MM-DD_HH-mm-ss')}.csv`;
    link.click();
  }, [filteredLogs]);

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
        <Space direction="vertical" style={{ width: '100%' }} size="middle">
          {/* 搜尋與篩選工具列 */}
          <Row gutter={[16, 16]} align="middle">
            <Col xs={24} sm={12} md={8}>
              <Input
                prefix={<SearchOutlined />}
                placeholder="搜尋使用者、動作、資源..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                allowClear
              />
            </Col>
            <Col xs={12} sm={6} md={4}>
              <Select
                placeholder="篩選動作"
                style={{ width: '100%' }}
                value={actionFilter}
                onChange={setActionFilter}
                options={ACTION_OPTIONS}
                allowClear
              />
            </Col>
            <Col xs={12} sm={6} md={4}>
              <Select
                placeholder="資源類型"
                style={{ width: '100%' }}
                value={resourceTypeFilter}
                onChange={setResourceTypeFilter}
                options={RESOURCE_TYPE_OPTIONS}
                allowClear
              />
            </Col>
            <Col xs={12} sm={6} md={4}>
              <Select
                placeholder="狀態"
                style={{ width: '100%' }}
                value={statusFilter}
                onChange={setStatusFilter}
                options={[
                  { label: '成功', value: 'success' },
                  { label: '失敗', value: 'failure' },
                ]}
                allowClear
              />
            </Col>
            <Col xs={12} sm={6} md={4}>
              <RangePicker
                style={{ width: '100%' }}
                value={dateRange}
                onChange={setDateRange}
                placeholder={['開始日期', '結束日期']}
              />
            </Col>
          </Row>

          {/* 操作按鈕列 */}
          <Row justify="space-between" align="middle">
            <Col>
              <Space>
                <Text type="secondary">
                  共 {filteredLogs.length} 筆日誌
                  {filteredLogs.length !== logs.length && ` (已篩選 ${logs.length - filteredLogs.length} 筆)`}
                </Text>
              </Space>
            </Col>
            <Col>
              <Space>
                <Button
                  icon={<FilterOutlined />}
                  onClick={handleResetFilters}
                  disabled={!searchText && !actionFilter && !resourceTypeFilter && !statusFilter && !dateRange}
                >
                  清除篩選
                </Button>
                <Button
                  type="primary"
                  icon={<DownloadOutlined />}
                  onClick={handleExportLogs}
                  disabled={filteredLogs.length === 0}
                >
                  匯出 CSV
                </Button>
              </Space>
            </Col>
          </Row>

          <Table
            loading={loading}
            dataSource={filteredLogs}
            columns={columns}
            rowKey="id"
            pagination={{
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) => `第 ${range[0]}-${range[1]} 筆，共 ${total} 筆`,
            }}
          />
        </Space>
      </Card>
      <Drawer
        title="日誌詳情"
        width={600}
        onClose={() => setIsDrawerOpen(false)}
        open={isDrawerOpen}
      >
        {selectedLog && (
          <Space direction="vertical" style={{ width: '100%' }} size="large">
            <Card size="small" title="基本資訊">
              <Row gutter={[16, 16]}>
                <Col span={12}>
                  <Text strong>時間：</Text>
                  <Text>{dayjs(selectedLog.timestamp).format('YYYY-MM-DD HH:mm:ss')}</Text>
                </Col>
                <Col span={12}>
                  <Text strong>操作人員：</Text>
                  <Text>{selectedLog.user.name}</Text>
                </Col>
                <Col span={12}>
                  <Text strong>動作：</Text>
                  <Tag>{selectedLog.action}</Tag>
                </Col>
                <Col span={12}>
                  <Text strong>狀態：</Text>
                  <Tag color={selectedLog.status === 'success' ? 'success' : 'error'}>
                    {selectedLog.status === 'success' ? '成功' : '失敗'}
                  </Tag>
                </Col>
                <Col span={12}>
                  <Text strong>資源類型：</Text>
                  <Text>{selectedLog.resource_type}</Text>
                </Col>
                <Col span={12}>
                  <Text strong>資源 ID：</Text>
                  <Text code>{selectedLog.resource_id || '無'}</Text>
                </Col>
              </Row>
            </Card>

            <Card size="small" title="詳細資訊">
              <Typography.Paragraph>
                <pre style={{
                  background: '#f5f5f5',
                  padding: '12px',
                  borderRadius: '6px',
                  fontSize: '12px',
                  lineHeight: '1.4',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word'
                }}>
                  {JSON.stringify(selectedLog.details, null, 2)}
                </pre>
              </Typography.Paragraph>
            </Card>
          </Space>
        )}
      </Drawer>
    </Space>
  );
};

export default AuditLogPage;
