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

import useResources from '../hooks/useResources';

const IntegratedResourceOverviewPage = ({ onNavigate }) => {
    const { resources, loading, error } = useResources();
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [currentResource, setCurrentResource] = useState(null);

    const showDetailModal = (record) => {
        setCurrentResource(record);
        setIsDetailModalOpen(true);
    };

    if (loading) return <Spin />;
    if (error) return <Alert message="Error" description={error.message} type="error" showIcon />;

    const columns = [
        { title: '名稱', dataIndex: 'name', key: 'name', render: (text, record) => <a onClick={() => showDetailModal(record)}>{text}</a> },
        { title: '類型', dataIndex: 'type', key: 'type' },
        { title: '狀態', dataIndex: 'status', key: 'status' },
        { title: 'IP位址', dataIndex: 'ip_address', key: 'ip_address' },
    ];

    const [isScanModalOpen, setIsScanModalOpen] = useState(false);
    const [scanIpRange, setScanIpRange] = useState('');

    const handleOpenScanModal = () => {
        setIsScanModalOpen(true);
    };

    const handleScan = () => {
        message.loading({ content: `正在掃描網段 ${scanIpRange}...`, key: 'scan' });
        setTimeout(() => {
            message.success({ content: '掃描任務已啟動，完成後將會通知您。', key: 'scan', duration: 5 });
        }, 2000);
        setIsScanModalOpen(false);
        setScanIpRange('');
    };

    return (
        <>
            <Button onClick={handleOpenScanModal} style={{ marginBottom: 16 }}>掃描網路</Button>
            <Table dataSource={resources} columns={columns} rowKey="key" />
            <Modal title="資源詳情" open={isDetailModalOpen} onCancel={() => setIsDetailModalOpen(false)} footer={null}>
                {currentResource && (
                    <Descriptions bordered column={1}>
                        <Descriptions.Item label="名稱">{currentResource.name}</Descriptions.Item>
                        <Descriptions.Item label="類型">{currentResource.type}</Descriptions.Item>
                        <Descriptions.Item label="狀態">{currentResource.status}</Descriptions.Item>
                        <Descriptions.Item label="IP位址">{currentResource.ip_address}</Descriptions.Item>
                    </Descriptions>
                )}
            </Modal>
            <Modal
                title="掃描網段以探索新資源"
                open={isScanModalOpen}
                onCancel={() => setIsScanModalOpen(false)}
                onOk={handleScan}
                okText="開始掃描"
                cancelText="取消"
            >
                <p>請輸入要掃描的 IP 網段（例如：192.168.1.0/24）。系統將會異步掃描並在發現新資源時通知您。</p>
                <Input
                    placeholder="192.168.1.0/24"
                    value={scanIpRange}
                    onChange={e => setScanIpRange(e.target.value)}
                />
            </Modal>
        </>
    );
};
import useResourceGroups from '../hooks/useResourceGroups';

const ResourceGroupsDetailPage = () => {
    const { resourceGroups, loading, error } = useResourceGroups();

    if (loading) return <Spin />;
    if (error) return <Alert message="Error" description={error.message} type="error" showIcon />;

    const columns = [
        { title: '名稱', dataIndex: 'name', key: 'name' },
        { title: '描述', dataIndex: 'description', key: 'description' },
        { title: '成員數量', dataIndex: 'members', key: 'members', render: (members) => members.length },
    ];

    return <Table dataSource={resourceGroups} columns={columns} rowKey="key" />;
};
const ResourceTopologyDetailPage = () => <div>Resource Topology Detail Page</div>;


const ResourcesPage = ({ onNavigate, pageKey, themeMode }) => {
    const tabKey = ['resource-overview', 'resource-groups', 'resource-topology'].includes(pageKey) ? pageKey : 'resource-overview';

    return (
      <React.Fragment>
        <PageHeader
          title="資源管理"
          subtitle="探索、組織與管理您的所有基礎設施資源"
          icon={<HddOutlined />}
        />

        <div style={{ marginBottom: 'var(--spacing-xl)' }}>
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} md={6}>
              <ContextualKPICard
                title="總資源數"
                value={374}
                unit="個"
                status="success"
                description="涵蓋所有業務系統"
                icon={<HddOutlined />}
              />
            </Col>
            <Col xs={24} sm={12} md={6}>
              <ContextualKPICard
                title="健康資源"
                value={326}
                unit="個"
                status="success"
                description="正常運行中"
                icon={<SafetyCertificateOutlined />}
              />
            </Col>
            <Col xs={24} sm={12} md={6}>
              <ContextualKPICard
                title="告警資源"
                value={35}
                unit="個"
                status="warning"
                description="需要關注"
                icon={<ExclamationCircleOutlined />}
              />
            </Col>
            <Col xs={24} sm={12} md={6}>
              <ContextualKPICard
                title="資源群組"
                value={12}
                unit="組"
                status="info"
                description="業務邏輯分組"
                icon={<ApartmentOutlined />}
              />
            </Col>
          </Row>
        </div>

        <Tabs
          activeKey={tabKey}
          onChange={(key) => onNavigate(key)}
          style={{
            '--tab-bar-margin': '0 0 var(--spacing-lg) 0'
          }}
        >
          <Tabs.TabPane
            tab={
              <span>
                <BarsOutlined />
                資源列表
              </span>
            }
            key="resource-overview"
          >
            <IntegratedResourceOverviewPage themeMode={themeMode} onNavigate={onNavigate} />
          </Tabs.TabPane>
          <Tabs.TabPane
            tab={
              <span>
                <ApartmentOutlined />
                資源群組
              </span>
            }
            key="resource-groups"
          >
            <ResourceGroupsDetailPage onNavigate={onNavigate} />
          </Tabs.TabPane>
          <Tabs.TabPane
            tab={
              <span>
                <BranchesOutlined />
                拓撲視圖
              </span>
            }
            key="resource-topology"
          >
            <ResourceTopologyDetailPage onNavigate={onNavigate} />
          </Tabs.TabPane>
        </Tabs>
      </React.Fragment>
    );
  };

  export default ResourcesPage;
