import React, { type ReactNode } from 'react'
import { Card } from 'antd'
import { BaseLayout, BaseLayoutConfig } from './BaseLayout'

// 儀表板佈局配置接口 - 組合式設計
export interface DashboardLayoutConfig extends BaseLayoutConfig {
  // 儀表板內容
  kpiCards?: ReactNode

  // 網格佈局配置
  gridLayout?: GridLayoutConfig

  // 面板配置
  panels?: PanelConfig
}

// 網格佈局配置接口
export interface GridLayoutConfig {
  columns?: number
  gutter?: [number, number]
  responsive?: boolean
}

// 面板配置接口
export interface PanelConfig {
  showBorders?: boolean
  hoverable?: boolean
  shadow?: boolean
}

// 儀表板佈局 Props
export interface DashboardLayoutProps {
  header: ReactNode
  content: ReactNode
  sidebar?: ReactNode
  config?: DashboardLayoutConfig
  className?: string
  style?: React.CSSProperties
}

// 儀表板佈局組件 - 專門針對儀表板頁面的優化佈局
export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  header,
  content,
  sidebar,
  config = {},
  className = '',
  style = {},
}) => {
  // 從配置中提取各個組件
  const {
    kpiCards: kpiCardsContent,
    gridLayout = {},
    panels = {},
  } = config

  const {
    columns = 3,
    gutter = [16, 16],
    responsive = true,
  } = gridLayout

  const {
    showBorders = true,
    hoverable = true,
    shadow = true,
  } = panels

  // 渲染 KPI 卡片區域
  const renderKpiCards = () => {
    if (!kpiCardsContent) return null

    return (
      <div style={{ marginBottom: config.spacing?.content || '24px' }}>
        {kpiCardsContent}
      </div>
    )
  }

  // 渲染主要內容區域
  const renderMainContent = () => {
    if (responsive) {
      return (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${columns}, 1fr)`,
            gap: `${gutter[0]}px ${gutter[1]}px`,
          }}
        >
          {React.Children.map(content, (child, index) => (
            <Card
              key={index}
              bordered={showBorders}
              hoverable={hoverable}
              style={{
                boxShadow: shadow ? 'var(--shadow-sm)' : 'none',
                borderRadius: 'var(--radius-lg)',
              }}
            >
              {child}
            </Card>
          ))}
        </div>
      )
    }

    return (
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${columns}, 1fr)`,
          gap: `${gutter[0]}px ${gutter[1]}px`,
        }}
      >
        {React.Children.map(content, (child, index) => (
          <Card
            key={index}
            bordered={showBorders}
            hoverable={hoverable}
            style={{
              boxShadow: shadow ? 'var(--shadow-sm)' : 'none',
              borderRadius: 'var(--radius-lg)',
            }}
          >
            {child}
          </Card>
        ))}
      </div>
    )
  }

  // 組合配置
  const layoutConfig: DashboardLayoutConfig = {
    ...config,
    mode: 'dashboard',
    spacing: {
      header: config.spacing?.header || '0',
      content: config.spacing?.content || '24px',
      footer: config.spacing?.footer || '0',
    }
  }

  return (
    <BaseLayout
      header={header}
      content={
        <div>
          {renderKpiCards()}
          {renderMainContent()}
        </div>
      }
      sidebar={sidebar}
      config={layoutConfig}
      className={className}
      style={style}
    />
  )
}

export default DashboardLayout
