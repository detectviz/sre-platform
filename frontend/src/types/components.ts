/**
 * 組件 Props 類型定義
 * 定義所有組件的 Props 接口和類型
 */

import React from 'react'
import { TableProps } from 'antd'
import { TableConfig } from '../constants/table'

// PageHeader 組件 Props
export interface PageHeaderProps {
  title: string
  subtitle?: string
  onBack?: () => void
  showBack?: boolean
  extra?: React.ReactNode
  showRefresh?: boolean
  onRefresh?: () => void
  breadcrumb?: BreadcrumbItem[]
  tags?: React.ReactNode
  avatar?: React.ReactNode
}

// Breadcrumb 項目
export interface BreadcrumbItem {
  title: string
  path?: string
  icon?: React.ComponentType
}

// KPI 卡片組件 Props
export interface KPICardData {
  title: string
  value: string | number
  description?: string
  trend?: {
    value: number
    isPositive: boolean
    label: string
  }
  status: 'success' | 'warning' | 'danger' | 'info'
  icon?: React.ComponentType
  onClick?: () => void
  loading?: boolean
}

// ContextualKPICard 組件 Props
export interface ContextualKPICardProps extends KPICardData {
  height?: number | string
  className?: string
  style?: React.CSSProperties
}

// ToolbarActions 組件 Props
export interface ToolbarActionsProps {
  actions?: ToolbarAction[]
  onRefresh?: () => void
  onSearch?: (searchText: string) => void
  onExport?: () => void
  onAdd?: () => void
  onAIAnalysis?: () => void
  showRefresh?: boolean
  showSearch?: boolean
  showExport?: boolean
  showAdd?: boolean
  searchPlaceholder?: string
  middleContent?: React.ReactNode
  middleContentPosition?: 'left' | 'center' | 'right'
  loading?: boolean
  className?: string
}

// 工具列操作
// 統一的工具列動作類型定義
export interface ToolbarAction {
  key: string
  label: string
  icon: React.ReactNode
  onClick?: () => void
  type?: 'primary' | 'default' | 'dashed' | 'text' | 'link' | string
  danger?: boolean
  disabled?: boolean
  loading?: boolean
  tooltip?: string
  children?: React.ReactNode
}

// CategoryFilter 組件 Props
export interface CategoryFilterProps {
  categories: CategoryConfig[]
  selectedCategory: string
  onCategoryChange: (category: string) => void
  showAll?: boolean
  allLabel?: string
  loading?: boolean
}

// 分類配置
export interface CategoryConfig {
  key: string
  label: string
  count: number
  color?: string
  icon?: React.ComponentType
}

// DataTablePage 組件 Props
export interface DataTablePageProps<T = any> extends TableConfig<T> {
  title: string
  subtitle?: string
  onBack?: () => void
  showBack?: boolean
  kpiData?: KPICardData[]
  tabs?: TabConfig[]
  children?: React.ReactNode
  loading?: boolean
  className?: string
}

// Tab 配置
export interface TabConfig {
  key: string
  label: string
  icon?: React.ComponentType
  children?: React.ReactNode
}

// PageLayout 組件 Props
export interface PageLayoutProps {
  header: React.ReactNode
  content: React.ReactNode
  sidebar?: React.ReactNode
  footer?: React.ReactNode
  mode?: 'default' | 'table' | 'dashboard' | 'form'
  config?: PageLayoutConfig
  className?: string
  style?: React.CSSProperties
}

// PageLayout 配置
export interface PageLayoutConfig {
  showSidebar?: boolean
  sidebarWidth?: number
  contentPadding?: number | string
  headerHeight?: number
  footerHeight?: number
  responsive?: boolean
  customSpacing?: {
    header?: string
    content?: string
    sidebar?: string
    footer?: string
  }
}

// GrafanaDashboard 組件 Props
export interface GrafanaDashboardProps {
  dashboardUrl: string
  title?: string
  height?: string | number
  width?: string | number
  showControls?: boolean
  theme?: 'light' | 'dark'
  kiosk?: boolean | string
  refresh?: string | number
  orgId?: number
  panelId?: number
  viewPanel?: string
  autofitpanels?: boolean
  from?: string
  to?: string
  timeRange?: string
  variables?: Record<string, string>
  onLoad?: () => void
  onError?: (error: Error) => void
  className?: string
  style?: React.CSSProperties
}

// GlobalSearch 組件 Props
export interface GlobalSearchProps {
  visible?: boolean
  onVisibleChange?: (visible: boolean) => void
  placeholder?: string
  searchResults?: SearchResult[]
  loading?: boolean
  onSearch?: (query: string) => void
  onResultSelect?: (result: SearchResult) => void
}

// 搜索結果
export interface SearchResult {
  id: string
  title: string
  description?: string
  type: 'resource' | 'incident' | 'script' | 'dashboard'
  category: string
  url: string
  icon?: React.ComponentType
  metadata?: Record<string, any>
}

