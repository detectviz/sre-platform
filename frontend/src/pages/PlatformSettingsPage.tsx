import { useCallback, useMemo, useState } from 'react';
import {
  LockOutlined,
  MailOutlined,
  SettingOutlined,
  TagsOutlined,
  ReloadOutlined,
  SendOutlined,
  SaveOutlined,
} from '@ant-design/icons';
import {
  Alert,
  App as AntdApp,
  Button,
  Col,
  Form,
  Input,
  InputNumber,
  Modal,
  Row,
  Select,
  Space,
  Spin,
  Tabs,
  Tag as AntdTag,
  Typography,
} from 'antd';
import type { TabsProps } from 'antd';
import { ContextualKPICard, DataTable, PageHeader } from '../components';
import useTags from '../hooks/useTags';
import type { Tag } from '../hooks/useTags';

const { Paragraph } = Typography;

export type PlatformSettingsPageProps = {
  onNavigate: (key: string) => void;
  pageKey: string;
};

const stats = {
  totalTags: 42, // Will be replaced by data from useTags
  activeTags: 38, // Will be replaced by data from useTags
  authSessions: 156,
  configChanges: 7,
  lastBackup: '2 小時前',
};

const TagManagementTab = () => {
  const { message } = AntdApp.useApp();
  const { tags, loading, error, refresh } = useTags();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Tag | null>(null);
  const [form] = Form.useForm<Tag>();

  const handleEdit = useCallback((record?: Tag) => {
    setEditing(record ?? null);
    form.setFieldsValue(record ?? { key_name: '', description: '', enforcement_level: 'advisory' });
    setOpen(true);
  }, [form]);

  const handleDelete = useCallback((record: Tag) => {
    Modal.confirm({
        title: `確定要刪除標籤規則 "${record.key_name}"?`,
        content: '此操作無法復原。',
        okText: '確定刪除',
        okType: 'danger',
        cancelText: '取消',
        onOk: () => {
            // TODO: API call to delete tag
            console.log('Deleting tag', record);
            message.success(`標籤規則 "${record.key_name}" 已刪除 (模擬)`);
            refresh();
        }
    });
  }, [message, refresh]);

  const columns = useMemo(() => [
    { title: '標籤鍵', dataIndex: 'key_name', key: 'key_name' },
    { title: '描述', dataIndex: 'description', key: 'description' },
    { title: '使用計數', dataIndex: 'usage_count', key: 'usage_count', align: 'right' },
    {
        title: '強制等級',
        dataIndex: 'enforcement_level',
        key: 'enforcement_level',
        render: (level: string) => {
            const color = {
                blocking: 'red',
                warning: 'orange',
                advisory: 'blue',
            }[level];
            return <AntdTag color={color}>{level}</AntdTag>;
        }
    },
    {
      title: '操作',
      key: 'actions',
      render: (_: unknown, record: Tag) => (
        <Space size={4} wrap>
          <Button type="link" onClick={() => handleEdit(record)}>
            編輯
          </Button>
          <Button type="link" danger onClick={() => handleDelete(record)}>
            刪除
          </Button>
        </Space>
      ),
    },
  ], [handleEdit, handleDelete]);

  const handleSubmit = (values: Tag) => {
    if (editing) {
      // TODO: API call to update tag
      console.log('Updating tag', { ...editing, ...values });
      message.success('標籤規則更新成功 (模擬)');
    } else {
      // TODO: API call to create tag
      console.log('Creating tag', values);
      message.success('標籤規則新增成功 (模擬)');
    }
    refresh();
    setOpen(false);
  };

  if (error) {
    return <Alert type="error" message="無法載入標籤規則" description={(error as Error).message} showIcon />;
  }

  return (
    <Spin spinning={loading}>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <Space>
            <Button type="primary" onClick={() => handleEdit()}>
              新增標籤規則
            </Button>
            <Button icon={<ReloadOutlined />} onClick={refresh}>
                刷新
            </Button>
        </Space>

        <DataTable<Tag>
          dataSource={tags}
          columns={columns}
          rowKey={(record) => record.id}
          titleContent={<span style={{ fontWeight: 600 }}>標籤治理規則</span>}
        />

        <Modal
            open={open}
            title={editing ? '編輯標籤規則' : '新增標籤規則'}
            onCancel={() => setOpen(false)}
            onOk={() => form.submit()}
            okText="儲存"
            cancelText="取消"
        >
            <Form form={form} layout="vertical" onFinish={handleSubmit}>
                <Form.Item name="key_name" label="標籤鍵" rules={[{ required: true, message: '請輸入標籤鍵' }]}>
                    <Input placeholder="例如: env, service, owner_team" />
                </Form.Item>
                <Form.Item name="description" label="描述">
                    <Input.TextArea rows={3} placeholder="說明此標籤的用途與格式" />
                </Form.Item>
                <Form.Item name="enforcement_level" label="強制等級" rules={[{ required: true }]}>
                    <Select>
                        <Select.Option value="advisory">Advisory (建議)</Select.Option>
                        <Select.Option value="warning">Warning (警告)</Select.Option>
                        <Select.Option value="blocking">Blocking (阻擋)</Select.Option>
                    </Select>
                </Form.Item>
                <Form.Item name="validation_regex" label="驗證規則 (Regex)">
                    <Input placeholder="例如: ^[a-z0-9-]+$" />
                </Form.Item>
            </Form>
        </Modal>
      </Space>
    </Spin>
  );
};

