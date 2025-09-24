import React, { useState } from 'react'
import { useTabs } from '../hooks'
import { Typography, List, Space, Divider, Tabs, Alert, Button, Modal } from 'antd'
import { ContextualKPICard } from '../components/ContextualKPICard'
import {
  TagsOutlined,
  MailOutlined,
  LockOutlined,
  LayoutOutlined,
  EditOutlined,
  ArrowRightOutlined,
  ArrowLeftOutlined,
  UpOutlined,
  DownOutlined,
} from '@ant-design/icons'

const { Title, Text } = Typography

const PlatformSettingsPage: React.FC = () => {
  console.log('🔧 PlatformSettingsPage 組件已加載')
  console.log('🔧 當前 URL:', window.location.pathname)

  const { activeTab, handleTabChange } = useTabs('tags', {}, {
    tags: ['/settings/platform/tags', '/settings/platform'],
    email: ['/settings/platform/email', '/settings/platform'],
    auth: ['/settings/platform/auth', '/settings/platform'],
    layout: ['/settings/platform/layout', '/settings/platform'],
  })

  // 編輯模態框狀態
  const [editModalVisible, setEditModalVisible] = useState(false)
  const [editingPage, setEditingPage] = useState('')
  const [selectedWidgets, setSelectedWidgets] = useState<string[]>([])
  const [availableWidgets, setAvailableWidgets] = useState<string[]>([])

  // 模擬的可用 Widget 數據
  const allWidgets = [
    { key: 'incident_pending_count', title: '待處理告警', description: '顯示待處理事件數量' },
    { key: 'incident_in_progress', title: '處理中事件', description: '追蹤目前由工程師處理的事件數' },
    { key: 'incident_resolved_today', title: '今日已解決', description: '顯示今日已關閉事件數' },
    { key: 'resource_total_count', title: '總資源數', description: '顯示納管資源總量' },
    { key: 'resource_health_rate', title: '正常率', description: '顯示健康資源百分比' },
    { key: 'resource_alerting', title: '異常資源', description: '顯示異常或離線資源數' },
    { key: 'automation_runs_today', title: '今日自動化執行', description: '顯示今日觸發自動化任務數量' },
    { key: 'automation_success_rate', title: '成功率', description: '顯示自動化任務成功比例' },
    { key: 'automation_suppressed_alerts', title: '已抑制告警', description: '顯示因自動化而抑制的告警數' },
    { key: 'user_total_count', title: '總人員數', description: '顯示系統總用戶數量' },
    { key: 'user_online_count', title: '在線人員', description: '顯示當前在線用戶數' },
    { key: 'user_team_count', title: '團隊數量', description: '顯示系統中團隊總數' },
    { key: 'user_pending_invites', title: '待處理邀請', description: '顯示待處理的用戶邀請' },
  ]

  // 處理編輯按鈕點擊
  const handleEditClick = (pageName: string) => {
    console.log('編輯頁面:', pageName)
    setEditingPage(pageName)

    // 根據頁面名稱設置初始數據
    const pageWidgetMap: Record<string, string[]> = {
      '事件管理': ['incident_pending_count', 'incident_in_progress', 'incident_resolved_today'],
      '資源管理': ['resource_total_count', 'resource_health_rate', 'resource_alerting'],
      '自動化中心': ['automation_runs_today', 'automation_success_rate', 'automation_suppressed_alerts'],
      'SRE 戰情室': ['incident_pending_count', 'resource_health_rate', 'automation_runs_today'],
      '儀表板管理': ['resource_total_count', 'user_online_count', 'incident_resolved_today', 'resource_alerting'],
      '分析中心': ['incident_pending_count', 'resource_total_count', 'automation_runs_today'],
      '身份與存取管理': ['user_total_count', 'user_online_count', 'user_team_count', 'user_pending_invites'],
      '通知管理': ['incident_pending_count', 'automation_runs_today', 'user_total_count'],
      '平台設定': ['user_total_count', 'user_online_count', 'user_team_count'],
      '個人設定': ['user_total_count', 'user_online_count', 'user_pending_invites'],
    }

    const pageWidgets = pageWidgetMap[pageName] || []
    setSelectedWidgets(pageWidgets)
    setAvailableWidgets(allWidgets.filter(w => !pageWidgets.includes(w.key)).map(w => w.key))
    setEditModalVisible(true)
  }

  // 處理模態框取消
  const handleEditModalCancel = () => {
    setEditModalVisible(false)
    setEditingPage('')
    setSelectedWidgets([])
    setAvailableWidgets([])
  }

  // 處理模態框儲存
  const handleEditModalSave = () => {
    console.log('儲存頁面配置:', editingPage, selectedWidgets)
    // 這裡會調用 API 儲存配置
    // POST /settings/layouts { page_path, widgets, scope_type, scope_id }
    setEditModalVisible(false)
    setEditingPage('')
    setSelectedWidgets([])
    setAvailableWidgets([])
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
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--spacing-md)' }}>
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
                  <Button
                    type="link"
                    icon={<EditOutlined />}
                    size="small"
                    onClick={() => handleEditClick('個人設定')}
                  >
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
                  <Button
                    type="link"
                    icon={<EditOutlined />}
                    size="small"
                    onClick={() => handleEditClick('資源管理')}
                  >
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
                  <Button
                    type="link"
                    icon={<EditOutlined />}
                    size="small"
                    onClick={() => handleEditClick('自動化中心')}
                  >
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
                  <Button
                    type="link"
                    icon={<EditOutlined />}
                    size="small"
                    onClick={() => handleEditClick('儀表板管理')}
                  >
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
                  分析中心
                </Title>
                <Text style={{ color: 'var(--text-secondary)', fontSize: '12px', display: 'block', marginBottom: 'var(--spacing-sm)' }}>
                  當前顯示的卡片
                </Text>
                <List
                  size="small"
                  dataSource={[
                    '1. 容量規劃',
                    '2. 趨勢分析',
                    '3. 風險預測',
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
                  <Button
                    type="link"
                    icon={<EditOutlined />}
                    size="small"
                    onClick={() => handleEditClick('個人設定')}
                  >
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
                  身份與存取管理
                </Title>
                <Text style={{ color: 'var(--text-secondary)', fontSize: '12px', display: 'block', marginBottom: 'var(--spacing-sm)' }}>
                  當前顯示的卡片
                </Text>
                <List
                  size="small"
                  dataSource={[
                    '1. 總人員數',
                    '2. 在線人員',
                    '3. 團隊數量',
                    '4. 待處理邀請',
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
                  <Button
                    type="link"
                    icon={<EditOutlined />}
                    size="small"
                    onClick={() => handleEditClick('個人設定')}
                  >
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
                  通知管理
                </Title>
                <Text style={{ color: 'var(--text-secondary)', fontSize: '12px', display: 'block', marginBottom: 'var(--spacing-sm)' }}>
                  當前顯示的卡片
                </Text>
                <List
                  size="small"
                  dataSource={[
                    '1. 通知策略',
                    '2. 通知管道',
                    '3. 通知歷史',
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
                  <Button
                    type="link"
                    icon={<EditOutlined />}
                    size="small"
                    onClick={() => handleEditClick('個人設定')}
                  >
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
                  平台設定
                </Title>
                <Text style={{ color: 'var(--text-secondary)', fontSize: '12px', display: 'block', marginBottom: 'var(--spacing-sm)' }}>
                  當前顯示的卡片
                </Text>
                <List
                  size="small"
                  dataSource={[
                    '1. 標籤總數',
                    '2. 活躍會話',
                    '3. 配置異動',
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
                  個人設定
                </Title>
                <Text style={{ color: 'var(--text-secondary)', fontSize: '12px', display: 'block', marginBottom: 'var(--spacing-sm)' }}>
                  當前顯示的卡片
                </Text>
                <List
                  size="small"
                  dataSource={[
                    '1. 個人資訊',
                    '2. 偏好設定',
                    '3. 密碼安全',
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

  // 調試信息
  React.useEffect(() => {
    console.log('🔧 PlatformSettingsPage 渲染，當前標籤:', activeTab)
  }, [activeTab])

  return (
    <div style={{ padding: '20px', minHeight: '400px' }}>
      <div style={{ marginBottom: '20px' }}>
        <h1 style={{ color: 'var(--text-primary)', marginBottom: '8px' }}>平台設定</h1>
        <p style={{ color: 'var(--text-secondary)' }}>管理平台基本配置，包括標籤系統、郵件設定和身份驗證機制</p>
      </div>

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

      {/* 標籤頁面 */}
      <Tabs
        activeKey={activeTab}
        onChange={handleTabChange}
        items={tabItems}
      />

      {/* 編輯模態框 */}
      <Modal
        title={`編輯「${editingPage}」的指標卡片`}
        open={editModalVisible}
        onCancel={handleEditModalCancel}
        onOk={handleEditModalSave}
        width={720}
        okText="儲存"
        cancelText="取消"
      >
        <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
          <div style={{ flex: 1 }}>
            <h4>可用的小工具</h4>
            <div style={{
              border: '1px solid var(--border-light)',
              borderRadius: 'var(--radius-md)',
              height: '400px',
              overflow: 'auto',
              padding: '8px'
            }}>
              {allWidgets.filter(w => availableWidgets.includes(w.key)).map(widget => (
                <div
                  key={widget.key}
                  style={{
                    padding: '8px',
                    marginBottom: '4px',
                    background: 'var(--bg-elevated)',
                    borderRadius: 'var(--radius-sm)',
                    cursor: 'pointer'
                  }}
                  title={widget.description}
                >
                  <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>{widget.title}</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>{widget.description}</div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '8px' }}>
            <Button
              icon={<ArrowRightOutlined />}
              onClick={() => {
                if (availableWidgets.length > 0) {
                  const newWidget = availableWidgets[0]
                  setSelectedWidgets([...selectedWidgets, newWidget])
                  setAvailableWidgets(availableWidgets.filter(w => w !== newWidget))
                }
              }}
              disabled={availableWidgets.length === 0}
            />
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={() => {
                if (selectedWidgets.length > 0) {
                  const lastWidget = selectedWidgets[selectedWidgets.length - 1]
                  setSelectedWidgets(selectedWidgets.filter(w => w !== lastWidget))
                  setAvailableWidgets([...availableWidgets, lastWidget])
                }
              }}
              disabled={selectedWidgets.length === 0}
            />
          </div>

          <div style={{ flex: 1 }}>
            <h4>已顯示的小工具</h4>
            <div style={{
              border: '1px solid var(--border-light)',
              borderRadius: 'var(--radius-md)',
              height: '400px',
              overflow: 'auto',
              padding: '8px'
            }}>
              {selectedWidgets.map((widgetKey, index) => {
                const widget = allWidgets.find(w => w.key === widgetKey)
                return (
                  <div
                    key={widgetKey}
                    style={{
                      padding: '8px',
                      marginBottom: '4px',
                      background: 'var(--bg-elevated)',
                      borderRadius: 'var(--radius-sm)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>{widget?.title}</div>
                      <div style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>{widget?.description}</div>
                    </div>
                    <div style={{ display: 'flex', gap: '4px' }}>
                      <Button
                        type="text"
                        size="small"
                        icon={<UpOutlined />}
                        onClick={() => {
                          if (index > 0) {
                            const newSelected: string[] = [...selectedWidgets]
                            const temp = newSelected[index - 1]
                            newSelected[index - 1] = newSelected[index]
                            newSelected[index] = temp
                            setSelectedWidgets(newSelected)
                          }
                        }}
                        disabled={index === 0}
                      />
                      <Button
                        type="text"
                        size="small"
                        icon={<DownOutlined />}
                        onClick={() => {
                          if (index < selectedWidgets.length - 1) {
                            const newSelected: string[] = [...selectedWidgets]
                            const temp = newSelected[index]
                            newSelected[index] = newSelected[index + 1]
                            newSelected[index + 1] = temp
                            setSelectedWidgets(newSelected)
                          }
                        }}
                        disabled={index === selectedWidgets.length - 1}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default PlatformSettingsPage
