import React, { useState, useEffect } from 'react';
import {
  Typography,
  Button,
  Form,
  Select,
  Spin,
  Tabs,
  Alert,
  Descriptions,
  App as AntdApp,
} from 'antd';
import {
  LinkOutlined,
  SafetyCertificateOutlined,
} from '@ant-design/icons';
import useUserProfile from '../hooks/useUserProfile';

const { Title, Paragraph } = Typography;

const PersonalInfoPage = () => {
  // This could also fetch from useUserProfile to display name/email,
  // but for now, it just shows the external link.
  return (
    <div style={{ maxWidth: 500, paddingTop: 16 }}>
      <Descriptions bordered column={1} size="small">
        <Descriptions.Item label="姓名">Admin User (來自 SSO)</Descriptions.Item>
        <Descriptions.Item label="電子郵件">admin@example.com (來自 SSO)</Descriptions.Item>
      </Descriptions>
      <Alert
        message="個人資料管理說明"
        description={
          <div>
            您的姓名與電子郵件等核心身份資訊由您的組織統一管理。如需修改，請點擊下方按鈕前往您的身份提供商 (Keycloak) 帳號中心。
          </div>
        }
        type="info"
        showIcon
        style={{ marginTop: 24, marginBottom: 16 }}
      />
      <Button
        type="primary"
        icon={<LinkOutlined />}
        onClick={() => window.open('#', '_blank')}
      >
        前往 Keycloak 管理個人資料
      </Button>
    </div>
  );
};

const PasswordSecurityPage = () => {
  return (
    <div style={{ maxWidth: 500, paddingTop: 16 }}>
      <Alert
        message="安全性設定說明"
        description={
          <div>
            本平台的所有安全性設定（包含密碼變更、兩步驟驗證 2FA）均由您的組織身份提供商 (Keycloak) 統一管理，以確保最高等級的安全性。
            <br /><br />
            請點擊下方按鈕前往 Keycloak 安全中心進行相關設定。
          </div>
        }
        type="info"
        showIcon
        style={{ marginBottom: 16 }}
      />
      <Button
        type="primary"
        icon={<SafetyCertificateOutlined />}
        onClick={() => window.open('#', '_blank')}
      >
        前往 Keycloak 修改密碼或設定 2FA
      </Button>
    </div>
  );
};

const PreferencesPage = ({ themeMode, setThemeMode }: { themeMode: 'light' | 'dark'; setThemeMode: (mode: 'light' | 'dark') => void }) => {
  const { message } = AntdApp.useApp();
  const { preferences, loading, error, updatePreferences } = useUserProfile();
  const [form] = Form.useForm();

  useEffect(() => {
    if (preferences) {
      form.setFieldsValue(preferences);
    }
  }, [preferences, form]);

  const handleSave = async (values: any) => {
    try {
      await updatePreferences(values);
      message.success('偏好設定已儲存');
      // Also update the theme if it changed
      if (values.theme && values.theme !== themeMode) {
        setThemeMode(values.theme);
      }
    } catch (e) {
      message.error('儲存失敗，請稍後再試');
    }
  };

  if (loading && !preferences) {
    return <Spin />;
  }

  if (error) {
    return <Alert type="error" message="無法載入偏好設定" />;
  }

  return (
    <Spin spinning={loading}>
      <div style={{ maxWidth: 500, paddingTop: 16 }}>
        <Form form={form} layout="vertical" onFinish={handleSave}>
          <Form.Item label="介面主題" name="theme">
            <Select>
              <Select.Option value="dark">Dark</Select.Option>
              <Select.Option value="light">Light</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item label="預設頁面" name="homeDashboard" initialValue="default">
            <Select>
              <Select.Option value="default">Default</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item label="時區" name="timezone" initialValue="utc">
            <Select>
              <Select.Option value="Asia/Taipei">Asia/Taipei</Select.Option>
              <Select.Option value="utc">UTC</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item style={{ marginBottom: 0 }}>
            <div style={{ width: '100%', display: 'flex', justifyContent: 'flex-end' }}>
              <Button type="primary" htmlType="submit" loading={loading}>
                儲存偏好設定
              </Button>
            </div>
          </Form.Item>
        </Form>
      </div>
    </Spin>
  );
};

const ProfilePage = ({ themeMode, setThemeMode }: { themeMode: 'light' | 'dark'; setThemeMode: (mode: 'light' | 'dark') => void }) => {
  const [activeTab, setActiveTab] = useState('personal-info');

  return (
    <React.Fragment>
      <div style={{ marginBottom: 'var(--spacing-lg)' }}>
        <Title level={2} className="page-title" style={{ marginBottom: '4px' }}>個人資料與偏好設定</Title>
        <Paragraph className="page-subtitle" type="secondary" style={{ margin: 0 }}>
          管理您的個人資訊、密碼與通知偏好。
        </Paragraph>
      </div>
      <Tabs activeKey={activeTab} onChange={setActiveTab}>
        <Tabs.TabPane tab="個人資訊" key="personal-info">
          <PersonalInfoPage />
        </Tabs.TabPane>
        <Tabs.TabPane tab="密碼安全" key="password-security">
          <PasswordSecurityPage />
        </Tabs.TabPane>
        <Tabs.TabPane tab="偏好設定" key="preferences">
          <PreferencesPage themeMode={themeMode} setThemeMode={setThemeMode} />
        </Tabs.TabPane>
      </Tabs>
    </React.Fragment>
  );
};

export default ProfilePage;
