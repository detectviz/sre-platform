import { useState, ReactNode } from 'react'
import { Tabs, Table } from 'antd'
import { ReloadOutlined, PlusOutlined } from '@ant-design/icons'
import { PageHeader } from './PageHeader'
import { ContextualKPICard } from './ContextualKPICard'
import { ToolbarActions } from './ToolbarActions'
import { CategoryFilter } from './CategoryFilter'
import { UNIFIED_TABLE_STYLE } from './index'
import type { ColumnsType } from 'antd/es/table'


// KPI 數據接口
export interface KPICardData {
  title: string
  value: string
  description: string
  trend?: string
  status: 'success' | 'warning' | 'danger' | 'info'
}

// 表格操作接口
export interface TableAction {
  key: string
  label: string
  icon?: ReactNode
  onClick?: (record: any) => void
  type?: 'primary' | 'default' | 'danger' | 'link' | 'text'
  disabled?: boolean
  visible?: (record: any) => boolean
}

// 工具列操作接口
export interface ToolbarAction {
  key: string
  label: string
  icon: ReactNode
  onClick?: () => void
  type?: 'primary' | 'default' | 'dashed' | 'text' | 'link' | string
  danger?: boolean
  disabled?: boolean
  loading?: boolean
}

// 頁面配置接口
export interface DataTablePageConfig<T = any> {
  // 頁面基本信息
  title: string
  subtitle?: string

  // KPI 數據
  kpiData?: KPICardData[]

  // 表格配置
  columns: ColumnsType<T>
  dataSource: T[]
  tableProps?: {
    loading?: boolean
    pagination?: boolean
    rowKey?: string
    expandable?: any
    scroll?: { x?: number; y?: number }
    size?: 'small' | 'middle' | 'large'
    rowSelection?: any
  }

  // 工具列配置
  toolbarActions?: ToolbarAction[]
  showRefresh?: boolean
  showSearch?: boolean
  showExport?: boolean

  // 分類篩選
  categoryFilter?: {
    categories: Array<{ key: string; label: string; count: number; color: string }>
    onCategoryChange: (category: string) => void
    selectedCategory: string
  }

  // Tabs 配置（可選）
  tabs?: Array<{
    key: string
    label: string
    icon?: ReactNode
    children?: ReactNode
  }>

  // 事件處理
  onRefresh?: () => void
  onSearch?: (searchText: string) => void
  onExport?: () => void
  onAdd?: () => void

  // 其他配置
  extraContent?: ReactNode
  className?: string
}

// 高階組件 Props
export interface DataTablePageProps<T = any> extends DataTablePageConfig<T> {
  children?: ReactNode
}

const DataTablePage = <T extends Record<string, any>>(props: DataTablePageProps<T>): JSX.Element => {
  const {
    title,
    subtitle,
    kpiData = [],
    columns,
    dataSource,
    tableProps = {},
    toolbarActions = [],
    showRefresh = true,
    showSearch = true,
    showExport = true,
    categoryFilter,
    tabs,
    onRefresh,
    onSearch,
    onExport,
    onAdd,
    extraContent,
    className,
    children,
  } = props

  // 搜索狀態
  const [searchText, setSearchText] = useState('')

  // 刷新處理
  const handleRefresh = () => {
    if (onRefresh) {
      onRefresh()
    } else {
      console.log('刷新數據')
    }
  }

  // 搜索處理
  const handleSearch = (value: string) => {
    setSearchText(value)
    if (onSearch) {
      onSearch(value)
    } else {
      console.log('搜索:', value)
    }
  }

  // 導出處理
  const handleExport = () => {
    if (onExport) {
      onExport()
    } else {
      console.log('導出數據')
    }
  }

  // 新增處理
  const handleAdd = () => {
    if (onAdd) {
      onAdd()
    } else {
      console.log('新增項目')
    }
  }

  // 默認工具列動作
  const defaultToolbarActions: ToolbarAction[] = [
    ...(showRefresh ? [{
      key: 'refresh',
      label: '刷新',
      icon: <ReloadOutlined />,
      onClick: handleRefresh,
    }] : []),
    ...(showSearch ? [{
      key: 'search',
      label: '搜索',
      icon: <ReloadOutlined />,
      onClick: () => handleSearch(searchText),
    }] : []),
    ...(showExport ? [{
      key: 'export',
      label: '導出',
      icon: <ReloadOutlined />,
      onClick: handleExport,
    }] : []),
    ...(onAdd ? [{
      key: 'add',
      label: '新增',
      icon: <PlusOutlined />,
      type: 'primary',
      onClick: handleAdd,
    }] : []),
    ...toolbarActions,
  ]

  // 表格配置
  const tableConfig = {
    columns,
    dataSource,
    size: 'middle' as const,
    style: UNIFIED_TABLE_STYLE,
    pagination: tableProps.pagination !== false ? {
      showSizeChanger: true,
      showQuickJumper: true,
      showTotal: (total: number, range: [number, number]) => `第 ${range[0]}-${range[1]} 項，共 ${total} 項`,
    } : tableProps.pagination,
  }

  // 渲染內容
  const renderContent = () => {
    if (tabs && tabs.length > 0) {
      // 有 Tabs 的情況
      return (
        <Tabs
          defaultActiveKey={tabs[0]?.key}
          items={tabs.map(tab => ({
            ...tab,
            children: tab.children || (
              <div style={{ padding: '24px 0' }}>
                <Table {...tableConfig} />
              </div>
            ),
          }))}
        />
      )
    } else {
      // 無 Tabs 的情況
      return (
        <>
          {/* 工具列 */}
          <ToolbarActions
            actions={defaultToolbarActions}
            onRefresh={handleRefresh}
            onSearch={(value) => handleSearch(value)}
            onExport={handleExport}
            showRefresh={showRefresh}
            showSearch={showSearch}
            showExport={showExport}
          />

          {/* 表格 */}
          <Table {...tableConfig} />

          {/* 額外內容 */}
          {extraContent}
        </>
      )
    }
  }

  return (
    <div className={className}>
      {/* 頁面標題 */}
      <PageHeader
        title={title}
        subtitle={subtitle}
      />

      {/* KPI 卡片 */}
      {kpiData.length > 0 && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: 'var(--spacing-lg)',
            marginBottom: 'var(--spacing-2xl)',
          }}
        >
          {kpiData.map((item, index) => (
            <ContextualKPICard
              key={index}
              title={item.title}
              value={item.value}
              description={item.description}
              trend={item.trend}
              status={item.status}
            />
          ))}
        </div>
      )}

      {/* 分類篩選 */}
      {categoryFilter && (
        <div style={{ marginBottom: 'var(--spacing-lg)' }}>
          <CategoryFilter
            categories={categoryFilter.categories}
            onCategoryChange={categoryFilter.onCategoryChange}
            selectedCategory={categoryFilter.selectedCategory}
          />
        </div>
      )}

      {/* 主要內容 */}
      {renderContent()}

      {/* 子組件 */}
      {children}
    </div>
  )
}

export default DataTablePage
