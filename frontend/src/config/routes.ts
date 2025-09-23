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
}

// 路由配置 - 扁平結構
export const routes: RouteConfig[] = [
  { path: '/login', component: pages.Login(), title: '登入', description: '用戶登入頁面' },
  { path: '/', component: pages.SREWarRoom(), title: 'SRE 戰情室', description: '即時監控和事件響應中心' },
  { path: '/incidents', component: pages.Incidents(), title: '事件管理' },
  { path: '/incidents/list', component: pages.Incidents(), title: '事件列表' },
  { path: '/incidents/rules', component: pages.Incidents(), title: '事件規則' },
  { path: '/incidents/silence', component: pages.SilenceRule(), title: '靜音規則' },
  { path: '/resources', component: pages.Resources(), title: '資源管理' },
  { path: '/resources/list', component: pages.Resources(), title: '資源列表' },
  { path: '/resources/groups', component: pages.Resources(), title: '資源群組' },
  { path: '/resources/topology', component: pages.Resources(), title: '拓撲視圖' },
  { path: '/infrastructure', component: pages.Infrastructure(), title: '基礎設施洞察' },
  { path: '/dashboard', component: pages.Dashboard(), title: '儀表板管理' },
  { path: '/dashboard/:dashboardId', component: pages.DashboardView(), title: '儀表板檢視', description: '顯示指定的 Grafana 儀表板' },
  { path: '/analyzing', component: pages.Analyzing(), title: '分析中心' },
  { path: '/analyzing/capacity', component: pages.Analyzing(), title: '容量規劃' },
  { path: '/analyzing/trends', component: pages.Analyzing(), title: '趨勢分析' },
  { path: '/analyzing/predictions', component: pages.Analyzing(), title: '預測分析' },
  { path: '/automation', component: pages.Automation(), title: '自動化中心' },
  { path: '/automation/scripts', component: pages.Automation(), title: '腳本庫' },
  { path: '/automation/schedules', component: pages.Automation(), title: '排程管理' },
  { path: '/automation/logs', component: pages.Automation(), title: '執行日誌' },
  { path: '/settings/identity/users', component: pages.IdentitySettings(), title: '身份與存取管理' },
  { path: '/settings/identity/teams', component: pages.IdentitySettings(), title: '團隊管理' },
  { path: '/settings/identity/roles', component: pages.IdentitySettings(), title: '角色管理' },
  { path: '/settings/identity/audit', component: pages.IdentitySettings(), title: '稽核日誌' },
  { path: '/settings/notifications/strategies', component: pages.NotificationSettings(), title: '通知管理' },
  { path: '/settings/notifications/channels', component: pages.NotificationSettings(), title: '通知通道' },
  { path: '/settings/notifications/history', component: pages.NotificationSettings(), title: '通知歷史' },
  { path: '/settings/platform/tags', component: pages.PlatformSettings(), title: '平台設定' },
  { path: '/settings/platform/email', component: pages.PlatformSettings(), title: '郵件設定' },
  { path: '/settings/platform/auth', component: pages.PlatformSettings(), title: '認證設定' },
  { path: '/profile', component: pages.Profile(), title: '個人設定' },
  { path: '/profile/personal', component: pages.Profile(), title: '個人資料' },
  { path: '/profile/security', component: pages.Profile(), title: '安全設定' },
  { path: '/profile/preferences', component: pages.Profile(), title: '偏好設定' }
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
}

export const menuItems: MenuProps['items'] = [
  { key: '/', icon: icons.dashboard, label: 'SRE 戰情室' },
  { key: '/incidents', icon: icons.history, label: '事件管理' },
  { key: '/resources', icon: icons.hdd, label: '資源管理' },
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
]


// 路由工具函數
export const getRouteTitle = (path: string): string => {
  return routes.find(route => route.path === path)?.title || '未知頁面'
}

export const getRouteDescription = (path: string): string => {
  return routes.find(route => route.path === path)?.description || ''
}

// 路由路徑映射 - 將實際路徑映射到選單中定義的路徑
export const routePathMapping: Record<string, string> = {
  // 個人設定頁面
  '/profile/personal': '/profile',
  '/profile/security': '/profile',
  '/profile/preferences': '/profile',

  // 設定子頁面
  '/settings/identity/users': '/settings',
  '/settings/notifications/strategies': '/settings',
  '/settings/platform/tags': '/settings'
}