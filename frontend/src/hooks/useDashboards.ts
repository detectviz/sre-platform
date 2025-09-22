import { useCallback, useEffect, useMemo, useState } from 'react';
import { dashboardSamples, dashboardStatsSample } from '../mocks/dashboardSamples';
import type { DashboardCategory, DashboardDefinition, DashboardStats } from '../types/dashboards';
import { fetchJson } from '../utils/apiClient';

const fallbackDashboards = dashboardSamples;
const fallbackStats = dashboardStatsSample;

const ensureCategory = (value: unknown): DashboardCategory => {
  const category = typeof value === 'string' ? value.toLowerCase() : 'custom';
  if (['infrastructure', 'business', 'operations', 'automation', 'custom'].includes(category)) {
    return category as DashboardCategory;
  }
  return 'custom';
};

const normalizeDashboard = (value: Record<string, unknown>): DashboardDefinition => {
  const id = typeof value.id === 'string' && value.id.trim() ? value.id.trim() : `dashboard_${Math.random().toString(36).slice(2, 8)}`;
  const name = typeof value.name === 'string' && value.name.trim() ? value.name.trim() : '未命名儀表板';
  const description = typeof value.description === 'string' ? value.description : undefined;
  const category = ensureCategory(value.category);
  const owner = typeof value.owner === 'string' ? value.owner : undefined;
  const tags = Array.isArray(value.tags)
    ? value.tags.filter((tag): tag is string => typeof tag === 'string' && tag.trim()).map((tag) => tag.trim())
    : undefined;
  const viewers = typeof value.viewers === 'number' ? value.viewers : undefined;
  const favoriteCount = typeof value.favorite_count === 'number'
    ? value.favorite_count
    : typeof value.favoriteCount === 'number'
      ? value.favoriteCount
      : undefined;
  const panelCount = typeof value.panel_count === 'number'
    ? value.panel_count
    : typeof value.panelCount === 'number'
      ? value.panelCount
      : undefined;
  const status = typeof value.status === 'string' ? (value.status.toLowerCase() as DashboardDefinition['status']) : undefined;
  const updatedAt = typeof value.updated_at === 'string'
    ? value.updated_at
    : typeof value.updatedAt === 'string'
      ? value.updatedAt
      : undefined;
  const isDefaultRaw = value.is_default ?? value.isDefault;
  const isDefault: boolean = typeof isDefaultRaw === 'boolean'
    ? isDefaultRaw
    : typeof isDefaultRaw === 'string'
      ? ['true', '1', 'yes'].includes(isDefaultRaw.toLowerCase())
      : Boolean(isDefaultRaw);
  const isFeaturedRaw = value.is_featured ?? value.isFeatured;
  const isFeatured: boolean = typeof isFeaturedRaw === 'boolean'
    ? isFeaturedRaw
    : typeof isFeaturedRaw === 'string'
      ? ['true', '1', 'yes'].includes(isFeaturedRaw.toLowerCase())
      : Boolean(isFeaturedRaw);
  const dataSources = Array.isArray(value.data_sources)
    ? value.data_sources.filter((item): item is string => typeof item === 'string' && item.trim()).map((item) => item.trim())
    : Array.isArray(value.dataSources)
      ? value.dataSources.filter((item): item is string => typeof item === 'string' && item.trim()).map((item) => item.trim())
      : undefined;
  const thumbnailUrl = typeof value.thumbnail_url === 'string'
    ? value.thumbnail_url
    : typeof value.thumbnailUrl === 'string'
      ? value.thumbnailUrl
      : undefined;
  const targetPageKey = typeof value.target_page_key === 'string'
    ? value.target_page_key
    : typeof value.targetPageKey === 'string'
      ? value.targetPageKey
      : undefined;

  return {
    id,
    name,
    description,
    category,
    owner,
    tags,
    viewers,
    favoriteCount,
    panelCount,
    status,
    updatedAt,
    isDefault,
    isFeatured,
    dataSources,
    thumbnailUrl,
    targetPageKey,
  } satisfies DashboardDefinition;
};

const extractDashboards = (payload: unknown): DashboardDefinition[] => {
  if (!payload || typeof payload !== 'object') {
    return [];
  }

  const container = payload as Record<string, unknown>;
  const candidates = Array.isArray(container.items)
    ? container.items
    : Array.isArray(container.data)
      ? container.data
      : Array.isArray(container.dashboards)
        ? container.dashboards
        : Array.isArray(container.results)
          ? container.results
          : [];

  if (!Array.isArray(candidates) || candidates.length === 0) {
    return [];
  }

  return candidates
    .filter((item): item is Record<string, unknown> => !!item && typeof item === 'object')
    .map((item) => normalizeDashboard(item));
};

