import React from 'react'
import { useTabs } from '../hooks'
import { Typography, List, Space, Divider, Tabs, Alert, Button } from 'antd'
import { PageHeader } from '../components/PageHeader'
import { ContextualKPICard } from '../components/ContextualKPICard'
import { PageLayout } from '../components/PageLayout'
import {
  TagsOutlined,
  MailOutlined,
  LockOutlined,
  LayoutOutlined,
  EditOutlined,
} from '@ant-design/icons'

const { Title, Text } = Typography

const PlatformSettingsPage: React.FC = () => {
  const { activeTab, handleTabChange } = useTabs('tags', {
    tags: '/settings/platform/tags',
    email: '/settings/platform/email',
    auth: '/settings/platform/auth',
    layout: '/settings/platform/layout',
  })

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
        <div style={{ padding: '16px' }}>
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
        <div style={{ padding: '16px' }}>
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
        <div style={{ padding: '16px' }}>
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
    {
      key: 'layout',
      label: '版面管理',
      icon: <LayoutOutlined />,
      children: (
        <div style={{ padding: '16px' }}>
          <Alert
            message="版面管理"
            description="調整各中樞頁面的指標卡片與順序，變更立即生效。"
            type="info"
            showIcon
            style={{ marginBottom: 'var(--spacing-lg)' }}
          />
          <div style={{ marginBottom: 'var(--spacing-lg)' }}>
            <Title level={5} style={{ color: 'var(--text-primary)', marginBottom: 'var(--spacing-md)' }}>
              可自訂頁面
            </Title>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-md)' }}>
              <div style={{
                background: 'var(--bg-elevated)',
                border: '1px solid var(--border-light)',
                borderRadius: 'var(--radius-md)',
                padding: 'var(--spacing-md)',
              }}>
                <Title level={5} style={{ margin: 0, marginBottom: 'var(--spacing-sm)' }}>
                  事件管理
                </Title>
                <Text style={{ color: 'var(--text-secondary)', fontSize: '12px', display: 'block', marginBottom: 'var(--spacing-sm)' }}>
                  當前顯示的卡片
                </Text>
                <List
                  size="small"
                  dataSource={[
                    '1. 待處理告警',
                    '2. 處理中事件',
                    '3. 今日已解決',
                  ]}
                  renderItem={(item) => (
                    <List.Item
                      style={{
                        padding: '4px 0',
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
                <div style={{ textAlign: 'right', marginTop: 'var(--spacing-sm)' }}>
                  <Button type="link" icon={<EditOutlined />} size="small">
                    編輯
                  </Button>
                </div>
              </div>

              <div style={{
                background: 'var(--bg-elevated)',
                border: '1px solid var(--border-light)',
                borderRadius: 'var(--radius-md)',
                padding: 'var(--spacing-md)',
              }}>
                <Title level={5} style={{ margin: 0, marginBottom: 'var(--spacing-sm)' }}>
                  資源管理
                </Title>
                <Text style={{ color: 'var(--text-secondary)', fontSize: '12px', display: 'block', marginBottom: 'var(--spacing-sm)' }}>
                  當前顯示的卡片
                </Text>
                <List
                  size="small"
                  dataSource={[
                    '1. 總資源數',
                    '2. 正常率',
                    '3. 異常資源',
                  ]}
                  renderItem={(item) => (
                    <List.Item
                      style={{
                        padding: '4px 0',
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
                <div style={{ textAlign: 'right', marginTop: 'var(--spacing-sm)' }}>
                  <Button type="link" icon={<EditOutlined />} size="small">
                    編輯
                  </Button>
                </div>
              </div>

              <div style={{
                background: 'var(--bg-elevated)',
                border: '1px solid var(--border-light)',
                borderRadius: 'var(--radius-md)',
                padding: 'var(--spacing-md)',
              }}>
                <Title level={5} style={{ margin: 0, marginBottom: 'var(--spacing-sm)' }}>
                  自動化中心
                </Title>
                <Text style={{ color: 'var(--text-secondary)', fontSize: '12px', display: 'block', marginBottom: 'var(--spacing-sm)' }}>
                  當前顯示的卡片
                </Text>
                <List
                  size="small"
                  dataSource={[
                    '1. 今日自動化執行',
                    '2. 成功率',
                    '3. 失敗告警轉自動化',
                  ]}
                  renderItem={(item) => (
                    <List.Item
                      style={{
                        padding: '4px 0',
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
                <div style={{ textAlign: 'right', marginTop: 'var(--spacing-sm)' }}>
                  <Button type="link" icon={<EditOutlined />} size="small">
                    編輯
                  </Button>
                </div>
              </div>

              <div style={{
                background: 'var(--bg-elevated)',
                border: '1px solid var(--border-light)',
                borderRadius: 'var(--radius-md)',
                padding: 'var(--spacing-md)',
              }}>
                <Title level={5} style={{ margin: 0, marginBottom: 'var(--spacing-sm)' }}>
                  儀表板管理
                </Title>
                <Text style={{ color: 'var(--text-secondary)', fontSize: '12px', display: 'block', marginBottom: 'var(--spacing-sm)' }}>
                  當前顯示的卡片
                </Text>
                <List
                  size="small"
                  dataSource={[
                    '1. 總儀表板數',
                    '2. 活躍用戶',
                    '3. SRE 戰情室',
                    '4. 基礎設施洞察',
                  ]}
                  renderItem={(item) => (
                    <List.Item
                      style={{
                        padding: '4px 0',
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
                <div style={{ textAlign: 'right', marginTop: 'var(--spacing-sm)' }}>
                  <Button type="link" icon={<EditOutlined />} size="small">
                    編輯
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      ),
    },
  ]

  return (
    <PageLayout
      header={
        <PageHeader
          title="平台設定"
          subtitle="管理平台基本配置，包括標籤系統、郵件設定和身份驗證機制"
        />
      }
      kpiCards={
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: 'var(--spacing-lg)',
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
      }
      tabs={
        <Tabs
          activeKey={activeTab}
          onChange={handleTabChange}
          items={tabItems}
        />
      }
    />
  )
}

export default PlatformSettingsPage
