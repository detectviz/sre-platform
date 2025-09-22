import { useCallback, useEffect, useState } from 'react';
import api from '../services/api';

const useNotifications = () => {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.getNotifications();
      const items = Array.isArray(data)
        ? data
        : Array.isArray((data as { items?: unknown[] })?.items)
          ? (data as { items: unknown[] }).items
          : [];
      setNotifications(items);
      setError(null);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  return { notifications, loading, error, refresh: fetchNotifications };
};

export default useNotifications;
