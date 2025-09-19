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

import useNotifications from '../hooks/useNotifications';

const NotificationStrategiesPage = ({ strategies, setStrategies }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingStrategy, setEditingStrategy] = useState(null);
    const [form] = Form.useForm();
    const { message, modal } = antd.App.useApp();

    const showModal = (strategy = null) => {
        setEditingStrategy(strategy);
        form.setFieldsValue(strategy || { name: '', channels: [], conditions: [] });
        setIsModalOpen(true);
    };

    const handleCancel = () => setIsModalOpen(false);

    const onFinish = (values) => {
        if (editingStrategy) {
            setStrategies(strategies.map(s => s.key === editingStrategy.key ? { ...s, ...values } : s));
            message.success('策略更新成功');
        } else {
            const newStrategy = { ...values, key: `ns_${Date.now()}` };
            setStrategies([newStrategy, ...strategies]);
            message.success('策略新增成功');
        }
        handleCancel();
    };

    if (!strategies) return <Spin />;

    const columns = [
        { title: '名稱', dataIndex: 'name', key: 'name' },
        { title: '管道數量', dataIndex: 'channels', key: 'channels', render: (channels) => channels.length },
    ];

    return (
        <>
            <Button onClick={() => showModal()} style={{ marginBottom: 16 }}>新增策略</Button>
            <Table dataSource={strategies} columns={columns} rowKey="key" />
            <Modal title={editingStrategy ? '編輯策略' : '新增策略'} open={isModalOpen} onCancel={handleCancel} onOk={() => form.submit()}>
                <Form form={form} layout="vertical" onFinish={onFinish}>
                    <Form.Item name="name" label="策略名稱" rules={[{ required: true }]}><Input /></Form.Item>
                    {/* More fields to be added */}
                </Form>
            </Modal>
        </>
    );
};
const NotificationChannelsPage = ({ channels, setChannels }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingChannel, setEditingChannel] = useState(null);
    const [form] = Form.useForm();
    const { message, modal } = antd.App.useApp();

    const showModal = (channel = null) => {
        setEditingChannel(channel);
        form.setFieldsValue(channel || { name: '', type: 'Email', enabled: true });
        setIsModalOpen(true);
    };

    const handleCancel = () => setIsModalOpen(false);

    const onFinish = (values) => {
        if (editingChannel) {
            setChannels(channels.map(c => c.key === editingChannel.key ? { ...c, ...values } : c));
            message.success('管道更新成功');
        } else {
            const newChannel = { ...values, key: `nc_${Date.now()}` };
            setChannels([newChannel, ...channels]);
            message.success('管道新增成功');
        }
        handleCancel();
    };

    if (!channels) return <Spin />;

    const columns = [
        { title: '名稱', dataIndex: 'name', key: 'name' },
        { title: '類型', dataIndex: 'type', key: 'type' },
        { title: '啟用', dataIndex: 'enabled', key: 'enabled', render: (enabled) => <Switch checked={enabled} /> },
    ];

    return (
        <>
            <Button onClick={() => showModal()} style={{ marginBottom: 16 }}>新增管道</Button>
            <Table dataSource={channels} columns={columns} rowKey="key" />
            <Modal title={editingChannel ? '編輯管道' : '新增管道'} open={isModalOpen} onCancel={handleCancel} onOk={() => form.submit()}>
                <Form form={form} layout="vertical" onFinish={onFinish}>
                    <Form.Item name="name" label="管道名稱" rules={[{ required: true }]}><Input /></Form.Item>
                    <Form.Item name="type" label="類型" rules={[{ required: true }]}><Select><Select.Option value="Email">Email</Select.Option><Select.Option value="Slack">Slack</Select.Option></Select></Form.Item>
                    <Form.Item name="enabled" label="啟用" valuePropName="checked"><Switch /></Form.Item>
                </Form>
            </Modal>
        </>
    );
};
const NotificationHistoryPage = () => {
    const { notifications, loading, error } = useNotifications();
    const [isDetailOpen, setIsDetailOpen] = useState(false);
    const [selectedNotification, setSelectedNotification] = useState(null);

    const showDetail = (record) => {
        setSelectedNotification(record);
        setIsDetailOpen(true);
    };

    if (loading) return <Spin />;
    if (error) return <Alert message="Error" description={error.message} type="error" showIcon />;

    const columns = [
        { title: '時間', dataIndex: 'time', key: 'time' },
        { title: '狀態', dataIndex: 'status', key: 'status' },
        { title: '管道', dataIndex: 'channel', key: 'channel' },
        { title: '告警', dataIndex: 'alert', key: 'alert' },
        { title: '操作', key: 'action', render: (_, record) => <Button type="link" onClick={() => showDetail(record)}>詳情</Button> },
    ];

    return (
        <>
            <Table dataSource={notifications} columns={columns} rowKey="id" />
            <Drawer title="通知詳情" placement="right" onClose={() => setIsDetailOpen(false)} open={isDetailOpen}>
                {selectedNotification && (
                    <Descriptions bordered column={1}>
                        <Descriptions.Item label="時間">{selectedNotification.time}</Descriptions.Item>
                        <Descriptions.Item label="狀態">{selectedNotification.status}</Descriptions.Item>
                        <Descriptions.Item label="管道">{selectedNotification.channel}</Descriptions.Item>
                        <Descriptions.Item label="告警">{selectedNotification.alert}</Descriptions.Item>
                    </Descriptions>
                )}
            </Drawer>
        </>
    );
};

