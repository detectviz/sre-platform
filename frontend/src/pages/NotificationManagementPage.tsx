import { useCallback, useMemo, useState } from 'react';
import {
  App as AntdApp,
  Alert,
  Button,
  Col,
  Form,
  Input,
  Modal,
  Row,
  Select,
  Space,
  Switch,
  Tabs,
  Spin,
} from 'antd';
import type { TabsProps } from 'antd';
import {
  BellOutlined,
  CheckCircleOutlined,
  HistoryOutlined,
  MailOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import fallbackData from '../mocks/db.json';
import { ContextualKPICard, DataTable, PageHeader, StatusBadge } from '../components';
import useNotifications from '../hooks/useNotifications';
import useNotificationChannels from '../hooks/useNotificationChannels';
import type { NotificationChannel } from '../types/notifications';
import { fetchJson } from '../utils/apiClient';

dayjs.extend(relativeTime);

type NotificationStrategy = {
  key: string;
  name: string;
  description?: string;
  channels: string[];
  severity?: string[];
  created_at?: string;
};

type NotificationChannel = {
  key: string;
  name: string;
  type: string;
  enabled: boolean;
  created_at?: string;
  updated_at?: string;
};

type NotificationRecord = {
  id: string;
  channel_name: string;
  recipient: string;
  status: 'pending' | 'sent' | 'failed' | 'delivered';
  sent_at?: string;
  created_at?: string;
  error_message?: string | null;
};

const buildInitialStrategies = (): NotificationStrategy[] => {
  const raw = fallbackData.notification_policies ?? [];
  return raw.map((policy) => ({
    key: policy.id ?? `ns_${policy.name}`,
    name: policy.name,
    description: policy.description,
    channels: policy.channels ?? [],
    severity: policy.severity ?? [],
    created_at: policy.created_at,
  }));
};

const buildInitialChannels = (): NotificationChannel[] => {
  const raw = fallbackData.notification_channels ?? [];
  return raw.map((channel) => ({
    key: channel.id ?? `nc_${channel.name}`,
    name: channel.name,
    type: channel.type,
    enabled: channel.enabled,
    created_at: channel.created_at,
    updated_at: channel.updated_at,
  }));
};

const NotificationStrategiesSection = ({
  data,
  setData,
}: {
  data: NotificationStrategy[];
  setData: (strategies: NotificationStrategy[]) => void;
}) => {
  const { message } = AntdApp.useApp();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<NotificationStrategy | null>(null);
  const [form] = Form.useForm<NotificationStrategy>();

  const handleEdit = useCallback((record?: NotificationStrategy) => {
    setEditing(record ?? null);
    form.setFieldsValue(record ?? { name: '', channels: [], severity: [] });
    setOpen(true);
  }, [form]);

  const handleTest = useCallback(
    (record: NotificationStrategy) => {
      message.success(`已發送「${record.name}」策略的測試通知 (模擬)`);
    },
    [message],
  );

  const handleClone = useCallback(
    (record: NotificationStrategy) => {
      const key = `ns_${Date.now()}`;
      const clone: NotificationStrategy = {
        ...record,
        key,
        name: `${record.name} (複製)`,
      };
      setData([clone, ...data]);
      message.success(`已複製策略「${record.name}」`);
    },
    [data, message, setData],
  );

  const columns = useMemo(
    () => [
      { title: '名稱', dataIndex: 'name', key: 'name' },
      {
        title: '管道數量',
        dataIndex: 'channels',
        key: 'channels',
        render: (channels: string[]) => channels?.length ?? 0,
      },
      {
        title: '監控嚴重性',
        dataIndex: 'severity',
        key: 'severity',
        render: (severity?: string[]) => (severity && severity.length > 0 ? severity.join(', ') : '未設定'),
      },
      {
        title: '操作',
        key: 'actions',
        render: (_: unknown, record: NotificationStrategy) => (
          <Space size={4} wrap>
            <Button type="link" onClick={() => handleEdit(record)}>
              編輯
            </Button>
            <Button type="link" onClick={() => handleTest(record)}>
              測試
            </Button>
            <Button type="link" onClick={() => handleClone(record)}>
              複製
            </Button>
          </Space>
        ),
      },
    ],
    [handleClone, handleEdit, handleTest],
  );

  const handleSubmit = (values: NotificationStrategy) => {
    if (editing) {
      setData(data.map((item) => (item.key === editing.key ? { ...editing, ...values } : item)));
      message.success('策略更新成功');
    } else {
      const key = `ns_${Date.now()}`;
      setData([{ ...values, key }, ...data]);
      message.success('策略新增成功');
    }
    setOpen(false);
  };

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <Button type="primary" onClick={() => handleEdit()}>
        新增策略
      </Button>

      <DataTable<NotificationStrategy>
        dataSource={data}
        columns={columns}
        rowKey={(record) => record.key}
        titleContent={<span style={{ fontWeight: 600 }}>通知策略</span>}
      />

      <Modal
        open={open}
        title={editing ? '編輯通知策略' : '新增通知策略'}
        onCancel={() => setOpen(false)}
        onOk={() => form.submit()}
        okText="儲存"
        cancelText="取消"
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item name="name" label="策略名稱" rules={[{ required: true, message: '請輸入策略名稱' }]}>
            <Input placeholder="例如：Checkout Critical Pager" />
          </Form.Item>
          <Form.Item name="description" label="描述">
            <Input.TextArea rows={3} placeholder="策略用途與適用範圍" />
          </Form.Item>
          <Form.Item name="channels" label="通知管道" rules={[{ required: true, message: '請至少選擇一個管道' }]}>
            <Select mode="tags" placeholder="輸入或選擇管道識別" />
          </Form.Item>
          <Form.Item name="severity" label="監控嚴重性">
            <Select mode="multiple" placeholder="選擇適用的嚴重性">
              <Select.Option value="critical">critical</Select.Option>
              <Select.Option value="high">high</Select.Option>
              <Select.Option value="medium">medium</Select.Option>
              <Select.Option value="low">low</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </Space>
  );
};

