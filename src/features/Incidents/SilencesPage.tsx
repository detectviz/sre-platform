import React, { useState } from 'react';
import { App, Button, Modal, Form, Input, Table, Space, Tooltip, Empty, Select, Tag, Switch, Checkbox, InputNumber, DatePicker, Radio, Row, Col, Typography } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, ExclamationCircleOutlined, CheckCircleOutlined, CloseOutlined, FilterOutlined, DownloadOutlined, MinusCircleOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

const { TextArea } = Input;
const { RangePicker } = DatePicker;
const { Title, Text, Paragraph } = Typography;

// Placeholder for a custom hook to be created later
const useLocalStorageState = (key: string, defaultValue: any) => {
    const [state, setState] = useState(() => {
        try {
            const storedValue = window.localStorage.getItem(key);
            return storedValue ? JSON.parse(storedValue, (k, v) => {
                if (typeof v === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/.test(v)) {
                  return dayjs(v);
                }
                return v;
              }) : defaultValue;
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

const SilencesPage = () => {
    const initialSilences = [
        { key: 's_1', name: '週末例行維護', type: 'recurring', enabled: true },
        { key: 's_2', name: '月底批次作業', type: 'recurring', enabled: true },
        { key: 's_3', name: '緊急維護視窗', type: 'once', enabled: false },
    ];
    const [silences, setSilences] = useLocalStorageState('sre-silences-v2', initialSilences);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingSilence, setEditingSilence] = useState<any>(null);
    const [searchText, setSearchText] = useState('');
    const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
    const [form] = Form.useForm();
    const { message, modal } = App.useApp();
    const confirmDelete = useDeleteConfirm();

    const showModal = (silence = null) => {
        setEditingSilence(silence);
        form.setFieldsValue(silence || { matchers: [{}] });
        setIsModalOpen(true);
    };

    const handleCancel = () => {
        setIsModalOpen(false);
        setEditingSilence(null);
        form.resetFields();
    };

    const onFinish = (values: any) => {
        message.success('儲存成功');
        handleCancel();
    };

    const columns = [
        { title: '啟用', dataIndex: 'enabled', width: '8%', render: (e: boolean) => <Switch checked={e} /> },
        { title: '名稱', dataIndex: 'name', width: '20%' },
        { title: '類型', dataIndex: 'type', width: '10%', render: (t: string) => <Tag>{t}</Tag> },
        { title: '操作', key: 'action', width: '10%', render: (_: any, record: any) => (
            <Space size="small">
                <Button type="text" icon={<EditOutlined />} onClick={() => showModal(record)} />
                <Button type="text" danger icon={<DeleteOutlined />} onClick={() => confirmDelete('靜音規則', () => setSilences(silences.filter((s:any) => s.key !== record.key)))} />
            </Space>
        )}
    ];

    return (
        <>
            <Space style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                <Input.Search placeholder="搜尋靜音規則..." style={{ width: 300 }} />
                <Button type="primary" icon={<PlusOutlined />} onClick={() => showModal()}>新增靜音規則</Button>
            </Space>
            <div className="table-wrapper">
                <Table columns={columns} dataSource={silences} rowKey="key" size="small" />
            </div>
            <Modal title={editingSilence ? '編輯靜音規則' : '新增靜音規則'} open={isModalOpen} onCancel={handleCancel} width={900} footer={null}>
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

export default SilencesPage;
