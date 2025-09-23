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

// 類型導出
export type { FilterOption } from '../types/components'
export type { ToolbarAction } from '../types/components'
export type { ColumnOption } from '../types/components'
export type { KPICardData, TableAction, ToolbarAction as ToolbarActionType, DataTablePageConfig } from './DataTablePage'

// 通用的表格樣式配置
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
