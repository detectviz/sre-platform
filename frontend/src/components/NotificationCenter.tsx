import React from 'react'
import { Badge, Dropdown, Avatar, Typography, Space } from 'antd'
import { BellOutlined, CheckCircleOutlined, WarningOutlined, ExclamationCircleOutlined } from '@ant-design/icons'

const { Text } = Typography

export interface NotificationItem {
  id: string
  title: string
  message: string
  type: 'success' | 'warning' | 'error' | 'info'
  timestamp: string
  read: boolean
}

const mockNotifications: NotificationItem[] = [
  {
    id: '1',
    title: '系統告警',
    message: 'CPU 使用率超過 90%',
    type: 'warning',
    timestamp: '2024-01-15 10:30:00',
    read: false,
  },
  {
    id: '2',
    title: '服務恢復',
    message: 'API 服務已恢復正常',
    type: 'success',
    timestamp: '2024-01-15 10:25:00',
    read: true,
  },
  {
    id: '3',
    title: '配置更新',
    message: '資料庫連接池配置已更新',
    type: 'info',
    timestamp: '2024-01-15 10:20:00',
    read: true,
  },
]

const getIcon = (type: NotificationItem['type']) => {
  switch (type) {
    case 'success':
      return <CheckCircleOutlined style={{ color: 'var(--brand-success)' }} />
    case 'warning':
      return <WarningOutlined style={{ color: 'var(--brand-warning)' }} />
    case 'error':
      return <ExclamationCircleOutlined style={{ color: 'var(--brand-danger)' }} />
    default:
      return <BellOutlined style={{ color: 'var(--brand-info)' }} />
  }
}

export const NotificationCenter: React.FC = () => {
  const unreadCount = mockNotifications.filter(n => !n.read).length

  const notificationItems = mockNotifications.map(item => ({
    key: item.id,
    label: (
      <div style={{ padding: '8px 0' }}>
        <Space align="start">
          <Avatar size="small" icon={getIcon(item.type)} />
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <Text strong={!item.read} style={{ color: 'var(--text-primary)', fontSize: '12px' }}>
                {item.title}
              </Text>
              <Text style={{ color: 'var(--text-tertiary)', fontSize: '10px' }}>
                {item.timestamp}
              </Text>
            </div>
            <Text style={{ color: 'var(--text-secondary)', fontSize: '11px', display: 'block', marginTop: '4px' }}>
              {item.message}
            </Text>
          </div>
        </Space>
      </div>
    ),
  }))

  return (
    <Dropdown
      menu={{ items: notificationItems }}
      placement="bottomRight"
      arrow
    >
      <Badge count={unreadCount} size="small">
        <BellOutlined style={{ fontSize: '16px', color: 'var(--text-secondary)', cursor: 'pointer' }} />
      </Badge>
    </Dropdown>
  )
}
