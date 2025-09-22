import { useCallback, useEffect, useMemo, useState } from 'react';
import api from '../services/api';

// Based on the TagKey schema in openapi.yaml
export type Tag = {
  id: string;
  key_name: string;
  description: string | null;
  is_required: boolean;
  validation_regex: string | null;
  compliance_category: string | null;
  usage_count: number;
  enforcement_level: 'advisory' | 'warning' | 'blocking';
};

export type UseTagsResult = {
  tags: Tag[];
  loading: boolean;
  error: unknown;
  refresh: () => void;
};

const useTags = (): UseTagsResult => {
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);

  const fetchTags = useCallback(async (signal?: AbortSignal) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.getTags();
      if (!signal?.aborted) {
        // The API might return an object with an `items` property
        const items = Array.isArray(response) ? response : response?.items ?? [];
        setTags(items);
      }
    } catch (err) {
      if (!signal?.aborted) {
        setError(err);
        console.error("Failed to fetch tags:", err);
      }
    } finally {
      if (!signal?.aborted) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    fetchTags(controller.signal);
    return () => controller.abort();
  }, [fetchTags]);

  const refresh = useCallback(() => {
    fetchTags();
  }, [fetchTags]);

  return useMemo(() => ({
    tags,
    loading,
    error,
    refresh,
  }), [tags, loading, error, refresh]);
};

export default useTags;
