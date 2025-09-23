import React, { type ReactNode } from 'react'
import { Card, Descriptions, Space, Divider } from 'antd'
import { BaseLayout, BaseLayoutConfig } from './BaseLayout'

// 詳情佈局配置接口 - 組合式設計
export interface DetailLayoutConfig extends BaseLayoutConfig {
  // 詳情頁面內容
  metaInfo?: ReactNode
  actions?: ReactNode
  timeline?: ReactNode

  // 容器配置
  detailContainer?: DetailContainerConfig

  // 側邊欄配置
  sidebarSections?: SidebarSectionsConfig
}

// 詳情容器配置接口
export interface DetailContainerConfig {
  bordered?: boolean
  size?: 'small' | 'default' | 'middle' | 'large'
  title?: string
  extra?: ReactNode
}

// 側邊欄配置接口
export interface SidebarSectionsConfig {
  showRelated?: boolean
  showTags?: boolean
  showAttachments?: boolean
  related?: ReactNode
  tags?: ReactNode
  attachments?: ReactNode
}

// 詳情佈局 Props
export interface DetailLayoutProps {
  header: ReactNode
  content: ReactNode
  sidebar?: ReactNode
  config?: DetailLayoutConfig
  className?: string
  style?: React.CSSProperties
}

// 詳情佈局組件 - 專門針對詳情頁面的優化佈局
export const DetailLayout: React.FC<DetailLayoutProps> = ({
  header,
  content,
  sidebar,
  config = {},
  className = '',
  style = {},
}) => {
  // 從配置中提取各個組件
  const {
    metaInfo: metaInfoContent,
    actions: actionsContent,
    timeline: timelineContent,
    detailContainer = {},
    sidebarSections = {},
  } = config

  const {
    bordered = true,
    size = 'middle',
    title,
    extra,
  } = detailContainer

  const {
    showRelated = false,
    showTags = false,
    showAttachments = false,
  } = sidebarSections

  // 渲染元信息區域
  const renderMetaInfo = () => {
    if (!metaInfoContent) return null

    return (
      <div style={{ marginBottom: config.spacing?.content || '16px' }}>
        {typeof metaInfoContent === 'object' ? (
          <Descriptions
            size={size === 'large' ? 'default' : size}
            bordered={bordered}
            column={2}
            style={{ background: 'var(--bg-elevated)', borderRadius: 'var(--radius-md)' }}
          >
            {metaInfoContent}
          </Descriptions>
        ) : (
          metaInfoContent
        )}
      </div>
    )
  }

  // 渲染動作區域
  const renderActions = () => {
    if (!actionsContent) return null

    return (
      <div style={{ marginBottom: config.spacing?.content || '16px' }}>
        <Space>
          {actionsContent}
        </Space>
      </div>
    )
  }

  // 渲染主要內容區域
  const renderMainContent = () => {
    const mainContent = (
      <div>
        {renderMetaInfo()}
        {renderActions()}
        <Card
          bordered={bordered}
          size={size === 'large' ? 'default' : (size === 'middle' ? 'default' : size)}
          title={title}
          extra={extra}
          style={{ borderRadius: 'var(--radius-lg)' }}
        >
          {content}
        </Card>
      </div>
    )

    if (timelineContent) {
      return (
        <div>
          {mainContent}
          <Divider />
          <Card
            title="時間線"
            bordered={bordered}
            size={size === 'large' ? 'default' : (size === 'middle' ? 'default' : size)}
            style={{ borderRadius: 'var(--radius-lg)' }}
          >
            {timelineContent}
          </Card>
        </div>
      )
    }

    return mainContent
  }

  // 渲染側邊欄
  const renderSidebar = () => {
    if (!sidebar && !showRelated && !showTags && !showAttachments) return null

    const sidebarContent = sidebar || (
      <div>
        {showRelated && sidebarSections.related && (
          <Card
            title="相關項目"
            bordered={bordered}
            size={size === 'large' ? 'default' : (size === 'middle' ? 'default' : size)}
            style={{ marginBottom: 16, borderRadius: 'var(--radius-lg)' }}
          >
            {sidebarSections.related}
          </Card>
        )}

        {showTags && sidebarSections.tags && (
          <Card
            title="標籤"
            bordered={bordered}
            size={size === 'large' ? 'default' : (size === 'middle' ? 'default' : size)}
            style={{ marginBottom: 16, borderRadius: 'var(--radius-lg)' }}
          >
            {sidebarSections.tags}
          </Card>
        )}

        {showAttachments && sidebarSections.attachments && (
          <Card
            title="附件"
            bordered={bordered}
            size={size === 'large' ? 'default' : (size === 'middle' ? 'default' : size)}
            style={{ borderRadius: 'var(--radius-lg)' }}
          >
            {sidebarSections.attachments}
          </Card>
        )}
      </div>
    )

    return sidebarContent
  }

  // 組合配置
  const layoutConfig: DetailLayoutConfig = {
    ...config,
    mode: 'detail',
    spacing: {
      header: config.spacing?.header || '0',
      content: config.spacing?.content || '16px',
      footer: config.spacing?.footer || '0',
    }
  }

  return (
    <BaseLayout
      header={header}
      content={renderMainContent()}
      sidebar={renderSidebar()}
      config={layoutConfig}
      className={className}
      style={style}
    />
  )
}

export default DetailLayout
