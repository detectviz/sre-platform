import { ReactNode, useCallback, useEffect, useMemo, useState } from 'react';
import {
  App as AntdApp,
  Alert,
  Button,
  Card,
  Col,
  Descriptions,
  Divider,
  Form,
  Input,
  List,
  Row,
  Select,
  Space,
  Spin,
  Steps,
  Switch,
  Tabs,
  Tag,
  Timeline,
  Typography,
} from 'antd';
import type { StepsProps, TabsProps } from 'antd';
import {
  BellOutlined,
  CheckCircleOutlined,
  HistoryOutlined,
  MailOutlined,
  SettingOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { ContextualKPICard, DataTable, GlassModal, PageHeader } from '../components';
import useNotifications from '../hooks/useNotifications';
import useNotificationChannels from '../hooks/useNotificationChannels';
import useNotificationPolicies from '../hooks/useNotificationPolicies';
import type { NotificationChannel } from '../types/notifications';
import type { NotificationPolicy } from '../hooks/useNotificationPolicies';

dayjs.extend(relativeTime);

const { Text } = Typography;

const SEVERITY_META: Record<string, { label: string; color: string; helper: string }> = {
  critical: {
    label: '緊急 (Critical)',
    color: 'volcano',
    helper: '立即通知值班團隊並啟動重大事件處理流程',
  },
  error: {
    label: '錯誤 (Error)',
    color: 'magenta',
    helper: '於 15 分鐘內指派人員排除影響服務的錯誤',
  },
  warning: {
    label: '警告 (Warning)',
    color: 'gold',
    helper: '安排值班人員追蹤，避免狀況擴大',
  },
  info: {
    label: '資訊 (Info)',
    color: 'geekblue',
    helper: '同步狀態或提供背景資訊供參考',
  },
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

type NotificationPolicyFormValues = {
  name: string;
  description?: string;
  channels: string[];
  severity: string[];
};

const POLICY_WIZARD_FIELDS: Array<(keyof NotificationPolicyFormValues)[]> = [
  ['name', 'description'],
  ['channels', 'severity'],
  [],
];

const POLICY_WIZARD_ITEMS: StepsProps['items'] = [
  { key: 'basic', title: '基本資訊' },
  { key: 'channels', title: '通知設定' },
  { key: 'review', title: '確認與預覽' },
];

const POLICY_WIZARD_GUIDE: Array<{ title: string; description: string }> = [
  { title: '定義策略基礎資料', description: '命名策略並說明觸發情境與影響範圍。' },
  { title: '設定通知覆蓋範圍', description: '選擇要串接的通知管道與對應的監控嚴重性。' },
  { title: '確認並溝通', description: '檢視策略摘要，對齊團隊責任與升級流程。' },
];

const CHANNEL_TYPE_OPTIONS: Array<{ value: string; label: string; description: string }> = [
  { value: 'email', label: 'Email', description: '透過 SMTP 或企業郵件系統發送通知。' },
  { value: 'slack', label: 'Slack', description: '以 Slack Webhook 將告警推送到指定頻道。' },
  { value: 'pagerduty', label: 'PagerDuty', description: '觸發 PagerDuty 事件並整合值班輪值。' },
  { value: 'webhook', label: 'Webhook', description: '以 HTTP POST 呼叫自訂系統或內部整合。' },
];

const CHANNEL_FORM_GUIDE: Array<{ title: string; description: string }> = [
  { title: '確認連線與驗證', description: '確保管道使用的認證資訊具備最小權限並定期輪替。' },
  { title: '設定預設收件者', description: '預設收件者會自動帶入所有引用此管道的通知策略。' },
  { title: '規劃備援方案', description: '重大事件建議至少同時指派兩種以上的通知管道。' },
];

const NOTIFICATION_STATUS_META: Record<NotificationRecord['status'], { label: string; color: string }> = {
  pending: { label: '待處理', color: 'gold' },
  sent: { label: '已發送', color: 'processing' },
  delivered: { label: '已送達', color: 'success' },
  failed: { label: '發送失敗', color: 'error' },
};

const NotificationStrategiesSection = ({ refreshSignal }: { refreshSignal: number }) => {
  const { message } = AntdApp.useApp();
  const { policies, loading, error, isFallback, refresh } = useNotificationPolicies();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<NotificationPolicy | null>(null);
  const [wizardStep, setWizardStep] = useState(0);
  const [form] = Form.useForm<NotificationPolicyFormValues>();

  useEffect(() => {
    if (refreshSignal > 0) {
      refresh();
    }
  }, [refresh, refreshSignal]);

  const handleModalClose = useCallback(() => {
    setOpen(false);
    setEditing(null);
    form.resetFields();
    setWizardStep(0);
  }, [form]);

  const handleEdit = useCallback((record?: NotificationPolicy) => {
    setEditing(record ?? null);
    setWizardStep(0);
    form.setFieldsValue(record
      ? {
          name: record.name,
          description: record.description ?? '',
          channels: record.channels ?? [],
          severity: record.severity ?? [],
        }
      : { name: '', description: '', channels: [], severity: [] });
    setOpen(true);
  }, [form]);

  const handleTest = useCallback(
    (record: NotificationPolicy) => {
      message.success(`已發送「${record.name}」策略的測試通知 (模擬)`);
      // TODO: API call to test policy
    },
    [message],
  );

  const handleClone = useCallback(
    (record: NotificationPolicy) => {
      // TODO: API call to clone policy
      console.log("Cloning policy", record);
      message.success(`已複製策略「${record.name}」(模擬)`);
      refresh();
    },
    [message, refresh],
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
        render: (severity?: string[]) => (
          severity && severity.length > 0 ? (
            <Space size={[4, 4]} wrap>
              {severity.map((level) => {
                const meta = SEVERITY_META[level] ?? { label: level, color: 'default', helper: '' };
                return (
                  <Tag color={meta.color} key={level}>
                    {meta.label}
                  </Tag>
                );
              })}
            </Space>
          ) : (
            '未設定'
          )
        ),
      },
      {
        title: '操作',
        key: 'actions',
        render: (_: unknown, record: NotificationPolicy) => (
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

  const handleWizardNext = useCallback(async () => {
    const fields = POLICY_WIZARD_FIELDS[wizardStep] ?? [];
    if (fields.length > 0) {
      await form.validateFields(fields);
    }
    setWizardStep((prev) => Math.min(prev + 1, POLICY_WIZARD_FIELDS.length - 1));
  }, [form, wizardStep]);

  const handleWizardPrev = useCallback(() => {
    setWizardStep((prev) => Math.max(prev - 1, 0));
  }, []);

  const handleSubmit = (values: NotificationPolicyFormValues) => {
    if (editing) {
      const payload: NotificationPolicy = {
        ...editing,
        name: values.name,
        description: values.description?.trim() ? values.description.trim() : null,
        channels: values.channels ?? [],
        severity: values.severity ?? [],
        updatedAt: new Date().toISOString(),
      };
      console.log('Updating policy', payload);
      message.success('策略更新成功 (模擬)');
    } else {
      const payload: NotificationPolicy = {
        id: `policy_${Date.now()}`,
        name: values.name,
        description: values.description?.trim() ? values.description.trim() : null,
        channels: values.channels ?? [],
        severity: values.severity ?? [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      console.log('Creating policy', payload);
      message.success('策略新增成功 (模擬)');
    }
    refresh();
    handleModalClose();
  };

  if (error) {
    return <Alert type="error" message="無法載入通知策略" description={(error as Error).message} showIcon />;
  }

  return (
    <Spin spinning={loading}>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <Space>
          <Button type="primary" onClick={() => handleEdit()}>
            新增策略
          </Button>
          <Button icon={<ReloadOutlined />} onClick={refresh}>
            刷新
          </Button>
        </Space>

        {isFallback && <Alert type="warning" message="無法從後端獲取資料，目前顯示的是離線樣本資料。" showIcon />}

        <DataTable<NotificationPolicy>
          dataSource={policies}
          columns={columns}
          rowKey={(record) => record.id}
          titleContent={<span style={{ fontWeight: 600 }}>通知策略</span>}
        />

        <GlassModal
          open={open}
          title={editing ? '編輯通知策略' : '新增通知策略'}
          onCancel={handleModalClose}
          width={960}
          footer={(
            <Space style={{ width: '100%', justifyContent: 'space-between' }}>
              <Button onClick={handleModalClose}>取消</Button>
              <Space>
                {wizardStep > 0 && (
                  <Button onClick={handleWizardPrev}>上一步</Button>
                )}
                {wizardStep < POLICY_WIZARD_FIELDS.length - 1 ? (
                  <Button
                    type="primary"
                    onClick={() => handleWizardNext().catch(() => undefined)}
                  >
                    下一步
                  </Button>
                ) : (
                  <Button type="primary" onClick={() => form.submit()}>
                    儲存
                  </Button>
                )}
              </Space>
            </Space>
          )}
        >
          <Form form={form} layout="vertical" onFinish={handleSubmit}>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'minmax(0, 3fr) minmax(0, 2fr)',
                gap: 24,
              }}
            >
              <Space direction="vertical" size={24} style={{ width: '100%' }}>
                <Steps current={wizardStep} items={POLICY_WIZARD_ITEMS} responsive={false} />

                <div style={{ display: wizardStep === 0 ? 'flex' : 'none', flexDirection: 'column', gap: 16 }}>
                  <Form.Item
                    name="name"
                    label="策略名稱"
                    rules={[{ required: true, message: '請輸入策略名稱' }]}
                  >
                    <Input placeholder="例如：Checkout Critical Pager" />
                  </Form.Item>
                  <Form.Item name="description" label="描述">
                    <Input.TextArea rows={3} placeholder="策略用途與適用範圍" />
                  </Form.Item>
                  <Alert
                    type="info"
                    showIcon
                    message="命名建議"
                    description="建議依據系統模組 + 嚴重性命名，例如「Checkout · Critical」以利後續稽核與搜尋。"
                  />
                </div>

                <div style={{ display: wizardStep === 1 ? 'flex' : 'none', flexDirection: 'column', gap: 16 }}>
                  <Form.Item
                    name="channels"
                    label="通知管道"
                    rules={[{ required: true, message: '請至少選擇一個管道' }]}
                    extra="輸入或選擇管道識別，例如：pagerduty_checkout"
                  >
                    <Select mode="tags" placeholder="輸入或選擇管道識別" />
                  </Form.Item>
                  <Form.Item name="severity" label="監控嚴重性">
                    <Select mode="multiple" placeholder="選擇適用的嚴重性" optionLabelProp="label">
                      {Object.entries(SEVERITY_META).map(([value, meta]) => (
                        <Select.Option value={value} key={value} label={meta.label}>
                          <Space direction="vertical" size={0} style={{ width: '100%' }}>
                            <Space size={8}>
                              <Tag color={meta.color}>{meta.label}</Tag>
                            </Space>
                            <Text type="secondary" style={{ fontSize: 12 }}>
                              {meta.helper}
                            </Text>
                          </Space>
                        </Select.Option>
                      ))}
                    </Select>
                  </Form.Item>
                  <Alert
                    type="info"
                    showIcon
                    message="最佳實務建議"
                    description="針對不同嚴重性設定通知節奏與升級節點，確保重大事件優先處理。"
                  />
                </div>

                <div style={{ display: wizardStep === 2 ? 'flex' : 'none', flexDirection: 'column', gap: 16 }}>
                  <Card size="small" title="提交前檢查清單">
                    <List
                      size="small"
                      split={false}
                      dataSource={[
                        '確認右側策略摘要是否符合預期的管道與嚴重性設定。',
                        '與負責團隊確認升級與通知節奏是否同步更新。',
                        '必要時先於管道列表中發送測試通知，確保連線正常。',
                      ]}
                      renderItem={(item) => (
                        <List.Item style={{ paddingInline: 0 }}>
                          <Text>{item}</Text>
                        </List.Item>
                      )}
                    />
                  </Card>
                  <Alert
                    type="success"
                    showIcon
                    message="儲存後可於策略詳情頁查看通知樣本與投遞統計。"
                  />
                </div>
              </Space>

              <Space direction="vertical" size={16} style={{ width: '100%' }}>
                <Card size="small" title="策略摘要">
                  <Form.Item shouldUpdate noStyle>
                    {() => {
                      const preview = form.getFieldsValue();
                      const channels = Array.isArray(preview.channels)
                        ? (preview.channels as string[]).filter((item) => item && item.trim())
                        : [];
                      const severity = Array.isArray(preview.severity)
                        ? (preview.severity as string[]).filter((item) => item && item.trim())
                        : [];
                      return (
                        <Space direction="vertical" size={16} style={{ width: '100%' }}>
                          <Descriptions column={1} size="small" colon>
                            <Descriptions.Item label="策略名稱">
                              {preview.name?.trim() || '尚未填寫'}
                            </Descriptions.Item>
                            <Descriptions.Item label="描述">
                              {preview.description?.trim() || '—'}
                            </Descriptions.Item>
                          </Descriptions>
                          <Divider style={{ margin: '8px 0' }} />
                          <Space direction="vertical" size={8} style={{ width: '100%' }}>
                            <Text strong>通知管道</Text>
                            {channels.length ? (
                              <Space size={[8, 8]} wrap>
                                {channels.map((channel) => (
                                  <Tag color="blue" key={channel}>
                                    {channel}
                                  </Tag>
                                ))}
                              </Space>
                            ) : (
                              <Text type="secondary">尚未選擇通知管道</Text>
                            )}
                          </Space>
                          <Space direction="vertical" size={8} style={{ width: '100%' }}>
                            <Text strong>監控嚴重性</Text>
                            {severity.length ? (
                              <Space size={[8, 8]} wrap>
                                {severity.map((item) => {
                                  const meta = SEVERITY_META[item] ?? { label: item, color: 'default', helper: '' };
                                  return (
                                    <Tag color={meta.color} key={item}>
                                      {meta.label}
                                    </Tag>
                                  );
                                })}
                              </Space>
                            ) : (
                              <Text type="secondary">未指定嚴重性，將沿用預設策略</Text>
                            )}
                          </Space>
                          {severity.length > 0 && (
                            <Text type="secondary" style={{ fontSize: 12 }}>
                              {severity
                                .map((item) => SEVERITY_META[item]?.helper)
                                .filter(Boolean)
                                .join('；')}
                            </Text>
                          )}
                        </Space>
                      );
                    }}
                  </Form.Item>
                </Card>

                <Card size="small" title="建立流程">
                  <Timeline
                    style={{ marginTop: 8 }}
                    items={POLICY_WIZARD_GUIDE.map((item, index) => ({
                      color: wizardStep > index ? 'green' : wizardStep === index ? 'blue' : 'gray',
                      children: (
                        <Space direction="vertical" size={2} style={{ width: '100%' }}>
                          <Text strong>{item.title}</Text>
                          <Text type="secondary" style={{ fontSize: 12 }}>
                            {item.description}
                          </Text>
                        </Space>
                      ),
                    }))}
                  />
                </Card>

                <Card size="small" title="最佳實務">
                  <List
                    size="small"
                    split={false}
                    dataSource={[
                      '將 Critical 告警綁定多個管道以避免單點故障。',
                      '在描述中標註資料來源、事件類型與預期回應時間。',
                      '定期檢視通知歷史，依成功率調整升級節奏。',
                    ]}
                    renderItem={(item) => (
                      <List.Item style={{ paddingInline: 0 }}>
                        <Text type="secondary">{item}</Text>
                      </List.Item>
                    )}
                  />
                </Card>
              </Space>
            </div>
          </Form>
        </GlassModal>
      </Space>
    </Spin>
  );
};

const NotificationChannelsSection = ({ refreshSignal }: { refreshSignal: number }) => {
  const { message } = AntdApp.useApp();
  const { channels, loading, error, isFallback, refresh } = useNotificationChannels();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<NotificationChannel | null>(null);
  const [form] = Form.useForm<NotificationChannel>();
  const channelType = Form.useWatch('type', form);
  const selectedChannelType = useMemo(
    () => CHANNEL_TYPE_OPTIONS.find((option) => option.value === channelType) ?? CHANNEL_TYPE_OPTIONS[0],
    [channelType],
  );

  useEffect(() => {
    if (refreshSignal > 0) {
      refresh();
    }
  }, [refresh, refreshSignal]);

  const handleModalClose = useCallback(() => {
    setOpen(false);
    setEditing(null);
    form.resetFields();
  }, [form]);

  const handleEdit = useCallback((record?: NotificationChannel) => {
    setEditing(record ?? null);
    form.setFieldsValue(
      record
        ? {
            name: record.name ?? '',
            type: record.type ?? 'email',
            description: record.description ?? '',
            endpoint: record.endpoint ?? '',
            defaultRecipients: record.defaultRecipients ?? [],
            enabled: record.enabled !== false,
          }
        : {
            name: '',
            type: 'email',
            description: '',
            endpoint: '',
            defaultRecipients: [],
            enabled: true,
          },
    );
    setOpen(true);
  }, [form]);

  const handleToggle = useCallback(
    async (record: NotificationChannel) => {
      // TODO: Replace with API call
      console.log('Toggling channel', record);
      message.info(`通知管道「${record.name}」狀態已更新 (模擬)`);
      refresh();
    },
    [message, refresh],
  );

  const handleTest = useCallback(
    (record: NotificationChannel) => {
      // TODO: Replace with API call
      console.log('Testing channel', record);
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

  const handleSubmit = (values: NotificationChannel & { defaultRecipients?: string[] }) => {
    const trimmedName = values.name?.trim();
    const sanitizedRecipients = Array.isArray(values.defaultRecipients)
      ? Array.from(
          new Set(
            values.defaultRecipients
              .map((recipient) => recipient.trim())
              .filter((recipient) => recipient.length > 0),
          ),
        )
      : [];
    if (!trimmedName) {
      message.error('請輸入管道名稱');
      return;
    }
    const payload: NotificationChannel = {
      ...(editing ?? {}),
      id: editing?.id ?? `channel_${Date.now()}`,
      name: trimmedName,
      type: values.type ?? 'email',
      enabled: values.enabled !== false,
      description: values.description?.trim() ? values.description.trim() : null,
      endpoint: values.endpoint?.trim() ? values.endpoint.trim() : null,
      defaultRecipients: sanitizedRecipients,
    } as NotificationChannel;
    if (editing) {
      // TODO: API call to update channel
      console.log('Updating channel', payload);
      message.success('通知管道更新成功 (模擬)');
    } else {
      // TODO: API call to create channel
      console.log('Creating channel', payload);
      message.success('通知管道新增成功 (模擬)');
    }
    refresh();
    handleModalClose();
  };

  if (error) {
    return <Alert type="error" message="無法載入通知管道" description={(error as Error).message} showIcon />;
  }

  return (
    <Spin spinning={loading}>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <Space>
          <Button type="primary" onClick={() => handleEdit()}>
            新增通知管道
          </Button>
          <Button icon={<ReloadOutlined />} onClick={refresh}>
            刷新
          </Button>
        </Space>

        {isFallback && <Alert type="warning" message="無法從後端獲取資料，目前顯示的是離線樣本資料。" showIcon />}

        <DataTable<NotificationChannel>
          dataSource={channels}
          columns={columns}
          rowKey={(record) => record.id ?? record.name}
          titleContent={<span style={{ fontWeight: 600 }}>通知管道</span>}
        />

        <GlassModal
          open={open}
          title={editing ? '編輯通知管道' : '新增通知管道'}
          onCancel={handleModalClose}
          width={880}
          footer={(
            <Space style={{ width: '100%', justifyContent: 'space-between' }}>
              {editing ? (
                <Button onClick={() => editing && handleTest(editing)}>
                  發送測試通知
                </Button>
              ) : (
                <span />
              )}
              <Space>
                <Button onClick={handleModalClose}>取消</Button>
                <Button type="primary" onClick={() => form.submit()}>
                  儲存
                </Button>
              </Space>
            </Space>
          )}
        >
          <Form form={form} layout="vertical" onFinish={handleSubmit}>
            <div
              style={{
                display: 'grid',
                gap: 24,
                gridTemplateColumns: 'minmax(0, 3fr) minmax(0, 2fr)',
              }}
            >
              <Space direction="vertical" size={16} style={{ width: '100%' }}>
                <Form.Item
                  name="name"
                  label="管道名稱"
                  rules={[{ required: true, message: '請輸入管道名稱' }]}
                >
                  <Input placeholder="例如：PagerDuty Checkout Team" />
                </Form.Item>
                <Form.Item name="type" label="管道類型" rules={[{ required: true, message: '請選擇管道類型' }]}>
                  <Select placeholder="選擇要整合的通知服務">
                    {CHANNEL_TYPE_OPTIONS.map((option) => (
                      <Select.Option value={option.value} key={option.value}>
                        <Space direction="vertical" size={0} style={{ width: '100%' }}>
                          <Text strong>{option.label}</Text>
                          <Text type="secondary" style={{ fontSize: 12 }}>
                            {option.description}
                          </Text>
                        </Space>
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>
                <Form.Item
                  name="endpoint"
                  label={channelType === 'webhook' ? 'Webhook URL' : '連線端點'}
                  extra={channelType === 'webhook' ? '請輸入完整的 HTTPS URL。' : '若為 Email 類型，可填寫 SMTP 或郵件清單地址。'}
                >
                  <Input placeholder={channelType === 'webhook' ? 'https://hooks.slack.com/services/...' : '輸入 API 或郵件端點'} />
                </Form.Item>
                <Form.Item
                  name="defaultRecipients"
                  label="預設收件者"
                  extra="使用 Enter 或逗號新增多個收件者識別，建立後將自動帶入通知策略。"
                >
                  <Select mode="tags" placeholder="輸入 Email 或值班群組識別" tokenSeparators={[',']} />
                </Form.Item>
                <Form.Item name="description" label="描述">
                  <Input.TextArea rows={3} placeholder="補充管道用途、覆蓋的服務或聯絡窗口" />
                </Form.Item>
                <Form.Item name="enabled" label="啟用狀態" valuePropName="checked">
                  <Switch checkedChildren="啟用" unCheckedChildren="停用" />
                </Form.Item>
                <Alert
                  type="info"
                  showIcon
                  message="權限提醒"
                  description="建議使用專用的 API Token 並定期輪替，以確保通知管道的安全性。"
                />
              </Space>

              <Space direction="vertical" size={16} style={{ width: '100%' }}>
                <Card size="small" title="管道摘要">
                  <Form.Item shouldUpdate noStyle>
                    {() => {
                      const values = form.getFieldsValue();
                      const recipients = Array.isArray(values.defaultRecipients)
                        ? (values.defaultRecipients as string[]).filter((recipient) => recipient && recipient.trim())
                        : [];
                      const typeMeta = CHANNEL_TYPE_OPTIONS.find((option) => option.value === values.type);
                      return (
                        <Space direction="vertical" size={16} style={{ width: '100%' }}>
                          <Descriptions column={1} size="small" colon>
                            <Descriptions.Item label="管道名稱">
                              {values.name?.trim() || '尚未填寫'}
                            </Descriptions.Item>
                            <Descriptions.Item label="管道類型">
                              <Space size={8}>
                                <Tag color="geekblue">{typeMeta?.label ?? '未選擇'}</Tag>
                                <Text type="secondary" style={{ fontSize: 12 }}>
                                  {typeMeta?.description ?? '選擇類型後可查看整合說明。'}
                                </Text>
                              </Space>
                            </Descriptions.Item>
                            <Descriptions.Item label="連線端點">
                              {values.endpoint?.trim() || '—'}
                            </Descriptions.Item>
                            <Descriptions.Item label="預設收件者">
                              {recipients.length ? (
                                <Space size={[8, 8]} wrap>
                                  {recipients.map((recipient) => (
                                    <Tag key={recipient} color="blue">
                                      {recipient}
                                    </Tag>
                                  ))}
                                </Space>
                              ) : (
                                <Text type="secondary">尚未設定預設收件者</Text>
                              )}
                            </Descriptions.Item>
                            <Descriptions.Item label="啟用狀態">
                              <Tag color={values.enabled !== false ? 'green' : 'default'}>
                                {values.enabled !== false ? '啟用' : '停用'}
                              </Tag>
                            </Descriptions.Item>
                          </Descriptions>
                        </Space>
                      );
                    }}
                  </Form.Item>
                </Card>

                <Card size="small" title="類型說明">
                  <Space direction="vertical" size={8} style={{ width: '100%' }}>
                    <Text>{selectedChannelType.description}</Text>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      建議於建立後立即於列表中使用「測試」驗證與第三方整合是否成功。
                    </Text>
                  </Space>
                </Card>

                <Card size="small" title="維運建議">
                  <List
                    size="small"
                    split={false}
                    dataSource={CHANNEL_FORM_GUIDE}
                    renderItem={(item) => (
                      <List.Item style={{ paddingInline: 0 }}>
                        <Space direction="vertical" size={2} style={{ width: '100%' }}>
                          <Text strong>{item.title}</Text>
                          <Text type="secondary" style={{ fontSize: 12 }}>{item.description}</Text>
                        </Space>
                      </List.Item>
                    )}
                  />
                </Card>
              </Space>
            </div>
          </Form>
        </GlassModal>
      </Space>
    </Spin>
  );
};

const NotificationHistorySection = ({ refreshSignal }: { refreshSignal: number }) => {
  const { message } = AntdApp.useApp();
  const { notifications, loading, error, refresh } = useNotifications();
  const [detail, setDetail] = useState<NotificationRecord | null>(null);

  useEffect(() => {
    if (refreshSignal > 0) {
      refresh();
    }
  }, [refresh, refreshSignal]);

  const data: NotificationRecord[] = Array.isArray(notifications)
    ? notifications.map((item, index) => {
      const record = item as Partial<NotificationRecord> & { channel?: string };
      return {
        id: String(record.id ?? `notification_${index}`),
        channel_name: record.channel_name ?? record.channel ?? '未定義',
        recipient: record.recipient ?? '未知收件者',
        status: (record.status as NotificationRecord['status']) ?? 'pending',
        sent_at: record.sent_at ?? record.created_at,
        created_at: record.created_at,
        error_message: record.error_message ?? null,
      };
    })
    : [];

  const handleRetry = (record: NotificationRecord) => {
    // TODO: API call to retry notification
    message.success(`已重新發送給 ${record.recipient} (模擬)`);
  };

  const detailTimelineItems = useMemo(() => {
    if (!detail) {
      return [];
    }
    const items: Array<{ color: string; children: ReactNode }> = [];
    const formatTimestamp = (input?: string) => (input ? dayjs(input).format('YYYY-MM-DD HH:mm:ss') : '—');
    if (detail.created_at) {
      items.push({
        color: 'gray',
        children: (
          <Space direction="vertical" size={2} style={{ width: '100%' }}>
            <Text strong>建立請求</Text>
            <Text type="secondary" style={{ fontSize: 12 }}>
              {formatTimestamp(detail.created_at)}
            </Text>
          </Space>
        ),
      });
    }
    if (detail.sent_at) {
      const statusMeta = NOTIFICATION_STATUS_META[detail.status] ?? NOTIFICATION_STATUS_META.pending;
      const color = detail.status === 'failed' ? 'red' : detail.status === 'delivered' ? 'green' : 'blue';
      items.push({
        color,
        children: (
          <Space direction="vertical" size={2} style={{ width: '100%' }}>
            <Text strong>發送嘗試</Text>
            <Text type="secondary" style={{ fontSize: 12 }}>
              {formatTimestamp(detail.sent_at)}
            </Text>
            <Text type="secondary" style={{ fontSize: 12 }}>{statusMeta.label}</Text>
          </Space>
        ),
      });
    }
    if (detail.status === 'failed' && detail.error_message) {
      items.push({
        color: 'red',
        children: (
          <Space direction="vertical" size={2} style={{ width: '100%' }}>
            <Text strong>失敗原因</Text>
            <Text type="secondary" style={{ fontSize: 12 }}>{detail.error_message}</Text>
          </Space>
        ),
      });
    }
    if (detail.status === 'delivered') {
      items.push({
        color: 'green',
        children: (
          <Space direction="vertical" size={2} style={{ width: '100%' }}>
            <Text strong>送達完成</Text>
            <Text type="secondary" style={{ fontSize: 12 }}>
              已由接收端確認收到通知。
            </Text>
          </Space>
        ),
      });
    }
    return items;
  }, [detail]);

  const columns = [
    {
      title: '時間',
      dataIndex: 'sent_at',
      key: 'sent_at',
      render: (ts?: string) => (ts ? dayjs(ts).fromNow() : '—'),
    },
    {
      title: '狀態',
      dataIndex: 'status',
      key: 'status',
      render: (status: NotificationRecord['status']) => {
        const meta = NOTIFICATION_STATUS_META[status] ?? NOTIFICATION_STATUS_META.pending;
        return <Tag color={meta.color}>{meta.label}</Tag>;
      },
    },
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

  if (loading) {
    return <Spin />;
  }

  if (error) {
    return <Alert type="error" message="無法載入通知歷史" description={(error as Error).message} showIcon />;
  }

  return (
    <>
      <DataTable<NotificationRecord>
        dataSource={data}
        columns={columns}
        rowKey={(record) => record.id}
        titleContent={<span style={{ fontWeight: 600 }}>通知歷史</span>}
      />

      <GlassModal
        open={Boolean(detail)}
        title={detail ? `通知詳情 #${detail.id}` : '通知詳情'}
        onCancel={() => setDetail(null)}
        width={760}
        footer={(
          <Space style={{ width: '100%', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text type="secondary">
              {detail?.sent_at
                ? `最後更新：${dayjs(detail.sent_at).format('YYYY-MM-DD HH:mm:ss')}`
                : '來源：通知歷史樣本資料'}
            </Text>
            <Space>
              {detail?.status === 'failed' && (
                <Button type="primary" danger onClick={() => detail && handleRetry(detail)}>
                  重新發送
                </Button>
              )}
              <Button onClick={() => setDetail(null)}>關閉</Button>
            </Space>
          </Space>
        )}
      >
        {detail ? (
          <Space direction="vertical" size={16} style={{ width: '100%' }}>
            <Descriptions column={1} size="small" colon>
              <Descriptions.Item label="發送時間">
                {detail.sent_at ? dayjs(detail.sent_at).format('YYYY-MM-DD HH:mm:ss') : '—'}
              </Descriptions.Item>
              <Descriptions.Item label="狀態">
                {(() => {
                  const meta = NOTIFICATION_STATUS_META[detail.status] ?? NOTIFICATION_STATUS_META.pending;
                  return <Tag color={meta.color}>{meta.label}</Tag>;
                })()}
              </Descriptions.Item>
              <Descriptions.Item label="通知管道">{detail.channel_name}</Descriptions.Item>
              <Descriptions.Item label="收件者">{detail.recipient}</Descriptions.Item>
              <Descriptions.Item label="建立時間">
                {detail.created_at ? dayjs(detail.created_at).format('YYYY-MM-DD HH:mm:ss') : '—'}
              </Descriptions.Item>
            </Descriptions>
            {detail.error_message && (
              <Alert type="error" showIcon message="錯誤訊息" description={detail.error_message} />
            )}
            <Card size="small" title="投遞節點">
              {detailTimelineItems.length > 0 ? (
                <Timeline style={{ marginTop: 8 }} items={detailTimelineItems} />
              ) : (
                <Text type="secondary">暫無可顯示的節點資訊。</Text>
              )}
            </Card>
            <Card size="small" title="原始資料 (模擬)">
              <pre
                style={{
                  background: 'rgba(255, 255, 255, 0.06)',
                  padding: 12,
                  borderRadius: 8,
                  margin: 0,
                  maxHeight: 240,
                  overflow: 'auto',
                }}
              >
                {JSON.stringify(detail, null, 2)}
              </pre>
            </Card>
          </Space>
        ) : (
          <Space direction="vertical" size={8} style={{ width: '100%' }}>
            <Text type="secondary">未選擇任何通知記錄。</Text>
          </Space>
        )}
      </GlassModal>
    </>
  );
};

const NotificationManagementPage = ({ onNavigate, pageKey }: { onNavigate: (key: string) => void; pageKey: string }) => {
  const [refreshSignal, setRefreshSignal] = useState(0);

  useEffect(() => {
    document.title = '通知管理 - SRE 平台';
  }, []);

  const handleRefreshAll = useCallback(() => {
    setRefreshSignal((prev) => prev + 1);
  }, []);

  const stats = {
    totalChannels: 10, // from useNotificationChannels
    activeChannels: 8, // from useNotificationChannels
    todayNotifications: 47, // from useNotifications
    deliveryRate: 97.3, // from useNotifications
    failedNotifications: 2, // from useNotifications
    avgResponseTime: 1.2, // from useNotificationChannels
  };

  const tabs: TabsProps['items'] = useMemo(() => [
    {
      key: 'notification-strategies',
      label: (
        <span>
          <SettingOutlined /> 通知策略
        </span>
      ),
      children: <NotificationStrategiesSection refreshSignal={refreshSignal} />,
    },
    {
      key: 'notification-channels',
      label: (
        <span>
          <BellOutlined /> 通知管道
        </span>
      ),
      children: <NotificationChannelsSection refreshSignal={refreshSignal} />,
    },
    {
      key: 'notification-history',
      label: (
        <span>
          <HistoryOutlined /> 通知歷史
        </span>
      ),
      children: <NotificationHistorySection refreshSignal={refreshSignal} />,
    },
  ], [refreshSignal]);

  const activeKey = tabs.some((tab) => tab?.key === pageKey) ? pageKey : 'notification-strategies';

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <PageHeader
        title="通知管理"
        subtitle="配置通知策略和傳送管道，確保關鍵資訊即時傳達"
        extra={(
          <Button icon={<ReloadOutlined />} onClick={handleRefreshAll}>
            全部重新整理
          </Button>
        )}
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
