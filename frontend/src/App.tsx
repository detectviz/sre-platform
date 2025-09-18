import React, { useState, useEffect } from 'react';
import { Layout, Menu, ConfigProvider, theme, Typography, Input, Avatar, Button, Row, Col, Card, Statistic, Table, Tag, Modal, Form, Select, Breadcrumb, message, Tabs, DatePicker, List, Divider, Dropdown, Badge, Drawer, Tree, Collapse, InputNumber, Transfer, Spin, Empty, Switch, Space, Radio, Progress, Popover, Tooltip, Descriptions, Timeline, Checkbox, Steps, TimePicker, Alert, AutoComplete } from 'antd';
import { UserOutlined, SearchOutlined, LogoutOutlined, DashboardOutlined, HddOutlined, TeamOutlined, ProfileOutlined, CodeOutlined, BarChartOutlined, HistoryOutlined, HomeOutlined, PlusOutlined, SettingOutlined, SafetyCertificateOutlined, BellOutlined, DownOutlined, ExclamationCircleOutlined, InfoCircleOutlined, EditOutlined, DeleteOutlined, ApartmentOutlined, BuildOutlined, ControlOutlined, AuditOutlined, MenuUnfoldOutlined, MenuFoldOutlined, PauseCircleOutlined, ScheduleOutlined, CarryOutOutlined, ThunderboltOutlined, MinusCircleOutlined, FireOutlined, ClockCircleOutlined, CheckCircleOutlined, CopyOutlined, PlayCircleOutlined, RobotOutlined, DeploymentUnitOutlined, EyeOutlined, FilterOutlined, ReloadOutlined, DownloadOutlined, DollarOutlined, LineChartOutlined, AlertOutlined, PieChartOutlined, FileDoneOutlined, FileTextOutlined, DatabaseOutlined, FieldTimeOutlined, RiseOutlined, FileProtectOutlined, BranchesOutlined, BookOutlined, AppstoreOutlined, ArrowUpOutlined, ArrowDownOutlined, AlignCenterOutlined, CompressOutlined, ExpandOutlined, MinusOutlined, UnorderedListOutlined, WarningOutlined, GlobalOutlined, SaveOutlined, QuestionCircleOutlined, BulbOutlined, LockOutlined, TagsOutlined, TagOutlined, LinkOutlined, MailOutlined, BarsOutlined, CloseOutlined, CheckOutlined, SafetyOutlined, MonitorOutlined } from '@ant-design/icons';
import './styles/App.css';

import HomePage from './pages/HomePage';
import IncidentsPage from './pages/IncidentsPage';
import ResourcesPage from './pages/ResourcesPage';
import AutomationCenterPage from './pages/AutomationCenterPage';
import AnalyzingPage from './pages/AnalyzingPage';
import SettingsPage from './pages/SettingsPage';
import ProfilePage from './pages/ProfilePage';
import UserPermissionsPage from './pages/UserPermissionsPage';
import NotificationManagementPage from './pages/NotificationManagementPage';
import PlatformSettingsPage from './pages/PlatformSettingsPage';
import DashboardAdministrationPage from './pages/DashboardAdministrationPage';


const { Header, Content, Sider } = Layout;
const { Title } = Typography;

const useLocalStorageState = (key, defaultValue) => {
    const [state, setState] = useState(() => {
      try {
        const storedValue = window.localStorage.getItem(key);
        return storedValue ? JSON.parse(storedValue) : defaultValue;
      } catch (error) {
        return defaultValue;
      }
    });

    useEffect(() => {
      try {
        window.localStorage.setItem(key, JSON.stringify(state));
      } catch (error) {
        // Ignore write errors
      }
    }, [key, state]);

    return [state, setState];
  };

