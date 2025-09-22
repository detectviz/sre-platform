import React from 'react'
import { Space, Button, Input, Tooltip } from 'antd'
import {
  ReloadOutlined,
  SearchOutlined,
  DownloadOutlined,
  PlusOutlined,
} from '@ant-design/icons'

const { Search } = Input

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
}

export interface ToolbarActionsProps {
  actions?: ToolbarAction[]
  searchPlaceholder?: string
  onSearch?: (value: string) => void
  onRefresh?: () => void
  showSearch?: boolean
  showRefresh?: boolean
  showExport?: boolean
  showAdd?: boolean
  extraContent?: React.ReactNode
}

export const ToolbarActions: React.FC<ToolbarActionsProps> = ({
  actions = [],
  searchPlaceholder = '搜尋...',
  onSearch,
  onRefresh,
  showSearch = true,
  showRefresh = true,
  showExport = true,
  showAdd = false,
  extraContent,
}) => {
  const defaultActions: ToolbarAction[] = [
    ...(showRefresh ? [{
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
    ...(showExport ? [{
      key: 'export',
      label: '匯出',
      icon: <DownloadOutlined />,
      onClick: () => { },
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

  const allActions = [...defaultActions, ...actions]

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      gap: 'var(--spacing-lg)',
      padding: 'var(--spacing-md) 0',
    }}>
      <Space size="middle">
        {allActions.map((action) => (
          <Tooltip key={action.key} title={action.tooltip}>
            <Button
              icon={action.icon}
              onClick={action.onClick}
              type={action.type && ['primary', 'default', 'dashed', 'text', 'link'].includes(action.type) ? action.type as 'primary' | 'default' | 'dashed' | 'text' | 'link' : 'text'}
              danger={action.danger}
              disabled={action.disabled}
              loading={action.loading}
              size="middle"
            >
              {action.label}
            </Button>
          </Tooltip>
        ))}
      </Space>

      <Space size="middle">
        {extraContent}
        {showSearch && onSearch && (
          <Search
            placeholder={searchPlaceholder}
            onSearch={onSearch}
            style={{ width: 200 }}
            allowClear
          />
        )}
      </Space>
    </div>
  )
}
