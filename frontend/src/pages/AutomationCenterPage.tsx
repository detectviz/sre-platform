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

import useAutomationScripts from '../hooks/useAutomationScripts';
import useSchedules from '../hooks/useSchedules';
import useExecutions from '../hooks/useExecutions';

const ScriptsPage = ({ scripts, setScripts, addExecution, schedules }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingScript, setEditingScript] = useState(null);
    const [selectedRowKeys, setSelectedRowKeys] = useState([]);
    const [form] = Form.useForm();
    const { message, modal } = antd.App.useApp();

    const showModal = (script = null) => {
        setEditingScript(script);
        form.setFieldsValue(script || { name: '', type: 'Python', description: '', code: '' });
        setIsModalOpen(true);
    };

    const handleRun = (script) => {
        modal.confirm({
            title: `確定要執行腳本 "${script.name}" 嗎?`,
            icon: <PlayCircleOutlined />,
            onOk: () => {
                message.loading({ content: '執行中...', key: 'run_script' });
                setTimeout(() => {
                    addExecution({
                        key: `e_${Date.now()}`,
                        script_name: script.name,
                        trigger: { type: 'Manual', user: 'admin' },
                        status: 'success',
                        start_time: dayjs(),
                        duration: `${(Math.random() * 5).toFixed(1)}s`
                    });
                    message.success({ content: '執行成功', key: 'run_script' });
                }, 1000);
            }
        })
    };

    if (!scripts) return <Spin />;
    if (error) return <Alert message="Error" description={error.message} type="error" showIcon />;

    const handleDelete = (key) => {
        modal.confirm({
            title: '確定要刪除此腳本嗎？',
            icon: <ExclamationCircleOutlined />,
            content: '此操作無法復原。',
            onOk() {
                setScripts(scripts.filter(s => s.key !== key));
                message.success('腳本刪除成功');
            }
        });
    };

    const handleBatchDelete = () => {
        modal.confirm({
            title: `確定要刪除 ${selectedRowKeys.length} 個腳本嗎？`,
            icon: <ExclamationCircleOutlined />,
            content: '此操作無法復原。',
            onOk() {
                setScripts(scripts.filter(s => !selectedRowKeys.includes(s.key)));
                setSelectedRowKeys([]);
                message.success('批次刪除成功');
            }
        });
    };

    const columns = [
        { title: '名稱', dataIndex: 'name', key: 'name' },
        { title: '類型', dataIndex: 'type', key: 'type' },
        { title: '創建者', dataIndex: 'creator', key: 'creator' },
        { title: '操作', key: 'action', render: (_, record) => (
            <Space>
                <Button type="link" onClick={() => showModal(record)}>編輯</Button>
                <Button type="link" danger onClick={() => handleDelete(record.key)}>刪除</Button>
                <Button type="link" onClick={() => handleRun(record)}>運行</Button>
            </Space>
        )},
    ];

    const handleCancel = () => setIsModalOpen(false);

    const onSelectChange = (newSelectedRowKeys) => {
        setSelectedRowKeys(newSelectedRowKeys);
    };

    const rowSelection = {
        selectedRowKeys,
        onChange: onSelectChange,
    };

    const hasSelected = selectedRowKeys.length > 0;

    const onFinish = (values) => {
        if (editingScript) {
            setScripts(scripts.map(s => s.key === editingScript.key ? { ...s, ...values } : s));
            message.success('腳本更新成功');
        } else {
            const newScript = { ...values, key: `s_${Date.now()}`, creator: 'admin' };
            setScripts([newScript, ...scripts]);
            message.success('腳本新增成功');
        }
        handleCancel();
    };

    return (
        <>
            <Space style={{ marginBottom: 16 }}>
                <Button onClick={() => showModal()}>新增腳本</Button>
                {hasSelected && <Button danger onClick={handleBatchDelete}>批次刪除</Button>}
            </Space>
            <Table rowSelection={rowSelection} dataSource={scripts} columns={columns} rowKey="key" />
            <Modal title={editingScript ? '編輯腳本' : '新增腳本'} open={isModalOpen} onCancel={handleCancel} onOk={() => form.submit()}>
                <Form form={form} layout="vertical" onFinish={onFinish}>
                    <Form.Item name="name" label="腳本名稱" rules={[{ required: true }]}><Input /></Form.Item>
                    <Form.Item name="type" label="類型" rules={[{ required: true }]}><Select><Select.Option value="Python">Python</Select.Option><Select.Option value="Bash">Bash</Select.Option></Select></Form.Item>
                    <Form.Item name="description" label="描述"><Input.TextArea rows={2} /></Form.Item>
                    <Form.Item name="code" label="腳本內容" rules={[{ required: true }]}><Input.TextArea rows={10} /></Form.Item>
                </Form>
            </Modal>
        </>
    );
};

