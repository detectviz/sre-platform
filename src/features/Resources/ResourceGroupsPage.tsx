import React, { useState } from 'react';
import { App, Button, Modal, Form, Input, Table, Space, Tooltip, Empty, Select, Transfer, Tag } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, HistoryOutlined, PlayCircleOutlined, ExclamationCircleOutlined, CheckCircleOutlined, CloseOutlined, FilterOutlined, DownloadOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

const { TextArea } = Input;

// Placeholder for a custom hook to be created later
const useLocalStorageState = (key: string, defaultValue: any) => {
    const [state, setState] = useState(() => {
        try {
            const storedValue = window.localStorage.getItem(key);
            return storedValue ? JSON.parse(storedValue) : defaultValue;
        } catch (error) {
            return defaultValue;
        }
    });
    React.useEffect(() => {
        window.localStorage.setItem(key, JSON.stringify(state));
    }, [key, state]);
    return [state, setState];
};

const useDeleteConfirm = () => {
    const { modal } = App.useApp();
    return (itemName: string, onDelete: () => void, customMessage: string | null = null) => {
      modal.confirm({
        title: `確定要刪除${customMessage || `此${itemName}`}嗎？`,
        icon: <ExclamationCircleOutlined />,
        content: '此操作無法復原。',
        okText: '確定',
        okType: 'danger',
        cancelText: '取消',
        onOk() {
          onDelete();
          message.success(`${itemName}刪除成功`);
        },
      });
    };
  };

