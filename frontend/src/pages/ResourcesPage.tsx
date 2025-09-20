import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ApartmentOutlined,
  BranchesOutlined,
  ExclamationCircleOutlined,
  HddOutlined,
  PlusOutlined,
  ReloadOutlined,
  SearchOutlined,
  ShareAltOutlined,
  SafetyCertificateOutlined,
  TeamOutlined,
  ThunderboltOutlined,
} from '@ant-design/icons';
import {
  App as AntdApp,
  Alert,
  Button,
  Col,
  Descriptions,
  Divider,
  Dropdown,
  Empty,
  Form,
  Input,
  Modal,
  Progress,
  Row,
  Select,
  Space,
  Spin,
  Tabs,
  Tag,
  Tooltip,
  Typography,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type { MenuProps } from 'antd';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import * as echarts from 'echarts';
import type { EChartsOption } from 'echarts';
import { ContextualKPICard, DataTable, PageHeader, StatusBadge, type StatusTone } from '../components';
import SmartFilterBuilder from '../components/SmartFilterBuilder';
import useBackgroundJobs from '../hooks/useBackgroundJobs';
import useResources from '../hooks/useResources';
import useResourceGroups from '../hooks/useResourceGroups';
import useResourceStatistics from '../hooks/useResourceStatistics';
import useResourceTopology from '../hooks/useResourceTopology';
import type { BackgroundJob } from '../types/backgroundJobs';
import type {
  PaginationMeta,
  Resource,
  ResourceAction,
  ResourceGroup,
  ResourceGroupWithInsights,
  ResourceQueryParams,
  ResourceStatus,
  ResourceTopologyGraph,
  TagFilter,
} from '../types/resources';
import { enrichResourceGroups } from '../utils/resourceTransforms';

dayjs.extend(relativeTime);

export type ResourcesPageProps = {
  onNavigate: (key: string, params?: Record<string, unknown>) => void;
  pageKey: string;
  themeMode?: 'light' | 'dark';
};

const { Text, Title } = Typography;
const { Search } = Input;

const STATUS_OPTIONS: Array<{ label: string; value: ResourceStatus | 'ALL' }> = [
  { label: '全部狀態', value: 'ALL' },
  { label: '健康', value: 'HEALTHY' },
  { label: '警告', value: 'WARNING' },
  { label: '危急', value: 'CRITICAL' },
  { label: '維護', value: 'MAINTENANCE' },
  { label: '已靜音', value: 'SILENCED' },
  { label: '未知', value: 'UNKNOWN' },
];

const RESOURCE_TYPE_OPTIONS = ['application', 'service', 'database', 'cache', 'queue', 'infrastructure'];
const ENVIRONMENT_OPTIONS = ['production', 'staging', 'testing', 'development'];

const statusToneMap: Record<ResourceStatus, StatusTone> = {
  HEALTHY: 'success',
  WARNING: 'warning',
  CRITICAL: 'danger',
  SILENCED: 'info',
  MAINTENANCE: 'neutral',
  UNKNOWN: 'neutral',
};

const statusLabelMap: Record<ResourceStatus, string> = {
  HEALTHY: '健康',
  WARNING: '警告',
  CRITICAL: '危急',
  SILENCED: '已靜音',
  MAINTENANCE: '維護中',
  UNKNOWN: '未知',
};

const severityColorMap: Record<string, string> = {
  CRITICAL: 'volcano',
  WARNING: 'gold',
  ERROR: 'red',
  INFO: 'blue',
  DEFAULT: 'blue',
};

const jobStatusToneMap: Record<string, StatusTone> = {
  healthy: 'success',
  warning: 'warning',
  critical: 'danger',
  paused: 'neutral',
};

const jobStatusLabelMap: Record<string, string> = {
  healthy: '健康',
  warning: '警告',
  critical: '危急',
  paused: '暫停',
};

const formatDurationShort = (value?: number | null) => {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    return '—';
  }
  if (value < 1000) {
    return `${value} ms`;
  }
  if (value < 60_000) {
    const seconds = value / 1000;
    return `${seconds.toFixed(seconds < 10 ? 1 : 0)} 秒`;
  }
  const minutes = Math.floor(value / 60_000);
  const seconds = Math.round((value % 60_000) / 1000);
  return `${minutes} 分 ${seconds.toString().padStart(2, '0')} 秒`;
};

const formatRelativeTime = (value?: string | null) => {
  if (!value) {
    return '—';
  }
  const parsed = dayjs(value);
  if (!parsed.isValid()) {
    return value;
  }
  return `${parsed.fromNow()} · ${parsed.format('YYYY/MM/DD HH:mm:ss')}`;
};

type MiniTrendChartProps = {
  cpuSeries?: number[];
  memorySeries?: number[];
};

