import { useCallback, useEffect, useState } from 'react';
import type { ResourceGroup, ResourceGroupListResponse } from '../types/resources';
import fallbackDb from '../mocks/db.json';
import { fetchJson } from '../utils/apiClient';
import { normalizeResourceGroups } from '../utils/resourceTransforms';

type ApiPayload = ResourceGroupListResponse | { items?: unknown[] } | unknown[];

type UseResourceGroupsOptions = {
  refreshKey?: string | number;
};

type UseResourceGroupsResult = {
  resourceGroups: ResourceGroup[];
  loading: boolean;
  error: unknown;
  isFallback: boolean;
  refresh: () => void;
};

const fallbackRawGroups = Array.isArray((fallbackDb as Record<string, unknown>).resource_groups)
  ? ((fallbackDb as Record<string, unknown>).resource_groups as unknown[])
  : [];
const fallbackGroups = normalizeResourceGroups(fallbackRawGroups);

const parsePayload = (response: ApiPayload): ResourceGroup[] => {
  if (Array.isArray(response)) {
    return normalizeResourceGroups(response);
  }

  if (response && typeof response === 'object') {
    const objectPayload = response as Record<string, unknown>;
    if (Array.isArray(objectPayload.items)) {
      return normalizeResourceGroups(objectPayload.items);
    }

    if (Array.isArray(objectPayload.data)) {
      return normalizeResourceGroups(objectPayload.data);
    }

    if (Array.isArray(objectPayload.resource_groups)) {
      return normalizeResourceGroups(objectPayload.resource_groups as unknown[]);
    }
  }

  return fallbackGroups;
};

const useResourceGroups = (options: UseResourceGroupsOptions = {}): UseResourceGroupsResult => {
  const { refreshKey } = options;
  const [resourceGroups, setResourceGroups] = useState<ResourceGroup[]>(fallbackGroups);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);
  const [isFallback, setIsFallback] = useState(true);

  const fetchData = useCallback(
    async (signal?: AbortSignal) => {
      setLoading(true);
      try {
        let response: ApiPayload;
        try {
          response = await fetchJson<ApiPayload>('/resource-groups', { signal });
        } catch (primaryError) {
          if (signal?.aborted) {
            throw primaryError;
          }
          response = await fetchJson<ApiPayload>('/resource_groups', { signal });
        }

        const groups = parsePayload(response);
        setResourceGroups(groups);
        setIsFallback(false);
        setError(null);
      } catch (err) {
        setError(err);
        setResourceGroups(fallbackGroups);
        setIsFallback(true);
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    const controller = new AbortController();
    fetchData(controller.signal);
    return () => controller.abort();
  }, [fetchData, refreshKey]);

  const refresh = useCallback(() => {
    fetchData();
  }, [fetchData]);

  return {
    resourceGroups,
    loading,
    error,
    isFallback,
    refresh,
  };
};

export default useResourceGroups;
