import React, { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Typography, List, Space, Divider, Tabs } from 'antd'
import { PageHeader } from '../components/PageHeader'
import { ContextualKPICard } from '../components/ContextualKPICard'
import {
  UserOutlined,
  TeamOutlined,
  IdcardOutlined,
  AuditOutlined,
} from '@ant-design/icons'

const { Title, Text } = Typography

const IdentitySettingsPage: React.FC = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('users')

  useEffect(() => {
    const path = location.pathname
    if (path === '/settings/identity/users' || path.endsWith('/settings/identity/users')) {
      setActiveTab('users')
    } else if (path === '/settings/identity/teams' || path.endsWith('/settings/identity/teams')) {
      setActiveTab('teams')
    } else if (path === '/settings/identity/roles' || path.endsWith('/settings/identity/roles')) {
      setActiveTab('roles')
    } else if (path === '/settings/identity/audit' || path.endsWith('/settings/identity/audit')) {
      setActiveTab('audit')
    } else {
      setActiveTab('users')
    }
  }, [location.pathname])

  const handleTabChange = (key: string) => {
    setActiveTab(key)
    switch (key) {
      case 'users':
        navigate('/settings/identity/users')
        break
      case 'teams':
        navigate('/settings/identity/teams')
        break
      case 'roles':
        navigate('/settings/identity/roles')
        break
      case 'audit':
        navigate('/settings/identity/audit')
        break
      default:
        navigate('/settings/identity/users')
    }
  }

  const kpiData = [
    {
      title: '總人員數',
      value: '156',
      description: '142 個啟用中',
      trend: '+5.2%',
      status: 'success' as const,
    },
    {
      title: '在線人員',
      value: '89',
      description: '目前活躍人員',
      trend: '+12.1%',
      status: 'success' as const,
    },
    {
      title: '團隊數量',
      value: '12',
      description: '組織架構構造',
      trend: '0%',
      status: 'info' as const,
    },
    {
      title: '待處理邀請',
      value: '5',
      description: '需要跟進處理',
      trend: '+25%',
      status: 'warning' as const,
    },
  ]

  const tabItems = [
    {
      key: 'users',
      label: '人員管理',
      icon: <UserOutlined />,
      children: (
        <div style={{ padding: '24px' }}>
          <Space align="center" style={{ marginBottom: '16px' }}>
            <UserOutlined style={{ fontSize: '18px' }} />
            <Title level={4} style={{ margin: 0, color: 'var(--text-primary)' }}>
              人員管理
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
            管理系統用戶帳戶和權限
          </Text>
          <Divider style={{ margin: 'var(--spacing-md) 0', borderColor: 'var(--border-light)' }} />
          <List
            size="small"
            dataSource={['新增用戶', '編輯用戶', '禁用用戶', '重置密碼', '用戶群組']}
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
      key: 'teams',
      label: '團隊管理',
      icon: <TeamOutlined />,
      children: (
        <div style={{ padding: '24px' }}>
          <Space align="center" style={{ marginBottom: '16px' }}>
            <TeamOutlined style={{ fontSize: '18px' }} />
            <Title level={4} style={{ margin: 0, color: 'var(--text-primary)' }}>
              團隊管理
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
            組織團隊結構和權限分組
          </Text>
          <Divider style={{ margin: 'var(--spacing-md) 0', borderColor: 'var(--border-light)' }} />
          <List
            size="small"
            dataSource={['創建團隊', '團隊成員', '團隊權限', '團隊層級', '團隊統計']}
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
      key: 'roles',
      label: '角色管理',
      icon: <IdcardOutlined />,
      children: (
        <div style={{ padding: '24px' }}>
          <Space align="center" style={{ marginBottom: '16px' }}>
            <IdcardOutlined style={{ fontSize: '18px' }} />
            <Title level={4} style={{ margin: 0, color: 'var(--text-primary)' }}>
              角色管理
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
            定義系統角色和權限矩陣
          </Text>
          <Divider style={{ margin: 'var(--spacing-md) 0', borderColor: 'var(--border-light)' }} />
          <List
            size="small"
            dataSource={['角色定義', '權限配置', '角色分配', '權限審核', '角色模板']}
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
      key: 'audit',
      label: '審計日誌',
      icon: <AuditOutlined />,
      children: (
        <div style={{ padding: '24px' }}>
          <Space align="center" style={{ marginBottom: '16px' }}>
            <AuditOutlined style={{ fontSize: '18px' }} />
            <Title level={4} style={{ margin: 0, color: 'var(--text-primary)' }}>
              審計日誌
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
            記錄系統操作和安全事件
          </Text>
          <Divider style={{ margin: 'var(--spacing-md) 0', borderColor: 'var(--border-light)' }} />
          <List
            size="small"
            dataSource={['操作記錄', '安全事件', '登錄記錄', '權限變更', '系統警報']}
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
        title="身份與存取管理"
        subtitle="統一管理身份認證、存取權限和組織架構配置"
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

export default IdentitySettingsPage
