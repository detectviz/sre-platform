import { useCallback, useEffect, useMemo, useState } from 'react';
import fallbackDb from '../mocks/db.json';
import { fetchJson } from '../utils/apiClient';

// Define the NotificationPolicy type, as it's not in the shared types file yet.
export type NotificationPolicy = {
  id: string;
  name: string;
  description: string | null;
  channels: string[];
  severity: string[];
  createdAt: string | null;
  updatedAt: string | null;
};

// Define the expected API response structure.
export type NotificationPolicyListResponse = {
  items: unknown[];
  meta?: {
    total?: number;
    generated_at?: string;
  };
};

const fallbackPolicies: NotificationPolicy[] = (fallbackDb.notification_policies ?? []).map((policy: any) => ({
    id: policy.id ?? `policy_${Math.random().toString(36).slice(2, 9)}`,
    name: policy.name ?? '未命名策略',
    description: policy.description ?? null,
    channels: policy.channels ?? [],
    severity: policy.severity ?? [],
    createdAt: policy.created_at ?? null,
    updatedAt: policy.updated_at ?? null,
}));

const normalizePolicy = (input: unknown): NotificationPolicy => {
  const raw = (input ?? {}) as Record<string, unknown>;
  const idCandidate = raw.id ?? raw.policy_id ?? raw.key;
  const id = typeof idCandidate === 'string' && idCandidate.trim() ? idCandidate.trim() : `policy_${Math.random().toString(36).slice(2, 9)}`;

  return {
    id,
    name: typeof raw.name === 'string' ? raw.name : '未命名策略',
    description: typeof raw.description === 'string' ? raw.description : null,
    channels: Array.isArray(raw.channels) ? raw.channels.map(String) : [],
    severity: Array.isArray(raw.severity) ? raw.severity.map(String) : [],
    createdAt: typeof raw.created_at === 'string' ? raw.created_at : null,
    updatedAt: typeof raw.updated_at === 'string' ? raw.updated_at : null,
  };
};

const parsePolicyResponse = (payload: unknown): NotificationPolicy[] => {
  if (Array.isArray(payload)) {
    return payload.map(normalizePolicy);
  }
  if (payload && typeof payload === 'object') {
    const objectPayload = payload as NotificationPolicyListResponse;
    if (Array.isArray(objectPayload.items)) {
      return objectPayload.items.map(normalizePolicy);
    }
  }
  return fallbackPolicies;
};

export type UseNotificationPoliciesResult = {
  policies: NotificationPolicy[];
  loading: boolean;
  error: unknown;
  isFallback: boolean;
  refresh: () => void;
};

const useNotificationPolicies = (): UseNotificationPoliciesResult => {
  const [policies, setPolicies] = useState<NotificationPolicy[]>(fallbackPolicies);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);
  const [isFallback, setIsFallback] = useState(true);

  const fetchPolicies = useCallback(async (signal?: AbortSignal) => {
    setLoading(true);
    try {
      // Endpoint defined in `services/api.ts`
      const response = await fetchJson<NotificationPolicyListResponse | NotificationPolicy[]>(
        '/notification-policies',
        { signal },
      );
      const parsed = parsePolicyResponse(response);
      if (!signal?.aborted) {
        setPolicies(parsed);
        setIsFallback(false);
        setError(null);
      }
    } catch (err) {
      if (!signal?.aborted) {
        setPolicies(fallbackPolicies);
        setIsFallback(true);
        setError(err);
        console.error("Failed to fetch notification policies:", err);
      }
    } finally {
      if (!signal?.aborted) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    fetchPolicies(controller.signal);
    return () => controller.abort();
  }, [fetchPolicies]);

  const refresh = useCallback(() => {
    fetchPolicies();
  }, [fetchPolicies]);

  return useMemo(() => ({
    policies,
    loading,
    error,
    isFallback,
    refresh,
  }), [policies, loading, error, isFallback, refresh]);
};

export default useNotificationPolicies;
