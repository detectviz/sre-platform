// 組件相關類型定義

import { ReactNode } from 'react'

// 工具列篩選選項
export interface FilterOption {
  key: string
  label: string
  type: 'select' | 'input' | 'date' | 'dateRange'
  options?: Array<{ label: string; value: any }>
  placeholder?: string
  defaultValue?: any
}

// 工具列操作按鈕
export interface ToolbarAction {
  key: string
  label: string
  type?: 'default' | 'primary' | 'dashed' | 'text' | 'link'
  icon?: ReactNode
  danger?: boolean
  disabled?: boolean
  loading?: boolean
  onClick?: () => void
}

// 表格列選項
export interface ColumnOption {
  key: string
  label: string
  visible: boolean
  fixed?: 'left' | 'right'
  width?: number
}

// 頁面頭部配置
export interface PageHeaderProps {
  title: string
  description?: string
  icon?: ReactNode
  extra?: ReactNode
  breadcrumbItems?: Array<{ title: string; href?: string }>
}

// 應用佈局配置
export interface AppLayoutProps {
  menuItems: any[] // MenuProps['items']
  breadcrumbItems?: Array<{ title: string; href?: string }>
  children: ReactNode
  onMenuSelect?: (key: string) => void
}

// 全局搜索配置
export interface GlobalSearchProps {
  visible: boolean
  onClose: () => void
  placeholder?: string
  width?: number | string
}

// 通知中心配置
export interface NotificationCenterProps {
  maxDisplayCount?: number
  autoMarkAsRead?: boolean
  onNotificationClick?: (notification: any) => void
}

// 用戶選單配置
export interface UserMenuProps {
  user?: {
    name: string
    email: string
    avatar?: string
    role: string
  }
  onProfileClick?: () => void
  onLogout?: () => void
}

// 上下文 KPI 卡片配置
export interface ContextualKPICardProps {
  title: string
  value: string | number
  description?: string
  trend?: string
  status?: 'success' | 'warning' | 'error' | 'info'
  icon?: ReactNode
  loading?: boolean
  onClick?: () => void
}

// Grafana 儀表板組件配置
export interface GrafanaDashboardProps {
  dashboardUrl?: string;
  height?: string;
  title?: string;
  showControls?: boolean;
  orgId?: string;
  panelId?: string;
  viewPanel?: boolean;
  autofitpanels?: boolean;
  kiosk?: boolean | string;
  from?: string;
  to?: string;
  timeRange?: string;
}

// 延遲路由組件配置
export interface LazyRouteProps {
  component: Promise<{ default: React.ComponentType<any> }>
  fallback?: ReactNode
}

// 表單驗證規則
export interface ValidationRule {
  required?: boolean
  message?: string
  min?: number
  max?: number
  pattern?: RegExp
  validator?: (rule: any, value: any) => Promise<void> | void
}

// 表單欄位配置
export interface FormFieldConfig {
  name: string
  label: string
  type: 'input' | 'textarea' | 'select' | 'date' | 'dateRange' | 'switch' | 'radio' | 'checkbox'
  rules?: ValidationRule[]
  placeholder?: string
  options?: Array<{ label: string; value: any }>
  disabled?: boolean
  hidden?: boolean
}

// 模態框配置
export interface ModalConfig {
  title: string
  width?: number | string
  closable?: boolean
  maskClosable?: boolean
  keyboard?: boolean
  centered?: boolean
  destroyOnClose?: boolean
}