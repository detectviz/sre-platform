// 基礎 UI 組件
export { ContextualKPICard } from './ContextualKPICard'
export { ToolbarActions } from './ToolbarActions'
export { PageHeader } from './PageHeader'
export { NotificationCenter } from './NotificationCenter'
export { UserMenu } from './UserMenu'
export { GrafanaDashboard } from './GrafanaDashboard'
export { default as GlobalSearch } from './GlobalSearch'
export { LazyRoute } from './LazyRoute'
export { default as DataTablePage } from './DataTablePage'
export { default as DataTablePageTemplate, ExampleListPage } from './DataTablePageTemplate'
export { default as PageLayout } from './PageLayout'

// 佈局組件 - 統一使用命名導出
export {
  BaseLayout,
  LayoutLoadingSkeleton,
  LayoutErrorFallback,
  TableLayout,
  FormLayout,
  StandardLayout,
  DashboardLayout,
  DetailLayout,
  LayoutPresets
} from './layouts'
export type {
  BaseLayoutProps,
  BaseLayoutConfig
} from './layouts/BaseLayout'
export type {
  TableLayoutProps,
  TableLayoutConfig
} from './layouts/TableLayout'
export type {
  FormLayoutProps,
  FormLayoutConfig
} from './layouts/FormLayout'
export type {
  StandardLayoutProps,
  StandardLayoutConfig
} from './layouts/StandardLayout'
export type {
  DashboardLayoutProps,
  DashboardLayoutConfig
} from './layouts/DashboardLayout'
export type {
  DetailLayoutProps,
  DetailLayoutConfig
} from './layouts/DetailLayout'

// 表單工廠組件
export { FormFactory, FormBuilder, FormTemplates } from './forms/FormFactory'

// 工具函數
export { createActionColumn, COMMON_ACTIONS } from '../utils/tableActions'

// 常量配置
export {
  DEFAULT_PAGINATION,
  DEFAULT_TABLE_STYLE,
  TABLE_SIZE_OPTIONS,
  getDefaultTableProps,
  DEFAULT_SEARCH_PROPS
} from '../constants/table'

export type { TableSize } from '../constants/table'

// 統一的表格樣式配置 (向後兼容)
export const UNIFIED_TABLE_STYLE = {
  background: 'var(--bg-elevated)',
  border: '1px solid var(--border-light)',
  borderRadius: 'var(--radius-lg)',
}

export const UNIFIED_TABLE_PAGINATION = {
  showSizeChanger: true,
  showQuickJumper: true,
  showTotal: (total: number, range: [number, number]) => `第 ${range[0]}-${range[1]} 項，共 ${total} 項`,
} as const

// 頁面模式枚舉
export type PageMode = 'default' | 'table' | 'dashboard' | 'form' | 'detail' | 'wizard' | 'split'

// 類型導出
export type { FilterOption } from '../types/components'
export type { ToolbarAction } from '../types/components'
export type { ColumnOption } from '../types/components'
export type { KPICardData, TableAction, DataTablePageConfig } from './DataTablePage'

// PageLayout 相關類型
export type {
  PageLayoutConfig
} from './PageLayout'

// 表單工廠相關類型
export type {
  FormFactoryProps,
  FormField,
  FormFieldOption,
  FormFieldValidation
} from '../types/components'
