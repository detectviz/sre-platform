import { useMemo, useState } from 'react';
import { App as AntdApp, Button, Space, Tooltip, Typography, Alert, Modal, Descriptions, Divider, Tag, Progress, Form, Input, Select, Row, Col } from 'antd';
import { PlusOutlined, ReloadOutlined, FilterOutlined, DeleteOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { DataTable } from '../../components';
import type { ResourceGroupWithInsights } from '../../types/resources';

const { Title, Text } = Typography;

type ResourceGroupFormValues = {
  name: string;
  description: string;
  tags: string[];
};

type ResourceGroupsTabProps = {
  resourceGroups: ResourceGroupWithInsights[];
  loading: boolean;
  error: unknown;
  onRefresh: () => void;
};

export const ResourceGroupsTab = ({ resourceGroups, loading, error, onRefresh }: ResourceGroupsTabProps) => {
  const { message } = AntdApp.useApp();
  const [activeGroup, setActiveGroup] = useState<ResourceGroupWithInsights | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);

  const [editingGroup, setEditingGroup] = useState<ResourceGroupWithInsights | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [form] = Form.useForm<ResourceGroupFormValues>();

  // Filtering states
  const [healthFilter, setHealthFilter] = useState<'ALL' | 'HEALTHY' | 'WARNING' | 'CRITICAL'>('ALL');
  const [searchText, setSearchText] = useState('');
  const [selectedGroups, setSelectedGroups] = useState<string[]>([]);
  const [filterModalOpen, setFilterModalOpen] = useState(false);

  const handleOpenDetails = (group: ResourceGroupWithInsights) => {
    setActiveGroup(group);
    setDetailModalOpen(true);
  };

  const handleOpenEdit = (group: ResourceGroupWithInsights | null) => {
    setEditingGroup(group);
    form.setFieldsValue(
      group
        ? {
          name: group.name,
          description: group.description ?? '',
          tags: group.tags.map((t) => `${t.key}:${t.value}`),
        }
        : { name: '', description: '', tags: [] },
    );
    setEditModalOpen(true);
  };

  const handleFormSubmit = (values: ResourceGroupFormValues) => {
    console.log('Submitting group form:', values);
    message.success(`已${editingGroup ? '更新' : '建立'}群組「${values.name}」(模擬)`);
    setEditModalOpen(false);
    onRefresh();
  };

  // Filtering logic
  const filteredGroups = useMemo(() => {
    return resourceGroups.filter((group) => {
      // Health filter
      if (healthFilter !== 'ALL') {
        const total = group.memberCount || 1;
        const healthyPercent = (group.healthBreakdown.healthy / total) * 100;
        const warningPercent = (group.healthBreakdown.warning / total) * 100;
        const criticalPercent = (group.healthBreakdown.critical / total) * 100;

        if (healthFilter === 'HEALTHY' && healthyPercent < 80) return false;
        if (healthFilter === 'WARNING' && (warningPercent < 10 || criticalPercent > 5)) return false;
        if (healthFilter === 'CRITICAL' && criticalPercent < 5) return false;
      }

      // Search filter
      if (searchText) {
        const searchLower = searchText.toLowerCase();
        const matchesName = group.name.toLowerCase().includes(searchLower);
        const matchesDescription = (group.description || '').toLowerCase().includes(searchLower);
        const matchesTags = group.tags.some(tag =>
          tag.key.toLowerCase().includes(searchLower) ||
          tag.value.toLowerCase().includes(searchLower)
        );

        if (!matchesName && !matchesDescription && !matchesTags) return false;
      }

      return true;
    });
  }, [resourceGroups, healthFilter, searchText]);

  const handleBulkDelete = () => {
    Modal.confirm({
      title: `確定要刪除 ${selectedGroups.length} 個群組嗎？`,
      content: '此操作將會移除選中的資源群組，但不會影響其成員資源。',
      okText: '確定刪除',
      okType: 'danger',
      cancelText: '取消',
      onOk: () => {
        message.success(`已刪除 ${selectedGroups.length} 個群組 (模擬)`);
        setSelectedGroups([]);
        onRefresh();
      },
    });
  };

  const columns: ColumnsType<ResourceGroupWithInsights> = useMemo(() => [
    {
      title: '群組名稱',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, group) => (
        <Button type="link" onClick={() => handleOpenDetails(group)}>
          {text}
        </Button>
      ),
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
    },
    {
      title: '成員數量',
      dataIndex: 'memberCount',
      key: 'memberCount',
      width: 120,
    },
    {
      title: '健康狀態',
      key: 'health',
      render: (_: unknown, group) => {
        const total = group.memberCount || 1;
        const healthyPercent = total > 0 ? (group.healthBreakdown.healthy / total) * 100 : 0;
        const warningPercent = total > 0 ? (group.healthBreakdown.warning / total) * 100 : 0;
        const criticalPercent = total > 0 ? (group.healthBreakdown.critical / total) * 100 : 0;
        return (
          <Space>
            <Tooltip title={`健康: ${Math.round(healthyPercent)}%`}>
              <Progress type="circle" percent={healthyPercent} size={30} status="success" showInfo={false} />
            </Tooltip>
            <Tooltip title={`警告: ${Math.round(warningPercent)}%`}>
              <Progress type="circle" percent={warningPercent} size={30} status="active" strokeColor="#faad14" showInfo={false} />
            </Tooltip>
            <Tooltip title={`危急: ${Math.round(criticalPercent)}%`}>
              <Progress type="circle" percent={criticalPercent} size={30} status="exception" showInfo={false} />
            </Tooltip>
          </Space>
        );
      },
    },
    {
      title: '最近變更',
      dataIndex: 'recentChanges',
      key: 'recentChanges',
      width: 140,
      render: (value?: number) => `${value ?? 0} 筆 / 24 小時`,
    },
    {
      title: '操作',
      key: 'actions',
      width: 160,
      render: (_: unknown, group) => (
        <Space size={4}>
          <Button type="link" onClick={() => handleOpenDetails(group)}>
            詳情
          </Button>
          <Button type="link" onClick={() => handleOpenEdit(group)}>
            編輯
          </Button>
        </Space>
      ),
    },
  ], [form, handleOpenDetails, handleOpenEdit]);

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <Space align="center" style={{ width: '100%', display: 'flex', justifyContent: 'space-between' }}>
        <Title level={4} style={{ margin: 0 }}>資源群組</Title>
        <Space>
          <Button onClick={() => handleOpenEdit(null)} icon={<PlusOutlined />}>新增群組</Button>
          <Tooltip title="重新整理群組資料">
            <Button icon={<ReloadOutlined />} onClick={onRefresh} />
          </Tooltip>
        </Space>
      </Space>

      {Boolean(error) && !loading && (
        <Alert type="error" showIcon message="無法載入群組資料" description={error instanceof Error ? error.message : '請稍後再試'} />
      )}

      <DataTable<ResourceGroupWithInsights>
        dataSource={filteredGroups}
        columns={columns}
        rowKey={(record) => record.id}
        loading={loading}
        pagination={{
          pageSize: 8,
          showSizeChanger: false,
          showTotal: (total, range) => `第 ${range[0]}-${range[1]} 筆，共 ${total} 筆群組`
        }}
        rowSelection={{
          selectedRowKeys: selectedGroups,
          onChange: (selectedRowKeys) => setSelectedGroups(selectedRowKeys as string[]),
        }}
        titleContent={
          <Row justify="space-between" align="middle" style={{ width: '100%' }}>
            <Col>
              <Space>
                <Text strong>群組列表</Text>
                {selectedGroups.length > 0 && (
                  <Tag color="blue">{selectedGroups.length} 個已選取</Tag>
                )}
              </Space>
            </Col>
            <Col>
              <Space>
                {selectedGroups.length > 0 && (
                  <Button
                    danger
                    size="small"
                    icon={<DeleteOutlined />}
                    onClick={handleBulkDelete}
                  >
                    批量刪除
                  </Button>
                )}
                <Button
                  size="small"
                  icon={<FilterOutlined />}
                  onClick={() => setFilterModalOpen(true)}
                >
                  篩選
                </Button>
              </Space>
            </Col>
          </Row>
        }
      />

      <Modal
        open={detailModalOpen}
        title={activeGroup?.name}
        onCancel={() => setDetailModalOpen(false)}
        footer={null}
        width={600}
      >
        {activeGroup && (
          <Space direction="vertical" size={16} style={{ width: '100%' }}>
            <Descriptions bordered column={1} size="small">
              <Descriptions.Item label="描述">{activeGroup.description ?? '未提供描述'}</Descriptions.Item>
              <Descriptions.Item label="責任團隊">{activeGroup.responsibleTeamId ?? '未指定'}</Descriptions.Item>
              <Descriptions.Item label="成員數量">{activeGroup.memberCount}</Descriptions.Item>
            </Descriptions>
            <Divider orientation="left">健康概況</Divider>
            <Row gutter={16}>
              <Col span={12}>
                <Space direction="vertical" size={8} style={{ width: '100%' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                    <Tag color="green">健康</Tag>
                    <Text>{activeGroup.healthBreakdown.healthy} 個</Text>
                  </div>
                  <Progress
                    percent={(activeGroup.healthBreakdown.healthy / activeGroup.memberCount) * 100}
                    strokeColor="#52c41a"
                    showInfo={false}
                    size="small"
                  />
                </Space>
              </Col>
              <Col span={12}>
                <Space direction="vertical" size={8} style={{ width: '100%' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                    <Tag color="gold">警告</Tag>
                    <Text>{activeGroup.healthBreakdown.warning} 個</Text>
                  </div>
                  <Progress
                    percent={(activeGroup.healthBreakdown.warning / activeGroup.memberCount) * 100}
                    strokeColor="#faad14"
                    showInfo={false}
                    size="small"
                  />
                </Space>
              </Col>
            </Row>
            <Row gutter={16} style={{ marginTop: 12 }}>
              <Col span={12}>
                <Space direction="vertical" size={8} style={{ width: '100%' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                    <Tag color="red">危急</Tag>
                    <Text>{activeGroup.healthBreakdown.critical} 個</Text>
                  </div>
                  <Progress
                    percent={(activeGroup.healthBreakdown.critical / activeGroup.memberCount) * 100}
                    strokeColor="#f5222d"
                    showInfo={false}
                    size="small"
                  />
                </Space>
              </Col>
              <Col span={12}>
                <Space direction="vertical" size={8} style={{ width: '100%' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                    <Tag color="blue">維護</Tag>
                    <Text>{activeGroup.healthBreakdown.maintenance} 個</Text>
                  </div>
                  <Progress
                    percent={(activeGroup.healthBreakdown.maintenance / activeGroup.memberCount) * 100}
                    strokeColor="#1890ff"
                    showInfo={false}
                    size="small"
                  />
                </Space>
              </Col>
            </Row>
            <Divider orientation="left">標籤</Divider>
            <Space size={6} wrap>
              {activeGroup.tags.length === 0 && <Text type="secondary">無標籤</Text>}
              {activeGroup.tags.map((tag) => (
                <Tag key={`${tag.key}-${tag.value}`} color="geekblue">{tag.key}:{tag.value}</Tag>
              ))}
            </Space>
          </Space>
        )}
      </Modal>

      <Modal
        title={editingGroup ? '編輯群組' : '新增群組'}
        open={editModalOpen}
        onCancel={() => setEditModalOpen(false)}
        onOk={() => form.submit()}
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={handleFormSubmit} initialValues={{ name: '', description: '', tags: [] }}>
          <Form.Item name="name" label="群組名稱" rules={[{ required: true, message: '請輸入群組名稱' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="description" label="描述">
            <Input.TextArea rows={3} />
          </Form.Item>
          <Form.Item name="tags" label="標籤">
            <Select mode="tags" tokenSeparators={[' ']} placeholder="格式：key:value" />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="篩選群組"
        open={filterModalOpen}
        onCancel={() => setFilterModalOpen(false)}
        footer={[
          <Button key="reset" onClick={() => {
            setHealthFilter('ALL');
            setSearchText('');
            message.info('已重設篩選條件');
          }}>
            重設
          </Button>,
          <Button key="close" type="primary" onClick={() => setFilterModalOpen(false)}>
            關閉
          </Button>,
        ]}
      >
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          <div>
            <Text strong>健康狀態篩選</Text>
            <br />
            <Select
              style={{ width: '100%', marginTop: 8 }}
              value={healthFilter}
              onChange={setHealthFilter}
              options={[
                { label: '全部狀態', value: 'ALL' },
                { label: '健康 (≥80%)', value: 'HEALTHY' },
                { label: '警告狀態', value: 'WARNING' },
                { label: '危急狀態 (≥5%)', value: 'CRITICAL' },
              ]}
            />
          </div>
          <div>
            <Text strong>搜尋關鍵字</Text>
            <br />
            <Input
              style={{ marginTop: 8 }}
              placeholder="搜尋群組名稱、描述或標籤"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              allowClear
            />
          </div>
          <Divider />
          <Row gutter={16}>
            <Col span={12}>
              <Text type="secondary">篩選結果：{filteredGroups.length} 個群組</Text>
            </Col>
            <Col span={12}>
              <Text type="secondary">總計：{resourceGroups.length} 個群組</Text>
            </Col>
          </Row>
        </Space>
      </Modal>
    </Space>
  );
};
