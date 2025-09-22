import React from 'react';
import { Space, Spin, Form, Input, Button, Select, Card } from 'antd';
import { PageHeader } from '../components/PageHeader';

const EmailSettingsPage: React.FC<{ onNavigate?: () => void }> = ({ onNavigate }) => {
  const [loading] = React.useState(false);
  const [form] = Form.useForm();

  if (loading) {
    return (
      <div style={{ width: '100%', display: 'flex', justifyContent: 'center', marginTop: 120 }}>
        <Spin tip="正在載入郵件設定資料..." size="large" />
      </div>
    );
  }

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <PageHeader
        title="郵件設定"
        subtitle="系統郵件服務的配置"
        description="配置 SMTP 伺服器設定和認證資訊。"
      />

      <Card title="SMTP 設定" style={{ width: '100%' }}>
        <Form
          form={form}
          layout="vertical"
          style={{ maxWidth: 600 }}
        >
          <Form.Item
            label="SMTP 伺服器"
            name="smtp_host"
            rules={[{ required: true, message: '請輸入 SMTP 伺服器' }]}
          >
            <Input placeholder="例如: smtp.gmail.com" />
          </Form.Item>

          <Form.Item
            label="埠號"
            name="smtp_port"
            rules={[{ required: true, message: '請輸入埠號' }]}
          >
            <Input placeholder="例如: 587" />
          </Form.Item>

          <Form.Item
            label="使用者名稱"
            name="username"
            rules={[{ required: true, message: '請輸入使用者名稱' }]}
          >
            <Input placeholder="輸入郵件帳號" />
          </Form.Item>

          <Form.Item
            label="密碼"
            name="password"
            rules={[{ required: true, message: '請輸入密碼' }]}
          >
            <Input.Password placeholder="輸入郵件密碼" />
          </Form.Item>

          <Form.Item
            label="寄件人名稱"
            name="sender_name"
          >
            <Input placeholder="顯示在收件人郵箱的寄件人名稱" />
          </Form.Item>

          <Form.Item
            label="寄件人地址"
            name="sender_email"
            rules={[{ required: true, message: '請輸入寄件人地址' }]}
          >
            <Input placeholder="例如: noreply@company.com" />
          </Form.Item>

          <Form.Item
            label="加密方式"
            name="encryption"
          >
            <Select placeholder="選擇加密方式">
              <Select.Option value="none">無</Select.Option>
              <Select.Option value="tls">TLS</Select.Option>
              <Select.Option value="ssl">SSL</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="測試收件人"
            name="test_recipient"
          >
            <Input placeholder="用於測試的收件人地址" />
          </Form.Item>

          <Space>
            <Button>還原預設值</Button>
            <Button type="primary">儲存</Button>
            <Button>測試寄送</Button>
          </Space>
        </Form>
      </Card>
    </Space>
  );
};

export default EmailSettingsPage;
