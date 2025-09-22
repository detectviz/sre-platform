import React from 'react'
import { Card, Typography } from 'antd'
import {
  ArrowUpOutlined,
  ArrowDownOutlined,
  MinusOutlined,
  InfoCircleOutlined,
  CheckCircleOutlined,
  WarningOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons'

const { Text } = Typography

export interface KPIStatus {
  type: 'success' | 'warning' | 'danger' | 'info'
  trend?: 'up' | 'down' | 'flat'
}

export interface ContextualKPICardProps {
  title: string
  value: string
  description?: string
  trend?: string
  status?: KPIStatus['type']
  icon?: React.ReactNode
  loading?: boolean
}

const statusConfig = {
  success: {
    color: 'var(--brand-success)',
    icon: <CheckCircleOutlined style={{ color: 'var(--brand-success)' }} />,
  },
  warning: {
    color: 'var(--brand-warning)',
    icon: <WarningOutlined style={{ color: 'var(--brand-warning)' }} />,
  },
  danger: {
    color: 'var(--brand-danger)',
    icon: <ExclamationCircleOutlined style={{ color: 'var(--brand-danger)' }} />,
  },
  info: {
    color: 'var(--brand-info)',
    icon: <InfoCircleOutlined style={{ color: 'var(--brand-info)' }} />,
  },
}

export const ContextualKPICard: React.FC<ContextualKPICardProps> = ({
  title,
  value,
  description,
  trend,
  status = 'info',
  icon,
  loading = false,
}) => {
  const statusInfo = statusConfig[status]
  const trendIcon = trend ? (
    trend.includes('+') ? (
      <ArrowUpOutlined style={{ color: 'var(--brand-success)', fontSize: '12px' }} />
    ) : trend.includes('-') ? (
      <ArrowDownOutlined style={{ color: 'var(--brand-danger)', fontSize: '12px' }} />
    ) : (
      <MinusOutlined style={{ color: 'var(--text-tertiary)', fontSize: '12px' }} />
    )
  ) : null

  return (
    <Card
      size="small"
      loading={loading}
      style={{
        background: 'var(--bg-elevated)',
        border: '1px solid var(--border-light)',
        borderRadius: 'var(--radius-lg)',
      }}
      styles={{
        body: {
          padding: 'var(--spacing-lg)',
        },
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-xs)', marginBottom: 'var(--spacing-xs)' }}>
            {icon || statusInfo.icon}
            <Text style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>
              {title}
            </Text>
          </div>

          <div style={{ marginBottom: 'var(--spacing-xs)' }}>
            <Text
              style={{
                fontSize: '24px',
                fontWeight: 'bold',
                color: 'var(--text-primary)',
              }}
            >
              {value}
            </Text>
          </div>

          {description && (
            <Text style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
              {description}
            </Text>
          )}

          {trend && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-xs)', marginTop: 'var(--spacing-xs)' }}>
              {trendIcon}
              <Text style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>
                {trend}
              </Text>
            </div>
          )}
        </div>
      </div>
    </Card>
  )
}
