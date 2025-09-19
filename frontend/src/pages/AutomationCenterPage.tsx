import { useEffect, useMemo, useState } from 'react';
import {
  App as AntdApp,
  Alert,
  Button,
  Col,
  Form,
  Input,
  Row,
  Segmented,
  Space,
  Tabs,
  Tag,
  Tooltip,
  Typography,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type { TabsProps } from 'antd';
import {
  AppstoreAddOutlined,
  CheckCircleOutlined,
  CodeOutlined,
  HistoryOutlined,
  PlayCircleOutlined,
  PlusOutlined,
  RobotOutlined,
  ScheduleOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import durationPlugin from 'dayjs/plugin/duration';
import relativeTimePlugin from 'dayjs/plugin/relativeTime';
import { ContextualKPICard, DataTable, GlassModal, PageHeader, StatusBadge } from '../components';
import type { ContextualKPICardProps, KPIStatus } from '../components/ContextualKPICard';
import useAutomationCenter from '../hooks/useAutomationCenter';
import type {
  AutomationExecution,
  AutomationSchedule,
  AutomationScript,
} from '../types/automation';

const { Text, Paragraph } = Typography;

dayjs.extend(relativeTimePlugin);
dayjs.extend(durationPlugin);

type AutomationCenterPageProps = {
  onNavigate?: (key: string, params?: Record<string, unknown>) => void;
  pageKey?: string;
};

type ScriptFormValues = {
  name: string;
  category?: string;
  language?: string;
  description?: string;
};

const statusToneMap: Record<string, React.ComponentProps<typeof StatusBadge>['tone']> = {
  success: 'success',
  failed: 'danger',
  running: 'info',
  pending: 'info',
  cancelled: 'neutral',
};

const formatDuration = (value?: number) => {
  if (!value || Number.isNaN(value)) {
    return '—';
  }
  if (value < 1000) {
    return `${value} ms`;
  }
  const totalSeconds = value / 1000;
  if (totalSeconds < 60) {
    return `${totalSeconds.toFixed(totalSeconds < 10 ? 1 : 0)} 秒`;
  }
  const duration = dayjs.duration(value, 'milliseconds');
  const minutes = Math.floor(duration.asMinutes());
  const seconds = Math.round(duration.seconds());
  return `${minutes} 分 ${seconds} 秒`;
};

type AutomationKpiCard = {
  key: string;
} & Pick<ContextualKPICardProps, 'title' | 'value' | 'unit' | 'status' | 'description' | 'icon'>;

const AutomationCenterPage = ({ onNavigate, pageKey }: AutomationCenterPageProps) => {
  const { message } = AntdApp.useApp();
  const { scripts, schedules, executions, stats, loading, error, isFallback, scriptCategories, refresh } = useAutomationCenter();

  const [activeTab, setActiveTab] = useState<string>(pageKey ?? 'scripts');
  const [scriptCategoryFilter, setScriptCategoryFilter] = useState<string>('ALL');
  const [scriptSearch, setScriptSearch] = useState<string>('');
  const [scheduleFilter, setScheduleFilter] = useState<'ALL' | 'ENABLED' | 'DISABLED'>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'success' | 'failed' | 'running'>('ALL');
  const [scriptModalOpen, setScriptModalOpen] = useState(false);
  const [editingScript, setEditingScript] = useState<AutomationScript | null>(null);
  const [executionDetail, setExecutionDetail] = useState<AutomationExecution | null>(null);
  const [form] = Form.useForm<ScriptFormValues>();

  const [localScripts, setLocalScripts] = useState<AutomationScript[]>(scripts);
  const [localSchedules, setLocalSchedules] = useState<AutomationSchedule[]>(schedules);
  const [localExecutions, setLocalExecutions] = useState<AutomationExecution[]>(executions);

  useEffect(() => {
    setLocalScripts(scripts);
  }, [scripts]);

  useEffect(() => {
    setLocalSchedules(schedules);
  }, [schedules]);

  useEffect(() => {
    setLocalExecutions(executions);
  }, [executions]);

  const scriptMetricMap = useMemo(() => {
    const map = new Map<string, {
      total: number;
      success: number;
      lastRun?: string;
      lastStatus?: AutomationExecution['status'];
      lastDuration?: number;
    }>();
    localExecutions.forEach((run) => {
      if (!run.scriptId) return;
      if (!map.has(run.scriptId)) {
        map.set(run.scriptId, { total: 0, success: 0 });
      }
      const entry = map.get(run.scriptId)!;
      entry.total += 1;
      if (run.status === 'success') {
        entry.success += 1;
      }
      if (!entry.lastRun || (run.startedAt && entry.lastRun && dayjs(run.startedAt).isAfter(dayjs(entry.lastRun)))) {
        entry.lastRun = run.startedAt;
        entry.lastStatus = run.status;
        entry.lastDuration = run.durationMs;
      } else if (!entry.lastRun && run.startedAt) {
        entry.lastRun = run.startedAt;
        entry.lastStatus = run.status;
        entry.lastDuration = run.durationMs;
      }
    });
    return map;
  }, [localExecutions]);

  const scriptsWithMetrics = useMemo(() => localScripts.map((script) => {
    const metrics = scriptMetricMap.get(script.id);
    const successRate = metrics && metrics.total > 0
      ? Math.round((metrics.success / metrics.total) * 100)
      : script.successRate ?? null;
    return {
      ...script,
      computedSuccessRate: successRate,
      computedLastRun: metrics?.lastRun ?? script.lastExecutedAt,
      computedLastStatus: metrics?.lastStatus,
      computedLastDuration: metrics?.lastDuration,
    };
  }), [localScripts, scriptMetricMap]);

  const filteredScripts = useMemo(() => scriptsWithMetrics.filter((script) => {
    const matchCategory = scriptCategoryFilter === 'ALL' || script.category === scriptCategoryFilter;
    const text = `${script.name} ${script.description ?? ''} ${script.tags?.join(' ') ?? ''}`.toLowerCase();
    const matchSearch = !scriptSearch || text.includes(scriptSearch.toLowerCase());
    return matchCategory && matchSearch;
  }), [scriptCategoryFilter, scriptSearch, scriptsWithMetrics]);

  const scriptColumns: ColumnsType<typeof scriptsWithMetrics[number]> = [
    {
      title: '名稱',
      dataIndex: 'name',
      key: 'name',
      render: (_: unknown, record) => (
        <Space direction="vertical" size={6} style={{ width: '100%' }}>
          <Space size={8} wrap>
            <Text strong>{record.name}</Text>
            {record.category && <Tag>{record.category}</Tag>}
            <StatusBadge
              label={record.isEnabled === false ? '停用' : '啟用'}
              tone={record.isEnabled === false ? 'neutral' : 'success'}
            />
          </Space>
          {record.description && (
            <Text type="secondary" style={{ fontSize: 12 }}>
              {record.description}
            </Text>
          )}
          {record.tags && record.tags.length > 0 && (
            <Space size={[4, 4]} wrap>
              {record.tags.slice(0, 3).map((tag) => (
                <Tag key={tag}>{tag}</Tag>
              ))}
              {record.tags.length > 3 && <Tag>+{record.tags.length - 3}</Tag>}
            </Space>
          )}
        </Space>
      ),
    },
    {
      title: '語言',
      dataIndex: 'language',
      key: 'language',
      render: (value: string) => value ?? '—',
    },
    {
      title: '最近執行',
      dataIndex: 'computedLastRun',
      key: 'lastRun',
      render: (_: unknown, record) => (
        <Space direction="vertical" size={4}>
          <Text>{record.computedLastRun ? dayjs(record.computedLastRun).format('YYYY/MM/DD HH:mm') : '尚未執行'}</Text>
          {record.computedLastStatus && (
            <StatusBadge
              label={record.computedLastStatus === 'success' ? '成功' : record.computedLastStatus === 'failed' ? '失敗' : '執行中'}
              tone={statusToneMap[record.computedLastStatus] ?? 'info'}
              bordered
            />
          )}
        </Space>
      ),
    },
    {
      title: '成功率',
      dataIndex: 'computedSuccessRate',
      key: 'successRate',
      render: (value: number | null) => (value ?? 0) + '%',
    },
    {
      title: '執行次數',
      dataIndex: 'executionCount',
      key: 'executionCount',
      render: (value?: number) => value ?? 0,
    },
    {
      title: '操作',
      key: 'actions',
      width: 260,
      render: (_: unknown, record) => (
        <Space size={4} wrap>
          <Button type="link" icon={<PlayCircleOutlined />} onClick={() => handleExecuteScript(record)}>
            執行
          </Button>
          <Button type="link" icon={<SettingOutlined />} onClick={() => openScriptModal(record)}>
            編輯
          </Button>
          <Tooltip title="切換啟用狀態 (模擬)">
            <Button type="link" onClick={() => handleToggleScript(record)}>
              {record.isEnabled === false ? '啟用' : '停用'}
            </Button>
          </Tooltip>
        </Space>
      ),
    },
  ];

  const scriptTable = (
    <DataTable<typeof scriptsWithMetrics[number]>
      rowKey={(record) => record.id}
      dataSource={filteredScripts}
      columns={scriptColumns}
      loading={loading}
      titleContent={
        <Space wrap>
          <Segmented
            value={scriptCategoryFilter}
            onChange={(value) => setScriptCategoryFilter(value as string)}
            options={[{ label: '全部', value: 'ALL' }, ...scriptCategories.map((category) => ({ label: category, value: category }))]}
          />
          <Input.Search
            allowClear
            placeholder="搜尋腳本名稱或描述"
            onSearch={(value) => setScriptSearch(value)}
            style={{ minWidth: 220 }}
          />
        </Space>
      }
    />
  );

  const scriptMap = useMemo(() => {
    const map = new Map<string, AutomationScript>();
    localScripts.forEach((script) => map.set(script.id, script));
    return map;
  }, [localScripts]);

  const filteredSchedules = useMemo(() => localSchedules.filter((schedule) => {
    const enabledMatch = scheduleFilter === 'ALL'
      || (scheduleFilter === 'ENABLED' && schedule.isEnabled !== false)
      || (scheduleFilter === 'DISABLED' && schedule.isEnabled === false);
    return enabledMatch;
  }), [localSchedules, scheduleFilter]);

  const scheduleColumns: ColumnsType<AutomationSchedule & { scriptNameResolved?: string }> = [
    {
      title: '名稱',
      dataIndex: 'name',
      key: 'name',
      render: (_: unknown, record) => (
        <Space direction="vertical" size={4}>
          <Text strong>{record.name}</Text>
          <Text type="secondary" style={{ fontSize: 12 }}>
            腳本：{record.scriptNameResolved ?? record.scriptName ?? '未知腳本'}
          </Text>
        </Space>
      ),
    },
    {
      title: 'Cron 表達式',
      dataIndex: 'cronExpression',
      key: 'cronExpression',
      render: (value: string) => <code>{value}</code>,
    },
    {
      title: '模式',
      dataIndex: 'mode',
      key: 'mode',
      render: (value) => (
        <Tag color={value === 'simple' ? 'cyan' : 'purple'}>
          {value === 'simple' ? '簡易模式' : '進階模式'}
        </Tag>
      ),
    },
    {
      title: '最近執行',
      dataIndex: 'lastRunAt',
      key: 'lastRunAt',
      render: (value?: string) => (value ? dayjs(value).format('YYYY/MM/DD HH:mm') : '尚未執行'),
    },
    {
      title: '狀態',
      dataIndex: 'lastStatus',
      key: 'lastStatus',
      render: (value?: string) => (
        <StatusBadge
          label={value ? (value === 'success' ? '成功' : value === 'failed' ? '失敗' : '執行中') : '未知'}
          tone={value ? statusToneMap[value] ?? 'neutral' : 'neutral'}
        />
      ),
    },
    {
      title: '操作',
      key: 'actions',
      width: 220,
      render: (_: unknown, record) => (
        <Space size={4} wrap>
          <Button type="link" onClick={() => handleRunScheduleNow(record)}>
            立即執行
          </Button>
          <Tooltip title="切換排程狀態 (模擬)">
            <Button type="link" onClick={() => handleToggleSchedule(record)}>
              {record.isEnabled === false ? '啟用' : '停用'}
            </Button>
          </Tooltip>
        </Space>
      ),
    },
  ];

  const scheduleTable = (
    <DataTable<AutomationSchedule & { scriptNameResolved?: string }>
      rowKey={(record) => record.id}
      dataSource={filteredSchedules.map((schedule) => ({
        ...schedule,
        scriptNameResolved: scriptMap.get(schedule.scriptId)?.name,
      }))}
      columns={scheduleColumns}
      loading={loading}
      titleContent={
        <Space wrap>
          <Segmented
            value={scheduleFilter}
            onChange={(value) => setScheduleFilter(value as typeof scheduleFilter)}
            options={[
              { label: '全部', value: 'ALL' },
              { label: '啟用中', value: 'ENABLED' },
              { label: '停用', value: 'DISABLED' },
            ]}
          />
          <Button icon={<PlusOutlined />} onClick={() => openScriptModal(null)}>
            新建排程
          </Button>
        </Space>
      }
    />
  );

  const filteredExecutions = useMemo(() => localExecutions.filter((execution) => {
    if (statusFilter === 'ALL') return true;
    return execution.status === statusFilter;
  }), [localExecutions, statusFilter]);

  const executionColumns: ColumnsType<AutomationExecution & { scriptNameResolved?: string }> = [
    {
      title: '腳本',
      dataIndex: 'scriptNameResolved',
      key: 'scriptNameResolved',
      render: (_: unknown, record) => record.scriptNameResolved ?? record.scriptName ?? '未知腳本',
    },
    {
      title: '觸發方式',
      dataIndex: 'triggerType',
      key: 'triggerType',
      render: (value: string) => value,
    },
    {
      title: '開始時間',
      dataIndex: 'startedAt',
      key: 'startedAt',
      render: (value?: string) => (value ? dayjs(value).format('YYYY/MM/DD HH:mm:ss') : '—'),
    },
    {
      title: '耗時',
      dataIndex: 'durationMs',
      key: 'durationMs',
      render: (value?: number) => formatDuration(value),
    },
    {
      title: '狀態',
      dataIndex: 'status',
      key: 'status',
      render: (value: string) => (
        <StatusBadge
          label={value === 'success' ? '成功' : value === 'failed' ? '失敗' : value === 'running' ? '執行中' : '已取消'}
          tone={statusToneMap[value] ?? 'neutral'}
        />
      ),
    },
    {
      title: '操作',
      key: 'actions',
      width: 160,
      render: (_: unknown, record) => (
        <Button type="link" onClick={() => setExecutionDetail(record)}>
          檢視
        </Button>
      ),
    },
  ];

  const executionTable = (
    <DataTable<AutomationExecution & { scriptNameResolved?: string }>
      rowKey={(record) => record.id}
      dataSource={filteredExecutions.map((execution) => ({
        ...execution,
        scriptNameResolved: scriptMap.get(execution.scriptId)?.name,
      }))}
      columns={executionColumns}
      loading={loading}
      titleContent={
        <Space wrap>
          <Segmented
            value={statusFilter}
            onChange={(value) => setStatusFilter(value as typeof statusFilter)}
            options={[
              { label: '全部', value: 'ALL' },
              { label: '成功', value: 'success' },
              { label: '失敗', value: 'failed' },
              { label: '執行中', value: 'running' },
            ]}
          />
          <Tooltip title="重新整理">
            <Button icon={<HistoryOutlined />} onClick={refresh} disabled={loading} />
          </Tooltip>
        </Space>
      }
    />
  );

  const tabs: TabsProps['items'] = [
    {
      key: 'scripts',
      label: (
        <span>
          <CodeOutlined /> 腳本庫
        </span>
      ),
      children: scriptTable,
    },
    {
      key: 'schedules',
      label: (
        <span>
          <ScheduleOutlined /> 排程管理
        </span>
      ),
      children: scheduleTable,
    },
    {
      key: 'executions',
      label: (
        <span>
          <HistoryOutlined /> 執行日誌
        </span>
      ),
      children: executionTable,
    },
  ];

  const openScriptModal = (script: AutomationScript | null) => {
    setEditingScript(script);
    setScriptModalOpen(true);
    form.setFieldsValue({
      name: script?.name ?? '',
      category: script?.category ?? '',
      language: script?.language ?? '',
      description: script?.description ?? '',
    });
  };

  const handleScriptModalOk = async () => {
    try {
      const values = await form.validateFields();
      if (editingScript) {
        setLocalScripts((prev) => prev.map((script) => (script.id === editingScript.id ? { ...script, ...values } : script)));
        message.success(`已更新腳本「${values.name}」(模擬)`);
      } else {
        const newScript: AutomationScript = {
          id: `script_${Date.now()}`,
          name: values.name,
          category: values.category,
          language: values.language ?? 'Python',
          description: values.description,
          owner: '模擬使用者',
          executionCount: 0,
          isEnabled: true,
          createdAt: new Date().toISOString(),
        };
        setLocalScripts((prev) => [newScript, ...prev]);
        message.success(`已建立腳本「${values.name}」(模擬)`);
      }
      setScriptModalOpen(false);
    } catch (err) {
      if ((err as { errorFields?: unknown }).errorFields) {
        return;
      }
      message.error('保存腳本時發生錯誤');
    }
  };

  const handleExecuteScript = (script: AutomationScript) => {
    const run: AutomationExecution = {
      id: `run_${Date.now()}`,
      scriptId: script.id,
      scriptName: script.name,
      status: 'running',
      triggerType: 'manual',
      startedAt: new Date().toISOString(),
      operator: '模擬使用者',
    };
    setLocalExecutions((prev) => [run, ...prev]);
    message.success(`已觸發腳本「${script.name}」執行 (模擬)`);
  };

  const handleToggleScript = (script: AutomationScript) => {
    setLocalScripts((prev) => prev.map((item) => (item.id === script.id ? { ...item, isEnabled: !(item.isEnabled !== false) } : item)));
    message.info(`腳本「${script.name}」已${script.isEnabled === false ? '啟用' : '停用'} (模擬)`);
  };

  const handleRunScheduleNow = (schedule: AutomationSchedule) => {
    const linkedScript = scriptMap.get(schedule.scriptId);
    const run: AutomationExecution = {
      id: `run_${Date.now()}`,
      scriptId: schedule.scriptId,
      scriptName: linkedScript?.name ?? schedule.scriptName ?? '未知腳本',
      status: 'running',
      triggerType: 'schedule',
      startedAt: new Date().toISOString(),
    };
    setLocalExecutions((prev) => [run, ...prev]);
    message.success(`已排入排程「${schedule.name}」的立即執行 (模擬)`);
  };

  const handleToggleSchedule = (schedule: AutomationSchedule) => {
    setLocalSchedules((prev) => prev.map((item) => (item.id === schedule.id ? { ...item, isEnabled: !(item.isEnabled !== false) } : item)));
    message.info(`排程「${schedule.name}」已${schedule.isEnabled === false ? '啟用' : '停用'} (模擬)`);
  };

  const kpiCards = useMemo<AutomationKpiCard[]>(() => {
    const scheduleTone: KPIStatus = stats.scheduledJobs > 0 ? 'success' : 'warning';
    const successTone: KPIStatus = stats.successRate24h >= 80
      ? 'success'
      : stats.successRate24h >= 60
        ? 'warning'
        : 'danger';
    return [
      {
        key: 'totalScripts',
        title: '腳本總數',
        value: stats.totalScripts,
        unit: '個',
        status: 'info',
        description: `${stats.activeScripts} 個啟用中`,
        icon: <CodeOutlined style={{ fontSize: 28, color: '#1890ff' }} />,
      },
      {
        key: 'schedules',
        title: '排程任務',
        value: stats.scheduledJobs,
        unit: '個',
        status: scheduleTone,
        description: '持續監控排程健康度',
        icon: <ScheduleOutlined style={{ fontSize: 28, color: '#52c41a' }} />,
      },
      {
        key: 'successRate',
        title: '24H 成功率',
        value: stats.successRate24h,
        unit: '%',
        status: successTone,
        description: '近 24 小時自動化成功率',
        icon: <CheckCircleOutlined style={{ fontSize: 28, color: '#faad14' }} />,
      },
      {
        key: 'savedHours',
        title: '節省人力',
        value: stats.savedEngineerHours,
        unit: '小時',
        status: 'info',
        description: '估計節省的值班處理時間',
        icon: <RobotOutlined style={{ fontSize: 28, color: '#9254de' }} />,
      },
    ];
  }, [stats]);

  const handleTabChange = (key: string) => {
    setActiveTab(key);
    onNavigate?.(key);
  };

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <PageHeader
        title="自動化中心"
        subtitle="管理腳本、排程任務與執行結果"
        description="透過腳本庫與排程管理，建立可追蹤的自動化營運流程。"
        extra={
          <Space>
            <Tooltip title="重新整理自動化資料">
              <Button icon={<HistoryOutlined />} onClick={refresh} disabled={loading} />
            </Tooltip>
            <Button type="primary" icon={<AppstoreAddOutlined />} onClick={() => openScriptModal(null)}>
              建立腳本
            </Button>
          </Space>
        }
      />

      {isFallback && (
        <Alert
          type="info"
          showIcon
          message="目前顯示為內建模擬資料"
          description="尚未連接 /scripts 等 API，以下內容為示範資料。"
        />
      )}

      {error && !isFallback && (
        <Alert
          type="error"
          showIcon
          message="載入自動化資料失敗"
          description={error instanceof Error ? error.message : '請稍後再試'}
        />
      )}

      <Row gutter={[16, 16]}>
        {kpiCards.map((card) => (
          <Col key={card.key} xs={24} sm={12} xl={6}>
            <ContextualKPICard {...card} loading={loading} />
          </Col>
        ))}
      </Row>

      <Tabs
        activeKey={activeTab}
        onChange={handleTabChange}
        items={tabs}
      />

      <GlassModal
        open={scriptModalOpen}
        title={editingScript ? `編輯腳本：${editingScript.name}` : '新增腳本 (模擬)'}
        onCancel={() => setScriptModalOpen(false)}
        onOk={handleScriptModalOk}
        okText="保存"
        cancelText="取消"
      >
        <Alert
          type="info"
          showIcon
          message="此為示範表單"
          description="實際腳本建立需整合 /scripts API 與版本控制。"
          style={{ marginBottom: 16 }}
        />
        <Form form={form} layout="vertical">
          <Form.Item
            label="腳本名稱"
            name="name"
            rules={[{ required: true, message: '請輸入腳本名稱' }]}
          >
            <Input placeholder="輸入腳本名稱" />
          </Form.Item>
          <Form.Item label="分類" name="category">
            <Input placeholder="例如：deployment、incident-response" />
          </Form.Item>
          <Form.Item label="腳本語言" name="language">
            <Input placeholder="Python / Bash / Go" />
          </Form.Item>
          <Form.Item label="描述" name="description">
            <Input.TextArea rows={4} placeholder="說明腳本用途與注意事項" />
          </Form.Item>
        </Form>
      </GlassModal>

      <GlassModal
        open={Boolean(executionDetail)}
        title={executionDetail ? `執行詳情 #${executionDetail.id}` : '執行詳情'}
        footer={null}
        onCancel={() => setExecutionDetail(null)}
      >
        {executionDetail ? (
          <Space direction="vertical" size={12} style={{ width: '100%' }}>
            <Paragraph>
              <Text strong>腳本：</Text> {executionDetail.scriptName ?? executionDetail.scriptId}
            </Paragraph>
            <Paragraph>
              <Text strong>狀態：</Text>
              <StatusBadge
                label={executionDetail.status === 'success' ? '成功' : executionDetail.status === 'failed' ? '失敗' : executionDetail.status === 'running' ? '執行中' : '已取消'}
                tone={statusToneMap[executionDetail.status] ?? 'neutral'}
              />
            </Paragraph>
            <Paragraph>
              <Text strong>觸發方式：</Text> {executionDetail.triggerType}
            </Paragraph>
            <Paragraph>
              <Text strong>開始時間：</Text> {executionDetail.startedAt ? dayjs(executionDetail.startedAt).format('YYYY/MM/DD HH:mm:ss') : '—'}
            </Paragraph>
            <Paragraph>
              <Text strong>結束時間：</Text> {executionDetail.finishedAt ? dayjs(executionDetail.finishedAt).format('YYYY/MM/DD HH:mm:ss') : '—'}
            </Paragraph>
            <Paragraph>
              <Text strong>耗時：</Text> {formatDuration(executionDetail.durationMs)}
            </Paragraph>
            <Paragraph>
              <Text strong>輸出：</Text>
              <br />
              <code style={{ whiteSpace: 'pre-wrap' }}>{executionDetail.output ?? '尚未提供輸出 (模擬)'}</code>
            </Paragraph>
          </Space>
        ) : null}
      </GlassModal>
    </Space>
  );
};

export default AutomationCenterPage;
