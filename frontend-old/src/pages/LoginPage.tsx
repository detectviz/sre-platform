import React, { useState } from 'react';
import { Form, Input, Button, Checkbox, Card, Typography, Space, message } from 'antd';
import { SafetyCertificateOutlined, UserOutlined, LockOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const { Title, Text } = Typography;

type LoginFormValues = {
  username: string;
  password: string;
  remember?: boolean;
};

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (values: LoginFormValues) => {
    setLoading(true);
    try {
      await login(values.username, values.password);
      message.success('登入成功！');
      navigate('/');
    } catch (error) {
      if (error instanceof Error) {
        message.error(`登入失敗：${error.message}`);
      } else {
        message.error('登入失敗，請稍後再試。');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <Card bordered={false} className="login-card">
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <div className="login-logo">
            <div className="login-logo-icon">
              <SafetyCertificateOutlined />
            </div>
            <div>
              <Title level={3} className="login-title">SRE 平台</Title>
              <Text className="login-subtitle">統一監控與自動化營運中樞</Text>
            </div>
          </div>

          <Form<LoginFormValues>
            layout="vertical"
            name="sre-login"
            initialValues={{ remember: true, username: 'admin@sre-platform.local' }}
            onFinish={handleSubmit}
          >
            <Form.Item
              name="username"
              label="帳號"
              rules={[{ required: true, message: '請輸入您的帳號' }]}
            >
              <Input
                size="large"
                prefix={<UserOutlined />}
                placeholder="admin@sre-platform.local"
                autoComplete="username"
              />
            </Form.Item>

            <Form.Item
              name="password"
              label="密碼"
              rules={[{ required: true, message: '請輸入您的密碼' }]}
            >
              <Input.Password
                size="large"
                prefix={<LockOutlined />}
                placeholder="輸入密碼"
                autoComplete="current-password"
              />
            </Form.Item>

            <Form.Item style={{ marginBottom: 8 }}>
              <Space align="center" style={{ width: '100%', justifyContent: 'space-between' }}>
                <Form.Item name="remember" valuePropName="checked" noStyle>
                  <Checkbox>記住我</Checkbox>
                </Form.Item>
                <a href="#/forgot-password" style={{ color: 'var(--text-secondary)' }}>
                  忘記密碼？
                </a>
              </Space>
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                className="login-submit-btn"
              >
                登入
              </Button>
            </Form.Item>
          </Form>

          <div className="login-footer">
            <Text type="secondary">© {new Date().getFullYear()} SRE 平台 · 智慧化可靠性與營運中心</Text>
          </div>
        </Space>
      </Card>
    </div>
  );
};

export default LoginPage;
