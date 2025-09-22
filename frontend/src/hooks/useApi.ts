import { useCallback, useEffect, useState } from 'react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

/**
 * 列表回應的泛型定義。
 */
export interface ApiListResponse<T> {
  items?: T[];
  page?: number;
  page_size?: number;
  total?: number;
  has_more?: boolean;
}

interface UseApiListOptions {
  /** 是否在掛載時即刻發送請求，預設為 true */
  immediate?: boolean;
}

export function useApiList<ResponseType extends ApiListResponse<unknown>>(path: string, options: UseApiListOptions = {}) {
  const { immediate = true } = options;
  const [data, setData] = useState<ResponseType | null>(null);
  const [loading, setLoading] = useState<boolean>(immediate);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${API_BASE_URL}${path}`);
      if (!response.ok) {
        throw new Error(`API 回應錯誤: ${response.status}`);
      }
      const json = (await response.json()) as ResponseType;
      setData(json);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [path]);

  useEffect(() => {
    if (immediate) {
      fetchData();
    }
  }, [fetchData, immediate]);

  return {
    data,
    loading,
    error,
    refresh: fetchData
  };
}

export function useApiGet<ResponseType>(path: string, options: UseApiListOptions = {}) {
  const { immediate = true } = options;
  const [data, setData] = useState<ResponseType | null>(null);
  const [loading, setLoading] = useState<boolean>(immediate);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${API_BASE_URL}${path}`);
      if (!response.ok) {
        throw new Error(`API 回應錯誤: ${response.status}`);
      }
      const json = (await response.json()) as ResponseType;
      setData(json);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [path]);

  useEffect(() => {
    if (immediate) {
      fetchData();
    }
  }, [fetchData, immediate]);

  return {
    data,
    loading,
    error,
    refresh: fetchData
  };
}
