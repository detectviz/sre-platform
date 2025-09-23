import React from 'react'
import { Button, Space, Tooltip, Popconfirm } from 'antd'
import { DeleteOutlined, EditOutlined, EyeOutlined, MoreOutlined, ReloadOutlined, DownloadOutlined } from '@ant-design/icons'
import { Dropdown, MenuProps } from 'antd'

// 表格操作類型定義
export interface TableAction {
  key: string
  label: string
  icon: React.ComponentType
  onClick: (record: any) => void
  type?: 'primary' | 'default' | 'dashed' | 'text' | 'link'
  danger?: boolean
  disabled?: (record: any) => boolean
  confirm?: {
    title: string
    description?: string
  }
}

// 預定義的常用操作配置
export const COMMON_ACTIONS = {
  VIEW: {
    key: 'view',
    label: '查看詳情',
    icon: EyeOutlined,
    type: 'text' as const
  },

  EDIT: {
    key: 'edit',
    label: '編輯',
    icon: EditOutlined,
    type: 'text' as const
  },

  DELETE: {
    key: 'delete',
    label: '刪除',
    icon: DeleteOutlined,
    type: 'text' as const,
    danger: true,
    confirm: {
      title: '確定要刪除這項嗎？'
    }
  },

  REFRESH: {
    key: 'refresh',
    label: '刷新',
    icon: ReloadOutlined,
    type: 'text' as const
  },

  EXPORT: {
    key: 'export',
    label: '導出',
    icon: DownloadOutlined,
    type: 'text' as const
  }
}

// 創建操作的工具函數
export const createAction = (
  key: string,
  label: string,
  icon: React.ComponentType,
  onClick: (record: any) => void,
  options?: Partial<TableAction>
): TableAction => ({
  key,
  label,
  icon,
  onClick,
  type: 'text' as const,
  ...options
})

// 創建帶確認的操作
export const createConfirmAction = (
  key: string,
  label: string,
  icon: React.ComponentType,
  onClick: (record: any) => void,
  confirmTitle = '確定要執行這項操作嗎？',
  options?: Partial<TableAction>
): TableAction => ({
  key,
  label,
  icon,
  onClick,
  type: 'text' as const,
  confirm: {
    title: confirmTitle
  },
  ...options
})

// 創建操作列的工廠函數
export const createActionColumn = <T = any>(
  actions: TableAction[],
  options?: {
    width?: number
    fixed?: 'left' | 'right'
    showMore?: boolean
    maxActions?: number
  }
) => {
  const { width = 120, fixed, showMore = true, maxActions = 3 } = options || {}

  return {
    title: '操作',
    key: 'action',
    width,
    fixed,
    render: (_: any, record: T) => (
      <ActionButtons
        actions={actions}
        record={record}
        showMore={showMore}
        maxActions={maxActions}
      />
    ),
  }
}

// 操作按鈕組件
interface ActionButtonsProps<T = any> {
  actions: TableAction[]
  record: T
  showMore?: boolean
  maxActions?: number
}

const ActionButtons = <T = any>({ actions, record, showMore = true, maxActions = 3 }: ActionButtonsProps<T>) => {
  const visibleActions = actions.slice(0, maxActions)
  const hiddenActions = actions.slice(maxActions)

  const renderActionButton = (action: TableAction) => {
    const Icon = action.icon
    const disabled = action.disabled?.(record) || false

    const buttonProps = {
      type: action.type || 'text',
      size: 'small' as const,
      danger: action.danger,
      disabled,
      icon: <Icon />,
      onClick: () => action.onClick(record),
    }

    if (action.confirm) {
      return (
        <Popconfirm
          key={action.key}
          title={action.confirm.title}
          description={action.confirm.description}
          onConfirm={() => action.onClick(record)}
          okText="確定"
          cancelText="取消"
        >
          <Button {...buttonProps}>
            {action.label}
          </Button>
        </Popconfirm>
      )
    }

    return (
      <Tooltip key={action.key} title={action.label}>
        <Button {...buttonProps} />
      </Tooltip>
    )
  }

  return (
    <Space size="small">
      {visibleActions.map(renderActionButton)}

      {showMore && hiddenActions.length > 0 && (
        <Dropdown
          menu={{
            items: hiddenActions.map(action => ({
              key: action.key,
              label: action.label,
              icon: <action.icon />,
              onClick: () => action.onClick(record),
              disabled: action.disabled?.(record) || false,
              danger: action.danger,
            })) as MenuProps['items'],
          }}
          trigger={['click']}
        >
          <Button type="text" size="small" icon={<MoreOutlined />} />
        </Dropdown>
      )}
    </Space>
  )
}

// 批量操作工廠
export const createBatchActions = (actions: {
  key: string
  label: string
  onClick: (selectedKeys: React.Key[]) => void
  disabled?: boolean
}[]) => {
  return actions.map(action => ({
    key: action.key,
    label: action.label,
    onClick: action.onClick,
    disabled: action.disabled || false,
  }))
}

// 導出工具函數 (已在上面定義)
