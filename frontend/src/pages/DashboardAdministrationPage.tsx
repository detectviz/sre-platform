import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Layout, Menu, ConfigProvider, theme, Typography, Input, Avatar, Button, Row, Col, Card, Statistic, Table, Tag, Modal, Form, Select, Breadcrumb, message, Tabs, DatePicker, List, Divider, Dropdown, Badge, Drawer, Tree, Collapse, InputNumber, Transfer, Spin, Empty, Switch, Space, Radio, Progress, Popover, Tooltip, Descriptions, Timeline, Checkbox, Steps, TimePicker, Alert, AutoComplete } from 'antd';
import { UserOutlined, SearchOutlined, LogoutOutlined, DashboardOutlined, HddOutlined, TeamOutlined, ProfileOutlined, CodeOutlined, BarChartOutlined, HistoryOutlined, HomeOutlined, PlusOutlined, SettingOutlined, SafetyCertificateOutlined, BellOutlined, DownOutlined, ExclamationCircleOutlined, InfoCircleOutlined, EditOutlined, DeleteOutlined, ApartmentOutlined, BuildOutlined, ControlOutlined, AuditOutlined, MenuUnfoldOutlined, MenuFoldOutlined, PauseCircleOutlined, ScheduleOutlined, CarryOutOutlined, ThunderboltOutlined, MinusCircleOutlined, FireOutlined, ClockCircleOutlined, CheckCircleOutlined, CopyOutlined, PlayCircleOutlined, RobotOutlined, DeploymentUnitOutlined, EyeOutlined, FilterOutlined, ReloadOutlined, DownloadOutlined, DollarOutlined, LineChartOutlined, AlertOutlined, PieChartOutlined, FileDoneOutlined, FileTextOutlined, DatabaseOutlined, FieldTimeOutlined, RiseOutlined, FileProtectOutlined, BranchesOutlined, BookOutlined, AppstoreOutlined, ArrowUpOutlined, ArrowDownOutlined, AlignCenterOutlined, CompressOutlined, ExpandOutlined, MinusOutlined, UnorderedListOutlined, WarningOutlined, GlobalOutlined, SaveOutlined, QuestionCircleOutlined, BulbOutlined, LockOutlined, TagsOutlined, TagOutlined, LinkOutlined, MailOutlined, BarsOutlined, CloseOutlined, CheckOutlined, SafetyOutlined, MonitorOutlined } from '@ant-design/icons';

const { Title, Paragraph } = Typography;

const DashboardAdministrationPage = ({ onNavigate }) => {
    const [defaultDashboard, setDefaultDashboard] = useState(() => {
      return localStorage.getItem('default-dashboard') || 'business-dashboard';
    });

    const setAsDefaultDashboard = (dashboardKey) => {
      setDefaultDashboard(dashboardKey);
      localStorage.setItem('default-dashboard', dashboardKey);
      message.success(`已將「${dashboardCards.find(d => d.key === dashboardKey)?.title || '未知儀表板'}」設為預設首頁`);
    };

    const dashboardCards = [
      {
        key: 'alerts-insights',
        icon: <ExclamationCircleOutlined />,
        title: '基礎設施洞察',
        description: '整合事件監控與資源健康度分析。',
        category: '資源監控',
        features: ['即時告警', '資源健康度', '趨勢分析'],
        enabled: true
      },
      {
        key: 'resource-overview',
        icon: <HddOutlined />,
        title: '資源總覽',
        description: '資源使用情況與健康狀態總覽。',
        category: '資源管理',
        features: ['資源健康度', '使用率統計', '負載分佈'],
        enabled: true
      },
      {
        key: 'business-dashboard',
        icon: <BarChartOutlined />,
        title: 'SRE 戰情室',
        description: '業務指標與效能監控儀表板。',
        category: '業務監控',
        features: ['KPI追蹤', '效能指標', '業務健康度'],
        enabled: true
      },
      {
        key: 'integrated-resource-overview',
        icon: <GlobalOutlined />,
        title: '整合資源總覽',
        description: '跨集群資源整合視圖。',
        category: '資源管理',
        features: ['多集群視圖', '統一監控', '資源調度'],
        enabled: true
      }
    ];

    const CardContent = ({ item }) => (
      <div
        className={`nav-item ${!item.enabled ? 'disabled-card' : ''}`}
        style={{ height: '90px', width: '100%', position: 'relative' }}
      >
        {defaultDashboard === item.key && (
          <div style={{
            position: 'absolute',
            top: '12px',
            right: '12px',
            background: '#52c41a',
            color: 'white',
            padding: '2px 6px',
            borderRadius: '10px',
            fontSize: '10px',
            fontWeight: 600,
            zIndex: 10,
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
            whiteSpace: 'nowrap'
          }}>
            <HomeOutlined style={{ marginRight: '2px', fontSize: '10px' }} />
            預設首頁
          </div>
        )}

        <div
          className="nav-item-content"
          onClick={() => item.enabled && onNavigate(item.key)}
          style={{
            display: 'flex',
            alignItems: 'center',
            height: '100%',
            cursor: item.enabled ? 'pointer' : 'not-allowed',
            position: 'relative'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', width: '100%', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
              <div className="nav-item-icon" style={{
                background: 'rgba(24, 144, 255, 0.1)',
                padding: '8px',
                borderRadius: '8px',
                fontSize: '24px',
                color: item.enabled ? '#1890ff' : 'rgba(255, 255, 255, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                {item.icon}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="nav-item-title" style={{
                  color: item.enabled ? 'rgba(255, 255, 255, 0.9)' : 'rgba(255, 255, 255, 0.5)',
                  fontSize: '16px',
                  fontWeight: 600,
                  marginBottom: '4px',
                  lineHeight: '1.2'
                }}>
                  {item.title || '未命名項目'}
                </div>
                <div className="nav-item-description" style={{
                  color: 'rgba(255, 255, 255, 0.6)',
                  fontSize: '14px',
                  lineHeight: '1.4'
                }}>
                  {item.description}
                </div>
              </div>
            </div>

            {item.enabled && (
              <Tooltip title={defaultDashboard === item.key ? "已是預設首頁" : "設為預設首頁"}>
                <Button
                  type="text"
                  size="small"
                  icon={<HomeOutlined />}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (defaultDashboard !== item.key) {
                      setAsDefaultDashboard(item.key);
                    }
                  }}
                  style={{
                    color: defaultDashboard === item.key ? '#52c41a' : 'rgba(255, 255, 255, 0.6)',
                    padding: '4px',
                    borderRadius: '4px',
                    transition: 'all 0.2s',
                    alignSelf: 'flex-end',
                    marginBottom: '-2px'
                  }}
                  className="set-default-btn"
                />
              </Tooltip>
            )}
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
          {dashboardCards.filter(item => item.category === categoryName).map(item => (
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
        <Title level={2} className="page-title" style={{ marginBottom: '2px' }}>儀表板</Title>
        <Paragraph className="page-subtitle" type="secondary" style={{ marginBottom: '4px' }}>
          統一的系統監控與業務洞察儀表板入口。
        </Paragraph>
        <div style={{ marginTop: '16px' }}>
          {renderCategory('資源監控')}
          {renderCategory('業務監控')}
        </div>
      </React.Fragment>
    );
  };

  export default DashboardAdministrationPage;
