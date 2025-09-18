import { useState, useEffect } from 'react';
import api from '../services/api';

const useResourceGroups = () => {
  const [resourceGroups, setResourceGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchResourceGroups = async () => {
      try {
        const data = await api.getResourceGroups();
        setResourceGroups(data);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchResourceGroups();
  }, []);

  return { resourceGroups, loading, error };
};

export default useResourceGroups;
