import React, { type ReactNode } from 'react'
import { COMMON_STYLES } from '../constants/theme'
import { Layout, Card, Space, Skeleton, Button } from 'antd'

// 頁面模式枚舉
export type PageMode = 'default' | 'table' | 'dashboard' | 'form' | 'detail' | 'wizard' | 'split'

// 頁面佈局配置接口
export interface PageLayoutConfig {
  // 頁面模式
  mode?: PageMode

  // 頁面基本設置
  showKpiCards?: boolean
  showToolbar?: boolean
  showTabs?: boolean
  showSidebar?: boolean
  showFooter?: boolean

  // 響應式設置
  responsive?: boolean
  breakpoint?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl'

  // 間距設置
  customSpacing?: {
    header?: string
    kpiCards?: string
    toolbar?: string
    content?: string
    sidebar?: string
    tabs?: string
    footer?: string
  }

  // 側邊欄配置
  sidebar?: {
    width?: number
    collapsedWidth?: number
    collapsible?: boolean
    defaultCollapsed?: boolean
    placement?: 'left' | 'right'
  }

  // 內容區域配置
  content?: {
    scrollable?: boolean
    maxHeight?: string
    padding?: string | number
  }

  // 載入狀態
  loading?: boolean
  loadingSkeleton?: ReactNode

  // 錯誤狀態
  error?: Error | null
  errorFallback?: ReactNode
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

  // 側邊欄（可選）
  sidebar?: ReactNode

  // 頁尾（可選）
  footer?: ReactNode

  // 佈局配置
  config?: PageLayoutConfig

  // 載入和錯誤狀態
  mode?: PageMode
  loading?: boolean
  error?: Error | null
  loadingSkeleton?: ReactNode
  errorFallback?: ReactNode

  // 額外樣式
  className?: string
  style?: React.CSSProperties
}

