/**
 * 通用類型定義
 * 定義系統中通用的類型和工具類型
 */

import React from 'react'

// 通用響應狀態
export type ResponseStatus = 'idle' | 'loading' | 'success' | 'error'

// 通用錯誤類型
export interface AppError {
  code: string | number
  message: string
  details?: Record<string, any>
  timestamp: string
}

// 通用 API 狀態
export interface ApiState<T = any> {
  data: T | null
  loading: boolean
  error: AppError | null
  status: ResponseStatus
}

// 通用查詢鉤子返回類型
export interface UseQueryResult<T = any> {
  data: T | null
  loading: boolean
  error: AppError | null
  refetch: () => Promise<void>
  isRefetching: boolean
}

// 通用變異鉤子返回類型
export interface UseMutationResult<TData = any, TVariables = any> {
  mutate: (variables: TVariables) => Promise<TData>
  mutateAsync: (variables: TVariables) => Promise<TData>
  data: TData | null
  loading: boolean
  error: AppError | null
  reset: () => void
}

// 通用分頁信息
export interface PaginationInfo {
  current: number
  pageSize: number
  total: number
  totalPages: number
  hasNext: boolean
  hasPrev: boolean
}

// 通用排序信息
export interface SortInfo {
  field: string
  order: 'asc' | 'desc'
}

// 通用過濾器信息
export interface FilterInfo {
  [key: string]: any
}

// 通用列表狀態
export interface ListState<T = any> {
  data: T[]
  loading: boolean
  error: AppError | null
  pagination: PaginationInfo
  filters: FilterInfo
  sort: SortInfo
  selectedKeys: string[]
  searchText: string
}

// 通用表單狀態
export interface FormState<T = any> {
  data: T
  loading: boolean
  error: AppError | null
  dirty: boolean
  submitting: boolean
  initialData: T
}

// 通用模態框狀態
export interface ModalState {
  visible: boolean
  loading: boolean
  title: string
  type: 'create' | 'edit' | 'view' | 'delete'
}

// 通用抽屜狀態
export interface DrawerState extends ModalState {
  width?: number | string
  placement?: 'top' | 'right' | 'bottom' | 'left'
}

// 通用確認對話框狀態
export interface ConfirmState {
  visible: boolean
  title: string
  content: string
  type: 'confirm' | 'warning' | 'error'
  onConfirm: () => void
  onCancel?: () => void
  confirmText?: string
  cancelText?: string
  loading?: boolean
}

// 通用搜索狀態
export interface SearchState {
  visible: boolean
  query: string
  results: SearchResult[]
  loading: boolean
  selectedIndex: number
}

// 搜索結果
export interface SearchResult {
  id: string
  title: string
  description?: string
  type: string
  category: string
  url: string
  icon?: React.ComponentType
  metadata?: Record<string, any>
}

// 通用選項類型
export interface OptionItem {
  label: string
  value: any
  disabled?: boolean
  children?: OptionItem[]
}

// 通用樹節點類型
export interface TreeNode {
  key: string
  title: string
  children?: TreeNode[]
  icon?: React.ReactNode
  disabled?: boolean
  selectable?: boolean
}

// 通用時間範圍
export interface TimeRange {
  start: string
  end: string
  label?: string
}

// 通用統計信息
export interface Statistics {
  total: number
  active: number
  inactive: number
  pending: number
  error: number
  [key: string]: number
}

// 通用指標數據
export interface MetricData {
  name: string
  value: number
  unit: string
  timestamp: string
  trend?: {
    value: number
    direction: 'up' | 'down' | 'stable'
    percentage: number
  }
}

// 通用圖表數據
export interface ChartData {
  labels: string[]
  datasets: {
    label: string
    data: number[]
    backgroundColor?: string | string[]
    borderColor?: string | string[]
    fill?: boolean
  }[]
}

// 通用配置項
export interface ConfigItem {
  key: string
  value: any
  type: 'string' | 'number' | 'boolean' | 'array' | 'object'
  label: string
  description?: string
  required?: boolean
  options?: OptionItem[]
}

