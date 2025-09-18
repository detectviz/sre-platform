import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Layout, Menu, ConfigProvider, theme, Typography, Input, Avatar, Button, Row, Col, Card, Statistic, Table, Tag, Modal, Form, Select, Breadcrumb, message, Tabs, DatePicker, List, Divider, Dropdown, Badge, Drawer, Tree, Collapse, InputNumber, Transfer, Spin, Empty, Switch, Space, Radio, Progress, Popover, Tooltip, Descriptions, Timeline, Checkbox, Steps, TimePicker, Alert, AutoComplete } from 'antd';
import { UserOutlined, SearchOutlined, LogoutOutlined, DashboardOutlined, HddOutlined, TeamOutlined, ProfileOutlined, CodeOutlined, BarChartOutlined, HistoryOutlined, HomeOutlined, PlusOutlined, SettingOutlined, SafetyCertificateOutlined, BellOutlined, DownOutlined, ExclamationCircleOutlined, InfoCircleOutlined, EditOutlined, DeleteOutlined, ApartmentOutlined, BuildOutlined, ControlOutlined, AuditOutlined, MenuUnfoldOutlined, MenuFoldOutlined, PauseCircleOutlined, ScheduleOutlined, CarryOutOutlined, ThunderboltOutlined, MinusCircleOutlined, FireOutlined, ClockCircleOutlined, CheckCircleOutlined, CopyOutlined, PlayCircleOutlined, RobotOutlined, DeploymentUnitOutlined, EyeOutlined, FilterOutlined, ReloadOutlined, DownloadOutlined, DollarOutlined, LineChartOutlined, AlertOutlined, PieChartOutlined, FileDoneOutlined, FileTextOutlined, DatabaseOutlined, FieldTimeOutlined, RiseOutlined, FileProtectOutlined, BranchesOutlined, BookOutlined, AppstoreOutlined, ArrowUpOutlined, ArrowDownOutlined, AlignCenterOutlined, CompressOutlined, ExpandOutlined, MinusOutlined, UnorderedListOutlined, WarningOutlined, GlobalOutlined, SaveOutlined, QuestionCircleOutlined, BulbOutlined, LockOutlined, TagsOutlined, TagOutlined, LinkOutlined, MailOutlined, BarsOutlined, CloseOutlined, CheckOutlined, SafetyOutlined, MonitorOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

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

import useIncidents from '../hooks/useIncidents';

const IncidentListPage = ({ onNavigate }) => {
    const { incidents, loading, error } = useIncidents();
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [currentIncident, setCurrentIncident] = useState(null);

    const showDetailModal = (record) => {
      setCurrentIncident(record);
      setIsDetailModalOpen(true);
    };

    const handleAcknowledge = () => {
        modal.confirm({
            title: '確定要確認此事件嗎？',
            icon: <ExclamationCircleOutlined />,
            content: '確認後，事件狀態將變為 "acknowledged"。',
            onOk() {
                // Here you would typically call an API to update the incident
                // For now, we'll just show a success message
                message.success('事件已確認');
                setIsDetailModalOpen(false);
            },
        });
    };

    if (loading) return <Spin />;
    if (error) return <Alert message="Error" description={error.message} type="error" showIcon />;

    const columns = [
        { title: '摘要', dataIndex: 'summary', key: 'summary', render: (text, record) => <a onClick={() => showDetailModal(record)}>{text}</a> },
        { title: '嚴重性', dataIndex: 'severity', key: 'severity' },
        { title: '狀態', dataIndex: 'status', key: 'status' },
        { title: '觸發時間', dataIndex: 'created_at', key: 'created_at' },
    ];

    return (
        <>
            <Table dataSource={incidents} columns={columns} rowKey="key" />
            <Modal
                title="事件詳情"
                open={isDetailModalOpen}
                onCancel={() => setIsDetailModalOpen(false)}
                footer={[
                    <Button key="back" onClick={() => setIsDetailModalOpen(false)}>
                        關閉
                    </Button>,
                    <Button key="silence" onClick={() => message.info('Silence functionality to be implemented')}>
                        靜音
                    </Button>,
                    <Button key="ack" type="primary" onClick={handleAcknowledge}>
                        確認
                    </Button>,
                ]}
            >
                {currentIncident && (
                    <Descriptions bordered column={1}>
                        <Descriptions.Item label="摘要">{currentIncident.summary}</Descriptions.Item>
                        <Descriptions.Item label="嚴重性">{currentIncident.severity}</Descriptions.Item>
                        <Descriptions.Item label="狀態">{currentIncident.status}</Descriptions.Item>
                        <Descriptions.Item label="資源名稱">{currentIncident.resource_name}</Descriptions.Item>
                    </Descriptions>
                )}
            </Modal>
        </>
    );
};

const AlertingRulesPage = () => <div>Alerting Rules Page</div>;
const SilencesPage = () => <div>Silences Page</div>;

const IncidentsPage = ({ onNavigate, pageKey }) => {
    const tabKey = ['incident-list', 'alerting-rules', 'silences'].includes(pageKey) ? pageKey : 'incident-list';

    const incidentStats = {
      activeIncidents: 5,
      criticalIncidents: 2,
      acknowledgedIncidents: 3,
      todayResolved: 12,
      avgResolutionTime: 2.5,
      escalationRate: 8.3,
      automatedResolved: 7,
      automationRate: 35.2,
      automatedExecutions: 4
    };

    return (
      <React.Fragment>
        <PageHeader
          title="事件管理"
          subtitle="集中管理事件、定義規則並設定靜音，建立完整的事件管理流程"
          icon={<ExclamationCircleOutlined />}
        />

        <div className="kpi-grid" style={{ marginBottom: 'var(--spacing-xl)' }}>
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} md={6} lg={6}>
              <ContextualKPICard
                title="活躍事件"
                value={incidentStats.activeIncidents}
                unit="件"
                status={incidentStats.criticalIncidents > 0 ? 'critical' : incidentStats.activeIncidents > 3 ? 'warning' : 'success'}
                description={`${incidentStats.criticalIncidents} 件嚴重，${incidentStats.acknowledgedIncidents} 件處理中`}
                icon={<FireOutlined />}
                onClick={() => onNavigate('incident-list', { statusFilter: 'active' })}
                style={{ cursor: 'pointer' }}
              />
            </Col>
            <Col xs={24} sm={12} md={6} lg={6}>
              <ContextualKPICard
                title="今日已解決"
                value={incidentStats.todayResolved}
                unit="件"
                trend="+8%"
                status="success"
                description={`${incidentStats.automatedResolved} 件自動解決`}
                icon={<CheckCircleOutlined />}
                onClick={() => onNavigate('incident-list', { statusFilter: 'resolved', timeFilter: 'today' })}
                style={{ cursor: 'pointer' }}
              />
            </Col>
            <Col xs={24} sm={12} md={6} lg={6}>
              <ContextualKPICard
                title="平均解決時間"
                value={incidentStats.avgResolutionTime}
                unit="小時"
                trend="-15%"
                status="success"
                description="較上週大幅改善"
                icon={<ClockCircleOutlined />}
              />
            </Col>
            <Col xs={24} sm={12} md={6} lg={6}>
              <ContextualKPICard
                title="自動化處理率"
                value={incidentStats.automationRate}
                unit="%"
                status="success"
                description={`今日 ${incidentStats.automatedExecutions} 件自動解決`}
                icon={<ThunderboltOutlined />}
                onClick={() => onNavigate('automation', { subTab: 'executions', filter: 'alert-triggered' })}
                style={{ cursor: 'pointer' }}
              />
            </Col>
          </Row>
        </div>
        <Tabs defaultActiveKey={tabKey} onChange={(key) => onNavigate(key)}>
          <Tabs.TabPane tab="事件列表" key="incident-list">
            <IncidentListPage onNavigate={onNavigate} />
          </Tabs.TabPane>
          <Tabs.TabPane tab="事件規則" key="alerting-rules">
            <AlertingRulesPage />
          </Tabs.TabPane>
          <Tabs.TabPane tab="靜音規則" key="silences">
            <SilencesPage />
          </Tabs.TabPane>
        </Tabs>
      </React.Fragment>
    );
  };

  export default IncidentsPage;
