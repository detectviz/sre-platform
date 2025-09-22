import React, { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Typography, List, Space, Divider, Tabs } from 'antd'
import { PageHeader } from '../components/PageHeader'
import { ContextualKPICard } from '../components/ContextualKPICard'
import {
  TagsOutlined,
  MailOutlined,
  LockOutlined,
} from '@ant-design/icons'

const { Title, Text } = Typography

const PlatformSettingsPage: React.FC = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('tags')

  useEffect(() => {
    const path = location.pathname
    if (path === '/settings/platform/tags' || path.endsWith('/settings/platform/tags')) {
      setActiveTab('tags')
    } else if (path === '/settings/platform/email' || path.endsWith('/settings/platform/email')) {
      setActiveTab('email')
    } else if (path === '/settings/platform/auth' || path.endsWith('/settings/platform/auth')) {
      setActiveTab('auth')
    } else {
      setActiveTab('tags')
    }
  }, [location.pathname])

  const handleTabChange = (key: string) => {
    setActiveTab(key)
    switch (key) {
      case 'tags':
        navigate('/settings/platform/tags')
        break
      case 'email':
        navigate('/settings/platform/email')
        break
      case 'auth':
        navigate('/settings/platform/auth')
        break
      default:
        navigate('/settings/platform/tags')
    }
  }

  const kpiData = [
    {
      title: '標籤總數',
      value: '42',
      description: '38個啟用中',
      trend: '+2.4%',
      status: 'info' as const,
    },
    {
      title: '活躍會話',
      value: '156',
      description: '人員登入會話',
      trend: '+8.7%',
      status: 'info' as const,
    },
    {
      title: '配置異動',
      value: '7',
      description: '最後備份：2小時前',
      trend: '+40%',
      status: 'warning' as const,
    },
  ]

  const tabItems = [
    {
      key: 'tags',
      label: '標籤管理',
      icon: <TagsOutlined />,
      children: (
        <div style={{ padding: '24px' }}>
          <Space align="center" style={{ marginBottom: '16px' }}>
            <TagsOutlined style={{ fontSize: '18px' }} />
            <Title level={4} style={{ margin: 0, color: 'var(--text-primary)' }}>
              標籤管理
            </Title>
          </Space>
          <Text
            style={{
              color: 'var(--text-secondary)',
              fontSize: '14px',
              display: 'block',
              marginBottom: 'var(--spacing-lg)',
            }}
          >
            統一管理資源標籤和分類
          </Text>
          <Divider style={{ margin: 'var(--spacing-md) 0', borderColor: 'var(--border-light)' }} />
          <List
            size="small"
            dataSource={['標籤創建', '標籤編輯', '標籤刪除', '標籤批量操作', '標籤統計']}
            renderItem={(item) => (
              <List.Item
                style={{
                  padding: 'var(--spacing-sm) 0',
                  border: 'none',
                  color: 'var(--text-tertiary)',
                  fontSize: '12px',
                }}
              >
                <Space>
                  <div style={{
                    width: '4px',
                    height: '4px',
                    borderRadius: '50%',
                    background: 'var(--text-tertiary)',
                  }} />
                  {item}
                </Space>
              </List.Item>
            )}
          />
        </div>
      ),
    },
    {
      key: 'email',
      label: '郵件設定',
      icon: <MailOutlined />,
      children: (
        <div style={{ padding: '24px' }}>
          <Space align="center" style={{ marginBottom: '16px' }}>
            <MailOutlined style={{ fontSize: '18px' }} />
            <Title level={4} style={{ margin: 0, color: 'var(--text-primary)' }}>
              郵件設定
            </Title>
          </Space>
          <Text
            style={{
              color: 'var(--text-secondary)',
              fontSize: '14px',
              display: 'block',
              marginBottom: 'var(--spacing-lg)',
            }}
          >
            配置系統郵件服務和模板
          </Text>
          <Divider style={{ margin: 'var(--spacing-md) 0', borderColor: 'var(--border-light)' }} />
          <List
            size="small"
            dataSource={['SMTP 設定', '郵件模板', '發送測試', '黑白名單', '郵件統計']}
            renderItem={(item) => (
              <List.Item
                style={{
                  padding: 'var(--spacing-sm) 0',
                  border: 'none',
                  color: 'var(--text-tertiary)',
                  fontSize: '12px',
                }}
              >
                <Space>
                  <div style={{
                    width: '4px',
                    height: '4px',
                    borderRadius: '50%',
                    background: 'var(--text-tertiary)',
                  }} />
                  {item}
                </Space>
              </List.Item>
            )}
          />
        </div>
      ),
    },
    {
      key: 'auth',
      label: '身份驗證',
      icon: <LockOutlined />,
      children: (
        <div style={{ padding: '24px' }}>
          <Space align="center" style={{ marginBottom: '16px' }}>
            <LockOutlined style={{ fontSize: '18px' }} />
            <Title level={4} style={{ margin: 0, color: 'var(--text-primary)' }}>
              身份驗證
            </Title>
          </Space>
          <Text
            style={{
              color: 'var(--text-secondary)',
              fontSize: '14px',
              display: 'block',
              marginBottom: 'var(--spacing-lg)',
            }}
          >
            配置系統身份驗證和安全設定
          </Text>
          <Divider style={{ margin: 'var(--spacing-md) 0', borderColor: 'var(--border-light)' }} />
          <List
            size="small"
            dataSource={['SSO 設定', 'OAuth 配置', '2FA 設定', '密碼策略', '會話管理']}
            renderItem={(item) => (
              <List.Item
                style={{
                  padding: 'var(--spacing-sm) 0',
                  border: 'none',
                  color: 'var(--text-tertiary)',
                  fontSize: '12px',
                }}
              >
                <Space>
                  <div style={{
                    width: '4px',
                    height: '4px',
                    borderRadius: '50%',
                    background: 'var(--text-tertiary)',
                  }} />
                  {item}
                </Space>
              </List.Item>
            )}
          />
        </div>
      ),
    },
  ]

  return (
    <div>
      <PageHeader
        title="平台設定"
        subtitle="管理平台基本配置，包括標籤系統、郵件設定和身份驗證機制"
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
        items={tabItems}
      />
    </div>
  )
}

export default PlatformSettingsPage
