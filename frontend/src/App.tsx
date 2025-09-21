import { useMemo } from 'react';
import { App as AntdApp, ConfigProvider, theme } from 'antd';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
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
import SREWarRoomPage from './pages/SREWarRoomPage';
import PlaceholderPage from './pages/PlaceholderPage'; // 匯入新的佔位符頁面
import { AppLayout } from './layouts/AppLayout';
import { useLocalStorage } from './hooks/useLocalStorage';

const menuItems: MenuProps['items'] = [
  { key: '/', icon: <DashboardOutlined />, label: '首頁' },
  { key: '/incidents', icon: <HistoryOutlined />, label: '事件管理' },
  { key: '/resources', icon: <HddOutlined />, label: '資源管理' },
  { key: '/dashboard', icon: <BarChartOutlined />, label: '儀表板' },
  { key: '/analyzing', icon: <BarChartOutlined />, label: '分析中心' },
  {
    key: '/automation',
    icon: <CodeOutlined />,
    label: '自動化中心',
    children: [
      { key: '/automation/center', label: '自動化總覽' },
    ]
  },
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

  const findTrail = (key: string, items: MenuProps['items'], parents: { label: React.ReactNode; key: string }[] = []) => {
    if (!items) return false;
    for (const item of items) {
      if (!item) continue;
      if (item.key === key) {
        parents.forEach((parent) => {
          if (parent?.label) {
            trail.push({ title: String(parent.label), href: parent.key });
          }
        });
        if ('label' in item && item.label) {
          trail.push({ title: String(item.label) });
        }
        return true;
      }
      if ('children' in item && item.children && findTrail(key, item.children, [...parents, item as { label: React.ReactNode; key: string }])) {
        return true;
      }
    }
    return false;
  };

    let currentPath = location.pathname;
    if (currentPath.startsWith('/automation') && currentPath !== '/automation/capacity-planning') {
      currentPath = '/automation/center';
    }

    findTrail(currentPath, menuItems);

    if (trail.length === 0 && location.pathname !== '/') {
      trail.push({ title: '首頁', href: '/' });
      trail.push({ title: pathSnippets.join(' > ') });
    } else if (trail.length === 0 && location.pathname === '/') {
      trail.push({ title: '首頁' });
    }

    return trail.map(item => ({ title: item.title, onClick: item.href ? () => navigate(item.href!) : undefined }));
  }, [location.pathname, navigate]);


  return (
    <AppLayout
      menuItems={menuItems}
      activeKey={location.pathname}
      onSelect={(key) => handleNavigate(key)}
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
          { path: '/', element: <SREWarRoomPage onNavigate={() => { }} /> },
          { path: '/incidents', element: <PlaceholderPage /> },
          { path: '/resources', element: <PlaceholderPage /> },
          { path: '/dashboard', element: <PlaceholderPage /> },
          { path: '/analyzing', element: <PlaceholderPage /> },
          { path: '/automation/center', element: <PlaceholderPage /> },
          { path: '/automation', element: <PlaceholderPage /> },
          { path: '/settings', element: <PlaceholderPage /> },
          { path: '/settings/iam', element: <PlaceholderPage /> },
          { path: '/settings/roles', element: <PlaceholderPage /> },
          { path: '/settings/audit', element: <PlaceholderPage /> },
          { path: '/settings/notifications', element: <PlaceholderPage /> },
          { path: '/settings/platform', element: <PlaceholderPage /> },
        ],
      },
    ],
  },
]);

const App = () => {
  const [themeMode] = useLocalStorage<'dark' | 'light'>('sre-theme-mode', 'dark');

  // Create a client for React Query
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 5 * 60 * 1000, // 5 minutes
        retry: 1,
      },
    },
  });

  return (
    <QueryClientProvider client={queryClient}>
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
    </QueryClientProvider>
  );
};

export default App;
