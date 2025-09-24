import React from 'react'
import { Space, Button, Input, Tooltip, Select, Badge, Popover } from 'antd'
import {
  ReloadOutlined,
  SearchOutlined,
  DownloadOutlined,
  PlusOutlined,
  FilterOutlined,
  EyeOutlined,
} from '@ant-design/icons'
import type { ToolbarAction } from '../types/components'

const { Search } = Input
const { Option } = Select

export interface FilterOption {
  key: string
  label: string
  options: { value: string; label: string }[]
  value?: string
  onChange?: (value: string) => void
}

// ToolbarAction 已移至 types/components.ts

export interface ColumnOption {
  key: string
  label: string
  visible?: boolean
}

export interface ToolbarActionsProps {
  actions?: ToolbarAction[]
  searchPlaceholder?: string
  onSearch?: (value: string) => void
  onRefresh?: () => void
  onExport?: () => void
  onAIAnalysis?: () => void
  showSearch?: boolean
  showRefresh?: boolean
  showExport?: boolean
  showAdd?: boolean
  showColumnSettings?: boolean
  extraContent?: React.ReactNode
  useDefaultActions?: boolean
  filters?: FilterOption[]
  showFilters?: boolean
  filterCount?: number
  columns?: ColumnOption[]
  onColumnChange?: (key: string, visible: boolean) => void
  onColumnReset?: () => void
  middleContent?: React.ReactNode
  middleContentPosition?: 'left' | 'center' | 'right'
}

