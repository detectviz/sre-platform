import { useCallback, useEffect, useMemo, useState } from 'react';
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
  Divider,
  Tag as AntdTag,
  Typography,
} from 'antd';
import type { TabsProps } from 'antd';
import { ContextualKPICard, DataTable, GlassModal, PageHeader } from '../components';
import useTags from '../hooks/useTags';
import type { Tag } from '../hooks/useTags';
import useTagMetadata from '../hooks/useTagMetadata';
import type { TagValueOption } from '../types/tags';

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

const ENFORCEMENT_META: Record<string, { label: string; color: string; helper: string }> = {
  advisory: {
    label: '建議 (Advisory)',
    color: 'blue',
    helper: '建議遵守，允許例外並記錄審計。',
  },
  warning: {
    label: '警告 (Warning)',
    color: 'orange',
    helper: '儲存時提示警告，可由管理員覆寫。',
  },
  blocking: {
    label: '阻擋 (Blocking)',
    color: 'red',
    helper: '不符合規則時拒絕提交，需走例外流程。',
  },
};

type TagManagementTabProps = {
  refreshSignal: number;
};

const TagManagementTab = ({ refreshSignal }: TagManagementTabProps) => {
  const { message } = AntdApp.useApp();
  const { tags, loading, error, refresh } = useTags();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Tag | null>(null);
  const [form] = Form.useForm<Tag>();
  const keyNameValue = Form.useWatch('key_name', form);
  const descriptionValue = Form.useWatch('description', form);
  const enforcementValue = Form.useWatch('enforcement_level', form);
  const regexValue = Form.useWatch('validation_regex', form);
  const enforcementMeta = ENFORCEMENT_META[String(enforcementValue ?? 'advisory')] ?? ENFORCEMENT_META.advisory;

  useEffect(() => {
    if (refreshSignal > 0) {
      refresh();
    }
  }, [refresh, refreshSignal]);

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
    setEditing(null);
    setOpen(false);
    form.resetFields();
  };

  const handleModalCancel = useCallback(() => {
    setOpen(false);
    setEditing(null);
    form.resetFields();
  }, [form]);

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

        <GlassModal
          open={open}
          title={editing ? '編輯標籤規則' : '新增標籤規則'}
          onCancel={handleModalCancel}
          onOk={() => form.submit()}
          okText={editing ? '儲存變更' : '建立標籤規則'}
          cancelText="取消"
          width={760}
        >
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            <Alert
              showIcon
              type="info"
              message="標籤治理規範"
              description="標籤鍵是事件、資源與通知策略的共同語言。請為每個鍵提供清晰的描述與驗證規則，確保跨團隊的資料一致性。"
            />

            <Form form={form} layout="vertical" onFinish={handleSubmit} requiredMark={false}>
              <Row gutter={[16, 16]}>
                <Col xs={24} md={16}>
                  <Form.Item
                    name="key_name"
                    label="標籤鍵"
                    rules={[{ required: true, message: '請輸入標籤鍵' }]}
                    tooltip="使用小寫英文字母與底線，便於在自動化腳本與通知中引用"
                  >
                    <Input placeholder="例如：env、service、owner_team" />
                  </Form.Item>

                  <Form.Item
                    name="description"
                    label="描述"
                    tooltip="描述此標籤的來源與適用情境，協助跨團隊理解"
                  >
                    <Input.TextArea rows={3} placeholder="說明此標籤的用途與命名範例" />
                  </Form.Item>

                  <Form.Item
                    name="enforcement_level"
                    label="強制等級"
                    rules={[{ required: true, message: '請選擇強制等級' }]}
                  >
                    <Select>
                      <Select.Option value="advisory">建議 (Advisory)</Select.Option>
                      <Select.Option value="warning">警告 (Warning)</Select.Option>
                      <Select.Option value="blocking">阻擋 (Blocking)</Select.Option>
                    </Select>
                  </Form.Item>

                  <Form.Item
                    name="validation_regex"
                    label="驗證規則 (Regex)"
                    tooltip="為標籤值設定格式，例如僅允許小寫字母與破折號"
                  >
                    <Input placeholder="例如：^[a-z0-9-]+$" />
                  </Form.Item>
                </Col>

                <Col xs={24} md={8}>
                  <Card size="small" title="規則預覽" style={{ borderRadius: 16 }}>
                    <Space direction="vertical" size={12} style={{ width: '100%' }}>
                      <Space align="center" size={8}>
                        <Text strong style={{ fontSize: 16 }}>
                          {keyNameValue || '尚未輸入標籤鍵'}
                        </Text>
                        <AntdTag color={enforcementMeta.color}>{enforcementMeta.label}</AntdTag>
                      </Space>
                      <Text type="secondary">
                        {descriptionValue || '輸入描述來協助使用者理解標籤用途。'}
                      </Text>
                      <Divider style={{ margin: '12px 0' }} />
                      <Text type="secondary">驗證規則</Text>
                      <Paragraph
                        code
                        style={{ marginBottom: 8 }}
                      >
                        {regexValue || '未設定正則驗證'}
                      </Paragraph>
                      <Text type="secondary">{enforcementMeta.helper}</Text>
                    </Space>
                  </Card>
                </Col>
              </Row>
            </Form>

            <Card size="small" title="最佳實踐" style={{ borderRadius: 16 }}>
              <Space direction="vertical" size={8} style={{ width: '100%' }}>
                <Text type="secondary">• 標籤鍵建議以資料域為前綴，例如 `infra.env`、`app.service`。</Text>
                <Text type="secondary">• 於通知與自動化流程中引用此標準鍵值，確保跨系統一致。</Text>
                <Text type="secondary">• 強制等級為阻擋時，請同步建立例外流程並通知治理負責人。</Text>
              </Space>
            </Card>
          </Space>
        </GlassModal>
      </Space>
    </Spin>
  );
};

