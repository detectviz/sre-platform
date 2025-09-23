import React, { type ReactNode } from 'react'
import { Card, Button, Space } from 'antd'
import { BaseLayout, BaseLayoutConfig } from './BaseLayout'

// 表單佈局配置接口 - 組合式設計
export interface FormLayoutConfig extends BaseLayoutConfig {
  // 表單動作配置
  actions?: ReactNode
  onSubmit?: () => void
  onCancel?: () => void
  submitting?: boolean

  // 表單容器配置
  formContainer?: FormContainerConfig
}

// 表單容器配置接口
export interface FormContainerConfig {
  bordered?: boolean
  title?: string
  size?: 'small' | 'default' | 'middle' | 'large'
  padding?: string
  maxWidth?: string | number
}

// 表單佈局 Props
export interface FormLayoutProps {
  header: ReactNode
  content: ReactNode
  config?: FormLayoutConfig
  className?: string
  style?: React.CSSProperties
}

// 表單動作組件
interface FormActionsProps {
  submitButtonText?: string
  cancelButtonText?: string
  onSubmit?: () => void
  onCancel?: () => void
  submitting?: boolean
  position?: 'bottom' | 'right' | 'center'
  spacing?: 'small' | 'middle' | 'large'
  customActions?: ReactNode
}

const FormActions: React.FC<FormActionsProps> = ({
  submitButtonText = '提交',
  cancelButtonText = '取消',
  onSubmit,
  onCancel,
  submitting = false,
  position = 'bottom',
  spacing = 'middle',
  customActions,
}) => {
  if (customActions) {
    return <>{customActions}</>
  }

  const actions = (
    <Space size={spacing}>
      {onCancel && (
        <Button onClick={onCancel} disabled={submitting}>
          {cancelButtonText}
        </Button>
      )}
      {onSubmit && (
        <Button
          type="primary"
          onClick={onSubmit}
          loading={submitting}
        >
          {submitButtonText}
        </Button>
      )}
    </Space>
  )

  if (position === 'right') {
    return (
      <div style={{ textAlign: 'right', marginTop: 16 }}>
        {actions}
      </div>
    )
  }

  if (position === 'center') {
    return (
      <div style={{ textAlign: 'center', marginTop: 16 }}>
        {actions}
      </div>
    )
  }

  // 默認 bottom 位置
  return (
    <div style={{ textAlign: 'right', marginTop: 16 }}>
      {actions}
    </div>
  )
}

// 表單佈局組件 - 專門針對表單頁面的優化佈局
export const FormLayout: React.FC<FormLayoutProps> = ({
  header,
  content,
  config = {},
  className = '',
  style = {},
}) => {
  // 從配置中提取各個組件
  const {
    actions: actionsContent,
    onSubmit,
    onCancel,
    submitting = false,
    formContainer = {},
  } = config

  const {
    bordered = true,
    title,
    size = 'middle',
    padding = '24px',
    maxWidth = '800px',
  } = formContainer

  // 渲染表單容器
  const renderFormContent = () => {
    const cardContent = (
      <div style={{ padding }}>
        {content}
        {actionsContent && (
          <FormActions
            onSubmit={onSubmit}
            onCancel={onCancel}
            submitting={submitting}
            customActions={actionsContent}
          />
        )}
      </div>
    )

    if (title) {
      return (
        <Card
          title={title}
          bordered={bordered}
          size={size === 'large' ? 'default' : (size === 'middle' ? 'default' : size)}
          style={{
            maxWidth: typeof maxWidth === 'number' ? `${maxWidth}px` : maxWidth,
            margin: '0 auto'
          }}
        >
          {cardContent}
        </Card>
      )
    }

    return (
      <Card
        bordered={bordered}
        size={size === 'large' ? 'default' : (size === 'middle' ? 'default' : size)}
        style={{
          maxWidth: typeof maxWidth === 'number' ? `${maxWidth}px` : maxWidth,
          margin: '0 auto'
        }}
      >
        {cardContent}
      </Card>
    )
  }

  // 組合配置
  const layoutConfig: FormLayoutConfig = {
    ...config,
    mode: 'form',
    spacing: {
      header: config.spacing?.header || '0',
      content: config.spacing?.content || '24px',
      footer: config.spacing?.footer || '0',
    }
  }

  return (
    <BaseLayout
      header={header}
      content={renderFormContent()}
      config={layoutConfig}
      className={className}
      style={style}
    />
  )
}

export default FormLayout
