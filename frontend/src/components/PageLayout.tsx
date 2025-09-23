import React from 'react'
import { COMMON_STYLES } from '../constants/theme'
import type { ReactNode } from 'react'

// 頁面佈局配置接口
export interface PageLayoutConfig {
  // 頁面基本設置
  showKpiCards?: boolean
  showToolbar?: boolean
  showTabs?: boolean

  // 間距設置
  customSpacing?: {
    kpiCards?: string
    toolbar?: string
    content?: string
  }
}

// 頁面佈局組件
interface PageLayoutProps {
  // 頁面標題區域
  header: ReactNode

  // KPI 卡片區域（可選）
  kpiCards?: ReactNode

  // 工具列區域（可選）
  toolbar?: ReactNode

  // 主要內容區域（可選）
  content?: ReactNode

  // 頁籤內容（可選）
  tabs?: ReactNode

  // 佈局配置
  config?: PageLayoutConfig

  // 額外樣式
  className?: string
}

export const PageLayout: React.FC<PageLayoutProps> = ({
  header,
  kpiCards,
  toolbar,
  content,
  tabs,
  config = {},
  className = '',
}) => {
  const {
    showKpiCards = !!kpiCards,
    showToolbar = !!toolbar,
    showTabs = !!tabs,
  } = config

  const spacing = {
    kpiCards: config.customSpacing?.kpiCards || COMMON_STYLES.layout.componentSpacing.kpiCards,
    toolbar: config.customSpacing?.toolbar || COMMON_STYLES.layout.componentSpacing.toolbar,
    content: config.customSpacing?.content || COMMON_STYLES.layout.contentSpacing,
  }

  return (
    <div className={className}>
      {/* 頁面標題區域 */}
      {header}

      {/* KPI 卡片區域 */}
      {showKpiCards && kpiCards && (
        <div style={{ marginBottom: spacing.kpiCards }}>
          {kpiCards}
        </div>
      )}

      {/* 工具列區域 */}
      {showToolbar && toolbar && (
        <div style={{ marginBottom: spacing.toolbar }}>
          {toolbar}
        </div>
      )}

      {/* 主要內容區域 */}
      <div style={{ marginBottom: spacing.content }}>
        {content}
      </div>

      {/* 頁籤內容區域 */}
      {showTabs && tabs && (
        <div>
          {tabs}
        </div>
      )}
    </div>
  )
}

// 預設頁面佈局組件 - 包含 KPI 卡片和工具列
export const StandardPageLayout: React.FC<{
  header: ReactNode
  kpiCards?: ReactNode
  toolbar?: ReactNode
  content: ReactNode
  tabs?: ReactNode
  config?: PageLayoutConfig
  className?: string
}> = ({ header, kpiCards, toolbar, content, tabs, config, className }) => (
  <PageLayout
    header={header}
    kpiCards={kpiCards}
    toolbar={toolbar}
    content={content}
    tabs={tabs}
    config={{
      showKpiCards: true,
      showToolbar: true,
      showTabs: true,
      ...config,
    }}
    className={className}
  />
)

// 簡潔頁面佈局組件 - 只有標題和內容
export const SimplePageLayout: React.FC<{
  header: ReactNode
  content: ReactNode
  config?: PageLayoutConfig
  className?: string
}> = ({ header, content, config, className }) => (
  <PageLayout
    header={header}
    content={content}
    config={{
      showKpiCards: false,
      showToolbar: false,
      showTabs: false,
      ...config,
    }}
    className={className}
  />
)

// 工具列佈局組件 - 只有標題、工具列和內容
export const ToolbarPageLayout: React.FC<{
  header: ReactNode
  toolbar: ReactNode
  content: ReactNode
  config?: PageLayoutConfig
  className?: string
}> = ({ header, toolbar, content, config, className }) => (
  <PageLayout
    header={header}
    toolbar={toolbar}
    content={content}
    config={{
      showKpiCards: false,
      showToolbar: true,
      showTabs: false,
      ...config,
    }}
    className={className}
  />
)

// 頁籤佈局組件 - 包含標題、工具列和頁籤
export const TabbedPageLayout: React.FC<{
  header: ReactNode
  toolbar?: ReactNode
  tabs: ReactNode
  config?: PageLayoutConfig
  className?: string
}> = ({ header, toolbar, tabs, config, className }) => (
  <PageLayout
    header={header}
    toolbar={toolbar}
    tabs={tabs}
    content={null}
    config={{
      showKpiCards: false,
      showToolbar: !!toolbar,
      showTabs: true,
      ...config,
    }}
    className={className}
  />
)

export default PageLayout
