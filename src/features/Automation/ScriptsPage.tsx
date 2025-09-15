import React, { useState } from 'react';
import { App, Button, Modal, Form, Input, Table, Space, Tooltip, Empty, Select } from 'antd';
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

const ScriptsPage = ({ scripts, setScripts, addExecution }: { scripts: any[], setScripts: (s: any) => void, addExecution: (e: any) => void }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingScript, setEditingScript] = useState<any>(null);
    const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
    const [form] = Form.useForm();
    const { message, modal } = App.useApp();
    const confirmDelete = useDeleteConfirm();

    const showModal = (script = null) => {
        setEditingScript(script);
        form.setFieldsValue(script || { name: '', type: 'Python', description: '', code: '' });
        setIsModalOpen(true);
    };

    const handleCancel = () => setIsModalOpen(false);

    const onFinish = (values: any) => {
        if (editingScript) {
            setScripts(scripts.map((s: any) => s.key === editingScript.key ? { ...s, ...values } : s));
            message.success('腳本更新成功');
        } else {
            const newScript = { ...values, key: `s_${Date.now()}`, creator: 'admin' };
            setScripts([newScript, ...scripts]);
            message.success('腳本新增成功');
        }
        handleCancel();
    };

    const handleRun = (script: any) => {
        modal.confirm({
            title: `確定要執行腳本 "${script.name}" 嗎?`,
            icon: <PlayCircleOutlined />,
            onOk: () => {
                message.loading({ content: '執行中...', key: 'run_script' });
                setTimeout(() => {
                    addExecution({
                        key: `e_${Date.now()}`,
                        scriptName: script.name,
                        trigger: { type: 'Manual', user: 'admin' },
                        status: 'success',
                        startTime: dayjs(),
                        duration: `${(Math.random() * 5).toFixed(1)}s`
                    });
                    message.success({ content: '執行成功', key: 'run_script' });
                }, 1000);
            }
        })
    };

    const handleDelete = (key: string) => {
        confirmDelete('腳本', () => {
            setScripts(scripts.filter((s: any) => s.key !== key));
        });
    };

    const handleBatchDelete = () => {
        modal.confirm({
            title: `確定要刪除 ${selectedRowKeys.length} 個腳本嗎？`,
            icon: <ExclamationCircleOutlined />,
            content: '此操作無法復原。',
            okText: '確定',
            okType: 'danger',
            cancelText: '取消',
            onOk() {
                setScripts(scripts.filter((s: any) => !selectedRowKeys.includes(s.key)));
                setSelectedRowKeys([]);
                message.success('批次刪除成功');
            }
        });
    };

    const onSelectChange = (newSelectedRowKeys: React.Key[]) => {
        setSelectedRowKeys(newSelectedRowKeys);
    };

    const rowSelection = { selectedRowKeys, onChange: onSelectChange };
    const hasSelected = selectedRowKeys.length > 0;

    const columns = [
        { title: '腳本名稱', dataIndex: 'name', width: '25%' },
        { title: '類型', dataIndex: 'type', width: '15%', render: (t: string) => <Tag>{t}</Tag> },
        { title: '創建者', dataIndex: 'creator', width: '20%' },
        { title: '描述', dataIndex: 'description', width: '30%' },
        {
            title: '操作', key: 'action', width: '10%', render: (_: any, record: any) => (
                <Space size="small">
                    <Tooltip title="運行"><Button type="text" icon={<PlayCircleOutlined style={{ color: '#52c41a' }} />} onClick={() => handleRun(record)} /></Tooltip>
                    <Tooltip title="編輯"><Button type="text" icon={<EditOutlined />} onClick={() => showModal(record)} /></Tooltip>
                    <Tooltip title="刪除"><Button type="text" icon={<DeleteOutlined />} danger onClick={() => handleDelete(record.key)} /></Tooltip>
                </Space>
            )
        }
    ];

    return (
        <>
            <Space style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                <Input.Search placeholder="搜尋腳本..." style={{ width: 300 }} />
                <Button type="primary" icon={<PlusOutlined />} onClick={() => showModal()}>新增腳本</Button>
            </Space>

            <div className="table-wrapper">
                <Table rowSelection={rowSelection} columns={columns} dataSource={scripts} rowKey="key" size="small" />
            </div>

            {hasSelected && (
                <div className="batch-actions-floating">
                    <div className="batch-info"><CheckCircleOutlined /><span>已選擇 {selectedRowKeys.length} 項</span></div>
                    <Space><Button className="batch-action-button danger-button" onClick={handleBatchDelete}>批次刪除</Button></Space>
                    <Button type="text" icon={<CloseOutlined />} onClick={() => setSelectedRowKeys([])} />
                </div>
            )}

            <Modal title={editingScript ? '編輯腳本' : '新增腳本'} open={isModalOpen} onCancel={handleCancel} footer={null}>
                <Form form={form} layout="vertical" onFinish={onFinish} style={{ marginTop: 24 }}>
                    <Form.Item name="name" label="腳本名稱" rules={[{ required: true }]}><Input /></Form.Item>
                    <Form.Item name="type" label="類型" rules={[{ required: true }]}><Select><Select.Option value="Python">Python</Select.Option><Select.Option value="Bash">Bash</Select.Option></Select></Form.Item>
                    <Form.Item name="description" label="描述"><TextArea rows={2} /></Form.Item>
                    <Form.List name="parameters">
                        {(fields, { add, remove }) => (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
                                {fields.map(({ key, name, ...restField }) => (
                                    <Space key={key} align="baseline">
                                        <Form.Item {...restField} name={[name, 'name']} rules={[{ required: true }]}><Input placeholder="參數名稱" /></Form.Item>
                                        <Form.Item {...restField} name={[name, 'type']} initialValue="string"><Select><Select.Option value="string">String</Select.Option><Select.Option value="number">Number</Select.Option></Select></Form.Item>
                                        <MinusCircleOutlined onClick={() => remove(name)} />
                                    </Space>
                                ))}
                                <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>新增參數</Button>
                            </div>
                        )}
                    </Form.List>
                    <Form.Item name="code" label="腳本內容" rules={[{ required: true }]}><TextArea rows={10} /></Form.Item>
                    <div className="modal-footer">
                        <div></div>
                        <div>
                            <Button onClick={handleCancel}>取消</Button>
                            <Button type="primary" htmlType="submit">儲存</Button>
                        </div>
                    </div>
                </Form>
            </Modal>
        </>
    );
};

export default ScriptsPage;
