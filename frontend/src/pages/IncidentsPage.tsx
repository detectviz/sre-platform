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
    const [searchText, setSearchText] = useState('');
    const [selectedRowKeys, setSelectedRowKeys] = useState([]);
    const [isSilenceModalOpen, setIsSilenceModalOpen] = useState(false);
    const [silenceDuration, setSilenceDuration] = useState(1);

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

    const handleBatchUpdate = (newStatus) => {
        modal.confirm({
            title: `確定要批次 ${newStatus === 'acknowledged' ? '確認' : '解決'} ${selectedRowKeys.length} 個事件嗎？`,
            icon: <ExclamationCircleOutlined />,
            onOk() {
                // Here you would typically call an API to update the incidents
                // For now, we'll just show a success message
                message.success('事件狀態已更新');
                setSelectedRowKeys([]);
            },
        });
    };

    const showSilenceModal = (record) => {
        setCurrentIncident(record);
        setIsSilenceModalOpen(true);
    };

    const handleSilence = () => {
        message.success(`事件已靜音 ${silenceDuration} 小時`);
        setIsSilenceModalOpen(false);
    };

    if (loading) return <Spin />;
    if (error) return <Alert message="Error" description={error.message} type="error" showIcon />;

    const columns = [
        { title: '嚴重性', dataIndex: 'severity', width: '8%', sorter: (a, b) => a.severity.localeCompare(b.severity), render: (severity) => (<span className={`status-badge status-${severity}`}>{severity ? severity.toUpperCase() : 'UNKNOWN'}</span>) },
        { title: '摘要', dataIndex: 'summary', width: '18%', sorter: (a, b) => a.summary.localeCompare(b.summary), render: (text, record) => <a onClick={() => showDetailModal(record)} style={{ color: '#1890ff', textDecoration: 'none', cursor: 'pointer' }} onMouseEnter={(e) => e.target.style.textDecoration = 'underline'} onMouseLeave={(e) => e.target.style.textDecoration = 'none'}>{text}</a> },
        { title: '資源名稱', dataIndex: 'resource_name', width: '14%', sorter: (a, b) => (a || '').localeCompare(b || ''), render: name => name || '-' },
        { title: '業務影響', dataIndex: 'business_impact', width: '10%', sorter: (a, b) => (a.business_impact || '').localeCompare(b.business_impact || ''), render: (impact) => { const color = impact === '高' ? 'red' : impact === '中' ? 'orange' : 'blue'; return <Tag color={color}>{impact || '-'}</Tag>; } },
        { title: '狀態', dataIndex: 'status', width: '8%', render: (status, record) => { const statusText = { new: 'NEW', acknowledged: 'ACK', resolved: 'RESOLVED', silenced: 'SILENCED' }; if (record.storm_group) { const stormCount = incidents.filter(i => i.storm_group === record.storm_group).length; return (<div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}><Tag color="orange" size="small" style={{ margin: 0, fontSize: '10px' }}>風暴 ({stormCount})</Tag><span className={`status-badge status-${status}`}>{statusText[status] || 'UNKNOWN'}</span></div>); } return (<span className={`status-badge status-${status}`}>{statusText[status] || 'UNKNOWN'}</span>); } },
        { title: '處理人', dataIndex: 'assignee', width: '8%', sorter: (a, b) => (a || '').localeCompare(b || ''), render: (assignee) => assignee || '-' },
        { title: '觸發時間', dataIndex: 'created_at', width: '10%', sorter: (a, b) => dayjs(a.created_at).valueOf() - dayjs(b.created_at).valueOf(), render: time => <span title={time ? dayjs(time).format('YYYY-MM-DD HH:mm:ss') : ''}>{time ? dayjs(time).fromNow() : '-'}</span> },
        { title: '操作', key: 'action', width: '10%', render: (_, record) => (<Space size="small"><Tooltip title="確認事件" placement="top"><Button type="text" icon={<CheckCircleOutlined style={{ color: '#52c41a' }} />} disabled={record.status !== 'new'} onClick={() => handleAcknowledge(record.key)} /></Tooltip><Tooltip title={record.status === 'silenced' ? '已靜音' : '設置靜音'} placement="top"><Button type="text" icon={<PauseCircleOutlined />} disabled={record.status === 'resolved'} onClick={() => showSilenceModal(record)} /></Tooltip></Space>) }
    ];

    const onSelectChange = (newSelectedRowKeys) => {
        setSelectedRowKeys(newSelectedRowKeys);
    };

    const rowSelection = {
        selectedRowKeys,
        onChange: onSelectChange,
    };

    const filteredIncidents = incidents.filter(incident =>
        incident.summary.toLowerCase().includes(searchText.toLowerCase())
    );

    return (
        <>
            <Space style={{ marginBottom: 16 }}>
                <Input.Search placeholder="搜尋事件" onChange={e => setSearchText(e.target.value)} style={{ width: 200 }} />
                <Select placeholder="狀態" mode="multiple" style={{ width: 120 }} />
                <Select placeholder="嚴重性" mode="multiple" style={{ width: 120 }} />
            </Space>
            {selectedRowKeys.length > 0 && (
                <Space style={{ marginBottom: 16 }}>
                    <Button onClick={() => handleBatchUpdate('acknowledged')}>批次確認</Button>
                    <Button onClick={() => handleBatchUpdate('resolved')}>批次解決</Button>
                </Space>
            )}
            <Table rowSelection={rowSelection} dataSource={filteredIncidents} columns={columns} rowKey="key" />
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
            <Modal
                title="建立靜音"
                open={isSilenceModalOpen}
                onCancel={() => setIsSilenceModalOpen(false)}
                onOk={handleSilence}
            >
                <p>請選擇靜音時長：</p>
                <Select value={silenceDuration} onChange={setSilenceDuration} style={{ width: 120 }}>
                    <Select.Option value={1}>1 小時</Select.Option>
                    <Select.Option value={2}>2 小時</Select.Option>
                    <Select.Option value={4}>4 小時</Select.Option>
                    <Select.Option value={8}>8 小時</Select.Option>
                    <Select.Option value={24}>24 小時</Select.Option>
                </Select>
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
