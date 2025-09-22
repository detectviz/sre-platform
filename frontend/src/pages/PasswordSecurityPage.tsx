import React from 'react';
import { Space, Spin, Form, Input, Button, Card, Switch, Table } from 'antd';
import { PageHeader } from '../components/PageHeader';

const PasswordSecurityPage: React.FC<{ onNavigate?: () => void }> = ({ onNavigate: _ }) => {
  const [loading] = React.useState(false);
  const [form] = Form.useForm();

  const loginHistoryColumns = [
    { title: '登入時間', dataIndex: 'login_time', key: 'login_time' },
    { title: 'IP 地址', dataIndex: 'ip_address', key: 'ip_address' },
    { title: '裝置資訊', dataIndex: 'device_info', key: 'device_info' },
    { title: '登入結果', dataIndex: 'status', key: 'status' },
  ];

  const loginHistoryData: any[] = [];

  if (loading) {
    return (
      <div style={{ width: '100%', display: 'flex', justifyContent: 'center', marginTop: 120 }}>
        <Spin tip="正在載入密碼安全資料..." size="large" />
      </div>
    );
  }

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <PageHeader
        title="密碼安全"
        subtitle="密碼變更和安全設定"
        description="管理密碼和安全相關設定。"
      />

      <Card title="密碼變更" style={{ width: '100%' }}>
        <Form
          form={form}
          layout="vertical"
          style={{ maxWidth: 600 }}
        >
          <Form.Item
            label="舊密碼"
            name="old_password"
          >
            <Input.Password placeholder="輸入當前密碼" />
          </Form.Item>

          <Form.Item
            label="新密碼"
            name="new_password"
          >
            <Input.Password placeholder="輸入新密碼" />
          </Form.Item>

          <Form.Item
            label="確認新密碼"
            name="confirm_password"
          >
            <Input.Password placeholder="再次輸入新密碼" />
          </Form.Item>

          <Space>
            <Button type="primary">變更密碼</Button>
          </Space>
        </Form>
      </Card>

      <Card title="安全功能" style={{ width: '100%' }}>
        <Form
          form={form}
          layout="vertical"
          style={{ maxWidth: 600 }}
        >
          <Form.Item
            label="兩步驟驗證"
            name="two_factor"
          >
            <Switch checkedChildren="啟用" unCheckedChildren="停用" disabled />
          </Form.Item>

          <p style={{ color: '#999' }}>兩步驟驗證由 Keycloak 管理，請前往 Keycloak 設定</p>

          <Space>
            <Button type="primary">前往 Keycloak 管理</Button>
          </Space>
        </Form>
      </Card>

      <Card title="最近登入記錄" style={{ width: '100%' }}>
        <Table
          columns={loginHistoryColumns}
          dataSource={loginHistoryData}
          locale={{ emptyText: '暫無登入記錄' }}
          pagination={false}
        />
      </Card>
    </Space>
  );
};

export default PasswordSecurityPage;