// NotificationCenter 組件 Props
export interface NotificationCenterProps {
  visible?: boolean
  onVisibleChange?: (visible: boolean) => void
  notifications?: NotificationItem[]
  unreadCount?: number
  loading?: boolean
  onMarkAsRead?: (id: string) => void
  onMarkAllAsRead?: () => void
  onDelete?: (id: string) => void
  onClearAll?: () => void
}

// 通知項目
export interface NotificationItem {
  id: string
  title: string
  description: string
  type: 'error' | 'warning' | 'info' | 'success'
  severity: 'critical' | 'high' | 'medium' | 'low'
  time: string
  read: boolean
  url?: string
  actions?: NotificationAction[]
}

// 通知動作
export interface NotificationAction {
  label: string
  onClick: () => void
  type?: 'primary' | 'default' | 'danger'
}

// UserMenu 組件 Props
export interface UserMenuProps {
  user?: UserInfo
  menuItems?: MenuItem[]
  onMenuClick?: (key: string) => void
  onLogout?: () => void
  loading?: boolean
}

// 用戶信息
export interface UserInfo {
  id: string
  username: string
  displayName: string
  email: string
  avatar?: string
  role: string
  status: string
}

// 選單項目
export interface MenuItem {
  key: string
  label: string
  icon?: React.ComponentType
  path?: string
  children?: MenuItem[]
  divider?: boolean
  disabled?: boolean
}

// FormFactory 組件 Props
export interface FormFactoryProps {
  fields: FormField[]
  onSubmit: (values: Record<string, any>) => void
  onCancel?: () => void
  loading?: boolean
  initialValues?: Record<string, any>
  layout?: 'horizontal' | 'vertical' | 'inline'
  size?: 'small' | 'middle' | 'large'
  className?: string
}

// 表單字段配置
export interface FormField {
  name: string
  label: string
  type: FormFieldType
  required?: boolean
  placeholder?: string
  options?: FormFieldOption[]
  validation?: FormFieldValidation
  dependencies?: string[]
  props?: Record<string, any>
}

// 表單字段類型
export type FormFieldType =
  | 'input'
  | 'password'
  | 'textarea'
  | 'select'
  | 'checkbox'
  | 'radio'
  | 'switch'
  | 'date'
  | 'time'
  | 'datetime'
  | 'range'
  | 'number'
  | 'file'
  | 'rate'
  | 'slider'
  | 'custom'

// 表單字段選項
export interface FormFieldOption {
  label: string
  value: any
  disabled?: boolean
}

// 表單字段驗證
export interface FormFieldValidation {
  min?: number
  max?: number
  pattern?: RegExp
  message?: string
  validator?: (value: any) => boolean | Promise<boolean>
}

// LazyRoute 組件 Props
export interface LazyRouteProps {
  component: React.LazyExoticComponent<React.ComponentType>
  fallback?: React.ReactNode
  loading?: boolean
  error?: Error | null
  onError?: (error: Error) => void
}

// FilterOption 組件 Props (用於 ToolbarActions)
export interface FilterOption {
  key: string
  label: string
  value: any
  count?: number
  icon?: React.ComponentType
}

// ColumnOption 組件 Props (用於表格欄位設定)
export interface ColumnOption {
  key: string
  title: string
  dataIndex: string
  visible: boolean
  fixed?: 'left' | 'right'
  width?: number
  sortable?: boolean
  filterable?: boolean
}

// 通用表格 Props
export interface GenericTableProps<T = any> extends Omit<TableProps<T>, 'columns' | 'dataSource'> {
  config: TableConfig<T>
  dataSource?: T[]
  onDataChange?: (data: T[]) => void
}

// 通用列表 Props
export interface GenericListProps<T = any> {
  dataSource: T[]
  loading?: boolean
  pagination?: false | any
  onItemClick?: (item: T) => void
  onItemEdit?: (item: T) => void
  onItemDelete?: (item: T) => void
  renderItem?: (item: T, index: number) => React.ReactNode
  className?: string
}

// 通用模態框 Props
export interface GenericModalProps {
  title: string
  visible: boolean
  onCancel: () => void
  onOk?: () => void
  width?: number | string
  footer?: React.ReactNode
  maskClosable?: boolean
  destroyOnClose?: boolean
  children: React.ReactNode
  className?: string
}

// 通用抽屜 Props
export interface GenericDrawerProps {
  title: string
  visible: boolean
  onClose: () => void
  width?: number | string
  placement?: 'top' | 'right' | 'bottom' | 'left'
  maskClosable?: boolean
  destroyOnClose?: boolean
  children: React.ReactNode
  className?: string
}

// 通用確認對話框 Props
export interface ConfirmDialogProps {
  title: string
  content: string
  onConfirm: () => void
  onCancel?: () => void
  confirmText?: string
  cancelText?: string
  type?: 'confirm' | 'warning' | 'error'
  loading?: boolean
}

// 通用狀態指示器 Props
export interface StatusIndicatorProps {
  status: string
  text?: string
  color?: string
  size?: 'small' | 'medium' | 'large'
  showIcon?: boolean
  className?: string
}