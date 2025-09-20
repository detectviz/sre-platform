import { useMemo } from 'react';
import { App as AntdApp, ConfigProvider, theme } from 'antd';
import {
  createBrowserRouter,
  RouterProvider,
  useNavigate,
  Outlet,
  useLocation,
} from 'react-router-dom';
import {
  BarChartOutlined,
  CodeOutlined,
  DashboardOutlined,
  HistoryOutlined,
  HddOutlined,
  SettingOutlined,
  UserOutlined,
  BellOutlined,
} from '@ant-design/icons';
import type { MenuProps } from 'antd';

import { AuthProvider, useAuth } from './contexts/AuthContext';
import LoginPage from './pages/LoginPage';
import PrivateRoute from './components/PrivateRoute';
import HomePage from './pages/HomePage';
import IncidentsPage from './pages/IncidentsPage';
import ResourcesPage from './pages/ResourcesPage';
import AutomationCenterPage from './pages/AutomationCenterPage';
import AnalyzingPage from './pages/AnalyzingPage';
import SettingsPage from './pages/SettingsPage';
import UserPermissionsPage from './pages/UserPermissionsPage';
import NotificationManagementPage from './pages/NotificationManagementPage';
import PlatformSettingsPage from './pages/PlatformSettingsPage';
import DashboardAdministrationPage from './pages/DashboardAdministrationPage';
import SREWarRoomPage from './pages/SREWarRoomPage';
import RoleManagementPage from './pages/RoleManagementPage';
import AuditLogPage from './pages/AuditLogPage';
import { AppLayout } from './layouts/AppLayout';
import { useLocalStorage } from './hooks/useLocalStorage';

const menuItems: MenuProps['items'] = [
  { key: '/', icon: <DashboardOutlined />, label: '首頁' },
  { key: '/incidents', icon: <HistoryOutlined />, label: '事件管理' },
  { key: '/resources', icon: <HddOutlined />, label: '資源管理' },
  { key: '/dashboard', icon: <BarChartOutlined />, label: '儀表板' },
  { key: '/analyzing', icon: <BarChartOutlined />, label: '分析中心' },
  { key: '/automation', icon: <CodeOutlined />, label: '自動化中心' },
  {
    key: '/settings',
    icon: <SettingOutlined />,
    label: '設定',
    children: [
      { key: '/settings/iam', icon: <UserOutlined />, label: '身份與存取管理' },
      { key: '/settings/notifications', icon: <BellOutlined />, label: '通知管理' },
      { key: '/settings/platform', icon: <SettingOutlined />, label: '平台設定' },
    ],
  },
];

const AppShell = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const { logout } = useAuth();
  const { message } = AntdApp.useApp();

  const handleNavigate = (key: string) => {
    if (key === 'logout') {
      logout();
      message.success('已成功登出');
      navigate('/login');
      return;
    }
    navigate(key);
  };

  const breadcrumbItems = useMemo(() => {
    const trail: { title: string; href?: string }[] = [];
    const pathSnippets = location.pathname.split('/').filter(i => i);

    const findTrail = (key: string, items: any[], parents: any[] = []) => {
      for (const item of items) {
        if (!item) continue;
        if (item.key === key) {
          parents.forEach((parent) => {
            if (parent?.label) {
              trail.push({ title: String(parent.label), href: parent.key });
            }
          });
          if (item.label) {
            trail.push({ title: String(item.label) });
          }
          return true;
        }
        if (item.children && findTrail(key, item.children as any[], [...parents, item])) {
          return true;
        }
      }
      return false;
    };

    findTrail(location.pathname, menuItems);

    if (trail.length === 0 && location.pathname !== '/') {
        trail.push({ title: '首頁', href: '/' });
        trail.push({ title: pathSnippets.join(' > ') });
    } else if (trail.length === 0 && location.pathname === '/') {
        trail.push({ title: '首頁' });
    }

    return trail.map(item => ({ title: item.title, onClick: item.href ? () => navigate(item.href) : undefined }));
  }, [location.pathname, navigate]);


  return (
    <AppLayout
      menuItems={menuItems}
      activeKey={location.pathname}
      onSelect={({ key }) => handleNavigate(key)}
      breadcrumbItems={breadcrumbItems}
    >
      <Outlet />
    </AppLayout>
  );
};

const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/',
    element: <PrivateRoute />,
    children: [
      {
        element: <AppShell />,
        children: [
          { path: '/', element: <SREWarRoomPage onNavigate={() => {}} /> },
          { path: '/incidents', element: <IncidentsPage onNavigate={() => {}} pageKey="incident-list" /> },
          { path: '/resources', element: <ResourcesPage onNavigate={() => {}} pageKey="resource-list" themeMode="dark" /> },
          { path: '/dashboard', element: <DashboardAdministrationPage onNavigate={() => {}} /> },
          { path: '/analyzing', element: <AnalyzingPage onNavigate={() => {}} pageKey="capacity-planning" themeMode="dark" /> },
          { path: '/automation', element: <AutomationCenterPage onNavigate={() => {}} pageKey="scripts" /> },
          { path: '/settings', element: <SettingsPage onNavigate={() => {}} /> },
          { path: '/settings/iam', element: <UserPermissionsPage onNavigate={() => {}} pageKey="personnel-management" /> },
          { path: '/settings/roles', element: <RoleManagementPage /> },
          { path: '/settings/audit', element: <AuditLogPage /> },
          { path: '/settings/notifications', element: <NotificationManagementPage onNavigate={() => {}} pageKey="notification-channels" /> },
          { path: '/settings/platform', element: <PlatformSettingsPage onNavigate={() => {}} pageKey="tag-management" /> },
          // TODO: 新增其他頁面的路由
        ],
      },
    ],
  },
]);

const App = () => {
  const [themeMode] = useLocalStorage<'dark' | 'light'>('sre-theme-mode', 'dark');

  return (
    <ConfigProvider
      theme={{
        algorithm: themeMode === 'dark' ? theme.darkAlgorithm : theme.defaultAlgorithm,
        token: {
          colorPrimary: '#1890ff',
          colorBgContainer: '#141519',
          colorBgElevated: '#1A1D23',
          colorText: '#e6f4ff',
        },
      }}
    >
      <AntdApp>
        <AuthProvider>
          <RouterProvider router={router} />
        </AuthProvider>
      </AntdApp>
    </ConfigProvider>
  );
};

export default App;