// 通用設定組
export interface SettingsGroup {
  key: string
  title: string
  description?: string
  configs: ConfigItem[]
}

// 通用主題配置
export interface ThemeConfig {
  name: string
  colors: {
    primary: string
    secondary: string
    success: string
    warning: string
    error: string
    info: string
    text: string
    background: string
    border: string
  }
  typography: {
    fontFamily: string
    fontSize: {
      xs: string
      sm: string
      md: string
      lg: string
      xl: string
      xxl: string
    }
  }
  spacing: {
    xs: string
    sm: string
    md: string
    lg: string
    xl: string
    xxl: string
  }
  borderRadius: {
    sm: string
    md: string
    lg: string
    xl: string
  }
  shadows: {
    sm: string
    md: string
    lg: string
    xl: string
  }
}

// 通用佈局配置
export interface LayoutConfig {
  header: {
    height: number
    sticky: boolean
    showBreadcrumb: boolean
    showSearch: boolean
  }
  sidebar: {
    width: number
    collapsedWidth: number
    showCollapse: boolean
    theme: 'light' | 'dark'
  }
  content: {
    padding: number
    maxWidth?: number
  }
  footer: {
    height: number
    show: boolean
  }
}

// 通用應用配置
export interface AppConfig {
  name: string
  version: string
  environment: 'development' | 'staging' | 'production'
  api: {
    baseURL: string
    timeout: number
  }
  features: {
    [key: string]: boolean
  }
  themes: {
    available: string[]
    default: string
  }
  layouts: LayoutConfig
  i18n: {
    defaultLocale: string
    fallbackLocale: string
    supportedLocales: string[]
  }
  pagination: {
    defaultPageSize: number
    pageSizeOptions: number[]
  }
  upload: {
    maxSize: number
    allowedTypes: string[]
  }
}

// 通用工具函數類型
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P]
}

export type NonNullable<T> = T extends null | undefined ? never : T

export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>

// Required 類型有循環引用問題，先註釋掉
// export type Required<T, K extends keyof T> = Omit<T, K> & Required<Pick<T, K>>

// 通用事件處理器類型
export type EventHandler<T = any> = (event: T) => void

export type ChangeHandler<T = any> = (value: T) => void

export type ClickHandler = () => void

// 通用回調函數類型
export type VoidCallback = () => void

export type DataCallback<T> = (data: T) => void

export type ErrorCallback = (error: AppError) => void

export type SuccessCallback<T = any> = (data: T) => void

// 通用異步函數類型
export type AsyncVoidFunction = () => Promise<void>

export type AsyncDataFunction<T> = () => Promise<T>

export type AsyncCallback<T = any> = () => Promise<T>

// 通用 React 組件類型
export type FCWithChildren<P = {}> = React.FC<React.PropsWithChildren<P>>

export type ComponentWithClassName<P = {}> = React.FC<P & { className?: string }>

export type ComponentWithStyle<P = {}> = React.FC<P & { style?: React.CSSProperties }>

// 通用鍵值對類型
export type KeyValuePair<K = string, V = any> = {
  key: K
  value: V
}

// 通用識別符類型
export type ID = string | number

// 通用名稱類型
export type Name = string

// 通用描述類型
export type Description = string

// 通用標籤類型
export type Tag = string

// 通用版本類型
export type Version = string

// 通用 URL 類型
export type URL = string

// 通用路徑類型
export type Path = string

// 通用數組類型
export type ArrayOf<T> = T[]

// 通用對象類型
export type RecordOf<K extends string | number | symbol, V> = Record<K, V>

// 通用枚舉類型
export type EnumType<T> = T[keyof T]

// 通用工廠函數類型
export type Factory<T> = () => T

export type FactoryWithParams<T, P> = (params: P) => T

// 通用比較函數類型
export type Comparator<T> = (a: T, b: T) => number

export type Predicate<T> = (value: T) => boolean

export type Mapper<T, U> = (value: T) => U

export type Reducer<T, U> = (accumulator: U, value: T) => U