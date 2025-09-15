import React, { useState } from 'react';
import { App, Button, Modal, Table, Space, Tooltip, Tag, Input } from 'antd';
import { FileTextOutlined, CopyOutlined, SearchOutlined, FilterOutlined, DownloadOutlined, CheckCircleOutlined, CloseOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

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

const ExecutionsPage = ({ executions, setExecutions }: { executions: any[], setExecutions: (e: any) => void }) => {
    const [logModal, setLogModal] = useState({ open: false, log: '', record: null });
    const [searchText, setSearchText] = useState('');
    const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
    const { message, modal } = App.useApp();

    const viewLog = (record: any) => {
        const logContent = `[${dayjs().format('HH:mm:ss')}] INFO: Starting execution...\n[${dayjs().add(1, 'second').format('HH:mm:ss')}] INFO: Script ${record.scriptName} completed with status ${record.status}.`;
        setLogModal({ open: true, log: logContent, record: record });
    };

    const copyLog = () => {
        navigator.clipboard.writeText(logModal.log);
        message.success('日誌已複製');
    };

    const onSelectChange = (keys: React.Key[]) => setSelectedRowKeys(keys);
    const rowSelection = { selectedRowKeys, onChange: onSelectChange };
    const hasSelected = selectedRowKeys.length > 0;

    const handleBatchDelete = () => {
        modal.confirm({
            title: `確定要刪除 ${selectedRowKeys.length} 個執行日誌嗎？`,
            content: '此操作無法復原。',
            okText: '確定',
            okType: 'danger',
            cancelText: '取消',
            onOk() {
                setExecutions(executions.filter((e: any) => !selectedRowKeys.includes(e.key)));
                setSelectedRowKeys([]);
                message.success('批次刪除成功');
            }
        });
    };

    const columns = [
        { title: '狀態', dataIndex: 'status', render: (s: string) => <Tag color={s === 'success' ? 'green' : 'red'}>{s.toUpperCase()}</Tag> },
        { title: '腳本名稱', dataIndex: 'scriptName' },
        { title: '觸發方式', dataIndex: 'trigger', render: (t: any) => t.type === 'Manual' ? `手動 (${t.user})` : t.type },
        { title: '開始時間', dataIndex: 'startTime', render: (t: any) => t.format('YYYY-MM-DD HH:mm:ss') },
        { title: '執行耗時', dataIndex: 'duration' },
        { title: '操作', key: 'action', render: (_: any, record: any) => <Tooltip title="查看日誌"><Button type="text" icon={<FileTextOutlined />} onClick={() => viewLog(record)} /></Tooltip> }
    ];

    return (
        <>
            <Space style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                <Input.Search placeholder="搜尋..." style={{ width: 300 }} />
                <Button icon={<DownloadOutlined />}>匯出</Button>
            </Space>
            <div className="table-wrapper">
                <Table rowSelection={rowSelection} columns={columns} dataSource={executions} rowKey="key" size="small" />
            </div>

            {hasSelected && (
                <div className="batch-actions-floating">
                    <div className="batch-info"><CheckCircleOutlined /><span>已選擇 {selectedRowKeys.length} 項</span></div>
                    <Space><Button className="batch-action-button danger-button" onClick={handleBatchDelete}>批次刪除</Button></Space>
                    <Button type="text" icon={<CloseOutlined />} onClick={() => setSelectedRowKeys([])} />
                </div>
            )}

            <Modal title="執行日誌詳情" open={logModal.open} onCancel={() => setLogModal({ open: false, log: '', record: null })} footer={[<Button key="copy" icon={<CopyOutlined />} onClick={copyLog}>複製日誌</Button>]} width={800}>
                <pre>{logModal.log}</pre>
            </Modal>
        </>
    );
};

export default ExecutionsPage;
