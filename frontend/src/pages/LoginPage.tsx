import React, { useState } from 'react';
import { Form, Input, Button, Checkbox, Card, Typography, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const { Title, Text } = Typography;

const LoginPageContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background: #000c17;
`;

const LoginCard = styled(Card)`
  width: 360px;
  padding: 24px;
  text-align: center;
  border-radius: 16px;
  box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.1);
`;

const LogoContainer = styled.div`
  margin-bottom: 24px;
`;

const Logo = styled.div`
  width: 56px;
  height: 56px;
  background: linear-gradient(135deg, #1890ff, #40a9ff);
  border-radius: 12px;
  margin: 0 auto;
`;

const LoginTitle = styled(Title)`
  font-size: 28px !important;
  font-weight: 700 !important;
  margin-bottom: 8px !important;
`;

const LoginSubTitle = styled(Text)`
  font-size: 14px;
  color: rgba(0, 0, 0, 0.45);
  margin-bottom: 24px;
  display: block;
`;

const StyledFormItem = styled(Form.Item)`
  .ant-input-affix-wrapper {
    height: 40px;
    border-radius: 8px;
  }
`;

const LoginButton = styled(Button)`
  height: 44px;
  border-radius: 8px;
  font-weight: 500;
`;

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);

  const onFinish = async (values: any) => {
    setLoading(true);
    try {
      await login(values.username, values.password);
      message.success('登入成功！');
      navigate('/');
    } catch (error) {
      if (error instanceof Error) {
        message.error(`登入失敗: ${error.message}`);
      } else {
        message.error('登入失敗，請稍後再試。');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <LoginPageContainer>
      <LoginCard>
        <LogoContainer>
          <Logo />
        </LogoContainer>
        <LoginTitle>SRE Platform</LoginTitle>
        <LoginSubTitle>智慧化系統可靠性管理平台</LoginSubTitle>
        <Form
          name="normal_login"
          initialValues={{ remember: true, username: 'admin@sre-platform.local' }}
          onFinish={onFinish}
        >
          <StyledFormItem
            name="username"
            rules={[{ required: true, message: '請輸入您的用戶名!' }]}
          >
            <Input prefix={<UserOutlined />} placeholder="用戶名" />
          </StyledFormItem>
          <StyledFormItem
            name="password"
            rules={[{ required: true, message: '請輸入您的密碼!' }]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="密碼" />
          </StyledFormItem>
          <Form.Item>
            <Form.Item name="remember" valuePropName="checked" noStyle>
              <Checkbox>記住我</Checkbox>
            </Form.Item>
            <a href="#/forgot-password" style={{ float: 'right' }}>
              忘記密碼
            </a>
          </Form.Item>

          <Form.Item>
            <LoginButton type="primary" htmlType="submit" block loading={loading}>
              登入
            </LoginButton>
          </Form.Item>
        </Form>
      </LoginCard>
    </LoginPageContainer>
  );
};

export default LoginPage;
