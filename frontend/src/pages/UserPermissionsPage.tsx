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

import useUsers from '../hooks/useUsers';
import useTeams from '../hooks/useTeams';
import useRoles from '../hooks/useRoles';

const PersonnelManagementPage = ({ users, setUsers }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [form] = Form.useForm();
    const { message, modal } = antd.App.useApp();

    const showModal = (user = null) => {
        setEditingUser(user);
        form.setFieldsValue(user || { name: '', email: '', teams: [], roles: ['viewer'], status: 'active' });
        setIsModalOpen(true);
    };

    const handleCancel = () => setIsModalOpen(false);

    const onFinish = (values) => {
        if (editingUser) {
            setUsers(users.map(u => u.key === editingUser.key ? { ...u, ...values } : u));
            message.success('人員更新成功');
        } else {
            const newUser = { ...values, key: `u_${Date.now()}`, created_at: dayjs(), last_login: null };
            setUsers([newUser, ...users]);
            message.success('人員新增成功');
        }
        handleCancel();
    };

    if (!users) return <Spin />;

    const columns = [
        { title: '名稱', dataIndex: 'name', key: 'name' },
        { title: '電子郵件', dataIndex: 'email', key: 'email' },
        { title: '狀態', dataIndex: 'status', key: 'status' },
    ];

    return (
        <>
            <Button onClick={() => showModal()} style={{ marginBottom: 16 }}>新增人員</Button>
            <Table dataSource={users} columns={columns} rowKey="key" />
            <Modal title={editingUser ? '編輯人員' : '新增人員'} open={isModalOpen} onCancel={handleCancel} onOk={() => form.submit()}>
                <Form form={form} layout="vertical" onFinish={onFinish}>
                    <Form.Item name="name" label="人員姓名" rules={[{ required: true }]}><Input /></Form.Item>
                    <Form.Item name="email" label="電子郵件" rules={[{ required: true, type: 'email' }]}><Input /></Form.Item>
                    <Form.Item name="status" label="狀態" rules={[{ required: true }]}><Select><Select.Option value="active">Active</Select.Option><Select.Option value="inactive">Inactive</Select.Option></Select></Form.Item>
                </Form>
            </Modal>
        </>
    );
};

const TeamManagementPage = ({ teams, setTeams, users }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTeam, setEditingTeam] = useState(null);
    const [form] = Form.useForm();
    const { message, modal } = antd.App.useApp();

    const showModal = (team = null) => {
        setEditingTeam(team);
        form.setFieldsValue(team || { name: '', description: '', members: [] });
        setIsModalOpen(true);
    };

    const handleCancel = () => setIsModalOpen(false);

    const onFinish = (values) => {
        if (editingTeam) {
            setTeams(teams.map(t => t.key === editingTeam.key ? { ...t, ...values } : t));
            message.success('團隊更新成功');
        } else {
            const newTeam = { ...values, key: `t_${Date.now()}` };
            setTeams([newTeam, ...teams]);
            message.success('團隊新增成功');
        }
        handleCancel();
    };

    if (!teams) return <Spin />;

    const columns = [
        { title: '名稱', dataIndex: 'name', key: 'name' },
        { title: '描述', dataIndex: 'description', key: 'description' },
        { title: '成員數量', dataIndex: 'members', key: 'members', render: (members) => members.length },
    ];

    return (
        <>
            <Button onClick={() => showModal()} style={{ marginBottom: 16 }}>新增團隊</Button>
            <Table dataSource={teams} columns={columns} rowKey="key" />
            <Modal title={editingTeam ? '編輯團隊' : '新增團隊'} open={isModalOpen} onCancel={handleCancel} onOk={() => form.submit()}>
                <Form form={form} layout="vertical" onFinish={onFinish}>
                    <Form.Item name="name" label="團隊名稱" rules={[{ required: true }]}><Input /></Form.Item>
                    <Form.Item name="description" label="描述"><Input.TextArea rows={2} /></Form.Item>
                    <Form.Item name="members" label="成員">
                        <Select mode="multiple" options={users.map(u => ({ label: u.name, value: u.key }))} />
                    </Form.Item>
                </Form>
            </Modal>
        </>
    );
};