const NotificationManagementPage = ({ onNavigate, pageKey }) => {
    const tabKey = ['notification-strategies', 'notification-channels', 'notification-history'].includes(pageKey) ? pageKey : 'notification-strategies';

    const notificationStats = {
      totalChannels: 8,
      activeChannels: 6,
      todayNotifications: 47,
      deliveryRate: 97.3,
      failedNotifications: 2,
      avgResponseTime: 1.2
    };

    return (
      <React.Fragment>
        <PageHeader
          title="通知管理"
          subtitle="配置通知策略和訊息傳送管道，確保關鍵資訊及時傳達"
          icon={<BellOutlined />}
        />

        <div style={{ marginBottom: 'var(--spacing-xl)' }}>
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} md={8}>
              <ContextualKPICard
                title="通知管道"
                value={notificationStats.activeChannels}
                unit={`/${notificationStats.totalChannels}`}
                trend="stable"
                status="success"
                description="已啟用的通知管道"
                icon={<BellOutlined />}
              />
            </Col>
            <Col xs={24} sm={12} md={8}>
              <ContextualKPICard
                title="今日通知量"
                value={notificationStats.todayNotifications}
                unit="則"
                trend="up"
                status="info"
                description={`${notificationStats.failedNotifications} 則發送失敗`}
                icon={<MailOutlined />}
              />
            </Col>
            <Col xs={24} sm={12} md={8}>
              <ContextualKPICard
                title="送達率"
                value={notificationStats.deliveryRate}
                unit="%"
                trend={notificationStats.deliveryRate >= 95 ? 'up' : 'down'}
                status={notificationStats.deliveryRate >= 95 ? 'success' : 'warning'}
                description={`平均回應時間 ${notificationStats.avgResponseTime}s`}
                icon={<CheckCircleOutlined />}
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
                <SettingOutlined />
                通知策略
              </span>
            }
            key="notification-strategies"
          >
            <NotificationStrategiesPage />
          </Tabs.TabPane>
          <Tabs.TabPane
            tab={
              <span>
                <BellOutlined />
                通知管道
              </span>
            }
            key="notification-channels"
          >
            <NotificationChannelsPage />
          </Tabs.TabPane>
          <Tabs.TabPane
            tab={
              <span>
                <HistoryOutlined />
                通知歷史
              </span>
            }
            key="notification-history"
          >
            <NotificationHistoryPage />
          </Tabs.TabPane>
        </Tabs>
      </React.Fragment>
    );
  };

  export default NotificationManagementPage;
