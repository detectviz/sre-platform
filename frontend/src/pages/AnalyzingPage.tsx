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

const CapacityPlanningPage = () => <div>Capacity Planning Page</div>;
const PlaceholderPage = ({ title, subtitle, icon }) => (
    <div>
        <PageHeader title={title} subtitle={subtitle} icon={icon} />
    </div>
);

const AnalyzingPage = ({ onNavigate, pageKey, themeMode }) => {
    const tabKey = [
      'capacity-planning',
      'performance-insights',
      'incident-trends',
      'cost-analysis',
      'mttr-analysis',
      'sla-reports'
    ].includes(pageKey) ? pageKey : 'capacity-planning';

    const analysisStats = {
      totalDataPoints: 15420,
      analysisReports: 28,
      avgProcessingTime: 3.2,
      accuracyRate: 96.8,
      resourceUtilization: 78.5,
      costSavings: 24300
    };

    return (
      <React.Fragment>
        <PageHeader
          title="分析中心"
          subtitle="深入了解系統趨勢、效能瓶頸和運營數據，做出數據驅動的決策"
          icon={<BarChartOutlined />}
        />

        <div style={{ marginBottom: 'var(--spacing-xl)' }}>
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} lg={6}>
              <ContextualKPICard
                title="數據點總數"
                value={analysisStats.totalDataPoints.toLocaleString()}
                unit="個"
                trend="+8.2%"
                status="success"
                description="過去 24 小時收集"
                icon={<LineChartOutlined />}
              />
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <ContextualKPICard
                title="分析報告"
                value={analysisStats.analysisReports}
                unit="份"
                trend="+12.5%"
                status="info"
                description="本月生成報告"
                icon={<FileTextOutlined />}
              />
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <ContextualKPICard
                title="處理時間"
                value={analysisStats.avgProcessingTime}
                unit="秒"
                trend="-15.3%"
                status="success"
                description="平均分析處理時間"
                icon={<ClockCircleOutlined />}
              />
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <ContextualKPICard
                title="準確率"
                value={analysisStats.accuracyRate}
                unit="%"
                trend="+2.1%"
                status="success"
                description="AI 預測準確率"
                icon={<RobotOutlined />}
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
                <PieChartOutlined />
                容量規劃
              </span>
            }
            key="capacity-planning"
          >
            <CapacityPlanningPage themeMode={themeMode} />
          </Tabs.TabPane>
          <Tabs.TabPane
            tab={
              <span>
                <ThunderboltOutlined />
                性能洞察
              </span>
            }
            key="performance-insights"
          >
            <PlaceholderPage title="性能洞察" subtitle="深入分析系統性能瓶頸，提供智能優化建議。" icon={<ThunderboltOutlined />} />
          </Tabs.TabPane>
          <Tabs.TabPane
            tab={
              <span>
                <LineChartOutlined />
                事件趨勢
              </span>
            }
            key="incident-trends"
          >
            <PlaceholderPage title="事件趨勢分析" subtitle="分析事件發生模式，識別重複問題和根本原因。" icon={<LineChartOutlined />} />
          </Tabs.TabPane>
          <Tabs.TabPane
            tab={
              <span>
                <DollarOutlined />
                成本分析
              </span>
            }
            key="cost-analysis"
          >
            <PlaceholderPage title="成本分析" subtitle="追蹤資源使用成本，識別成本節約機會。" icon={<DollarOutlined />} />
          </Tabs.TabPane>
          <Tabs.TabPane
            tab={
              <span>
                <FieldTimeOutlined />
                MTTR 分析
              </span>
            }
            key="mttr-analysis"
          >
            <PlaceholderPage title="MTTR 分析" subtitle="追蹤平均修復時間，找出效率改善機會。" icon={<FieldTimeOutlined />} />
          </Tabs.TabPane>
          <Tabs.TabPane
            tab={
              <span>
                <FileDoneOutlined />
                SLA 報告
              </span>
            }
            key="sla-reports"
          >
            <PlaceholderPage title="SLA 報告" subtitle="追蹤服務級別協議的達成情況和趨勢分析。" icon={<FileDoneOutlined />} />
          </Tabs.TabPane>
        </Tabs>
      </React.Fragment>
    );
  };

  export default AnalyzingPage;
