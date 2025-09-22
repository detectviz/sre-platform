import { BellOutlined, UserOutlined } from '@ant-design/icons';
import { Avatar, Badge, Layout, Menu, Space, Typography } from 'antd';
import type { MenuProps } from 'antd';
import { useMemo } from 'react';
import { Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import {
  EventRulesPage,
  EventsListPage,
  SilenceRulesPage
} from './pages/events';
import {
  ResourceGroupPage,
  ResourceListPage,
  TopologyPage
} from './pages/resources';
import {
  DashboardListPage,
  InsightPage,
  WarRoomPage
} from './pages/dashboards';
import {
  ExecutionLogPage,
  SchedulePage,
  ScriptLibraryPage
} from './pages/automation';
import {
  NotificationChannelPage,
  NotificationHistoryPage,
  NotificationPolicyPage
} from './pages/notifications';
import {
  AuthSettingsPage,
  LabelSettingsPage,
  MailSettingsPage
} from './pages/settings';
import {
  PreferencePage,
  ProfileInfoPage,
  ProfileSecurityPage
} from './pages/profile';
import { NotFoundPage } from './pages/NotFoundPage';

const { Header, Sider, Content } = Layout;

type AppMenuItem = {
  key: string;
  label: string;
  children?: AppMenuItem[];
};

const APP_MENU_ITEMS: AppMenuItem[] = [
  {
    key: 'events',
    label: '事件管理',
    children: [
      { key: '/events/list', label: '事件列表' },
      { key: '/events/rules', label: '事件規則' },
      { key: '/events/silences', label: '靜音規則' }
    ]
  },
  {
    key: 'resources',
    label: '資源管理',
    children: [
      { key: '/resources/list', label: '資源列表' },
      { key: '/resources/groups', label: '資源群組' },
      { key: '/resources/topology', label: '拓撲視圖' }
    ]
  },
  {
    key: 'dashboards',
    label: '儀表板',
    children: [
      { key: '/dashboards/list', label: '儀表板列表' },
      { key: '/dashboards/insights', label: '洞察儀表板' },
      { key: '/dashboards/war-room', label: '戰情室' }
    ]
  },
  {
    key: 'automation',
    label: '自動化中心',
    children: [
      { key: '/automation/scripts', label: '腳本庫' },
      { key: '/automation/schedules', label: '排程管理' },
      { key: '/automation/executions', label: '執行日誌' }
    ]
  },
  {
    key: 'notifications',
    label: '通知管理',
    children: [
      { key: '/notifications/policies', label: '通知策略' },
      { key: '/notifications/channels', label: '通知管道' },
      { key: '/notifications/history', label: '通知歷史' }
    ]
  },
  {
    key: 'settings',
    label: '系統設定',
    children: [
      { key: '/settings/labels', label: '標籤管理' },
      { key: '/settings/mail', label: '郵件設定' },
      { key: '/settings/auth', label: '身份驗證' }
    ]
  },
  {
    key: 'profile',
    label: '個人中心',
    children: [
      { key: '/profile/info', label: '個人資訊' },
      { key: '/profile/security', label: '安全紀錄' },
      { key: '/profile/preferences', label: '偏好設定' }
    ]
  }
];

const MENU_ITEMS: MenuProps['items'] = APP_MENU_ITEMS.map((group) => ({
  key: group.key,
  label: group.label,
  children: group.children?.map((child) => ({
    key: child.key,
    label: child.label
  }))
}));

const App = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const selectedKeys = useMemo(() => {
    const pathname = location.pathname;
    const flatChildren = APP_MENU_ITEMS.flatMap((group) => group.children || []);
    const target = flatChildren.find((item) => pathname.startsWith(item.key));
    return target ? [target.key] : [pathname];
  }, [location.pathname]);

  const openKeys = useMemo(() => {
    const pathname = location.pathname;
    const group = APP_MENU_ITEMS.find((entry) =>
      entry.children?.some((child) => pathname.startsWith(child.key))
    );
    return group ? [group.key] : [];
  }, [location.pathname]);

  const handleMenuClick: MenuProps['onClick'] = (info) => {
    if (info.key) {
      navigate(info.key);
    }
  };

  return (
    <Layout className="app-layout">
      <Sider breakpoint="lg" width={260} className="app-sider">
        <div className="app-logo">
          <Typography.Text className="app-logo-subtitle">SRE Platform</Typography.Text>
          <Typography.Title level={4} className="app-logo-title">
            SRE 作戰中心
          </Typography.Title>
          <Typography.Text className="app-logo-subtitle">快速定位 · 精準恢復</Typography.Text>
        </div>
        <Menu
          mode="inline"
          items={MENU_ITEMS}
          selectedKeys={selectedKeys}
          defaultOpenKeys={openKeys}
          onClick={handleMenuClick}
          className="app-menu"
        />
      </Sider>
      <Layout className="app-main-layout">
        <Header className="app-header">
          <div>
            <div className="header-title">SRE 營運總覽</div>
            <div className="header-subtitle">即時掌握事件、資源與自動化執行狀態</div>
          </div>
          <Space size="large" align="center">
            <Badge dot offset={[0, 4]}>
              <BellOutlined style={{ fontSize: 18 }} />
            </Badge>
            <Space size="small" align="center">
              <Avatar size={32} icon={<UserOutlined />} />
              <Typography.Text style={{ color: 'var(--text-primary)' }}>
                陳家豪
              </Typography.Text>
            </Space>
          </Space>
        </Header>
        <Content className="app-content">
          <div className="content-wrapper">
            <Routes>
              <Route path="/" element={<Navigate to="/events/list" replace />} />
              <Route path="/events/list" element={<EventsListPage />} />
              <Route path="/events/rules" element={<EventRulesPage />} />
              <Route path="/events/silences" element={<SilenceRulesPage />} />

              <Route path="/resources/list" element={<ResourceListPage />} />
              <Route path="/resources/groups" element={<ResourceGroupPage />} />
              <Route path="/resources/topology" element={<TopologyPage />} />

              <Route path="/dashboards/list" element={<DashboardListPage />} />
              <Route path="/dashboards/insights" element={<InsightPage />} />
              <Route path="/dashboards/war-room" element={<WarRoomPage />} />

              <Route path="/automation/scripts" element={<ScriptLibraryPage />} />
              <Route path="/automation/schedules" element={<SchedulePage />} />
              <Route path="/automation/executions" element={<ExecutionLogPage />} />

              <Route path="/notifications/policies" element={<NotificationPolicyPage />} />
              <Route path="/notifications/channels" element={<NotificationChannelPage />} />
              <Route path="/notifications/history" element={<NotificationHistoryPage />} />

              <Route path="/settings/labels" element={<LabelSettingsPage />} />
              <Route path="/settings/mail" element={<MailSettingsPage />} />
              <Route path="/settings/auth" element={<AuthSettingsPage />} />

              <Route path="/profile/info" element={<ProfileInfoPage />} />
              <Route path="/profile/security" element={<ProfileSecurityPage />} />
              <Route path="/profile/preferences" element={<PreferencePage />} />

              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default App;
