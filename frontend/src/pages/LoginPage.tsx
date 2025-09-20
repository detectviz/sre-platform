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
  background: linear-gradient(135deg, #1a1f36 0%, #2c3e50 25%, #34495e 50%, #2c3e50 75%, #1a1f36 100%);
  background-size: 400% 400%;
  animation: gradientShift 15s ease infinite;
  position: relative;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: radial-gradient(ellipse at center, rgba(255, 255, 255, 0.1) 0%, transparent 70%);
    pointer-events: none;
  }

  @keyframes gradientShift {
    0% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
  }
`;

const LoginCard = styled(Card)`
  width: 400px;
  padding: 32px;
  text-align: center;
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  box-shadow:
    0 8px 32px 0 rgba(0, 0, 0, 0.3),
    inset 0 1px 0 0 rgba(255, 255, 255, 0.2);
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
  }

  .ant-card-body {
    padding: 0;
  }
`;

const LogoContainer = styled.div`
  margin-bottom: 32px;
`;

const Logo = styled.div`
  width: 64px;
  height: 64px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 16px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 24px;
  font-weight: bold;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: linear-gradient(45deg, transparent, rgba(255, 255, 255, 0.3), transparent);
    transform: rotate(45deg);
    animation: logoShine 3s ease-in-out infinite;
  }

  @keyframes logoShine {
    0% { transform: translateX(-100%) translateY(-100%) rotate(45deg); }
    50% { transform: translateX(100%) translateY(100%) rotate(45deg); }
    100% { transform: translateX(-100%) translateY(-100%) rotate(45deg); }
  }
`;

const LoginTitle = styled(Title)`
  font-size: 32px !important;
  font-weight: 700 !important;
  margin-bottom: 8px !important;
  color: rgba(255, 255, 255, 0.95) !important;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
`;

const LoginSubTitle = styled(Text)`
  font-size: 16px;
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 32px;
  display: block;
  font-weight: 300;
`;

const StyledFormItem = styled(Form.Item)`
  .ant-input-affix-wrapper,
  .ant-input {
    height: 48px;
    border-radius: 12px;
    border: 1px solid rgba(255, 255, 255, 0.2);
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(10px);
    color: rgba(255, 255, 255, 0.9);

    &::placeholder {
      color: rgba(255, 255, 255, 0.5);
    }

    &:hover {
      border-color: rgba(255, 255, 255, 0.3);
      background: rgba(255, 255, 255, 0.15);
    }

    &:focus,
    &.ant-input-focused {
      border-color: #667eea;
      background: rgba(255, 255, 255, 0.15);
      box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.2);
    }

    .ant-input-prefix {
      color: rgba(255, 255, 255, 0.6);
    }
  }
`;

const LoginButton = styled(Button)`
  height: 48px;
  border-radius: 12px;
  font-weight: 600;
  font-size: 16px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  position: relative;
  overflow: hidden;

  &:hover {
    background: linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%);
    transform: translateY(-1px);
    box-shadow: 0 4px 20px rgba(102, 126, 234, 0.4);
  }

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
    transition: left 0.5s;
  }

  &:hover::before {
    left: 100%;
  }
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
          <Logo>
            🛡️
          </Logo>
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
              <Checkbox style={{ color: 'rgba(255, 255, 255, 0.8)' }}>記住我</Checkbox>
            </Form.Item>
            <a
              href="#/forgot-password"
              style={{
                float: 'right',
                color: '#667eea',
                textDecoration: 'none'
              }}
            >
              忘記密碼？
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
