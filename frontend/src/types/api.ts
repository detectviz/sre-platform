/**
 * API 相關類型定義
 * 統一管理所有 API 請求和響應的類型
 */

// 通用 API 響應格式
export interface ApiResponse<T = any> {
  code: number
  message: string
  data: T
  success: boolean
  timestamp: string
}

// 分頁請求參數
export interface PaginationParams {
  page?: number
  pageSize?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  search?: string
}

// 分頁響應格式
export interface PaginationResponse<T = any> {
  items: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

// 過濾器參數
export interface FilterParams {
  [key: string]: any
}

// 排序參數
export interface SortParams {
  field: string
  order: 'asc' | 'desc'
}

// 列表查詢參數
export interface ListParams extends PaginationParams, FilterParams {
  sort?: SortParams
}

// 通用實體接口
export interface BaseEntity {
  id: string
  created_at: string
  updated_at: string
  created_by?: string
  updated_by?: string
}

// 狀態枚舉
export enum Status {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  PENDING = 'pending',
  DELETED = 'deleted'
}

// 優先級枚舉
export enum Priority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

// 資源類型枚舉
export enum ResourceType {
  SERVER = 'server',
  DATABASE = 'database',
  CACHE = 'cache',
  GATEWAY = 'gateway',
  SERVICE = 'service',
  CONTAINER = 'container'
}

// 通知類型枚舉
export enum NotificationType {
  EMAIL = 'email',
  SLACK = 'slack',
  WEBHOOK = 'webhook',
  SMS = 'sms',
  LINE = 'line'
}

// 事件嚴重程度枚舉
export enum EventSeverity {
  INFO = 'info',
  WARNING = 'warning',
  ERROR = 'error',
  CRITICAL = 'critical'
}

// 審計操作類型枚舉
export enum AuditAction {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LOGIN = 'login',
  LOGOUT = 'logout',
  EXPORT = 'export'
}