type TagValueManagementTabProps = {
  refreshSignal: number;
};

const TagValueManagementTab = ({ refreshSignal }: TagValueManagementTabProps) => {
  const { message } = AntdApp.useApp();
  const { tags, loading, error, isFallback, refresh } = useTagMetadata();
  const [selectedKey, setSelectedKey] = useState<string | undefined>(undefined);
  const [valueStore, setValueStore] = useState<Record<string, TagValueOption[]>>({});
  const [modalOpen, setModalOpen] = useState(false);
  const [editingValue, setEditingValue] = useState<TagValueOption | null>(null);
  const [form] = Form.useForm<{ value: string; label?: string; color?: string }>();
  const valueDraft = Form.useWatch('value', form);
  const labelDraft = Form.useWatch('label', form);
  const colorDraft = Form.useWatch('color', form);

  useEffect(() => {
    if (refreshSignal > 0) {
      refresh();
    }
  }, [refresh, refreshSignal]);

  useEffect(() => {
    if (!selectedKey && tags.length > 0) {
      setSelectedKey(tags[0].key);
    }
  }, [selectedKey, tags]);

  useEffect(() => {
    setValueStore((previous) => {
      const next: Record<string, TagValueOption[]> = {};
      tags.forEach((tag) => {
        const initialValues = previous[tag.key]
          ?? tag.allowedValues
          ?? tag.sampleValues
          ?? [];
        next[tag.key] = initialValues.map((item) => ({ ...item }));
      });
      return next;
    });
  }, [tags]);

  const selectedTag = useMemo(
    () => tags.find((tag) => tag.key === selectedKey),
    [selectedKey, tags],
  );

  const managedValues = useMemo(() => {
    if (!selectedKey) {
      return [] as TagValueOption[];
    }
    return valueStore[selectedKey]
      ?? selectedTag?.allowedValues
      ?? selectedTag?.sampleValues
      ?? [];
  }, [selectedKey, selectedTag, valueStore]);

  const canManageValues = selectedTag?.valueMode !== 'FREEFORM';

  const handleOpenModal = useCallback((record?: TagValueOption) => {
    setEditingValue(record ?? null);
    form.setFieldsValue({
      value: record?.value ?? '',
      label: record?.label ?? record?.value ?? '',
      color: record?.color ?? undefined,
    });
    setModalOpen(true);
  }, [form]);

  const handleModalClose = useCallback(() => {
    setModalOpen(false);
    setEditingValue(null);
    form.resetFields();
  }, [form]);

  const handleSubmit = useCallback((values: { value: string; label?: string; color?: string }) => {
    const key = selectedKey;
    if (!key) {
      message.warning('請先選擇標籤鍵');
      return;
    }
    const trimmedValue = values.value.trim();
    if (!trimmedValue) {
      message.error('請輸入有效的標籤值');
      return;
    }
    const nextEntry: TagValueOption = {
      value: trimmedValue,
      label: values.label?.trim() || trimmedValue,
      color: values.color ? values.color.trim() : null,
    };
    setValueStore((prev) => {
      const current = prev[key] ?? [];
      const exists = editingValue ? current.some((item) => item.value === editingValue.value) : false;
      const updated = exists
        ? current.map((item) => (item.value === editingValue?.value ? { ...item, ...nextEntry } : item))
        : [...current, nextEntry];
      return { ...prev, [key]: updated };
    });
    handleModalClose();
    message.success(editingValue ? '標籤值已更新 (模擬)' : '標籤值已新增 (模擬)');
  }, [editingValue, handleModalClose, message, selectedKey]);

  const handleDelete = useCallback((record: TagValueOption) => {
    if (!selectedKey) {
      return;
    }
    Modal.confirm({
      title: `刪除標籤值「${record.value}」`,
      content: '刪除後將無法使用此預設值，確認要繼續嗎？',
      okText: '刪除',
      okType: 'danger',
      cancelText: '取消',
      onOk: () => {
        setValueStore((prev) => {
          const current = prev[selectedKey] ?? [];
          return {
            ...prev,
            [selectedKey]: current.filter((item) => item.value !== record.value),
          };
        });
        message.success(`標籤值「${record.value}」已移除 (模擬)`);
      },
    });
  }, [message, selectedKey]);

  const columns = useMemo(() => [
    { title: '值', dataIndex: 'value', key: 'value' },
    { title: '顯示名稱', dataIndex: 'label', key: 'label', render: (label: string | undefined) => label ?? '—' },
    {
      title: '顏色',
      dataIndex: 'color',
      key: 'color',
      render: (color: string | null | undefined) => (color ? <AntdTag color={color}>{color}</AntdTag> : '—'),
    },
    {
      title: '使用次數',
      dataIndex: 'usageCount',
      key: 'usageCount',
      align: 'right' as const,
      render: (count: number | undefined) => count ?? 0,
    },
    {
      title: '操作',
      key: 'actions',
      render: (_: unknown, record: TagValueOption) => (
        <Space size={4} wrap>
          <Button type="link" onClick={() => handleOpenModal(record)} disabled={!canManageValues}>
            編輯
          </Button>
          <Button type="link" danger onClick={() => handleDelete(record)} disabled={!canManageValues}>
            刪除
          </Button>
        </Space>
      ),
    },
  ], [canManageValues, handleDelete, handleOpenModal]);

  if (error) {
    return <Alert type="error" message="無法載入標籤值" description={(error as Error).message} showIcon />;
  }

  return (
    <Spin spinning={loading}>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <Space align="center" wrap>
          <Select
            showSearch
            placeholder="選擇標籤鍵"
            value={selectedKey}
            options={tags.map((tag) => ({ value: tag.key, label: tag.label ?? tag.key }))}
            onChange={(value) => setSelectedKey(value)}
            style={{ minWidth: 220 }}
          />
          <Button icon={<ReloadOutlined />} onClick={refresh}>
            重新整理
          </Button>
          <Button type="primary" onClick={() => handleOpenModal()} disabled={!canManageValues}>
            新增標籤值
          </Button>
        </Space>

        {isFallback && (
          <Alert
            type="warning"
            showIcon
            message="目前顯示為離線標籤資料"
            description="尚未連接 /tags API，以下列表為樣本資料。"
          />
        )}

        {selectedTag && !canManageValues && (
          <Alert
            type="info"
            showIcon
            message={`標籤「${selectedTag.label ?? selectedTag.key}」為自由輸入模式，僅能瀏覽常用值。`}
          />
        )}

        <DataTable<TagValueOption>
          dataSource={managedValues}
          columns={columns}
          rowKey={(record) => record.value}
          titleContent={<span style={{ fontWeight: 600 }}>標籤值清單</span>}
        />

        <GlassModal
          open={modalOpen}
          title={editingValue ? '編輯標籤值' : '新增標籤值'}
          onCancel={handleModalClose}
          onOk={() => form.submit()}
          okText={editingValue ? '儲存變更' : '新增標籤值'}
          cancelText="取消"
          width={640}
        >
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            <Alert
              showIcon
              type="info"
              message="標籤值建議"
              description="建議採用可讀性良好的顯示名稱與顏色標註，協助儀表板與通知快速辨識環境。"
            />

            <Form form={form} layout="vertical" onFinish={handleSubmit} requiredMark={false}>
              <Form.Item
                name="value"
                label="標籤值"
                rules={[{ required: true, message: '請輸入標籤值' }]}
              >
                <Input placeholder="例如：production" />
              </Form.Item>
              <Form.Item
                name="label"
                label="顯示名稱"
                tooltip="自訂顯示名稱以便在 UI 上呈現更友善的文字"
              >
                <Input placeholder="顯示於介面的名稱，例如：Production 環境" />
              </Form.Item>
              <Form.Item
                name="color"
                label="顏色"
                tooltip="可輸入十六進位色碼或留白沿用預設色彩"
              >
                <Input placeholder="例如：#1890ff 或留空" />
              </Form.Item>
            </Form>

            <Card size="small" title="預覽" style={{ borderRadius: 16 }}>
              <Space direction="vertical" size={12} style={{ width: '100%' }}>
                <Space align="center" size={8}>
                  <AntdTag color={colorDraft || 'geekblue'}>
                    {labelDraft || valueDraft || '標籤值預覽'}
                  </AntdTag>
                  <Text type="secondary">值：{valueDraft || '—'}</Text>
                </Space>
                <Text type="secondary">顏色 {colorDraft || '使用預設色彩'}</Text>
                <Text type="secondary">顯示名稱 {labelDraft || '尚未設定'}</Text>
              </Space>
            </Card>
          </Space>
        </GlassModal>
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
  const [refreshSignal, setRefreshSignal] = useState(0);

  useEffect(() => {
    document.title = '平台設定 - SRE 平台';
  }, []);

  const handleRefreshAll = useCallback(() => {
    setRefreshSignal((prev) => prev + 1);
  }, []);

  const items: TabsProps['items'] = useMemo(() => [
    {
      key: 'tag-management',
      label: (
        <span>
          <TagsOutlined /> 標籤管理
        </span>
      ),
      children: <TagManagementTab refreshSignal={refreshSignal} />,
    },
    {
      key: 'tag-value-management',
      label: (
        <span>
          <TagsOutlined /> 標籤值管理
        </span>
      ),
      children: <TagValueManagementTab refreshSignal={refreshSignal} />,
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
  ], [refreshSignal]);

  const activeKey = items.some((item) => item?.key === pageKey) ? pageKey : 'tag-management';

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <PageHeader
        title="平台設定"
        subtitle="管理平台核心參數、通知與身份驗證整合"
        extra={(
          <Button icon={<ReloadOutlined />} onClick={handleRefreshAll}>
            全部重新整理
          </Button>
        )}
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
