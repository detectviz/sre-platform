import { useMemo } from 'react';
import {
  LockOutlined,
  MailOutlined,
  SettingOutlined,
  TagsOutlined,
} from '@ant-design/icons';
import { Alert, Col, Row, Space, Tabs } from 'antd';
import type { TabsProps } from 'antd';
import { ContextualKPICard, PageHeader } from '../components';

export type PlatformSettingsPageProps = {
  onNavigate: (key: string) => void;
  pageKey: string;
};

const stats = {
  totalTags: 42,
  activeTags: 38,
  authSessions: 156,
  configChanges: 7,
  lastBackup: '2 小時前',
};

const TagManagementTab = () => (
  <Alert showIcon type="info" message="標籤治理模組即將接上 API" description="目前提供預覽版設定檢視，後續將支援標籤規則 CRUD 與合規報表。" />
);

const EmailSettingsTab = () => (
  <Alert showIcon type="warning" message="郵件伺服器尚未設定" description="請於部署時填寫 SMTP 連線資訊，確保通知能正確寄送。" />
);

const AuthSettingsTab = () => (
  <Alert showIcon type="info" message="身份驗證整合" description="支援 Keycloak 與自管 OAuth Provider，正式環境請改用環境變數配置。" />
);


const PlatformSettingsPage = ({ onNavigate, pageKey }: PlatformSettingsPageProps) => {
  const items: TabsProps['items'] = useMemo(() => [
    {
      key: 'tag-management',
      label: (
        <span>
          <TagsOutlined /> 標籤管理
        </span>
      ),
      children: <TagManagementTab />,
    },
    {
      key: 'email-settings',
      label: (
        <span>
          <MailOutlined /> 郵件設定
        </span>
      ),
      children: <EmailSettingsTab />,
    },
    {
      key: 'auth-settings',
      label: (
        <span>
          <LockOutlined /> 身份驗證
        </span>
      ),
      children: <AuthSettingsTab />,
    },
  ], [onNavigate]);

  const activeKey = items.some((item) => item?.key === pageKey) ? pageKey : 'tag-management';

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <PageHeader
        title="平台設定"
        subtitle="管理平台核心參數、通知與身份驗證整合"
      />

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={6}>
          <ContextualKPICard
            title="標籤總數"
            value={stats.totalTags}
            unit="個"
            status="info"
            description={`${stats.activeTags} 個啟用中`}
            icon={<TagsOutlined />}
          />
        </Col>
        <Col xs={24} sm={12} md={6}>
          <ContextualKPICard
            title="活躍會話"
            value={stats.authSessions}
            unit="個"
            status="success"
            description="目前登入的使用者會話"
            icon={<LockOutlined />}
          />
        </Col>
        <Col xs={24} sm={12} md={6}>
          <ContextualKPICard
            title="配置異動"
            value={stats.configChanges}
            unit="次"
            status="warning"
            description={`最後備份：${stats.lastBackup}`}
            icon={<SettingOutlined />}
          />
        </Col>
      </Row>

      <Tabs items={items} activeKey={activeKey} onChange={(key) => onNavigate(key)} />
    </Space>
  );
};

export default PlatformSettingsPage;
