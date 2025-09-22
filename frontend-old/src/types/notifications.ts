export type NotificationChannelHealthStatus = 'healthy' | 'warning' | 'critical' | 'unknown';

export type NotificationChannelHealth = {
  status: NotificationChannelHealthStatus;
  latencyMs?: number | null;
  attempts?: number | null;
  message?: string | null;
  checkedAt?: string | null;
};

export type NotificationChannel = {
  id: string;
  name: string;
  type: string;
  enabled: boolean;
  description?: string | null;
  endpoint?: string | null;
  defaultRecipients?: string[];
  metadata?: Record<string, unknown> | null;
  createdAt?: string | null;
  updatedAt?: string | null;
  health?: NotificationChannelHealth | null;
  historyCount?: number;
};

export type NotificationChannelListResponse = {
  items: unknown[];
  meta?: {
    total?: number;
    generated_at?: string;
  };
};

export type NotificationChannelHealthEntry = {
  id: string;
  channel_id: string;
  status: string;
  latency_ms?: number | null;
  attempts?: number | null;
  message?: string | null;
  checked_at?: string | null;
  source?: string | null;
};

export type NotificationChannelHealthHistoryResponse = {
  channel_id: string;
  items: NotificationChannelHealthEntry[];
};
