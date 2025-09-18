import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Layout, Menu, ConfigProvider, theme, Typography, Input, Avatar, Button, Row, Col, Card, Statistic, Table, Tag, Modal, Form, Select, Breadcrumb, message, Tabs, DatePicker, List, Divider, Dropdown, Badge, Drawer, Tree, Collapse, InputNumber, Transfer, Spin, Empty, Switch, Space, Radio, Progress, Popover, Tooltip, Descriptions, Timeline, Checkbox, Steps, TimePicker, Alert, AutoComplete } from 'antd';
import { UserOutlined, SearchOutlined, LogoutOutlined, DashboardOutlined, HddOutlined, TeamOutlined, ProfileOutlined, CodeOutlined, BarChartOutlined, HistoryOutlined, HomeOutlined, PlusOutlined, SettingOutlined, SafetyCertificateOutlined, BellOutlined, DownOutlined, ExclamationCircleOutlined, InfoCircleOutlined, EditOutlined, DeleteOutlined, ApartmentOutlined, BuildOutlined, ControlOutlined, AuditOutlined, MenuUnfoldOutlined, MenuFoldOutlined, PauseCircleOutlined, ScheduleOutlined, CarryOutOutlined, ThunderboltOutlined, MinusCircleOutlined, FireOutlined, ClockCircleOutlined, CheckCircleOutlined, CopyOutlined, PlayCircleOutlined, RobotOutlined, DeploymentUnitOutlined, EyeOutlined, FilterOutlined, ReloadOutlined, DownloadOutlined, DollarOutlined, LineChartOutlined, AlertOutlined, PieChartOutlined, FileDoneOutlined, FileTextOutlined, DatabaseOutlined, FieldTimeOutlined, RiseOutlined, FileProtectOutlined, BranchesOutlined, BookOutlined, AppstoreOutlined, ArrowUpOutlined, ArrowDownOutlined, AlignCenterOutlined, CompressOutlined, ExpandOutlined, MinusOutlined, UnorderedListOutlined, WarningOutlined, GlobalOutlined, SaveOutlined, QuestionCircleOutlined, BulbOutlined, LockOutlined, TagsOutlined, TagOutlined, LinkOutlined, MailOutlined, BarsOutlined, CloseOutlined, CheckOutlined, SafetyOutlined, MonitorOutlined } from '@ant-design/icons';

const { Title, Paragraph } = Typography;

const PersonalInfoPage = () => {
    return (
      <div style={{ maxWidth: 500, paddingTop: 16 }}>
        <Descriptions bordered column={1} size="small">
          <Descriptions.Item label="姓名">Admin User</Descriptions.Item>
          <Descriptions.Item label="電子郵件">admin@example.com</Descriptions.Item>
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
          onClick={() => message.info('將跳轉至 Keycloak 帳號中心...')}
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
          onClick={() => message.info('將跳轉至 Keycloak 安全中心...')}
        >
          前往 Keycloak 修改密碼或設定 2FA
        </Button>
      </div>
    );
  };

  const PreferencesPage = ({ themeMode, setThemeMode }) => {
    const [form] = Form.useForm();
    return (
      <div style={{ maxWidth: 500, paddingTop: 16 }}>
        <Form layout="vertical" form={form}>
          <Form.Item label="介面主題" name="theme">
            <Select value={themeMode} onChange={setThemeMode}>
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
              <Select.Option value="utc">UTC</Select.Option>
              <Select.Option value="local">Browser Time</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item style={{ marginBottom: 0 }}>
            <div style={{ width: '100%', display: 'flex', justifyContent: 'flex-end' }}>
              <Button type="primary" onClick={() => message.success('偏好設定已儲存')}>
                儲存偏好設定
              </Button>
            </div>
          </Form.Item>
        </Form>
      </div>
    );
  };

const ProfilePage = ({ themeMode, setThemeMode }) => {
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
