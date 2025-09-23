/**
 * 統一的表格配置常量
 * 解決分頁配置和表格樣式重複問題
 */

// 統一的分頁配置
export const DEFAULT_PAGINATION = {
  showSizeChanger: true,
  showQuickJumper: true,
  showTotal: (total: number, range: [number, number]) =>
    `第 ${range[0]}-${range[1]} 項，共 ${total} 項`,
  pageSizeOptions: [10, 20, 50, 100],
  defaultPageSize: 20,
}

// 統一的表格樣式
export const DEFAULT_TABLE_STYLE = {
  borderRadius: 'var(--radius-lg)',
  boxShadow: 'var(--shadow-sm)',
}

// 統一的表格大小選項
export const TABLE_SIZE_OPTIONS = ['small', 'middle', 'large'] as const
export type TableSize = typeof TABLE_SIZE_OPTIONS[number]

// 統一的表格 props 模板
export const getDefaultTableProps = (loading = false) => ({
  size: 'middle' as const,
  loading,
  pagination: DEFAULT_PAGINATION,
  scroll: { x: 1200 },
  rowKey: 'id',
})

// 統一的搜索配置
export const DEFAULT_SEARCH_PROPS = {
  placeholder: '搜尋...',
  allowClear: true,
  enterButton: '搜索',
}

// 表格操作類型定義
export interface TableAction {
  key: string
  label: string
  icon: React.ComponentType
  onClick: (record: any) => void
  type?: 'primary' | 'default' | 'dashed' | 'text' | 'link'
  danger?: boolean
  disabled?: (record: any) => boolean
}

// 表格列配置類型
export interface TableColumn<T = any> {
  title: string
  dataIndex: keyof T
  key: string
  width?: number
  fixed?: 'left' | 'right'
  sorter?: boolean
  sortDirections?: ['ascend', 'descend']
  render?: (value: any, record: T, index: number) => React.ReactNode
  filters?: { text: string; value: any }[]
  onFilter?: (value: any, record: T) => boolean
  ellipsis?: boolean
}

// 表格配置接口
export interface TableConfig<T = any> {
  columns: TableColumn<T>[]
  actions?: TableAction[]
  showActions?: boolean
  loading?: boolean
  dataSource?: T[]
  pagination?: false | typeof DEFAULT_PAGINATION
  scroll?: { x?: number; y?: number }
}