const computeStats = (dashboards: DashboardDefinition[]): DashboardStats => {
  if (!dashboards.length) {
    return fallbackStats;
  }
  const total = dashboards.length;
  const published = dashboards.filter((item) => item.status === 'published').length;
  const custom = dashboards.filter((item) => item.category === 'custom').length;
  const averagePanelCount = Math.round(
    dashboards.reduce((accumulator, item) => accumulator + (item.panelCount ?? 0), 0) /
      Math.max(1, dashboards.length),
  );
  const automationCoverage = Math.round(
    (dashboards.filter((item) => item.category === 'automation').length / Math.max(1, dashboards.length)) * 100,
  );
  const lastUpdatedAt = dashboards
    .map((item) => item.updatedAt)
    .filter((value): value is string => typeof value === 'string')
    .sort()
    .reverse()[0];

  return {
    totalDashboards: total,
    publishedDashboards: published,
    customDashboards: custom,
    averagePanelCount,
    automationCoverage,
    lastUpdatedAt,
  };
};

const extractStats = (payload: unknown, dashboards: DashboardDefinition[]): DashboardStats => {
  if (!payload || typeof payload !== 'object') {
    return computeStats(dashboards);
  }
  const container = payload as Record<string, unknown>;
  const total = typeof container.total_dashboards === 'number'
    ? container.total_dashboards
    : typeof container.totalDashboards === 'number'
      ? container.totalDashboards
      : dashboards.length;
  const published = typeof container.published_dashboards === 'number'
    ? container.published_dashboards
    : typeof container.publishedDashboards === 'number'
      ? container.publishedDashboards
      : dashboards.filter((item) => item.status === 'published').length;
  const custom = typeof container.custom_dashboards === 'number'
    ? container.custom_dashboards
    : typeof container.customDashboards === 'number'
      ? container.customDashboards
      : dashboards.filter((item) => item.category === 'custom').length;
  const avgPanel = typeof container.average_panel_count === 'number'
    ? container.average_panel_count
    : typeof container.averagePanelCount === 'number'
      ? container.averagePanelCount
      : computeStats(dashboards).averagePanelCount;
  const automation = typeof container.automation_coverage === 'number'
    ? container.automation_coverage
    : typeof container.automationCoverage === 'number'
      ? container.automationCoverage
      : computeStats(dashboards).automationCoverage;
  const lastUpdatedAt = typeof container.last_updated_at === 'string'
    ? container.last_updated_at
    : typeof container.lastUpdatedAt === 'string'
      ? container.lastUpdatedAt
      : computeStats(dashboards).lastUpdatedAt;

  return {
    totalDashboards: total,
    publishedDashboards: published,
    customDashboards: custom,
    averagePanelCount: avgPanel,
    automationCoverage: automation,
    lastUpdatedAt,
  };
};

export const useDashboards = () => {
  const [dashboards, setDashboards] = useState<DashboardDefinition[]>(fallbackDashboards);
  const [stats, setStats] = useState<DashboardStats>(fallbackStats);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [isFallback, setIsFallback] = useState<boolean>(true);

  const fetchData = useCallback(async (signal?: AbortSignal) => {
    setLoading(true);
    try {
      const [dashboardsResult, statsResult] = await Promise.allSettled([
        fetchJson<unknown>('dashboards', { signal }),
        fetchJson<unknown>('dashboards/stats', { signal }),
      ]);

      const dashboardsPayload = dashboardsResult.status === 'fulfilled' ? dashboardsResult.value : null;
      const statsPayload = statsResult.status === 'fulfilled' ? statsResult.value : null;

      if (dashboardsResult.status === 'rejected') {
        const reason = dashboardsResult.reason;
        setError(reason instanceof Error ? reason : new Error(String(reason ?? '未知錯誤')));
      }

      const normalized = extractDashboards(dashboardsPayload ?? {});
      if (normalized.length) {
        setDashboards(normalized);
        setIsFallback(false);
      } else {
        setDashboards(fallbackDashboards);
        setIsFallback(true);
      }

      const resolvedStats = statsPayload
        ? extractStats(statsPayload, normalized.length ? normalized : fallbackDashboards)
        : normalized.length
          ? computeStats(normalized)
          : fallbackStats;
      setStats(resolvedStats);

      if (dashboardsResult.status === 'fulfilled') {
        setError(null);
      }
    } catch (err) {
      if ((err as { name?: string }).name === 'AbortError') {
        return;
      }
      setDashboards(fallbackDashboards);
      setStats(fallbackStats);
      setIsFallback(true);
      setError(err instanceof Error ? err : new Error(String(err ?? '未知錯誤')));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    fetchData(controller.signal);
    return () => controller.abort();
  }, [fetchData]);

  const refresh = useCallback(() => {
    fetchData();
  }, [fetchData]);

  const categorized = useMemo(() => {
    return dashboards.reduce<Record<DashboardCategory, DashboardDefinition[]>>((acc, item) => {
      if (!acc[item.category]) {
        acc[item.category] = [] as DashboardDefinition[];
      }
      acc[item.category]?.push(item);
      return acc;
    }, {
      infrastructure: [],
      business: [],
      operations: [],
      automation: [],
      custom: [],
    });
  }, [dashboards]);

  return {
    dashboards,
    stats,
    loading,
    error,
    isFallback,
    categorized,
    refresh,
  } as const;
};

export default useDashboards;
