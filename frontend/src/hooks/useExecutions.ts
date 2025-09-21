import { useState, useEffect } from 'react';
import api from '../services/api';

const useExecutions = () => {
    const [executions, setExecutions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchExecutions = async () => {
            try {
                const data = await api.getExecutions();
                setExecutions(data);
            } catch (err) {
                setError(err instanceof Error ? err.message : String(err));
            } finally {
                setLoading(false);
            }
        };

        fetchExecutions();
    }, []);

    return { executions, loading, error };
};

export default useExecutions;
