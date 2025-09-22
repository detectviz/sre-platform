import React from 'react'
import { Card, Typography, List, Space, Divider, Tabs } from 'antd'
import { PageHeader } from '../components/PageHeader'
import { ContextualKPICard } from '../components/ContextualKPICard'
import {
  UserOutlined,
  TeamOutlined,
  IdcardOutlined,
} from '@ant-design/icons'

const { Title, Text } = Typography
const { TabPane } = Tabs

const ProfilePage: React.FC = () => {
  const kpiData = [
    {
      title: '個人資料完整度',
      value: '85%',
      description: '個人資訊完成度',
      status: 'warning' as const,
    },
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

  const securityItems = [
    {
      label: '密碼強度',
      value: '強',
      status: 'success',
    },
    {
      label: '兩步驟驗證',
      value: '已啟用',
      status: 'success',
    },
    {
      label: '最近登入記錄',
      value: '3個活躍會話',
      status: 'info',
    },
    {
      label: '異常登入',
      value: '無',
      status: 'success',
    },
  ]

  const preferenceItems = [
    {
      label: '介面主題',
      value: '深色模式',
    },
    {
      label: '預設頁面',
      value: 'SRE 戰情室',
    },
    {
      label: '語言',
      value: '繁體中文',
    },
    {
      label: '時區',
      value: 'Asia/Taipei',
    },
    {
      label: '通知偏好',
      value: '郵件 + Slack',
    },
    {
      label: '顯示設定',
      value: '緊湊模式',
    },
  ]

  return (
    <div>
      <PageHeader
        title="個人資料與偏好設定"
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
        defaultActiveKey="1"
        size="small"
        style={{ background: 'var(--bg-elevated)', borderRadius: 'var(--radius-lg)' }}
      >
        <TabPane tab="個人資訊" key="1">
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
        </TabPane>

        <TabPane tab="密碼安全" key="2">
          <Card
            size="small"
            style={{
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border-light)',
            }}
          >
            <Title level={5} style={{ marginBottom: 'var(--spacing-lg)', color: 'var(--text-primary)' }}>
              安全設定
            </Title>

            <List
              dataSource={securityItems}
              renderItem={(item) => (
                <List.Item style={{ padding: 'var(--spacing-md) 0', border: 'none' }}>
                  <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                    <Text style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>
                      {item.label}
                    </Text>
                    <Text
                      style={{
                        color: item.status === 'success' ? 'var(--brand-success)' :
                          item.status === 'warning' ? 'var(--brand-warning)' :
                            'var(--text-primary)',
                        fontSize: '12px',
                      }}
                    >
                      {item.value}
                    </Text>
                  </Space>
                </List.Item>
              )}
            />

            <Divider style={{ margin: 'var(--spacing-lg) 0', borderColor: 'var(--border-light)' }} />

            <div style={{ textAlign: 'center', padding: 'var(--spacing-lg)' }}>
              <Text style={{ color: 'var(--text-secondary)' }}>
                🔐 安全設定由 Keycloak 管理
              </Text>
              <br />
              <Text
                type="secondary"
                style={{ fontSize: '12px', marginTop: 'var(--spacing-sm)' }}
              >
                密碼變更和 2FA 設定請前往 Keycloak
              </Text>
            </div>
          </Card>
        </TabPane>

        <TabPane tab="偏好設定" key="3">
          <Card
            size="small"
            style={{
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border-light)',
            }}
          >
            <Title level={5} style={{ marginBottom: 'var(--spacing-lg)', color: 'var(--text-primary)' }}>
              個人偏好
            </Title>

            <List
              dataSource={preferenceItems}
              renderItem={(item) => (
                <List.Item style={{ padding: 'var(--spacing-md) 0', border: 'none' }}>
                  <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                    <Text style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>
                      {item.label}
                    </Text>
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
                ⚙️ 偏好設定功能開發中
              </Text>
              <br />
              <Text
                type="secondary"
                style={{ fontSize: '12px', marginTop: 'var(--spacing-sm)' }}
              >
                即將支持個性化設定
              </Text>
            </div>
          </Card>
        </TabPane>
      </Tabs>
    </div>
  )
}

export default ProfilePage