export const PageLayout: React.FC<PageLayoutProps> = ({
  header,
  kpiCards,
  toolbar,
  content,
  tabs,
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
  } = config

  // 處理載入狀態
  if (loading) {
    return loadingSkeleton || <PageLoadingSkeleton mode={mode} />
  }

  // 處理錯誤狀態
  if (error) {
    return errorFallback || <PageErrorFallback error={error} />
  }

  const spacing = {
    header: config.customSpacing?.header || '0',
    kpiCards: config.customSpacing?.kpiCards || COMMON_STYLES.layout.componentSpacing.kpiCards,
    toolbar: config.customSpacing?.toolbar || COMMON_STYLES.layout.componentSpacing.toolbar,
    content: config.customSpacing?.content || COMMON_STYLES.layout.contentSpacing,
    sidebar: config.customSpacing?.sidebar || COMMON_STYLES.layout.contentSpacing,
    tabs: config.customSpacing?.tabs || COMMON_STYLES.layout.contentSpacing,
    footer: config.customSpacing?.footer || '0',
  }

  // 根據模式渲染不同的佈局
  const renderContent = () => {
    switch (mode) {
      case 'table':
        return <TablePageLayout {...{ header, toolbar, content, tabs, spacing }} />
      case 'dashboard':
        return <DashboardPageLayout {...{ header, kpiCards, content, sidebar, spacing }} />
      case 'form':
        return <FormPageLayout {...{ header, toolbar, content, footer, spacing }} />
      case 'detail':
        return <DetailPageLayout {...{ header, toolbar, content, sidebar, spacing }} />
      case 'wizard':
        return <WizardPageLayout {...{ header, toolbar, content, footer, spacing }} />
      case 'split':
        return <SplitPageLayout {...{ header, toolbar, content, sidebar, spacing }} />
      default:
        return <DefaultPageLayout {...{ header, kpiCards, toolbar, content, tabs, footer, spacing }} />
    }
  }

  return (
    <Layout className={className} style={style}>
      {renderContent()}
    </Layout>
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

// 預設頁面佈局組件 - 包含 KPI 卡片和工具列 (已在上面定義)

// 表格頁面佈局組件 - 針對表格頁面的優化佈局
export const TablePageLayout: React.FC<{
  header: ReactNode
  toolbar?: ReactNode
  content: ReactNode
  tabs?: ReactNode
  spacing: any
}> = ({ header, toolbar, content, tabs, spacing }) => (
  <div>
    {header}
    {toolbar && (
      <div style={{ marginBottom: spacing.toolbar }}>
        {toolbar}
      </div>
    )}
    {content && (
      <div style={{ marginBottom: spacing.content }}>
        {content}
      </div>
    )}
    {tabs}
  </div>
)

// 儀表板頁面佈局組件 - 針對儀表板的優化佈局
export const DashboardPageLayout: React.FC<{
  header: ReactNode
  kpiCards?: ReactNode
  content: ReactNode
  sidebar?: ReactNode
  spacing: any
}> = ({ header, kpiCards, content, sidebar, spacing }) => (
  <Layout>
    {header}
    {kpiCards && (
      <div style={{ marginBottom: spacing.kpiCards }}>
        {kpiCards}
      </div>
    )}
    <Layout>
      {sidebar && (
        <Layout.Sider
          width={240}
          style={{ background: 'transparent', marginRight: spacing.sidebar }}
        >
          {sidebar}
        </Layout.Sider>
      )}
      <Layout.Content style={{ padding: '0 24px' }}>
        {content}
      </Layout.Content>
    </Layout>
  </Layout>
)

// 表單頁面佈局組件 - 針對表單頁面的優化佈局
export const FormPageLayout: React.FC<{
  header: ReactNode
  toolbar?: ReactNode
  content: ReactNode
  footer?: ReactNode
  spacing: any
}> = ({ header, toolbar, content, footer, spacing }) => (
  <div>
    {header}
    {toolbar && (
      <div style={{ marginBottom: spacing.toolbar }}>
        {toolbar}
      </div>
    )}
    <Card style={{ marginBottom: spacing.content }}>
      {content}
    </Card>
    {footer && (
      <div style={{ marginTop: spacing.footer }}>
        {footer}
      </div>
    )}
  </div>
)

// 詳情頁面佈局組件 - 針對詳情頁面的優化佈局
export const DetailPageLayout: React.FC<{
  header: ReactNode
  toolbar?: ReactNode
  content: ReactNode
  sidebar?: ReactNode
  spacing: any
}> = ({ header, toolbar, content, sidebar, spacing }) => (
  <Layout>
    {header}
    {toolbar && (
      <div style={{ marginBottom: spacing.toolbar }}>
        {toolbar}
      </div>
    )}
    <Layout>
      {sidebar && (
        <Layout.Sider
          width={300}
          style={{ background: 'transparent', marginRight: spacing.sidebar }}
        >
          {sidebar}
        </Layout.Sider>
      )}
      <Layout.Content style={{ padding: '0 24px' }}>
        <Card>
          {content}
        </Card>
      </Layout.Content>
    </Layout>
  </Layout>
)

// 精靈頁面佈局組件 - 針對多步驟表單的優化佈局
export const WizardPageLayout: React.FC<{
  header: ReactNode
  toolbar?: ReactNode
  content: ReactNode
  footer?: ReactNode
  spacing: any
}> = ({ header, toolbar, content, footer, spacing }) => (
  <div style={{ maxWidth: 800, margin: '0 auto' }}>
    {header}
    {toolbar && (
      <div style={{ marginBottom: spacing.toolbar }}>
        {toolbar}
      </div>
    )}
    <Card style={{ marginBottom: spacing.content }}>
      {content}
    </Card>
    {footer && (
      <div style={{ marginTop: spacing.footer, textAlign: 'center' }}>
        {footer}
      </div>
    )}
  </div>
)

// 分割頁面佈局組件 - 左右分割佈局
export const SplitPageLayout: React.FC<{
  header: ReactNode
  toolbar?: ReactNode
  content: ReactNode
  sidebar?: ReactNode
  spacing: any
}> = ({ header, toolbar, content, sidebar, spacing }) => (
  <Layout>
    {header}
    {toolbar && (
      <div style={{ marginBottom: spacing.toolbar }}>
        {toolbar}
      </div>
    )}
    <Layout style={{ padding: '0 24px' }}>
      <Layout.Content style={{ marginRight: spacing.sidebar }}>
        {content}
      </Layout.Content>
      {sidebar && (
        <Layout.Sider width={300} style={{ background: 'transparent' }}>
          {sidebar}
        </Layout.Sider>
      )}
    </Layout>
  </Layout>
)

// 默認頁面佈局組件 - 標準佈局
export const DefaultPageLayout: React.FC<{
  header: ReactNode
  kpiCards?: ReactNode
  toolbar?: ReactNode
  content?: ReactNode
  tabs?: ReactNode
  footer?: ReactNode
  spacing: any
}> = ({ header, kpiCards, toolbar, content, tabs, footer, spacing }) => (
  <div>
    {header}
    {kpiCards && (
      <div style={{ marginBottom: spacing.kpiCards }}>
        {kpiCards}
      </div>
    )}
    {toolbar && (
      <div style={{ marginBottom: spacing.toolbar }}>
        {toolbar}
      </div>
    )}
    {content && (
      <div style={{ marginBottom: spacing.content }}>
        {content}
      </div>
    )}
    {tabs && (
      <div style={{ marginBottom: spacing.tabs }}>
        {tabs}
      </div>
    )}
    {footer && (
      <div style={{ marginTop: spacing.footer }}>
        {footer}
      </div>
    )}
  </div>
)

// 載入狀態組件
export const PageLoadingSkeleton: React.FC<{ mode?: PageMode }> = ({ mode = 'default' }) => {
  const renderSkeleton = () => {
    switch (mode) {
      case 'table':
        return (
          <div>
            <Skeleton active />
            <Skeleton active />
            <Skeleton active />
          </div>
        )
      case 'dashboard':
        return (
          <div>
            <Skeleton.Button active size="large" block />
            <Space direction="vertical" style={{ width: '100%', marginTop: 16 }}>
              <Skeleton active />
              <Skeleton active />
            </Space>
          </div>
        )
      case 'form':
        return (
          <Card>
            <Skeleton active />
          </Card>
        )
      default:
        return (
          <div>
            <Skeleton active />
            <Skeleton active />
            <Skeleton active />
          </div>
        )
    }
  }

  return (
    <div style={{ padding: 24 }}>
      <Skeleton.Avatar active size="large" />
      <div style={{ marginTop: 16 }}>
        {renderSkeleton()}
      </div>
    </div>
  )
}

// 錯誤狀態組件
export const PageErrorFallback: React.FC<{ error: Error }> = ({ error }) => (
  <div style={{
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 48,
    textAlign: 'center'
  }}>
    <Card style={{ maxWidth: 400 }}>
      <h2>出錯了</h2>
      <p style={{ color: 'var(--text-secondary)', marginBottom: 16 }}>
        {error.message || '發生未知錯誤'}
      </p>
      <Space>
        <Button onClick={() => window.location.reload()}>
          重新載入頁面
        </Button>
        <Button type="primary" onClick={() => window.history.back()}>
          返回上一頁
        </Button>
      </Space>
    </Card>
  </div>
)

// 頁面佈局工廠函數
export const createPageLayout = (
  mode: PageMode,
  config?: PageLayoutConfig
): React.FC<any> => {
  const layoutComponents = {
    default: DefaultPageLayout,
    table: TablePageLayout,
    dashboard: DashboardPageLayout,
    form: FormPageLayout,
    detail: DetailPageLayout,
    wizard: WizardPageLayout,
    split: SplitPageLayout,
  }

  const LayoutComponent = layoutComponents[mode] || DefaultPageLayout

  return (props: any) => (
    <LayoutComponent {...props} spacing={config?.customSpacing || {}} />
  )
}

// 響應式佈局組件
export const ResponsivePageLayout: React.FC<PageLayoutProps> = (props) => {
  const { config, ...rest } = props
  const responsiveConfig = {
    ...config,
    responsive: true,
    breakpoint: 'lg' as const,
  }

  return <PageLayout {...rest} config={responsiveConfig} />
}

export default PageLayout
