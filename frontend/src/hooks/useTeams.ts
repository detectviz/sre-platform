import { useState, useEffect } from 'react';
import api from '../services/api';

const useTeams = () => {
    const [teams, setTeams] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchTeams = async () => {
            try {
                const data = await api.getTeams();
                setTeams(data);
            } catch (err) {
                setError(err);
            } finally {
                setLoading(false);
            }
        };

        fetchTeams();
    }, []);

    return { teams, loading, error };
};

export default useTeams;
