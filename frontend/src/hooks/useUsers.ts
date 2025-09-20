import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';

interface User {
    id: string;
    name: string;
    email: string;
    is_active: boolean;
    last_login_at: string;
    roles: string[];
    teams: string[];
}

const useUsers = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    const fetchUsers = useCallback(async () => {
        setLoading(true);
        try {
            const data = await api.getUsers();
            setUsers(data);
            setError(null);
        } catch (err) {
            setError(err as Error);
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