const SchedulesPage = ({ schedules, setSchedules, scripts }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingSchedule, setEditingSchedule] = useState(null);
    const [selectedRowKeys, setSelectedRowKeys] = useState([]);
    const [form] = Form.useForm();
    const { message, modal } = antd.App.useApp();

    const showModal = (schedule = null) => {
        setEditingSchedule(schedule);
        form.setFieldsValue(schedule || { name: '', cron: '', script_id: '' });
        setIsModalOpen(true);
    };

    const handleCancel = () => setIsModalOpen(false);

    const onFinish = (values) => {
        if (editingSchedule) {
            setSchedules(schedules.map(s => s.key === editingSchedule.key ? { ...s, ...values } : s));
            message.success('排程更新成功');
        } else {
            const newSchedule = { ...values, key: `sch_${Date.now()}`, creator: 'admin' };
            setSchedules([newSchedule, ...schedules]);
            message.success('排程新增成功');
        }
        handleCancel();
    };

    const handleDelete = (key) => {
        modal.confirm({
            title: '確定要刪除此排程嗎？',
            icon: <ExclamationCircleOutlined />,
            content: '此操作無法復原。',
            onOk() {
                setSchedules(schedules.filter(s => s.key !== key));
                message.success('排程刪除成功');
            }
        });
    };

    const handleBatchDelete = () => {
        modal.confirm({
            title: `確定要刪除 ${selectedRowKeys.length} 個排程嗎？`,
            icon: <ExclamationCircleOutlined />,
            content: '此操作無法復原。',
            onOk() {
                setSchedules(schedules.filter(s => !selectedRowKeys.includes(s.key)));
                setSelectedRowKeys([]);
                message.success('批次刪除成功');
            }
        });
    };

    if (!schedules) return <Spin />;

    const columns = [
        { title: '任務名稱', dataIndex: 'name', key: 'name' },
        { title: 'CRON', dataIndex: 'cron', key: 'cron' },
        { title: '腳本ID', dataIndex: 'script_id', key: 'script_id' },
        { title: '操作', key: 'action', render: (_, record) => (
            <Space>
                <Button type="link" onClick={() => showModal(record)}>編輯</Button>
                <Button type="link" danger onClick={() => handleDelete(record.key)}>刪除</Button>
            </Space>
        )},
    ];

    const onSelectChange = (newSelectedRowKeys) => {
        setSelectedRowKeys(newSelectedRowKeys);
    };

    const rowSelection = {
        selectedRowKeys,
        onChange: onSelectChange,
    };

    const hasSelected = selectedRowKeys.length > 0;

    return (
        <>
            <Space style={{ marginBottom: 16 }}>
                <Button onClick={() => showModal()}>新增排程</Button>
                {hasSelected && <Button danger onClick={handleBatchDelete}>批次刪除</Button>}
            </Space>
            <Table rowSelection={rowSelection} dataSource={schedules} columns={columns} rowKey="key" />
            <Modal title={editingSchedule ? '編輯排程' : '新增排程'} open={isModalOpen} onCancel={handleCancel} onOk={() => form.submit()}>
                <Form form={form} layout="vertical" onFinish={onFinish}>
                    <Form.Item name="name" label="任務名稱" rules={[{ required: true }]}><Input /></Form.Item>
                    <Form.Item name="cron" label="CRON 表達式" rules={[{ required: true }]}><Input /></Form.Item>
                    <Form.Item name="script_id" label="執行腳本" rules={[{ required: true }]}><Select options={scripts.map(s => ({ label: s.name, value: s.key }))} /></Form.Item>
                </Form>
            </Modal>
        </>
    );
};

