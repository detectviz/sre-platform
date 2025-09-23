import React, { type ReactNode } from 'react'
import { Card } from 'antd'
import { BaseLayout, BaseLayoutConfig } from './BaseLayout'

// 標準佈局配置接口 - 採用組合式設計
export interface StandardLayoutConfig extends BaseLayoutConfig {
  // 內容區域組件
  kpiCards?: ReactNode
  toolbar?: ReactNode
  tabs?: ReactNode
  actions?: ReactNode

  // 容器配置
  contentContainer?: ContentContainerConfig
}

// 容器配置接口
export interface ContentContainerConfig {
  bordered?: boolean
  padding?: string
}

// 標準佈局 Props
export interface StandardLayoutProps {
  header: ReactNode
  content: ReactNode
  config?: StandardLayoutConfig
  className?: string
  style?: React.CSSProperties
}

// 標準佈局組件 - 常用頁面組合
export const StandardLayout: React.FC<StandardLayoutProps> = ({
  header,
  content,
  config = {},
  className = '',
  style = {},
}) => {
  // 從配置中提取各個組件
  const {
    kpiCards: kpiCardsContent,
    toolbar: toolbarContent,
    tabs: tabsContent,
    actions: actionsContent,
    contentContainer = {},
  } = config

  const {
    bordered = false,
    padding = '0',
  } = contentContainer

  // 渲染 KPI 卡片區域
  const renderKpiCards = () => {
    if (!kpiCardsContent) return null

    return (
      <div style={{ marginBottom: config.spacing?.content || '16px' }}>
        {kpiCardsContent}
      </div>
    )
  }

  // 渲染工具列區域
  const renderToolbar = () => {
    if (!toolbarContent) return null

    return (
      <div style={{ marginBottom: config.spacing?.content || '16px' }}>
        {toolbarContent}
      </div>
    )
  }

  // 渲染主要內容
  const renderMainContent = () => {
    const mainContent = (
      <div style={{ padding }}>
        {content}
        {actionsContent && (
          <div style={{ marginTop: '16px', textAlign: 'right' }}>
            {actionsContent}
          </div>
        )}
      </div>
    )

    if (bordered) {
      return (
        <Card bordered style={{ borderRadius: 'var(--radius-lg)' }}>
          {mainContent}
        </Card>
      )
    }

    return mainContent
  }

  // 組合配置
  const layoutConfig: StandardLayoutConfig = {
    ...config,
    mode: 'default',
    spacing: {
      header: config.spacing?.header || '0',
      content: config.spacing?.content || '16px',
      footer: config.spacing?.footer || '0',
    }
  }

  return (
    <BaseLayout
      header={header}
      content={
        <div>
          {renderKpiCards()}
          {renderToolbar()}
          {renderMainContent()}
          {tabsContent && (
            <div style={{ marginTop: '16px' }}>
              {tabsContent}
            </div>
          )}
        </div>
      }
      config={layoutConfig}
      className={className}
      style={style}
    />
  )
}

export default StandardLayout
