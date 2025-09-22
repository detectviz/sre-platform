import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';

const useIncidents = () => {
  const [incidents, setIncidents] = useState<unknown[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchIncidents = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await api.getIncidents();
      if (Array.isArray(data)) {
        setIncidents(data);
      } else if (data && typeof data === 'object' && Array.isArray((data as { items?: unknown[] }).items)) {
        setIncidents((data as { items: unknown[] }).items);
      } else {
        setIncidents([]);
      }
    } catch (err) {
      const normalizedError = err instanceof Error ? err : new Error('無法取得事件列表');
      setError(normalizedError);
      throw normalizedError;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchIncidents().catch(() => undefined);
  }, [fetchIncidents]);

  return {
    incidents,
    loading,
    error,
    refetch: fetchIncidents,
  };
};

export default useIncidents;
