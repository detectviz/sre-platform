import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Layout, Menu, ConfigProvider, theme, Typography, Input, Avatar, Button, Row, Col, Card, Statistic, Table, Tag, Modal, Form, Select, Breadcrumb, message, Tabs, DatePicker, List, Divider, Dropdown, Badge, Drawer, Tree, Collapse, InputNumber, Transfer, Spin, Empty, Switch, Space, Radio, Progress, Popover, Tooltip, Descriptions, Timeline, Checkbox, Steps, TimePicker, Alert, AutoComplete } from 'antd';
import { UserOutlined, SearchOutlined, LogoutOutlined, DashboardOutlined, HddOutlined, TeamOutlined, ProfileOutlined, CodeOutlined, BarChartOutlined, HistoryOutlined, HomeOutlined, PlusOutlined, SettingOutlined, SafetyCertificateOutlined, BellOutlined, DownOutlined, ExclamationCircleOutlined, InfoCircleOutlined, EditOutlined, DeleteOutlined, ApartmentOutlined, BuildOutlined, ControlOutlined, AuditOutlined, MenuUnfoldOutlined, MenuFoldOutlined, PauseCircleOutlined, ScheduleOutlined, CarryOutOutlined, ThunderboltOutlined, MinusCircleOutlined, FireOutlined, ClockCircleOutlined, CheckCircleOutlined, CopyOutlined, PlayCircleOutlined, RobotOutlined, DeploymentUnitOutlined, EyeOutlined, FilterOutlined, ReloadOutlined, DownloadOutlined, DollarOutlined, LineChartOutlined, AlertOutlined, PieChartOutlined, FileDoneOutlined, FileTextOutlined, DatabaseOutlined, FieldTimeOutlined, RiseOutlined, FileProtectOutlined, BranchesOutlined, BookOutlined, AppstoreOutlined, ArrowUpOutlined, ArrowDownOutlined, AlignCenterOutlined, CompressOutlined, ExpandOutlined, MinusOutlined, UnorderedListOutlined, WarningOutlined, GlobalOutlined, SaveOutlined, QuestionCircleOutlined, BulbOutlined, LockOutlined, TagsOutlined, TagOutlined, LinkOutlined, MailOutlined, BarsOutlined, CloseOutlined, CheckOutlined, SafetyOutlined, MonitorOutlined } from '@ant-design/icons';

const { Title, Paragraph } = Typography;

const SettingsAdministrationPage = ({ onNavigate }) => {
    const settingsCards = [
      {
        key: 'personnel-management',
        icon: <UserOutlined />,
        title: '人員管理',
        description: '管理使用者帳號與權限。',
        category: '身份與存取管理',
        features: ['角色配置', 'SSO整合', '密碼策略'],
        enabled: true
      },
      {
        key: 'team-management',
        icon: <TeamOutlined />,
        title: '團隊管理',
        description: '管理團隊結構與成員配置。',
        category: '身份與存取管理',
        features: ['階層架構', '權限繼承', '成員管理'],
        enabled: true
      },
      {
        key: 'role-management',
        icon: <ApartmentOutlined />,
        title: '角色管理',
        description: '定義系統角色與其權限。',
        category: '身份與存取管理',
        features: ['RBAC控制', '自訂角色', '權限模板'],
        enabled: true
      },
      {
        key: 'audit-logs',
        icon: <AuditOutlined />,
        title: '審計日誌',
        description: '查看系統操作審計記錄。',
        category: '身份與存取管理',
        features: ['操作追蹤', '安全審計', '日誌分析'],
        enabled: true
      },
      {
        key: 'notification-strategies',
        icon: <ApartmentOutlined />,
        title: '通知策略',
        description: '設定事件通知的路由策略。',
        category: '通知管理',
        features: ['智能路由', '升級規則', '值班整合'],
        enabled: true
      },
      {
        key: 'notification-channels',
        icon: <BellOutlined />,
        title: '通知管道',
        description: '管理系統通知管道。',
        category: '通知管理',
        features: ['多元管道', '模板管理', '送達確認'],
        enabled: true
      },
      {
        key: 'tag-management',
        icon: <TagsOutlined />,
        title: '標籤管理',
        description: '管理全域標籤與分類。',
        category: '平台設定',
        features: ['標籤標準化', '層級標籤', '標籤驗證'],
        enabled: true
      },
      {
        key: 'email-settings',
        icon: <MailOutlined />,
        title: '郵件設定',
        description: '配置 SMTP 伺服器。',
        category: '平台設定',
        features: ['SMTP設定', '發送記錄'],
        enabled: true
      },
      {
        key: 'auth-settings',
        icon: <SafetyOutlined />,
        title: '身份驗證',
        description: '配置登入方式與安全策略。',
        category: '平台設定',
        features: ['SSO整合', '多因素認證', '密碼策略'],
        enabled: true
      },
    ];

    const CardContent = ({ item }) => (
      <div
        className={`nav-item ${!item.enabled ? 'disabled-card' : ''}`}
        onClick={() => item.enabled && onNavigate(item.key)}
        style={{ height: '100%', width: '100%' }}
      >
        <div className="nav-item-content" style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '6px', width: '100%' }}>
            <div className="nav-item-icon" style={{
              background: 'rgba(24, 144, 255, 0.1)',
              padding: '6px',
              borderRadius: '8px',
              fontSize: '20px',
              opacity: item.enabled ? 1 : 0.5
            }}>
              {item.icon}
            </div>
            <div className="nav-item-text" style={{ flex: 1 }}>
              <Title level={5} className="nav-item-title" style={{ marginBottom: '4px' }}>
                {item.title || '未命名項目'}
              </Title>
              <Paragraph className="nav-item-description" style={{ marginBottom: 0 }}>{item.description}</Paragraph>
            </div>
          </div>
        </div>
      </div>
    );

    const renderCategory = (categoryName) => (
      <div style={{ marginBottom: '24px' }}>
        <Title level={5} style={{
          color: 'var(--text-secondary)',
          fontWeight: '500',
          marginBottom: '8px',
          fontSize: '16px'
        }}>
          {categoryName}
        </Title>
        <Row gutter={[16, 16]}>
          {settingsCards.filter(item => item.category === categoryName).map(item => (
            <Col key={item.key} xs={24} md={12} lg={8} style={{ display: 'flex' }}>
              {item.enabled ? (
                <CardContent item={item} />
              ) : (
                <Badge.Ribbon text="即將推出">
                  <CardContent item={item} />
                </Badge.Ribbon>
              )}
            </Col>
          ))}
        </Row>
      </div>
    );


    return (
      <React.Fragment>
        <Title level={2} className="page-title" style={{ marginBottom: '2px' }}>設定</Title>
        <Paragraph className="page-subtitle" type="secondary" style={{ marginBottom: '4px' }}>
          配置平台的人員、權限與系統功能設定。
        </Paragraph>
        <div style={{ marginTop: '16px' }}>
          {renderCategory('身份與存取管理')}
          {renderCategory('通知管理')}
          {renderCategory('平台設定')}
        </div>
      </React.Fragment>
    );
  };

  export default SettingsAdministrationPage;