const MiniTrendChart = ({ cpuSeries, memorySeries }: MiniTrendChartProps) => {
  const cpu = Array.isArray(cpuSeries) ? cpuSeries : [];
  const memory = Array.isArray(memorySeries) ? memorySeries : [];
  const pointCount = Math.max(cpu.length, memory.length);

  if (pointCount < 2) {
    return null;
  }

  const clampValue = (value: number) => Math.max(0, Math.min(100, value));
  const buildPoints = (series: number[]) => series
    .map((value, index) => {
      const x = pointCount > 1 ? (index / (pointCount - 1)) * 100 : 0;
      const y = 100 - clampValue(value);
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <Space direction="vertical" size={2} style={{ width: '100%' }}>
      <svg width="100%" height="36" viewBox="0 0 100 100" preserveAspectRatio="none">
        {memory.length > 1 && (
          <polyline
            points={buildPoints(memory)}
            fill="none"
            stroke="#722ed1"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}
        {cpu.length > 1 && (
          <polyline
            points={buildPoints(cpu)}
            fill="none"
            stroke="#40a9ff"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}
      </svg>
      <Space size={8} style={{ fontSize: 11 }}>
        {cpu.length > 1 && <span style={{ color: '#40a9ff' }}>CPU</span>}
        {memory.length > 1 && <span style={{ color: '#722ed1' }}>記憶體</span>}
      </Space>
    </Space>
  );
};

type BackgroundJobsPanelProps = {
  jobs: BackgroundJob[];
  loading: boolean;
  error: unknown;
  isFallback: boolean;
  summary: {
    total: number;
    healthy: number;
    warning: number;
    critical: number;
  };
  onRefresh: () => void;
};

const BackgroundJobsPanel = ({ jobs, loading, error, isFallback, summary, onRefresh }: BackgroundJobsPanelProps) => {
  const unhealthyJobs = useMemo(
    () => jobs.filter((job) => job.status === 'warning' || job.status === 'critical'),
    [jobs],
  );

  const jobColumns = useMemo<ColumnsType<BackgroundJob>>(() => [
    {
      title: '狀態',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (value: BackgroundJob['status']) => (
        <StatusBadge
          label={jobStatusLabelMap[value ?? 'healthy'] ?? value ?? '健康'}
          tone={jobStatusToneMap[value ?? 'healthy'] ?? 'neutral'}
        />
      ),
    },
    {
      title: '作業',
      dataIndex: 'name',
      key: 'name',
      render: (_: unknown, record: BackgroundJob) => (
        <Space direction="vertical" size={4} style={{ width: '100%' }}>
          <Text strong>{record.name}</Text>
          {record.description && (
            <Text type="secondary" style={{ fontSize: 12 }}>
              {record.description}
            </Text>
          )}
          <Space size={4} wrap>
            {record.owner_team && <Tag color="blue">Owner {record.owner_team}</Tag>}
            {(record.tags ?? []).slice(0, 3).map((tag) => (
              <Tag key={`${record.id}-${tag}`}>{tag}</Tag>
            ))}
            {record.tags && record.tags.length > 3 && <Tag>+{record.tags.length - 3}</Tag>}
          </Space>
          {record.metrics && (
            <Text type="secondary" style={{ fontSize: 12 }}>
              {record.metrics.processedResources !== undefined && (
                <span>
                  處理資源 {record.metrics.processedResources}
                  {' · '}
                </span>
              )}
              {record.metrics.healthy !== undefined && record.metrics.warning !== undefined && record.metrics.critical !== undefined && (
                <span>
                  健康 {record.metrics.healthy} / 警告 {record.metrics.warning} / 危急 {record.metrics.critical}
                  {' · '}
                </span>
              )}
              {record.metrics.unhealthyChannels !== undefined && (
                <span>
                  通道異常 {record.metrics.unhealthyChannels}
                  {' · '}
                </span>
              )}
              {record.metrics.checkedAt && <span>檢查時間 {dayjs(record.metrics.checkedAt).format('HH:mm:ss')}</span>}
            </Text>
          )}
        </Space>
      ),
    },
    {
      title: '排程',
      key: 'schedule',
      width: 160,
      render: (_: unknown, record: BackgroundJob) => (
        <Space direction="vertical" size={2}>
          <Text>
            {record.interval_minutes ? `每 ${record.interval_minutes} 分鐘` : '—'}
          </Text>
          {record.timezone && (
            <Text type="secondary" style={{ fontSize: 12 }}>
              {record.timezone}
            </Text>
          )}
        </Space>
      ),
    },
    {
      title: '上次執行',
      key: 'lastRun',
      width: 220,
      render: (_: unknown, record: BackgroundJob) => (
        <Space direction="vertical" size={2}>
          <Text>{formatRelativeTime(record.last_run_at)}</Text>
          <Text type="secondary" style={{ fontSize: 12 }}>
            耗時 {formatDurationShort(record.last_duration_ms)}
          </Text>
        </Space>
      ),
    },
    {
      title: '下次排程',
      dataIndex: 'next_run_at',
      key: 'nextRun',
      width: 220,
      render: (value: BackgroundJob['next_run_at']) => formatRelativeTime(value),
    },
    {
      title: '最近訊息',
      dataIndex: 'last_message',
      key: 'lastMessage',
      render: (value: string | undefined) => (
        <Tooltip title={value}>
          <Text ellipsis style={{ maxWidth: 320 }}>
            {value ?? '—'}
          </Text>
        </Tooltip>
      ),
    },
  ], [jobs]);

  return (
    <Space direction="vertical" size={16} style={{ width: '100%' }}>
      <Space align="center" style={{ width: '100%', display: 'flex', justifyContent: 'space-between' }}>
        <Title level={4} style={{ margin: 0 }}>背景作業狀態</Title>
        <Space size={8} wrap>
          <Tag color="blue">總數 {summary.total}</Tag>
          <Tag color="green">健康 {summary.healthy}</Tag>
          <Tag color="gold">警告 {summary.warning}</Tag>
          <Tag color="red">危急 {summary.critical}</Tag>
          <Tooltip title="重新整理背景作業狀態">
            <Button icon={<ReloadOutlined />} onClick={onRefresh} />
          </Tooltip>
        </Space>
      </Space>

      {unhealthyJobs.length > 0 && (
        <Alert
          type="warning"
          showIcon
          message={`有 ${unhealthyJobs.length} 個背景作業需要關注`}
          description={unhealthyJobs.map((job) => job.name).join('、')}
        />
      )}

      {isFallback && (
        <Alert
          type="info"
          showIcon
          message="目前顯示為離線模擬的背景作業資料"
        />
      )}

      {Boolean(error) && !loading && (
        <Alert
          type="error"
          showIcon
          message="無法載入背景作業資料"
          description={error instanceof Error ? error.message : '請稍後再試'}
        />
      )}

      <DataTable<BackgroundJob>
        dataSource={jobs}
        columns={jobColumns}
        rowKey={(record) => record.id}
        loading={loading}
        pagination={{ pageSize: 5, showSizeChanger: false }}
        titleContent={<span style={{ fontWeight: 600 }}>排程作業列表</span>}
      />
    </Space>
  );
};

type ResourceOverviewTabProps = {
  resources: Resource[];
  pagination: PaginationMeta;
  loading: boolean;
  error: unknown;
  query: ResourceQueryParams;
  onQueryChange: (patch: Partial<ResourceQueryParams>) => void;
  onNavigate: ResourcesPageProps['onNavigate'];
  onRefresh: () => void;
  resourceGroups: ResourceGroup[];
  isFallback: boolean;
  tagFilters: TagFilter[];
};

type ResourceFormValues = {
  name: string;
  type: string;
  status: ResourceStatus;
  ipAddress?: string;
  location?: string;
  environment?: string;
  groups?: string[];
  tags?: string[];
};

const formatPercent = (value?: number) => (typeof value === 'number' ? `${Math.round(value)}%` : 'N/A');

const buildGroupOptions = (groups: ResourceGroup[]) =>
  groups.map((group) => ({ label: group.name, value: group.id }));

const buildTagOptions = (resources: Resource[]) => {
  const counts = new Map<string, number>();
  resources.forEach((resource) => {
    resource.tags.forEach((tag) => {
      const key = `${tag.key}:${tag.value}`;
      counts.set(key, (counts.get(key) ?? 0) + 1);
    });
  });
  return Array.from(counts.entries()).map(([value, count]) => ({
    label: `${value} (${count})`,
    value,
  }));
};

const getProgressStatus = (value?: number) => {
  if (typeof value !== 'number') return 'normal';
  if (value >= 90) return 'exception';
  if (value >= 75) return 'active';
  return 'normal';
};

const ResourceOverviewTab = ({
  resources,
  pagination,
  loading,
  error,
  query,
  onQueryChange,
  onNavigate,
  onRefresh,
  resourceGroups,
  isFallback,
  tagFilters,
}: ResourceOverviewTabProps) => {
  const { message } = AntdApp.useApp();
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [detailResource, setDetailResource] = useState<Resource | null>(null);
  const [editResource, setEditResource] = useState<Resource | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [scanOpen, setScanOpen] = useState(false);
  const [scanValue, setScanValue] = useState('');
  const [form] = Form.useForm<ResourceFormValues>();
  const [searchValue, setSearchValue] = useState(query.search ?? '');

  useEffect(() => {
    setSearchValue(query.search ?? '');
  }, [query.search]);

  const groupDictionary = useMemo(
    () => new Map(resourceGroups.map((group) => [group.id, group.name])),
    [resourceGroups],
  );

  const tagOptions = useMemo(() => buildTagOptions(resources), [resources]);
  const groupOptions = useMemo(() => buildGroupOptions(resourceGroups), [resourceGroups]);

  const tablePagination = useMemo(() => ({
    current: pagination.page,
    pageSize: pagination.page_size,
    total: pagination.total,
    showSizeChanger: false,
  }), [pagination]);

  const handleOpenDetail = useCallback((resource: Resource) => {
    setDetailResource(resource);
    setDetailOpen(true);
  }, []);

  const handleOpenEdit = useCallback((resource: Resource | null) => {
    const target = resource ?? null;
    setEditResource(target);
    setEditOpen(true);
    form.setFieldsValue({
      name: target?.name ?? '',
      type: target?.type ?? RESOURCE_TYPE_OPTIONS[0],
      status: target?.status ?? 'HEALTHY',
      ipAddress: target?.ipAddress ?? '',
      location: target?.location ?? '',
      environment: target?.environment ?? '',
      groups: target?.groups ?? [],
      tags: target?.tags.map((tag) => `${tag.key}:${tag.value}`) ?? [],
    });
  }, [form]);

  const handleApplyTag = useCallback((tagValue: string) => {
    const normalized = tagValue.trim();
    if (!normalized) {
      return;
    }
    onQueryChange({ page: 1, tags: [normalized] });
  }, [onQueryChange]);

  const runResourceAction = useCallback((action: ResourceAction, resource: Resource) => {
    const label = action.label || action.key;
    if (action.type === 'link' && action.url) {
      if (typeof window !== 'undefined') {
        window.open(action.url, '_blank', 'noopener,noreferrer');
      }
      return;
    }
    if (action.type === 'navigate' && action.target) {
      onNavigate(action.target, { resourceId: resource.id, resourceName: resource.name });
      return;
    }
    const messageText = action.description ? `${action.description} (模擬)` : `已模擬執行「${label}」`;
    message.success(messageText);
  }, [message, onNavigate]);

  const handleBulkAction = useCallback<NonNullable<MenuProps['onClick']>>((info) => {
    const { key } = info;
    if (!selectedRowKeys.length) {
      message.warning('請先選擇要操作的資源');
      return;
    }
    switch (key) {
      case 'assign-team':
        message.success(`已模擬指派 ${selectedRowKeys.length} 個資源給指定團隊`);
        break;
      case 'add-tag':
        message.success(`已模擬為 ${selectedRowKeys.length} 個資源加上標籤`);
        break;
      case 'trigger-automation':
        message.success(`已模擬觸發 ${selectedRowKeys.length} 個資源的修復自動化流程`);
        break;
      default:
        message.info('操作已記錄 (模擬)');
    }
    setSelectedRowKeys([]);
  }, [message, selectedRowKeys.length]);

  const bulkActionMenu: MenuProps = {
    items: [
      { key: 'assign-team', label: '指派責任團隊' },
      { key: 'add-tag', label: '批次標籤管理' },
      { key: 'trigger-automation', label: '觸發修復自動化' },
    ],
    onClick: handleBulkAction,
  };

  const columns: ColumnsType<Resource> = useMemo(() => [
    {
      title: '狀態',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (_: ResourceStatus, resource: Resource) => {
        const tooltipText = resource.healthReasons?.length
          ? `${resource.healthReasons.slice(0, 2).join('；')}${resource.healthReasons.length > 2 ? '…' : ''}`
          : resource.healthSummary ?? statusLabelMap[resource.status] ?? resource.status;
        return (
          <Tooltip title={tooltipText}>
            <StatusBadge
              label={statusLabelMap[resource.status] ?? resource.status}
              tone={statusToneMap[resource.status] ?? 'neutral'}
            />
          </Tooltip>
        );
      },
    },
    {
      title: '資源',
      key: 'name',
      render: (_: unknown, resource: Resource) => (
          <Space direction="vertical" size={4} style={{ minWidth: 200 }}>
            <Button type="link" onClick={() => handleOpenDetail(resource)} style={{ padding: 0 }}>
              {resource.name}
            </Button>
            <Space size={4} wrap>
              <Tag color="blue">{resource.type}</Tag>
              {resource.tags.slice(0, 3).map((tag) => {
                const value = `${tag.key}:${tag.value}`;
                return (
                  <Tooltip title={`套用標籤篩選：${value}`} key={`${resource.id}-${value}`}>
                    <Tag
                      color="geekblue"
                      onClick={() => handleApplyTag(value)}
                      style={{ cursor: 'pointer' }}
                    >
                      {value}
                    </Tag>
                  </Tooltip>
                );
              })}
              {resource.tags.length > 3 && (
                <Tag color="geekblue">+{resource.tags.length - 3}</Tag>
              )}
            </Space>
          </Space>
      ),
    },
    {
      title: '位置 / 環境',
      key: 'location',
      width: 200,
      render: (_: unknown, resource: Resource) => (
        <Space direction="vertical" size={2}>
          <Text>{resource.location ?? '未設定'}</Text>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {resource.environment ?? '未定義'}
            {resource.teamId ? ` • 所屬團隊 ${resource.teamId}` : ''}
          </Text>
        </Space>
      ),
    },
    {
      title: '群組',
      dataIndex: 'groups',
      key: 'groups',
      width: 220,
      render: (groups: string[]) => (
        <Space size={4} wrap>
          {groups.length === 0 && <Text type="secondary">未分組</Text>}
          {groups.map((groupId) => (
            <Tag color="purple" key={groupId}>
              {groupDictionary.get(groupId) ?? groupId}
            </Tag>
          ))}
        </Space>
      ),
    },
    {
      title: '健康指標',
      key: 'metrics',
      width: 220,
      render: (_: unknown, resource: Resource) => (
        <Space direction="vertical" size={6} style={{ width: 200 }}>
          <Tooltip title={`CPU 使用率 ${formatPercent(resource.metrics.cpuUsage)}`}>
            <Progress
              percent={resource.metrics.cpuUsage ? Math.round(resource.metrics.cpuUsage) : 0}
              size="small"
              status={getProgressStatus(resource.metrics.cpuUsage)}
              strokeColor="#40a9ff"
            />
          </Tooltip>
          <Tooltip title={`記憶體使用率 ${formatPercent(resource.metrics.memoryUsage)}`}>
            <Progress
              percent={resource.metrics.memoryUsage ? Math.round(resource.metrics.memoryUsage) : 0}
              size="small"
              status={getProgressStatus(resource.metrics.memoryUsage)}
              strokeColor="#722ed1"
            />
          </Tooltip>
          {((resource.metricsHistory?.cpuSeries?.length ?? 0) > 1
            || (resource.metricsHistory?.memorySeries?.length ?? 0) > 1) && (
            <MiniTrendChart
              cpuSeries={resource.metricsHistory?.cpuSeries}
              memorySeries={resource.metricsHistory?.memorySeries}
            />
          )}
        </Space>
      ),
    },
    {
      title: '關聯事件',
      dataIndex: 'relatedIncidents',
      key: 'relatedIncidents',
      width: 140,
      render: (count: number | undefined, resource: Resource) => (
        <Button
          type="link"
          onClick={() => onNavigate('incident-list', { resource: resource.name })}
        >
          {count ?? 0} 件
        </Button>
      ),
    },
    {
      title: '操作',
      key: 'actions',
      width: 240,
      render: (_: unknown, resource: Resource) => {
        const actionList = resource.actions ?? [];
        const inlineActions = actionList.slice(0, 2);
        const overflowActions = actionList.slice(2);

        const overflowMenu: MenuProps | undefined = overflowActions.length
          ? {
              items: overflowActions.map((action) => ({ key: action.key, label: action.label })),
              onClick: ({ key }) => {
                const target = overflowActions.find((action) => action.key === key);
                if (target) {
                  runResourceAction(target, resource);
                }
              },
            }
          : undefined;

        return (
          <Space size={4} wrap>
            <Button type="link" onClick={() => handleOpenDetail(resource)}>
              詳情
            </Button>
            <Button type="link" onClick={() => handleOpenEdit(resource)}>
              編輯
            </Button>
            {inlineActions.map((action) => (
              <Tooltip key={action.key} title={action.description ?? '執行操作'}>
                <Button type="link" onClick={() => runResourceAction(action, resource)}>
                  {action.label}
                </Button>
              </Tooltip>
            ))}
            {overflowMenu && (
              <Dropdown menu={overflowMenu} trigger={['click']}>
                <Button type="link">更多</Button>
              </Dropdown>
            )}
            {!actionList.length && (
              <Tooltip title="觸發自動化修復 (模擬)">
                <Button type="link" onClick={() => message.success(`已觸發 ${resource.name} 的修復腳本 (模擬)`)}>
                  自動化
                </Button>
              </Tooltip>
            )}
          </Space>
        );
      },
    },
  ], [groupDictionary, handleOpenDetail, handleOpenEdit, handleApplyTag, message, onNavigate, runResourceAction]);

  const handleTableChange = useCallback((paginationConfig: { current?: number }) => {
    onQueryChange({ page: paginationConfig.current ?? 1 });
  }, [onQueryChange]);

  const handleFormSubmit = useCallback((_values: ResourceFormValues) => {
    message.success(`${editResource ? '已更新' : '已建立'}資源 (模擬)`);
    setEditOpen(false);
    onRefresh();
  }, [editResource, message, onRefresh]);

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <Space
        direction="vertical"
        size={16}
        style={{ width: '100%' }}
      >
        <Space size={12} wrap style={{ width: '100%', justifyContent: 'space-between' }}>
          <Space size={12} wrap>
            <Search
              value={searchValue}
              onChange={(event) => setSearchValue(event.target.value)}
              onSearch={(value) => onQueryChange({ page: 1, search: value || undefined })}
              placeholder="搜尋名稱、IP 或標籤"
              allowClear
              enterButton={<SearchOutlined />}
              style={{ width: 260 }}
            />
            <Select
              options={STATUS_OPTIONS}
              value={query.status ?? 'ALL'}
              onChange={(value) => onQueryChange({ page: 1, status: value as ResourceStatus | 'ALL' })}
              style={{ width: 160 }}
            />
            <Select
              allowClear
              placeholder="篩選群組"
              value={query.groupId}
              options={groupOptions}
              onChange={(value) => onQueryChange({ page: 1, groupId: value ?? undefined })}
              style={{ width: 200 }}
            />
            <Select
              mode="tags"
              allowClear
              placeholder="標籤篩選"
              value={query.tags ?? []}
              options={tagOptions}
              onChange={(value) => onQueryChange({ page: 1, tags: value })}
              style={{ minWidth: 220 }}
            />
          </Space>

          <Space size={8} wrap>
            <Dropdown menu={bulkActionMenu} disabled={!selectedRowKeys.length}>
              <Button icon={<ShareAltOutlined />}>
                批次操作
              </Button>
            </Dropdown>
            <Button icon={<ThunderboltOutlined />} onClick={() => setScanOpen(true)}>
              探索資源
            </Button>
            <Button type="primary" icon={<PlusOutlined />} onClick={() => handleOpenEdit(null)}>
              新增資源
            </Button>
            <Tooltip title="重新整理">
              <Button icon={<ReloadOutlined />} onClick={onRefresh} />
            </Tooltip>
          </Space>
        </Space>

        <SmartFilterBuilder
          value={tagFilters}
          onApply={(filters: TagFilter[]) => onQueryChange({ page: 1, tagFilters: filters.length > 0 ? filters : undefined })}
          disabled={loading}
        />

        {isFallback && (
          <Alert
            type="info"
            showIcon
            message="目前顯示為離線模擬資料"
            description="尚未連接後端 API，展示為本地樣本資料。"
          />
        )}

        {Boolean(error) && !loading && (
          <Alert
            type="error"
            showIcon
            message="無法載入資源資料"
            description={error instanceof Error ? error.message : '請稍後再試'}
          />
        )}
      </Space>

      <DataTable<Resource>
        dataSource={resources}
        columns={columns}
        rowKey={(record) => record.id}
        loading={loading}
        pagination={tablePagination}
        onChange={handleTableChange}
        rowSelection={{
          selectedRowKeys,
          onChange: (keys) => setSelectedRowKeys(keys),
        }}
        locale={{
          emptyText: loading ? <Spin /> : <Empty description="目前沒有符合條件的資源" />,
        }}
        titleContent={<span style={{ fontWeight: 600 }}>資源列表</span>}
      />

      <Modal
        open={detailOpen}
        title={detailResource?.name ?? '資源詳情'}
        width={720}
        footer={null}
        onCancel={() => setDetailOpen(false)}
      >
        {detailResource && (() => {
          const statusDescription = detailResource.healthReasons?.length
            ? (
                <ul style={{ paddingLeft: 18, marginBottom: 0 }}>
                  {detailResource.healthReasons.map((reason, index) => (
                    <li key={`${detailResource.id}-health-${index}`}>{reason}</li>
                  ))}
                </ul>
              )
            : detailResource.healthSummary ?? undefined;

          const observabilityLinks = detailResource.observability;
          const hasObservability = Boolean(
            observabilityLinks?.grafanaUrl
            || observabilityLinks?.logsUrl
            || observabilityLinks?.runbookUrl,
          );

          return (
            <Space direction="vertical" size={16} style={{ width: '100%' }}>
              <Alert
                type={detailResource.status === 'CRITICAL' ? 'error' : detailResource.status === 'WARNING' ? 'warning' : 'info'}
                showIcon
                message={`目前狀態：${statusLabelMap[detailResource.status] ?? detailResource.status}`}
                description={statusDescription}
              />
              <Descriptions bordered column={2} size="small">
                <Descriptions.Item label="資源類型">{detailResource.type}</Descriptions.Item>
                <Descriptions.Item label="環境">{detailResource.environment ?? '未定義'}</Descriptions.Item>
                <Descriptions.Item label="IP 位址">{detailResource.ipAddress ?? '未設定'}</Descriptions.Item>
                <Descriptions.Item label="位置">{detailResource.location ?? '未設定'}</Descriptions.Item>
                <Descriptions.Item label="供應商">{detailResource.provider ?? '未指定'}</Descriptions.Item>
                <Descriptions.Item label="最近更新">{detailResource.updatedAt ?? '未知'}</Descriptions.Item>
              </Descriptions>
              <Divider orientation="left">健康指標</Divider>
              <Space direction="vertical" size={12} style={{ width: '100%' }}>
                <Tooltip title={`CPU 使用率 ${formatPercent(detailResource.metrics.cpuUsage)}`}>
                  <Progress
                    percent={detailResource.metrics.cpuUsage ? Math.round(detailResource.metrics.cpuUsage) : 0}
                    status={getProgressStatus(detailResource.metrics.cpuUsage)}
                    strokeColor="#40a9ff"
                  />
                </Tooltip>
                <Tooltip title={`記憶體使用率 ${formatPercent(detailResource.metrics.memoryUsage)}`}>
                  <Progress
                    percent={detailResource.metrics.memoryUsage ? Math.round(detailResource.metrics.memoryUsage) : 0}
                    status={getProgressStatus(detailResource.metrics.memoryUsage)}
                    strokeColor="#722ed1"
                  />
                </Tooltip>
                {((detailResource.metricsHistory?.cpuSeries?.length ?? 0) > 1
                  || (detailResource.metricsHistory?.memorySeries?.length ?? 0) > 1) && (
                  <MiniTrendChart
                    cpuSeries={detailResource.metricsHistory?.cpuSeries}
                    memorySeries={detailResource.metricsHistory?.memorySeries}
                  />
                )}
              </Space>
              <Divider orientation="left">標籤 / 群組</Divider>
              <Space direction="vertical" size={8}>
                <Space size={4} wrap>
                  {detailResource.tags.length === 0 && <Text type="secondary">尚未設定標籤</Text>}
                  {detailResource.tags.map((tag) => {
                    const value = `${tag.key}:${tag.value}`;
                    return (
                      <Tooltip title={`套用標籤篩選：${value}`} key={`${detailResource.id}-${value}`}>
                        <Tag
                          color="geekblue"
                          onClick={() => handleApplyTag(value)}
                          style={{ cursor: 'pointer' }}
                        >
                          {value}
                        </Tag>
                      </Tooltip>
                    );
                  })}
                </Space>
                <Space size={4} wrap>
                  {detailResource.groups.length === 0 && <Text type="secondary">未分配任何群組</Text>}
                  {detailResource.groups.map((groupId) => (
                    <Tag color="purple" key={groupId}>
                      {groupDictionary.get(groupId) ?? groupId}
                    </Tag>
                  ))}
                </Space>
              </Space>
              <Divider orientation="left">建議操作</Divider>
              {detailResource.actions?.length ? (
                <Space size={8} wrap>
                  {detailResource.actions.map((action) => (
                    <Tooltip key={action.key} title={action.description ?? '執行操作'}>
                      <Button
                        type={action.type === 'automation' ? 'primary' : 'default'}
                        onClick={() => runResourceAction(action, detailResource)}
                      >
                        {action.label}
                      </Button>
                    </Tooltip>
                  ))}
                </Space>
              ) : (
                <Text type="secondary">暫無推薦操作</Text>
              )}
              <Divider orientation="left">觀察工具</Divider>
              {hasObservability ? (
                <Space size={8} wrap>
                  {observabilityLinks?.grafanaUrl && (
                    <Button type="link" href={observabilityLinks.grafanaUrl} target="_blank" rel="noopener noreferrer">
                      Grafana 儀表板
                    </Button>
                  )}
                  {observabilityLinks?.logsUrl && (
                    <Button type="link" href={observabilityLinks.logsUrl} target="_blank" rel="noopener noreferrer">
                      日誌查詢
                    </Button>
                  )}
                  {observabilityLinks?.runbookUrl && (
                    <Button type="link" href={observabilityLinks.runbookUrl} target="_blank" rel="noopener noreferrer">
                      Runbook
                    </Button>
                  )}
                </Space>
              ) : (
                <Text type="secondary">尚未設定觀察工具連結</Text>
              )}
              <Divider orientation="left">關聯事件</Divider>
              {detailResource.relatedEvents?.length ? (
                <Space direction="vertical" size={8} style={{ width: '100%' }}>
                  {detailResource.relatedEvents.map((event) => {
                    const severity = (event.severity ?? '').toUpperCase();
                    const color = severityColorMap[severity] ?? severityColorMap.DEFAULT;
                    return (
                      <Space key={event.id} size={8} wrap align="center">
                        <Tag color={color}>{event.severity ?? '未知'}</Tag>
                        <Button
                          type="link"
                          onClick={() => onNavigate('incident-list', { resource: detailResource.name, eventId: event.id })}
                          style={{ padding: 0 }}
                        >
                          {event.summary ?? event.id}
                        </Button>
                        <Text type="secondary">{event.status ?? '未提供狀態'}</Text>
                      </Space>
                    );
                  })}
                </Space>
              ) : (
                <Text type="secondary">目前沒有活躍事件</Text>
              )}
            </Space>
          );
        })()}
      </Modal>

      <Modal
        open={editOpen}
        title={editResource ? '編輯資源' : '新增資源'}
        onCancel={() => setEditOpen(false)}
        onOk={() => form.submit()}
      >
        <Form<ResourceFormValues>
          form={form}
          layout="vertical"
          onFinish={handleFormSubmit}
        >
          <Form.Item name="name" label="資源名稱" rules={[{ required: true, message: '請輸入資源名稱' }]}>
            <Input placeholder="例如：db-prod-01" />
          </Form.Item>
          <Form.Item name="type" label="資源類型" rules={[{ required: true }] }>
            <Select options={RESOURCE_TYPE_OPTIONS.map((value) => ({ value, label: value }))} />
          </Form.Item>
          <Form.Item name="status" label="狀態" rules={[{ required: true }] }>
            <Select options={STATUS_OPTIONS.filter((option) => option.value !== 'ALL') as Array<{ label: string; value: ResourceStatus }>} />
          </Form.Item>
          <Form.Item name="ipAddress" label="IP 位址">
            <Input placeholder="10.0.0.1" />
          </Form.Item>
          <Form.Item name="location" label="位置">
            <Input placeholder="資料中心 / 區域" />
          </Form.Item>
          <Form.Item name="environment" label="環境">
            <Select
              allowClear
              options={ENVIRONMENT_OPTIONS.map((value) => ({ value, label: value }))}
            />
          </Form.Item>
          <Form.Item name="groups" label="隸屬群組">
            <Select
              allowClear
              mode="multiple"
              options={groupOptions}
              placeholder="選擇資源群組"
            />
          </Form.Item>
          <Form.Item name="tags" label="標籤">
            <Select
              mode="tags"
              placeholder="輸入標籤 (格式：key:value)"
            />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        open={scanOpen}
        title="掃描網段以探索新資源"
        onCancel={() => setScanOpen(false)}
        onOk={() => {
          message.success(`已開始掃描 ${scanValue || '指定網段'} (模擬)`);
          setScanOpen(false);
          setScanValue('');
        }}
        okText="開始掃描"
        cancelText="取消"
      >
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          <Text>請輸入要掃描的 IP 網段（例如：192.168.1.0/24）。系統將模擬探索新資源並於完成時通知您。</Text>
          <Input
            placeholder="192.168.1.0/24"
            value={scanValue}
            onChange={(event) => setScanValue(event.target.value)}
          />
        </Space>
      </Modal>
    </Space>
  );
};

type ResourceGroupsTabProps = {
  resourceGroups: ResourceGroupWithInsights[];
  loading: boolean;
  error: unknown;
  onRefresh: () => void;
};

const ResourceGroupsTab = ({ resourceGroups, loading, error, onRefresh }: ResourceGroupsTabProps) => {
  const { message } = AntdApp.useApp();
  const [activeGroup, setActiveGroup] = useState<ResourceGroupWithInsights | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const columns: ColumnsType<ResourceGroupWithInsights> = useMemo(() => [
    {
      title: '群組名稱',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, group) => (
        <Button type="link" onClick={() => { setActiveGroup(group); setModalOpen(true); }}>
          {text}
        </Button>
      ),
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
    },
    {
      title: '成員數量',
      dataIndex: 'memberCount',
      key: 'memberCount',
      width: 120,
    },
    {
      title: '健康狀態',
      key: 'health',
      render: (_: unknown, group) => {
        const total = group.memberCount || 1;
        return (
          <Space direction="vertical" size={4}>
            <Progress percent={Math.round((group.healthBreakdown.healthy / total) * 100)} size="small" status="success" showInfo={false} />
            <Progress percent={Math.round((group.healthBreakdown.warning / total) * 100)} size="small" status="active" strokeColor="#faad14" showInfo={false} />
            <Progress percent={Math.round((group.healthBreakdown.critical / total) * 100)} size="small" status="exception" showInfo={false} />
          </Space>
        );
      },
    },
    {
      title: '最近變更',
      dataIndex: 'recentChanges',
      key: 'recentChanges',
      width: 140,
      render: (value?: number) => `${value ?? 0} 筆 / 24 小時`,
    },
    {
      title: '操作',
      key: 'actions',
      width: 160,
      render: (_: unknown, group) => (
        <Space size={4}>
          <Button type="link" onClick={() => { setActiveGroup(group); setModalOpen(true); }}>
            詳情
          </Button>
          <Button type="link" onClick={() => message.info(`編輯群組「${group.name}」功能開發中`)}>
            編輯
          </Button>
        </Space>
      ),
    },
  ], [message]);

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <Space align="center" style={{ width: '100%', display: 'flex', justifyContent: 'space-between' }}>
        <Title level={4} style={{ margin: 0 }}>資源群組</Title>
        <Space>
          <Button onClick={() => message.success('已模擬建立新群組流程')} icon={<PlusOutlined />}>新增群組</Button>
          <Tooltip title="重新整理群組資料">
            <Button icon={<ReloadOutlined />} onClick={onRefresh} />
          </Tooltip>
        </Space>
      </Space>

      {Boolean(error) && !loading && (
        <Alert type="error" showIcon message="無法載入群組資料" description={error instanceof Error ? error.message : '請稍後再試'} />
      )}

      <DataTable<ResourceGroupWithInsights>
        dataSource={resourceGroups}
        columns={columns}
        rowKey={(record) => record.id}
        loading={loading}
        pagination={{ pageSize: 8, showSizeChanger: false }}
        titleContent={<span style={{ fontWeight: 600 }}>群組列表</span>}
      />

      <Modal
        open={modalOpen}
        title={activeGroup?.name}
        onCancel={() => setModalOpen(false)}
        footer={null}
        width={600}
      >
        {activeGroup && (
          <Space direction="vertical" size={16} style={{ width: '100%' }}>
            <Descriptions bordered column={1} size="small">
              <Descriptions.Item label="描述">{activeGroup.description ?? '未提供描述'}</Descriptions.Item>
              <Descriptions.Item label="責任團隊">{activeGroup.responsibleTeamId ?? '未指定'}</Descriptions.Item>
              <Descriptions.Item label="成員數量">{activeGroup.memberCount}</Descriptions.Item>
            </Descriptions>
            <Divider orientation="left">健康概況</Divider>
            <Space size={12} wrap>
              <Tag color="green">健康 {activeGroup.healthBreakdown.healthy}</Tag>
              <Tag color="gold">警告 {activeGroup.healthBreakdown.warning}</Tag>
              <Tag color="red">危急 {activeGroup.healthBreakdown.critical}</Tag>
              <Tag color="blue">維護 {activeGroup.healthBreakdown.maintenance}</Tag>
            </Space>
            <Divider orientation="left">標籤</Divider>
            <Space size={6} wrap>
              {activeGroup.tags.length === 0 && <Text type="secondary">無標籤</Text>}
              {activeGroup.tags.map((tag) => (
                <Tag key={`${tag.key}-${tag.value}`} color="geekblue">{tag.key}:{tag.value}</Tag>
              ))}
            </Space>
          </Space>
        )}
      </Modal>
    </Space>
  );
};

