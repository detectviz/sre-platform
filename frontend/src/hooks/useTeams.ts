import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';

const useTeams = () => {
    const [teams, setTeams] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchTeams = useCallback(async () => {
        setLoading(true);
        try {
            const data = await api.getTeams();
            setTeams(data);
            setError(null);
        } catch (err) {
            setError(err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchTeams();
    }, [fetchTeams]);

    return { teams, loading, error, refetch: fetchTeams };
};

export default useTeams;
