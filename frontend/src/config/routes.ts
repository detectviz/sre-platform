import type { ComponentType } from 'react'
import type { MenuProps } from 'antd'
import React from 'react'
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
  BugOutlined,
} from '@ant-design/icons'

// 路由配置類型
interface RouteConfig {
  path: string
  component: Promise<{ default: ComponentType<any> }>
  title?: string
  description?: string
}

// 頁面組件懶加載
const pages = {
  Login: () => import('../pages/LoginPage'),
  SREWarRoom: () => import('../pages/SREWarRoomPage'),
  Incidents: () => import('../pages/IncidentsPage'),
  SilenceRule: () => import('../pages/SilenceRulePage'),
  Resources: () => import('../pages/ResourcesPage'),
  Infrastructure: () => import('../pages/SREInfrastructureInsightPage'),
  Dashboard: () => import('../pages/DashboardPage'),
  DashboardView: () => import('../pages/DashboardViewPage'),
  Analyzing: () => import('../pages/AnalyzingPage'),
  Automation: () => import('../pages/AutomationPage'),
  IdentitySettings: () => import('../pages/IdentitySettingsPage'),
  NotificationSettings: () => import('../pages/NotificationSettingsPage'),
  PlatformSettings: () => import('../pages/PlatformSettingsPage'),
  Profile: () => import('../pages/ProfilePage'),
  GrafanaTest: () => import('../pages/GrafanaTestPage'),
}

// 路由配置 - 扁平結構
export const routes: RouteConfig[] = [
  { path: '/login', component: pages.Login(), title: '登入', description: '用戶登入頁面' },
  { path: '/', component: pages.SREWarRoom(), title: 'SRE 戰情室', description: '即時監控和事件響應中心' },
  { path: '/incidents', component: pages.Incidents(), title: '事件管理' },
  { path: '/incidents/silence', component: pages.SilenceRule(), title: '靜音規則' },
  { path: '/resources', component: pages.Resources(), title: '資源管理' },
  { path: '/infrastructure', component: pages.Infrastructure(), title: '基礎設施洞察' },
  { path: '/dashboard', component: pages.Dashboard(), title: '儀表板管理' },
  { path: '/dashboard/:dashboardId', component: pages.DashboardView(), title: '儀表板檢視', description: '顯示指定的 Grafana 儀表板' },
  { path: '/analyzing', component: pages.Analyzing(), title: '分析中心' },
  { path: '/automation', component: pages.Automation(), title: '自動化中心' },
  { path: '/settings/identity/users', component: pages.IdentitySettings(), title: '身份與存取管理' },
  { path: '/settings/notifications/strategies', component: pages.NotificationSettings(), title: '通知管理' },
  { path: '/settings/platform/tags', component: pages.PlatformSettings(), title: '平台設定' },
  { path: '/profile', component: pages.Profile(), title: '個人設定' },
  { path: '/grafana-test', component: pages.GrafanaTest(), title: 'Grafana 嵌入測試', description: '測試在SRE平台中嵌入Grafana儀表板的各種場景' }
]

// 導出路由配置
export const flatRoutes = routes

// 選單配置 - 使用圖標對象簡化代碼
const icons = {
  dashboard: React.createElement(DashboardOutlined),
  history: React.createElement(HistoryOutlined),
  hdd: React.createElement(HddOutlined),
  monitor: React.createElement(MonitorOutlined),
  chart: React.createElement(BarChartOutlined),
  code: React.createElement(CodeOutlined),
  setting: React.createElement(SettingOutlined),
  user: React.createElement(UserOutlined),
  bell: React.createElement(BellOutlined),
  bug: React.createElement(BugOutlined),
}

export const menuItems: MenuProps['items'] = [
  { key: '/', icon: icons.dashboard, label: 'SRE 戰情室' },
  {
    key: '/incidents',
    icon: icons.history,
    label: '事件管理',
    children: [
      { key: '/incidents', label: '事件列表' },
      { key: '/incidents/silence', icon: icons.bell, label: '靜音規則' }
    ]
  },
  { key: '/resources', icon: icons.hdd, label: '資源管理' },
  { key: '/infrastructure', icon: icons.monitor, label: '基礎設施洞察' },
  { key: '/dashboard', icon: icons.monitor, label: '儀表板管理' },
  { key: '/analyzing', icon: icons.chart, label: '分析中心' },
  { key: '/automation', icon: icons.code, label: '自動化中心' },
  {
    key: '/settings',
    icon: icons.setting,
    label: '設定',
    children: [
      { key: '/settings/identity/users', icon: icons.user, label: '身份與存取管理' },
      { key: '/settings/notifications/strategies', icon: icons.bell, label: '通知管理' },
      { key: '/settings/platform/tags', icon: icons.setting, label: '平台設定' },
      { key: '/profile', icon: icons.user, label: '個人設定' },
    ]
  },
  {
    key: '/testing',
    icon: icons.bug,
    label: '測試與開發',
    children: [
      { key: '/grafana-test', icon: icons.monitor, label: 'Grafana 嵌入測試' },
    ]
  },
]


// 路由工具函數
export const getRouteTitle = (path: string): string => {
  return routes.find(route => route.path === path)?.title || '未知頁面'
}

export const getRouteDescription = (path: string): string => {
  return routes.find(route => route.path === path)?.description || ''
}