import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';

interface Team {
    id: string;
    name: string;
    description?: string;
    member_count: number;
}

const useTeams = () => {
    const [teams, setTeams] = useState<Team[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    const fetchTeams = useCallback(async () => {
        setLoading(true);
        try {
            const data = await api.getTeams();
            setTeams(data);
            setError(null);
        } catch (err) {
            setError(err as Error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchTeams();
    }, [fetchTeams]);

    return { teams, loading, error, refetch: fetchTeams };
};

export { useTeams };
