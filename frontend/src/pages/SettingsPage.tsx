import React from 'react'
import { Card, Typography, List, Space, Divider } from 'antd'
import { PageHeader } from '../components/PageHeader'
import { ContextualKPICard } from '../components/ContextualKPICard'
import {
  UserOutlined,
  BellOutlined,
  SettingOutlined,
} from '@ant-design/icons'

const { Title, Text } = Typography

const SettingsPage: React.FC = () => {
  const kpiData = [
    {
      title: '標籤總數',
      value: '12',
      description: '涵蓋各類資源標籤',
      status: 'info' as const,
    },
    {
      title: '活躍會話',
      value: '23',
      description: '當前活躍用戶會話',
      status: 'info' as const,
    },
    {
      title: '配置異動',
      value: '5',
      description: '本月配置變更次數',
      status: 'warning' as const,
    },
    {
      title: '通知管道',
      value: '5',
      description: '包含 Email、Slack、Webhook 等',
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

  const settingsModules = [
    {
      title: '身份與存取管理',
      description: '管理用戶、團隊、角色和審計日誌',
      icon: <UserOutlined style={{ fontSize: '24px', color: 'var(--brand-primary)' }} />,
      items: [
        '人員管理 - 添加、編輯、禁用人員帳戶',
        '團隊管理 - 組織結構和權限分配',
        '角色管理 - 系統角色和權限配置',
        '審計日誌 - 操作行為和安全審計',
      ],
    },
    {
      title: '通知管理',
      description: '配置通知策略、管道和歷史記錄',
      icon: <BellOutlined style={{ fontSize: '24px', color: 'var(--brand-warning)' }} />,
      items: [
        '通知策略 - 事件觸發通知規則',
        '通知管道 - Email、Slack、Webhook 等配置',
        '通知歷史 - 發送記錄查詢和詳情',
      ],
    },
    {
      title: '平台設定',
      description: '系統全域配置和基礎設定',
      icon: <SettingOutlined style={{ fontSize: '24px', color: 'var(--brand-info)' }} />,
      items: [
        '標籤管理 - 全平台標籤類型管理',
        '郵件設定 - SMTP 伺服器配置',
        '身份驗證 - OIDC 認證設定',
      ],
    },
  ]

  return (
    <div>
      <PageHeader
        title="設定"
        subtitle="系統全域配置管理"
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

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
          gap: 'var(--spacing-lg)',
        }}
      >
        {settingsModules.map((module, index) => (
          <Card
            key={index}
            size="small"
            style={{
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border-light)',
            }}
          >
            <div style={{ marginBottom: 'var(--spacing-lg)' }}>
              <Space align="center">
                {module.icon}
                <Title level={4} style={{ margin: 0, color: 'var(--text-primary)' }}>
                  {module.title}
                </Title>
              </Space>
            </div>

            <Text
              style={{
                color: 'var(--text-secondary)',
                fontSize: '14px',
                display: 'block',
                marginBottom: 'var(--spacing-lg)',
              }}
            >
              {module.description}
            </Text>

            <Divider style={{ margin: 'var(--spacing-md) 0', borderColor: 'var(--border-light)' }} />

            <List
              size="small"
              dataSource={module.items}
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
                      backgroundColor: 'var(--brand-primary)',
                      borderRadius: '50%',
                    }} />
                    {item}
                  </Space>
                </List.Item>
              )}
            />
          </Card>
        ))}
      </div>

      <Card
        size="small"
        style={{
          background: 'var(--bg-elevated)',
          border: '1px solid var(--border-light)',
          marginTop: 'var(--spacing-xl)',
        }}
      >
        <div style={{ textAlign: 'center', padding: 'var(--spacing-2xl)' }}>
          <Text style={{ color: 'var(--text-secondary)' }}>
            🔧 設定模組詳情頁面
          </Text>
          <br />
          <Text
            type="secondary"
            style={{ fontSize: '12px', marginTop: 'var(--spacing-sm)' }}
          >
            點擊上方模組卡片進入詳細配置頁面
          </Text>
        </div>
      </Card>
    </div>
  )
}

export default SettingsPage
