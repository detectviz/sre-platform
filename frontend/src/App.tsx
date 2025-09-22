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
  UserOutlined,
  BellOutlined,
  MonitorOutlined,
} from '@ant-design/icons'
import type { MenuProps } from 'antd'

import IncidentsPage from './pages/IncidentsPage'
import ResourcesPage from './pages/ResourcesPage'
import DashboardPage from './pages/DashboardPage'
import AnalyzingPage from './pages/AnalyzingPage'
import AutomationPage from './pages/AutomationPage'
import IdentitySettingsPage from './pages/IdentitySettingsPage'
import NotificationSettingsPage from './pages/NotificationSettingsPage'
import PlatformSettingsPage from './pages/PlatformSettingsPage'
import ProfilePage from './pages/ProfilePage'
import SREWarRoomPage from './pages/SREWarRoomPage'
import SREInfrastructureInsightPage from './pages/SREInfrastructureInsightPage'
import { AppLayout } from './layouts/AppLayout'
// import { useLocalStorage } from './hooks/useLocalStorage'


const menuItems: MenuProps['items'] = [
  { key: '/', icon: <DashboardOutlined />, label: '首頁' },
  { key: '/incidents', icon: <HistoryOutlined />, label: '事件管理' },
  { key: '/resources', icon: <HddOutlined />, label: '資源管理' },
  { key: '/dashboard', icon: <MonitorOutlined />, label: '儀表板管理' },
  { key: '/analyzing', icon: <BarChartOutlined />, label: '分析中心' },
  { key: '/automation', icon: <CodeOutlined />, label: '自動化中心' },
  {
    key: '/settings',
    icon: <SettingOutlined />,
    label: '設定',
    children: [
      { key: '/settings/identity/users', icon: <UserOutlined />, label: '身份與存取管理' },
      { key: '/settings/notifications/strategies', icon: <BellOutlined />, label: '通知管理' },
      { key: '/settings/platform/tags', icon: <SettingOutlined />, label: '平台設定' },
      { key: '/profile/personal', icon: <UserOutlined />, label: '個人設定' },
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

    // Handle settings tab paths for breadcrumb
    if (currentPath.startsWith('/settings/')) {
      if (currentPath === '/settings/profile') {
        currentPath = '/profile/personal'
      } else {
        currentPath = '/settings'
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
        <Route path="/" element={<SREWarRoomPage />} />
        <Route path="/warroom" element={<SREWarRoomPage />} />
        <Route path="/incidents" element={<IncidentsPage />} />
        <Route path="/resources" element={<ResourcesPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/dashboard/list" element={<DashboardPage />} />
        <Route path="/dashboard/warroom" element={<DashboardPage />} />
        <Route path="/dashboard/infrastructure" element={<DashboardPage />} />
        <Route path="/infrastructure" element={<SREInfrastructureInsightPage />} />
        <Route path="/analyzing" element={<AnalyzingPage />} />
        <Route path="/analyzing/capacity" element={<AnalyzingPage />} />
        <Route path="/analyzing/trends" element={<AnalyzingPage />} />
        <Route path="/analyzing/predictions" element={<AnalyzingPage />} />
        <Route path="/automation" element={<AutomationPage />} />
        <Route path="/automation/scripts" element={<AutomationPage />} />
        <Route path="/automation/schedules" element={<AutomationPage />} />
        <Route path="/automation/logs" element={<AutomationPage />} />
        <Route path="/settings/identity/users" element={<IdentitySettingsPage />} />
        <Route path="/settings/notifications/strategies" element={<NotificationSettingsPage />} />
        <Route path="/settings/platform/tags" element={<PlatformSettingsPage />} />
        <Route path="/settings/profile" element={<ProfilePage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/profile/personal" element={<ProfilePage />} />
        <Route path="/profile/security" element={<ProfilePage />} />
        <Route path="/profile/preferences" element={<ProfilePage />} />
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
