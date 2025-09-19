import { useState } from 'react';
import { MenuFoldOutlined, MenuUnfoldOutlined, SearchOutlined } from '@ant-design/icons';
import { Breadcrumb, Button, Input, Layout, Menu, Space, Typography } from 'antd';
import type { BreadcrumbProps } from 'antd';
import type { MenuProps } from 'antd/es/menu';
import type { ReactNode } from 'react';
import { NotificationCenter, UserMenu } from '../components';

const { Header, Content, Sider } = Layout;
const { Title } = Typography;

export type AppLayoutProps = {
  /** 側邊欄項目 */
  menuItems: MenuProps['items'];
  /** 目前選取的鍵值 */
  activeKey: string;
  /** 選單點擊時觸發 */
  onSelect: (key: string) => void;
  /** 麵包屑資訊 */
  breadcrumbItems?: BreadcrumbProps['items'];
  /** 內容區塊 */
  children: ReactNode;
};

export const AppLayout = ({ menuItems, activeKey, onSelect, breadcrumbItems, children }: AppLayoutProps) => {
  const [collapsed, setCollapsed] = useState(false);

  const toggleCollapsed = () => setCollapsed((prev) => !prev);

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        width={220}
        className="glass-surface"
        style={{ borderRight: '1px solid var(--border-light)', background: 'var(--bg-container)' }}
      >
        <div
          style={{
            height: 60,
            display: 'flex',
            alignItems: 'center',
            justifyContent: collapsed ? 'center' : 'flex-start',
            padding: '0 16px',
          }}
        >
          <Title level={4} className="heading-gradient" style={{ margin: 0 }}>
            {collapsed ? 'SRE' : 'SRE Platform'}
          </Title>
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[activeKey]}
          items={menuItems}
          onClick={({ key }) => onSelect(key)}
          style={{ background: 'transparent', borderRight: 0 }}
        />
      </Sider>
      <Layout>
        <Header className="app-header glass-surface">
          <Space size={16} align="center">
            <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={toggleCollapsed}
              aria-label="切換側邊欄"
              style={{ color: 'var(--text-primary)' }}
            />
            <Input
              prefix={<SearchOutlined style={{ color: 'var(--text-tertiary)' }} />}
              placeholder="Search... (Ctrl+K)"
              style={{ width: 260 }}
            />
          </Space>
          <Space size={20}>
            <NotificationCenter />
            <UserMenu
              username="Admin User"
              email="admin@sre-platform.com"
              onProfile={() => onSelect('profile')}
              onLogout={() => onSelect('logout')}
            />
          </Space>
        </Header>
        <Content style={{ padding: '0 24px 32px', minHeight: 'calc(100vh - 120px)' }}>
          {breadcrumbItems && breadcrumbItems.length > 0 && (
            <Breadcrumb items={breadcrumbItems} style={{ marginBottom: 16 }} />
          )}
          {children}
        </Content>
      </Layout>
    </Layout>
  );
};

export default AppLayout;
