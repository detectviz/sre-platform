import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Layout, Menu, ConfigProvider, theme, Typography, Input, Avatar, Button, Row, Col, Card, Statistic, Table, Tag, Modal, Form, Select, Breadcrumb, message, Tabs, DatePicker, List, Divider, Dropdown, Badge, Drawer, Tree, Collapse, InputNumber, Transfer, Spin, Empty, Switch, Space, Radio, Progress, Popover, Tooltip, Descriptions, Timeline, Checkbox, Steps, TimePicker, Alert, AutoComplete } from 'antd';
import { UserOutlined, SearchOutlined, LogoutOutlined, DashboardOutlined, HddOutlined, TeamOutlined, ProfileOutlined, CodeOutlined, BarChartOutlined, HistoryOutlined, HomeOutlined, PlusOutlined, SettingOutlined, SafetyCertificateOutlined, BellOutlined, DownOutlined, ExclamationCircleOutlined, InfoCircleOutlined, EditOutlined, DeleteOutlined, ApartmentOutlined, BuildOutlined, ControlOutlined, AuditOutlined, MenuUnfoldOutlined, MenuFoldOutlined, PauseCircleOutlined, ScheduleOutlined, CarryOutOutlined, ThunderboltOutlined, MinusCircleOutlined, FireOutlined, ClockCircleOutlined, CheckCircleOutlined, CopyOutlined, PlayCircleOutlined, RobotOutlined, DeploymentUnitOutlined, EyeOutlined, FilterOutlined, ReloadOutlined, DownloadOutlined, DollarOutlined, LineChartOutlined, AlertOutlined, PieChartOutlined, FileDoneOutlined, FileTextOutlined, DatabaseOutlined, FieldTimeOutlined, RiseOutlined, FileProtectOutlined, BranchesOutlined, BookOutlined, AppstoreOutlined, ArrowUpOutlined, ArrowDownOutlined, AlignCenterOutlined, CompressOutlined, ExpandOutlined, MinusOutlined, UnorderedListOutlined, WarningOutlined, GlobalOutlined, SaveOutlined, QuestionCircleOutlined, BulbOutlined, LockOutlined, TagsOutlined, TagOutlined, LinkOutlined, MailOutlined, BarsOutlined, CloseOutlined, CheckOutlined, SafetyOutlined, MonitorOutlined } from '@ant-design/icons';

const { Title, Paragraph } = Typography;

const PageHeader = ({ title, subtitle, icon }) => (
    <div style={{ marginBottom: '16px' }}>
        <Title level={2}>{title}</Title>
        <Paragraph>{subtitle}</Paragraph>
    </div>
);

const ContextualKPICard = ({ title, value, unit, status, description, icon, onClick, style }) => (
    <Card title={title} style={style}>{value}{unit} {description}</Card>
);

const TagKeyManagementPage = () => <div>Tag Key Management Page</div>;
const EmailSettingsPage = () => <div>Email Settings Page</div>;
const AuthSettingsPage = () => <div>Auth Settings Page</div>;
const UserPermissionsPage = () => <div>User Permissions Page</div>;


const PlatformSettingsPage = ({ onNavigate, pageKey }) => {
    const tabKey = ['tag-management', 'email-settings', 'auth-settings', 'identity-access-management'].includes(pageKey) ? pageKey : 'tag-management';

    const settingsStats = {
      totalTags: 42,
      activeTags: 38,
      authSessions: 156,
      configChanges: 7,
      lastBackup: '2小時前'
    };

    return (
      <React.Fragment>
        <PageHeader
          title="平台設定"
          subtitle="管理平台基本配置，包括標籤系統、郵件設定和身份驗證機制"
          icon={<SettingOutlined />}
        />

        <div style={{ marginBottom: 'var(--spacing-xl)' }}>
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} lg={8}>
              <ContextualKPICard
                title="標籤總數"
                value={settingsStats.totalTags}
                unit="個"
                trend="+2.4%"
                status="success"
                description={`${settingsStats.activeTags} 個啟用中`}
                icon={<TagsOutlined />}
              />
            </Col>
            <Col xs={24} sm={12} lg={8}>
              <ContextualKPICard
                title="活躍會話"
                value={settingsStats.authSessions}
                unit="個"
                trend="+8.7%"
                status="success"
                description="人員登入會話"
                icon={<LockOutlined />}
              />
            </Col>
            <Col xs={24} sm={12} lg={8}>
              <ContextualKPICard
                title="配置異動"
                value={settingsStats.configChanges}
                unit="次"
                trend="+40%"
                status="warning"
                description={`最後備份：${settingsStats.lastBackup}`}
                icon={<FileProtectOutlined />}
              />
            </Col>
          </Row>
        </div>
        <Tabs
          defaultActiveKey={tabKey}
          onChange={(key) => onNavigate(key)}
          style={{
            '--tab-bar-margin': '0 0 var(--spacing-lg) 0'
          }}
        >
          <Tabs.TabPane
            tab={
              <span>
                <TagsOutlined />
                標籤管理
              </span>
            }
            key="tag-management"
          >
            <TagKeyManagementPage />
          </Tabs.TabPane>
          <Tabs.TabPane
            tab={
              <span>
                <MailOutlined />
                郵件設定
              </span>
            }
            key="email-settings"
          >
            <EmailSettingsPage />
          </Tabs.TabPane>
          <Tabs.TabPane
            tab={
              <span>
                <LockOutlined />
                身份驗證
              </span>
            }
            key="auth-settings"
          >
            <AuthSettingsPage />
          </Tabs.TabPane>
          <Tabs.TabPane
            tab={
              <span>
                <UserOutlined />
                身份與存取管理
              </span>
            }
            key="identity-access-management"
          >
            <UserPermissionsPage />
          </Tabs.TabPane>
        </Tabs>
      </React.Fragment>
    );
  };

  export default PlatformSettingsPage;
