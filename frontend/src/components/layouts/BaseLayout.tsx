import React, { type ReactNode } from 'react'
import { COMMON_STYLES } from '../../constants/theme'

// 頁面模式枚舉
export type PageMode = 'default' | 'table' | 'dashboard' | 'form' | 'detail' | 'wizard' | 'split'

// 簡化的頁面佈局配置接口 - 採用組合式設計
export interface BaseLayoutConfig {
  // 頁面模式
  mode?: PageMode

  // 載入和錯誤狀態
  loading?: boolean
  error?: Error | null

  // 可選的載入和錯誤狀態組件
  loadingSkeleton?: ReactNode
  errorFallback?: ReactNode

  // 可選的間距配置
  spacing?: SpacingConfig

  // 可選的側邊欄配置
  sidebar?: SidebarConfig

  // 響應式設置 (保留以備將來擴展)
  responsive?: boolean
}

// 組合式配置接口 - 更清晰的職責分離
export interface SpacingConfig {
  header?: string
  content?: string
  footer?: string
}

export interface SidebarConfig {
  show?: boolean
  width?: number
  position?: 'left' | 'right'
}

// 基礎佈局 Props
export interface BaseLayoutProps {
  header: ReactNode
  content: ReactNode
  sidebar?: ReactNode
  footer?: ReactNode
  config?: BaseLayoutConfig
  className?: string
  style?: React.CSSProperties
}

// 載入狀態組件
export const LayoutLoadingSkeleton: React.FC<{ mode?: PageMode }> = ({ mode: _mode = 'default' }) => (
  <div style={{ padding: 24 }}>
    <div style={{ marginBottom: 16 }}>
      <div style={{ height: 32, background: 'var(--bg-skeleton)', borderRadius: 'var(--radius-md)', marginBottom: 8 }} />
      <div style={{ height: 16, background: 'var(--bg-skeleton)', borderRadius: 'var(--radius-sm)', width: '60%' }} />
    </div>
    <div style={{ height: 200, background: 'var(--bg-skeleton)', borderRadius: 'var(--radius-md)' }} />
  </div>
)

// 錯誤狀態組件
export const LayoutErrorFallback: React.FC<{ error: Error; onRetry?: () => void }> = ({ error, onRetry }) => (
  <div style={{
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 48,
    textAlign: 'center'
  }}>
    <div style={{ maxWidth: 400, marginBottom: 16 }}>
      <h2 style={{ marginBottom: 8 }}>出錯了</h2>
      <p style={{ color: 'var(--text-secondary)', marginBottom: 16 }}>
        {error.message || '發生未知錯誤'}
      </p>
      {onRetry && (
        <button
          onClick={onRetry}
          style={{
            padding: '8px 16px',
            background: 'var(--color-primary)',
            color: 'white',
            border: 'none',
            borderRadius: 'var(--radius-md)',
            cursor: 'pointer'
          }}
        >
          重試
        </button>
      )}
    </div>
  </div>
)

// 基礎佈局組件 - 核心布局邏輯
export const BaseLayout: React.FC<BaseLayoutProps> = ({
  header,
  content,
  sidebar,
  footer,
  config = {},
  className = '',
  style = {},
}) => {
  const {
    mode = 'default',
    loading = false,
    error = null,
    loadingSkeleton,
    errorFallback,
    spacing = {},
    sidebar: sidebarConfig = {},
  } = config

  const {
    show: showSidebar = !!sidebar,
    width: sidebarWidth = 240,
    position: sidebarPosition = 'left',
  } = sidebarConfig

  // 響應式功能暫時未使用，保留以備將來擴展
  // const { responsive = true } = config

  // 處理載入狀態
  if (loading) {
    return loadingSkeleton || <LayoutLoadingSkeleton mode={mode} />
  }

  // 處理錯誤狀態
  if (error) {
    return errorFallback || <LayoutErrorFallback error={error} />
  }

  const defaultSpacing = {
    header: spacing.header || '0',
    content: spacing.content || COMMON_STYLES.layout.contentSpacing,
    footer: spacing.footer || '0',
  }

  // 根據模式渲染不同佈局
  const renderLayout = () => {
    switch (mode) {
      case 'dashboard':
        return renderDashboardLayout()
      case 'split':
        return renderSplitLayout()
      default:
        return renderDefaultLayout()
    }
  }

  const renderDefaultLayout = () => (
    <div className={className} style={style}>
      {/* 頁面標題區域 */}
      <div style={{ marginBottom: defaultSpacing.header }}>
        {header}
      </div>

      {/* 主要內容區域 */}
      <div style={{ marginBottom: defaultSpacing.content }}>
        {content}
      </div>

      {/* 頁尾區域 */}
      {footer && (
        <div style={{ marginTop: defaultSpacing.footer }}>
          {footer}
        </div>
      )}
    </div>
  )

  const renderDashboardLayout = () => (
    <div className={className} style={style}>
      {/* 頁面標題區域 */}
      <div style={{ marginBottom: defaultSpacing.header }}>
        {header}
      </div>

      {/* 儀表板佈局 */}
      <div style={{ display: 'flex', gap: defaultSpacing.content }}>
        {showSidebar && sidebarPosition === 'left' && sidebar && (
          <div style={{ width: sidebarWidth, flexShrink: 0 }}>
            {sidebar}
          </div>
        )}

        <div style={{ flex: 1 }}>
          {content}
        </div>

        {showSidebar && sidebarPosition === 'right' && sidebar && (
          <div style={{ width: sidebarWidth, flexShrink: 0 }}>
            {sidebar}
          </div>
        )}
      </div>
    </div>
  )

  const renderSplitLayout = () => (
    <div className={className} style={style}>
      {/* 頁面標題區域 */}
      <div style={{ marginBottom: defaultSpacing.header }}>
        {header}
      </div>

      {/* 分割佈局 */}
      <div style={{ display: 'flex', height: 'calc(100vh - 200px)' }}>
        {showSidebar && sidebarPosition === 'left' && sidebar && (
          <div style={{ width: sidebarWidth, borderRight: '1px solid var(--border-light)', paddingRight: 16 }}>
            {sidebar}
          </div>
        )}

        <div style={{ flex: 1, padding: '0 16px' }}>
          {content}
        </div>

        {showSidebar && sidebarPosition === 'right' && sidebar && (
          <div style={{ width: sidebarWidth, borderLeft: '1px solid var(--border-light)', paddingLeft: 16 }}>
            {sidebar}
          </div>
        )}
      </div>
    </div>
  )

  return renderLayout()
}

export default BaseLayout
