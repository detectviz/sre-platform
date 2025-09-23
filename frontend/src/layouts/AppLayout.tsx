import React, { useState, useEffect } from 'react'
import { Layout, Menu, Breadcrumb, Button, Input, Space, Typography } from 'antd'
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  SearchOutlined,
  DeploymentUnitOutlined,
} from '@ant-design/icons'
import type { MenuProps } from 'antd'
import { NotificationCenter, UserMenu } from '../components'
import GlobalSearch from '../components/GlobalSearch'

const { Title } = Typography
const { Header, Sider, Content } = Layout

export interface BreadcrumbItem {
  title: string
  href?: string
}

export interface MenuItem {
  key: string
  icon?: React.ReactNode
  label: string
  children?: MenuItem[]
}

export interface AppLayoutProps {
  menuItems: MenuProps['items']
  breadcrumbItems?: BreadcrumbItem[]
  children: React.ReactNode
  onMenuSelect?: (key: string) => void
}

export const AppLayout: React.FC<AppLayoutProps> = ({
  menuItems,
  breadcrumbItems,
  children,
  onMenuSelect,
}) => {
  const [collapsed, setCollapsed] = useState(false)
  const [searchVisible, setSearchVisible] = useState(false)

  const toggleCollapsed = () => setCollapsed((prev) => !prev)

  const handleMenuClick = ({ key }: { key: string }) => {
    console.log('📱 Menu clicked:', key)
    onMenuSelect?.(key)
  }

  // 監聽 Ctrl+K 快捷鍵
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        setSearchVisible(true)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  return (
    <Layout className="glass-layout" style={{ minHeight: '100vh', background: 'var(--bg-page)' }}>
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        width={220}
        style={{
          background: 'var(--bg-container)',
          borderRight: '1px solid var(--border-color)'
        }}
      >
        <div
          className="logo-container"
          onClick={() => onMenuSelect?.('/')}
        >
          <div className="logo-icon">
            <DeploymentUnitOutlined style={{ fontSize: '18px', color: 'white' }} />
          </div>
          {!collapsed && (
            <Title level={4} className="logo-text">
              SRE Platform
            </Title>
          )}
        </div>

        <Menu
          theme="dark"
          mode="inline"
          items={menuItems}
          onClick={handleMenuClick}
          style={{
            background: 'transparent',
            borderRight: 0,
            color: 'var(--text-primary)'
          }}
        />
      </Sider>

      <Layout style={{ background: 'transparent' }}>
        <Header
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 24px',
            height: '48px',
            lineHeight: '48px',
            background: 'var(--bg-container)',
            borderBottom: '1px solid var(--border-color)',
          }}
        >
          <Space>
            <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={toggleCollapsed}
              aria-label="切換側邊欄"
              style={{ color: 'var(--text-primary)' }}
            />
            {breadcrumbItems && breadcrumbItems.length > 0 && (
              <Breadcrumb items={breadcrumbItems.map(item => ({ title: item.title, href: item.href }))} />
            )}
          </Space>
          <Space size={16}>
            <Input
              prefix={<SearchOutlined style={{ color: 'var(--text-tertiary)' }} />}
              placeholder="Search... (Ctrl+K)"
              readOnly
              style={{
                width: 260,
                background: 'var(--bg-elevated)',
                border: '1px solid var(--border-color)',
                color: 'var(--text-primary)',
                cursor: 'pointer'
              }}
              onClick={() => setSearchVisible(true)}
            />
            <NotificationCenter />
            <UserMenu />
          </Space>
        </Header>

        <Content
          style={{
            padding: '24px',
            background: 'var(--bg-page)',
            overflow: 'auto',
            minHeight: 'calc(100vh - 48px - 48px)'
          }}
        >
          {children}
        </Content>
      </Layout>

      <GlobalSearch
        visible={searchVisible}
        onClose={() => setSearchVisible(false)}
      />
    </Layout>
  )
}
