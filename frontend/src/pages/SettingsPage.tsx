import React from 'react'
import { Typography, Row, Col, Card, List, Space } from 'antd'
import { PageHeader } from '../components/PageHeader'
import { ContextualKPICard } from '../components/ContextualKPICard'
import {
  UserOutlined,
  BellOutlined,
  SettingOutlined,
  LockOutlined,
} from '@ant-design/icons'

const { Title, Text } = Typography

const SettingsPage: React.FC = () => {
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

  const settingCategories = [
    {
      key: 'identity',
      title: '身份與存取管理',
      description: '統一管理身份認證、存取權限和組織架構配置',
      icon: <UserOutlined />,
      color: '#1890ff',
      path: '/settings/identity/users',
    },
    {
      key: 'notifications',
      title: '通知管理',
      description: '配置通知策略和訊息傳送管道，確保關鍵資訊及時傳達',
      icon: <BellOutlined />,
      color: '#52c41a',
      path: '/settings/notifications/strategies',
    },
    {
      key: 'platform',
      title: '平台設定',
      description: '管理平台基本配置，包括標籤系統、郵件設定和身份驗證機制',
      icon: <SettingOutlined />,
      color: '#faad14',
      path: '/settings/platform',
    },
    {
      key: 'profile',
      title: '個人設定',
      description: '提供用戶個人資訊管理、偏好設定和安全配置功能',
      icon: <LockOutlined />,
      color: '#13c2c2',
      path: '/profile',
    },
  ]

  const handleCategoryClick = (path: string) => {
    window.location.href = path
  }

  return (
    <div>
      <PageHeader
        title="設定"
        subtitle="管理平台基本配置，包括標籤系統、郵件設定和身份驗證機制"
      />

      {/* KPI 統計卡片 */}
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

      {/* 設定分類 */}
      <Card
        title="設定分類"
        style={{
          background: 'var(--bg-elevated)',
          border: '1px solid var(--border-light)',
          borderRadius: 'var(--radius-lg)',
        }}
      >
        <Row gutter={[16, 16]}>
          {settingCategories.map((category) => (
            <Col xs={24} sm={12} lg={6} key={category.key}>
              <Card
                hoverable
                size="small"
                style={{
                  cursor: 'pointer',
                  height: '100%',
                  border: '1px solid var(--border-light)',
                }}
                onClick={() => handleCategoryClick(category.path)}
              >
                <div style={{ textAlign: 'center' }}>
                  <div
                    style={{
                      fontSize: '24px',
                      color: category.color,
                      marginBottom: 'var(--spacing-sm)',
                    }}
                  >
                    {category.icon}
                  </div>
                  <Title level={5} style={{ margin: '0 0 var(--spacing-sm) 0' }}>
                    {category.title}
                  </Title>
                  <Text
                    style={{
                      color: 'var(--text-secondary)',
                      fontSize: '12px',
                      lineHeight: '1.4',
                    }}
                  >
                    {category.description}
                  </Text>
                </div>
              </Card>
            </Col>
          ))}
        </Row>
      </Card>

      {/* 快速操作 */}
      <Card
        title="快速操作"
        style={{
          marginTop: 'var(--spacing-lg)',
          background: 'var(--bg-elevated)',
          border: '1px solid var(--border-light)',
          borderRadius: 'var(--radius-lg)',
        }}
      >
        <List
          size="small"
          dataSource={[
            '查看系統日誌',
            '匯出配置',
            '系統健康檢查',
            '清除緩存',
          ]}
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
      </Card>
    </div>
  )
}

export default SettingsPage
