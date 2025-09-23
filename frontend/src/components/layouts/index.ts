/**
 * 佈局組件統一導出
 * 提供簡化的佈局 API
 */

// 重新導出 PageMode 類型
export type PageMode = 'default' | 'table' | 'dashboard' | 'form' | 'detail' | 'wizard' | 'split'

// 基礎佈局組件 - 命名導出
export { BaseLayout, LayoutLoadingSkeleton, LayoutErrorFallback } from './BaseLayout'
export type { BaseLayoutProps, BaseLayoutConfig, SpacingConfig, SidebarConfig } from './BaseLayout'

// 表格佈局組件 - 命名導出
export { TableLayout } from './TableLayout'
export type { TableLayoutProps, TableLayoutConfig, TableContainerConfig } from './TableLayout'

// 表單佈局組件 - 命名導出
export { FormLayout } from './FormLayout'
export type { FormLayoutProps, FormLayoutConfig, FormContainerConfig } from './FormLayout'

// 統一導出所有佈局組件 - 使用命名導出
export { StandardLayout } from './StandardLayout'
export { DashboardLayout } from './DashboardLayout'
export { DetailLayout } from './DetailLayout'

// 導出所有類型
export type { StandardLayoutProps, StandardLayoutConfig } from './StandardLayout'
export type { DashboardLayoutProps, DashboardLayoutConfig } from './DashboardLayout'
export type { DetailLayoutProps, DetailLayoutConfig } from './DetailLayout'
export type { GridLayoutConfig, PanelConfig } from './DashboardLayout'
export type { DetailContainerConfig, SidebarSectionsConfig } from './DetailLayout'

// 簡化的預設配置 - 按使用場景組織
export const LayoutPresets = {
  // 列表頁面配置
  list: {
    mode: 'table' as const,
    spacing: { content: '16px' },
    sidebar: { show: false },
  },

  // 表單頁面配置
  form: {
    mode: 'form' as const,
    spacing: { content: '24px' },
    sidebar: { show: false },
  },

  // 儀表板頁面配置
  dashboard: {
    mode: 'dashboard' as const,
    spacing: { content: '24px' },
    sidebar: { show: true, position: 'left' as const, width: 240 },
  },

  // 詳情頁面配置
  detail: {
    mode: 'detail' as const,
    spacing: { content: '16px' },
    sidebar: { show: true, position: 'right' as const, width: 300 },
  },
} as const
