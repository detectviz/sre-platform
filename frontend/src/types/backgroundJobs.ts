export type BackgroundJobStatus = 'healthy' | 'warning' | 'critical' | 'paused';

export type BackgroundJobMetrics = {
  processedResources?: number;
  healthy?: number;
  warning?: number;
  critical?: number;
  automationCoverage?: number;
  staleResources?: number;
  generatedAt?: string;
  checkedChannels?: number;
  healthyChannels?: number;
  unhealthyChannels?: number;
  details?: Array<{
    id: string;
    name?: string;
    type?: string;
    status?: string;
    latencyMs?: number;
    attempts?: number;
    message?: string;
  }>;
  checkedAt?: string;
  [key: string]: unknown;
};

export type BackgroundJobHistoryEntry = {
  id: string;
  job_id: string;
  status: 'success' | 'failure';
  started_at: string;
  duration_ms: number;
  message: string;
  automatic?: boolean;
  metrics?: BackgroundJobMetrics | null;
};

export type BackgroundJob = {
  id: string;
  name: string;
  description?: string;
  status: BackgroundJobStatus;
  interval_minutes?: number;
  timezone?: string;
  cron_expression?: string | null;
  owner_team?: string | null;
  tags?: string[];
  last_run_at?: string | null;
  next_run_at?: string | null;
  last_duration_ms?: number | null;
  success_count?: number;
  failure_count?: number;
  consecutive_failures?: number;
  last_message?: string;
  metrics?: BackgroundJobMetrics;
  history?: BackgroundJobHistoryEntry[];
  created_at?: string;
  updated_at?: string;
};

export type BackgroundJobListResponse = {
  jobs: BackgroundJob[];
};

export type BackgroundJobHistoryResponse = {
  job_id: string;
  items: BackgroundJobHistoryEntry[];
};

