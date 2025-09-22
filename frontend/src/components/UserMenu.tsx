import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Avatar, Dropdown } from 'antd'
import { UserOutlined, LogoutOutlined } from '@ant-design/icons'
import type { MenuProps } from 'antd'

export const UserMenu: React.FC = () => {
  const navigate = useNavigate()

  const userMenuItems: MenuProps['items'] = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: '個人資料',
      onClick: () => navigate('/profile/personal'),
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '登出',
      onClick: () => console.log('登出'),
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
