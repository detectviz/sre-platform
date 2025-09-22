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
  TeamOutlined,
  UserOutlined,
  BellOutlined,
  ProfileOutlined,
} from '@ant-design/icons';
import type { MenuProps } from 'antd';

import { AuthProvider, useAuth } from './contexts/AuthContext';
import LoginPage from './pages/LoginPage';
import PrivateRoute from './components/PrivateRoute';
import IncidentsPage from './pages/IncidentsPage';
import EventRulePage from './pages/EventRulePage';
import SilenceRulePage from './pages/SilenceRulePage';
import ResourcesPage from './pages/ResourcesPage';
import ResourceGroupPage from './pages/ResourceGroupPage';
import ResourceTopologyPage from './pages/ResourceTopologyPage';
import DashboardListPage from './pages/DashboardListPage';
import InfrastructureInsightsPage from './pages/InfrastructureInsightsPage';
import SREWarRoomPage from './pages/SREWarRoomPage';
import AnalyzingPage from './pages/AnalyzingPage';
import ScriptLibraryPage from './pages/ScriptLibraryPage';
import ScheduleManagementPage from './pages/ScheduleManagementPage';
import ExecutionLogsPage from './pages/ExecutionLogsPage';
import TagManagementPage from './pages/TagManagementPage';
import EmailSettingsPage from './pages/EmailSettingsPage';
import AuthSettingsPage from './pages/AuthSettingsPage';
import UserManagementPage from './pages/UserManagementPage';
import TeamManagementPage from './pages/TeamManagementPage';
import RoleManagementPage from './pages/RoleManagementPage';
import AuditLogsPage from './pages/AuditLogsPage';
import NotificationStrategyPage from './pages/NotificationStrategyPage';
import NotificationChannelPage from './pages/NotificationChannelPage';
import NotificationHistoryPage from './pages/NotificationHistoryPage';
import PersonalInformationPage from './pages/PersonalInformationPage';
import PasswordSecurityPage from './pages/PasswordSecurityPage';
import PreferenceSettingsPage from './pages/PreferenceSettingsPage';
import IdentitySettingsPage from './pages/IdentitySettingsPage';
import NotificationSettingsPage from './pages/NotificationSettingsPage';
import PlatformSettingsPage from './pages/PlatformSettingsPage';
import { AppLayout } from './layouts/AppLayout';
import { useLocalStorage } from './hooks/useLocalStorage';

