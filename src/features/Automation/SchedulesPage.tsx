import React, { useState, useEffect } from 'react';
import { App, Button, Modal, Form, Input, Table, Space, Tooltip, Empty, Select, Tag, Switch, TimePicker, Radio, Checkbox, InputNumber } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, HistoryOutlined, PlayCircleOutlined, ExclamationCircleOutlined, CheckCircleOutlined, CloseOutlined, FilterOutlined, DownloadOutlined, InfoCircleOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

const { TextArea } = Input;

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

const SchedulesPage = ({ scripts }: { scripts: any[] }) => {
    const initialSchedules = [
        { key: 'sch_1', name: '每日資料庫備份', cron: '0 2 * * *', scriptId: 's_3', lastRun: dayjs().subtract(1, 'day').hour(2), lastStatus: 'success', enabled: true, creator: 'admin' },
        { key: 'sch_2', name: '每小時清理臨時文件', cron: '0 * * * *', scriptId: 's_2', lastRun: dayjs().subtract(30, 'minute'), lastStatus: 'failed', enabled: false, creator: 'dev_user' },
    ];
    const [schedules, setSchedules] = useLocalStorageState('sre-schedules', initialSchedules);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingSchedule, setEditingSchedule] = useState<any>(null);
    const [form] = Form.useForm();
    const { message, modal } = App.useApp();

    const showModal = (schedule = null) => {
        setEditingSchedule(schedule);
        form.setFieldsValue(schedule || { name: '', cron: '0 * * * *', enabled: true });
        setIsModalOpen(true);
    };

    const handleCancel = () => setIsModalOpen(false);

    const onFinish = (values: any) => {
        // ... logic from prototype
        message.success('儲存成功');
        handleCancel();
    };

    const columns = [
        { title: '啟用', dataIndex: 'enabled', width: '5%', render: (e: boolean) => <Switch defaultChecked={e} /> },
        { title: '任務名稱', dataIndex: 'name', width: '15%' },
        { title: '執行腳本', dataIndex: 'scriptId', width: '15%', render: (id: string) => scripts.find(s => s.key === id)?.name || '未知腳本' },
        { title: 'CRON 條件', dataIndex: 'cron', width: '10%' },
        { title: '上次狀態', dataIndex: 'lastStatus', width: '10%', render: (s: string) => <Tag color={s === 'success' ? 'green' : 'red'}>{s}</Tag> },
        { title: '上次執行時間', dataIndex: 'lastRun', width: '12%', render: (t: any) => t?.format('MM-DD HH:mm') },
        { title: '下次執行', dataIndex: 'cron', width: '12%', render: () => dayjs().add(1, 'hour').format('MM-DD HH:mm') },
        { title: '創建者', dataIndex: 'creator', width: '8%' },
        { title: '操作', key: 'action', width: '13%', render: () => <Space size="small"><Button>編輯</Button><Button danger>刪除</Button></Space> }
    ];

    return (
        <>
            <Space style={{ marginBottom: 16 }}>
                <Input.Search placeholder="搜尋排程..." style={{ width: 300 }} />
                <Button type="primary" icon={<PlusOutlined />} onClick={() => showModal()}>新增排程</Button>
            </Space>
            <Table columns={columns} dataSource={schedules} rowKey="key" size="small" />
            <Modal title={editingSchedule ? '編輯排程' : '新增排程'} open={isModalOpen} onCancel={handleCancel} onOk={() => form.submit()}>
                <Form form={form} layout="vertical" onFinish={onFinish} style={{ marginTop: 24 }}>
                    <Form.Item name="name" label="任務名稱" rules={[{ required: true }]}><Input /></Form.Item>
                    <Form.Item name="scriptId" label="執行腳本" rules={[{ required: true }]}><Select options={scripts.map(s => ({ label: s.name, value: s.key }))} /></Form.Item>
                    <Form.Item name="cron" label="CRON 表達式" rules={[{ required: true }]}><Input /></Form.Item>
                </Form>
            </Modal>
        </>
    );
};

export default SchedulesPage;
