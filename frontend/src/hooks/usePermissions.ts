import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';

const usePermissions = () => {
    const [permissions, setPermissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchPermissions = useCallback(async () => {
        setLoading(true);
        try {
            // @ts-ignore
            const data = await api.getPermissions();
            setPermissions(data);
            setError(null);
        } catch (err) {
            setError(err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchPermissions();
    }, [fetchPermissions]);

    return { permissions, loading, error, refetch: fetchPermissions };
};

export default usePermissions;