const ResourceGroupsPage = () => {
    const allResourcesData = [
        { key: 'r_1', name: 'mysql-prod-master-01', type: 'database', status: 'healthy', ip_address: '10.100.10.11' },
        { key: 'r_2', name: 'mysql-prod-slave-01', type: 'database', status: 'healthy', ip_address: '10.100.10.12' },
        { key: 'r_3', name: 'web-prod-frontend-01', type: 'server', status: 'warning', ip_address: '10.100.20.11' },
    ];

    const initialGroups = [
        { key: 'g_1', name: 'Production Database', description: '所有生產環境的資料庫', members: ['r_1'], responsibleTeam: 't_6' },
        { key: 'g_2', name: 'Production Web Servers', description: '所有生產環境的 Web 伺服器', members: ['r_3'], responsibleTeam: 't_5' },
    ];

    const initialTeams = [
        { key: 't_5', name: 'DevOps Team' },
        { key: 't_6', name: 'Database Team' },
    ];

    const [groups, setGroups] = useLocalStorageState('sre-groups', initialGroups);
    const [teams] = useLocalStorageState('sre-teams', initialTeams);
    const [allResources] = useState(allResourcesData.map(r => ({ ...r, title: r.name })));
    const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
    const [editingGroup, setEditingGroup] = useState<any>(null);
    const [targetKeys, setTargetKeys] = useState<string[]>([]);
    const [searchText, setSearchText] = useState('');
    const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
    const [groupForm] = Form.useForm();
    const { message, modal } = App.useApp();
    const confirmDelete = useDeleteConfirm();

    const getStatusSummary = (memberKeys: string[]) => {
        const summary = { healthy: 0, warning: 0, critical: 0 };
        memberKeys.forEach(key => {
            const resource = allResources.find(r => r.key === key);
            if (resource) {
                summary[resource.status as keyof typeof summary]++;
            }
        });
        return summary;
    };

    const showGroupModal = (group = null) => {
        setEditingGroup(group);
        groupForm.setFieldsValue(group || { name: '', description: '', responsibleTeam: '' });
        setTargetKeys(group ? (group.members || []) : []);
        setIsGroupModalOpen(true);
    };

    const handleGroupCancel = () => {
        setIsGroupModalOpen(false);
        setEditingGroup(null);
        setTargetKeys([]);
        groupForm.resetFields();
    };

    const handleGroupFinish = (values: any) => {
        if (editingGroup) {
            setGroups(groups.map((g: any) => g.key === editingGroup.key ? { ...g, ...values, members: targetKeys } : g));
            message.success('群組更新成功');
        } else {
            const newGroup = { ...values, key: `g_${Date.now()}`, members: targetKeys };
            setGroups([newGroup, ...groups]);
            message.success('群組新增成功');
        }
        handleGroupCancel();
    };

    const handleGroupDelete = (key: string) => {
        confirmDelete('群組', () => {
            setGroups(groups.filter((g: any) => g.key !== key));
        });
    };

    const handleBatchDelete = () => {
        modal.confirm({
            title: `確定要刪除 ${selectedRowKeys.length} 個群組嗎？`,
            icon: <ExclamationCircleOutlined />,
            content: '此操作無法復原。',
            okText: '確定',
            okType: 'danger',
            cancelText: '取消',
            onOk() {
                setGroups(groups.filter((g: any) => !selectedRowKeys.includes(g.key)));
                setSelectedRowKeys([]);
                message.success('批次刪除成功');
            }
        });
    };

    const handleViewHistory = (record: any) => {
        message.info(`查看群組「${record.name}」的操作歷史`);
    };

    const getTeamName = (teamKey: string) => {
        if (!teamKey) return '-';
        const team = teams.find((t: any) => t.key === teamKey);
        return team ? team.name : teamKey;
    };

    const columns = [
        { title: '群組名稱', dataIndex: 'name', width: '20%', sorter: (a: any, b: any) => a.name.localeCompare(b.name) },
        { title: '描述', dataIndex: 'description', width: '20%' },
        { title: '負責團隊', dataIndex: 'responsibleTeam', width: '15%', render: (responsibleTeam: string) => getTeamName(responsibleTeam) },
        { title: '成員數量', dataIndex: 'members', width: '10%', render: (members: string[]) => members.length },
        {
            title: '狀態', dataIndex: 'members', width: '25%', render: (members: string[]) => {
                const summary = getStatusSummary(members);
                return (
                    <span>
                        <Tag color="green">Healthy: {summary.healthy}</Tag>
                        <Tag color="orange">Warning: {summary.warning}</Tag>
                        <Tag color="red">Critical: {summary.critical}</Tag>
                    </span>
                );
            }
        },
        {
            title: '操作', key: 'action', width: '15%', render: (_: any, record: any) => (
                <Space size="small">
                    <Tooltip title="執行"><Button type="text" icon={<PlayCircleOutlined style={{ color: '#52c41a' }} />} /></Tooltip>
                    <Tooltip title="查看歷史"><Button type="text" icon={<HistoryOutlined />} onClick={() => handleViewHistory(record)} /></Tooltip>
                    <Tooltip title="編輯"><Button type="text" icon={<EditOutlined />} onClick={() => showGroupModal(record)} /></Tooltip>
                    <Tooltip title="刪除"><Button type="text" icon={<DeleteOutlined />} danger onClick={() => handleGroupDelete(record.key)} /></Tooltip>
                </Space>
            )
        },
    ];

    const filteredGroups = groups.filter((g: any) => g.name.toLowerCase().includes(searchText.toLowerCase()));
    const onSelectChange = (newSelectedRowKeys: React.Key[]) => setSelectedRowKeys(newSelectedRowKeys);
    const rowSelection = { selectedRowKeys, onChange: onSelectChange };
    const hasSelected = selectedRowKeys.length > 0;

    return (
        <>
            <Space style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--spacing-lg)', width: '100%' }}>
                <Space>
                    <Input.Search placeholder="搜尋群組..." onChange={e => setSearchText(e.target.value)} style={{ width: 300 }} />
                    <Button icon={<FilterOutlined />}>篩選</Button>
                </Space>
                <Space>
                    <Button icon={<DownloadOutlined />}>匯出</Button>
                    <Button type="primary" icon={<PlusOutlined />} onClick={() => showGroupModal()}>新增群組</Button>
                </Space>
            </Space>

            <div className="table-wrapper">
                <Table rowSelection={rowSelection} columns={columns} dataSource={filteredGroups} rowKey="key" size="small" />
            </div>

            {hasSelected && (
                <div className="batch-actions-floating">
                    <div className="batch-info"><CheckCircleOutlined /><span>已選擇 <span className="batch-count">{selectedRowKeys.length}</span> 項</span></div>
                    <Space><Button className="batch-action-button danger-button" onClick={handleBatchDelete}>批次刪除</Button></Space>
                    <Button type="text" icon={<CloseOutlined />} onClick={() => setSelectedRowKeys([])} />
                </div>
            )}

            <Modal title={editingGroup ? '編輯群組' : '新增群組'} open={isGroupModalOpen} onCancel={handleGroupCancel} footer={null} width={900}>
                <Form form={groupForm} layout="vertical" onFinish={handleGroupFinish} style={{ marginTop: 24 }}>
                    <Form.Item name="name" label="群組名稱" rules={[{ required: true }]}><Input /></Form.Item>
                    <Form.Item name="description" label="描述"><TextArea rows={3} /></Form.Item>
                    <Form.Item name="responsibleTeam" label="負責團隊">
                        <Select placeholder="請選擇負責團隊" allowClear>
                            {teams.map((team: any) => <Select.Option key={team.key} value={team.key}>{team.name}</Select.Option>)}
                        </Select>
                    </Form.Item>
                    <Form.Item label="群組資源">
                        <Transfer
                            dataSource={allResources}
                            showSearch
                            filterOption={(inputValue, item) => item.name.toLowerCase().includes(inputValue.toLowerCase())}
                            targetKeys={targetKeys}
                            onChange={(keys) => setTargetKeys(keys)}
                            render={item => item.title}
                            listStyle={{ width: 420, height: 300 }}
                        />
                    </Form.Item>
                    <div className="modal-footer">
                        <div></div>
                        <div>
                            <Button onClick={handleGroupCancel}>取消</Button>
                            <Button type="primary" htmlType="submit">{editingGroup ? '更新群組' : '建立群組'}</Button>
                        </div>
                    </div>
                </Form>
            </Modal>
        </>
    );
};

export default ResourceGroupsPage;
