import React from 'react'
import { Space, Typography, Button, Tooltip } from 'antd'
import { ArrowLeftOutlined, ReloadOutlined, SettingOutlined } from '@ant-design/icons'

const { Title, Text } = Typography

export interface PageHeaderProps {
  title: string
  subtitle?: string
  onBack?: () => void
  onRefresh?: () => void
  extra?: React.ReactNode
  showBack?: boolean
  showRefresh?: boolean
  showSettings?: boolean
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  onBack,
  onRefresh,
  extra,
  showBack = false,
  showRefresh = true,
  showSettings = false,
}) => {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 'var(--spacing-2xl)',
        paddingBottom: 'var(--spacing-lg)',
        borderBottom: '1px solid var(--border-light)',
      }}
    >
      <div style={{ flex: 1 }}>
        {showBack && (
          <Button
            type="text"
            icon={<ArrowLeftOutlined />}
            onClick={onBack}
            style={{
              marginBottom: 'var(--spacing-sm)',
              color: 'var(--text-tertiary)',
            }}
          />
        )}

        <Title
          level={2}
          style={{
            margin: 0,
            color: 'var(--text-primary)',
            background: 'linear-gradient(135deg, var(--text-primary) 0%, var(--text-secondary) 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          {title}
        </Title>

        {subtitle && (
          <Text
            style={{
              fontSize: '14px',
              color: 'var(--text-secondary)',
              display: 'block',
              marginTop: 'var(--spacing-xs)',
            }}
          >
            {subtitle}
          </Text>
        )}
      </div>

      <Space size="middle">
        {extra}

        {showRefresh && (
          <Tooltip title="刷新">
            <Button
              type="text"
              icon={<ReloadOutlined />}
              onClick={onRefresh}
              style={{ color: 'var(--text-secondary)' }}
            />
          </Tooltip>
        )}

        {showSettings && (
          <Tooltip title="設定">
            <Button
              type="text"
              icon={<SettingOutlined />}
              style={{ color: 'var(--text-secondary)' }}
            />
          </Tooltip>
        )}
      </Space>
    </div>
  )
}
