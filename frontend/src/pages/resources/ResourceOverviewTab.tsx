import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  SearchOutlined,
  ShareAltOutlined,
  ThunderboltOutlined,
  PlusOutlined,
  ReloadOutlined,
  EyeOutlined,
  EditOutlined,
  MoreOutlined,
} from '@ant-design/icons';
import {
  App as AntdApp,
  Alert,
  Button,
  Descriptions,
  Divider,
  Dropdown,
  Empty,
  Form,
  Input,
  Modal,
  Progress,
  Select,
  Space,
  Spin,
  Tag,
  Tooltip,
  Typography,
} from 'antd';
import type { MenuProps } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  DataTable,
  StatusBadge,
  SmartFilterBuilder,
} from '../../components';
import type { StatusTone } from '../../components';
import { getStatusTone } from '../../constants/statusMaps';
import { getChartTheme } from '../../utils/chartTheme';
import type {
  PaginationMeta,
  Resource,
  ResourceAction,
  ResourceGroup,
  ResourceQueryParams,
  ResourceStatus,
  ResourceTag,
  TagFilter,
} from '../../types/resources';

const { Text } = Typography;
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

type MiniTrendChartProps = {
  cpuSeries?: number[];
  memorySeries?: number[];
};

const MiniTrendChart = ({ cpuSeries, memorySeries }: MiniTrendChartProps) => {
  const cpu = Array.isArray(cpuSeries) ? cpuSeries : [];
  const memory = Array.isArray(memorySeries) ? memorySeries : [];
  const pointCount = Math.max(cpu.length, memory.length);
  const theme = getChartTheme();

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
            stroke={theme.palette.info}
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}
        {cpu.length > 1 && (
          <polyline
            points={buildPoints(cpu)}
            fill="none"
            stroke={theme.palette.primary}
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}
      </svg>
      <Space size={8} style={{ fontSize: 11 }}>
        {cpu.length > 1 && <span style={{ color: theme.palette.primary }}>CPU</span>}
        {memory.length > 1 && <span style={{ color: theme.palette.info }}>記憶體</span>}
      </Space>
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
  onNavigate: (key: string, params?: Record<string, unknown>) => void;
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
  tagFilters?: TagFilter[];
};

const formatPercent = (value?: number) => (typeof value === 'number' ? `${Math.round(value)}%` : 'N/A');

const buildGroupOptions = (groups: ResourceGroup[]) =>
  groups.map((group) => ({ label: group.name, value: group.id }));

const TAG_FILTER_OPERATORS: TagFilter['operator'][] = ['eq', 'neq', 'in', 'not_in', 'regex', 'not_regex'];

const sanitizeTagFilters = (filters?: TagFilter[]): TagFilter[] => {
  if (!Array.isArray(filters)) {
    return [];
  }
  return filters
    .map((filter) => {
      if (!filter || typeof filter !== 'object') {
        return null;
      }
      const key = typeof filter.key === 'string' ? filter.key.trim() : '';
      if (!key) {
        return null;
      }
      const operator: TagFilter['operator'] = TAG_FILTER_OPERATORS.includes(filter.operator)
        ? filter.operator
        : 'eq';
      const values = Array.isArray(filter.values)
        ? filter.values
          .map((value) => (typeof value === 'string' ? value.trim() : typeof value === 'number' ? String(value) : ''))
          .filter((value) => value.length > 0)
        : [];
      if (values.length === 0 && operator !== 'regex' && operator !== 'not_regex') {
        return null;
      }
      return {
        key,
        operator,
        values,
      } satisfies TagFilter;
    })
    .filter((filter): filter is TagFilter => Boolean(filter));
};

const deriveTagsFromFilters = (filters: TagFilter[]): ResourceTag[] => {
  const derived: ResourceTag[] = [];
  filters.forEach((filter) => {
    if (!filter.key) {
      return;
    }
    if (filter.operator === 'eq') {
      const value = filter.values[0];
      if (value) {
        derived.push({ key: filter.key, value });
      }
      return;
    }
    if (filter.operator === 'in') {
      filter.values.forEach((value) => {
        if (value) {
          derived.push({ key: filter.key, value });
        }
      });
    }
  });
  return derived;
};

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

