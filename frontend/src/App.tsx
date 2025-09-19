import { useMemo, useState } from 'react';
import { App as AntdApp, ConfigProvider, theme } from 'antd';
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
import SREWarRoomPage from './pages/SREWarRoomPage';
import { AppLayout } from './layouts/AppLayout';

const useLocalStorageState = <T,>(key: string, defaultValue: T): [T, (value: T) => void] => {
  const stored = typeof window !== 'undefined' ? window.localStorage.getItem(key) : null;
  const initial = stored ? (JSON.parse(stored) as T) : defaultValue;
  const [state, setState] = useState<T>(initial);

  const updateState = (value: T) => {
    setState(value);
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (err) {
      console.warn('無法寫入 localStorage', err);
    }
  };

  return [state, updateState];
};

const menuItems: MenuProps['items'] = [
  { key: 'home', icon: <DashboardOutlined />, label: '首頁' },
  { key: 'incidents', icon: <HistoryOutlined />, label: '事件管理' },
  { key: 'resources', icon: <HddOutlined />, label: '資源管理' },
  { key: 'dashboard', icon: <BarChartOutlined />, label: '儀表板' },
  { key: 'analyzing', icon: <BarChartOutlined />, label: '分析中心' },
  { key: 'automation', icon: <CodeOutlined />, label: '自動化中心' },
  {
    key: 'settings',
    icon: <SettingOutlined />,
    label: '設定',
    children: [
      { key: 'identity-access-management', icon: <UserOutlined />, label: '身份與存取管理' },
      { key: 'notification-management', icon: <BellOutlined />, label: '通知管理' },
      { key: 'platform-settings', icon: <SettingOutlined />, label: '平台設定' },
    ],
  },
];

type AppShellProps = {
  themeMode: 'dark' | 'light';
  setThemeMode: (mode: 'dark' | 'light') => void;
};

const AppShell = ({ themeMode, setThemeMode }: AppShellProps) => {
  const { message } = AntdApp.useApp();
  const [currentPage, setCurrentPage] = useState('home');
  const [, setPageParams] = useState<Record<string, unknown>>({});

  const breadcrumbItems = useMemo(() => {
    const trail: { title: string; onClick?: () => void }[] = [
      { title: 'Home', onClick: () => setCurrentPage('home') },
    ];

    const findTrail = (key: string, items: any[], parents: any[] = []) => {
      for (const item of items) {
        if (!item) continue;
        if (item.key === key) {
          parents.forEach((parent) => {
            if (parent?.label) {
              trail.push({ title: String(parent.label) });
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

    findTrail(currentPage, menuItems);

    if (currentPage === 'business-dashboard') {
      trail.push({ title: '儀表板', onClick: () => setCurrentPage('dashboard') });
      trail.push({ title: 'SRE 戰情室' });
    }

    return trail.map(({ title, onClick }) => ({ title, onClick }));
  }, [currentPage]);

  const handleNavigate = (key: string, params: Record<string, unknown> = {}) => {
    if (key === 'logout') {
      message.success('已成功登出');
      setTimeout(() => window.location.reload(), 500);
      return;
    }
    setCurrentPage(key);
    setPageParams(params);
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <SREWarRoomPage onNavigate={handleNavigate} />;
      case 'incidents':
      case 'incident-list':
      case 'alerting-rules':
      case 'silences':
        return <IncidentsPage onNavigate={handleNavigate} pageKey={currentPage} />;
      case 'resources':
      case 'resource-overview':
      case 'resource-list':
      case 'resource-groups':
      case 'resource-topology':
        return <ResourcesPage onNavigate={handleNavigate} pageKey={currentPage} themeMode={themeMode} />;
      case 'dashboard':
        return <DashboardAdministrationPage onNavigate={handleNavigate} />;
      case 'business-dashboard':
        return <SREWarRoomPage onNavigate={handleNavigate} />;
      case 'analyzing':
      case 'capacity-planning':
      case 'performance-insights':
      case 'cost-analysis':
      case 'incident-trends':
      case 'mttr-analysis':
      case 'sla-reports':
        return <AnalyzingPage onNavigate={handleNavigate} pageKey={currentPage} themeMode={themeMode} />;
      case 'automation':
      case 'scripts':
      case 'schedules':
      case 'executions':
        return <AutomationCenterPage onNavigate={handleNavigate} pageKey={currentPage} />;
      case 'settings':
        return <SettingsPage onNavigate={handleNavigate} />;
      case 'identity-access-management':
      case 'personnel-management':
      case 'team-management':
      case 'role-management':
      case 'audit-logs':
        return <UserPermissionsPage onNavigate={handleNavigate} pageKey={currentPage} />;
      case 'notification-management':
      case 'notification-strategies':
      case 'notification-channels':
      case 'notification-history':
        return <NotificationManagementPage onNavigate={handleNavigate} pageKey={currentPage} />;
      case 'platform-settings':
      case 'tag-management':
      case 'email-settings':
      case 'auth-settings':
        return <PlatformSettingsPage onNavigate={handleNavigate} pageKey={currentPage} />;
      case 'profile':
        return <ProfilePage themeMode={themeMode} setThemeMode={setThemeMode} />;
      default:
        return <HomePage onNavigate={handleNavigate} themeMode={themeMode} />;
    }
  };

  return (
    <AppLayout
      menuItems={menuItems}
      activeKey={currentPage}
      onSelect={handleNavigate}
      breadcrumbItems={breadcrumbItems}
    >
      {renderPage()}
    </AppLayout>
  );
};

const App = () => {
  const [themeMode, setThemeMode] = useLocalStorageState<'dark' | 'light'>('sre-theme-mode', 'dark');

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
        <AppShell themeMode={themeMode} setThemeMode={setThemeMode} />
      </AntdApp>
    </ConfigProvider>
  );
};

export default App;
