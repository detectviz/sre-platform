import { useMemo } from 'react'
import { App as AntdApp } from 'antd'
import {
  Routes,
  Route,
  useNavigate,
  useLocation,
} from 'react-router-dom'
import {
  BarChartOutlined,
  CodeOutlined,
  DashboardOutlined,
  HistoryOutlined,
  HddOutlined,
  SettingOutlined,
  ProfileOutlined,
} from '@ant-design/icons'
import type { MenuProps } from 'antd'

import HomePage from './pages/HomePage'
import IncidentsPage from './pages/IncidentsPage'
import EventRulePage from './pages/EventRulePage'
import SilenceRulePage from './pages/SilenceRulePage'
import ResourcesPage from './pages/ResourcesPage'
import ResourceGroupPage from './pages/ResourceGroupPage'
import ResourceTopologyPage from './pages/ResourceTopologyPage'
import SettingsPage from './pages/SettingsPage'
import ProfilePage from './pages/ProfilePage'
import { AppLayout } from './layouts/AppLayout'
// import { useLocalStorage } from './hooks/useLocalStorage'


const menuItems: MenuProps['items'] = [
  { key: '/', icon: <DashboardOutlined />, label: '首頁' },
  {
    key: '/incidents/list',
    icon: <HistoryOutlined />,
    label: '事件管理',
    children: [
      { key: '/incidents/list', label: '事件列表' },
      { key: '/incidents/rules', label: '事件規則' },
      { key: '/incidents/silences', label: '靜音規則' },
    ]
  },
  {
    key: '/resources/list',
    icon: <HddOutlined />,
    label: '資源管理',
    children: [
      { key: '/resources/list', label: '資源列表' },
      { key: '/resources/groups', label: '資源群組' },
      { key: '/resources/topology', label: '拓撲視圖' },
    ]
  },
  {
    key: '/dashboard/list',
    icon: <BarChartOutlined />,
    label: '儀表板管理',
    children: [
      { key: '/dashboard/list', label: '儀表板列表' },
      { key: '/dashboard/warroom', label: 'SRE 戰情室' },
      { key: '/dashboard/infrastructure', label: '基礎設施洞察' },
    ]
  },
  {
    key: '/analyzing',
    icon: <BarChartOutlined />,
    label: '分析中心',
    children: [
      { key: '/analyzing', label: '容量規劃' },
      { key: '/analyzing/trends', label: '趨勢分析' },
      { key: '/analyzing/predictions', label: '風險預測' },
    ]
  },
  {
    key: '/automation/scripts',
    icon: <CodeOutlined />,
    label: '自動化中心',
    children: [
      { key: '/automation/scripts', label: '腳本庫' },
      { key: '/automation/schedules', label: '排程管理' },
      { key: '/automation/logs', label: '執行日誌' },
    ]
  },
  {
    key: '/settings',
    icon: <SettingOutlined />,
    label: '設定',
    children: [
      {
        key: '/settings/identity',
        label: '身份與存取管理',
        children: [
          { key: '/identity/users', label: '人員管理' },
          { key: '/identity/teams', label: '團隊管理' },
          { key: '/identity/roles', label: '角色管理' },
          { key: '/identity/audit', label: '審計日誌' },
        ]
      },
      {
        key: '/settings/notifications',
        label: '通知管理',
        children: [
          { key: '/notifications/strategies', label: '通知策略' },
          { key: '/notifications/channels', label: '通知管道' },
          { key: '/notifications/history', label: '通知歷史' },
        ]
      },
      {
        key: '/settings/platform',
        label: '平台設定',
        children: [
          { key: '/settings/tags', label: '標籤管理' },
          { key: '/settings/email', label: '郵件設定' },
          { key: '/settings/auth', label: '身份驗證' },
        ]
      },
    ]
  },
  {
    key: '/profile/personal',
    icon: <ProfileOutlined />,
    label: '個人資料與偏好設定',
    children: [
      { key: '/profile/personal', label: '個人資訊' },
      { key: '/profile/security', label: '密碼安全' },
      { key: '/profile/preferences', label: '偏好設定' },
    ]
  },
]

