import React, { useState } from 'react';
import { App, Button, Modal, Form, Input, Table, Space, Tooltip, Empty, Select, Tag, Popover, List, Badge, Typography, DatePicker } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, InfoCircleOutlined, PlayCircleOutlined, ExclamationCircleOutlined, CheckCircleOutlined, CloseOutlined, FilterOutlined, DownloadOutlined, RobotOutlined, SettingOutlined, CheckOutlined, PauseCircleOutlined, BarChartOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

const { Title, Text, Paragraph } = Typography;
const { RangePicker } = DatePicker;

// Placeholder for a custom hook to be created later
const useLocalStorageState = (key: string, defaultValue: any) => {
    const [state, setState] = useState(() => {
        try {
            const storedValue = window.localStorage.getItem(key);
            return storedValue ? JSON.parse(storedValue, (k, v) => {
                // A simple reviver to convert ISO date strings back to dayjs objects
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

// Placeholder components
const AdvancedIncidentFilter = (props: any) => <div/>;
const AIAnalysisModal = (props: any) => <div/>;

const IncidentListPage = ({ onNavigate, pageParams }: { onNavigate: (page: string, params?: any) => void, pageParams?: any }) => {
    const initialData = [
        { key: 'i_1', summary: 'CPU high on db-mysql-prod-02', severity: 'critical', source: 'Prometheus', status: 'acknowledged', created_at: dayjs().subtract(5, 'minutes'), automation_id: null, assignee: 'u_2', resource_name: 'db-mysql-prod-02', service: '資料庫服務', business_impact: '高', storm_group: null, ruleName: '高 CPU 使用率', triggerThreshold: 'CPU > 90%' },
        { key: 'i_2', summary: 'Disk space low on srv-web-prod-02', severity: 'warning', source: 'Grafana', status: 'new', created_at: dayjs().subtract(2, 'hour'), automation_id: 'e_1', assignee: null, resource_name: 'srv-web-prod-02', service: 'Web應用', business_impact: '中', storm_group: null, ruleName: '磁碟空間不足', triggerThreshold: 'Disk < 15%' },
    ];
    const [incidents, setIncidents] = useLocalStorageState('sre-incidents-v4', initialData);
    const [searchText, setSearchText] = useState('');
    const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [currentIncident, setCurrentIncident] = useState<any>(null);
    const [isSilenceModalOpen, setIsSilenceModalOpen] = useState(false);
    const [silenceIncident, setSilenceIncident] = useState(null);
    const [silenceDuration, setSilenceDuration] = useState(1);
    const { message, modal } = App.useApp();
    const [isAIAnalysisModalOpen, setIsAIAnalysisModalOpen] = useState(false);
    const [analyzedIncidents, setAnalyzedIncidents] = useState<any[]>([]);
    const [quickFilters, setQuickFilters] = useState({ new: false });
    const [advancedFilters, setAdvancedFilters] = useState({ timeRange: null, severity: [], status: [], resourceName: '' });
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const defaultVisibleColumns = { severity: true, summary: true, resource_name: true, business_impact: true, ruleName: false, triggerThreshold: false, status: true, assignee: true, created_at: true, action: true };
    const [visibleColumns, setVisibleColumns] = useLocalStorageState('sre-incident-columns', defaultVisibleColumns);
    const [isColumnSettingsOpen, setIsColumnSettingsOpen] = useState(false);

    const handleStatusChange = (keys: React.Key[], newStatus: string) => {
        setIncidents(incidents.map((inc: any) => (keys.includes(inc.key) ? { ...inc, status: newStatus } : inc)));
        message.success(`事件狀態已更新`);
        if (isDetailModalOpen) {
            setCurrentIncident((prev: any) => ({ ...prev, status: newStatus }));
        }
    };

    const handleBatchUpdate = (newStatus: string) => {
        const actionText = newStatus === 'acknowledged' ? '確認' : '解決';
        modal.confirm({
            title: `確定要批次 ${actionText} ${selectedRowKeys.length} 個事件嗎？`,
            icon: <ExclamationCircleOutlined />,
            onOk() {
                handleStatusChange(selectedRowKeys, newStatus);
                setSelectedRowKeys([]);
            }
        });
    };

    const handleAIAnalysis = (selectedKeys: React.Key[] | null = null) => {
        const keysToAnalyze = selectedKeys || selectedRowKeys;
        if (keysToAnalyze.length === 0) {
            message.warning('請先選擇要分析的事件');
            return;
        }
        const incidentsToAnalyze = incidents.filter((incident: any) => keysToAnalyze.includes(incident.key));
        setAnalyzedIncidents(incidentsToAnalyze);
        setIsAIAnalysisModalOpen(true);
    };

    const handleQuickFilter = (filterType: string) => {
        setQuickFilters((prev: any) => ({ ...prev, [filterType]: !prev[filterType] }));
    };

    const showDetailModal = (record: any) => {
        setCurrentIncident(record);
        setIsDetailModalOpen(true);
    };

    const columns = [
        { title: '嚴重性', dataIndex: 'severity', width: '8%', render: (s:string) => <Tag color={s === 'critical' ? 'red' : 'orange'}>{s}</Tag> },
        { title: '摘要', dataIndex: 'summary', width: '20%', render: (text: string, record: any) => <a onClick={() => showDetailModal(record)}>{text}</a> },
        { title: '資源名稱', dataIndex: 'resource_name', width: '14%'},
        { title: '狀態', dataIndex: 'status', width: '8%', render: (s:string) => <Tag>{s}</Tag>},
        { title: '處理人', dataIndex: 'assignee', width: '8%'},
        { title: '觸發時間', dataIndex: 'created_at', width: '10%', render: (t: any) => t.fromNow() },
        { title: '操作', key: 'action', width: '8%', render: (_: any, record: any) => <Space size="small"><Button type="text" icon={<InfoCircleOutlined />} onClick={() => showDetailModal(record)} /></Space> }
    ];

    const onSelectChange = (keys: React.Key[]) => setSelectedRowKeys(keys);
    const rowSelection = { selectedRowKeys, onChange: onSelectChange };
    const hasSelected = selectedRowKeys.length > 0;

    let filteredIncidents = incidents.filter((inc: any) => inc.summary.toLowerCase().includes(searchText.toLowerCase()));

    return (
        <>
            <Space style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                <Space>
                    <Input.Search placeholder="搜尋..." onChange={e => setSearchText(e.target.value)} style={{ width: 300 }}/>
                    <Popover content={<AdvancedIncidentFilter />} title="進階篩選" trigger="click">
                        <Button icon={<FilterOutlined />}>篩選</Button>
                    </Popover>
                    <Button onClick={() => handleQuickFilter('new')} type={quickFilters.new ? 'primary' : 'default'}>未確認</Button>
                </Space>
                <Space>
                    <Button icon={<DownloadOutlined />}>匯出</Button>
                    <Popover content={<div>Column Settings</div>} title="欄位設定" trigger="click">
                        <Button icon={<SettingOutlined />}>欄位設定</Button>
                    </Popover>
                    <Button type="primary" icon={<RobotOutlined />} onClick={() => handleAIAnalysis()}>AI 分析</Button>
                </Space>
            </Space>

            <div className="table-wrapper">
                <Table rowSelection={rowSelection} columns={columns} dataSource={filteredIncidents} rowKey="key" size="small" />
            </div>

            {hasSelected && (
                <div className="batch-actions-floating">
                    <div className="batch-info"><CheckCircleOutlined /><span>已選擇 {selectedRowKeys.length} 項</span></div>
                    <Space>
                        <Button onClick={() => handleBatchUpdate('acknowledged')}>批次確認</Button>
                        <Button onClick={() => handleBatchUpdate('resolved')}>批次解決</Button>
                    </Space>
                    <Button type="text" icon={<CloseOutlined />} onClick={() => setSelectedRowKeys([])} />
                </div>
            )}

            <Modal title="事件詳情" open={isDetailModalOpen} onCancel={() => setIsDetailModalOpen(false)} footer={null} width={800}>
                {/* Details will be fleshed out later */}
                {currentIncident && <pre>{JSON.stringify(currentIncident, null, 2)}</pre>}
            </Modal>

            <AIAnalysisModal open={isAIAnalysisModalOpen} onClose={() => setIsAIAnalysisModalOpen(false)} incidents={analyzedIncidents} onNavigate={onNavigate} />
        </>
    );
};

export default IncidentListPage;
