import React, { useState } from 'react'
import { useTabs } from '../hooks'
import { Tabs, Form, Select, Switch, Button, Card, Divider, Space, Alert, Typography } from 'antd'
import { PageHeader } from '../components/PageHeader'
import { ContextualKPICard } from '../components/ContextualKPICard'
import {
  UserOutlined,
  SafetyOutlined,
  SettingOutlined,
  LockOutlined,
} from '@ant-design/icons'
const { Option } = Select
const { Text, Title } = Typography


const ProfilePage: React.FC = () => {
  const { activeTab, handleTabChange } = useTabs('personal', {}, {
    personal: ['/profile/personal', '/profile'],
    security: ['/profile/security', '/profile'],
    preferences: ['/profile/preferences', '/profile'],
  })

  const [form] = Form.useForm()
  const [themeMode, setThemeMode] = useState<'light' | 'dark'>('dark')
  const [defaultPage, setDefaultPage] = useState('dashboard')
  const [timezone, setTimezone] = useState('UTC')
  const [notificationEnabled, setNotificationEnabled] = useState(true)

  // KPI 數據
  const kpiData = [
    {
      title: '最後更新',
      value: '3天前',
      description: '個人資料更新時間',
      status: 'info' as const,
    },
    {
      title: '關聯團隊',
      value: '2個',
      description: '所屬團隊數量',
      status: 'info' as const,
    },
    {
      title: '安全評分',
      value: '92分',
      description: '帳戶安全性評估',
      status: 'success' as const,
    },
  ]


  // 處理跳轉至 Keycloak
  const handleGoToKeycloak = () => {
    console.log('跳轉至 Keycloak 帳號中心')
  }

  // 處理偏好設定保存
  const handlePreferencesSave = (values: Record<string, any>) => {
    console.log('保存偏好設定:', values)
    // 實際偏好設定保存邏輯
  }

  const tabItems = [
    {
      key: 'personal',
      label: '個人資訊',
      icon: <UserOutlined />,
      children: (
        <div style={{ maxWidth: 500, paddingTop: 16 }}>
          <Card>
            <div style={{ marginBottom: 24 }}>
              <Title level={4} style={{ marginBottom: 8 }}>個人資訊</Title>
              <Text type="secondary">查看和管理您的個人基本資訊</Text>
            </div>

            <div style={{ marginBottom: 24 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: 16, marginBottom: 16 }}>
                <div style={{ textAlign: 'right', color: '#666', paddingTop: 8 }}>姓名</div>
                <div style={{ paddingTop: 8, fontWeight: 'bold' }}>Admin User</div>

                <div style={{ textAlign: 'right', color: '#666', paddingTop: 8 }}>電子郵件</div>
                <div style={{ paddingTop: 8, fontWeight: 'bold' }}>admin@example.com</div>
              </div>
            </div>

            <Alert
              message="個人資料管理說明"
              description={
                <div>
                  <p style={{ margin: '8px 0' }}>
                    您的姓名與電子郵件等核心身份資訊由您的組織統一管理。如需修改，請點擊下方按鈕前往您的身份提供商 (Keycloak) 帳號中心。
                  </p>
                </div>
              }
              type="info"
              showIcon
              style={{ marginBottom: 16 }}
            />

            <Button
              type="primary"
              icon={<UserOutlined />}
              onClick={handleGoToKeycloak}
              block
            >
              前往 Keycloak 管理個人資料
            </Button>
          </Card>
        </div>
      )
    },
    {
      key: 'security',
      label: '密碼安全',
      icon: <SafetyOutlined />,
      children: (
        <div style={{ maxWidth: 500, paddingTop: 16 }}>
          <Card>
            <div style={{ marginBottom: 24 }}>
              <Title level={4} style={{ marginBottom: 8 }}>安全性設定</Title>
              <Text type="secondary">管理您的帳戶安全和雙重驗證設定</Text>
            </div>

            <Alert
              message="安全性設定說明"
              description={
                <div>
                  <p style={{ margin: '8px 0' }}>
                    本平台的所有安全性設定（包含密碼變更、兩步驟驗證 2FA）均由您的組織身分提供商 (Keycloak) 統一管理，以確保最高等級的安全性。
                  </p>
                </div>
              }
              type="info"
              showIcon
              style={{ marginBottom: 16 }}
            />

            <Button
              type="primary"
              icon={<LockOutlined />}
              onClick={handleGoToKeycloak}
              block
            >
              前往 Keycloak 安全中心進行相關設定
            </Button>
          </Card>
        </div>
      )
    },
    {
      key: 'preferences',
      label: '偏好設定',
      icon: <SettingOutlined />,
      children: (
        <div style={{ paddingTop: 16 }}>
          <Card>
            <Form
              form={form}
              layout="vertical"
              onFinish={handlePreferencesSave}
              initialValues={{
                theme: themeMode,
                defaultPage: defaultPage,
                timezone: timezone,
                notifications: notificationEnabled,
              }}
            >
              <div style={{ marginBottom: 24 }}>
                <Title level={4} style={{ marginBottom: 8 }}>介面主題</Title>
                <Form.Item name="theme" label="主題模式">
                  <Select value={themeMode} onChange={setThemeMode}>
                    <Option value="dark">
                      <Space>
                        <div style={{ width: 16, height: 16, background: '#1890ff', borderRadius: 2 }} />
                        Dark
                      </Space>
                    </Option>
                    <Option value="light">
                      <Space>
                        <div style={{ width: 16, height: 16, background: '#fff', border: '1px solid #d9d9d9', borderRadius: 2 }} />
                        Default
                      </Space>
                    </Option>
                  </Select>
                </Form.Item>
              </div>

              <div style={{ marginBottom: 24 }}>
                <Title level={4} style={{ marginBottom: 8 }}>預設頁面</Title>
                <Form.Item name="defaultPage" label="登入後預設進入頁面">
                  <Select value={defaultPage} onChange={setDefaultPage}>
                    <Option value="dashboard">儀表板管理</Option>
                    <Option value="incidents">事件管理</Option>
                    <Option value="resources">資源管理</Option>
                    <Option value="analyzing">分析中心</Option>
                    <Option value="automation">自動化中心</Option>
                  </Select>
                </Form.Item>
              </div>

              <div style={{ marginBottom: 24 }}>
                <Title level={4} style={{ marginBottom: 8 }}>時區</Title>
                <Form.Item name="timezone" label="您的時區">
                  <Select value={timezone} onChange={setTimezone}>
                    <Option value="UTC">UTC</Option>
                    <Option value="Asia/Taipei">Asia/Taipei</Option>
                    <Option value="Asia/Shanghai">Asia/Shanghai</Option>
                    <Option value="America/New_York">America/New_York</Option>
                    <Option value="Europe/London">Europe/London</Option>
                  </Select>
                </Form.Item>
              </div>

              <div style={{ marginBottom: 24 }}>
                <Form.Item name="notifications" label="通知設定" valuePropName="checked">
                  <Switch
                    checked={notificationEnabled}
                    onChange={setNotificationEnabled}
                    checkedChildren="啟用"
                    unCheckedChildren="停用"
                  />
                  <Text type="secondary" style={{ marginLeft: 8 }}>
                    啟用後會收到系統通知和告警
                  </Text>
                </Form.Item>
              </div>

              <Divider />

              <div style={{ textAlign: 'right' }}>
                <Button type="primary" htmlType="submit">
                  儲存偏好設定
                </Button>
              </div>
            </Form>
          </Card>
        </div>
      )
    }
  ]

  return (
    <>
      <PageHeader
        title="個人資料與偏好設定"
        subtitle="管理您的個人資訊、密碼與通知偏好"
      />

      {/* KPI 卡片 */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 'var(--spacing-lg)',
          marginBottom: 'var(--spacing-2xl)',
        }}
      >
        {kpiData.map((item, index) => (
          <ContextualKPICard
            key={index}
            title={item.title}
            value={item.value}
            description={item.description}
            status={item.status}
          />
        ))}
      </div>

      {/* 設定標籤頁 */}
      <Tabs
        activeKey={activeTab}
        onChange={handleTabChange}
        items={tabItems}
      />
    </>
  )
}

export default ProfilePage