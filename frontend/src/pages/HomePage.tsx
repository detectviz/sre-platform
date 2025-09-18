import React, { useState, useEffect, useMemo } from 'react';
import { Layout, Menu, ConfigProvider, theme, Typography, Input, Avatar, Button, Row, Col, Card, Statistic, Table, Tag, Modal, Form, Select, Breadcrumb, message, Tabs, DatePicker, List, Divider, Dropdown, Badge, Drawer, Tree, Collapse, InputNumber, Transfer, Spin, Empty, Switch, Space, Radio, Progress, Popover, Tooltip, Descriptions, Timeline, Checkbox, Steps, TimePicker, Alert, AutoComplete } from 'antd';
import { UserOutlined, SearchOutlined, LogoutOutlined, DashboardOutlined, HddOutlined, TeamOutlined, ProfileOutlined, CodeOutlined, BarChartOutlined, HistoryOutlined, HomeOutlined, PlusOutlined, SettingOutlined, SafetyCertificateOutlined, BellOutlined, DownOutlined, ExclamationCircleOutlined, InfoCircleOutlined, EditOutlined, DeleteOutlined, ApartmentOutlined, BuildOutlined, ControlOutlined, AuditOutlined, MenuUnfoldOutlined, MenuFoldOutlined, PauseCircleOutlined, ScheduleOutlined, CarryOutOutlined, ThunderboltOutlined, MinusCircleOutlined, FireOutlined, ClockCircleOutlined, CheckCircleOutlined, CopyOutlined, PlayCircleOutlined, RobotOutlined, DeploymentUnitOutlined, EyeOutlined, FilterOutlined, ReloadOutlined, DownloadOutlined, DollarOutlined, LineChartOutlined, AlertOutlined, PieChartOutlined, FileDoneOutlined, FileTextOutlined, DatabaseOutlined, FieldTimeOutlined, RiseOutlined, FileProtectOutlined, BranchesOutlined, BookOutlined, AppstoreOutlined, ArrowUpOutlined, ArrowDownOutlined, AlignCenterOutlined, CompressOutlined, ExpandOutlined, MinusOutlined, UnorderedListOutlined, WarningOutlined, GlobalOutlined, SaveOutlined, QuestionCircleOutlined, BulbOutlined, LockOutlined, TagsOutlined, TagOutlined, LinkOutlined, MailOutlined, BarsOutlined, CloseOutlined, CheckOutlined, SafetyOutlined, MonitorOutlined } from '@ant-design/icons';

const { Title, Paragraph } = Typography;

const EchartsForReact = ({ option, isDark }) => {
    return <div>Echarts Chart</div>;
};

const ContextualKPICard = ({ title, value, unit, trend, status, description, icon, onClick, style }) => {
    return <Card title={title} style={style}>{value}{unit} {description}</Card>;
};

const AIInsightSummary = ({ onNavigate }) => {
    return <Card title="AI Insight Summary">Content</Card>
};

const TopNResourceList = ({ themeMode }) => {
    return <Card title="Top N Resource List">Content</Card>
}

const HomePage = ({ themeMode, onNavigate }) => {
    const stackedBarOption = {};
    const serviceHealthHeatmapOption = {};

    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 48px - 48px)', paddingBottom: 'var(--spacing-xl)' }}>
        <div style={{ marginBottom: '16px' }}>
          <Row gutter={[16, 12]}>
            <Col xs={24} sm={12} md={8} lg={8}>
              <div className="stat-card padding-md" style={{ height: '120px', cursor: 'pointer' }} onClick={() => { if (onNavigate) onNavigate('incident-list', { statusFilter: 'new' }); }}>
                <div className="card-content">
                  <div>
                    <div className="card-title" style={{ fontSize: '14px' }}>待處理事件</div>
                    <div className="card-value" style={{ color: '#ff4d4f', fontSize: '40px' }}>5</div>
                    <div className="card-description">
                      其中 <span style={{ color: '#ff4d4f', fontWeight: '600' }}>2</span> 嚴重
                    </div>
                  </div>
                  <FireOutlined className="card-icon" style={{ color: '#ff4d4f', fontSize: '36px' }} />
                </div>
              </div>
            </Col>
            <Col xs={24} sm={12} md={8} lg={8}>
                <div className="stat-card padding-md" style={{ height: '120px', cursor: 'pointer' }} onClick={() => { if (onNavigate) onNavigate('incident-list', { statusFilter: 'acknowledged' }); }}>
                    <div className="card-content">
                        <div>
                            <div className="card-title" style={{ fontSize: '14px' }}>處理中</div>
                            <div className="card-value" style={{ color: '#faad14', fontSize: '40px' }}>3</div>
                            <div className="card-description" style={{ color: '#faad14' }}>
                            ↘ 15% 較昨日
                            </div>
                        </div>
                        <ClockCircleOutlined className="card-icon" style={{ color: '#faad14', fontSize: '36px' }} />
                    </div>
                </div>
            </Col>
            <Col xs={24} sm={12} md={8} lg={8}>
                <div className="stat-card padding-md" style={{ height: '120px', cursor: 'pointer' }} onClick={() => { if (onNavigate) onNavigate('incident-list', { statusFilter: 'resolved' }); }}>
                    <div className="card-content">
                        <div>
                            <div className="card-title" style={{ fontSize: '14px' }}>今日已解決</div>
                            <div className="card-value" style={{ color: '#52c41a', fontSize: '40px' }}>12</div>
                            <div className="card-description" style={{ color: '#52c41a' }}>
                            ↗ 8% 較昨日
                            </div>
                        </div>
                        <CheckCircleOutlined className="card-icon" style={{ color: '#52c41a', fontSize: '36px' }} />
                    </div>
                </div>
            </Col>
          </Row>
        </div>
        <AIInsightSummary onNavigate={onNavigate} />
        <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', minHeight: '400px', marginBottom: 'var(--spacing-lg)' }}>
          <Row gutter={[16, 12]} style={{ flexGrow: 1, height: '100%' }}>
            <Col xs={24} sm={24} md={8} lg={8} style={{ display: 'flex', marginBottom: '16px' }}>
              <div className="chart-card" style={{ width: '100%', padding: '16px', cursor: 'pointer', display: 'flex', flexDirection: 'column', minHeight: '350px', height: '100%' }} onClick={() => { if (onNavigate) onNavigate('resource-list'); }}>
                <Title level={5} className="chart-title" style={{ marginBottom: '16px' }}>服務健康度總覽</Title>
                <div style={{ flexGrow: 1, minHeight: '280px', height: 'calc(100% - 40px)' }}>
                  <EchartsForReact option={serviceHealthHeatmapOption} isDark={themeMode === 'dark'} />
                </div>
              </div>
            </Col>
            <Col xs={24} sm={24} md={16} lg={16} style={{ display: 'flex', marginBottom: '16px' }}>
              <div className="chart-card" style={{ width: '100%', padding: '16px', cursor: 'pointer', display: 'flex', flexDirection: 'column', minHeight: '350px', height: '100%' }} onClick={() => { if (onNavigate) onNavigate('resource-list'); }}>
                <Title level={5} className="chart-title" style={{ marginBottom: '16px' }}>資源群組狀態總覽</Title>
                <div style={{ flexGrow: 1, minHeight: '280px', height: 'calc(100% - 40px)' }}>
                  <EchartsForReact option={stackedBarOption} isDark={themeMode === 'dark'} />
                </div>
              </div>
            </Col>
          </Row>
        </div>
      </div>
    );
  };

export default HomePage;
