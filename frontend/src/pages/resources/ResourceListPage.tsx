import { ClusterOutlined, DashboardOutlined, HddOutlined } from '@ant-design/icons';
import {
  Badge,
  Input,
  Progress,
  Segmented,
  Space,
  Table,
  Tag,
  Tooltip,
  Typography
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useMemo, useState } from 'react';
import { KpiCard, PageContainer, PageHeader, SectionCard } from '../../components';
import { useResources } from '../../hooks';
import type { Resource } from '../../hooks';

const STATUS_TEXT: Record<string, string> = {
  healthy: '健康',
  warning: '警示',
  critical: '嚴重',
  offline: '離線'
};

const STATUS_COLORS: Record<string, string> = {
  healthy: 'success',
  warning: 'warning',
  critical: 'error',
  offline: 'default'
};

const ENVIRONMENT_COLORS: Record<string, string> = {
  production: 'magenta',
  staging: 'geekblue',
  development: 'green',
  testing: 'purple'
};

const STATUS_FILTERS = [
  { label: '全部狀態', value: 'all' },
  { label: '健康', value: 'healthy' },
  { label: '警示', value: 'warning' },
  { label: '嚴重', value: 'critical' },
  { label: '離線', value: 'offline' }
] as const;

const formatPercent = (value?: number | null) =>
  typeof value === 'number' ? `${value.toFixed(1)}%` : '—';

const calcAverage = (items: Resource[], key: keyof Resource) => {
  const values = items.map((item) => Number(item[key] ?? 0));
  if (values.length === 0) {
    return 0;
  }
  const sum = values.reduce((total, val) => total + val, 0);
  return sum / values.length;
};

