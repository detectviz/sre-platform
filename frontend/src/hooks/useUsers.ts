import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';

export type User = {
  id: string;
  name: string;
  email: string;
  is_active: boolean;
  last_login_at: string;
  roles: string[];
  teams: string[];
};

const isUser = (candidate: unknown): candidate is User => {
  if (!candidate || typeof candidate !== 'object') {
    return false;
  }
  const possibleUser = candidate as Partial<User>;
  return (
    typeof possibleUser.id === 'string'
    && typeof possibleUser.name === 'string'
    && typeof possibleUser.email === 'string'
  );
};

const useUsers = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.getUsers();
      if (Array.isArray(data)) {
        setUsers(data.filter(isUser));
      } else {
        setUsers([]);
      }
      setError(null);
    } catch (err) {
      setError(err as Error);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  return { users, loading, error, refetch: fetchUsers };
};

export { useUsers };