const EmailSettingsTab = () => {
    const { message } = AntdApp.useApp();
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);

    const handleSave = (values: any) => {
        setLoading(true);
        // TODO: API call to save SMTP settings
        console.log('Saving SMTP settings:', values);
        setTimeout(() => {
            setLoading(false);
            message.success('郵件設定已儲存 (模擬)');
        }, 1000);
    };

    const handleTest = () => {
        form.validateFields().then(values => {
            Modal.info({
                title: '傳送測試郵件',
                content: (
                    <Form layout="vertical">
                        <Form.Item label="收件人" name="recipient" initialValue="test@example.com">
                            <Input placeholder="輸入測試收件人信箱" />
                        </Form.Item>
                    </Form>
                ),
                onOk: () => {
                    // TODO: API call to send test email
                    console.log('Sending test email with settings:', values);
                    message.success('測試郵件已發送 (模擬)');
                },
                okText: '傳送'
            });
        });
    };

    return (
        <Spin spinning={loading}>
            <Form
                form={form}
                layout="vertical"
                onFinish={handleSave}
                style={{ maxWidth: 600 }}
                initialValues={{ port: 587, encryption: 'tls' }}
            >
                <Form.Item
                    name="host"
                    label="SMTP 伺服器"
                    rules={[{ required: true, message: '請輸入 SMTP 伺服器地址' }]}
                >
                    <Input placeholder="例如: smtp.your-provider.com" />
                </Form.Item>
                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item
                            name="port"
                            label="SMTP 連接埠"
                            rules={[{ required: true, message: '請輸入 SMTP 連接埠' }]}
                        >
                            <InputNumber style={{ width: '100%' }} />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item name="encryption" label="加密方式">
                            <Select>
                                <Select.Option value="none">無</Select.Option>
                                <Select.Option value="ssl">SSL/TLS</Select.Option>
                                <Select.Option value="tls">STARTTLS</Select.Option>
                            </Select>
                        </Form.Item>
                    </Col>
                </Row>
                <Form.Item name="username" label="使用者名稱">
                    <Input placeholder="SMTP 登入使用者名稱" />
                </Form.Item>
                <Form.Item name="password" label="密碼">
                    <Input.Password placeholder="SMTP 登入密碼" />
                </Form.Item>
                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item
                            name="from_address"
                            label="寄件人信箱"
                            rules={[{ required: true, type: 'email', message: '請輸入有效的信箱地址' }]}
                        >
                            <Input placeholder="例如: no-reply@sre-platform.com" />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item name="from_name" label="寄件人名稱">
                            <Input placeholder="例如: SRE Platform" />
                        </Form.Item>
                    </Col>
                </Row>
                <Form.Item>
                    <Space>
                        <Button type="primary" htmlType="submit" icon={<SaveOutlined />}>
                            儲存設定
                        </Button>
                        <Button onClick={handleTest} icon={<SendOutlined />}>
                            傳送測試郵件
                        </Button>
                    </Space>
                </Form.Item>
            </Form>
        </Spin>
    );
};

