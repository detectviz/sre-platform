import React from 'react'
import { Avatar, Dropdown } from 'antd'
import { UserOutlined, SettingOutlined, LogoutOutlined } from '@ant-design/icons'
import type { MenuProps } from 'antd'

export const UserMenu: React.FC = () => {
  const userMenuItems: MenuProps['items'] = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: '個人資料',
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: '設定',
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '登出',
    },
  ]

  return (
    <Dropdown menu={{ items: userMenuItems }} placement="bottomRight" arrow>
      <Avatar
        icon={<UserOutlined />}
        style={{ cursor: 'pointer' }}
      />
    </Dropdown>
  )
}
