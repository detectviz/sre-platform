import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';

const useAuditLogs = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchLogs = useCallback(async () => {
        setLoading(true);
        try {
            // @ts-ignore
            const data = await api.getAuditLogs();
            setLogs(data);
            setError('');
        } catch (err) {
            setError(err instanceof Error ? err.message : String(err));
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchLogs();
    }, [fetchLogs]);

    return { logs, loading, error, refetch: fetchLogs };
};

export default useAuditLogs;