const MainApp = () => {
    const [currentPage, setCurrentPage] = useState('home');
    const [pageParams, setPageParams] = useState({});
    const [collapsed, setCollapsed] = useState(false);
    const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
    const [themeMode, setThemeMode] = useLocalStorageState('sre-theme-mode', 'dark');

    const navigateToPage = (pageKey, params = {}) => {
        setCurrentPage(pageKey);
        setPageParams(params);
    };

    const handleLogout = () => { message.success('已成功登出'); setTimeout(() => window.location.reload(), 500); }
    const handleMenuClick = ({ key }) => {
        setCurrentPage(key);
    };

    const handleSubMenuTitleClick = ({ key, domEvent }) => {
        domEvent.stopPropagation();
        setCurrentPage(key);
    };

    const getItem = (label, key, icon, children) => {
        const item = {
          key,
          icon,
          children,
          label,
          disabled: false
        };

        if (children) {
          item.onTitleClick = handleSubMenuTitleClick;
        }

        return item;
    };

    const sideMenuItems = [
        getItem('首頁', 'home', <DashboardOutlined />),
        getItem('事件管理', 'incidents', <HistoryOutlined />),
        getItem('資源管理', 'resources', <HddOutlined />),
        getItem('儀表板', 'dashboard', <BarChartOutlined />),
        getItem('分析中心', 'analyzing', <BarChartOutlined />),
        getItem('自動化中心', 'automation', <CodeOutlined />),
        getItem('設定', 'settings', <SettingOutlined />, [
          getItem('身份與存取管理', 'identity-access-management', <UserOutlined />),
          getItem('通知管理', 'notification-management', <BellOutlined />),
          getItem('平台設定', 'platform-settings', <SettingOutlined />),
        ]),
      ];

    const PageContent = () => {
        const pageKey = currentPage;

        if (['home'].includes(pageKey)) {
            return <HomePage themeMode={themeMode} onNavigate={navigateToPage} />;
        }
        if (['incidents', 'incident-list', 'alerting-rules', 'silences'].includes(pageKey)) {
            return <IncidentsPage onNavigate={navigateToPage} pageKey={pageKey} />;
        }
        if (['resources', 'resource-overview', 'resource-list', 'resource-groups', 'resource-topology'].includes(pageKey)) {
            return <ResourcesPage onNavigate={navigateToPage} pageKey={pageKey} themeMode={themeMode} />;
        }
        if (pageKey === 'dashboard') {
            return <DashboardAdministrationPage onNavigate={navigateToPage} />;
        }
        if (['analyzing', 'capacity-planning', 'performance-insights', 'cost-analysis', 'incident-trends', 'mttr-analysis', 'sla-reports'].includes(pageKey)) {
            return <AnalyzingPage onNavigate={navigateToPage} pageKey={pageKey} themeMode={themeMode} />;
        }
        if (['automation', 'scripts', 'schedules', 'executions'].includes(pageKey)) {
            return <AutomationCenterPage onNavigate={navigateToPage} pageKey={pageKey} />;
        }
        if (['identity-access-management', 'personnel-management', 'team-management', 'role-management', 'audit-logs'].includes(pageKey)) {
            return <UserPermissionsPage onNavigate={navigateToPage} pageKey={pageKey} />;
        }
        if (['notification-management', 'notification-strategies', 'notification-channels', 'notification-history'].includes(pageKey)) {
            return <NotificationManagementPage onNavigate={navigateToPage} pageKey={pageKey} />;
        }
        if (pageKey === 'settings') {
            return <SettingsPage onNavigate={navigateToPage} />;
        }
        if (['platform-settings', 'tag-management', 'email-settings', 'auth-settings', 'identity-access-management'].includes(pageKey)) {
            return <PlatformSettingsPage />;
        }
        if (['profile'].includes(pageKey)) {
            return <ProfilePage themeMode={themeMode} setThemeMode={setThemeMode} />;
        }
        return <HomePage />;
    };

    const findLabel = (key, menu) => {
        for (const item of menu) {
          if (item.key === key) return { parent: null, parentKey: null, child: item.label };
          if (item.children) {
            for (const child of item.children) {
              if (child.key === key) return { parent: item.label, parentKey: item.key, child: child.label };
              if (child.children) {
                for (const grandChild of child.children) {
                  if (grandChild.key === key) return { parent: child.label, parentKey: child.key, child: grandChild.label };
                }
              }
            }
          }
        }
        if (key === 'profile') {
          return { parent: null, parentKey: null, child: '個人資料' };
        }
        return { parent: null, parentKey: null, child: '總覽' };
    };

    const { parent, parentKey, child } = findLabel(currentPage, sideMenuItems);
    const breadcrumbItems = [{ title: <a onClick={() => setCurrentPage('home')}>Home</a> }];
    if (parent) {
        breadcrumbItems.push({ title: <a onClick={() => setCurrentPage(parentKey)}>{parent}</a> });
    }
    if (child && child !== '總覽' && child !== parent) {
        breadcrumbItems.push({ title: child });
    }

    const userMenuItems = [
        { key: 'profile', label: '個人資料', onClick: () => setCurrentPage('profile') },
        { key: 'logout', label: '登出', onClick: handleLogout, danger: true }
    ];

    return (
        <Layout style={{ minHeight: '100vh' }}>
            <Sider trigger={null} collapsible collapsed={collapsed} width={220}>
                <div style={{ height: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setCurrentPage('home')}>
                    <Title level={4} style={{ color: 'white', margin: 0 }}>SRE Platform</Title>
                </div>
                <Menu theme="dark" mode="inline" selectedKeys={[currentPage]} items={sideMenuItems} onClick={handleMenuClick} />
            </Sider>
            <Layout>
                <Header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 16px', background: '#001529' }}>
                    <Button type="text" icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />} onClick={() => setCollapsed(!collapsed)} style={{ color: 'white' }} />
                    <Space>
                        <Input.Search placeholder="Search..." onSearch={() => {}} style={{ width: 200 }} />
                        <Badge count={5}>
                            <Button type="text" icon={<BellOutlined style={{ color: 'white' }} />} />
                        </Badge>
                        <Dropdown menu={{ items: userMenuItems }}>
                            <a onClick={(e) => e.preventDefault()}>
                                <Space>
                                    <Avatar icon={<UserOutlined />} />
                                    admin
                                    <DownOutlined />
                                </Space>
                            </a>
                        </Dropdown>
                    </Space>
                </Header>
                <Content style={{ margin: '24px 16px', padding: 24, minHeight: 280, background: '#0d1117' }}>
                    <Breadcrumb items={breadcrumbItems} style={{ marginBottom: 16 }} />
                    <PageContent />
                </Content>
            </Layout>
        </Layout>
    );
};

export default MainApp;
