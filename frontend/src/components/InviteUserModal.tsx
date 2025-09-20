import React from 'react';
import { Alert, Form, Input, Space, Typography, message } from 'antd';
import { MailOutlined, UserOutlined } from '@ant-design/icons';
import api from '../services/api';
import { GlassModal } from './GlassModal';

interface InviteUserModalProps {
  open: boolean;
  onCancel: () => void;
  onSuccess: () => void;
}

type InviteUserFormValues = {
  email: string;
  lastName: string;
  firstName: string;
  note?: string;
};

const InviteUserModal: React.FC<InviteUserModalProps> = ({ open, onCancel, onSuccess }) => {
  const [form] = Form.useForm<InviteUserFormValues>();
  const [loading, setLoading] = React.useState(false);

  const handleClose = React.useCallback(() => {
    form.resetFields();
    onCancel();
  }, [form, onCancel]);

  const handleInvite = async (values: InviteUserFormValues) => {
    setLoading(true);
    try {
      const payload = {
        email: values.email.trim().toLowerCase(),
        first_name: values.firstName.trim(),
        last_name: values.lastName.trim(),
        note: values.note?.trim() || undefined,
      };

      if (!payload.first_name || !payload.last_name) {
        message.error('請完整輸入姓名資訊');
        setLoading(false);
        return;
      }

      await api.inviteUser(payload);
      message.success(`已向 ${payload.email} 發送邀請郵件`);
      onSuccess();
      form.resetFields();
    } catch {
      message.error('邀請失敗，請稍後再試');
    } finally {
      setLoading(false);
    }
  };

  return (
    <GlassModal
      open={open}
      onCancel={handleClose}
      onOk={() => form.submit()}
      okText="發送邀請"
      cancelText="取消"
      confirmLoading={loading}
      title={(
        <Space direction="vertical" size={2} style={{ width: '100%' }}>
          <Typography.Title level={4} style={{ color: 'var(--text-primary)', marginBottom: 0 }}>
            邀請新人員
          </Typography.Title>
          <Typography.Text type="secondary">
            透過 Keycloak 發送設定密碼的邀請郵件
          </Typography.Text>
        </Space>
      )}
      width={600}
    >
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <Alert
          showIcon
          type="info"
          message="身份提供商管理"
          description="此流程會透過 Keycloak 建立帳號，並寄送設定密碼的安全連結。姓名與電子郵件將以 SSO 為唯一真實來源。"
        />

        <Form
          form={form}
          layout="vertical"
          onFinish={handleInvite}
          requiredMark={false}
        >
          <Form.Item
            name="email"
            label="電子郵件"
            rules={[
              { required: true, message: '請輸入電子郵件' },
              { type: 'email', message: '請輸入有效的電子郵件' },
            ]}
          >
            <Input prefix={<MailOutlined />} placeholder="user@example.com" autoComplete="email" />
          </Form.Item>

          <Space direction="horizontal" size="large" style={{ width: '100%' }}>
            <Form.Item
              name="lastName"
              label="姓氏"
              rules={[{ required: true, message: '請輸入姓氏' }]}
              style={{ flex: 1 }}
            >
              <Input prefix={<UserOutlined />} placeholder="例如：林" autoComplete="family-name" />
            </Form.Item>
            <Form.Item
              name="firstName"
              label="名字"
              rules={[{ required: true, message: '請輸入名字' }]}
              style={{ flex: 1 }}
            >
              <Input prefix={<UserOutlined />} placeholder="例如：奕辰" autoComplete="given-name" />
            </Form.Item>
          </Space>

          <Form.Item
            name="note"
            label="邀請訊息（選填）"
            tooltip="此訊息會附加在邀請郵件中，協助受邀者了解用途"
          >
            <Input.TextArea
              rows={3}
              placeholder="向新成員說明加入的目的或責任範圍"
              maxLength={280}
              showCount
            />
          </Form.Item>
        </Form>
      </Space>
    </GlassModal>
  );
};

export default InviteUserModal;
