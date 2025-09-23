import React, { useState } from 'react'
import { Form, Input, Button, Card, Typography, Space, Alert } from 'antd'
import { UserOutlined, LockOutlined, DeploymentUnitOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'

const { Title, Text } = Typography

interface LoginForm {
  username: string
  password: string
}

const LoginPage: React.FC = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string>('')
  const navigate = useNavigate()

  const handleLogin = async (values: LoginForm) => {
    setLoading(true)
    setError('')

    try {
      // TODO: 實現實際的登入 API 調用
      console.log('登入嘗試:', values)

      // 模擬 API 調用
      await new Promise(resolve => setTimeout(resolve, 1000))

      // 模擬登入成功
      if (values.username === 'admin' && values.password === 'password') {
        localStorage.setItem('sre-auth-token', 'mock-token')
        navigate('/')
      } else {
        setError('用戶名或密碼錯誤')
      }
    } catch (err) {
      setError('登入失敗，請稍後再試')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--bg-page)',
      padding: '24px'
    }}>
      <Card style={{ width: 400, maxWidth: '100%' }}>
        <Space direction="vertical" size="large" style={{ width: '100%', textAlign: 'center' }}>
          <div>
            <DeploymentUnitOutlined style={{ fontSize: '48px', color: 'var(--primary-color)' }} />
            <Title level={2} style={{ marginTop: '16px', marginBottom: '8px' }}>
              SRE Platform
            </Title>
            <Text type="secondary">登入您的帳戶以繼續</Text>
          </div>

          {error && (
            <Alert
              message={error}
              type="error"
              showIcon
              closable
              onClose={() => setError('')}
            />
          )}

          <Form
            name="login"
            onFinish={handleLogin}
            autoComplete="off"
            size="large"
          >
            <Form.Item
              name="username"
              rules={[
                { required: true, message: '請輸入用戶名' },
                { min: 2, message: '用戶名至少需要2個字符' }
              ]}
            >
              <Input
                prefix={<UserOutlined style={{ color: 'var(--text-tertiary)' }} />}
                placeholder="輸入用戶名"
                autoComplete="username"
              />
            </Form.Item>

            <Form.Item
              name="password"
              rules={[
                { required: true, message: '請輸入密碼' },
                { min: 6, message: '密碼至少需要6個字符' }
              ]}
            >
              <Input.Password
                prefix={<LockOutlined style={{ color: 'var(--text-tertiary)' }} />}
                placeholder="輸入密碼"
                autoComplete="current-password"
              />
            </Form.Item>

            <Form.Item style={{ marginBottom: 0 }}>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                block
              >
                {loading ? '登入中...' : '登入'}
              </Button>
            </Form.Item>
          </Form>

          <Text type="secondary" style={{ fontSize: '12px' }}>
            預設帳戶: admin / password
          </Text>
        </Space>
      </Card>
    </div>
  )
}

export default LoginPage