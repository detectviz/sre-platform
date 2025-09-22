import { useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchJson } from '../utils/apiClient';

export interface SilenceMatcher {
  key: string;
  operator: string;
  values: string[];
}

interface CreateSilencePayload {
  event_id: string;
  duration: string;
  comment: string;
  matchers?: SilenceMatcher[];
  reminder_offset?: string | null;
}

const createSilence = async (payload: CreateSilencePayload) => {
  return await fetchJson('/silence-rules', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });
};

export const useCreateSilence = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createSilence,
    onSuccess: () => {
      // Invalidate and refetch queries that should be updated after creating a silence
      // For example, the silences list or the events list if status changes
      queryClient.invalidateQueries({ queryKey: ['silences'] });
      queryClient.invalidateQueries({ queryKey: ['events'] });
      queryClient.invalidateQueries({ queryKey: ['incidents'] });
    },
  });
};
