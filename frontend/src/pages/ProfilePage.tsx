import React, { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { Typography, Space, Tabs } from 'antd'
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

const { Title } = Typography

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
    desktopNotifications: true,
    soundNotifications: false,
    emailDigest: true,
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
      label: (
        <span>
          <UserOutlined />
          個人資料
        </span>
      ),
      children: (
        <PersonalInfoForm
          initialValues={personalInfoInitialValues}
          onSave={handlePersonalInfoSave}
        />
      )
    },
    {
      key: 'security',
      label: (
        <span>
          <SafetyOutlined />
          安全設定
        </span>
      ),
      children: (
        <SecuritySettings
          onPasswordChange={handlePasswordChange}
          onTwoFactorToggle={handleTwoFactorToggle}
          twoFactorEnabled={true}
        />
      )
    },
    {
      key: 'preferences',
      label: (
        <span>
          <SettingOutlined />
          偏好設定
        </span>
      ),
      children: (
        <PreferencesSettings
          initialValues={preferencesInitialValues}
          onSave={handlePreferencesSave}
        />
      )
    }
  ]

  return (
    <div>
      <PageHeader
        title="個人設定"
        description="管理您的個人資料、安全設定和使用偏好"
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
      <div style={{
        background: 'var(--bg-elevated)',
        border: '1px solid var(--border-light)',
        borderRadius: 'var(--radius-lg)',
        overflow: 'hidden'
      }}>
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={tabItems}
          style={{
            padding: 'var(--spacing-lg)',
            minHeight: '500px'
          }}
        />
      </div>
    </div>
  )
}

export default ProfilePage