type ResourceTopologyTabProps = {
  topology: ResourceTopologyGraph;
  loading: boolean;
  error: unknown;
  onRefresh: () => void;
};

const ResourceTopologyTab = ({ topology, loading, error, onRefresh }: ResourceTopologyTabProps) => {
  const chartContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!chartContainerRef.current || loading) {
      return;
    }

    const chart = echarts.init(chartContainerRef.current);
    const option: EChartsOption = {
      backgroundColor: 'transparent',
      tooltip: {
        trigger: 'item',
        formatter: (params) => {
          if (params.dataType === 'node') {
            const node = params.data as { name: string; status?: string; region?: string };
            return `${node.name}<br/>狀態：${node.status ?? '未知'}${node.region ? `<br/>位置：${node.region}` : ''}`;
          }
          if (params.dataType === 'edge') {
            const edge = params.data as { relation?: string; latencyMs?: number };
            return `${edge.relation ?? '關聯'}${edge.latencyMs ? `<br/>延遲 ${edge.latencyMs} ms` : ''}`;
          }
          return '';
        },
      },
      series: [
        {
          type: 'graph',
          layout: 'force',
          roam: true,
          emphasis: { focus: 'adjacency' },
          draggable: true,
          label: { show: true, color: '#fff' },
          data: topology.nodes.map((node) => ({
            id: node.id,
            name: node.name,
            category: node.type,
            status: node.status,
            region: node.region,
            value: node.importance ?? 1,
            symbolSize: 40 + Math.min(node.importance ?? 0, 4) * 4,
            itemStyle: {
              color:
                node.status === 'CRITICAL'
                  ? '#ff4d4f'
                  : node.status === 'WARNING'
                    ? '#faad14'
                    : node.status === 'HEALTHY'
                      ? '#52c41a'
                      : '#40a9ff',
            },
          })),
          links: topology.edges.map((edge) => ({
            source: edge.source,
            target: edge.target,
            relation: edge.relation,
            latencyMs: edge.latencyMs,
            lineStyle: {
              color:
                edge.status === 'CRITICAL'
                  ? '#ff4d4f'
                  : edge.status === 'WARNING'
                    ? '#faad14'
                    : '#95de64',
              width: edge.status === 'CRITICAL' ? 3 : 1.5,
            },
          })),
          force: {
            repulsion: 260,
            gravity: 0.04,
            edgeLength: [60, 160],
          },
        },
      ],
    };

    chart.setOption(option);
    const observer = new ResizeObserver(() => chart.resize());
    observer.observe(chartContainerRef.current);

    return () => {
      observer.disconnect();
      chart.dispose();
    };
  }, [loading, topology]);

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <Space align="center" style={{ width: '100%', display: 'flex', justifyContent: 'space-between' }}>
        <Title level={4} style={{ margin: 0 }}>資源拓撲</Title>
        <Tooltip title="重新整理拓撲圖">
          <Button icon={<ReloadOutlined />} onClick={onRefresh} />
        </Tooltip>
      </Space>

      {Boolean(error) && !loading && (
        <Alert type="error" showIcon message="無法載入拓撲圖" description={error instanceof Error ? error.message : '請稍後再試'} />
      )}

      <div
        ref={chartContainerRef}
        style={{ width: '100%', height: 520, background: 'rgba(255,255,255,0.02)', borderRadius: 12 }}
      >
        {loading && (
          <Space style={{ width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center', display: 'flex' }}>
            <Spin />
          </Space>
        )}
      </div>
    </Space>
  );
};

