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

// 延遲載入頁面組件
const IncidentsPage = import('../pages/IncidentsPage')
const ResourcesPage = import('../pages/ResourcesPage')
const DashboardPage = import('../pages/DashboardPage')
const AnalyzingPage = import('../pages/AnalyzingPage')
const AutomationPage = import('../pages/AutomationPage')
const IdentitySettingsPage = import('../pages/IdentitySettingsPage')
const NotificationSettingsPage = import('../pages/NotificationSettingsPage')
const PlatformSettingsPage = import('../pages/PlatformSettingsPage')
const ProfilePage = import('../pages/ProfilePage')
const SREWarRoomPage = import('../pages/SREWarRoomPage')
const SREInfrastructureInsightPage = import('../pages/SREInfrastructureInsightPage')
const GrafanaTestPage = import('../pages/GrafanaTestPage')
const DashboardViewPage = import('../pages/DashboardViewPage.tsx')

// 路由配置接口
export interface RouteConfig {
  path: string
  component: Promise<{ default: ComponentType<any> }>
  title?: string
  description?: string
}

// 動態路由配置
export const routeConfigs: Record<string, RouteConfig[]> = {
  // 主要頁面
  main: [
    {
      path: '/',
      component: SREWarRoomPage,
      title: 'SRE 戰情室',
      description: '即時監控和事件響應中心'
    },
    {
      path: '/warroom',
      component: SREWarRoomPage,
      title: 'SRE 戰情室'
    },
    {
      path: '/incidents',
      component: IncidentsPage,
      title: '事件管理'
    },
    {
      path: '/resources',
      component: ResourcesPage,
      title: '資源管理'
    },
    {
      path: '/infrastructure',
      component: SREInfrastructureInsightPage,
      title: '基礎設施洞察'
    }
  ],

  // 儀表板相關路由
  dashboard: [
    {
      path: '/dashboard',
      component: DashboardPage,
      title: '儀表板管理'
    },
    {
      path: '/dashboard/list',
      component: DashboardPage,
      title: '儀表板列表'
    },
    {
      path: '/dashboard/warroom',
      component: DashboardPage,
      title: '戰情室儀表板'
    },
    {
      path: '/dashboard/infrastructure',
      component: DashboardPage,
      title: '基礎設施儀表板'
    },
    {
      path: '/dashboard/:dashboardId',
      component: DashboardViewPage,
      title: '儀表板檢視',
      description: '顯示指定的 Grafana 儀表板'
    }
  ],

  // 分析中心路由
  analyzing: [
    {
      path: '/analyzing',
      component: AnalyzingPage,
      title: '分析中心'
    },
    {
      path: '/analyzing/capacity',
      component: AnalyzingPage,
      title: '容量分析'
    },
    {
      path: '/analyzing/trends',
      component: AnalyzingPage,
      title: '趨勢分析'
    },
    {
      path: '/analyzing/predictions',
      component: AnalyzingPage,
      title: '預測分析'
    }
  ],

  // 自動化中心路由
  automation: [
    {
      path: '/automation',
      component: AutomationPage,
      title: '自動化中心'
    },
    {
      path: '/automation/scripts',
      component: AutomationPage,
      title: '腳本管理'
    },
    {
      path: '/automation/schedules',
      component: AutomationPage,
      title: '排程管理'
    },
    {
      path: '/automation/logs',
      component: AutomationPage,
      title: '執行日誌'
    }
  ],

  // 設定相關路由
  settings: [
    {
      path: '/settings/identity/users',
      component: IdentitySettingsPage,
      title: '身份與存取管理'
    },
    {
      path: '/settings/notifications/strategies',
      component: NotificationSettingsPage,
      title: '通知管理'
    },
    {
      path: '/settings/platform/tags',
      component: PlatformSettingsPage,
      title: '平台設定'
    }
  ],

  // 個人設定路由
  profile: [
    {
      path: '/settings/profile',
      component: ProfilePage,
      title: '個人設定'
    },
    {
      path: '/profile',
      component: ProfilePage,
      title: '個人設定'
    },
    {
      path: '/profile/personal',
      component: ProfilePage,
      title: '個人資料'
    },
    {
      path: '/profile/security',
      component: ProfilePage,
      title: '安全設定'
    },
    {
      path: '/profile/preferences',
      component: ProfilePage,
      title: '偏好設定'
    }
  ],

  // 測試和開發路由
  testing: [
    {
      path: '/grafana-test',
      component: GrafanaTestPage,
      title: 'Grafana 嵌入測試',
      description: '測試在SRE平台中嵌入Grafana儀表板的各種場景'
    }
  ]
}

// 扁平化所有路由
export const flatRoutes: RouteConfig[] = Object.values(routeConfigs).flat()

// 選單配置
export const menuItems: MenuProps['items'] = [
  { key: '/', icon: React.createElement(DashboardOutlined), label: '首頁' },
  { key: '/incidents', icon: React.createElement(HistoryOutlined), label: '事件管理' },
  { key: '/resources', icon: React.createElement(HddOutlined), label: '資源管理' },
  { key: '/dashboard', icon: React.createElement(MonitorOutlined), label: '儀表板管理' },
  { key: '/analyzing', icon: React.createElement(BarChartOutlined), label: '分析中心' },
  { key: '/automation', icon: React.createElement(CodeOutlined), label: '自動化中心' },
  {
    key: '/settings',
    icon: React.createElement(SettingOutlined),
    label: '設定',
    children: [
      { key: '/settings/identity/users', icon: React.createElement(UserOutlined), label: '身份與存取管理' },
      { key: '/settings/notifications/strategies', icon: React.createElement(BellOutlined), label: '通知管理' },
      { key: '/settings/platform/tags', icon: React.createElement(SettingOutlined), label: '平台設定' },
      { key: '/profile/personal', icon: React.createElement(UserOutlined), label: '個人設定' },
    ]
  },
  {
    key: '/testing',
    icon: React.createElement(BugOutlined),
    label: '測試與開發',
    children: [
      { key: '/grafana-test', icon: React.createElement(MonitorOutlined), label: 'Grafana 嵌入測試' },
    ]
  },
]

// 路由路徑對應
export const routePathMapping: Record<string, string> = {
  // 自動化路由重定向
  '/automation/capacity-planning': '/automation/scripts',

  // 設定路由重定向
  '/settings/profile': '/profile/personal',
}

// 獲取路由標題的工具函數
export const getRouteTitle = (path: string): string => {
  const route = flatRoutes.find(route => route.path === path)
  return route?.title || '未知頁面'
}

// 獲取路由描述的工具函數
export const getRouteDescription = (path: string): string => {
  const route = flatRoutes.find(route => route.path === path)
  return route?.description || ''
}