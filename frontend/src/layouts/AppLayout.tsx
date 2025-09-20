import { useState } from 'react';
import {
  DeploymentUnitOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import { Breadcrumb, Button, Input, Layout, Menu, Space, Typography } from 'antd';
import type { BreadcrumbProps, MenuProps } from 'antd';
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

export const AppLayout = ({
  menuItems,
  activeKey,
  onSelect,
  breadcrumbItems,
  children,
}: AppLayoutProps) => {
  const [collapsed, setCollapsed] = useState(false);

  const toggleCollapsed = () => setCollapsed((prev) => !prev);

  return (
    <Layout className="glass-layout" style={{ minHeight: '100vh', background: 'var(--bg-page)' }}>
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        width={220}
        style={{ background: 'transparent' }}
      >
        <div
          style={{
            height: '48px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            gap: '10px',
            padding: `0 ${collapsed ? '0' : '16px'}`,
          }}
          onClick={() => onSelect('home')}
        >
          <div
            style={{
              width: '30px',
              height: '30px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <DeploymentUnitOutlined style={{ fontSize: '18px', color: 'white' }} />
          </div>
          {!collapsed && (
            <Title level={4} style={{ margin: 0, color: 'var(--text-primary)', fontSize: '18px' }}>
              SRE Platform
            </Title>
          )}
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[activeKey]}
          items={menuItems}
          onClick={({ key }) => {
            console.log('📱 Menu clicked:', key);
            onSelect(key);
          }}
          style={{ background: 'transparent', borderRight: 0 }}
        />
      </Sider>
      <Layout style={{ background: 'transparent' }}>
        <Header
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
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
              <Breadcrumb items={breadcrumbItems} />
            )}
          </Space>
          <Space size={20}>
            <Input
              prefix={<SearchOutlined style={{ color: 'var(--text-tertiary)' }} />}
              placeholder="Search... (Ctrl+K)"
              style={{ width: 260 }}
            />
            <NotificationCenter />
            <UserMenu />
          </Space>
        </Header>
        <Content style={{ padding: '24px', background: 'transparent', overflow: 'auto' }}>
          {children}
        </Content>
      </Layout>
    </Layout>
  );
};

export default AppLayout;
