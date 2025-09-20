import { useState, useEffect } from 'react';
import api from '../services/api';

interface Role {
    id: string;
    name: string;
    description?: string;
    is_built_in: boolean;
    permissions: string[];
}

const useRoles = () => {
    const [roles, setRoles] = useState<Role[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        const fetchRoles = async () => {
            try {
                const data = await api.getRoles();
                setRoles(data);
            } catch (err) {
                setError(err as Error);
            } finally {
                setLoading(false);
            }
        };

        fetchRoles();
    }, []);

    return { roles, loading, error };
};

export { useRoles };
