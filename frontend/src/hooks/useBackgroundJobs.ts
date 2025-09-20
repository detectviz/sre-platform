import { useCallback, useEffect, useMemo, useState } from 'react';
import dayjs from 'dayjs';
import { fetchJson } from '../utils/apiClient';
import type {
  BackgroundJob,
  BackgroundJobListResponse,
  BackgroundJobStatus,
} from '../types/backgroundJobs';

const fallbackJobs: BackgroundJob[] = [
  {
    id: 'resource_kpi_precompute',
    name: '資源 KPI 預計算作業',
    description: '每分鐘匯總資源快照，提供資源頁面即時統計。',
    status: 'warning',
    interval_minutes: 1,
    last_run_at: dayjs().subtract(2, 'minute').toISOString(),
    next_run_at: dayjs().add(1, 'minute').toISOString(),
    last_duration_ms: 120,
    success_count: 128,
    failure_count: 1,
    consecutive_failures: 0,
    last_message: '已更新 148 筆資源指標 (fallback)',
    metrics: {
      processedResources: 148,
      healthy: 96,
      warning: 38,
      critical: 14,
      automationCoverage: 64,
      staleResources: 7,
      generatedAt: dayjs().subtract(2, 'minute').toISOString(),
    },
    owner_team: 'team_observability',
    tags: ['cmdb', 'metrics'],
  },
  {
    id: 'notification_channel_health_probe',
    name: '通知管道健康檢查',
    description: '每 15 分鐘巡檢 Grafana 通知管道健康度。',
    status: 'healthy',
    interval_minutes: 15,
    last_run_at: dayjs().subtract(8, 'minute').toISOString(),
    next_run_at: dayjs().add(7, 'minute').toISOString(),
    last_duration_ms: 230,
    success_count: 56,
    failure_count: 2,
    consecutive_failures: 0,
    last_message: '所有管道響應正常 (fallback)',
    metrics: {
      checkedChannels: 6,
      healthyChannels: 6,
      unhealthyChannels: 0,
      checkedAt: dayjs().subtract(8, 'minute').toISOString(),
    },
    owner_team: 'team_notifications',
    tags: ['grafana', 'health-check'],
  },
];

type UseBackgroundJobsResult = {
  jobs: BackgroundJob[];
  loading: boolean;
  error: unknown;
  isFallback: boolean;
  unhealthyJobs: BackgroundJob[];
  summary: {
    total: number;
    healthy: number;
    warning: number;
    critical: number;
  };
  refresh: () => void;
};

const normalizeStatus = (value: string | undefined): BackgroundJobStatus => {
  if (!value) return 'healthy';
  const normalized = value.toLowerCase();
  if (normalized === 'warning') return 'warning';
  if (normalized === 'critical') return 'critical';
  if (normalized === 'paused') return 'paused';
  return 'healthy';
};

const normalizeJob = (job: BackgroundJob): BackgroundJob => ({
  ...job,
  status: normalizeStatus(job.status),
  tags: Array.isArray(job.tags) ? job.tags : [],
});

const parseJobPayload = (payload: unknown): BackgroundJob[] => {
  if (!payload || typeof payload !== 'object') {
    return fallbackJobs;
  }
  const objectPayload = payload as BackgroundJobListResponse;
  if (Array.isArray(objectPayload.jobs)) {
    return objectPayload.jobs.map((item) => normalizeJob(item));
  }
  if (Array.isArray((objectPayload as unknown as BackgroundJob[]))) {
    return (objectPayload as unknown as BackgroundJob[]).map((item) => normalizeJob(item));
  }
  return fallbackJobs;
};

const useBackgroundJobs = (): UseBackgroundJobsResult => {
  const [jobs, setJobs] = useState<BackgroundJob[]>(fallbackJobs);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);
  const [isFallback, setIsFallback] = useState(true);

  const fetchJobs = useCallback(async (signal?: AbortSignal) => {
    setLoading(true);
    try {
      const response = await fetchJson<BackgroundJobListResponse | BackgroundJob[]>('/background-jobs', { signal });
      const parsed = parseJobPayload(response);
      setJobs(parsed);
      setIsFallback(false);
      setError(null);
    } catch (err) {
      if (!signal?.aborted) {
        setJobs(fallbackJobs);
        setIsFallback(true);
        setError(err);
      }
    } finally {
      if (!signal?.aborted) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    fetchJobs(controller.signal);
    return () => controller.abort();
  }, [fetchJobs]);

  const unhealthyJobs = useMemo(
    () => jobs.filter((job) => job.status === 'warning' || job.status === 'critical'),
    [jobs],
  );

  const summary = useMemo(() => ({
    total: jobs.length,
    healthy: jobs.filter((job) => job.status === 'healthy').length,
    warning: jobs.filter((job) => job.status === 'warning').length,
    critical: jobs.filter((job) => job.status === 'critical').length,
  }), [jobs]);

  const refresh = useCallback(() => {
    fetchJobs();
  }, [fetchJobs]);

  return {
    jobs,
    loading,
    error,
    isFallback,
    unhealthyJobs,
    summary,
    refresh,
  };
};

export default useBackgroundJobs;
