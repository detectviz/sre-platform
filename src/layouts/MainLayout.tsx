import React, { useState } from 'react';
import {
  DesktopOutlined,
  PieChartOutlined,
  UserOutlined,
  BellOutlined,
} from '@ant-design/icons';
import { Avatar, Badge, Breadcrumb, Button, Layout, Menu, Space, theme } from 'antd';
import { Link, Outlet } from 'react-router-dom';

const { Header, Content, Footer, Sider } = Layout;

// 導航菜單項目
const menuItems = [
  {
    key: '1',
    icon: <PieChartOutlined />,
    label: <Link to="/dashboard">總覽儀表板</Link>,
  },
  // 可以在此處加入更多菜單項
];

const MainLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider collapsible collapsed={collapsed} onCollapse={(value) => setCollapsed(value)}>
        <div style={{ height: 32, margin: 16, background: 'rgba(255, 255, 255, 0.2)', textAlign: 'center', color: 'white', lineHeight: '32px' }}>
          SRE
        </div>
        <Menu theme="dark" defaultSelectedKeys={['1']} mode="inline" items={menuItems} />
      </Sider>
      <Layout>
        <Header style={{ padding: '0 24px', background: colorBgContainer, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            {/* 麵包屑導航可以放在這裡 */}
          </div>
          <Space size="middle">
             <Badge count={5}>
                <Button shape="circle" icon={<BellOutlined />} />
             </Badge>
             <Avatar icon={<UserOutlined />} />
             <span>Admin</span>
          </Space>
        </Header>
        <Content style={{ margin: '16px' }}>
          <div
            style={{
              padding: 24,
              minHeight: 360,
              background: colorBgContainer,
              borderRadius: borderRadiusLG,
            }}
          >
            {/* 子路由的內容將會渲染在這裡 */}
            <Outlet />
          </div>
        </Content>
        <Footer style={{ textAlign: 'center' }}>
          SRE Platform ©{new Date().getFullYear()} Created by Jules
        </Footer>
      </Layout>
    </Layout>
  );
};

export default MainLayout;