const ExecutionsPage = ({ executions, setExecutions }) => {
    const [selectedRowKeys, setSelectedRowKeys] = useState([]);
    const { message, modal } = antd.App.useApp();

    const handleBatchDelete = () => {
        modal.confirm({
            title: `確定要刪除 ${selectedRowKeys.length} 個執行日誌嗎？`,
            icon: <ExclamationCircleOutlined />,
            content: '此操作無法復原。',
            onOk() {
                setExecutions(executions.filter(e => !selectedRowKeys.includes(e.key)));
                setSelectedRowKeys([]);
                message.success('批次刪除成功');
            }
        });
    };

    if (!executions) return <Spin />;

    const columns = [
        { title: '腳本名稱', dataIndex: 'script_name', key: 'script_name' },
        { title: '狀態', dataIndex: 'status', key: 'status' },
        { title: '開始時間', dataIndex: 'start_time', key: 'start_time' },
        { title: '耗時', dataIndex: 'duration', key: 'duration' },
    ];

    const onSelectChange = (newSelectedRowKeys) => {
        setSelectedRowKeys(newSelectedRowKeys);
    };

    const rowSelection = {
        selectedRowKeys,
        onChange: onSelectChange,
    };

    const hasSelected = selectedRowKeys.length > 0;

    return (
        <>
            {hasSelected && <Button danger onClick={handleBatchDelete} style={{ marginBottom: 16 }}>批次刪除</Button>}
            <Table rowSelection={rowSelection} dataSource={executions} columns={columns} rowKey="key" />
        </>
    );
};

const AutomationCenterPage = ({ onNavigate, pageKey, scripts, setScripts, addExecution, executions, setExecutions, schedules, setSchedules, pageParams }) => {
    const defaultTab = pageParams && pageParams.subTab === 'executions' ? 'executions' : 'scripts';
    const tabKey = ['scripts', 'schedules', 'executions'].includes(pageKey) ? pageKey : defaultTab;

    const totalScripts = scripts?.length ?? 0;
    const activeScripts = scripts?.filter(s => s.status === 'active').length ?? 0;
    const successfulExecutions = executions?.filter(e => e.status === 'success').length ?? 0;
    const totalExecutions = executions?.length ?? 0;
    const successRate = totalExecutions > 0 ? ((successfulExecutions / totalExecutions) * 100) : 100;
    const recentExecutions = executions?.filter(e =>
      dayjs().diff(dayjs(e.start_time), 'hours') <= 24
    ).length ?? 0;

    return (
      <React.Fragment>
        <PageHeader
          title="自動化中心"
          subtitle="管理自動化腳本、排程任務與執行歷史，提升運維效率"
          icon={<CodeOutlined />}
        />

        <div style={{ marginBottom: 'var(--spacing-xl)' }}>
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} md={6}>
              <ContextualKPICard
                title="腳本總數"
                value={totalScripts}
                unit="個"
                trend={totalScripts > 20 ? 'up' : 'stable'}
                status="success"
                description={`${activeScripts} 個啟用中`}
                icon={<CodeOutlined />}
              />
            </Col>
            <Col xs={24} sm={12} md={6}>
              <ContextualKPICard
                title="執行成功率"
                value={successRate}
                unit="%"
                trend={successRate >= 95 ? 'up' : successRate >= 85 ? 'stable' : 'down'}
                status={successRate >= 95 ? 'success' : successRate >= 85 ? 'warning' : 'critical'}
                description={`${successfulExecutions}/${totalExecutions} 次執行`}
                icon={<CheckCircleOutlined />}
              />
            </Col>
            <Col xs={24} sm={12} md={6}>
              <ContextualKPICard
                title="24小時執行"
                value={recentExecutions}
                unit="次"
                trend={recentExecutions > 50 ? 'up' : 'stable'}
                status="info"
                description="過去一天的執行次數"
                icon={<ClockCircleOutlined />}
              />
            </Col>
            <Col xs={24} sm={12} md={6}>
              <ContextualKPICard
                title="排程任務"
                value={scripts?.filter(s => s.schedule).length ?? 0}
                unit="個"
                trend="stable"
                status="info"
                description="已設定排程的腳本"
                icon={<ScheduleOutlined />}
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
                <CodeOutlined />
                腳本庫
              </span>
            }
            key="scripts"
          >
            <ScriptsPage scripts={scripts} setScripts={setScripts} addExecution={addExecution} schedules={schedules} />
          </Tabs.TabPane>
          <Tabs.TabPane
            tab={
              <span>
                <ScheduleOutlined />
                排程管理
              </span>
            }
            key="schedules"
          >
            <SchedulesPage scripts={scripts} schedules={schedules} setSchedules={setSchedules} onNavigate={onNavigate} />
          </Tabs.TabPane>
          <Tabs.TabPane
            tab={
              <span>
                <HistoryOutlined />
                執行日誌
              </span>
            }
            key="executions"
          >
            <ExecutionsPage executions={executions} setExecutions={setExecutions} pageParams={pageParams} />
          </Tabs.TabPane>
        </Tabs>
      </React.Fragment>
    );
  };

  export default AutomationCenterPage;
