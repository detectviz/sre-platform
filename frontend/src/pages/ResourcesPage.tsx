import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ApartmentOutlined,
  BranchesOutlined,
  ExclamationCircleOutlined,
  HddOutlined,
  ReloadOutlined,
  SafetyCertificateOutlined,
  TeamOutlined,
} from '@ant-design/icons';
import { Button, Col, Row, Space, Tabs } from 'antd';

import { ContextualKPICard, PageHeader } from '../components';
import useBackgroundJobs from '../hooks/useBackgroundJobs';
import useResources from '../hooks/useResources';
import useResourceGroups from '../hooks/useResourceGroups';
import useResourceStatistics from '../hooks/useResourceStatistics';
import useResourceTopology from '../hooks/useResourceTopology';
import type { ResourceQueryParams } from '../types/resources';
import { enrichResourceGroups } from '../utils/resourceTransforms';

import {
  BackgroundJobsPanel,
  ResourceGroupsTab,
  ResourceOverviewTab,
  ResourceTopologyTab,
} from './resources';

export type ResourcesPageProps = {
  onNavigate: (key: string, params?: Record<string, unknown>) => void;
  pageKey: string;
  themeMode?: 'light' | 'dark';
};

const ResourcesPage = ({ onNavigate, pageKey, themeMode = 'dark' }: ResourcesPageProps) => {
  const [query, setQuery] = useState<ResourceQueryParams>({ page: 1, pageSize: 10, status: 'ALL' });

  // Data fetching hooks
  const { resources, pagination, loading: resourcesLoading, error: resourcesError, isFallback: resourcesFallback, refresh: refreshResources } = useResources(query);
  const { resourceGroups, loading: groupsLoading, error: groupsError, refresh: refreshGroups } = useResourceGroups();
  const { topology, loading: topologyLoading, error: topologyError, refresh: refreshTopology } = useResourceTopology(
    resources,
    resourceGroups,
    { enabled: pageKey === 'resource-topology' },
  );
  const { jobs, loading: jobLoading, error: jobError, isFallback: jobFallback, summary: jobSummary, refresh: refreshJobs } = useBackgroundJobs();

  // Memoized derived data
  const enrichedGroups = useMemo(
    () => enrichResourceGroups(resourceGroups, resources),
    [resourceGroups, resources],
  );
  const { stats, loading: statsLoading } = useResourceStatistics(resources, resourceGroups);

  // Handlers
  const handleQueryChange = useCallback((patch: Partial<ResourceQueryParams>) => {
    setQuery((prev) => ({ ...prev, page: 1, ...patch }));
  }, []);

  const handleRefreshAll = useCallback(() => {
    refreshResources();
    refreshGroups();
    refreshJobs();
    if (pageKey === 'resource-topology') {
      refreshTopology();
    }
  }, [refreshResources, refreshGroups, refreshJobs, pageKey, refreshTopology]);

  const kpiCards = [
    {
      key: 'total',
      title: '總資源數',
      value: stats.total,
      unit: '個',
      status: 'info' as const,
      description: stats.lastUpdatedAt ? `更新於 ${stats.lastUpdatedAt}` : '—',
      icon: <HddOutlined />,
    },
    {
      key: 'healthy',
      title: '健康資源',
      value: stats.healthy,
      unit: '個',
      status: 'success' as const,
      description: stats.total > 0 ? `佔比 ${Math.round((stats.healthy / stats.total) * 100)}%` : '—',
      icon: <SafetyCertificateOutlined />,
    },
    {
      key: 'warning',
      title: '警示資源',
      value: stats.warning,
      unit: '個',
      status: 'warning' as const,
      description: stats.warning > 0 ? '請優先關注' : '無警示資源',
      icon: <ExclamationCircleOutlined />,
    },
    {
      key: 'groups',
      title: '群組數量',
      value: stats.groups,
      unit: '組',
      status: 'info' as const,
      description: `${stats.emptyGroups} 個為空`,
      icon: <ApartmentOutlined />,
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
          loading={resourcesLoading}
          error={resourcesError}
          query={query}
          onQueryChange={handleQueryChange}
          onNavigate={onNavigate}
          onRefresh={refreshResources}
          resourceGroups={resourceGroups}
          isFallback={resourcesFallback}
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
          loading={groupsLoading}
          error={groupsError}
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
          onRefresh={refreshTopology}
          themeMode={themeMode}
        />
      ),
    },
  ]), [
    resources, pagination, resourcesLoading, resourcesError, query, handleQueryChange, onNavigate, refreshResources, resourceGroups, resourcesFallback,
    enrichedGroups, groupsLoading, groupsError, refreshGroups,
    topology, topologyLoading, topologyError, refreshTopology, themeMode,
  ]);

  const activeKey = tabItems.some((item) => item.key === pageKey) ? pageKey : 'resource-overview';

  // Set document title
  useEffect(() => {
    const currentTab = tabItems.find(item => item.key === activeKey);
    if (currentTab) {
      document.title = `${currentTab.label.props.children[1].props.children} - SRE 平台`;
    }
  }, [activeKey, tabItems]);

  return (
    <Space direction="vertical" size={24} style={{ width: '100%' }}>
      <PageHeader
        title="資源管理中心"
        subtitle="探索、組織與管理您的所有基礎設施資源"
        actions={[
          <Button key="refresh" icon={<ReloadOutlined />} onClick={handleRefreshAll}>
            重新整理
          </Button>,
        ]}
      />

      <Row gutter={[24, 24]}>
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
        type="card"
        items={tabItems}
        activeKey={activeKey}
        onChange={(key) => onNavigate(key)}
      />
    </Space>
  );
};

export default ResourcesPage;
