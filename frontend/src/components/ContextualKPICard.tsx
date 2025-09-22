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
        height: '120px', // 固定高度
      }}
      styles={{
        body: {
          padding: '12px 12px 8px 12px', // 上右下左內距
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
        },
      }}
    >
      {/* 標題和趨勢行 */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 'var(--spacing-sm)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-xs)' }}>
          {icon || statusInfo.icon}
          <Text style={{ fontSize: '11px', color: 'var(--text-tertiary)', fontWeight: 500 }}>
            {title}
          </Text>
        </div>

        {trend && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '2px',
            fontSize: '10px',
            color: trend.includes('+') ? 'var(--brand-success)' : trend.includes('-') ? 'var(--brand-danger)' : 'var(--text-tertiary)'
          }}>
            {trendIcon}
            <Text style={{ fontSize: '10px', fontWeight: 600 }}>
              {trend}
            </Text>
          </div>
        )}
      </div>

      {/* 數值和描述 */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <div style={{ marginBottom: '4px' }}>
          <Text
            style={{
              fontSize: '28px',
              fontWeight: 'bold',
              color: 'var(--text-primary)',
              lineHeight: 1,
            }}
          >
            {value}
          </Text>
        </div>

        {description && (
          <Text style={{
            fontSize: '13px',
            color: 'var(--text-secondary)',
            lineHeight: 1.3
          }}>
            {description}
          </Text>
        )}
      </div>
    </Card>
  )
}
