import { useCallback, useEffect, useMemo, useState } from 'react';
import api from '../services/api';

export type UserPreferences = {
  theme: 'dark' | 'light';
  timezone: string;
  homeDashboard: string;
};

export type UseUserProfileResult = {
  preferences: UserPreferences | null;
  loading: boolean;
  error: unknown;
  updatePreferences: (newPrefs: Partial<UserPreferences>) => Promise<void>;
};

const useUserProfile = (): UseUserProfileResult => {
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);

  const fetchPreferences = useCallback(async (signal?: AbortSignal) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.getUserPreferences();
      if (!signal?.aborted) {
        setPreferences(response);
      }
    } catch (err) {
      if (!signal?.aborted) {
        setError(err);
        console.error("Failed to fetch user preferences:", err);
      }
    } finally {
      if (!signal?.aborted) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    fetchPreferences(controller.signal);
    return () => controller.abort();
  }, [fetchPreferences]);

  const updatePreferences = useCallback(async (newPrefs: Partial<UserPreferences>) => {
    setLoading(true);
    try {
        const updated = await api.updateUserPreferences(newPrefs);
        setPreferences(updated);
    } catch (err) {
        setError(err);
        console.error("Failed to update user preferences:", err);
        // Optionally re-throw or handle the error in the UI
        throw err;
    } finally {
        setLoading(false);
    }
  }, []);

  return useMemo(() => ({
    preferences,
    loading,
    error,
    updatePreferences,
  }), [preferences, loading, error, updatePreferences]);
};

export default useUserProfile;