const RoleManagementPage = ({ roles, setRoles }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingRole, setEditingRole] = useState(null);
    const [form] = Form.useForm();
    const { message, modal } = antd.App.useApp();

    const showModal = (role = null) => {
        setEditingRole(role);
        form.setFieldsValue(role || { name: '', color: '' });
        setIsModalOpen(true);
    };

    const handleCancel = () => setIsModalOpen(false);

    const onFinish = (values) => {
        if (editingRole) {
            setRoles(roles.map(r => r.id === editingRole.id ? { ...r, ...values } : r));
            message.success('角色更新成功');
        } else {
            const newRole = { ...values, id: `role_${Date.now()}` };
            setRoles([newRole, ...roles]);
            message.success('角色新增成功');
        }
        handleCancel();
    };

    if (!roles) return <Spin />;

    const columns = [
        { title: '名稱', dataIndex: 'name', key: 'name' },
        { title: '顏色', dataIndex: 'color', key: 'color' },
    ];

    return (
        <>
            <Button onClick={() => showModal()} style={{ marginBottom: 16 }}>新增角色</Button>
            <Table dataSource={roles} columns={columns} rowKey="id" />
            <Modal title={editingRole ? '編輯角色' : '新增角色'} open={isModalOpen} onCancel={handleCancel} onOk={() => form.submit()}>
                <Form form={form} layout="vertical" onFinish={onFinish}>
                    <Form.Item name="name" label="角色名稱" rules={[{ required: true }]}><Input /></Form.Item>
                    <Form.Item name="color" label="顏色"><Input /></Form.Item>
                </Form>
            </Modal>
        </>
    );
};

const AuditLogsPage = () => <div>Audit Logs Page</div>;

const UserPermissionsPage = ({ onNavigate, pageKey }) => {
    const tabKey = ['personnel-management', 'team-management', 'role-management', 'audit-logs'].includes(pageKey) ? pageKey : 'personnel-management';

    const userStats = {
      totalUsers: 156,
      activeUsers: 142,
      totalTeams: 12,
      totalRoles: 8,
      onlineUsers: 89,
      pendingInvitations: 5
    };

    return (
      <React.Fragment>
        <PageHeader
          title="身份與存取管理"
          subtitle="統一管理身份認證、存取權限和組織架構配置"
          icon={<UserOutlined />}
        />

        <div style={{ marginBottom: 'var(--spacing-xl)' }}>
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} lg={6}>
              <ContextualKPICard
                title="總人員數"
                value={userStats.totalUsers}
                unit="人"
                trend="+5.2%"
                status="success"
                description={`${userStats.activeUsers} 個啟用中`}
                icon={<UserOutlined />}
              />
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <ContextualKPICard
                title="在線人員"
                value={userStats.onlineUsers}
                unit="人"
                trend="+12.1%"
                status="info"
                description="目前活躍人員"
                icon={<SafetyCertificateOutlined />}
              />
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <ContextualKPICard
                title="團隊數量"
                value={userStats.totalTeams}
                unit="個"
                trend="0%"
                status="success"
                description="組織架構穩定"
                icon={<TeamOutlined />}
              />
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <ContextualKPICard
                title="待處理邀請"
                value={userStats.pendingInvitations}
                unit="個"
                trend="+25%"
                status="warning"
                description="需要跟進處理"
                icon={<BellOutlined />}
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
                <UserOutlined />
                人員管理
              </span>
            }
            key="personnel-management"
          >
            <PersonnelManagementPage />
          </Tabs.TabPane>
          <Tabs.TabPane
            tab={
              <span>
                <TeamOutlined />
                團隊管理
              </span>
            }
            key="team-management"
          >
            <TeamManagementPage />
          </Tabs.TabPane>
          <Tabs.TabPane
            tab={
              <span>
                <SafetyCertificateOutlined />
                角色管理
              </span>
            }
            key="role-management"
          >
            <RoleManagementPage />
          </Tabs.TabPane>
          <Tabs.TabPane
            tab={
              <span>
                <AuditOutlined />
                審計日誌
              </span>
            }
            key="audit-logs"
          >
            <AuditLogsPage />
          </Tabs.TabPane>
        </Tabs>
      </React.Fragment>
    );
  };

  export default UserPermissionsPage;
