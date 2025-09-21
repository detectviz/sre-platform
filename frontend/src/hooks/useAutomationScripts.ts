import { useState, useEffect } from 'react';
import api from '../services/api';

const useAutomationScripts = () => {
    const [scripts, setScripts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchScripts = async () => {
            try {
                const data = await api.getAutomationScripts();
                setScripts(data);
            } catch (err) {
                setError(err instanceof Error ? err.message : String(err));
            } finally {
                setLoading(false);
            }
        };

        fetchScripts();
    }, []);

    return { scripts, loading, error };
};

export default useAutomationScripts;
