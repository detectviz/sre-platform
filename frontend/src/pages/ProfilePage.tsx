import React, { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { Card, Typography, List, Space, Divider, Tabs, Button, Input, Form, message, Select, Switch } from 'antd'
import { PageHeader } from '../components/PageHeader'
import { ContextualKPICard } from '../components/ContextualKPICard'
import {
  UserOutlined,
  TeamOutlined,
  IdcardOutlined,
  CheckOutlined,
  KeyOutlined,
  SafetyOutlined,
  BgColorsOutlined,
  GlobalOutlined,
  BellOutlined,
  LayoutOutlined,
} from '@ant-design/icons'

const { Title, Text } = Typography
const { Item } = Form
const { Option } = Select

const ProfilePage: React.FC = () => {
  const location = useLocation()
  const [activeTab, setActiveTab] = useState('personal')

  useEffect(() => {
    const path = location.pathname
    if (path === '/profile' || path === '/profile/personal') {
      setActiveTab('personal')
    } else if (path === '/profile/security') {
      setActiveTab('security')
    } else if (path === '/profile/preferences') {
      setActiveTab('preferences')
    } else {
      setActiveTab('personal')
    }
  }, [location.pathname])

  const handleTabChange = (key: string) => {
    setActiveTab(key)
  }

  // 密碼安全相關狀態
  const handlePasswordUpdate = () => {
    message.success('密碼更新成功')
  }

  // 偏好設定相關狀態
  const [theme, setTheme] = useState('dark')
  const [language, setLanguage] = useState('zh-tw')
  const [timezone, setTimezone] = useState('Asia/Taipei')
  const [notifications, setNotifications] = useState(true)
  const [compactMode, setCompactMode] = useState(false)
  const [defaultPage, setDefaultPage] = useState('dashboard')

  const handleSavePreferences = () => {
    message.success('偏好設定已保存')
  }

  const handleResetPreferences = () => {
    setTheme('dark')
    setLanguage('zh-tw')
    setTimezone('Asia/Taipei')
    setNotifications(true)
    setCompactMode(false)
    setDefaultPage('dashboard')
    message.success('偏好設定已重置')
  }

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
      title: '角色數量',
      value: '3個',
      description: '擁有的系統角色',
      status: 'info' as const,
    },
    {
      title: '總人員數',
      value: '156',
      description: '142 個啟用中',
      trend: '+5.2%',
      status: 'success' as const,
    },
  ]

  const profileItems = [
    {
      label: '使用者名稱',
      value: 'john.doe',
      icon: <UserOutlined />,
    },
    {
      label: '顯示名稱',
      value: 'John Doe',
      icon: <IdcardOutlined />,
    },
    {
      label: '電子郵件',
      value: 'john.doe@company.com',
      icon: <UserOutlined />,
    },
    {
      label: '所屬團隊',
      value: 'SRE 團隊, 開發團隊',
      icon: <TeamOutlined />,
    },
    {
      label: '角色',
      value: 'SRE 工程師, 開發者',
      icon: <UserOutlined />,
    },
    {
      label: '最後登入',
      value: '2024-01-15 10:30:00',
      icon: <UserOutlined />,
    },
  ]

  return (
    <div>
      <PageHeader
        title="個人設定"
        subtitle="管理個人資訊和個性化設定"
      />

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
            trend={item.trend}
            status={item.status}
          />
        ))}
      </div>

      <Tabs
        activeKey={activeTab}
        onChange={handleTabChange}
        items={[
          {
            key: 'preferences',
            label: '偏好設定',
            icon: <TeamOutlined />,
            children: (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-xl)' }}>
                {/* 介面設定區域 */}
                <Card
                  size="small"
                  style={{
                    background: 'var(--bg-elevated)',
                    border: '1px solid var(--border-light)',
                  }}
                >
                  <Title level={5} style={{ marginBottom: 'var(--spacing-lg)', color: 'var(--text-primary)' }}>
                    <BgColorsOutlined style={{ marginRight: '8px' }} />
                    介面設定
                  </Title>

                  <List
                    dataSource={[
                      {
                        label: '主題模式',
                        value: (
                          <Select
                            value={theme}
                            onChange={setTheme}
                            style={{ width: 120 }}
                            size="small"
                          >
                            <Option value="dark">深色模式</Option>
                            <Option value="light">淺色模式</Option>
                          </Select>
                        ),
                        icon: <BgColorsOutlined />,
                      },
                      {
                        label: '語言',
                        value: (
                          <Select
                            value={language}
                            onChange={setLanguage}
                            style={{ width: 120 }}
                            size="small"
                          >
                            <Option value="zh-tw">繁體中文</Option>
                            <Option value="zh-cn">簡體中文</Option>
                            <Option value="en-us">English</Option>
                          </Select>
                        ),
                        icon: <GlobalOutlined />,
                      },
                      {
                        label: '時區',
                        value: (
                          <Select
                            value={timezone}
                            onChange={setTimezone}
                            style={{ width: 140 }}
                            size="small"
                          >
                            <Option value="Asia/Taipei">Asia/Taipei</Option>
                            <Option value="Asia/Shanghai">Asia/Shanghai</Option>
                            <Option value="America/New_York">America/New_York</Option>
                          </Select>
                        ),
                        icon: <GlobalOutlined />,
                      },
                      {
                        label: '緊湊模式',
                        value: (
                          <Switch
                            checked={compactMode}
                            onChange={setCompactMode}
                            size="small"
                          />
                        ),
                        icon: <LayoutOutlined />,
                      },
                    ]}
                    renderItem={(item) => (
                      <List.Item style={{ padding: 'var(--spacing-md) 0', border: 'none' }}>
                        <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                          <Space>
                            <div style={{ color: 'var(--text-tertiary)', fontSize: '14px' }}>
                              {item.icon}
                            </div>
                            <Text style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
                              {item.label}
                            </Text>
                          </Space>
                          {item.value}
                        </Space>
                      </List.Item>
                    )}
                  />
                </Card>

                {/* 功能設定區域 */}
                <Card
                  size="small"
                  style={{
                    background: 'var(--bg-elevated)',
                    border: '1px solid var(--border-light)',
                  }}
                >
                  <Title level={5} style={{ marginBottom: 'var(--spacing-lg)', color: 'var(--text-primary)' }}>
                    <BellOutlined style={{ marginRight: '8px' }} />
                    功能設定
                  </Title>

                  <List
                    dataSource={[
                      {
                        label: '通知設定',
                        value: (
                          <Switch
                            checked={notifications}
                            onChange={setNotifications}
                            size="small"
                          />
                        ),
                        icon: <BellOutlined />,
                      },
                      {
                        label: '預設頁面',
                        value: (
                          <Select
                            value={defaultPage}
                            onChange={setDefaultPage}
                            style={{ width: 140 }}
                            size="small"
                          >
                            <Option value="dashboard">儀表板管理</Option>
                            <Option value="incidents">事件管理</Option>
                            <Option value="resources">資源管理</Option>
                            <Option value="analyzing">分析中心</Option>
                          </Select>
                        ),
                        icon: <UserOutlined />,
                      },
                    ]}
                    renderItem={(item) => (
                      <List.Item style={{ padding: 'var(--spacing-md) 0', border: 'none' }}>
                        <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                          <Space>
                            <div style={{ color: 'var(--text-tertiary)', fontSize: '14px' }}>
                              {item.icon}
                            </div>
                            <Text style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
                              {item.label}
                            </Text>
                          </Space>
                          {item.value}
                        </Space>
                      </List.Item>
                    )}
                  />

                  <Divider style={{ margin: 'var(--spacing-lg) 0', borderColor: 'var(--border-light)' }} />

                  <div style={{ textAlign: 'center', padding: 'var(--spacing-md)' }}>
                    <Space>
                      <Button type="primary" onClick={handleSavePreferences}>
                        保存設定
                      </Button>
                      <Button onClick={handleResetPreferences}>
                        重置為預設值
                      </Button>
                    </Space>
                  </div>
                </Card>
              </div>
            ),
          },
          {
            key: 'personal',
            label: '個人資訊',
            icon: <UserOutlined />,
            children: (
              <Card
                size="small"
                style={{
                  background: 'var(--bg-elevated)',
                  border: '1px solid var(--border-light)',
                }}
              >
                <Title level={5} style={{ marginBottom: 'var(--spacing-lg)', color: 'var(--text-primary)' }}>
                  基本資料
                </Title>

                <List
                  dataSource={profileItems}
                  renderItem={(item) => (
                    <List.Item style={{ padding: 'var(--spacing-md) 0', border: 'none' }}>
                      <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                        <Space>
                          <div style={{ color: 'var(--text-tertiary)', fontSize: '12px' }}>
                            {item.icon}
                          </div>
                          <Text style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>
                            {item.label}
                          </Text>
                        </Space>
                        <Text style={{ color: 'var(--text-primary)', fontSize: '12px' }}>
                          {item.value}
                        </Text>
                      </Space>
                    </List.Item>
                  )}
                />

                <Divider style={{ margin: 'var(--spacing-lg) 0', borderColor: 'var(--border-light)' }} />

                <div style={{ textAlign: 'center', padding: 'var(--spacing-lg)' }}>
                  <Text style={{ color: 'var(--text-secondary)' }}>
                    🔗 由 Keycloak 統一管理
                  </Text>
                  <br />
                  <Text
                    type="secondary"
                    style={{ fontSize: '12px', marginTop: 'var(--spacing-sm)' }}
                  >
                    詳細設定請前往 Keycloak 管理界面
                  </Text>
                </div>
              </Card>
            ),
          },
          {
            key: 'security',
            label: '密碼安全',
            icon: <IdcardOutlined />,
            children: (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-xl)' }}>
                {/* 密碼變更區域 */}
                <Card
                  size="small"
                  style={{
                    background: 'var(--bg-elevated)',
                    border: '1px solid var(--border-light)',
                  }}
                >
                  <Title level={5} style={{ marginBottom: 'var(--spacing-lg)', color: 'var(--text-primary)' }}>
                    <CheckOutlined style={{ marginRight: '8px' }} />
                    密碼變更
                  </Title>

                  <Form layout="vertical">
                    <Item label="當前密碼">
                      <Input.Password
                        placeholder="請輸入當前密碼"
                        style={{ background: 'var(--bg-container)', borderColor: 'var(--border-color)' }}
                      />
                    </Item>
                    <Item label="新密碼">
                      <Input.Password
                        placeholder="請輸入新密碼"
                        style={{ background: 'var(--bg-container)', borderColor: 'var(--border-color)' }}
                      />
                    </Item>
                    <Item label="確認新密碼">
                      <Input.Password
                        placeholder="請再次輸入新密碼"
                        style={{ background: 'var(--bg-container)', borderColor: 'var(--border-color)' }}
                      />
                    </Item>

                    <Divider style={{ margin: 'var(--spacing-lg) 0', borderColor: 'var(--border-light)' }} />

                    <div style={{ textAlign: 'center' }}>
                      <Button type="primary" onClick={handlePasswordUpdate}>
                        更新密碼
                      </Button>
                    </div>
                  </Form>
                </Card>

                {/* 安全設定區域 */}
                <Card
                  size="small"
                  style={{
                    background: 'var(--bg-elevated)',
                    border: '1px solid var(--border-light)',
                  }}
                >
                  <Title level={5} style={{ marginBottom: 'var(--spacing-lg)', color: 'var(--text-primary)' }}>
                    <CheckOutlined style={{ marginRight: '8px' }} />
                    安全設定
                  </Title>

                  <List
                    dataSource={[
                      {
                        label: '密碼強度',
                        value: '強',
                        status: 'success' as const,
                        icon: <CheckOutlined />,
                      },
                      {
                        label: '兩步驟驗證',
                        value: '已啟用 (Authenticator App)',
                        status: 'success' as const,
                        icon: <KeyOutlined />,
                      },
                      {
                        label: '最近登入記錄',
                        value: '3個活躍會話',
                        status: 'info' as const,
                        icon: <SafetyOutlined />,
                      },
                      {
                        label: '異常登入嘗試',
                        value: '無 (最近 30 天)',
                        status: 'success' as const,
                        icon: <CheckOutlined />,
                      },
                      {
                        label: '密碼更新時間',
                        value: '30 天前',
                        status: 'warning' as const,
                        icon: <SafetyOutlined />,
                      },
                    ]}
                    renderItem={(item) => (
                      <List.Item style={{ padding: 'var(--spacing-md) 0', border: 'none' }}>
                        <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                          <Space>
                            <div style={{ color: 'var(--text-tertiary)', fontSize: '14px' }}>
                              {item.icon}
                            </div>
                            <Text style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
                              {item.label}
                            </Text>
                          </Space>
                          <Text
                            style={{
                              color: item.status === 'success' ? 'var(--brand-success)' :
                                item.status === 'warning' ? 'var(--brand-warning)' :
                                  'var(--text-primary)',
                              fontSize: '14px',
                            }}
                          >
                            {item.value}
                          </Text>
                        </Space>
                      </List.Item>
                    )}
                  />

                  <Divider style={{ margin: 'var(--spacing-lg) 0', borderColor: 'var(--border-light)' }} />

                  <div style={{ textAlign: 'center', padding: 'var(--spacing-md)' }}>
                    <Text style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
                      🔐 安全設定由 Keycloak 管理
                    </Text>
                    <br />
                    <Text
                      type="secondary"
                      style={{ fontSize: '12px', marginTop: 'var(--spacing-sm)' }}
                    >
                      密碼變更和 2FA 設定請前往 Keycloak 管理界面
                    </Text>
                  </div>
                </Card>
              </div>
            ),
          },
        ]}
      />
    </div>
  )
}

export default ProfilePage