import React, { useState } from 'react'
import { Card, Form, Input, Button, Space, message, Switch, List, Typography } from 'antd'
import {
  KeyOutlined,
  SafetyOutlined,
  CheckOutlined,
  LockOutlined,
  MobileOutlined,
  MailOutlined
} from '@ant-design/icons'

const { Item } = Form
const { Text } = Typography
const { Password } = Input

interface SecuritySettingsProps {
  onPasswordChange?: (oldPassword: string, newPassword: string) => void
  onTwoFactorToggle?: (enabled: boolean) => void
  twoFactorEnabled?: boolean
}

export const SecuritySettings: React.FC<SecuritySettingsProps> = ({
  onPasswordChange,
  onTwoFactorToggle,
  twoFactorEnabled = false
}) => {
  const [passwordForm] = Form.useForm()
  const [loading, setLoading] = useState(false)

  const handlePasswordChange = async () => {
    try {
      setLoading(true)
      const values = await passwordForm.validateFields()
      onPasswordChange?.(values.oldPassword, values.newPassword)
      passwordForm.resetFields()
      message.success('密碼已成功更新')
    } catch {
      message.error('密碼更新失敗，請檢查輸入')
    } finally {
      setLoading(false)
    }
  }

  const handleTwoFactorChange = (checked: boolean) => {
    onTwoFactorToggle?.(checked)
    message.success(checked ? '雙重驗證已啟用' : '雙重驗證已停用')
  }

  const securityEvents = [
    {
      action: '登入成功',
      time: '2025-09-22 14:30:25',
      location: '台北, 台灣',
      device: 'Chrome on macOS',
      status: 'success'
    },
    {
      action: '密碼變更',
      time: '2025-09-20 09:15:00',
      location: '台北, 台灣',
      device: 'Safari on iPhone',
      status: 'success'
    },
    {
      action: '登入失敗',
      time: '2025-09-19 22:45:10',
      location: '未知位置',
      device: 'Unknown Browser',
      status: 'failed'
    }
  ]

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      {/* 密碼更改 */}
      <Card
        title={
          <Space>
            <KeyOutlined />
            <span>更改密碼</span>
          </Space>
        }
        size="small"
      >
        <Form
          form={passwordForm}
          layout="vertical"
          style={{ maxWidth: 400 }}
        >
          <Item
            label="目前密碼"
            name="oldPassword"
            rules={[{ required: true, message: '請輸入目前密碼' }]}
          >
            <Password
              placeholder="請輸入目前密碼"
              prefix={<LockOutlined style={{ color: 'var(--text-secondary)' }} />}
            />
          </Item>

          <Item
            label="新密碼"
            name="newPassword"
            rules={[
              { required: true, message: '請輸入新密碼' },
              { min: 8, message: '密碼至少需要 8 個字符' }
            ]}
          >
            <Password
              placeholder="請輸入新密碼"
              prefix={<LockOutlined style={{ color: 'var(--text-secondary)' }} />}
            />
          </Item>

          <Item
            label="確認新密碼"
            name="confirmPassword"
            dependencies={['newPassword']}
            rules={[
              { required: true, message: '請確認新密碼' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('newPassword') === value) {
                    return Promise.resolve()
                  }
                  return Promise.reject(new Error('兩次輸入的密碼不一致'))
                },
              }),
            ]}
          >
            <Password
              placeholder="請再次輸入新密碼"
              prefix={<LockOutlined style={{ color: 'var(--text-secondary)' }} />}
            />
          </Item>

          <Item>
            <Button
              type="primary"
              loading={loading}
              onClick={handlePasswordChange}
            >
              更新密碼
            </Button>
          </Item>
        </Form>
      </Card>

      {/* 雙重驗證 */}
      <Card
        title={
          <Space>
            <SafetyOutlined />
            <span>雙重驗證</span>
          </Space>
        }
        size="small"
      >
        <Space direction="vertical" style={{ width: '100%' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <Text strong>啟用雙重驗證</Text>
              <br />
              <Text type="secondary" style={{ fontSize: '12px' }}>
                為您的帳戶增加額外的安全保護
              </Text>
            </div>
            <Switch
              checked={twoFactorEnabled}
              onChange={handleTwoFactorChange}
              checkedChildren={<CheckOutlined />}
            />
          </div>

          {twoFactorEnabled && (
            <div style={{ marginTop: 16, padding: 16, background: 'var(--bg-elevated)', borderRadius: '8px' }}>
              <Space direction="vertical">
                <Text strong style={{ color: 'var(--brand-success)' }}>
                  <CheckOutlined /> 雙重驗證已啟用
                </Text>
                <Space>
                  <Button size="small" icon={<MobileOutlined />}>
                    管理驗證應用程式
                  </Button>
                  <Button size="small" icon={<MailOutlined />}>
                    備用驗證碼
                  </Button>
                </Space>
              </Space>
            </div>
          )}
        </Space>
      </Card>

      {/* 安全活動日誌 */}
      <Card
        title={
          <Space>
            <SafetyOutlined />
            <span>最近的安全活動</span>
          </Space>
        }
        size="small"
      >
        <List
          dataSource={securityEvents}
          renderItem={(item) => (
            <List.Item
              style={{
                padding: '12px 0',
                borderBottom: '1px solid var(--border-light)'
              }}
            >
              <div style={{ width: '100%' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <Text strong style={{
                      color: item.status === 'success' ? 'var(--brand-success)' : 'var(--brand-danger)'
                    }}>
                      {item.action}
                    </Text>
                    <br />
                    <Text type="secondary" style={{ fontSize: '12px' }}>
                      {item.location} • {item.device}
                    </Text>
                  </div>
                  <Text type="secondary" style={{ fontSize: '12px' }}>
                    {item.time}
                  </Text>
                </div>
              </div>
            </List.Item>
          )}
        />
      </Card>
    </Space>
  )
}