const NotificationChannelsSection = ({
  data,
  setData,
}: {
  data: NotificationChannel[];
  setData: (channels: NotificationChannel[]) => void;
}) => {
  const { message } = AntdApp.useApp();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<NotificationChannel | null>(null);
  const [form] = Form.useForm<NotificationChannel>();

  const handleEdit = useCallback((record?: NotificationChannel) => {
    setEditing(record ?? null);
    form.setFieldsValue(record ?? { name: '', type: 'email', enabled: true });
    setOpen(true);
  }, [form]);

  const handleToggle = useCallback(
    (record: NotificationChannel) => {
      setData((prev) =>
        prev.map((channel) =>
          channel.key === record.key
            ? { ...channel, enabled: !channel.enabled }
            : channel,
        ),
      );
      message.info(`通知管道「${record.name}」已${record.enabled ? '停用' : '啟用'} (模擬)`);
    },
    [message, setData],
  );

  const handleTest = useCallback(
    (record: NotificationChannel) => {
      message.success(`已發送「${record.name}」的測試通知 (模擬)`);
    },
    [message],
  );

  const columns = useMemo(
    () => [
      { title: '名稱', dataIndex: 'name', key: 'name' },
      { title: '類型', dataIndex: 'type', key: 'type' },
      {
        title: '啟用',
        dataIndex: 'enabled',
        key: 'enabled',
        render: (_: boolean, record: NotificationChannel) => (
          <Switch checked={record.enabled} onChange={() => handleToggle(record)} />
        ),
      },
      {
        title: '操作',
        key: 'actions',
        render: (_: unknown, record: NotificationChannel) => (
          <Space size={4} wrap>
            <Button type="link" onClick={() => handleEdit(record)}>
              編輯
            </Button>
            <Button type="link" onClick={() => handleTest(record)}>
              測試
            </Button>
            <Button type="link" onClick={() => handleToggle(record)}>
              {record.enabled ? '停用' : '啟用'}
            </Button>
          </Space>
        ),
      },
    ],
    [handleEdit, handleTest, handleToggle],
  );

  const handleSubmit = (values: NotificationChannel) => {
    if (editing) {
      setData(data.map((item) => (item.key === editing.key ? { ...editing, ...values } : item)));
      message.success('通知管道更新成功');
    } else {
      const key = `nc_${Date.now()}`;
      setData([{ ...values, key }, ...data]);
      message.success('通知管道新增成功');
    }
    setOpen(false);
  };

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <Button type="primary" onClick={() => handleEdit()}>
        新增通知管道
      </Button>

      <DataTable<NotificationChannel>
        dataSource={data}
        columns={columns}
        rowKey={(record) => record.key ?? record.id ?? record.name}
        titleContent={<span style={{ fontWeight: 600 }}>通知管道</span>}
      />

      <Modal
        open={open}
        title={editing ? '編輯通知管道' : '新增通知管道'}
        onCancel={() => setOpen(false)}
        onOk={() => form.submit()}
        okText="儲存"
        cancelText="取消"
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item name="name" label="管道名稱" rules={[{ required: true, message: '請輸入管道名稱' }]}>
            <Input placeholder="例如：PagerDuty Checkout Team" />
          </Form.Item>
          <Form.Item name="type" label="管道類型" rules={[{ required: true }] }>
            <Select>
              <Select.Option value="email">Email</Select.Option>
              <Select.Option value="slack">Slack</Select.Option>
              <Select.Option value="pagerduty">PagerDuty</Select.Option>
              <Select.Option value="webhook">Webhook</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="enabled" label="是否啟用" valuePropName="checked">
            <Switch />
          </Form.Item>
        </Form>
      </Modal>
    </Space>
  );
};