const ResourcesPage = ({ onNavigate, pageKey }: ResourcesPageProps) => {
  const [query, setQuery] = useState<ResourceQueryParams>({ page: 1, pageSize: 10, status: 'ALL' });
  const { resources, pagination, loading, error, isFallback, refresh } = useResources(query);
  const { resourceGroups, loading: groupLoading, error: groupError, isFallback: groupFallback, refresh: refreshGroups } = useResourceGroups();
  const enrichedGroups = useMemo(
    () => enrichResourceGroups(resourceGroups, resources),
    [resourceGroups, resources],
  );
  const { stats, loading: statsLoading } = useResourceStatistics(resources, resourceGroups);
  const { topology, loading: topologyLoading, error: topologyError, isFallback: topologyFallback } = useResourceTopology(
    resources,
    resourceGroups,
    { enabled: pageKey === 'resource-topology' },
  );
  const { jobs, loading: jobLoading, error: jobError, isFallback: jobFallback, summary: jobSummary, refresh: refreshJobs } = useBackgroundJobs();

  const handleQueryChange = useCallback((patch: Partial<ResourceQueryParams>) => {
    setQuery((prev) => ({
      ...prev,
      ...patch,
    }));
  }, []);

  const handleRefreshAll = useCallback(() => {
    refresh();
    refreshGroups();
    refreshJobs();
  }, [refresh, refreshGroups, refreshJobs]);

  const kpiCards = [
    {
      key: 'total',
      title: '總資源數',
      value: stats.total,
      unit: '個',
      status: 'info' as const,
      description: stats.lastUpdatedAt ? `更新於 ${stats.lastUpdatedAt}` : undefined,
      icon: <HddOutlined style={{ fontSize: 32, color: '#40a9ff' }} />,
    },
    {
      key: 'healthy',
      title: '健康資源',
      value: stats.healthy,
      unit: '個',
      status: 'success' as const,
      description: stats.total > 0 ? `佔比 ${Math.round((stats.healthy / stats.total) * 100)}%` : '無資料',
      icon: <SafetyCertificateOutlined style={{ fontSize: 32, color: '#52c41a' }} />,
    },
    {
      key: 'warning',
      title: '警示資源',
      value: stats.warning,
      unit: '個',
      status: stats.warning > 0 ? 'warning' : 'info',
      description: stats.warning > 0 ? '請優先關注' : '全部正常',
      icon: <ExclamationCircleOutlined style={{ fontSize: 32, color: '#faad14' }} />,
    },
    {
      key: 'groups',
      title: '群組數量',
      value: stats.groups,
      unit: '組',
      status: 'info' as const,
      description: groupFallback ? '顯示為離線資料' : undefined,
      icon: <ApartmentOutlined style={{ fontSize: 32, color: '#9254de' }} />,
    },
  ];

  const tabItems = useMemo(() => ([
    {
      key: 'resource-overview',
      label: (
        <span>
          <HddOutlined /> 資源列表
        </span>
      ),
      children: (
        <ResourceOverviewTab
          resources={resources}
          pagination={pagination}
          loading={loading}
          error={error}
          query={query}
          onQueryChange={handleQueryChange}
          onNavigate={onNavigate}
          onRefresh={refresh}
          resourceGroups={resourceGroups}
          isFallback={isFallback}
          tagFilters={query.tagFilters ?? []}
        />
      ),
    },
    {
      key: 'resource-groups',
      label: (
        <span>
          <TeamOutlined /> 資源群組
        </span>
      ),
      children: (
        <ResourceGroupsTab
          resourceGroups={enrichedGroups}
          loading={groupLoading}
          error={groupError}
          onRefresh={refreshGroups}
        />
      ),
    },
    {
      key: 'resource-topology',
      label: (
        <span>
          <BranchesOutlined /> 拓撲視圖
        </span>
      ),
      children: (
        <ResourceTopologyTab
          topology={topology}
          loading={topologyLoading}
          error={topologyError}
          onRefresh={() => useResourceTopology(resources, resourceGroups, { enabled: true })}
        />
      ),
    },
  ]), [
    enrichedGroups,
    error,
    groupError,
    groupLoading,
    handleQueryChange,
    isFallback,
    loading,
    onNavigate,
    pagination,
    query,
    refresh,
    refreshGroups,
    resources,
    resourceGroups,
    stats,
    statsLoading,
    topology,
    topologyError,
    topologyLoading,
  ]);

  const activeKey = tabItems.some((item) => item.key === pageKey) ? pageKey : 'resource-overview';

  return (
    <Space direction="vertical" size={24} style={{ width: '100%' }}>
      <PageHeader
        title="資源管理"
        subtitle="探索、組織與管理您的所有基礎設施資源"
        actions={[
          <Button key="refresh" icon={<ReloadOutlined />} onClick={handleRefreshAll}>
            重新整理
          </Button>,
        ]}
      />

      <Row gutter={[16, 16]}>
        {kpiCards.map((card) => (
          <Col xs={24} sm={12} md={6} key={card.key}>
            <ContextualKPICard
              title={card.title}
              value={card.value}
              unit={card.unit}
              status={card.status}
              description={card.description}
              icon={card.icon}
              loading={statsLoading}
            />
          </Col>
        ))}
      </Row>

      <BackgroundJobsPanel
        jobs={jobs}
        loading={jobLoading}
        error={jobError}
        isFallback={jobFallback}
        summary={jobSummary}
        onRefresh={refreshJobs}
      />

      <Tabs
        items={tabItems}
        activeKey={activeKey}
        onChange={(key) => onNavigate(key)}
      />
    </Space>
  );
};

export default ResourcesPage;
