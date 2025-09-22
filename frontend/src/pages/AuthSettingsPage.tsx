import React from 'react';
import { Space, Spin, Form, Input, Button, Select, Card, Switch } from 'antd';
import { PageHeader } from '../components/PageHeader';

const AuthSettingsPage: React.FC<{ onNavigate?: () => void }> = ({ onNavigate }) => {
  const [loading] = React.useState(false);
  const [form] = Form.useForm();

  if (loading) {
    return (
      <div style={{ width: '100%', display: 'flex', justifyContent: 'center', marginTop: 120 }}>
        <Spin tip="正在載入身份驗證設定資料..." size="large" />
      </div>
    );
  }

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <PageHeader
        title="身份驗證"
        subtitle="系統 OIDC 認證配置"
        description="配置 OpenID Connect 認證參數。"
      />

      <Card title="OIDC 設定" style={{ width: '100%' }}>
        <Form
          form={form}
          layout="vertical"
          style={{ maxWidth: 600 }}
        >
          <Form.Item
            label="啟用 OIDC"
            name="oidc_enabled"
          >
            <Select placeholder="選擇是否啟用">
              <Select.Option value="true">啟用</Select.Option>
              <Select.Option value="false">停用</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="提供商"
            name="provider"
          >
            <Select placeholder="選擇 OIDC 提供商">
              <Select.Option value="keycloak">Keycloak</Select.Option>
              <Select.Option value="auth0">Auth0</Select.Option>
              <Select.Option value="google">Google</Select.Option>
              <Select.Option value="microsoft">Microsoft</Select.Option>
              <Select.Option value="custom">自訂</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="Realm/Domain"
            name="realm"
            rules={[{ required: true, message: '請輸入 Realm/Domain' }]}
          >
            <Input placeholder="例如: company" />
          </Form.Item>

          <Form.Item
            label="客戶端 ID"
            name="client_id"
            rules={[{ required: true, message: '請輸入客戶端 ID' }]}
          >
            <Input placeholder="輸入客戶端 ID" />
          </Form.Item>

          <Form.Item
            label="客戶端密鑰"
            name="client_secret"
            rules={[{ required: true, message: '請輸入客戶端密鑰' }]}
          >
            <Input.Password placeholder="輸入客戶端密鑰" />
          </Form.Item>

          <Form.Item
            label="授權端點"
            name="auth_url"
            rules={[{ required: true, message: '請輸入授權端點' }]}
          >
            <Input placeholder="例如: https://auth.company.com/auth" />
          </Form.Item>

          <Form.Item
            label="Token 端點"
            name="token_url"
            rules={[{ required: true, message: '請輸入 Token 端點' }]}
          >
            <Input placeholder="例如: https://auth.company.com/token" />
          </Form.Item>

          <Form.Item
            label="用戶資訊端點"
            name="userinfo_url"
            rules={[{ required: true, message: '請輸入用戶資訊端點' }]}
          >
            <Input placeholder="例如: https://auth.company.com/userinfo" />
          </Form.Item>

          <Form.Item
            label="Redirect URI"
            name="redirect_uri"
            rules={[{ required: true, message: '請輸入 Redirect URI' }]}
          >
            <Input placeholder="例如: https://sre.company.com/callback" />
          </Form.Item>

          <Form.Item
            label="登出端點"
            name="logout_url"
          >
            <Input placeholder="可選的登出端點 URL" />
          </Form.Item>

          <Form.Item
            label="使用者同步"
            name="user_sync"
          >
            <Switch checkedChildren="啟用" unCheckedChildren="停用" />
          </Form.Item>

          <Space>
            <Button>還原預設值</Button>
            <Button type="primary">儲存</Button>
            <Button>測試連線</Button>
          </Space>
        </Form>
      </Card>
    </Space>
  );
};

export default AuthSettingsPage;
