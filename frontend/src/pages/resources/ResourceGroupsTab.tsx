import { useMemo, useState } from 'react';
import { App as AntdApp, Button, Space, Tooltip, Typography, Alert, Modal, Descriptions, Divider, Tag, Progress, Form, Input } from 'antd';
import { PlusOutlined, ReloadOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { DataTable } from '../../components';
import type { ResourceGroupWithInsights } from '../../types/resources';

const { Title } = Typography;

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
        dataSource={resourceGroups}
        columns={columns}
        rowKey={(record) => record.id}
        loading={loading}
        pagination={{ pageSize: 8, showSizeChanger: false }}
        titleContent={<span style={{ fontWeight: 600 }}>群組列表</span>}
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
            <Space size={12} wrap>
              <Tag color="green">健康 {activeGroup.healthBreakdown.healthy}</Tag>
              <Tag color="gold">警告 {activeGroup.healthBreakdown.warning}</Tag>
              <Tag color="red">危急 {activeGroup.healthBreakdown.critical}</Tag>
              <Tag color="blue">維護 {activeGroup.healthBreakdown.maintenance}</Tag>
              <Tag>靜音 {activeGroup.healthBreakdown.silenced}</Tag>
            </Space>
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
    </Space>
  );
};
