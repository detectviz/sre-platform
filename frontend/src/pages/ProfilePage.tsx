import React from 'react'
import { useTabs } from '../hooks'
import { Tabs } from 'antd'
import { PageHeader } from '../components/PageHeader'
import { ContextualKPICard } from '../components/ContextualKPICard'
import { PersonalInfoForm } from '../components/profile/PersonalInfoForm'
import { SecuritySettings } from '../components/profile/SecuritySettings'
import { PreferencesSettings } from '../components/profile/PreferencesSettings'
import {
  UserOutlined,
  SafetyOutlined,
  SettingOutlined,
} from '@ant-design/icons'


const ProfilePage: React.FC = () => {
  const { activeTab, handleTabChange } = useTabs('personal', {
    personal: '/profile/personal',
    security: '/profile/security',
    preferences: '/profile/preferences',
  })

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

  // 個人資料初始值
  const personalInfoInitialValues = {
    name: '張小明',
    email: 'ming.zhang@company.com',
    position: 'sre',
    department: 'engineering',
    phone: '+886-912-345-678'
  }

  // 偏好設定初始值
  const preferencesInitialValues = {
    theme: 'dark',
    primaryColor: 'blue',
    compactMode: false,
    language: 'zh-TW',
    timezone: 'Asia/Taipei',
    dateFormat: 'YYYY/MM/DD',
    defaultPage: '/',
    refreshInterval: 60,
    autoSaveLayout: true
  }

  // 處理個人資料保存
  const handlePersonalInfoSave = (values: Record<string, any>) => {
    console.log('保存個人資料:', values)
    // 實際保存邏輯
  }

  // 處理密碼變更
  const handlePasswordChange = (oldPassword: string, newPassword: string) => {
    console.log('變更密碼:', { oldPassword, newPassword })
    // 實際密碼變更邏輯
  }

  // 處理雙重驗證切換
  const handleTwoFactorToggle = (enabled: boolean) => {
    console.log('雙重驗證:', enabled)
    // 實際雙重驗證邏輯
  }

  // 處理偏好設定保存
  const handlePreferencesSave = (values: Record<string, any>) => {
    console.log('保存偏好設定:', values)
    // 實際偏好設定保存邏輯
  }

  const tabItems = [
    {
      key: 'personal',
      label: '個人資料',
      icon: <UserOutlined />,
      children: (
        <div style={{ padding: '24px' }}>
          <PersonalInfoForm
            initialValues={personalInfoInitialValues}
            onSave={handlePersonalInfoSave}
          />
        </div>
      )
    },
    {
      key: 'security',
      label: '安全設定',
      icon: <SafetyOutlined />,
      children: (
        <div style={{ padding: '24px' }}>
          <SecuritySettings
            onPasswordChange={handlePasswordChange}
            onTwoFactorToggle={handleTwoFactorToggle}
            twoFactorEnabled={true}
          />
        </div>
      )
    },
    {
      key: 'preferences',
      label: '偏好設定',
      icon: <SettingOutlined />,
      children: (
        <div style={{ padding: '24px' }}>
          <PreferencesSettings
            initialValues={preferencesInitialValues}
            onSave={handlePreferencesSave}
          />
        </div>
      )
    }
  ]

  return (
    <div>
      <PageHeader
        title="個人設定"
        subtitle="管理您的個人資料、安全設定和使用偏好"
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
    </div>
  )
}

export default ProfilePage