const AuthSettingsTab = () => {
    const { message } = AntdApp.useApp();
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);

    const handleSave = (values: any) => {
        setLoading(true);
        // TODO: API call to save OIDC settings
        console.log('Saving OIDC settings:', values);
        setTimeout(() => {
            setLoading(false);
            message.success('身份驗證設定已儲存 (模擬)');
        }, 1000);
    };

    return (
        <Spin spinning={loading}>
            <Form
                form={form}
                layout="vertical"
                onFinish={handleSave}
                style={{ maxWidth: 600 }}
                initialValues={{ provider_type: 'keycloak' }}
            >
                <Alert
                    type="info"
                    showIcon
                    message="身份驗證設定"
                    description="此處設定將用於整合 OIDC 單一登入 (SSO)。建議在生產環境中使用環境變數覆寫這些設定以策安全。"
                    style={{ marginBottom: 24 }}
                />
                <Form.Item name="provider_type" label="供應商類型" rules={[{ required: true }]}>
                    <Select>
                        <Select.Option value="keycloak">Keycloak</Select.Option>
                        <Select.Option value="auth0">Auth0</Select.Option>
                        <Select.Option value="okta">Okta</Select.Option>
                        <Select.Option value="generic">通用 OIDC</Select.Option>
                    </Select>
                </Form.Item>
                <Form.Item name="provider_name" label="顯示名稱" rules={[{ required: true, message: '請輸入顯示名稱' }]}>
                    <Input placeholder="例如: 公司 SSO" />
                </Form.Item>
                <Form.Item name="client_id" label="客戶端 ID (Client ID)" rules={[{ required: true, message: '請輸入 Client ID' }]}>
                    <Input placeholder="從您的 OIDC 供應商獲取" />
                </Form.Item>
                <Form.Item name="client_secret" label="客戶端密鑰 (Client Secret)" rules={[{ required: true, message: '請輸入 Client Secret' }]}>
                    <Input.Password placeholder="從您的 OIDC 供應商獲取" />
                </Form.Item>
                <Form.Item name="issuer_url" label="發行者 URL (Issuer URL)" rules={[{ required: true, type: 'url' }]}>
                    <Input placeholder="例如: https://keycloak.example.com/realms/my-realm" />
                </Form.Item>
                <Paragraph type="secondary">
                    當使用通用 OIDC 供應商時，您可能需要手動填寫以下端點。對於 Keycloak 等常見供應商，系統會自動探索。
                </Paragraph>
                <Form.Item name="authorization_url" label="授權端點 URL (Authorization URL)">
                    <Input placeholder="OIDC 授權端點" />
                </Form.Item>
                <Form.Item name="token_url" label="權杖端點 URL (Token URL)">
                    <Input placeholder="OIDC 權杖端點" />
                </Form.Item>
                <Form.Item name="userinfo_url" label="使用者資訊端點 URL (User Info URL)">
                    <Input placeholder="OIDC 使用者資訊端點" />
                </Form.Item>

                <Form.Item>
                    <Button type="primary" htmlType="submit" icon={<SaveOutlined />}>
                        儲存設定
                    </Button>
                </Form.Item>
            </Form>
        </Spin>
    );
};


const PlatformSettingsPage = ({ onNavigate, pageKey }: PlatformSettingsPageProps) => {
  const items: TabsProps['items'] = useMemo(() => [
    {
      key: 'tag-management',
      label: (
        <span>
          <TagsOutlined /> 標籤管理
        </span>
      ),
      children: <TagManagementTab />,
    },
    {
      key: 'email-settings',
      label: (
        <span>
          <MailOutlined /> 郵件設定
        </span>
      ),
      children: <EmailSettingsTab />,
    },
    {
      key: 'auth-settings',
      label: (
        <span>
          <LockOutlined /> 身份驗證
        </span>
      ),
      children: <AuthSettingsTab />,
    },
  ], []);

  const activeKey = items.some((item) => item?.key === pageKey) ? pageKey : 'tag-management';

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <PageHeader
        title="平台設定"
        subtitle="管理平台核心參數、通知與身份驗證整合"
      />

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={6}>
          <ContextualKPICard
            title="標籤總數"
            value={stats.totalTags}
            unit="個"
            status="info"
            description={`${stats.activeTags} 個啟用中`}
            icon={<TagsOutlined />}
          />
        </Col>
        <Col xs={24} sm={12} md={6}>
          <ContextualKPICard
            title="活躍會話"
            value={stats.authSessions}
            unit="個"
            status="success"
            description="目前登入的使用者會話"
            icon={<LockOutlined />}
          />
        </Col>
        <Col xs={24} sm={12} md={6}>
          <ContextualKPICard
            title="配置異動"
            value={stats.configChanges}
            unit="次"
            status="warning"
            description={`最後備份：${stats.lastBackup}`}
            icon={<SettingOutlined />}
          />
        </Col>
      </Row>

      <Tabs items={items} activeKey={activeKey} onChange={(key) => onNavigate(key)} />
    </Space>
  );
};

export default PlatformSettingsPage;
