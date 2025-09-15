import React, { useState, useEffect } from 'react';
import { App, Button, Modal, Form, Input, Table, Space, Tooltip, Empty, Select, Tag, Switch, Checkbox, InputNumber } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, PlayCircleOutlined, ExclamationCircleOutlined, CheckCircleOutlined, CloseOutlined, FilterOutlined, DownloadOutlined, MinusCircleOutlined } from '@ant-design/icons';
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

// Placeholder for a component to be created later
const SmartTagInput = (props: any) => <Select mode="tags" {...props} />;

const AlertingRulesPage = () => {
    const [metrics, setMetrics] = useState<any[]>([]);
    const initialRules = [
        { key: 'rule_1', name: '高 CPU 使用率', target: 'Production Web Servers', notifications: ['Slack'], enabled: true },
        { key: 'rule_2', name: '資料庫延遲', target: 'Production Database', notifications: ['Email', 'Slack'], enabled: true },
    ];
    const [rules, setRules] = useLocalStorageState('sre-alert-rules', initialRules);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingRule, setEditingRule] = useState<any>(null);
    const [searchText, setSearchText] = useState('');
    const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
    const [form] = Form.useForm();
    const { message, modal } = App.useApp();
    const confirmDelete = useDeleteConfirm();

    useEffect(() => {
        const fetchMetrics = () => {
            const fetchedMetrics = [
                { id: 'cpu_utilization', name: 'CPU 使用率 (%)' },
                { id: 'memory_usage', name: '記憶體使用率 (%)' },
            ];
            setMetrics(fetchedMetrics);
        };
        fetchMetrics();
    }, []);

    const showModal = (rule = null) => {
        setEditingRule(rule);
        form.setFieldsValue(rule || {
            name: '',
            description: '',
            condition_groups: [{ severity: 'warning', conditions: [{ duration: 5, duration_unit: 'minutes' }] }],
            automation_enabled: false
        });
        setIsModalOpen(true);
    };

    const handleCancel = () => {
        setIsModalOpen(false);
        setEditingRule(null);
        form.resetFields();
    };

    const onFinish = (values: any) => {
        if (editingRule) {
            setRules(rules.map((r: any) => (r.key === editingRule.key ? { ...r, ...values } : r)));
        } else {
            setRules([...rules, { ...values, key: `rule_${Date.now()}`, enabled: true }]);
        }
        message.success(editingRule ? '規則更新成功' : '規則新增成功');
        handleCancel();
    };

    const columns = [
        { title: '啟用', dataIndex: 'enabled', width: '8%', render: (e: boolean) => <Switch checked={e} /> },
        { title: '規則名稱', dataIndex: 'name', width: '20%' },
        { title: '監控對象', dataIndex: 'target', width: '15%' },
        { title: '通知對象', dataIndex: 'notifications', width: '12%', render: (n: string[]) => <Space>{n.map(tag => <Tag key={tag}>{tag}</Tag>)}</Space> },
        { title: '操作', key: 'action', width: '10%', render: (_: any, record: any) => (
            <Space size="small">
                <Button type="text" icon={<EditOutlined />} onClick={() => showModal(record)} />
                <Button type="text" danger icon={<DeleteOutlined />} onClick={() => confirmDelete('規則', () => setRules(rules.filter((r:any) => r.key !== record.key)))} />
            </Space>
        )}
    ];

    return (
        <>
            <Space style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                <Input.Search placeholder="搜尋規則..." style={{ width: 300 }} />
                <Button type="primary" icon={<PlusOutlined />} onClick={() => showModal()}>新增規則</Button>
            </Space>
            <div className="table-wrapper">
                <Table columns={columns} dataSource={rules} rowKey="key" size="small" />
            </div>
            <Modal title={editingRule ? '編輯事件規則' : '新增事件規則'} open={isModalOpen} onCancel={handleCancel} width={900} footer={null}>
                <Form form={form} layout="vertical" onFinish={onFinish} style={{ marginTop: 24 }}>
                    {/* Form content from prototype.html will be added here in a later step */}
                    <Form.Item name="name" label="規則名稱" rules={[{ required: true }]}><Input /></Form.Item>
                    <Form.Item name="description" label="描述"><TextArea rows={2} /></Form.Item>
                    <Form.Item>
                        <Button type="primary" htmlType="submit">儲存</Button>
                    </Form.Item>
                </Form>
            </Modal>
        </>
    );
};

export default AlertingRulesPage;
