import React from 'react';
import { Button, Card, Form, Input, Typography } from 'antd';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { login } from '../features/auth/authSlice';
import { AppDispatch } from '../store/store';

const { Title } = Typography;

const LoginPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const handleLogin = () => {
    // 在實際應用中，這裡會呼叫 API 進行驗證
    // 成功後，再 dispatch action 並導航
    console.log('模擬登入...');

    // Dispatch 一個模擬的使用者資訊
    dispatch(login({ name: 'Admin' }));

    // 導航到主儀表板
    navigate('/dashboard');
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#f0f2f5' }}>
      <Card style={{ width: 400 }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <Title level={2}>SRE Platform</Title>
          <Typography.Text>登入您的帳號</Typography.Text>
        </div>
        <Form onFinish={handleLogin}>
          <Form.Item
            name="username"
            rules={[{ required: true, message: '請輸入您的用戶名!' }]}
          >
            <Input placeholder="用戶名" />
          </Form.Item>
          <Form.Item
            name="password"
            rules={[{ required: true, message: '請輸入您的密碼!' }]}
          >
            <Input.Password placeholder="密碼" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" style={{ width: '100%' }}>
              登入
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default LoginPage;