export const ResourceListPage = () => {
  const { data, loading } = useResources();
  const [statusFilter, setStatusFilter] = useState<(typeof STATUS_FILTERS)[number]['value']>('all');
  const [keyword, setKeyword] = useState('');

  const resources = data?.items ?? [];
  const environments = useMemo(
    () => Array.from(new Set(resources.map((item) => item.environment).filter((env): env is string => Boolean(env)))),
    [resources]
  );
  const hasUndefinedEnvironment = useMemo(() => resources.some((item) => !item.environment), [resources]);
  const [environmentFilter, setEnvironmentFilter] = useState<string>('all');

  const stats = useMemo(() => {
    const healthyCount = resources.filter((item) => item.status === 'healthy').length;
    const warningCount = resources.filter((item) => item.status === 'warning').length;
    const criticalCount = resources.filter((item) => item.status === 'critical').length;
    const avgCpu = calcAverage(resources, 'cpu_usage');
    const avgMemory = calcAverage(resources, 'memory_usage');

    return {
      total: resources.length,
      healthyCount,
      warningCount,
      criticalCount,
      avgCpu,
      avgMemory
    };
  }, [resources]);

  const filteredResources = useMemo(() => {
    return resources.filter((resource) => {
      const matchStatus = statusFilter === 'all' ? true : resource.status === statusFilter;
      const matchEnvironment =
        environmentFilter === 'all'
          ? true
          : environmentFilter === '__none'
            ? !resource.environment
            : resource.environment === environmentFilter;
      const text = `${resource.name ?? ''} ${resource.type ?? ''} ${resource.team ?? ''} ${resource.location ?? ''}`;
      const matchKeyword = keyword ? text.toLowerCase().includes(keyword.toLowerCase()) : true;
      return matchStatus && matchEnvironment && matchKeyword;
    });
  }, [environmentFilter, keyword, resources, statusFilter]);

  const columns: ColumnsType<Resource> = [
    {
      title: '資源名稱',
      dataIndex: 'name',
      key: 'name',
      width: 220,
      render: (value: Resource['name'], record) => (
        <Space direction="vertical" size={2}>
          <Typography.Text strong>{value || '未命名資源'}</Typography.Text>
          <Typography.Text type="secondary" style={{ fontSize: 12 }}>
            {record.ip_address} · {record.location}
          </Typography.Text>
        </Space>
      )
    },
    {
      title: '狀態',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (value: Resource['status']) => (
        <Badge status={STATUS_COLORS[value ?? ''] || 'default'} text={STATUS_TEXT[value ?? ''] || value || '未知'} />
      )
    },
    {
      title: '資源類型',
      dataIndex: 'type',
      key: 'type',
      width: 120,
      render: (value: Resource['type']) => <Tag color="blue">{value || '未分類'}</Tag>
    },
    {
      title: '執行環境',
      dataIndex: 'environment',
      key: 'environment',
      width: 140,
      render: (value: Resource['environment']) => (
        <Tag color={ENVIRONMENT_COLORS[value ?? ''] || 'default'}>{value || '未設定'}</Tag>
      )
    },
    {
      title: '團隊',
      dataIndex: 'team',
      key: 'team',
      width: 160,
      render: (value: Resource['team']) => value || '—'
    },
    {
      title: '資源標籤',
      dataIndex: 'tags',
      key: 'tags',
      width: 200,
      render: (tags: Resource['tags']) => (
        <Space size={[8, 4]} wrap>
          {(tags ?? []).slice(0, 3).map((tag) => (
            <Tag key={tag} color="default">
              {tag}
            </Tag>
          ))}
        </Space>
      )
    },
    {
      title: '效能指標',
      key: 'metrics',
      width: 240,
      render: (_: unknown, record: Resource) => (
        <Space direction="vertical" size={6} style={{ width: '100%' }}>
          <Tooltip title={`CPU 使用率 ${formatPercent(record.cpu_usage)}`}>
            <Progress percent={Math.round(record.cpu_usage ?? 0)} strokeColor="#40a9ff" showInfo={false} />
          </Tooltip>
          <Tooltip title={`記憶體使用率 ${formatPercent(record.memory_usage)}`}>
            <Progress percent={Math.round(record.memory_usage ?? 0)} strokeColor="#9254de" showInfo={false} />
          </Tooltip>
          <Tooltip title={`磁碟使用率 ${formatPercent(record.disk_usage)}`}>
            <Progress percent={Math.round(record.disk_usage ?? 0)} strokeColor="#faad14" showInfo={false} />
          </Tooltip>
        </Space>
      )
    }
  ];

  return (
    <PageContainer>
      <PageHeader
        title="資源列表"
        subtitle="追蹤各環境資源健康度與資源群組負載概況。"
        icon={<ClusterOutlined />}
      />

      <div className="kpi-grid">
        <KpiCard
          title="受監控資源"
          value={stats.total}
          unit="台"
          status="normal"
          description={`健康 ${stats.healthyCount} 台 / 警示 ${stats.warningCount} 台`}
          icon={<DashboardOutlined />}
        />
        <KpiCard
          title="嚴重狀態"
          value={stats.criticalCount}
          unit="台"
          status={stats.criticalCount > 0 ? 'critical' : 'normal'}
          description="需立即處理的資源數"
          icon={<HddOutlined />}
          onClick={() => setStatusFilter('critical')}
        />
        <KpiCard
          title="平均 CPU"
          value={stats.avgCpu.toFixed(1)}
          unit="%"
          status={stats.avgCpu > 70 ? 'warning' : 'normal'}
          description={`平均記憶體 ${stats.avgMemory.toFixed(1)}%`}
          icon={<ClusterOutlined />}
        />
      </div>

      <SectionCard
        title="資源健康狀態"
        extra={
          <Space size="middle" wrap>
            <Segmented
              options={STATUS_FILTERS}
              value={statusFilter}
              onChange={(value) => setStatusFilter(value as (typeof STATUS_FILTERS)[number]['value'])}
            />
            <Segmented
              options={[
                { label: '所有環境', value: 'all' },
                ...environments.map((env) => ({ label: env, value: env })),
                ...(hasUndefinedEnvironment ? [{ label: '未設定', value: '__none' }] : [])
              ]}
              value={environmentFilter}
              onChange={(value) => setEnvironmentFilter(value as string)}
            />
            <Input.Search
              allowClear
              placeholder="搜尋資源名稱、位置或團隊"
              onSearch={(value) => setKeyword(value)}
              onChange={(event) => setKeyword(event.target.value)}
              style={{ width: 260 }}
            />
          </Space>
        }
      >
        <Table<Resource>
          rowKey="id"
          columns={columns}
          dataSource={filteredResources}
          loading={loading}
          pagination={{ pageSize: 10 }}
        />
      </SectionCard>
    </PageContainer>
  );
};
