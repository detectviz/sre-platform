/**
 * 表格相關組件和工具函數統一導出
 */

// 表格操作工具
export { createActionColumn, COMMON_ACTIONS } from './tableActions'

// 表格操作類型
export type { TableAction } from './tableActions'

// 常用表格操作配置
export const TABLE_ACTION_PRESETS = {
  // 查看操作
  VIEW: {
    key: 'view',
    label: '查看',
    icon: 'EyeOutlined',
    type: 'text' as const,
  },

  // 編輯操作
  EDIT: {
    key: 'edit',
    label: '編輯',
    icon: 'EditOutlined',
    type: 'link' as const,
  },

  // 刪除操作
  DELETE: {
    key: 'delete',
    label: '刪除',
    icon: 'DeleteOutlined',
    type: 'text' as const,
    danger: true,
    confirm: {
      title: '確認刪除',
      description: '此操作無法恢復，是否繼續？',
    },
  },

  // 啟用操作
  ENABLE: {
    key: 'enable',
    label: '啟用',
    icon: 'CheckOutlined',
    type: 'text' as const,
  },

  // 停用操作
  DISABLE: {
    key: 'disable',
    label: '停用',
    icon: 'StopOutlined',
    type: 'text' as const,
  },
} as const

// 表格樣式預設
export const TABLE_STYLE_PRESETS = {
  compact: {
    size: 'small' as const,
    scroll: { x: 800 },
  },
  standard: {
    size: 'middle' as const,
    scroll: { x: 1200 },
  },
  comfortable: {
    size: 'large' as const,
    scroll: { x: 1400 },
  },
} as const