export const ResourceOverviewTab = ({
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
  const [resourceTagDrafts, setResourceTagDrafts] = useState<Record<string, TagFilter[]>>({});
  const previewTagFilters = Form.useWatch<TagFilter[]>('tagFilters', form);
  const sanitizedPreviewFilters = useMemo(() => sanitizeTagFilters(previewTagFilters), [previewTagFilters]);
  const derivedPreviewTags = useMemo(
    () => (sanitizedPreviewFilters.length > 0 ? deriveTagsFromFilters(sanitizedPreviewFilters) : []),
    [sanitizedPreviewFilters],
  );
  const previewHasUnsupportedOperators = useMemo(
    () => sanitizedPreviewFilters.some((filter) => !['eq', 'in'].includes(filter.operator)),
    [sanitizedPreviewFilters],
  );

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
    const draftFilters = target?.id ? resourceTagDrafts[target.id] : undefined;
    const initialFilters = sanitizeTagFilters(draftFilters ?? target?.tags.map((tag) => ({
      key: tag.key,
      operator: 'eq' as const,
      values: [tag.value],
    })) ?? []);
    form.setFieldsValue({
      name: target?.name ?? '',
      type: target?.type ?? RESOURCE_TYPE_OPTIONS[0],
      status: target?.status ?? 'HEALTHY',
      ipAddress: target?.ipAddress ?? '',
      location: target?.location ?? '',
      environment: target?.environment ?? '',
      groups: target?.groups ?? [],
      tagFilters: initialFilters,
    });
  }, [form, resourceTagDrafts]);

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
              tone={getStatusTone(resource.status, 'resource')}
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
            <Button
              type="link"
              onClick={() => handleOpenDetail(resource)}
            >
              詳情
            </Button>
            <Button
              type="link"
              onClick={() => handleOpenEdit(resource)}
            >
              編輯
            </Button>
            {actionList.length > 0 ? (
              <Dropdown
                menu={{
                  items: actionList.map((action) => ({
                    key: action.key,
                    label: action.label,
                    icon: action.type === 'automation' ? <ThunderboltOutlined /> : undefined,
                    onClick: () => runResourceAction(action, resource),
                  })),
                }}
                trigger={['click']}
              >
                <Button
                  type="link"
                >
                  操作
                </Button>
              </Dropdown>
            ) : (
              <Button
                type="link"
                onClick={() => message.success(`已觸發 ${resource.name} 的修復腳本 (模擬)`)}
              >
                自動化
              </Button>
            )}
          </Space>
        );
      },
    },
  ], [groupDictionary, handleOpenDetail, handleOpenEdit, handleApplyTag, message, onNavigate, runResourceAction]);

  const handleTableChange = useCallback((paginationConfig: { current?: number }) => {
    onQueryChange({ page: paginationConfig.current ?? 1 });
  }, [onQueryChange]);

  const handleFormSubmit = useCallback((values: ResourceFormValues) => {
    const sanitizedFilters = sanitizeTagFilters(values.tagFilters);
    const hadRawFilters = Array.isArray(values.tagFilters) && values.tagFilters.length > 0;
    const derivedTags = sanitizedFilters.length > 0
      ? deriveTagsFromFilters(sanitizedFilters)
      : editResource?.tags ?? [];

    if (editResource?.id) {
      setResourceTagDrafts((previous) => {
        const next = { ...previous };
        if (sanitizedFilters.length > 0) {
          next[editResource.id] = sanitizedFilters;
        } else {
          delete next[editResource.id];
        }
        return next;
      });
    }

    if (!sanitizedFilters.length && hadRawFilters) {
      message.info('未偵測到有效的標籤條件，已保留原有標籤設定');
    }

    const unsupported = sanitizedFilters.filter((filter) => !['eq', 'in'].includes(filter.operator));
    if (unsupported.length > 0) {
      message.warning('部分條件使用進階運算子，將僅儲存為條件不會轉換為標籤');
    }

    const payload = {
      ...values,
      tagFilters: sanitizedFilters,
    };

    // 模擬送出 API
    console.log('Saving resource (mock)', {
      id: editResource?.id ?? 'new-resource',
      ...payload,
      tags: derivedTags,
    });

    message.success(`${editResource ? '已更新' : '已建立'}資源 (模擬)`);
    setEditOpen(false);
    form.resetFields();
    setEditResource(null);
    onRefresh();
  }, [editResource, form, message, onRefresh]);

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
        onCancel={() => {
          setEditOpen(false);
          form.resetFields();
          setEditResource(null);
        }}
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
          <Form.Item
            name="tagFilters"
            label="標籤條件"
            valuePropName="value"
            trigger="onApply"
            extra="使用標籤條件來定義資源的屬性組合，請按下「套用」後再儲存"
          >
            <SmartFilterBuilder
              disabled={false}
            />
          </Form.Item>
          <Form.Item label="標籤預覽" colon={false}>
            {derivedPreviewTags.length > 0 ? (
              <Space direction="vertical" size={6} style={{ width: '100%' }}>
                <Space size={[8, 8]} wrap>
                  {derivedPreviewTags.map((tag) => (
                    <Tag color="blue" key={`${tag.key}:${tag.value}`}>
                      {`${tag.key}=${tag.value}`}
                    </Tag>
                  ))}
                </Space>
                {previewHasUnsupportedOperators && (
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    部分條件使用進階運算子，將僅儲存為條件不會轉換為標籤
                  </Text>
                )}
              </Space>
            ) : sanitizedPreviewFilters.length > 0 ? (
              <Text type="secondary">
                {previewHasUnsupportedOperators
                  ? '目前條件包含進階運算子，將僅儲存為條件不會轉換為標籤'
                  : '尚未偵測到可轉換的標籤，請確認條件值'}
              </Text>
            ) : editResource?.tags?.length ? (
              <Space direction="vertical" size={6} style={{ width: '100%' }}>
                <Text type="secondary">未套用有效條件時將沿用既有標籤設定：</Text>
                <Space size={[8, 8]} wrap>
                  {editResource.tags.map((tag) => (
                    <Tag key={`${tag.key}:${tag.value}`}>{`${tag.key}=${tag.value}`}</Tag>
                  ))}
                </Space>
              </Space>
            ) : (
              <Text type="secondary">儲存後將根據條件自動產生標籤</Text>
            )}
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