const NotificationHistorySection = () => {
  const { message } = AntdApp.useApp();
  const { notifications, loading, error } = useNotifications();
  const [detail, setDetail] = useState<NotificationRecord | null>(null);
  const data: NotificationRecord[] = Array.isArray(notifications)
    ? notifications.map((item, index) => {
        const record = item as Partial<NotificationRecord> & { channel?: string };
        return {
          id: String(record.id ?? `notification_${index}`),
          channel_name: record.channel_name ?? record.channel ?? '未定義',
          recipient: record.recipient ?? '未知收件者',
          status: (record.status as NotificationRecord['status']) ?? 'pending',
          sent_at: record.sent_at ?? record.created_at,
          error_message: record.error_message ?? null,
        };
      })
    : [];

  if (loading) {
    return <Spin />;
  }

  if (error) {
    return <Alert type="error" message="無法載入通知歷史" description={(error as Error).message} showIcon />;
  }

  const handleRetry = (record: NotificationRecord) => {
    message.success(`已重新發送給 ${record.recipient} (模擬)`);
  };

  const columns = [
    { title: '時間', dataIndex: 'sent_at', key: 'sent_at' },
    { title: '狀態', dataIndex: 'status', key: 'status' },
    { title: '管道', dataIndex: 'channel_name', key: 'channel_name' },
    { title: '收件者', dataIndex: 'recipient', key: 'recipient' },
    {
      title: '錯誤訊息',
      dataIndex: 'error_message',
      key: 'error_message',
      render: (text?: string | null) => (text ? <span style={{ color: 'var(--brand-danger)' }}>{text}</span> : '—'),
    },
    {
      title: '操作',
      key: 'actions',
      render: (_: unknown, record: NotificationRecord) => (
        <Space size={4} wrap>
          <Button type="link" onClick={() => setDetail(record)}>
            詳情
          </Button>
          <Button
            type="link"
            disabled={record.status !== 'failed'}
            onClick={() => handleRetry(record)}
          >
            重試
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <>
      <DataTable<NotificationRecord>
        dataSource={data}
        columns={columns}
        rowKey={(record) => record.id}
        titleContent={<span style={{ fontWeight: 600 }}>通知歷史</span>}
      />

      <Modal
        open={Boolean(detail)}
        title={detail ? `通知詳情 #${detail.id}` : '通知詳情'}
        onCancel={() => setDetail(null)}
        footer={null}
      >
        {detail && (
          <Space direction="vertical" size={8} style={{ width: '100%' }}>
            <div>時間：{detail.sent_at ?? '—'}</div>
            <div>狀態：{detail.status}</div>
            <div>管道：{detail.channel_name}</div>
            <div>收件者：{detail.recipient}</div>
            <div>錯誤訊息：{detail.error_message ?? '—'}</div>
          </Space>
        )}
      </Modal>
    </>
  );
};

const NotificationManagementPage = ({ onNavigate, pageKey }: { onNavigate: (key: string) => void; pageKey: string }) => {
  const [strategies, setStrategies] = useState<NotificationStrategy[]>(buildInitialStrategies());
  const [channels, setChannels] = useState<NotificationChannel[]>(buildInitialChannels());

  const stats = {
    totalChannels: channels.length,
    activeChannels: channels.filter((channel) => channel.enabled).length,
    todayNotifications: 47,
    deliveryRate: 97.3,
    failedNotifications: 2,
    avgResponseTime: 1.2,
  };

  const tabs: TabsProps['items'] = [
    {
      key: 'notification-strategies',
      label: (
        <span>
          <SettingOutlined /> 通知策略
        </span>
      ),
      children: <NotificationStrategiesSection data={strategies} setData={setStrategies} />,
    },
    {
      key: 'notification-channels',
      label: (
        <span>
          <BellOutlined /> 通知管道
        </span>
      ),
      children: <NotificationChannelsSection data={channels} setData={setChannels} />,
    },
    {
      key: 'notification-history',
      label: (
        <span>
          <HistoryOutlined /> 通知歷史
        </span>
      ),
      children: <NotificationHistorySection />,
    },
  ];

  const activeKey = tabs.some((tab) => tab?.key === pageKey) ? pageKey : 'notification-strategies';

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <PageHeader
        title="通知管理"
        subtitle="配置通知策略和傳送管道，確保關鍵資訊即時傳達"
      />

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={8}>
          <ContextualKPICard
            title="已啟用管道"
            value={stats.activeChannels}
            unit={`/${stats.totalChannels}`}
            status="success"
            description="維持多管道可降低單點故障"
            icon={<BellOutlined />}
          />
        </Col>
        <Col xs={24} sm={12} md={8}>
          <ContextualKPICard
            title="今日通知量"
            value={stats.todayNotifications}
            unit="則"
            status="info"
            description={`${stats.failedNotifications} 則發送失敗`}
            icon={<MailOutlined />}
          />
        </Col>
        <Col xs={24} sm={12} md={8}>
          <ContextualKPICard
            title="送達率"
            value={stats.deliveryRate}
            unit="%"
            status={stats.deliveryRate >= 95 ? 'success' : 'warning'}
            description={`平均回應時間 ${stats.avgResponseTime}s`}
            icon={<CheckCircleOutlined />}
          />
        </Col>
      </Row>

      <Tabs items={tabs} activeKey={activeKey} onChange={(key) => onNavigate(key)} />
    </Space>
  );
};

export default NotificationManagementPage;
