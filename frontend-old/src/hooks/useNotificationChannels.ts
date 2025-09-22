import { useCallback, useEffect, useMemo, useState } from 'react';
import dayjs from 'dayjs';
import fallbackDb from '../mocks/db.json';
import { fetchJson } from '../utils/apiClient';
import type {
  NotificationChannel,
  NotificationChannelHealth,
  NotificationChannelListResponse,
} from '../types/notifications';

const fallbackChannels: NotificationChannel[] = Array.isArray((fallbackDb as Record<string, unknown>).notification_channels)
  ? ((fallbackDb as Record<string, unknown>).notification_channels as Record<string, unknown>[]).map((channel) => ({
      id: typeof channel.id === 'string' ? channel.id : `channel_${Math.random().toString(36).slice(2, 6)}`,
      name: typeof channel.name === 'string' ? channel.name : '未命名通知管道',
      type: typeof channel.type === 'string' ? channel.type : 'email',
      enabled: channel.enabled !== false,
      description: typeof channel.description === 'string' ? channel.description : null,
      endpoint: typeof channel.endpoint === 'string' ? channel.endpoint : null,
      defaultRecipients: Array.isArray(channel.default_recipients)
        ? channel.default_recipients.map((recipient) => String(recipient))
        : [],
      metadata: typeof channel.metadata === 'object' && channel.metadata !== null ? channel.metadata as Record<string, unknown> : null,
      createdAt: typeof channel.created_at === 'string' ? channel.created_at : null,
      updatedAt: typeof channel.updated_at === 'string' ? channel.updated_at : null,
      health: {
        status: 'unknown',
        checkedAt: dayjs().subtract(1, 'day').toISOString(),
        message: '離線樣本資料',
      },
    }))
  : [];

const normalizeHealth = (input: unknown): NotificationChannelHealth | null => {
  if (!input || typeof input !== 'object') {
    return null;
  }
  const health = input as Record<string, unknown>;
  const statusRaw = typeof health.status === 'string' ? health.status.toLowerCase() : 'unknown';
  const status: NotificationChannelHealth['status'] = ['healthy', 'warning', 'critical'].includes(statusRaw)
    ? (statusRaw as NotificationChannelHealth['status'])
    : 'unknown';
  return {
    status,
    latencyMs: typeof health.latency_ms === 'number' ? health.latency_ms : typeof health.latencyMs === 'number' ? health.latencyMs : undefined,
    attempts: typeof health.attempts === 'number' ? health.attempts : undefined,
    message: typeof health.message === 'string' ? health.message : undefined,
    checkedAt: typeof health.checked_at === 'string' ? health.checked_at : typeof health.checkedAt === 'string' ? health.checkedAt : undefined,
  };
};

const normalizeChannel = (input: unknown): NotificationChannel => {
  const raw = (input ?? {}) as Record<string, unknown>;
  const idCandidate = raw.id ?? raw.channel_id ?? raw.key;
  const id = typeof idCandidate === 'string' && idCandidate.trim() ? idCandidate.trim() : `channel_${Math.random().toString(36).slice(2, 6)}`;
  return {
    id,
    name: typeof raw.name === 'string' ? raw.name : '未命名通知管道',
    type: typeof raw.type === 'string' ? raw.type : 'email',
    enabled: raw.enabled !== false,
    description: typeof raw.description === 'string' ? raw.description : null,
    endpoint: typeof raw.endpoint === 'string' ? raw.endpoint : typeof raw.webhook_url === 'string' ? raw.webhook_url : null,
    defaultRecipients: Array.isArray(raw.default_recipients)
      ? (raw.default_recipients as unknown[]).map((recipient) => String(recipient))
      : [],
    metadata: typeof raw.metadata === 'object' && raw.metadata !== null ? (raw.metadata as Record<string, unknown>) : null,
    createdAt: typeof raw.created_at === 'string' ? raw.created_at : null,
    updatedAt: typeof raw.updated_at === 'string' ? raw.updated_at : null,
    health: normalizeHealth(raw.health),
    historyCount: typeof raw.history_count === 'number' ? raw.history_count : undefined,
  };
};

const parseChannelResponse = (payload: unknown): NotificationChannel[] => {
  if (Array.isArray(payload)) {
    return payload.map((item) => normalizeChannel(item));
  }
  if (payload && typeof payload === 'object') {
    const objectPayload = payload as NotificationChannelListResponse;
    if (Array.isArray(objectPayload.items)) {
      return objectPayload.items.map((item) => normalizeChannel(item));
    }
  }
  return fallbackChannels;
};

export type UseNotificationChannelsResult = {
  channels: NotificationChannel[];
  loading: boolean;
  error: unknown;
  isFallback: boolean;
  refresh: () => void;
};

const useNotificationChannels = (): UseNotificationChannelsResult => {
  const [channels, setChannels] = useState<NotificationChannel[]>(fallbackChannels);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);
  const [isFallback, setIsFallback] = useState(true);

  const fetchChannels = useCallback(async (signal?: AbortSignal) => {
    setLoading(true);
    try {
      const response = await fetchJson<NotificationChannelListResponse | NotificationChannel[]>(
        '/notification-channels',
        { signal },
      );
      const parsed = parseChannelResponse(response);
      if (!signal?.aborted) {
        setChannels(parsed);
        setIsFallback(false);
        setError(null);
      }
    } catch (err) {
      if (!signal?.aborted) {
        setChannels(fallbackChannels);
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
    fetchChannels(controller.signal);
    return () => controller.abort();
  }, [fetchChannels]);

  const refresh = useCallback(() => {
    fetchChannels();
  }, [fetchChannels]);

  return useMemo(() => ({
    channels,
    loading,
    error,
    isFallback,
    refresh,
  }), [channels, loading, error, isFallback, refresh]);
};

export default useNotificationChannels;
