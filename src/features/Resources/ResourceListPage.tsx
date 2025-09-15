import React, { useState, useEffect } from 'react';
import React, { useState, useEffect } from 'react';
import React, { useState, useEffect } from 'react';
import { App, Typography, Input, Table, Tag, Form, Select, Space, Tooltip, Checkbox } from 'antd';
import { UserOutlined, SearchOutlined, PlusOutlined, SettingOutlined, EditOutlined, DeleteOutlined, ExclamationCircleOutlined, CheckCircleOutlined, CloseOutlined, FilterOutlined, DownloadOutlined, PlayCircleOutlined } from '@ant-design/icons';
import ActionButton from '../../components/ActionButton';
import StandardModal from '../../components/StandardModal';
import dayjs from 'dayjs';

const { Title, Text, Paragraph } = Typography;

// Placeholder for a component to be created later
const SmartTagInput = (props: any) => <Select mode="tags" {...props} />;

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
    useEffect(() => {
        window.localStorage.setItem(key, JSON.stringify(state));
    }, [key, state]);
    return [state, setState];
};

const useDeleteConfirm = () => {
    const { modal } = App.useApp();
    return (itemName: string, onDelete: () => void) => {
      modal.confirm({
        title: `確定要刪除此${itemName}嗎？`,
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

const ResourceListPage = ({ onNavigate }: { onNavigate: (page: string, params?: any) => void }) => {
    const [isScanModalOpen, setIsScanModalOpen] = useState(false);

    const handleOpenScanModal = () => setIsScanModalOpen(true);

    const handleTestRule = (record: any) => {
        message.loading({ content: `正在測試資源 "${record.name}"...`, key: 'test_resource' });
        setTimeout(() => {
            const success = Math.random() > 0.3;
            if (success) {
                message.success({ content: '測試成功：資源連接正常。', key: 'test_resource' });
            } else {
                message.error({ content: '測試失敗：無法連接資源，請檢查網路設定。', key: 'test_resource' });
            }
        }, 1500);
    };

    const mockGroups = [
        { id: 'g_1', name: 'Production Database' },
        { id: 'g_2', name: 'Production Web Servers' },
        { id: 'g_3', name: 'Staging Environment' },
    ];

    const generateTrend = () => Array.from({ length: 12 }, () => Math.random() * 100);

    const initialData = [
        { key: 'r_1', name: 'db-prod-01', type: 'database', status: 'healthy', ip_address: '10.0.0.10', groups: ['g_1'], tags: ['production', 'database', 'high-priority'], trend: generateTrend(), alarms: [] },
        { key: 'r_2', name: 'web-prod-02', type: 'server', status: 'warning', ip_address: '10.0.0.21', groups: ['g_2'], tags: ['production', 'web-server'], trend: generateTrend(), alarms: [{ severity: 'warning', summary: 'Disk space is over 85%' }] },
        { key: 'r_3', name: 'api-gateway-prod', type: 'gateway', status: 'critical', ip_address: '10.0.0.35', groups: [], tags: ['production', 'high-priority'], trend: generateTrend(), alarms: [{ severity: 'critical', summary: 'API latency > 2s' }, { severity: 'warning', summary: '5xx error rate > 5%' }] },
    ];

    const [resources, setResources] = useLocalStorageState('sre-resources-v3', initialData);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingResource, setEditingResource] = useState<any>(null);
    const [searchText, setSearchText] = useState('');
    const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
    const [isAddToGroupModalOpen, setIsAddToGroupModalOpen] = useState(false);
    const [selectedGroupId, setSelectedGroupId] = useState(null);
    const [scanIpRange, setScanIpRange] = useState('');
    const [form] = Form.useForm();
    const { modal, message: antdMessage } = App.useApp();
    const confirmDelete = useDeleteConfirm();
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        setTimeout(() => {
            setIsLoading(false);
        }, 1000);
    }, []);

    const showModal = (resource = null) => {
        setEditingResource(resource);
        form.setFieldsValue(resource || { name: '', ip_address: '', type: 'server', groups: [], tags: {} });
        setIsModalOpen(true);
    };

    const handleCancel = () => {
        setIsModalOpen(false);
        setEditingResource(null);
        form.resetFields();
    };

    const onFinish = (values: any) => {
        const status = editingResource ? editingResource.status : 'healthy';
        if (editingResource) {
            setResources(resources.map((res: any) => res.key === editingResource.key ? { ...res, ...values, status } : res));
            message.success('資源更新成功');
        } else {
            const newResource = { ...values, key: `r_${Date.now()}`, status: 'unknown', trend: generateTrend() };
            setResources([newResource, ...resources]);
            message.success('資源新增成功');
        }
        handleCancel();
    };

    const handleDelete = (key: string) => {
        confirmDelete('資源', () => {
            setResources(resources.filter((res: any) => res.key !== key));
        });
    };

    const onSelectChange = (newSelectedRowKeys: React.Key[]) => {
        setSelectedRowKeys(newSelectedRowKeys);
    };

    const rowSelection = { selectedRowKeys, onChange: onSelectChange };
    const hasSelected = selectedRowKeys.length > 0;

    const handleBatchDelete = () => {
        modal.confirm({
            title: `確定要刪除 ${selectedRowKeys.length} 個資源嗎？`,
            icon: <ExclamationCircleOutlined />,
            content: '此操作無法復原。',
            okText: '確定',
            okType: 'danger',
            cancelText: '取消',
            onOk() {
                setResources(resources.filter((res: any) => !selectedRowKeys.includes(res.key)));
                setSelectedRowKeys([]);
                message.success('批次刪除成功');
            }
        });
    };

    const handleBatchAddToGroup = () => {
        if (selectedRowKeys.length === 0) {
          message.warning('請先選擇要操作的資源');
          return;
        }
        setIsAddToGroupModalOpen(true);
      };

    const handleConfirmAddToGroup = () => {
        if (!selectedGroupId) {
            message.error('請選擇一個資源群組');
            return;
        }
        const updatedResources = resources.map((res: any) => {
            if (selectedRowKeys.includes(res.key)) {
                const currentGroups = res.groups || [];
                const newGroups = [...new Set([...currentGroups, selectedGroupId])];
                return { ...res, groups: newGroups };
            }
            return res;
        });
        setResources(updatedResources);
        message.success(`${selectedRowKeys.length} 個資源已成功加入群組`);
        setIsAddToGroupModalOpen(false);
        setSelectedRowKeys([]);
        setSelectedGroupId(null);
    };

    const [highlightedResource, setHighlightedResource] = useState('');

    const columns = [
        {
            title: '狀態',
            dataIndex: 'status',
            width: '8%',
            filters: [
                { text: 'Healthy', value: 'healthy' },
                { text: 'Warning', value: 'warning' },
                { text: 'Critical', value: 'critical' },
            ],
            onFilter: (value: any, record: any) => record.status.indexOf(value) === 0,
            render: (status: string) => <span className={`status-badge status-${status || 'unknown'}`}>{status ? status.toUpperCase() : 'UNKNOWN'}</span>
        },
        { title: '資源名稱', dataIndex: 'name', width: '25%', sorter: (a: any, b: any) => a.name.localeCompare(b.name), render: (text: string) => <a>{text}</a> },
        { title: 'IP位址', dataIndex: 'ip_address', width: '18%', sorter: (a: any, b: any) => a.ip_address.localeCompare(b.ip_address) },
        { title: '類型', dataIndex: 'type', width: '10%', filters: [{ text: 'Database', value: 'database' }, { text: 'Server', value: 'server' }], onFilter: (value: any, record: any) => record.type.indexOf(value) === 0 },
        {
            title: '標籤',
            dataIndex: 'tags',
            key: 'tags',
            width: '17%',
            render: (tags: any) => (
                <Space size={[4, 4]} wrap>
                    {tags && Object.entries(tags).map(([key, value]) => <Tag key={key}>{key}:{String(value)}</Tag>)}
                </Space>
            )
        },
        {
            title: '操作', key: 'action', width: '10%', render: (_: any, record: any) => (
                <Space size="small">
                    <ActionButton tooltip="編輯" type="text" icon={<EditOutlined />} onClick={() => showModal(record)} className="btn-icon" />
                    <ActionButton tooltip="刪除" type="text" danger icon={<DeleteOutlined />} onClick={() => handleDelete(record.key)} className="btn-icon btn-icon--danger" />
                </Space>
            )
        }
    ];

    const filteredResources = resources.filter((res: any) =>
        res.name.toLowerCase().includes(searchText.toLowerCase()) ||
        res.ip_address.toLowerCase().includes(searchText.toLowerCase())
    );

    return (
        <>
            <Space style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--spacing-lg)', width: '100%' }}>
                <Space>
                    <Input.Search placeholder="搜尋資源..." onChange={e => setSearchText(e.target.value)} style={{ width: 300 }} />
                    <ActionButton icon={<FilterOutlined />} className="btn-secondary">篩選</ActionButton>
                </Space>
                <Space>
                    <ActionButton icon={<DownloadOutlined />} className="btn-secondary">匯出</ActionButton>
                    <ActionButton icon={<SearchOutlined />} onClick={handleOpenScanModal} className="btn-secondary">掃描網路</ActionButton>
                    <ActionButton type="primary" icon={<PlusOutlined />} onClick={() => showModal()} className="btn-primary">新增資源</ActionButton>
                </Space>
            </Space>
            {/* 錯誤模擬區塊 */}
            <Card title="錯誤處理模擬" size="small" style={{marginBottom: 16}}>
                <Space wrap>
                    <Button onClick={() => antdMessage.error('請檢查輸入內容 (400)')}>400 Bad Request</Button>
                    <Button onClick={() => modal.confirm({title: '禁止訪問 (403)', content: '您沒有權限執行此操作'})}>403 Forbidden</Button>
                    <Button onClick={() => modal.error({title: '找不到資源 (404)', content: '您訪問的資源不存在'})}>404 Not Found</Button>
                    <Button onClick={() => modal.warning({title: '操作衝突 (409)', content: '無法刪除，因為資源仍被使用'})}>409 Conflict</Button>
                    <Button onClick={() => antdMessage.error('系統發生錯誤，請稍後再試 (500)')}>500 Server Error</Button>
                </Space>
            </Card>

            <Spin spinning={isLoading} tip="正在載入資源列表...">
                <div className="table-wrapper">
                    <Table
                        rowSelection={rowSelection}
                        columns={columns}
                        dataSource={filteredResources}
                        rowKey="key"
                        size="small"
                        rowClassName={(record: any) => record.name === highlightedResource ? 'highlighted-row' : ''}
                        locale={{
                            emptyText: (
                                <Empty description="尚無任何資源">
                                    <Button type="primary" icon={<PlusOutlined />} onClick={() => showModal()}>立即新增資源</Button>
                                </Empty>
                            )
                        }}
                    />
                </div>
            </Spin>

            {hasSelected && (
                <div className="batch-actions-floating">
                    <div className="batch-info">
                        <CheckCircleOutlined style={{ color: 'var(--brand-primary)' }} />
                        <span>已選擇 <span className="batch-count">{selectedRowKeys.length}</span> 項</span>
                    </div>
                    <Space>
                        <Button className="batch-action-button" onClick={handleBatchAddToGroup}>批次加入群組</Button>
                        <Button className="batch-action-button danger-button" onClick={handleBatchDelete}>批次刪除</Button>
                    </Space>
                    <Button type="text" icon={<CloseOutlined />} onClick={() => setSelectedRowKeys([])} />
                </div>
            )}

            <StandardModal
                title={editingResource ? '編輯資源' : '新增資源'}
                open={isModalOpen}
                onCancel={handleCancel}
                onOk={() => form.submit()}
            >
                <Form form={form} layout="vertical" onFinish={onFinish} style={{ marginTop: 24 }} id="resource-form">
                    <Form.Item name="name" label="資源名稱" rules={[{ required: true }]}><Input /></Form.Item>
                    <Form.Item name="ip_address" label="IP 位址" rules={[{ required: true }]}><Input /></Form.Item>
                    <Form.Item name="type" label="類型" rules={[{ required: true }]}>
                        <Select>
                            <Select.Option value="server">Server</Select.Option>
                            <Select.Option value="database">Database</Select.Option>
                        </Select>
                    </Form.Item>
                    <Form.Item name="tags" label="標籤">
                        <SmartTagInput placeholder="輸入標籤..." style={{ width: '100%' }} />
                    </Form.Item>
                </Form>
            </StandardModal>
            <Modal title="批次加入群組" open={isAddToGroupModalOpen} onCancel={() => setIsAddToGroupModalOpen(false)} onOk={handleConfirmAddToGroup}>
                <p>請選擇要將 {selectedRowKeys.length} 個資源加入的目標群組：</p>
                <Select placeholder="選擇資源群組" style={{ width: '100%' }} onChange={(value) => setSelectedGroupId(value as any)} >
                    {mockGroups.map(group => <Select.Option key={group.id} value={group.id}>{group.name}</Select.Option>)}
                </Select>
            </Modal>
            <Modal title="掃描網段" open={isScanModalOpen} onCancel={() => setIsScanModalOpen(false)} onOk={() => { message.info('掃描任務已啟動'); setIsScanModalOpen(false); }}>
                <Input placeholder="例如: 192.168.1.0/24" value={scanIpRange} onChange={e => setScanIpRange(e.target.value)} />
            </Modal>
        </>
    );
};

export default ResourceListPage;
