// 通用類型定義

// 響應狀態
export type Status = 'success' | 'warning' | 'error' | 'info'

// 趨勢方向
export type TrendDirection = 'up' | 'down' | 'stable'

// 面包屑導航項目
export interface BreadcrumbItem {
  title: string
  href?: string
}

// 選單項目
export interface MenuItem {
  key: string
  icon?: React.ReactNode
  label: string
  children?: MenuItem[]
}

// 路由配置
export interface RouteConfig {
  path: string
  component: Promise<{ default: React.ComponentType<any> }>
  title?: string
  description?: string
}

// KPI 卡片數據
export interface KPIData {
  title: string
  value: string | number
  description?: string
  trend?: string | TrendDirection
  status?: Status
}

// 用戶信息
export interface UserInfo {
  id: string
  name: string
  email: string
  avatar?: string
  role: string
  status: 'online' | 'offline' | 'away'
}

// 通知項目
export interface NotificationItem {
  id: string
  title: string
  description: string
  type: 'error' | 'warning' | 'info' | 'success'
  severity: 'critical' | 'warning' | 'info' | 'success'
  time: string
  read: boolean
  createdAt: string
}

// API 響應結構
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  message?: string
  error?: string
  timestamp: string
}

// 分頁信息
export interface PaginationInfo {
  current: number
  pageSize: number
  total: number
  showSizeChanger?: boolean
  showQuickJumper?: boolean
  showTotal?: (total: number) => string
}

// 表格列配置
export interface TableColumn {
  key: string
  title: string
  dataIndex?: string
  sorter?: boolean
  filters?: Array<{ text: string; value: any }>
  width?: number | string
  ellipsis?: boolean
}

// 主題配置
export interface ThemeConfig {
  mode: 'light' | 'dark'
  primaryColor: string
  borderRadius: number
}

// 系統設置
export interface SystemSettings {
  theme: ThemeConfig
  language: 'zh-TW' | 'zh-CN' | 'en-US'
  timezone: string
  dateFormat: string
  timeFormat: '12h' | '24h'
}

// 搜索結果項目
export interface SearchResultItem {
  id: string
  title: string
  description: string
  type: 'resource' | 'incident' | 'script' | 'dashboard' | 'page'
  path: string
  icon?: React.ReactNode
  tags?: string[]
}

// 事件狀態
export type IncidentStatus = 'open' | 'investigating' | 'resolved' | 'closed'

// 事件嚴重程度
export type IncidentSeverity = 'critical' | 'high' | 'medium' | 'low'

// 資源健康狀態
export type ResourceHealth = 'healthy' | 'warning' | 'critical' | 'unknown'

// 資源類型
export type ResourceType = 'server' | 'database' | 'service' | 'network' | 'storage'