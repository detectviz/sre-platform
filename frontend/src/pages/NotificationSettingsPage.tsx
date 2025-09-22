import React, { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Typography, List, Space, Divider, Tabs } from 'antd'
import { PageHeader } from '../components/PageHeader'
import { ContextualKPICard } from '../components/ContextualKPICard'
import {
  BellOutlined,
} from '@ant-design/icons'

const { Title, Text } = Typography

const NotificationSettingsPage: React.FC = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('strategies')

  useEffect(() => {
    const path = location.pathname
    if (path === '/settings/notifications/strategies' || path.endsWith('/settings/notifications/strategies')) {
      setActiveTab('strategies')
    } else if (path === '/settings/notifications/channels' || path.endsWith('/settings/notifications/channels')) {
      setActiveTab('channels')
    } else if (path === '/settings/notifications/history' || path.endsWith('/settings/notifications/history')) {
      setActiveTab('history')
    } else {
      setActiveTab('strategies')
    }
  }, [location.pathname])

  const handleTabChange = (key: string) => {
    setActiveTab(key)
    switch (key) {
      case 'strategies':
        navigate('/settings/notifications/strategies')
        break
      case 'channels':
        navigate('/settings/notifications/channels')
        break
      case 'history':
        navigate('/settings/notifications/history')
        break
      default:
        navigate('/settings/notifications/strategies')
    }
  }

  const kpiData = [
    {
      title: '通知管道',
      value: '6/8',
      description: '已啟用的通知管道',
      trend: 'stable',
      status: 'info' as const,
    },
    {
      title: '今日通知量',
      value: '47',
      description: '2則發送失敗',
      trend: 'up',
      status: 'info' as const,
    },
    {
      title: '送達率',
      value: '97.3%',
      description: '平均回應時間1.2s',
      trend: 'up',
      status: 'success' as const,
    },
  ]

  const tabItems = [
    {
      key: 'strategies',
      label: '通知策略',
      icon: <BellOutlined />,
      children: (
        <div style={{ padding: '24px' }}>
          <Space align="center" style={{ marginBottom: '16px' }}>
            <BellOutlined style={{ fontSize: '18px' }} />
            <Title level={4} style={{ margin: 0, color: 'var(--text-primary)' }}>
              通知策略
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
            配置告警觸發條件和規則
          </Text>
          <Divider style={{ margin: 'var(--spacing-md) 0', borderColor: 'var(--border-light)' }} />
          <List
            size="small"
            dataSource={['策略規則', '觸發條件', '抑制規則', '路由規則', '策略測試']}
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
      key: 'channels',
      label: '通知管道',
      icon: <BellOutlined />,
      children: (
        <div style={{ padding: '24px' }}>
          <Space align="center" style={{ marginBottom: '16px' }}>
            <BellOutlined style={{ fontSize: '18px' }} />
            <Title level={4} style={{ margin: 0, color: 'var(--text-primary)' }}>
              通知管道
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
            管理通知發送管道和配置
          </Text>
          <Divider style={{ margin: 'var(--spacing-md) 0', borderColor: 'var(--border-light)' }} />
          <List
            size="small"
            dataSource={['Email 設定', 'Slack 整合', 'Webhook 設定', 'SMS 配置', '推送設定']}
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
      key: 'history',
      label: '通知歷史',
      icon: <BellOutlined />,
      children: (
        <div style={{ padding: '24px' }}>
          <Space align="center" style={{ marginBottom: '16px' }}>
            <BellOutlined style={{ fontSize: '18px' }} />
            <Title level={4} style={{ margin: 0, color: 'var(--text-primary)' }}>
              通知歷史
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
            查看通知發送記錄和統計
          </Text>
          <Divider style={{ margin: 'var(--spacing-md) 0', borderColor: 'var(--border-light)' }} />
          <List
            size="small"
            dataSource={['發送記錄', '成功率統計', '失敗重試', '接收統計', '通知模板']}
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
        title="通知管理"
        subtitle="提供統一的通知策略配置、管道管理和歷史記錄查詢功能"
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

export default NotificationSettingsPage
