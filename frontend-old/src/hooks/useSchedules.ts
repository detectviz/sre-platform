import { useState, useEffect } from 'react';
import api from '../services/api';

const useSchedules = () => {
    const [schedules, setSchedules] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchSchedules = async () => {
            try {
                const data = await api.getSchedules();
                setSchedules(data);
            } catch (err) {
                setError(err instanceof Error ? err.message : String(err));
            } finally {
                setLoading(false);
            }
        };

        fetchSchedules();
    }, []);

    return { schedules, loading, error };
};

export default useSchedules;