export const ToolbarActions: React.FC<ToolbarActionsProps> = ({
  actions = [],
  searchPlaceholder = '搜尋...',
  onSearch,
  onRefresh,
  onExport,
  showSearch = false,
  showRefresh = false,
  showExport = true,
  showAdd = false,
  showColumnSettings = false,
  extraContent,
  useDefaultActions = actions.length === 0,
  filters = [],
  showFilters = filters.length > 0,
  filterCount = 0,
  columns = [],
  onColumnChange,
  onColumnReset,
  middleContent,
  middleContentPosition = 'center',
}) => {
  const renderColumnSettingsContent = () => (
    <div style={{
      width: '280px',
      maxHeight: '320px',
      padding: 'var(--spacing-md)',
      backgroundColor: 'var(--bg-container)',
      border: '1px solid var(--border-light)',
      borderRadius: 'var(--radius-lg)'
    }}>
      <div style={{
        marginBottom: 'var(--spacing-sm)',
        paddingBottom: 'var(--spacing-sm)',
        borderBottom: '1px solid var(--border-light)'
      }}>
        <div style={{
          fontSize: '14px',
          fontWeight: 600,
          color: 'var(--text-primary)',
          marginBottom: 'var(--spacing-xs)'
        }}>
          欄位顯示設定
        </div>
        {onColumnReset && (
          <Button
            type="text"
            size="small"
            onClick={onColumnReset}
            style={{
              color: 'var(--text-secondary)',
              fontSize: '11px',
              padding: '0'
            }}
          >
            重設為預設
          </Button>
        )}
      </div>

      <div style={{ maxHeight: '240px', overflowY: 'auto' }}>
        {columns.map((column) => (
          <div
            key={column.key}
            style={{
              display: 'flex',
              alignItems: 'center',
              padding: 'var(--spacing-sm)',
              marginBottom: '2px',
              borderRadius: 'var(--radius-sm)',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            onClick={() => onColumnChange?.(column.key, !(column.visible !== false))}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent'
            }}
          >
            <div style={{
              width: '14px',
              height: '14px',
              borderRadius: '2px',
              border: '1px solid',
              borderColor: column.visible !== false ? 'var(--brand-primary)' : 'var(--border-color)',
              backgroundColor: column.visible !== false ? 'var(--brand-primary)' : 'transparent',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: 'var(--spacing-sm)',
              flexShrink: 0
            }}>
              {column.visible !== false && (
                <span style={{
                  color: 'white',
                  fontSize: '9px',
                  fontWeight: 'bold'
                }}>✓</span>
              )}
            </div>
            <span style={{
              color: column.visible !== false ? 'var(--text-primary)' : 'var(--text-secondary)',
              fontSize: '13px',
              flex: 1
            }}>
              {column.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  )

  const renderFilterContent = () => (
    <div style={{ width: '280px', padding: 'var(--spacing-md)' }}>
      {filters.map((filter) => (
        <div key={filter.key} style={{ marginBottom: 'var(--spacing-md)' }}>
          <div style={{
            color: 'var(--text-secondary)',
            fontSize: '14px',
            marginBottom: 'var(--spacing-sm)',
            fontWeight: 500
          }}>
            {filter.label}:
          </div>
          <Select
            value={filter.value ?? filter.options[0]?.value ?? null}
            onChange={filter.onChange!}
            style={{ width: '100%' }}
            size="middle"
            placeholder={`選擇${filter.label}`}
          >
            {filter.options.map((option: { value: string; label: string }) => (
              <Option key={option.value} value={option.value}>
                {option.label}
              </Option>
            ))}
          </Select>
        </div>
      ))}
    </div>
  )

  const defaultActions: ToolbarAction[] = [
    ...(showRefresh && onRefresh ? [{
      key: 'refresh',
      label: '刷新',
      icon: <ReloadOutlined />,
      onClick: onRefresh,
      tooltip: '刷新數據'
    }] : []),
    ...(showSearch ? [{
      key: 'search',
      label: '搜尋',
      icon: <SearchOutlined />,
      onClick: () => { },
      tooltip: '搜尋篩選'
    }] : []),
    ...(showExport && onExport ? [{
      key: 'export',
      label: '匯出',
      icon: <DownloadOutlined />,
      onClick: onExport,
      tooltip: '匯出數據'
    }] : []),
    ...(showAdd ? [{
      key: 'add',
      label: '新增',
      icon: <PlusOutlined />,
      onClick: () => { },
      type: 'primary',
      tooltip: '新增項目'
    }] : []),
  ]

  const allActions = useDefaultActions ? [...defaultActions, ...actions] : actions

  return (
    <div style={{ width: '100%', marginBottom: 'var(--spacing-xl)' }}>
      {/* 當 middleContent 設為 left 時，使用不同的佈局 */}
      {middleContent && middleContentPosition === 'left' ? (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          width: '100%'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: (showSearch && onSearch) || (showFilters && filters.length > 0) ? 'var(--spacing-md)' : '0'
          }}>
            {/* 左側搜尋和篩選 */}
            {showSearch && onSearch && (
              <Search
                placeholder={searchPlaceholder}
                onSearch={onSearch}
                style={{ width: 320 }}
                allowClear
              />
            )}

            {showFilters && filters.length > 0 && (
              <Popover
                content={renderFilterContent()}
                trigger="click"
                placement="bottomLeft"
              >
                <Badge count={filterCount} size="small">
                  <Button
                    className="toolbar-btn"
                    icon={<FilterOutlined />}
                    type={filterCount > 0 ? "primary" : "default"}
                  >
                    篩選
                  </Button>
                </Badge>
              </Popover>
            )}

            {/* 中間內容緊接在左側，如果沒有左側內容則直接靠左 */}
            {middleContent}
          </div>

          <Space size="middle">
            {/* 右側操作按鈕 */}
            {showColumnSettings && columns.length > 0 && onColumnChange && (
              <Popover
                content={renderColumnSettingsContent()}
                trigger="click"
                placement="bottomRight"
              >
                <Button
                  className="toolbar-btn"
                  icon={<EyeOutlined />}
                >
                  欄位設定
                </Button>
              </Popover>
            )}

            {allActions.map((action) => (
              <Tooltip key={action.key} title={action.tooltip || action.label}>
                <Button
                  className="toolbar-btn"
                  icon={action.icon}
                  onClick={action.onClick}
                  type={action.type as 'primary' | 'default' | 'dashed' | 'text' | 'link'}
                  danger={action.danger}
                  disabled={action.disabled!}
                  loading={action.loading!}
                  size="middle"
                >
                  {action.label}
                </Button>
              </Tooltip>
            ))}

            {extraContent}
          </Space>
        </div>
      ) : (
        /* 原有的佈局邏輯 */
        <Space size="middle" style={{ width: '100%', justifyContent: 'space-between' }}>
          <Space size="middle">
            {showSearch && onSearch && (
              <Search
                placeholder={searchPlaceholder}
                onSearch={onSearch}
                style={{ width: 320 }}
                allowClear
              />
            )}

            {/* 篩選器按鈕 */}
            {showFilters && filters.length > 0 && (
              <Popover
                content={renderFilterContent()}
                trigger="click"
                placement="bottomLeft"
              >
                <Badge count={filterCount} size="small">
                  <Button
                    className="toolbar-btn"
                    icon={<FilterOutlined />}
                    type={filterCount > 0 ? "primary" : "default"}
                  >
                    篩選
                  </Button>
                </Badge>
              </Popover>
            )}
          </Space>

          {/* 中間內容 - 居中對齊 */}
          {middleContent && middleContentPosition === 'center' && (
            <div style={{ display: 'flex', alignItems: 'center', flex: 1, justifyContent: 'center' }}>
              {middleContent}
            </div>
          )}

          {/* 中間內容 - 靠右對齊 */}
          {middleContent && middleContentPosition === 'right' && (
            <div style={{ display: 'flex', alignItems: 'center' }}>
              {middleContent}
            </div>
          )}

          <Space size="middle">
            {/* 欄位設定按鈕 */}
            {showColumnSettings && columns.length > 0 && onColumnChange && (
              <Popover
                content={renderColumnSettingsContent()}
                trigger="click"
                placement="bottomRight"
              >
                <Button
                  className="toolbar-btn"
                  icon={<EyeOutlined />}
                >
                  欄位設定
                </Button>
              </Popover>
            )}

            {/* 操作按鈕 */}
            {allActions.map((action) => (
              <Tooltip key={action.key} title={action.tooltip || action.label}>
                <Button
                  className="toolbar-btn"
                  icon={action.icon}
                  onClick={action.onClick}
                  type={action.type as 'primary' | 'default' | 'dashed' | 'text' | 'link'}
                  danger={action.danger}
                  disabled={action.disabled!}
                  loading={action.loading!}
                  size="middle"
                >
                  {action.label}
                </Button>
              </Tooltip>
            ))}

            {extraContent}
          </Space>
        </Space>
      )}
    </div>
  )
}
