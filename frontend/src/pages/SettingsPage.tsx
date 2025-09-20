import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout, Menu, ConfigProvider, theme, Typography, Input, Avatar, Button, Row, Col, Card, Statistic, Table, Tag, Modal, Form, Select, Breadcrumb, message, Tabs, DatePicker, List, Divider, Dropdown, Badge, Drawer, Tree, Collapse, InputNumber, Transfer, Spin, Empty, Switch, Space, Radio, Progress, Popover, Tooltip, Descriptions, Timeline, Checkbox, Steps, TimePicker, Alert, AutoComplete } from 'antd';
import { UserOutlined, TeamOutlined, ApartmentOutlined, AuditOutlined, BellOutlined, TagsOutlined, MailOutlined, SafetyOutlined } from '@ant-design/icons';
import { PageHeader } from '../components';

const { Title, Paragraph } = Typography;

const SettingsPage = () => {
    const navigate = useNavigate();

    const settingsCards = [
      {
        key: '/settings/iam',
        icon: <UserOutlined />,
        title: '人員管理',
        description: '管理使用者帳號與權限。',
        category: '身份與存取管理',
        features: ['角色配置', 'SSO整合', '密碼策略'],
        enabled: true
      },
      {
        key: '/settings/iam', // Note: Same key as personnel management
        icon: <TeamOutlined />,
        title: '團隊管理',
        description: '管理團隊結構與成員配置。',
        category: '身份與存取管理',
        features: ['階層架構', '權限繼承', '成員管理'],
        enabled: true
      },
      {
        key: '/settings/roles',
        icon: <ApartmentOutlined />,
        title: '角色管理',
        description: '定義系統角色與其權限。',
        category: '身份與存取管理',
        features: ['RBAC控制', '自訂角色', '權限模板'],
        enabled: true
      },
      {
        key: '/settings/audit',
        icon: <AuditOutlined />,
        title: '審計日誌',
        description: '查看系統操作審計記錄。',
        category: '身份與存取管理',
        features: ['操作追蹤', '安全審計', '日誌分析'],
        enabled: true
      },
      {
        key: '/settings/notifications',
        icon: <ApartmentOutlined />,
        title: '通知策略',
        description: '設定事件通知的路由策略。',
        category: '通知管理',
        features: ['智能路由', '升級規則', '值班整合'],
        enabled: true
      },
      {
        key: '/settings/notifications',
        icon: <BellOutlined />,
        title: '通知管道',
        description: '管理系統通知管道。',
        category: '通知管理',
        features: ['多元管道', '模板管理', '送達確認'],
        enabled: true
      },
      {
        key: '/settings/platform',
        icon: <TagsOutlined />,
        title: '標籤管理',
        description: '管理全域標籤與分類。',
        category: '平台設定',
        features: ['標籤標準化', '層級標籤', '標籤驗證'],
        enabled: true
      },
      {
        key: '/settings/platform',
        icon: <MailOutlined />,
        title: '郵件設定',
        description: '配置 SMTP 伺服器。',
        category: '平台設定',
        features: ['SMTP設定', '發送記錄'],
        enabled: true
      },
      {
        key: '/settings/platform',
        icon: <SafetyOutlined />,
        title: '身份驗證',
        description: '配置登入方式與安全策略。',
        category: '平台設定',
        features: ['SSO整合', '多因素認證', '密碼策略'],
        enabled: true
      },
    ];

    const CardContent = ({ item }: { item: typeof settingsCards[0] }) => (
      <div
        className={`nav-item ${!item.enabled ? 'disabled-card' : ''}`}
        onClick={() => item.enabled && navigate(item.key)}
        style={{ height: '100%', width: '100%', cursor: item.enabled ? 'pointer' : 'not-allowed' }}
      >
        <div className="nav-item-content" style={{ flexDirection: 'column', alignItems: 'flex-start', padding: '16px' }}>
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

    const renderCategory = (categoryName: string) => (
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
          {settingsCards.filter(item => item.category === categoryName).map((item, index) => (
            <Col key={`${item.key}-${index}`} xs={24} md={12} lg={8} style={{ display: 'flex' }}>
              <Card hoverable style={{ width: '100%', background: 'var(--bg-elevated)', border: '1px solid var(--border-color-split)' }}>
                {item.enabled ? (
                  <CardContent item={item} />
                ) : (
                  <Badge.Ribbon text="即將推出">
                    <CardContent item={item} />
                  </Badge.Ribbon>
                )}
              </Card>
            </Col>
          ))}
        </Row>
      </div>
    );

    return (
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <PageHeader
          title="設定"
          subtitle="配置平台的人員、權限與系統功能設定"
          description="管理身份存取、通知策略與平台核心配置，確保系統安全與運作效率。"
        />

        <div>
          {renderCategory('身份與存取管理')}
          {renderCategory('通知管理')}
          {renderCategory('平台設定')}
        </div>
      </Space>
    );
  };

  export default SettingsPage;
