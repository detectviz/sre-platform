import React, { useState, useEffect } from 'react';
import { Layout, Menu, Input, Avatar, Button, Breadcrumb, Typography, Dropdown, Badge, Modal, App as AntdApp } from 'antd';
import {
    UserOutlined, SearchOutlined, LogoutOutlined, DashboardOutlined, HddOutlined,
    TeamOutlined, CodeOutlined, BarChartOutlined, HistoryOutlined, SettingOutlined,
    BellOutlined, DownOutlined, QuestionCircleOutlined, MenuUnfoldOutlined, MenuFoldOutlined,
    ControlOutlined, DeploymentUnitOutlined
} from '@ant-design/icons';
import { Outlet, useLocation, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const { Header, Content, Sider } = Layout;
const { Title } = Typography;

const MainLayout = () => {
    const [collapsed, setCollapsed] = useState(false);
    const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);

    const navigate = useNavigate();
    const location = useLocation();
    const { logout } = useAuth();
    const { message } = AntdApp.useApp();

    const handleMenuClick = ({ key }: { key: string }) => {
        navigate(key);
    };

    const sideMenuItems = [
        { key: '/home', icon: <DashboardOutlined />, label: '首頁' },
        { key: '/incidents', icon: <HistoryOutlined />, label: '事件' },
        { key: '/resources', icon: <HddOutlined />, label: '資源' },
        { key: '/analyzing', icon: <BarChartOutlined />, label: '分析' },
        { key: '/automation', icon: <CodeOutlined />, label: '自動化' },
        {
            key: '/settings',
            icon: <SettingOutlined />,
            label: '設定',
            children: [
                { key: '/user-permissions', icon: <UserOutlined />, label: '用戶與權限' },
                { key: '/notification-management', icon: <BellOutlined />, label: '通知管理' },
                { key: '/platform-settings', icon: <SettingOutlined />, label: '平台設定' },
                { key: '/platform-operations', icon: <ControlOutlined />, label: '平台維運' },
            ],
        },
    ];

    const userMenuItems = [
        {
            key: 'profile',
            label: <Link to="/profile">個人資料</Link>,
            icon: <UserOutlined />,
        },
        {
            key: 'help',
            label: '幫助中心',
            icon: <QuestionCircleOutlined />,
            onClick: () => message.info('開啟幫助中心'),
        },
        { type: 'divider' },
        {
            key: 'logout',
            label: '登出',
            icon: <LogoutOutlined />,
            onClick: logout,
            danger: true,
        },
    ];

    // Determine selected keys based on current path
    const selectedKeys = [location.pathname];

    return (
        <Layout style={{ minHeight: '100vh' }}>
            <Sider trigger={null} collapsible collapsed={collapsed} width={220}>
                <div style={{ height: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }} onClick={() => navigate('/home')}>
                    <DeploymentUnitOutlined style={{ fontSize: '24px', color: 'white' }} />
                    {!collapsed && <Title level={4} style={{ margin: 0, marginLeft: 8, color: 'white' }}>SRE Platform</Title>}
                </div>
                <Menu
                    theme="dark"
                    mode="inline"
                    selectedKeys={selectedKeys}
                    items={sideMenuItems}
                    onClick={handleMenuClick}
                />
            </Sider>
            <Layout>
                <Header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 16px' }}>
                    <Button type="text" icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />} onClick={() => setCollapsed(!collapsed)} style={{ color: 'rgba(255, 255, 255, 0.8)' }}/>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                        <Input prefix={<SearchOutlined />} placeholder="搜尋... (Ctrl+K)" style={{ width: 250 }} onClick={() => setIsSearchModalOpen(true)} readOnly />
                        <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
                            <Button type="text" style={{ display: 'flex', alignItems: 'center' }}>
                                <Avatar size="small" icon={<UserOutlined />} />
                                <span style={{ marginLeft: 8, color: 'white' }}>admin</span>
                                <DownOutlined style={{ fontSize: '10px', marginLeft: 8 }} />
                            </Button>
                        </Dropdown>
                    </div>
                </Header>
                <Content style={{ padding: '24px', background: '#0d1117', overflow: 'auto' }}>
                    <Outlet />
                </Content>
            </Layout>
            <Modal open={isSearchModalOpen} onCancel={() => setIsSearchModalOpen(false)} footer={null} closable={false}>
                <Input size="large" placeholder="搜尋資源、事件、腳本..." autoFocus />
            </Modal>
        </Layout>
    );
};

export default MainLayout;
