import React, { type ReactNode } from 'react'
import { Card } from 'antd'
import { BaseLayout, BaseLayoutConfig } from './BaseLayout'

// 表格佈局配置接口 - 組合式設計
export interface TableLayoutConfig extends BaseLayoutConfig {
  // 表格區域組件
  toolbar?: ReactNode
  tabs?: ReactNode
  kpiCards?: ReactNode

  // 表格容器配置
  tableContainer?: TableContainerConfig
}

// 表格容器配置接口
export interface TableContainerConfig {
  bordered?: boolean
  hoverable?: boolean
  scrollable?: boolean
  maxHeight?: string
  padding?: string
}

// 表格佈局 Props
export interface TableLayoutProps {
  header: ReactNode
  content: ReactNode
  config?: TableLayoutConfig
  className?: string
  style?: React.CSSProperties
}

// 表格佈局組件 - 專門針對表格頁面的優化佈局
export const TableLayout: React.FC<TableLayoutProps> = ({
  header,
  content,
  config = {},
  className = '',
  style = {},
}) => {
  // 從配置中提取各個組件
  const {
    toolbar: toolbarContent,
    tabs: tabsContent,
    kpiCards: kpiCardsContent,
    tableContainer = {},
  } = config

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

  // 渲染表格容器
  const renderTableContent = () => {
    const {
      scrollable = true,
      maxHeight = 'calc(100vh - 300px)',
      padding = '0',
    } = tableContainer

    // bordered 和 hoverable 暫時未使用，保留以備將來擴展
    // const { bordered = false } = tableContainer
    // const { hoverable = true } = tableContainer

    const tableWrapper = (
      <div
        style={{
          ...(scrollable && { maxHeight, overflow: 'auto' }),
          padding,
        }}
      >
        {content}
      </div>
    )

    if (tabsContent) {
      return (
        <div>
          {tableWrapper}
          <div style={{ marginTop: '16px' }}>
            {tabsContent}
          </div>
        </div>
      )
    }

    return tableWrapper
  }

  // 組合配置
  const layoutConfig: TableLayoutConfig = {
    ...config,
    mode: 'table',
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
          <Card
            bordered={tableContainer.bordered}
            hoverable={tableContainer.hoverable}
            style={{ borderRadius: 'var(--radius-lg)' }}
          >
            {renderTableContent()}
          </Card>
        </div>
      }
      config={layoutConfig}
      className={className}
      style={style}
    />
  )
}

export default TableLayout