const AppShell = () => {
  const navigate = useNavigate()
  const location = useLocation()
  // const [themeMode] = useLocalStorage<'dark' | 'light'>('sre-theme-mode', 'dark')

  const breadcrumbItems = useMemo(() => {
    const findTrail = (path: string, items: MenuProps['items']): { title: string; href?: string }[] => {
      if (!items) return []

      for (const item of items) {
        if (typeof item === 'object' && item && 'key' in item && 'label' in item) {
          if (item.key === path) {
            return [{ title: item.label as string }]
          }

          if ('children' in item && item.children) {
            const childTrail = findTrail(path, item.children)
            if (childTrail.length > 0) {
              return [{ title: item.label as string }, ...childTrail]
            }
          }
        }
      }
      return []
    }

    let currentPath = location.pathname
    if (currentPath.startsWith('/automation') && currentPath !== '/automation/capacity-planning') {
      currentPath = '/automation/scripts'
    }

    // Handle new settings menu structure
    if (currentPath.startsWith('/identity/') || currentPath.startsWith('/notifications/')) {
      // Map identity and notification paths to their parent settings path
      if (currentPath.startsWith('/identity/')) {
        currentPath = '/settings/identity'
      } else if (currentPath.startsWith('/notifications/')) {
        currentPath = '/settings/notifications'
      }
    }

    const trail = findTrail(currentPath, menuItems)

    if (trail.length === 0 && location.pathname !== '/') {
      trail.push({ title: '首頁', href: '/' })
    }

    return trail
  }, [location.pathname])

  const handleMenuSelect = (key: string) => {
    navigate(key)
  }

  return (
    <AppLayout
      menuItems={menuItems}
      breadcrumbItems={breadcrumbItems}
      onMenuSelect={handleMenuSelect}
    >
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/incidents/list" element={<IncidentsPage />} />
        <Route path="/incidents/rules" element={<EventRulePage />} />
        <Route path="/incidents/silences" element={<SilenceRulePage />} />
        <Route path="/resources/list" element={<ResourcesPage />} />
        <Route path="/resources/groups" element={<ResourceGroupPage />} />
        <Route path="/resources/topology" element={<ResourceTopologyPage />} />
        <Route path="/dashboard/list" element={<div>儀表板列表頁面 (開發中)</div>} />
        <Route path="/dashboard/warroom" element={<div>SRE 戰情室頁面 (開發中)</div>} />
        <Route path="/dashboard/infrastructure" element={<div>基礎設施洞察頁面 (開發中)</div>} />
        <Route path="/analyzing" element={<div>容量規劃頁面 (開發中)</div>} />
        <Route path="/analyzing/trends" element={<div>趨勢分析頁面 (開發中)</div>} />
        <Route path="/analyzing/predictions" element={<div>風險預測頁面 (開發中)</div>} />
        <Route path="/automation/scripts" element={<div>腳本庫頁面 (開發中)</div>} />
        <Route path="/automation/schedules" element={<div>排程管理頁面 (開發中)</div>} />
        <Route path="/automation/logs" element={<div>執行日誌頁面 (開發中)</div>} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/settings/identity" element={<div>身份與存取管理頁面 (開發中)</div>} />
        <Route path="/settings/notifications" element={<div>通知管理頁面 (開發中)</div>} />
        <Route path="/settings/platform" element={<div>平台設定頁面 (開發中)</div>} />
        <Route path="/identity/users" element={<div>人員管理頁面 (開發中)</div>} />
        <Route path="/identity/teams" element={<div>團隊管理頁面 (開發中)</div>} />
        <Route path="/identity/roles" element={<div>角色管理頁面 (開發中)</div>} />
        <Route path="/identity/audit" element={<div>審計日誌頁面 (開發中)</div>} />
        <Route path="/notifications/strategies" element={<div>通知策略頁面 (開發中)</div>} />
        <Route path="/notifications/channels" element={<div>通知管道頁面 (開發中)</div>} />
        <Route path="/notifications/history" element={<div>通知歷史頁面 (開發中)</div>} />
        <Route path="/settings/tags" element={<div>標籤管理頁面 (開發中)</div>} />
        <Route path="/settings/email" element={<div>郵件設定頁面 (開發中)</div>} />
        <Route path="/settings/auth" element={<div>身份驗證頁面 (開發中)</div>} />
        <Route path="/profile/personal" element={<ProfilePage />} />
        <Route path="/profile/security" element={<div>密碼安全頁面 (開發中)</div>} />
        <Route path="/profile/preferences" element={<div>偏好設定頁面 (開發中)</div>} />
      </Routes>
    </AppLayout>
  )
}

function App() {
  return (
    <AntdApp>
      <AppShell />
    </AntdApp>
  )
}

export default App
