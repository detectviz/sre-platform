import { useEffect, useMemo, useState } from 'react';
import type { Resource, ResourceGroup, ResourceStatistics } from '../types/resources';
import { fetchJson } from '../utils/apiClient';
import { calculateResourceStatistics } from '../utils/resourceTransforms';

type UseResourceStatisticsOptions = {
  enabled?: boolean;
};

type UseResourceStatisticsResult = {
  stats: ResourceStatistics;
  loading: boolean;
  error: unknown;
  isFallback: boolean;
};

const useResourceStatistics = (
  resources: Resource[],
  resourceGroups: ResourceGroup[] = [],
  options: UseResourceStatisticsOptions = {},
): UseResourceStatisticsResult => {
  const baseline = useMemo(
    () => calculateResourceStatistics(resources, resourceGroups),
    [resources, resourceGroups],
  );

  const [stats, setStats] = useState<ResourceStatistics>(baseline);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<unknown>(null);
  const [isFallback, setIsFallback] = useState(true);

  useEffect(() => {
    setStats(baseline);
    setIsFallback(true);
  }, [baseline]);

  useEffect(() => {
    if (options.enabled === false) {
      return;
    }

    const controller = new AbortController();

    const fetchStatistics = async () => {
      setLoading(true);
      try {
        const response = await fetchJson<ResourceStatistics>('/resources/statistics', {
          signal: controller.signal,
        });
        setStats((previous) => ({
          ...previous,
          ...response,
          groups: response.groups ?? resourceGroups.length,
          lastUpdatedAt: response.lastUpdatedAt ?? previous.lastUpdatedAt,
        }));
        setIsFallback(false);
        setError(null);
      } catch (err) {
        if (!controller.signal.aborted) {
          setError(err);
          setIsFallback(true);
          setStats(calculateResourceStatistics(resources, resourceGroups));
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    fetchStatistics();

    return () => controller.abort();
  }, [options.enabled, resourceGroups, resources]);

  return { stats, loading, error, isFallback };
};

export default useResourceStatistics;
