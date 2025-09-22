import React from 'react';
import { Space, Spin, Form, Input, Button, Card } from 'antd';
import { PageHeader } from '../components/PageHeader';

const PersonalInformationPage: React.FC<{ onNavigate?: () => void }> = ({ onNavigate }) => {
  const [loading] = React.useState(false);
  const [form] = Form.useForm();

  if (loading) {
    return (
      <div style={{ width: '100%', display: 'flex', justifyContent: 'center', marginTop: 120 }}>
        <Spin tip="正在載入個人資訊資料..." size="large" />
      </div>
    );
  }

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <PageHeader
        title="個人資訊"
        subtitle="個人基本資料管理"
        description="查看和修改個人基本資訊。"
      />

      <Card title="個人資訊" style={{ width: '100%' }}>
        <Form
          form={form}
          layout="vertical"
          style={{ maxWidth: 600 }}
        >
          <Form.Item
            label="使用者名稱"
            name="username"
          >
            <Input disabled placeholder="由 Keycloak 管理" />
          </Form.Item>

          <Form.Item
            label="顯示名稱"
            name="display_name"
          >
            <Input disabled placeholder="由 Keycloak 管理" />
          </Form.Item>

          <Form.Item
            label="電子郵件"
            name="email"
          >
            <Input disabled placeholder="由 Keycloak 管理" />
          </Form.Item>

          <Form.Item
            label="所屬團隊"
            name="teams"
          >
            <Input disabled placeholder="由 Keycloak 管理" />
          </Form.Item>

          <Form.Item
            label="角色"
            name="roles"
          >
            <Input disabled placeholder="由 Keycloak 管理" />
          </Form.Item>

          <Space>
            <Button type="primary">前往 Keycloak 管理</Button>
          </Space>
        </Form>
      </Card>
    </Space>
  );
};

export default PersonalInformationPage;