const menuItems: MenuProps['items'] = [
  { key: '/', icon: <DashboardOutlined />, label: '首頁' },
  {
    key: '/incidents/list',
    icon: <HistoryOutlined />,
    label: '事件管理',
    children: [
      { key: '/incidents/list', label: '事件列表' },
      { key: '/incidents/rules', label: '事件規則' },
      { key: '/incidents/silences', label: '靜音規則' },
    ]
  },
  {
    key: '/resources/list',
    icon: <HddOutlined />,
    label: '資源管理',
    children: [
      { key: '/resources/list', label: '資源列表' },
      { key: '/resources/groups', label: '資源群組' },
      { key: '/resources/topology', label: '拓撲視圖' },
    ]
  },
  {
    key: '/dashboard/list',
    icon: <BarChartOutlined />,
    label: '儀表板管理',
    children: [
      { key: '/dashboard/list', label: '儀表板列表' },
      { key: '/dashboard/warroom', label: 'SRE 戰情室' },
      { key: '/dashboard/infrastructure', label: '基礎設施洞察' },
    ]
  },
  {
    key: '/analyzing',
    icon: <BarChartOutlined />,
    label: '分析中心',
    children: [
      { key: '/analyzing', label: '容量規劃' },
      { key: '/analyzing/trends', label: '趨勢分析' },
      { key: '/analyzing/predictions', label: '風險預測' },
    ]
  },
  {
    key: '/automation/scripts',
    icon: <CodeOutlined />,
    label: '自動化中心',
    children: [
      { key: '/automation/scripts', label: '腳本庫' },
      { key: '/automation/schedules', label: '排程管理' },
      { key: '/automation/logs', label: '執行日誌' },
    ]
  },
  {
    key: '/settings',
    icon: <SettingOutlined />,
    label: '設定',
    children: [
      {
        key: '/settings/identity',
        label: '身份與存取管理',
        children: [
          { key: '/identity/users', label: '人員管理' },
          { key: '/identity/teams', label: '團隊管理' },
          { key: '/identity/roles', label: '角色管理' },
          { key: '/identity/audit', label: '審計日誌' },
        ]
      },
      {
        key: '/settings/notifications',
        label: '通知管理',
        children: [
          { key: '/notifications/strategies', label: '通知策略' },
          { key: '/notifications/channels', label: '通知管道' },
          { key: '/notifications/history', label: '通知歷史' },
        ]
      },
      {
        key: '/settings/platform',
        label: '平台設定',
        children: [
          { key: '/settings/tags', label: '標籤管理' },
          { key: '/settings/email', label: '郵件設定' },
          { key: '/settings/auth', label: '身份驗證' },
        ]
      },
    ]
  },
  {
    key: '/profile/personal',
    icon: <ProfileOutlined />,
    label: '個人資料與偏好設定',
    children: [
      { key: '/profile/personal', label: '個人資訊' },
      { key: '/profile/security', label: '密碼安全' },
      { key: '/profile/preferences', label: '偏好設定' },
    ]
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

    const findTrail = (key: string, items: MenuProps['items'], parents: MenuProps['items'] = []) => {
      for (const item of items || []) {
        if (!item) continue;
        if ('key' in item && item.key === key) {
          parents.forEach((parent) => {
            if (parent && 'label' in parent && parent.label) {
              trail.push({ title: String(parent.label), href: String(parent.key) });
            }
          });
          if ('label' in item && item.label) {
            trail.push({ title: String(item.label) });
          }
          return true;
        }
        if ('children' in item && item.children && findTrail(key, item.children, [...parents, item])) {
          return true;
        }
      }
      return false;
    };

    let currentPath = location.pathname;
    if (currentPath.startsWith('/automation') && currentPath !== '/automation/capacity-planning') {
      currentPath = '/automation/scripts';
    }

    // Handle new settings menu structure
    if (currentPath.startsWith('/identity/') || currentPath.startsWith('/notifications/')) {
      // Map identity and notification paths to their parent settings path
      if (currentPath.startsWith('/identity/')) {
        currentPath = '/settings/identity';
      } else if (currentPath.startsWith('/notifications/')) {
        currentPath = '/settings/notifications';
      }
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
          { path: '/incidents/list', element: <IncidentsPage onNavigate={() => { }} pageKey="incident-list" /> },
          { path: '/incidents/rules', element: <EventRulePage onNavigate={() => { }} /> },
          { path: '/incidents/silences', element: <SilenceRulePage onNavigate={() => { }} /> },
          { path: '/resources/list', element: <ResourcesPage onNavigate={() => { }} pageKey="resource-overview" themeMode="dark" /> },
          { path: '/resources/groups', element: <ResourceGroupPage onNavigate={() => { }} /> },
          { path: '/resources/topology', element: <ResourceTopologyPage onNavigate={() => { }} /> },
          { path: '/dashboard/list', element: <DashboardListPage onNavigate={() => { }} /> },
          { path: '/dashboard/warroom', element: <SREWarRoomPage onNavigate={() => { }} /> },
          { path: '/dashboard/infrastructure', element: <InfrastructureInsightsPage onNavigate={() => { }} /> },
          { path: '/analyzing', element: <AnalyzingPage onNavigate={() => { }} pageKey="capacity-planning" themeMode="dark" /> },
          { path: '/analyzing/trends', element: <AnalyzingPage onNavigate={() => { }} pageKey="trend-analysis" themeMode="dark" /> },
          { path: '/analyzing/predictions', element: <AnalyzingPage onNavigate={() => { }} pageKey="risk-prediction" themeMode="dark" /> },
          { path: '/identity/users', element: <UserManagementPage onNavigate={() => { }} /> },
          { path: '/identity/teams', element: <TeamManagementPage onNavigate={() => { }} /> },
          { path: '/identity/roles', element: <RoleManagementPage onNavigate={() => { }} /> },
          { path: '/identity/audit', element: <AuditLogsPage onNavigate={() => { }} /> },
          { path: '/automation/scripts', element: <ScriptLibraryPage onNavigate={() => { }} /> },
          { path: '/automation/schedules', element: <ScheduleManagementPage onNavigate={() => { }} /> },
          { path: '/automation/logs', element: <ExecutionLogsPage onNavigate={() => { }} /> },
          { path: '/notifications/strategies', element: <NotificationStrategyPage onNavigate={() => { }} /> },
          { path: '/notifications/channels', element: <NotificationChannelPage onNavigate={() => { }} /> },
          { path: '/notifications/history', element: <NotificationHistoryPage onNavigate={() => { }} /> },
          { path: '/settings/identity', element: <IdentitySettingsPage /> },
          { path: '/settings/notifications', element: <NotificationSettingsPage /> },
          { path: '/settings/platform', element: <PlatformSettingsPage /> },
          { path: '/settings/tags', element: <TagManagementPage onNavigate={() => { }} /> },
          { path: '/settings/email', element: <EmailSettingsPage onNavigate={() => { }} /> },
          { path: '/settings/auth', element: <AuthSettingsPage onNavigate={() => { }} /> },
          { path: '/profile/personal', element: <PersonalInformationPage onNavigate={() => { }} /> },
          { path: '/profile/security', element: <PasswordSecurityPage onNavigate={() => { }} /> },
          { path: '/profile/preferences', element: <PreferenceSettingsPage onNavigate={() => { }} /> },
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
            colorText: 'rgba(255, 255, 255, 0.95)',
            colorTextSecondary: 'rgba(255, 255, 255, 0.65)',
            colorBorder: 'rgba(255, 255, 255, 0.12)',
            colorBorderSecondary: 'rgba(255, 255, 255, 0.08)',
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
